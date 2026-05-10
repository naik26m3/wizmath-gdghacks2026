import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { invokeLLM } from '../lib/llm.js'

const mockResponse = (text) => ({
  ok: true,
  json: () => Promise.resolve({
    candidates: [{ content: { parts: [{ text }] } }],
  }),
})

beforeEach(() => {
  vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('invokeLLM', () => {
  it('throws when API key is missing', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '')
    await expect(invokeLLM({ prompt: 'hi' })).rejects.toThrow(/API key missing/)
  })

  it('returns plain text when no schema is provided', async () => {
    global.fetch = vi.fn().mockResolvedValue(mockResponse('hello there'))
    const result = await invokeLLM({ prompt: 'say hi' })
    expect(result).toBe('hello there')
  })

  it('parses JSON when a schema is provided', async () => {
    global.fetch = vi.fn().mockResolvedValue(mockResponse('{"foo":42,"bar":"baz"}'))
    const result = await invokeLLM({
      prompt: 'give me json',
      response_json_schema: { type: 'object' },
    })
    expect(result).toEqual({ foo: 42, bar: 'baz' })
  })

  it('sends responseSchema in generationConfig when schema is provided', async () => {
    global.fetch = vi.fn().mockResolvedValue(mockResponse('{}'))
    const schema = { type: 'object', properties: { x: { type: 'number' } } }
    await invokeLLM({ prompt: 'p', response_json_schema: schema })

    expect(global.fetch).toHaveBeenCalledOnce()
    const [, init] = global.fetch.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.generationConfig.responseMimeType).toBe('application/json')
    expect(body.generationConfig.responseSchema).toEqual(schema)
  })

  it('omits generationConfig when no schema is provided', async () => {
    global.fetch = vi.fn().mockResolvedValue(mockResponse('plain'))
    await invokeLLM({ prompt: 'p' })
    const [, init] = global.fetch.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.generationConfig).toBeUndefined()
  })

  it('throws on non-ok HTTP response with status and body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve('rate limited'),
    })
    await expect(invokeLLM({ prompt: 'x' })).rejects.toThrow(/Gemini API 429.*rate limited/)
  })

  it('throws when Gemini returns empty candidates', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidates: [] }),
    })
    await expect(invokeLLM({ prompt: 'x' })).rejects.toThrow(/empty response/)
  })

  it('URL-encodes the API key', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'has spaces & symbols')
    global.fetch = vi.fn().mockResolvedValue(mockResponse('ok'))
    await invokeLLM({ prompt: 'p' })
    const [url] = global.fetch.mock.calls[0]
    expect(url).toContain('has%20spaces%20%26%20symbols')
  })
})
