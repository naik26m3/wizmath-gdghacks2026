/** Level curve — tune later; keeps persistence simple. */
export function xpToLevel(xp) {
  const x = Math.max(0, Number(xp) || 0)
  return Math.min(9999, Math.floor(x / 100) + 1)
}
