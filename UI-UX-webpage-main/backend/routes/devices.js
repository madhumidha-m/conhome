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
  try {
    const result = await pool.query(
      'SELECT * FROM devices WHERE room_id=$1 AND user_id=$2',
      [req.params.roomId, req.user.userId]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('GET devices error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Add device
router.post('/', auth, async (req, res) => {
  try {
    const { appliance_name, device_name, gpio_pin, room_id } = req.body

    // Verify room belongs to this user
    const roomCheck = await pool.query(
      'SELECT room_id FROM rooms WHERE room_id=$1 AND user_id=$2',
      [room_id, req.user.userId]
    )
    if (roomCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Room not found or access denied' })
    }

    const result = await pool.query(
      'INSERT INTO devices (device_id, appliance_name, device_name, gpio_pin, room_id, power, user_id) VALUES (gen_random_uuid(), $1, $2, $3, $4, 0, $5) RETURNING *',
      [appliance_name, device_name, gpio_pin, room_id, req.user.userId]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('POST device error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Toggle device power
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const { power_state } = req.body

    const check = await pool.query(
      'SELECT device_id FROM devices WHERE device_id=$1 AND user_id=$2',
      [req.params.id, req.user.userId]
    )
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Device not found or access denied' })
    }

    await pool.query(
      'INSERT INTO device_status (status_id, device_id, power_state, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW())',
      [req.params.id, power_state]
    )
    await pool.query(
      'UPDATE devices SET power=$1 WHERE device_id=$2',
      [power_state ? 1 : 0, req.params.id]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('TOGGLE device error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Rename device
router.patch('/:id', auth, async (req, res) => {
  try {
    const { appliance_name } = req.body

    const check = await pool.query(
      'SELECT device_id FROM devices WHERE device_id=$1 AND user_id=$2',
      [req.params.id, req.user.userId]
    )
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Device not found or access denied' })
    }

    const result = await pool.query(
      'UPDATE devices SET appliance_name=$1 WHERE device_id=$2 RETURNING *',
      [appliance_name, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('RENAME device error:', err)
    res.status(500).json({ error: err.message })
  }
})

// Delete device
router.delete('/:id', auth, async (req, res) => {
  try {
    const check = await pool.query(
      'SELECT device_id FROM devices WHERE device_id=$1 AND user_id=$2',
      [req.params.id, req.user.userId]
    )
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Device not found or access denied' })
    }
    await pool.query('DELETE FROM devices WHERE device_id=$1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('DELETE device error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router