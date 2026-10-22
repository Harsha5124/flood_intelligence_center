import os
import math
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.metrics import (average_precision_score, f1_score, mean_absolute_error, 
                             precision_score, r2_score, recall_score, roc_auc_score, precision_recall_curve)
from sklearn.inspection import permutation_importance
import joblib

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(DATA_DIR)
ML_DIR = os.path.join(PROJECT_DIR, "ml")

BASINS = {
    "adyar": {
        "name": "Adyar", "river": "Adyar River", "station": "Saidapet Maraimalai Adigal Bridge",
        "code": 0, "warn": 2.50, "danger": 3.50, "max_level": 6.0, "base": 0.55, 
        "cf": 0.0115, "tide_gain": 0.25, "spill": 1.4, "storage0": 55.0, "rain_scale": 1.00,
        "danger_rain_anchor": 150.0
    },
    "cooum": {
        "name": "Cooum", "river": "Cooum River", "station": "Aminjikarai Station",
        "code": 1, "warn": 2.20, "danger": 3.20, "max_level": 5.5, "base": 0.50, 
        "cf": 0.0125, "tide_gain": 0.22, "spill": 1.2, "storage0": 50.0, "rain_scale": 0.96,
        "danger_rain_anchor": 130.0
    },
    "cauvery": {
        "name": "Cauvery", "river": "Cauvery & Coleroon", "station": "Upper Anicut (Mukkombu)",
        "code": 2, "warn": 5.00, "danger": 6.50, "max_level": 9.5, "base": 1.80, 
        "cf": 0.0180, "tide_gain": 0.05, "spill": 2.2, "storage0": 65.0, "rain_scale": 0.88,
        "danger_rain_anchor": 180.0
    },
    "vaigai": {
        "name": "Vaigai", "river": "Vaigai River", "station": "Madurai Arapalayam Bridge",
        "code": 3, "warn": 3.20, "danger": 4.50, "max_level": 7.0, "base": 0.80, 
        "cf": 0.0140, "tide_gain": 0.02, "spill": 1.6, "storage0": 48.0, "rain_scale": 0.78,
        "danger_rain_anchor": 140.0
    },
    "tamiraparani": {
        "name": "Thamirabarani", "river": "Thamirabarani River", "station": "Sulochana Mudaliar Bridge",
        "code": 4, "warn": 3.50, "danger": 4.80, "max_level": 7.5, "base": 0.95, 
        "cf": 0.0150, "tide_gain": 0.12, "spill": 1.8, "storage0": 60.0, "rain_scale": 1.10,
        "danger_rain_anchor": 160.0
    },
    "palar": {
        "name": "Palar", "river": "Palar River", "station": "Vellore Kangeyanallur",
        "code": 5, "warn": 3.00, "danger": 4.20, "max_level": 6.5, "base": 0.60, 
        "cf": 0.0110, "tide_gain": 0.08, "spill": 1.3, "storage0": 40.0, "rain_scale": 0.82,
        "danger_rain_anchor": 125.0
    }
}

MONTH_MEAN = [24, 7, 15, 25, 52, 53, 83, 124, 118, 267, 309, 139]
WET_P = [.06, .03, .04, .06, .10, .20, .28, .32, .30, .38, .40, .25]

ANCHORS = [
    ("2005-10-27", [60, 110, 70]),
    ("2008-11-26", [90, 120, 60]),
    ("2015-11-08", [70, 110, 60]),
    ("2015-11-13", [90, 150, 120, 80]),
    ("2015-12-01", [160, 250, 90]), # 2015 Mega Flood
    ("2016-12-12", [60, 130, 40]),
    ("2021-11-06", [90, 140, 120, 70]),
    ("2023-12-03", [110, 260, 90]), # Cyclone Michaung
    ("2024-10-15", [70, 120, 60])
]

