process.on('uncaughtException', function (err) {
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

// schema
const ContactSchema = new mongoose.Schema({
  name: String,
  number: String,
  email: String,
  kyc: String,
  result: String,
  date: { type: Date, default: Date.now }, // ✅ use valid default date
  source: { type: String, default: '' },
  country: { type: String, default: '' }
})

const Contact = mongoose.model('Contact', ContactSchema)

// paginated contacts
app.get('/contacts', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = 15
  const skip = (page - 1) * limit

  try {
    const total = await Contact.countDocuments()
    const contacts = await Contact.find().skip(skip).limit(limit).sort({ date: -1 })
    const totalPages = Math.ceil(total / limit)

    res.json({
      contacts: Array.isArray(contacts) ? contacts : [],
      totalPages: totalPages || 1
    })
  } catch (err) {
    console.error('GET /contacts error:', err)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

// update KYC or status
app.post('/contacts/:id/update', async (req, res) => {
  try {
    const { kyc, result } = req.body
    const updateFields = {}
    if (kyc !== undefined) updateFields.kyc = kyc
    if (result !== undefined) updateFields.result = result

    await Contact.findByIdAndUpdate(req.params.id, updateFields)
    res.sendStatus(200)
  } catch (err) {
    console.error('POST /contacts/:id/update error:', err)
    res.status(500).json({ error: 'Failed to update contact' })
  }
})

// start server
const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`))
