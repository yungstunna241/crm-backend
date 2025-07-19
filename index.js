process.on('uncaughtException', function(err) {
  console.error('Caught exception:', err)
})

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('./models/User')

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

app.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find()
    res.json(contacts)
  } catch (err) {
    console.error('GET /contacts error:', err)
    res.stat
