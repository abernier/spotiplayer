require("dotenv").config();

const express = require("express");
const session = require('express-session')
const hbs = require("hbs");
const morgan = require('morgan')

const app = express();
app.set("view engine", "hbs");
hbs.registerHelper("json", ctx => JSON.stringify(ctx)); // {{{json }}} helper

app.use(express.static("public"));

app.use(morgan('tiny'))

app.use(session({
  secret: 'shhhhhhht',
  resave: false,
  saveUninitialized: true
}))

app.use(function (req, res, next) {
  // Create a req.session.spotify object if doesn't exist
  req.session.spotify ??= {}

  // Create a `config` locals where its `spotify` prop points to (a proxied of) `req.session.spotify`
  res.locals.config = {
    spotify: new Proxy(req.session.spotify, {
      get: function (target, prop, receiver) {
        if (['refresh_token', 'expires_at'].includes(prop)) return; // hide some props
        
        return Reflect.get(...arguments); // untouch other props
      }
    })
  }

  // Add a `expires_in` getter prop
  Object.defineProperty(res.locals.config.spotify, 'expires_in', {
    enumerable: true,
    get() {
      // computed from `req.session.spotify.expires_at`
      return req.session.spotify.expires_at && (req.session.spotify.expires_at - new Date().getTime()) / 1000
    }
  })

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
