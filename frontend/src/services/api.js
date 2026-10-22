const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchBasins() {
  const res = await fetch(`${API_BASE}/basins`);
  return res.json();
}

export async function fetchBasinDetail(id) {
  const res = await fetch(`${API_BASE}/basins/${id}`);
  return res.json();
}

export async function fetchBasinsGeoJSON() {
  const res = await fetch(`${API_BASE}/gis/basins-geojson`);
  return res.json();
}

export async function fetchFeaturesGeoJSON() {
  const res = await fetch(`${API_BASE}/gis/features-geojson`);
  return res.json();
}

export async function fetchRiskHeatmap() {
  const res = await fetch(`${API_BASE}/gis/risk-heatmap`);
  return res.json();
}

export async function fetchLatestPrediction(basin = 'adyar') {
  const res = await fetch(`${API_BASE}/predictions/latest?basin=${basin}`);
  return res.json();
}

export async function calculateCustomPrediction(params) {
  const res = await fetch(`${API_BASE}/predictions/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE}/predictions/metrics`);
  return res.json();
}

export async function fetchWarnings() {
  const res = await fetch(`${API_BASE}/warnings`);
  return res.json();
}

export async function acknowledgeWarning(id) {
  const res = await fetch(`${API_BASE}/warnings/${id}/acknowledge`, { method: 'POST' });
  return res.json();
}

export async function fetchNotifications() {
  const res = await fetch(`${API_BASE}/notifications`);
  return res.json();
}

export async function fetchUnreadCount() {
  const res = await fetch(`${API_BASE}/notifications/unread-count`);
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/notifications/mark-all-read`, { method: 'POST' });
  return res.json();
}

export async function dispatchAlertBroadcast(data) {
  const res = await fetch(`${API_BASE}/notifications/trigger-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchWeather(basin = 'adyar') {
  const res = await fetch(`${API_BASE}/weather/current?basin=${basin}`);
  return res.json();
}

export async function fetchWeatherForecast(basin = 'adyar') {
  const res = await fetch(`${API_BASE}/weather/forecast?basin=${basin}`);
  return res.json();
}

export async function fetchRivers() {
  const res = await fetch(`${API_BASE}/rivers`);
  return res.json();
}

export async function fetchRiverHydrograph(stationId) {
  const res = await fetch(`${API_BASE}/rivers/${stationId}/hydrograph`);
  return res.json();
}

export async function fetchReservoirs() {
  const res = await fetch(`${API_BASE}/reservoirs`);
  return res.json();
}

export async function fetchShelters() {
  const res = await fetch(`${API_BASE}/evacuation/shelters`);
  return res.json();
}

export async function fetchNearestShelters(lat, lon) {
  const res = await fetch(`${API_BASE}/evacuation/nearest?lat=${lat}&lon=${lon}`);
  return res.json();
}

export async function fetchHistoryEvents() {
  const res = await fetch(`${API_BASE}/history/events`);
  return res.json();
}

export async function sendHydronChat(message, basin = 'adyar') {
  const res = await fetch(`${API_BASE}/hydron/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, basin })
  });
  return res.json();
}

export async function runSimulatorScenario(scenario) {
  const res = await fetch(`${API_BASE}/simulator/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario)
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}

export async function signupUser(userData) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}
