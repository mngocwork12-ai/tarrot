async function query(question, selectedCards) {
  const response = await fetch("tarrot-production.up.railway.app/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, selectedCards })
  });

  const data = await response.json();

  if (data.error) throw new Error(data.error);
  return data.response;
}
