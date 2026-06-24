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
  return window.prompt('Enter password to access cash flow data:');
}

async function fetchWithPassword(url, options = {}, password = null) {
  let finalPassword = password;
  if (!finalPassword) {
    const userPassword = promptForPassword();
    if (!userPassword) {
      throw new Error('Password is required to access cash flow data');
    }
    finalPassword = userPassword;
  }

  const appendPassword = (pwd) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}password=${encodeURIComponent(pwd)}`;
  };

  let response = await fetch(appendPassword(finalPassword), options);

  if (response.ok) {
    storePassword(finalPassword);
    return response;
  }

  if (response.status === 401) {
    storePassword(null);
    const userPassword = promptForPassword();
    if (!userPassword) {
      throw new Error('Password is required to access cash flow data');
    }

    const retryOptions = { ...options };
    if (options.body && typeof options.body === 'string') {
      retryOptions.body = options.body;
    }

    response = await fetch(appendPassword(userPassword), retryOptions);
    if (!response.ok) {
      throw new Error('Invalid password or corrupted data');
    }

    storePassword(userPassword);
    return response;
  }

  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || `API request failed with status ${response.status}`);
}

export async function getCashFlow(password = null) {
  const storedPassword = password || getStoredPassword();
  const response = await fetchWithPassword('/api/cashflow', {}, storedPassword);
  return response.json();
}

export async function addCashFlow(transaction, password = null) {
  const storedPassword = password || getStoredPassword();
  const response = await fetchWithPassword(
    '/api/cashflow',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    },
    storedPassword
  );
  return response.json();
}

export async function deleteCashFlow(id, password = null) {
  const storedPassword = password || getStoredPassword();
  const response = await fetchWithPassword(
    `/api/cashflow?id=${encodeURIComponent(id)}`,
    { method: 'DELETE' },
    storedPassword
  );
  return response.json();
}
