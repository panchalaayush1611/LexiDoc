import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import uploadRouter from './routes/upload.js'
import chatRouter from './routes/chat.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api', uploadRouter)
app.use('/api', chatRouter)

app.get('/api/history', (req, res) => {
  // Real history lives client-side in localStorage for now.
  // Wire this up to a database if you need cross-device history.
  res.json({ success: true, conversations: [] })
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

// In non-serverless environments (local dev), start the HTTP server.
// On Vercel, the exported app is mounted as a serverless function automatically.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`LexiDoc backend listening on port ${PORT}`))
}

export default app
