
const clientId = '1a2afc7c51404b20a656a1559c7dd648';
const redirectURI = 'http://rob_playlist_maker.surge.sh';
let userAccessToken;


const Spotify = {
    getAccessToken() {
        if (userAccessToken) {
            return userAccessToken;
        }

        // check for access  token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            userAccessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // This clears the parameters, allowing us to grab a new access token when it expires
            window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return userAccessToken;

        } else {
            const accessUrl = window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&&redirect_uri=${redirectURI}&scope=playlist-modify-public`;
            window.location = accessUrl;

        }
    },

    async search(searchTerm) {
        const userAccessToken = await Spotify.getAccessToken();


        try {
            const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${userAccessToken}`
                }
            });

            if (response.ok) {
                const jsonResponse = await response.json();
                if (!jsonResponse.tracks) {
                    return [];

                } else {
                    return jsonResponse.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }));
                }

            }


        } catch (error) {
            console.log(error);
        }
    },

    async savePlaylist(name, trackURIs) {
        if (!name || !trackURIs.length) {
            
            return;

        }
        let accessToken = await Spotify.getAccessToken();
        let headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        let userId;

        try {
            // get user id
            const response = await fetch('https://api.spotify.com/v1/me', { headers: headers });
            if (response.ok) {
                const jsonResponse = await response.json();                
                userId = jsonResponse.id;
                
            }
            
        }
        catch (networkError) {
            console.log(networkError.message);
        }


        try {
            // create and post a new playlist to spotify account, 

            const response_1 = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',                
                body: JSON.stringify({ name: name })
            });

            const jsonResponse_1 = await response_1.json();
            if (response_1.ok) {
                
                const playlist_id = jsonResponse_1.id;
                return fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                    headers: headers,
                    method: 'POST',                                  
                    body: JSON.stringify({ uris: trackURIs })
                });
            }

        } catch (networkError) {
            console.log(networkError);
        }        
    }
};
export default Spotify;

