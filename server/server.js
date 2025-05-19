const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.post('/api/proxy', async (req, res) => {
  const { number } = req.body;
const access_key = process.env.NUMVERIFY_KEY;

if (!access_key || !number) {
  return res.status(400).json({ success: false, error: "Missing required fields." });
}


  try {
    const url = `http://apilayer.net/api/validate?access_key=${access_key}&number=${encodeURIComponent(number)}`
    const response = await fetch(url)
    const data = await response.json()

    if (!data || typeof data !== 'object') {
      return res.status(502).json({ success: false, error: 'Malformed API response' })
    }

    return res.json({
      valid: data.valid,
      carrier: data.carrier,
      line_type: data.line_type,
      location: data.location,
      country_name: data.country_name
    })
  } catch (err) {
    console.error('Proxy error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})