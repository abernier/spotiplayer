window.onSpotifyWebPlaybackSDKReady = () => {
  // https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
  console.log('onSpotifyWebPlaybackSDKReady')

  // check we have an access_token (in global `config` var)
  if (!config.spotify.access_token) {
    return console.warn('config.spotify.access_token not here')
  }

  // access_token expiration warning
  setTimeout(() => {
    console.warn('Spotify access_token should now be expired. Maybe a good idea to `GET /oauth/refresh` it.')
  }, config.spotify.expires_in * 1000);

  //
  // Create a Spotify player instance
  // https://developer.spotify.com/documentation/web-playback-sdk/reference/
  //
  let firstTime = true
  const player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => {
      console.log('getOAuthToken', firstTime)

      if (firstTime) {
        cb(config.spotify.access_token) // read the `access_token` from window.config the `firstTime`
        firstTime = false
      } else {
        // Otherwise, fetch a refreshed one
        fetch('/oauth/refresh')
          .then(response => response.json())
          .then(json => {
            const {access_token, expires_in} = json

            // update global window.config.spotify object
            config.spotify.access_token = access_token
            config.spotify.expires_in = expires_in

            cb(access_token)
          })
          .catch(console.error)
      }
    },
    volume: 0.5
  });
  globalThis.player = player // make a global `player` variable

  player.addListener('ready', e => {
    //
    // Once device created
    //
    const { device_id } = e

    console.log('ready', device_id);

    // Extract songs from `<li>`s
    const songs = Array.from(document.querySelectorAll('li')).map(el => el.innerText)

    // HTTP Request to start playing songs on that newly created device
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: songs }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.spotify.access_token}`
      },
    });

  });

  //
  // debug
  //
  player.addListener('not_ready', e => {
    console.log('not_ready', e);
  });
  player.addListener('initialization_error', e => { 
      console.error('initialization_error', e);
  });
  player.addListener('authentication_error', e => {
      console.error('authentication_error', e);
  });
  player.addListener('account_error', e => {
      console.error('account_error', e);
  });

  // Let's connect our player
  player.connect()
    .then(success => console.log('The Web Playback SDK successfully connected to Spotify!'))
    .catch(err => console.error('failed to connect'))
}

//
// Controls
//

document.getElementById('resume').onclick = function() {
  player.resume();
};
document.getElementById('pause').onclick = function() {
  player.pause();
};