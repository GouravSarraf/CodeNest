import { authAPI } from './auth';
import * as projectAPI from './project';

export {
  authAPI,
  projectAPI
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      message: error.response.data.message || 'An error occurred',
      status: error.response.status,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      message: 'No response from server',
      status: 0,
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      message: error.message || 'An error occurred',
      status: 0,
    };
  }
}; 