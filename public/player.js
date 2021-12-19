window.onSpotifyWebPlaybackSDKReady = () => {
  // https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
  console.log('onSpotifyWebPlaybackSDKReady')

  // check we have an access_token (in global `config` var)
  if (!config.spotify_access_token) {
    return console.warn('config.spotify_access_token not here')
  }

  // access_token expiration warning
  setTimeout(() => {
    console.warn('Spotify access_token should now be expired. Maybe a good idea to `GET /oauth/refresh` it.')
  }, config.spotify_expires_in * 1000);

  //
  // Create a Spotify player instance
  // https://developer.spotify.com/documentation/web-playback-sdk/reference/
  //
  const player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => {
      cb(config.spotify_access_token)
    },
    volume: 0.5
  });
  globalThis.player = player // make a global `player` variable

  player.addListener('ready', ({ device_id }) => {
    //
    // Once device created
    //

    console.log('ready', device_id);

    // Extract songs from `<li>`s
    const songs = Array.from(document.querySelectorAll('li')).map(el => el.innerText)

    // HTTP Request to start playing songs on that newly created device
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: songs }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.spotify_access_token}`
      },
    });

  });

  //
  // debug
  //
  player.addListener('not_ready', ({ device_id }) => {
    console.log('not_ready', device_id);
  });
  player.addListener('initialization_error', ({ message }) => { 
      console.error('initialization_error', message);
  });
  player.addListener('authentication_error', ({ message }) => {
      console.error('authentication_error', message);
  });
  player.addListener('account_error', ({ message }) => {
      console.error('account_error', message);
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