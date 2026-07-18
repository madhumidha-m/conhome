const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',    require('./routes/auth'))
app.use('/api/rooms',   require('./routes/rooms'))
app.use('/api/appliances', require('./routes/appliances'))
app.use('/api/automation', require('./routes/automation'))
app.use('/api/members',  require('./routes/members'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/alerts',  require('./routes/alerts'))
app.use('/api/current', require('./routes/current'))
app.use('/api/register', require('./routes/register'))
app.use('/api/enroll',  require('./routes/enroll'))
app.get('/', (req, res) => res.send('AutoHome API running'))

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})