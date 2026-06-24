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
    if (password) {
      localStorage.setItem(STORAGE_KEY, password);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

function promptForPassword() {
  return window.prompt('Enter password to decrypt lumpsum data:');
}

async function fetchWithPassword(url, options = {}, password = null) {
  let finalPassword = password;
  if (!finalPassword) {
    const userPassword = promptForPassword();
    if (!userPassword) {
      throw new Error('Password is required to access lumpsum data');
    }
    finalPassword = userPassword;
  }

  const getUrl = (pwd) => `${url}?password=${encodeURIComponent(pwd)}`;
  let response = await fetch(getUrl(finalPassword), options);

  if (response.ok) {
    storePassword(finalPassword);
    return response;
  }

  if (response.status === 401) {
    storePassword(null);
    const userPassword = promptForPassword();
    if (!userPassword) {
      throw new Error('Password is required to access lumpsum data');
    }

    const retryOptions = { ...options };
    if (options.body && typeof options.body === 'string') {
      retryOptions.body = options.body;
    }

    response = await fetch(getUrl(userPassword), retryOptions);
    if (!response.ok) {
      throw new Error('Invalid password or corrupted data');
    }

    storePassword(userPassword);
    return response;
  }

  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
}

export async function getLumpsum(password = null) {
  const storedPassword = password || getStoredPassword();
  const response = await fetchWithPassword('/api/lumpsum', {}, storedPassword);
  return response.json();
}

export async function updateLumpsum(lumpsumData, password = null) {
  const storedPassword = password || getStoredPassword();
  const response = await fetchWithPassword(
    '/api/lumpsum',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lumpsumData),
    },
    storedPassword
  );
  return response.json();
}
