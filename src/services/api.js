import axios from 'axios';

const GAS_URL = import.meta.env.VITE_GAS_URL;

// Wrapper để gọi api vì Google Apps Script yêu cầu POST gửi dữ liệu dạng text/plain để tránh preflight hoặc dùng get
const apiCall = async (method, action, payload = {}) => {
  if (!GAS_URL) {
    console.error("VITE_GAS_URL is not set!");
    throw new Error("Missing API URL");
  }

  try {
    if (method === 'GET') {
      const params = new URLSearchParams({ action, ...payload });
      const response = await axios.get(`${GAS_URL}?${params.toString()}`);
      if (response.data.status === 'error') throw new Error(response.data.message);
      return response.data;
    } else {
      // POST: GAS nhận payload JSON string
      const response = await axios.post(
        GAS_URL,
        JSON.stringify({ action, ...payload }),
        {
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        }
      );
      if (response.data.status === 'error') throw new Error(response.data.message);
      return response.data;
    }
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
};

export const getTeachers = async () => {
  return apiCall('GET', 'getTeachers');
};

export const getTeacher = async (slug) => {
  return apiCall('GET', 'getTeacher', { slug });
};

export const registerClass = async (data) => {
  return apiCall('POST', 'register', { data });
};

export const loginAdmin = async (password) => {
  return apiCall('POST', 'login', { password });
};

export const getRegistrations = async (token) => {
  return apiCall('GET', 'getRegistrations', { token });
};

export const addTeacher = async (token, data) => {
  return apiCall('POST', 'addTeacher', { token, data });
};

export const updateTeacher = async (token, data) => {
  return apiCall('POST', 'updateTeacher', { token, data });
};

export const deleteTeacher = async (token, id) => {
  return apiCall('POST', 'deleteTeacher', { token, id });
};
