const router = require('express').Router()
const pool = require('../db')
const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}// Create Notification
router.post('/', auth, async (req, res) => {

  const { title, message, type } = req.body

  try {

    const result = await pool.query(

      `INSERT INTO notifications
      (
        user_id,
        title,
        message,
        type
      )

      VALUES($1,$2,$3,$4)

      RETURNING *`,

      [
        req.user.userId,
        title,
        message,
        type
      ]

    )

    res.json({
      success: true,
      notification: result.rows[0]
    })

  } catch (err) {

    res.status(500).json({
      error: err.message
    })

  }

})

router.get('/', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC',
    [req.user.userId]
  )
  res.json(result.rows)
})

router.delete('/:id', auth, async (req, res) => {
  await pool.query('DELETE FROM notifications WHERE _id=$1 AND user_id=$2', [req.params.id, req.user.userId])
  res.json({ success: true })
})

module.exports = router