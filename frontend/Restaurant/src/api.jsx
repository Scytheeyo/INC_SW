// frontend/src/api.js

const API_URL = 'http://localhost:5000/api';

async function signup(username, password) {
  const res = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function login(username, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

async function logout() {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include'
  });
  return res.json();
}

async function getTables(date, meal) {
  const params = new URLSearchParams({ date, meal });
  const res = await fetch(`${API_URL}/tables?${params.toString()}`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include'
  });
  return res.json();
}

async function reserve(reservationData) {
  const res = await fetch(`${API_URL}/reserve`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData)
  });
  return res.json();
}

async function getMyReservations() {
  const res = await fetch(`${API_URL}/myreservations`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include'
  });
  return res.json();
}

async function cancelReservation(reservation_id) {
  const res = await fetch(`${API_URL}/cancel`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reservation_id })
  });
  return res.json();
}

export {
  signup,
  login,
  logout,
  getTables,
  reserve,
  getMyReservations,
  cancelReservation
};
