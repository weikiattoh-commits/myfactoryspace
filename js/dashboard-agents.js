    (function() {
        var DEFAULT_AGENTS = [
            { id: 1, name: 'Marcus Chen', ren: 'REN 44824', phone: '60168882311', whatsapp: '60168882311', email: 'marcus@myfactoryspace.com', bio: 'Specializing in large-scale factory acquisitions and heavy industrial plots across Shah Alam and Klang.', image: 'assets/images/agent_marcus.jpg', assignedParks: ['Hicom-Glenmarie Industrial Park', 'Bandar Bukit Raja Industrial Park', 'Subang Hi-Tech', 'Klang Utama Industrial Park'], parks: ['Hicom-Glenmarie Industrial Park', 'Bandar Bukit Raja Industrial Park', 'Subang Hi-Tech', 'Klang Utama Industrial Park'], showOnMainpage: true },
            { id: 2, name: 'Renvin',       ren: 'REN 61030', phone: '60124557890', whatsapp: '60124557890', email: 'sarah@myfactoryspace.com', bio: 'Expert in warehouse space rentals, high-floor-load logistics hubs, and built-to-suit industrial leases.', image: 'https://vnsinkesbbikeqbywxfd.supabase.co/storage/v1/object/public/property-images/prop_1791373830746_hoby4a.jpg', assignedParks: ['SIME UEP Industrial Park', 'Subang Hi-Tech Industrial Park', 'Eco Business Park I', 'i-Park @ Indahpura', 'Ace Industrial Park'], parks: ['SIME UEP Industrial Park', 'Subang Hi-Tech Industrial Park', 'Eco Business Park I', 'i-Park @ Indahpura', 'Ace Industrial Park'], showOnMainpage: true },
            { id: 3, name: 'David Raj',   ren: 'REN 51203', phone: '60193321144', whatsapp: '60193321144', email: 'david@myfactoryspace.com', bio: 'Focusing on corporate property expansion, regulatory compliance, and multi-facility industrial portfolios.', image: 'assets/images/agent_david.jpg', assignedParks: ['PJ 51 Industrial Park', 'Tiong Nam Industrial Park PJ', 'Tiong Nam Industrial Park'], parks: ['PJ 51 Industrial Park', 'Tiong Nam Industrial Park PJ', 'Tiong Nam Industrial Park'], showOnMainpage: true }
        ];

        /* ---- helpers ---- */
        function escapeHtml(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
        window.escapeHtml = escapeHtml;

        function getAgents() {
            try {
                var raw = localStorage.getItem('industria_agents');
                var arr = raw ? JSON.parse(raw) : null;
                if (Array.isArray(arr) && arr.length > 0) {
                    var ag2 = arr.find(function(a) { return String(a.id) === '2'; });
                    if (ag2 && (ag2.name === 'Sarah Lin' || ag2.ren === 'REN 38192')) {
                        ag2.name = 'Renvin';
                        ag2.ren = 'REN 61030';
                        ag2.image = 'https://vnsinkesbbikeqbywxfd.supabase.co/storage/v1/object/public/property-images/prop_1791373830746_hoby4a.jpg';
                        localStorage.setItem('industria_agents', JSON.stringify(arr));
                    }
                    var hasExplicitShow = arr.some(function(a) { return typeof a.showOnMainpage === 'boolean'; });
                    if (!hasExplicitShow) {
                        arr.forEach(function(a, idx) {
                            a.showOnMainpage = (idx < 3);
                        });
                        localStorage.setItem('industria_agents', JSON.stringify(arr));
                    }
                    return arr;
                }
            } catch(e) {}
            localStorage.setItem('industria_agents', JSON.stringify(DEFAULT_AGENTS));
            return JSON.parse(JSON.stringify(DEFAULT_AGENTS));
        }

        async function saveAgents(arr, specificAgent) {
            localStorage.setItem('industria_agents', JSON.stringify(arr));
            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertAgent === 'function') {
                if (specificAgent) {
                    await window.IndustraSupabase.upsertAgent(specificAgent);
                } else {
                    for (var i = 0; i < arr.length; i++) {
                        try {
                            await window.IndustraSupabase.upsertAgent(arr[i]);
                        } catch(e) {
                            console.warn('Supabase agent sync error for agent', arr[i].id, e);
                        }
                    }
                }
                localStorage.setItem('industria_agents', JSON.stringify(arr));
            }
            if (typeof window.renderAgentsTable === 'function') {
                window.renderAgentsTable();
            }
        }

        // Initial fetch from Supabase DB on page load
        if (window.IndustraSupabase && typeof window.IndustraSupabase.fetchAgents === 'function') {
            window.IndustraSupabase.fetchAgents().then(function(sbAgents) {
                if (sbAgents && Array.isArray(sbAgents) && sbAgents.length > 0) {
                    localStorage.setItem('industria_agents', JSON.stringify(sbAgents));
                    if (typeof window.renderAgentsTable === 'function') {
                        window.renderAgentsTable();
                    }
                }
            }).catch(function(e) { console.warn('Initial agents sync error:', e); });
        }

        /* ---- toggle mainpage agent ---- */
        window.toggleMainpageAgent = function(agentId, isChecked, checkboxEl) {
            var userRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || sessionStorage.getItem('currentUserRole') || localStorage.getItem('currentUserRole') || 'Administrator';
            var canManage = (String(userRole).toLowerCase() === 'administrator' || String(userRole).toLowerCase() === 'supervisor');
            if (!canManage) {
                alert('Only Administrators and Supervisors can change mainpage featured agents.');
                if (checkboxEl) checkboxEl.checked = !isChecked;
                return;
            }
            var list = getAgents();
            var targetAgent = list.find(function(a) { return String(a.id) === String(agentId); });
            if (!targetAgent) return;

            var currentSettings = JSON.parse(localStorage.getItem('industria_settings')) || {};
            var maxAgentsPool = (typeof currentSettings.maxFeaturedAgents === 'number' && currentSettings.maxFeaturedAgents > 0) ? currentSettings.maxFeaturedAgents : 6;

            if (isChecked) {
                var otherCount = list.filter(function(a) {
                    if (String(a.id) === String(agentId)) return false;
                    return a.showOnMainpage === true;
                }).length;

                if (otherCount >= maxAgentsPool) {
                    alert('⚠️ Maximum ' + maxAgentsPool + ' agents allowed in the featured pool.\n\nPlease uncheck another agent first.');
                    if (checkboxEl) checkboxEl.checked = false;
                    return;
                }
                targetAgent.showOnMainpage = true;
            } else {
                targetAgent.showOnMainpage = false;
            }

            saveAgents(list);
            window.renderAgentsTable();
            window.dispatchEvent(new Event('storage'));
        };

        var DEFAULT_PARKS = {
            'Petaling Jaya': ['PJ 51 Business Centre', 'Tiong Nam Industrial Park @ PJ'],
            'Shah Alam': ['Ace Industrial Park', 'Batu Tiga Light Industrial Park', 'Hicom 27', 'Hicom-Glenmarie Industrial Park', 'i-Parc 1', 'i-Parc 2', 'Sekitar 26 Business Park', 'Temasya Industrial Park', 'Tiong Nam Industrial Park'],
            'Subang Jaya': ['PJS 5', 'PJS 7', 'PJS 11', 'SIME UEP Industrial Park', 'Subang Hi-Tech Industrial Park'],
            'Klang': ['Bandar Bukit Raja Industrial Park']
        };

        /* ---- get all parks from localStorage, grouped by city ---- */
        function getParksList() {
            var groups = {};
            try {
                var raw = localStorage.getItem('industria_industrial_parks');
                if (raw) groups = JSON.parse(raw);
            } catch(e) {}

            if (!groups || Object.keys(groups).length === 0) {
                groups = DEFAULT_PARKS;
            }

            // Normalise to { cityName: [parkName, ...] } with strict deduplication
            var result = {};
            for (var city in groups) {
                var parks = groups[city];
                if (Array.isArray(parks)) {
                    var seen = {};
                    result[city] = [];
                    parks.forEach(function(p) {
                        var name = (typeof p === 'string') ? p : (p && p.name ? p.name : '');
                        name = String(name || '').trim();
                        if (!name) return;
                        var norm = name.toLowerCase();
                        if (!seen[norm]) {
                            seen[norm] = true;
                            result[city].push(name);
                        }
                    });
                }
            }
            return result;
        }

        /* ---- dynamic badge update when clicking park checkbox ---- */
        window.handleParkCheckboxChange = function(cb, otherAgentName) {
            var label = cb.closest('label');
            var badge = label ? label.querySelector('.park-status-badge') : null;
            var nameSpan = label ? label.querySelector('.park-name-span') : null;
            if (cb.checked) {
                if (label) {
                    label.classList.add('checked');
                    label.style.background = '#eff6ff';
                    label.style.borderColor = '#93c5fd';
                }
                if (nameSpan) {
                    nameSpan.style.color = '#0284c7';
                    nameSpan.style.fontWeight = '700';
                }
                if (badge) {
                    badge.className = 'park-status-badge badge-assigned';
                    if (otherAgentName) {
                        badge.style.background = '#eff6ff';
                        badge.style.color = '#1e40af';
                        badge.style.borderColor = '#bfdbfe';
                        badge.innerHTML = '<i class="fa-solid fa-arrow-right-arrow-left" style="font-size:0.65rem;"></i> <span class="badge-text-full">Transfer from ' + escapeHtml(otherAgentName) + '</span><span class="badge-text-mobile">Transfer</span>';
                    } else {
                        badge.style.background = '#eff6ff';
                        badge.style.color = '#1e40af';
                        badge.style.borderColor = '#bfdbfe';
                        badge.innerHTML = '<i class="fa-solid fa-check" style="font-size:0.65rem;"></i> <span class="badge-text-full">Assigned to this Agent</span><span class="badge-text-mobile">Assigned</span>';
                    }
                }
            } else {
                if (label) {
                    label.classList.remove('checked');
                    label.style.background = '#ffffff';
                    label.style.borderColor = '#e2e8f0';
                }
                if (nameSpan) {
                    nameSpan.style.color = '#1e293b';
                    nameSpan.style.fontWeight = '500';
                }
                if (badge) {
                    badge.className = 'park-status-badge badge-available';
                    badge.style.background = '#f0fdf4';
                    badge.style.color = '#15803d';
                    badge.style.borderColor = '#bbf7d0';
                    badge.innerHTML = '<i class="fa-solid fa-circle-check" style="font-size:0.65rem;"></i> <span class="badge-text-full">Available</span><span class="badge-text-mobile">Available</span>';
                }
            }
            // Live update selected counter badge
            var checkedCount = document.querySelectorAll('#agent-parks-checklist input[name="agentPark"]:checked').length;
            var counterBadge = document.getElementById('agent-parks-selected-badge');
            if (counterBadge) {
                counterBadge.textContent = checkedCount + ' Assigned';
            }
        };

        /* ---- live search & filter for parks inside modal ---- */
        window.filterAgentParksChecklist = function(query) {
            var q = (query || '').trim().toLowerCase();
            var clearBtn = document.getElementById('agent-parks-search-clear');
            if (clearBtn) clearBtn.style.display = q ? 'inline-flex' : 'none';

            var container = document.getElementById('agent-parks-checklist');
            if (!container) return;

            var groups = container.querySelectorAll('.park-city-group');
            var totalVisible = 0;

            groups.forEach(function(group) {
                var cityName = (group.getAttribute('data-city') || '').toLowerCase();
                var rows = group.querySelectorAll('.agent-park-row, .agent-park-disabled-row');
                var groupVisible = 0;

                rows.forEach(function(row) {
                    var parkName = (row.getAttribute('data-park') || '').toLowerCase();
                    var matches = !q || parkName.indexOf(q) !== -1 || cityName.indexOf(q) !== -1;
                    row.style.display = matches ? 'flex' : 'none';
                    if (matches) groupVisible++;
                });

                group.style.display = groupVisible > 0 ? 'block' : 'none';
                totalVisible += groupVisible;
            });

            var emptyMsg = document.getElementById('agent-parks-empty-filter');
            if (!emptyMsg) {
                emptyMsg = document.createElement('div');
                emptyMsg.id = 'agent-parks-empty-filter';
                emptyMsg.style.cssText = 'padding: 1.5rem; text-align: center; color: #94a3b8; font-size: 0.82rem;';
                emptyMsg.innerHTML = '<i class="fa-solid fa-magnifying-glass" style="font-size: 1.4rem; margin-bottom: 0.4rem; display: block; color: #cbd5e1;"></i>No matching industrial parks found';
                container.appendChild(emptyMsg);
            }
            emptyMsg.style.display = totalVisible === 0 ? 'block' : 'none';
        };

        /* ---- render parks checklist inside the modal ---- */
        window.renderParksChecklist = function(selectedParks) {
            var container = document.getElementById('agent-parks-checklist');
            if (!container) return;
            selectedParks = Array.isArray(selectedParks) ? selectedParks : [];

            // Normalize selected parks to array of lowercase trimmed strings for reliable matching
            var selectedNames = selectedParks.map(function(p) {
                var str = (typeof p === 'string') ? p : (p && p.name ? p.name : String(p || ''));
                return str.trim().toLowerCase();
            }).filter(Boolean);

            var currentAgentId = (window._editingAgentId !== null && window._editingAgentId !== undefined) ? String(window._editingAgentId) : '';
            var allAgents = (typeof getAgents === 'function' ? getAgents() : (typeof window.getAgents === 'function' ? window.getAgents() : [])) || [];

            // Build map of parks assigned to OTHER agents to strictly enforce 1 agent per park
            var otherAgentMap = {};
            allAgents.forEach(function(a) {
                if (String(a.id) === currentAgentId) return; // skip currently edited agent
                var pList = Array.isArray(a.parks) ? a.parks : (a.assignedParks || []);
                pList.forEach(function(p) {
                    var pName = (typeof p === 'string' ? p : (p && p.name ? p.name : String(p || ''))).trim();
                    if (pName) {
                        otherAgentMap[pName.toLowerCase()] = a;
                    }
                });
            });

            var isAdmin = true;
            try {
                var activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                                 sessionStorage.getItem('currentUserRole') || 
                                 localStorage.getItem('currentUserRole') || 
                                 (typeof currentUserRole !== 'undefined' ? currentUserRole : null);
                if (activeRole) {
                    isAdmin = (String(activeRole).toLowerCase() === 'administrator');
                } else {
                    var loggedInUser = sessionStorage.getItem('loggedInUser') || 'admin';
                    if (loggedInUser.toLowerCase() !== 'admin') {
                        isAdmin = false;
                        var usersRaw = localStorage.getItem('industria_users');
                        if (usersRaw) {
                            var usersList = JSON.parse(usersRaw);
                            var foundU = usersList.find(function(u) { return u.username && u.username.toLowerCase() === loggedInUser.toLowerCase(); });
                            if (foundU && foundU.role === 'Administrator') {
                                isAdmin = true;
                            }
                        }
                    }
                }
            } catch(e) {}

            var groups = getParksList();
            var cities = Object.keys(groups);

            if (cities.length === 0) {
                container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:1rem 0;"><i class="fa-solid fa-circle-info"></i> No parks configured yet. Add parks first.</p>';
                return;
            }

            var html = '';
            if (!isAdmin) {
                html += '<div style="font-size:0.8rem; color:#b91c1c; background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:0.4rem 0.6rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">' +
                    '<i class="fa-solid fa-lock"></i> Only Administrators can modify assigned parks.' +
                '</div>';
            }

            // Territory policy informational header
            html += '<div class="park-territory-banner">' +
                '<i class="fa-solid fa-shield-halved"></i>' +
                '<span><strong>1-Agent Territory Protection:</strong> Each park is exclusively handled by 1 specialist agent.</span>' +
            '</div>';

            if (!isAdmin) {
                html += '<div style="opacity: 0.6; filter: grayscale(100%);">';
            }

            cities.forEach(function(city) {
                var parkNames = groups[city];
                if (!parkNames || parkNames.length === 0) return;

                html += '<div class="park-city-group" data-city="' + escapeHtml(city).toLowerCase() + '">' +
                    '<div class="park-city-section-header">' +
                        '<span><i class="fa-solid fa-location-dot" style="margin-right:4px;"></i>' + escapeHtml(city) + '</span>' +
                        '<span class="park-city-count">' + parkNames.length + ' parks</span>' +
                    '</div>';

                parkNames.forEach(function(parkName) {
                    var targetLower = parkName.trim().toLowerCase();
                    var isChecked = selectedNames.some(function(sn) {
                        return sn === targetLower;
                    });
                    var otherAgent = otherAgentMap[targetLower];
                    var safeId = 'park_cb_' + parkName.replace(/[^a-zA-Z0-9]/g, '_');

                    // If assigned to another person, display an 'X' box and 'Handled by {person}' badge. Strictly non-clickable.
                    if (otherAgent && !isChecked) {
                        html += '<div class="agent-park-disabled-row" data-park="' + escapeHtml(parkName).toLowerCase() + '" data-city="' + escapeHtml(city).toLowerCase() + '" title="Exclusively handled by ' + escapeHtml(otherAgent.name) + '. Each park can only be handled by 1 specialist agent.">' +
                            '<span class="occupied-icon">' +
                                '<i class="fa-solid fa-xmark"></i>' +
                            '</span>' +
                            '<span class="park-name-span">' + escapeHtml(parkName) + '</span>' +
                            '<span class="park-status-badge badge-occupied">' +
                                '<i class="fa-solid fa-user-lock" style="font-size:0.65rem;"></i> <span class="badge-text-full">Handled by ' + escapeHtml(otherAgent.name) + '</span><span class="badge-text-mobile">' + escapeHtml(otherAgent.name) + '</span>' +
                            '</span>' +
                        '</div>';
                        return;
                    }

                    // Park is either assigned to this agent or available
                    var disabledAttr = (!isAdmin) ? ' disabled' : '';
                    var cursorStyle = (!isAdmin) ? 'not-allowed' : 'pointer';

                    var statusBadge = '';
                    if (isChecked) {
                        statusBadge = '<span class="park-status-badge badge-assigned">' +
                            '<i class="fa-solid fa-check" style="font-size:0.65rem;"></i> <span class="badge-text-full">Assigned to this Agent</span><span class="badge-text-mobile">Assigned</span>' +
                        '</span>';
                    } else {
                        statusBadge = '<span class="park-status-badge badge-available">' +
                            '<i class="fa-solid fa-circle-check" style="font-size:0.65rem;"></i> <span class="badge-text-full">Available</span><span class="badge-text-mobile">Available</span>' +
                        '</span>';
                    }

                    var checkedClass = isChecked ? ' checked' : '';

                    html += '<label for="' + safeId + '" class="agent-park-row' + checkedClass + '" data-park="' + escapeHtml(parkName).toLowerCase() + '" data-city="' + escapeHtml(city).toLowerCase() + '" style="cursor:' + cursorStyle + ';" ' +
                        (isAdmin ? 'onmouseover="if(!this.querySelector(\'input\').checked) this.style.borderColor=\'#93c5fd\'" onmouseout="if(!this.querySelector(\'input\').checked) this.style.borderColor=\'#e2e8f0\'"' : '') + '>' +
                        '<input type="checkbox" id="' + safeId + '" name="agentPark" value="' + parkName.replace(/"/g, '&quot;') + '"' +
                        (isChecked ? ' checked="checked"' : '') + disabledAttr +
                        ' onchange="handleParkCheckboxChange(this)"' +
                        ' style="cursor:' + cursorStyle + ';">' +
                        '<span class="park-name-span">' + escapeHtml(parkName) + '</span>' +
                        statusBadge +
                    '</label>';
                });

                html += '</div>';
            });

            if (!isAdmin) {
                html += '</div>';
            }

            container.innerHTML = html;

            // Live update selected counter badge
            var checkedCount = container.querySelectorAll('input[name="agentPark"]:checked').length;
            var counterBadge = document.getElementById('agent-parks-selected-badge');
            if (counterBadge) {
                counterBadge.textContent = checkedCount + ' Assigned';
            }

            // Reset quick search input on re-render
            var searchInp = document.getElementById('agent-parks-search-input');
            if (searchInp) {
                searchInp.value = '';
                var clearBtn = document.getElementById('agent-parks-search-clear');
                if (clearBtn) clearBtn.style.display = 'none';
            }
        };
        var renderParksChecklist = window.renderParksChecklist;

        /* ---- read checked parks from the modal ---- */
        function getSelectedParks() {
            var checkboxes = document.querySelectorAll('#agent-parks-checklist input[name="agentPark"]:checked');
            var result = [];
            checkboxes.forEach(function(cb) { result.push(cb.value); });
            return result;
        }

        function openModal() {
            var m = document.getElementById('agent-modal');
            if (!m) return;
            m.style.cssText = '';
            m.style.display = 'flex';
            m.classList.add('active');
        }
        window.openModal = openModal;
        window.openAgentModal = openModal;

        function closeModal() {
            var m = document.getElementById('agent-modal');
            if (!m) return;
            m.classList.remove('active');
            m.style.display = 'none';
            var f = document.getElementById('agent-form');
            if (f) f.reset();
            var hidEl = document.getElementById('editAgentId');
            if (hidEl) hidEl.value = '';
            var emailEl = document.getElementById('agentEmail');
            if (emailEl) emailEl.value = '';
            var nameEl = document.getElementById('agentName');
            if (nameEl) nameEl.value = '';
            var renEl = document.getElementById('agentRen');
            if (renEl) renEl.value = '';
            var bioEl = document.getElementById('agentBio');
            if (bioEl) bioEl.value = '';
            var img = document.getElementById('agent-photo-preview-img');
            var ph  = document.getElementById('agent-photo-placeholder');
            var fn  = document.getElementById('agent-photo-filename');
            if (img) { img.src = ''; img.style.display = 'none'; }
            if (ph)  ph.style.display = 'flex';
            if (fn)  fn.textContent = 'No file chosen';
            var waPreview = document.getElementById('agent-modal-wa-preview');
            if (waPreview) waPreview.textContent = '';
            window._editingAgentId = null;
            window._agentCroppedResult = null;
        }
        window.closeModal = closeModal;
        window.closeAgentModal = closeModal;

        /* ---- render table ---- */
        window.renderAgentsTable = function() {
            var tbody = document.getElementById('agents-table-body');
            if (!tbody) return;
            var list = getAgents();
            var users = JSON.parse(localStorage.getItem('industria_users')) || [];

            // Wire up live search filter if not yet attached
            var searchInp = document.getElementById('agent-search-input');
            if (searchInp && !searchInp._hasAgentsSearchListener) {
                searchInp._hasAgentsSearchListener = true;
                searchInp.addEventListener('input', function() {
                    window.renderAgentsTable();
                });
            }
            var searchVal = searchInp ? searchInp.value.toLowerCase().trim() : '';
            if (searchVal) {
                list = list.filter(function(a) {
                    var rawParks = [].concat(Array.isArray(a.parks) ? a.parks : []).concat(Array.isArray(a.assignedParks) ? a.assignedParks : []);
                    var parksStr = Array.from(new Set(rawParks.map(function(p) { return String(typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim(); }).filter(Boolean))).join(' ');
                    var haystack = [a.name, a.ren, a.phone, a.whatsapp, a.email, a.bio, parksStr].filter(Boolean).join(' ').toLowerCase();
                    return haystack.indexOf(searchVal) !== -1;
                });
            }

            var currentSettings = JSON.parse(localStorage.getItem('industria_settings')) || {};
            var maxAgentsPool = (typeof currentSettings.maxFeaturedAgents === 'number' && currentSettings.maxFeaturedAgents > 0) ? currentSettings.maxFeaturedAgents : 6;
            var maxDisplayAgents = (typeof currentSettings.maxFeaturedAgentsDisplayed === 'number' && currentSettings.maxFeaturedAgentsDisplayed > 0) ? Math.min(6, currentSettings.maxFeaturedAgentsDisplayed) : 3;

            var featuredCount = list.filter(function(a) { return a.showOnMainpage === true; }).length;
            var poolLabel = document.getElementById('mainpage-agents-pool-quota-label');
            if (poolLabel) {
                poolLabel.textContent = maxAgentsPool + ' agents';
            }
            var countBadge = document.getElementById('mainpage-agents-count');
            if (countBadge) {
                countBadge.textContent = featuredCount + ' / ' + maxAgentsPool + ' Selected';
                countBadge.style.color = (featuredCount >= maxDisplayAgents) ? '#059669' : '#d97706';
            }
            var toolbarCountBadge = document.getElementById('toolbar-featured-agents-count');
            if (toolbarCountBadge) {
                toolbarCountBadge.textContent = featuredCount + ' / ' + maxAgentsPool + ' Selected';
                toolbarCountBadge.style.color = (featuredCount >= maxDisplayAgents) ? '#059669' : '#d97706';
            }
            var maxLabel = document.getElementById('mainpage-agents-max-label');
            if (maxLabel) {
                maxLabel.textContent = 'Display up to ' + maxDisplayAgents;
            }
            var isRandomAgents = currentSettings.randomFeaturedAgents !== false && String(currentSettings.randomFeaturedAgents) !== 'false';
            if (typeof window.updateFeaturedAgentsRandomUI === 'function') {
                window.updateFeaturedAgentsRandomUI(isRandomAgents);
            } else {
                var roleVal = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || sessionStorage.getItem('currentUserRole') || localStorage.getItem('currentUserRole') || 'Administrator';
                var canManageRole = (String(roleVal).toLowerCase() === 'administrator' || String(roleVal).toLowerCase() === 'supervisor');
                var swA = document.getElementById('toolbar-featured-agents-random-switch');
                if (swA) {
                    swA.checked = isRandomAgents;
                    swA.disabled = !canManageRole;
                    var wrapA = swA.closest('.featured-random-toggle-wrapper');
                    if (wrapA) {
                        wrapA.classList.toggle('disabled', !canManageRole);
                        if (!canManageRole) wrapA.title = 'Only Administrators and Supervisors can change Random rotation settings.';
                        else wrapA.removeAttribute('title');
                    }
                    var parentLblA = swA.closest('label');
                    if (parentLblA) {
                        if (!canManageRole) parentLblA.title = 'Only Administrators and Supervisors can change Random rotation settings.';
                        else parentLblA.title = 'Randomly select from the Max Featured agent to appear on the homepage.';
                    }
                }
                var stA = document.getElementById('toolbar-featured-agents-random-status');
                if (stA) {
                    stA.textContent = isRandomAgents ? 'ON' : 'OFF';
                    stA.style.color = isRandomAgents ? (!canManageRole ? '#94a3b8' : '#059669') : '#64748b';
                    if (isRandomAgents && canManageRole) stA.classList.add('status-on'); else stA.classList.remove('status-on');
                }
            }
            if (typeof window.syncPropertyFeaturesUI === 'function') {
                window.syncPropertyFeaturesUI(currentSettings);
            }

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 2.25rem; color: var(--text-muted); font-size: 0.88rem;"><i class="fa-solid fa-user-slash" style="font-size: 1.8rem; margin-bottom: 0.45rem; color: #94a3b8; display: block;"></i>No specialist agents found matching your search.</td></tr>';
                return;
            }

            tbody.innerHTML = list.map(function(a) {
                // Check if admin
                var isAdmin = true;
                try {
                    var loggedInUser = sessionStorage.getItem('loggedInUser') || 'admin';
                    if (loggedInUser.toLowerCase() !== 'admin') {
                        isAdmin = false;
                        var usersRaw = localStorage.getItem('industria_users');
                        if (usersRaw) {
                            var usersList = JSON.parse(usersRaw);
                            var foundU = usersList.find(function(u) { return u.username && u.username.toLowerCase() === loggedInUser.toLowerCase(); });
                            if (foundU && foundU.role === 'Administrator') {
                                isAdmin = true;
                            }
                        }
                    }
                } catch(e) {}

                // Build parks badges
                var rawParks = []
                    .concat(Array.isArray(a.parks) ? a.parks : [])
                    .concat(Array.isArray(a.assignedParks) ? a.assignedParks : []);
                var parksList = Array.from(new Set(rawParks.map(function(p) {
                    return String(typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim();
                }).filter(Boolean)));
                var parksBadges = '';
                if (parksList.length > 0) {
                    parksBadges = parksList.map(function(p) {
                        return '<span class="agent-park-badge" title="' + escapeHtml(p) + '">' +
                            '<i class="fa-solid fa-industry"></i><span>' + escapeHtml(p) + '</span>' +
                        '</span>';
                    }).join('');
                } else {
                    parksBadges = '<span style="color:var(--text-muted);font-size:0.75rem;font-style:italic;">None assigned</span>';
                }

                var imgSrc = a.image || 'assets/images/agent_marcus.jpg';

                // Look up WhatsApp number from user account assigned to this agent in Admin Management, or fallback to agent phone/whatsapp
                var linkedUser = users.find(function(u) { return String(u.agentId) === String(a.id) && u.whatsapp && String(u.whatsapp).trim() !== ''; });
                var waNum = linkedUser ? linkedUser.whatsapp : (a.whatsapp || a.phone || '');
                var waDisplay = waNum 
                    ? '<a href="https://wa.me/' + waNum.replace(/[^0-9]/g, '') + '" target="_blank" style="color: #25D366; font-weight: 600; text-decoration: none; font-size: 0.8rem; display:inline-flex; align-items:center; gap:4px;"><i class="fa-brands fa-whatsapp"></i> ' + escapeHtml(waNum) + '</a>' 
                    : '<span style="color:var(--text-muted);font-size:0.75rem;font-style:italic;">Not set</span>';

                var userRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || sessionStorage.getItem('currentUserRole') || localStorage.getItem('currentUserRole') || 'Administrator';
                var canManage = (String(userRole).toLowerCase() === 'administrator' || String(userRole).toLowerCase() === 'supervisor');
                var isMain = (a.showOnMainpage === true);

                var emailHtml = a.email ? '<div style="font-size:0.73rem; color:var(--text-muted); line-height:1.2; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><i class="fa-solid fa-envelope" style="font-size:0.68rem; margin-right:3px;"></i><a href="mailto:' + escapeHtml(a.email) + '" style="color:inherit; text-decoration:none;">' + escapeHtml(a.email) + '</a></div>' : '';

                return '<tr>' +
                    '<td style="text-align:center;"><div style="display:flex; justify-content:center;"><img src="' + imgSrc + '" alt="' + escapeHtml(a.name||'') + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1.5px solid #cbd5e1;display:block;" onerror="this.src=\'assets/images/agent_marcus.jpg\'"></div></td>' +
                    '<td><div style="font-weight:600; color:#0f172a; line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + escapeHtml(a.name||'') + '</div>' + emailHtml + '</td>' +
                    '<td style="white-space:nowrap; font-size:0.8rem; font-weight:600; color:#475569;">' + escapeHtml(a.ren||'') + '</td>' +
                    '<td>' + waDisplay + '</td>' +
                    '<td><div style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.78rem;color:#475569;" title="' + escapeHtml(a.bio||'') + '">' + escapeHtml(a.bio||'') + '</div></td>' +
                    '<td><div class="agent-parks-cell">' + parksBadges + '</div></td>' +
                    '<td style="text-align:center;vertical-align:middle;">' +
                        '<label style="display:inline-flex;align-items:center;gap:5px;cursor:' + (canManage ? 'pointer' : 'not-allowed') + ';user-select:none;margin:0;opacity:' + (canManage ? '1' : '0.45') + ';">' +
                            '<input type="checkbox" ' + (isMain ? 'checked' : '') + (canManage ? '' : ' disabled') + ' onchange="toggleMainpageAgent(' + a.id + ', this.checked, this)" style="width:15px;height:15px;cursor:' + (canManage ? 'pointer' : 'not-allowed') + ';accent-color:#059669;">' +
                            '<span style="font-size:0.76rem;font-weight:600;color:' + (isMain ? '#059669' : 'var(--text-muted)') + ';white-space:nowrap;">' +
                                (isMain ? '<i class="fa-solid fa-star" style="color:#f59e0b;"></i> Featured' : 'Hidden') +
                            '</span>' +
                        '</label>' +
                    '</td>' +
                    '<td style="text-align:center;vertical-align:middle;"><div style="display:inline-flex; align-items:center; justify-content:center; gap:4px;">' +
                        '<button class="action-btn" aria-label="Edit" title="Edit Agent" onclick="editAgent(\'' + a.id + '\')"><i class="fa-solid fa-pen-to-square"></i></button>' +
                        '<button class="action-btn delete" aria-label="Delete" title="Delete Agent" onclick="deleteAgent(\'' + a.id + '\')"><i class="fa-solid fa-trash"></i></button>' +
                    '</div></td>' +
                '</tr>';
            }).join('');
        };

        /* ---- open add agent modal ---- */
        window.openAddAgentModal = function() {
            window._editingAgentId = null;
            window._agentCroppedResult = null;
            var hidEl = document.getElementById('editAgentId');
            if (hidEl) hidEl.value = '';
            var titleEl = document.getElementById('agent-modal-title');
            if (titleEl) titleEl.textContent = 'Add Specialist / Agent';
            var nameEl = document.getElementById('agentName');
            if (nameEl) nameEl.value = '';
            var renEl = document.getElementById('agentRen');
            if (renEl) renEl.value = '';
            var emailEl = document.getElementById('agentEmail');
            if (emailEl) emailEl.value = '';
            var bioEl = document.getElementById('agentBio');
            if (bioEl) bioEl.value = '';
            var img = document.getElementById('agent-photo-preview-img');
            var ph  = document.getElementById('agent-photo-placeholder');
            var fn  = document.getElementById('agent-photo-filename');
            if (img) { img.src = ''; img.style.display = 'none'; }
            if (ph)  ph.style.display = 'flex';
            if (fn)  fn.textContent = 'No file chosen';
            var waPreview = document.getElementById('agent-modal-wa-preview');
            if (waPreview) waPreview.textContent = '';
            var showMainEl = document.getElementById('agentShowOnMainpage');
            if (showMainEl) {
                var curAgents = (typeof getAgents === 'function' ? getAgents() : (typeof window.getAgents === 'function' ? window.getAgents() : [])) || [];
                var curCount = curAgents.filter(function(a) { return a.showOnMainpage === true; }).length;
                showMainEl.checked = (curCount < 3);
            }
            if (typeof renderParksChecklist === 'function') {
                renderParksChecklist([]);
            }
            openModal();
        };

        /* ---- edit ---- */
        window.editAgent = function(id) {
            var list = (typeof getAgents === 'function' ? getAgents() : (typeof window.getAgents === 'function' ? window.getAgents() : [])) || [];
            var agent = list.find(function(a) { return String(a.id) === String(id); });
            if (!agent) {
                try {
                    var raw = localStorage.getItem('industria_agents');
                    if (raw) {
                        var parsed = JSON.parse(raw);
                        agent = parsed.find(function(a) { return String(a.id) === String(id); });
                    }
                } catch(e) {}
            }
            if (!agent) { alert('Agent not found.'); return; }

            window._editingAgentId = id;
            window._agentCroppedResult = null;

            var titleEl = document.getElementById('agent-modal-title');
            var nameEl  = document.getElementById('agentName');
            var renEl   = document.getElementById('agentRen');
            var emailEl = document.getElementById('agentEmail');
            var bioEl   = document.getElementById('agentBio');
            var imgEl   = document.getElementById('agent-photo-preview-img');
            var phEl    = document.getElementById('agent-photo-placeholder');
            var fnEl    = document.getElementById('agent-photo-filename');
            var hidEl   = document.getElementById('editAgentId');
            var showMainEl = document.getElementById('agentShowOnMainpage');

            if (titleEl) titleEl.textContent = 'Edit Specialist / Agent';
            if (hidEl)   hidEl.value = id;
            if (nameEl)  nameEl.value = agent.name  || '';
            if (renEl)   renEl.value  = agent.ren   || '';
            if (emailEl) emailEl.value = agent.email || '';
            if (bioEl)   bioEl.value  = agent.bio   || '';
            if (showMainEl) showMainEl.checked = (agent.showOnMainpage === true);

            var waPreview = document.getElementById('agent-modal-wa-preview');
            if (waPreview) {
                var usersList = JSON.parse(localStorage.getItem('industria_users')) || [];
                var linkedU = usersList.find(function(u) { return String(u.agentId) === String(id) && u.whatsapp && String(u.whatsapp).trim() !== ''; });
                var curNum = linkedU ? linkedU.whatsapp : (agent.whatsapp || agent.phone || '');
                waPreview.textContent = curNum ? '(Current: ' + curNum + ')' : '(Not configured)';
            }

            if (agent.image && imgEl) {
                imgEl.src = agent.image;
                imgEl.style.display = 'block';
                if (phEl) phEl.style.display = 'none';
                if (fnEl) fnEl.textContent = 'Current photo loaded';
            } else {
                if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
                if (phEl)  phEl.style.display = 'flex';
                if (fnEl)  fnEl.textContent = 'No file chosen';
            }

            // Pre-fill assigned parks
            if (typeof renderParksChecklist === 'function') {
                renderParksChecklist(agent.parks || agent.assignedParks || []);
            }

            openModal();
        };

        /* ---- delete ---- */
        window.deleteAgent = function(id) {
            if (!confirm('Are you sure you want to delete this agent?')) return;
            var list = getAgents().filter(function(a) { return String(a.id) !== String(id); });
            if (list.length === 0) list = JSON.parse(JSON.stringify(DEFAULT_AGENTS));
            saveAgents(list);
            if (window.IndustraSupabase && typeof window.IndustraSupabase.deleteAgent === 'function') {
                window.IndustraSupabase.deleteAgent(id).catch(function(e) { console.warn('Supabase delete agent error:', e); });
            }
            window.renderAgentsTable();
        };

        /* ---- restore defaults ---- */
        window.restoreDefaultAgents = function() {
            saveAgents(JSON.parse(JSON.stringify(DEFAULT_AGENTS)));
            window.renderAgentsTable();
            alert('✅ Default agents restored! (Marcus Chen, Sarah Lin, David Raj)');
        };

        /* ---- wire up Add Agent button & modal close buttons ---- */
        document.addEventListener('DOMContentLoaded', function() {

            var addBtn    = document.getElementById('add-agent-btn');
            var closeBtn  = document.getElementById('close-agent-modal-btn');
            var cancelBtn = document.getElementById('cancel-agent-btn');
            var form      = document.getElementById('agent-form');

            if (addBtn) {
                addBtn.addEventListener('click', function(e) {
                    if (e) e.preventDefault();
                    window.openAddAgentModal();
                });
            }

            if (closeBtn)  closeBtn.addEventListener('click',  closeModal);
            if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

            var modal = document.getElementById('agent-modal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) closeModal();
                });
            }

            /* ---- save (add or edit) ---- */
            if (form) {
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();

                    var submitBtn = form.querySelector('button[type="submit"]');
                    var origBtnHtml = submitBtn ? submitBtn.innerHTML : 'Save Agent';

                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Supabase...';
                    }

                    try {
                        var nameVal  = (document.getElementById('agentName')  || {}).value || '';
                        var renVal   = (document.getElementById('agentRen')   || {}).value || '';
                        var emailVal = (document.getElementById('agentEmail') || {}).value || '';
                        var bioVal   = (document.getElementById('agentBio')   || {}).value || '';
                        var rawParksVal = getSelectedParks();
                        // Strict deduplication: remove any duplicate strings or empty values
                        var cleanParks = [];
                        var seenParks = {};
                        rawParksVal.forEach(function(p) {
                            var str = String(p || '').trim();
                            var norm = str.toLowerCase();
                            if (norm && !seenParks[norm]) {
                                seenParks[norm] = true;
                                cleanParks.push(str);
                            }
                        });
                        var parksVal = cleanParks;

                        var previewImgEl = document.getElementById('agent-photo-preview-img');
                        var previewSrc = (previewImgEl && previewImgEl.style.display !== 'none' && previewImgEl.src) ? previewImgEl.src : null;
                        var imgSrc = window._agentCroppedResult || previewSrc || null;

                        var list = getAgents();

                        var editIdInput = (document.getElementById('editAgentId') || {}).value;
                        var targetEditId = (window._editingAgentId !== null && window._editingAgentId !== undefined) ? window._editingAgentId : (editIdInput || null);

                        var targetAgent = null;

                        if (targetEditId !== null && targetEditId !== undefined && String(targetEditId).trim() !== '') {
                            var idx = list.findIndex(function(a) { return String(a.id) === String(targetEditId); });
                            if (idx > -1) {
                                list[idx].name  = nameVal;
                                list[idx].ren   = renVal;
                                list[idx].email = emailVal.trim();
                                list[idx].bio   = bioVal;
                                var isAdminRole = (typeof currentUserRole !== 'undefined') ? (currentUserRole === 'Administrator') : true;
                                if (isAdminRole) {
                                    list[idx].parks         = parksVal;
                                    list[idx].assignedParks = parksVal;
                                }
                                if (imgSrc) {
                                    list[idx].image = imgSrc;
                                }
                                targetAgent = list[idx];
                            }
                        } else {
                            var maxId = list.reduce(function(m, a) { return Math.max(m, parseInt(a.id) || 0); }, 0);
                            var currentFeatured = list.filter(function(a) { return a.showOnMainpage === true; }).length;
                            targetAgent = {
                                id:             maxId + 1,
                                name:           nameVal,
                                ren:            renVal,
                                email:          emailVal.trim(),
                                bio:            bioVal,
                                showOnMainpage: (currentFeatured < 4),
                                parks:          parksVal,
                                assignedParks:  parksVal,
                                image:          imgSrc || 'assets/images/agent_marcus.jpg'
                            };
                            list.push(targetAgent);
                        }

                        // Strict deduplication across ALL agents: ensure NO other agent retains any of these parks
                        var otherModifiedAgents = [];
                        if (targetAgent && Array.isArray(parksVal)) {
                            list.forEach(function(other) {
                                if (String(other.id) !== String(targetAgent.id)) {
                                    var otherParks = Array.isArray(other.parks) ? other.parks : (other.assignedParks || []);
                                    var filteredParks = otherParks.filter(function(op) {
                                        var opNorm = String(op || '').trim().toLowerCase();
                                        return !parksVal.some(function(sel) { return String(sel || '').trim().toLowerCase() === opNorm; });
                                    });
                                    if (filteredParks.length !== otherParks.length) {
                                        other.parks = filteredParks;
                                        other.assignedParks = filteredParks;
                                        otherModifiedAgents.push(other);
                                    }
                                }
                            });
                        }

                        await saveAgents(list, targetAgent);

                        // Also save any other agents whose parks were stripped to prevent duplication
                        for (var m = 0; m < otherModifiedAgents.length; m++) {
                            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertAgent === 'function') {
                                try {
                                    await window.IndustraSupabase.upsertAgent(otherModifiedAgents[m]);
                                } catch(e) {
                                    console.warn('Sync error for deduplicated agent:', otherModifiedAgents[m].name, e);
                                }
                            }
                        }

                        // Also sync to Supabase public.parks table to update agent_id and agent_name
                        if (window.IndustraSupabase && targetAgent) {
                            try {
                                var sbClient = window.IndustraSupabase.getClient();
                                if (sbClient) {
                                    await sbClient.from('parks').update({ agent_id: null, agent_name: null }).eq('agent_id', String(targetAgent.id));
                                    for (var p = 0; p < parksVal.length; p++) {
                                        await sbClient.from('parks').update({ agent_id: String(targetAgent.id), agent_name: targetAgent.name }).ilike('name', parksVal[p]);
                                    }
                                }
                            } catch(pe) {
                                console.warn('Parks table sync warning:', pe);
                            }
                        }

                        window.renderAgentsTable();
                        window._agentCroppedResult = null;
                        closeModal();

                        if (window._pendingAssignUsername) {
                            var assignUser = window._pendingAssignUsername;
                            window._pendingAssignUsername = null;
                            try {
                                var usersList = JSON.parse(localStorage.getItem('industria_users')) || [];
                                var uTarget = usersList.find(function(u) { return u.username.toLowerCase() === assignUser.toLowerCase(); });
                                if (uTarget && list.length > 0) {
                                    var latestAgent = list[list.length - 1];
                                    uTarget.agentId = latestAgent.id;
                                    localStorage.setItem('industria_users', JSON.stringify(usersList));
                                    if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertUser === 'function') {
                                        window.IndustraSupabase.upsertUser(uTarget);
                                    }
                                }
                            } catch(e) { console.warn('Could not auto-assign new agent to user:', e); }
                        }
                        if (typeof window.populateCreateAdminAgentSelect === 'function') {
                            window.populateCreateAdminAgentSelect();
                        }
                        if (typeof window.renderAdminManagement === 'function') {
                            window.renderAdminManagement();
                        }
                    } catch (err) {
                        console.error('Error saving agent:', err);
                        alert('⚠️ Error saving agent: ' + (err.message || err));
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = origBtnHtml;
                        }
                    }
                });
            }
        });

    })();
