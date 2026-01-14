const API_URL = process.env.REACT_APP_API_URL || "http://localhost:1337"

export const fetchFromStrapi = async (endpoint) => {
  const res = await fetch(`${API_URL}/api/${endpoint}`)
  if (!res.ok) throw new Error(`Strapi error: ${res.status}`)
  return res.json()
}

export const strapiMedia = (path) => {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `${API_URL}${path}`
}
