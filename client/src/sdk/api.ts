/**
 * API utilities for SDK modules
 */

// Default API configuration
let apiUrl = '/api';
let apiKey = '';

/**
 * Configure the API module
 * @param url Base API URL
 * @param key API key
 */
export function configureApi(url: string, key: string) {
  apiUrl = url;
  apiKey = key;
}

/**
 * Make an API request
 * @param method HTTP method
 * @param endpoint API endpoint (without base URL)
 * @param data Optional request body
 */
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any
) {
  const url = `${apiUrl}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    
    try {
      errorJson = JSON.parse(errorText);
    } catch (e) {
      // If not JSON, use text directly
      throw new Error(errorText || `API Error: ${response.status}`);
    }
    
    throw new Error(errorJson.error || errorJson.message || `API Error: ${response.status}`);
  }
  
  return response;
}