const router = require('express').Router()
const enrollPool = require('../db_enroll')
const registerPool = require('../db_register')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}

// Enroll ESP32 to a room
router.post('/', auth, async (req, res) => {
  console.log("ENROLL ROUTE HIT")
  console.log("BODY:", req.body)
  console.log("USER:", req.user)

  const { device_id, room_id } = req.body
  console.log("RAW DEVICE:", JSON.stringify(device_id))
console.log("LENGTH:", device_id.length)

const cleanDeviceId = device_id.trim()

console.log("CLEAN DEVICE:", JSON.stringify(cleanDeviceId))
console.log("CLEAN LENGTH:", cleanDeviceId.length)
 
  console.log("DEVICE:", cleanDeviceId)
  console.log("ROOM:", room_id)

  try {
    // Check registry for safety
    const regCheck = await registryPool.query(
      'SELECT * FROM register_table WHERE device_id=$1',
      [cleanDeviceId]
    )
    if (regCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid device' })
    }

    // Check if already enrolled
    const existing = await enrollPool.query(
      'SELECT * FROM enroll_table WHERE device_id=$1',
      [cleanDeviceId]
    )
    if (existing.rows.length > 0) {

  console.log("Current User ID:", JSON.stringify(req.user.userId))
  console.log("DB User ID:", JSON.stringify(existing.rows[0].user_id))
  console.log(
    "Equal ?",
    String(existing.rows[0].user_id).trim() ===
    String(req.user.userId).trim()
  )

  console.log("COMPARING:", 
  JSON.stringify(existing.rows[0].user_id), 
  "vs", 
  JSON.stringify(req.user.userId)
)

if (existing.rows[0].user_id == req.user.userId) {
    return res.json({
      success: true,
      message: 'Device already enrolled by you ✅'
    })
  }

  return res.status(400).json({
    error: 'Device already enrolled by another user'
  })
}


    // New enrollment — save to enroll_db
    const enroll = await enrollPool.query(
      'INSERT INTO enroll_table (device_id, user_id) VALUES ($1, $2) RETURNING *',
      [cleanDeviceId, req.user.userId]
    )

    // Mark as enrolled in registry_db
    await registryPool.query(
      'UPDATE register_table SET is_enrolled=true WHERE device_id=$1',
      [cleanDeviceId]
    )

    res.json({ success: true, enroll: enroll.rows[0] })

  } catch (err) {
    console.error("ENROLL ERROR:", err.message)
    res.status(500).json({ error: err.message })
  }
})

// Get all enrollments for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await enrollPool.query(
      'SELECT * FROM enroll_table WHERE user_id=$1',
      [req.user.userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router