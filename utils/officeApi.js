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
  const password = window.prompt('Enter password to decrypt office data:');
  return password;
}

async function fetchWithPassword(url, options = {}, password = null) {
  try {
    let finalPassword = password;
    if (!finalPassword) {
      const userPassword = promptForPassword();
      if (!userPassword) {
        throw new Error('Password is required to access office data');
      }
      finalPassword = userPassword;
      storePassword(userPassword);
    }
    
    const getUrl = (pwd) => `${url}?password=${encodeURIComponent(pwd)}`;
    
    const response = await fetch(getUrl(finalPassword), options);
    
    if (response.ok) {
      return response;
    }
    
    if (response.status === 401) {
      throw new Error('Invalid password');
    }
    
    throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getOffice(password = null) {
  try {
    const storedPassword = password || getStoredPassword();
    const response = await fetchWithPassword('/api/office', {}, storedPassword);
    return await response.json();
  } catch (error) {
    console.error('Error fetching office data:', error);
    throw error;
  }
}

export async function updateOffice(officeData, password = null) {
  try {
    const storedPassword = password || getStoredPassword();
    const response = await fetchWithPassword(
      '/api/office',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(officeData),
      },
      storedPassword
    );
    return await response.json();
  } catch (error) {
    console.error('Error updating office data:', error);
    throw error;
  }
}
