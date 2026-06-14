const router = require('express').Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM alerts WHERE user_id=$1 ORDER BY created_at DESC',
    [req.user.userId]
  )
  res.json(result.rows)
})

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM alerts WHERE alert_id=$1 AND user_id=$2', [req.params.id, req.user.userId])
  res.json({ success: true })
})

module.exports = router