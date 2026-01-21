export default function Login() {
  function loginwithgoogle() {
    window.location.href = "/auth/google/start";
  }
  return (
    <button onclick={loginwithgoogle}>google!</button>
  )
}
