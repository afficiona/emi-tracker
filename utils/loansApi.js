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

function promptForPassword(label = 'loans') {
  return window.prompt(`Enter password to decrypt ${label} data:`);
}

async function fetchWithPassword(url, options = {}, password = null, label = 'loans') {
  let finalPassword = password;
  if (!finalPassword) {
    const userPassword = promptForPassword(label);
    if (!userPassword) {
      throw new Error(`Password is required to access ${label} data`);
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
    const userPassword = promptForPassword(label);
    if (!userPassword) {
      throw new Error(`Password is required to access ${label} data`);
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
  throw new Error(errorData.error || `API request failed with status ${response.status}`);
}

export async function getLoans() {
  const storedPassword = getStoredPassword();
  const response = await fetchWithPassword('/api/loans', {}, storedPassword, 'loans');
  return response.json();
}

export async function updateLoans(loansData) {
  const storedPassword = getStoredPassword();
  const response = await fetchWithPassword(
    '/api/loans',
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loansData),
    },
    storedPassword,
    'loans'
  );
  return response.json();
}

export async function resetLoans(resetCode) {
  const storedPassword = getStoredPassword();
  const response = await fetchWithPassword(
    '/api/loans/reset',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetCode }),
    },
    storedPassword,
    'loans'
  );
  return response.json();
}

export async function verifyAccessCode(code) {
  const response = await fetch('/api/loans/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (response.ok) return;

  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.error || `API request failed with status ${response.status}`);
}
