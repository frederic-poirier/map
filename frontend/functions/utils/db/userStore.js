
export async function findUserByGoogleSub(googleSub, env) {
  return env.DB
    .prepare(
      'SELECT id, email, name FROM users WHERE google_sub = ?'
    )
    .bind(googleSub)
    .first();
}

export async function createUserFromGoogle({ sub, email, name }, env) {
  const res = await env.DB
    .prepare(
      'INSERT INTO users (google_sub, email, name) VALUES (?, ?, ?)'
    )
    .bind(sub, email, name)
    .run();

  return {
    id: res.meta.last_row_id,
    email,
    name
  };
}

export async function findUserById(userId, env) {
  return env.DB
    .prepare(
      'SELECT id, email, name FROM users WHERE id = ?'
    )
    .bind(userId)
    .first();
}
