const router = require('express').Router()
const pool = require('../db_register')
const enrollPool = require('../db_enroll')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}

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
      const enrolled = await enrollPool.query(
        'SELECT * FROM enroll_table WHERE device_id=$1',
        [req.params.deviceId]
      )
      if (enrolled.rows.length > 0) {
        const dbUserId = String(enrolled.rows[0].user_id).trim()
        const tokenUserId = String(req.user.userId).trim()
        if (dbUserId === tokenUserId) {
          return res.json({ valid: true, device: result.rows[0], alreadyEnrolled: true })
        }
      }
      return res.json({ valid: false, message: 'Device already enrolled by another user' })
    }
    res.json({ valid: true, device: result.rows[0], alreadyEnrolled: false })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
