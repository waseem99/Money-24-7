export default function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.json({avatarReady: ['LIVEAVATAR_API_KEY','LIVEAVATAR_AVATAR_ID','LIVEAVATAR_VOICE_ID','LIVEAVATAR_CONTEXT_ID','STUDIO_ACCESS_TOKEN'].every(k=>Boolean(process.env[k])), stocksReady: Boolean(process.env.FINNHUB_API_KEY)});
}
