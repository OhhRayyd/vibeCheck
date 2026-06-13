import { Message } from 'discord.js';

interface CrossReferenceResult {
    results?: {
        AppleMusic?: { url?: string };
        Spotify?: { url?: string };
    };
}

// Cross reference trakcs to other streaming platforms

export async function getTrackURLs (message: Message) {

    // get the replied message
    const origMessage = await message.fetchReference()

    // regex the message and just get an url
    let url = origMessage?.content.match(/https?:\/\/[^\s]+/)?.[0]
    if (!url){
        console.error('No url found')
        return 
    }
    console.log(`URL found: ${url}`)

    // use the url to check for other links
    const urlData = await crossReference(url)
    if (!urlData){
        console.error('No data returned from crossReference')
        return
    }

    // create the message reply
    let replyStr = `Great Song! You can find it in various streaming platforms:\n 
    Apple: ${urlData[0]?.results?.AppleMusic?.url || 'Not Found'} \n
    Spotify: ${urlData[0]?.results?.Spotify?.url || 'Not Found'} `

    message.reply(replyStr)
    return 

}

export async function crossReference(trackURI: string) {
    const apiKey = process.env.BEAT_KEY

    if (!apiKey) {
        console.error('BEAT_KEY env variable not set')
        return 
    }

    const response = await fetch('https://bridgebeats.link/music/lookup/urlList', {
        method: "POST",
        headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json'},
        body: JSON.stringify({"uri": trackURI})
    })

    if (!response.ok)   
        throw new Error(`crossReference - Response status: ${response.status}`)

    const result = await response.json() as CrossReferenceResult[]
    return result
}



