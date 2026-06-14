const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',    require('./routes/auth'))
app.use('/api/rooms',   require('./routes/rooms'))
app.use('/api/devices', require('./routes/devices'))
app.use('/api/members',  require('./routes/members'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/alerts',  require('./routes/alerts'))
app.get('/', (req, res) => res.send('AutoHome API running'))

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})