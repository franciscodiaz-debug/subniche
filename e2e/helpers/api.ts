const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"

export async function loginViaApi(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: {
        provider: "password",
        identify_name: "email",
        identify_value: email,
        password,
      },
    }),
  })

  const { data, error } = await res.json()
  if (!res.ok) throw new Error(`Login failed: ${error}`)
  return data.token as string
}
