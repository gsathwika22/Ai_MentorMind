const KEY = "mentormind_v2";

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSession(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
