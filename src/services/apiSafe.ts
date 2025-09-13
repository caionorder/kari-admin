import axios from 'axios';

// Determine if we're in production
const hostname = window?.location?.hostname || 'localhost';
const isProduction = hostname.includes('kariajuda.com');

// ALWAYS use HTTPS in production
const API_BASE = isProduction 
  ? 'https://api.kariajuda.com/api/v1'
  : 'http://127.0.0.1:8000/api/v1';

console.log('API Safe Service:', { hostname, isProduction, API_BASE });

// Create a wrapper that ALWAYS uses full URLs
const apiSafe = {
  get: (url: string, config?: any) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    console.log('GET Request:', fullUrl);
    
    // Ensure HTTPS in production
    const finalUrl = isProduction && fullUrl.startsWith('http://') 
      ? fullUrl.replace('http://', 'https://') 
      : fullUrl;
    
    if (finalUrl !== fullUrl) {
      console.warn('URL was forced to HTTPS:', finalUrl);
    }
    
    return axios.get(finalUrl, {
      ...config,
      headers: {
        ...config?.headers,
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
  },
  
  post: (url: string, data?: any, config?: any) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    console.log('POST Request:', fullUrl);
    
    // Ensure HTTPS in production
    const finalUrl = isProduction && fullUrl.startsWith('http://') 
      ? fullUrl.replace('http://', 'https://') 
      : fullUrl;
    
    if (finalUrl !== fullUrl) {
      console.warn('URL was forced to HTTPS:', finalUrl);
    }
    
    return axios.post(finalUrl, data, {
      ...config,
      headers: {
        ...config?.headers,
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
  },
  
  put: (url: string, data?: any, config?: any) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const finalUrl = isProduction && fullUrl.startsWith('http://') 
      ? fullUrl.replace('http://', 'https://') 
      : fullUrl;
    
    return axios.put(finalUrl, data, {
      ...config,
      headers: {
        ...config?.headers,
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
  },
  
  patch: (url: string, data?: any, config?: any) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const finalUrl = isProduction && fullUrl.startsWith('http://') 
      ? fullUrl.replace('http://', 'https://') 
      : fullUrl;
    
    return axios.patch(finalUrl, data, {
      ...config,
      headers: {
        ...config?.headers,
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
  },
  
  delete: (url: string, config?: any) => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    const finalUrl = isProduction && fullUrl.startsWith('http://') 
      ? fullUrl.replace('http://', 'https://') 
      : fullUrl;
    
    return axios.delete(finalUrl, {
      ...config,
      headers: {
        ...config?.headers,
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
  }
};

export default apiSafe;