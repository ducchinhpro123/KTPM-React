import axios from 'axios';
import tokenService from './tokenService';

const API = axios.create({
  baseURL: 'https://ktpm-api-g9gcd2epanhch3dz.southeastasia-01.azurewebsites.net/api',
  timeout: 5000, // 5 seconds timeout
});

// Request interceptor - adds authentication headers using our tokenService
API.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/users/refresh-token', { refreshToken });
          const newToken = response.data.token;

          tokenService.setToken(newToken);
          API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Force logout on token refresh failure
        tokenService.removeToken();
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        response: {
          data: {
            error: 'Network error. Please check your internet connection.'
          }
        }
      });
    }

    // Log all API errors
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.error || error.message
    });

    return Promise.reject(error);
  }
);

// Helper method to get valid product categories from the server
API.getValidCategories = async () => {
  try {
    // Try to get categories directly from server (ideal approach)
    const response = await API.get('/products/categories');
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    // Fallback: If the endpoint doesn't exist, try to analyze the error
    // to extract the valid enum values
  } catch (error) {
    console.log('Error fetching categories:', error.response?.data);
    
    // Attempt to extract valid enum values from error message if possible
    const errorMsg = error.response?.data?.error || '';
    if (errorMsg.includes('is not a valid enum value for path')) {
      try {
        // Make a test request that will likely fail but might reveal valid values
        const testResponse = await API.get('/products/enum-values');
        if (testResponse.data && testResponse.data.validCategories) {
          return testResponse.data.validCategories;
        }
      } catch (enumError) {
        // Last resort - parse error message for valid values
        // This is not reliable but might work in some cases
        console.log('Trying to extract enum values from error');
      }
    }
    
    // Hard-coded fallback based on most common e-commerce categories
    // Note: These are just guesses and might not match your server's enum values
    return ['electronics', 'clothing', 'home', 'sports', 'beauty'];
  }
};

// Helper method to diagnose valid product categories
API.diagnoseCategories = async () => {
  try {
    // Try different common category values to see which ones pass validation
    const testCategories = [
      'electronics', 'clothing', 'books', 'book', 'furniture', 'home',
      'sports', 'beauty', 'toys', 'food', 'jewelry', 'accessories',
      'health', 'automotive', 'garden', 'office'
    ];
    
    // Create a minimal product for each category to test
    const results = [];
    
    for (const category of testCategories) {
      try {
        const testProduct = {
          name: `Test Product - ${category}`,
          price: 9.99,
          description: 'Test product for category validation',
          category: category,
          inStock: 1
        };
        
        // We'll start the request but cancel it before it completes to avoid creating test products
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 500); // Abort after 500ms
        
        await API.post('/products', testProduct, { 
          signal: controller.signal 
        });
        
        // If we get here, this category might be valid (request was aborted but no validation error)
        results.push({ category, valid: true, error: null });
      } catch (error) {
        // Check if the error was due to our abort or a validation error
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          // Request was aborted before validation, assume potentially valid
          results.push({ category, valid: 'unknown', error: null });
        } else {
          // Check if the error message indicates category validation failure
          const errorMsg = error.response?.data?.error || '';
          const isInvalidCategory = errorMsg.includes(`\`${category}\` is not a valid enum value for path \`category\``);
          results.push({ 
            category, 
            valid: !isInvalidCategory, 
            error: isInvalidCategory ? 'Invalid category' : 'Other error'
          });
        }
      }
    }
    
    // Filter results to find potentially valid categories
    const validCategories = results
      .filter(result => result.valid === true || result.valid === 'unknown')
      .map(result => result.category);
      
    console.log('Category diagnostic results:', results);
    console.log('Potentially valid categories:', validCategories);
    
    return validCategories;
  } catch (error) {
    console.error('Category diagnosis failed:', error);
    return ['electronics'];  // Return a safe default
  }
};

// Extract valid categories from existing products
API.extractCategoriesFromProducts = async () => {
  try {
    const response = await API.get('/products');
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      // Extract unique categories from products
      const uniqueCategories = [...new Set(
        response.data.data
          .map(product => product.category)
          .filter(Boolean) // Remove null/undefined values
      )];
      
      console.log('Extracted categories from existing products:', uniqueCategories);
      return uniqueCategories;
    }
    return [];
  } catch (error) {
    console.error('Failed to extract categories from products:', error);
    return [];
  }
};

export default API;
