const BASE_URL = '/api'; // proxied to http://localhost:8080 by Vite in dev

export async function sendChatMessage(message, history) {
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.error || `Chat request failed (${res.status})`);
  }
  const data = await res.json();
  return data.reply;
}

export async function fetchApod() {
  const res = await fetch(`${BASE_URL}/nasa/apod`);
  if (!res.ok) throw new Error('Failed to fetch APOD');
  return res.json();
}

export async function fetchNeo() {
  const res = await fetch(`${BASE_URL}/nasa/neo`);
  if (!res.ok) throw new Error('Failed to fetch NEO data');
  return res.json();
}

export async function fetchDonki(days = 7) {
  const res = await fetch(`${BASE_URL}/nasa/donki?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch DONKI data');
  return res.json();
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
