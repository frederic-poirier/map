
export function requireEnv(env, keys) {
  for (const key of keys) {
    if (!env[key]) {
      throw new Error(`Missing env var: ${key}`);
    }
  }
}
