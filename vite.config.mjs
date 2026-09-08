import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const readBody = (request) => new Promise((resolve, reject) => {
  let body = ''
  request.on('data', (chunk) => { body += chunk })
  request.on('end', () => resolve(body))
  request.on('error', reject)
})

const assistantApi = (env) => ({
  name: 'alam-assistant-api',
  configureServer(server) {
    server.middlewares.use('/api/assistant', async (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.end('Method not allowed')
        return
      }
      const apiKey = env.ALAM_AI_API_KEY
      if (!apiKey) {
        response.statusCode = 503
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ error: 'AI provider is not configured' }))
        return
      }
      try {
        const payload = JSON.parse(await readBody(request))
        const language = payload.lang === 'ta' ? 'Tamil' : 'English'
        const upstream = await fetch(env.ALAM_AI_BASE_URL ?? 'https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: env.ALAM_AI_MODEL ?? 'gpt-4o-mini',
            temperature: 0.2,
            max_tokens: 350,
            messages: [
              { role: 'system', content: `You are ALAM, a concise, accurate voice assistant. Answer in ${language}. For Tamil, use natural spoken Tamil. Do not invent current facts. If a question needs live data you cannot access, say so clearly. Keep answers under 80 words.` },
              { role: 'user', content: String(payload.question ?? '') },
            ],
          }),
        })
        const data = await upstream.json()
        if (!upstream.ok) {
          response.statusCode = upstream.status
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: data?.error?.message ?? 'AI provider request failed' }))
          return
        }
        const answer = data?.choices?.[0]?.message?.content?.trim()
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ answer: answer || null }))
      } catch {
        response.statusCode = 500
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ error: 'Assistant request failed' }))
      }
    })
  },
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), assistantApi(env)] }
})
