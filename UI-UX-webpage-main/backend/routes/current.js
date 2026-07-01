const enrollPool = require('../db_enroll')
const autoPool = require('../db_autohome')
const router = require('express').Router()
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}

// POST - receive data from ESP32 (no auth needed, ESP32 sends directly)
router.post('/', async (req, res) => {
  console.log("========== CURRENT API ==========")
  console.log(req.body)
  try {
    const { device_id, current, power, energy_kwh, cost } = req.body

    // Check if device is enrolled
    const enrolled = await enrollPool.query(
      'SELECT * FROM enroll_table WHERE device_id=$1',
      [device_id]
    )
    if (enrolled.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Device not enrolled" })
    }

    // Save energy data
    await autoPool.query(
      'INSERT INTO energy_logs (device_id, current, power, energy_kwh, cost) VALUES ($1, $2, $3, $4, $5)',
      [device_id, current, power, energy_kwh, cost]
    )
    res.json({ success: true, message: "Energy data stored successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Server Error" })
  }
})

// GET - fetch energy logs for logged-in user's devices only
router.get('/', auth, async (req, res) => {
  try {
    // Get all device_ids enrolled by this user
    const enrolled = await enrollPool.query(
      'SELECT device_id FROM enroll_table WHERE user_id=$1',
      [req.user.userId]
    )

    if (enrolled.rows.length === 0) {
      return res.json([])
    }

    const deviceIds = enrolled.rows.map(r => r.device_id)

    // Fetch energy logs only for this user's devices
    const result = await autoPool.query(
      `SELECT * FROM energy_logs 
       WHERE device_id = ANY($1::text[])
       ORDER BY created_at DESC 
       LIMIT 200`,
      [deviceIds]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
