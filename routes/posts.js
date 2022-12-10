require('dotenv').config()
const express = require('express')
const User = require('../model/user.js')
const jwt = require ('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const router = new express.Router();

// Add a new post
router.post('/api/post/new', async (req, res) => {
  const { token, newpost: postText } = req.body

// Check if string
  if (!postText || typeof postText !== 'string') {
    return res.status(401).json({ status: 'error', error: 'Invalid post must be string' })
  }

  // Check if below 250 characters
  if (postText.length > 250) {
    return res.status(401).json({
      status: 'error',
      error: 'Post is too long, must be less than 250 char'
    })
  }

  // Verify jwt token and post if verified
  try {
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id
    const postId = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2)

    await User.updateOne(
      { _id },
      {
        $push: {
          posts: { "text": postText, "id": postId }
        }
      }
    )
    res.status(200).json({ status: 'Post created', postId: postId })
  } catch (error) {
    console.log(error)
    res.status(401).json({ status: 'error', error: 'Unverified user' })
  }
})

// Change a post
router.post('/api/post/change', async (req, res) => {
  const { token, newpost: changeText, changeId: changeId } = req.body

// Check if string
  if (!changeText || typeof changeText !== 'string') {
    return res.status(401).json({ status: 'error', error: 'Invalid post must be string' })
  }

  // Check if below 250 characters
  if (changeText.length > 250) {
    return res.status(401).json({
      status: 'error',
      error: 'Post is too long, must be less than 250 char'
    })
  }

  // Verify jwt token and change if verified
  try {
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id

    await User.updateOne({ _id, "posts.id": changeId }, { $set: { "posts.$.text": changeText } })
    res.status(200).json({ status: 'Post changed', postId: changeId })
  } catch (error) {
    console.log(error)
    res.status(401).json({ status: 'error', error: 'Unverified user' })
  }
})

// Delete a post
router.post('/api/post/delete', async (req, res) => {
  const { token, deleteId: deleteId } = req.body

  // Verify jwt token and change if verified
  try {
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id
    await User.updateOne({ _id, "posts.id": deleteId }, { $unset: { "posts.$.id": deleteId } }, {multi: true})
    res.status(200).json({ status: 'Post deleted', postId: deleteId })
  } catch (error) {
    console.log(error)
    res.status(401).json({ status: 'error', error: 'Unverified user' })
  }
})

module.exports = router;