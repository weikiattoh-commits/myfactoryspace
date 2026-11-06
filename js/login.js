document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    // 8-Hour Maximum Session Lifetime Check
    const MAX_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 Hours Max
    const sessionTime = parseInt(localStorage.getItem('login_session_time') || '0', 10);
    if (sessionTime > 0 && (Date.now() - sessionTime > MAX_SESSION_DURATION)) {
        // Session expired - clear stored auth data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('login_session_time');
        sessionStorage.clear();
    }

    // If already authenticated and session is valid, redirect to dashboard
    if (sessionStorage.getItem('isAuthenticated') === 'true' || localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    // Rate Limiting & Lockout Check
    let lockoutInterval = null;
    function checkLockout() {
        const lockoutUntil = parseInt(localStorage.getItem('login_lockout_until') || '0', 10);
        const now = Date.now();
        if (lockoutUntil > now) {
            const remainingSecs = Math.ceil((lockoutUntil - now) / 1000);
            if (submitBtn) submitBtn.disabled = true;
            if (errorMsg) {
                errorMsg.textContent = `Too many failed attempts. Security lockout active. Please wait ${remainingSecs}s.`;
                errorMsg.classList.add('show');
            }
            if (!lockoutInterval) {
                lockoutInterval = setInterval(() => {
                    checkLockout();
                }, 1000);
            }
            return true;
        } else {
            if (lockoutInterval) {
                clearInterval(lockoutInterval);
                lockoutInterval = null;
            }
            if (submitBtn) submitBtn.disabled = false;
            if (errorMsg && errorMsg.textContent.includes('lockout active')) {
                errorMsg.classList.remove('show');
                errorMsg.textContent = 'Invalid username or password.';
            }
            return false;
        }
    }

    checkLockout();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (checkLockout()) return;

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            errorMsg.textContent = 'Please enter both username and password.';
            errorMsg.classList.add('show');
            return;
        }

        let authenticatedUser = null;

        // 1. Try Supabase Authentication first
        if (window.IndustraSupabase && typeof window.IndustraSupabase.authenticateUser === 'function') {
            try {
                const sbUser = await window.IndustraSupabase.authenticateUser(username, password);
                if (sbUser) {
                    authenticatedUser = sbUser;
                }
            } catch (err) {
                console.warn('Supabase auth check failed, falling back to local storage:', err);
            }
        }

        // 2. Local Storage Fallback
        if (!authenticatedUser) {
            let users = JSON.parse(localStorage.getItem('industria_users'));
            if (!users) {
                users = [{username: 'admin', password: 'admin123'}];
                localStorage.setItem('industria_users', JSON.stringify(users));
            }
            authenticatedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        }

        if (authenticatedUser) {
            // Reset brute force counter on successful login
            localStorage.removeItem('login_failed_attempts');
            localStorage.removeItem('login_lockout_until');

            const userRole = authenticatedUser.role || (username.toLowerCase() === 'admin' ? 'Administrator' : 'Assistant');
            const loginTime = Date.now().toString();

            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('loggedInUser', authenticatedUser.username || username);
            sessionStorage.setItem('currentUserRole', userRole);
            sessionStorage.setItem('login_session_time', loginTime);

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('loggedInUser', authenticatedUser.username || username);
            localStorage.setItem('currentUserRole', userRole);
            localStorage.setItem('login_session_time', loginTime);
            
            window.location.href = 'dashboard.html';
        } else {
            // Track failed attempts
            let attempts = parseInt(localStorage.getItem('login_failed_attempts') || '0', 10) + 1;
            localStorage.setItem('login_failed_attempts', attempts.toString());

            if (attempts >= 5) {
                // Lock out for 60 seconds after 5 failed attempts
                const lockoutUntil = Date.now() + 60000;
                localStorage.setItem('login_lockout_until', lockoutUntil.toString());
                localStorage.setItem('login_failed_attempts', '0');
                checkLockout();
            } else {
                errorMsg.textContent = `Invalid username or password. (${5 - attempts} attempt${5 - attempts > 1 ? 's' : ''} left)`;
                errorMsg.classList.add('show');
            }

            // Shake animation for the login card
            const card = document.querySelector('.login-card');
            if (card) {
                card.style.animation = 'none';
                card.offsetHeight; // trigger reflow
                card.style.animation = 'shake 0.4s ease-in-out';
            }
        }
    });
});

// Add shake animation to the document dynamically
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    50% { transform: translateX(10px); }
    75% { transform: translateX(-10px); }
}
`;
document.head.appendChild(style);
