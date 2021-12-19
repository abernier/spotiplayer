const express = require('express')
const router = express.Router()

const spotifyApi = require('../spotifyapi')

router.get("/", (req, res, next) => {
  res.render("index.hbs")
})

module.exports = router