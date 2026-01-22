// Dynamically determine API URL based on current hostname
// This ensures frontend always connects to the backend on the same server
const getApiBaseUrl = () => {
  // Always use the current browser hostname with port 8000
  // This ensures the frontend connects to the same server it was loaded from
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol; // http: or https:
    const hostname = window.location.hostname; // localhost or server IP/domain
    return `${protocol}//${hostname}:8000`;
  }
  
  // Fallback for SSR or build time only
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Sites
  SITES_LIST: `${API_BASE_URL}/api/sites`,
  SITES_CREATE: `${API_BASE_URL}/api/sites`,
  SITES_GET: (id: number) => `${API_BASE_URL}/api/sites/${id}`,
  SITES_UPDATE: (id: number) => `${API_BASE_URL}/api/sites/${id}`,
  SITES_DELETE: (id: number) => `${API_BASE_URL}/api/sites/${id}`,
  SITES_STAFF: (id: number) => `${API_BASE_URL}/api/sites/${id}/staff`,
  SITES_ADD_STAFF: (siteId: number, staffId: number) => `${API_BASE_URL}/api/sites/${siteId}/staff/${staffId}`,
  SITES_REMOVE_STAFF: (siteId: number, staffId: number) => `${API_BASE_URL}/api/sites/${siteId}/staff/${staffId}`,

  // Staff
  STAFF_LIST: `${API_BASE_URL}/api/staff`,
  STAFF_CREATE: `${API_BASE_URL}/api/staff`,
  STAFF_GET: (id: number) => `${API_BASE_URL}/api/staff/${id}`,
  STAFF_UPDATE: (id: number) => `${API_BASE_URL}/api/staff/${id}`,
  STAFF_DELETE: (id: number) => `${API_BASE_URL}/api/staff/${id}`,

  // Meetings
  MEETINGS_LIST: `${API_BASE_URL}/api/meetings`,
  MEETINGS_CREATE: `${API_BASE_URL}/api/meetings`,
  MEETINGS_GET: (id: number) => `${API_BASE_URL}/api/meetings/${id}`,
  MEETINGS_UPDATE: (id: number) => `${API_BASE_URL}/api/meetings/${id}`,
  MEETINGS_DELETE: (id: number) => `${API_BASE_URL}/api/meetings/${id}`,
  MEETINGS_BY_SITE: (siteId: number) => `${API_BASE_URL}/api/meetings/site/${siteId}`,
};
