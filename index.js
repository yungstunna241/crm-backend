process.on('uncaughtException', function(err) {
  console.error('Caught exception:', err)
})

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(express.json())

mongoose.connect('mongodb+srv://truemudbaby:1paroliparoli@crm-base.ninskus.mongodb.net/crm?retryWrites=true&w=majority&appName=crm-base')

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
})

const Contact = mongoose.model('Contact', ContactSchema)

// ✅ GET contacts with pagination (fixed version)
app.get('/contacts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * limit

    const total = await Contact.countDocuments()
    const contacts = await Contact.find().skip(skip).limit(limit).sort({ date: -1 })

    res.json({
      contacts,
      totalPages: Math.ceil(total / limit)
    })
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

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`))
