const express = require('express')
const router = express.Router()

const spotifyApi = require('../spotifyapi')

const { refreshAccessTokenIfNeeded } = require('./oauth')

router.get("/", refreshAccessTokenIfNeeded, (req, res, next) => {
  res.render("index.hbs")
})

module.exports = router