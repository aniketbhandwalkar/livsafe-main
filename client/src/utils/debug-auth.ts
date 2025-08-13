// Debug utility to check authentication status
export const debugAuth = () => {
  console.group('🔍 Authentication Debug');
  
  // Check localStorage token
  const token = localStorage.getItem('token');
  console.log('📝 Token in localStorage:', token ? 'EXISTS' : 'MISSING');
  
  if (token) {
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    
    // Try to decode JWT (basic info)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('📊 Token payload:', payload);
      console.log('⏰ Token expires:', new Date(payload.exp * 1000).toLocaleString());
      console.log('🕐 Current time:', new Date().toLocaleString());
      console.log('✅ Token valid:', payload.exp * 1000 > Date.now());
    } catch (error) {
      console.error('❌ Token decode error:', error);
    }
  }
  
  // Check API configuration
  console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api');
  
  console.groupEnd();
};

// Auto-run debug on import in development
if (import.meta.env.DEV) {
  debugAuth();
}
