const router = require('express').Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')

// Middleware to verify token
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch { res.status(401).json({ error: 'Invalid token' }) }
}

// Get all rooms for user
router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM rooms WHERE user_id=$1', [req.user.userId]
  )
  res.json(result.rows)
})

// Add room
// Add room
router.post('/', auth, async (req, res) => {
  const { room_name, icon } = req.body
  const result = await pool.query(
    'INSERT INTO rooms (room_id, room_name, user_id, icon) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *',
    [room_name, req.user.userId, icon || 'sofa']
  )
  res.json(result.rows[0])
})

// Delete room
router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM rooms WHERE room_id=$1 AND user_id=$2', [req.params.id, req.user.userId])
  res.json({ success: true })
})
router.patch('/:id', auth, async (req, res) => {
  const { room_name, icon } = req.body
  const result = await pool.query(
    'UPDATE rooms SET room_name=$1, icon=$2 WHERE room_id=$3 AND user_id=$4 RETURNING *',
    [room_name, icon, req.params.id, req.user.userId]
  )
  res.json(result.rows[0])
})

module.exports = router