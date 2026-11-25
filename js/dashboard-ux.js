/* ==========================================================================
   ENTERPRISE CRM UX & ACCESSIBILITY ENHANCEMENT LAYER (js/dashboard-ux.js)
   Non-destructive progressive polish for Dashboard/CRM views, tables,
   tabs, modals, native dialogs, and all forms.
   ========================================================================== */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initSidebarBrandGuard();
        initModalAndDialogUX();
        initFormValidationAndAria();
        initAccessibleTablesAndEmptyStates();
        initSettingsTabsUX();
        initPasswordToggleAria();
        initParkRoadGridFallback();
    });

    // =========================================================================
    // 1. Sidebar Brand Image Fallback (Prevents broken image / "Bi" clipping)
    // =========================================================================
    function initSidebarBrandGuard() {
        const brandEl = document.getElementById('main-sidebar-brand');
        if (!brandEl) return;

        const getBrandTitle = () => {
            try {
                const raw = localStorage.getItem('industria_branding_settings');
                const b = raw ? JSON.parse(raw) : null;
                if (b && b.companyName && String(b.companyName).trim()) {
                    return String(b.companyName).trim();
                }
            } catch (_) {}
            return 'MyFactorySpace';
        };

        const applyFallback = () => {
            if (brandEl.dataset.fallbackApplied === 'true') return;
            const title = getBrandTitle();
            brandEl.dataset.fallbackApplied = 'true';
            brandEl.innerHTML =
                '<span class="sidebar-brand-fallback-badge" aria-hidden="true">' +
                '<i class="fa-solid fa-industry"></i></span>' +
                '<span>' + escapeHtmlText(title) + '</span>';
        };

        const checkImg = () => {
            const img = brandEl.querySelector('img');
            if (!img) return;
            brandEl.dataset.fallbackApplied = 'false';
            if (img.complete && img.naturalWidth === 0) {
                applyFallback();
                return;
            }
            img.addEventListener('error', applyFallback, { once: true });
        };

        checkImg();

        const observer = new MutationObserver(() => {
            const img = brandEl.querySelector('img');
            if (img) checkImg();
        });
        observer.observe(brandEl, { childList: true, subtree: true });
    }

    function escapeHtmlText(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // =========================================================================
    // 2. Modal & Dialog UX (Scroll Lock, Mobile Nav Deferral, Esc, Safari Fallback)
    // =========================================================================
    function initModalAndDialogUX() {
        const syncModalOpenState = () => {
            const anyOverlayOpen = !!document.querySelector('.modal-overlay.active');
            const anyDialogOpen = !!document.querySelector('dialog[open]');
            document.body.classList.toggle('crm-modal-open', anyOverlayOpen || anyDialogOpen);
        };

        // Mark modal bodies that contain a sticky footer (fallback for browsers without :has())
        document.querySelectorAll('.modal-body').forEach((body) => {
            if (body.querySelector('.modal-action-footer')) {
                body.classList.add('has-sticky-footer');
            }
        });

        // Observe .modal-overlay active class and <dialog open> attribute changes
        const modalObserver = new MutationObserver(syncModalOpenState);
        document.querySelectorAll('.modal-overlay, dialog').forEach((el) => {
            modalObserver.observe(el, { attributes: true, attributeFilter: ['class', 'open', 'style'] });
        });
        syncModalOpenState();

        // Escape key closes topmost active .modal-overlay (except mandatory onboarding)
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            // Native <dialog open> handles Esc itself
            if (document.querySelector('dialog[open]')) return;

            const openOverlays = Array.from(document.querySelectorAll('.modal-overlay.active')).filter(
                (el) => getComputedStyle(el).display !== 'none'
            );
            if (!openOverlays.length) return;

            // Pick the highest z-index active modal overlay
            openOverlays.sort((a, b) => {
                const za = parseInt(getComputedStyle(a).zIndex || '1000', 10) || 1000;
                const zb = parseInt(getComputedStyle(b).zIndex || '1000', 10) || 1000;
                return zb - za;
            });

            const topModal = openOverlays[0];
            if (topModal.id === 'agent-modal' && topModal.classList.contains('mandatory-onboarding')) {
                return; // Respect mandatory first-login agent onboarding lock
            }

            const closeBtn = topModal.querySelector('.close-modal, [id*="close-"][id*="modal"], [aria-label*="Close"]');
            if (closeBtn && typeof closeBtn.click === 'function') {
                closeBtn.click();
            } else {
                topModal.classList.remove('active');
                if (topModal.style.display === 'flex') topModal.style.display = 'none';
                syncModalOpenState();
            }
        });

        // Safari light-dismiss fallback for <dialog closedby="any">
        if (!('closedBy' in HTMLDialogElement.prototype)) {
            document.querySelectorAll('dialog[closedby="any"]').forEach((dialogEl) => {
                dialogEl.addEventListener('click', (event) => {
                    if (event.target !== dialogEl) return;
                    const rect = dialogEl.getBoundingClientRect();
                    const inside =
                        rect.top <= event.clientY &&
                        event.clientY <= rect.top + rect.height &&
                        rect.left <= event.clientX &&
                        event.clientX <= rect.left + rect.width;
                    if (!inside) {
                        dialogEl.close();
                    }
                });
            });
        }
    }

    // =========================================================================
    // 3. Global Post-Interaction Form Validation & ARIA Synchronization
    // =========================================================================
    function initFormValidationAndAria() {
        const supportsUserInvalid = window.CSS?.supports?.('selector(:user-invalid)') ?? false;
        const supportsHas = window.CSS?.supports?.('selector(:has(a))') ?? false;

        const syncParentError = (el) => {
            if (supportsHas) return;
            const group = el.closest('.form-group, .pwd-form-group');
            if (!group) return;
            const invalidField = group.querySelector(
                supportsUserInvalid ? ':is(:user-invalid, .user-invalid-fallback)' : '.user-invalid-fallback'
            );
            group.classList.toggle('has-error-fallback', !!invalidField);
        };

        const isTrackableField = (el) => {
            if (!el || !el.matches) return false;
            return el.matches('input:not([type="hidden"]):not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), select, textarea');
        };

        const initFieldAria = (root) => {
            root.querySelectorAll('input, select, textarea').forEach((el) => {
                if (isTrackableField(el) && !el.hasAttribute('aria-invalid')) {
                    el.setAttribute('aria-invalid', 'false');
                }
            });
        };

        initFieldAria(document);

        if (supportsUserInvalid) {
            const flagged = new WeakSet();

            const syncAria = (el) => {
                if (!isTrackableField(el)) return;
                const invalid = el.matches(':user-invalid');
                if (invalid) {
                    el.setAttribute('aria-invalid', 'true');
                    flagged.add(el);
                } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
                    el.setAttribute('aria-invalid', 'false');
                    flagged.delete(el);
                }
                syncParentError(el);
            };

            document.addEventListener('blur', (e) => syncAria(e.target), true);
            document.addEventListener('input', (e) => {
                if (e.target && e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) {
                    syncAria(e.target);
                }
            });
            document.addEventListener('change', (e) => syncAria(e.target), true);
            document.addEventListener('invalid', (e) => syncAria(e.target), true);
            document.addEventListener('reset', (e) => {
                const form = e.target;
                if (!form || !form.elements) return;
                setTimeout(() => {
                    Array.from(form.elements).forEach((el) => syncAria(el));
                }, 0);
            }, true);
        } else {
            // WeakMap fallback for browsers without :user-invalid
            const dirtyState = new WeakMap();

            const updateFallback = (input) => {
                if (!isTrackableField(input) || !input.validity) return;
                const isValid = input.validity.valid;
                input.classList.toggle('user-invalid-fallback', !isValid);
                input.classList.toggle('user-valid-fallback', isValid);
                input.setAttribute('aria-invalid', isValid ? 'false' : 'true');
                syncParentError(input);
            };

            document.addEventListener('blur', (e) => {
                const input = e.target;
                if (!isTrackableField(input)) return;
                const st = dirtyState.get(input) || { interacted: false, blurred: false };
                st.blurred = true;
                dirtyState.set(input, st);
                if (st.interacted) updateFallback(input);
            }, true);

            const onEdit = (e) => {
                const input = e.target;
                if (!isTrackableField(input)) return;
                const st = dirtyState.get(input) || { interacted: false, blurred: false };
                st.interacted = true;
                dirtyState.set(input, st);
                if (st.blurred) updateFallback(input);
            };
            document.addEventListener('input', onEdit);
            document.addEventListener('change', onEdit, true);

            document.addEventListener('invalid', (e) => {
                const input = e.target;
                if (!isTrackableField(input)) return;
                dirtyState.set(input, { interacted: true, blurred: true });
                updateFallback(input);
            }, true);

            document.addEventListener('reset', (e) => {
                const form = e.target;
                if (!form || !form.elements) return;
                Array.from(form.elements).forEach((el) => {
                    dirtyState.delete(el);
                    el.classList.remove('user-invalid-fallback', 'user-valid-fallback');
                    if (isTrackableField(el)) el.setAttribute('aria-invalid', 'false');
                    syncParentError(el);
                });
            }, true);
        }
    }

    // =========================================================================
    // 4. Accessible Scrollable Tables, Address Tooltips & Polished Empty States
    // =========================================================================
    function initAccessibleTablesAndEmptyStates() {
        // Make every .table-responsive keyboard-focusable with region landmark semantics
        document.querySelectorAll('.table-responsive').forEach((wrapper, idx) => {
            if (!wrapper.hasAttribute('tabindex')) {
                wrapper.setAttribute('tabindex', '0');
            }
            if (!wrapper.hasAttribute('role')) {
                wrapper.setAttribute('role', 'region');
            }
            if (!wrapper.hasAttribute('aria-label') && !wrapper.hasAttribute('aria-labelledby')) {
                const card = wrapper.closest('.card');
                const heading = card && card.querySelector('.card-header h3, .card-header h2');
                if (heading) {
                    if (!heading.id) heading.id = 'crm-table-heading-' + (idx + 1);
                    wrapper.setAttribute('aria-labelledby', heading.id);
                } else {
                    wrapper.setAttribute('aria-label', 'Scrollable data table');
                }
            }
        });

        // Empty-state metadata per CRM table body
        const emptyConfigs = {
            'property-table-body': {
                icon: 'fa-solid fa-building',
                title: 'No property listings match your current filters',
                desc: 'Try clearing the city, property type, or search filter, or click "+ Add Property" to register a listing.'
            },
            'unassigned-property-table-body': {
                icon: 'fa-solid fa-building-circle-exclamation',
                title: 'No unassigned property listings',
                desc: 'Every active listing is currently linked to an industrial park and specialist territory.'
            },
            'parks-table-body': {
                icon: 'fa-solid fa-map-location-dot',
                title: 'No industrial parks found',
                desc: 'Adjust your city or search filter, or click "+ Add Park" to register a new industrial territory.'
            },
            'park-requests-table-body': {
                icon: 'fa-solid fa-clipboard-check',
                title: 'Approval queue is clear',
                desc: 'New industrial park proposals submitted by team members will appear here for review.'
            },
            'parks-unassigned-table-body': {
                icon: 'fa-solid fa-user-check',
                title: 'All industrial parks have assigned specialists',
                desc: 'Unassigned parks awaiting territory coverage will appear here.'
            },
            'owner-list-table-body': {
                icon: 'fa-solid fa-clipboard-user',
                title: 'No owner submissions yet',
                desc: 'Factory and warehouse listings submitted by property owners from the website will show up here.'
            },
            'leads-table-body': {
                icon: 'fa-solid fa-address-book',
                title: 'No customer leads found',
                desc: 'Buyer and tenant inquiries matching your selected park, specialist, or status filter will appear here.'
            },
            'agents-table-body': {
                icon: 'fa-solid fa-user-tie',
                title: 'No specialist agents match this filter',
                desc: 'Adjust your search query or click "+ Add Agent" to onboard a new industrial specialist.'
            },
            'insights-table-body': {
                icon: 'fa-solid fa-newspaper',
                title: 'No market insight articles found',
                desc: 'Change the category or status filter, or create a new market guide using "+ Add Insight".'
            }
        };

        const checkEmptyTable = (tbodyId) => {
            const tbody = document.getElementById(tbodyId);
            if (!tbody) return;

            const realRows = Array.from(tbody.children).filter(
                (tr) => tr.tagName === 'TR' && !tr.classList.contains('crm-empty-state-row')
            );
            const existingEmpty = tbody.querySelector('.crm-empty-state-row');

            if (realRows.length > 0) {
                if (existingEmpty) existingEmpty.remove();
                // Clamp long multi-street road descriptions and expose full text on hover
                if (tbodyId === 'property-table-body' || tbodyId === 'unassigned-property-table-body') {
                    tbody.querySelectorAll('td i.fa-road').forEach((iconEl) => {
                        const roadSpan = iconEl.closest('span');
                        if (!roadSpan) return;
                        roadSpan.classList.add('prop-road-subline');
                        const txt = (roadSpan.textContent || '').trim();
                        if (txt.length > 42 && !roadSpan.getAttribute('title')) {
                            roadSpan.setAttribute('title', txt);
                        }
                    });
                }
                return;
            }

            if (existingEmpty) return;

            const cfg = emptyConfigs[tbodyId];
            if (!cfg) return;
            const table = tbody.closest('table');
            const colCount = table ? Math.max(1, table.querySelectorAll('thead th').length) : 6;

            const tr = document.createElement('tr');
            tr.className = 'crm-empty-state-row';
            tr.setAttribute('data-empty-placeholder', 'true');
            tr.innerHTML =
                '<td colspan="' + colCount + '">' +
                    '<div class="crm-empty-state-box">' +
                        '<span class="crm-empty-state-icon" aria-hidden="true"><i class="' + cfg.icon + '"></i></span>' +
                        '<div class="crm-empty-state-title">' + cfg.title + '</div>' +
                        '<div class="crm-empty-state-desc">' + cfg.desc + '</div>' +
                    '</div>' +
                '</td>';
            tbody.appendChild(tr);
        };

        Object.keys(emptyConfigs).forEach((tbodyId) => {
            const tbody = document.getElementById(tbodyId);
            if (!tbody) return;

            let timer = null;
            const scheduleCheck = () => {
                clearTimeout(timer);
                timer = setTimeout(() => checkEmptyTable(tbodyId), 120);
            };

            const obs = new MutationObserver((mutations) => {
                // Ignore mutations caused exclusively by inserting our own empty placeholder
                const onlyPlaceholder = mutations.every((m) =>
                    Array.from(m.addedNodes).every((n) => n.nodeType === 1 && n.classList?.contains('crm-empty-state-row')) &&
                    m.removedNodes.length === 0
                );
                if (!onlyPlaceholder) scheduleCheck();
            });
            obs.observe(tbody, { childList: true });

            // Initial check after dashboard.js finishes initial local render
            setTimeout(() => checkEmptyTable(tbodyId), 450);
        });
    }

    // =========================================================================
    // 5. Settings Sub-Tabs Auto-Reveal & Scroll-Fade Fallback
    // =========================================================================
    function initSettingsTabsUX() {
        const tabLists = document.querySelectorAll('.settings-nav-tabs');
        tabLists.forEach((tablist) => {
            const buttons = Array.from(tablist.querySelectorAll('.settings-tab-btn'));
            if (!buttons.length) return;

            buttons.forEach((btn) => {
                if (!btn.hasAttribute('type')) btn.setAttribute('type', 'button');
                btn.addEventListener('click', () => {
                    if (typeof btn.scrollIntoView === 'function') {
                        try {
                            btn.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
                        } catch (_) {
                            btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                        }
                    }
                });
            });

            // IntersectionObserver fallback when scroll-driven animations aren't supported
            if (!window.CSS?.supports?.('animation-timeline', 'scroll()') && 'IntersectionObserver' in window) {
                const first = buttons[0];
                const last = buttons[buttons.length - 1];
                if (first && last && first !== last) {
                    const io = new IntersectionObserver(
                        (entries) => {
                            entries.forEach(({ target, intersectionRatio }) => {
                                tablist.classList.toggle(
                                    target === first ? 'more-start' : 'more-end',
                                    intersectionRatio < 1
                                );
                            });
                        },
                        { root: tablist, threshold: 1, rootMargin: '1px' }
                    );
                    io.observe(first);
                    io.observe(last);
                }
            }
        });
    }

    // =========================================================================
    // 6. Password Visibility Toggle ARIA Sync (Settings > Admin Management)
    // =========================================================================
    function initPasswordToggleAria() {
        document.querySelectorAll('.pwd-toggle-btn').forEach((btn) => {
            btn.removeAttribute('tabindex');
            if (!btn.hasAttribute('aria-pressed')) btn.setAttribute('aria-pressed', 'false');
            if (!btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', 'Show password');
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    const group = btn.closest('.pwd-input-group');
                    const input = group && group.querySelector('input');
                    if (!input) return;
                    const shown = input.type === 'text';
                    btn.setAttribute('aria-pressed', shown ? 'true' : 'false');
                    btn.setAttribute('aria-label', shown ? 'Hide password' : 'Show password');
                }, 0);
            });
        });
    }

    // =========================================================================
    // 7. Property Modal Park/Road Dynamic Full-Width Fallback (Non-:has() browsers)
    // =========================================================================
    function initParkRoadGridFallback() {
        const parkGroup = document.getElementById('propParkGroup');
        if (!parkGroup) return;
        const grid = parkGroup.closest('.prop-park-road-grid');
        if (!grid) return;

        const sync = () => {
            const hidden = getComputedStyle(parkGroup).display === 'none';
            grid.classList.toggle('is-park-hidden', hidden);
        };
        sync();

        const obs = new MutationObserver(sync);
        obs.observe(parkGroup, { attributes: true, attributeFilter: ['style', 'class'] });
    }
})();
