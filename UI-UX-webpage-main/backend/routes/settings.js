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
  const result = await pool.query('SELECT * FROM home_settings WHERE user_id=$1', [req.user.userId])
  if (result.rows.length === 0) {
    // Create default settings if none exist
    const created = await pool.query(
      'INSERT INTO home_settings (setting_id, user_id) VALUES (gen_random_uuid(), $1) RETURNING *',
      [req.user.userId]
    )
    return res.json(created.rows[0])
  }
  res.json(result.rows[0])
})

router.patch('/', auth, async (req, res) => {
  const { home_name } = req.body
  await pool.query(
    'UPDATE home_settings SET home_name=$1 WHERE user_id=$2',
    [home_name, req.user.userId]
  )
  res.json({ success: true })
})

module.exports = router