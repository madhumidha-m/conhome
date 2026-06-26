const router = require('express').Router()
const pool = require('../db_register')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}

// Validate scanned QR code
router.get('/validate/:deviceId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM register_table WHERE device_id=$1',
      [req.params.deviceId]
    )
    if (result.rows.length === 0) {
      return res.json({ valid: false, message: 'Device not found in registry' })
    }
    if (result.rows[0].is_enrolled) {
      return res.json({ valid: false, message: 'Device already enrolled by another user' })
    }
    res.json({ valid: true, device: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router