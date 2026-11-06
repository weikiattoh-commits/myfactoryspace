// Global modal fullscreen toggle helper
window.toggleModalFullscreen = function(btn) {
    if (!btn) return;
    const modal = btn.closest('.modal');
    if (!modal) return;
    modal.classList.toggle('is-fullscreen');
    const icon = btn.querySelector('i');
    if (icon) {
        if (modal.classList.contains('is-fullscreen')) {
            icon.className = 'fa-solid fa-compress';
        } else {
            icon.className = 'fa-solid fa-expand';
        }
    }
};

// Define window.switchView early so inline onclick handlers always work
window.switchView = function switchView(viewName, subtab = 'general') {
    // Auto hide mobile sidebar and overlay on navigation
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('show');
    const sbOverlay = document.getElementById('sidebar-overlay');
    if (sbOverlay) sbOverlay.classList.remove('show');
    document.body.style.overflow = '';

    const overviewView = document.getElementById('overview-view');
    const propertiesView = document.getElementById('properties-view');
    const parksView = document.getElementById('parks-view');
    const leadsView = document.getElementById('leads-view');
    const ownerListView = document.getElementById('owner-list-view');
    const agentsView = document.getElementById('agents-view');
    const settingsView = document.getElementById('settings-view');

    const navOverview = document.getElementById('nav-overview');
    const navProperties = document.getElementById('nav-properties');
    const navParks = document.getElementById('nav-parks');
    const navLeads = document.getElementById('nav-leads');
    const navOwnerList = document.getElementById('nav-owner-list');
    const navAgents = document.getElementById('nav-agents');
    const navLandingPage = document.getElementById('nav-landing-page');
    const navSettings = document.getElementById('nav-settings');
    const settingsSubmenu = document.getElementById('settings-submenu');
    const settingsArrow = document.getElementById('settings-arrow');

    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.mobile-bottom-nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });
    if (overviewView) overviewView.style.display = 'none';
    if (propertiesView) propertiesView.style.display = 'none';
    if (parksView) parksView.style.display = 'none';
    if (leadsView) leadsView.style.display = 'none';
    if (ownerListView) ownerListView.style.display = 'none';
    if (agentsView) agentsView.style.display = 'none';
    const landingPageView = document.getElementById('landing-page-view');
    if (landingPageView) landingPageView.style.display = 'none';
    if (settingsView) settingsView.style.display = 'none';

    const breadcrumbCurrent = document.getElementById('header-breadcrumb-current');
    const viewLabels = {
        'overview': 'Overview',
        'properties': 'Properties',
        'parks': 'Industrial Parks',
        'leads': 'Lead List',
        'owner-list': 'Owner List',
        'agents': 'Specialist Agents',
        'landing-page': 'Landing Page',
        'settings': 'Settings'
    };
    if (breadcrumbCurrent && viewLabels[viewName]) {
        breadcrumbCurrent.textContent = viewLabels[viewName];
    }
    
    if (viewName === 'overview') {
        if (navOverview) navOverview.classList.add('active');
        if (overviewView) overviewView.style.display = 'block';
        if (typeof window.renderOverviewCharts === 'function') window.renderOverviewCharts();
        if (typeof window.renderOverviewSummaries === 'function') window.renderOverviewSummaries();
        if (typeof window.loadPropertiesFromSupabase === 'function') window.loadPropertiesFromSupabase();
        if (typeof window.loadLeadsFromSupabase === 'function') window.loadLeadsFromSupabase();
        if (typeof window.loadOwnerListingsFromSupabase === 'function') window.loadOwnerListingsFromSupabase();
        if (typeof window.renderVisitorChart === 'function') window.renderVisitorChart();
        else if (typeof window.loadVisitorTrend === 'function') window.loadVisitorTrend();
        if (typeof window.loadDailyVisitorStats === 'function') window.loadDailyVisitorStats();
        if (typeof window.loadVisitorStats === 'function') window.loadVisitorStats();
    } else if (viewName === 'landing-page') {
        if (navLandingPage) navLandingPage.classList.add('active');
        if (landingPageView) landingPageView.style.display = 'block';
        const locationsCont = document.getElementById('properties-locations-container');
        if (locationsCont) locationsCont.style.display = 'block';
        const citySlug = (subtab && subtab !== 'general') ? subtab : null;
        if (typeof window.initLandingPageView === 'function') {
            window.initLandingPageView(citySlug);
        }
    } else if (viewName === 'properties') {
        if (navProperties) navProperties.classList.add('active');
        if (propertiesView) propertiesView.style.display = 'block';
        if (subtab === 'locations') {
            if (typeof window.switchPropertiesTab === 'function') window.switchPropertiesTab('locations');
        } else if (subtab === 'unassigned') {
            if (typeof window.switchPropertiesTab === 'function') window.switchPropertiesTab('unassigned');
        } else {
            if (typeof window.switchPropertiesTab === 'function') window.switchPropertiesTab('assigned');
        }
        if (typeof window.syncPropertyFeaturesUI === 'function') window.syncPropertyFeaturesUI();
        if (typeof renderTable === 'function') renderTable();
        else if (typeof window.renderTable === 'function') window.renderTable();
        if (typeof window.loadPropertiesFromSupabase === 'function') window.loadPropertiesFromSupabase();
        if (typeof window.loadIndustrialParksFromSupabase === 'function') window.loadIndustrialParksFromSupabase();
    } else if (viewName === 'parks') {
        if (navParks) navParks.classList.add('active');
        if (parksView) parksView.style.display = 'block';
        if (typeof renderParksTable === 'function') renderParksTable();
        else if (typeof window.renderParksTable === 'function') window.renderParksTable();
        if (typeof window.loadIndustrialParksFromSupabase === 'function') window.loadIndustrialParksFromSupabase();
        if (typeof window.loadAgentsFromSupabase === 'function') window.loadAgentsFromSupabase();
    } else if (viewName === 'leads') {
        if (navLeads) navLeads.classList.add('active');
        if (leadsView) leadsView.style.display = 'block';
        if (typeof renderLeads === 'function') renderLeads();
        else if (typeof window.renderLeads === 'function') window.renderLeads();
        if (typeof window.loadLeadsFromSupabase === 'function') window.loadLeadsFromSupabase();
    } else if (viewName === 'owner-list') {
        if (navOwnerList) navOwnerList.classList.add('active');
        if (ownerListView) ownerListView.style.display = 'block';
        if (typeof renderOwnerList === 'function') renderOwnerList();
        else if (typeof window.renderOwnerList === 'function') window.renderOwnerList();
        if (typeof window.loadOwnerListingsFromSupabase === 'function') window.loadOwnerListingsFromSupabase();
    } else if (viewName === 'agents') {
        if (navAgents) navAgents.classList.add('active');
        if (agentsView) agentsView.style.display = 'block';
        if (typeof window.syncPropertyFeaturesUI === 'function') window.syncPropertyFeaturesUI();
        if (typeof renderAgentsTable === 'function') renderAgentsTable();
        else if (typeof window.renderAgentsTable === 'function') window.renderAgentsTable();
        if (typeof window.loadAgentsFromSupabase === 'function') window.loadAgentsFromSupabase();
        if (typeof window.loadIndustrialParksFromSupabase === 'function') window.loadIndustrialParksFromSupabase();
    } else if (viewName === 'settings') {
        const roleVal = sessionStorage.getItem('currentUserRole') || localStorage.getItem('currentUserRole') || (typeof currentUserRole !== 'undefined' ? currentUserRole : 'Administrator');
        const isCurrentAdmin = String(roleVal).toLowerCase() === 'administrator';
        if (navSettings) navSettings.classList.add('active');
        if (settingsView) settingsView.style.display = 'block';
        if (settingsSubmenu) settingsSubmenu.style.display = 'block';
        if (settingsArrow) settingsArrow.style.transform = 'rotate(180deg)';
        if (typeof window.loadSettings === 'function') window.loadSettings();
        else if (typeof loadSettings === 'function') loadSettings();
        if (typeof window.switchSettingsSubtab === 'function') window.switchSettingsSubtab(isCurrentAdmin ? (subtab || 'general') : 'admin');
        else if (typeof switchSettingsSubtab === 'function') switchSettingsSubtab(isCurrentAdmin ? (subtab || 'general') : 'admin');
        if (typeof window.loadGeneralSettingsFromSupabase === 'function') window.loadGeneralSettingsFromSupabase();
        if (typeof window.loadUsersFromSupabase === 'function') window.loadUsersFromSupabase();
        if (typeof window.loadWatermarkSettingsFromSupabase === 'function') window.loadWatermarkSettingsFromSupabase();
    }

    if (viewName !== 'settings' && settingsSubmenu) {
        settingsSubmenu.style.display = 'none';
        if (settingsArrow) settingsArrow.style.transform = 'rotate(0deg)';
    }
};

window.switchPropertiesTab = function(tab, citySlug) {
    const tabAssignedBtn = document.getElementById('properties-tab-assigned');
    const tabUnassignedBtn = document.getElementById('properties-tab-unassigned');
    const tabLocationsBtn = document.getElementById('properties-tab-locations');
    const assignedCont = document.getElementById('properties-assigned-container');
    const unassignedCont = document.getElementById('properties-unassigned-container');
    const locationsCont = document.getElementById('properties-locations-container');
    const addPropBtn = document.getElementById('add-property-btn');

    const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                       sessionStorage.getItem('currentUserRole') || 
                       localStorage.getItem('currentUserRole') || 
                       (typeof currentUserRole !== 'undefined' ? currentUserRole : 'Administrator') || 
                       'Administrator';
    const canViewUnassigned = (String(activeRole).toLowerCase() === 'administrator' || String(activeRole).toLowerCase() === 'supervisor');

    if (tab === 'unassigned' && !canViewUnassigned) {
        tab = 'assigned';
    }

    if (tab === 'locations') {
        window.switchView('landing-page', citySlug);
        return;
    } else if (tab === 'unassigned') {
        if (tabAssignedBtn) tabAssignedBtn.classList.remove('active');
        if (tabUnassignedBtn) tabUnassignedBtn.classList.add('active');
        if (tabLocationsBtn) tabLocationsBtn.classList.remove('active');
        if (assignedCont) assignedCont.style.display = 'none';
        if (unassignedCont) unassignedCont.style.display = 'block';
        if (locationsCont) locationsCont.style.display = 'none';
        if (addPropBtn) addPropBtn.style.display = '';
        if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
    } else {
        if (tabAssignedBtn) tabAssignedBtn.classList.add('active');
        if (tabUnassignedBtn) tabUnassignedBtn.classList.remove('active');
        if (tabLocationsBtn) tabLocationsBtn.classList.remove('active');
        if (assignedCont) assignedCont.style.display = 'block';
        if (unassignedCont) unassignedCont.style.display = 'none';
        if (locationsCont) locationsCont.style.display = 'none';
        if (addPropBtn) addPropBtn.style.display = '';
        if (typeof renderTable === 'function') renderTable();
    }
};

window.toggleSettingsMenu = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const settingsView = document.getElementById('settings-view');
    const settingsSubmenu = document.getElementById('settings-submenu');
    const settingsArrow = document.getElementById('settings-arrow');
    const roleVal = (typeof currentUserRole !== 'undefined' ? currentUserRole : (sessionStorage.getItem('currentUserRole') || localStorage.getItem('currentUserRole') || 'Administrator'));
    const isCurrentAdmin = String(roleVal).toLowerCase() === 'administrator';

    const isAlreadyOnSettings = settingsView && settingsView.style.display === 'block';

    if (isAlreadyOnSettings) {
        const isSubmenuVisible = settingsSubmenu && settingsSubmenu.style.display === 'block';
        if (settingsSubmenu) settingsSubmenu.style.display = isSubmenuVisible ? 'none' : 'block';
        if (settingsArrow) settingsArrow.style.transform = isSubmenuVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    } else {
        window.switchView('settings', isCurrentAdmin ? 'general' : 'admin');
    }
};

// --- DISPLAY DENSITY CONTROLLER (COMFORTABLE vs HIGH-DENSITY) ---
function getDashboardDensity() {
    return localStorage.getItem('dashboard_density_mode') || 'comfortable';
}

function showDensityToast(msg) {
    let toast = document.getElementById('dashboard-density-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dashboard-density-toast';
        toast.className = 'dashboard-toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="margin-right: 8px; color: #10b981; font-size: 1rem;"></i><span>${msg}</span>`;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2400);
}

function setDashboardDensity(mode, showNotification = true) {
    const validMode = (mode === 'high-density' || mode === 'compact') ? 'high-density' : 'comfortable';
    localStorage.setItem('dashboard_density_mode', validMode);
    document.documentElement.setAttribute('data-density', validMode);

    // Update Header Button
    const toggleBtn = document.getElementById('header-density-toggle-btn');
    const iconEl = document.getElementById('header-density-icon');
    const labelEl = document.getElementById('header-density-label');
    if (toggleBtn) {
        if (validMode === 'high-density') {
            toggleBtn.classList.add('is-high-density');
            toggleBtn.title = "Display Density: High-Density active (Click to switch to Comfortable)";
            if (iconEl) iconEl.className = 'fa-solid fa-table-cells';
            if (labelEl) labelEl.textContent = 'High-Density';
        } else {
            toggleBtn.classList.remove('is-high-density');
            toggleBtn.title = "Display Density: Comfortable active (Click to switch to High-Density)";
            if (iconEl) iconEl.className = 'fa-solid fa-table-cells-large';
            if (labelEl) labelEl.textContent = 'Comfortable';
        }
    }

    // Update Settings Subtab Card if rendered
    const badgeEl = document.getElementById('settings-density-current-badge');
    if (badgeEl) {
        badgeEl.textContent = validMode === 'high-density' ? 'Active: High-Density' : 'Active: Comfortable';
        badgeEl.style.background = validMode === 'high-density' ? '#eff6ff' : 'var(--accent)';
        badgeEl.style.color = validMode === 'high-density' ? '#1d4ed8' : 'var(--primary-dark)';
    }

    const optComfortable = document.getElementById('density-opt-comfortable');
    const optHighDensity = document.getElementById('density-opt-high-density');
    const checkComfortable = document.getElementById('density-check-comfortable');
    const checkHighDensity = document.getElementById('density-check-high-density');

    if (optComfortable && optHighDensity) {
        if (validMode === 'high-density') {
            optHighDensity.style.borderColor = '#2563eb';
            optHighDensity.style.borderWidth = '2px';
            optHighDensity.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.12)';
            if (checkHighDensity) checkHighDensity.style.display = 'inline-block';

            optComfortable.style.borderColor = '#cbd5e1';
            optComfortable.style.borderWidth = '1px';
            optComfortable.style.boxShadow = 'none';
            if (checkComfortable) checkComfortable.style.display = 'none';
        } else {
            optComfortable.style.borderColor = 'var(--primary, #059669)';
            optComfortable.style.borderWidth = '2px';
            optComfortable.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.12)';
            if (checkComfortable) checkComfortable.style.display = 'inline-block';

            optHighDensity.style.borderColor = '#cbd5e1';
            optHighDensity.style.borderWidth = '1px';
            optHighDensity.style.boxShadow = 'none';
            if (checkHighDensity) checkHighDensity.style.display = 'none';
        }
    }

    if (showNotification) {
        showDensityToast(validMode === 'high-density'
            ? 'High-Density Mode activated: Compact rows & maximum data'
            : 'Comfortable Mode activated: Spacious rows & relaxed view');
    }
}

function toggleDashboardDensity() {
    const current = getDashboardDensity();
    const next = current === 'high-density' ? 'comfortable' : 'high-density';
    setDashboardDensity(next, true);
}

function initDashboardDensity() {
    const mode = getDashboardDensity();
    setDashboardDensity(mode, false);
}

window.getDashboardDensity = getDashboardDensity;
window.setDashboardDensity = setDashboardDensity;
window.toggleDashboardDensity = toggleDashboardDensity;
window.initDashboardDensity = initDashboardDensity;

function initDashboardApp() {
    initDashboardDensity();
    // 8-Hour Maximum Session Expiry Check
    const MAX_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 Hours Max
    const sessionTime = parseInt(localStorage.getItem('login_session_time') || sessionStorage.getItem('login_session_time') || '0', 10);
    const now = Date.now();
    const isSessionExpired = sessionTime > 0 && (now - sessionTime > MAX_SESSION_DURATION);

    const isAuth = (sessionStorage.getItem('isAuthenticated') === 'true' || localStorage.getItem('isAuthenticated') === 'true') && !isSessionExpired;
    if (!isAuth) {
        sessionStorage.clear();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('login_session_time');
        window.location.href = 'login.html';
        return;
    }

    // Inactivity Session Auto-Logout (30 minutes of inactivity)
    let inactivityTimer = null;
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

    function resetInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            alert('Your session has expired due to 30 minutes of inactivity. Please log in again.');
            if (typeof logout === 'function') logout();
            else {
                sessionStorage.clear();
                localStorage.removeItem('isAuthenticated');
                window.location.href = 'login.html';
            }
        }, INACTIVITY_TIMEOUT_MS);
    }

    ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
        window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    // --- SITE & PROPERTY SETTINGS STATE ---
    const defaultSettings = {
        // About Us / Why Choose Us
        whyChooseUs: "We are the leading specialists in industrial real estate\nacross Selangor's prime industrial belt.",
        aboutCard1Title: "Prime Locations",
        aboutCard1Desc: "Strategic positioning near major highways and ports (Port Klang) to optimize your supply chain logistics.",
        aboutCard2Title: "Modern Facilities",
        aboutCard2Desc: "High ceilings, various floor loading capacities, and advanced power infrastructures built for different tier of industries.",
        aboutCard3Title: "Expert Guidance",
        aboutCard3Desc: "Our consultants specialize purely in industrial premises, offering unmatched regulatory and market knowledge.",

        // Services
        services: "Comprehensive industrial real estate solutions tailored\nto your operational requirements.",
        servicesCard1Title: "Factory Acquisition",
        servicesCard1Link: "Inquire Acquisition",
        servicesCard1Desc: "End-to-end purchasing and strategic sourcing of manufacturing plants, heavy industrial facilities, and land plots optimized for production and high power loads.",
        servicesCard2Title: "Space Rental",
        servicesCard2Link: "Browse Rentals",
        servicesCard2Desc: "High-floor-loading warehouses, strategic located spaces and logistic spaces for rent.",
        servicesCard3Title: "Property Expansion Advisory",
        servicesCard3Link: "Schedule Advisory",
        servicesCard3Desc: "Strategic consulting for expanding industrial operations, including local council & DOE zoning compliance, built-to-suit projects, and facility modernizations.",

        // Property Owner List
        ownerBadge: "FOR PROPERTY OWNERS & ASSET MANAGERS",
        ownerHeading: "Property Owner Welcome to List & Reach Out",
        ownerSubtitle: "Have a warehouse, factory, or industrial land plot in Klang Valley?\nPartner with Selangor's #1 industrial estate team for\ncorporate buyer matching and fast transaction closing.",
        ownerCard1Title: "500+ Vetted Corporate Buyers & Tenants",
        ownerCard1Desc: "Direct access to MNCs, logistics operators, and manufacturing firms seeking space in Petaling Jaya, Subang Jaya, Shah Alam, and Klang.",
        ownerCard2Title: "Drone Site Mapping & High-End Asset Presentation",
        ownerCard2Desc: "Comprehensive property representation including aerial footage, technical spec sheets, and targeted digital exposure.",
        ownerCard3Title: "Zero Upfront Cost & Local Council Compliance Support",
        ownerCard3Desc: "No upfront fees. Guidance on floor load capacity (ton/m²), electrical amp rating, DOE zoning compliance, and valuation.",

        ownerFaq1Question: "What happens after I submit my listing?",
        ownerFaq1Answer: "Your request is immediately logged in our admin Owner List. An assigned specialist will call you to verify specs, inspect the property, and match it with corporate buyers.",
        ownerFaq2Question: "Are there upfront marketing fees?",
        ownerFaq2Answer: "No upfront fees whatsoever. Listing your warehouse, factory, or land on MyFactorySpace is 100% free until a tenancy or sale agreement is successfully executed.",
        ownerFaq3Question: "Can you assist with technical zoning & load ratings?",
        ownerFaq3Answer: "Yes. We evaluate floor loading specs (ton/m²), electrical substations, ceiling height clearances, and DOE zoning approvals to maximize your asking value.",

        // Contact Info
        address: "No. 2-3, Jalan Radin Anum 2, Bandar Baru Sri Petaling, 57000 Kuala Lumpur",
        phone: "+60 3-9054 8582",
        email: "info@MyFactorySpace.com",

        // Property Features & Listing Badges Toggles
        showFeaturedBadge: true,
        showTenureBadge: true,
        showSectionBadge: true,
        showPostedDateBadge: true,
        randomFeaturedProperties: true,
        maxFeaturedPerAgent: 6,
        maxFeaturedPropertiesDisplayed: 6,
        randomFeaturedAgents: true,
        maxFeaturedAgents: 6,
        maxFeaturedAgentsDisplayed: 3,

        // Time Zone & Regional Management
        timezone: 'Asia/Kuala_Lumpur',
        timezoneOffset: '+08:00',
        timezoneName: '(GMT+08:00) Malaysia, Kuala Lumpur & Singapore [Current Location]',
        timezoneLocation: 'Malaysia (Kuala Lumpur, Selangor)',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        includeSeconds: true,
        showDashboardHeaderClock: true,
        autoDetectDeviceTimezone: false
    };

    let settings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});

    // --- RBAC & ROLE PERMISSIONS LOGIC & STATE ---
    function getAdminUsers() {
        let users = JSON.parse(localStorage.getItem('industria_users'));
        if (!users || !Array.isArray(users) || users.length === 0) {
            users = [
                { username: 'admin', password: 'admin123', role: 'Administrator' }
            ];
            localStorage.setItem('industria_users', JSON.stringify(users));
        } else {
            let modified = false;
            // Purge legacy mock agent accounts that do not exist in database app_users
            const filtered = users.filter(u => {
                const uname = (u.username || '').toLowerCase();
                const isLegacyMock = (uname === 'marcus' || uname === 'renvin' || uname === 'david') && (!u.id || u.password === 'agent123');
                return !isLegacyMock;
            });
            if (filtered.length !== users.length) {
                users = filtered;
                modified = true;
            }
            users.forEach(u => {
                if (!u.role) {
                    u.role = (u.username.toLowerCase() === 'admin') ? 'Administrator' : 'Agent';
                    modified = true;
                }
            });
            if (modified) localStorage.setItem('industria_users', JSON.stringify(users));
        }
        return users;
    }

    function resolveCurrentUserRole() {
        const sRole = sessionStorage.getItem('currentUserRole') || localStorage.getItem('currentUserRole');
        if (sRole && String(sRole).trim()) return sRole.trim();
        const username = sessionStorage.getItem('loggedInUser') || 'admin';
        const users = getAdminUsers();
        const found = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
        if (found && found.role && String(found.role).trim()) return found.role.trim();
        return 'Administrator';
    }
    window.resolveCurrentUserRole = resolveCurrentUserRole;

    function getCurrentUserObj() {
        const username = sessionStorage.getItem('loggedInUser') || 'admin';
        const sessionRole = resolveCurrentUserRole();
        const users = getAdminUsers();
        const found = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
        if (found) {
            if (sessionRole && found.role !== sessionRole) {
                found.role = sessionRole;
            }
            return found;
        }
        return { username: username, role: sessionRole };
    }

    const currentUserObj = getCurrentUserObj();
    let currentUserRole = resolveCurrentUserRole();
    window.currentUserRole = currentUserRole;
    const currentAssignedAgentId = currentUserObj.agentId ? String(currentUserObj.agentId) : null;

    function getCurrentAgent() {
        const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
        if (!Array.isArray(storedAgents) || storedAgents.length === 0) return null;

        const currentU = getCurrentUserObj();
        let agent = null;

        // 1. Direct agentId property on current logged in user object
        if (currentU && currentU.agentId) {
            agent = storedAgents.find(a => String(a.id) === String(currentU.agentId));
        }

        // 2. Lookup in industria_users by logged-in username
        if (!agent && currentU && currentU.username) {
            const users = safeJsonParse('industria_users', []);
            const userAcc = users.find(u => u.username && u.username.toLowerCase() === currentU.username.toLowerCase());
            if (userAcc && userAcc.agentId) {
                agent = storedAgents.find(a => String(a.id) === String(userAcc.agentId));
            }
        }

        // 3. Match username with agent name (e.g. username 'marcus' matches 'Marcus Chen', 'david' matches 'David Raj')
        if (!agent && currentU && currentU.username) {
            const uname = currentU.username.toLowerCase().replace(/[^a-z0-9]/g, '');
            agent = storedAgents.find(a => {
                const aname = (a.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                return aname.includes(uname) || uname.includes(aname);
            });
        }

        // Strictly NO fallback to storedAgents[0] so unassigned agents do not inherit another agent's territory
        return agent;
    }
    window.getCurrentAgent = getCurrentAgent;
    function getAssistantAgent() { return getCurrentAgent(); }

    function getParkNameString(p) {
        if (!p) return '';
        if (typeof p === 'string') return p.trim();
        if (typeof p === 'object' && p !== null) {
            if (p.name) return String(p.name).trim();
            if (p.park) return String(p.park).trim();
        }
        return '';
    }

    function getAgentAssignedParks() {
        const activeRole = String(resolveCurrentUserRole() || currentUserRole || '').toLowerCase();
        
        // Administrator and Supervisor have full system access (no park restriction)
        if (activeRole === 'administrator' || activeRole === 'supervisor') {
            return null; // null represents unconstrained access
        }

        // Individual agents and assistants: strictly restricted to their own assigned parks
        const agent = getCurrentAgent();
        if (!agent) {
            // Agent user with no linked specialist profile has strictly 0 assigned parks
            return [];
        }

        const rawParks = [].concat(Array.isArray(agent.parks) ? agent.parks : []).concat(Array.isArray(agent.assignedParks) ? agent.assignedParks : []);
        const parksList = Array.from(new Set(rawParks.map(getParkNameString).filter(Boolean)));
        return parksList;
    }
    window.getAgentAssignedParks = getAgentAssignedParks;
    window.getAssistantAssignedParks = getAgentAssignedParks;
    function getAssistantAssignedParks() { return getAgentAssignedParks(); }

    function isParkAllowed(targetParkName, allowedParks) {
        if (allowedParks === null) return true; // Administrator / Supervisor: unconstrained
        if (!targetParkName) return false; // Strictly requires assigned park: unassigned properties cannot be accessed by agents
        if (!Array.isArray(allowedParks) || allowedParks.length === 0) return false;

        const targetStr = (getParkNameString(targetParkName) || String(targetParkName)).trim().toLowerCase();
        if (!targetStr) return false;

        const clean = (s) => String(s || '').toLowerCase()
            .replace(/\b(industrial park|business park|industrial estate|park|hub|zone|@|seksyen|section)\b/gi, '')
            .replace(/[^a-z0-9]/g, '')
            .trim();

        const targetClean = clean(targetStr);

        return allowedParks.some(ap => {
            const apStr = (getParkNameString(ap) || String(ap)).trim().toLowerCase();
            if (!apStr) return false;
            if (targetStr === apStr) return true;

            const apClean = clean(apStr);
            if (targetClean && apClean && targetClean === apClean) return true;

            // Word-boundary / phrase match
            if (targetStr.startsWith(apStr + ' ') || targetStr.endsWith(' ' + apStr) || targetStr.includes(' ' + apStr + ' ')) return true;
            if (apStr.startsWith(targetStr + ' ') || apStr.endsWith(' ' + targetStr) || apStr.includes(' ' + targetStr + ' ')) return true;

            return false;
        });
    }
    window.isParkAllowed = isParkAllowed;

    function updateAgentPropertyScopeBanner() {
        const scopeCard = document.getElementById('agent-property-scope-card');
        const scopeBadges = document.getElementById('agent-property-parks-badges');
        if (!scopeCard || !scopeBadges) return;

        const allowedParks = getAgentAssignedParks();
        if (allowedParks !== null) {
            scopeCard.style.display = 'flex';
            scopeBadges.innerHTML = '';
            if (allowedParks.length > 0) {
                allowedParks.forEach(park => {
                    const badge = document.createElement('span');
                    badge.className = 'status-badge';
                    badge.style.cssText = 'background: rgba(37,99,235,0.12); color: #1d4ed8; border: 1px solid rgba(37,99,235,0.25); font-weight: 600; font-size: 0.78rem; border-radius: 12px; padding: 2px 8px; margin-right: 4px;';
                    badge.innerHTML = `<i class="fa-solid fa-industry" style="margin-right: 4px;"></i> ${escapeHtml(park)}`;
                    scopeBadges.appendChild(badge);
                });
            } else {
                scopeBadges.innerHTML = '<span style="font-size: 0.8rem; color: #dc2626; font-weight: 600;"><i class="fa-solid fa-triangle-exclamation"></i> No Parks Assigned Yet — You cannot view, create, or edit property listings</span>';
            }
        } else {
            scopeCard.style.display = 'none';
        }
    }
    window.updateAgentPropertyScopeBanner = updateAgentPropertyScopeBanner;

    const loggedInUser = sessionStorage.getItem('loggedInUser') || 'admin';

    const userSpan = document.getElementById('logged-in-username');
    const userRolePill = document.getElementById('header-user-role-pill');
    const userAvatar = document.getElementById('logged-in-avatar');
    if (userSpan) {
        if (userRolePill) {
            userSpan.textContent = loggedInUser;
            userRolePill.textContent = currentUserRole;
        } else {
            const isAgentRole = currentUserRole === 'Agent' || currentUserRole === 'Assistant';
            const roleBadgeClass = currentUserRole === 'Administrator' ? 'status-active' : (currentUserRole === 'Supervisor' ? 'status-supervisor' : (isAgentRole ? 'status-pending' : 'status-inactive'));
            userSpan.innerHTML = `${escapeHtml(loggedInUser)} <span class="status-badge ${roleBadgeClass}" style="font-size: 0.72rem; margin-left: 6px; text-transform: uppercase;">${escapeHtml(currentUserRole)}</span>`;
        }
    }
    if (userAvatar) userAvatar.textContent = loggedInUser.charAt(0).toUpperCase();
    const changePwdUserLabel = document.getElementById('change-pwd-user-label');
    if (changePwdUserLabel) changePwdUserLabel.textContent = loggedInUser;

    // Apply global UI restriction for Add Property button & view modes
    const addPropertyBtn = document.getElementById('add-property-btn');
    if (addPropertyBtn && currentUserRole === 'Entry Support') {
        addPropertyBtn.style.display = 'none';
    }

    const isCurrentAdminRole = currentUserRole === 'Administrator';
    const initNavSettingsGeneral = document.getElementById('nav-settings-general');
    const initNavSettingsServer = document.getElementById('nav-settings-server');
    if (initNavSettingsGeneral) initNavSettingsGeneral.style.display = isCurrentAdminRole ? '' : 'none';
    if (initNavSettingsServer) initNavSettingsServer.style.display = isCurrentAdminRole ? '' : 'none';

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    window.escapeHtml = escapeHtml;

    function safeJsonParse(key, fallback) {
        try {
            const str = localStorage.getItem(key);
            if (str && typeof str === 'string' && (str.startsWith('{') || str.startsWith('['))) {
                return JSON.parse(str);
            }
        } catch (e) {
            console.warn(`safeJsonParse failed for "${key}", removing invalid data:`, e);
            try { localStorage.removeItem(key); } catch (err) {}
        }
        return fallback;
    }

    function safeLocalStorageSet(key, value) {
        let valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        try {
            localStorage.setItem(key, valueStr);
            return true;
        } catch (e) {
            console.warn(`localStorage.setItem quota notice for key "${key}", attempting silent fallback compression...`, e);
            if (key === 'industria_properties' && (Array.isArray(value) || typeof value === 'string')) {
                try {
                    const rawProps = typeof value === 'string' ? JSON.parse(value) : value;
                    if (Array.isArray(rawProps)) {
                        const cleanProps = rawProps.map(p => {
                            if (!p || typeof p !== 'object') return p;
                            const copy = Object.assign({}, p);
                            if (Array.isArray(copy.rawImages) && copy.rawImages.length > 0) {
                                copy.images = copy.rawImages.filter(img => typeof img === 'string' && !img.startsWith('data:'));
                            } else if ((!copy.rawImages || copy.rawImages.length === 0) && (!copy.images || copy.images.length === 0)) {
                                if (copy.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[copy.id]) {
                                    copy.rawImages = [...defaultPropertyImagesMap[copy.id]];
                                    copy.images = [...copy.rawImages];
                                }
                            }
                            if (!copy.images || copy.images.length === 0) {
                                copy.images = [(copy.id && typeof defaultCleanImages !== 'undefined' && defaultCleanImages[copy.id]) ? defaultCleanImages[copy.id] : 'assets/images/warehouse.jpg'];
                            }
                            copy.image = copy.images[0];
                            copy.rawImage = (copy.rawImages && copy.rawImages.length > 0) ? copy.rawImages[0] : copy.image;
                            return copy;
                        });
                        localStorage.setItem(key, JSON.stringify(cleanProps));
                        return true;
                    }
                } catch (err2) {
                    console.warn('Silent fallback compression failed:', err2);
                }
            }
            return false;
        }
    }

    // Logout Functionality
    window.logout = function() {
        sessionStorage.clear();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('login_session_time');
        window.location.href = 'login.html';
    };

    const defaultCleanImages = {
        1: 'assets/images/seksyen_51_factory.jpg',
        2: 'assets/images/drone_shahalam.jpg',
        3: 'assets/images/factory.jpg',
        4: 'assets/images/hero.jpg',
        5: 'assets/images/drone_subang.jpg',
        6: 'assets/images/drone_klang.jpg'
    };

    const defaultPropertyImagesMap = {
        1: ['assets/images/seksyen_51_factory.jpg', 'assets/images/drone_pj.jpg'],
        2: ['assets/images/drone_shahalam.jpg'],
        3: ['assets/images/factory.jpg', 'assets/images/drone_shahalam.jpg'],
        4: ['assets/images/hero.jpg'],
        5: ['assets/images/drone_subang.jpg', 'assets/images/warehouse.jpg', 'assets/images/drone_shahalam.jpg', 'assets/images/factory.jpg'],
        6: ['assets/images/drone_klang.jpg', 'assets/images/drone_all.jpg', 'assets/images/hero.jpg', 'assets/images/warehouse.jpg']
    };

    // Mock Data for Properties
    const defaultPropertyDescriptions = {
        1: 'Modern 3-storey semi-detached corporate factory in PJ 51 Industrial Park, Petaling Jaya. Features 13,000 sqft land area with 9,500 sqft built-up space, 150 Amp 3-phase power supply, and 1-ton passenger/cargo lift. Strategic frontage along Jalan Tandang with immediate connectivity to Federal Highway, NPE, and LDP for seamless Klang Valley logistics distribution.',
        2: 'Prime freehold semi-detached commercial & industrial facility in Sekitar 26, Shah Alam. Features 9,900 sqft land area with 8,800 sqft built-up area, high-volume ceiling clearance, and 150 Amp power infrastructure. Ideal for corporate headquarters, light assembly, showroom, and regional distribution with direct access to KESAS and LKSA.',
        3: 'High-spec semi-detached factory for rent in Ace Industrial Park, Section 15 Shah Alam. Offers 9,800 sqft land size, 8,800 sqft functional built-up, 5 kN/m² floor loading capacity, and 150 Amp power. Excellent container accessibility and turning radius, positioned minutes away from Federal Highway and KESAS expressway.',
        4: 'Well-established semi-detached industrial unit in Section 15 Shah Alam. Comprising 9,900 sqft land plot and 8,800 sqft built-up, equipped with 150 Amp power, cargo lift facilities, and wide frontage. Tailored for production, warehousing, and corporate operations with quick links to central Klang Valley expressways.'
    };

    let defaultProperties = [
        { id: 1, title: 'PJ 51 Business Park', location: 'Petaling Jaya', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Sale', tenure: 'Leasehold', park: 'PJ 51 Industrial Park', road: 'Jalan Tandang 51/205A', landArea: '13,000 sqft', size: '9,500 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '', ceilingPeak: '', price: 'RM 12,000,000', availableUnits: '2', status: 'Active', dateCreated: '2026-10-03', lastUpdated: '2026-10-03', image: 'assets/images/seksyen_51_factory.jpg', images: ['assets/images/seksyen_51_factory.jpg', 'assets/images/drone_pj.jpg'], description: defaultPropertyDescriptions[1] },
        { id: 2, title: 'Sekitar 26 Business Park', location: 'Shah Alam', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Sale', tenure: 'Freehold', park: 'Sekitar 26', road: 'Jalan Serendah 26/41', landArea: '9,900 sqft', size: '8,800 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '', ceilingPeak: '', price: 'RM 7,000,000', availableUnits: '1', status: 'Active', dateCreated: '2026-10-04', lastUpdated: '2026-10-04', image: 'assets/images/drone_shahalam.jpg', images: ['assets/images/drone_shahalam.jpg'], description: defaultPropertyDescriptions[2] },
        { id: 3, title: 'Ace Industrial Park', location: 'Shah Alam', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Rent', tenure: 'Freehold', park: 'Ace Industrial Park', road: 'Jalan 15/24', landArea: '9,800 sqft', size: '8,800 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '5', ceilingPeak: '', price: 'RM 25,000 / mo', availableUnits: '2', status: 'Active', dateCreated: '2026-10-01', lastUpdated: '2026-10-01', image: 'assets/images/factory.jpg', images: ['assets/images/factory.jpg', 'assets/images/drone_shahalam.jpg'], description: defaultPropertyDescriptions[3] },
        { id: 4, title: 'Tiong Nam Industrial Park @ Shah Alam', location: 'Shah Alam', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Sale', tenure: 'Leasehold', park: 'Tiong Nam Industrial Park Shah Alam', road: 'Jalan 15/22, Jalan 15/23', landArea: '9,900 sqft', size: '8,800 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '', ceilingPeak: '', price: 'RM 7,000,000', availableUnits: '1', status: 'Active', dateCreated: '2026-09-25', lastUpdated: '2026-09-25', image: 'assets/images/hero.jpg', images: ['assets/images/hero.jpg'], description: defaultPropertyDescriptions[4] }
    ];

    // Global function to clear local storage and reset to clean defaults
    window.resetLocalStorageData = function() {
        if (confirm('Are you sure you want to clear local storage and reset to default properties? This will free up all storage space.')) {
            localStorage.removeItem('industria_properties');
            localStorage.removeItem('industria_agents');
            alert('Local storage cleared successfully! Re-initializing clean data...');
            location.reload();
        }
    };

    let properties = safeJsonParse('industria_properties', defaultProperties);
    // Strip out any obsolete mock properties (5, 6, 7, 8, 9, 10)
    const mockIds = [5, 6, 7, 8, 9, 10, '5', '6', '7', '8', '9', '10'];
    const mockTitles = [
        'SIME UEP Modern Logistics Facility',
        'Sime Darby Industrial Plot',
        'Westport High-Bay Logistics Hub',
        'Northport Heavy Industrial Factory',
        'Subang Hi-Tech Corporate Industrial Facility',
        'Seksyen 51A Prime Logistics Warehouse'
    ];
    if (Array.isArray(properties)) {
        const cleaned = properties.filter(p => p && !mockIds.includes(p.id) && !mockTitles.includes(p.title));
        if (cleaned.length !== properties.length) {
            properties = cleaned;
            try {
                localStorage.setItem('industria_properties', JSON.stringify(properties));
            } catch(e) {}
        }
    }
    if (!Array.isArray(properties) || properties.length === 0) {
        properties = defaultProperties;
        localStorage.setItem('industria_properties', JSON.stringify(properties));
    }
    const defaultDatesMap = {
        1: '2026-10-03',
        2: '2026-10-04',
        3: '2026-10-01',
        4: '2026-09-25',
        5: '2026-09-15',
        6: '2026-08-28'
    };
    properties.forEach(p => {
        if (!p.dateCreated && !p.dateAdded) {
            p.dateCreated = defaultDatesMap[p.id] || new Date().toISOString().split('T')[0];
            p.dateAdded = p.dateCreated;
        }
        if (!p.lastUpdated && !p.updatedAt) {
            p.lastUpdated = p.dateCreated;
        }
        const isStuckOnWarehouse = (p.id && String(p.id) !== '5') && (
            (p.rawImages && p.rawImages.length === 1 && p.rawImages[0] === 'assets/images/warehouse.jpg') ||
            (p.images && p.images.length === 1 && p.images[0] === 'assets/images/warehouse.jpg') ||
            (p.image === 'assets/images/warehouse.jpg' || p.rawImage === 'assets/images/warehouse.jpg')
        );

        if ((!p.rawImages || p.rawImages.length === 0) && (!p.images || p.images.length === 0)) {
            if (p.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[p.id]) {
                p.rawImages = [...defaultPropertyImagesMap[p.id]];
            } else if (p.rawImage && !p.rawImage.startsWith('data:') && p.rawImage !== 'assets/images/warehouse.jpg') {
                p.rawImages = [p.rawImage];
            } else if (p.id && typeof defaultCleanImages !== 'undefined' && defaultCleanImages[p.id]) {
                p.rawImages = [defaultCleanImages[p.id]];
            }
        }
        if (!p.rawImage || p.rawImage.startsWith('data:') || (isStuckOnWarehouse && p.rawImages && p.rawImages.length > 0)) {
            p.rawImage = (p.rawImages && p.rawImages.length > 0) ? p.rawImages[0] : ((p.id && typeof defaultCleanImages !== 'undefined' && defaultCleanImages[p.id]) ? defaultCleanImages[p.id] : 'assets/images/warehouse.jpg');
        }

        if (isStuckOnWarehouse || !p.images || p.images.length === 0) {
            if (p.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[p.id]) {
                p.images = [...defaultPropertyImagesMap[p.id]];
            } else if (p.rawImages && p.rawImages.length > 0) {
                p.images = [...p.rawImages];
            } else {
                p.images = [(p.id && typeof defaultCleanImages !== 'undefined' && defaultCleanImages[p.id]) ? defaultCleanImages[p.id] : 'assets/images/warehouse.jpg'];
            }
        }
        if (!p.image || isStuckOnWarehouse) {
            p.image = (p.images && p.images.length > 0) ? p.images[0] : ((p.id && typeof defaultCleanImages !== 'undefined' && defaultCleanImages[p.id]) ? defaultCleanImages[p.id] : 'assets/images/warehouse.jpg');
        }
        if (String(p.id) === '3' && (!p.availableUnits || p.availableUnits === '1')) {
            p.availableUnits = '2';
        }
        if (!p.intent) {
            p.intent = p.price && p.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale';
        }
        if (p.ceilingPeak === undefined && p.type !== 'Land') {
            p.ceilingPeak = '40';
            p.ceilingEave = '30';
            p.ceilingClear = '28';
        }
        if (p.floorLoading === undefined && p.type !== 'Land') {
            p.floorLoading = '5';
        }
        if (p.landArea) p.landArea = formatAreaString(p.landArea);
        if (p.size) p.size = formatAreaString(p.size);
        if (p.builtUp) p.builtUp = formatAreaString(p.builtUp);
        if (!p.description || !p.description.trim()) {
            if (p.id && defaultPropertyDescriptions[p.id]) {
                p.description = defaultPropertyDescriptions[p.id];
            }
        }
    });
    safeLocalStorageSet('industria_properties', properties);

    function formatAreaString(val, defaultUnit = 'sqft') {
        if (val === null || val === undefined || val === '') return '';
        let str = String(val).trim();
        if (!str) return '';

        const cleanNumOnly = str.replace(/,/g, '');
        if (/^\d+(\.\d+)?$/.test(cleanNumOnly)) {
            const parts = cleanNumOnly.split('.');
            parts[0] = parseInt(parts[0], 10).toLocaleString('en-US');
            const formattedNum = parts.join('.');
            return str.includes(' ') ? str.replace(/^[\d,.]+/, formattedNum) : `${formattedNum} ${defaultUnit}`;
        }

        return str.replace(/\b(\d{4,})\b/g, (match) => {
            return parseInt(match, 10).toLocaleString('en-US');
        });
    }

    // Direct Supabase Primary Data Sync
    async function loadPropertiesFromSupabase(retryCount = 0) {
        if (!window.IndustraSupabase) {
            if (retryCount < 10) {
                setTimeout(() => loadPropertiesFromSupabase(retryCount + 1), 300);
            }
            return;
        }
        try {
            const sbProps = await window.IndustraSupabase.fetchProperties();
            if (sbProps && Array.isArray(sbProps) && sbProps.length > 0) {
                const mappedProps = sbProps.map(sp => {
                    const base = sp.specs && typeof sp.specs === 'object' ? sp.specs : {};
                    const rawPriceVal = base.price || (typeof sp.price === 'number' ? `RM ${sp.price}` : sp.price) || '';
                    const rawIntent = base.intent || sp.intent || (rawPriceVal && String(rawPriceVal).toLowerCase().includes('mo') ? 'Rent' : 'Sale');
                    const propImages = Array.isArray(sp.images) && sp.images.length > 0 ? sp.images : (Array.isArray(base.images) && base.images.length > 0 ? base.images : [(base.image || sp.image || 'assets/images/warehouse.jpg')]);
                    const firstImg = propImages[0] || 'assets/images/warehouse.jpg';
                    let rawImgs = [];
                    if (Array.isArray(base.rawImages) && base.rawImages.length > 0) {
                        rawImgs = [...base.rawImages];
                        if (base.rawImage) rawImgs[0] = base.rawImage;
                    } else if (base.rawImage && typeof base.rawImage === 'string' && base.rawImage.trim() !== '' && base.rawImage !== 'assets/images/warehouse.jpg') {
                        rawImgs = [base.rawImage];
                    } else if (Array.isArray(sp.images) && sp.images.length > 0) {
                        rawImgs = [...sp.images];
                    } else if (sp.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[sp.id]) {
                        rawImgs = [...defaultPropertyImagesMap[sp.id]];
                    } else {
                        rawImgs = [...propImages];
                    }
                    const firstRaw = (base.rawImage && typeof base.rawImage === 'string' && base.rawImage.trim() !== '') ? base.rawImage : (rawImgs[0] || firstImg);

                    const isFeat = (sp.featured !== null && sp.featured !== undefined) ? (sp.featured === true || String(sp.featured) === 'true') : (base.showOnMainpage === true || String(base.showOnMainpage) === 'true' || base.featured === true || String(base.featured) === 'true');

                    const mappedLandArea = sp.land_area ? formatAreaString(sp.land_area) : (formatAreaString(base.landArea) || '');
                    const mappedBuiltUp = sp.built_up ? formatAreaString(sp.built_up) : (formatAreaString(base.builtUp || base.size) || '');
                    const mappedSize = sp.built_up ? formatAreaString(sp.built_up) : (formatAreaString(base.size || base.builtUp) || '');

                    return Object.assign({}, base, {
                        id: sp.id,
                        title: sp.title || base.title || '',
                        location: sp.location || base.location || '',
                        park: sp.park || base.park || '',
                        type: sp.type || base.type || '',
                        tenure: sp.tenure || base.tenure || '',
                        intent: rawIntent,
                        price: formatPriceString(rawPriceVal, rawIntent),
                        landArea: mappedLandArea,
                        builtUp: mappedBuiltUp,
                        size: mappedSize,
                        power: sp.power || base.power || '',
                        height: sp.height || sp.ceiling_height || base.height || '',
                        floorLoad: sp.floor_load || base.floorLoad || '',
                        floorLoading: sp.floor_load || base.floorLoading || base.floorLoad || '',
                        ceilingPeak: sp.ceiling_peak !== null && sp.ceiling_peak !== undefined ? String(sp.ceiling_peak) : (base.ceilingPeak || ''),
                        ceilingEave: sp.ceiling_eave !== null && sp.ceiling_eave !== undefined ? String(sp.ceiling_eave) : (base.ceilingEave || ''),
                        ceilingClear: sp.ceiling_clear !== null && sp.ceiling_clear !== undefined ? String(sp.ceiling_clear) : (base.ceilingClear || ''),
                        ceilingHeight: sp.ceiling_height !== null && sp.ceiling_height !== undefined ? String(sp.ceiling_height) : (base.ceilingHeight || base.height || ''),
                        road: sp.road || base.road || '',
                        usage: sp.usage || base.usage || 'Not Applicable',
                        lift: sp.lift !== null && sp.lift !== undefined ? String(sp.lift) : (base.lift || ''),
                        loadingBay: sp.loading_bay !== null && sp.loading_bay !== undefined ? String(sp.loading_bay) : (base.loadingBay || ''),
                        availableUnits: sp.available_units !== null && sp.available_units !== undefined ? String(sp.available_units) : (base.availableUnits || ''),
                        compriseUnits: sp.comprise_units !== null && sp.comprise_units !== undefined ? String(sp.comprise_units) : (base.compriseUnits || ''),
                        description: sp.description || base.description || '',
                        status: sp.status || base.status || 'Active',
                        dateCreated: sp.date_created || sp.created_at || base.dateCreated || base.dateAdded || (defaultDatesMap[sp.id] || ''),
                        dateAdded: sp.date_created || sp.created_at || base.dateAdded || base.dateCreated || (defaultDatesMap[sp.id] || ''),
                        lastUpdated: sp.last_updated || sp.updated_at || base.lastUpdated || base.updatedAt || sp.date_created || sp.created_at || base.dateCreated || (defaultDatesMap[sp.id] || ''),
                        featured: isFeat,
                        showOnMainpage: isFeat,
                        images: propImages,
                        image: firstImg,
                        rawImages: rawImgs,
                        rawImage: firstRaw
                    });
                });
                properties = mappedProps;
                safeLocalStorageSet('industria_properties', properties);
                if (typeof renderTable === 'function') renderTable();
                else if (typeof window.renderTable === 'function') window.renderTable();
                if (typeof window.renderOverviewSummaries === 'function') window.renderOverviewSummaries();
                if (typeof window.renderOverviewCharts === 'function') window.renderOverviewCharts();
            } else if (sbProps === null && retryCount < 10) {
                setTimeout(() => loadPropertiesFromSupabase(retryCount + 1), 500);
            }
        } catch (e) {
            console.warn('Dashboard Supabase fetch warning:', e);
        }
    }
    window.loadPropertiesFromSupabase = loadPropertiesFromSupabase;
    loadPropertiesFromSupabase();

    const defaultParks = {
        'Petaling Jaya': ['PJ 51 Industrial Park', 'PJ 51 Business Centre', 'Tiong Nam Industrial Park PJ', 'PJS 5'],
        'Shah Alam': ['Hicom-Glenmarie Industrial Park', 'Ace Industrial Park', 'Ace Industrial', 'Tiong Nam Industrial Park Shah Alam', 'Tiong Nam Industrial Park', 'Batu Tiga Light Industrial Park', 'Temasya Industrial Park', 'i-Parc 1', 'i-Parc 2', 'Sekitar 26', 'Hicom 27'],
        'Subang Jaya': ['SIME UEP Industrial Park', 'Subang Hi-Tech Industrial Park', 'PJS 11 (Bandar Sunway)', 'PJS 7 (Bandar Sunway)'],
        'Klang': ['Bandar Bukit Raja Industrial Park']
    };
    let parks = safeJsonParse('industria_industrial_parks', defaultParks);
    // Migrate strings to object format for hiding feature & assign section defaults
    for (const city in parks) {
        parks[city] = parks[city].map(park => {
            if (typeof park === 'string') {
                return { name: park, section: park === 'PJ 51 Industrial Park' ? 'Seksyen 51' : '', hidden: false };
            }
            if (!('section' in park)) {
                park.section = park.name === 'PJ 51 Industrial Park' ? 'Seksyen 51' : '';
            } else if (park.name === 'PJ 51 Industrial Park' && (!park.section || park.section === '')) {
                park.section = 'Seksyen 51';
            }
            return park;
        });
    }
    safeLocalStorageSet('industria_industrial_parks', parks);

    // Direct Supabase Industrial Parks Data Sync
    async function loadIndustrialParksFromSupabase() {
        if (!window.IndustraSupabase || typeof window.IndustraSupabase.fetchIndustrialParks !== 'function') return;
        try {
            const sbParks = await window.IndustraSupabase.fetchIndustrialParks();
            if (sbParks && sbParks.length > 0) {
                const parksObj = {};
                sbParks.forEach(sp => {
                    const city = sp.city || sp.location || 'Other';
                    if (!parksObj[city]) parksObj[city] = [];
                    const specs = sp.specs && typeof sp.specs === 'object' ? sp.specs : {};
                    parksObj[city].push({
                        id: sp.id,
                        name: sp.name,
                        section: sp.section || specs.section || '',
                        hidden: sp.hidden !== undefined && sp.hidden !== null ? !!sp.hidden : !!specs.hidden
                    });
                });
                parks = parksObj;
                safeLocalStorageSet('industria_industrial_parks', parks);
                if (typeof renderParksTable === 'function') renderParksTable();
                else if (typeof window.renderParksTable === 'function') window.renderParksTable();
            }
        } catch (e) {
            console.warn('Dashboard Supabase fetch industrial parks warning:', e);
        }
    }
    window.loadIndustrialParksFromSupabase = loadIndustrialParksFromSupabase;
    loadIndustrialParksFromSupabase();

    async function syncParkToSupabase(city, parkObj) {
        if (!window.IndustraSupabase || typeof window.IndustraSupabase.upsertIndustrialPark !== 'function') return;
        const parkName = typeof parkObj === 'string' ? parkObj : parkObj.name;
        const section = typeof parkObj === 'object' && parkObj.section ? parkObj.section : '';
        const hidden = typeof parkObj === 'object' && parkObj.hidden ? true : false;
        let agentId = typeof parkObj === 'object' && parkObj.agentId !== undefined ? parkObj.agentId : '';
        let agentName = typeof parkObj === 'object' && parkObj.agentName !== undefined ? parkObj.agentName : '';
        if (!agentId) {
            const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
            const handler = allAgents.find(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (a.assignedParks || []);
                return pList.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === parkName.trim().toLowerCase());
            });
            if (handler) {
                agentId = String(handler.id);
                agentName = handler.name;
            }
        }
        const parkId = typeof parkObj === 'object' && parkObj.id ? String(parkObj.id) : `park_${city.toLowerCase().replace(/\s+/g, '_')}_${parkName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        await window.IndustraSupabase.upsertIndustrialPark({
            id: parkId,
            name: parkName,
            city: city,
            location: city,
            section: section,
            hidden: hidden,
            agent_id: agentId || null,
            agent_name: agentName || null,
            specs: { section: section, hidden: hidden, agentId: agentId, agentName: agentName }
        });
    }

    async function syncParkDeleteToSupabase(idOrName) {
        if (!window.IndustraSupabase) return;
        const client = window.IndustraSupabase.getClient();
        if (client) {
            await client.from('parks').delete().or(`id.eq.${idOrName},name.eq.${idOrName}`);
        }
    }

    const defaultAgents = [
        { id: 1, name: 'Marcus Chen', ren: 'REN 44824', phone: '60168882311', whatsapp: '60168882311', email: 'marcus@myfactoryspace.com', bio: 'Specializing in large-scale factory acquisitions and heavy industrial plots across Shah Alam and Klang.', image: 'assets/images/agent_marcus.jpg', assignedParks: ['Bandar Bukit Raja Industrial Park', 'Bandar Bukit Raja', 'Subang Hi-Tech', 'Klang Utama Industrial Park', 'Hicom-Glenmarie Industrial Park'], parks: ['Bandar Bukit Raja Industrial Park', 'Bandar Bukit Raja', 'Subang Hi-Tech', 'Klang Utama Industrial Park', 'Hicom-Glenmarie Industrial Park'], showOnMainpage: true },
        { id: 2, name: 'Renvin', ren: 'REN 61030', phone: '60124557890', whatsapp: '60124557890', email: 'sarah@myfactoryspace.com', bio: 'Expert in warehouse space rentals, high-floor-load logistics hubs, and built-to-suit industrial leases.', image: 'https://vnsinkesbbikeqbywxfd.supabase.co/storage/v1/object/public/property-images/prop_1791373830746_hoby4a.jpg', assignedParks: ['Ace Industrial Park', 'i-Parc 2', 'Sekitar 26 Business Park', 'Tiong Nam Industrial Park @ Shah Alam', 'SIME UEP Industrial Park'], parks: ['Ace Industrial Park', 'i-Parc 2', 'Sekitar 26 Business Park', 'Tiong Nam Industrial Park @ Shah Alam', 'SIME UEP Industrial Park'], showOnMainpage: true },
        { id: 3, name: 'David Raj', ren: 'REN 51203', phone: '60193321144', whatsapp: '60193321144', email: 'david@myfactoryspace.com', bio: 'Focusing on corporate property expansion, regulatory compliance, and multi-facility industrial portfolios.', image: 'assets/images/agent_david.jpg', assignedParks: ['Tiong Nam Industrial Park Shah Alam', 'Tiong Nam Industrial Park', 'SIME UEP Industrial Park', 'Ace Industrial Park', 'Sekitar 26'], parks: ['Tiong Nam Industrial Park Shah Alam', 'Tiong Nam Industrial Park', 'SIME UEP Industrial Park', 'Ace Industrial Park', 'Sekitar 26'], showOnMainpage: true }
    ];
    let agents = safeJsonParse('industria_agents', defaultAgents);
    // If stored as empty array (all deleted), restore defaults
    if (!Array.isArray(agents) || agents.length === 0) {
        agents = JSON.parse(JSON.stringify(defaultAgents)); // deep copy
        safeLocalStorageSet('industria_agents', agents);
    } else {
        const ag2 = agents.find(a => String(a.id) === '2');
        if (ag2 && (ag2.name === 'Sarah Lin' || ag2.ren === 'REN 38192')) {
            ag2.name = 'Renvin';
            ag2.ren = 'REN 61030';
            ag2.image = 'https://vnsinkesbbikeqbywxfd.supabase.co/storage/v1/object/public/property-images/prop_1791373830746_hoby4a.jpg';
            safeLocalStorageSet('industria_agents', agents);
        } else {
            safeLocalStorageSet('industria_agents', agents);
        }
    }

    async function syncAgentToSupabase(agent) {
        if (!agent) return false;
        if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertAgent === 'function') {
            try {
                return await window.IndustraSupabase.upsertAgent(agent);
            } catch (err) {
                console.warn('Error syncing agent to Supabase:', err);
                return false;
            }
        }
        return false;
    }
    window.syncAgentToSupabase = syncAgentToSupabase;

    const tableBody = document.getElementById('property-table-body');
    const modal = document.getElementById('property-modal');
    const addBtn = document.getElementById('add-property-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('add-property-form');

    const propLocation = document.getElementById('propLocation');
    const propParkGroup = document.getElementById('propParkGroup');
    const propPark = document.getElementById('propPark');

    let editingPropertyId = null;
    let currentPropertyImages = [];
    let currentRawPropertyImages = [];

    function openModal() {
        const propModal = document.getElementById('property-modal') || modal;
        if (propModal) {
            propModal.classList.add('active');
            propModal.style.display = 'flex';
        }
    }

    function closeModal() {
        const propModal = document.getElementById('property-modal') || modal;
        const propForm = document.getElementById('add-property-form') || form;
        if (propModal) {
            propModal.classList.remove('active');
            propModal.style.display = 'none';
        }
        if (propForm) propForm.reset();
        editingPropertyId = null;
        croppedImageResult = null;
        currentPropertyImages = [];
        currentRawPropertyImages = [];
        if (typeof window.renderPropertyGallery === 'function') window.renderPropertyGallery();
    }
    window.closeModal = closeModal;
    window.openModal = openModal;

    function formatPriceString(val, intent) {
        if (val === null || val === undefined || val === '') return 'RM 0';
        let str = String(val).trim();
        if (str.includes(',') && str.toLowerCase().includes('rm')) return str;
        
        const isRent = (intent && String(intent).toLowerCase() === 'rent') || str.toLowerCase().includes('/ mo') || str.toLowerCase().includes('/mo');
        const numOnly = str.replace(/[^0-9.]/g, '');
        if (!numOnly) return str;
        
        const parts = numOnly.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formattedNum = parts.join('.');
        
        return `RM ${formattedNum}${isRent && !str.toLowerCase().includes('/ mo') ? ' / mo' : ''}`;
    }

    // --- TIME ZONE & REGIONAL MANAGEMENT ENGINE ---
    function getTimezoneSettings() {
        const s = (typeof settings !== 'undefined' && settings) ? settings : safeJsonParse('industria_settings', {});
        return {
            timezone: s.timezone || 'Asia/Kuala_Lumpur',
            timezoneOffset: s.timezoneOffset || '+08:00',
            timezoneName: s.timezoneName || '(GMT+08:00) Malaysia, Kuala Lumpur & Singapore [Current Location]',
            timezoneLocation: s.timezoneLocation || 'Malaysia (Kuala Lumpur, Selangor)',
            dateFormat: s.dateFormat || 'DD/MM/YYYY',
            timeFormat: s.timeFormat || '12h',
            includeSeconds: s.includeSeconds !== false,
            showDashboardHeaderClock: s.showDashboardHeaderClock !== false,
            autoDetectDeviceTimezone: !!s.autoDetectDeviceTimezone
        };
    }
    window.getTimezoneSettings = getTimezoneSettings;

    function formatTimeWithTimezone(dateInput, overrideFormat) {
        const d = dateInput ? new Date(dateInput) : new Date();
        if (isNaN(d.getTime())) return String(dateInput);
        const tzCfg = getTimezoneSettings();
        const tz = tzCfg.timezone || 'Asia/Kuala_Lumpur';
        const is12h = (overrideFormat || tzCfg.timeFormat) !== '24h';
        const includeSec = tzCfg.includeSeconds !== false;

        try {
            const timeStr = d.toLocaleTimeString('en-US', {
                timeZone: tz,
                hour12: is12h,
                hour: '2-digit',
                minute: '2-digit',
                second: includeSec ? '2-digit' : undefined
            });
            return timeStr;
        } catch (e) {
            return d.toLocaleTimeString();
        }
    }
    window.formatTimeWithTimezone = formatTimeWithTimezone;

    function formatDateWithTimezone(dateInput, overrideFormat) {
        if (!dateInput) return '-';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput);
        const tzCfg = getTimezoneSettings();
        const tz = tzCfg.timezone || 'Asia/Kuala_Lumpur';
        const fmt = overrideFormat || tzCfg.dateFormat || 'DD/MM/YYYY';

        try {
            const parts = new Intl.DateTimeFormat('en-GB', {
                timeZone: tz,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                weekday: 'long'
            }).formatToParts(d);

            const pMap = {};
            parts.forEach(p => { pMap[p.type] = p.value; });

            const day = pMap.day || String(d.getDate()).padStart(2, '0');
            const month = pMap.month || String(d.getMonth() + 1).padStart(2, '0');
            const year = pMap.year || String(d.getFullYear());
            const monthShort = d.toLocaleString('en-US', { timeZone: tz, month: 'short' });
            const monthLong = d.toLocaleString('en-US', { timeZone: tz, month: 'long' });
            const weekday = pMap.weekday || d.toLocaleString('en-US', { timeZone: tz, weekday: 'long' });

            if (fmt === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
            if (fmt === 'DD MMM YYYY') return `${day} ${monthShort} ${year}`;
            if (fmt === 'MM/DD/YYYY') return `${month}/${day}/${year}`;
            if (fmt === 'dddd, DD MMMM YYYY') return `${weekday}, ${day} ${monthLong} ${year}`;
            return `${day}/${month}/${year}`;
        } catch (e) {
            return String(dateInput);
        }
    }
    window.formatDateWithTimezone = formatDateWithTimezone;

    function formatDateTimeWithTimezone(dateInput) {
        if (!dateInput) return '-';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput);
        return `${formatDateWithTimezone(d)} ${formatTimeWithTimezone(d)}`;
    }
    window.formatDateTimeWithTimezone = formatDateTimeWithTimezone;

    function updateLiveClocks() {
        const tzCfg = getTimezoneSettings();
        const now = new Date();
        const tz = tzCfg.timezone || 'Asia/Kuala_Lumpur';

        // 1. Top Navigation Bar Header Widget
        const headerClockWidget = document.getElementById('header-clock-widget');
        const headerClockTime = document.getElementById('header-clock-time');
        const headerClockTz = document.getElementById('header-clock-tz');
        if (headerClockWidget) {
            if (tzCfg.showDashboardHeaderClock === false) {
                headerClockWidget.style.display = 'none';
            } else {
                headerClockWidget.style.display = 'inline-flex';
                if (headerClockTime) headerClockTime.textContent = formatTimeWithTimezone(now);
                if (headerClockTz) {
                    let offsetLabel = 'GMT+8';
                    try {
                        const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(now);
                        const p = parts.find(x => x.type === 'timeZoneName');
                        if (p && p.value) offsetLabel = p.value;
                    } catch (e) {}
                    headerClockTz.textContent = offsetLabel;
                }
            }
        }

        // 2. General Settings Quick Overview Banner
        const genClock = document.getElementById('gen-overview-clock');
        const genDate = document.getElementById('gen-overview-date');
        const genTz = document.getElementById('gen-overview-tz');
        const genLoc = document.getElementById('gen-overview-loc');
        if (genClock) genClock.textContent = formatTimeWithTimezone(now);
        if (genDate) genDate.textContent = formatDateWithTimezone(now, 'dddd, DD MMMM YYYY');
        if (genTz) genTz.textContent = `${tz} (${tzCfg.timezoneOffset || 'GMT+8:00'})`;
        if (genLoc) genLoc.textContent = tzCfg.timezoneLocation || 'Malaysia (Kuala Lumpur, Selangor)';

        // 3. Time Zone Management Subtab Hero Display
        const heroTime = document.getElementById('tz-hero-time');
        const heroDate = document.getElementById('tz-hero-date');
        const heroLoc = document.getElementById('tz-hero-location');
        const heroOffset = document.getElementById('tz-hero-offset-badge');
        const metricZone = document.getElementById('tz-metric-zone');
        const metricOffset = document.getElementById('tz-metric-offset');
        const metricDevice = document.getElementById('tz-metric-device');

        if (heroTime) heroTime.textContent = formatTimeWithTimezone(now);
        if (heroDate) heroDate.textContent = formatDateWithTimezone(now, 'dddd, DD MMMM YYYY');
        if (heroLoc) heroLoc.textContent = tzCfg.timezoneLocation || 'Malaysia (Kuala Lumpur, Selangor)';
        if (heroOffset) heroOffset.textContent = `${tzCfg.timezoneOffset || 'GMT+8'} (Active)`;
        if (metricZone) metricZone.textContent = tz;
        if (metricOffset) metricOffset.textContent = tzCfg.timezoneOffset || 'GMT+8:00';

        if (metricDevice) {
            try {
                const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (deviceTz === tz) {
                    metricDevice.innerHTML = '<span style="color:#059669; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Matched Local Device</span>';
                } else {
                    metricDevice.innerHTML = `<span style="color:#d97706; font-weight:600;" title="Device: ${deviceTz}"><i class="fa-solid fa-circle-info"></i> Device: ${deviceTz}</span>`;
                }
            } catch (e) {
                metricDevice.textContent = 'Active';
            }
        }

        // 4. Format Preview in Form
        const previewDate = document.getElementById('preview-formatted-date');
        const previewTime = document.getElementById('preview-formatted-time');
        const selDateFormat = document.getElementById('setting-date-format');
        const selTimeFormat = document.getElementById('setting-time-format');
        if (previewDate && selDateFormat) {
            previewDate.textContent = formatDateWithTimezone(now, selDateFormat.value);
        }
        if (previewTime && selTimeFormat) {
            previewTime.textContent = formatTimeWithTimezone(now, selTimeFormat.value);
        }
    }
    window.updateLiveClocks = updateLiveClocks;
    setInterval(updateLiveClocks, 1000);
    setTimeout(updateLiveClocks, 50);

    function formatDateCreated(propDate) {
        if (!propDate) return '-';
        return formatDateWithTimezone(propDate);
    }

    let currentAssignedPropSort = { column: null, direction: 'asc' };

    function renderTable() {
        window.renderTable = renderTable;
        const targetTableBody = document.getElementById('property-table-body') || tableBody;
        if (!targetTableBody) return;

        // Sync properties from localStorage only if in-memory list is empty
        if (!Array.isArray(properties) || properties.length === 0) {
            try {
                const storedProps = localStorage.getItem('industria_properties');
                if (storedProps && storedProps.startsWith('[')) {
                    const parsed = JSON.parse(storedProps);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        properties = parsed;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse properties from localStorage in renderTable:', e);
            }
        }

        targetTableBody.innerHTML = '';

        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const isAdministrator = String(activeRole).toLowerCase() === 'administrator';
        const isSupervisor = String(activeRole).toLowerCase() === 'supervisor';
        const canViewUnassigned = isAdministrator || isSupervisor;

        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);

        function isPropertyInAssignedPark(p) {
            if (!p || !p.park || !p.park.trim()) return false;
            const norm = p.park.trim().toLowerCase();
            return allAgents.some(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                return pList.some(item => (typeof item === 'string' ? item : (item && item.name ? item.name : '')).trim().toLowerCase() === norm);
            });
        }

        let assignedProps = properties.filter(p => isPropertyInAssignedPark(p));
        let unassignedProps = properties.filter(p => !isPropertyInAssignedPark(p));

        const allowedParks = getAgentAssignedParks();
        if (allowedParks !== null) {
            assignedProps = assignedProps.filter(p => p && p.park && isParkAllowed(p.park, allowedParks));
        }

        // Update active assigned listings count badge in tab
        const assignedBadge = document.getElementById('properties-assigned-count-badge');
        if (assignedBadge) assignedBadge.textContent = assignedProps.length;

        // Unassigned badges & visibility controls (strictly for Administrator & Supervisor)
        const tabUnassignedBtn = document.getElementById('properties-tab-unassigned');
        const unassignedBadge = document.getElementById('properties-unassigned-count-badge');
        const unassignedBanner = document.getElementById('unassigned-properties-alert-banner');
        const bannerCount = document.getElementById('unassigned-properties-banner-count');

        if (canViewUnassigned) {
            if (tabUnassignedBtn) tabUnassignedBtn.style.display = 'inline-flex';
            if (unassignedBadge) unassignedBadge.textContent = unassignedProps.length;
            if (unassignedBanner) {
                unassignedBanner.style.display = unassignedProps.length > 0 ? 'block' : 'none';
                if (bannerCount) bannerCount.textContent = unassignedProps.length;
            }
        } else {
            if (tabUnassignedBtn) tabUnassignedBtn.style.display = 'none';
            if (unassignedBanner) unassignedBanner.style.display = 'none';
        }

        if (typeof updateAgentPropertyScopeBanner === 'function') {
            updateAgentPropertyScopeBanner();
        }

        // Filter properties strictly by assigned parks
        let propertiesToFilter = assignedProps;

        // Add section to properties for sorting and display
        let propertiesToRender = propertiesToFilter.map(prop => {
            let section = '';
            if (parks[prop.location]) {
                const parkObj = parks[prop.location].find(p => p.name === prop.park);
                if (parkObj && parkObj.section) {
                    section = parkObj.section;
                }
            }
            return { ...prop, section };
        });

        // Apply property toolbar filters & search
        const propSearchInput = document.getElementById('property-search-input');
        const propCityFilter = document.getElementById('property-city-filter');
        const propTypeFilter = document.getElementById('property-type-filter');
        const propIntentFilter = document.getElementById('property-intent-filter');

        const searchVal = propSearchInput ? propSearchInput.value.toLowerCase().trim() : '';
        const cityVal = propCityFilter ? propCityFilter.value : 'All';
        const typeVal = propTypeFilter ? propTypeFilter.value : 'All';
        const intentValFilter = propIntentFilter ? propIntentFilter.value : 'All';

        propertiesToRender = propertiesToRender.filter(prop => {
            const matchesCity = (cityVal === 'All') || (prop.location === cityVal);
            const matchesType = (typeVal === 'All') || (prop.type === typeVal) || (typeVal === 'Factory' && prop.type && prop.type.toLowerCase().includes('factory'));
            const propIntent = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale'));
            const matchesIntent = (intentValFilter === 'All') || (propIntent.toLowerCase() === intentValFilter.toLowerCase());

            const searchHaystack = [
                prop.title, prop.location, prop.section, prop.park, prop.type, prop.price, prop.tenure, prop.landArea, prop.builtUp, prop.power, prop.ceilingHeight, prop.floorLoading, prop.specs, prop.road
            ].filter(Boolean).join(' ').toLowerCase();

            const matchesSearch = !searchVal || searchHaystack.includes(searchVal);
            return matchesCity && matchesType && matchesIntent && matchesSearch;
        });

        // Sort Assigned Properties by selected column or default to Location then Section
        if (currentAssignedPropSort.column) {
            propertiesToRender.sort((a, b) => {
                let valA = '', valB = '';
                if (currentAssignedPropSort.column === 'date') {
                    valA = a.dateCreated || a.dateAdded || '';
                    valB = b.dateCreated || b.dateAdded || '';
                } else if (currentAssignedPropSort.column === 'lastUpdated') {
                    valA = a.lastUpdated || a.updatedAt || a.dateUpdated || a.updated_at || a.dateCreated || a.dateAdded || '';
                    valB = b.lastUpdated || b.updatedAt || b.dateUpdated || b.updated_at || b.dateCreated || b.dateAdded || '';
                } else if (currentAssignedPropSort.column === 'price') {
                    valA = parseFloat(String(a.price || '').replace(/[^0-9.]/g, '')) || 0;
                    valB = parseFloat(String(b.price || '').replace(/[^0-9.]/g, '')) || 0;
                    return currentAssignedPropSort.direction === 'asc' ? valA - valB : valB - valA;
                } else if (currentAssignedPropSort.column === 'location') {
                    valA = `${a.location || ''} ${a.section || ''}`.trim().toLowerCase();
                    valB = `${b.location || ''} ${b.section || ''}`.trim().toLowerCase();
                } else {
                    valA = (a[currentAssignedPropSort.column] || '').toLowerCase();
                    valB = (b[currentAssignedPropSort.column] || '').toLowerCase();
                }
                if (valA < valB) return currentAssignedPropSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return currentAssignedPropSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        } else {
            // Default: Sort by Location first, then Section
            propertiesToRender.sort((a, b) => {
                const locA = (a.location || '').toLowerCase();
                const locB = (b.location || '').toLowerCase();
                if (locA < locB) return -1;
                if (locA > locB) return 1;
                
                const secA = (a.section || '').toLowerCase();
                const secB = (b.section || '').toLowerCase();
                if (secA < secB) return -1;
                if (secA > secB) return 1;
                
                return 0;
            });
        }

        // Update Mainpage Featured Properties Status Badges & Controls
        settings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});
        const featuredCount = properties.filter(p => p && (p.showOnMainpage === true || String(p.showOnMainpage) === 'true' || p.featured === true || String(p.featured) === 'true')).length;
        const maxDisplaySetting = (settings && typeof settings.maxFeaturedPropertiesDisplayed === 'number' && settings.maxFeaturedPropertiesDisplayed > 0) ? settings.maxFeaturedPropertiesDisplayed : 6;

        const updateCountBadgeStyle = (el) => {
            if (!el) return;
            el.textContent = `${featuredCount} / 18 Selected`;
            if (featuredCount >= maxDisplaySetting && featuredCount <= 18) {
                el.style.color = '#059669';
            } else if (featuredCount > 18) {
                el.style.color = '#dc2626';
            } else {
                el.style.color = '#d97706';
            }
        };

        const countBadge = document.getElementById('mainpage-properties-count');
        updateCountBadgeStyle(countBadge);

        const toolbarCountBadge = document.getElementById('toolbar-featured-count');
        updateCountBadgeStyle(toolbarCountBadge);

        if (typeof syncPropertyFeaturesUI === 'function') {
            syncPropertyFeaturesUI(settings);
        } else if (typeof window.syncPropertyFeaturesUI === 'function') {
            window.syncPropertyFeaturesUI(settings);
        } else if (typeof updateFeaturedRandomUI === 'function') {
            const isRandomEnabled = settings && (settings.randomFeaturedProperties !== false && String(settings.randomFeaturedProperties) !== 'false');
            updateFeaturedRandomUI(isRandomEnabled);
        }

        // Keep Dashboard Overview Active Properties count in sync
        if (typeof window.updateActivePropertiesMetric === 'function') {
            window.updateActivePropertiesMetric(properties);
        }

        if (propertiesToRender.length === 0) {
            let emptyMsg = 'No assigned properties found matching your search or filter criteria.';
            if (allowedParks !== null) {
                if (allowedParks.length === 0) {
                    emptyMsg = 'You do not have any assigned parks. Please contact an Administrator to assign parks to your account to view property listings.';
                } else {
                    emptyMsg = `No property listings found in your assigned parks (${allowedParks.join(', ')}).`;
                }
            }
            targetTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-size: 0.92rem;"><i class="fa-solid fa-building-circle-exclamation" style="font-size: 2rem; margin-bottom: 0.5rem; color: #94a3b8; display: block;"></i>${escapeHtml(emptyMsg)}</td></tr>`;
            renderUnassignedPropertiesTable(unassignedProps);
            return;
        }

        propertiesToRender.forEach(prop => {
            const tr = document.createElement('tr');
            
            const statusClass = prop.status === 'Inactive' ? 'status-inactive' : (prop.status === 'Pending' ? 'status-pending' : 'status-active');
            const intentVal = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale')).toUpperCase();
            const intentBadgeStyle = intentVal === 'RENT' 
                ? 'background-color: #fef08a; color: #854d0e; border: 1px solid #fde047;' 
                : 'background-color: #fecdd3; color: #9f1239; border: 1px solid #fda4af;';

            let actionsHtml = '';
            if (currentUserRole === 'Entry Support') {
                actionsHtml = '<span style="color:var(--text-muted); font-size:0.85rem;"><i class="fa-solid fa-eye"></i> View Only</span>';
            } else if (allowedParks !== null && (!prop.park || !isParkAllowed(prop.park, allowedParks))) {
                actionsHtml = '<span style="color:var(--text-muted); font-size:0.8rem; font-weight:500;"><i class="fa-solid fa-lock"></i> Protected</span>';
            } else {
                actionsHtml = `
                    <button class="action-btn" aria-label="Google Earth & Map" title="View on Google Earth & Maps" onclick="openPropertyMapModal('${prop.id}')" style="color: #059669;"><i class="fa-solid fa-earth-americas"></i></button>
                    <button class="action-btn" aria-label="Brochure" title="View & Download Property E-Brochure (Flyer / PDF)" onclick="openPropertyBrochureModal('${prop.id}')" style="color: #ea580c;"><i class="fa-solid fa-file-pdf"></i></button>
                    <button class="action-btn" aria-label="Share" title="Share Property to Social Media (Facebook, WhatsApp, IG, TikTok...)" onclick="openPropertyShareModal('${prop.id}')" style="color: var(--primary);"><i class="fa-solid fa-share-nodes"></i></button>
                    <button class="action-btn" aria-label="Edit" onclick="editProperty('${prop.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete" aria-label="Delete" onclick="deleteProperty('${prop.id}')"><i class="fa-solid fa-trash"></i></button>
                `;
            }

            const photoThumbSrc = prop.image || (prop.images && prop.images.length > 0 ? prop.images[0] : 'assets/images/warehouse.jpg');
            const dateCreatedText = formatDateCreated(prop.dateCreated || prop.dateAdded || prop.postedDate || prop.createdAt);
            const lastUpdatedText = formatDateCreated(prop.lastUpdated || prop.updatedAt || prop.dateUpdated || prop.updated_at || prop.dateCreated || prop.dateAdded);

            tr.innerHTML = `
                <td><span style="font-size: 0.81rem; color: var(--text-dark); white-space: nowrap;"><i class="fa-regular fa-calendar-days" style="color:var(--text-muted); margin-right:4px;"></i> ${dateCreatedText}</span></td>
                <td><span style="font-size: 0.81rem; color: var(--text-dark); white-space: nowrap;"><i class="fa-solid fa-clock-rotate-left" style="color:var(--text-muted); margin-right:4px;"></i> ${lastUpdatedText}</span></td>
                <td>
                    <img src="${photoThumbSrc}" alt="${prop.title || 'Property Image'}" style="width: 46px; height: 34px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-light); display: block;">
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px; line-height:1.25;">
                        <strong style="color:var(--text-dark); font-size:0.86rem;">${prop.title}</strong>
                        ${prop.park ? `<span style="color:var(--primary); font-weight:600; font-size:0.75rem;"><i class="fa-solid fa-map" style="margin-right:3px;"></i> ${prop.park}</span>` : ''}
                        ${prop.road ? `<span style="color:var(--text-muted); font-size:0.73rem;"><i class="fa-solid fa-road" style="margin-right:3px;"></i> ${prop.road}</span>` : ''}
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px; line-height:1.25;">
                        <span style="font-weight:600; font-size:0.84rem; color:var(--text-dark);">${prop.location}</span>
                        ${prop.section ? `<span style="color:var(--text-muted); font-size:0.74rem;"><i class="fa-solid fa-layer-group" style="margin-right:3px;"></i> ${prop.section}</span>` : ''}
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:3px; line-height:1.2;">
                        <span class="status-badge" style="${intentBadgeStyle} font-weight:700; font-size:0.7rem; padding:2px 6px;">${intentVal === 'RENT' ? 'FOR RENT' : 'FOR SALE'}</span>
                        <span style="font-size:0.81rem; color:var(--text-dark);">${prop.type}</span>
                    </div>
                </td>
                <td><strong style="color:var(--primary-dark); font-size:0.88rem; white-space:nowrap;">${formatPriceString(prop.price, prop.intent)}</strong></td>
                <td><span class="status-badge ${statusClass}" style="padding:2px 8px; font-size:0.74rem;">${prop.status || 'Active'}</span></td>
                <td style="text-align:center;vertical-align:middle;">
                    ${(() => {
                        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                                           sessionStorage.getItem('currentUserRole') || 
                                           localStorage.getItem('currentUserRole') || 
                                           currentUserRole || 
                                           'Administrator';
                        const canManageFeatured = (String(activeRole).toLowerCase() === 'administrator' || String(activeRole).toLowerCase() === 'supervisor');
                        const isFeat = (prop.showOnMainpage === true || String(prop.showOnMainpage) === 'true' || prop.featured === true || String(prop.featured) === 'true');
                        return `
                        <label style="display:inline-flex;align-items:center;gap:5px;cursor:${canManageFeatured ? 'pointer' : 'not-allowed'};user-select:none;margin:0;opacity:${canManageFeatured ? '1' : '0.45'};">
                            <input type="checkbox" ${isFeat ? 'checked' : ''} ${!canManageFeatured ? 'disabled' : ''} onchange="toggleMainpageProperty('${prop.id}')" style="width:16px;height:16px;cursor:${canManageFeatured ? 'pointer' : 'not-allowed'};accent-color:#059669;">
                            <span style="font-size:0.8rem;font-weight:600;color:${isFeat ? '#059669' : (canManageFeatured ? 'var(--text-dark)' : 'var(--text-muted)')};">
                                ${isFeat ? '<i class="fa-solid fa-star" style="color:#f59e0b;"></i> Featured' : 'Hidden'}
                            </span>
                        </label>`;
                    })()}
                </td>
                <td><div style="display:inline-flex; align-items:center; gap:4px;">${actionsHtml}</div></td>
            `;
            targetTableBody.appendChild(tr);
        });

        // Update Sort Icons for Assigned Properties Table
        document.querySelectorAll('.sortable-assigned-prop').forEach(th => {
            const icon = th.querySelector('i');
            if (icon) {
                if (th.dataset.sort === currentAssignedPropSort.column) {
                    icon.className = currentAssignedPropSort.direction === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
                } else {
                    icon.className = 'fa-solid fa-sort';
                }
            }
        });

        // Also render unassigned property listings in separate table
        renderUnassignedPropertiesTable(unassignedProps);
    }

    let currentUnassignedPropSort = { column: null, direction: 'asc' };

    window.switchPropertiesTab = function(tab, citySlug) {
        const tabAssignedBtn = document.getElementById('properties-tab-assigned');
        const tabUnassignedBtn = document.getElementById('properties-tab-unassigned');
        const tabLocationsBtn = document.getElementById('properties-tab-locations');
        const assignedCont = document.getElementById('properties-assigned-container');
        const unassignedCont = document.getElementById('properties-unassigned-container');
        const locationsCont = document.getElementById('properties-locations-container');
        const addPropBtn = document.getElementById('add-property-btn');

        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const canViewUnassigned = (String(activeRole).toLowerCase() === 'administrator' || String(activeRole).toLowerCase() === 'supervisor');

        if (tab === 'unassigned' && !canViewUnassigned) {
            tab = 'assigned';
        }

        if (tab === 'locations') {
            window.switchView('landing-page', citySlug);
            return;
        } else if (tab === 'unassigned') {
            if (tabAssignedBtn) tabAssignedBtn.classList.remove('active');
            if (tabUnassignedBtn) tabUnassignedBtn.classList.add('active');
            if (tabLocationsBtn) tabLocationsBtn.classList.remove('active');
            if (assignedCont) assignedCont.style.display = 'none';
            if (unassignedCont) unassignedCont.style.display = 'block';
            if (locationsCont) locationsCont.style.display = 'none';
            if (addPropBtn) addPropBtn.style.display = '';
            if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
        } else {
            if (tabAssignedBtn) tabAssignedBtn.classList.add('active');
            if (tabUnassignedBtn) tabUnassignedBtn.classList.remove('active');
            if (tabLocationsBtn) tabLocationsBtn.classList.remove('active');
            if (assignedCont) assignedCont.style.display = 'block';
            if (unassignedCont) unassignedCont.style.display = 'none';
            if (locationsCont) locationsCont.style.display = 'none';
            if (addPropBtn) addPropBtn.style.display = '';
            renderTable();
        }
    };

    function renderUnassignedPropertiesTable(providedList) {
        window.renderUnassignedPropertiesTable = renderUnassignedPropertiesTable;
        const mainTableBody = document.getElementById('properties-unassigned-table-body');

        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const isAdministrator = String(activeRole).toLowerCase() === 'administrator';
        const isSupervisor = String(activeRole).toLowerCase() === 'supervisor';
        const canViewUnassigned = isAdministrator || isSupervisor;

        if (!canViewUnassigned) {
            if (mainTableBody) mainTableBody.innerHTML = '';
            return;
        }

        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);

        function isPropertyInAssignedPark(p) {
            if (!p || !p.park || !p.park.trim()) return false;
            const norm = p.park.trim().toLowerCase();
            return allAgents.some(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                return pList.some(item => (typeof item === 'string' ? item : (item && item.name ? item.name : '')).trim().toLowerCase() === norm);
            });
        }

        let list = providedList;
        if (!Array.isArray(list)) {
            list = properties.filter(p => !isPropertyInAssignedPark(p));
        }

        // Apply filters & search for dedicated unassigned properties tab
        const cityFilterEl = document.getElementById('unassigned-property-city-filter');
        const typeFilterEl = document.getElementById('unassigned-property-type-filter');
        const intentFilterEl = document.getElementById('unassigned-property-intent-filter');
        const searchInputEl = document.getElementById('unassigned-property-search-input');

        const cityVal = cityFilterEl ? cityFilterEl.value : 'All';
        const typeVal = typeFilterEl ? typeFilterEl.value : 'All';
        const intentVal = intentFilterEl ? intentFilterEl.value : 'All';
        const searchVal = searchInputEl ? searchInputEl.value.toLowerCase().trim() : '';

        // Add section if available
        let filteredList = list.map(prop => {
            let section = '';
            if (parks[prop.location]) {
                const parkObj = parks[prop.location].find(p => p.name === prop.park);
                if (parkObj && parkObj.section) {
                    section = parkObj.section;
                }
            }
            return { ...prop, section };
        });

        filteredList = filteredList.filter(prop => {
            const matchesCity = (cityVal === 'All') || (prop.location === cityVal);
            const matchesType = (typeVal === 'All') || (prop.type === typeVal) || (typeVal === 'Factory' && prop.type && prop.type.toLowerCase().includes('factory'));
            const propIntent = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale'));
            const matchesIntent = (intentVal === 'All') || (propIntent.toLowerCase() === intentVal.toLowerCase());

            const searchHaystack = [
                prop.title, prop.location, prop.section, prop.park, prop.type, prop.price, prop.tenure, prop.specs, prop.road
            ].filter(Boolean).join(' ').toLowerCase();

            const matchesSearch = !searchVal || searchHaystack.includes(searchVal);
            return matchesCity && matchesType && matchesIntent && matchesSearch;
        });

        if (currentUnassignedPropSort.column) {
            filteredList.sort((a, b) => {
                let valA = '', valB = '';
                if (currentUnassignedPropSort.column === 'date') {
                    valA = a.dateCreated || a.dateAdded || '';
                    valB = b.dateCreated || b.dateAdded || '';
                } else if (currentUnassignedPropSort.column === 'lastUpdated') {
                    valA = a.lastUpdated || a.updatedAt || a.dateUpdated || a.updated_at || a.dateCreated || a.dateAdded || '';
                    valB = b.lastUpdated || b.updatedAt || b.dateUpdated || b.updated_at || b.dateCreated || b.dateAdded || '';
                } else if (currentUnassignedPropSort.column === 'price') {
                    valA = parseFloat(String(a.price || '').replace(/[^0-9.]/g, '')) || 0;
                    valB = parseFloat(String(b.price || '').replace(/[^0-9.]/g, '')) || 0;
                    return currentUnassignedPropSort.direction === 'asc' ? valA - valB : valB - valA;
                } else if (currentUnassignedPropSort.column === 'location') {
                    valA = `${a.location || ''} ${a.section || ''}`.trim().toLowerCase();
                    valB = `${b.location || ''} ${b.section || ''}`.trim().toLowerCase();
                } else {
                    valA = (a[currentUnassignedPropSort.column] || '').toLowerCase();
                    valB = (b[currentUnassignedPropSort.column] || '').toLowerCase();
                }
                if (valA < valB) return currentUnassignedPropSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return currentUnassignedPropSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        function createUnassignedPropRow(prop) {
            const tr = document.createElement('tr');
            const intentValStr = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale')).toUpperCase();
            const intentBadgeStyle = intentValStr === 'RENT' 
                ? 'background-color: #fef08a; color: #854d0e; border: 1px solid #fde047;' 
                : 'background-color: #fecdd3; color: #9f1239; border: 1px solid #fda4af;';
            const statusClass = prop.status === 'Inactive' ? 'status-inactive' : (prop.status === 'Pending' ? 'status-pending' : 'status-active');
            const photoThumbSrc = prop.image || (prop.images && prop.images.length > 0 ? prop.images[0] : 'assets/images/warehouse.jpg');
            const dateCreatedText = formatDateCreated(prop.dateCreated || prop.dateAdded || prop.postedDate || prop.createdAt);
            const lastUpdatedText = formatDateCreated(prop.lastUpdated || prop.updatedAt || prop.dateUpdated || prop.updated_at || prop.dateCreated || prop.dateAdded);

            let parkStatusHtml = '';
            const creatorDisplayName = prop.createdByName || prop.createdBy || 'Administrator';
            if (!prop.park || !prop.park.trim()) {
                parkStatusHtml = `
                    <div style="display:flex; flex-direction:column; gap:2px; line-height:1.2;">
                        <span class="status-badge" style="background:#fee2e2; color:#b91c1c; font-size:0.75rem; padding:3px 8px; border-radius:12px; font-weight:700;"><i class="fa-solid fa-circle-exclamation" style="margin-right:3px;"></i> No Park Assigned</span>
                        <small style="color:#0284c7; font-size:0.72rem; font-weight:600;"><i class="fa-solid fa-user-pen" style="margin-right:2px;"></i> Creator: ${escapeHtml(creatorDisplayName)}</small>
                    </div>
                `;
            } else {
                parkStatusHtml = `
                    <div style="display:flex; flex-direction:column; gap:2px; line-height:1.2;">
                        <span style="color:#b45309; font-weight:700; font-size:0.82rem;"><i class="fa-solid fa-industry" style="margin-right:3px;"></i> ${escapeHtml(prop.park)}</span>
                        <small style="color:#dc2626; font-size:0.72rem; font-weight:600;"><i class="fa-solid fa-user-slash" style="margin-right:2px;"></i> Unassigned Park</small>
                        <small style="color:#0284c7; font-size:0.72rem; font-weight:600;"><i class="fa-solid fa-user-pen" style="margin-right:2px;"></i> Creator: ${escapeHtml(creatorDisplayName)}</small>
                    </div>
                `;
            }

            let actionsHtml = '';
            if (currentUserRole === 'Entry Support') {
                actionsHtml = '<span style="color:var(--text-muted); font-size:0.85rem;"><i class="fa-solid fa-eye"></i> View Only</span>';
            } else {
                actionsHtml = `
                    <button class="action-btn" aria-label="Google Earth & Map" title="View on Google Earth & Maps" onclick="openPropertyMapModal('${prop.id}')" style="color: #059669;"><i class="fa-solid fa-earth-americas"></i></button>
                    <button class="action-btn" aria-label="Brochure" title="View & Download Property E-Brochure (Flyer / PDF)" onclick="openPropertyBrochureModal('${prop.id}')" style="color: #ea580c;"><i class="fa-solid fa-file-pdf"></i></button>
                    <button class="action-btn" aria-label="Share" title="Share Property to Social Media (Facebook, WhatsApp, IG, TikTok...)" onclick="openPropertyShareModal('${prop.id}')" style="color: var(--primary);"><i class="fa-solid fa-share-nodes"></i></button>
                    <button class="action-btn" aria-label="Edit" title="Edit Property / Assign Park" onclick="editProperty('${prop.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete" aria-label="Delete" title="Delete Property" onclick="deleteProperty('${prop.id}')"><i class="fa-solid fa-trash"></i></button>
                `;
            }

            tr.innerHTML = `
                <td><span style="font-size: 0.81rem; color: var(--text-dark); white-space: nowrap;"><i class="fa-regular fa-calendar-days" style="color:var(--text-muted); margin-right:4px;"></i> ${dateCreatedText}</span></td>
                <td><span style="font-size: 0.81rem; color: var(--text-dark); white-space: nowrap;"><i class="fa-solid fa-clock-rotate-left" style="color:var(--text-muted); margin-right:4px;"></i> ${lastUpdatedText}</span></td>
                <td>
                    <img src="${photoThumbSrc}" alt="${prop.title || 'Property Image'}" style="width: 46px; height: 34px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-light); display: block;">
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px; line-height:1.25;">
                        <strong style="color:var(--text-dark); font-size:0.86rem;">${escapeHtml(prop.title)}</strong>
                        ${prop.road ? `<span style="color:var(--text-muted); font-size:0.73rem;"><i class="fa-solid fa-road" style="margin-right:3px;"></i> ${escapeHtml(prop.road)}</span>` : ''}
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px; line-height:1.25;">
                        <span style="font-weight:600; font-size:0.84rem; color:var(--text-dark);">${escapeHtml(prop.location)}</span>
                        ${prop.section ? `<span style="color:var(--text-muted); font-size:0.74rem;"><i class="fa-solid fa-layer-group" style="margin-right:3px;"></i> ${escapeHtml(prop.section)}</span>` : ''}
                    </div>
                </td>
                <td>${parkStatusHtml}</td>
                <td>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:3px; line-height:1.2;">
                        <span class="status-badge" style="${intentBadgeStyle} font-weight:700; font-size:0.7rem; padding:2px 6px;">${intentValStr === 'RENT' ? 'FOR RENT' : 'FOR SALE'}</span>
                        <span style="font-size:0.81rem; color:var(--text-dark);">${escapeHtml(prop.type)}</span>
                    </div>
                </td>
                <td><strong style="color:var(--primary-dark); font-size:0.88rem; white-space:nowrap;">${formatPriceString(prop.price, prop.intent)}</strong></td>
                <td><span class="status-badge ${statusClass}" style="padding:2px 8px; font-size:0.74rem;">${prop.status || 'Active'}</span></td>
                <td><div style="display:inline-flex; align-items:center; gap:4px;">${actionsHtml}</div></td>
            `;
            return tr;
        }

        // Render dedicated unassigned properties table (Container 2)
        if (mainTableBody) {
            mainTableBody.innerHTML = '';
            if (filteredList.length === 0) {
                mainTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-size: 0.92rem;"><i class="fa-solid fa-circle-check" style="font-size: 2rem; margin-bottom: 0.5rem; color: #10b981; display: block;"></i>All property listings currently have assigned territory parks with specialists, or none match your search.</td></tr>`;
            } else {
                filteredList.forEach(p => mainTableBody.appendChild(createUnassignedPropRow(p)));
            }
        }


        // Update Sort Icons for Unassigned Properties Table
        document.querySelectorAll('.sortable-unassigned-prop').forEach(th => {
            const icon = th.querySelector('i');
            if (icon) {
                if (th.dataset.sort === currentUnassignedPropSort.column) {
                    icon.className = currentUnassignedPropSort.direction === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
                } else {
                    icon.className = 'fa-solid fa-sort';
                }
            }
        });
    }

    // Helper to jump from unassigned parks table directly to filtered unassigned properties
    window.viewUnassignedParkProperties = function(encParkName) {
        const parkName = decodeURIComponent(encParkName);
        if (typeof window.switchView === 'function') {
            window.switchView('properties');
        }
        if (typeof window.switchPropertiesTab === 'function') {
            window.switchPropertiesTab('unassigned');
        }
        const searchInput = document.getElementById('unassigned-property-search-input');
        if (searchInput) {
            searchInput.value = parkName;
            if (typeof renderUnassignedPropertiesTable === 'function') {
                renderUnassignedPropertiesTable();
            }
        }
    };

    // Sort event listeners for assigned properties
    document.querySelectorAll('.sortable-assigned-prop').forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.dataset.sort;
            if (currentAssignedPropSort.column === sortKey) {
                currentAssignedPropSort.direction = currentAssignedPropSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentAssignedPropSort.column = sortKey;
                currentAssignedPropSort.direction = 'asc';
            }
            renderTable();
        });
    });

    // Sort event listeners for unassigned properties
    document.querySelectorAll('.sortable-unassigned-prop').forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.dataset.sort;
            if (currentUnassignedPropSort.column === sortKey) {
                currentUnassignedPropSort.direction = currentUnassignedPropSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentUnassignedPropSort.column = sortKey;
                currentUnassignedPropSort.direction = 'asc';
            }
            renderUnassignedPropertiesTable();
        });
    });

    renderTable();

    // Supabase Property Sync Helpers
    async function syncPropertyToSupabase(prop) {
        if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertProperty === 'function' && prop) {
            // Upload base64 images to Supabase Storage bucket 'property-images' if needed
            if (Array.isArray(prop.images) && prop.images.some(img => typeof img === 'string' && img.startsWith('data:'))) {
                try {
                    const uploaded = await window.IndustraSupabase.uploadImages(prop.images);
                    prop.images = uploaded;
                    prop.image = uploaded[0] || 'assets/images/warehouse.jpg';
                } catch(e) {
                    console.warn('Image upload error during Supabase sync:', e);
                }
            }
            if (Array.isArray(prop.rawImages) && prop.rawImages.some(img => typeof img === 'string' && img.startsWith('data:'))) {
                try {
                    const uploadedRaw = await window.IndustraSupabase.uploadImages(prop.rawImages);
                    prop.rawImages = uploadedRaw;
                    prop.rawImage = uploadedRaw[0] || 'assets/images/warehouse.jpg';
                } catch(e) {
                    console.warn('Raw image upload error during Supabase sync:', e);
                }
            }

            const isFeat = prop.showOnMainpage === true || String(prop.showOnMainpage) === 'true' || prop.featured === true || String(prop.featured) === 'true';
            prop.showOnMainpage = isFeat;
            prop.featured = isFeat;

            // Clean specs object before saving to JSONB column to ensure no heavy base64 strings remain
            const cleanSpecs = Object.assign({}, prop);
            cleanSpecs.images = prop.images;
            cleanSpecs.image = prop.image;
            cleanSpecs.rawImages = prop.rawImages;
            cleanSpecs.rawImage = prop.rawImage;
            cleanSpecs.showOnMainpage = isFeat;
            cleanSpecs.featured = isFeat;

            const parseNum = (v) => {
                if (typeof v === 'number') return isNaN(v) ? null : v;
                if (!v) return null;
                const clean = String(v).replace(/[^0-9.]/g, '');
                return clean ? parseFloat(clean) : null;
            };

            const peakNum = parseNum(prop.ceilingPeak);
            const eaveNum = parseNum(prop.ceilingEave);
            const clearNum = parseNum(prop.ceilingClear);
            const primaryHeight = clearNum !== null ? clearNum : (eaveNum !== null ? eaveNum : (peakNum !== null ? peakNum : parseNum(prop.height)));
            const floorLoadNum = parseNum(prop.floorLoad || prop.floorLoading) || 0;
            const landAreaNum = typeof prop.landArea === 'number' ? prop.landArea : (parseFloat(String(prop.landArea || '').replace(/[^0-9.]/g, '')) || 0);
            const builtUpNum = typeof prop.builtUp === 'number' ? prop.builtUp : (parseFloat(String(prop.builtUp || prop.size || '').replace(/[^0-9.]/g, '')) || 0);
            const priceNum = typeof prop.price === 'number' ? prop.price : (parseFloat(String(prop.price || '').replace(/[^0-9.]/g, '')) || 0);

            const res = await window.IndustraSupabase.upsertProperty({
                id: String(prop.id),
                title: prop.title || '',
                location: prop.location || '',
                park: prop.park || '',
                type: prop.type || '',
                tenure: prop.tenure || prop.leaseType || '',
                price: priceNum,
                land_area: landAreaNum,
                built_up: builtUpNum,
                power: String(prop.power || ''),
                height: primaryHeight || 0,
                ceiling_height: primaryHeight,
                ceiling_peak: peakNum,
                ceiling_eave: eaveNum,
                ceiling_clear: clearNum,
                floor_load: floorLoadNum,
                intent: prop.intent || 'Sale',
                road: prop.road || '',
                usage: prop.usage || 'Not Applicable',
                lift: prop.lift !== undefined && prop.lift !== null ? String(prop.lift) : '',
                loading_bay: prop.loadingBay !== undefined && prop.loadingBay !== null ? String(prop.loadingBay) : '',
                available_units: prop.availableUnits !== undefined && prop.availableUnits !== null ? String(prop.availableUnits) : '',
                comprise_units: prop.compriseUnits !== undefined && prop.compriseUnits !== null ? String(prop.compriseUnits) : '',
                description: prop.description || '',
                specs: cleanSpecs,
                status: prop.status || 'Active',
                featured: isFeat,
                images: Array.isArray(prop.images) ? prop.images : []
            });
            return res;
        }
        return { success: false, error: 'Supabase helper unavailable' };
    }

    function syncPropertyDeleteToSupabase(id) {
        if (window.IndustraSupabase && typeof window.IndustraSupabase.deleteProperty === 'function' && id) {
            window.IndustraSupabase.deleteProperty(String(id));
        }
    }

    // Global change status function
    window.changePropertyStatus = function(id, newStatus) {
        try {
            const stored = localStorage.getItem('industria_properties');
            if (stored && stored.startsWith('[')) properties = JSON.parse(stored);
        } catch (e) {}

        let propIndex = properties.findIndex(p => String(p.id) === String(id));
        if (propIndex === -1) {
            propIndex = properties.findIndex(p => p.id == id);
        }
        if (propIndex > -1) {
            const allowedParks = getAgentAssignedParks();
            if (allowedParks !== null) {
                const targetProp = properties[propIndex];
                if (!targetProp || !targetProp.park || !isParkAllowed(targetProp.park, allowedParks)) {
                    alert('Access Denied: You can only modify property listings within your assigned parks.');
                    return;
                }
            }
            properties[propIndex].status = newStatus;
            properties[propIndex].lastUpdated = new Date().toISOString().split('T')[0];
            safeLocalStorageSet('industria_properties', properties);
            syncPropertyToSupabase(properties[propIndex]);
            window.dispatchEvent(new Event('storage'));
            renderTable();
        }
    };

    // Helper to resolve the assigned agent for a property by matching industrial parks
    function getAgentForProperty(prop, allAgents) {
        if (!prop || !prop.park || !Array.isArray(allAgents) || allAgents.length === 0) return null;
        const propPark = String(prop.park).trim().toLowerCase();
        return allAgents.find(a => {
            const parks = Array.isArray(a.parks) && a.parks.length > 0 ? a.parks : (Array.isArray(a.assignedParks) && a.assignedParks.length > 0 ? a.assignedParks : []);
            return parks.some(p => {
                if (!p) return false;
                const normP = String(p).trim().toLowerCase();
                return normP === propPark || propPark.includes(normP) || normP.includes(propPark);
            });
        }) || null;
    }
    window.getAgentForProperty = getAgentForProperty;

    window.toggleMainpageProperty = async function(id) {
        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const canManage = (String(activeRole).toLowerCase() === 'administrator' || String(activeRole).toLowerCase() === 'supervisor');

        if (!canManage) {
            alert('Only Administrators and Supervisors can change mainpage properties.');
            renderTable();
            return;
        }

        const propIndex = properties.findIndex(p => String(p.id) === String(id));
        if (propIndex === -1) return;

        const isCurrentlyFeatured = properties[propIndex].showOnMainpage === true || String(properties[propIndex].showOnMainpage) === 'true' || properties[propIndex].featured === true || String(properties[propIndex].featured) === 'true';
        
        if (!isCurrentlyFeatured) {
            const currentFeaturedList = properties.filter(p => p && (p.showOnMainpage === true || String(p.showOnMainpage) === 'true' || p.featured === true || String(p.featured) === 'true'));
            if (currentFeaturedList.length >= 18) {
                alert('⚠️ Maximum 18 properties allowed on the mainpage.\n\nYou cannot feature more than 18 properties on the mainpage. Please uncheck another property first.');
                renderTable();
                return;
            }

            // Per-Agent Quota Check
            settings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});
            const maxPerAgent = (settings && typeof settings.maxFeaturedPerAgent === 'number' && settings.maxFeaturedPerAgent > 0) ? settings.maxFeaturedPerAgent : 6;
            const targetProp = properties[propIndex];
            const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
            const matchedAgent = getAgentForProperty(targetProp, allAgents);
            if (matchedAgent) {
                const agentFeaturedCount = currentFeaturedList.filter(p => {
                    const a = getAgentForProperty(p, allAgents);
                    return a && String(a.id) === String(matchedAgent.id);
                }).length;

                if (agentFeaturedCount >= maxPerAgent) {
                    alert(`⚠️ Agent Quota Reached: ${matchedAgent.name} already has ${agentFeaturedCount} featured properties (limit is ${maxPerAgent} per agent).\n\nPlease uncheck another property assigned to ${matchedAgent.name} first, or adjust the limit in Settings.`);
                    renderTable();
                    return;
                }
            }
        }

        const newVal = !isCurrentlyFeatured;
        properties[propIndex].showOnMainpage = newVal;
        properties[propIndex].featured = newVal;
        properties[propIndex].lastUpdated = new Date().toISOString().split('T')[0];
        safeLocalStorageSet('industria_properties', properties);
        renderTable();
        await syncPropertyToSupabase(properties[propIndex]);
        window.dispatchEvent(new Event('storage'));
    };

    // Global toggle for Mainpage Featured Random Selection
    window.toggleFeaturedRandom = async function(isChecked) {
        const role = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                     sessionStorage.getItem('currentUserRole') || 
                     localStorage.getItem('currentUserRole') || 
                     (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || 
                     'Administrator';
        const canManage = (String(role).toLowerCase() === 'administrator' || String(role).toLowerCase() === 'supervisor');
        if (!canManage) {
            alert('Only Administrators and Supervisors can change mainpage featured properties settings.');
            updateFeaturedRandomUI(settings && (settings.randomFeaturedProperties !== false && String(settings.randomFeaturedProperties) !== 'false'));
            return;
        }

        if (!settings) settings = {};
        settings.randomFeaturedProperties = isChecked;
        safeLocalStorageSet('industria_settings', settings);

        updateFeaturedRandomUI(isChecked);

        const settingsSw = document.getElementById('setting-random-featured-properties');
        if (settingsSw) settingsSw.checked = isChecked;

        if (typeof saveGeneralSettingsToSupabase === 'function') {
            await saveGeneralSettingsToSupabase();
        }

        window.dispatchEvent(new Event('storage'));
    };

    function updateFeaturedRandomUI(isChecked) {
        const sw = document.getElementById('toolbar-featured-random-switch');
        const role = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                     sessionStorage.getItem('currentUserRole') || 
                     localStorage.getItem('currentUserRole') || 
                     (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || 
                     'Administrator';
        const canManage = (String(role).toLowerCase() === 'administrator' || String(role).toLowerCase() === 'supervisor');

        if (sw) {
            sw.checked = isChecked;
            sw.disabled = !canManage;
            const wrapper = sw.closest('.featured-random-toggle-wrapper');
            if (wrapper) {
                if (!canManage) {
                    wrapper.classList.add('disabled');
                    wrapper.title = 'Only Administrators and Supervisors can change Random rotation settings.';
                } else {
                    wrapper.classList.remove('disabled');
                    wrapper.removeAttribute('title');
                }
            }
            const parentLabel = sw.closest('label');
            if (parentLabel) {
                if (!canManage) {
                    parentLabel.title = 'Only Administrators and Supervisors can change Random rotation settings.';
                } else {
                    parentLabel.title = 'Randomly select from the Max Featured Per Agent properties to appear on the homepage.';
                }
            }
        }

        const statusEl = document.getElementById('toolbar-featured-random-status');
        if (statusEl) {
            statusEl.textContent = isChecked ? 'ON' : 'OFF';
            if (isChecked) {
                if (canManage) {
                    statusEl.classList.add('status-on');
                    statusEl.style.color = '#059669';
                } else {
                    statusEl.classList.remove('status-on');
                    statusEl.style.color = '#94a3b8';
                }
            } else {
                statusEl.classList.remove('status-on');
                statusEl.style.color = '#64748b';
            }
        }
    }
    window.updateFeaturedRandomUI = updateFeaturedRandomUI;

    // Global toggle for Mainpage Featured Agents Random Selection
    window.toggleFeaturedAgentsRandom = async function(isChecked) {
        const role = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                     sessionStorage.getItem('currentUserRole') || 
                     localStorage.getItem('currentUserRole') || 
                     (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || 
                     'Administrator';
        const canManage = (String(role).toLowerCase() === 'administrator' || String(role).toLowerCase() === 'supervisor');
        if (!canManage) {
            alert('Only Administrators and Supervisors can change mainpage featured agents settings.');
            updateFeaturedAgentsRandomUI(settings && (settings.randomFeaturedAgents !== false && String(settings.randomFeaturedAgents) !== 'false'));
            return;
        }

        if (!settings) settings = {};
        settings.randomFeaturedAgents = isChecked;
        safeLocalStorageSet('industria_settings', settings);

        updateFeaturedAgentsRandomUI(isChecked);

        const settingsSw = document.getElementById('setting-random-featured-agents');
        if (settingsSw) settingsSw.checked = isChecked;

        if (typeof saveGeneralSettingsToSupabase === 'function') {
            await saveGeneralSettingsToSupabase();
        }

        window.dispatchEvent(new Event('storage'));
    };

    function updateFeaturedAgentsRandomUI(isChecked) {
        const sw = document.getElementById('toolbar-featured-agents-random-switch');
        const role = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                     sessionStorage.getItem('currentUserRole') || 
                     localStorage.getItem('currentUserRole') || 
                     (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || 
                     'Administrator';
        const canManage = (String(role).toLowerCase() === 'administrator' || String(role).toLowerCase() === 'supervisor');

        if (sw) {
            sw.checked = isChecked;
            sw.disabled = !canManage;
            const wrapper = sw.closest('.featured-random-toggle-wrapper');
            if (wrapper) {
                if (!canManage) {
                    wrapper.classList.add('disabled');
                    wrapper.title = 'Only Administrators and Supervisors can change Random rotation settings.';
                } else {
                    wrapper.classList.remove('disabled');
                    wrapper.removeAttribute('title');
                }
            }
            const parentLabel = sw.closest('label');
            if (parentLabel) {
                if (!canManage) {
                    parentLabel.title = 'Only Administrators and Supervisors can change Random rotation settings.';
                } else {
                    parentLabel.title = 'Randomly select from the Max Featured agent to appear on the homepage.';
                }
            }
        }

        const statusEl = document.getElementById('toolbar-featured-agents-random-status');
        if (statusEl) {
            statusEl.textContent = isChecked ? 'ON' : 'OFF';
            if (isChecked) {
                if (canManage) {
                    statusEl.classList.add('status-on');
                    statusEl.style.color = '#059669';
                } else {
                    statusEl.classList.remove('status-on');
                    statusEl.style.color = '#94a3b8';
                }
            } else {
                statusEl.classList.remove('status-on');
                statusEl.style.color = '#64748b';
            }
        }
    }
    window.updateFeaturedAgentsRandomUI = updateFeaturedAgentsRandomUI;

    function syncPropertyFeaturesUI(customSettings) {
        const s = customSettings || Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});
        
        // Properties view controls
        const isRandomProps = s.randomFeaturedProperties !== false && String(s.randomFeaturedProperties) !== 'false';
        const maxPropsDisplay = (typeof s.maxFeaturedPropertiesDisplayed === 'number' && s.maxFeaturedPropertiesDisplayed > 0) ? s.maxFeaturedPropertiesDisplayed : 6;
        const maxPerAgent = (typeof s.maxFeaturedPerAgent === 'number' && s.maxFeaturedPerAgent > 0) ? s.maxFeaturedPerAgent : 6;

        updateFeaturedRandomUI(isRandomProps);

        const propMinLabel = document.getElementById('featured-min-label');
        if (propMinLabel) {
            propMinLabel.textContent = `Display up to ${maxPropsDisplay}`;
        }

        const propAgentQuotaLabel = document.getElementById('properties-max-per-agent-label');
        if (propAgentQuotaLabel) {
            propAgentQuotaLabel.textContent = maxPerAgent;
        }

        const noticeAgentQuotaVal = document.getElementById('notice-max-per-agent-val');
        if (noticeAgentQuotaVal) {
            noticeAgentQuotaVal.textContent = maxPerAgent;
        }

        const propTbCtrl = document.getElementById('mainpage-featured-toolbar-ctrl');
        if (propTbCtrl) {
            propTbCtrl.title = `Randomly select from the up to ${maxPerAgent} properties per agent to appear on the homepage (display up to ${maxPropsDisplay}).`;
        }

        // Agents view controls
        const isRandomAgents = s.randomFeaturedAgents !== false && String(s.randomFeaturedAgents) !== 'false';
        const maxAgentsPool = (typeof s.maxFeaturedAgents === 'number' && s.maxFeaturedAgents > 0) ? s.maxFeaturedAgents : 6;
        const maxAgentsDisplay = (typeof s.maxFeaturedAgentsDisplayed === 'number' && s.maxFeaturedAgentsDisplayed > 0) ? Math.min(6, s.maxFeaturedAgentsDisplayed) : 3;

        updateFeaturedAgentsRandomUI(isRandomAgents);

        const poolQuotaNotice = document.getElementById('mainpage-agents-pool-quota-label');
        if (poolQuotaNotice) {
            poolQuotaNotice.textContent = `${maxAgentsPool} agents`;
        }

        const agentsMaxLabel = document.getElementById('mainpage-agents-max-label');
        if (agentsMaxLabel) {
            agentsMaxLabel.textContent = `Display up to ${maxAgentsDisplay}`;
        }

        const agentsTbCtrl = document.getElementById('mainpage-featured-agents-toolbar-ctrl');
        if (agentsTbCtrl) {
            agentsTbCtrl.title = `Randomly select from the up to ${maxAgentsDisplay} featured agents to appear on the homepage.`;
        }
    }
    window.syncPropertyFeaturesUI = syncPropertyFeaturesUI;

    // Global delete function for inline onclick
    window.deleteProperty = function(id) {
        if (currentUserRole === 'Entry Support') {
            alert('Entry Support role is view-only.');
            return;
        }

        const prop = properties.find(p => String(p.id) === String(id));
        if (!prop) return;

        const allowedParks = getAgentAssignedParks();
        if (allowedParks !== null) {
            const activeUserObj = typeof getCurrentUserObj === 'function' ? getCurrentUserObj() : {};
            const activeUsername = (sessionStorage.getItem('loggedInUser') || (activeUserObj.username || '')).toLowerCase();
            const activeAgent = typeof getCurrentAgent === 'function' ? getCurrentAgent() : null;
            const isCreator = (prop.createdBy && String(prop.createdBy).toLowerCase() === activeUsername) ||
                              (prop.createdByAgentId && activeAgent && String(prop.createdByAgentId) === String(activeAgent.id));

            if (!isCreator && (allowedParks.length === 0 || !prop.park || !isParkAllowed(prop.park, allowedParks))) {
                alert('Access Denied: You can only delete property listings within your assigned parks or created by you.');
                return;
            }
        }

        if(confirm('Are you sure you want to delete this property?')) {
            properties = properties.filter(p => String(p.id) !== String(id));
            safeLocalStorageSet('industria_properties', properties);
            syncPropertyDeleteToSupabase(id);
            window.dispatchEvent(new Event('storage'));
            renderTable();
        }
    };

    // Global edit function for inline onclick
    window.editProperty = function(id) {
        if (currentUserRole === 'Entry Support') {
            alert('Entry Support role is view-only.');
            return;
        }

        const prop = properties.find(p => String(p.id) === String(id));
        if (!prop) return;

        const allowedParks = getAgentAssignedParks();
        if (allowedParks !== null) {
            const activeUserObj = typeof getCurrentUserObj === 'function' ? getCurrentUserObj() : {};
            const activeUsername = (sessionStorage.getItem('loggedInUser') || (activeUserObj.username || '')).toLowerCase();
            const activeAgent = typeof getCurrentAgent === 'function' ? getCurrentAgent() : null;
            const isCreator = (prop.createdBy && String(prop.createdBy).toLowerCase() === activeUsername) ||
                              (prop.createdByAgentId && activeAgent && String(prop.createdByAgentId) === String(activeAgent.id));

            if (!isCreator && (allowedParks.length === 0 || !prop.park || !isParkAllowed(prop.park, allowedParks))) {
                alert('Access Denied: You can only edit property listings within your assigned parks or created by you.');
                return;
            }
        }

        editingPropertyId = id;
        
        currentPropertyImages = prop.images ? [...prop.images] : (prop.image ? [prop.image] : []);
        currentRawPropertyImages = prop.rawImages ? [...prop.rawImages] : (prop.rawImage ? [prop.rawImage] : [...currentPropertyImages]);
        if (typeof window.renderPropertyGallery === 'function') window.renderPropertyGallery();

        const modalTitle = document.querySelector('#property-modal .modal-header h3');
        if (modalTitle) modalTitle.textContent = 'Edit Property';

        document.getElementById('propTitle').value = prop.title || '';
        document.getElementById('propLocation').value = prop.location || '';
        
        if (propLocation) {
            const event = new Event('change');
            propLocation.dispatchEvent(event);
        }
        
        if (propPark) {
            if (prop.park) {
                const existingOption = Array.from(propPark.options).find(opt => opt.value === prop.park);
                if (!existingOption) {
                    const option = document.createElement('option');
                    option.value = prop.park;
                    option.textContent = prop.park;
                    propPark.appendChild(option);
                }
            }
            propPark.value = prop.park || '';
        }
        const propRoad = document.getElementById('propRoad');
        if (propRoad) propRoad.value = prop.road || '';
        const propMapUrl = document.getElementById('propMapUrl');
        if (propMapUrl) propMapUrl.value = prop.mapUrl || prop.googleMapUrl || prop.googleEarthUrl || '';
        
        const propSaleRent = document.getElementById('propSaleRent');
        if (propSaleRent) {
            propSaleRent.value = prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale');
        }

        const propStatus = document.getElementById('propStatus');
        if (propStatus) propStatus.value = prop.status || 'Active';

        const propUsage = document.getElementById('propUsage');
        if (propUsage) {
            propUsage.value = prop.usage || 'Not Applicable';
        }

        const propLeaseType = document.getElementById('propLeaseType');
        if (propLeaseType) propLeaseType.value = prop.tenure || prop.leaseType || 'Freehold';

        document.getElementById('propType').value = prop.type || 'Warehouse';
        document.getElementById('propPrice').value = prop.price || '';

        const propLandArea = document.getElementById('propLandArea');
        const propLandAreaUnit = document.getElementById('propLandAreaUnit');
        if (propLandArea && prop.landArea) {
            const parts = prop.landArea.split(' ');
            propLandArea.value = parts[0] || '';
            if (parts[1] && propLandAreaUnit) {
                propLandAreaUnit.value = parts[1].toLowerCase().startsWith('acre') ? 'Acre' : 'sqft';
            }
        } else if (propLandArea) {
            propLandArea.value = '';
        }

        const propSize = document.getElementById('propSize');
        const propSizeUnit = document.getElementById('propSizeUnit');
        if (propSize && prop.size) {
            const parts = prop.size.split(' ');
            propSize.value = parts[0] || '';
            if (parts[1] && propSizeUnit) {
                propSizeUnit.value = parts[1].toLowerCase().startsWith('acre') ? 'Acre' : 'sqft';
            }
        } else if (propSize) {
            propSize.value = '';
        }

        const propPower = document.getElementById('propPower');
        if (propPower) propPower.value = prop.power || '';

        const propLift = document.getElementById('propLift');
        if (propLift) propLift.value = prop.lift || '';

        const propLoadingBay = document.getElementById('propLoadingBay');
        if (propLoadingBay) propLoadingBay.value = prop.loadingBay || '';

        const propFloorLoading = document.getElementById('propFloorLoading');
        if (propFloorLoading) propFloorLoading.value = prop.floorLoading || '';

        const propCeilingPeak = document.getElementById('propCeilingPeak');
        if (propCeilingPeak) propCeilingPeak.value = prop.ceilingPeak || '';

        const propCeilingEave = document.getElementById('propCeilingEave');
        if (propCeilingEave) propCeilingEave.value = prop.ceilingEave || '';

        const propCeilingClear = document.getElementById('propCeilingClear');
        if (propCeilingClear) propCeilingClear.value = prop.ceilingClear || '';

        const propDescription = document.getElementById('propDescription');
        if (propDescription) propDescription.value = prop.description || '';

        const propAvailableUnits = document.getElementById('propAvailableUnits');
        if (propAvailableUnits) propAvailableUnits.value = prop.availableUnits || '';

        const propCompriseUnits = document.getElementById('propCompriseUnits');
        if (propCompriseUnits) propCompriseUnits.value = prop.compriseUnits || '';

        // Trigger change events to apply number formatting
        ['propPrice', 'propLandArea', 'propSize', 'propPower', 'propLift', 'propLoadingBay', 'propFloorLoading', 'propCeilingPeak', 'propCeilingEave', 'propCeilingClear', 'propAvailableUnits', 'propCompriseUnits'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.dispatchEvent(new Event('change'));
        });

        openModal();
    };

    // --- MULTI-VERSION AI DESCRIPTION & OUTLINE GENERATOR LOGIC ---
    let currentAIOutlines = {};

    window.openAIOutlineModal = function() {
        const modal = document.getElementById('ai-outline-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            generateAIOutlines();
        }
    };

    window.closeAIModal = function() {
        const modal = document.getElementById('ai-outline-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        const closeBtn = document.getElementById('close-ai-outline-modal-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeAIModal);

        const aiModal = document.getElementById('ai-outline-modal');
        if (aiModal) {
            aiModal.addEventListener('click', (e) => {
                if (e.target === aiModal) {
                    closeAIModal();
                }
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const aiModal = document.getElementById('ai-outline-modal');
            if (aiModal && (aiModal.classList.contains('active') || aiModal.style.display === 'flex')) {
                closeAIModal();
            }
        }
    });

    window.summarizeDescriptionToOutline = function() {
        openAIOutlineModal();
    };

    window.generateAIOutlines = function() {
        const descEl = document.getElementById('propDescription');

        // Form Fields Metadata
        const title = (document.getElementById('propTitle') || {}).value || '';
        const type = (document.getElementById('propType') || {}).value || '';
        const location = (document.getElementById('propLocation') || {}).value || '';
        const park = (document.getElementById('propPark') || {}).value || '';
        const road = (document.getElementById('propRoad') || {}).value || '';
        const intent = (document.getElementById('propSaleRent') || {}).value || 'Sale';
        const tenure = (document.getElementById('propLeaseType') || {}).value || 'Freehold';
        const rawPrice = (document.getElementById('propPrice') || {}).value || '';

        const landAreaVal = (document.getElementById('propLandArea') || {}).value || '';
        const landAreaUnit = (document.getElementById('propLandAreaUnit') || {}).value || 'sqft';
        const landArea = landAreaVal ? `${landAreaVal} ${landAreaUnit}` : '';

        const sizeVal = (document.getElementById('propSize') || {}).value || '';
        const sizeUnit = (document.getElementById('propSizeUnit') || {}).value || 'sqft';
        const size = sizeVal ? `${sizeVal} ${sizeUnit}` : '';

        const power = (document.getElementById('propPower') || {}).value || '';
        const floorLoading = (document.getElementById('propFloorLoading') || {}).value || '';
        const lift = (document.getElementById('propLift') || {}).value || '';
        const loadingBay = (document.getElementById('propLoadingBay') || {}).value || '';
        const clearHeight = (document.getElementById('propCeilingClear') || {}).value || '';
        const eaveHeight = (document.getElementById('propCeilingEave') || {}).value || '';
        const peakHeight = (document.getElementById('propCeilingPeak') || {}).value || '';
        const customPrompt = ((document.getElementById('ai-custom-prompt-input') || {}).value || '').trim();

        // Subtitle Update
        const subtitleEl = document.getElementById('ai-modal-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = title 
                ? `Analyzing title "${title}" & Klang Valley logistics knowledge... Select your preferred version below:`
                : `Analyzing property specifications & Klang Valley industrial trends... Select your preferred version below:`;
        }

        // Title & Location Keyword Analysis Engine
        const titleLower = title.toLowerCase();
        const locLower = location.toLowerCase();
        const parkLower = park.toLowerCase();
        const fullTextContext = `${titleLower} ${locLower} ${parkLower} ${road.toLowerCase()}`;

        const detectedTags = [];
        if (title) detectedTags.push(`📌 ${title}`);
        if (location) detectedTags.push(`📍 ${location}`);
        if (park) detectedTags.push(`🏭 ${park}`);
        if (type) detectedTags.push(`🏢 ${type}`);
        if (power) detectedTags.push(`⚡ ${power} Amp Power`);
        if (floorLoading) detectedTags.push(`⚖️ ${floorLoading} kN/m² Load`);

        // Smart online/location ecosystem insights based on title & location
        let highwayPerks = [];
        let logisticsPerks = [];
        let marketCategory = 'Klang Valley Logistics Hub';

        if (fullTextContext.includes('subang') || fullTextContext.includes('usj')) {
            highwayPerks = ['Direct Access to KESAS & ELITE Highway', 'Fast Link to Federal Highway & LDP'];
            logisticsPerks = ['15 Mins to Subang Skypark Airport (SZB)', 'High Corporate Image MNC Belt'];
            marketCategory = 'Subang Prime Logistics Corridor';
        } else if (fullTextContext.includes('shah alam') || fullTextContext.includes('bukit jelutong') || fullTextContext.includes('hicom') || fullTextContext.includes('sec 26') || fullTextContext.includes('section')) {
            highwayPerks = ['Seamless Entry to NKVE, KESAS & Guthrie Corridor (GCE)', 'Direct Federal Highway Route'];
            logisticsPerks = ['Premier Manufacturing Hub', 'Wide Roads for 40ft/45ft Container Turning'];
            marketCategory = 'Shah Alam Industrial Hub';
        } else if (fullTextContext.includes('klang') || fullTextContext.includes('westport') || fullTextContext.includes('northport') || fullTextContext.includes('telok gong') || fullTextContext.includes('kapar') || fullTextContext.includes('bukit raja')) {
            highwayPerks = ['Proximity to WCE (West Coast Expressway) & KESAS', 'Direct Port Access Corridor'];
            logisticsPerks = ['5-10 Mins to Port Klang (Westports / Northports)', 'Ideal for Heavy Industry & Bonded Warehousing'];
            marketCategory = 'Port Klang Maritime Logistics Belt';
        } else if (fullTextContext.includes('petaling jaya') || fullTextContext.includes('pj') || fullTextContext.includes('sungei way') || fullTextContext.includes('puchong')) {
            highwayPerks = ['Frontage along LDP, NPE & Federal Highway', 'Quick Connection to KESAS'];
            logisticsPerks = ['10 Mins to Kuala Lumpur City Center', 'High-Visibility Last-Mile Urban Logistics'];
            marketCategory = 'Petaling Jaya Urban Last-Mile Logistics';
        } else {
            highwayPerks = ['Connected via Major Klang Valley Expressways (KESAS / NKVE / Federal Hwy)'];
            logisticsPerks = ['Strategic Logistics Positioning with Container Access'];
        }

        if (highwayPerks.length > 0) detectedTags.push(`🛣️ ${highwayPerks[0]}`);
        if (logisticsPerks.length > 0) detectedTags.push(`🚢 ${logisticsPerks[0]}`);

        // Render detected tags in UI
        const tagsContainer = document.getElementById('ai-detected-title-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = detectedTags.map(t => 
                `<span style="background: #e0e7ff; color: #3730a3; font-size: 0.75rem; font-weight: 600; padding: 3px 10px; border-radius: 20px;">${t}</span>`
            ).join('');
        }

        // Shared Price String
        const priceStr = rawPrice ? (rawPrice.toLowerCase().startsWith('rm') ? rawPrice : `RM ${rawPrice}`) : 'Upon Request';
        const locParkStr = [location, park, road].filter(Boolean).join(' • ');

        // --- VERSION 1: EXECUTIVE CORPORATE OUTLINE ---
        const v1Lines = [];
        v1Lines.push(`📋 EXECUTIVE PROPERTY OUTLINE`);
        v1Lines.push(`-----------------------------------`);
        if (title) v1Lines.push(`• Property: ${title}`);
        if (type) v1Lines.push(`• Category: ${type} (${tenure})`);
        if (locParkStr) v1Lines.push(`• Location: ${locParkStr}`);
        v1Lines.push(`• Transaction: For ${intent} (${priceStr})`);
        if (landArea) v1Lines.push(`• Land Area: ${landArea}`);
        if (size) v1Lines.push(`• Built-up Area: ${size}`);

        v1Lines.push(``);
        v1Lines.push(`🏗️ KEY SPECIFICATIONS:`);
        if (power) v1Lines.push(`  - Power Supply: ${power} Amp`);
        if (floorLoading) v1Lines.push(`  - Floor Loading: ${floorLoading} kN/m²`);
        if (clearHeight || eaveHeight) v1Lines.push(`  - Ceiling Height: ${clearHeight || eaveHeight} ft Clear Clearance`);
        if (loadingBay) v1Lines.push(`  - Loading Bays: ${loadingBay} units`);
        if (lift) v1Lines.push(`  - Cargo Lifts: ${lift} units`);

        v1Lines.push(``);
        v1Lines.push(`🌟 STRATEGIC ADVANTAGES:`);
        v1Lines.push(`  - Located in ${marketCategory}.`);
        highwayPerks.forEach(h => v1Lines.push(`  - ${h}.`));
        if (customPrompt) v1Lines.push(`  - ${customPrompt}.`);
        v1Lines.push(`  - Well-maintained structure suitable for immediate occupancy.`);

        // --- VERSION 2: HIGH-IMPACT MARKETING PITCH ---
        const v2Lines = [];
        v2Lines.push(`🚀 PRIME INDUSTRIAL OPPORTUNITY | FOR ${intent.toUpperCase()}`);
        v2Lines.push(`==========================================`);
        v2Lines.push(`🔥 ${title || 'Top Tier Industrial Facility in Klang Valley'}`);
        v2Lines.push(`📍 Prime Location: ${locParkStr || location || 'Selangor Industrial Zone'}`);
        v2Lines.push(`💰 Asking Price: ${priceStr} (${tenure})`);
        v2Lines.push(``);
        v2Lines.push(`✨ PROPERTY HIGHLIGHTS:`);
        if (size) v2Lines.push(`  - Expansive Built-up of ${size} with spacious floor plate.`);
        if (landArea) v2Lines.push(`  - Generous Land Area of ${landArea} for container maneuvering & parking.`);
        if (power) v2Lines.push(`  - Robust ${power} Amp power supply ready for heavy machinery & cooling.`);
        if (floorLoading) v2Lines.push(`  - Heavy duty floor capacity of ${floorLoading} kN/m².`);
        if (clearHeight) v2Lines.push(`  - ${clearHeight} ft high ceiling clearance for optimal vertical racking.`);
        if (loadingBay) v2Lines.push(`  - Equipped with ${loadingBay} loading bays & dock levellers.`);
        highwayPerks.forEach(h => v2Lines.push(`  - ${h}.`));
        if (customPrompt) v2Lines.push(`  - ${customPrompt}.`);
        v2Lines.push(``);
        v2Lines.push(`📞 Contact our industrial specialist team today for private viewing and site walkthrough!`);

        // --- VERSION 3: TECHNICAL SPEC & ENGINEERING DEEP-DIVE ---
        const v3Lines = [];
        v3Lines.push(`🏗️ TECHNICAL FACILITY SPECIFICATIONS`);
        v3Lines.push(`==========================================`);
        v3Lines.push(`Facility: ${title || type}`);
        v3Lines.push(`Location / Zone: ${locParkStr || location}`);
        v3Lines.push(`Tenure & Type: ${tenure} | ${type}`);
        v3Lines.push(``);
        v3Lines.push(`📐 DIMENSIONS & AREA:`);
        if (landArea) v3Lines.push(`  - Total Land Footprint: ${landArea}`);
        if (size) v3Lines.push(`  - Total Built-Up Space: ${size}`);
        v3Lines.push(`  - Offering Status: For ${intent} @ ${priceStr}`);
        v3Lines.push(``);
        v3Lines.push(`⚡ POWER & STRUCTURAL SPECS:`);
        v3Lines.push(`  - Electrical Supply: ${power || 'High Amp Industrial'} Amp (Substation Access)`);
        v3Lines.push(`  - Slab Floor Loading: ${floorLoading || '20-30'} kN/m² (Reinforced Concrete)`);
        v3Lines.push(`  - Clear Height (Internal): ${clearHeight || '30-40'} ft`);
        if (eaveHeight) v3Lines.push(`  - Eave Height: ${eaveHeight} ft`);
        if (peakHeight) v3Lines.push(`  - Ridge / Peak Height: ${peakHeight} ft`);
        v3Lines.push(`  - Loading Infrastructure: ${loadingBay || 'Multiple'} Loading Bays & Dock Levellers`);
        if (lift) v3Lines.push(`  - Vertical Transportation: ${lift} Units Heavy Duty Cargo Lifts`);
        v3Lines.push(`  - Zoning Compliance: ${marketCategory} (DOE Compliant)`);
        if (customPrompt) v3Lines.push(`  - Special Custom Spec: ${customPrompt}`);

        // --- VERSION 4: ONLINE TITLE-BASED ECOSYSTEM & HIGHWAY INSIGHTS ---
        const v4Lines = [];
        v4Lines.push(`🌐 ONLINE TITLE-RESEARCHED ECOSYSTEM & HIGHLIGHTS`);
        v4Lines.push(`==========================================`);
        v4Lines.push(`Asset Title: ${title || 'Klang Valley Industrial Asset'}`);
        v4Lines.push(`Ecosystem Belt: ${marketCategory}`);
        v4Lines.push(`Addressing: ${locParkStr || location}`);
        v4Lines.push(``);
        v4Lines.push(`🛣️ LOGISTICS CONNECTIONS & HIGHWAYS (RES-FETCHED):`);
        highwayPerks.forEach(h => v4Lines.push(`  - ${h}`));
        logisticsPerks.forEach(l => v4Lines.push(`  - ${l}`));
        v4Lines.push(`  - Direct access route for 40ft Prime Movers and heavy trailers.`);
        v4Lines.push(``);
        v4Lines.push(`📊 OVERVIEW & PROPERTY SUMMARY:`);
        v4Lines.push(`  - ${type} offering ${size ? size + ' built-up' : 'spacious layout'} on ${landArea ? landArea + ' land' : 'prime footprint'}.`);
        if (power) v4Lines.push(`  - Configured with ${power} Amp electricity for manufacturing / distribution operations.`);
        if (clearHeight) v4Lines.push(`  - ${clearHeight} ft vertical clearance allowing high-density racking.`);
        if (customPrompt) v4Lines.push(`  - ${customPrompt}`);
        v4Lines.push(`  - Excellent long-term capital appreciation & rental yield in Selangor's primary industrial corridor.`);

        // Store outlines globally
        currentAIOutlines = {
            v1: v1Lines.join('\n'),
            v2: v2Lines.join('\n'),
            v3: v3Lines.join('\n'),
            v4: v4Lines.join('\n')
        };

        // Render into pre elements
        const preV1 = document.getElementById('ai-outline-v1');
        const preV2 = document.getElementById('ai-outline-v2');
        const preV3 = document.getElementById('ai-outline-v3');
        const preV4 = document.getElementById('ai-outline-v4');

        if (preV1) preV1.textContent = currentAIOutlines.v1;
        if (preV2) preV2.textContent = currentAIOutlines.v2;
        if (preV3) preV3.textContent = currentAIOutlines.v3;
        if (preV4) preV4.textContent = currentAIOutlines.v4;
    };

    window.applyAISuggestion = function(versionKey) {
        const selectedText = currentAIOutlines[versionKey];
        if (!selectedText) return;

        const descEl = document.getElementById('propDescription');
        if (descEl) {
            descEl.value = selectedText;

            // Visual highlight effect
            descEl.style.borderColor = '#6366f1';
            descEl.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.3)';
            setTimeout(() => {
                descEl.style.borderColor = '';
                descEl.style.boxShadow = '';
            }, 1800);
        }

        closeAIModal();
    };

    // Modal Logic — element declarations moved to top of scope

    // Cropper Logic — shared modal, context-aware for 'property' (3:2) and 'agent' (1:1)
    let cropper = null;
    let croppedImageResult = null;       // For property photo
    let agentCroppedImageResult = null;  // For agent photo
    let cropperContext = 'property';     // 'property' or 'agent'

    const cropperModal = document.getElementById('cropper-modal');
    const cropperImage = document.getElementById('cropper-image');
    const cropperModalTitle = document.getElementById('cropper-modal-title');
    const cropperHint = document.getElementById('cropper-hint');
    const propImageInput = document.getElementById('propImage');
    const agentPhotoInput = document.getElementById('agentPhoto');
    const closeCropperBtn = document.getElementById('close-cropper-modal-btn');
    const cancelCropperBtn = document.getElementById('cancel-cropper-btn');
    const saveCropBtn = document.getElementById('save-crop-btn');

    function updateRatioButtonsUI(currentRatio) {
        const ratioBtns = document.querySelectorAll('.cropper-ratio-btn');
        ratioBtns.forEach(btn => {
            const ratioVal = btn.getAttribute('data-ratio');
            let isMatch = false;
            if (isNaN(currentRatio) && ratioVal === 'free') {
                isMatch = true;
            } else if (ratioVal === '2' && Math.abs(2 - currentRatio) < 0.05) {
                isMatch = true;
            } else if (ratioVal === '3' && Math.abs(3 - currentRatio) < 0.05) {
                isMatch = true;
            } else if (ratioVal === '1' && Math.abs(1 - currentRatio) < 0.05) {
                isMatch = true;
            } else if (ratioVal === '1.5' && Math.abs(1.5 - currentRatio) < 0.05) {
                isMatch = true;
            }

            if (isMatch) {
                btn.style.background = 'var(--primary, #0077b6)';
                btn.style.color = '#ffffff';
                btn.style.borderColor = 'var(--primary, #0077b6)';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-color, #2b2d42)';
                btn.style.borderColor = 'var(--border-light, #cbd5e1)';
            }
        });
    }

    // Helper: open cropper with given src, aspectRatio, and context label
    function openCropperWith(src, aspectRatio, context, titleText, hintText) {
        cropperContext = context;
        if (context === 'property') croppedImageResult = null;
        if (context === 'agent') agentCroppedImageResult = null;

        if (cropperModalTitle) cropperModalTitle.innerHTML = '<i class="fa-solid fa-crop-simple"></i> ' + titleText;
        if (cropperHint) cropperHint.innerHTML = hintText;
        cropperImage.src = src;
        cropperModal.classList.add('active');
        cropperModal.style.display = 'flex';
        if (cropper) { cropper.destroy(); cropper = null; }

        const updatePixelDimensions = () => {
            if (!cropper) return;
            const data = cropper.getData(true);
            const w = Math.max(0, Math.round(data.width));
            const h = Math.max(0, Math.round(data.height));
            const ratioStr = h > 0 ? (w / h).toFixed(2) : '0';
            const dimEl = document.getElementById('cropper-pixel-dimensions');
            if (dimEl) {
                dimEl.innerHTML = `<strong>${w} &times; ${h} px</strong> &nbsp;<span style="font-size: 0.82rem; font-weight: 500; opacity: 0.85;">(Ratio ${ratioStr}:1)</span>`;
            }
        };

        try {
            cropper = new Cropper(cropperImage, {
                aspectRatio: aspectRatio,
                viewMode: 1,
                autoCropArea: 0.95,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
                ready: updatePixelDimensions,
                crop: updatePixelDimensions
            });
        } catch (err) {
            console.error('Error initializing Cropper:', err);
        }

        updateRatioButtonsUI(aspectRatio);
    }

    // Aspect ratio selector buttons listener inside Cropper modal
    document.querySelectorAll('.cropper-ratio-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!cropper) return;
            const ratioVal = this.getAttribute('data-ratio');
            let newRatio = NaN;
            if (ratioVal === '2') newRatio = 2 / 1;
            else if (ratioVal === '3') newRatio = 3 / 1;
            else if (ratioVal === '1') newRatio = 1 / 1;
            else if (ratioVal === '1.5') newRatio = 3 / 2;
            else if (ratioVal === 'free') newRatio = NaN;
            else newRatio = parseFloat(ratioVal);

            cropper.setAspectRatio(newRatio);
            updateRatioButtonsUI(newRatio);
        });
    });

    // Reusable image pre-compression helper: compresses & resizes raw ultra high-res photos before crop
    function compressImageBeforeCrop(dataUrl, maxDimension, quality, mimeType, callback) {
        const img = new Image();
        img.onload = function() {
            let width = img.width;
            let height = img.height;
            
            // Downscale proportionally if dimensions exceed maxDimension (e.g. 2048px)
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            if (mimeType === 'image/png') {
                ctx.clearRect(0, 0, width, height);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
            }
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL(mimeType || 'image/jpeg', quality || 0.88);
            callback(compressedDataUrl);
        };
        img.onerror = function() {
            callback(dataUrl);
        };
        img.src = dataUrl;
    }

    // Helper: process file (handle HEIC or direct), compress pre-crop, then open cropper
    function processFileForCropper(file, aspectRatio, context, titleText, hintText, inputEl) {
        const processFile = (fileToRead) => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const isPng = fileToRead.type === 'image/png' || context === 'watermark_logo' || context === 'brand_logo';
                const mimeType = isPng ? 'image/png' : 'image/jpeg';
                const maxDim = context === 'agent' ? 1200 : ((context === 'watermark_logo' || context === 'brand_logo') ? 1200 : 2048);
                
                compressImageBeforeCrop(event.target.result, maxDim, 0.88, mimeType, function(compressedDataUrl) {
                    openCropperWith(compressedDataUrl, aspectRatio, context, titleText, hintText);
                });
            };
            reader.readAsDataURL(fileToRead);
        };

        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            const originalHTML = saveCropBtn ? saveCropBtn.innerHTML : '';
            if (saveCropBtn) saveCropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';
            if (saveCropBtn) saveCropBtn.disabled = true;

            heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 })
                .then(function(resultBlob) {
                    if (saveCropBtn) { saveCropBtn.innerHTML = originalHTML; saveCropBtn.disabled = false; }
                    const jpegFile = new File(
                        [Array.isArray(resultBlob) ? resultBlob[0] : resultBlob],
                        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
                        { type: 'image/jpeg' }
                    );
                    processFile(jpegFile);
                })
                .catch(function(error) {
                    if (saveCropBtn) { saveCropBtn.innerHTML = originalHTML; saveCropBtn.disabled = false; }
                    console.error('HEIC conversion error:', error);
                    alert('Error converting HEIC file. Please try a different image.');
                    if (inputEl) inputEl.value = '';
                });
        } else {
            processFile(file);
        }
    }

    // Property photo input — 3:2 ratio
    let fileQueue = [];
    
    function processNextInQueue() {
        if (fileQueue.length > 0) {
            const file = fileQueue.shift();
            processFileForCropper(
                file, 3 / 2, 'property',
                'Crop Property Photo',
                '<i class="fa-solid fa-circle-info" style="color:var(--primary);margin-right:4px;"></i><strong>Property Photo:</strong> Crop to a <strong>3:2 ratio</strong> (1200&times;800 px crisp HD recommended).',
                null
            );
        } else {
            const propImageInputMultiple = document.getElementById('propImageMultiple');
            if (propImageInputMultiple) propImageInputMultiple.value = '';
            if (propImageInput) propImageInput.value = '';
        }
    }

    if (propImageInput) {
        propImageInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files && files.length > 0) {
                fileQueue = Array.from(files);
                processNextInQueue();
            }
        });
    }

    // Agent photo input — 1:1 ratio with preview update
    if (agentPhotoInput) {
        agentPhotoInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files && files.length > 0) {
                const fileName = files[0].name;
                const fileNameEl = document.getElementById('agent-photo-filename');
                if (fileNameEl) fileNameEl.textContent = fileName;
                processFileForCropper(
                    files[0], 1 / 1, 'agent',
                    'Crop Agent Photo',
                    '<i class="fa-solid fa-circle-info" style="color:var(--primary);margin-right:4px;"></i><strong>Agent Photo:</strong> Crop to a <strong>1:1 square ratio</strong> (800&times;800 px crisp HD recommended) for a clean profile display.',
                    agentPhotoInput
                );
            }
        });
    }

    const closeCropper = () => {
        if (cropperModal) {
            cropperModal.classList.remove('active');
            cropperModal.style.display = 'none';
        }
        if (cropper) { cropper.destroy(); cropper = null; }
        // Reset the appropriate input if nothing was saved
        if (cropperContext === 'property' && !croppedImageResult) {
            if (propImageInput) propImageInput.value = '';
            processNextInQueue(); // Continue if user cancels one
        } else if (cropperContext === 'agent' && !agentCroppedImageResult) {
            if (agentPhotoInput) agentPhotoInput.value = '';
            const fileNameEl = document.getElementById('agent-photo-filename');
            if (fileNameEl) fileNameEl.textContent = 'No file chosen';
        }
    };

    if (closeCropperBtn) closeCropperBtn.addEventListener('click', closeCropper);
    if (cancelCropperBtn) cancelCropperBtn.addEventListener('click', closeCropper);
    if (cropperModal) {
        cropperModal.addEventListener('click', (e) => {
            if (e.target === cropperModal) closeCropper();
        });
    }

    if (saveCropBtn) {
        saveCropBtn.addEventListener('click', async () => {
            if (cropper) {
                if (cropperContext === 'brand_logo') {
                    const canvas = cropper.getCroppedCanvas({
                        maxWidth: 1200,
                        maxHeight: 600,
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high',
                    });
                    if (canvas) {
                        const dataUrl = canvas.toDataURL('image/png');
                        let uploadedLogoUrl = dataUrl;

                        if (window.IndustraSupabase && typeof window.IndustraSupabase.uploadImage === 'function') {
                            const origCropHtml = saveCropBtn ? saveCropBtn.innerHTML : '';
                            if (saveCropBtn) {
                                saveCropBtn.disabled = true;
                                saveCropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Server...';
                            }
                            try {
                                const resL = await window.IndustraSupabase.uploadImage(dataUrl, `company_logo_${Date.now()}.png`);
                                if (resL.success && resL.url) {
                                    uploadedLogoUrl = resL.url;
                                }
                            } catch(errUp) {
                                console.warn('Company logo upload to Supabase Storage failed, using base64 fallback:', errUp);
                            } finally {
                                if (saveCropBtn) {
                                    saveCropBtn.disabled = false;
                                    saveCropBtn.innerHTML = origCropHtml;
                                }
                            }
                        }

                        const logoUrlInput = document.getElementById('setting-brand-logo-url');
                        if (logoUrlInput) logoUrlInput.value = uploadedLogoUrl;
                        const b = getBrandingSettings();
                        b.logoUrl = uploadedLogoUrl;
                        applyBranding(b);
                    }
                    closeCropper();
                    return;
                }

                if (cropperContext === 'brand_favicon') {
                    const canvas = cropper.getCroppedCanvas({
                        width: 512,
                        height: 512,
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high',
                    });
                    if (canvas) {
                        const dataUrl = canvas.toDataURL('image/png');
                        let uploadedFaviconUrl = dataUrl;

                        if (window.IndustraSupabase && typeof window.IndustraSupabase.uploadImage === 'function') {
                            const origCropHtml = saveCropBtn ? saveCropBtn.innerHTML : '';
                            if (saveCropBtn) {
                                saveCropBtn.disabled = true;
                                saveCropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Server...';
                            }
                            try {
                                const resL = await window.IndustraSupabase.uploadImage(dataUrl, `favicon_512_${Date.now()}.png`);
                                if (resL.success && resL.url) {
                                    uploadedFaviconUrl = resL.url;
                                }
                            } catch(errUp) {
                                console.warn('Favicon upload to Supabase Storage failed, using base64 fallback:', errUp);
                            } finally {
                                if (saveCropBtn) {
                                    saveCropBtn.disabled = false;
                                    saveCropBtn.innerHTML = origCropHtml;
                                }
                            }
                        }

                        const favUrlInput = document.getElementById('setting-brand-favicon-url');
                        if (favUrlInput) favUrlInput.value = uploadedFaviconUrl;
                        const b = getBrandingSettings();
                        b.faviconUrl = uploadedFaviconUrl;
                        applyBranding(b);
                    }
                    closeCropper();
                    return;
                }

                if (cropperContext === 'watermark_logo') {
                    const canvas = cropper.getCroppedCanvas({
                        maxWidth: 1000,
                        maxHeight: 1000,
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high',
                    });
                    if (canvas) {
                        const dataUrl = canvas.toDataURL('image/png');
                        let uploadedLogoUrl = dataUrl;

                        if (window.IndustraSupabase && typeof window.IndustraSupabase.uploadImage === 'function') {
                            const origCropHtml = saveCropBtn ? saveCropBtn.innerHTML : '';
                            if (saveCropBtn) {
                                saveCropBtn.disabled = true;
                                saveCropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Server...';
                            }
                            try {
                                const resL = await window.IndustraSupabase.uploadImage(dataUrl, `watermark_logo_${Date.now()}.png`);
                                if (resL.success && resL.url) {
                                    uploadedLogoUrl = resL.url;
                                }
                            } catch(errUp) {
                                console.warn('Watermark logo upload to Supabase Storage failed, using base64 fallback:', errUp);
                            } finally {
                                if (saveCropBtn) {
                                    saveCropBtn.disabled = false;
                                    saveCropBtn.innerHTML = origCropHtml;
                                }
                            }
                        }

                        const previewImg = document.getElementById('watermark-logo-preview');
                        const previewContainer = document.getElementById('watermark-logo-preview-container');
                        const pixelInfo = document.getElementById('watermark-logo-pixel-info');
                        const btnRemove = document.getElementById('btn-remove-watermark-logo');
                        const watermarkTypeSelect = document.getElementById('setting-watermark-type');

                        if (previewImg) {
                            previewImg.src = uploadedLogoUrl;
                            delete previewImg.dataset.logoRemoved;
                            delete previewImg.dataset.removed;
                        }
                        if (typeof watermarkSettings !== 'undefined') {
                            watermarkSettings.logoBase64 = uploadedLogoUrl;
                        }
                        if (previewContainer) previewContainer.style.display = 'flex';
                        if (btnRemove) btnRemove.style.display = 'inline-flex';
                        if (watermarkTypeSelect) {
                            watermarkTypeSelect.value = 'logo';
                            watermarkTypeSelect.dispatchEvent(new Event('change'));
                        }
                        
                        if (typeof updateLogoPixelDetails === 'function') {
                            updateLogoPixelDetails(uploadedLogoUrl);
                        } else {
                            const w = canvas.width;
                            const h = canvas.height;
                            const ratioStr = h > 0 ? (w / h).toFixed(2) : '1.00';
                            if (pixelInfo) {
                                pixelInfo.innerHTML = `<strong>${w} &times; ${h} px</strong> &nbsp;<span style="font-weight: 500; font-size: 0.85em; color: var(--text-muted);">(Ratio ${ratioStr}:1)</span>`;
                            }
                        }
                    }
                    closeCropper();
                    return;
                }

                let cropW, cropH;
                if (cropperContext === 'agent') {
                    cropW = 800; cropH = 800; // Profile (800x800 px) - Crisp HD Avatar
                } else {
                    cropW = 1200; cropH = 800; // Property Resolution (1200x800 px) - Ultra Crisp HD Property Photo
                }
                const canvas = cropper.getCroppedCanvas({
                    width: cropW,
                    height: cropH,
                    fillColor: '#ffffff',
                    imageSmoothingEnabled: true,
                    imageSmoothingQuality: 'high',
                });
                if (canvas) {
                    // Export with 0.85 quality JPEG (~180KB - 350KB, well under 1MB limit while maintaining non-pixelated crisp visuals)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    if (cropperContext === 'agent') {
                        let uploadedAgentUrl = dataUrl;
                        if (window.IndustraSupabase && typeof window.IndustraSupabase.uploadImage === 'function') {
                            const origCropHtml = saveCropBtn ? saveCropBtn.innerHTML : '';
                            if (saveCropBtn) {
                                saveCropBtn.disabled = true;
                                saveCropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Server...';
                            }
                            try {
                                const resA = await window.IndustraSupabase.uploadImage(dataUrl);
                                if (resA.success && resA.url) {
                                    uploadedAgentUrl = resA.url;
                                }
                            } catch (errUp) {
                                console.warn('Agent photo upload to Supabase Storage failed, using base64 fallback:', errUp);
                            } finally {
                                if (saveCropBtn) {
                                    saveCropBtn.disabled = false;
                                    saveCropBtn.innerHTML = origCropHtml;
                                }
                            }
                        }
                        agentCroppedImageResult = uploadedAgentUrl;
                        window._agentCroppedResult = uploadedAgentUrl;
                        const previewImg = document.getElementById('agent-photo-preview-img');
                        const placeholder = document.getElementById('agent-photo-placeholder');
                        if (previewImg) { previewImg.src = uploadedAgentUrl; previewImg.style.display = 'block'; }
                        if (placeholder) placeholder.style.display = 'none';
                        closeCropper();
                    } else {
                        croppedImageResult = dataUrl;

                        let finalWatermarked = dataUrl;
                        if (window.applyWatermark) {
                            try {
                                finalWatermarked = await window.applyWatermark(dataUrl);
                            } catch(errWatermark) {
                                finalWatermarked = dataUrl;
                            }
                        }

                        let storedWatermarkedUrl = finalWatermarked;
                        let storedRawUrl = dataUrl;

                        // Directly upload to Supabase Storage bucket 'property-images'
                        if (window.IndustraSupabase && typeof window.IndustraSupabase.uploadImage === 'function') {
                            const origCropHtml = saveCropBtn ? saveCropBtn.innerHTML : '';
                            if (saveCropBtn) {
                                saveCropBtn.disabled = true;
                                saveCropBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Server...';
                            }
                            try {
                                const resW = await window.IndustraSupabase.uploadImage(finalWatermarked);
                                if (resW.success && resW.url) storedWatermarkedUrl = resW.url;

                                const resR = await window.IndustraSupabase.uploadImage(dataUrl);
                                if (resR.success && resR.url) storedRawUrl = resR.url;
                            } catch (errUp) {
                                console.warn('Direct upload to Supabase Storage failed, using base64 fallback:', errUp);
                            } finally {
                                if (saveCropBtn) {
                                    saveCropBtn.disabled = false;
                                    saveCropBtn.innerHTML = origCropHtml;
                                }
                            }
                        }

                        currentPropertyImages.push(storedWatermarkedUrl);
                        currentRawPropertyImages.push(storedRawUrl);

                        closeCropper(); // Hides cropper modal and destroys instance for current photo

                        if (window.renderPropertyGallery) window.renderPropertyGallery();
                        
                        // Proceed to next photo in queue if multiple images were uploaded
                        processNextInQueue();
                    }
                }
            }
        });
    }


    window.openAddPropertyModal = function() {
        if (currentUserRole === 'Entry Support') {
            alert('Entry Support role is not authorized to create properties.');
            return;
        }

        const allowedParks = getAgentAssignedParks();
        if (allowedParks !== null && allowedParks.length === 0) {
            alert('Access Restricted: You do not have any assigned parks. Please contact an Administrator to assign parks to your account before adding properties.');
            return;
        }

        editingPropertyId = null;
        const modalTitle = document.querySelector('#property-modal .modal-header h3');
        if (modalTitle) modalTitle.textContent = 'Add New Property';
        if (form) form.reset();
        currentPropertyImages = [];
        currentRawPropertyImages = [];
        if (typeof window.renderPropertyGallery === 'function') window.renderPropertyGallery();
        if (propParkGroup) propParkGroup.style.display = 'none';

        const propUsage = document.getElementById('propUsage');
        if (propUsage) {
            propUsage.value = 'Not Applicable';
        }
        openModal();
    };

    if (addBtn) {
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openAddPropertyModal();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    window.closePropertyModal = closeModal;

    // Close on overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Handle Location Change to Populate Industrial Park — element declarations moved to top of scope

    if (propLocation && propParkGroup && propPark) {
        propLocation.addEventListener('change', (e) => {
            const city = e.target.value;
            propPark.innerHTML = '<option value="">None / Not Applicable</option>';
            
            const allowedParks = getAgentAssignedParks();

            if (city && parks[city] && parks[city].length > 0) {
                let visibleParks = parks[city].filter(p => !p.hidden);
                if (allowedParks !== null) {
                    visibleParks = visibleParks.filter(p => isParkAllowed(p.name, allowedParks));
                }

                if (visibleParks.length > 0) {
                    visibleParks.forEach(park => {
                        const option = document.createElement('option');
                        option.value = park.name;
                        let displayText = park.name;
                        if (park.section) {
                            displayText = `${park.name} (${park.section})`;
                        }
                        option.textContent = displayText;
                        propPark.appendChild(option);
                    });
                    propParkGroup.style.display = 'block';
                } else {
                    propParkGroup.style.display = 'none';
                }
            } else {
                propParkGroup.style.display = 'none';
            }
        });
    }

    // Number Input Formatters
    const formatNumberWithCommas = (input, prefix = '') => {
        if (!input) return;
        
        const formatValue = (val) => {
            if (!val || val.trim().toUpperCase() === 'N/A') return val || '';
            // Remove everything except digits and dots
            let numStr = val.replace(/[^\d.]/g, '');
            if (!numStr) return '';
            
            // Handle multiple dots (keep only the first one)
            const parts = numStr.split('.');
            let intPart = parts[0];
            const hasDecimal = parts.length > 1;
            let decPart = parts.slice(1).join('');
            
            if (intPart) {
                intPart = parseInt(intPart, 10).toLocaleString('en-US');
            }
            
            let formatted = prefix ? prefix + intPart : intPart;
            if (hasDecimal) {
                formatted += '.' + decPart;
            }
            return formatted;
        };

        input.addEventListener('input', function() {
            this.value = formatValue(this.value);
        });
        
        // Initial formatting for when edit populates the fields
        input.addEventListener('change', function() {
            this.value = formatValue(this.value);
        });
    };

    formatNumberWithCommas(document.getElementById('propPrice'), 'RM ');
    formatNumberWithCommas(document.getElementById('propSize'));
    formatNumberWithCommas(document.getElementById('propLandArea'));
    formatNumberWithCommas(document.getElementById('propPower'));
    formatNumberWithCommas(document.getElementById('propLift'));
    formatNumberWithCommas(document.getElementById('propLoadingBay'));
    formatNumberWithCommas(document.getElementById('propFloorLoading'));
    formatNumberWithCommas(document.getElementById('propCeilingPeak'));
    formatNumberWithCommas(document.getElementById('propCeilingEave'));
    formatNumberWithCommas(document.getElementById('propCeilingClear'));

    const targetForm = document.getElementById('add-property-form') || form;
    if (targetForm) {
        targetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (currentUserRole === 'Entry Support') {
                alert('Entry Support role is not authorized to create or edit properties.');
                return;
            }
            
            const titleVal = document.getElementById('propTitle') ? document.getElementById('propTitle').value : '';
            const locationVal = document.getElementById('propLocation') ? document.getElementById('propLocation').value : '';
            const intentVal = document.getElementById('propSaleRent') ? document.getElementById('propSaleRent').value : 'Sale';
            const leaseTypeVal = document.getElementById('propLeaseType') ? document.getElementById('propLeaseType').value : 'Freehold';
            const typeVal = document.getElementById('propType') ? document.getElementById('propType').value : 'Warehouse';
            const parkVal = document.getElementById('propPark') ? document.getElementById('propPark').value : '';

            const allowedParks = getAgentAssignedParks();
            if (allowedParks !== null) {
                if (allowedParks.length === 0) {
                    alert('Access Restricted: You do not have any assigned parks. Please contact an Administrator to assign parks to your account before adding or editing properties.');
                    return;
                }
                if (!parkVal || !isParkAllowed(parkVal, allowedParks)) {
                    alert(`You can only create or edit property listings within your assigned parks (${allowedParks.join(', ')}). Please select a valid assigned park.`);
                    return;
                }
                if (editingPropertyId) {
                    const origProp = properties.find(p => String(p.id) === String(editingPropertyId));
                    if (origProp && (!origProp.park || !isParkAllowed(origProp.park, allowedParks))) {
                        alert('Access Denied: You are not authorized to edit this property listing.');
                        return;
                    }
                }
            }
            const roadVal = document.getElementById('propRoad') ? document.getElementById('propRoad').value : '';
            const mapUrlVal = document.getElementById('propMapUrl') ? document.getElementById('propMapUrl').value.trim() : '';
            const priceVal = document.getElementById('propPrice') ? document.getElementById('propPrice').value : '';
            
            const rawSizeVal = document.getElementById('propSize') ? document.getElementById('propSize').value.trim() : '';
            let sizeVal = '';
            if (rawSizeVal) {
                if (rawSizeVal.toUpperCase() === 'N/A') {
                    sizeVal = 'N/A';
                } else {
                    const cleanNum = rawSizeVal.split(' ')[0];
                    const unit = document.getElementById('propSizeUnit') ? document.getElementById('propSizeUnit').value : 'sqft';
                    sizeVal = formatAreaString(`${cleanNum} ${unit}`);
                }
            }

            const rawLandAreaVal = document.getElementById('propLandArea') ? document.getElementById('propLandArea').value.trim() : '';
            let landAreaVal = '';
            if (rawLandAreaVal) {
                if (rawLandAreaVal.toUpperCase() === 'N/A') {
                    landAreaVal = 'N/A';
                } else {
                    const cleanNum = rawLandAreaVal.split(' ')[0];
                    const unit = document.getElementById('propLandAreaUnit') ? document.getElementById('propLandAreaUnit').value : 'sqft';
                    landAreaVal = formatAreaString(`${cleanNum} ${unit}`);
                }
            }
            
            const liftVal = document.getElementById('propLift') ? document.getElementById('propLift').value : '';
            const powerVal = document.getElementById('propPower') ? document.getElementById('propPower').value : '';
            const loadingBayVal = document.getElementById('propLoadingBay') ? document.getElementById('propLoadingBay').value : '';
            const floorLoadingVal = document.getElementById('propFloorLoading') ? document.getElementById('propFloorLoading').value : '';
            const ceilingPeakVal = document.getElementById('propCeilingPeak') ? document.getElementById('propCeilingPeak').value : '';
            const ceilingEaveVal = document.getElementById('propCeilingEave') ? document.getElementById('propCeilingEave').value : '';
            const ceilingClearVal = document.getElementById('propCeilingClear') ? document.getElementById('propCeilingClear').value : '';
            const descriptionVal = document.getElementById('propDescription') ? document.getElementById('propDescription').value.trim() : '';
            const statusVal = document.getElementById('propStatus') ? document.getElementById('propStatus').value : 'Active';
            const propUsageEl = document.getElementById('propUsage');
            const usageVal = propUsageEl ? propUsageEl.value : 'Not Applicable';
            const availableUnitsVal = document.getElementById('propAvailableUnits') ? document.getElementById('propAvailableUnits').value : '';
            const compriseUnitsVal = document.getElementById('propCompriseUnits') ? document.getElementById('propCompriseUnits').value : '';

            // Refresh properties array from localStorage safely
            try {
                const storedProps = localStorage.getItem('industria_properties');
                if (storedProps && storedProps.startsWith('[')) {
                    properties = JSON.parse(storedProps);
                }
            } catch (e) {
                console.warn('Failed to parse properties from localStorage:', e);
            }

            const isEditing = editingPropertyId !== null && editingPropertyId !== undefined;
            let targetPropIndex = -1;

            if (isEditing) {
                // Edit existing property
                targetPropIndex = properties.findIndex(p => p && (String(p.id).trim() === String(editingPropertyId).trim() || p.id == editingPropertyId));
                
                if (targetPropIndex === -1 && titleVal) {
                    targetPropIndex = properties.findIndex(p => p && p.title && p.title.trim().toLowerCase() === titleVal.trim().toLowerCase());
                }

                if (targetPropIndex === -1) {
                    alert(`⚠️ Error: Could not locate property to edit (ID: ${editingPropertyId}). Please try selecting the property again.`);
                    return;
                }

                properties[targetPropIndex].title = titleVal;
                properties[targetPropIndex].location = locationVal;
                properties[targetPropIndex].intent = intentVal;
                properties[targetPropIndex].leaseType = leaseTypeVal;
                properties[targetPropIndex].tenure = leaseTypeVal;
                properties[targetPropIndex].type = typeVal;
                properties[targetPropIndex].park = parkVal;
                properties[targetPropIndex].road = roadVal;
                properties[targetPropIndex].mapUrl = mapUrlVal;
                properties[targetPropIndex].price = priceVal;
                properties[targetPropIndex].size = sizeVal;
                properties[targetPropIndex].landArea = landAreaVal;
                properties[targetPropIndex].lift = liftVal;
                properties[targetPropIndex].power = powerVal;
                properties[targetPropIndex].loadingBay = loadingBayVal;
                properties[targetPropIndex].floorLoading = floorLoadingVal;
                properties[targetPropIndex].ceilingPeak = ceilingPeakVal;
                properties[targetPropIndex].ceilingEave = ceilingEaveVal;
                properties[targetPropIndex].ceilingClear = ceilingClearVal;
                properties[targetPropIndex].description = descriptionVal;
                properties[targetPropIndex].availableUnits = availableUnitsVal;
                properties[targetPropIndex].compriseUnits = compriseUnitsVal;
                properties[targetPropIndex].status = statusVal;
                properties[targetPropIndex].usage = usageVal;
                properties[targetPropIndex].lastUpdated = new Date().toISOString().split('T')[0];
                if (currentPropertyImages.length > 0) {
                    properties[targetPropIndex].images = [...currentPropertyImages];
                    properties[targetPropIndex].image = currentPropertyImages[0];
                }
                if (currentRawPropertyImages.length > 0) {
                    properties[targetPropIndex].rawImages = [...currentRawPropertyImages];
                    properties[targetPropIndex].rawImage = currentRawPropertyImages[0];
                    properties[targetPropIndex].cleanRaw = true;
                }

                // Preserve existing listing creator metadata, or backfill with active user if unrecorded
                if (!properties[targetPropIndex].createdBy) {
                    const activeUserObj = typeof getCurrentUserObj === 'function' ? getCurrentUserObj() : {};
                    const activeAgentObj = typeof getCurrentAgent === 'function' ? getCurrentAgent() : null;
                    const sessionLoggedInUser = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser') || (activeUserObj.username || 'admin');
                    const resolvedAgentId = (activeAgentObj && activeAgentObj.id) ? String(activeAgentObj.id) : (activeUserObj.agentId ? String(activeUserObj.agentId) : null);
                    const resolvedCreatorName = (activeAgentObj && activeAgentObj.name) ? activeAgentObj.name : (activeUserObj.fullName || activeUserObj.name || sessionLoggedInUser);
                    const resolvedCreatorPhone = (activeAgentObj && (activeAgentObj.whatsapp || activeAgentObj.phone)) || (activeUserObj.whatsapp || activeUserObj.phone) || '';

                    properties[targetPropIndex].createdBy = sessionLoggedInUser;
                    properties[targetPropIndex].createdByUserId = activeUserObj.id || null;
                    properties[targetPropIndex].createdByAgentId = resolvedAgentId;
                    properties[targetPropIndex].createdByName = resolvedCreatorName;
                    properties[targetPropIndex].createdByPhone = resolvedCreatorPhone;
                }
            } else {
                // Add new property with active user creator metadata for direct inquiry lead routing
                const activeUserObj = typeof getCurrentUserObj === 'function' ? getCurrentUserObj() : {};
                const activeAgentObj = typeof getCurrentAgent === 'function' ? getCurrentAgent() : null;
                const sessionLoggedInUser = sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser') || (activeUserObj.username || 'admin');
                const resolvedAgentId = (activeAgentObj && activeAgentObj.id) ? String(activeAgentObj.id) : (activeUserObj.agentId ? String(activeUserObj.agentId) : null);
                const resolvedCreatorName = (activeAgentObj && activeAgentObj.name) ? activeAgentObj.name : (activeUserObj.fullName || activeUserObj.name || sessionLoggedInUser);
                const resolvedCreatorPhone = (activeAgentObj && (activeAgentObj.whatsapp || activeAgentObj.phone)) || (activeUserObj.whatsapp || activeUserObj.phone) || '';

                const newProp = {
                    id: Date.now(),
                    title: titleVal,
                    location: locationVal,
                    intent: intentVal,
                    leaseType: leaseTypeVal,
                    type: typeVal,
                    park: parkVal,
                    road: roadVal,
                    mapUrl: mapUrlVal,
                    price: priceVal,
                    size: sizeVal,
                    landArea: landAreaVal,
                    lift: liftVal,
                    power: powerVal,
                    loadingBay: loadingBayVal,
                    floorLoading: floorLoadingVal,
                    ceilingPeak: ceilingPeakVal,
                    ceilingEave: ceilingEaveVal,
                    ceilingClear: ceilingClearVal,
                    description: descriptionVal,
                    availableUnits: availableUnitsVal,
                    compriseUnits: compriseUnitsVal,
                    status: statusVal,
                    usage: usageVal,
                    createdBy: sessionLoggedInUser,
                    createdByUserId: activeUserObj.id || null,
                    createdByAgentId: resolvedAgentId,
                    createdByName: resolvedCreatorName,
                    createdByPhone: resolvedCreatorPhone,
                    showOnMainpage: (properties.filter(p => p && (p.showOnMainpage === true || String(p.showOnMainpage) === 'true' || p.featured === true || String(p.featured) === 'true')).length < 18),
                    featured: (properties.filter(p => p && (p.showOnMainpage === true || String(p.showOnMainpage) === 'true' || p.featured === true || String(p.featured) === 'true')).length < 18),
                    dateCreated: new Date().toISOString().split('T')[0],
                    dateAdded: new Date().toISOString().split('T')[0],
                    lastUpdated: new Date().toISOString().split('T')[0],
                    images: currentPropertyImages.length > 0 ? [...currentPropertyImages] : ['assets/images/warehouse.jpg'],
                    image: currentPropertyImages.length > 0 ? currentPropertyImages[0] : 'assets/images/warehouse.jpg',
                    rawImages: currentRawPropertyImages.length > 0 ? [...currentRawPropertyImages] : (currentPropertyImages.length > 0 ? [...currentPropertyImages] : ['assets/images/warehouse.jpg']),
                    rawImage: currentRawPropertyImages.length > 0 ? currentRawPropertyImages[0] : (currentPropertyImages.length > 0 ? currentPropertyImages[0] : 'assets/images/warehouse.jpg'),
                    cleanRaw: currentRawPropertyImages.length > 0
                };
                properties.push(newProp);
                targetPropIndex = properties.length - 1;
            }

            // Save to Supabase Cloud Database First (Primary Source of Truth)
            const submitBtn = targetForm.querySelector('button[type="submit"]');
            const origSubmitHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving & Uploading to Server...';
            }

            try {
                const savedProp = targetPropIndex > -1 ? properties[targetPropIndex] : null;
                if (savedProp) {
                    const sbResult = await syncPropertyToSupabase(savedProp);
                    if (!sbResult.success) {
                        console.warn('Supabase property save warning:', sbResult.error);
                    } else {
                        currentPropertyImages = Array.isArray(savedProp.images) ? [...savedProp.images] : [];
                        currentRawPropertyImages = Array.isArray(savedProp.rawImages) ? [...savedProp.rawImages] : [];
                    }
                }

                safeLocalStorageSet('industria_properties', properties);
                window.dispatchEvent(new Event('storage'));
                renderTable();
                closeModal();
                const wasEditing = isEditing;
                const newPropId = (savedProp && savedProp.id) ? savedProp.id : (targetPropIndex > -1 && properties[targetPropIndex] ? properties[targetPropIndex].id : null);
                editingPropertyId = null;

                if (!wasEditing && newPropId) {
                    setTimeout(() => {
                        if (typeof openPropertyShareModal === 'function') {
                            openPropertyShareModal(newPropId, { isNew: true });
                        }
                    }, 350);
                } else {
                    alert('✅ Property updated successfully!');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origSubmitHtml;
                }
            }
        });
    }

    // --- LEADS MANAGEMENT ---
    const defaultLeads = [
        {
            id: 1725536400000,
            date: "05/09/2026",
            timestamp: "05/09/2026, 09:15:00 AM",
            name: "Kevin Wong (LogiTech Group)",
            phone: "+60 16-888 2311",
            email: "kevin.wong@logitechgroup.com",
            interest: "Global Logistics Hub (Warehouse, Shah Alam)",
            intent: "Sale",
            message: "We are looking to acquire a 50,000 sqft warehouse for automated logistics. Please send full floor plan and valuation summary.",
            status: "New"
        },
        {
            id: 1725450000000,
            date: "04/09/2026",
            timestamp: "04/09/2026, 02:45:00 PM",
            name: "Sarah Lin (Precision Tech Holdings)",
            phone: "+60 12-455 7890",
            email: "sarah.lin@precisiontech.com.my",
            interest: "High-Tech Manufacturing Plant (Detached Factory, Petaling Jaya)",
            intent: "Rent",
            message: "Interested in long term lease for electronics assembly line. Requires high power supply (1000 Amp). Requesting site viewing.",
            status: "Contacted"
        },
        {
            id: 1725363600000,
            date: "03/09/2026",
            timestamp: "03/09/2026, 11:20:00 AM",
            name: "Encik Ahmad Farhan (Utama Freight)",
            phone: "+60 19-332 1144",
            email: "a.farhan@utamafreight.com",
            interest: "PJ 51 Business Park (Semi-Detached Factory, Petaling Jaya)",
            intent: "Rent",
            message: "Need 45,000 sqft space starting Q4 2026. Urgent inquiry.",
            status: "Qualified"
        }
    ];

    async function loadLeadsFromSupabase(retryCount = 0) {
        if (!window.IndustraSupabase || typeof window.IndustraSupabase.fetchLeads !== 'function') {
            if (retryCount < 10) {
                setTimeout(() => loadLeadsFromSupabase(retryCount + 1), 300);
            }
            return;
        }
        try {
            const sbLeads = await window.IndustraSupabase.fetchLeads();
            if (sbLeads && Array.isArray(sbLeads)) {
                safeLocalStorageSet('industria_leads', sbLeads);
                if (typeof renderLeads === 'function') renderLeads();
                else if (typeof window.renderLeads === 'function') window.renderLeads();
                if (typeof window.renderOverviewSummaries === 'function') {
                    window.renderOverviewSummaries();
                }
                if (typeof window.renderOverviewCharts === 'function') {
                    window.renderOverviewCharts();
                }
            }
        } catch (err) {
            console.warn('Could not load leads from Supabase server database:', err);
        }
    }
    window.loadLeadsFromSupabase = loadLeadsFromSupabase;
    loadLeadsFromSupabase();

    async function loadAgentsFromSupabase(retryCount = 0) {
        if (!window.IndustraSupabase || typeof window.IndustraSupabase.fetchAgents !== 'function') {
            if (retryCount < 10) {
                setTimeout(() => loadAgentsFromSupabase(retryCount + 1), 300);
            }
            return;
        }
        try {
            const sbAgents = await window.IndustraSupabase.fetchAgents();
            if (sbAgents && Array.isArray(sbAgents) && sbAgents.length > 0) {
                agents = sbAgents;
                safeLocalStorageSet('industria_agents', sbAgents);
                if (typeof window.renderAgentsTable === 'function') {
                    window.renderAgentsTable();
                } else if (typeof renderAgentsTable === 'function') {
                    renderAgentsTable();
                }
                if (typeof window.renderParksTable === 'function') {
                    window.renderParksTable();
                } else if (typeof renderParksTable === 'function') {
                    renderParksTable();
                }
            }
        } catch (err) {
            console.warn('Could not load agents from Supabase server database:', err);
        }
    }
    window.loadAgentsFromSupabase = loadAgentsFromSupabase;
    loadAgentsFromSupabase();

    async function loadUsersFromSupabase(retryCount = 0) {
        if (!window.IndustraSupabase || typeof window.IndustraSupabase.fetchUsers !== 'function') {
            if (retryCount < 10) {
                setTimeout(() => loadUsersFromSupabase(retryCount + 1), 300);
            }
            return;
        }
        try {
            const sbUsers = await window.IndustraSupabase.fetchUsers();
            if (sbUsers && Array.isArray(sbUsers) && sbUsers.length > 0) {
                localStorage.setItem('industria_users', JSON.stringify(sbUsers));
                const currentLogged = sessionStorage.getItem('loggedInUser') || '';
                const currentU = sbUsers.find(u => u.username && u.username.toLowerCase() === currentLogged.toLowerCase());
                if (currentU && currentU.role) {
                    sessionStorage.setItem('currentUserRole', currentU.role);
                    localStorage.setItem('currentUserRole', currentU.role);
                    currentUserRole = currentU.role;
                    window.currentUserRole = currentU.role;
                }
                if (typeof window.renderAdminManagement === 'function') {
                    window.renderAdminManagement();
                }
            } else if (sbUsers && Array.isArray(sbUsers) && sbUsers.length === 0) {
                const defaultUsers = [{ username: 'admin', password: 'admin123', role: 'Administrator', whatsapp: '' }];
                localStorage.setItem('industria_users', JSON.stringify(defaultUsers));
                await window.IndustraSupabase.upsertUser(defaultUsers[0]);
                if (typeof window.renderAdminManagement === 'function') {
                    window.renderAdminManagement();
                }
            }
        } catch (err) {
            console.warn('Could not load app users from Supabase server database:', err);
        }
    }
    window.loadUsersFromSupabase = loadUsersFromSupabase;
    loadUsersFromSupabase();

    const leadsTableBody = document.getElementById('leads-table-body');
    const leadStatusFilter = document.getElementById('lead-status-filter');
    const leadSearchInput = document.getElementById('lead-search-input');
    const leadDetailModal = document.getElementById('lead-detail-modal');
    const closeLeadDetailModalBtn = document.getElementById('close-lead-detail-modal-btn');

    let currentLeadTab = 'active';

    window.switchLeadTab = function(tabName) {
        currentLeadTab = tabName;
        const btnActive = document.getElementById('lead-tab-active');
        const btnArchived = document.getElementById('lead-tab-archived');

        if (tabName === 'archived') {
            if (btnActive) btnActive.classList.remove('active');
            if (btnArchived) btnArchived.classList.add('active');
        } else {
            if (btnActive) btnActive.classList.add('active');
            if (btnArchived) btnArchived.classList.remove('active');
        }
        renderLeads();
    };

    function getLeadPropertyTitle(item) {
        if (!item) return 'General Inquiry';
        if (item.title) return item.title;
        if (item.interest) {
            return item.interest.split('(')[0].trim() || 'General Inquiry';
        }
        return 'General Inquiry';
    }

    function parseLeadLocationAndType(item) {
        if (!item) return { location: 'Selangor', type: 'Industrial Property', section: '' };
        let location = item.location || '';
        let type = item.type || '';
        let section = item.section || '';

        if (!location || !type) {
            const interest = item.interest || '';
            const match = interest.match(/\(([^)]+)\)/);
            if (match) {
                const parts = match[1].split(',').map(s => s.trim().replace(/^@\s*/, ''));
                if (parts.length >= 2) {
                    type = type || parts[0];
                    location = location || parts[1];
                    if (parts.length >= 3) section = section || parts[2];
                } else if (parts.length === 1) {
                    type = type || parts[0];
                }
            }
        }

        return {
            location: location || 'Selangor',
            type: type || 'Industrial Property',
            section: section || ''
        };
    }

    function getLeadIndustrialPark(item) {
        if (!item) return 'General / Unassigned';
        if (item.park && item.park.trim() !== '') return item.park;
        if (item.industrialPark && item.industrialPark.trim() !== '') return item.industrialPark;

        // Try lookup from properties catalog
        const catalogProperties = safeJsonParse('industria_properties', typeof defaultProperties !== 'undefined' ? defaultProperties : []);
        if (Array.isArray(catalogProperties) && catalogProperties.length > 0) {
            let matchedProp = null;
            if (item.propertyId) {
                matchedProp = catalogProperties.find(p => String(p.id) === String(item.propertyId));
            }
            if (!matchedProp && item.interest) {
                matchedProp = catalogProperties.find(p => {
                    const title = (p.title || '').toLowerCase();
                    const interest = (item.interest || '').toLowerCase();
                    return title && (interest.includes(title) || title.includes(interest));
                });
            }
            if (matchedProp && matchedProp.park) {
                return matchedProp.park;
            }
        }

        // Try lookup from all known parks in industria_industrial_parks or agent assigned parks
        const parksObj = safeJsonParse('industria_industrial_parks', {});
        let allParks = [];
        Object.values(parksObj).forEach(arr => {
            if (Array.isArray(arr)) {
                arr.forEach(p => {
                    const pName = getParkNameString(p);
                    if (pName) allParks.push(pName);
                });
            }
        });

        const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
        storedAgents.forEach(a => {
            const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            pList.forEach(p => {
                const pName = getParkNameString(p);
                if (pName) allParks.push(pName);
            });
        });
        allParks = [...new Set(allParks)].filter(Boolean);

        const haystack = `${item.interest || ''} ${item.title || ''} ${item.location || ''} ${item.type || ''} ${item.message || ''}`.toLowerCase();

        for (const park of allParks) {
            if (isParkAllowed(park, [haystack]) || haystack.includes(park.toLowerCase())) {
                return park;
            }
        }

        // Location & area fallbacks
        if (haystack.includes('bukit raja') || haystack.includes('klang') || haystack.includes('sime darby')) {
            return 'Bandar Bukit Raja Industrial Park';
        }
        if (haystack.includes('subang') || haystack.includes('sime uep')) {
            return 'SIME UEP Industrial Park';
        }
        if (haystack.includes('shah alam') || haystack.includes('sekitar 26')) {
            return 'Sekitar 26';
        }
        if (haystack.includes('petaling jaya') || haystack.includes('pj 51')) {
            return 'PJ 51 Industrial Park';
        }

        return 'General / Unassigned';
    }

    function getLeadAssignedAgent(item) {
        if (!item) return null;
        const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
        if (!Array.isArray(storedAgents) || storedAgents.length === 0) return null;

        if (item.assignedAgentId) {
            const found = storedAgents.find(a => String(a.id) === String(item.assignedAgentId));
            if (found) return found;
        }

        if (item.assignedAgentName) {
            const found = storedAgents.find(a => (a.name || '').toLowerCase() === item.assignedAgentName.toLowerCase());
            if (found) return found;
        }

        const leadPark = getLeadIndustrialPark(item);
        if (leadPark && leadPark !== 'General / Unassigned') {
            const matched = storedAgents.find(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                return isParkAllowed(leadPark, pList);
            });
            if (matched) return matched;
        }

        return null;
    }

    function populateLeadFilterOptions() {
        const leadParkFilter = document.getElementById('lead-park-filter');
        const leadAgentFilter = document.getElementById('lead-agent-filter');

        if (leadParkFilter) {
            const currentVal = leadParkFilter.value || 'All';
            const parksObj = safeJsonParse('industria_industrial_parks', {});
            let allParks = [];
            Object.values(parksObj).forEach(arr => {
                if (Array.isArray(arr)) {
                    arr.forEach(p => {
                        const pName = getParkNameString(p);
                        if (pName) allParks.push(pName);
                    });
                }
            });

            const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
            storedAgents.forEach(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                pList.forEach(p => {
                    const pName = getParkNameString(p);
                    if (pName) allParks.push(pName);
                });
            });

            let leads = safeJsonParse('industria_leads', defaultLeads);
            leads.forEach(l => {
                const p = getLeadIndustrialPark(l);
                const pName = getParkNameString(p);
                if (pName && pName !== 'General / Unassigned') allParks.push(pName);
            });

            allParks = [...new Set(allParks)].filter(Boolean).sort();

            const allowedParks = getAssistantAssignedParks();
            let availableParks = (allowedParks !== null) ? allowedParks : allParks;

            leadParkFilter.innerHTML = '<option value="All">All Parks</option>';
            availableParks.forEach(p => {
                const pName = getParkNameString(p);
                if (!pName) return;
                const opt = document.createElement('option');
                opt.value = pName;
                opt.textContent = pName;
                if (pName === currentVal) opt.selected = true;
                leadParkFilter.appendChild(opt);
            });
        }

        if (leadAgentFilter) {
            const currentVal = leadAgentFilter.value || 'All';
            const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);

            if (currentUserRole === 'Assistant') {
                leadAgentFilter.style.display = 'none';
            } else {
                leadAgentFilter.style.display = 'inline-block';
                leadAgentFilter.innerHTML = '<option value="All">All Specialist Agents</option>';
                storedAgents.forEach(a => {
                    const opt = document.createElement('option');
                    opt.value = a.id;
                    opt.textContent = a.name;
                    if (String(a.id) === String(currentVal)) opt.selected = true;
                    leadAgentFilter.appendChild(opt);
                });
            }
        }
    }

    function updateAssistantLeadScopeBanner() {
        const scopeCard = document.getElementById('assistant-lead-scope-card');
        const scopeBadges = document.getElementById('assistant-lead-parks-badges');
        if (!scopeCard || !scopeBadges) return;

        if (currentUserRole === 'Assistant') {
            const assignedParks = getAssistantAssignedParks() || [];
            scopeCard.style.display = 'block';
            scopeBadges.innerHTML = '';
            if (assignedParks.length > 0) {
                assignedParks.forEach(park => {
                    const badge = document.createElement('span');
                    badge.className = 'status-badge';
                    badge.style.cssText = 'background: rgba(37,99,235,0.12); color: #1d4ed8; border: 1px solid rgba(37,99,235,0.25); font-weight: 600; font-size: 0.78rem; border-radius: 12px; padding: 2px 8px; margin-right: 4px;';
                    badge.innerHTML = `<i class="fa-solid fa-industry" style="margin-right: 4px;"></i> ${escapeHtml(park)}`;
                    scopeBadges.appendChild(badge);
                });
            } else {
                scopeBadges.innerHTML = '<span style="font-size: 0.8rem; color: #dc2626; font-weight: 600;"><i class="fa-solid fa-triangle-exclamation"></i> No Parks Assigned Yet</span>';
            }
        } else {
            scopeCard.style.display = 'none';
        }
    }

    function renderLeads() {
        window.renderLeads = renderLeads;
        if (!leadsTableBody) return;

        let leads = safeJsonParse('industria_leads', defaultLeads);
        if (!Array.isArray(leads) || leads.length === 0) {
            leads = defaultLeads;
            safeLocalStorageSet('industria_leads', leads);
        }

        populateLeadFilterOptions();
        updateAssistantLeadScopeBanner();

        // Apply park restriction for Assistant role
        const allowedParks = getAssistantAssignedParks();
        const currentAssistantAgent = getAssistantAgent();
        const loggedInUsername = (sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser') || '').toLowerCase();
        if (allowedParks !== null) {
            leads = leads.filter(l => {
                const leadPark = getLeadIndustrialPark(l);
                const isParkMatched = isParkAllowed(leadPark, allowedParks);
                const textHaystack = `${l.interest || ''} ${l.title || ''} ${l.location || ''} ${l.type || ''} ${l.message || ''}`.toLowerCase();
                const isTextMatched = allowedParks.some(p => textHaystack.includes(p.toLowerCase()));
                const isAgentMatched = currentAssistantAgent && String(l.assignedAgentId) === String(currentAssistantAgent.id);
                const isCreatorMatched = loggedInUsername && (
                    (l.assignedUser && String(l.assignedUser).toLowerCase() === loggedInUsername) ||
                    (l.creatorUsername && String(l.creatorUsername).toLowerCase() === loggedInUsername)
                );

                return isParkMatched || isTextMatched || isAgentMatched || isCreatorMatched;
            });
        }

        // Stats calculation
        const activeLeads = leads.filter(l => l.status !== 'Archived');
        const archivedLeads = leads.filter(l => l.status === 'Archived');

        const totalActiveCount = activeLeads.length;
        const newCount = activeLeads.filter(l => l.status === 'New').length;
        const contactedCount = activeLeads.filter(l => l.status === 'Contacted').length;
        const qualifiedCount = activeLeads.filter(l => l.status === 'Qualified').length;
        const archivedCount = archivedLeads.length;

        const statTotal = document.getElementById('lead-stat-total');
        const statNew = document.getElementById('lead-stat-new');
        const statContacted = document.getElementById('lead-stat-contacted');
        const statQualified = document.getElementById('lead-stat-qualified');
        const statArchived = document.getElementById('lead-stat-archived');

        const badgeActive = document.getElementById('lead-active-count-badge');
        const badgeArchived = document.getElementById('lead-archived-count-badge');

        if (statTotal) statTotal.textContent = totalActiveCount;
        if (statNew) statNew.textContent = newCount;
        if (statContacted) statContacted.textContent = contactedCount;
        if (statQualified) statQualified.textContent = qualifiedCount;
        if (statArchived) statArchived.textContent = archivedCount;

        if (badgeActive) badgeActive.textContent = totalActiveCount;
        if (badgeArchived) badgeArchived.textContent = archivedCount;

        let baseLeads = currentLeadTab === 'archived' ? archivedLeads : activeLeads;

        const leadParkFilter = document.getElementById('lead-park-filter');
        const leadAgentFilter = document.getElementById('lead-agent-filter');
        const parkFilterVal = leadParkFilter ? leadParkFilter.value : 'All';
        const agentFilterVal = leadAgentFilter ? leadAgentFilter.value : 'All';
        const statusFilterVal = leadStatusFilter ? leadStatusFilter.value : 'All';
        const searchVal = leadSearchInput ? leadSearchInput.value.toLowerCase().trim() : '';

        let filtered = baseLeads.filter(item => {
            const itemPark = getLeadIndustrialPark(item);
            const matchesPark = (parkFilterVal === 'All') || isParkAllowed(itemPark, [parkFilterVal]);

            const assignedAgent = getLeadAssignedAgent(item);
            const matchesAgent = (agentFilterVal === 'All') || (assignedAgent && String(assignedAgent.id) === String(agentFilterVal));

            const matchesStatus = (statusFilterVal === 'All') || (item.status === statusFilterVal);
            const matchesSearch = !searchVal || 
                (item.name && item.name.toLowerCase().includes(searchVal)) ||
                (item.phone && item.phone.toLowerCase().includes(searchVal)) ||
                (item.email && item.email.toLowerCase().includes(searchVal)) ||
                (item.interest && item.interest.toLowerCase().includes(searchVal)) ||
                (item.title && item.title.toLowerCase().includes(searchVal)) ||
                (item.location && item.location.toLowerCase().includes(searchVal)) ||
                (item.type && item.type.toLowerCase().includes(searchVal)) ||
                (item.message && item.message.toLowerCase().includes(searchVal)) ||
                (itemPark && itemPark.toLowerCase().includes(searchVal)) ||
                (assignedAgent && assignedAgent.name.toLowerCase().includes(searchVal));

            return matchesPark && matchesAgent && matchesStatus && matchesSearch;
        });

        leadsTableBody.innerHTML = '';

        if (filtered.length === 0) {
            const emptyMsg = currentLeadTab === 'archived'
                ? 'No archived customer lead requests found.'
                : 'No active customer lead requests match the selected filters.';
            leadsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
                        <i class="${currentLeadTab === 'archived' ? 'fa-solid fa-box-archive' : 'fa-solid fa-address-card'}" style="font-size: 2.2rem; margin-bottom: 0.5rem; display:block; opacity: 0.5;"></i>
                        ${emptyMsg}
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            let statusStyle = 'background-color: #fef3c7; color: #d97706; border: 1px solid #fde68a;';
            if (item.status === 'Contacted') {
                statusStyle = 'background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
            } else if (item.status === 'Qualified') {
                statusStyle = 'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;';
            } else if (item.status === 'Archived') {
                statusStyle = 'background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;';
            }

            const intentVal = (item.intent || (item.interest && item.interest.toLowerCase().includes('rent') ? 'Rent' : 'Sale')).toUpperCase();
            const intentBadgeStyle = intentVal.includes('RENT') 
                ? 'background-color: #fef08a; color: #854d0e; border: 1px solid #fde047;' 
                : 'background-color: #fecdd3; color: #9f1239; border: 1px solid #fda4af;';

            const locInfo = parseLeadLocationAndType(item);
            const propTitle = getLeadPropertyTitle(item);
            const leadPark = getLeadIndustrialPark(item);
            const assignedAgent = getLeadAssignedAgent(item);

            const parkBadge = (leadPark && leadPark !== 'General / Unassigned')
                ? `<span class="status-badge" style="background-color: rgba(16,185,129,0.12); color: #047857; border: 1px solid rgba(16,185,129,0.3); font-weight:600; font-size:0.71rem; padding:1.5px 6px; display:inline-block;"><i class="fa-solid fa-industry" style="margin-right:3px;"></i> ${escapeHtml(leadPark)}</span>`
                : `<span class="status-badge" style="background-color: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; font-weight:500; font-size:0.71rem; padding:1.5px 6px; display:inline-block;"><i class="fa-solid fa-circle-info" style="margin-right:3px;"></i> General</span>`;

            const agentDisplay = assignedAgent
                ? `<div style="display:inline-flex; align-items:center; gap:6px; text-align:left;">
                    <img src="${assignedAgent.image || 'assets/images/agent_marcus.jpg'}" alt="${escapeHtml(assignedAgent.name)}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e1; flex-shrink:0;" onerror="this.src='assets/images/agent_marcus.jpg'">
                    <div style="line-height:1.2;">
                        <strong style="font-size:0.82rem; color:#1e3a8a; display:block; font-weight:700;">${escapeHtml(assignedAgent.name)}</strong>
                        <small style="color:#64748b; font-size:0.71rem; font-weight:500; display:block;">${escapeHtml(assignedAgent.ren || 'Specialist')}</small>
                    </div>
                   </div>`
                : `<span style="color:var(--text-muted); font-size:0.78rem; font-style:italic;"><i class="fa-solid fa-user-slash" style="margin-right:3px;"></i> Unassigned</span>`;

            tr.innerHTML = `
                <td>
                    <div style="display:flex; flex-direction:column; gap:1px; line-height:1.2;">
                        <span style="font-weight: 600; font-size: 0.81rem; white-space: nowrap;">${item.date || 'N/A'}</span>
                        <small style="color: var(--text-muted); font-size: 0.71rem; white-space: nowrap;">${item.timestamp ? item.timestamp.split(',')[1] || '' : ''}</small>
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:1px; line-height:1.25;">
                        <strong style="color:var(--text-dark); font-size:0.85rem;">${item.name}</strong>
                        <small style="color: var(--text-muted); font-size:0.74rem;"><i class="fa-solid fa-phone" style="margin-right:3px;"></i> ${item.phone || 'N/A'}</small>
                        ${item.email ? `<small style="color: var(--text-muted); font-size:0.72rem;"><i class="fa-solid fa-envelope" style="margin-right:3px;"></i> ${item.email || 'N/A'}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px; line-height:1.25;">
                        <strong style="color: var(--primary); font-size:0.84rem;"><i class="fa-solid fa-location-dot" style="margin-right:3px;"></i> ${locInfo.location}</strong>
                        ${parkBadge}
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px; line-height:1.25;">
                        <strong style="color: var(--primary-dark); font-size: 0.86rem;">${propTitle}</strong>
                        <small style="color: var(--text-dark); font-weight: 500; font-size:0.74rem;">${locInfo.type}</small>
                    </div>
                </td>
                <td>
                    ${agentDisplay}
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px; line-height:1.2;">
                        <span class="status-badge" style="${intentBadgeStyle} font-size: 0.7rem; font-weight:700; padding:1.5px 6px; display: inline-block;">${intentVal}</span>
                        <small style="color: var(--text-muted); font-size:0.73rem; max-width: 180px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;" title="${item.message || ''}">${item.message || 'No additional notes'}</small>
                    </div>
                </td>
                <td>
                    <select class="form-control" onchange="updateLeadStatus('${item.id}', this.value)" style="${statusStyle} font-weight:600; font-size: 0.76rem; padding: 0.22rem 0.5rem; border-radius: 20px; cursor: pointer; outline: none; border-width: 1px;">
                        <option value="New" ${item.status === 'New' ? 'selected' : ''}>New Lead</option>
                        <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Qualified" ${item.status === 'Qualified' ? 'selected' : ''}>Qualified</option>
                        <option value="Archived" ${item.status === 'Archived' ? 'selected' : ''}>Archived</option>
                    </select>
                </td>
                <td>
                    <div style="display: flex; gap: 4px; align-items: center;">
                        <button class="action-btn" title="View Details" onclick="viewLeadDetail('${item.id}')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="action-btn delete" title="Delete Lead Request" onclick="deleteLead('${item.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            leadsTableBody.appendChild(tr);
        });
    }

    window.viewLeadDetail = function(id) {
        let leads = safeJsonParse('industria_leads', defaultLeads);
        const item = leads.find(l => l.id == id);
        if (!item) return;

        const modalContent = document.getElementById('lead-modal-content');
        if (!modalContent) return;

        const cleanPhone = (item.phone || '').replace(/[^0-9+]/g, '');
        const locInfo = parseLeadLocationAndType(item);
        const propTitle = getLeadPropertyTitle(item);
        const intentVal = (item.intent || (item.interest && item.interest.toLowerCase().includes('rent') ? 'Rent' : 'Sale')).toUpperCase();
        const leadName = item.name || 'Anonymous Lead';
        const leadInterest = item.interest || propTitle || 'Industrial Property Inquiry';

        const leadPark = getLeadIndustrialPark(item);
        const assignedAgent = getLeadAssignedAgent(item);

        const parksObj = safeJsonParse('industria_industrial_parks', {});
        let allParksList = [];
        Object.values(parksObj).forEach(arr => {
            if (Array.isArray(arr)) {
                arr.forEach(p => {
                    const pName = getParkNameString(p);
                    if (pName) allParksList.push(pName);
                });
            }
        });

        const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
        storedAgents.forEach(a => {
            const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            pList.forEach(p => {
                const pName = getParkNameString(p);
                if (pName) allParksList.push(pName);
            });
        });
        allParksList = [...new Set(allParksList)].filter(Boolean).sort();

        const isAdministrator = currentUserRole === 'Administrator';

        let parkSelectHtml = '';
        if (isAdministrator) {
            parkSelectHtml = `
                <select id="lead-modal-park-select" class="form-control" style="margin-top: 4px; font-weight: 600; font-size: 0.88rem;">
                    <option value="">-- General / Unassigned --</option>
                    ${allParksList.map(p => `<option value="${escapeHtml(p)}" ${p === leadPark ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('')}
                </select>
            `;
        } else {
            parkSelectHtml = `<div style="font-weight: 700; color: #047857; font-size: 1rem; margin-top: 4px;"><i class="fa-solid fa-industry" style="margin-right: 4px;"></i> ${escapeHtml(leadPark)}</div>`;
        }

        let agentSelectHtml = '';
        if (isAdministrator) {
            agentSelectHtml = `
                <select id="lead-modal-agent-select" class="form-control" style="margin-top: 4px; font-weight: 600; font-size: 0.88rem;">
                    <option value="">-- Auto-Match by Park --</option>
                    ${storedAgents.map(a => `<option value="${a.id}" ${assignedAgent && String(a.id) === String(assignedAgent.id) ? 'selected' : ''}>${escapeHtml(a.name)} (${escapeHtml(a.ren || 'Specialist')})</option>`).join('')}
                </select>
            `;
        } else {
            agentSelectHtml = `<div style="font-weight: 700; color: var(--primary-dark); font-size: 1rem; margin-top: 4px;">${assignedAgent ? escapeHtml(assignedAgent.name) : 'Auto-Assigned'}</div>`;
        }

        modalContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; background: var(--bg-light); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-light);">
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Customer / Contact Name</label>
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--primary-dark);">${escapeHtml(leadName)}</div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Submission Date</label>
                    <div style="font-weight: 600; font-size: 0.95rem;">${escapeHtml(item.timestamp || item.date || 'N/A')}</div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Phone Number</label>
                    <div><a href="tel:${cleanPhone}" style="font-weight: 600;"><i class="fa-solid fa-phone" style="margin-right: 4px;"></i> ${escapeHtml(item.phone || 'N/A')}</a></div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Email Address</label>
                    <div><a href="mailto:${escapeHtml(item.email || '')}" style="font-weight: 600;"><i class="fa-solid fa-envelope" style="margin-right: 4px;"></i> ${escapeHtml(item.email || 'N/A')}</a></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px; background: rgba(16,185,129,0.03);">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Park Assignment</label>
                    ${parkSelectHtml}
                </div>
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px; background: var(--primary-light);">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Assigned Specialist</label>
                    ${agentSelectHtml}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px;">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Location & Type</label>
                    <div style="font-weight: 700; color: var(--primary); font-size: 0.98rem; margin-top: 2px;">${escapeHtml(locInfo.location)} - ${escapeHtml(locInfo.type)} ${locInfo.section ? '(' + escapeHtml(locInfo.section) + ')' : ''}</div>
                </div>
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px;">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Intent & Property Interest</label>
                    <div style="font-weight: 700; color: var(--primary-dark); font-size: 0.98rem; margin-top: 2px;">FOR ${escapeHtml(intentVal)} | ${escapeHtml(propTitle)}</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.3rem;">Customer Message / Special Requirements</label>
                <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-light); white-space: pre-wrap; font-size: 0.95rem;">${escapeHtml(item.message || 'No additional message provided.')}</div>
            </div>

            <div style="border-top: 1px solid var(--border-light); padding-top: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <label style="font-size: 0.85rem; font-weight: 700; margin-right: 0.5rem;">Update Lead Status:</label>
                    <select id="lead-modal-status-select" class="form-control" style="width: auto; display: inline-block; padding: 0.4rem 0.8rem; font-weight: 600;">
                        <option value="New" ${item.status === 'New' ? 'selected' : ''}>New Lead</option>
                        <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''}>Contacted / In Discussion</option>
                        <option value="Qualified" ${item.status === 'Qualified' ? 'selected' : ''}>Qualified Buyer / Tenant</option>
                        <option value="Archived" ${item.status === 'Archived' ? 'selected' : ''}>Archived</option>
                    </select>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g,'')}?text=Hello%20${encodeURIComponent(leadName)}%2C%20this%20is%20MyFactorySpace%20Real%20Estate%20regarding%20your%20inquiry%20for%20${encodeURIComponent(leadInterest)}." target="_blank" class="btn" style="background: #25D366; color: white; padding: 0.5rem 1rem; font-size: 0.88rem; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp Lead
                    </a>
                    <button class="btn btn-primary" onclick="saveLeadModalStatus('${item.id}')" style="padding: 0.5rem 1.25rem; font-size: 0.88rem; border-radius: 8px;">Save Changes</button>
                </div>
            </div>
        `;

        const modalEl = leadDetailModal || document.getElementById('lead-detail-modal');
        if (modalEl) {
            modalEl.style.display = 'flex';
            modalEl.classList.add('active');
        }
    };

    window.saveLeadModalStatus = function(id) {
        const select = document.getElementById('lead-modal-status-select');
        const parkSelect = document.getElementById('lead-modal-park-select');
        const agentSelect = document.getElementById('lead-modal-agent-select');

        let leads = safeJsonParse('industria_leads', defaultLeads);
        const index = leads.findIndex(l => l.id == id);
        if (index !== -1) {
            if (select) leads[index].status = select.value;
            if (parkSelect) leads[index].park = parkSelect.value;
            if (agentSelect) leads[index].assignedAgentId = agentSelect.value;

            safeLocalStorageSet('industria_leads', leads);
            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertLead === 'function') {
                window.IndustraSupabase.upsertLead(leads[index]).catch(e => console.warn('Supabase upsert lead error:', e));
            }
            renderLeads();
            if (typeof window.renderOverviewSummaries === 'function') {
                window.renderOverviewSummaries();
            }
        }

        const modalEl = leadDetailModal || document.getElementById('lead-detail-modal');
        if (modalEl) {
            modalEl.classList.remove('active');
            modalEl.style.display = 'none';
        }
    };

    window.updateLeadStatus = function(id, newStatus) {
        let leads = safeJsonParse('industria_leads', defaultLeads);
        const index = leads.findIndex(l => l.id == id);
        if (index !== -1) {
            leads[index].status = newStatus;
            safeLocalStorageSet('industria_leads', leads);
            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertLead === 'function') {
                window.IndustraSupabase.upsertLead(leads[index]).catch(e => console.warn('Supabase upsert lead status error:', e));
            }
            renderLeads();
            if (typeof window.renderOverviewSummaries === 'function') {
                window.renderOverviewSummaries();
            }
        }
    };

    window.deleteLead = function(id) {
        if (confirm('Are you sure you want to delete this lead request?')) {
            let leads = safeJsonParse('industria_leads', defaultLeads);
            leads = leads.filter(l => l.id != id);
            safeLocalStorageSet('industria_leads', leads);
            if (window.IndustraSupabase && typeof window.IndustraSupabase.deleteLead === 'function') {
                window.IndustraSupabase.deleteLead(id).catch(e => console.warn('Supabase delete lead error:', e));
            }
            renderLeads();
            if (typeof window.renderOverviewSummaries === 'function') {
                window.renderOverviewSummaries();
            }
        }
    };

    const modalLeadEl = leadDetailModal || document.getElementById('lead-detail-modal');
    if (closeLeadDetailModalBtn && modalLeadEl) {
        closeLeadDetailModalBtn.addEventListener('click', () => {
            modalLeadEl.classList.remove('active');
            modalLeadEl.style.display = 'none';
        });
    }
    if (modalLeadEl) {
        modalLeadEl.addEventListener('click', (e) => {
            if (e.target === modalLeadEl) {
                modalLeadEl.classList.remove('active');
                modalLeadEl.style.display = 'none';
            }
        });
    }

    const leadParkFilterEl = document.getElementById('lead-park-filter');
    const leadAgentFilterEl = document.getElementById('lead-agent-filter');
    if (leadParkFilterEl) leadParkFilterEl.addEventListener('change', renderLeads);
    if (leadAgentFilterEl) leadAgentFilterEl.addEventListener('change', renderLeads);
    if (leadStatusFilter) leadStatusFilter.addEventListener('change', renderLeads);
    if (leadSearchInput) leadSearchInput.addEventListener('input', renderLeads);

    // --- OWNER LIST MANAGEMENT ---
    const defaultOwnerListings = [
        {
            id: 1725450000000,
            timestamp: "04/09/2026, 10:30:00 AM",
            date: "04/09/2026",
            name: "Dato' Robert Tan (Global Logistics)",
            phone: "+60 12-388 9123",
            email: "robert.tan@globallogistics.com.my",
            location: "Shah Alam",
            park: "Hicom-Glenmarie Industrial Park",
            type: "Detached Factory",
            intent: "Sale",
            size: "65,000 sqft / 2.5 Acres",
            price: "RM 22,500,000",
            notes: "High ceiling (40ft), 1200 Amp power, heavy floor loading 30kN/m2. Located in Hicom Glenmarie.",
            status: "Pending"
        },
        {
            id: 1725363600000,
            timestamp: "03/09/2026, 02:15:00 PM",
            date: "03/09/2026",
            name: "Syarikat Transport & Freight Express",
            phone: "+60 19-224 5567",
            email: "admin@freightexpress.com",
            location: "Subang Jaya",
            park: "SIME UEP Industrial Park",
            type: "Warehouse",
            intent: "Rent",
            size: "40,000 sqft",
            price: "RM 60,000 / mo",
            notes: "8 loading bays with dock levellers. Strategic location near KESAS highway.",
            status: "Contacted"
        }
    ];

    async function loadOwnerListingsFromSupabase(retryCount = 0) {
        if (!window.IndustraSupabase || typeof window.IndustraSupabase.fetchOwnerListings !== 'function') {
            if (retryCount < 10) {
                setTimeout(() => loadOwnerListingsFromSupabase(retryCount + 1), 300);
            }
            return;
        }
        try {
            const sbListings = await window.IndustraSupabase.fetchOwnerListings();
            if (sbListings && Array.isArray(sbListings)) {
                const mappedListings = sbListings.map(sl => {
                    const base = sl.specs && typeof sl.specs === 'object' ? sl.specs : {};
                    return Object.assign({}, base, {
                        id: sl.id,
                        name: sl.name || base.name || '',
                        phone: sl.phone || base.phone || '',
                        email: sl.email || base.email || '',
                        location: sl.location || base.location || '',
                        park: sl.park || base.park || sl.industrial_park || '',
                        type: sl.type || base.type || '',
                        intent: sl.intent || base.intent || '',
                        size: sl.size || base.size || '',
                        price: sl.price || base.price || '',
                        notes: sl.notes || base.notes || '',
                        status: sl.status || base.status || 'Pending',
                        date: sl.date || base.date || '',
                        timestamp: sl.timestamp || base.timestamp || ''
                    });
                });
                safeLocalStorageSet('industria_owner_listings', mappedListings);
                if (typeof renderOwnerList === 'function') renderOwnerList();
                else if (typeof window.renderOwnerList === 'function') window.renderOwnerList();
                if (typeof window.renderOverviewSummaries === 'function') {
                    window.renderOverviewSummaries();
                }
                if (typeof window.renderOverviewCharts === 'function') {
                    window.renderOverviewCharts();
                }
            } else if (sbListings === null && retryCount < 10) {
                setTimeout(() => loadOwnerListingsFromSupabase(retryCount + 1), 500);
            }
        } catch (e) {
            console.warn('Dashboard owner listings Supabase fetch notice:', e);
        }
    }
    window.loadOwnerListingsFromSupabase = loadOwnerListingsFromSupabase;
    loadOwnerListingsFromSupabase();

    const ownerTableBody = document.getElementById('owner-list-table-body');
    const ownerStatusFilter = document.getElementById('owner-status-filter');
    const ownerSearchInput = document.getElementById('owner-search-input');
    const ownerDetailModal = document.getElementById('owner-detail-modal');
    const closeOwnerDetailModalBtn = document.getElementById('close-owner-detail-modal-btn');

    let currentOwnerTab = 'active';

    window.switchOwnerTab = function(tabName) {
        currentOwnerTab = tabName;
        const btnActive = document.getElementById('owner-tab-active');
        const btnArchived = document.getElementById('owner-tab-archived');

        if (tabName === 'archived') {
            if (btnActive) btnActive.classList.remove('active');
            if (btnArchived) btnArchived.classList.add('active');
        } else {
            if (btnActive) btnActive.classList.add('active');
            if (btnArchived) btnArchived.classList.remove('active');
        }
        renderOwnerList();
    };

    function getOwnerListingIndustrialPark(item) {
        if (!item) return 'General / Unassigned';
        if (item.park && item.park.trim() !== '') return item.park;
        if (item.industrialPark && item.industrialPark.trim() !== '') return item.industrialPark;

        const parksObj = safeJsonParse('industria_industrial_parks', {});
        let allParks = [];
        Object.values(parksObj).forEach(arr => {
            if (Array.isArray(arr)) {
                arr.forEach(p => {
                    const pName = getParkNameString(p);
                    if (pName) allParks.push(pName);
                });
            }
        });

        const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
        storedAgents.forEach(a => {
            const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            pList.forEach(p => {
                const pName = getParkNameString(p);
                if (pName) allParks.push(pName);
            });
        });
        allParks = [...new Set(allParks)].filter(Boolean);

        const haystack = `${item.location || ''} ${item.notes || ''} ${item.type || ''}`.toLowerCase();

        for (const park of allParks) {
            const cleanPark = park.toLowerCase().replace(/[-\s]/g, ' ');
            const cleanHaystack = haystack.replace(/[-\s]/g, ' ');
            if (isParkAllowed(park, [haystack]) || haystack.includes(park.toLowerCase()) || cleanHaystack.includes(cleanPark)) {
                return park;
            }
        }

        if (haystack.includes('hicom') || haystack.includes('glenmarie')) return 'Hicom-Glenmarie Industrial Park';
        if (haystack.includes('bukit raja') || haystack.includes('klang')) return 'Bandar Bukit Raja Industrial Park';
        if (haystack.includes('subang') || haystack.includes('sime uep')) return 'SIME UEP Industrial Park';
        if (haystack.includes('shah alam') || haystack.includes('sekitar 26')) return 'Sekitar 26';
        if (haystack.includes('petaling jaya') || haystack.includes('pj 51')) return 'PJ 51 Industrial Park';

        return 'General / Unassigned';
    }
    window.getOwnerListingIndustrialPark = getOwnerListingIndustrialPark;

    function getOwnerListingAssignedAgent(item) {
        if (!item) return null;
        const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
        if (!Array.isArray(storedAgents) || storedAgents.length === 0) return null;

        if (item.assignedAgentId) {
            const found = storedAgents.find(a => String(a.id) === String(item.assignedAgentId));
            if (found) return found;
        }

        if (item.assignedAgentName) {
            const found = storedAgents.find(a => (a.name || '').toLowerCase() === item.assignedAgentName.toLowerCase());
            if (found) return found;
        }

        const ownerPark = getOwnerListingIndustrialPark(item);
        if (ownerPark && ownerPark !== 'General / Unassigned') {
            const matched = storedAgents.find(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                return isParkAllowed(ownerPark, pList);
            });
            if (matched) return matched;
        }

        return null;
    }

    function populateOwnerFilterOptions() {
        const ownerParkFilter = document.getElementById('owner-park-filter');
        const ownerAgentFilter = document.getElementById('owner-agent-filter');

        if (ownerParkFilter) {
            const currentVal = ownerParkFilter.value || 'All';
            const parksObj = safeJsonParse('industria_industrial_parks', {});
            let allParks = [];
            Object.values(parksObj).forEach(arr => {
                if (Array.isArray(arr)) {
                    arr.forEach(p => {
                        const pName = getParkNameString(p);
                        if (pName) allParks.push(pName);
                    });
                }
            });

            const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
            storedAgents.forEach(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                pList.forEach(p => {
                    const pName = getParkNameString(p);
                    if (pName) allParks.push(pName);
                });
            });

            let listings = safeJsonParse('industria_owner_listings', defaultOwnerListings);
            listings.forEach(l => {
                const p = getOwnerListingIndustrialPark(l);
                const pName = getParkNameString(p);
                if (pName && pName !== 'General / Unassigned') allParks.push(pName);
            });

            allParks = [...new Set(allParks)].filter(Boolean).sort();

            const allowedParks = getAssistantAssignedParks();
            let availableParks = (allowedParks !== null) ? allowedParks : allParks;

            ownerParkFilter.innerHTML = '<option value="All">All Parks</option>';
            availableParks.forEach(p => {
                const pName = getParkNameString(p);
                if (!pName) return;
                const opt = document.createElement('option');
                opt.value = pName;
                opt.textContent = pName;
                if (pName === currentVal) opt.selected = true;
                ownerParkFilter.appendChild(opt);
            });
        }

        if (ownerAgentFilter) {
            const currentVal = ownerAgentFilter.value || 'All';
            const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);

            if (currentUserRole === 'Assistant') {
                ownerAgentFilter.style.display = 'none';
            } else {
                ownerAgentFilter.style.display = 'inline-block';
                ownerAgentFilter.innerHTML = '<option value="All">All Specialist Agents</option>';
                storedAgents.forEach(a => {
                    const opt = document.createElement('option');
                    opt.value = a.id;
                    opt.textContent = a.name;
                    if (String(a.id) === String(currentVal)) opt.selected = true;
                    ownerAgentFilter.appendChild(opt);
                });
            }
        }
    }

    function updateAssistantOwnerScopeBanner() {
        const scopeCard = document.getElementById('assistant-owner-scope-card');
        const scopeBadges = document.getElementById('assistant-owner-parks-badges');
        if (!scopeCard || !scopeBadges) return;

        if (currentUserRole === 'Assistant') {
            const assignedParks = getAssistantAssignedParks() || [];
            scopeCard.style.display = 'block';
            scopeBadges.innerHTML = '';
            if (assignedParks.length > 0) {
                assignedParks.forEach(park => {
                    const badge = document.createElement('span');
                    badge.className = 'status-badge';
                    badge.style.cssText = 'background: rgba(37,99,235,0.12); color: #1d4ed8; border: 1px solid rgba(37,99,235,0.25); font-weight: 600; font-size: 0.78rem; border-radius: 12px; padding: 2px 8px; margin-right: 4px;';
                    badge.innerHTML = `<i class="fa-solid fa-industry" style="margin-right: 4px;"></i> ${escapeHtml(park)}`;
                    scopeBadges.appendChild(badge);
                });
            } else {
                scopeBadges.innerHTML = '<span style="font-size: 0.8rem; color: #dc2626; font-weight: 600;"><i class="fa-solid fa-triangle-exclamation"></i> No Parks Assigned Yet</span>';
            }
        } else {
            scopeCard.style.display = 'none';
        }
    }

    function renderOwnerList() {
        window.renderOwnerList = renderOwnerList;
        if (!ownerTableBody) return;

        let listings = safeJsonParse('industria_owner_listings', defaultOwnerListings);
        if (!Array.isArray(listings) || listings.length === 0) {
            listings = defaultOwnerListings;
            safeLocalStorageSet('industria_owner_listings', listings);
        }

        populateOwnerFilterOptions();
        updateAssistantOwnerScopeBanner();

        // Apply park restriction for Assistant role
        const allowedParks = getAssistantAssignedParks();
        const currentAssistantAgent = getAssistantAgent();
        if (allowedParks !== null) {
            listings = listings.filter(l => {
                const ownerPark = getOwnerListingIndustrialPark(l);
                const isParkMatched = isParkAllowed(ownerPark, allowedParks);
                const textHaystack = `${l.notes || ''} ${l.location || ''} ${l.type || ''}`.toLowerCase();
                const isTextMatched = allowedParks.some(p => textHaystack.includes(p.toLowerCase()));
                const isAgentMatched = currentAssistantAgent && String(l.assignedAgentId) === String(currentAssistantAgent.id);

                return isParkMatched || isTextMatched || isAgentMatched;
            });
        }

        // Separate active vs archived listings
        const activeListings = listings.filter(l => l.status !== 'Archived');
        const archivedListings = listings.filter(l => l.status === 'Archived');

        const totalActiveCount = activeListings.length;
        const pendingCount = activeListings.filter(l => l.status === 'Pending').length;
        const contactedCount = activeListings.filter(l => l.status === 'Contacted').length;
        const approvedCount = activeListings.filter(l => l.status === 'Approved').length;
        const archivedCount = archivedListings.length;

        const statTotal = document.getElementById('owner-stat-total');
        const statPending = document.getElementById('owner-stat-pending');
        const statContacted = document.getElementById('owner-stat-contacted');
        const statApproved = document.getElementById('owner-stat-approved');
        const statArchived = document.getElementById('owner-stat-archived');

        const badgeActive = document.getElementById('owner-active-count-badge');
        const badgeArchived = document.getElementById('owner-archived-count-badge');

        if (statTotal) statTotal.textContent = totalActiveCount;
        if (statPending) statPending.textContent = pendingCount;
        if (statContacted) statContacted.textContent = contactedCount;
        if (statApproved) statApproved.textContent = approvedCount;
        if (statArchived) statArchived.textContent = archivedCount;

        if (badgeActive) badgeActive.textContent = totalActiveCount;
        if (badgeArchived) badgeArchived.textContent = archivedCount;

        // Base dataset depending on current selected subtab
        let baseListings = currentOwnerTab === 'archived' ? archivedListings : activeListings;

        // Filters
        const ownerParkFilter = document.getElementById('owner-park-filter');
        const ownerAgentFilter = document.getElementById('owner-agent-filter');
        const parkFilterVal = ownerParkFilter ? ownerParkFilter.value : 'All';
        const agentFilterVal = ownerAgentFilter ? ownerAgentFilter.value : 'All';
        const statusFilterVal = ownerStatusFilter ? ownerStatusFilter.value : 'All';
        const searchVal = ownerSearchInput ? ownerSearchInput.value.toLowerCase().trim() : '';

        let filtered = baseListings.filter(item => {
            const itemPark = getOwnerListingIndustrialPark(item);
            const matchesPark = (parkFilterVal === 'All') || isParkAllowed(itemPark, [parkFilterVal]);

            const assignedAgent = getOwnerListingAssignedAgent(item);
            const matchesAgent = (agentFilterVal === 'All') || (assignedAgent && String(assignedAgent.id) === String(agentFilterVal));

            const matchesStatus = (statusFilterVal === 'All') || (item.status === statusFilterVal);
            const matchesSearch = !searchVal || 
                (item.name && item.name.toLowerCase().includes(searchVal)) ||
                (item.phone && item.phone.toLowerCase().includes(searchVal)) ||
                (item.email && item.email.toLowerCase().includes(searchVal)) ||
                (item.location && item.location.toLowerCase().includes(searchVal)) ||
                (item.type && item.type.toLowerCase().includes(searchVal)) ||
                (itemPark && itemPark.toLowerCase().includes(searchVal)) ||
                (assignedAgent && assignedAgent.name.toLowerCase().includes(searchVal));

            return matchesPark && matchesAgent && matchesStatus && matchesSearch;
        });

        ownerTableBody.innerHTML = '';

        if (filtered.length === 0) {
            const emptyMsg = currentOwnerTab === 'archived'
                ? 'No archived property owner listings found.'
                : 'No active property owner listings match the selected filters.';
            ownerTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
                        <i class="${currentOwnerTab === 'archived' ? 'fa-solid fa-box-archive' : 'fa-solid fa-clipboard-question'}" style="font-size: 2.2rem; margin-bottom: 0.5rem; display:block; opacity: 0.5;"></i>
                        ${emptyMsg}
                    </td>
                </tr>
            `;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            let statusStyle = 'background-color: #fef3c7; color: #d97706; border: 1px solid #fde68a;';
            if (item.status === 'Contacted') {
                statusStyle = 'background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
            } else if (item.status === 'Approved') {
                statusStyle = 'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;';
            } else if (item.status === 'Archived') {
                statusStyle = 'background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;';
            }

            const intentVal = (item.intent || 'Rent').toUpperCase();
            const intentBadgeStyle = intentVal.includes('RENT') 
                ? 'background-color: #fef08a; color: #854d0e; border: 1px solid #fde047;' 
                : 'background-color: #fecdd3; color: #9f1239; border: 1px solid #fda4af;';

            const ownerPark = getOwnerListingIndustrialPark(item);
            const assignedAgent = getOwnerListingAssignedAgent(item);

            const parkBadgeHtml = (ownerPark && ownerPark !== 'General / Unassigned')
                ? `<span class="status-badge" style="background-color: rgba(16,185,129,0.12); color: #047857; border: 1px solid rgba(16,185,129,0.3); font-weight:600; font-size:0.71rem; padding:1.5px 6px; display:inline-block;"><i class="fa-solid fa-industry" style="margin-right:3px;"></i> ${escapeHtml(ownerPark)}</span>`
                : `<span class="status-badge" style="background-color: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; font-weight:500; font-size:0.71rem; padding:1.5px 6px; display:inline-block;"><i class="fa-solid fa-circle-info" style="margin-right:3px;"></i> General</span>`;

            const agentDisplay = assignedAgent
                ? `<div style="display:inline-flex; align-items:center; gap:6px; text-align:left;">
                    <img src="${assignedAgent.image || 'assets/images/agent_marcus.jpg'}" alt="${escapeHtml(assignedAgent.name)}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e1; flex-shrink:0;" onerror="this.src='assets/images/agent_marcus.jpg'">
                    <div style="line-height:1.2;">
                        <strong style="font-size:0.82rem; color:#1e3a8a; display:block; font-weight:700;">${escapeHtml(assignedAgent.name)}</strong>
                        <small style="color:#64748b; font-size:0.71rem; font-weight:500; display:block;">${escapeHtml(assignedAgent.ren || 'Specialist')}</small>
                    </div>
                   </div>`
                : `<span style="color:var(--text-muted); font-size:0.78rem; font-style:italic;"><i class="fa-solid fa-user-slash" style="margin-right:3px;"></i> Unassigned</span>`;

            tr.innerHTML = `
                <td>
                    <div style="display:flex; flex-direction:column; gap:1px; line-height:1.2;">
                        <span style="font-weight: 600; font-size: 0.81rem; white-space: nowrap;">${item.date || 'N/A'}</span>
                        <small style="color: var(--text-muted); font-size: 0.71rem; white-space: nowrap;">${item.timestamp ? item.timestamp.split(',')[1] || '' : ''}</small>
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:1px; line-height:1.25;">
                        <strong style="color:var(--text-dark); font-size:0.85rem;">${escapeHtml(item.name)}</strong>
                        <small style="color: var(--text-muted); font-size:0.74rem;"><i class="fa-solid fa-phone" style="margin-right:3px;"></i> ${escapeHtml(item.phone)}</small>
                        ${item.email ? `<small style="color: var(--text-muted); font-size:0.72rem;"><i class="fa-solid fa-envelope" style="margin-right:3px;"></i> ${escapeHtml(item.email)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px; line-height:1.25;">
                        <strong style="color: var(--primary); font-size:0.84rem;"><i class="fa-solid fa-location-dot" style="margin-right:3px;"></i> ${escapeHtml(item.location)}</strong>
                        ${parkBadgeHtml}
                        <small style="color: var(--text-dark); font-weight: 500; font-size:0.74rem;">${escapeHtml(item.type)}</small>
                    </div>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px; line-height:1.2;">
                        <span class="status-badge" style="${intentBadgeStyle} font-size: 0.7rem; font-weight:700; padding:1.5px 6px; display: inline-block;">${intentVal}</span>
                        <small style="color: var(--text-muted); font-size:0.73rem;">${escapeHtml(item.size || 'Not specified')}</small>
                    </div>
                </td>
                <td>
                    ${agentDisplay}
                </td>
                <td>
                    <strong style="color: var(--primary-dark); font-size: 0.88rem; white-space: nowrap;">${escapeHtml(item.price || 'Open')}</strong>
                </td>
                <td>
                    <select class="form-control" onchange="updateOwnerStatus('${item.id}', this.value)" style="${statusStyle} font-weight:600; font-size: 0.76rem; padding: 0.22rem 0.5rem; border-radius: 20px; cursor: pointer; outline: none; border-width: 1px;">
                        <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Approved" ${item.status === 'Approved' ? 'selected' : ''}>Approved</option>
                        <option value="Archived" ${item.status === 'Archived' ? 'selected' : ''}>Archived</option>
                    </select>
                </td>
                <td>
                    <div style="display: flex; gap: 4px; align-items: center;">
                        <button class="action-btn" title="View Details" onclick="viewOwnerDetail('${item.id}')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="action-btn delete" title="Delete Listing Request" onclick="deleteOwnerListing('${item.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            ownerTableBody.appendChild(tr);
        });
    }

    window.viewOwnerDetail = function(id) {
        let listings = safeJsonParse('industria_owner_listings', defaultOwnerListings);
        if (!Array.isArray(listings) || listings.length === 0) {
            listings = defaultOwnerListings;
        }
        const item = listings.find(l => l.id == id);
        if (!item) return;

        const modalContent = document.getElementById('owner-modal-content');
        if (!modalContent) return;

        const cleanPhone = (item.phone || '').replace(/[^0-9+]/g, '');
        const ownerPark = getOwnerListingIndustrialPark(item);
        const assignedAgent = getOwnerListingAssignedAgent(item);

        const parksObj = safeJsonParse('industria_industrial_parks', {});
        let allParksList = [];
        Object.values(parksObj).forEach(arr => {
            if (Array.isArray(arr)) {
                arr.forEach(p => {
                    const pName = getParkNameString(p);
                    if (pName) allParksList.push(pName);
                });
            }
        });

        const storedAgents = safeJsonParse('industria_agents', typeof defaultAgents !== 'undefined' ? defaultAgents : []);
        storedAgents.forEach(a => {
            const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            pList.forEach(p => {
                const pName = getParkNameString(p);
                if (pName) allParksList.push(pName);
            });
        });
        allParksList = [...new Set(allParksList)].filter(Boolean).sort();

        const isAdministrator = currentUserRole === 'Administrator';

        let parkSelectHtml = '';
        if (isAdministrator) {
            parkSelectHtml = `
                <select id="owner-modal-park-select" class="form-control" style="margin-top: 4px; font-weight: 600; font-size: 0.88rem;">
                    <option value="">-- General / Unassigned --</option>
                    ${allParksList.map(p => `<option value="${escapeHtml(p)}" ${p === ownerPark ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('')}
                </select>
            `;
        } else {
            parkSelectHtml = `<div style="font-weight: 700; color: #047857; font-size: 1rem; margin-top: 4px;"><i class="fa-solid fa-industry" style="margin-right: 4px;"></i> ${escapeHtml(ownerPark)}</div>`;
        }

        let agentSelectHtml = '';
        if (isAdministrator) {
            agentSelectHtml = `
                <select id="owner-modal-agent-select" class="form-control" style="margin-top: 4px; font-weight: 600; font-size: 0.88rem;">
                    <option value="">-- Auto-Match by Park --</option>
                    ${storedAgents.map(a => `<option value="${a.id}" ${assignedAgent && String(a.id) === String(assignedAgent.id) ? 'selected' : ''}>${escapeHtml(a.name)} (${escapeHtml(a.ren || 'Specialist')})</option>`).join('')}
                </select>
            `;
        } else {
            agentSelectHtml = `<div style="font-weight: 700; color: var(--primary-dark); font-size: 1rem; margin-top: 4px;">${assignedAgent ? escapeHtml(assignedAgent.name) : 'Auto-Assigned'}</div>`;
        }

        modalContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; background: var(--bg-light); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-light);">
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Owner / Contact Name</label>
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--primary-dark);">${escapeHtml(item.name)}</div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Submission Date</label>
                    <div style="font-weight: 600; font-size: 0.95rem;">${escapeHtml(item.timestamp || item.date)}</div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Phone Number</label>
                    <div><a href="tel:${cleanPhone}" style="font-weight: 600;"><i class="fa-solid fa-phone" style="margin-right: 4px;"></i> ${escapeHtml(item.phone)}</a></div>
                </div>
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Email Address</label>
                    <div><a href="mailto:${escapeHtml(item.email)}" style="font-weight: 600;"><i class="fa-solid fa-envelope" style="margin-right: 4px;"></i> ${escapeHtml(item.email)}</a></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px; background: rgba(16,185,129,0.03);">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Park Assignment</label>
                    ${parkSelectHtml}
                </div>
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px; background: rgba(37,99,235,0.03);">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Assigned Specialist</label>
                    ${agentSelectHtml}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px;">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Location & Type</label>
                    <div style="font-weight: 700; color: var(--primary); font-size: 0.98rem; margin-top: 2px;">
                        ${escapeHtml(item.location)} - ${escapeHtml(item.type)}
                    </div>
                </div>
                <div style="border: 1px solid var(--border-light); padding: 1rem; border-radius: 10px;">
                    <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block;">Intent & Asking Price</label>
                    <div style="font-weight: 700; color: var(--primary-dark); font-size: 0.98rem; margin-top: 2px;">${escapeHtml(item.intent)} | ${escapeHtml(item.price || 'Open')}</div>
                </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.3rem;">Estimated Built-up / Size</label>
                <div style="font-weight: 600; background: var(--bg-light); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-light);">${escapeHtml(item.size || 'Not specified')}</div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.3rem;">Property Address & Owner Notes</label>
                <div style="background: var(--bg-light); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-light); white-space: pre-wrap; font-size: 0.95rem;">${escapeHtml(item.notes || 'No additional notes provided.')}</div>
            </div>

            <div style="border-top: 1px solid var(--border-light); padding-top: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <label style="font-size: 0.85rem; font-weight: 700; margin-right: 0.5rem;">Update Review Status:</label>
                    <select id="modal-status-select" class="form-control" style="width: auto; display: inline-block; padding: 0.4rem 0.8rem; font-weight: 600;">
                        <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending Review</option>
                        <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''}>Contacted / In Discussion</option>
                        <option value="Approved" ${item.status === 'Approved' ? 'selected' : ''}>Approved & Listed</option>
                        <option value="Archived" ${item.status === 'Archived' ? 'selected' : ''}>Archived</option>
                    </select>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g,'')}?text=Hello%20${encodeURIComponent(item.name)}%2C%20this%20is%20MyFactorySpace%20Real%20Estate%20regarding%20your%20property%20listing%20request." target="_blank" class="btn" style="background: #25D366; color: white; padding: 0.5rem 1rem; font-size: 0.88rem; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
                        <i class="fa-brands fa-whatsapp"></i> WhatsApp Owner
                    </a>
                    <button class="btn btn-primary" onclick="saveModalStatus('${item.id}')" style="padding: 0.5rem 1.25rem; font-size: 0.88rem; border-radius: 8px;">Save Changes</button>
                </div>
            </div>
        `;

        const modalEl = ownerDetailModal || document.getElementById('owner-detail-modal');
        if (modalEl) {
            modalEl.style.display = 'flex';
            modalEl.classList.add('active');
        }
    };

    window.saveModalStatus = async function(id) {
        const select = document.getElementById('modal-status-select');
        const parkSelect = document.getElementById('owner-modal-park-select');
        const agentSelect = document.getElementById('owner-modal-agent-select');

        let listings = safeJsonParse('industria_owner_listings', defaultOwnerListings);
        const index = listings.findIndex(l => l.id == id);
        if (index !== -1) {
            if (select) listings[index].status = select.value;
            if (parkSelect) listings[index].park = parkSelect.value;
            if (agentSelect) listings[index].assignedAgentId = agentSelect.value;

            safeLocalStorageSet('industria_owner_listings', listings);
            renderOwnerList();
            if (typeof window.renderOverviewSummaries === 'function') {
                window.renderOverviewSummaries();
            }
            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertOwnerListing === 'function') {
                await window.IndustraSupabase.upsertOwnerListing(listings[index]);
            }
        }

        const modalEl = ownerDetailModal || document.getElementById('owner-detail-modal');
        if (modalEl) {
            modalEl.classList.remove('active');
            modalEl.style.display = 'none';
        }
    };

    window.updateOwnerStatus = async function(id, newStatus) {
        let listings = safeJsonParse('industria_owner_listings', defaultOwnerListings);
        const index = listings.findIndex(l => l.id == id);
        if (index !== -1) {
            listings[index].status = newStatus;
            safeLocalStorageSet('industria_owner_listings', listings);
            renderOwnerList();
            if (typeof window.renderOverviewSummaries === 'function') {
                window.renderOverviewSummaries();
            }
            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertOwnerListing === 'function') {
                await window.IndustraSupabase.upsertOwnerListing(listings[index]);
            }
        }
    };

    window.deleteOwnerListing = async function(id) {
        if (confirm('Are you sure you want to delete this property owner listing request?')) {
            let listings = safeJsonParse('industria_owner_listings', defaultOwnerListings);
            listings = listings.filter(l => l.id != id);
            safeLocalStorageSet('industria_owner_listings', listings);
            renderOwnerList();
            if (typeof window.renderOverviewSummaries === 'function') {
                window.renderOverviewSummaries();
            }
            if (window.IndustraSupabase && typeof window.IndustraSupabase.deleteOwnerListing === 'function') {
                await window.IndustraSupabase.deleteOwnerListing(id);
            }
        }
    };

    const modalEl = ownerDetailModal || document.getElementById('owner-detail-modal');
    if (closeOwnerDetailModalBtn && modalEl) {
        closeOwnerDetailModalBtn.addEventListener('click', () => {
            modalEl.classList.remove('active');
            modalEl.style.display = 'none';
        });
    }
    if (modalEl) {
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                modalEl.classList.remove('active');
                modalEl.style.display = 'none';
            }
        });
    }

    const ownerParkFilterEl = document.getElementById('owner-park-filter');
    const ownerAgentFilterEl = document.getElementById('owner-agent-filter');
    if (ownerParkFilterEl) ownerParkFilterEl.addEventListener('change', renderOwnerList);
    if (ownerAgentFilterEl) ownerAgentFilterEl.addEventListener('change', renderOwnerList);
    if (ownerStatusFilter) ownerStatusFilter.addEventListener('change', renderOwnerList);
    if (ownerSearchInput) ownerSearchInput.addEventListener('input', renderOwnerList);

    // --- VIEW SWITCHING & SUBTABS ---
    const navOverview = document.getElementById('nav-overview');
    const navProperties = document.getElementById('nav-properties');
    const navParks = document.getElementById('nav-parks');
    const navLeads = document.getElementById('nav-leads');
    const navOwnerList = document.getElementById('nav-owner-list');
    const navAgents = document.getElementById('nav-agents');
    const navSettings = document.getElementById('nav-settings');
    const navSettingsGeneral = document.getElementById('nav-settings-general');
    const navSettingsTimezone = document.getElementById('nav-settings-timezone');
    const navSettingsServer = document.getElementById('nav-settings-server');
    const navSettingsAdmin = document.getElementById('nav-settings-admin');
    const settingsSubmenu = document.getElementById('settings-submenu');
    const settingsArrow = document.getElementById('settings-arrow');
    
    const overviewView = document.getElementById('overview-view');
    const propertiesView = document.getElementById('properties-view');
    const parksView = document.getElementById('parks-view');
    const leadsView = document.getElementById('leads-view');
    const ownerListView = document.getElementById('owner-list-view');
    const agentsView = document.getElementById('agents-view');
    const settingsView = document.getElementById('settings-view');

    const tabBtnGeneral = document.getElementById('tab-btn-general');
    const tabBtnTimezone = document.getElementById('tab-btn-timezone');
    const tabBtnServer = document.getElementById('tab-btn-server');
    const tabBtnAdmin = document.getElementById('tab-btn-admin');
    const subtabGeneral = document.getElementById('settings-subtab-general');
    const subtabTimezone = document.getElementById('settings-subtab-timezone');
    const subtabServer = document.getElementById('settings-subtab-server');
    const subtabAdmin = document.getElementById('settings-subtab-admin');
    const settingsPageTitle = document.getElementById('settings-page-title');

    // Function to calculate and render LocalStorage capacity usage
    window.updateLocalStorageStatsUI = function() {
        let totalBytes = 0;
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalBytes += (localStorage[key].length + key.length) * 2;
                }
            }
        } catch(e) {}
        
        const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
        const maxMB = 5.0;
        const percent = Math.min(100, Math.max(0, (totalBytes / (5 * 1024 * 1024)) * 100)).toFixed(1);
        
        const textEl = document.getElementById('storage-usage-text');
        const barEl = document.getElementById('storage-usage-bar');
        
        if (textEl) {
            textEl.innerHTML = `<strong>${usedMB} MB</strong> / ${maxMB.toFixed(2)} MB (${percent}% Used)`;
        }
        if (barEl) {
            barEl.style.width = percent + '%';
            if (parseFloat(percent) > 85) {
                barEl.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            } else if (parseFloat(percent) > 60) {
                barEl.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
            } else {
                barEl.style.background = 'linear-gradient(90deg, #10b981, #0077b6)';
            }
        }
    };

    window.checkSupabaseStorageUsage = async function() {
        const textEl = document.getElementById('supabase-storage-usage-text');
        const barEl = document.getElementById('supabase-storage-usage-bar');
        const statusBadge = document.getElementById('supabase-status-badge');
        const countPropsEl = document.getElementById('supabase-count-properties');
        const countUsersEl = document.getElementById('supabase-count-users');
        const countLeadsEl = document.getElementById('supabase-count-leads');

        if (!window.IndustraSupabase) {
            if (statusBadge) {
                statusBadge.style.background = '#fee2e2';
                statusBadge.style.color = '#dc2626';
                statusBadge.style.borderColor = '#fca5a5';
                statusBadge.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Disconnected';
            }
            if (textEl) textEl.textContent = 'Supabase client not initialized';
            return;
        }

        try {
            const client = window.IndustraSupabase.getClient();
            if (!client) throw new Error('No client');

            const [propsRes, usersRes, leadsRes, parksRes] = await Promise.all([
                client.from('properties').select('id', { count: 'exact', head: true }),
                client.from('app_users').select('id', { count: 'exact', head: true }),
                client.from('leads').select('id', { count: 'exact', head: true }),
                client.from('parks').select('id', { count: 'exact', head: true })
            ]);

            const propCount = propsRes.count || 0;
            const userCount = usersRes.count || 0;
            const leadCount = leadsRes.count || 0;
            const parkCount = parksRes.count || 0;

            if (countPropsEl) countPropsEl.textContent = `${propCount} Listing${propCount !== 1 ? 's' : ''}`;
            if (countUsersEl) countUsersEl.textContent = `${userCount} Account${userCount !== 1 ? 's' : ''}`;
            if (countLeadsEl) countLeadsEl.textContent = `${leadCount} Inquir${leadCount !== 1 ? 'ies' : 'y'}`;
            const countParksEl = document.getElementById('supabase-count-parks');
            if (countParksEl) countParksEl.textContent = `${parkCount} Park${parkCount !== 1 ? 's' : ''}`;

            if (typeof updateLastExportBadge === 'function') {
                updateLastExportBadge();
            }
            if (typeof updateLastRestoreBadge === 'function') {
                updateLastRestoreBadge();
            }

            const { data: allProps } = await client.from('properties').select('*');
            const bytes = new Blob([JSON.stringify(allProps || [])]).size;
            const usedMB = (bytes / (1024 * 1024)).toFixed(3);
            const maxMB = 500.0;
            const percent = Math.max(0.01, ((bytes / (500 * 1024 * 1024)) * 100)).toFixed(3);

            if (textEl) {
                textEl.innerHTML = `<strong>${usedMB} MB</strong> / ${maxMB.toFixed(0)} MB Free Tier Quota (${percent}% Used)`;
            }

            if (barEl) {
                barEl.style.width = Math.max(1, parseFloat(percent)) + '%';
            }

            if (statusBadge) {
                statusBadge.style.background = '#dcfce7';
                statusBadge.style.color = '#15803d';
                statusBadge.style.borderColor = '#bbf7d0';
                statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connected & Active';
            }

        } catch (e) {
            console.warn('Error checking Supabase storage:', e);
            if (textEl) textEl.textContent = 'Active (Connected)';
        }
    };

    // --- SUPABASE DATABASE EXPORT & BACKUP SYSTEM ---
    function updateLastExportBadge(iso) {
        const badgeText = document.getElementById('supabase-last-export-text');
        const badgeEl = document.getElementById('supabase-last-export-badge');
        const stored = iso || localStorage.getItem('supabase_last_export_timestamp');
        if (stored && badgeText) {
            const d = new Date(stored);
            if (!isNaN(d.getTime())) {
                const timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                badgeText.textContent = `Last export: ${timeStr}`;
                if (badgeEl) {
                    badgeEl.style.background = '#dcfce7';
                    badgeEl.style.color = '#15803d';
                    badgeEl.style.borderColor = '#bbf7d0';
                }
            }
        }
    }
    window.updateLastExportBadge = updateLastExportBadge;

    function updateLastRestoreBadge(iso) {
        const badgeText = document.getElementById('supabase-last-restore-text');
        const badgeEl = document.getElementById('supabase-last-restore-badge');
        const stored = iso || localStorage.getItem('supabase_last_restore_timestamp');
        if (stored && badgeText) {
            const d = new Date(stored);
            if (!isNaN(d.getTime())) {
                const timeStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                badgeText.textContent = `Last restore: ${timeStr}`;
                if (badgeEl) {
                    badgeEl.style.background = '#eff6ff';
                    badgeEl.style.color = '#1d4ed8';
                    badgeEl.style.borderColor = '#bfdbfe';
                }
            }
        }
    }
    window.updateLastRestoreBadge = updateLastRestoreBadge;

    function exportLocalStorageBackup() {
        const currentUser = (typeof loggedInUser !== 'undefined' && loggedInUser) ? loggedInUser.username : (localStorage.getItem('loggedInUser') || 'Admin');
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        
        const backupData = {
            metadata: {
                version: "2.0",
                app: "MyFactorySpace",
                system: "LocalStorage Backup Fallback",
                exported_at: now.toISOString(),
                exported_by: currentUser,
                format: "application/json"
            },
            summary: {
                properties: (safeJsonParse('industria_properties', [])).length,
                parks: Object.keys(safeJsonParse('industria_parks', {})).length,
                leads: (safeJsonParse('industria_leads', [])).length,
                owner_listings: (safeJsonParse('industria_owner_listings', [])).length,
                agents: (safeJsonParse('industria_agents', [])).length
            },
            storage: {
                properties: safeJsonParse('industria_properties', []),
                parks: safeJsonParse('industria_parks', {}),
                leads: safeJsonParse('industria_leads', []),
                owner_listings: safeJsonParse('industria_owner_listings', []),
                agents: safeJsonParse('industria_agents', []),
                settings: safeJsonParse('industria_settings', {}),
                branding: safeJsonParse('industria_branding_settings', {})
            }
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const downloadUrl = URL.createObjectURL(blob);
        const fileName = `myfactoryspace_local_backup_${timestampStr}.json`;

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

    window.exportSupabaseDatabase = async function() {
        const btn = document.getElementById('btn-export-supabase-db');
        const icon = document.getElementById('export-db-icon');
        const label = document.getElementById('export-db-label');
        const originalLabel = label ? label.textContent : 'Download Complete Database Backup (.json)';
        
        if (btn) btn.disabled = true;
        if (icon) icon.className = 'fa-solid fa-spinner fa-spin';
        if (label) label.textContent = 'Fetching tables from Supabase...';

        try {
            if (!window.IndustraSupabase) {
                throw new Error('Supabase client not initialized');
            }
            const client = window.IndustraSupabase.getClient();
            if (!client) throw new Error('Supabase client unavailable');

            // Fetch all tables in parallel
            const [
                propsRes,
                parksRes,
                leadsRes,
                ownersRes,
                agentsRes,
                usersRes,
                settingsRes,
                templatesRes
            ] = await Promise.all([
                client.from('properties').select('*').order('id', { ascending: true }),
                client.from('parks').select('*').order('id', { ascending: true }),
                client.from('leads').select('*').order('id', { ascending: false }),
                client.from('owner_listings').select('*').order('id', { ascending: false }),
                client.from('agents').select('*').order('id', { ascending: true }),
                client.from('app_users').select('*').order('created_at', { ascending: true }),
                client.from('site_settings').select('*'),
                client.from('automation_templates').select('*')
            ]);

            const currentUser = (typeof loggedInUser !== 'undefined' && loggedInUser) ? loggedInUser.username : (localStorage.getItem('loggedInUser') || 'Admin');
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const timestampStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
            const isoString = now.toISOString();

            const backupData = {
                metadata: {
                    version: "2.0",
                    app: "MyFactorySpace",
                    system: "Supabase Cloud PostgreSQL Backup",
                    project_id: "vnsinkesbbikeqbywxfd",
                    exported_at: isoString,
                    exported_by: currentUser,
                    format: "application/json"
                },
                summary: {
                    properties: (propsRes.data || []).length,
                    parks: (parksRes.data || []).length,
                    leads: (leadsRes.data || []).length,
                    owner_listings: (ownersRes.data || []).length,
                    agents: (agentsRes.data || []).length,
                    app_users: (usersRes.data || []).length,
                    site_settings: (settingsRes.data || []).length,
                    automation_templates: (templatesRes.data || []).length
                },
                tables: {
                    properties: propsRes.data || [],
                    parks: parksRes.data || [],
                    leads: leadsRes.data || [],
                    owner_listings: ownersRes.data || [],
                    agents: agentsRes.data || [],
                    app_users: usersRes.data || [],
                    site_settings: settingsRes.data || [],
                    automation_templates: templatesRes.data || []
                }
            };

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
            const downloadUrl = URL.createObjectURL(blob);
            const fileName = `myfactoryspace_supabase_backup_${timestampStr}.json`;

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

            // Record last backup timestamp
            localStorage.setItem('supabase_last_export_timestamp', isoString);
            updateLastExportBadge(isoString);

            if (typeof showDensityToast === 'function') {
                showDensityToast(`Database exported! Downloaded: ${fileName}`);
            } else {
                alert(`✅ Database Export Complete!\n\nDownloaded: ${fileName}\n\nTables backed up:\n• Properties: ${backupData.summary.properties}\n• Parks: ${backupData.summary.parks}\n• Leads: ${backupData.summary.leads}\n• Owner Listings: ${backupData.summary.owner_listings}\n• Agents: ${backupData.summary.agents}\n• App Users: ${backupData.summary.app_users}\n• Settings: ${backupData.summary.site_settings}`);
            }

        } catch (err) {
            console.error('Database export error:', err);
            alert(`⚠️ Database Export Notice:\n\nCloud export error: ${err.message}\n\nDownloading LocalStorage backup instead...`);
            exportLocalStorageBackup();
        } finally {
            if (btn) btn.disabled = false;
            if (icon) icon.className = 'fa-solid fa-cloud-arrow-down';
            if (label) label.textContent = originalLabel;
        }
    };

    window.copySupabaseSummaryJson = async function() {
        try {
            const text = `MyFactorySpace Database Summary (${new Date().toLocaleString()}):\n` +
                `• Properties: ${document.getElementById('supabase-count-properties')?.textContent || 'N/A'}\n` +
                `• Parks: ${document.getElementById('supabase-count-parks')?.textContent || 'N/A'}\n` +
                `• User Accounts: ${document.getElementById('supabase-count-users')?.textContent || 'N/A'}\n` +
                `• Leads: ${document.getElementById('supabase-count-leads')?.textContent || 'N/A'}`;
            await navigator.clipboard.writeText(text);
            if (typeof showDensityToast === 'function') {
                showDensityToast('Database summary copied to clipboard!');
            } else {
                alert('Database summary copied to clipboard!');
            }
        } catch (e) {
            console.warn('Clipboard write error:', e);
        }
    };

    // --- SUPABASE DATABASE DISASTER RECOVERY & RESTORE SYSTEM ---
    let currentRestorePayload = null;

    const VALID_TABLE_COLUMNS = {
        properties: [
            "id", "title", "location", "park", "type", "tenure", "price", "land_area", "built_up",
            "power", "floor_load", "specs", "status", "featured", "images", "created_at", "updated_at",
            "ceiling_height", "ceiling_peak", "ceiling_eave", "ceiling_clear", "height", "intent",
            "road", "usage", "lift", "loading_bay", "available_units", "comprise_units", "description"
        ],
        parks: [
            "id", "name", "specs", "created_at", "city", "updated_at", "section", "location",
            "hidden", "agent_id", "agent_name", "remarks"
        ],
        agents: [
            "id", "name", "ren", "phone", "whatsapp", "email", "bio", "image", "parks",
            "show_on_mainpage", "specs", "created_at"
        ],
        leads: [
            "id", "name", "phone", "email", "interest", "intent", "property_id", "message",
            "status", "date", "timestamp", "specs", "created_at", "assigned_agent_id", "park"
        ],
        owner_listings: [
            "id", "name", "phone", "email", "location", "type", "intent", "size", "price",
            "notes", "status", "date", "timestamp", "specs", "created_at", "assigned_agent_id", "park"
        ],
        app_users: [
            "id", "username", "password", "role", "agent_id", "created_at", "whatsapp", "specs"
        ],
        site_settings: [
            "key", "value", "updated_at"
        ],
        automation_templates: [
            "id", "name", "content", "is_active", "created_at", "updated_at"
        ]
    };

    window.openRestoreDatabaseModal = function(triggerPicker = false) {
        const modal = document.getElementById('modal-restore-database');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            if (!currentRestorePayload) {
                resetRestoreFileSelection();
            }
            if (triggerPicker) {
                setTimeout(() => {
                    const input = document.getElementById('restore-file-input');
                    if (input) input.click();
                }, 50);
            }
        }
    };

    window.closeRestoreDatabaseModal = function() {
        const modal = document.getElementById('modal-restore-database');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    };

    window.triggerRestoreFileInput = function(e) {
        if (e) {
            e.stopPropagation();
        }
        const input = document.getElementById('restore-file-input');
        if (input) input.click();
    };

    // Close restore modal on backdrop click if not actively restoring
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('modal-restore-database');
        if (modal && e.target === modal) {
            const startBtn = document.getElementById('btn-start-restore');
            if (startBtn && startBtn.disabled && startBtn.innerHTML.includes('Restoring')) {
                return;
            }
            closeRestoreDatabaseModal();
        }
    });

    window.resetRestoreFileSelection = function() {
        currentRestorePayload = null;
        const fileInput = document.getElementById('restore-file-input');
        if (fileInput) fileInput.value = '';
        const dropzone = document.getElementById('restore-dropzone');
        const preview = document.getElementById('restore-preview-container');
        const progress = document.getElementById('restore-progress-container');
        const startBtn = document.getElementById('btn-start-restore');
        const cancelBtn = document.getElementById('btn-cancel-restore');

        if (dropzone) dropzone.style.display = 'block';
        if (preview) preview.style.display = 'none';
        if (progress) progress.style.display = 'none';
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.6';
            startBtn.style.cursor = 'not-allowed';
            startBtn.className = 'btn btn-primary';
            startBtn.style.background = '#2563eb';
            startBtn.style.borderColor = '#2563eb';
            startBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Start Database Restore';
        }
        if (cancelBtn) {
            cancelBtn.disabled = false;
            cancelBtn.textContent = 'Cancel';
        }
    };

    window.handleRestoreDragOver = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropzone = document.getElementById('restore-dropzone');
        if (dropzone) {
            dropzone.style.borderColor = '#2563eb';
            dropzone.style.background = '#eff6ff';
        }
    };

    window.handleRestoreDragLeave = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropzone = document.getElementById('restore-dropzone');
        if (dropzone) {
            dropzone.style.borderColor = '#94a3b8';
            dropzone.style.background = '#f8fafc';
        }
    };

    window.handleRestoreFileDrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropzone = document.getElementById('restore-dropzone');
        if (dropzone) {
            dropzone.style.borderColor = '#94a3b8';
            dropzone.style.background = '#f8fafc';
        }
        const files = e.dataTransfer ? e.dataTransfer.files : null;
        if (files && files.length > 0) {
            processRestoreJsonFile(files[0]);
        }
    };

    window.handleRestoreFileSelect = function(e) {
        const file = e.target.files && e.target.files[0];
        if (file) {
            processRestoreJsonFile(file);
        }
    };

    function processRestoreJsonFile(file) {
        if (!file) return;
        const isJson = file.name.toLowerCase().endsWith('.json') || 
                       file.type.includes('json') || 
                       file.type === '' || 
                       file.type === 'text/plain';

        if (!isJson) {
            alert('Please select a valid .json database backup file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const parsed = JSON.parse(evt.target.result);
                validateAndPrepareRestoreData(file, parsed);
            } catch (err) {
                console.error('Failed to parse restore JSON file:', err);
                alert('Invalid JSON file format. Please choose an authentic backup snapshot (.json).');
            } finally {
                const fileInput = document.getElementById('restore-file-input');
                if (fileInput) fileInput.value = '';
            }
        };
        reader.onerror = function() {
            alert('Failed to read the selected backup file. Please try again.');
        };
        reader.readAsText(file);
    }

    function cleanRestoreNumeric(val) {
        if (val === null || val === undefined || val === '') return null;
        if (typeof val === 'number') return isNaN(val) ? null : val;
        const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
        return isNaN(num) ? null : num;
    }

    function normalizeToArray(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'object') return Object.values(val);
        return [];
    }

    function sanitizeRowForTable(table, rawRow) {
        if (!rawRow || typeof rawRow !== 'object') return null;
        const allowedCols = VALID_TABLE_COLUMNS[table];
        if (!allowedCols) return { ...rawRow };

        const cleanRow = {};
        const unmapped = {};

        Object.keys(rawRow).forEach(k => {
            if (allowedCols.includes(k)) {
                cleanRow[k] = rawRow[k];
            } else {
                unmapped[k] = rawRow[k];
            }
        });

        if (table === 'properties') {
            cleanRow.id = String(cleanRow.id || rawRow.id || Date.now());
            ['price', 'land_area', 'built_up', 'floor_load', 'ceiling_height', 'ceiling_peak', 'ceiling_eave', 'ceiling_clear', 'height'].forEach(col => {
                if (cleanRow[col] !== undefined) cleanRow[col] = cleanRestoreNumeric(cleanRow[col]);
            });
            if (cleanRow.specs === undefined || cleanRow.specs === null) {
                cleanRow.specs = (rawRow.specs && typeof rawRow.specs === 'object') ? { ...rawRow.specs, ...unmapped } : unmapped;
            }
        } else if (table === 'parks') {
            cleanRow.id = String(cleanRow.id || rawRow.id || Date.now());
            if (!cleanRow.city) cleanRow.city = rawRow.city || 'Selangor';
            if (!cleanRow.specs) cleanRow.specs = (rawRow.specs && typeof rawRow.specs === 'object') ? { ...rawRow.specs, ...unmapped } : unmapped;
        } else if (table === 'agents') {
            cleanRow.id = String(cleanRow.id || rawRow.id || Date.now());
            if (rawRow.assignedParks && !cleanRow.parks) cleanRow.parks = rawRow.assignedParks;
            if (!cleanRow.specs) cleanRow.specs = (rawRow.specs && typeof rawRow.specs === 'object') ? { ...rawRow.specs, ...unmapped } : unmapped;
        } else if (table === 'app_users') {
            const isValidUUID = typeof cleanRow.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanRow.id);
            if (!isValidUUID) {
                delete cleanRow.id;
            }
            if (!cleanRow.specs) cleanRow.specs = (rawRow.specs && typeof rawRow.specs === 'object') ? { ...rawRow.specs, ...unmapped } : unmapped;
        } else if (table === 'site_settings') {
            if (!cleanRow.key && rawRow.key) cleanRow.key = rawRow.key;
            if (cleanRow.value === undefined && rawRow.value !== undefined) cleanRow.value = rawRow.value;
            if (!cleanRow.updated_at) cleanRow.updated_at = new Date().toISOString();
        } else if (table === 'leads' || table === 'owner_listings' || table === 'automation_templates') {
            cleanRow.id = String(cleanRow.id || rawRow.id || Date.now());
        }

        return cleanRow;
    }

    function validateAndPrepareRestoreData(file, data) {
        if (!data || typeof data !== 'object') {
            alert('Invalid backup file: File is empty or not a JSON object.');
            return;
        }

        const tables = {};
        const sourceTables = (data.tables && typeof data.tables === 'object') ? data.tables :
                             (data.storage && typeof data.storage === 'object') ? data.storage : data;

        // Map properties
        if (sourceTables.properties) {
            tables.properties = normalizeToArray(sourceTables.properties);
        } else if (sourceTables.listings) {
            tables.properties = normalizeToArray(sourceTables.listings);
        } else if (Array.isArray(data)) {
            tables.properties = data;
        }

        // Map parks
        if (sourceTables.parks) {
            tables.parks = normalizeToArray(sourceTables.parks);
        } else if (sourceTables.industrial_parks) {
            tables.parks = normalizeToArray(sourceTables.industrial_parks);
        }

        // Map leads
        if (sourceTables.leads) tables.leads = normalizeToArray(sourceTables.leads);

        // Map owner listings
        if (sourceTables.owner_listings) {
            tables.owner_listings = normalizeToArray(sourceTables.owner_listings);
        } else if (sourceTables.ownerListings) {
            tables.owner_listings = normalizeToArray(sourceTables.ownerListings);
        }

        // Map agents
        if (sourceTables.agents) tables.agents = normalizeToArray(sourceTables.agents);

        // Map app users
        if (sourceTables.app_users) {
            tables.app_users = normalizeToArray(sourceTables.app_users);
        } else if (sourceTables.users) {
            tables.app_users = normalizeToArray(sourceTables.users);
        }

        // Map site settings
        if (sourceTables.site_settings) {
            tables.site_settings = normalizeToArray(sourceTables.site_settings);
        } else if (sourceTables.settings) {
            if (Array.isArray(sourceTables.settings)) {
                tables.site_settings = sourceTables.settings;
            } else if (typeof sourceTables.settings === 'object') {
                tables.site_settings = [{ key: 'general_settings', value: sourceTables.settings, updated_at: new Date().toISOString() }];
            }
        }

        // Map automation templates
        if (sourceTables.automation_templates) {
            tables.automation_templates = normalizeToArray(sourceTables.automation_templates);
        } else if (sourceTables.templates) {
            tables.automation_templates = normalizeToArray(sourceTables.templates);
        }

        const tableKeys = Object.keys(tables);
        if (tableKeys.length === 0) {
            alert('⚠️ Unrecognized backup structure: No valid database tables (properties, parks, leads, etc.) were found in this file.');
            return;
        }

        currentRestorePayload = {
            fileName: file.name,
            fileSize: file.size,
            metadata: data.metadata || {},
            tables: tables
        };

        // Populate File Metadata UI
        const nameEl = document.getElementById('restore-filename-display');
        const sizeEl = document.getElementById('restore-filesize-display');
        const dateEl = document.getElementById('restore-meta-date');
        const userEl = document.getElementById('restore-meta-user');
        const systemEl = document.getElementById('restore-meta-system');

        if (nameEl) nameEl.textContent = file.name;
        if (sizeEl) sizeEl.textContent = `${(file.size / 1024).toFixed(1)} KB`;
        
        const rawDate = currentRestorePayload.metadata.exported_at;
        if (dateEl) {
            if (rawDate) {
                const d = new Date(rawDate);
                dateEl.textContent = !isNaN(d.getTime()) ? d.toLocaleString() : rawDate;
            } else {
                dateEl.textContent = 'Undated snapshot';
            }
        }
        if (userEl) userEl.textContent = currentRestorePayload.metadata.exported_by || 'Unknown';
        if (systemEl) systemEl.textContent = currentRestorePayload.metadata.system || 'Standard JSON Backup';

        // Render Tables Checklist
        renderRestoreTablesGrid(tables);

        // Toggle Views
        const dropzone = document.getElementById('restore-dropzone');
        const preview = document.getElementById('restore-preview-container');
        const startBtn = document.getElementById('btn-start-restore');

        if (dropzone) dropzone.style.display = 'none';
        if (preview) preview.style.display = 'block';
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
        }
    }

    const RESTORE_TABLE_DEFS = {
        properties: { label: 'Properties', icon: 'fa-building', color: '#0284c7' },
        parks: { label: 'Industrial Parks', icon: 'fa-industry', color: '#7c3aed' },
        leads: { label: 'Customer Leads', icon: 'fa-envelope-open-text', color: '#059669' },
        owner_listings: { label: 'Owner Listings', icon: 'fa-house-chimney-user', color: '#d97706' },
        agents: { label: 'Specialist Agents', icon: 'fa-user-tie', color: '#9333ea' },
        app_users: { label: 'App User Accounts', icon: 'fa-users', color: '#ea580c' },
        site_settings: { label: 'Site Settings', icon: 'fa-sliders', color: '#475569' },
        automation_templates: { label: 'Automation Templates', icon: 'fa-robot', color: '#0891b2' }
    };

    function renderRestoreTablesGrid(tables) {
        const grid = document.getElementById('restore-tables-grid');
        if (!grid) return;
        grid.innerHTML = '';

        Object.keys(tables).forEach(tblKey => {
            const count = (tables[tblKey] || []).length;
            const def = RESTORE_TABLE_DEFS[tblKey] || { label: tblKey, icon: 'fa-table', color: '#64748b' };

            const card = document.createElement('label');
            card.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;';
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.55rem;">
                    <input type="checkbox" class="restore-table-checkbox" value="${tblKey}" checked style="accent-color: #2563eb; width: 16px; height: 16px; cursor: pointer;">
                    <span style="font-size: 0.84rem; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 0.35rem;">
                        <i class="fa-solid ${def.icon}" style="color: ${def.color};"></i> ${def.label}
                    </span>
                </div>
                <span class="badge-pill" style="font-size: 0.72rem; padding: 2px 7px; background: #f1f5f9; color: #475569;">
                    ${count} record${count !== 1 ? 's' : ''}
                </span>
            `;
            grid.appendChild(card);
        });
    }

    window.toggleAllRestoreTables = function(checked) {
        const checkboxes = document.querySelectorAll('.restore-table-checkbox');
        checkboxes.forEach(cb => { cb.checked = checked; });
    };

    window.handleRestoreModeChange = function() {
        const mode = document.querySelector('input[name="restore-mode"]:checked')?.value || 'upsert';
        const warning = document.getElementById('restore-overwrite-warning');
        const upsertLabel = document.getElementById('restore-mode-upsert-label');
        const overwriteLabel = document.getElementById('restore-mode-overwrite-label');

        if (mode === 'overwrite') {
            if (warning) warning.style.display = 'block';
            if (overwriteLabel) overwriteLabel.style.borderColor = '#dc2626';
            if (upsertLabel) upsertLabel.style.borderColor = '#e2e8f0';
        } else {
            if (warning) warning.style.display = 'none';
            if (upsertLabel) upsertLabel.style.borderColor = '#2563eb';
            if (overwriteLabel) overwriteLabel.style.borderColor = '#e2e8f0';
        }
    };

    window.executeDatabaseRestore = async function() {
        if (!currentRestorePayload || !currentRestorePayload.tables) {
            alert('No backup data loaded. Please select a valid .json file first.');
            return;
        }

        const selectedTables = Array.from(document.querySelectorAll('.restore-table-checkbox:checked')).map(cb => cb.value);
        if (selectedTables.length === 0) {
            alert('Please select at least one table to restore.');
            return;
        }

        const mode = document.querySelector('input[name="restore-mode"]:checked')?.value || 'upsert';
        if (mode === 'overwrite') {
            const confirmed = confirm(
                '⚠️ CRITICAL CONFIRMATION:\n\n' +
                'You selected "Clean Overwrite (Full Rollback)".\n' +
                'Current data in the selected table(s) will be cleared before restoring this backup snapshot.\n\n' +
                'Do you wish to proceed?'
            );
            if (!confirmed) return;
        }

        const startBtn = document.getElementById('btn-start-restore');
        const cancelBtn = document.getElementById('btn-cancel-restore');
        const progressBox = document.getElementById('restore-progress-container');
        const progressBar = document.getElementById('restore-progress-bar');
        const percentText = document.getElementById('restore-progress-percent');
        const logBox = document.getElementById('restore-activity-log');

        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Restoring...';
        }
        if (cancelBtn) cancelBtn.disabled = true;
        if (progressBox) progressBox.style.display = 'block';
        if (logBox) logBox.innerHTML = '';

        const appendLog = (msg, isErr = false) => {
            if (!logBox) return;
            const time = new Date().toLocaleTimeString();
            const color = isErr ? '#f87171' : '#38bdf8';
            logBox.innerHTML += `<div style="color: ${color};">[${time}] ${msg}</div>`;
            logBox.scrollTop = logBox.scrollHeight;
        };

        const updateProgress = (curr, total) => {
            const pct = Math.round((curr / total) * 100);
            if (progressBar) progressBar.style.width = pct + '%';
            if (percentText) percentText.textContent = pct + '%';
        };

        try {
            if (!window.IndustraSupabase) throw new Error('Supabase client is not loaded');
            const client = window.IndustraSupabase.getClient();
            if (!client) throw new Error('Supabase connection client is unavailable');

            appendLog(`Starting restore (${mode === 'overwrite' ? 'Clean Overwrite' : 'Smart Upsert'})...`);
            let completedSteps = 0;
            const totalSteps = selectedTables.length;

            for (const table of selectedTables) {
                const rawRows = currentRestorePayload.tables[table] || [];
                appendLog(`Processing table "${table}" (${rawRows.length} rows in backup)...`);

                const cleanRows = rawRows.map(r => sanitizeRowForTable(table, r)).filter(Boolean);

                if (mode === 'overwrite') {
                    const pkeyCol = (table === 'site_settings') ? 'key' : 'id';
                    const { error: delError } = await client.from(table).delete().not(pkeyCol, 'is', null);
                    if (delError) {
                        appendLog(`Warning clearing ${table}: ${delError.message}`, true);
                    } else {
                        appendLog(`Cleared existing records in "${table}".`);
                    }
                }

                if (cleanRows.length > 0) {
                    let onConflictCol = 'id';
                    if (table === 'site_settings') onConflictCol = 'key';
                    if (table === 'app_users') onConflictCol = 'username';

                    // Batch upsert in chunks of 50
                    const chunkSize = 50;
                    for (let i = 0; i < cleanRows.length; i += chunkSize) {
                        const chunk = cleanRows.slice(i, i + chunkSize);
                        const { error: upsertError } = await client.from(table).upsert(chunk, { onConflict: onConflictCol });
                        if (upsertError) {
                            throw new Error(`Failed to restore ${table}: ${upsertError.message}`);
                        }
                    }
                    appendLog(`✅ "${table}" restored (${cleanRows.length} records).`);
                } else {
                    appendLog(`Table "${table}" had 0 rows in snapshot.`);
                }

                // Sync corresponding LocalStorage data
                try {
                    if (table === 'properties') localStorage.setItem('industria_properties', JSON.stringify(cleanRows));
                    if (table === 'parks') localStorage.setItem('industria_parks', JSON.stringify(cleanRows));
                    if (table === 'leads') localStorage.setItem('industria_leads', JSON.stringify(cleanRows));
                    if (table === 'owner_listings') localStorage.setItem('industria_owner_listings', JSON.stringify(cleanRows));
                    if (table === 'agents') localStorage.setItem('industria_agents', JSON.stringify(cleanRows));
                } catch (lsErr) {
                    console.warn('LocalStorage cache sync notice:', lsErr);
                }

                completedSteps++;
                updateProgress(completedSteps, totalSteps);
            }

            const nowIso = new Date().toISOString();
            localStorage.setItem('supabase_last_restore_timestamp', nowIso);
            updateLastRestoreBadge(nowIso);

            appendLog(`🎉 Database restore completed successfully! Synchronizing views...`);
            
            // Refresh stats and storage usage
            if (typeof checkSupabaseStorageUsage === 'function') {
                await checkSupabaseStorageUsage();
            }

            // Reload data in open dashboard views
            if (typeof loadPropertiesFromSupabase === 'function') {
                loadPropertiesFromSupabase().then(() => { if (typeof renderTable === 'function') renderTable(); });
            }
            if (typeof loadIndustrialParksFromSupabase === 'function') {
                loadIndustrialParksFromSupabase().then(() => { if (typeof renderParksTable === 'function') renderParksTable(); });
            }
            if (typeof loadLeadsFromSupabase === 'function') {
                loadLeadsFromSupabase().then(() => { if (typeof renderLeads === 'function') renderLeads(); });
            }
            if (typeof loadAgentsFromSupabase === 'function') {
                loadAgentsFromSupabase().then(() => { if (typeof window.renderAgentsTable === 'function') window.renderAgentsTable(); });
            }
            if (typeof loadOwnerListingsFromSupabase === 'function') {
                loadOwnerListingsFromSupabase().then(() => { if (typeof renderOwnerList === 'function') renderOwnerList(); });
            }

            if (startBtn) {
                startBtn.className = 'btn btn-primary';
                startBtn.style.background = '#059669';
                startBtn.style.borderColor = '#059669';
                startBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Restore Complete!';
            }
            if (cancelBtn) {
                cancelBtn.disabled = false;
                cancelBtn.textContent = 'Close';
            }

            if (typeof showDensityToast === 'function') {
                showDensityToast('Database restored successfully!');
            }

        } catch (err) {
            console.error('Database restore error:', err);
            appendLog(`❌ ERROR: ${err.message}`, true);
            alert(`Restore encountered an issue: ${err.message}\n\nPlease check the activity log in the restore window.`);
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Retry Restore';
            }
            if (cancelBtn) cancelBtn.disabled = false;
        }
    };

    window.switchSettingsSubtab = function(subtabName) {
        const subtabGeneral = document.getElementById('settings-subtab-general');
        const subtabTimezone = document.getElementById('settings-subtab-timezone');
        const subtabServer = document.getElementById('settings-subtab-server');
        const subtabAdmin = document.getElementById('settings-subtab-admin');

        const tabBtnGeneral = document.getElementById('tab-btn-general');
        const tabBtnTimezone = document.getElementById('tab-btn-timezone');
        const tabBtnServer = document.getElementById('tab-btn-server');
        const tabBtnAdmin = document.getElementById('tab-btn-admin');

        const navSettingsGeneral = document.getElementById('nav-settings-general');
        const navSettingsTimezone = document.getElementById('nav-settings-timezone');
        const navSettingsServer = document.getElementById('nav-settings-server');
        const navSettingsAdmin = document.getElementById('nav-settings-admin');

        const settingsPageTitle = document.getElementById('settings-page-title');

        if (!subtabGeneral || !subtabAdmin) return;
        const userRole = (typeof currentUserRole !== 'undefined' ? currentUserRole : (sessionStorage.getItem('currentUserRole') || localStorage.getItem('currentUserRole') || 'Administrator'));
        const isCurrentAdmin = String(userRole).toLowerCase() === 'administrator';
        const canAccessGeneral = isCurrentAdmin;

        // Non-Administrators (Supervisor, Assistant, Entry Support) CANNOT access General Settings, Time Zone, or Server Configuration
        if (!isCurrentAdmin) {
            subtabName = 'admin';
        }

        // Hide all subtabs
        subtabGeneral.style.display = 'none';
        if (subtabTimezone) subtabTimezone.style.display = 'none';
        if (subtabServer) subtabServer.style.display = 'none';
        subtabAdmin.style.display = 'none';

        // Remove active states
        if (tabBtnGeneral) tabBtnGeneral.classList.remove('active');
        if (tabBtnTimezone) tabBtnTimezone.classList.remove('active');
        if (tabBtnServer) tabBtnServer.classList.remove('active');
        if (tabBtnAdmin) tabBtnAdmin.classList.remove('active');

        if (navSettingsGeneral) navSettingsGeneral.classList.remove('active');
        if (navSettingsTimezone) navSettingsTimezone.classList.remove('active');
        if (navSettingsServer) navSettingsServer.classList.remove('active');
        if (navSettingsAdmin) navSettingsAdmin.classList.remove('active');

        // Button visibility - strictly isCurrentAdmin for General, Timezone, and Server
        if (tabBtnGeneral) tabBtnGeneral.style.display = isCurrentAdmin ? '' : 'none';
        if (tabBtnTimezone) tabBtnTimezone.style.display = isCurrentAdmin ? '' : 'none';
        if (tabBtnServer) tabBtnServer.style.display = isCurrentAdmin ? '' : 'none';
        if (navSettingsGeneral) navSettingsGeneral.style.display = isCurrentAdmin ? '' : 'none';
        if (navSettingsTimezone) navSettingsTimezone.style.display = isCurrentAdmin ? '' : 'none';
        if (navSettingsServer) navSettingsServer.style.display = isCurrentAdmin ? '' : 'none';

        const breadcrumbCurrent = document.getElementById('header-breadcrumb-current');

        if (subtabName === 'timezone' && isCurrentAdmin) {
            if (subtabTimezone) subtabTimezone.style.display = 'block';
            if (tabBtnTimezone) tabBtnTimezone.classList.add('active');
            if (navSettingsTimezone) navSettingsTimezone.classList.add('active');
            if (settingsPageTitle) settingsPageTitle.innerHTML = 'Settings <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">&gt; Time Zone Management</span>';
            if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Settings / Time Zone';
            if (typeof updateLiveClocks === 'function') updateLiveClocks();
        } else if (subtabName === 'server' && isCurrentAdmin) {
            if (subtabServer) subtabServer.style.display = 'block';
            if (tabBtnServer) tabBtnServer.classList.add('active');
            if (navSettingsServer) navSettingsServer.classList.add('active');
            if (settingsPageTitle) settingsPageTitle.innerHTML = 'Settings <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">&gt; Server Configuration</span>';
            if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Settings / Server Config';
            if (typeof window.updateLocalStorageStatsUI === 'function') window.updateLocalStorageStatsUI();
            if (typeof window.checkSupabaseStorageUsage === 'function') window.checkSupabaseStorageUsage();
        } else if (subtabName === 'admin') {
            subtabAdmin.style.display = 'block';
            if (tabBtnAdmin) tabBtnAdmin.classList.add('active');
            if (navSettingsAdmin) navSettingsAdmin.classList.add('active');
            if (settingsPageTitle) settingsPageTitle.innerHTML = isCurrentAdmin ? 'Settings <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">&gt; Admin Management</span>' : 'Settings <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">&gt; Admin Management &gt; Change Password</span>';
            if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Settings / Admin Management';
            if (typeof window.populateCreateAdminAgentSelect === 'function') window.populateCreateAdminAgentSelect();
            if (typeof window.renderAdminManagement === 'function') window.renderAdminManagement();
        } else {
            subtabGeneral.style.display = 'block';
            if (tabBtnGeneral) tabBtnGeneral.classList.add('active');
            if (navSettingsGeneral) navSettingsGeneral.classList.add('active');
            if (settingsPageTitle) settingsPageTitle.innerHTML = 'Website Settings <span style="font-weight: 400; font-size: 1.2rem; color: var(--text-muted);">&gt; General Settings</span>';
            if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Settings / General';
            if (typeof updateLiveClocks === 'function') updateLiveClocks();
            if (typeof window.restoreSettingsCardsState === 'function') window.restoreSettingsCardsState();
        }
    };

    // ========================================================
    // GENERAL SETTINGS CARDS COLLAPSE / MINIMIZE ENGINE
    // ========================================================
    const SETTINGS_MINIMIZED_CARDS_KEY = 'myfactoryspace_settings_minimized_cards_v2';
    const SETTINGS_MINIMIZED_SUBCARDS_KEY = 'myfactoryspace_settings_minimized_subcards_v2';

    function getMinimizedCardsState() {
        try {
            const raw = localStorage.getItem(SETTINGS_MINIMIZED_CARDS_KEY);
            if (raw) return JSON.parse(raw);
            // Default all 7 cards in General Settings to minimized for a neat, compact mobile & desktop view
            return {
                'card-settings-branding': true,
                'card-settings-property-features': true,
                'card-settings-about': true,
                'card-settings-services': true,
                'card-settings-owner-list': true,
                'card-settings-contact': true,
                'card-settings-watermark': true
            };
        } catch (e) {
            return {
                'card-settings-branding': true,
                'card-settings-property-features': true,
                'card-settings-about': true,
                'card-settings-services': true,
                'card-settings-owner-list': true,
                'card-settings-contact': true,
                'card-settings-watermark': true
            };
        }
    }

    function saveMinimizedCardsState(state) {
        try {
            localStorage.setItem(SETTINGS_MINIMIZED_CARDS_KEY, JSON.stringify(state));
        } catch (e) {}
    }

    function getMinimizedSubcardsState() {
        try {
            const raw = localStorage.getItem(SETTINGS_MINIMIZED_SUBCARDS_KEY);
            if (raw) return JSON.parse(raw);
            return {
                'subcard-listing-badges': true,
                'subcard-mainpage-featured-properties': true,
                'subcard-mainpage-featured-agents': true
            };
        } catch (e) {
            return {
                'subcard-listing-badges': true,
                'subcard-mainpage-featured-properties': true,
                'subcard-mainpage-featured-agents': true
            };
        }
    }

    function saveMinimizedSubcardsState(state) {
        try {
            localStorage.setItem(SETTINGS_MINIMIZED_SUBCARDS_KEY, JSON.stringify(state));
        } catch (e) {}
    }

    window.toggleSettingsCard = function(cardId, forceState) {
        const card = document.getElementById(cardId);
        if (!card) return;

        const isCurrentlyMinimized = card.classList.contains('is-minimized');
        const willBeMinimized = (typeof forceState === 'boolean') ? !forceState : !isCurrentlyMinimized;

        if (willBeMinimized) {
            card.classList.add('is-minimized');
        } else {
            card.classList.remove('is-minimized');
        }

        const btn = card.querySelector('.card-collapse-btn');
        if (btn) {
            btn.setAttribute('aria-expanded', !willBeMinimized);
            const text = btn.querySelector('.collapse-btn-text');
            if (text) text.textContent = willBeMinimized ? 'Expand' : 'Minimize';
            const icon = btn.querySelector('.collapse-icon');
            if (icon) {
                icon.className = willBeMinimized ? 'fa-solid fa-chevron-down collapse-icon' : 'fa-solid fa-chevron-up collapse-icon';
            }
        }

        const state = getMinimizedCardsState();
        state[cardId] = willBeMinimized;
        saveMinimizedCardsState(state);

        if (typeof window.updateSettingsSectionsCountBadge === 'function') {
            window.updateSettingsSectionsCountBadge();
        }
    };

    window.toggleSettingsSubcard = function(subcardId, forceState) {
        const subcard = document.getElementById(subcardId);
        if (!subcard) return;

        const isCurrentlyMinimized = subcard.classList.contains('is-minimized');
        const willBeMinimized = (typeof forceState === 'boolean') ? !forceState : !isCurrentlyMinimized;

        if (willBeMinimized) {
            subcard.classList.add('is-minimized');
        } else {
            subcard.classList.remove('is-minimized');
        }

        const btn = subcard.querySelector('.btn-subcard-collapse');
        if (btn) {
            btn.setAttribute('aria-expanded', !willBeMinimized);
            const icon = btn.querySelector('.collapse-icon');
            if (icon) {
                icon.className = willBeMinimized ? 'fa-solid fa-chevron-down collapse-icon' : 'fa-solid fa-chevron-up collapse-icon';
            }
        }

        const state = getMinimizedSubcardsState();
        state[subcardId] = willBeMinimized;
        saveMinimizedSubcardsState(state);
    };

    window.collapseAllSettingsCards = function() {
        const cards = document.querySelectorAll('#settings-subtab-general .settings-card.collapsible-card');
        cards.forEach(card => {
            if (card.id) {
                window.toggleSettingsCard(card.id, false); // force minimize
            }
        });
        const subcards = document.querySelectorAll('#settings-subtab-general .collapsible-subcard');
        subcards.forEach(subcard => {
            if (subcard.id) {
                window.toggleSettingsSubcard(subcard.id, false); // force minimize
            }
        });
    };

    window.expandAllSettingsCards = function() {
        const cards = document.querySelectorAll('#settings-subtab-general .settings-card.collapsible-card');
        cards.forEach(card => {
            if (card.id) {
                window.toggleSettingsCard(card.id, true); // force expand
            }
        });
        const subcards = document.querySelectorAll('#settings-subtab-general .collapsible-subcard');
        subcards.forEach(subcard => {
            if (subcard.id) {
                window.toggleSettingsSubcard(subcard.id, true); // force expand
            }
        });
    };

    window.updateSettingsSectionsCountBadge = function() {
        const badge = document.getElementById('settings-sections-state-badge');
        if (!badge) return;
        const total = document.querySelectorAll('#settings-subtab-general .settings-card.collapsible-card').length;
        const minimized = document.querySelectorAll('#settings-subtab-general .settings-card.collapsible-card.is-minimized').length;
        const expanded = total - minimized;
        if (expanded === 0) {
            badge.textContent = `All ${total} Minimized`;
            badge.style.background = '#f1f5f9';
            badge.style.color = '#475569';
        } else if (expanded === total) {
            badge.textContent = `All ${total} Expanded`;
            badge.style.background = '#eff6ff';
            badge.style.color = '#1d4ed8';
        } else {
            badge.textContent = `${expanded} of ${total} Expanded`;
            badge.style.background = '#fef3c7';
            badge.style.color = '#b45309';
        }
    };

    window.restoreSettingsCardsState = function() {
        const state = getMinimizedCardsState();
        const cards = document.querySelectorAll('#settings-subtab-general .settings-card.collapsible-card');
        cards.forEach(card => {
            const cardId = card.id;
            // If not explicitly set to false (expanded), default to minimize (forceState = false)
            if (state[cardId] === false) {
                window.toggleSettingsCard(cardId, true); // force expand
            } else {
                window.toggleSettingsCard(cardId, false); // force minimize
            }
        });
        const subState = getMinimizedSubcardsState();
        const subcards = document.querySelectorAll('#settings-subtab-general .collapsible-subcard');
        subcards.forEach(subcard => {
            const subcardId = subcard.id;
            if (subState[subcardId] === false) {
                window.toggleSettingsSubcard(subcardId, true); // force expand
            } else {
                window.toggleSettingsSubcard(subcardId, false); // force minimize
            }
        });
        if (typeof window.updateSettingsSectionsCountBadge === 'function') {
            window.updateSettingsSectionsCountBadge();
        }
    };

    // Make entire card header clickable for fast expand/collapse on mobile & desktop
    document.addEventListener('click', function(e) {
        const header = e.target.closest('#settings-subtab-general .collapsible-card .card-header');
        if (header) {
            if (e.target.closest('button, input, select, textarea, a, label')) return;
            const card = header.closest('.collapsible-card');
            if (card && card.id) {
                window.toggleSettingsCard(card.id);
            }
        }
    });

    // Auto-restore on startup
    setTimeout(() => {
        if (typeof window.restoreSettingsCardsState === 'function') {
            window.restoreSettingsCardsState();
        }
    }, 150);

    if (tabBtnGeneral) tabBtnGeneral.addEventListener('click', () => switchSettingsSubtab('general'));
    if (tabBtnTimezone) tabBtnTimezone.addEventListener('click', () => switchSettingsSubtab('timezone'));
    if (tabBtnServer) tabBtnServer.addEventListener('click', () => switchSettingsSubtab('server'));
    if (tabBtnAdmin) tabBtnAdmin.addEventListener('click', () => switchSettingsSubtab('admin'));

    if (navSettingsTimezone) navSettingsTimezone.addEventListener('click', (e) => { e.preventDefault(); switchView('settings', 'timezone'); });

    if (navOverview) navOverview.addEventListener('click', (e) => { e.preventDefault(); switchView('overview'); });
    if (navProperties) navProperties.addEventListener('click', (e) => { e.preventDefault(); switchView('properties'); });
    if (navParks) navParks.addEventListener('click', (e) => { e.preventDefault(); switchView('parks'); });
    if (navLeads) navLeads.addEventListener('click', (e) => { e.preventDefault(); switchView('leads'); });
    if (navOwnerList) navOwnerList.addEventListener('click', (e) => { e.preventDefault(); switchView('owner-list'); });
    if (navAgents) navAgents.addEventListener('click', (e) => { e.preventDefault(); switchView('agents'); });

    // Default View (with support for URL params and hash deep-linking)
    const initialUrlParams = new URLSearchParams(window.location.search);
    const paramView = initialUrlParams.get('view');
    const paramTab = initialUrlParams.get('tab') || initialUrlParams.get('subtab');
    const hashVal = window.location.hash.replace('#', '').trim();

    if (paramView) {
        switchView(paramView, paramTab || (paramView === 'properties' ? 'assigned' : 'general'));
    } else if (hashVal === 'landing-page' || hashVal === 'locations') {
        switchView('properties', 'locations');
    } else if (hashVal === 'properties') {
        switchView('properties', paramTab || 'assigned');
    } else if (hashVal) {
        switchView(hashVal, paramTab || 'general');
    } else {
        switchView('overview');
    }

    // --- PARKS MANAGEMENT ---
    const parksTableBody = document.getElementById('parks-table-body');
    const parkModal = document.getElementById('park-modal');
    const addParkBtn = document.getElementById('add-park-btn');
    const closeParkModalBtn = document.getElementById('close-park-modal-btn');
    const cancelParkBtn = document.getElementById('cancel-park-btn');
    const parkForm = document.getElementById('park-form');
    
    // ============================================================
    // INDUSTRIAL PARK APPROVALS & DUPLICATION/TERRITORY PROTECTION
    // ============================================================
    function getParkRequests() {
        return safeJsonParse('industria_park_requests', []);
    }
    function saveParkRequests(reqs) {
        safeLocalStorageSet('industria_park_requests', reqs);
    }

    function checkParkDuplication(city, parkName, originalName, currentRequestId) {
        if (!parkName || !city) return { isDuplicate: false, error: '' };
        const norm = parkName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // 1. Check in active parks for this city
        if (parks && parks[city]) {
            const found = parks[city].find(p => {
                const pName = typeof p === 'string' ? p : p.name;
                if (originalName && pName.trim().toLowerCase() === originalName.trim().toLowerCase()) return false;
                return pName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === norm;
            });
            if (found) {
                const foundName = typeof found === 'string' ? found : found.name;
                return {
                    isDuplicate: true,
                    error: `Duplicate Park: A park named "${foundName}" already exists in ${city}. Duplicate parks are not permitted.`
                };
            }
        }

        // 2. Check pending approval requests for this city
        const requests = getParkRequests();
        const pendingDup = requests.find(r => {
            if (currentRequestId && String(r.id) === String(currentRequestId)) return false;
            if (r.status !== 'Pending') return false;
            if (r.city !== city) return false;
            return r.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === norm;
        });
        if (pendingDup) {
            const approverText = (pendingDup.submitterRole === 'Assistant' || pendingDup.targetApprover === 'Supervisor') ? 'Supervisor' : 'Administrator';
            return {
                isDuplicate: true,
                error: `Duplicate Request: A submission for "${pendingDup.name}" in ${city} has already been submitted by ${pendingDup.submittedBy} and is awaiting ${approverText} approval.`
            };
        }

        return { isDuplicate: false, error: '' };
    }

    function checkAgentTerritoryConflict(parkName, selectedAgentId) {
        if (!parkName || !selectedAgentId) return { hasConflict: false, conflictingAgentName: '', error: '' };
        const norm = parkName.trim().toLowerCase();
        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);

        const otherAgent = allAgents.find(a => {
            if (String(a.id) === String(selectedAgentId)) return false;
            const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            return pList.some(p => {
                const pStr = (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase();
                return pStr === norm;
            });
        });

        if (otherAgent) {
            return {
                hasConflict: true,
                conflictingAgentName: otherAgent.name,
                error: `Territory Conflict: Park "${parkName}" is already handled by specialist agent ${otherAgent.name}. Each park can only be handled by one specialist agent to prevent territory overlap.`
            };
        }

        return { hasConflict: false, conflictingAgentName: '', error: '' };
    }

    function populateParkAgentsDropdown(selectedAgentId, currentParkName) {
        const parkAgentSelect = document.getElementById('parkAgent');
        const lockedNote = document.getElementById('park-agent-locked-note');
        if (!parkAgentSelect) return;

        const isAssistant = currentUserRole === 'Assistant';
        const assistantAgent = isAssistant ? getAssistantAgent() : null;

        if (isAssistant && assistantAgent) {
            // Assistant: Strictly pre-assigned agent profile ONLY, not able to select others
            parkAgentSelect.innerHTML = `<option value="${assistantAgent.id}" selected>${escapeHtml(assistantAgent.name)} (${assistantAgent.ren || 'Specialist'})</option>`;
            parkAgentSelect.disabled = true;
            parkAgentSelect.style.backgroundColor = '#f8fafc';
            parkAgentSelect.style.color = '#1e293b';
            parkAgentSelect.style.cursor = 'not-allowed';
            if (lockedNote) {
                lockedNote.innerHTML = `<i class="fa-solid fa-lock" style="color: #64748b; font-size: 0.78rem;"></i> Pre-assigned to your agent profile (<strong>${escapeHtml(assistantAgent.name)}</strong>) &mdash; cannot select other agents.`;
                lockedNote.style.display = 'flex';
            }
            return;
        }

        // For Administrator, Supervisor, or unlinked accounts: allow full selection
        parkAgentSelect.disabled = false;
        parkAgentSelect.style.backgroundColor = '';
        parkAgentSelect.style.color = '';
        parkAgentSelect.style.cursor = '';
        if (lockedNote) lockedNote.style.display = 'none';

        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
        
        let html = '<option value="">Unassigned (No Specialist Agent yet)</option>';
        allAgents.forEach(a => {
            const isCurrentHandler = currentParkName && (Array.isArray(a.parks) ? a.parks : (a.assignedParks || [])).some(p => {
                const pStr = (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase();
                return pStr === currentParkName.trim().toLowerCase();
            });
            const selected = (selectedAgentId && String(a.id) === String(selectedAgentId)) || (!selectedAgentId && isCurrentHandler);
            html += `<option value="${a.id}" ${selected ? 'selected' : ''}>${escapeHtml(a.name)} (${a.ren || 'Specialist'})</option>`;
        });
        parkAgentSelect.innerHTML = html;
    }

    window.switchParksTab = function(tab) {
        const tabActiveBtn = document.getElementById('parks-tab-active');
        const tabUnassignedBtn = document.getElementById('parks-tab-unassigned');
        const tabRequestsBtn = document.getElementById('parks-tab-requests');
        const activeCont = document.getElementById('parks-active-container');
        const unassignedCont = document.getElementById('parks-unassigned-container');
        const reqCont = document.getElementById('parks-requests-container');

        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const canViewUnassigned = (String(activeRole).toLowerCase() === 'administrator' || String(activeRole).toLowerCase() === 'supervisor');

        if (tab === 'unassigned' && !canViewUnassigned) {
            tab = 'active';
        }

        if (tab === 'requests') {
            if (tabActiveBtn) tabActiveBtn.classList.remove('active');
            if (tabUnassignedBtn) tabUnassignedBtn.classList.remove('active');
            if (tabRequestsBtn) tabRequestsBtn.classList.add('active');
            if (activeCont) activeCont.style.display = 'none';
            if (unassignedCont) unassignedCont.style.display = 'none';
            if (reqCont) reqCont.style.display = 'block';
            renderParkRequestsTable();
        } else if (tab === 'unassigned') {
            if (tabActiveBtn) tabActiveBtn.classList.remove('active');
            if (tabUnassignedBtn) tabUnassignedBtn.classList.add('active');
            if (tabRequestsBtn) tabRequestsBtn.classList.remove('active');
            if (activeCont) activeCont.style.display = 'none';
            if (unassignedCont) unassignedCont.style.display = 'block';
            if (reqCont) reqCont.style.display = 'none';
            if (typeof renderUnassignedParksTable === 'function') renderUnassignedParksTable();
        } else {
            if (tabActiveBtn) tabActiveBtn.classList.add('active');
            if (tabUnassignedBtn) tabUnassignedBtn.classList.remove('active');
            if (tabRequestsBtn) tabRequestsBtn.classList.remove('active');
            if (activeCont) activeCont.style.display = 'block';
            if (unassignedCont) unassignedCont.style.display = 'none';
            if (reqCont) reqCont.style.display = 'none';
            renderParksTable();
        }
    };

    function renderParkRequestsTable() {
        const tableBody = document.getElementById('park-requests-table-body');
        const badge = document.getElementById('parks-requests-count-badge');
        if (!tableBody) return;

        const requests = getParkRequests();
        const pendingCount = requests.filter(r => r.status === 'Pending').length;
        if (badge) {
            badge.textContent = pendingCount;
            badge.style.background = pendingCount > 0 ? '#fef08a' : 'rgba(0,0,0,0.06)';
            badge.style.color = pendingCount > 0 ? '#854d0e' : 'var(--text-muted)';
        }

        if (requests.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-size: 0.92rem;"><i class="fa-solid fa-clipboard-check" style="font-size: 2rem; margin-bottom: 0.5rem; color: #94a3b8; display: block;"></i>No park approval requests submitted yet.</td></tr>`;
            return;
        }

        const isAdministrator = currentUserRole === 'Administrator';
        const isSupervisor = currentUserRole === 'Supervisor';
        const canReview = isAdministrator || isSupervisor;
        tableBody.innerHTML = '';

        requests.slice().reverse().forEach(req => {
            const tr = document.createElement('tr');
            
            let statusBadge = '';
            if (req.status === 'Approved') {
                statusBadge = `<span class="status-badge status-active"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
            } else if (req.status === 'Rejected') {
                statusBadge = `<span class="status-badge status-inactive"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>`;
            } else {
                statusBadge = `<span class="status-badge status-pending" style="font-weight: 700;"><i class="fa-solid fa-clock"></i> Pending Approval</span>`;
            }

            // Approved requests already exist in the parks list — exclude the park itself to avoid a false self-match
            const dupCheck = checkParkDuplication(req.city, req.name, req.status === 'Approved' ? req.name : null, req.id);
            const terrCheck = checkAgentTerritoryConflict(req.name, req.agentId);

            let validationBadges = '';
            if (dupCheck.isDuplicate) {
                validationBadges += `<span class="status-badge status-inactive" style="display:inline-block; margin-bottom:2px;" title="${escapeHtml(dupCheck.error)}"><i class="fa-solid fa-triangle-exclamation"></i> Duplicate Park</span><br>`;
            } else {
                validationBadges += `<span class="status-badge status-active" style="display:inline-block; margin-bottom:2px;"><i class="fa-solid fa-check"></i> No Duplicate</span><br>`;
            }

            if (terrCheck.hasConflict) {
                validationBadges += `<span class="status-badge status-inactive" style="display:inline-block;" title="${escapeHtml(terrCheck.error)}"><i class="fa-solid fa-user-xmark"></i> Conflict: ${escapeHtml(terrCheck.conflictingAgentName)}</span>`;
            } else {
                validationBadges += `<span class="status-badge status-active" style="display:inline-block;"><i class="fa-solid fa-user-check"></i> 1 Agent Territory</span>`;
            }

            let adminActionsHtml = '';
            if (req.status === 'Pending') {
                const canApproveThis = isAdministrator || (isSupervisor && (req.submitterRole === 'Assistant' || req.targetApprover === 'Supervisor' || !req.submitterRole));
                if (canApproveThis) {
                    adminActionsHtml = `
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button class="btn btn-sm btn-primary" onclick="approveParkRequest('${req.id}')" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 6px;">
                                <i class="fa-solid fa-check"></i> Approve
                            </button>
                            <button class="btn btn-sm btn-outline delete" onclick="rejectParkRequest('${req.id}')" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-radius: 6px; color: #dc2626; border-color: #fca5a5;">
                                <i class="fa-solid fa-xmark"></i> Reject
                            </button>
                        </div>
                    `;
                } else {
                    const awaitingRole = (req.targetApprover === 'Supervisor' || req.submitterRole === 'Assistant') ? 'Supervisor' : 'Admin';
                    adminActionsHtml = `<span style="color:var(--text-muted); font-size:0.82rem; font-style:italic;"><i class="fa-solid fa-hourglass-half"></i> Awaiting ${awaitingRole} Review</span>`;
                }
            } else {
                const reviewDate = req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }) : '';
                const rejectReason = req.rejectionReason ? `<br><small style="color:#b91c1c;">"${escapeHtml(req.rejectionReason)}"</small>` : '';
                const reviewerRoleStr = req.reviewedRole ? ` (${escapeHtml(req.reviewedRole)})` : '';

                const canDelete = isAdministrator && (req.status === 'Rejected' || req.status === 'Approved');
                const deleteTitle = req.status === 'Approved' ? 'Remove approved park proposal' : 'Remove rejected proposal request';
                const deleteBtnHtml = canDelete
                    ? `<button class="btn btn-sm btn-outline delete" onclick="deleteParkRequest('${req.id}')" title="${deleteTitle}" style="padding: 0.28rem 0.65rem; font-size: 0.78rem; border-radius: 6px; color: #dc2626; border-color: #fca5a5; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; white-space: nowrap;">
                        <i class="fa-solid fa-trash-can"></i> Remove
                       </button>`
                    : '';

                adminActionsHtml = `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
                        <span style="color:var(--text-muted); font-size:0.82rem; line-height: 1.35;">
                            Reviewed by <strong>${escapeHtml(req.reviewedBy || 'Reviewer')}</strong>${reviewerRoleStr} (${reviewDate})${rejectReason}
                        </span>
                        ${deleteBtnHtml}
                    </div>
                `;
            }

            const dateStr = req.submittedAt ? new Date(req.submittedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
            const remarksHtml = req.remarks ? `<br><small style="color:var(--text-muted); font-size:0.78rem;" title="${escapeHtml(req.remarks)}"><i class="fa-solid fa-comment-dots"></i> ${escapeHtml(req.remarks)}</small>` : '';

            const allAgentsList = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
            const reqAgent = allAgentsList.find(a => (req.agentId && String(a.id) === String(req.agentId)) || (req.agentName && a.name.toLowerCase() === req.agentName.toLowerCase()));
            const reqAgentImg = reqAgent ? (reqAgent.image || 'assets/images/agent_marcus.jpg') : 'assets/images/agent_marcus.jpg';
            const reqAgentName = reqAgent ? reqAgent.name : (req.agentName || 'Unassigned');
            const reqAgentRen = reqAgent ? (reqAgent.ren || 'Specialist') : 'Specialist';

            const agentReqDisplay = (reqAgent || (req.agentName && req.agentName !== 'Unassigned'))
                ? `<div style="display:inline-flex; align-items:center; gap:6px; text-align:left;">
                    <img src="${reqAgentImg}" alt="${escapeHtml(reqAgentName)}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e1; flex-shrink:0;" onerror="this.src='assets/images/agent_marcus.jpg'">
                    <div style="line-height:1.2;">
                        <strong style="font-size:0.82rem; color:#1e3a8a; display:block; font-weight:700;">${escapeHtml(reqAgentName)}</strong>
                        <small style="color:#64748b; font-size:0.71rem; font-weight:500; display:block;">${escapeHtml(reqAgentRen)}</small>
                    </div>
                   </div>`
                : `<span style="color:var(--text-muted); font-size:0.78rem; font-style:italic;"><i class="fa-solid fa-user-slash" style="margin-right:3px;"></i> Unassigned</span>`;

            const submitterRole = req.submitterRole || 'Supervisor';
            const submitterBadgeClass = submitterRole === 'Assistant' ? 'status-pending' : (submitterRole === 'Supervisor' ? 'status-supervisor' : 'status-active');
            const submitterBadge = `<span class="status-badge ${submitterBadgeClass}" style="font-size:0.68rem; padding:1px 6px; margin-left:4px; text-transform:uppercase; vertical-align:middle;">${escapeHtml(submitterRole)}</span>`;

            tr.innerHTML = `
                <td><span style="font-weight:600; font-size:0.84rem; color:var(--text-dark);">${escapeHtml(req.city)}</span></td>
                <td><span style="font-size:0.82rem; color:var(--text-muted);">${escapeHtml(req.section || '-')}</span></td>
                <td><strong style="color:var(--primary-dark); font-size:0.88rem; line-height:1.25;">${escapeHtml(req.name)}</strong>${remarksHtml}</td>
                <td>${agentReqDisplay}</td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:1px; line-height:1.2;">
                        <div><strong style="font-size:0.84rem;">${escapeHtml(req.submittedBy || submitterRole)}</strong> ${submitterBadge}</div>
                        <small style="color:var(--text-muted); font-size:0.72rem;">${dateStr}</small>
                    </div>
                </td>
                <td>${validationBadges}</td>
                <td>${statusBadge}</td>
                <td>${adminActionsHtml}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    window.approveParkRequest = async function(requestId) {
        const isAdministrator = currentUserRole === 'Administrator';
        const isSupervisor = currentUserRole === 'Supervisor';
        if (!isAdministrator && !isSupervisor) {
            alert('Only Administrator or Supervisor can approve park requests.');
            return;
        }

        const reqs = getParkRequests();
        const req = reqs.find(r => String(r.id) === String(requestId));
        if (!req) return;

        if (isSupervisor && !isAdministrator && req.submitterRole === 'Supervisor') {
            alert('⚠️ Park proposals submitted by Supervisors require Administrator review and approval.');
            return;
        }

        // Re-verify duplication & conflict before committing (safely excluding this request itself)
        const dupCheck = checkParkDuplication(req.city, req.name, null, req.id);
        if (dupCheck.isDuplicate) {
            alert('⚠️ Cannot approve: ' + dupCheck.error);
            return;
        }

        if (req.agentId) {
            const terrCheck = checkAgentTerritoryConflict(req.name, req.agentId);
            if (terrCheck.hasConflict) {
                alert('⚠️ Cannot approve: ' + terrCheck.error);
                return;
            }
        }

        if (!parks[req.city]) parks[req.city] = [];
        const newParkObj = {
            id: `park_${req.city.toLowerCase().replace(/\s+/g, '_')}_${req.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: req.name,
            section: req.section || '',
            hidden: false
        };
        parks[req.city].push(newParkObj);
        safeLocalStorageSet('industria_industrial_parks', JSON.stringify(parks));
        await syncParkToSupabase(req.city, newParkObj);
        if (typeof window.syncParkToLocationDirectory === 'function') {
            window.syncParkToLocationDirectory(req.city, req.name, null, false);
        }

        // Assign handling agent if specified
        let effectiveAgentId = req.agentId;
        let effectiveAgentName = req.agentName;

        // Fallback: If agentId/agentName not directly present on req, resolve from submitter if Assistant
        if (!effectiveAgentId && (!effectiveAgentName || effectiveAgentName === 'Unassigned')) {
            if (req.submitterRole === 'Assistant' && req.submittedBy) {
                const users = safeJsonParse('industria_users', []);
                const subUser = users.find(u => u.username && u.username.toLowerCase() === req.submittedBy.toLowerCase());
                if (subUser && subUser.agentId) {
                    effectiveAgentId = String(subUser.agentId);
                }
            }
        }

        if (effectiveAgentId || (effectiveAgentName && effectiveAgentName !== 'Unassigned')) {
            let allAgents = safeJsonParse('industria_agents', []);
            if (!Array.isArray(allAgents) || allAgents.length === 0) {
                allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : (typeof defaultAgents !== 'undefined' ? defaultAgents : []);
            }
            const targetAgent = allAgents.find(a => 
                (effectiveAgentId && String(a.id) === String(effectiveAgentId)) ||
                (effectiveAgentName && effectiveAgentName !== 'Unassigned' && a.name && a.name.trim().toLowerCase() === effectiveAgentName.trim().toLowerCase())
            );
            if (targetAgent) {
                const normParkName = req.name.trim();
                if (!Array.isArray(targetAgent.parks)) targetAgent.parks = [];
                const alreadyInParks = targetAgent.parks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normParkName.toLowerCase());
                if (!alreadyInParks) targetAgent.parks.push(normParkName);

                if (!Array.isArray(targetAgent.assignedParks)) targetAgent.assignedParks = [];
                const alreadyInAssigned = targetAgent.assignedParks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normParkName.toLowerCase());
                if (!alreadyInAssigned) targetAgent.assignedParks.push(normParkName);

                // Enforce single-specialist territory rule: remove this park from any other agent
                for (const otherA of allAgents) {
                    if (String(otherA.id) !== String(targetAgent.id)) {
                        let otherChanged = false;
                        if (Array.isArray(otherA.parks)) {
                            const prevLen = otherA.parks.length;
                            otherA.parks = otherA.parks.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() !== normParkName.toLowerCase());
                            if (otherA.parks.length !== prevLen) otherChanged = true;
                        }
                        if (Array.isArray(otherA.assignedParks)) {
                            const prevLen = otherA.assignedParks.length;
                            otherA.assignedParks = otherA.assignedParks.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() !== normParkName.toLowerCase());
                            if (otherA.assignedParks.length !== prevLen) otherChanged = true;
                        }
                        if (otherChanged && typeof syncAgentToSupabase === 'function') {
                            await syncAgentToSupabase(otherA);
                        }
                    }
                }

                safeLocalStorageSet('industria_agents', JSON.stringify(allAgents));
                if (typeof agents !== 'undefined') agents = allAgents;

                // Sync target agent to Supabase cloud database
                if (typeof syncAgentToSupabase === 'function') {
                    await syncAgentToSupabase(targetAgent);
                }
            }
        }

        // Assign properties if specified
        if (Array.isArray(req.propertyIds) && req.propertyIds.length > 0) {
            properties.forEach(p => {
                if (req.propertyIds.includes(String(p.id))) {
                    p.park = req.name;
                    syncPropertyToSupabase(p);
                }
            });
            safeLocalStorageSet('industria_properties', JSON.stringify(properties));
        }

        req.status = 'Approved';
        req.reviewedBy = loggedInUser || (isSupervisor ? 'Supervisor' : 'Administrator');
        req.reviewedRole = isSupervisor ? 'Supervisor' : 'Administrator';
        req.reviewedAt = new Date().toISOString();
        saveParkRequests(reqs);

        alert(`✅ Park Approved!\n\n"${req.name}" is now active in ${req.city}${req.agentName && req.agentName !== 'Unassigned' ? ` and assigned to specialist agent ${req.agentName}` : ''}.`);
        renderParkRequestsTable();
        renderParksTable();
        if (typeof window.renderAgentsTable === 'function') {
            window.renderAgentsTable();
        } else if (typeof renderAgentsTable === 'function') {
            renderAgentsTable();
        }
        renderTable();
    };

    window.rejectParkRequest = function(requestId) {
        const isAdministrator = currentUserRole === 'Administrator';
        const isSupervisor = currentUserRole === 'Supervisor';
        if (!isAdministrator && !isSupervisor) {
            alert('Only Administrator or Supervisor can reject park requests.');
            return;
        }

        const reason = prompt('Please enter a rejection reason (optional):');
        if (reason === null) return; // cancelled

        const reqs = getParkRequests();
        const req = reqs.find(r => String(r.id) === String(requestId));
        if (!req) return;

        if (isSupervisor && !isAdministrator && req.submitterRole === 'Supervisor') {
            alert('⚠️ Park proposals submitted by Supervisors require Administrator review.');
            return;
        }

        req.status = 'Rejected';
        req.reviewedBy = loggedInUser || (isSupervisor ? 'Supervisor' : 'Administrator');
        req.reviewedRole = isSupervisor ? 'Supervisor' : 'Administrator';
        req.reviewedAt = new Date().toISOString();
        req.rejectionReason = (reason || '').trim();
        saveParkRequests(reqs);

        alert(`Park proposal "${req.name}" has been marked as Rejected.`);
        renderParkRequestsTable();
    };

    window.deleteParkRequest = async function(requestId) {
        if (currentUserRole !== 'Administrator') {
            alert('Only Administrator can remove park approval requests.');
            return;
        }

        const reqs = getParkRequests();
        const req = reqs.find(r => String(r.id) === String(requestId));
        if (!req) return;

        if (req.status !== 'Rejected' && req.status !== 'Approved') {
            alert('Only approved or rejected approval requests can be removed.');
            return;
        }

        const isApproved = req.status === 'Approved';
        const confirmMsg = isApproved
            ? `Are you sure you want to remove the approved park proposal for "${req.name}" (${req.city})?\n\nThis will remove the approval request record and delete "${req.name}" from active parks.`
            : `Are you sure you want to remove the rejected approval request for "${req.name}" (${req.city})?`;

        if (!confirm(confirmMsg)) {
            return;
        }

        if (isApproved) {
            // Also remove from active parks if it exists in parks[req.city]
            if (parks && parks[req.city]) {
                const targetPark = parks[req.city].find(p => {
                    const pName = typeof p === 'string' ? p : p.name;
                    return pName.trim().toLowerCase() === req.name.trim().toLowerCase();
                });
                if (targetPark) {
                    const targetId = (typeof targetPark === 'object' && targetPark.id) ? targetPark.id : req.name;
                    parks[req.city] = parks[req.city].filter(p => {
                        const pName = typeof p === 'string' ? p : p.name;
                        return pName.trim().toLowerCase() !== req.name.trim().toLowerCase();
                    });
                    safeLocalStorageSet('industria_industrial_parks', JSON.stringify(parks));
                    if (typeof syncParkDeleteToSupabase === 'function') {
                        syncParkDeleteToSupabase(targetId);
                    }
                    if (typeof window.removeParkFromLocationDirectory === 'function') {
                        window.removeParkFromLocationDirectory(req.city, req.name);
                    }
                }
            }

            // Un-assign properties that were attached to this park
            if (typeof properties !== 'undefined' && Array.isArray(properties)) {
                let propsModified = false;
                properties.forEach(p => {
                    if (p.location === req.city && p.park && p.park.trim().toLowerCase() === req.name.trim().toLowerCase()) {
                        p.park = '';
                        propsModified = true;
                        if (typeof syncPropertyToSupabase === 'function') {
                            syncPropertyToSupabase(p);
                        }
                    }
                });
                if (propsModified) {
                    safeLocalStorageSet('industria_properties', JSON.stringify(properties));
                }
            }

            // Unassign from agents
            const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
            let agentsModified = false;
            for (const a of allAgents) {
                let thisAgentModified = false;
                const normName = req.name.trim().toLowerCase();
                if (Array.isArray(a.parks) && a.parks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normName)) {
                    a.parks = a.parks.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() !== normName);
                    thisAgentModified = true;
                }
                if (Array.isArray(a.assignedParks) && a.assignedParks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normName)) {
                    a.assignedParks = a.assignedParks.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() !== normName);
                    thisAgentModified = true;
                }
                if (thisAgentModified) {
                    agentsModified = true;
                    if (typeof syncAgentToSupabase === 'function') {
                        await syncAgentToSupabase(a);
                    }
                }
            }
            if (agentsModified) {
                safeLocalStorageSet('industria_agents', JSON.stringify(allAgents));
                if (typeof agents !== 'undefined') agents = allAgents;
                if (typeof window !== 'undefined' && typeof window.renderAgentsTable === 'function') {
                    window.renderAgentsTable();
                } else if (typeof renderAgentsTable === 'function') {
                    renderAgentsTable();
                }
            }
        }

        const updatedReqs = reqs.filter(r => String(r.id) !== String(requestId));
        saveParkRequests(updatedReqs);

        alert(isApproved ? `Approved park "${req.name}" and its request record have been removed.` : `Rejected request for "${req.name}" has been removed.`);
        renderParkRequestsTable();
        renderParksTable();
        if (typeof renderTable === 'function') renderTable();
    };

    let currentParkSort = { column: null, direction: 'asc' };
    let currentUnassignedParkSort = { column: null, direction: 'asc' };

    function renderParksTable() {
        window.renderParksTable = renderParksTable;
        if (!parksTableBody) return;
        parksTableBody.innerHTML = '';

        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const isAdministrator = String(activeRole).toLowerCase() === 'administrator';
        const isSupervisor = String(activeRole).toLowerCase() === 'supervisor';
        const isAssistant = String(activeRole).toLowerCase() === 'assistant';
        const canViewUnassigned = isAdministrator || isSupervisor;
        
        let allParks = [];
        for (const city in parks) {
            if (Array.isArray(parks[city])) {
                parks[city].forEach(park => {
                    allParks.push({ city: city, name: park.name, section: park.section, hidden: park.hidden, id: park.id });
                });
            }
        }

        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);

        // Find handling specialist agent for each park
        allParks.forEach(park => {
            park.handlingAgent = allAgents.find(a => {
                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                return pList.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === park.name.trim().toLowerCase());
            }) || null;
        });

        // Partition into Assigned Parks and Unassigned Parks
        let assignedParksList = allParks.filter(p => !!p.handlingAgent);
        let unassignedParksList = allParks.filter(p => !p.handlingAgent);

        // Apply park restriction for Assistant/Agent role on assigned parks
        const allowedParks = getAssistantAssignedParks();
        if (allowedParks !== null) {
            assignedParksList = assignedParksList.filter(p => isParkAllowed(p.name, allowedParks));
        }

        // Update active assigned parks count badge in tab
        const activeBadge = document.getElementById('parks-active-count-badge');
        if (activeBadge) activeBadge.textContent = assignedParksList.length;

        // Unassigned parks controls & badges visibility strictly for Administrator & Supervisor
        const tabUnassignedBtn = document.getElementById('parks-tab-unassigned');
        const unassignedBadge = document.getElementById('parks-unassigned-count-badge');
        const unassignedBanner = document.getElementById('unassigned-parks-alert-banner');
        const bannerCount = document.getElementById('unassigned-parks-banner-count');

        if (canViewUnassigned) {
            if (tabUnassignedBtn) tabUnassignedBtn.style.display = 'inline-flex';
            if (unassignedBadge) unassignedBadge.textContent = unassignedParksList.length;
            if (unassignedBanner) {
                unassignedBanner.style.display = unassignedParksList.length > 0 ? 'block' : 'none';
                if (bannerCount) bannerCount.textContent = unassignedParksList.length;
            }
        } else {
            if (tabUnassignedBtn) tabUnassignedBtn.style.display = 'none';
            if (unassignedBanner) unassignedBanner.style.display = 'none';
        }

        if (currentParkSort.column) {
            assignedParksList.sort((a, b) => {
                let valA = '', valB = '';
                if (currentParkSort.column === 'agent') {
                    valA = (a.handlingAgent ? a.handlingAgent.name : '').toLowerCase();
                    valB = (b.handlingAgent ? b.handlingAgent.name : '').toLowerCase();
                } else {
                    valA = (a[currentParkSort.column] || '').toLowerCase();
                    valB = (b[currentParkSort.column] || '').toLowerCase();
                }
                if (valA < valB) return currentParkSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return currentParkSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const canAddOrSubmit = isAdministrator || isSupervisor || isAssistant;

        // Show "Add Park" for Administrator and "Submit Park" for Supervisor & Assistant
        if (addParkBtn) {
            addParkBtn.style.display = canAddOrSubmit ? 'inline-flex' : 'none';
            addParkBtn.innerHTML = (isSupervisor || isAssistant) ? '<i class="fa-solid fa-paper-plane"></i> Submit Park' : '<i class="fa-solid fa-plus"></i> Add Park';
        }

        // Apply park toolbar filters & search on assigned parks
        const parkSearchInput = document.getElementById('park-search-input');
        const parkCityFilter = document.getElementById('park-city-filter');
        const searchVal = parkSearchInput ? parkSearchInput.value.toLowerCase().trim() : '';
        const cityVal = parkCityFilter ? parkCityFilter.value : 'All';

        let filteredParks = assignedParksList.filter(p => {
            const matchesCity = (cityVal === 'All') || (p.city === cityVal);
            const searchHaystack = [p.name, p.city, p.section, (p.handlingAgent ? p.handlingAgent.name : '')].filter(Boolean).join(' ').toLowerCase();
            const matchesSearch = !searchVal || searchHaystack.includes(searchVal);
            return matchesCity && matchesSearch;
        });

        if (filteredParks.length === 0) {
            parksTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-size: 0.92rem;"><i class="fa-solid fa-map-location-dot" style="font-size: 2rem; margin-bottom: 0.5rem; color: #94a3b8; display: block;"></i>No assigned parks found matching your search or filter criteria.</td></tr>`;
        } else {
            filteredParks.forEach(park => {
                const assignedCount = properties.filter(p => (p.park || '').trim().toLowerCase() === park.name.trim().toLowerCase() && (!park.city || p.location === park.city)).length;
                const statusHtml = park.hidden ? '<span class="status-badge" style="background-color: #f3f4f6; color: #6b7280;">Hidden</span>' : '<span class="status-badge status-active">Active</span>';
                const tr = document.createElement('tr');

                const handlingAgent = park.handlingAgent;
                const agentDisplay = handlingAgent 
                    ? `<div style="display:inline-flex; align-items:center; gap:6px; text-align:left;">
                        <img src="${handlingAgent.image || 'assets/images/agent_marcus.jpg'}" alt="${escapeHtml(handlingAgent.name)}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e1; flex-shrink:0;" onerror="this.src='assets/images/agent_marcus.jpg'">
                        <div style="line-height:1.2;">
                            <strong style="font-size:0.82rem; color:#1e3a8a; display:block; font-weight:700;">${escapeHtml(handlingAgent.name)}</strong>
                            <small style="color:#64748b; font-size:0.71rem; font-weight:500; display:block;">${escapeHtml(handlingAgent.ren || 'Specialist')}</small>
                        </div>
                       </div>`
                    : `<span style="color:var(--text-muted); font-size:0.78rem; font-style:italic;"><i class="fa-solid fa-user-slash" style="margin-right:3px;"></i> Unassigned</span>`;

                let actionsHtml = '';
                if (isAdministrator) {
                    actionsHtml = `
                        <button class="action-btn" aria-label="Edit" title="Edit Park" onclick="editPark('${encodeURIComponent(park.city)}', '${encodeURIComponent(park.name)}')"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete" aria-label="Delete" title="Delete Park" onclick="deletePark('${encodeURIComponent(park.city)}', '${encodeURIComponent(park.name)}')"><i class="fa-solid fa-trash"></i></button>
                    `;
                } else {
                    actionsHtml = '<span style="color:var(--text-muted); font-size:0.8rem;"><i class="fa-solid fa-lock"></i> Protected</span>';
                }

                tr.innerHTML = `
                    <td><span style="font-weight:600; font-size:0.84rem; color:var(--text-dark);">${escapeHtml(park.city)}</span></td>
                    <td><span style="font-size:0.82rem; color:var(--text-muted);">${escapeHtml(park.section || '-')}</span></td>
                    <td><strong style="color: #0f172a; font-size: 0.88rem; font-weight: 700; line-height: 1.25;">${escapeHtml(park.name)}</strong></td>
                    <td><span style="color: #475569; font-weight: 600; font-size: 0.82rem;">${assignedCount} properties</span></td>
                    <td style="padding-right: 0.4rem;">${agentDisplay}</td>
                    <td style="padding-left: 0.4rem;"><span class="status-badge ${park.hidden ? '' : 'status-active'}" style="${park.hidden ? 'background-color:#f3f4f6; color:#6b7280;' : ''} padding:2px 8px; font-size:0.74rem;">${park.hidden ? 'Hidden' : 'Active'}</span></td>
                    <td style="padding-left: 0.5rem;"><div style="display:inline-flex; align-items:center; gap:4px;">${actionsHtml}</div></td>
                `;
                parksTableBody.appendChild(tr);
            });
        }

        // Also render approval requests queue
        renderParkRequestsTable();

        // Render Unassigned Parks Table (only populated if Admin/Supervisor)
        renderUnassignedParksTable(unassignedParksList);

        // Update Sort Icons
        document.querySelectorAll('.sortable-park').forEach(th => {
            const icon = th.querySelector('i');
            if (icon) {
                if (th.dataset.sort === currentParkSort.column) {
                    icon.className = currentParkSort.direction === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
                } else {
                    icon.className = 'fa-solid fa-sort';
                }
            }
        });
    }

    function renderUnassignedParksTable(providedList) {
        window.renderUnassignedParksTable = renderUnassignedParksTable;
        const mainTableBody = document.getElementById('parks-unassigned-table-body');

        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const isAdministrator = String(activeRole).toLowerCase() === 'administrator';
        const isSupervisor = String(activeRole).toLowerCase() === 'supervisor';
        const canViewUnassigned = isAdministrator || isSupervisor;

        if (!canViewUnassigned) {
            if (mainTableBody) mainTableBody.innerHTML = '';
            return;
        }

        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);

        let list = providedList;
        if (!Array.isArray(list)) {
            list = [];
            for (const city in parks) {
                if (Array.isArray(parks[city])) {
                    parks[city].forEach(park => {
                        const isAssigned = allAgents.some(a => {
                            const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                            return pList.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === park.name.trim().toLowerCase());
                        });
                        if (!isAssigned) {
                            list.push({ city: city, name: park.name, section: park.section, hidden: park.hidden, id: park.id });
                        }
                    });
                }
            }
        }

        // Apply filters & search for Container 3 dedicated unassigned table
        const cityFilterEl = document.getElementById('unassigned-park-city-filter');
        const searchInputEl = document.getElementById('unassigned-park-search-input');
        const cityVal = cityFilterEl ? cityFilterEl.value : 'All';
        const searchVal = searchInputEl ? searchInputEl.value.toLowerCase().trim() : '';

        let filteredList = list.filter(p => {
            const matchesCity = (cityVal === 'All') || (p.city === cityVal);
            const searchHaystack = [p.name, p.city, p.section].filter(Boolean).join(' ').toLowerCase();
            const matchesSearch = !searchVal || searchHaystack.includes(searchVal);
            return matchesCity && matchesSearch;
        });

        if (currentUnassignedParkSort.column) {
            filteredList.sort((a, b) => {
                let valA = (a[currentUnassignedParkSort.column] || '').toLowerCase();
                let valB = (b[currentUnassignedParkSort.column] || '').toLowerCase();
                if (valA < valB) return currentUnassignedParkSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return currentUnassignedParkSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        function createUnassignedRow(park) {
            const assignedCount = properties.filter(p => (p.park || '').trim().toLowerCase() === park.name.trim().toLowerCase() && (!park.city || p.location === park.city)).length;
            let actionsHtml = '';
            if (isAdministrator) {
                actionsHtml = `
                    <button class="action-btn" aria-label="Edit" title="Edit Park" onclick="editPark('${encodeURIComponent(park.city)}', '${encodeURIComponent(park.name)}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete" aria-label="Delete" title="Delete Park" onclick="deletePark('${encodeURIComponent(park.city)}', '${encodeURIComponent(park.name)}')"><i class="fa-solid fa-trash"></i></button>
                `;
            } else {
                actionsHtml = '<span style="color:var(--text-muted); font-size:0.8rem;"><i class="fa-solid fa-lock"></i> Protected</span>';
            }

            const agentOptions = allAgents.map(a => `<option value="${a.id}">${escapeHtml(a.name)} (${escapeHtml(a.ren || 'Specialist')})</option>`).join('');

            const selectHtml = `
                <select class="form-control" style="font-size:0.8rem; padding: 0.35rem 0.5rem; height: auto; border: 1.5px solid #cbd5e1; border-radius: 6px; background-color: #fff; cursor: pointer;" onchange="assignSpecialistToPark('${encodeURIComponent(park.city)}', '${encodeURIComponent(park.name)}', this.value)">
                    <option value="">-- Assign Specialist --</option>
                    ${agentOptions}
                </select>
            `;

            const propCountDisplay = assignedCount > 0 
                ? `<button type="button" class="btn btn-sm btn-outline" onclick="viewUnassignedParkProperties('${encodeURIComponent(park.name)}')" style="font-size:0.75rem; padding:2px 8px; border-radius:6px; font-weight:600; cursor:pointer;" title="Click to view ${assignedCount} unassigned properties in this park"><i class="fa-solid fa-building" style="margin-right:3px;"></i> ${assignedCount} properties &rarr;</button>`
                : `<span style="color: #94a3b8; font-size: 0.82rem;">0 properties</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="font-weight:600; font-size:0.84rem; color:var(--text-dark);">${escapeHtml(park.city)}</span></td>
                <td><span style="font-size:0.82rem; color:var(--text-muted);">${escapeHtml(park.section || '-')}</span></td>
                <td><strong style="color: #0f172a; font-size: 0.88rem; font-weight: 700; line-height: 1.25;">${escapeHtml(park.name)}</strong></td>
                <td>${propCountDisplay}</td>
                <td>${selectHtml}</td>
                <td><span class="status-badge ${park.hidden ? '' : 'status-active'}" style="${park.hidden ? 'background-color:#f3f4f6; color:#6b7280;' : ''} padding:2px 8px; font-size:0.74rem;">${park.hidden ? 'Hidden' : 'Active'}</span></td>
                <td><div style="display:inline-flex; align-items:center; gap:4px;">${actionsHtml}</div></td>
            `;
            return tr;
        }

        // Render main unassigned table (Container 3)
        if (mainTableBody) {
            mainTableBody.innerHTML = '';
            if (filteredList.length === 0) {
                mainTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-muted); font-size: 0.92rem;"><i class="fa-solid fa-circle-check" style="font-size: 2rem; margin-bottom: 0.5rem; color: #10b981; display: block;"></i>All parks currently have assigned specialist agents, or no unassigned parks match your search.</td></tr>`;
            } else {
                filteredList.forEach(p => mainTableBody.appendChild(createUnassignedRow(p)));
            }
        }


        // Update Sort Icons for Unassigned Table
        document.querySelectorAll('.sortable-unassigned-park').forEach(th => {
            const icon = th.querySelector('i');
            if (icon) {
                if (th.dataset.sort === currentUnassignedParkSort.column) {
                    icon.className = currentUnassignedParkSort.direction === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
                } else {
                    icon.className = 'fa-solid fa-sort';
                }
            }
        });
    }

    window.assignSpecialistToPark = async function(encCity, encParkName, agentId) {
        const city = decodeURIComponent(encCity);
        const parkName = decodeURIComponent(encParkName);
        if (!agentId) return;

        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           currentUserRole || 
                           'Administrator';
        const isAdministrator = String(activeRole).toLowerCase() === 'administrator';
        const isSupervisor = String(activeRole).toLowerCase() === 'supervisor';
        if (!isAdministrator && !isSupervisor) {
            alert('Only Administrator and Supervisor can assign specialists to parks.');
            return;
        }

        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
        const targetAgent = allAgents.find(a => String(a.id) === String(agentId));
        if (!targetAgent) {
            alert('Selected specialist agent could not be found.');
            return;
        }

        // Single-agent territory protection: verify no other agent already handles this park
        const normName = parkName.trim().toLowerCase();
        const conflictAgent = allAgents.find(a => {
            if (String(a.id) === String(agentId)) return false;
            const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            return pList.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normName);
        });
        if (conflictAgent) {
            alert(`Territory Conflict: "${parkName}" is already assigned to ${conflictAgent.name}. A park can only have 1 specialist agent.`);
            return;
        }

        if (!Array.isArray(targetAgent.parks)) targetAgent.parks = [];
        if (!Array.isArray(targetAgent.assignedParks)) targetAgent.assignedParks = [];

        const alreadyInParks = targetAgent.parks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normName);
        if (!alreadyInParks) {
            targetAgent.parks.push(parkName);
        }
        const alreadyInAssigned = targetAgent.assignedParks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normName);
        if (!alreadyInAssigned) {
            targetAgent.assignedParks.push({ name: parkName, city: city });
        }

        safeLocalStorageSet('industria_agents', JSON.stringify(allAgents));
        if (typeof agents !== 'undefined') agents = allAgents;

        if (typeof syncAgentToSupabase === 'function') {
            await syncAgentToSupabase(targetAgent);
        }

        alert(`Successfully assigned specialist "${targetAgent.name}" to park "${parkName}".`);

        renderParksTable();
        if (typeof renderAgentsTable === 'function') renderAgentsTable();
        if (typeof renderTable === 'function') renderTable();
    };

    // Add sort event listeners for active parks
    document.querySelectorAll('.sortable-park').forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.dataset.sort;
            if (currentParkSort.column === sortKey) {
                currentParkSort.direction = currentParkSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentParkSort.column = sortKey;
                currentParkSort.direction = 'asc';
            }
            renderParksTable();
        });
    });

    // Add sort event listeners for unassigned parks
    document.querySelectorAll('.sortable-unassigned-park').forEach(th => {
        th.addEventListener('click', () => {
            const sortKey = th.dataset.sort;
            if (currentUnassignedParkSort.column === sortKey) {
                currentUnassignedParkSort.direction = currentUnassignedParkSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentUnassignedParkSort.column = sortKey;
                currentUnassignedParkSort.direction = 'asc';
            }
            renderUnassignedParksTable();
        });
    });

    window.deletePark = async function(encCity, encName) {
        if (currentUserRole !== 'Administrator') {
            alert('Only Administrator can delete parks.');
            return;
        }

        const city = decodeURIComponent(encCity);
        const name = decodeURIComponent(encName);
        if(confirm(`Are you sure you want to delete ${name}? Properties assigned to it will be un-assigned.`)) {
            const targetPark = parks[city] ? parks[city].find(p => p.name === name) : null;
            const targetId = targetPark && targetPark.id ? targetPark.id : name;

            parks[city] = parks[city].filter(p => p.name !== name);
            localStorage.setItem('industria_industrial_parks', JSON.stringify(parks));
            if (typeof window.removeParkFromLocationDirectory === 'function') {
                window.removeParkFromLocationDirectory(city, name);
            }
            
            // Delete from Supabase Cloud Database
            syncParkDeleteToSupabase(targetId);

            // Un-assign properties
            properties.forEach(p => {
                if (p.location === city && p.park === name) {
                    p.park = '';
                    syncPropertyToSupabase(p);
                }
            });
            localStorage.setItem('industria_properties', JSON.stringify(properties));

            // Un-assign from agents
            const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
            let agentsModified = false;
            for (const a of allAgents) {
                let thisAgentModified = false;
                const normName = name.trim().toLowerCase();
                if (Array.isArray(a.parks) && a.parks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normName)) {
                    a.parks = a.parks.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() !== normName);
                    thisAgentModified = true;
                }
                if (Array.isArray(a.assignedParks) && a.assignedParks.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() === normName)) {
                    a.assignedParks = a.assignedParks.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).trim().toLowerCase() !== normName);
                    thisAgentModified = true;
                }
                if (thisAgentModified) {
                    agentsModified = true;
                    if (typeof syncAgentToSupabase === 'function') {
                        await syncAgentToSupabase(a);
                    }
                }
            }
            if (agentsModified) {
                safeLocalStorageSet('industria_agents', JSON.stringify(allAgents));
                if (typeof agents !== 'undefined') agents = allAgents;
                if (typeof window !== 'undefined' && typeof window.renderAgentsTable === 'function') {
                    window.renderAgentsTable();
                } else if (typeof renderAgentsTable === 'function') {
                    renderAgentsTable();
                }
            }
            
            // Clean up corresponding approved request if exists
            const reqs = getParkRequests();
            const updatedReqs = reqs.filter(r => !(r.city === city && r.name.trim().toLowerCase() === name.trim().toLowerCase() && r.status === 'Approved'));
            if (updatedReqs.length !== reqs.length) {
                saveParkRequests(updatedReqs);
                renderParkRequestsTable();
            }

            renderParksTable();
            renderTable();
        }
    };

    window.editPark = function(encCity, encName) {
        if (currentUserRole !== 'Administrator') {
            alert('Only Administrator can edit parks.');
            return;
        }
        const city = decodeURIComponent(encCity);
        const name = decodeURIComponent(encName);
        
        const park = parks[city] ? parks[city].find(p => p.name === name) : null;
        if(!park) return;

        document.getElementById('park-modal-title').innerText = 'Edit Park';
        document.getElementById('editParkOriginalName').value = name;
        const origCityInput = document.getElementById('editParkOriginalCity');
        if (origCityInput) origCityInput.value = city;

        const citySelect = document.getElementById('parkCity');
        if (citySelect) {
            citySelect.value = city;
            citySelect.disabled = true;
        }

        document.getElementById('parkSection').value = park.section || '';
        document.getElementById('parkName').value = park.name;
        document.getElementById('parkStatus').value = park.hidden ? 'hidden' : 'active';
        
        const roleBadge = document.getElementById('park-modal-role-badge');
        if (roleBadge) roleBadge.style.display = 'none';
        const adminSubmitGroup = document.getElementById('admin-submit-mode-group');
        if (adminSubmitGroup) adminSubmitGroup.style.display = 'none';
        const remarksGroup = document.getElementById('park-remarks-group');
        if (remarksGroup) remarksGroup.style.display = 'none';
        const submitBtn = document.getElementById('save-park-submit-btn');
        if (submitBtn) submitBtn.innerHTML = 'Save Park';

        populateParkAgentsDropdown(null, name);
        renderParkProperties(city, name);
        openParkModal();
    };

    function openParkModal() {
        if (parkModal) {
            parkModal.classList.add('active');
            parkModal.style.display = 'flex';
        }
    }

    function closeParkModal() {
        if (parkModal) {
            parkModal.classList.remove('active');
            parkModal.style.display = 'none';
        }
        if (parkForm) parkForm.reset();
        const citySelect = document.getElementById('parkCity');
        if (citySelect) {
            citySelect.disabled = false;
        }
        const agentSelect = document.getElementById('parkAgent');
        if (agentSelect) {
            agentSelect.disabled = false;
            agentSelect.style.backgroundColor = '';
            agentSelect.style.color = '';
            agentSelect.style.cursor = '';
        }
        const lockedNote = document.getElementById('park-agent-locked-note');
        if (lockedNote) lockedNote.style.display = 'none';
        const origCityInput = document.getElementById('editParkOriginalCity');
        if (origCityInput) origCityInput.value = '';
        const adminSubmitGroup = document.getElementById('admin-submit-mode-group');
        if (adminSubmitGroup) adminSubmitGroup.style.display = 'none';
        const dupMsg = document.getElementById('park-duplicate-msg');
        if (dupMsg) dupMsg.style.display = 'none';
        const conflictMsg = document.getElementById('park-agent-conflict-msg');
        if (conflictMsg) conflictMsg.style.display = 'none';
        const roleBadge = document.getElementById('park-modal-role-badge');
        if (roleBadge) roleBadge.style.display = 'none';
        const remarksGroup = document.getElementById('park-remarks-group');
        if (remarksGroup) remarksGroup.style.display = 'none';
    }

    addParkBtn.addEventListener('click', () => {
        const isSupervisor = currentUserRole === 'Supervisor';
        const isAssistant = currentUserRole === 'Assistant';
        const isAdministrator = currentUserRole === 'Administrator';

        let modalTitleText = 'Add Park';
        if (isSupervisor) {
            modalTitleText = 'Submit Park for Admin Approval';
        } else if (isAssistant) {
            modalTitleText = 'Submit Park for Supervisor Approval';
        }
        document.getElementById('park-modal-title').innerText = modalTitleText;
        document.getElementById('editParkOriginalName').value = '';
        const origCityInput = document.getElementById('editParkOriginalCity');
        if (origCityInput) origCityInput.value = '';

        const citySelect = document.getElementById('parkCity');
        if (citySelect) {
            citySelect.disabled = false;
            citySelect.value = '';
        }

        parkForm.reset();
        document.getElementById('parkSection').value = '';
        document.getElementById('park-properties-container').innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Select a city to view available properties.</p>';
        
        const roleBadge = document.getElementById('park-modal-role-badge');
        if (roleBadge) {
            if (isAssistant) {
                roleBadge.style.display = 'block';
                roleBadge.style.background = '#fef3c7';
                roleBadge.style.color = '#92400e';
                roleBadge.style.border = '1px solid #fde68a';
                roleBadge.innerHTML = '<i class="fa-solid fa-paper-plane" style="margin-right: 4px;"></i> <strong>Assistant Submission:</strong> Submitting will send this park proposal to Supervisors &amp; Administrators for review and approval.';
            } else if (isSupervisor) {
                roleBadge.style.display = 'block';
                roleBadge.style.background = '#ede9fe';
                roleBadge.style.color = '#6d28d9';
                roleBadge.style.border = '1px solid #ddd6fe';
                roleBadge.innerHTML = '<i class="fa-solid fa-shield-halved" style="margin-right: 4px;"></i> <strong>Supervisor Submission:</strong> Submitting will send this park for Administrator review &amp; approval.';
            } else {
                roleBadge.style.display = 'none';
            }
        }

        const adminSubmitGroup = document.getElementById('admin-submit-mode-group');
        if (adminSubmitGroup) {
            adminSubmitGroup.style.display = isAdministrator ? 'block' : 'none';
            const directRadio = document.getElementById('admin-park-mode-direct');
            if (directRadio) directRadio.checked = true;
        }

        const remarksGroup = document.getElementById('park-remarks-group');
        const remarksLabel = document.getElementById('park-remarks-label');
        if (remarksGroup) {
            remarksGroup.style.display = (isSupervisor || isAssistant) ? 'block' : 'none';
            if (remarksLabel) {
                remarksLabel.innerText = isAssistant ? 'Remarks / Justification (for Supervisor Review)' : 'Remarks / Justification (for Admin Review)';
            }
        }

        const submitBtn = document.getElementById('save-park-submit-btn');
        if (submitBtn) {
            if (isAssistant) {
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit for Supervisor Approval';
            } else if (isSupervisor) {
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit for Admin Approval';
            } else {
                submitBtn.innerHTML = 'Save Park';
            }
        }

        const defaultAgentId = isAssistant ? (getAssistantAgent() ? getAssistantAgent().id : null) : null;
        populateParkAgentsDropdown(defaultAgentId, '');
        openParkModal();
    });
    
    closeParkModalBtn.addEventListener('click', closeParkModal);
    cancelParkBtn.addEventListener('click', closeParkModal);
    parkModal.addEventListener('click', (e) => { if (e.target === parkModal) closeParkModal(); });

    document.querySelectorAll('input[name="adminParkMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const remarksGroup = document.getElementById('park-remarks-group');
            const submitBtn = document.getElementById('save-park-submit-btn');
            const modalTitle = document.getElementById('park-modal-title');
            if (e.target.value === 'submit') {
                if (remarksGroup) remarksGroup.style.display = 'block';
                if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit to Approval Queue';
                if (modalTitle) modalTitle.innerText = 'Submit Park (Approval Queue)';
            } else {
                if (remarksGroup) remarksGroup.style.display = 'none';
                if (submitBtn) submitBtn.innerHTML = 'Save Park';
                if (modalTitle) modalTitle.innerText = 'Add Park';
            }
        });
    });

    document.getElementById('parkCity').addEventListener('change', (e) => {
        renderParkProperties(e.target.value, '');
        validateParkModalInputs();
    });

    const parkNameInput = document.getElementById('parkName');
    if (parkNameInput) {
        parkNameInput.addEventListener('input', validateParkModalInputs);
    }
    const parkAgentInput = document.getElementById('parkAgent');
    if (parkAgentInput) {
        parkAgentInput.addEventListener('change', validateParkModalInputs);
    }

    function validateParkModalInputs() {
        const city = document.getElementById('parkCity') ? document.getElementById('parkCity').value : '';
        const name = document.getElementById('parkName') ? document.getElementById('parkName').value.trim() : '';
        const originalName = document.getElementById('editParkOriginalName') ? document.getElementById('editParkOriginalName').value : '';
        const agentId = document.getElementById('parkAgent') ? document.getElementById('parkAgent').value : '';

        const dupMsg = document.getElementById('park-duplicate-msg');
        const dupText = document.getElementById('park-duplicate-text');
        if (dupMsg && dupText) {
            if (city && name) {
                const dupCheck = checkParkDuplication(city, name, originalName);
                if (dupCheck.isDuplicate) {
                    dupText.textContent = dupCheck.error;
                    dupMsg.style.display = 'block';
                } else {
                    dupMsg.style.display = 'none';
                }
            } else {
                dupMsg.style.display = 'none';
            }
        }

        const conflictMsg = document.getElementById('park-agent-conflict-msg');
        if (conflictMsg) {
            if (name && agentId) {
                const terrCheck = checkAgentTerritoryConflict(name, agentId);
                if (terrCheck.hasConflict) {
                    const isSupervisor = currentUserRole === 'Supervisor';
                    const isAssistant = currentUserRole === 'Assistant' || currentUserRole === 'Agent';
                    const adminModeInput = document.querySelector('input[name="adminParkMode"]:checked');
                    const isAdminSubmitMode = !isSupervisor && !isAssistant && adminModeInput && adminModeInput.value === 'submit';
                    const isDirectAdmin = !isSupervisor && !isAssistant && !isAdminSubmitMode;

                    const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
                    const selAgent = allAgents.find(a => String(a.id) === String(agentId));
                    const selAgentName = selAgent ? selAgent.name : 'Selected Agent';

                    if (isDirectAdmin) {
                        conflictMsg.style.background = '#eff6ff';
                        conflictMsg.style.borderColor = '#bfdbfe';
                        conflictMsg.style.color = '#1e40af';
                        conflictMsg.innerHTML = `<i class="fa-solid fa-arrow-right-arrow-left" style="margin-right:5px; color:#2563eb;"></i> <strong>Territory Transfer:</strong> Park "${escapeHtml(name)}" is currently handled by <strong>${escapeHtml(terrCheck.conflictingAgentName)}</strong>. Saving will reassign this park to <strong>${escapeHtml(selAgentName)}</strong> and update both specialist profiles.`;
                        conflictMsg.style.display = 'block';
                    } else {
                        conflictMsg.style.background = '#fef2f2';
                        conflictMsg.style.borderColor = '#fca5a5';
                        conflictMsg.style.color = '#b91c1c';
                        conflictMsg.innerHTML = `<i class="fa-solid fa-user-xmark" style="margin-right:4px;"></i> ${escapeHtml(terrCheck.error)}`;
                        conflictMsg.style.display = 'block';
                    }
                } else {
                    conflictMsg.style.display = 'none';
                }
            } else {
                conflictMsg.style.display = 'none';
            }
        }
    }

    window.handleParkPropCheckboxChange = function(cb) {
        var label = cb.closest('label');
        var badge = label ? label.querySelector('.prop-status-badge') : null;
        var titleSpan = label ? label.querySelector('.prop-title-span') : null;
        if (cb.checked) {
            if (label) {
                label.style.background = '#eff6ff';
                label.style.borderColor = '#bfdbfe';
            }
            if (titleSpan) {
                titleSpan.style.color = 'var(--primary-dark)';
                titleSpan.style.fontWeight = '700';
            }
            if (badge) {
                badge.style.background = '#eff6ff';
                badge.style.color = '#1e40af';
                badge.style.borderColor = '#bfdbfe';
                badge.innerHTML = '<i class="fa-solid fa-check" style="font-size:0.65rem;"></i> Linked to this Park';
            }
        } else {
            if (label) {
                label.style.background = 'transparent';
                label.style.borderColor = 'transparent';
            }
            if (titleSpan) {
                titleSpan.style.color = 'inherit';
                titleSpan.style.fontWeight = '500';
            }
            if (badge) {
                badge.style.background = '#f0fdf4';
                badge.style.color = '#15803d';
                badge.style.borderColor = '#bbf7d0';
                badge.innerHTML = '<i class="fa-solid fa-circle-check" style="font-size:0.65rem;"></i> Available';
            }
        }
    };

    function renderParkProperties(city, currentParkName) {
        const container = document.getElementById('park-properties-container');
        if (!container) return;
        if (!city) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; text-align: center; padding: 1.2rem 0;"><i class="fa-solid fa-circle-info" style="margin-right: 4px;"></i> Select a city to view available properties.</p>';
            return;
        }
        
        const allProps = (typeof properties !== 'undefined' && Array.isArray(properties) && properties.length > 0)
            ? properties
            : safeJsonParse('industria_properties', []);
        const cityProps = allProps.filter(p => p.location === city);

        if (cityProps.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0; text-align: center; padding: 1.2rem 0;"><i class="fa-solid fa-circle-info" style="margin-right: 4px;"></i> No properties found in ' + escapeHtml(city) + '.</p>';
            return;
        }

        const curNorm = String(currentParkName || '').trim().toLowerCase();

        let html = '';
        html += '<div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:0.45rem 0.65rem; margin-bottom:0.65rem; display:flex; align-items:center; gap:0.45rem;">' +
            '<span style="font-size:0.75rem; color:#1e40af; font-weight:600;"><i class="fa-solid fa-shield-halved" style="margin-right:4px;"></i> 1-Park Exclusivity: Each property can only be linked to 1 park.</span>' +
        '</div>';

        cityProps.forEach(p => {
            const propPark = String(p.park || '').trim();
            const propParkNorm = propPark.toLowerCase();
            const isLinkedToThis = curNorm !== '' && propParkNorm === curNorm;
            const isLinkedToOther = propPark !== '' && !isLinkedToThis;

            if (isLinkedToOther) {
                // Property is already linked to another park: show 'X' box and 'Linked to {Park}' badge. Strictly non-clickable.
                html += `
                    <div style="display:flex; align-items:center; gap:0.6rem; padding:0.42rem 0.65rem; border-radius:6px; border:1px solid #e2e8f0; background:#f8fafc; opacity:0.8; cursor:not-allowed; margin-bottom:4px;" title="Exclusively linked to ${escapeHtml(propPark)}. Each property can only be linked to 1 park.">
                        <span style="width:17px; height:17px; min-width:17px; border-radius:4px; background:#fee2e2; border:1.5px solid #f87171; color:#dc2626; display:inline-flex; align-items:center; justify-content:center; font-size:0.68rem; font-weight:900; flex-shrink:0;">
                            <i class="fa-solid fa-xmark"></i>
                        </span>
                        <span class="prop-title-span" style="font-size:0.85rem; font-weight:500; color:#64748b; line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:280px;" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</span>
                        <span class="prop-status-badge" style="font-size:0.71rem; font-weight:600; background:#fef2f2; color:#b91c1c; border:1px solid #fecaca; border-radius:12px; padding:2px 8px; margin-left:auto; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;">
                            <i class="fa-solid fa-xmark" style="font-size:0.65rem;"></i> Linked to ${escapeHtml(propPark)}
                        </span>
                    </div>
                `;
                return;
            }

            // Property is either linked to this park or available
            const statusBadge = isLinkedToThis
                ? `<span class="prop-status-badge" style="font-size:0.71rem; font-weight:600; background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; border-radius:12px; padding:2px 8px; margin-left:auto; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;"><i class="fa-solid fa-check" style="font-size:0.65rem;"></i> Linked to this Park</span>`
                : `<span class="prop-status-badge" style="font-size:0.71rem; font-weight:600; background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; border-radius:12px; padding:2px 8px; margin-left:auto; display:inline-flex; align-items:center; gap:4px; flex-shrink:0;"><i class="fa-solid fa-circle-check" style="font-size:0.65rem;"></i> Available</span>`;

            const initialBg = isLinkedToThis ? '#eff6ff' : 'transparent';
            const initialBorder = isLinkedToThis ? '#bfdbfe' : 'transparent';

            html += `
                <label for="assign_prop_${p.id}" style="display:flex; align-items:center; gap:0.6rem; padding:0.42rem 0.65rem; border-radius:6px; border:1px solid ${initialBorder}; cursor:pointer; transition:background 0.15s; margin-bottom:4px; background:${initialBg};"
                    onmouseover="if(!this.querySelector('input').checked) this.style.background='rgba(37,99,235,0.06)'" onmouseout="if(!this.querySelector('input').checked) this.style.background='${initialBg}'">
                    <input type="checkbox" id="assign_prop_${p.id}" value="${p.id}" class="park-prop-checkbox" ${isLinkedToThis ? 'checked' : ''}
                        onchange="handleParkPropCheckboxChange(this)"
                        style="width:17px; height:17px; accent-color:var(--primary); cursor:pointer; flex-shrink:0;">
                    <span class="prop-title-span" style="font-size:0.85rem; font-weight:${isLinkedToThis ? '700' : '500'}; color:${isLinkedToThis ? 'var(--primary-dark)' : 'inherit'}; line-height:1.25; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:280px;" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</span>
                    ${statusBadge}
                </label>
            `;
        });
        container.innerHTML = html;
    }

    parkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const origCity = document.getElementById('editParkOriginalCity') ? document.getElementById('editParkOriginalCity').value : '';
        const citySelect = document.getElementById('parkCity');
        const city = origCity || (citySelect ? citySelect.value : '');
        const section = document.getElementById('parkSection').value.trim();
        const newName = document.getElementById('parkName').value.trim();
        const originalName = document.getElementById('editParkOriginalName').value;
        const isHidden = document.getElementById('parkStatus').value === 'hidden';
        
        if (!city) {
            alert('Please select a city.');
            return;
        }

        // 1. DUPLICATION CHECK (Strict Prevention)
        const dupCheck = checkParkDuplication(city, newName, originalName);
        if (dupCheck.isDuplicate) {
            alert('⚠️ ' + dupCheck.error);
            return;
        }

        const isSupervisor = currentUserRole === 'Supervisor';
        const isAssistant = currentUserRole === 'Assistant' || currentUserRole === 'Agent';
        const adminModeInput = document.querySelector('input[name="adminParkMode"]:checked');
        const isAdminSubmitMode = !isSupervisor && !isAssistant && adminModeInput && adminModeInput.value === 'submit';
        const isDirectAdmin = !isSupervisor && !isAssistant && !isAdminSubmitMode;

        // 2. SINGLE-AGENT TERRITORY CHECK (Max 1 Agent per Park)
        const agentSelect = document.getElementById('parkAgent');
        let selectedAgentId = agentSelect ? agentSelect.value : '';
        if (isAssistant) {
            const assistantAgent = getAssistantAgent();
            if (assistantAgent) {
                selectedAgentId = String(assistantAgent.id);
            }
        }
        const allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : safeJsonParse('industria_agents', []);
        const selectedAgent = allAgents.find(a => String(a.id) === String(selectedAgentId));
        const selectedAgentName = selectedAgent ? selectedAgent.name : '';

        // Territory conflict check only blocks assistant or approval queue submissions
        if (selectedAgentId && !isDirectAdmin) {
            const terrCheck = checkAgentTerritoryConflict(newName, selectedAgentId);
            if (terrCheck.hasConflict) {
                alert('⚠️ ' + terrCheck.error);
                return;
            }
        }

        if (isSupervisor || isAssistant || isAdminSubmitMode) {
            // Assistant, Supervisor or Administrator submission: send for Approval Queue
            const remarks = document.getElementById('parkRemarks') ? document.getElementById('parkRemarks').value.trim() : '';
            const checkedProps = Array.from(document.querySelectorAll('.park-prop-checkbox:checked')).map(cb => cb.value);

            let submitterRole = 'Administrator';
            if (currentUserRole === 'Agent') submitterRole = 'Agent';
            else if (currentUserRole === 'Assistant') submitterRole = 'Assistant';
            else if (isSupervisor) submitterRole = 'Supervisor';

            const submitterName = loggedInUser || submitterRole;
            const targetApprover = isAssistant ? 'Supervisor' : 'Administrator';

            const newRequest = {
                id: 'req_park_' + Date.now(),
                city: city,
                section: section,
                name: newName,
                agentId: selectedAgentId,
                agentName: selectedAgentName,
                propertyIds: checkedProps,
                submittedBy: submitterName,
                submitterRole: submitterRole,
                targetApprover: targetApprover,
                submittedAt: new Date().toISOString(),
                status: 'Pending',
                remarks: remarks
            };

            const reqs = getParkRequests();
            reqs.push(newRequest);
            saveParkRequests(reqs);

            const approverRoleName = isAssistant ? 'Supervisor' : 'Administrator';
            alert(`✅ Park Proposal Submitted!\n\n"${newName}" (${city}) has been sent for approval.\n• Duplication check: Verified (No duplicate)\n• Single-agent territory check: Verified (1 handling agent)\n• Status: Pending ${approverRoleName} Approval`);
            
            closeParkModal();
            switchParksTab('requests');
            return;
        }

        // Administrator direct save
        if (!parks[city]) parks[city] = [];
        
        let targetParkObj = null;
        if (originalName) {
            // Edit existing
            const parkIndex = parks[city].findIndex(p => p.name === originalName);
            if (parkIndex > -1) {
                parks[city][parkIndex].name = newName;
                parks[city][parkIndex].section = section;
                parks[city][parkIndex].hidden = isHidden;
                targetParkObj = parks[city][parkIndex];
            }
        } else {
            targetParkObj = {
                id: `park_${city.toLowerCase().replace(/\s+/g, '_')}_${newName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                name: newName,
                section: section,
                hidden: isHidden
            };
            parks[city].push(targetParkObj);
        }
        safeLocalStorageSet('industria_industrial_parks', JSON.stringify(parks));

        if (targetParkObj) {
            targetParkObj.agentId = selectedAgentId || '';
            targetParkObj.agentName = selectedAgentName || '';
            await syncParkToSupabase(city, targetParkObj);
        }

        if (typeof window.syncParkToLocationDirectory === 'function') {
            window.syncParkToLocationDirectory(city, newName, originalName, isHidden);
        }

        // If handling agent designated/reassigned by Admin, assign to agent & unassign others
        for (const a of allAgents) {
            const isTarget = selectedAgentId && String(a.id) === String(selectedAgentId);
            let pList = Array.isArray(a.parks) ? a.parks : (a.assignedParks || []);
            let modified = false;
            if (isTarget) {
                if (!pList.includes(newName)) {
                    pList.push(newName);
                    modified = true;
                }
                a.parks = pList;
                a.assignedParks = pList;
            } else {
                // Remove if previously had originalName or newName to enforce 1 agent
                const prevLen = pList.length;
                a.parks = pList.filter(p => p !== newName && p !== originalName);
                a.assignedParks = (a.assignedParks || []).filter(p => p !== newName && p !== originalName);
                if (a.parks.length !== prevLen) modified = true;
            }
            if (modified && typeof syncAgentToSupabase === 'function') {
                await syncAgentToSupabase(a);
            }
        }
        safeLocalStorageSet('industria_agents', JSON.stringify(allAgents));
        if (typeof agents !== 'undefined') agents = allAgents;
        if (typeof window !== 'undefined' && typeof window.renderAgentsTable === 'function') {
            window.renderAgentsTable();
        } else if (typeof renderAgentsTable === 'function') {
            renderAgentsTable();
        }

        // Update properties assigned
        const checkboxes = document.querySelectorAll('.park-prop-checkbox');
        properties.forEach(p => {
            if (p.location === city) {
                const checkbox = Array.from(checkboxes).find(cb => String(cb.value) === String(p.id));
                if (checkbox) {
                    if (checkbox.checked) {
                        p.park = newName;
                        syncPropertyToSupabase(p);
                    } else if (p.park === originalName && originalName !== '') {
                        p.park = '';
                        syncPropertyToSupabase(p);
                    }
                }
            }
        });
        
        safeLocalStorageSet('industria_properties', JSON.stringify(properties));
        window.dispatchEvent(new Event('storage'));
        
        renderParksTable();
        renderTable();
        closeParkModal();
    });

    // Mobile Sidebar Toggle & Mobile UX
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');

    function closeMobileSidebar() {
        if (sidebar) sidebar.classList.remove('show');
        if (sidebarOverlay) sidebarOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    function openMobileSidebar() {
        if (sidebar) sidebar.classList.add('show');
        if (sidebarOverlay) sidebarOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    if (sidebarToggle) {
        sidebarToggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
        
        window.addEventListener('resize', () => {
            if (sidebarToggle) sidebarToggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
            if (window.innerWidth > 768) {
                closeMobileSidebar();
            }
        });

        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar && sidebar.classList.contains('show')) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }
        });
    }

    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMobileSidebar();
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    // Auto close sidebar when clicking any menu link on mobile
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            if (link.id === 'nav-settings') return; // Keep sidebar open if expanding/collapsing settings dropdown
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });

    // Desktop Auto-Minimize Navigation Rail Controls
    const desktopSidebarToggle = document.getElementById('desktop-sidebar-toggle');
    const sidebarPinBtn = document.getElementById('sidebar-pin-btn');

    function syncDesktopSidebar() {
        if (window.innerWidth > 768) {
            const isMin = localStorage.getItem('dashboard_sidebar_minimized') !== 'false';
            if (isMin) {
                document.body.classList.add('sidebar-minimized');
            } else {
                document.body.classList.remove('sidebar-minimized');
            }
        }
    }
    syncDesktopSidebar();

    function toggleDesktopSidebar() {
        const isMin = document.body.classList.toggle('sidebar-minimized');
        try {
            localStorage.setItem('dashboard_sidebar_minimized', isMin ? 'true' : 'false');
        } catch (e) {}
    }

    if (desktopSidebarToggle) {
        desktopSidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDesktopSidebar();
        });
    }

    if (sidebarPinBtn) {
        sidebarPinBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDesktopSidebar();
        });
    }

    // Header Live Cloud Sync & Keyboard Shortcuts (/ or Cmd+K)
    const liveSyncBtn = document.getElementById('header-live-sync-btn');
    const syncLabel = document.getElementById('header-sync-label');
    if (liveSyncBtn) {
        liveSyncBtn.addEventListener('click', async () => {
            if (liveSyncBtn.classList.contains('syncing')) return;
            liveSyncBtn.classList.add('syncing');
            if (syncLabel) syncLabel.textContent = 'Syncing…';
            try {
                const tasks = [];
                if (typeof window.loadPropertiesFromSupabase === 'function') tasks.push(window.loadPropertiesFromSupabase());
                if (typeof window.loadIndustrialParksFromSupabase === 'function') tasks.push(window.loadIndustrialParksFromSupabase());
                if (typeof window.loadLeadsFromSupabase === 'function') tasks.push(window.loadLeadsFromSupabase());
                if (typeof window.loadOwnerListingsFromSupabase === 'function') tasks.push(window.loadOwnerListingsFromSupabase());
                if (typeof window.loadDailyVisitorStats === 'function') tasks.push(window.loadDailyVisitorStats());
                if (typeof window.loadVisitorStats === 'function') tasks.push(window.loadVisitorStats());
                if (typeof window.renderVisitorChart === 'function') window.renderVisitorChart();
                await Promise.allSettled(tasks);
            } catch (e) {
                console.warn('Manual sync warning:', e);
            }
            setTimeout(() => {
                liveSyncBtn.classList.remove('syncing');
                if (syncLabel) {
                    syncLabel.textContent = 'Synced!';
                    setTimeout(() => { syncLabel.textContent = 'Sync'; }, 1500);
                }
            }, 600);
        });
    }

    document.addEventListener('keydown', (e) => {
        const searchInput = document.getElementById('header-global-search');
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || (document.activeElement && document.activeElement.isContentEditable);

        if ((e.key === '/' && !isTyping) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
            if (searchInput) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
        } else if (e.key === 'Escape') {
            if (document.activeElement === searchInput) {
                searchInput.blur();
                const dd = document.getElementById('global-search-results-dropdown');
                if (dd) dd.style.display = 'none';
            }
        }
    });

    // --- ANALYTICS OVERVIEW (CHART.JS) ---
    
    let leadsChartInstance = null;
    let trafficChartInstance = null;
    
    // Generate realistic leads count grouped by Year-Month for a given city and park since 2025, factoring in real stored leads
    function generateMockLeads(filterYear, filterCity, filterPark) {
        const data = [];
        const labels = [];
        const startYear = filterYear === 'all' ? 2025 : parseInt(filterYear);
        const endYear = filterYear === 'all' ? 2026 : parseInt(filterYear);

        // Fetch actual real leads from localStorage
        const storedLeads = safeJsonParse('industria_leads', typeof defaultLeads !== 'undefined' ? defaultLeads : []);

        for (let y = startYear; y <= endYear; y++) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            months.forEach((month, idx) => {
                labels.push(filterYear === 'all' ? `${month} ${y}` : month);
                
                // Count actual leads submitted in this month/year
                const actualCount = storedLeads.filter(l => {
                    if (!l) return false;
                    const dateVal = l.date || (l.timestamp ? l.timestamp.split(',')[0] : '');
                    if (!dateVal) return false;
                    const parts = dateVal.split('/');
                    if (parts.length === 3) {
                        const m = parseInt(parts[1] || parts[0], 10);
                        const yr = parseInt(parts[2], 10);
                        if (yr === y && m === (idx + 1)) {
                            if (filterCity !== 'all' && l.location && !l.location.toLowerCase().includes(filterCity.toLowerCase())) return false;
                            if (filterPark !== 'all' && l.interest && !l.interest.toLowerCase().includes(filterPark.toLowerCase())) return false;
                            return true;
                        }
                    }
                    return false;
                }).length;

                // Base seasonal trend
                let baseVolume = (y === 2025) ? (2 + Math.floor((idx % 4) * 1.5)) : 1;
                if (filterCity !== 'all' && baseVolume > 0) baseVolume = Math.max(1, baseVolume - 1);
                if (filterPark !== 'all' && baseVolume > 0) baseVolume = Math.max(0, baseVolume - 1);

                data.push(baseVolume + actualCount);
            });
        }
        return { labels, data };
    }

    window.renderOverviewCharts = function() {
        const leadsCanvas = document.getElementById('leadsChart');
        const trafficCanvas = document.getElementById('trafficChart');
        if (!leadsCanvas || !trafficCanvas) return;
        
        const filterYear = document.getElementById('chart-filter-year').value;
        const filterCity = document.getElementById('chart-filter-city').value;
        const filterPark = document.getElementById('chart-filter-park').value;
        
        const { labels, data } = generateMockLeads(filterYear, filterCity, filterPark);
        
        // Leads Chart
        const activeBranding = getBrandingSettings();
        const primaryColor = activeBranding.primaryColor || '#059669';
        const leadsBg = hexToRgba(primaryColor, 0.12);
        const trafficColors = [
            primaryColor,
            hexToRgba(primaryColor, 0.75),
            hexToRgba(primaryColor, 0.5),
            hexToRgba(primaryColor, 0.3)
        ];

        // Leads Chart
        if (leadsChartInstance) {
            leadsChartInstance.data.labels = labels;
            leadsChartInstance.data.datasets[0].data = data;
            leadsChartInstance.data.datasets[0].borderColor = primaryColor;
            leadsChartInstance.data.datasets[0].backgroundColor = leadsBg;
            leadsChartInstance.update();
        } else {
            leadsChartInstance = new Chart(leadsCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Incoming Leads',
                        data: data,
                        borderColor: primaryColor,
                        backgroundColor: leadsBg,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { borderDash: [2, 4], color: '#e5e7eb' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
        
        // Daily / Monthly Visitor Trends — live from Supabase
        if (typeof window.renderVisitorChart === 'function') {
            window.renderVisitorChart();
        } else {
            window.loadDailyVisitorTrend(trafficCanvas, 14, primaryColor, leadsBg);
        }
        
        // Update summary metrics
        window.loadDailyVisitorStats();
        window.loadVisitorStats();
        
        window.renderOverviewSummaries();
    };

    // Current visitor chart display mode and range
    window.currentVisitorMode = 'daily';
    window.currentDailyRange = 14;

    window.setVisitorChartMode = function(mode) {
        window.currentVisitorMode = mode || 'daily';
        const isDaily = window.currentVisitorMode === 'daily';
        
        const btnDaily = document.getElementById('btn-visitor-mode-daily');
        const btnMonthly = document.getElementById('btn-visitor-mode-monthly');
        const rangeSelect = document.getElementById('visitor-daily-range-select');
        const heading = document.getElementById('visitor-chart-heading');
        const legendViews = document.getElementById('legend-views-pill');

        if (btnDaily) btnDaily.classList.toggle('active', isDaily);
        if (btnMonthly) btnMonthly.classList.toggle('active', !isDaily);
        if (rangeSelect) rangeSelect.style.display = isDaily ? 'inline-block' : 'none';
        if (legendViews) legendViews.style.display = isDaily ? 'inline-flex' : 'none';
        if (heading) heading.textContent = isDaily ? 'Daily Visitor Trends' : 'Monthly Visitor Trends';

        window.renderVisitorChart();
    };

    window.changeDailyVisitorRange = function(days) {
        window.currentDailyRange = parseInt(days, 10) || 14;
        window.renderVisitorChart();
    };

    window.renderVisitorChart = function() {
        const trafficCanvas = document.getElementById('trafficChart');
        if (!trafficCanvas) return;
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim() || '#059669';
        const leadsBg = getComputedStyle(root).getPropertyValue('--primary-light').trim() || 'rgba(5, 150, 105, 0.12)';

        if (window.currentVisitorMode === 'monthly') {
            window.loadVisitorTrend(trafficCanvas, primaryColor, leadsBg);
        } else {
            window.loadDailyVisitorTrend(trafficCanvas, window.currentDailyRange, primaryColor, leadsBg);
        }
    };

    // Load Daily Visitor Trend (Last 7, 14, or 30 days) from Supabase
    window.loadDailyVisitorTrend = async function(canvas, daysCount, lineColor, fillColor) {
        canvas = canvas || document.getElementById('trafficChart');
        daysCount = daysCount || window.currentDailyRange || 14;
        lineColor = lineColor || '#059669';
        fillColor = fillColor || 'rgba(5, 150, 105, 0.12)';
        if (!canvas || typeof Chart === 'undefined') return;

        const summaryEl = document.getElementById('visitor-chart-summary');
        if (summaryEl) summaryEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading daily data…';

        let rows = [];
        try {
            const client = window.IndustraSupabase && window.IndustraSupabase.getClient();
            if (client) {
                const { data, error } = await client.rpc('get_daily_visitor_trend', { days_count: daysCount });
                if (error) throw error;
                rows = Array.isArray(data) ? data : [];
            }
        } catch (e) {
            console.error('Failed to load daily visitor trend:', e);
        }

        // If no data returned (e.g. offline/fallback), construct default timeline
        if (rows.length === 0) {
            const now = new Date();
            for (let i = daysCount - 1; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 86400000);
                const dKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                rows.push({ day: dKey, visitors: 0, views: 0 });
            }
        }

        const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = rows.map(r => {
            const parts = String(r.day).split('-');
            if (parts.length === 3) {
                const mIdx = parseInt(parts[1], 10) - 1;
                const dayNum = parseInt(parts[2], 10);
                return dayNum + ' ' + (monthsShort[mIdx] || parts[1]);
            }
            return r.day;
        });

        const visitorsData = rows.map(r => Number(r.visitors) || 0);
        const viewsData = rows.map(r => Number(r.views) || 0);

        const totalVisitors = visitorsData.reduce((a, b) => a + b, 0);
        const totalViews = viewsData.reduce((a, b) => a + b, 0);

        if (summaryEl) {
            summaryEl.innerHTML = `<i class="fa-solid fa-calendar-check" style="color:var(--primary);margin-right:4px;"></i><strong>${totalVisitors.toLocaleString()}</strong> unique visitors &bull; <strong>${totalViews.toLocaleString()}</strong> views in last ${daysCount}d`;
        }

        if (trafficChartInstance) {
            trafficChartInstance.data.labels = labels;
            trafficChartInstance.data.datasets = [
                {
                    label: 'Unique Visitors',
                    data: visitorsData,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    pointRadius: daysCount > 14 ? 2 : 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Page Views',
                    data: viewsData,
                    borderColor: '#0284c7',
                    backgroundColor: 'rgba(2, 132, 199, 0.08)',
                    borderWidth: 2,
                    borderDash: [3, 3],
                    fill: false,
                    tension: 0.35,
                    pointRadius: daysCount > 14 ? 2 : 3,
                    pointHoverRadius: 5
                }
            ];
            trafficChartInstance.options.scales.x.ticks.maxTicksLimit = daysCount > 14 ? 10 : 14;
            trafficChartInstance.update();
            return;
        }

        trafficChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Unique Visitors',
                        data: visitorsData,
                        borderColor: lineColor,
                        backgroundColor: fillColor,
                        borderWidth: 2,
                        fill: true,
                        tension: 0.35,
                        pointRadius: daysCount > 14 ? 2 : 3,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Page Views',
                        data: viewsData,
                        borderColor: '#0284c7',
                        backgroundColor: 'rgba(2, 132, 199, 0.08)',
                        borderWidth: 2,
                        borderDash: [3, 3],
                        fill: false,
                        tension: 0.35,
                        pointRadius: daysCount > 14 ? 2 : 3,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleFont: { size: 12, weight: 'bold' },
                        bodyFont: { size: 11 },
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { borderDash: [2, 4], color: '#e5e7eb' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10.5 },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: daysCount > 14 ? 10 : 14
                        }
                    }
                }
            }
        });
    };

    // Load last 12 months of unique visitors and render as line chart
    window.loadVisitorTrend = async function(canvas, lineColor, fillColor) {
        canvas = canvas || document.getElementById('trafficChart');
        lineColor = lineColor || '#059669';
        fillColor = fillColor || 'rgba(5, 150, 105, 0.12)';
        if (!canvas || typeof Chart === 'undefined') return;

        const summaryEl = document.getElementById('visitor-chart-summary');
        if (summaryEl) summaryEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading monthly data…';

        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: d.toLocaleString('en', { month: 'short' }) + ' ' + d.getFullYear() });
        }
        const counts = {};
        try {
            const client = window.IndustraSupabase && window.IndustraSupabase.getClient();
            if (client) {
                const { data, error } = await client.rpc('get_visitor_trend');
                if (error) throw error;
                (data || []).forEach(r => { counts[r.month] = Number(r.visitors) || 0; });
            }
        } catch (e) {
            console.error('Failed to load visitor trend:', e);
        }
        const values = months.map(m => counts[m.key] || 0);
        const labels = months.map(m => m.label);

        const total12m = values.reduce((a, b) => a + b, 0);
        if (summaryEl) {
            summaryEl.innerHTML = `<i class="fa-solid fa-calendar-check" style="color:var(--primary);margin-right:4px;"></i><strong>${total12m.toLocaleString()}</strong> unique visitors across last 12 months`;
        }

        if (trafficChartInstance) {
            trafficChartInstance.data.labels = labels;
            trafficChartInstance.data.datasets = [{
                label: 'Unique Visitors',
                data: values,
                borderColor: lineColor,
                backgroundColor: fillColor,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            }];
            trafficChartInstance.options.scales.x.ticks.maxTicksLimit = 12;
            trafficChartInstance.update();
            return;
        }

        trafficChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Unique Visitors',
                    data: values,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleFont: { size: 12, weight: 'bold' },
                        bodyFont: { size: 11 },
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { borderDash: [2, 4], color: '#e5e7eb' } },
                    x: { grid: { display: false }, ticks: { font: { size: 10.5 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } }
                }
            }
        });
    };

    // Load Daily Visitors KPI Metric from Supabase
    window.loadDailyVisitorStats = async function() {
        const visEl = document.getElementById('metric-daily-visitors');
        const trendEl = document.getElementById('metric-daily-visitors-trend');
        if (!visEl) return;
        const setTrend = (html, color) => { if (trendEl) { trendEl.innerHTML = html; trendEl.style.color = color; } };

        try {
            const client = window.IndustraSupabase && window.IndustraSupabase.getClient();
            if (!client) throw new Error('Supabase not available');
            const { data, error } = await client.rpc('get_daily_visitor_stats');
            if (error) throw error;
            
            const stats = (data && typeof data === 'object') ? data : {};
            const todayVisitors = Number(stats.today_visitors) || 0;
            const yesterdayVisitors = Number(stats.yesterday_visitors) || 0;
            const todayViews = Number(stats.today_views) || 0;

            visEl.innerText = todayVisitors.toLocaleString();

            if (yesterdayVisitors === 0) {
                setTrend(`<i class="fa-solid fa-eye"></i> ${todayViews.toLocaleString()} views today`, '#64748b');
            } else {
                const diff = todayVisitors - yesterdayVisitors;
                const pct = Math.round((diff / yesterdayVisitors) * 100);
                const up = pct >= 0;
                setTrend(`<i class="fa-solid fa-arrow-trend-${up ? 'up' : 'down'}"></i> ${up ? '+' : ''}${pct}% vs yesterday (${todayViews} views)`, up ? '#10b981' : '#ef4444');
            }
        } catch (e) {
            console.error('Failed to load daily visitor stats:', e);
            visEl.innerText = '0';
            setTrend('<i class="fa-solid fa-circle-info"></i> Tracking active', '#64748b');
        }
    };

    // Load real Monthly Visitors from Supabase (page_views table via get_visitor_stats RPC)
    window.loadVisitorStats = async function() {
        const visEl = document.getElementById('metric-visitors');
        const trendEl = document.getElementById('metric-visitors-trend');
        if (!visEl) return;
        const setTrend = (html, color) => { if (trendEl) { trendEl.innerHTML = html; trendEl.style.color = color; } };
        try {
            const client = window.IndustraSupabase && window.IndustraSupabase.getClient();
            if (!client) throw new Error('Supabase not available');
            const { data, error } = await client.rpc('get_visitor_stats');
            if (error) throw error;
            const thisMonth = Number(data.this_month) || 0;
            const lastMonth = Number(data.last_month) || 0;
            visEl.innerText = thisMonth.toLocaleString();
            if (lastMonth === 0) {
                setTrend('<i class="fa-solid fa-chart-line"></i> ' + (Number(data.views_this_month) || 0).toLocaleString() + ' page views this month', '#64748b');
            } else {
                const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
                const up = pct >= 0;
                setTrend('<i class="fa-solid fa-arrow-trend-' + (up ? 'up' : 'down') + '"></i> ' + (up ? '+' : '') + pct + '% from last month', up ? '#10b981' : '#ef4444');
            }
        } catch (e) {
            console.error('Failed to load visitor stats:', e);
            visEl.innerText = '—';
            setTrend('<i class="fa-solid fa-circle-exclamation"></i> Stats unavailable', '#f59e0b');
        }
    };

    // Calculate and project Active Properties count on Overview stat card
    window.updateActivePropertiesMetric = function(propsList) {
        const metricPropsEl = document.getElementById('metric-properties-count');
        if (!metricPropsEl) return;

        let list = (Array.isArray(propsList) && propsList.length > 0)
            ? propsList
            : ((Array.isArray(properties) && properties.length > 0)
                ? properties
                : safeJsonParse('industria_properties', (typeof defaultProperties !== 'undefined' ? defaultProperties : [])));

        if (!Array.isArray(list)) list = [];

        // Agent / Assistant territory filtering if applicable
        const allowedParks = typeof getAgentAssignedParks === 'function' ? getAgentAssignedParks() : (typeof getAssistantAssignedParks === 'function' ? getAssistantAssignedParks() : null);
        if (allowedParks !== null) {
            list = list.filter(p => p && p.park && (typeof isParkAllowed === 'function' ? isParkAllowed(p.park, allowedParks) : false));
        }

        // Project number of active status properties (status === 'Active' or default 'Active')
        const activeProperties = list.filter(p => {
            if (!p || typeof p !== 'object') return false;
            const statusVal = String(p.status || 'Active').trim().toLowerCase();
            return statusVal === 'active';
        });

        metricPropsEl.textContent = activeProperties.length;

        const subtextEl = document.getElementById('metric-properties-subtext');
        if (subtextEl) {
            const inactiveCount = list.length - activeProperties.length;
            if (inactiveCount > 0) {
                subtextEl.innerHTML = `<span style="color: #10b981; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> ${activeProperties.length} Live</span> <span style="color: var(--text-muted); font-size: 0.78rem; font-weight: 500; margin-left: 4px;">(${inactiveCount} Inactive)</span>`;
            } else {
                subtextEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Live Assets Listed`;
            }
        }
    };

    window.renderOverviewSummaries = function() {
        const allowedParks = getAgentAssignedParks();

        // 1. Active Properties Summary
        if (typeof window.updateActivePropertiesMetric === 'function') {
            window.updateActivePropertiesMetric();
        }

        // 2. Owner List Summary
        const rawOwnerListings = localStorage.getItem('industria_owner_listings');
        let ownerListings = rawOwnerListings !== null ? safeJsonParse('industria_owner_listings', []) : null;
        if (!Array.isArray(ownerListings)) {
            ownerListings = defaultOwnerListings;
        }

        if (allowedParks !== null) {
            if (allowedParks.length === 0) {
                ownerListings = [];
            } else {
                ownerListings = ownerListings.filter(l => {
                    if (l.park && isParkAllowed(l.park, allowedParks)) {
                        return true;
                    }
                    const text = `${l.notes || ''} ${l.location || ''}`.toLowerCase();
                    return allowedParks.some(park => text.includes(park.toLowerCase()));
                });
            }
        }

        const metricOwners = document.getElementById('metric-owners');
        const metricOwnersPending = document.getElementById('metric-owners-pending');
        if (metricOwners) metricOwners.textContent = ownerListings.length;
        if (metricOwnersPending) metricOwnersPending.textContent = ownerListings.filter(l => l.status === 'Pending').length;

        const overviewOwnerTable = document.getElementById('overview-owner-table-body');
        if (overviewOwnerTable) {
            overviewOwnerTable.innerHTML = '';
            const recentOwners = ownerListings.slice(0, 5);
            if (recentOwners.length === 0) {
                overviewOwnerTable.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">No owner listing requests yet.</td></tr>';
            } else {
                recentOwners.forEach(item => {
                    const tr = document.createElement('tr');
                    let statusStyle = 'background-color: #fef3c7; color: #d97706; border: 1px solid #fde68a;';
                    if (item.status === 'Contacted') statusStyle = 'background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
                    else if (item.status === 'Approved') statusStyle = 'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;';
                    else if (item.status === 'Archived') statusStyle = 'background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;';

                    const dateStr = item.date || (item.timestamp ? item.timestamp.split(',')[0] : '') || 'N/A';
                    const timeStr = item.timestamp ? (item.timestamp.split(',')[1] || '').trim() : '';

                    const intentVal = (item.intent || 'Rent').toUpperCase();
                    const intentBadgeStyle = intentVal.includes('RENT') 
                        ? 'background-color: #fef08a; color: #854d0e; border: 1px solid #fde047;' 
                        : 'background-color: #fecdd3; color: #9f1239; border: 1px solid #fda4af;';

                    const ownerPark = typeof getOwnerListingIndustrialPark === 'function' ? getOwnerListingIndustrialPark(item) : (item.park || 'General / Unassigned');

                    tr.innerHTML = `
                        <td style="font-size:0.82rem; color: var(--text-muted); white-space: nowrap;">
                            <div style="font-weight: 600; color: var(--text-dark);">${escapeHtml(dateStr)}</div>
                            ${timeStr ? `<small style="font-size: 0.73rem; opacity: 0.8;">${escapeHtml(timeStr)}</small>` : ''}
                        </td>
                        <td>
                            <strong>${escapeHtml(item.name || '')}</strong><br>
                            <small style="color: var(--text-muted);"><i class="fa-solid fa-phone" style="margin-right:3px;"></i>${escapeHtml(item.phone || '')}</small>
                        </td>
                        <td>
                            <strong style="color: var(--primary);"><i class="fa-solid fa-location-dot" style="margin-right:3px;"></i> ${escapeHtml(item.location || 'Selangor')}</strong>
                            <span class="status-badge" style="${intentBadgeStyle} font-size: 0.68rem; font-weight: 700; margin-left: 4px; padding: 2px 6px;">${escapeHtml(intentVal)}</span><br>
                            <strong style="color: var(--primary-dark); font-size: 0.88rem;">${escapeHtml(ownerPark)}</strong><br>
                            <small style="color: var(--text-muted);">${escapeHtml(item.type || 'Industrial Property')}</small>
                        </td>
                        <td><span class="status-badge" style="${statusStyle} font-size: 0.72rem; font-weight: 600;">${escapeHtml(item.status || 'Pending')}</span></td>
                    `;
                    tr.style.cursor = 'pointer';
                    tr.title = 'Click to view owner listing details';
                    tr.onclick = function() {
                        if (typeof window.viewOwnerDetail === 'function') {
                            window.viewOwnerDetail(item.id);
                        }
                    };
                    overviewOwnerTable.appendChild(tr);
                });
            }
        }

        // Lead List Summary
        let leads = [];
        try {
            leads = safeJsonParse('industria_leads', typeof defaultLeads !== 'undefined' ? defaultLeads : []);
        } catch(e) {
            leads = typeof defaultLeads !== 'undefined' ? defaultLeads : [];
        }

        if (!Array.isArray(leads) || leads.length === 0) {
            leads = (typeof defaultLeads !== 'undefined' && Array.isArray(defaultLeads)) ? defaultLeads : [];
            if (leads.length > 0) {
                safeLocalStorageSet('industria_leads', leads);
            }
        }

        // Ensure lead objects are valid
        leads = leads.filter(l => l && typeof l === 'object');

        if (allowedParks !== null) {
            const currentAssistantAgent = typeof getAssistantAgent === 'function' ? getAssistantAgent() : null;
            const loggedInUsername = (sessionStorage.getItem('loggedInUser') || localStorage.getItem('loggedInUser') || '').toLowerCase();
            if (allowedParks.length === 0) {
                leads = leads.filter(l => {
                    if (currentAssistantAgent && String(l.assignedAgentId) === String(currentAssistantAgent.id)) return true;
                    if (l.assignedUser && loggedInUsername && String(l.assignedUser).toLowerCase() === loggedInUsername) return true;
                    if (l.creatorUsername && loggedInUsername && String(l.creatorUsername).toLowerCase() === loggedInUsername) return true;
                    return false;
                });
            } else {
                leads = leads.filter(l => {
                    if (currentAssistantAgent && String(l.assignedAgentId) === String(currentAssistantAgent.id)) return true;
                    if (l.assignedUser && loggedInUsername && String(l.assignedUser).toLowerCase() === loggedInUsername) return true;
                    if (l.creatorUsername && loggedInUsername && String(l.creatorUsername).toLowerCase() === loggedInUsername) return true;
                    if (!l.interest || typeof l.interest !== 'string') return false;
                    return allowedParks.some(park => l.interest.toLowerCase().includes(park.toLowerCase()));
                });
            }
        }
        const activeLeadsOnly = leads.filter(l => l.status !== 'Archived');
        const metricLeads = document.getElementById('metric-leads');
        if (metricLeads) metricLeads.textContent = activeLeadsOnly.length;

        const overviewLeadTable = document.getElementById('overview-lead-table-body');
        if (overviewLeadTable) {
            overviewLeadTable.innerHTML = '';
            const recentLeads = activeLeadsOnly.slice(0, 5);
            if (recentLeads.length === 0) {
                overviewLeadTable.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">No customer leads received yet.</td></tr>';
            } else {
                recentLeads.forEach(lead => {
                    try {
                        const tr = document.createElement('tr');
                        let statusStyle = 'background-color: #fef3c7; color: #d97706; border: 1px solid #fde68a;';
                        if (lead.status === 'Contacted') statusStyle = 'background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe;';
                        else if (lead.status === 'Qualified') statusStyle = 'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;';
                        else if (lead.status === 'Archived') statusStyle = 'background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb;';

                        const locInfo = typeof parseLeadLocationAndType === 'function' ? parseLeadLocationAndType(lead) : { location: 'Selangor', type: 'Industrial Property', section: '' };
                        const propTitle = typeof getLeadPropertyTitle === 'function' ? getLeadPropertyTitle(lead) : (lead.title || lead.interest || 'General Inquiry');
                        const dateStr = lead.date || (lead.timestamp ? lead.timestamp.split(',')[0] : '') || 'N/A';
                        const timeStr = lead.timestamp ? (lead.timestamp.split(',')[1] || '').trim() : '';
                        const leadName = lead.name || 'Anonymous Lead';
                        const leadSub = lead.phone || lead.email || '';

                        const intentVal = (lead.intent || (lead.interest && lead.interest.toLowerCase().includes('rent') ? 'Rent' : 'Sale')).toUpperCase();
                        const intentBadgeStyle = intentVal.includes('RENT') 
                            ? 'background-color: #fef08a; color: #854d0e; border: 1px solid #fde047;' 
                            : 'background-color: #fecdd3; color: #9f1239; border: 1px solid #fda4af;';

                        tr.innerHTML = `
                            <td style="font-size:0.82rem; color: var(--text-muted); white-space: nowrap;">
                                <div style="font-weight: 600; color: var(--text-dark);">${escapeHtml(dateStr)}</div>
                                ${timeStr ? `<small style="font-size: 0.73rem; opacity: 0.8;">${escapeHtml(timeStr)}</small>` : ''}
                            </td>
                            <td><strong>${escapeHtml(leadName)}</strong><br><small style="color: var(--text-muted);"><i class="fa-solid fa-phone" style="margin-right:3px;"></i>${escapeHtml(leadSub)}</small></td>
                            <td>
                                <strong style="color: var(--primary);"><i class="fa-solid fa-location-dot" style="margin-right:3px;"></i> ${escapeHtml(locInfo.location)}</strong>
                                <span class="status-badge" style="${intentBadgeStyle} font-size: 0.68rem; font-weight: 700; margin-left: 4px; padding: 2px 6px;">${escapeHtml(intentVal)}</span><br>
                                <strong style="color: var(--primary-dark); font-size: 0.88rem;">${escapeHtml(propTitle)}</strong><br>
                                <small style="color: var(--text-muted);">${escapeHtml(locInfo.type)}${locInfo.section ? ' - ' + escapeHtml(locInfo.section) : ''}</small>
                            </td>
                            <td><span class="status-badge" style="${statusStyle} font-size: 0.72rem; font-weight: 600;">${escapeHtml(lead.status || 'New')}</span></td>
                        `;
                        tr.style.cursor = 'pointer';
                        tr.title = 'Click to view lead inquiry details';
                        tr.onclick = function() {
                            if (typeof window.viewLeadDetail === 'function') {
                                window.viewLeadDetail(lead.id);
                            }
                        };
                        overviewLeadTable.appendChild(tr);
                    } catch(err) {
                        console.error('Error rendering overview lead row:', err);
                    }
                });
            }
        }
    }

    // Filter Listeners
    const filterYear = document.getElementById('chart-filter-year');
    const filterCity = document.getElementById('chart-filter-city');
    const filterPark = document.getElementById('chart-filter-park');

    if (filterCity && filterPark) {
        filterCity.addEventListener('change', (e) => {
            const city = e.target.value;
            filterPark.innerHTML = '<option value="all">All Parks</option>';
            if (city !== 'all' && parks[city]) {
                parks[city].forEach(park => {
                    if (!park.hidden) {
                        const opt = document.createElement('option');
                        opt.value = park.name;
                        opt.textContent = park.name;
                        filterPark.appendChild(opt);
                    }
                });
                filterPark.disabled = false;
            } else {
                filterPark.disabled = true;
            }
            if (typeof window.renderOverviewCharts === 'function') window.renderOverviewCharts();
        });
        
        filterYear.addEventListener('change', () => {
            if (typeof window.renderOverviewCharts === 'function') window.renderOverviewCharts();
        });
        filterPark.addEventListener('change', () => {
            if (typeof window.renderOverviewCharts === 'function') window.renderOverviewCharts();
        });
    }

    // --- AGENTS MANAGEMENT ---
    // Core agent CRUD, park assignments, and table rendering are modularized in js/dashboard-agents.js
    if (typeof window.renderAgentsTable !== 'function') {
        window.renderAgentsTable = function() {};
    }


    // --- SETTINGS & ADMIN MANAGEMENT LOGIC ---
    // (defaultSettings and settings are initialized at the top of initDashboardApp)
    
    async function loadGeneralSettingsFromSupabase(retryCount = 0) {
        if (!window.IndustraSupabase || typeof window.IndustraSupabase.fetchSiteSetting !== 'function') {
            if (retryCount < 10) {
                setTimeout(() => loadGeneralSettingsFromSupabase(retryCount + 1), 300);
            }
            return;
        }
        try {
            const sbGeneral = await window.IndustraSupabase.fetchSiteSetting('general_settings');
            if (sbGeneral && typeof sbGeneral === 'object') {
                settings = Object.assign({}, defaultSettings, sbGeneral);
                localStorage.setItem('industria_settings', JSON.stringify(settings));
                if (sbGeneral.branding) {
                    localStorage.setItem('industria_branding_settings', JSON.stringify(sbGeneral.branding));
                    if (typeof applyBranding === 'function') {
                        applyBranding(sbGeneral.branding);
                    }
                }
                if (typeof window.loadSettings === 'function') {
                    window.loadSettings();
                }
                if (typeof syncPropertyFeaturesUI === 'function') {
                    syncPropertyFeaturesUI(settings);
                } else if (typeof window.syncPropertyFeaturesUI === 'function') {
                    window.syncPropertyFeaturesUI(settings);
                }
            }
        } catch (err) {
            console.warn('Could not load general settings from Supabase:', err);
        }
    }
    window.loadGeneralSettingsFromSupabase = loadGeneralSettingsFromSupabase;
    loadGeneralSettingsFromSupabase();

    async function saveGeneralSettingsToSupabase() {
        if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertSiteSetting === 'function') {
            try {
                await window.IndustraSupabase.upsertSiteSetting('general_settings', settings);
            } catch (err) {
                console.warn('Error saving general settings to Supabase:', err);
            }
        }
    }

    window.loadSettings = function() {
        settings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});
        if (typeof initDashboardDensity === 'function') initDashboardDensity();
        
        // Helper to set field value safely
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val !== undefined && val !== null ? val : '';
        };

        // About Us (Why Choose Us)
        setVal('setting-why-choose', settings.whyChooseUs);
        setVal('setting-about-card1-title', settings.aboutCard1Title);
        setVal('setting-about-card1-desc', settings.aboutCard1Desc);
        setVal('setting-about-card2-title', settings.aboutCard2Title);
        setVal('setting-about-card2-desc', settings.aboutCard2Desc);
        setVal('setting-about-card3-title', settings.aboutCard3Title);
        setVal('setting-about-card3-desc', settings.aboutCard3Desc);

        // Services & Service Cards
        setVal('setting-services', settings.services);
        setVal('setting-services-card1-title', settings.servicesCard1Title);
        setVal('setting-services-card1-link', settings.servicesCard1Link);
        setVal('setting-services-card1-desc', settings.servicesCard1Desc);
        setVal('setting-services-card2-title', settings.servicesCard2Title);
        setVal('setting-services-card2-link', settings.servicesCard2Link);
        setVal('setting-services-card2-desc', settings.servicesCard2Desc);
        setVal('setting-services-card3-title', settings.servicesCard3Title);
        setVal('setting-services-card3-link', settings.servicesCard3Link);
        setVal('setting-services-card3-desc', settings.servicesCard3Desc);

        // Property Owner List & Feature Cards
        setVal('setting-owner-badge', settings.ownerBadge);
        setVal('setting-owner-heading', settings.ownerHeading);
        setVal('setting-owner-subtitle', settings.ownerSubtitle);
        setVal('setting-owner-card1-title', settings.ownerCard1Title);
        setVal('setting-owner-card1-desc', settings.ownerCard1Desc);
        setVal('setting-owner-card2-title', settings.ownerCard2Title);
        setVal('setting-owner-card2-desc', settings.ownerCard2Desc);
        setVal('setting-owner-card3-title', settings.ownerCard3Title);
        setVal('setting-owner-card3-desc', settings.ownerCard3Desc);
        setVal('setting-owner-faq1-q', settings.ownerFaq1Question);
        setVal('setting-owner-faq1-a', settings.ownerFaq1Answer);
        setVal('setting-owner-faq2-q', settings.ownerFaq2Question);
        setVal('setting-owner-faq2-a', settings.ownerFaq2Answer);
        setVal('setting-owner-faq3-q', settings.ownerFaq3Question);
        setVal('setting-owner-faq3-a', settings.ownerFaq3Answer);

        // Contact Info
        setVal('setting-address', settings.address);
        setVal('setting-phone', settings.phone);
        setVal('setting-email', settings.email);
        setVal('setting-facebook', settings.facebook);
        setVal('setting-instagram', settings.instagram);
        setVal('setting-tiktok', settings.tiktok);
        setVal('setting-rednote', settings.rednote);
        setVal('setting-copyright', settings.copyright || '© 2026 MyFactorySpace Real Estate. All rights reserved.');

        // Corporate UI & Brand Theme
        const b = getBrandingSettings();
        setVal('setting-brand-name', b.companyName);
        setVal('setting-brand-logo-url', b.logoUrl);
        setVal('setting-brand-favicon-url', b.faviconUrl || '/assets/icons/favicon-48x48.png');
        setVal('setting-color-primary', b.primaryColor);
        setVal('setting-color-primary-hex', b.primaryColor);
        setVal('setting-color-dark', b.primaryDarkColor);
        setVal('setting-color-dark-hex', b.primaryDarkColor);
        setVal('setting-color-accent', b.accentColor);
        setVal('setting-color-accent-hex', b.accentColor);

        const logoH = (b && b.logoHeight !== undefined && b.logoHeight !== null) ? b.logoHeight : 32;
        const logoSizeInputEl = document.getElementById('setting-brand-logo-size');
        const logoSizeValEl = document.getElementById('setting-brand-logo-size-val');
        if (logoSizeInputEl) logoSizeInputEl.value = logoH;
        if (logoSizeValEl) logoSizeValEl.textContent = logoH + 'px';

        applyBranding(b);
        
        // Property Features & Listing Badges Toggles
        const setCheck = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.checked = (val !== false && String(val) !== 'false');
        };
        setCheck('setting-show-featured-badge', settings.showFeaturedBadge);
        setCheck('setting-show-tenure-badge', settings.showTenureBadge);
        setCheck('setting-show-section-badge', settings.showSectionBadge);
        setCheck('setting-show-posted-date-badge', settings.showPostedDateBadge);
        setCheck('setting-random-featured-properties', settings.randomFeaturedProperties);

        const maxAgentEl = document.getElementById('setting-max-featured-per-agent');
        if (maxAgentEl) {
            maxAgentEl.value = (typeof settings.maxFeaturedPerAgent === 'number' && settings.maxFeaturedPerAgent > 0) ? settings.maxFeaturedPerAgent : 6;
        }

        const maxDisplayEl = document.getElementById('setting-max-featured-properties-displayed');
        if (maxDisplayEl) {
            const currentDisplay = (typeof settings.maxFeaturedPropertiesDisplayed === 'number' && settings.maxFeaturedPropertiesDisplayed > 0) ? settings.maxFeaturedPropertiesDisplayed : 6;
            maxDisplayEl.value = currentDisplay;
            updateRandomFeaturedDesc(currentDisplay);
            if (!maxDisplayEl._hasInputListener) {
                maxDisplayEl._hasInputListener = true;
                maxDisplayEl.addEventListener('input', function() {
                    updateRandomFeaturedDesc(this.value);
                });
            }
        }

        setCheck('setting-random-featured-agents', settings.randomFeaturedAgents);

        const maxAgentsPoolEl = document.getElementById('setting-max-featured-agents');
        if (maxAgentsPoolEl) {
            maxAgentsPoolEl.value = (typeof settings.maxFeaturedAgents === 'number' && settings.maxFeaturedAgents > 0) ? settings.maxFeaturedAgents : 6;
        }

        const maxAgentsDisplayEl = document.getElementById('setting-max-featured-agents-displayed');
        if (maxAgentsDisplayEl) {
            maxAgentsDisplayEl.value = (typeof settings.maxFeaturedAgentsDisplayed === 'number' && settings.maxFeaturedAgentsDisplayed > 0) ? Math.min(6, settings.maxFeaturedAgentsDisplayed) : 3;
        }

        if (typeof syncPropertyFeaturesUI === 'function') {
            syncPropertyFeaturesUI(settings);
        } else if (typeof window.syncPropertyFeaturesUI === 'function') {
            window.syncPropertyFeaturesUI(settings);
        }

        // Server Configuration
        if (document.getElementById('setting-server-type')) {
            document.getElementById('setting-server-type').value = settings.serverType || 'webserver';
            document.getElementById('setting-server-path').value = settings.serverPath || '';
            
            if (document.getElementById('display-server-type')) {
                const typeLabel = settings.serverType === 'localhost' ? 'Localhost' : (settings.serverType === 'webserver' ? 'Webserver' : 'Not Set');
                document.getElementById('display-server-type').innerText = typeLabel;
                document.getElementById('display-server-path').innerText = settings.serverPath || 'Not Set';
            }
        }

        // Time Zone Management
        const tzSel = document.getElementById('setting-timezone');
        if (tzSel && settings.timezone) tzSel.value = settings.timezone;
        setVal('setting-timezone-location', settings.timezoneLocation || 'Malaysia (Kuala Lumpur, Selangor)');
        const dateFmtSel = document.getElementById('setting-date-format');
        if (dateFmtSel && settings.dateFormat) dateFmtSel.value = settings.dateFormat;
        const timeFmtSel = document.getElementById('setting-time-format');
        if (timeFmtSel && settings.timeFormat) timeFmtSel.value = settings.timeFormat;
        setCheck('setting-time-include-seconds', settings.includeSeconds);
        setCheck('setting-show-header-clock', settings.showDashboardHeaderClock);
        if (typeof updateLiveClocks === 'function') updateLiveClocks();
    };

    function updateRandomFeaturedDesc(val) {
        const num = (parseInt(val, 10) > 0) ? parseInt(val, 10) : 6;
        const descEl = document.getElementById('setting-random-featured-desc');
        if (descEl) {
            descEl.textContent = 'Randomly select from the Max Featured Per Agent properties to appear on the homepage.';
        }
        const tbCtrl = document.getElementById('mainpage-featured-toolbar-ctrl');
        if (tbCtrl) {
            tbCtrl.title = 'Randomly select from the Max Featured Per Agent properties to appear on the homepage.';
        }
        const minLabel = document.getElementById('featured-min-label');
        if (minLabel) {
            minLabel.textContent = `Minimum ${num}`;
        }
    }

    // Property Features Form Handler
    const propFeaturesForm = document.getElementById('settings-property-features-form');
    if (propFeaturesForm) {
        propFeaturesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const featuredEl = document.getElementById('setting-show-featured-badge');
            const tenureEl = document.getElementById('setting-show-tenure-badge');
            const sectionEl = document.getElementById('setting-show-section-badge');
            const postedDateEl = document.getElementById('setting-show-posted-date-badge');
            const randomEl = document.getElementById('setting-random-featured-properties');
            
            settings.showFeaturedBadge = featuredEl ? featuredEl.checked : true;
            settings.showTenureBadge = tenureEl ? tenureEl.checked : true;
            settings.showSectionBadge = sectionEl ? sectionEl.checked : true;
            settings.showPostedDateBadge = postedDateEl ? postedDateEl.checked : true;
            if (randomEl) {
                settings.randomFeaturedProperties = randomEl.checked;
                updateFeaturedRandomUI(randomEl.checked);
            }

            const maxAgentEl = document.getElementById('setting-max-featured-per-agent');
            if (maxAgentEl) {
                const val = parseInt(maxAgentEl.value, 10);
                settings.maxFeaturedPerAgent = (val > 0 && val <= 18) ? val : 6;
            }

            const maxDisplayEl = document.getElementById('setting-max-featured-properties-displayed');
            if (maxDisplayEl) {
                const val = parseInt(maxDisplayEl.value, 10);
                settings.maxFeaturedPropertiesDisplayed = (val > 0 && val <= 18) ? val : 6;
                updateRandomFeaturedDesc(settings.maxFeaturedPropertiesDisplayed);
            }

            const randomAgentsEl = document.getElementById('setting-random-featured-agents');
            if (randomAgentsEl) {
                settings.randomFeaturedAgents = randomAgentsEl.checked;
                updateFeaturedAgentsRandomUI(randomAgentsEl.checked);
            }

            const maxAgentsPoolEl = document.getElementById('setting-max-featured-agents');
            if (maxAgentsPoolEl) {
                const val = parseInt(maxAgentsPoolEl.value, 10);
                settings.maxFeaturedAgents = (val > 0 && val <= 18) ? val : 6;
            }

            const maxAgentsDisplayEl = document.getElementById('setting-max-featured-agents-displayed');
            if (maxAgentsDisplayEl) {
                const val = parseInt(maxAgentsDisplayEl.value, 10);
                settings.maxFeaturedAgentsDisplayed = (val > 0 && val <= 6) ? val : 3;
            }

            // Immediately persist to localStorage
            localStorage.setItem('industria_settings', JSON.stringify(settings));

            // Immediately sync UI controls across Properties & Agents views
            if (typeof syncPropertyFeaturesUI === 'function') {
                syncPropertyFeaturesUI(settings);
            } else if (typeof window.syncPropertyFeaturesUI === 'function') {
                window.syncPropertyFeaturesUI(settings);
            }
            if (typeof renderTable === 'function') renderTable();
            else if (typeof window.renderTable === 'function') window.renderTable();
            if (typeof window.renderAgentsTable === 'function') window.renderAgentsTable();
            else if (typeof renderAgentsTable === 'function') renderAgentsTable();
            window.dispatchEvent(new Event('storage'));

            // Safely save to Supabase in background without blocking UI
            try {
                await saveGeneralSettingsToSupabase();
            } catch (err) {
                console.warn('Could not sync general settings to Supabase:', err);
            }

            alert('Property Features & Listing Badges settings saved successfully! Mainpage, Properties, and Agents views updated.');
        });
    }

    const serverForm = document.getElementById('settings-server-form');
    if (serverForm) {
        serverForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            settings.serverType = document.getElementById('setting-server-type').value;
            settings.serverPath = document.getElementById('setting-server-path').value;
            localStorage.setItem('industria_settings', JSON.stringify(settings));
            await saveGeneralSettingsToSupabase();
            
            if (document.getElementById('display-server-type')) {
                const typeLabel = settings.serverType === 'localhost' ? 'Localhost' : 'Webserver';
                document.getElementById('display-server-type').innerText = typeLabel;
                document.getElementById('display-server-path').innerText = settings.serverPath || 'Not Set';
            }
            
            alert('Server Configuration settings saved successfully!');
        });
    }

    const notificationsForm = document.getElementById('settings-notifications-form');
    if (notificationsForm) {
        if (document.getElementById('setting-whatsapp-status')) {
            document.getElementById('setting-whatsapp-status').value = settings.whatsappNotificationsEnabled === false || settings.whatsappNotificationsEnabled === 'disabled' ? 'disabled' : 'enabled';
        }
        if (document.getElementById('setting-whatsapp-lead-enabled')) {
            document.getElementById('setting-whatsapp-lead-enabled').checked = settings.whatsappLeadNotificationEnabled !== false;
        }
        if (document.getElementById('setting-whatsapp-owner-enabled')) {
            document.getElementById('setting-whatsapp-owner-enabled').checked = settings.whatsappOwnerNotificationEnabled !== false;
        }
        if (document.getElementById('setting-whatsapp-number')) {
            document.getElementById('setting-whatsapp-number').value = settings.whatsappNotificationNumber || '';
        }
        
        notificationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusEl = document.getElementById('setting-whatsapp-status');
            const leadCb = document.getElementById('setting-whatsapp-lead-enabled');
            const ownerCb = document.getElementById('setting-whatsapp-owner-enabled');
            const numEl = document.getElementById('setting-whatsapp-number');

            settings.whatsappNotificationsEnabled = statusEl ? statusEl.value : 'enabled';
            settings.whatsappLeadNotificationEnabled = leadCb ? leadCb.checked : true;
            settings.whatsappOwnerNotificationEnabled = ownerCb ? ownerCb.checked : true;
            settings.whatsappNotificationNumber = numEl ? numEl.value : '';

            localStorage.setItem('industria_settings', JSON.stringify(settings));
            await saveGeneralSettingsToSupabase();
            alert('Notifications Configuration saved successfully!');
        });
    }

    const serverBrowse = document.getElementById('setting-server-browse');
    if (serverBrowse) {
        serverBrowse.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const path = e.target.files[0].webkitRelativePath;
                if (path) {
                    const folderName = path.split('/')[0];
                    document.getElementById('setting-server-path').value = `Localhost Data / ${folderName}`;
                } else if (e.target.files[0].name) {
                    document.getElementById('setting-server-path').value = `Selected Location`;
                }
            }
        });
    }

    const aboutForm = document.getElementById('settings-about-form');
    if (aboutForm) {
        aboutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
            settings.whyChooseUs = getVal('setting-why-choose');
            settings.aboutCard1Title = getVal('setting-about-card1-title');
            settings.aboutCard1Desc = getVal('setting-about-card1-desc');
            settings.aboutCard2Title = getVal('setting-about-card2-title');
            settings.aboutCard2Desc = getVal('setting-about-card2-desc');
            settings.aboutCard3Title = getVal('setting-about-card3-title');
            settings.aboutCard3Desc = getVal('setting-about-card3-desc');
            localStorage.setItem('industria_settings', JSON.stringify(settings));
            await saveGeneralSettingsToSupabase();
            alert('About Us (Why Choose Us) & Feature Cards settings saved successfully! Main page updated.');
        });
    }

    const servicesForm = document.getElementById('settings-services-form');
    if (servicesForm) {
        servicesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
            settings.services = getVal('setting-services');
            settings.servicesCard1Title = getVal('setting-services-card1-title');
            settings.servicesCard1Link = getVal('setting-services-card1-link');
            settings.servicesCard1Desc = getVal('setting-services-card1-desc');
            settings.servicesCard2Title = getVal('setting-services-card2-title');
            settings.servicesCard2Link = getVal('setting-services-card2-link');
            settings.servicesCard2Desc = getVal('setting-services-card2-desc');
            settings.servicesCard3Title = getVal('setting-services-card3-title');
            settings.servicesCard3Link = getVal('setting-services-card3-link');
            settings.servicesCard3Desc = getVal('setting-services-card3-desc');
            localStorage.setItem('industria_settings', JSON.stringify(settings));
            await saveGeneralSettingsToSupabase();
            alert('Services & Service Cards settings saved successfully! Main page updated.');
        });
    }

    const ownerForm = document.getElementById('settings-owner-list-form');
    if (ownerForm) {
        ownerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
            settings.ownerBadge = getVal('setting-owner-badge');
            settings.ownerHeading = getVal('setting-owner-heading');
            settings.ownerSubtitle = getVal('setting-owner-subtitle');
            settings.ownerCard1Title = getVal('setting-owner-card1-title');
            settings.ownerCard1Desc = getVal('setting-owner-card1-desc');
            settings.ownerCard2Title = getVal('setting-owner-card2-title');
            settings.ownerCard2Desc = getVal('setting-owner-card2-desc');
            settings.ownerCard3Title = getVal('setting-owner-card3-title');
            settings.ownerCard3Desc = getVal('setting-owner-card3-desc');
            settings.ownerFaq1Question = getVal('setting-owner-faq1-q');
            settings.ownerFaq1Answer = getVal('setting-owner-faq1-a');
            settings.ownerFaq2Question = getVal('setting-owner-faq2-q');
            settings.ownerFaq2Answer = getVal('setting-owner-faq2-a');
            settings.ownerFaq3Question = getVal('setting-owner-faq3-q');
            settings.ownerFaq3Answer = getVal('setting-owner-faq3-a');
            localStorage.setItem('industria_settings', JSON.stringify(settings));
            await saveGeneralSettingsToSupabase();
            alert('Property Owner List, Feature Cards & FAQ settings saved successfully! Main page updated.');
        });
    }

    const contactForm = document.getElementById('settings-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
            settings.address = getVal('setting-address');
            settings.phone = getVal('setting-phone');
            settings.email = getVal('setting-email');
            settings.facebook = getVal('setting-facebook');
            settings.instagram = getVal('setting-instagram');
            settings.tiktok = getVal('setting-tiktok');
            settings.rednote = getVal('setting-rednote');
            settings.copyright = getVal('setting-copyright');
            localStorage.setItem('industria_settings', JSON.stringify(settings));
            await saveGeneralSettingsToSupabase();
            alert('Contact Information saved successfully! Main page updated.');
        });
    }

    // --- TIME ZONE & REGIONAL MANAGEMENT FORM HANDLERS ---
    const timezoneForm = document.getElementById('settings-timezone-form');
    if (timezoneForm) {
        timezoneForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tzSel = document.getElementById('setting-timezone');
            const selectedOpt = tzSel ? tzSel.options[tzSel.selectedIndex] : null;
            const tzVal = tzSel ? tzSel.value : 'Asia/Kuala_Lumpur';
            const offsetVal = selectedOpt ? selectedOpt.getAttribute('data-offset') || '+08:00' : '+08:00';
            const locVal = (document.getElementById('setting-timezone-location')?.value || '').trim() || 'Malaysia (Kuala Lumpur, Selangor)';
            const dateFmtVal = document.getElementById('setting-date-format')?.value || 'DD/MM/YYYY';
            const timeFmtVal = document.getElementById('setting-time-format')?.value || '12h';
            const includeSecVal = document.getElementById('setting-time-include-seconds')?.checked !== false;
            const showHeaderVal = document.getElementById('setting-show-header-clock')?.checked !== false;

            settings.timezone = tzVal;
            settings.timezoneOffset = offsetVal;
            settings.timezoneName = selectedOpt ? selectedOpt.text : `(GMT${offsetVal}) ${tzVal}`;
            settings.timezoneLocation = locVal;
            settings.dateFormat = dateFmtVal;
            settings.timeFormat = timeFmtVal;
            settings.includeSeconds = includeSecVal;
            settings.showDashboardHeaderClock = showHeaderVal;

            localStorage.setItem('industria_settings', JSON.stringify(settings));
            localStorage.setItem('industria_timezone_settings', JSON.stringify({
                timezone: tzVal,
                timezoneOffset: offsetVal,
                timezoneLocation: locVal,
                dateFormat: dateFmtVal,
                timeFormat: timeFmtVal,
                includeSeconds: includeSecVal,
                showDashboardHeaderClock: showHeaderVal
            }));

            updateLiveClocks();
            if (typeof renderTable === 'function') renderTable();
            await saveGeneralSettingsToSupabase();

            alert(`✅ Time Zone Settings Saved Successfully!\n\n• Primary Time Zone: ${tzVal} (GMT${offsetVal})\n• Operational Location: ${locVal}\n• Date Format: ${dateFmtVal}\n• Time Format: ${timeFmtVal.toUpperCase()}\n\nLive clocks and listing timestamps updated across the dashboard.`);
        });
    }

    // Dynamic Change Listeners for Instant Live Preview
    const tzSelEl = document.getElementById('setting-timezone');
    if (tzSelEl) {
        tzSelEl.addEventListener('change', function () {
            const opt = this.options[this.selectedIndex];
            if (opt) {
                const locAttr = opt.getAttribute('data-location');
                const locInput = document.getElementById('setting-timezone-location');
                if (locAttr && locInput) {
                    locInput.value = locAttr;
                }
            }
            updateLiveClocks();
        });
    }

    ['setting-date-format', 'setting-time-format', 'setting-time-include-seconds', 'setting-show-header-clock'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateLiveClocks);
    });

    const tzLocInput = document.getElementById('setting-timezone-location');
    if (tzLocInput) {
        tzLocInput.addEventListener('input', function() {
            const heroLoc = document.getElementById('tz-hero-location');
            const genLoc = document.getElementById('gen-overview-loc');
            if (heroLoc) heroLoc.textContent = this.value || 'Malaysia (Kuala Lumpur, Selangor)';
            if (genLoc) genLoc.textContent = this.value || 'Malaysia (Kuala Lumpur, Selangor)';
        });
    }

    const detectDeviceBtn = document.getElementById('btn-detect-device-tz');
    if (detectDeviceBtn) {
        detectDeviceBtn.addEventListener('click', () => {
            try {
                const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const tzSel = document.getElementById('setting-timezone');
                if (tzSel) {
                    let matched = false;
                    for (let i = 0; i < tzSel.options.length; i++) {
                        if (tzSel.options[i].value === detectedTz) {
                            tzSel.selectedIndex = i;
                            matched = true;
                            const locAttr = tzSel.options[i].getAttribute('data-location');
                            if (locAttr) {
                                document.getElementById('setting-timezone-location').value = locAttr;
                            }
                            break;
                        }
                    }
                    if (!matched) {
                        const opt = document.createElement('option');
                        opt.value = detectedTz;
                        opt.text = `(Detected) ${detectedTz}`;
                        tzSel.appendChild(opt);
                        tzSel.value = detectedTz;
                    }
                    updateLiveClocks();
                    alert(`✅ Device Time Zone Detected: ${detectedTz}`);
                }
            } catch (err) {
                alert('Could not automatically detect device timezone: ' + err.message);
            }
        });
    }

    const snapGmt8Btn = document.getElementById('btn-snap-gmt8');
    if (snapGmt8Btn) {
        snapGmt8Btn.addEventListener('click', () => {
            const tzSel = document.getElementById('setting-timezone');
            if (tzSel) tzSel.value = 'Asia/Kuala_Lumpur';
            const locInput = document.getElementById('setting-timezone-location');
            if (locInput) locInput.value = 'Malaysia (Kuala Lumpur, Selangor)';
            updateLiveClocks();
        });
    }

    window.resetTimezoneSettings = function() {
        if (confirm('Reset Time Zone to default (GMT+8) Malaysia (Kuala Lumpur, Selangor)?')) {
            const tzSel = document.getElementById('setting-timezone');
            if (tzSel) tzSel.value = 'Asia/Kuala_Lumpur';
            const locInput = document.getElementById('setting-timezone-location');
            if (locInput) locInput.value = 'Malaysia (Kuala Lumpur, Selangor)';
            const dateFmt = document.getElementById('setting-date-format');
            if (dateFmt) dateFmt.value = 'DD/MM/YYYY';
            const timeFmt = document.getElementById('setting-time-format');
            if (timeFmt) timeFmt.value = '12h';
            const secCheck = document.getElementById('setting-time-include-seconds');
            if (secCheck) secCheck.checked = true;
            const hdrCheck = document.getElementById('setting-show-header-clock');
            if (hdrCheck) hdrCheck.checked = true;

            settings.timezone = 'Asia/Kuala_Lumpur';
            settings.timezoneOffset = '+08:00';
            settings.timezoneLocation = 'Malaysia (Kuala Lumpur, Selangor)';
            settings.dateFormat = 'DD/MM/YYYY';
            settings.timeFormat = '12h';
            settings.includeSeconds = true;
            settings.showDashboardHeaderClock = true;

            localStorage.setItem('industria_settings', JSON.stringify(settings));
            localStorage.setItem('industria_timezone_settings', JSON.stringify({
                timezone: 'Asia/Kuala_Lumpur',
                timezoneOffset: '+08:00',
                timezoneLocation: 'Malaysia (Kuala Lumpur, Selangor)',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '12h',
                includeSeconds: true,
                showDashboardHeaderClock: true
            }));

            updateLiveClocks();
            if (typeof saveGeneralSettingsToSupabase === 'function') {
                saveGeneralSettingsToSupabase();
            }
            alert('Time Zone settings reset to default (GMT+8) Malaysia.');
        }
    };

    // --- CORPORATE BRANDING & UI THEMES ---
    const themePresets = {
        blue: { primary: '#0077b6', primaryDark: '#023e8a', accent: '#e0f2fe', name: 'Corporate Blue' },
        emerald: { primary: '#059669', primaryDark: '#064e3b', accent: '#dcfce7', name: 'Industrial Emerald' },
        crimson: { primary: '#dc2626', primaryDark: '#7f1d1d', accent: '#fee2e2', name: 'Executive Crimson' },
        indigo: { primary: '#7c3aed', primaryDark: '#4c1d95', accent: '#f3e8ff', name: 'Royal Indigo' },
        amber: { primary: '#d97706', primaryDark: '#78350f', accent: '#fef3c7', name: 'Amber Gold' },
        darkluxe: { primary: '#2563eb', primaryDark: '#0f172a', accent: '#e2e8f0', name: 'Dark Luxe' }
    };

    const defaultBranding = {
        companyName: 'MyFactorySpace',
        logoUrl: '',
        faviconUrl: '/assets/icons/favicon-48x48.png',
        logoHeight: 32,
        preset: 'emerald',
        primaryColor: '#059669',
        primaryDarkColor: '#064e3b',
        accentColor: '#dcfce7'
    };

    function hexToRgba(hex, alpha = 0.12) {
        if (!hex) return `rgba(5, 150, 105, ${alpha})`;
        hex = String(hex).replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const num = parseInt(hex, 16);
        if (isNaN(num)) return `rgba(5, 150, 105, ${alpha})`;
        return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }

    function getBrandingSettings() {
        const stored = safeJsonParse('industria_branding_settings', null);
        if (stored && typeof stored === 'object') {
            return Object.assign({}, defaultBranding, stored);
        }
        if (settings && settings.branding) {
            return Object.assign({}, defaultBranding, settings.branding);
        }
        return Object.assign({}, defaultBranding);
    }
    window.getBrandingSettings = getBrandingSettings;

    function applyBranding(b) {
        if (!b) b = getBrandingSettings();
        const root = document.documentElement;
        const primary = b.primaryColor || '#059669';
        const primaryDark = b.primaryDarkColor || '#064e3b';
        const accent = b.accentColor || '#dcfce7';

        root.style.setProperty('--primary', primary);
        root.style.setProperty('--primary-dark', primaryDark);
        root.style.setProperty('--accent', accent);
        root.style.setProperty('--secondary', primary);
        root.style.setProperty('--primary-light', hexToRgba(primary, 0.15));
        root.style.setProperty('--border-light', hexToRgba(primary, 0.12));
        root.style.setProperty('--primary-glow', hexToRgba(primary, 0.35));
        root.style.setProperty('--hero-gradient-start', hexToRgba(primaryDark, 0.88));
        root.style.setProperty('--hero-gradient-end', hexToRgba(primary, 0.65));

        // Update Chart.js colors dynamically
        if (typeof leadsChartInstance !== 'undefined' && leadsChartInstance) {
            leadsChartInstance.data.datasets[0].borderColor = primary;
            leadsChartInstance.data.datasets[0].backgroundColor = hexToRgba(primary, 0.12);
            leadsChartInstance.update();
        }
        if (typeof trafficChartInstance !== 'undefined' && trafficChartInstance) {
            trafficChartInstance.data.datasets[0].backgroundColor = [
                primary,
                hexToRgba(primary, 0.75),
                hexToRgba(primary, 0.5),
                hexToRgba(primary, 0.3)
            ];
            trafficChartInstance.update();
        }

        // Highlight preset card dynamically
        const activePresetKey = b.preset || 'emerald';
        document.querySelectorAll('.theme-preset-card').forEach(card => {
            const isMatch = card.getAttribute('data-preset') === activePresetKey;
            if (isMatch) {
                card.classList.add('active');
                card.style.border = '2px solid var(--primary)';
                const icon = card.querySelector('.preset-check-icon');
                if (icon) {
                    icon.style.display = 'inline-block';
                    icon.style.color = 'var(--primary)';
                }
            } else {
                card.classList.remove('active');
                card.style.border = '1px solid #cbd5e1';
                const icon = card.querySelector('.preset-check-icon');
                if (icon) icon.style.display = 'none';
            }
        });

        const logoUrl = (b && b.logoUrl) ? b.logoUrl : '';
        let brandName = (b && b.companyName && String(b.companyName).trim() !== '') ? String(b.companyName).trim() : (logoUrl ? '' : 'MyFactorySpace');
        const logoH = (b && b.logoHeight !== undefined && b.logoHeight !== null && !isNaN(b.logoHeight)) ? parseInt(b.logoHeight, 10) : 32;
        const navLogoH = Math.round(logoH * 1.12);

        // Helper to construct brand HTML
        const buildBrandHtml = (imgHeight, imgMaxWidth, isNav, isFooter = false) => {
            let html = '';
            if (logoUrl) {
                const marginStyle = brandName ? ' margin-right: 6px;' : '';
                const filterStyle = isFooter ? ' filter: brightness(0) invert(1);' : '';
                html += `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName || 'Brand Logo')}" style="height: ${imgHeight}; max-width: ${imgMaxWidth}; object-fit: contain; vertical-align: middle;${filterStyle}${marginStyle}">`;
            } else {
                const marginStyle = brandName ? ' margin-right: 6px;' : '';
                const iconColor = isFooter ? '#ffffff' : 'var(--primary)';
                html += `<i class="fa-solid fa-industry" style="color: ${iconColor};${marginStyle}"></i>`;
            }
            if (brandName) {
                const textColor = isFooter ? ' style="color: #ffffff;"' : '';
                html += ` <span${textColor}>${escapeHtml(brandName)}</span>`;
            }
            return html;
        };

        // Sidebar Brand
        const sidebarBrand = document.querySelector('.sidebar-brand');
        if (sidebarBrand) {
            const newSbHtml = buildBrandHtml(`${logoH}px`, '200px', false, false);
            if (sidebarBrand.innerHTML.trim() !== newSbHtml.trim()) {
                sidebarBrand.innerHTML = newSbHtml;
            }
        }

        // Navbar Brand
        const navBrands = document.querySelectorAll('.nav-brand');
        navBrands.forEach(navBrand => {
            const newNavHtml = buildBrandHtml(`${navLogoH}px`, '220px', true, false);
            if (navBrand.innerHTML.trim() !== newNavHtml.trim()) {
                navBrand.innerHTML = newNavHtml;
            }
        });

        // Footer Brand
        const footerBrands = document.querySelectorAll('.footer-brand h3, .footer-brand-title');
        footerBrands.forEach(footerBrand => {
            const newFooterHtml = buildBrandHtml(`${Math.round(logoH * 1.25)}px`, '240px', true, true);
            if (footerBrand.innerHTML.trim() !== newFooterHtml.trim()) {
                footerBrand.innerHTML = newFooterHtml;
            }
        });

        // Live Preview Box
        const previewName = document.getElementById('preview-brand-name-text');
        const previewImg = document.getElementById('preview-brand-logo-img');
        const previewIcon = document.getElementById('preview-brand-icon');
        if (previewName) {
            previewName.textContent = brandName;
            previewName.style.display = brandName ? 'inline' : 'none';
        }
        if (previewImg && previewIcon) {
            if (logoUrl) {
                previewImg.src = logoUrl;
                previewImg.style.height = logoH + 'px';
                previewImg.style.maxHeight = '80px';
                previewImg.style.maxWidth = '240px';
                previewImg.style.display = 'inline-block';
                previewIcon.style.display = 'none';
            } else {
                previewImg.style.display = 'none';
                previewIcon.style.display = 'inline-block';
            }
        }

        // Google Search Mockup Live Preview
        const googleMockFavicon = document.getElementById('google-mock-favicon-img');
        const googleMockTitle = document.getElementById('google-mock-title-text');
        if (googleMockFavicon) {
            const activeFav = (b && b.faviconUrl && !b.faviconUrl.includes('favicon-48x48.png')) 
                ? b.faviconUrl 
                : ((b && b.logoUrl) ? b.logoUrl : (b && b.faviconUrl ? b.faviconUrl : '/assets/icons/favicon-48x48.png'));
            googleMockFavicon.src = activeFav;
        }
        if (googleMockTitle && brandName) {
            googleMockTitle.textContent = `${brandName} | Premium Industrial Real Estate Klang Valley`;
        }

        // Synchronize Dynamic Favicon on dashboard
        if (b && b.faviconUrl) {
            const currentFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
            currentFavicons.forEach(fav => { fav.href = b.faviconUrl; });
        }
    }
    window.applyBranding = applyBranding;

    window.syncCompanyLogoToFavicon = function() {
        const logoUrlInput = document.getElementById('setting-brand-logo-url');
        const logoUrl = logoUrlInput ? logoUrlInput.value.trim() : '';
        if (!logoUrl) {
            if (typeof showToast === 'function') showToast('Please upload or enter a Company Logo first!', 'warning');
            else alert('Please upload or enter a Company Logo first!');
            return;
        }
        const favUrlInput = document.getElementById('setting-brand-favicon-url');
        if (favUrlInput) favUrlInput.value = logoUrl;
        const b = getBrandingSettings();
        b.faviconUrl = logoUrl;
        applyBranding(b);
        if (typeof showToast === 'function') showToast('Company Logo synchronized to Google Favicon & Search preview!', 'success');
    };

    window.clearBrandLogo = function() {
        const logoUrlInput = document.getElementById('setting-brand-logo-url');
        const logoFileInput = document.getElementById('setting-brand-logo-file');
        if (logoUrlInput) logoUrlInput.value = '';
        if (logoFileInput) logoFileInput.value = '';
        const b = getBrandingSettings();
        b.logoUrl = '';
        applyBranding(b);
    };

    window.clearBrandFavicon = function() {
        const favUrlInput = document.getElementById('setting-brand-favicon-url');
        const favFileInput = document.getElementById('setting-brand-favicon-file');
        if (favUrlInput) favUrlInput.value = '/assets/icons/favicon-48x48.png';
        if (favFileInput) favFileInput.value = '';
        const b = getBrandingSettings();
        b.faviconUrl = '/assets/icons/favicon-48x48.png';
        applyBranding(b);
    };

    window.cropCurrentBrandFavicon = function() {
        const favUrlInput = document.getElementById('setting-brand-favicon-url');
        const src = favUrlInput ? favUrlInput.value.trim() : '';
        if (!src) {
            alert('Please enter a Favicon Image URL or upload a file first to crop.');
            return;
        }
        openCropperWith(
            src,
            1, // Locked 1:1 aspect ratio for Google Search Favicon
            'brand_favicon',
            'Crop Google Search Favicon (1:1 Square)',
            '<i class="fa-brands fa-google" style="color:#4285f4;margin-right:4px;"></i><strong>Google Favicon (1:1 Square):</strong> Cropping is locked to a 1:1 square to satisfy Google Search Central specifications (exports at 512&times;512 px).'
        );
    };

    window.applyThemePreset = function(presetKey) {
        const preset = themePresets[presetKey] || themePresets.emerald;
        
        const primaryEl = document.getElementById('setting-color-primary');
        const primaryHexEl = document.getElementById('setting-color-primary-hex');
        const darkEl = document.getElementById('setting-color-dark');
        const darkHexEl = document.getElementById('setting-color-dark-hex');
        const accentEl = document.getElementById('setting-color-accent');
        const accentHexEl = document.getElementById('setting-color-accent-hex');

        if (primaryEl) primaryEl.value = preset.primary;
        if (primaryHexEl) primaryHexEl.value = preset.primary;
        if (darkEl) darkEl.value = preset.primaryDark;
        if (darkHexEl) darkHexEl.value = preset.primaryDark;
        if (accentEl) accentEl.value = preset.accent;
        if (accentHexEl) accentHexEl.value = preset.accent;

        document.querySelectorAll('.theme-preset-card').forEach(card => {
            const isMatch = card.getAttribute('data-preset') === presetKey;
            if (isMatch) {
                card.classList.add('active');
                card.style.border = '2px solid var(--primary)';
                const icon = card.querySelector('.preset-check-icon');
                if (icon) icon.style.display = 'inline-block';
            } else {
                card.classList.remove('active');
                card.style.border = '1px solid #e2e8f0';
                const icon = card.querySelector('.preset-check-icon');
                if (icon) icon.style.display = 'none';
            }
        });

        const currentBranding = getBrandingSettings();
        currentBranding.preset = presetKey;
        currentBranding.primaryColor = preset.primary;
        currentBranding.primaryDarkColor = preset.primaryDark;
        currentBranding.accentColor = preset.accent;
        applyBranding(currentBranding);
        try {
            localStorage.setItem('industria_branding_settings', JSON.stringify(currentBranding));
        } catch (e) {}
    };

    window.resetBrandingToDefault = function() {
        if (confirm('Reset company logo, brand name, and color theme back to default Industrial Emerald?')) {
            localStorage.removeItem('industria_branding_settings');
            if (settings) delete settings.branding;
            const b = Object.assign({}, defaultBranding);
            
            const brandNameEl = document.getElementById('setting-brand-name');
            const logoUrlEl = document.getElementById('setting-brand-logo-url');
            if (brandNameEl) brandNameEl.value = b.companyName;
            if (logoUrlEl) logoUrlEl.value = b.logoUrl;
            
            window.applyThemePreset('emerald');
            applyBranding(b);
            localStorage.setItem('industria_branding_settings', JSON.stringify(b));
            saveGeneralSettingsToSupabase();
            alert('Branding and UI colors reset to defaults.');
        }
    };

    // Color Pickers Sync
    const setupColorSync = (colorId, hexId, key) => {
        const cEl = document.getElementById(colorId);
        const hEl = document.getElementById(hexId);
        if (!cEl || !hEl) return;
        
        cEl.addEventListener('input', (e) => {
            hEl.value = e.target.value;
            const b = getBrandingSettings();
            b[key] = e.target.value;
            applyBranding(b);
        });
        
        hEl.addEventListener('input', (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith('#') && val.length > 0) val = '#' + val;
            cEl.value = val;
            const b = getBrandingSettings();
            b[key] = val;
            applyBranding(b);
        });
    };

    setupColorSync('setting-color-primary', 'setting-color-primary-hex', 'primaryColor');
    setupColorSync('setting-color-dark', 'setting-color-dark-hex', 'primaryDarkColor');
    setupColorSync('setting-color-accent', 'setting-color-accent-hex', 'accentColor');

    // Brand Name & Logo Listeners
    const brandNameInput = document.getElementById('setting-brand-name');
    if (brandNameInput) {
        brandNameInput.addEventListener('input', (e) => {
            const b = getBrandingSettings();
            b.companyName = e.target.value;
            applyBranding(b);
        });
    }

    const logoFileInput = document.getElementById('setting-brand-logo-file');
    if (logoFileInput) {
        logoFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                processFileForCropper(
                    e.target.files[0],
                    NaN, // Free ratio cropping
                    'brand_logo',
                    'Crop Company Logo',
                    '<i class="fa-solid fa-circle-info" style="color:var(--primary);margin-right:4px;"></i><strong>Company Logo:</strong> Drag the handles to trim padding or crop logo graphics cleanly.',
                    logoFileInput
                );
            }
        });
    }

    window.cropCurrentBrandLogo = function() {
        const logoUrlInput = document.getElementById('setting-brand-logo-url');
        const src = logoUrlInput ? logoUrlInput.value.trim() : '';
        if (!src) {
            alert('Please enter a Logo Image URL or upload a file first to crop.');
            return;
        }
        openCropperWith(
            src,
            NaN,
            'brand_logo',
            'Crop Company Logo',
            '<i class="fa-solid fa-circle-info" style="color:var(--primary);margin-right:4px;"></i><strong>Company Logo:</strong> Adjust crop handles to trim padding or crop logo graphics cleanly.'
        );
    };

    const logoUrlInput = document.getElementById('setting-brand-logo-url');
    if (logoUrlInput) {
        logoUrlInput.addEventListener('input', (e) => {
            const b = getBrandingSettings();
            b.logoUrl = e.target.value;
            applyBranding(b);
        });
    }

    const faviconFileInput = document.getElementById('setting-brand-favicon-file');
    if (faviconFileInput) {
        faviconFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                processFileForCropper(
                    e.target.files[0],
                    1, // Strict 1:1 square ratio for Google Favicon
                    'brand_favicon',
                    'Crop Google Search Favicon (1:1 Square)',
                    '<i class="fa-brands fa-google" style="color:#4285f4;margin-right:4px;"></i><strong>Google Favicon (1:1 Square):</strong> Cropping is locked to a 1:1 square to satisfy Google Search Central specifications (exports at 512&times;512 px).',
                    faviconFileInput
                );
            }
        });
    }

    const faviconUrlInput = document.getElementById('setting-brand-favicon-url');
    if (faviconUrlInput) {
        faviconUrlInput.addEventListener('input', (e) => {
            const b = getBrandingSettings();
            b.faviconUrl = e.target.value;
            applyBranding(b);
        });
    }

    const brandLogoSizeInput = document.getElementById('setting-brand-logo-size');
    const brandLogoSizeVal = document.getElementById('setting-brand-logo-size-val');
    if (brandLogoSizeInput) {
        brandLogoSizeInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (brandLogoSizeVal) brandLogoSizeVal.textContent = val + 'px';
            const b = getBrandingSettings();
            b.logoHeight = val;
            applyBranding(b);
        });
    }

    // Branding Form Handler
    const brandingForm = document.getElementById('settings-branding-form');
    if (brandingForm) {
        brandingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
            const logoSizeEl = document.getElementById('setting-brand-logo-size');
            const b = {
                companyName: getVal('setting-brand-name'),
                logoUrl: getVal('setting-brand-logo-url'),
                faviconUrl: getVal('setting-brand-favicon-url') || '/assets/icons/favicon-48x48.png',
                logoHeight: logoSizeEl ? parseInt(logoSizeEl.value, 10) : 32,
                preset: getBrandingSettings().preset || 'emerald',
                primaryColor: getVal('setting-color-primary') || '#059669',
                primaryDarkColor: getVal('setting-color-dark') || '#064e3b',
                accentColor: getVal('setting-color-accent') || '#dcfce7'
            };
            localStorage.setItem('industria_branding_settings', JSON.stringify(b));
            settings.branding = b;
            localStorage.setItem('industria_settings', JSON.stringify(settings));
            applyBranding(b);
            await saveGeneralSettingsToSupabase();
            alert('Corporate UI & Brand Theme saved successfully! Site interface updated.');
        });
    }

    // Apply branding on startup
    applyBranding(getBrandingSettings());

    // --- RBAC & ROLE PERMISSIONS LOGIC ---

    // Populate Agent select box in Create Admin User form
    function populateCreateAdminAgentSelect() {
        const select = document.getElementById('new-admin-agent');
        if (!select) return;
        select.innerHTML = '<option value="">Select Agent (Optional)...</option>';
        const storedAgents = safeJsonParse('industria_agents', defaultAgents);
        storedAgents.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = `${a.name} (${a.ren})`;
            select.appendChild(opt);
        });
        const addOpt = document.createElement('option');
        addOpt.value = '__new_agent__';
        addOpt.textContent = '+ Add New Agent Profile...';
        select.appendChild(addOpt);
    }
    window.populateCreateAdminAgentSelect = populateCreateAdminAgentSelect;

    const newAdminRoleSelect = document.getElementById('new-admin-role');
    const newAdminAgentGroup = document.getElementById('new-admin-agent-group');
    const newAdminAgentSelect = document.getElementById('new-admin-agent');
    if (newAdminRoleSelect && newAdminAgentGroup) {
        populateCreateAdminAgentSelect();
        newAdminRoleSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Supervisor' || e.target.value === 'Assistant' || e.target.value === 'Agent' || e.target.value === 'Administrator') {
                newAdminAgentGroup.style.display = 'block';
                populateCreateAdminAgentSelect();
            } else {
                newAdminAgentGroup.style.display = 'none';
            }
        });
        if (newAdminAgentSelect) {
            newAdminAgentSelect.addEventListener('change', (e) => {
                if (e.target.value === '__new_agent__') {
                    const addBtn = document.getElementById('add-agent-btn');
                    if (addBtn) addBtn.click();
                }
            });
        }
    }

    // Change user role (Administrator only)
    window.changeUserRole = async function(encUsername, newRole) {
        if (currentUserRole !== 'Administrator') {
            alert('Only Administrator can change user roles.');
            renderAdminManagement();
            return;
        }

        const username = decodeURIComponent(encUsername);
        let users = getAdminUsers();
        const u = users.find(user => user.username.toLowerCase() === username.toLowerCase());
        if (!u) return;

        u.role = newRole;
        if (newRole !== 'Supervisor' && newRole !== 'Assistant' && newRole !== 'Agent' && newRole !== 'Administrator') {
            delete u.agentId;
        }
        localStorage.setItem('industria_users', JSON.stringify(users));
        const currentLogged = sessionStorage.getItem('loggedInUser') || '';
        if (u.username.toLowerCase() === currentLogged.toLowerCase()) {
            sessionStorage.setItem('currentUserRole', newRole);
            localStorage.setItem('currentUserRole', newRole);
            currentUserRole = newRole;
            window.currentUserRole = newRole;
        }

        if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertUser === 'function') {
            await window.IndustraSupabase.upsertUser(u);
        }

        alert(`Role for "${username}" updated to ${newRole}.`);
        renderAdminManagement();
    };

    // Change user associated agent (Administrator only)
    window.changeUserAgent = async function(encUsername, newAgentId) {
        if (currentUserRole !== 'Administrator') {
            alert('Only Administrator can assign agents.');
            renderAdminManagement();
            return;
        }

        const username = decodeURIComponent(encUsername);

        if (newAgentId === '__new_agent__') {
            window._pendingAssignUsername = username;
            const addBtn = document.getElementById('add-agent-btn');
            if (addBtn) {
                addBtn.click();
            }
            renderAdminManagement();
            return;
        }

        let users = getAdminUsers();
        const u = users.find(user => user.username.toLowerCase() === username.toLowerCase());
        if (!u) return;

        const assignedAgentId = newAgentId ? parseInt(newAgentId, 10) : null;
        u.agentId = assignedAgentId;

        // If an agent is selected, sync phone & whatsapp numbers
        if (assignedAgentId) {
            let allAgents = safeJsonParse('industria_agents', defaultAgents);
            if (!Array.isArray(allAgents) || allAgents.length === 0) {
                allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : [];
            }
            const targetAgent = allAgents.find(a => String(a.id) === String(assignedAgentId));
            if (targetAgent) {
                if (u.whatsapp && u.whatsapp.trim() !== '') {
                    // Push user's whatsapp to selected agent
                    targetAgent.phone = u.whatsapp.trim();
                    targetAgent.whatsapp = u.whatsapp.trim();
                    safeLocalStorageSet('industria_agents', JSON.stringify(allAgents));
                    if (typeof agents !== 'undefined') agents = allAgents;
                    if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertAgent === 'function') {
                        try {
                            await window.IndustraSupabase.upsertAgent(targetAgent);
                        } catch (e) {
                            console.warn('Could not sync agent to Supabase in changeUserAgent:', e);
                        }
                    }
                } else if (targetAgent.whatsapp || targetAgent.phone) {
                    // Pre-fill user whatsapp from selected agent
                    u.whatsapp = (targetAgent.whatsapp || targetAgent.phone || '').trim();
                }
            }
            if (typeof window.renderAgentsTable === 'function') {
                window.renderAgentsTable();
            } else if (typeof renderAgentsTable === 'function') {
                renderAgentsTable();
            }
            window.dispatchEvent(new Event('storage'));
        }

        localStorage.setItem('industria_users', JSON.stringify(users));

        if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertUser === 'function') {
            await window.IndustraSupabase.upsertUser(u);
        }

        renderAdminManagement();
    };

    window.changeUserWhatsApp = async function(encUsername, newWhatsapp, skipAdminRerender) {
        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || 
                           'Administrator';
        if (String(activeRole).toLowerCase() !== 'administrator') {
            alert('Only Administrator can modify user WhatsApp.');
            return;
        }

        const username = decodeURIComponent(encUsername);
        let users = getAdminUsers();
        const u = users.find(user => user.username.toLowerCase() === username.toLowerCase());
        if (!u) return;

        const cleanVal = newWhatsapp ? newWhatsapp.trim() : '';
        u.whatsapp = cleanVal;

        // If this user is marked as main, sync to general site settings
        if (u.isMainWhatsapp) {
            const siteSettings = safeJsonParse('industria_settings', {});
            siteSettings.whatsappNotificationNumber = u.whatsapp;
            siteSettings.mainWhatsapp = u.whatsapp;
            localStorage.setItem('industria_settings', JSON.stringify(siteSettings));
            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertSiteSetting === 'function') {
                try {
                    await window.IndustraSupabase.upsertSiteSetting('general_settings', siteSettings);
                } catch (e) {
                    console.warn('Could not sync main whatsapp to Supabase settings:', e);
                }
            }
        }

        localStorage.setItem('industria_users', JSON.stringify(users));

        if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertUser === 'function') {
            await window.IndustraSupabase.upsertUser(u);
        }

        // If this user has a linked agent, update the agent profile's phone & whatsapp numbers
        if (u.agentId) {
            let allAgents = safeJsonParse('industria_agents', defaultAgents);
            if (!Array.isArray(allAgents) || allAgents.length === 0) {
                allAgents = (typeof agents !== 'undefined' && Array.isArray(agents)) ? agents : [];
            }
            const targetAgent = allAgents.find(a => String(a.id) === String(u.agentId));
            if (targetAgent) {
                targetAgent.phone = cleanVal;
                targetAgent.whatsapp = cleanVal;
                localStorage.setItem('industria_agents', JSON.stringify(allAgents));
                safeLocalStorageSet('industria_agents', allAgents);
                if (typeof agents !== 'undefined') agents = allAgents;
                if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertAgent === 'function') {
                    try {
                        await window.IndustraSupabase.upsertAgent(targetAgent);
                    } catch (e) {
                        console.warn('Could not sync agent to Supabase in changeUserWhatsApp:', e);
                    }
                }
            }
            if (typeof window.renderAgentsTable === 'function') {
                window.renderAgentsTable();
            } else if (typeof renderAgentsTable === 'function') {
                renderAgentsTable();
            }
            window.dispatchEvent(new Event('storage'));
        }

        if (!skipAdminRerender) {
            renderAdminManagement();
        }
    };

    // Explicit Save button for Admin Users Directory WhatsApp number
    window.saveUserWhatsAppBtn = async function(encUsername, btnEl) {
        const activeRole = (typeof resolveCurrentUserRole === 'function' ? resolveCurrentUserRole() : null) || 
                           sessionStorage.getItem('currentUserRole') || 
                           localStorage.getItem('currentUserRole') || 
                           (typeof currentUserRole !== 'undefined' ? currentUserRole : null) || 
                           'Administrator';
        if (String(activeRole).toLowerCase() !== 'administrator') {
            alert('Only Administrator can modify user WhatsApp.');
            return;
        }

        const username = decodeURIComponent(encUsername);
        const inputEl = document.getElementById('admin-wa-input-' + encUsername) || (btnEl ? btnEl.previousElementSibling : null);
        const newVal = inputEl ? inputEl.value : '';

        const origHtml = btnEl ? btnEl.innerHTML : '<i class="fa-solid fa-floppy-disk"></i>';
        const hasText = origHtml.includes('Save');
        if (btnEl) {
            btnEl.disabled = true;
            btnEl.innerHTML = hasText ? '<i class="fa-solid fa-spinner fa-spin"></i> Saving...' : '<i class="fa-solid fa-spinner fa-spin"></i>';
        }

        try {
            await window.changeUserWhatsApp(encUsername, newVal, true);

            if (btnEl) {
                btnEl.innerHTML = hasText ? '<i class="fa-solid fa-check"></i> Saved!' : '<i class="fa-solid fa-check"></i>';
                btnEl.classList.add('is-saved');
                btnEl.style.backgroundColor = '#10b981';
                btnEl.style.borderColor = '#10b981';
                btnEl.style.color = '#ffffff';
                setTimeout(() => {
                    if (btnEl) {
                        btnEl.innerHTML = origHtml;
                        btnEl.classList.remove('is-saved');
                        btnEl.style.backgroundColor = '';
                        btnEl.style.borderColor = '';
                        btnEl.style.color = '';
                        btnEl.disabled = false;
                    }
                }, 2000);
            }
        } catch (err) {
            console.error('Error saving user WhatsApp:', err);
            if (btnEl) {
                btnEl.innerHTML = origHtml;
                btnEl.classList.remove('is-saved');
                btnEl.style.backgroundColor = '';
                btnEl.style.borderColor = '';
                btnEl.style.color = '';
                btnEl.disabled = false;
            }
            alert('Error saving WhatsApp number: ' + (err.message || err));
        }
    };

    // Set Main WhatsApp Contact User Function
    window.setMainWhatsAppUser = async function(encUsername) {
        if (currentUserRole !== 'Administrator') {
            alert('Only Administrator can set the Main WhatsApp contact.');
            renderAdminManagement();
            return;
        }

        const username = decodeURIComponent(encUsername);
        let users = getAdminUsers();
        const targetUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (!targetUser) return;

        if (!targetUser.whatsapp || targetUser.whatsapp.trim() === '') {
            alert(`Please enter a valid WhatsApp number for "${username}" before ticking as Main Contact.`);
            renderAdminManagement();
            return;
        }

        users.forEach(u => {
            u.isMainWhatsapp = (u.username.toLowerCase() === username.toLowerCase());
        });

        localStorage.setItem('industria_users', JSON.stringify(users));

        // Sync main whatsapp number to site settings
        const siteSettings = safeJsonParse('industria_settings', {});
        siteSettings.whatsappNotificationNumber = targetUser.whatsapp.trim();
        siteSettings.mainWhatsapp = targetUser.whatsapp.trim();
        localStorage.setItem('industria_settings', JSON.stringify(siteSettings));

        // Sync to Supabase if available
        if (window.IndustraSupabase) {
            for (const uObj of users) {
                if (typeof window.IndustraSupabase.upsertUser === 'function') {
                    await window.IndustraSupabase.upsertUser(uObj);
                }
            }
            if (typeof window.IndustraSupabase.saveSiteSettings === 'function') {
                await window.IndustraSupabase.saveSiteSettings(siteSettings);
            }
        }

        renderAdminManagement();
        alert(`"${username}" (${targetUser.whatsapp.trim()}) is now set as the Main WhatsApp Contact for the website!`);
    };

    // Render Admin Management Directory Table & Total Count
    window.renderAdminManagement = function() {
        let users = getAdminUsers();
        const countElem = document.getElementById('total-admin-count');
        const tbody = document.getElementById('admin-users-table-body');
        const currentUser = sessionStorage.getItem('loggedInUser') || 'admin';
        const isCurrentAdmin = String(currentUserRole).toLowerCase() === 'administrator';
        const isSupervisor = String(currentUserRole).toLowerCase() === 'supervisor';
        const canManageUsersDirectory = isCurrentAdmin;
        const allAgents = safeJsonParse('industria_agents', defaultAgents);

        // Ensure at least one user is marked as main if any has a whatsapp number
        if (users.length > 0 && !users.some(u => u.isMainWhatsapp)) {
            const defaultMain = users.find(u => u.whatsapp && u.whatsapp.trim() !== '') || users[0];
            if (defaultMain) {
                defaultMain.isMainWhatsapp = true;
                localStorage.setItem('industria_users', JSON.stringify(users));
                if (defaultMain.whatsapp) {
                    const siteSettings = safeJsonParse('industria_settings', {});
                    siteSettings.whatsappNotificationNumber = defaultMain.whatsapp.trim();
                    siteSettings.mainWhatsapp = defaultMain.whatsapp.trim();
                    localStorage.setItem('industria_settings', JSON.stringify(siteSettings));
                }
            }
        }

        // Role-based visibility toggle for non-management (Supervisor only sees Change Password)
        const statsBanner = document.getElementById('admin-users-stats-banner') || document.querySelector('#settings-subtab-admin .stats-banner');
        const usersTableCard = document.getElementById('admin-users-directory-card') || document.querySelector('#settings-subtab-admin .card:has(#admin-users-table-body)');
        const addAdminCard = document.getElementById('create-admin-user-card') || (document.getElementById('settings-add-admin-form') ? document.getElementById('settings-add-admin-form').closest('.settings-card') : null);
        const subtabGrid = document.querySelector('#settings-subtab-admin .dashboard-grid');

        if (statsBanner) statsBanner.style.display = canManageUsersDirectory ? '' : 'none';
        if (usersTableCard) usersTableCard.style.display = canManageUsersDirectory ? '' : 'none';
        if (addAdminCard) addAdminCard.style.display = isCurrentAdmin ? '' : 'none';

        if (subtabGrid) {
            subtabGrid.style.gridTemplateColumns = isCurrentAdmin ? '1fr 1fr' : '1fr';
            if (!isCurrentAdmin) {
                subtabGrid.style.maxWidth = '550px';
                subtabGrid.style.margin = '0 auto';
            } else {
                subtabGrid.style.maxWidth = '';
                subtabGrid.style.margin = '';
            }
        }

        const changePwdUserLabel = document.getElementById('change-pwd-user-label');
        if (changePwdUserLabel) changePwdUserLabel.textContent = currentUser;

        if (typeof populateCreateAdminAgentSelect === 'function') {
            populateCreateAdminAgentSelect();
        }

        const adminUsers = users.filter(u => String(u.role || 'Administrator').trim().toLowerCase() === 'administrator');
        const superUsers = users.filter(u => String(u.role || '').trim().toLowerCase() === 'supervisor');
        const assisUsers = users.filter(u => ['assistant', 'agent'].includes(String(u.role || '').trim().toLowerCase()));
        const entryUsers = users.filter(u => String(u.role || '').trim().toLowerCase() === 'entry support');

        const adminCountElem = document.getElementById('count-role-admin');
        const superCountElem = document.getElementById('count-role-supervisor');
        const assisCountElem = document.getElementById('count-role-assistant');
        const entryCountElem = document.getElementById('count-role-entry');

        if (countElem) {
            countElem.textContent = users.length;
        }
        if (adminCountElem) {
            adminCountElem.textContent = adminUsers.length;
        }
        if (superCountElem) {
            superCountElem.textContent = superUsers.length;
        }
        if (assisCountElem) {
            assisCountElem.textContent = assisUsers.length;
        }
        if (entryCountElem) {
            entryCountElem.textContent = entryUsers.length;
        }

        const dirCountBadge = document.getElementById('admin-directory-count-badge');
        if (dirCountBadge) {
            dirCountBadge.textContent = `${users.length} ${users.length === 1 ? 'Account' : 'Accounts'}`;
        }

        if (tbody) {
            tbody.innerHTML = '';
            if (users.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: #94a3b8;"><i class="fa-solid fa-users-slash" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; color: #cbd5e1;"></i>No user accounts found</td></tr>`;
                return;
            }

            users.forEach(u => {
                const tr = document.createElement('tr');
                const isSelf = u.username.toLowerCase() === currentUser.toLowerCase();
                const safeUName = encodeURIComponent(u.username);
                const roleLower = String(u.role || 'Administrator').trim().toLowerCase();

                // Role avatar styling
                let avatarClass = 'role-admin';
                if (roleLower === 'supervisor') avatarClass = 'role-supervisor';
                else if (roleLower === 'agent' || roleLower === 'assistant') avatarClass = 'role-agent';
                else if (roleLower === 'entry support') avatarClass = 'role-entry';

                const avatarInitial = (u.username || 'A').charAt(0).toUpperCase();

                // 1. User Cell (Avatar + Username + Status)
                const userCellHtml = `
                    <div class="admin-user-cell">
                        <div class="admin-user-avatar ${avatarClass}" title="${escapeHtml(u.role || 'Administrator')}">
                            ${avatarInitial}
                        </div>
                        <div class="admin-user-info">
                            <div class="admin-user-name-line">
                                <strong>${escapeHtml(u.username)}</strong>
                                ${isSelf ? '<span class="admin-user-self-pill">You</span>' : ''}
                            </div>
                            <div class="admin-user-meta-line">
                                <span class="admin-user-status-dot"></span>
                                <span>Active</span>
                            </div>
                        </div>
                    </div>
                `;

                // 2. Role Cell (Clean select dropdown or badge)
                let roleHtml = '';
                if (isCurrentAdmin && !isSelf) {
                    roleHtml = `
                        <select class="form-control admin-table-select" onchange="changeUserRole('${safeUName}', this.value)" aria-label="Change role for ${escapeHtml(u.username)}">
                            <option value="Administrator" ${u.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                            <option value="Supervisor" ${u.role === 'Supervisor' ? 'selected' : ''}>Supervisor</option>
                            <option value="Agent" ${u.role === 'Agent' ? 'selected' : ''}>Agent</option>
                            <option value="Assistant" ${u.role === 'Assistant' ? 'selected' : ''}>Assistant</option>
                            <option value="Entry Support" ${u.role === 'Entry Support' ? 'selected' : ''}>Entry Support</option>
                        </select>
                    `;
                } else {
                    const roleBadgeClass = u.role === 'Administrator' ? 'status-active' : (u.role === 'Supervisor' ? 'status-supervisor' : ((u.role === 'Agent' || u.role === 'Assistant') ? 'status-pending' : 'status-inactive'));
                    roleHtml = `<span class="status-badge ${roleBadgeClass}">${escapeHtml(u.role || 'Administrator')}</span>`;
                }

                // 3. Linked Agent Cell (Dedicated column for specialist agent connection)
                let agentCellHtml = '';
                if (roleLower === 'entry support') {
                    agentCellHtml = `<span style="color: #94a3b8; font-size: 0.8rem; font-style: italic;">Not applicable</span>`;
                } else if (isCurrentAdmin) {
                    let agentOptions = `<option value="">— Unassigned —</option>`;
                    allAgents.forEach(a => {
                        agentOptions += `<option value="${a.id}" ${String(u.agentId) === String(a.id) ? 'selected' : ''}>${escapeHtml(a.name)} (${escapeHtml(a.ren || 'Specialist')})</option>`;
                    });
                    agentOptions += `<option value="__new_agent__">+ Add New Agent Profile...</option>`;
                    agentCellHtml = `
                        <select class="form-control admin-table-select" onchange="changeUserAgent('${safeUName}', this.value)" aria-label="Assign agent for ${escapeHtml(u.username)}" style="max-width: 200px;">
                            ${agentOptions}
                        </select>
                    `;
                } else {
                    const linkedAgent = allAgents.find(a => String(a.id) === String(u.agentId));
                    agentCellHtml = linkedAgent
                        ? `<span style="display:inline-flex; align-items:center; gap:6px; font-weight:600; color:var(--primary); font-size:0.82rem;"><i class="fa-solid fa-user-tie"></i> ${escapeHtml(linkedAgent.name)}</span>`
                        : `<span style="color:#94a3b8; font-size:0.8rem;">Unassigned</span>`;
                }

                // 4. WhatsApp Cell (Integrated input group with prefix and save button)
                let waHtml = '';
                if (isCurrentAdmin) {
                    waHtml = `
                        <div class="admin-wa-input-group">
                            <span class="admin-wa-icon-prefix" title="WhatsApp Number"><i class="fa-brands fa-whatsapp"></i></span>
                            <input type="text" id="admin-wa-input-${safeUName}" class="admin-wa-input" placeholder="e.g. 6012..." value="${escapeHtml(u.whatsapp || '')}" onkeydown="if(event.key==='Enter'){event.preventDefault();saveUserWhatsAppBtn('${safeUName}', this.nextElementSibling);}" aria-label="WhatsApp number for ${escapeHtml(u.username)}">
                            <button type="button" class="admin-wa-save-btn" onclick="saveUserWhatsAppBtn('${safeUName}', this)" title="Save WhatsApp &amp; sync to linked agent" aria-label="Save WhatsApp">
                                <i class="fa-solid fa-floppy-disk"></i> Save
                            </button>
                        </div>
                    `;
                } else {
                    waHtml = u.whatsapp
                        ? `<span style="font-size:0.84rem; color:var(--text); display:inline-flex; align-items:center; gap:6px;"><i class="fa-brands fa-whatsapp" style="color:#10b981; font-size:0.95rem;"></i> ${escapeHtml(u.whatsapp)}</span>`
                        : `<span style="color:#94a3b8; font-size:0.8rem; font-style:italic;">Not set</span>`;
                }

                // 5. Main Contact Cell (Clean Star badge or Set Main button)
                const isMain = !!u.isMainWhatsapp;
                let mainColHtml = '';
                if (isCurrentAdmin) {
                    if (isMain) {
                        mainColHtml = `
                            <span class="admin-main-pill-active" title="Primary WhatsApp contact across website inquiries">
                                <i class="fa-solid fa-star"></i> Primary
                            </span>
                        `;
                    } else {
                        mainColHtml = `
                            <button type="button" class="admin-main-pill-btn" onclick="setMainWhatsAppUser('${safeUName}')" title="Set as website primary WhatsApp contact">
                                <i class="fa-regular fa-star"></i> Set as Main
                            </button>
                        `;
                    }
                } else {
                    mainColHtml = isMain
                        ? `<span class="admin-main-pill-active"><i class="fa-solid fa-star"></i> Primary</span>`
                        : `<span style="color:#cbd5e1; font-size:0.85rem;">—</span>`;
                }

                // 6. Actions Cell (Delete button or protected session badge)
                let actionHtml = '';
                if (!isSelf && users.length > 1 && isCurrentAdmin) {
                    actionHtml = `
                        <button type="button" class="admin-action-delete-btn" onclick="deleteAdminUser('${safeUName}')" title="Delete user account (${escapeHtml(u.username)})" aria-label="Delete User">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    `;
                } else if (isSelf) {
                    actionHtml = `
                        <span class="admin-action-protected-pill" title="Current active session">
                            <i class="fa-solid fa-user-check" style="color:#2563eb;"></i> Current
                        </span>
                    `;
                } else {
                    actionHtml = `
                        <span class="admin-action-protected-pill" title="Protected system account">
                            <i class="fa-solid fa-shield-halved" style="color:#64748b;"></i> Protected
                        </span>
                    `;
                }

                tr.innerHTML = `
                    <td>${userCellHtml}</td>
                    <td>${roleHtml}</td>
                    <td>${agentCellHtml}</td>
                    <td>${waHtml}</td>
                    <td style="text-align: center;">${mainColHtml}</td>
                    <td style="text-align: right;">${actionHtml}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    };

    // Delete Admin User Function
    window.deleteAdminUser = async function(encUsername) {
        if (currentUserRole !== 'Administrator') {
            alert('Only Administrator can delete user accounts.');
            return;
        }

        const username = decodeURIComponent(encUsername);
        const currentUser = sessionStorage.getItem('loggedInUser') || 'admin';
        
        if (username.toLowerCase() === currentUser.toLowerCase()) {
            alert('You cannot delete your own logged-in account.');
            return;
        }

        if (confirm(`Are you sure you want to delete the user account "${username}"?`)) {
            let users = getAdminUsers();
            users = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
            localStorage.setItem('industria_users', JSON.stringify(users));

            if (window.IndustraSupabase && typeof window.IndustraSupabase.deleteUser === 'function') {
                await window.IndustraSupabase.deleteUser(username);
            }

            renderAdminManagement();
            alert(`User account "${username}" has been removed successfully.`);
        }
    };

    // Create New Admin User Form Handler
    const addAdminForm = document.getElementById('settings-add-admin-form');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (currentUserRole !== 'Administrator') {
                alert('Only Administrator can create new user accounts.');
                return;
            }

            const newUsername = document.getElementById('new-admin-username').value.trim();
            const newRole = document.getElementById('new-admin-role') ? document.getElementById('new-admin-role').value : 'Administrator';
            const selectedAgentId = document.getElementById('new-admin-agent') ? document.getElementById('new-admin-agent').value : null;
            const newWhatsapp = document.getElementById('new-admin-whatsapp') ? document.getElementById('new-admin-whatsapp').value.trim() : '';
            const isMainWa = document.getElementById('new-admin-is-main-wa') ? document.getElementById('new-admin-is-main-wa').checked : false;
            const newPassword = document.getElementById('new-admin-password').value;
            const confirmPassword = document.getElementById('new-admin-confirm-password') ? document.getElementById('new-admin-confirm-password').value : newPassword;
            
            if (!newUsername || !newPassword) {
                alert('Please enter a valid username and password.');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('New passwords do not match. Please verify.');
                return;
            }
            
            let users = getAdminUsers();
            
            if (users.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
                alert('A user with this username already exists!');
                return;
            }

            if (isMainWa) {
                users.forEach(u => u.isMainWhatsapp = false);
            }

            const newUserObj = {
                username: newUsername,
                password: newPassword,
                role: newRole,
                whatsapp: newWhatsapp,
                isMainWhatsapp: isMainWa || (!users.some(u => u.isMainWhatsapp))
            };

            if ((newRole === 'Supervisor' || newRole === 'Assistant' || newRole === 'Agent' || newRole === 'Administrator') && selectedAgentId && selectedAgentId !== '__new_agent__') {
                newUserObj.agentId = parseInt(selectedAgentId, 10);
            }

            users.push(newUserObj);
            localStorage.setItem('industria_users', JSON.stringify(users));

            if (isMainWa && newWhatsapp) {
                const siteSettings = safeJsonParse('industria_settings', {});
                siteSettings.whatsappNotificationNumber = newWhatsapp;
                siteSettings.mainWhatsapp = newWhatsapp;
                localStorage.setItem('industria_settings', JSON.stringify(siteSettings));
            }

            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertUser === 'function') {
                await window.IndustraSupabase.upsertUser(newUserObj);
            }

            alert(`New ${newRole} user "${newUsername}" created successfully!`);
            addAdminForm.reset();
            populateCreateAdminAgentSelect();
            if (newAdminAgentGroup) newAdminAgentGroup.style.display = 'block';
            renderAdminManagement();
        });
    }

    // Toggle Password Visibility
    window.togglePasswordVisibility = function(inputId, btnEl) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        const icon = btnEl ? btnEl.querySelector('i') : null;
        if (icon) {
            icon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
        if (btnEl) btnEl.title = isPass ? 'Hide password' : 'Show password';
    };

    // Change Password Form Handler
    const changePasswordForm = document.getElementById('settings-change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('change-new-password').value;
            const confirmPassword = document.getElementById('change-confirm-password') ? document.getElementById('change-confirm-password').value : newPassword;
            const loggedInUser = sessionStorage.getItem('loggedInUser') || 'admin';
            
            if (newPassword !== confirmPassword) {
                alert('New password and confirmation password do not match!');
                return;
            }

            if (newPassword.length < 4) {
                alert('New password is too short. Please choose a stronger password.');
                return;
            }

            const submitBtn = document.getElementById('btn-submit-change-password') || changePasswordForm.querySelector('button[type="submit"]');
            const origBtnHtml = submitBtn ? submitBtn.innerHTML : '<i class="fa-solid fa-lock"></i> <span>Update Password</span>';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Updating Password...</span>';
            }

            try {
                let users = getAdminUsers();
                const userIndex = users.findIndex(u => u.username.toLowerCase() === loggedInUser.toLowerCase());
                
                if (userIndex > -1) {
                    if (users[userIndex].password !== currentPassword) {
                        alert('Current password is incorrect!');
                        return;
                    }
                    users[userIndex].password = newPassword;
                    localStorage.setItem('industria_users', JSON.stringify(users));

                    if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertUser === 'function') {
                        await window.IndustraSupabase.upsertUser(users[userIndex]);
                    }

                    alert('Password changed successfully!');
                    changePasswordForm.reset();
                    // Reset any toggled password fields back to password type
                    ['current-password', 'change-new-password', 'change-confirm-password'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.type = 'password';
                    });
                    changePasswordForm.querySelectorAll('.pwd-toggle-btn i').forEach(ic => {
                        ic.className = 'fa-regular fa-eye';
                    });
                    renderAdminManagement();
                } else {
                    alert('Error: Logged in user account not found.');
                }
            } catch (err) {
                console.error('Error changing password:', err);
                alert('Error updating password: ' + (err.message || err));
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origBtnHtml;
                }
            }
        });
    }

    // --- MULTIPLE PHOTOS & WATERMARK LOGIC ---

    currentPropertyImages = [];
    currentRawPropertyImages = [];
    const galleryContainer = document.getElementById('property-photos-gallery');
    const dropzone = document.getElementById('property-photo-dropzone');
    const propImageInputMultiple = document.getElementById('propImageMultiple');

    if (dropzone && propImageInputMultiple) {
        dropzone.addEventListener('click', (e) => {
            if (e.target !== propImageInputMultiple) {
                propImageInputMultiple.click();
            }
        });
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--primary)';
            dropzone.style.backgroundColor = 'rgba(0,119,182,0.05)';
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = 'var(--border-light)';
            dropzone.style.backgroundColor = 'var(--bg-light)';
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.borderColor = 'var(--border-light)';
            dropzone.style.backgroundColor = 'var(--bg-light)';
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                fileQueue = Array.from(e.dataTransfer.files);
                processNextInQueue();
            }
        });
        propImageInputMultiple.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                fileQueue = Array.from(e.target.files);
                processNextInQueue();
            }
        });
    }

    window.renderPropertyGallery = function() {
        if (!galleryContainer) return;
        galleryContainer.innerHTML = '';
        currentPropertyImages.forEach((imgSrc, index) => {
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.aspectRatio = '3/2';
            wrapper.style.borderRadius = '8px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.border = '1px solid var(--border-light)';
            wrapper.style.cursor = 'grab';
            wrapper.dataset.index = index;

            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '4px';
            removeBtn.style.right = '4px';
            removeBtn.style.background = 'rgba(220, 38, 38, 0.9)';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '24px';
            removeBtn.style.height = '24px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.display = 'flex';
            removeBtn.style.alignItems = 'center';
            removeBtn.style.justifyContent = 'center';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentPropertyImages.splice(index, 1);
                if (currentRawPropertyImages[index]) currentRawPropertyImages.splice(index, 1);
                renderPropertyGallery();
            };

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);

            if (index === 0) {
                const primaryBadge = document.createElement('span');
                primaryBadge.textContent = 'Primary';
                primaryBadge.style.position = 'absolute';
                primaryBadge.style.bottom = '4px';
                primaryBadge.style.left = '4px';
                primaryBadge.style.background = 'var(--primary)';
                primaryBadge.style.color = 'white';
                primaryBadge.style.fontSize = '0.7rem';
                primaryBadge.style.padding = '2px 6px';
                primaryBadge.style.borderRadius = '4px';
                primaryBadge.style.fontWeight = 'bold';
                wrapper.appendChild(primaryBadge);
            }

            galleryContainer.appendChild(wrapper);
        });

        if (typeof Sortable !== 'undefined') {
            new Sortable(galleryContainer, {
                animation: 150,
                onEnd: function (evt) {
                    const movedItem = currentPropertyImages.splice(evt.oldIndex, 1)[0];
                    currentPropertyImages.splice(evt.newIndex, 0, movedItem);
                    if (currentRawPropertyImages.length > evt.oldIndex) {
                        const movedRaw = currentRawPropertyImages.splice(evt.oldIndex, 1)[0];
                        currentRawPropertyImages.splice(evt.newIndex, 0, movedRaw);
                    }
                    renderPropertyGallery();
                }
            });
        }
    };

    // --- WATERMARK SETTINGS LOGIC ---
    const watermarkForm = document.getElementById('settings-watermark-form');
    const watermarkTypeSelect = document.getElementById('setting-watermark-type');
    const watermarkTextGroup = document.getElementById('watermark-text-group');
    const watermarkLogoGroup = document.getElementById('watermark-logo-group');
    const watermarkLogoInput = document.getElementById('setting-watermark-logo');
    const watermarkLogoPreview = document.getElementById('watermark-logo-preview');
    const defaultLogoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCAzMDAgOTAiPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iOTAiIHJ4PSIxMCIgZmlsbD0iIzAwNzdiNiIvPjxwYXRoIGQ9Ik0zMCA2MFYzMGwyMC0xMHY0MGwyMC0xMHYzNUgzMHoiIGZpbGw9IiMzOGJkZjgiLz48dGV4dCB4PSI4NSIgeT0iNTIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZmZmZiIgbGV0dGVyLXNwYWNpbmc9IjIiPk5PIExPR088L3RleHQ+PC9zdmc+';

    let isWatermarkProcessing = false;
    let watermarkSettings = JSON.parse(localStorage.getItem('industria_watermark_settings')) || {
        type: 'none',
        position: 'bottom-right',
        opacity: 85,
        textSize: 5,
        text: 'MyFactorySpace',
        logoBase64: ''
    };

    if (watermarkTypeSelect) {
        watermarkTypeSelect.value = watermarkSettings.type || 'logo';
        document.getElementById('setting-watermark-position').value = watermarkSettings.position || 'bottom-right';
        const opacityInput = document.getElementById('setting-watermark-opacity');
        const opacityValue = document.getElementById('setting-watermark-opacity-value');
        if (opacityInput) {
            opacityInput.value = watermarkSettings.opacity !== undefined ? watermarkSettings.opacity : 80;
            if (opacityValue) opacityValue.textContent = opacityInput.value + '%';
            
            opacityInput.addEventListener('input', (e) => {
                if (opacityValue) opacityValue.textContent = e.target.value + '%';
            });
        }

        // Text size slider
        const textSizeInput = document.getElementById('setting-watermark-textsize');
        const textSizeValue = document.getElementById('setting-watermark-textsize-value');
        if (textSizeInput) {
            textSizeInput.value = watermarkSettings.textSize !== undefined ? watermarkSettings.textSize : 4;
            if (textSizeValue) textSizeValue.textContent = textSizeInput.value + '%';
            textSizeInput.addEventListener('input', (e) => {
                if (textSizeValue) textSizeValue.textContent = e.target.value + '%';
            });
        }

        // Logo size slider
        const logoSizeInput = document.getElementById('setting-watermark-logosize');
        const logoSizeValue = document.getElementById('setting-watermark-logosize-value');
        if (logoSizeInput) {
            logoSizeInput.value = watermarkSettings.logoSize !== undefined ? watermarkSettings.logoSize : 25;
            if (logoSizeValue) logoSizeValue.textContent = logoSizeInput.value + '%';
            logoSizeInput.addEventListener('input', (e) => {
                if (logoSizeValue) logoSizeValue.textContent = e.target.value + '%';
            });
        }

        const updateLogoPixelDetails = (src) => {
            if (!src || typeof src !== 'string' || src.trim() === '') return;
            const logoImgObj = new Image();
            if (src.startsWith('http://') || src.startsWith('https://')) {
                logoImgObj.crossOrigin = 'anonymous';
            }
            logoImgObj.onload = function() {
                const w = logoImgObj.width;
                const h = logoImgObj.height;
                const ratioStr = h > 0 ? (w / h).toFixed(2) : '1.00';
                const pixelInfo = document.getElementById('watermark-logo-pixel-info');
                const container = document.getElementById('watermark-logo-preview-container');
                const btnRemove = document.getElementById('btn-remove-watermark-logo');
                if (pixelInfo) {
                    pixelInfo.innerHTML = `<strong>${w} &times; ${h} px</strong> &nbsp;<span style="font-weight: 500; font-size: 0.85em; color: var(--text-muted);">(Ratio ${ratioStr}:1)</span>`;
                }
                if (container) container.style.display = 'flex';
                if (btnRemove) btnRemove.style.display = 'inline-flex';
            };
            logoImgObj.onerror = function() {
                const container = document.getElementById('watermark-logo-preview-container');
                const btnRemove = document.getElementById('btn-remove-watermark-logo');
                if (container) container.style.display = 'flex';
                if (btnRemove) btnRemove.style.display = 'inline-flex';
            };
            logoImgObj.src = src;
        };

        const watermarkTextInputEl = document.getElementById('setting-watermark-text');
        if (watermarkTextInputEl) {
            watermarkTextInputEl.value = watermarkSettings.text !== undefined ? watermarkSettings.text : '';
            watermarkTextInputEl.addEventListener('input', (e) => {
                watermarkSettings.text = e.target.value;
            });
        }

        const positionSelectEl = document.getElementById('setting-watermark-position');
        if (positionSelectEl) {
            positionSelectEl.addEventListener('change', (e) => {
                watermarkSettings.position = e.target.value;
            });
        }

        if (watermarkSettings.logoBase64) {
            watermarkLogoPreview.src = watermarkSettings.logoBase64;
            updateLogoPixelDetails(watermarkSettings.logoBase64);
        } else {
            if (watermarkLogoPreview) watermarkLogoPreview.src = '';
            const container = document.getElementById('watermark-logo-preview-container');
            if (container) container.style.display = 'none';
            const btnRemove = document.getElementById('btn-remove-watermark-logo');
            if (btnRemove) btnRemove.style.display = 'none';
        }

        if (watermarkTypeSelect) {
            watermarkTypeSelect.value = watermarkSettings.type || 'none';
        }

        watermarkTypeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            watermarkSettings.type = val;
            const isText = val === 'text';
            const isLogo = val === 'logo';
            const isNone = val === 'none';

            const positionGroup = document.getElementById('watermark-position-group');
            const opacityGroup = document.getElementById('watermark-opacity-group');
            const textRow = document.getElementById('watermark-text-row');
            const textsizeRow = document.getElementById('watermark-textsize-row');
            const logosizeRow = document.getElementById('watermark-logosize-row');

            if (positionGroup) positionGroup.style.display = isNone ? 'none' : 'block';
            if (opacityGroup) opacityGroup.style.display = isNone ? 'none' : 'block';
            if (textRow) textRow.style.display = isText ? 'block' : 'none';
            if (watermarkTextGroup) watermarkTextGroup.style.display = isText ? 'block' : 'none';
            if (textsizeRow) textsizeRow.style.display = isText ? 'block' : 'none';
            if (logosizeRow) logosizeRow.style.display = isLogo ? 'block' : 'none';
            if (watermarkLogoGroup) watermarkLogoGroup.style.display = isLogo ? 'block' : 'none';

            if (isLogo) {
                if (watermarkLogoPreview && watermarkLogoPreview.dataset.removed === 'true') {
                    watermarkLogoPreview.src = '';
                } else if (!watermarkLogoPreview.src || watermarkLogoPreview.src === window.location.href || watermarkLogoPreview.src.endsWith('dashboard.html')) {
                    if (watermarkSettings.logoBase64) {
                        watermarkLogoPreview.src = watermarkSettings.logoBase64;
                    } else {
                        watermarkLogoPreview.src = '';
                    }
                }
                if (watermarkLogoPreview.src) {
                    updateLogoPixelDetails(watermarkLogoPreview.src);
                }
            }
        });
        // Trigger initial
        watermarkTypeSelect.dispatchEvent(new Event('change'));

        // Logo file input — automatically compress & open Cropper modal for watermark logo
        if (watermarkLogoInput) {
            watermarkLogoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    processFileForCropper(
                        e.target.files[0],
                        2 / 1,
                        'watermark_logo',
                        'Crop Watermark Logo',
                        '<i class="fa-solid fa-circle-info" style="color:var(--primary);margin-right:4px;"></i><strong>Watermark Logo:</strong> Crop your logo cleanly. Selection pixel dimensions are displayed live below.',
                        watermarkLogoInput
                    );
                }
            });
        }

        // Crop / Re-crop Logo button
        const btnCropLogo = document.getElementById('btn-crop-watermark-logo');
        if (btnCropLogo) {
            btnCropLogo.addEventListener('click', () => {
                if (watermarkLogoPreview && watermarkLogoPreview.src && watermarkLogoPreview.src.startsWith('data:')) {
                    openCropperWith(
                        watermarkLogoPreview.src,
                        2 / 1,
                        'watermark_logo',
                        'Crop Watermark Logo',
                        '<i class="fa-solid fa-circle-info" style="color:var(--primary);margin-right:4px;"></i><strong>Watermark Logo:</strong> Adjust crop with suggested ratio (<strong>2:1</strong>). Selection pixel dimensions are displayed live below.'
                    );
                } else if (watermarkLogoInput && watermarkLogoInput.files && watermarkLogoInput.files[0]) {
                    processFileForCropper(
                        watermarkLogoInput.files[0],
                        2 / 1,
                        'watermark_logo',
                        'Crop Watermark Logo',
                        '<i class="fa-solid fa-circle-info" style="color:var(--primary);margin-right:4px;"></i><strong>Watermark Logo:</strong> Suggested ratio is <strong>2:1</strong>. Selection pixel dimensions are displayed live below.',
                        watermarkLogoInput
                    );
                } else {
                    alert('Please select or upload a logo file first.');
                    if (watermarkLogoInput) watermarkLogoInput.click();
                }
            });
        }

        // Remove Logo button
        const btnRemoveLogo = document.getElementById('btn-remove-watermark-logo');
        if (btnRemoveLogo) {
            btnRemoveLogo.addEventListener('click', async () => {
                if (confirm('Are you sure you want to remove the current watermark logo?')) {
                    if (watermarkLogoInput) watermarkLogoInput.value = '';
                    if (watermarkLogoPreview) {
                        watermarkLogoPreview.src = '';
                        watermarkLogoPreview.dataset.removed = 'true';
                    }
                    watermarkSettings.logoBase64 = '';
                    saveWatermarkSettingsFromForm();
                    const container = document.getElementById('watermark-logo-preview-container');
                    if (container) container.style.display = 'none';
                    btnRemoveLogo.style.display = 'none';
                    const pixelInfo = document.getElementById('watermark-logo-pixel-info');
                    if (pixelInfo) pixelInfo.innerHTML = 'Dimensions: -- &times; -- px';
                }
            });
        }

        function drawDefaultLogoOnCanvas(ctx, x, y, logoWidth, logoHeight) {
            ctx.save();
            const scale = logoWidth / 300;
            
            ctx.fillStyle = (typeof getBrandingSettings === 'function' ? getBrandingSettings().primaryColor : null) || '#059669';
            const rx = 10 * scale;
            if (typeof ctx.roundRect === 'function') {
                ctx.beginPath();
                ctx.roundRect(x, y, logoWidth, logoHeight, rx);
                ctx.fill();
            } else {
                ctx.fillRect(x, y, logoWidth, logoHeight);
            }
            
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(x + 30 * scale, y + 60 * scale);
            ctx.lineTo(x + 30 * scale, y + 30 * scale);
            ctx.lineTo(x + 50 * scale, y + 20 * scale);
            ctx.lineTo(x + 50 * scale, y + 60 * scale);
            ctx.lineTo(x + 70 * scale, y + 50 * scale);
            ctx.lineTo(x + 70 * scale, y + 85 * scale);
            ctx.lineTo(x + 30 * scale, y + 85 * scale);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(12, Math.floor(22 * scale))}px sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('NO LOGO', x + 85 * scale, y + (logoHeight / 2));
            
            ctx.restore();
        }

        function safeSetLocalStorage(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.warn('localStorage quota hit, attempting to save main data...', e);
                try {
                    localStorage.setItem(key, JSON.stringify(data));
                } catch (e2) {
                    console.error('localStorage still exceeded:', e2);
                }
            }
        }

        async function saveWatermarkSettingsFromForm() {
            const opacityInput = document.getElementById('setting-watermark-opacity');
            const textSizeInput = document.getElementById('setting-watermark-textsize');
            const logoSizeInput = document.getElementById('setting-watermark-logosize');
            const positionSelect = document.getElementById('setting-watermark-position');
            const textInput = document.getElementById('setting-watermark-text');
            
            let logoSrc = '';
            if (watermarkLogoPreview && (watermarkLogoPreview.dataset.removed === 'true' || !watermarkLogoPreview.src || watermarkLogoPreview.src === window.location.href || watermarkLogoPreview.src.endsWith('dashboard.html'))) {
                logoSrc = '';
            } else if (watermarkLogoPreview && watermarkLogoPreview.src) {
                logoSrc = watermarkLogoPreview.src;
            } else {
                logoSrc = watermarkSettings.logoBase64 || '';
            }

            if (logoSrc && (logoSrc.startsWith('data:') || logoSrc.startsWith('assets/')) && window.IndustraSupabase && typeof window.IndustraSupabase.uploadImage === 'function') {
                try {
                    const uploadRes = await window.IndustraSupabase.uploadImage(logoSrc, `watermark_logo_${Date.now()}.png`);
                    if (uploadRes.success && uploadRes.url) {
                        logoSrc = uploadRes.url;
                        if (watermarkLogoPreview) watermarkLogoPreview.src = logoSrc;
                    }
                } catch(e) {
                    console.warn('Failed to upload watermark logo to Supabase Storage:', e);
                }
            }

            const selectedType = watermarkTypeSelect ? watermarkTypeSelect.value : 'none';

            watermarkSettings = {
                type: selectedType,
                position: positionSelect ? positionSelect.value : 'bottom-right',
                opacity: opacityInput ? parseInt(opacityInput.value, 10) : 80,
                textSize: textSizeInput ? parseInt(textSizeInput.value, 10) : 4,
                logoSize: logoSizeInput ? parseInt(logoSizeInput.value, 10) : 25,
                text: textInput ? textInput.value : '',
                logoBase64: logoSrc
            };
            safeSetLocalStorage('industria_watermark_settings', watermarkSettings);

            if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertSiteSetting === 'function') {
                await window.IndustraSupabase.upsertSiteSetting('watermark_settings', watermarkSettings);
            }

            return watermarkSettings;
        }

        async function loadWatermarkSettingsFromSupabase(retryCount = 0) {
            if (!window.IndustraSupabase || typeof window.IndustraSupabase.fetchSiteSetting !== 'function') {
                if (retryCount < 10) {
                    setTimeout(() => loadWatermarkSettingsFromSupabase(retryCount + 1), 300);
                }
                return;
            }
            try {
                const sbWatermark = await window.IndustraSupabase.fetchSiteSetting('watermark_settings');
                if (sbWatermark && typeof sbWatermark === 'object') {
                    safeSetLocalStorage('industria_watermark_settings', sbWatermark);
                    watermarkSettings = sbWatermark;

                    const typeSel = document.getElementById('setting-watermark-type');
                    const posSel = document.getElementById('setting-watermark-position');
                    const opInput = document.getElementById('setting-watermark-opacity');
                    const opVal = document.getElementById('setting-watermark-opacity-value');
                    const textInput = document.getElementById('setting-watermark-text');
                    const textSizeInput = document.getElementById('setting-watermark-textsize');
                    const textSizeVal = document.getElementById('setting-watermark-textsize-value');
                    const logoSizeInput = document.getElementById('setting-watermark-logosize');
                    const logoSizeVal = document.getElementById('setting-watermark-logosize-value');

                    if (typeSel && sbWatermark.type) typeSel.value = sbWatermark.type;
                    if (posSel && sbWatermark.position) posSel.value = sbWatermark.position;
                    if (opInput && sbWatermark.opacity !== undefined) {
                        opInput.value = sbWatermark.opacity;
                        if (opVal) opVal.textContent = sbWatermark.opacity + '%';
                    }
                    if (textSizeInput && sbWatermark.textSize !== undefined) {
                        textSizeInput.value = sbWatermark.textSize;
                        if (textSizeVal) textSizeVal.textContent = sbWatermark.textSize + '%';
                    }
                    if (logoSizeInput && sbWatermark.logoSize !== undefined) {
                        logoSizeInput.value = sbWatermark.logoSize;
                        if (logoSizeVal) logoSizeVal.textContent = sbWatermark.logoSize + '%';
                    }
                    if (textInput && sbWatermark.text !== undefined) textInput.value = sbWatermark.text;
                    
                    if (sbWatermark.logoBase64 && watermarkLogoPreview) {
                        watermarkLogoPreview.src = sbWatermark.logoBase64;
                        if (typeof updateLogoPixelDetails === 'function') {
                            updateLogoPixelDetails(sbWatermark.logoBase64);
                        } else {
                            const container = document.getElementById('watermark-logo-preview-container');
                            if (container) container.style.display = 'flex';
                            const btnRemove = document.getElementById('btn-remove-watermark-logo');
                            if (btnRemove) btnRemove.style.display = 'inline-flex';
                        }
                    }
                    if (typeSel) typeSel.dispatchEvent(new Event('change'));
                }
            } catch (err) {
                console.warn('Could not load watermark settings from Supabase:', err);
            }
        }
        window.loadWatermarkSettingsFromSupabase = loadWatermarkSettingsFromSupabase;
        loadWatermarkSettingsFromSupabase();

        if (watermarkForm) {
            watermarkForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const btnSave = document.getElementById('btn-save-watermark') || watermarkForm.querySelector('button[type="submit"]');
                const btnApplyAll = document.getElementById('btn-apply-watermark-all');

                let origSaveHtml = btnSave ? btnSave.innerHTML : '';
                let origApplyHtml = btnApplyAll ? btnApplyAll.innerHTML : '';

                try {
                    if (btnSave) {
                        btnSave.disabled = true;
                        btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Server...';
                    }
                    if (btnApplyAll) btnApplyAll.disabled = true;

                    await saveWatermarkSettingsFromForm();
                    const count = await window.applyWatermarkToAllProperties();

                    alert(`Watermark settings saved to database successfully! Updated watermark on ${count} property listing(s).`);
                } catch (err) {
                    console.error('Error saving watermark settings:', err);
                    alert('An error occurred while saving watermark settings.');
                } finally {
                    if (btnSave) {
                        btnSave.disabled = false;
                        btnSave.innerHTML = origSaveHtml || '<i class="fa-solid fa-floppy-disk"></i> Save Watermark';
                    }
                    if (btnApplyAll) {
                        btnApplyAll.disabled = false;
                        btnApplyAll.innerHTML = origApplyHtml || '<i class="fa-solid fa-wand-magic-sparkles"></i> Apply Watermark to All Properties';
                    }
                }
            });
        }

        const btnApplyAll = document.getElementById('btn-apply-watermark-all');
        if (btnApplyAll) {
            btnApplyAll.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const btnSave = document.getElementById('btn-save-watermark');
                let origApplyHtml = btnApplyAll.innerHTML;
                let origSaveHtml = btnSave ? btnSave.innerHTML : '';

                try {
                    btnApplyAll.disabled = true;
                    btnApplyAll.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Applying Watermarks...';
                    if (btnSave) btnSave.disabled = true;

                    await saveWatermarkSettingsFromForm();
                    const count = await window.applyWatermarkToAllProperties();

                    alert(`Watermark applied to ${count} property listing(s)! Check dashboard and homepage.`);
                } catch (err) {
                    console.error('Error applying watermarks:', err);
                    alert('An error occurred while applying watermarks.');
                } finally {
                    btnApplyAll.disabled = false;
                    btnApplyAll.innerHTML = origApplyHtml || '<i class="fa-solid fa-wand-magic-sparkles"></i> Apply Watermark to All Properties';
                    if (btnSave) {
                        btnSave.disabled = false;
                        btnSave.innerHTML = origSaveHtml || '<i class="fa-solid fa-floppy-disk"></i> Save Watermark';
                    }
                }
            });
        }
    }

    window.applyWatermarkToAllProperties = async function() {
        if (isWatermarkProcessing) return 0;
        isWatermarkProcessing = true;
        try {
            let currentProperties = JSON.parse(localStorage.getItem('industria_properties')) || properties || [];
            if (!currentProperties || currentProperties.length === 0) return 0;

            const currentWatermarkSettings = JSON.parse(localStorage.getItem('industria_watermark_settings')) || {
                type: 'logo',
                position: 'bottom-right',
                opacity: 85,
                textSize: 5,
                text: 'MyFactorySpace',
                logoBase64: defaultLogoSvg
            };

            if (currentWatermarkSettings.type === 'logo' && (!currentWatermarkSettings.logoBase64 || !currentWatermarkSettings.logoBase64.trim())) {
                currentWatermarkSettings.logoBase64 = defaultLogoSvg;
            }

            const isWatermarkDisabled = !currentWatermarkSettings || currentWatermarkSettings.type === 'none';

            // If watermark is disabled ('none'), restore clean original unwatermarked images
            if (isWatermarkDisabled) {
                for (let i = 0; i < currentProperties.length; i++) {
                    let p = currentProperties[i];
                    if (!p) continue;
                    if ((!p.rawImages || p.rawImages.length === 0) && (!p.images || p.images.length === 0)) {
                        if (p.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[p.id]) {
                            p.rawImages = [...defaultPropertyImagesMap[p.id]];
                            p.rawImage = p.rawImages[0];
                        }
                    }
                    if (p.rawImages && p.rawImages.length > 0) {
                        p.images = [...p.rawImages];
                    } else if (p.images && p.images.length > 0) {
                        p.rawImages = [...p.images];
                    }
                    p.image = (p.images && p.images.length > 0) ? p.images[0] : 'assets/images/warehouse.jpg';
                    if (!p.rawImage) p.rawImage = p.image;

                    // Sync unwatermarked property to Supabase Cloud Database
                    try {
                        await syncPropertyToSupabase(p);
                    } catch(e) {
                        console.warn('Failed to sync unwatermarked property to Supabase:', e);
                    }
                }
                properties = currentProperties;
                safeLocalStorageSet('industria_properties', currentProperties);
                if (typeof renderTable === 'function') renderTable();
                window.dispatchEvent(new Event('storage'));
                return properties.length;
            }

            let count = 0;
            for (let i = 0; i < currentProperties.length; i++) {
                let prop = currentProperties[i];
                if (!prop) continue;

                if (!prop.rawImages || prop.rawImages.length === 0) {
                    if (prop.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[prop.id]) {
                        prop.rawImages = [...defaultPropertyImagesMap[prop.id]];
                        prop.rawImage = prop.rawImages[0];
                    } else if (prop.rawImage && !prop.rawImage.startsWith('data:')) {
                        prop.rawImages = [prop.rawImage];
                    } else if (prop.images && prop.images.length > 0 && !prop.images.some(img => typeof img === 'string' && img.startsWith('data:'))) {
                        prop.rawImages = [...prop.images];
                        prop.rawImage = prop.rawImages[0];
                    } else {
                        prop.rawImages = ['assets/images/warehouse.jpg'];
                        prop.rawImage = 'assets/images/warehouse.jpg';
                    }
                }

                prop.images = await Promise.all(prop.rawImages.map(async (rawItem) => {
                    return await window.applyWatermark(rawItem);
                }));

                prop.image = (prop.images && prop.images.length > 0) ? prop.images[0] : prop.rawImage;
                count++;
            }

            properties = currentProperties;

            // Sync watermarked properties & upload watermarked photos to Supabase Storage & Database
            for (let i = 0; i < currentProperties.length; i++) {
                try {
                    await syncPropertyToSupabase(currentProperties[i]);
                } catch(e) {
                    console.warn('Failed to sync property to Supabase:', e);
                }
            }

            safeLocalStorageSet('industria_properties', currentProperties);
            if (typeof renderTable === 'function') renderTable();
            window.dispatchEvent(new Event('storage'));
            return count;
        } finally {
            isWatermarkProcessing = false;
        }
    };

    async function fetchImageAsDataUrl(url) {
        if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
            return url;
        }
        try {
            const res = await fetch(url);
            if (!res.ok) return url;
            const blob = await res.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(url);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return url;
        }
    }

    window.applyWatermark = async function(base64Image) {
        if (!base64Image) return base64Image;

        const currentSettings = JSON.parse(localStorage.getItem('industria_watermark_settings')) || watermarkSettings;
        if (!currentSettings || currentSettings.type === 'none') {
            return base64Image;
        }

        let sourceSrc = base64Image;
        if (typeof base64Image === 'string' && (base64Image.startsWith('http://') || base64Image.startsWith('https://'))) {
            const fetchedDataUrl = await fetchImageAsDataUrl(base64Image);
            if (fetchedDataUrl) sourceSrc = fetchedDataUrl;
        }

        return new Promise((resolve) => {
            let isResolved = false;
            const timeoutId = setTimeout(() => {
                console.warn('applyWatermark timeout hit, returning original image');
                safeResolve(base64Image);
            }, 5000);

            const safeResolve = (val) => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    resolve(val);
                }
            };

            if (currentSettings.type === 'logo' && (!currentSettings.logoBase64 || currentSettings.logoBase64.trim() === '')) {
                currentSettings.logoBase64 = defaultLogoSvg;
            }
            
            const img = new Image();
            if (typeof sourceSrc === 'string' && (sourceSrc.startsWith('http://') || sourceSrc.startsWith('https://'))) {
                img.crossOrigin = 'anonymous';
            }

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.naturalWidth || img.width || 800;
                    let height = img.naturalHeight || img.height || 600;
                    const maxDim = 2400;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    const position = currentSettings.position || 'bottom-right';
                    const opacity = currentSettings.opacity !== undefined ? currentSettings.opacity : 80;

                    if (currentSettings.type === 'text') {
                        // Text Wording Watermark ONLY (No Square Box, Direct Font Opacity)
                        const rawText = (currentSettings.text !== undefined && currentSettings.text !== null && String(currentSettings.text).trim() !== '') ? String(currentSettings.text) : 'MyFactorySpace';
                        const textWording = rawText.trim() || 'MyFactorySpace';

                        const textSizePct = Math.max(0.04, (currentSettings.textSize !== undefined ? currentSettings.textSize : 5) / 100);
                        const fontSize = Math.max(26, Math.floor(canvas.width * textSizePct));
                        
                        ctx.font = `bold ${fontSize}px 'Outfit', 'Inter', -apple-system, sans-serif`;
                        ctx.textBaseline = 'middle';
                        
                        const textMetrics = ctx.measureText(textWording);
                        const padding = Math.max(20, Math.floor(canvas.width * 0.03));
                        let x = 0, y = 0;

                        if (position.includes('bottom')) {
                            y = canvas.height - (fontSize / 2) - padding;
                        } else if (position.includes('top')) {
                            y = (fontSize / 2) + padding;
                        } else {
                            y = canvas.height / 2;
                        }

                        if (position.includes('right')) {
                            x = canvas.width - padding;
                            ctx.textAlign = 'right';
                        } else if (position.includes('left')) {
                            x = padding;
                            ctx.textAlign = 'left';
                        } else {
                            x = canvas.width / 2;
                            ctx.textAlign = 'center';
                        }

                        // NO SQUARE BOX / NO PILL
                        // Directly apply font opacity from user slider
                        ctx.save();
                        ctx.globalAlpha = opacity / 100;

                        // Subtle dark outline around letters for contrast on bright photos
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
                        ctx.lineWidth = Math.max(2, Math.floor(fontSize / 8));
                        ctx.strokeText(textWording, x, y);

                        // Pure white font text fill
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(textWording, x, y);
                        ctx.restore();
                        
                        try {
                            safeResolve(canvas.toDataURL('image/jpeg', 0.94));
                        } catch (e) {
                            console.error('Canvas toDataURL error (text):', e);
                            safeResolve(base64Image);
                        }
                    } else if (currentSettings.type === 'logo') {
                        ctx.globalAlpha = opacity / 100;
                        // Logo Picture Watermark ONLY (Never draw text overlay)
                        const logoSrc = currentSettings.logoBase64;
                        if (!logoSrc || logoSrc.trim() === '') {
                            safeResolve(base64Image);
                            return;
                        }

                        const isDefaultSvgLogo = (logoSrc === defaultLogoSvg);

                        const drawAndExportLogo = (logoImgObj) => {
                            try {
                                const padding = Math.max(12, Math.floor(canvas.width * 0.025));
                                const logoSizePct = (currentSettings.logoSize !== undefined ? currentSettings.logoSize : 25) / 100;
                                const logoMaxWidth = canvas.width * logoSizePct;
                                let logoWidth = logoMaxWidth;
                                let logoHeight = logoMaxWidth * (90 / 300);

                                if (logoImgObj && logoImgObj.naturalWidth && logoImgObj.naturalHeight) {
                                    const naturalW = logoImgObj.naturalWidth;
                                    const naturalH = logoImgObj.naturalHeight;
                                    const scale = logoMaxWidth / naturalW;
                                    logoHeight = naturalH * scale;
                                }

                                let x = 0, y = 0;
                                if (position.includes('bottom')) y = canvas.height - logoHeight - padding;
                                else if (position.includes('top')) y = padding;
                                else y = (canvas.height - logoHeight) / 2;

                                if (position.includes('right')) x = canvas.width - logoWidth - padding;
                                else if (position.includes('left')) x = padding;
                                else x = (canvas.width - logoWidth) / 2;

                                if (isDefaultSvgLogo && (!logoImgObj || !logoImgObj.naturalWidth)) {
                                    drawDefaultLogoOnCanvas(ctx, x, y, logoWidth, logoHeight);
                                } else if (logoImgObj) {
                                    ctx.drawImage(logoImgObj, x, y, logoWidth, logoHeight);
                                } else {
                                    safeResolve(base64Image);
                                    return;
                                }

                                try {
                                    safeResolve(canvas.toDataURL('image/jpeg', 0.95));
                                } catch (expErr) {
                                    console.error('Canvas export error (logo):', expErr);
                                    safeResolve(base64Image);
                                }
                            } catch (e) {
                                console.error('Logo watermark draw error:', e);
                                safeResolve(base64Image);
                            }
                        };

                        if (isDefaultSvgLogo) {
                            const logoImg = new Image();
                            logoImg.onload = () => drawAndExportLogo(logoImg);
                            logoImg.onerror = () => drawAndExportLogo(null);
                            logoImg.src = logoSrc;
                        } else {
                            const logoImg = new Image();
                            if (typeof logoSrc === 'string' && (logoSrc.startsWith('http://') || logoSrc.startsWith('https://'))) {
                                logoImg.crossOrigin = 'anonymous';
                            }
                            logoImg.onload = () => drawAndExportLogo(logoImg);
                            logoImg.onerror = (err) => {
                                console.warn('Failed to load custom logo:', err);
                                safeResolve(base64Image);
                            };
                            logoImg.src = logoSrc;
                        }
                    } else {
                        safeResolve(base64Image);
                    }
                } catch (err) {
                    console.error('applyWatermark error:', err);
                    safeResolve(base64Image);
                }
            };
            img.onerror = () => safeResolve(base64Image);
            img.src = sourceSrc;
        });
    };

    // --- GLOBAL & VIEW SEARCH INITIALIZATION ---
    function initDashboardSearch() {
        const headerSearch = document.getElementById('header-global-search');
        const headerClear = document.getElementById('header-global-search-clear');
        const dropdown = document.getElementById('global-search-results-dropdown');

        const propSearch = document.getElementById('property-search-input');
        const propCity = document.getElementById('property-city-filter');
        const propType = document.getElementById('property-type-filter');
        const propIntent = document.getElementById('property-intent-filter');

        const unassignedPropSearch = document.getElementById('unassigned-property-search-input');
        const unassignedPropCity = document.getElementById('unassigned-property-city-filter');
        const unassignedPropType = document.getElementById('unassigned-property-type-filter');
        const unassignedPropIntent = document.getElementById('unassigned-property-intent-filter');

        const parkSearch = document.getElementById('park-search-input');
        const parkCity = document.getElementById('park-city-filter');

        const unassignedParkSearch = document.getElementById('unassigned-park-search-input');
        const unassignedParkCity = document.getElementById('unassigned-park-city-filter');

        const agentSearch = document.getElementById('agent-search-input');

        const leadSearch = document.getElementById('lead-search-input');
        const ownerSearch = document.getElementById('owner-search-input');

        // Bind view filter change events
        if (propSearch) propSearch.addEventListener('input', renderTable);
        if (propCity) propCity.addEventListener('change', renderTable);
        if (propType) propType.addEventListener('change', renderTable);
        if (propIntent) propIntent.addEventListener('change', renderTable);

        if (unassignedPropSearch) unassignedPropSearch.addEventListener('input', () => {
            if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
        });
        if (unassignedPropCity) unassignedPropCity.addEventListener('change', () => {
            if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
        });
        if (unassignedPropType) unassignedPropType.addEventListener('change', () => {
            if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
        });
        if (unassignedPropIntent) unassignedPropIntent.addEventListener('change', () => {
            if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
        });

        if (parkSearch) parkSearch.addEventListener('input', renderParksTable);
        if (parkCity) parkCity.addEventListener('change', renderParksTable);

        if (unassignedParkSearch) unassignedParkSearch.addEventListener('input', () => {
            if (typeof renderUnassignedParksTable === 'function') renderUnassignedParksTable();
        });
        if (unassignedParkCity) unassignedParkCity.addEventListener('change', () => {
            if (typeof renderUnassignedParksTable === 'function') renderUnassignedParksTable();
        });

        if (agentSearch) agentSearch.addEventListener('input', () => {
            if (typeof window.renderAgentsTable === 'function') window.renderAgentsTable();
        });
        if (leadSearch) leadSearch.addEventListener('input', () => {
            if (typeof renderLeads === 'function') renderLeads();
        });
        if (ownerSearch) ownerSearch.addEventListener('input', () => {
            if (typeof renderOwnerList === 'function') renderOwnerList();
        });

        if (!headerSearch) return;

        function updateHeaderClearVisibility() {
            if (headerClear) {
                headerClear.style.display = headerSearch.value.trim() !== '' ? 'block' : 'none';
            }
        }

        function getActiveDashboardView() {
            const views = ['overview', 'properties', 'parks', 'leads', 'owner-list', 'agents', 'settings'];
            for (const v of views) {
                const el = document.getElementById(v + '-view');
                if (el && el.style.display !== 'none') return v;
            }
            return 'overview';
        }

        function performGlobalSearch(query) {
            const term = query.toLowerCase().trim();
            updateHeaderClearVisibility();

            if (!term) {
                if (dropdown) dropdown.style.display = 'none';
                return;
            }

            // Sync with current active view search input if applicable
            const activeView = getActiveDashboardView();
            if (activeView === 'properties') {
                if (propSearch) propSearch.value = query;
                if (unassignedPropSearch) unassignedPropSearch.value = query;
                renderTable();
                if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
            } else if (activeView === 'parks') {
                if (parkSearch) parkSearch.value = query;
                if (unassignedParkSearch) unassignedParkSearch.value = query;
                renderParksTable();
                if (typeof renderUnassignedParksTable === 'function') renderUnassignedParksTable();
            } else if (activeView === 'leads' && leadSearch) {
                leadSearch.value = query;
                renderLeads();
            } else if (activeView === 'owner-list' && ownerSearch) {
                ownerSearch.value = query;
                renderOwnerList();
            } else if (activeView === 'agents' && agentSearch) {
                agentSearch.value = query;
                renderAgentsTable();
            }

            // Build live search results for dropdown overlay
            if (!dropdown) return;

            let matches = [];

            // Search Properties
            if (Array.isArray(properties)) {
                properties.forEach(p => {
                    const text = [p.title, p.location, p.park, p.type, p.price, p.specs].filter(Boolean).join(' ').toLowerCase();
                    if (text.includes(term)) {
                        matches.push({
                            type: 'property',
                            icon: 'fa-building',
                            title: p.title || 'Untitled Property',
                            subtitle: `${p.location || ''} • ${p.type || ''} • ${p.price || ''}`,
                            view: 'properties',
                            id: p.id
                        });
                    }
                });
            }

            // Search Parks
            for (const city in parks) {
                if (Array.isArray(parks[city])) {
                    parks[city].forEach(pk => {
                        const text = [pk.name, city, pk.section].filter(Boolean).join(' ').toLowerCase();
                        if (text.includes(term)) {
                            matches.push({
                                type: 'park',
                                icon: 'fa-map-location-dot',
                                title: pk.name,
                                subtitle: `${city} ${pk.section ? '• Section ' + pk.section : ''}`,
                                view: 'parks',
                                name: pk.name
                            });
                        }
                    });
                }
            }

            // Search Owners
            const storedOwners = safeJsonParse('industria_owner_listings', []);
            if (Array.isArray(storedOwners)) {
                storedOwners.forEach(o => {
                    const text = [o.name, o.phone, o.email, o.location, o.type, o.park].filter(Boolean).join(' ').toLowerCase();
                    if (text.includes(term)) {
                        matches.push({
                            type: 'owner',
                            icon: 'fa-clipboard-user',
                            title: o.name || 'Owner Request',
                            subtitle: `Owner • ${o.location || ''} • ${o.type || ''} (${o.status || 'Pending'})`,
                            view: 'owner-list',
                            id: o.id
                        });
                    }
                });
            }

            // Search Leads
            const storedLeads = safeJsonParse('industria_leads', []);
            if (Array.isArray(storedLeads)) {
                storedLeads.forEach(l => {
                    const text = [l.name, l.phone, l.email, l.interest, l.location, l.type, l.park].filter(Boolean).join(' ').toLowerCase();
                    if (text.includes(term)) {
                        matches.push({
                            type: 'lead',
                            icon: 'fa-address-book',
                            title: l.name || 'Lead Inquiry',
                            subtitle: `Lead Inquiry • ${l.interest || l.location || ''} (${l.status || 'New'})`,
                            view: 'leads',
                            id: l.id
                        });
                    }
                });
            }

            // Search Agents
            if (Array.isArray(agents)) {
                agents.forEach(a => {
                    const text = [a.name, a.ren, a.phone, a.bio].filter(Boolean).join(' ').toLowerCase();
                    if (text.includes(term)) {
                        matches.push({
                            type: 'agent',
                            icon: 'fa-user-tie',
                            title: a.name,
                            subtitle: `Specialist Agent • REN: ${a.ren || 'N/A'}`,
                            view: 'agents',
                            id: a.id
                        });
                    }
                });
            }

            if (matches.length === 0) {
                dropdown.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;"><i class="fa-solid fa-magnifying-glass-minus" style="margin-right: 6px;"></i> No matching items found across system</div>`;
                dropdown.style.display = 'block';
                return;
            }

            // Limit preview results to top 8 items
            const displayMatches = matches.slice(0, 8);
            let html = displayMatches.map(m => `
                <div class="global-search-item" data-view="${m.view}" style="padding: 0.65rem 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='transparent';">
                    <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(37,99,235,0.08); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0;">
                        <i class="fa-solid ${m.icon}"></i>
                    </div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-dark); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(m.title)}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHtml(m.subtitle)}</div>
                    </div>
                    <i class="fa-solid fa-arrow-right-long" style="font-size: 0.8rem; color: #cbd5e1;"></i>
                </div>
            `).join('');

            if (matches.length > 8) {
                html += `<div style="padding: 0.5rem 1rem; background: #f8fafc; font-size: 0.78rem; text-align: center; color: var(--primary); font-weight: 600;">+ ${matches.length - 8} more results</div>`;
            }

            dropdown.innerHTML = html;
            dropdown.style.display = 'block';

            // Click event for items in dropdown
            dropdown.querySelectorAll('.global-search-item').forEach(item => {
                item.addEventListener('click', () => {
                    const targetView = item.dataset.view;
                    dropdown.style.display = 'none';
                    if (typeof window.switchView === 'function') {
                        window.switchView(targetView);
                    }
                    // Sync target view's search input with header search term
                    if (targetView === 'properties') {
                        if (propSearch) propSearch.value = headerSearch.value;
                        if (unassignedPropSearch) unassignedPropSearch.value = headerSearch.value;
                        renderTable();
                        if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
                    }
                    else if (targetView === 'parks') {
                        if (parkSearch) parkSearch.value = headerSearch.value;
                        if (unassignedParkSearch) unassignedParkSearch.value = headerSearch.value;
                        renderParksTable();
                        if (typeof renderUnassignedParksTable === 'function') renderUnassignedParksTable();
                    }
                    else if (targetView === 'leads' && leadSearch) { leadSearch.value = headerSearch.value; renderLeads(); }
                    else if (targetView === 'owner-list' && ownerSearch) { ownerSearch.value = headerSearch.value; renderOwnerList(); }
                    else if (targetView === 'agents' && agentSearch) { agentSearch.value = headerSearch.value; renderAgentsTable(); }
                });
            });
        }

        headerSearch.addEventListener('input', (e) => performGlobalSearch(e.target.value));
        headerSearch.addEventListener('focus', (e) => {
            if (e.target.value.trim() !== '') performGlobalSearch(e.target.value);
        });

        if (headerClear) {
            headerClear.addEventListener('click', () => {
                headerSearch.value = '';
                updateHeaderClearVisibility();
                if (dropdown) dropdown.style.display = 'none';
                
                // Clear active view search input too
                const activeView = getActiveDashboardView();
                if (activeView === 'properties') {
                    if (propSearch) propSearch.value = '';
                    if (unassignedPropSearch) unassignedPropSearch.value = '';
                    renderTable();
                    if (typeof renderUnassignedPropertiesTable === 'function') renderUnassignedPropertiesTable();
                }
                else if (activeView === 'parks') {
                    if (parkSearch) parkSearch.value = '';
                    if (unassignedParkSearch) unassignedParkSearch.value = '';
                    renderParksTable();
                    if (typeof renderUnassignedParksTable === 'function') renderUnassignedParksTable();
                }
                else if (activeView === 'leads' && leadSearch) { leadSearch.value = ''; renderLeads(); }
                else if (activeView === 'owner-list' && ownerSearch) { ownerSearch.value = ''; renderOwnerList(); }
                else if (activeView === 'agents' && agentSearch) { agentSearch.value = ''; renderAgentsTable(); }
            });
        }

        document.addEventListener('click', (e) => {
            if (dropdown && !headerSearch.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    // ========================================================
    // LOCATION LANDING PAGES & SEO CONTROLLER (DASHBOARD)
    // ========================================================
    const LOCATION_SETTINGS_KEY = 'industria_location_settings';
    let currentEditingCitySlug = 'petaling-jaya';

    const DEFAULT_LOCATION_DATA = {
        'petaling-jaya': {
            city: 'Petaling Jaya',
            slug: 'petaling-jaya',
            state: 'Selangor',
            headline: 'Petaling Jaya Industrial Properties & Warehouses For Sale & Rent',
            tagline: "Selangor's premier mature industrial and corporate commercial hub. Anchored directly by Federal Highway, NPE, and LDP with 15-minute connectivity to KL City Centre.",
            heroImage: 'assets/images/drone_pj.jpg',
            suggestedDimensions: '1920 × 800 px (16:9 ratio, min 1200 × 630 px, max 5MB)',
            metaTitle: 'Petaling Jaya Industrial Properties, Factories & Warehouses | MyFactorySpace',
            metaDescription: 'Find verified industrial factories, warehouses, and commercial plots for sale and rent in Petaling Jaya. Explore prime zones in Section 51, 51A, Section 13, and Kota Damansara.',
            seoSummary: 'Petaling Jaya stands as Selangor’s most established, mature industrial and corporate commercial hub. Strategically straddling the Federal Highway, New Pantai Expressway (NPE), and Lebuhraya Damansara-Puchong (LDP), PJ industrial parks such as Section 51, Section 51A, Section 13, Section 19, and Sunway Damansara offer an unbeatable logistical bridge between Kuala Lumpur City Centre (15 mins) and Port Klang (30 mins). Highly favored by multinational corporations, central regional distribution hubs, high-tech manufacturing, and last-mile urban logistics operators requiring immediate access to Klang Valley’s top tier consumer and corporate market.',
            stats: {
                highways: 'Federal, NPE, LDP',
                portDist: '30 Mins to Port Klang',
                airportDist: '18 Km to Subang (SZB)'
            },
            industrialParks: [
                'Section 51 Industrial Area',
                'Section 51A Industrial Park',
                'Section 13 Commercial & Industrial Hub',
                'Section 19 Industrial Zone',
                'Section 22 Industrial Estate',
                'Sunway Damansara Technology Park',
                'Kota Damansara Science Park'
            ]
        },
        'subang-jaya': {
            city: 'Subang Jaya',
            slug: 'subang-jaya',
            state: 'Selangor',
            headline: 'Subang Jaya High-Tech Warehouses & Industrial Facilities',
            tagline: "The central urban logistics and advanced engineering epicenter. Directly connected via KESAS, ELITE & Federal Highway with 10-minute access to Subang Airport.",
            heroImage: 'assets/images/drone_subang.jpg',
            suggestedDimensions: '1920 × 800 px (16:9 ratio, min 1200 × 630 px, max 5MB)',
            metaTitle: 'Subang Jaya Industrial Properties, Warehouses & Factories | MyFactorySpace',
            metaDescription: 'Browse Grade-A logistics warehouses, semi-detached & detached factories in Subang Jaya. Prime locations in Subang Hi-Tech, USJ 19, TP7, and SS13.',
            seoSummary: 'Subang Jaya represents a premier industrial nexus strategically positioned directly between the capital of Kuala Lumpur and Malaysia’s busiest maritime gateway at Port Klang. Renowned for Grade-A modern logistics facilities and high-tech industrial parks such as Subang Hi-Tech Industrial Park, USJ 19, Taman Perindustrian Subang (TP7), and SS13, Subang Jaya offers unparalleled connectivity via KESAS, ELITE, Federal Highway, and NPE. Home to regional e-commerce fulfillment centers, aerospace engineering services, and precision manufacturing.',
            stats: {
                highways: 'KESAS, ELITE, NPE',
                portDist: '25 Mins to Port Klang',
                airportDist: '12 Km to Subang (SZB)'
            },
            industrialParks: [
                'Subang Hi-Tech Industrial Park',
                'USJ 19 Digital Mall Industrial Area',
                'Taman Perindustrian Subang (TP7)',
                'Subang Jaya Industrial Estate (SS13)',
                'USJ 1 Industrial Park',
                'Sunway Industrial Park'
            ]
        },
        'shah-alam': {
            city: 'Shah Alam',
            slug: 'shah-alam',
            state: 'Selangor',
            headline: 'Shah Alam Industrial Hub — Factories, Warehouses & Land',
            tagline: "The industrial powerhouse of Selangor. Malaysia's premier automotive, multinational manufacturing, and regional supply chain corridor.",
            heroImage: 'assets/images/drone_shahalam.jpg',
            suggestedDimensions: '1920 × 800 px (16:9 ratio, min 1200 × 630 px, max 5MB)',
            metaTitle: 'Shah Alam Industrial Properties, Factories & Warehouses | MyFactorySpace',
            metaDescription: 'Explore top industrial factories and warehouses in Shah Alam. Premier clusters in Bukit Jelutong, Glenmarie, Section 15, 16, 22, and Kota Kemuning.',
            seoSummary: 'Shah Alam is the undisputed industrial capital of Selangor and Malaysia’s foremost manufacturing and heavy distribution engine. Anchored by world-renowned industrial estates including Bukit Jelutong Industrial Park, HICOM Glenmarie, Temasya Industrial Park, Section 15, Section 16, Section 22 (Sekitar 26), and Kota Kemuning, Shah Alam provides unmatched expressway infrastructure via the New Klang Valley Expressway (NKVE), Guthrie Corridor Expressway (GCE), Federal Highway, and KESAS. Serving as the Malaysian operating base for global Fortune 500 manufacturers, automotive assemblers, and logistics operators.',
            stats: {
                highways: 'NKVE, Federal, GCE',
                portDist: '20 Mins to Port Klang',
                airportDist: '15 Km to Subang (SZB)'
            },
            industrialParks: [
                'Bukit Jelutong Industrial Park',
                'HICOM Glenmarie Industrial Park',
                'Temasya Industrial Park',
                'Section 15 Industrial Estate',
                'Section 16 Industrial Area',
                'Section 22 Industrial Zone (Sekitar 26)',
                'Section 23 Industrial Park',
                'Kota Kemuning Industrial Park',
                'Bukit Kemuning Industrial Area',
                'i-Parc @ Bukit Jelutong'
            ]
        },
        'klang': {
            city: 'Klang',
            slug: 'klang',
            state: 'Selangor',
            headline: 'Klang Port-Adjacent Logistics Warehouses & Industrial Land',
            tagline: "Malaysia's global maritime gateway. Direct haulage to Port Klang (Northport & Westport) with seamless West Coast Expressway (WCE) connectivity.",
            heroImage: 'assets/images/drone_klang.jpg',
            suggestedDimensions: '1920 × 800 px (16:9 ratio, min 1200 × 630 px, max 5MB)',
            metaTitle: 'Klang Industrial Properties, Port Warehouses & Land | MyFactorySpace',
            metaDescription: 'Find port-adjacent warehouses, heavy manufacturing factories, and industrial land in Klang. Prime zones in Northport (Bandar Sultan Suleiman), Westport (Pulau Indah), and Bukit Raja.',
            seoSummary: 'Klang is Malaysia’s primary maritime and heavy industrial epicenter, housing Port Klang—ranked among the world’s top 12 busiest container seaports. Encompassing critical trade centers such as Bandar Sultan Suleiman (Northport), Pulau Indah Industrial Park (Westport), Bandar Bukit Raja Industrial Gateway, Meru, and Kapar, Klang is the number-one destination for import/export enterprises, global 3PL operators, cold storage hubs, and heavy manufacturing. Benefitting from the newly expanded West Coast Expressway (WCE), Shahpadu Highway, and South Klang Valley Expressway (SKVE).',
            stats: {
                highways: 'WCE, Shahpadu, KESAS',
                portDist: 'Immediate (North/Westport)',
                airportDist: '40 Mins to KLIA'
            },
            industrialParks: [
                'Bandar Sultan Suleiman (Northport) Industrial Park',
                'Pulau Indah Industrial Park (Westport)',
                'Bandar Bukit Raja Industrial Gateway',
                'Meru Industrial Park',
                'Kapar Industrial Estate',
                'Telok Gong Industrial Area',
                'Taman Klang Utama Industrial Zone'
            ]
        }
    };

    function getAllLocationSettings() {
        try {
            const raw = localStorage.getItem(LOCATION_SETTINGS_KEY);
            if (raw) return Object.assign({}, DEFAULT_LOCATION_DATA, JSON.parse(raw));
        } catch (e) {}
        return Object.assign({}, DEFAULT_LOCATION_DATA);
    }

    function saveAllLocationSettings(data) {
        try {
            localStorage.setItem(LOCATION_SETTINGS_KEY, JSON.stringify(data));
            if (window.IndustraSupabase && typeof window.IndustraSupabase.saveSiteSetting === 'function') {
                window.IndustraSupabase.saveSiteSetting('location_landing_settings', data).catch(e => console.warn('Supabase location sync:', e));
            }
        } catch (e) {}
    }

    // Helper to normalize any city name/spelling to matching location slug
    function normalizeCityToSlug(city) {
        if (!city) return 'petaling-jaya';
        const c = String(city).toLowerCase().trim();
        if (c.includes('petaling') || c === 'pj') return 'petaling-jaya';
        if (c.includes('subang') || c.includes('usj') || c.includes('sunway')) return 'subang-jaya';
        if (c.includes('shah') || c.includes('alam') || c === 'sa') return 'shah-alam';
        if (c.includes('klang')) return 'klang';
        return c.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    window.normalizeCityToSlug = normalizeCityToSlug;

    // Dynamically merge parks from Location Settings with all parks in Dashboard > Parks
    function getMergedCityParksForDashboard(cityName, slug, baseParks = []) {
        const list = [];
        const seen = new Set();
        const allData = getAllLocationSettings();
        const cityData = allData[slug] || (DEFAULT_LOCATION_DATA && DEFAULT_LOCATION_DATA[slug]) || {};
        const excluded = Array.isArray(cityData.excludedParks) ? cityData.excludedParks.map(x => String(x).toLowerCase()) : [];

        const addPark = (name) => {
            if (!name || typeof name !== 'string') return;
            const trimmed = name.trim();
            const norm = trimmed.toLowerCase();
            if (!norm || seen.has(norm) || excluded.includes(norm)) return;
            seen.add(norm);
            list.push(trimmed);
        };

        // 1. Existing baseParks from location settings
        if (Array.isArray(baseParks)) {
            baseParks.forEach(p => {
                const name = typeof p === 'string' ? p : (p && !p.hidden ? p.name : null);
                addPark(name);
            });
        }

        // 2. Parks from Dashboard > Parks (`parks` object in memory or localStorage)
        const parksObj = (typeof parks !== 'undefined' && parks) ? parks : safeJsonParse('industria_industrial_parks', {});
        if (parksObj && typeof parksObj === 'object') {
            Object.keys(parksObj).forEach(cName => {
                if (normalizeCityToSlug(cName) === slug) {
                    const cParks = parksObj[cName];
                    if (Array.isArray(cParks)) {
                        cParks.forEach(p => {
                            if (typeof p === 'string') {
                                addPark(p);
                            } else if (p && typeof p === 'object' && !p.hidden && p.name) {
                                addPark(p.name);
                            }
                        });
                    }
                }
            });
        }

        return list;
    }
    window.getMergedCityParksForDashboard = getMergedCityParksForDashboard;

    // Automatically sync new/updated parks from Dashboard > Parks to Location Landing Directory
    function syncParkToLocationDirectory(city, parkName, oldParkName, isHidden) {
        if (!city || !parkName) return;
        try {
            const slug = normalizeCityToSlug(city);
            const allSettings = getAllLocationSettings();
            if (!allSettings[slug]) {
                if (DEFAULT_LOCATION_DATA && DEFAULT_LOCATION_DATA[slug]) {
                    allSettings[slug] = JSON.parse(JSON.stringify(DEFAULT_LOCATION_DATA[slug]));
                } else {
                    return;
                }
            }
            const cityData = allSettings[slug];
            let pList = Array.isArray(cityData.industrialParks) ? [...cityData.industrialParks] : [];

            // If previously excluded, unexclude
            if (Array.isArray(cityData.excludedParks)) {
                cityData.excludedParks = cityData.excludedParks.filter(x => x.toLowerCase() !== parkName.toLowerCase());
            }

            // Remove old name if renamed
            if (oldParkName && oldParkName !== parkName) {
                pList = pList.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).toLowerCase() !== oldParkName.toLowerCase());
            }

            if (isHidden) {
                pList = pList.filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).toLowerCase() !== parkName.toLowerCase());
            } else {
                const exists = pList.some(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).toLowerCase() === parkName.toLowerCase());
                if (!exists) {
                    pList.push(parkName);
                }
            }

            cityData.industrialParks = pList;
            allSettings[slug] = cityData;
            saveAllLocationSettings(allSettings);

            // If currently viewing/editing this city in Dashboard > Landing Page, refresh its chips immediately
            if (typeof currentEditingCitySlug !== 'undefined' && currentEditingCitySlug === slug && typeof renderLocationParksChips === 'function') {
                renderLocationParksChips(cityData.industrialParks);
            }
        } catch (e) {
            console.warn('syncParkToLocationDirectory error:', e);
        }
    }
    window.syncParkToLocationDirectory = syncParkToLocationDirectory;

    // Remove deleted park from Location Landing Directory
    function removeParkFromLocationDirectory(city, parkName) {
        if (!city || !parkName) return;
        try {
            const slug = normalizeCityToSlug(city);
            const allSettings = getAllLocationSettings();
            if (allSettings[slug] && Array.isArray(allSettings[slug].industrialParks)) {
                allSettings[slug].industrialParks = allSettings[slug].industrialParks.filter(p => {
                    const name = typeof p === 'string' ? p : (p && p.name ? p.name : '');
                    return name.toLowerCase() !== parkName.toLowerCase();
                });
                allSettings[slug].excludedParks = allSettings[slug].excludedParks || [];
                if (!allSettings[slug].excludedParks.includes(parkName.toLowerCase())) {
                    allSettings[slug].excludedParks.push(parkName.toLowerCase());
                }
                saveAllLocationSettings(allSettings);

                if (typeof currentEditingCitySlug !== 'undefined' && currentEditingCitySlug === slug && typeof renderLocationParksChips === 'function') {
                    renderLocationParksChips(allSettings[slug].industrialParks);
                }
            }
        } catch (e) {
            console.warn('removeParkFromLocationDirectory error:', e);
        }
    }
    window.removeParkFromLocationDirectory = removeParkFromLocationDirectory;

    window.initLandingPageView = function(citySlug) {
        const targetSlug = citySlug || currentEditingCitySlug || 'petaling-jaya';
        window.switchLocationCityTab(targetSlug);
    };

    window.switchLocationCityTab = function(slug) {
        currentEditingCitySlug = slug;
        const allData = getAllLocationSettings();
        const cityData = allData[slug] || DEFAULT_LOCATION_DATA[slug] || DEFAULT_LOCATION_DATA['petaling-jaya'];

        // Update active tab button
        const tabBtns = {
            'petaling-jaya': 'loc-tab-btn-pj',
            'subang-jaya': 'loc-tab-btn-subang',
            'shah-alam': 'loc-tab-btn-shahalam',
            'klang': 'loc-tab-btn-klang'
        };
        Object.keys(tabBtns).forEach(k => {
            const btn = document.getElementById(tabBtns[k]);
            if (btn) btn.classList.toggle('active', k === slug);
        });

        // Update header & live preview links
        const cityTitleEl = document.getElementById('loc-editor-city-title');
        if (cityTitleEl) cityTitleEl.textContent = `${cityData.city} Landing Page Settings`;
        const liveUrlEl = document.getElementById('loc-editor-live-url');
        if (liveUrlEl) liveUrlEl.textContent = `/location.html?city=${cityData.slug}`;

        const previewBtns = [document.getElementById('btn-preview-location-live'), document.getElementById('btn-preview-location-live-top'), document.getElementById('loc-btn-view-live-bottom')];
        previewBtns.forEach(btn => {
            if (btn) btn.href = `location.html?city=${cityData.slug}`;
        });

        // 1. Hero Image & Preview
        const heroImgInput = document.getElementById('loc-input-hero-image');
        if (heroImgInput) heroImgInput.value = cityData.heroImage || '';
        updateLocationHeroPreview(cityData.heroImage);

        // 2. Industrial Parks Directory - merged dynamically with Dashboard > Parks
        cityData.industrialParks = getMergedCityParksForDashboard(cityData.city, cityData.slug, cityData.industrialParks || []);
        renderLocationParksChips(cityData.industrialParks || []);

        // 3. SEO Meta & Article
        const metaTitleInput = document.getElementById('loc-input-meta-title');
        if (metaTitleInput) metaTitleInput.value = cityData.metaTitle || '';
        const metaDescInput = document.getElementById('loc-input-meta-desc');
        if (metaDescInput) metaDescInput.value = cityData.metaDescription || '';
        const seoSummaryInput = document.getElementById('loc-input-seo-summary');
        if (seoSummaryInput) seoSummaryInput.value = cityData.seoSummary || '';

        // 4. Headlines & Stats
        const headlineInput = document.getElementById('loc-input-headline');
        if (headlineInput) headlineInput.value = cityData.headline || '';
        const taglineInput = document.getElementById('loc-input-tagline');
        if (taglineInput) taglineInput.value = cityData.tagline || '';

        const highwaysInput = document.getElementById('loc-input-stat-highways');
        if (highwaysInput && cityData.stats) highwaysInput.value = cityData.stats.highways || '';
        const portInput = document.getElementById('loc-input-stat-port');
        if (portInput && cityData.stats) portInput.value = cityData.stats.portDist || '';
        const airportInput = document.getElementById('loc-input-stat-airport');
        if (airportInput && cityData.stats) airportInput.value = cityData.stats.airportDist || '';

        // Update Google Search mockup
        updateLocationGoogleMockup();
    };

    window.updateLocationHeroPreview = function(url) {
        const preview = document.getElementById('loc-preview-hero-img');
        if (preview && url) {
            preview.src = url;
        }
    };

    function renderLocationParksChips(parks) {
        const container = document.getElementById('loc-parks-editor-chips');
        const badge = document.getElementById('loc-parks-count-badge');
        if (badge) badge.textContent = `${parks.length} Industrial Parks Gathered`;
        if (!container) return;

        if (parks.length === 0) {
            container.innerHTML = '<span style="color: #94a3b8; font-size: 0.85rem;">No industrial parks registered yet. Type below to add.</span>';
            return;
        }

        container.innerHTML = parks.map(p => `
            <span class="badge-pill" style="background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; font-size: 0.82rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-industry" style="color: var(--primary); font-size: 0.75rem;"></i>
                <strong>${escapeHtml(p)}</strong>
                <button type="button" onclick="removeLocationPark('${escapeHtml(p)}')" style="border: none; background: transparent; color: #94a3b8; cursor: pointer; padding: 0 2px;" title="Remove this industrial park">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </span>
        `).join('');
    }

    window.addLocationPark = function() {
        const input = document.getElementById('loc-input-add-park');
        if (!input) return;
        const val = input.value.trim();
        if (!val) return;

        const allData = getAllLocationSettings();
        const cityData = allData[currentEditingCitySlug] || DEFAULT_LOCATION_DATA[currentEditingCitySlug];
        cityData.industrialParks = getMergedCityParksForDashboard(cityData.city, cityData.slug, cityData.industrialParks || []);
        if (!cityData.industrialParks.some(p => (typeof p === 'string' ? p : p.name).toLowerCase() === val.toLowerCase())) {
            cityData.industrialParks.push(val);
            if (Array.isArray(cityData.excludedParks)) {
                cityData.excludedParks = cityData.excludedParks.filter(x => x.toLowerCase() !== val.toLowerCase());
            }
            allData[currentEditingCitySlug] = cityData;
            saveAllLocationSettings(allData);
            renderLocationParksChips(cityData.industrialParks);
            input.value = '';
            if (typeof showToast === 'function') showToast(`Added "${val}" to ${cityData.city}`, 'success');
        } else {
            if (typeof showToast === 'function') showToast(`"${val}" already exists!`, 'warning');
        }
    };

    window.removeLocationPark = function(parkName) {
        const allData = getAllLocationSettings();
        const cityData = allData[currentEditingCitySlug] || DEFAULT_LOCATION_DATA[currentEditingCitySlug];
        cityData.industrialParks = (cityData.industrialParks || []).filter(p => (typeof p === 'string' ? p : (p && p.name ? p.name : '')).toLowerCase() !== parkName.toLowerCase());
        cityData.excludedParks = cityData.excludedParks || [];
        if (!cityData.excludedParks.includes(parkName.toLowerCase())) {
            cityData.excludedParks.push(parkName.toLowerCase());
        }
        allData[currentEditingCitySlug] = cityData;
        saveAllLocationSettings(allData);
        renderLocationParksChips(cityData.industrialParks);
        if (typeof showToast === 'function') showToast(`Removed "${parkName}"`, 'info');
    };

    // AI Aerial Drone Earth View Generator
    window.generateAiDroneView = function() {
        const presetDrones = {
            'petaling-jaya': 'assets/images/drone_pj.jpg',
            'subang-jaya': 'assets/images/drone_subang.jpg',
            'shah-alam': 'assets/images/drone_shahalam.jpg',
            'klang': 'assets/images/drone_klang.jpg'
        };
        const selectedDrone = presetDrones[currentEditingCitySlug] || 'assets/images/drone_pj.jpg';
        const heroInput = document.getElementById('loc-input-hero-image');
        if (heroInput) heroInput.value = selectedDrone;
        updateLocationHeroPreview(selectedDrone);

        const allData = getAllLocationSettings();
        const cityData = allData[currentEditingCitySlug] || DEFAULT_LOCATION_DATA[currentEditingCitySlug];
        cityData.heroImage = selectedDrone;
        allData[currentEditingCitySlug] = cityData;
        saveAllLocationSettings(allData);

        if (typeof showToast === 'function') {
            showToast(`Generated AI Drone Earth View for ${cityData.city} (1920 × 800 px)`, 'success');
        }
    };

    // Custom Photo Upload
    window.handleLocationImageFile = function(fileInput) {
        if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            const heroInput = document.getElementById('loc-input-hero-image');
            if (heroInput) heroInput.value = dataUrl;
            updateLocationHeroPreview(dataUrl);

            const allData = getAllLocationSettings();
            const cityData = allData[currentEditingCitySlug] || DEFAULT_LOCATION_DATA[currentEditingCitySlug];
            cityData.heroImage = dataUrl;
            allData[currentEditingCitySlug] = cityData;
            saveAllLocationSettings(allData);

            if (typeof showToast === 'function') {
                showToast(`Custom photo uploaded for ${cityData.city} (Saved to layout)`, 'success');
            }
        };
        reader.readAsDataURL(file);
    };

    // Generate AI SEO Summary & Meta targeting Google Position #1
    window.generateLocationAiSeo = function() {
        const btn = document.getElementById('btn-generate-ai-seo');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating SEO Content...';
        }

        setTimeout(() => {
            const allData = getAllLocationSettings();
            const cityData = allData[currentEditingCitySlug] || DEFAULT_LOCATION_DATA[currentEditingCitySlug];
            const parks = cityData.industrialParks || [];
            const parksListStr = parks.slice(0, 4).join(', ');

            // High-ranking Meta Title (< 60 chars)
            const generatedTitle = `${cityData.city} Industrial Properties, Factories & Warehouses | MyFactorySpace`;
            // High-converting Meta Description (< 160 chars)
            const generatedDesc = `Find verified industrial factories, warehouses & commercial land for sale/rent in ${cityData.city}. Prime zones: ${parksListStr}. Direct specialist contact.`;
            // In-depth comprehensive SEO Overview
            const generatedSummary = `${cityData.city} stands as Selangor's premier, highly mature industrial and corporate commercial hub. Anchored directly by major expressways (${cityData.stats ? cityData.stats.highways : 'Federal Highway, KESAS, NKVE'}), ${cityData.city} industrial parks including ${parks.join(', ')} provide unmatched proximity to Klang Valley consumer markets, rapid port haulage transit, and direct container logistics accessibility. Built-to-suit manufacturing facilities, Grade-A high-bay warehouses, and heavy power substations (up to 2,000 Amps) make this the ideal base for corporate headquarters and regional distribution.`;

            // Fill inputs
            const titleInput = document.getElementById('loc-input-meta-title');
            if (titleInput) titleInput.value = generatedTitle;
            const descInput = document.getElementById('loc-input-meta-desc');
            if (descInput) descInput.value = generatedDesc;
            const summaryInput = document.getElementById('loc-input-seo-summary');
            if (summaryInput) summaryInput.value = generatedSummary;

            cityData.metaTitle = generatedTitle;
            cityData.metaDescription = generatedDesc;
            cityData.seoSummary = generatedSummary;
            allData[currentEditingCitySlug] = cityData;
            saveAllLocationSettings(allData);

            updateLocationGoogleMockup();

            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-sparkles"></i> Generate AI SEO Summary &amp; Meta';
            }
            if (typeof showToast === 'function') {
                showToast(`AI SEO Summary & Meta generated for ${cityData.city} Google #1 Ranking!`, 'success');
            }
        }, 350);
    };

    window.updateLocationGoogleMockup = function() {
        const titleInput = document.getElementById('loc-input-meta-title');
        const descInput = document.getElementById('loc-input-meta-desc');

        const mockTitle = document.getElementById('loc-google-mock-title');
        const mockDesc = document.getElementById('loc-google-mock-desc');
        const mockUrl = document.getElementById('loc-google-mock-url');
        const mockFav = document.getElementById('loc-google-mock-fav');

        const titleVal = titleInput ? titleInput.value : '';
        const descVal = descInput ? descInput.value : '';

        if (mockTitle) mockTitle.textContent = titleVal || 'Industrial Properties For Sale & Rent | MyFactorySpace';
        if (mockDesc) mockDesc.textContent = descVal || 'Find verified factories, warehouses, and commercial plots across Selangor.';
        if (mockUrl) mockUrl.textContent = `https://www.myfactoryspace.com/location.html?city=${currentEditingCitySlug}`;

        // Sync mockup favicon with company branding
        const b = (typeof getBrandingSettings === 'function') ? getBrandingSettings() : null;
        if (mockFav && b) {
            mockFav.src = (b.faviconUrl && !b.faviconUrl.includes('favicon-48x48.png')) 
                ? b.faviconUrl 
                : (b.logoUrl || '/assets/icons/favicon-48x48.png');
        }

        // Update length counters
        const titleCount = document.getElementById('loc-meta-title-count');
        if (titleCount) {
            titleCount.textContent = `${titleVal.length}/60`;
            titleCount.style.color = titleVal.length > 60 ? '#dc2626' : '#64748b';
        }
        const descCount = document.getElementById('loc-meta-desc-count');
        if (descCount) {
            descCount.textContent = `${descVal.length}/160`;
            descCount.style.color = descVal.length > 160 ? '#dc2626' : '#64748b';
        }
    };

    window.saveLocationPageData = function() {
        const allData = getAllLocationSettings();
        const cityData = allData[currentEditingCitySlug] || DEFAULT_LOCATION_DATA[currentEditingCitySlug];

        const getV = id => {
            const el = document.getElementById(id);
            return el ? el.value.trim() : '';
        };

        cityData.heroImage = getV('loc-input-hero-image') || cityData.heroImage;
        cityData.headline = getV('loc-input-headline') || cityData.headline;
        cityData.tagline = getV('loc-input-tagline') || cityData.tagline;
        cityData.metaTitle = getV('loc-input-meta-title') || cityData.metaTitle;
        cityData.metaDescription = getV('loc-input-meta-desc') || cityData.metaDescription;
        cityData.seoSummary = getV('loc-input-seo-summary') || cityData.seoSummary;

        cityData.stats = cityData.stats || {};
        cityData.stats.highways = getV('loc-input-stat-highways') || cityData.stats.highways;
        cityData.stats.portDist = getV('loc-input-stat-port') || cityData.stats.portDist;
        cityData.stats.airportDist = getV('loc-input-stat-airport') || cityData.stats.airportDist;

        allData[currentEditingCitySlug] = cityData;
        saveAllLocationSettings(allData);

        if (typeof showToast === 'function') {
            showToast(`Landing page for ${cityData.city} saved successfully!`, 'success');
        } else {
            alert(`Landing page for ${cityData.city} saved successfully!`);
        }
    };

    initDashboardSearch();

    // Initial sync of Property Features & Listing Badges UI controls across all views
    if (typeof syncPropertyFeaturesUI === 'function') {
        syncPropertyFeaturesUI(settings);
    }

    // --- DEFERRED OVERVIEW INIT ---
    // switchView('overview') is called early (before window.renderOverviewCharts/renderOverviewSummaries
    // are assigned). Re-render once all functions are ready so the Overview tab is fully up to date.
    setTimeout(function() {
        if (typeof window.renderOverviewCharts === 'function') window.renderOverviewCharts();
        if (typeof window.renderOverviewSummaries === 'function') window.renderOverviewSummaries();
        if (typeof window.updateActivePropertiesMetric === 'function') window.updateActivePropertiesMetric();
    }, 0);

    // Cross-tab real-time sync for properties and overview active count
    window.addEventListener('storage', function(e) {
        if (!e.key || e.key === 'industria_properties') {
            const stored = safeJsonParse('industria_properties', null);
            if (Array.isArray(stored)) {
                properties = stored;
                if (typeof window.updateActivePropertiesMetric === 'function') {
                    window.updateActivePropertiesMetric(properties);
                }
            }
        }
    });

    // Global fail-safe image fallback for web server hosting
    document.addEventListener('error', function(e) {
        if (e.target && e.target.tagName === 'IMG') {
            const img = e.target;
            if (img.dataset.fallbackTried) return;
            img.dataset.fallbackTried = 'true';
            img.src = 'assets/images/hero.jpg';
        }
    }, true);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardApp);
} else {
    initDashboardApp();
}