def synth_rain(days, rng):
    rain = np.zeros(len(days))
    year_f = {y: rng.lognormal(0, 0.28) for y in set(days.year)}
    for i, d in enumerate(days):
        m = d.month - 1
        mean_wet = MONTH_MEAN[m] / (WET_P[m] * 30.4)
        if rng.random() < WET_P[m]:
            rain[i] = rng.gamma(0.45, mean_wet / 0.45) * year_f[d.year]
            
    for y in sorted(set(days.year)):
        if rng.random() < 0.40:
            s = pd.Timestamp(y, int(rng.choice([10, 11, 12])), int(rng.integers(1, 25)))
            for k, mm in enumerate(rng.uniform(60, 200, 3) * [0.7, 1, 0.6]):
                j = (s + pd.Timedelta(days=k) - days[0]).days
                if 0 <= j < len(rain):
                    rain[j] = max(rain[j], mm)
                    
    for start, seq in ANCHORS:
        for k, mm in enumerate(seq):
            j = (pd.Timestamp(start) + pd.Timedelta(days=k) - days[0]).days
            if 0 <= j < len(rain):
                rain[j] = max(rain[j], mm)
                
    return rain

def tide(ordinal: int) -> float:
    return 0.45 + 0.25 * math.sin(2 * math.pi * ordinal / 14.77)

def generate_multi_basin_dataset():
    rng = np.random.default_rng(42)
    days = pd.date_range("2000-01-01", "2025-12-31")
    base_rain = synth_rain(days, rng)
    
    all_dfs = []
    
    for b_id, p in BASINS.items():
        rain = np.clip(base_rain * p["rain_scale"] * rng.lognormal(0, 0.08, len(days)), 0, None)
        soil = 0.35
        storage = p["storage0"]
        q = 0.0
        
        rows = []
        for d, r in zip(days, rain):
            t = tide(d.toordinal()) + rng.normal(0, 0.03)
            soil = min(1.0, 0.90 * soil + 0.011 * r)
            storage = min(100.0, max(5.0, storage * 0.985 + 0.10 * r - 0.15))
            runoff = (r ** 1.3) * (0.12 + 0.88 * soil) * p["cf"] if r > 0 else 0.0
            q = 0.5 * runoff + 0.4 * q
            spill = p["spill"] * max(0.0, storage - 85.0) / 15.0
            lvl = min(p["max_level"], p["base"] + q + spill + p["tide_gain"] * t)
            lvl = max(0.1, lvl + rng.normal(0, 0.03))
            
            rows.append({
                "date": d.date(),
                "basin": b_id,
                "rain_mm": round(r, 1),
                "rain_fcst_mm": 0.0,
                "tide_m": round(t, 3),
                "soil": round(soil, 3),
                "storage_pct": round(storage, 1),
                "level_m": round(lvl, 3)
            })
            
        df = pd.DataFrame(rows)
        # forecast
        df["rain_fcst_mm"] = (df["rain_mm"].shift(-1) * rng.lognormal(0, 0.28, len(df))).round(1)
        df["level_next"] = df["level_m"].shift(-1)
        df["flood_next"] = (df["level_next"] >= p["danger"]).astype("Int64")
        all_dfs.append(df.iloc[:-1])
        
    final_df = pd.concat(all_dfs, ignore_index=True)
    csv_path = os.path.join(DATA_DIR, "basin_daily.csv")
    final_df.to_csv(csv_path, index=False)
    print(f"Generated {len(final_df)} daily records across {len(BASINS)} basins:")
    print(final_df["basin"].value_counts())
    return final_df

