const express = require("express");
const router = express.Router();

const spotifyApi = require("../spotifyapi");

router.get("/oauth", (req, res, next) => {
  // see: https://developer.spotify.com/documentation/general/guides/authorization/scopes
  const scopes = [
    "user-read-private", "user-read-email",
    "streaming",
    "user-read-playback-state", "user-modify-playback-state", "user-read-currently-playing"
  ];
  const state = "extra-state-appended";

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  res.redirect(authorizeURL); // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=extra-state-appended
});

router.get("/oauth/callback", (req, res, next) => {
  const { code, state } = req.query;
  console.log("code=", code);

  spotifyApi
    .authorizationCodeGrant(code)
    .then(function (data) {
      console.log("The token expires in " + data.body["expires_in"]);
      console.log("The access token is " + data.body["access_token"]);
      console.log("The refresh token is " + data.body["refresh_token"]);

      spotifyApi.setAccessToken(data.body["access_token"]);
      spotifyApi.setRefreshToken(data.body["refresh_token"]);

      req.session.spotify_access_token = data.body["access_token"];
      res.redirect("/");
    })
    .catch(function (err) {
      console.log("Something went wrong!", err);
      next(err);
    });
});

module.exports = router;
