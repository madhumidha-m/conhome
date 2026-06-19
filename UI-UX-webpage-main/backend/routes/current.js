const router = require('express').Router()
const pool = require('../db')

router.post('/', async (req,res)=>{
  const { device_id,current_value,power_value } = req.body

  await pool.query(
    `INSERT INTO current_logs
    (device_id,current_value,power_value)
    VALUES($1,$2,$3)`,
    [device_id,current_value,power_value]
  )

  res.json({success:true})
})

router.get('/', async(req,res)=>{
  const result = await pool.query(
    `SELECT * FROM current_logs
     ORDER BY created_at DESC
     LIMIT 50`
  )

  res.json(result.rows)
})

module.exports = router