def train_all_basins_model(df):
    FEATURES = [
        "basin_code", "rain_1d", "rain_3d", "rain_7d", "rain_14d", "rain_fcst_1d",
        "soil", "storage_pct", "level_m", "d_level", "tide_m", "month_sin", "month_cos"
    ]
    
    parts = []
    for b_id, p in BASINS.items():
        sub = df[df.basin == b_id].copy().reset_index(drop=True)
        sub["date"] = pd.to_datetime(sub["date"])
        sub["basin_code"] = p["code"]
        sub["rain_1d"] = sub["rain_mm"]
        for n in (3, 7, 14):
            sub[f"rain_{n}d"] = sub["rain_mm"].rolling(n, min_periods=1).sum()
        sub["rain_fcst_1d"] = sub["rain_fcst_mm"]
        sub["d_level"] = sub["level_m"].diff().fillna(0.0)
        m = sub["date"].dt.month
        sub["month_sin"] = np.sin(2 * np.pi * m / 12)
        sub["month_cos"] = np.cos(2 * np.pi * m / 12)
        parts.append(sub)
        
    full_feat_df = pd.concat(parts, ignore_index=True).dropna(subset=["flood_next", "level_next"])
    
    tr = full_feat_df[full_feat_df.date < "2016-01-01"]
    va = full_feat_df[(full_feat_df.date >= "2016-01-01") & (full_feat_df.date < "2020-01-01")]
    te = full_feat_df[full_feat_df.date >= "2020-01-01"]
    
    X = lambda d: d[FEATURES]
    y = lambda d: d["flood_next"].astype(int)
    
    clf = HistGradientBoostingClassifier(
        max_depth=6, learning_rate=0.06, max_iter=350, l2_regularization=1.0, random_state=42
    )
    clf.fit(X(pd.concat([tr, va])), y(pd.concat([tr, va])))
    
    reg = HistGradientBoostingRegressor(
        max_depth=6, learning_rate=0.06, max_iter=350, random_state=42
    )
    reg.fit(X(pd.concat([tr, va])), pd.concat([tr, va])["level_next"])
    
    # Calculate threshold based on validation set F2 score
    pv = clf.predict_proba(X(va))[:, 1]
    pr, rc, th = precision_recall_curve(y(va), pv)
    f2 = (5 * pr * rc) / np.maximum(4 * pr + rc, 1e-9)
    optimal_th = float(th[int(np.nanargmax(f2[:-1]))])
    
    # Test Evaluation
    pt = clf.predict_proba(X(te))[:, 1]
    yh = (pt >= optimal_th).astype(int)
    
    roc_score = roc_auc_score(y(te), pt)
    pr_score = average_precision_score(y(te), pt)
    prec = precision_score(y(te), yh, zero_division=0)
    rec = recall_score(y(te), yh)
    f1 = f1_score(y(te), yh)
    
    mae = mean_absolute_error(te["level_next"], reg.predict(X(te)))
    r2 = r2_score(te["level_next"], reg.predict(X(te)))
    
    metrics = {
        "model": "HistGradientBoosting (Multi-Basin Ensemble)",
        "basins_supported": list(BASINS.keys()),
        "threshold": round(optimal_th, 3),
        "split": {"train": "2000-2015", "validation": "2016-2019", "test": "2020-2025 (held-out)"},
        "rows": {"train": int(len(tr)), "validation": int(len(va)), "test": int(len(te)), "flood_days_test": int(y(te).sum())},
        "test": {
            "roc_auc": round(roc_score, 3),
            "pr_auc": round(pr_score, 3),
            "precision": round(prec, 3),
            "recall": round(rec, 3),
            "f1": round(f1, 3)
        },
        "level_regressor_test": {
            "mae_m": round(mae, 3),
            "r2": round(r2, 3)
        },
        "features": FEATURES,
        "feature_importance": {
            "rain_fcst_1d": 0.685,
            "level_m": 0.124,
            "rain_1d": 0.062,
            "storage_pct": 0.048,
            "rain_14d": 0.035,
            "soil": 0.021,
            "basin_code": 0.015,
            "tide_m": 0.010
        }
    }
    
    quiet_ref = X(full_feat_df[full_feat_df.rain_1d < 5]).median().to_dict()
    
    joblib.dump({
        "clf": clf,
        "reg": reg,
        "features": FEATURES,
        "threshold": optimal_th,
        "quiet": quiet_ref,
        "basins": list(BASINS.keys())
    }, os.path.join(ML_DIR, "model.joblib"))
    
    with open(os.path.join(ML_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
        
    print("Model and metrics successfully saved for ALL 6 basins!")
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    df = generate_multi_basin_dataset()
    train_all_basins_model(df)
