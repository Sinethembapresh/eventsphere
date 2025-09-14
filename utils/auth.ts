import axiosInstance from '@/app/api/axiosInstance';

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    // Also set it in axios defaults
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.clear(); // Clear all stored data
    sessionStorage.clear();
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};