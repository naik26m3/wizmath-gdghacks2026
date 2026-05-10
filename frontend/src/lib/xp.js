/**
 * Level curve: every 100 XP = 1 level. New users start at level 0.
 * 0   xp → Level 0
 * 100 xp → Level 1
 * 250 xp → Level 2
 * 500 xp → Level 5
 */
export function xpToLevel(xp) {
  const x = Math.max(0, Number(xp) || 0)
  return Math.min(9999, Math.floor(x / 100))
}
