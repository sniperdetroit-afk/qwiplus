// js/api/client.js

export async function apiFetch(url, options = {}){

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await res.json();

  if(!res.ok){
    throw new Error(data.error || "API error");
  }

  return data;
}