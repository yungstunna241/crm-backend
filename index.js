process.on('uncaughtException', function(err) {
  console.error('Caught exception:', err)
})

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/User')

const app = express()

app.use(cors({ origin: 'https://stunna-crm.vercel.app' }))
app.use(express.json())

mongoose.connect('mongodb+srv://truemudbaby:yourpassword@crm-base.mongodb.net/?retryWrites=true&w=majority');


mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err)
})

mongoose.connection.once('open', () => {
  console.log('MongoDB connected')
})

const ContactSchema = new mongoose.Schema({
  name: String,
  number: String,
  email: String,
  kyc: String,
  result: String,
  date: { type: Date, default: '' },
  source: { type: String, default: '' }
});

const Contact = mongoose.model('Contact', ContactSchema)

app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find()
    res.json(contacts)
  } catch (err) {
    console.error('GET /contacts error:', err)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

app.post('/contacts/:id/update', async (req, res) => {
  try {
    const { kyc, result } = req.body
    await Contact.findByIdAndUpdate(req.params.id, { kyc, result })
    res.sendStatus(200)
  } catch (err) {
    console.error('POST /contacts/:id/update error:', err)
    res.status(500).json({ error: 'Failed to update contact' })
  }
})

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.post('/register', async (req, res) => {
  const { username, password, role } = req.body
  try {
    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ username, password: hashed, role })
    await user.save()
    res.sendStatus(201)
  } catch (err) {
    console.error('POST /register error:', err)
    res.status(400).json({ error: 'User creation failed' })
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '1d' })
    res.json({ token, role: user.role })
  } catch (err) {
    console.error('POST /login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
