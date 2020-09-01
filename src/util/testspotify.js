const { default: Spotify } = require("./spotify")

const Test = {
    async savePlaylist(playlistName, trackURIs) {
        let accessToken = await Spotify.getAccessToken();
        let headers = {
            Authorization: `Bearer ${accessToken}`
        };
        let userId;

        try {
            const response = await fetch('https://api.spotify.com/v1/me', {headers: headers});
            if (response.ok) {
                const jsonResponse = await response.json();
                userId = jsonResponse.id;
            }
        } catch (error) {
            console.log(error);
        }
        try {
            const response_1 = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST', 
                body: JSON.stringify({ playlistName: playlistName })
            });
            if(response_1.ok) {
                const jsonResponse_1 = await response_1.json();
                const playlistId = jsonResponse_1.id;
                return playlistId;
            }
        } catch (error) {
            console.log(error);
        }
        try {
            const response_2 = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                headers: headers,
                method: 'POST', 
                body: JSON.stringify({ uris: trackURIs })
            });
            if (response_2.ok) {
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }
}
