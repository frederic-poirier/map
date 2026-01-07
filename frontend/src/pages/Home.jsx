import { A } from "@solidjs/router";

export default function Home() {
    const BACKEND_URL = import.meta.env.DEV
      ? "http://localhost:3000"
      : "https://backend.frederic.dog";

  function fetchMe() {
    fetch(`${BACKEND_URL}/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from /me:", data);
      })
      .catch((error) => {
        console.error("Error fetching /me:", error);
      });
  }

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the home page of the application.</p>
      <A href="/map">Go to Map</A>
      <hr />
      <button onClick={fetchMe}>me</button>
    </div>
  );
}
