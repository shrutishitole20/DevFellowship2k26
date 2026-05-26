async function parseResponse(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export async function fetchNotesApi() {
  return parseResponse(await fetch('/notes'));
}

export async function createNoteApi(payload) {
  return parseResponse(await fetch('/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
}

export async function updateNoteApi(id, payload) {
  return parseResponse(await fetch(`/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }));
}

export async function deleteNoteApi(id) {
  return parseResponse(await fetch(`/notes/${id}`, { method: 'DELETE' }));
}
