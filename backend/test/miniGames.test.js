import { describe, it, expect, beforeEach } from 'vitest'
import { listMiniGames, createMiniGame, deleteMiniGame } from '../lib/miniGames.js'
import { clearFirestore } from './setup.js'

const samplePayload = (overrides = {}) => ({
  title: 'Slope Hunt',
  description: 'Find the line slope',
  prompt: 'a game about slopes',
  math_concept: 'slope',
  difficulty: 'easy',
  thumbnail_color: 'green',
  game_config: { equation: '2*x+3' },
  ...overrides,
})

describe('createMiniGame', () => {
  beforeEach(async () => {
    await clearFirestore()
  })

  it('persists ownerUid and payload fields', async () => {
    const created = await createMiniGame('alice', samplePayload({ title: 'My Game' }))

    expect(created.id).toBeDefined()
    expect(created.ownerUid).toBe('alice')
    expect(created.title).toBe('My Game')
    expect(created.math_concept).toBe('slope')
    expect(created.game_config).toEqual({ equation: '2*x+3' })
  })

  it('applies sensible defaults for missing fields', async () => {
    const created = await createMiniGame('alice', { title: 'Bare' })

    expect(created.math_concept).toBe('other')
    expect(created.difficulty).toBe('medium')
    expect(created.thumbnail_color).toBe('green')
    expect(created.game_config).toEqual({})
  })

  it('throws if ownerUid is missing', async () => {
    await expect(createMiniGame(null, samplePayload())).rejects.toThrow(/ownerUid required/)
    await expect(createMiniGame('', samplePayload())).rejects.toThrow(/ownerUid required/)
  })
})

describe('listMiniGames', () => {
  beforeEach(async () => {
    await clearFirestore()
  })

  it('returns only games owned by the given uid', async () => {
    await createMiniGame('alice', samplePayload({ title: 'A1' }))
    await createMiniGame('alice', samplePayload({ title: 'A2' }))
    await createMiniGame('bob', samplePayload({ title: 'B1' }))

    const aGames = await listMiniGames('alice')
    expect(aGames).toHaveLength(2)
    expect(aGames.every((g) => g.ownerUid === 'alice')).toBe(true)

    const bGames = await listMiniGames('bob')
    expect(bGames).toHaveLength(1)
    expect(bGames[0].title).toBe('B1')
  })

  it('orders by createdAt desc', async () => {
    await createMiniGame('alice', samplePayload({ title: 'first' }))
    await new Promise((r) => setTimeout(r, 30))
    await createMiniGame('alice', samplePayload({ title: 'second' }))
    await new Promise((r) => setTimeout(r, 30))
    await createMiniGame('alice', samplePayload({ title: 'third' }))

    const games = await listMiniGames('alice')
    expect(games.map((g) => g.title)).toEqual(['third', 'second', 'first'])
  })

  it('respects max limit', async () => {
    for (let i = 0; i < 5; i++) {
      await createMiniGame('alice', samplePayload({ title: `g${i}` }))
    }
    const games = await listMiniGames('alice', 3)
    expect(games).toHaveLength(3)
  })

  it('returns [] when ownerUid is null/empty', async () => {
    expect(await listMiniGames(null)).toEqual([])
    expect(await listMiniGames('')).toEqual([])
    expect(await listMiniGames(undefined)).toEqual([])
  })
})

describe('deleteMiniGame', () => {
  beforeEach(async () => {
    await clearFirestore()
  })

  it('removes the document', async () => {
    const created = await createMiniGame('alice', samplePayload())
    await deleteMiniGame(created.id)

    const after = await listMiniGames('alice')
    expect(after).toHaveLength(0)
  })

  it('throws if id is missing', async () => {
    await expect(deleteMiniGame()).rejects.toThrow(/id required/)
    await expect(deleteMiniGame('')).rejects.toThrow(/id required/)
  })
})
