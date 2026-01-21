import { createSignal } from "solid-js"

export default function Home() {
  const [status, setStatus] = createSignal('not tried yet')

  async function me() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return (
    <>
      <h1>Home</h1>
      <button onClick={me}>{status()}</button>
    </>
  )
}
