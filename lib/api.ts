// File: frontend/lib/api.ts

const API_BASE_URL = 'http://127.0.0.1:8000';

// A single, powerful function for all authenticated API requests
export async function apiRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', token: string, body?: object) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  headers['Authorization'] = `Bearer ${token}`;

  const config: RequestInit = {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle cases where the response might be empty (e.g., a 204 No Content)
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    const errorData = contentType && contentType.includes("application/json") ? await response.json() : { detail: 'An unknown API error occurred' };
    throw new Error(errorData.detail);
  }
  
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return {}; // Return an empty object for non-JSON responses
}


// --- All the functions our application will ever need ---

export const getUserConfig = (token: string) => 
  apiRequest('/api/config', 'GET', token);

export const getAllConnections = (token: string) =>
  apiRequest('/api/connections/all', 'GET', token);

export const saveServiceKeys = (keys: { [service: string]: { api_key: string } }, token: string) =>
  apiRequest('/api/connections/keys', 'PUT', token, keys);

export const generatePersonas = (goal: string, token: string) =>
  apiRequest('/api/personas/generate', 'POST', token, { goal });

export const updateDraftTeam = (activeTeam: any[], token: string) =>
  apiRequest('/api/draft', 'PUT', token, { activeTeam });

export const deletePersona = (personaId: string, token: string) =>
    apiRequest(`/api/personas/${personaId}`, 'DELETE', token);
  
  export const updatePersona = (personaId: string, personaData: object, token: string) =>
    apiRequest(`/api/personas/${personaId}`, 'PUT', token, personaData);

export const deployTeam = (token: string) =>
  apiRequest('/api/deploy', 'POST', token);
export const getBotStatus = (token: string) =>
    apiRequest('/api/config', 'GET', token); // We can reuse the config endpoint for this
  
  export const startBot = (platforms: string[], token: string) =>
    apiRequest('/api/start', 'POST', token, { platforms });
  
  export const stopBot = (token: string) =>
    apiRequest('/api/stop', 'POST', token);
  // Add these to frontend/lib/api.ts
  export const saveBotConfiguration = (behaviorPayload: any, token: string) =>
    apiRequest('/api/config/behavior', 'PUT', token, behaviorPayload);
  
  export const getConnectionsStatus = (token: string) =>
    apiRequest('/api/connections', 'GET', token);