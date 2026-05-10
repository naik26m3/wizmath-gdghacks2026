/**
 * Gemini text generation. The key is exposed in the client bundle —
 * fine for hackathon scope, but production should proxy through a Cloud Function.
 */
const MODEL = 'gemini-2.5-flash'

export async function invokeLLM({ prompt, response_json_schema }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key missing — set VITE_GEMINI_API_KEY in frontend/.env.')
  }

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  }
  if (response_json_schema) {
    body.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: response_json_schema,
    }
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Gemini API ${res.status}: ${text}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini returned an empty response')
  }
  return response_json_schema ? JSON.parse(text) : text
}
