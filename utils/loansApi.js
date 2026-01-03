// Example utility for making API calls with password
// Add this to your frontend code (e.g., in a utils or services folder)

const STORAGE_KEY = 'emi_tracker_password';

function getStoredPassword() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

function storePassword(password) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, password);
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

function promptForPassword() {
  const password = window.prompt('Enter password to decrypt loans data:');
  return password;
}

async function fetchWithPassword(url, options = {}, password = null) {
  try {
    // If no password provided, ask user immediately
    let finalPassword = password;
    if (!finalPassword) {
      const userPassword = promptForPassword();
      if (!userPassword) {
        throw new Error('Password is required to access loans data');
      }
      finalPassword = userPassword;
      storePassword(userPassword);
    }
    
    // Build URL with password
    const getUrl = (pwd) => `${url}?password=${encodeURIComponent(pwd)}`;
    
    // Make request with password
    const response = await fetch(getUrl(finalPassword), options);
    
    // If successful, return response
    if (response.ok) {
      return response;
    }
    
    // If unauthorized (401), password was wrong
    if (response.status === 401) {
      const userPassword = promptForPassword();
      if (!userPassword) {
        throw new Error('Password is required to access loans data');
      }
      
      // For retries with body (PUT/POST), we need to re-create the options
      // because the body stream might have been consumed
      const retryOptions = { ...options };
      if (options.body && typeof options.body === 'string') {
        retryOptions.body = options.body;
      }
      
      const retryUrl = getUrl(userPassword);
      const retryResponse = await fetch(retryUrl, retryOptions);
      
      if (!retryResponse.ok) {
        throw new Error('Invalid password or corrupted data');
      }
      
      // Store password for future use
      storePassword(userPassword);
      return retryResponse;
    }
    
    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getLoans() {
  try {
    // Try to get stored password, prompt if not available
    let password = getStoredPassword();
    if (!password) {
      password = promptForPassword();
      if (!password) {
        throw new Error('Password is required to access loans data');
      }
      storePassword(password);
    }
    
    const url = '/api/loans';
    const response = await fetchWithPassword(url, {}, password);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch loans: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching loans:', error);
    throw error;
  }
}

export async function updateLoans(loansData) {
  try {
    // Try to get stored password, prompt if not available
    let password = getStoredPassword();
    if (!password) {
      password = promptForPassword();
      if (!password) {
        throw new Error('Password is required to access loans data');
      }
      storePassword(password);
    }
    
    const url = '/api/loans';
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loansData),
    };
    
    const response = await fetchWithPassword(url, options, password);
    
    if (!response.ok) {
      throw new Error(`Failed to update loans: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating loans:', error);
    throw error;
  }
}
