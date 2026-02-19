// Password protection for the portfolio site.
// To change the password, update STORED_HASH with the SHA-256 hex of your new password.
const STORED_HASH = '06670ae47e9dcae627053c4387f3f74ec68fdc9e6bd7554ce58f2fa862366702';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleLogin(event) {
  event.preventDefault();
  const input = document.getElementById('password-input');
  const error = document.getElementById('error-msg');
  const hash = await hashPassword(input.value);
  if (hash === STORED_HASH) {
    sessionStorage.setItem('auth', STORED_HASH);
    window.location.href = 'portfolio.html';
  } else {
    error.style.opacity = '1';
    input.value = '';
    input.focus();
  }
}

// Called on protected pages to redirect to login if not authenticated
function requireAuth() {
  if (sessionStorage.getItem('auth') !== STORED_HASH) {
    window.location.replace('index.html');
  }
}
