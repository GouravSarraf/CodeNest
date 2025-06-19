import axios from 'axios';

const baseURL = '/api'; // Update this with your backend URL

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for handling cookies
});


export default axiosInstance; 