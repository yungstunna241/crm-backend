const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['agent', 'manager'], default: 'agent' }
})

module.exports = mongoose.model('User', userSchema)
