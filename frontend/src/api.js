const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://infoagent-backend.onrender.com' 
  : 'http://localhost:8000';

export async function sendMessage(message) {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return res.json();
}
