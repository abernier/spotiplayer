require("dotenv").config();

const express = require("express");
const session = require('express-session')
const hbs = require("hbs");

const app = express();
app.set("view engine", "hbs");
hbs.registerHelper("json", ctx => JSON.stringify(ctx)); // {{{json }}} helper

app.use(express.static("public"));

app.use(session({
  secret: 'shhhhhhht',
  resave: false,
  saveUninitialized: true
}))

app.use(function (req, res, next) {
  //
  // We define here a `config` variable that will be available in every template (see: https://expressjs.com/fr/api.html#res.locals)
  //
  res.locals.config = {}
  res.locals.config.spotify_access_token = req.session.spotify_access_token

  next()
})

//
// Routes
//

const mainRouter = require('./routes/main')
app.use('/', mainRouter)

const oauthRouter = require('./routes/oauth')
app.use('/', oauthRouter)


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`🏃 Listening on port ${port}`))
