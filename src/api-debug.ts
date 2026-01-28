// api-debug.ts
import api from '../src/services/api';

export const apiDebug = {
  logRequest: (config: any) => {
    console.group('API Request Debug');
    console.log('URL:', config.baseURL + config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    console.groupEnd();
  },
  
  logResponse: (response: any) => {
    console.group('API Response Debug');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
  },
  
  logError: (error: any) => {
    console.group('API Error Debug');
    console.error('Error:', error.message);
    console.error('Full Error:', error);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
    }
    console.groupEnd();
  }
};