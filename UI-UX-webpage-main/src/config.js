// src/config.js
export const API =
  window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : `http://${window.location.hostname}:4000/api`