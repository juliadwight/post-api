const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    posts: [{
      id: String,
      text: String
    }]
  },
  { collection: 'users' }
)

module.exports = mongoose.model('UserSchema', UserSchema)