const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const feedback = document.getElementById('feedback');
const strengthBar = document.getElementById('strength-bar');
const togglePassword = document.getElementById('toggle-password');
const suggestions = document.getElementById('suggestions');
const hashedPasswordDiv = document.getElementById('hashed-password');
const breachList = document.getElementById('breach-list');
const entropyDisplay = document.getElementById('entropy-display');
const matchFeedback = document.getElementById('match-feedback');

const proxyUrl = "https://api.allorigins.win/raw?url=";
const apiUrl = "https://newsapi.org/v2/everything?q=data%20breach&apiKey=5725a7aaccaf45c782f3c625d3186f93";

async function fetchBreachNews() {
    try {
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        const data = await response.json();

        console.log("API Response:", data);

        if (!data.articles || data.articles.length === 0) {
            breachList.innerHTML = '<li>No recent breach news available.</li>';
            return;
        }

        displayBreachNews(data.articles);
    } catch (error) {
        breachList.innerHTML = `<li>Failed to load breach data: ${error.message}</li>`;
        console.error("Error fetching breach news:", error);
    }
}

function displayBreachNews(articles) {
  breachList.innerHTML = articles.slice(0, 5).map(article =>
      `<li><a href="${article.url}" target="_blank">${article.title}</a> - ${article.source.name}</li>`
  ).join('');
}

fetchBreachNews();


// Common passwords list
const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123'];

// Toggle password visibility
togglePassword.addEventListener('change', () => {
  const type = togglePassword.checked ? 'text' : 'password';
  passwordInput.type = type;
  confirmPasswordInput.type = type;
});

// Main password input event
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  updateStrength(password);    // Check strength
  hashPassword(password);      // Hash password separately
  displayEntropy(password);    // Check entropy
  validatePasswordMatch();     // Confirm password match
});

confirmPasswordInput.addEventListener('input', validatePasswordMatch);

// Validate password match
function validatePasswordMatch() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  if (confirmPassword) {
      matchFeedback.innerHTML = password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match';
      matchFeedback.style.color = password === confirmPassword ? 'green' : 'red';
  } else {
      matchFeedback.innerHTML = '';
  }
}

passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  updateStrength(password);
  hashPassword(password);
  displayEntropy(password);
  validatePasswordMatch();
});

// Evaluate password strength
function updateStrength(password) {
    if (checkCommonPassword(password)) {
        feedback.innerHTML = 'Password is too common! Choose a stronger one.';
        feedback.style.color = 'red';
        strengthBar.value = 0;
        suggestions.innerHTML = getSuggestions(password, true);
        return;
    }

    const strengthScore = getStrengthScore(password);
    strengthBar.value = strengthScore;
    feedback.innerHTML = `Strength: ${evaluatePassword(strengthScore)}`;
    strengthBar.className = getStrengthClass(strengthScore);
    suggestions.innerHTML = getSuggestions(password, false);
}

// Hash the password asynchronously
async function hashPassword(password) {
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        hashedPasswordDiv.innerHTML = `Hashed Password: ${hashedPassword}`;
    } else {
        hashedPasswordDiv.innerHTML = '';
    }
}

// Display password entropy
function displayEntropy(password) {
  const entropy = calculateEntropy(password);
  document.getElementById('entropy-display').innerHTML = `Entropy: ${entropy.toFixed(2)} bits`;
}

// Calculate entropy based on character variety and length
function calculateEntropy(password) {
  let charSetSize = 0;
  if (/[a-z]/.test(password)) charSetSize += 26;
  if (/[A-Z]/.test(password)) charSetSize += 26;
  if (/[0-9]/.test(password)) charSetSize += 10;
  if (/\W/.test(password)) charSetSize += 32;

  return password.length * Math.log2(charSetSize);
}


// Check if password is common
function checkCommonPassword(password) {
    return commonPasswords.includes(password);
}

// Get strength score (0 to 4)
function getStrengthScore(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[\W_]/.test(password)) score++;
    return Math.min(score, 4);
}

// Map score to strength labels
function evaluatePassword(score) {
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score >= 3) return 'Strong';
}

// Apply CSS class based on strength
function getStrengthClass(score) {
    if (score <= 1) return 'weak';
    if (score === 2) return 'fair';
    return 'strong';
}

// Provide suggestions to improve password
function getSuggestions(password, isCommon) {
    const suggestions = [];
    if (isCommon) suggestions.push('Avoid common passwords like "123456".');
    if (password.length < 8) suggestions.push('Use at least 8 characters.');
    if (!/[A-Z]/.test(password)) suggestions.push('Add an uppercase letter.');
    if (!/[a-z]/.test(password)) suggestions.push('Add a lowercase letter.');
    if (!/[0-9]/.test(password)) suggestions.push('Add a number.');
    if (!/[\W_]/.test(password)) suggestions.push('Add a special character.');

    return suggestions.length
        ? `<ul><li>${suggestions.join('</li><li>')}</li></ul>`
        : 'Your password is strong!';
}

// Create the entropy display element
if (!document.getElementById('entropy-display')) {
  const entropyDisplay = document.createElement('div');
  entropyDisplay.id = 'entropy-display';
  hashedPasswordDiv.parentNode.insertBefore(entropyDisplay, hashedPasswordDiv.nextSibling);
}


