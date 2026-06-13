type Result = {
    access_token: string
    token_type: string
    expires_in: number
    timeRetrieved: Date
}

type SongData = {
    name: string
    external_ids: string
}

// unused for now but maybe in the future

export async function getSpotifyAuthToken() {

    const timeRetrieved = new Date();

    const spotify_id =  process.env.SPOTIFY_ID 
    const spotify_secret = process.env.SPOTIFY_SECRET

    if (!spotify_id || !spotify_secret) {
        console.error('spotify id/secret undefined')
        return
    }
    // api call to grab token
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            "grant_type": 'client_credentials',
            "client_id": spotify_id,
            "client_secret": spotify_secret
        })
    })

    if (!response.ok) {
        throw new Error(`getSpotifyAuthToken - Response status: ${response.status}`)
    }

    const data = await response.json() as Omit<Result, "timeRetrieved">
    // lets add the token gotten time to the object so we know when to refresh it
    const result: Result = { ...data, timeRetrieved }
    console.log('Got Spotify Auth token')
    console.log(result)
    return result
}


export async function getOrRefreshSpotifyToken(existingToken?: Result) {
    // if token already exists check to see if it needs refreshing
    if (existingToken) {
        console.log('Spotify: existingToken found')
        const currentTime = new Date();
        // if currentTime is more than 1 hour past timeRetrieved get a new Token
        if (currentTime.getTime() - existingToken.timeRetrieved.getTime() >= 3600000) {
            console.log('Spotify: refreshing token')
            return getSpotifyAuthToken();
        }
        else {
            console.log('Spotify: token still valid')
            return existingToken;
        }
    }

    // no existing token just get a new one 
    else {
        console.log('Spotify: getting new token, no token found')
        return getSpotifyAuthToken();
    }
}


export async function getSpotifyTrackInfo(trackID: string, accessToken: string) {

    const url = 'https://api.spotify.com/v1/tracks/' + trackID
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!response.ok) {
        throw new Error(`getSpotifyTrackInfo - Response status: ${response.status}`)
    }

    const data = await response.json()
    
    return data;
}