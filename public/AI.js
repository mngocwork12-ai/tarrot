// Use relative path on localhost (same-origin, no CORS needed)
// Use absolute Railway URL on production (Vercel → Railway)
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? ""
    : "https://tarrot-production.up.railway.app";

async function query(question, selectedCards) {
  const response = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, selectedCards })
  });

  const data = await response.json();

  if (data.error) throw new Error(data.error);
  return data.response;
}
