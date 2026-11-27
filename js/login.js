document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const capsLockWarning = document.getElementById('caps-lock-warning');
    const errorBanner = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');
    const errorIcon = document.getElementById('login-error-icon');
    const lockoutBarFill = document.getElementById('lockout-bar-fill');
    const sessionNotice = document.getElementById('session-notice');
    const submitBtn = document.getElementById('login-submit') || (loginForm && loginForm.querySelector('button[type="submit"]'));
    const loginCard = document.querySelector('.login-card');

    if (!loginForm || !usernameInput || !passwordInput) return;

    const LOCKOUT_DURATION_MS = 60 * 1000;
    const MAX_ATTEMPTS = 5;
    let isSubmitting = false;

    // =========================================================================
    // 1. 8-Hour Maximum Session Lifetime Check & Active Session Redirect
    // =========================================================================
    const MAX_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 Hours Max
    const sessionTime = parseInt(localStorage.getItem('login_session_time') || '0', 10);
    if (sessionTime > 0 && (Date.now() - sessionTime > MAX_SESSION_DURATION)) {
        // Session expired - clear stored auth data and notify user clearly
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('login_session_time');
        sessionStorage.clear();
        if (sessionNotice) {
            sessionNotice.classList.add('show');
        }
    }

    // If already authenticated and session is valid, redirect to dashboard
    if (sessionStorage.getItem('isAuthenticated') === 'true' || localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    // Hydrate live company logo & colors from Supabase on fresh browsers / mobile devices
    (async function syncLoginBrandingFromSupabase(hasReSynced = false) {
        const sb = window.IndustraSupabase;
        if (!sb || typeof sb.fetchSiteSetting !== 'function') return;
        try {
            if (typeof sb.ensurePublicConfigLoaded === 'function') {
                await sb.ensurePublicConfigLoaded();
            }
            const prevUrl = typeof sb.getActiveDbUrl === 'function' ? sb.getActiveDbUrl() : '';
            const sbGeneral = await sb.fetchSiteSetting('general_settings');
            if (!sbGeneral || typeof sbGeneral !== 'object') return;
            try { localStorage.setItem('industria_settings', JSON.stringify(sbGeneral)); } catch (_) {}
            if (sbGeneral.primarySupabaseCloud && typeof sb.setPrimarySupabaseConfig === 'function') {
                sb.setPrimarySupabaseConfig(sbGeneral.primarySupabaseCloud);
                const nextUrl = typeof sb.getActiveDbUrl === 'function' ? sb.getActiveDbUrl() : '';
                if (!hasReSynced && nextUrl && prevUrl && nextUrl !== prevUrl) {
                    return syncLoginBrandingFromSupabase(true);
                }
            }
            const b = sbGeneral.branding;
            if (!b || typeof b !== 'object') return;
            try { localStorage.setItem('industria_branding_settings', JSON.stringify(b)); } catch (_) {}

            const root = document.documentElement;
            if (b.primaryColor) root.style.setProperty('--primary', b.primaryColor);
            if (b.primaryDarkColor) root.style.setProperty('--primary-dark', b.primaryDarkColor);
            if (b.accentColor) root.style.setProperty('--accent', b.accentColor);

            const DEFAULT_LOGO_URL = 'assets/branding/company_logo.png';
            const explicitName = (b.companyName && String(b.companyName).trim() !== '') ? String(b.companyName).trim() : '';
            const explicitLogoUrl = b.logoUrl ? String(b.logoUrl).trim() : '';
            const logoUrl = explicitLogoUrl || (explicitName ? '' : DEFAULT_LOGO_URL);
            const brandTitle = explicitName || 'MyFactorySpace';

            const applyBrandToContainer = (containerId, iconClass, textClass) => {
                const el = document.getElementById(containerId);
                if (!el) return;
                if (logoUrl) {
                    const existingImg = el.querySelector('img');
                    if (existingImg) {
                        existingImg.alt = brandTitle;
                        if (existingImg.getAttribute('src') === logoUrl) return;
                        existingImg.dataset.pendingLogoSrc = logoUrl;
                        const preloader = new Image();
                        const commit = () => {
                            if (!existingImg.isConnected || existingImg.dataset.pendingLogoSrc !== logoUrl) return;
                            if (logoUrl === DEFAULT_LOGO_URL) {
                                existingImg.setAttribute('width', '1140');
                                existingImg.setAttribute('height', '380');
                            } else {
                                existingImg.removeAttribute('width');
                                existingImg.removeAttribute('height');
                            }
                            existingImg.src = logoUrl;
                            delete existingImg.dataset.pendingLogoSrc;
                        };
                        preloader.onload = () => {
                            if (typeof preloader.decode === 'function') {
                                preloader.decode().then(commit, commit);
                            } else {
                                commit();
                            }
                        };
                        preloader.src = logoUrl;
                        if (preloader.complete && preloader.naturalWidth > 0) commit();
                        return;
                    }
                    const fallbackMarkup = el.innerHTML;
                    const preloader = new Image();
                    preloader.onload = () => {
                        el.textContent = '';
                        const img = document.createElement('img');
                        img.src = logoUrl;
                        img.alt = brandTitle;
                        img.addEventListener('error', () => {
                            if (img.getAttribute('src') !== DEFAULT_LOGO_URL) {
                                img.src = DEFAULT_LOGO_URL;
                                return;
                            }
                            el.innerHTML = fallbackMarkup;
                            const txt = el.querySelector('.' + textClass);
                            if (txt) txt.textContent = brandTitle;
                        });
                        el.appendChild(img);
                    };
                    preloader.src = logoUrl;
                } else if (explicitName) {
                    el.innerHTML = `<span class="${iconClass}" aria-hidden="true"><i class="fa-solid fa-industry"></i></span><span class="${textClass}"></span>`;
                    const txt = el.querySelector('.' + textClass);
                    if (txt) txt.textContent = explicitName;
                }
            };

            applyBrandToContainer('showcase-brand', 'showcase-brand-icon', 'showcase-brand-text');
            applyBrandToContainer('mobile-brand', 'mobile-brand-icon', 'mobile-brand-text');

            if (brandTitle && brandTitle !== 'MyFactorySpace') {
                document.title = 'Admin Login | ' + brandTitle;
                const footerMeta = document.getElementById('login-footer-meta');
                if (footerMeta) footerMeta.textContent = brandTitle + ' • Admin & Specialist Portal';
            }
        } catch (_) {}
    })();

    // =========================================================================
    // 2. Password Visibility Toggle (Accessible aria-pressed + Icon Sync)
    // =========================================================================
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const reveal = passwordInput.type === 'password';
            passwordInput.type = reveal ? 'text' : 'password';
            togglePasswordBtn.setAttribute('aria-pressed', reveal ? 'true' : 'false');
            togglePasswordBtn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
            const icon = togglePasswordBtn.querySelector('i');
            if (icon) {
                icon.className = reveal ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
            }
            passwordInput.focus();
        });
    }

    // =========================================================================
    // 3. Caps Lock Indicator on Password Input
    // =========================================================================
    if (capsLockWarning) {
        const updateCapsLock = (event) => {
            if (typeof event.getModifierState === 'function') {
                const isCapsOn = event.getModifierState('CapsLock');
                capsLockWarning.hidden = !isCapsOn;
            }
        };
        passwordInput.addEventListener('keydown', updateCapsLock);
        passwordInput.addEventListener('keyup', updateCapsLock);
        passwordInput.addEventListener('blur', () => {
            capsLockWarning.hidden = true;
        });
    }

    // =========================================================================
    // 4. Accessible :user-invalid ARIA Sync + Older-Browser Fallbacks
    // =========================================================================
    const linkError = (el, shown) => {
        const errorId = el.dataset.error;
        if (!errorId) return;
        const ids = (el.getAttribute('aria-describedby') || '')
            .split(/\s+/)
            .filter((id) => id && id !== errorId);
        if (shown) ids.push(errorId);
        if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
        else el.removeAttribute('aria-describedby');
    };

    // Single polite live region for announcing post-interaction field errors
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.classList.add('visually-hidden');
    document.body.append(announcer);
    let announceTimer;
    let announcedField;

    const spokenText = (node) => {
        const copy = node.cloneNode(true);
        copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
        copy.querySelectorAll('[role="img"][aria-label]').forEach((n) => {
            n.replaceWith(`${n.getAttribute('aria-label')}: `);
        });
        return copy.textContent.replace(/\s+/g, ' ').trim();
    };

    const announceError = (el) => {
        const error = document.getElementById(el.dataset.error);
        if (!error) return;
        const label = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : '';
        clearTimeout(announceTimer);
        announcer.textContent = '';
        announcedField = el;
        // Delay slightly so announcement does not collide with the next focused field
        announceTimer = setTimeout(() => {
            announcer.textContent = label + spokenText(error);
        }, 500);
    };

    const supportsUserInvalid = window.CSS?.supports?.('selector(:user-invalid)') ?? false;
    const supportsHas = window.CSS?.supports?.('selector(:has(a))') ?? false;

    const syncParentHasFallback = (el) => {
        if (supportsHas) return;
        const group = el.closest('.form-group');
        if (!group) return;
        const hasError = group.querySelector(
            supportsUserInvalid ? ':is(:user-invalid, .user-invalid-fallback)' : '.user-invalid-fallback'
        );
        group.classList.toggle('has-error-fallback', !!hasError);
    };

    if (supportsUserInvalid) {
        const flagged = new WeakSet();
        const announced = new WeakSet();

        const syncAria = (el, announce = false) => {
            if (!el.matches?.('input, select, textarea')) return;
            const invalid = el.matches(':user-invalid');
            if (invalid) {
                if (announce && !announced.has(el)) {
                    announceError(el);
                    announced.add(el);
                }
                el.setAttribute('aria-invalid', 'true');
                linkError(el, true);
                flagged.add(el);
            } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
                el.setAttribute('aria-invalid', 'false');
                linkError(el, false);
                flagged.delete(el);
                announced.delete(el);
                if (announcedField === el) {
                    clearTimeout(announceTimer);
                    announcer.textContent = '';
                }
            }
            syncParentHasFallback(el);
        };

        // Start every field at aria-invalid="false" so Firefox/Safari don't expose empty required fields as invalid on load
        loginForm.querySelectorAll('input, select, textarea').forEach((el) => syncAria(el));

        loginForm.addEventListener('blur', (e) => syncAria(e.target, true), true);
        loginForm.addEventListener('input', (e) => {
            if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
        });
        loginForm.addEventListener('change', (e) => syncAria(e.target, true), true);
        loginForm.addEventListener('invalid', (e) => {
            // Suppress overlapping browser tooltip bubble while keeping :user-invalid active
            e.preventDefault();
            announced.add(e.target);
            syncAria(e.target);
            // Move focus to the first invalid control so its accessible error is announced
            const firstInvalid = loginForm.querySelector(':invalid');
            if (firstInvalid && e.target === firstInvalid) {
                firstInvalid.focus();
            }
        }, true);
        loginForm.addEventListener('reset', (e) => {
            setTimeout(() => [...e.target.elements].forEach((el) => syncAria(el)));
        }, true);
    } else {
        // WeakMap fallback for browsers without :user-invalid
        const dirtyState = new WeakMap();
        const announced = new WeakSet();

        const updateFallbackState = (input, announce = false) => {
            const isValid = input.validity.valid;
            input.classList.toggle('user-invalid-fallback', !isValid);
            input.classList.toggle('user-valid-fallback', isValid);
            input.setAttribute('aria-invalid', isValid ? 'false' : 'true');
            linkError(input, !isValid);
            if (!isValid && announce && !announced.has(input)) {
                announceError(input);
                announced.add(input);
            } else if (isValid) {
                announced.delete(input);
                if (announcedField === input) {
                    clearTimeout(announceTimer);
                    announcer.textContent = '';
                }
            }
            syncParentHasFallback(input);
        };

        loginForm.querySelectorAll('input, select, textarea').forEach((el) => {
            if (!el.hasAttribute('aria-invalid')) el.setAttribute('aria-invalid', 'false');
        });

        const handleFallbackEvent = (event) => {
            const input = event.target;
            if (event.type === 'reset') {
                for (const control of (input.elements || [])) {
                    dirtyState.delete(control);
                    announced.delete(control);
                    control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
                    if (control.matches?.('input, select, textarea')) control.setAttribute('aria-invalid', 'false');
                    if (control.dataset?.error) linkError(control, false);
                    syncParentHasFallback(control);
                }
                return;
            }
            if (!input.checkValidity) return;

            if (event.type === 'invalid') {
                event.preventDefault();
                dirtyState.set(input, { hasInteracted: true, hasBlurred: true });
                announced.add(input);
                updateFallbackState(input, false);
                const firstInvalid = loginForm.querySelector(':invalid');
                if (firstInvalid && input === firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }
            if (event.type === 'input' || event.type === 'change') {
                const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
                state.hasInteracted = true;
                dirtyState.set(input, state);
                if (state.hasBlurred) updateFallbackState(input, event.type === 'change');
            } else if (event.type === 'blur') {
                const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
                state.hasBlurred = true;
                dirtyState.set(input, state);
                if (state.hasInteracted) updateFallbackState(input, true);
            }
        };

        loginForm.addEventListener('blur', handleFallbackEvent, true);
        loginForm.addEventListener('input', handleFallbackEvent);
        loginForm.addEventListener('change', handleFallbackEvent);
        loginForm.addEventListener('invalid', handleFallbackEvent, true);
        loginForm.addEventListener('reset', handleFallbackEvent, true);
    }

    // =========================================================================
    // 5. Native Account Help <dialog> (Light-Dismiss & Top-Layer Exit Fallbacks)
    // =========================================================================
    const helpDialog = document.getElementById('login-help-dialog');
    const openHelpBtn = document.getElementById('open-help-dialog');

    if (helpDialog && openHelpBtn) {
        let supportsDisplayTransition;
        const canTransitionDisplay = () => {
            if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
            if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
                return false;
            }
            const probe = document.createElement('div');
            probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
            document.body.appendChild(probe);
            getComputedStyle(probe).display;
            probe.style.display = 'none';
            supportsDisplayTransition = getComputedStyle(probe).display === 'block';
            probe.remove();
            return supportsDisplayTransition;
        };

        const supportsTopLayerExit = () =>
            Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());

        const closeTopLayer = async (dialogEl) => {
            if (!dialogEl.open) return;
            if (!supportsTopLayerExit()) {
                dialogEl.setAttribute('data-closing', '');
                const animations = dialogEl.getAnimations ? dialogEl.getAnimations({ subtree: true }) : [];
                if (animations.length > 0) {
                    await Promise.race([
                        Promise.allSettled(animations.map((a) => a.finished)),
                        new Promise((r) => setTimeout(r, 600))
                    ]);
                }
                if (!dialogEl.hasAttribute('data-closing')) return;
                dialogEl.removeAttribute('data-closing');
            }
            dialogEl.close();
        };

        openHelpBtn.addEventListener('click', () => {
            helpDialog.removeAttribute('data-closing');
            if (typeof helpDialog.showModal === 'function') {
                helpDialog.showModal();
            } else {
                helpDialog.setAttribute('open', '');
            }
        });

        helpDialog.querySelectorAll('[data-close-help]').forEach((btn) => {
            btn.addEventListener('click', () => closeTopLayer(helpDialog));
        });

        helpDialog.addEventListener('cancel', (event) => {
            event.preventDefault();
            closeTopLayer(helpDialog);
        });

        // Fallback for browsers without <dialog closedby="any"> support (e.g. Safari)
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            helpDialog.addEventListener('click', (event) => {
                if (event.target !== helpDialog) return;
                const rect = helpDialog.getBoundingClientRect();
                const inside =
                    rect.top <= event.clientY &&
                    event.clientY <= rect.top + rect.height &&
                    rect.left <= event.clientX &&
                    event.clientX <= rect.left + rect.width;
                if (!inside) {
                    closeTopLayer(helpDialog);
                }
            });
        }
    }

    // =========================================================================
    // 6. Button State Helpers & Error Banner Helpers
    // =========================================================================
    const setSubmitState = (mode) => {
        if (!submitBtn) return;
        if (mode === 'loading') {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
            submitBtn.innerHTML =
                '<progress class="loading-spinner" aria-label="Signing in"></progress>' +
                '<span class="btn-label">Signing in…</span>';
        } else if (mode === 'success') {
            submitBtn.disabled = true;
            submitBtn.removeAttribute('aria-busy');
            submitBtn.innerHTML =
                '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>' +
                '<span class="btn-label">Signed in — Redirecting…</span>';
        } else {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            submitBtn.innerHTML =
                '<span class="btn-label">Sign In</span>' +
                '<i class="fa-solid fa-arrow-right btn-arrow" aria-hidden="true"></i>';
        }
    };

    const showErrorBanner = (message, options = {}) => {
        if (!errorBanner || !errorText) return;
        const isLockout = !!options.lockout;
        errorText.textContent = message;
        errorBanner.classList.toggle('is-lockout', isLockout);
        if (errorIcon) {
            errorIcon.className = isLockout
                ? 'fa-solid fa-lock status-banner-icon'
                : 'fa-solid fa-circle-exclamation status-banner-icon';
        }
        errorBanner.classList.add('show');
    };

    const hideErrorBanner = () => {
        if (!errorBanner) return;
        errorBanner.classList.remove('show', 'is-lockout');
    };

    const triggerCardShake = () => {
        if (!loginCard) return;
        if (window.matchMedia && !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
            return;
        }
        loginCard.classList.remove('is-shaking');
        void loginCard.offsetWidth; // trigger reflow
        loginCard.classList.add('is-shaking');
        const animations = loginCard.getAnimations ? loginCard.getAnimations() : [];
        if (animations.length > 0) {
            Promise.allSettled(animations.map((a) => a.finished)).then(() => {
                loginCard.classList.remove('is-shaking');
            });
        } else {
            loginCard.classList.remove('is-shaking');
        }
    };

    // =========================================================================
    // 7. Rate Limiting & Lockout Check (Live Countdown + Progress Bar)
    // =========================================================================
    let lockoutInterval = null;

    function checkLockout() {
        const lockoutUntil = parseInt(localStorage.getItem('login_lockout_until') || '0', 10);
        const now = Date.now();
        if (lockoutUntil > now) {
            const remainingMs = lockoutUntil - now;
            const remainingSecs = Math.ceil(remainingMs / 1000);
            if (submitBtn) submitBtn.disabled = true;
            showErrorBanner(
                `Too many failed attempts. Security lockout active — try again in ${remainingSecs}s.`,
                { lockout: true }
            );
            if (lockoutBarFill) {
                const ratio = Math.max(0, Math.min(1, remainingMs / LOCKOUT_DURATION_MS));
                lockoutBarFill.style.transform = `scaleX(${ratio})`;
            }
            if (!lockoutInterval) {
                lockoutInterval = setInterval(() => {
                    checkLockout();
                }, 500);
            }
            return true;
        } else {
            if (lockoutInterval) {
                clearInterval(lockoutInterval);
                lockoutInterval = null;
            }
            if (!isSubmitting && submitBtn) {
                submitBtn.disabled = false;
            }
            if (errorBanner && errorBanner.classList.contains('is-lockout')) {
                hideErrorBanner();
                if (errorText) errorText.textContent = 'Invalid username or password.';
            }
            return false;
        }
    }

    checkLockout();

    // Clear stale credential errors as soon as the user begins editing either field
    [usernameInput, passwordInput].forEach((input) => {
        input.addEventListener('input', () => {
            input.setCustomValidity('');
            if (errorBanner && !errorBanner.classList.contains('is-lockout')) {
                hideErrorBanner();
            }
        });
    });

    // =========================================================================
    // 8. Form Submission & Authentication Flow
    // =========================================================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmitting || checkLockout()) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Guard against whitespace-only username
        if (!username) {
            usernameInput.value = '';
            usernameInput.reportValidity();
            usernameInput.focus();
            return;
        }

        if (!password) {
            passwordInput.reportValidity();
            passwordInput.focus();
            return;
        }

        isSubmitting = true;
        hideErrorBanner();
        if (sessionNotice) sessionNotice.classList.remove('show');
        setSubmitState('loading');

        let authenticatedUser = null;

        try {
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
                    users = [{ username: 'admin', password: 'admin123' }];
                    localStorage.setItem('industria_users', JSON.stringify(users));
                }
                authenticatedUser = users.find(
                    (u) => u && u.username && u.username.toLowerCase() === username.toLowerCase() && u.password === password
                );
            }

            if (authenticatedUser) {
                // Reset brute force counter on successful login
                localStorage.removeItem('login_failed_attempts');
                localStorage.removeItem('login_lockout_until');

                const resolvedUsername = authenticatedUser.username || username;
                const userRole = authenticatedUser.role || (resolvedUsername.toLowerCase() === 'admin' ? 'Administrator' : 'Assistant');
                const loginTime = Date.now().toString();
                const specs = (authenticatedUser.specs && typeof authenticatedUser.specs === 'object') ? authenticatedUser.specs : authenticatedUser;
                const linkedAgentId = authenticatedUser.agent_id || authenticatedUser.agentId || specs.agentId || null;
                const isEntrySupport = String(userRole).trim().toLowerCase() === 'entry support';
                const isBuiltinAdmin = resolvedUsername.trim().toLowerCase() === 'admin';
                const needsAgentSetup = !isEntrySupport &&
                    !linkedAgentId &&
                    specs.agentProfileCompleted !== true &&
                    (
                        specs.requiresAgentProfileSetup === true ||
                        authenticatedUser.requiresAgentProfileSetup === true ||
                        !isBuiltinAdmin
                    );

                try {
                    const cachedUsers = JSON.parse(localStorage.getItem('industria_users') || '[]');
                    if (Array.isArray(cachedUsers)) {
                        const normalizedUser = Object.assign({}, specs, {
                            id: authenticatedUser.id || specs.id,
                            username: authenticatedUser.username || username,
                            password: authenticatedUser.password || password,
                            role: userRole,
                            agentId: linkedAgentId ? (isNaN(linkedAgentId) ? linkedAgentId : Number(linkedAgentId)) : null,
                            whatsapp: authenticatedUser.whatsapp || specs.whatsapp || '',
                            requiresAgentProfileSetup: needsAgentSetup,
                            agentProfileCompleted: specs.agentProfileCompleted === true || !!linkedAgentId
                        });
                        const idx = cachedUsers.findIndex(
                            (u) => u && u.username && u.username.toLowerCase() === normalizedUser.username.toLowerCase()
                        );
                        if (idx > -1) cachedUsers[idx] = Object.assign({}, cachedUsers[idx], normalizedUser);
                        else cachedUsers.push(normalizedUser);
                        localStorage.setItem('industria_users', JSON.stringify(cachedUsers));
                    }
                } catch (syncErr) {}

                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('loggedInUser', authenticatedUser.username || username);
                sessionStorage.setItem('currentUserRole', userRole);
                sessionStorage.setItem('login_session_time', loginTime);
                sessionStorage.setItem('requiresAgentProfileSetup', needsAgentSetup ? 'true' : 'false');

                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('loggedInUser', authenticatedUser.username || username);
                localStorage.setItem('currentUserRole', userRole);
                localStorage.setItem('login_session_time', loginTime);
                localStorage.setItem('requiresAgentProfileSetup', needsAgentSetup ? 'true' : 'false');

                try {
                    const loginEntry = {
                        id: 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                        createdAt: new Date().toISOString(),
                        actorUsername: authenticatedUser.username || username,
                        actorRole: userRole,
                        category: 'Authentication',
                        action: 'Login',
                        target: authenticatedUser.username || username,
                        details: 'Signed into Dashboard (' + userRole + ')' + (needsAgentSetup ? ' — First-login agent setup required' : '')
                    };
                    const existingLogs = JSON.parse(localStorage.getItem('industria_activity_logs') || '[]');
                    const updatedLogs = Array.isArray(existingLogs) ? existingLogs : [];
                    updatedLogs.unshift(loginEntry);
                    localStorage.setItem('industria_activity_logs', JSON.stringify(updatedLogs.slice(0, 300)));
                    sessionStorage.setItem('__pending_login_activity', JSON.stringify(loginEntry));
                } catch (logErr) {}

                setSubmitState('success');
                window.location.href = 'dashboard.html';
                return;
            }

            // Failed credentials handling
            isSubmitting = false;
            setSubmitState('idle');

            const attempts = parseInt(localStorage.getItem('login_failed_attempts') || '0', 10) + 1;
            localStorage.setItem('login_failed_attempts', attempts.toString());

            if (attempts >= MAX_ATTEMPTS) {
                const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                localStorage.setItem('login_lockout_until', lockoutUntil.toString());
                localStorage.setItem('login_failed_attempts', '0');
                checkLockout();
            } else {
                const remaining = MAX_ATTEMPTS - attempts;
                showErrorBanner(
                    `Invalid username or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining before a 60-second lockout.`
                );
                passwordInput.focus();
                passwordInput.select();
            }

            triggerCardShake();
        } catch (unexpectedErr) {
            console.error('Unexpected login error:', unexpectedErr);
            isSubmitting = false;
            setSubmitState('idle');
            showErrorBanner('Unable to sign in right now. Please check your connection and try again.');
        }
    });
});
