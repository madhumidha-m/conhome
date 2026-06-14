const router = require('express').Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch { res.status(401).json({ error: 'Invalid token' }) }
}

// Get devices for a room
router.get('/:roomId', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM devices WHERE room_id=$1', [req.params.roomId]
  )
  res.json(result.rows)
})

// Add device
router.post('/', auth, async (req, res) => {
  const { device_name, device_type, gpio_pin, room_id } = req.body
  const result = await pool.query(
    'INSERT INTO devices (device_id, device_name, device_type, gpio_pin, room_id, power) VALUES (gen_random_uuid(), $1, $2, $3, $4, 0) RETURNING *',
    [device_name, device_type, gpio_pin, room_id]
  )
  res.json(result.rows[0])
})

// Toggle device
router.patch('/:id/toggle', auth, async (req, res) => {
  const { power_state } = req.body
  await pool.query(
    'INSERT INTO device_status (status_id, device_id, power_state, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW())',
    [req.params.id, power_state]
  )
  await pool.query('UPDATE devices SET power=$1 WHERE device_id=$2', [power_state ? 1 : 0, req.params.id])
  res.json({ success: true })
})

// Delete device
router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM devices WHERE device_id=$1', [req.params.id])
  res.json({ success: true })
})
router.patch('/:id', auth, async (req, res) => {
  const { device_name } = req.body
  const result = await pool.query(
    'UPDATE devices SET device_name=$1 WHERE device_id=$2 RETURNING *',
    [device_name, req.params.id]
  )
  res.json(result.rows[0])
})

module.exports = router