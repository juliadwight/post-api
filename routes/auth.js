require('dotenv').config()
const express = require('express')
const User = require('../model/user.js')
const bcrypt = require('bcrypt')
const jwt = require ('jsonwebtoken')
const router = new express.Router();
const JWT_SECRET = process.env.JWT_SECRET

// Login user
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username }).lean()

  // Check if user or password are missing
  if (!user || !password) {
    return res.status(401).json({ status: 'error', error: 'Invalid username or password' })
  }

  // Check if username and password match
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username
      },
      JWT_SECRET
    )
    // Return JWT token
    return res.status(200).json({ status: 'ok', message: "Logged in as " + user.username, data: token })
  }

  res.status(401).json({ status: 'error', error: 'Invalid username or password' })
})

// Register a new user
router.post('/api/register', async (req, res) => {
  const { username, password: textPassword } = req.body

  // Check if username and password are strings and exist
  if (!username || typeof username !== 'string') {
    return res.status(401).json({ status: 'error', error: 'Invalid username' })
  }
  if (!textPassword || typeof textPassword !== 'string') {
    return res.status(401).json({ status: 'error', error: 'Invalid password' })
  }

  // Check if password is between 7 and 50 characters
  if (textPassword.length < 7 || textPassword.length > 50) {
    return res.status(401).json({
      status: 'error',
      error: 'Password should be between 7 and 50 characters'
    })
  }

  // Hash the password
  const password = await bcrypt.hash(textPassword, 10)

  // Create the user in database
  try {
    const response = await User.create({
      username,
      password
    })
    console.log('User created successfully: ', response)
  } catch (error) {
    // Database will give error if username is duplicate
    if (error.code === 11000) {
      return res.status(401).json({ status: 'error', error: 'Duplicate username' })
    }
    throw error
  }
  res.status(200).json({ status: 'ok' })
})

// Delete a user only if they are logged in
router.post('/api/delete-user', async (req, res) => {
  const { token } = req.body
  try {
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id

    await User.deleteOne({ _id })
    res.status(200).json({ status: 'User deleted' })
  } catch (error) {
    console.log(error)
    res.status(401).json({ status: 'error', error: 'User must be logged in' })
  }
})

module.exports = router;