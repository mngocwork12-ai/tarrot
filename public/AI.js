// Always use relative path — Caddy reverse proxy handles routing
const API_BASE = "";

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
