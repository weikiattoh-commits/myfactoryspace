// Lightweight visit tracker: logs one row per page view to Supabase `page_views`.
// A random anonymous ID (no personal data) is kept in localStorage to count unique visitors.
// Includes a 15-minute per-path session cooldown and idle-callback scheduling so analytics
// never blocks critical rendering (LCP/INP) or inflates counts on rapid page refreshes.
(function () {
    try {
        var host = location.hostname;
        if (host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:') return; // don't count local testing
        if (navigator.webdriver) return; // skip automated bots

        var KEY = 'industra_vid';
        var vid = localStorage.getItem(KEY);
        if (!vid) {
            vid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2));
            localStorage.setItem(KEY, vid);
        }

        var cleanPath = (location.pathname || '/').slice(0, 300);
        var sessionKey = 'industra_vt_' + cleanPath;
        var lastLogged = Number(sessionStorage.getItem(sessionKey) || 0);
        var now = Date.now();
        // Throttle identical path reloads within 15 minutes in the same tab session
        if (lastLogged && (now - lastLogged) < 15 * 60 * 1000) return;
        sessionStorage.setItem(sessionKey, String(now));

        var logVisit = function () {
            try {
                var client = window.IndustraSupabase && window.IndustraSupabase.getClient();
                if (!client) return;
                client.from('page_views').insert({
                    visitor_id: vid.slice(0, 64),
                    path: cleanPath,
                    referrer: (document.referrer || '').slice(0, 500) || null
                }).then(function (res) {
                    if (res.error) console.warn('Visit tracking failed:', res.error.message);
                });
            } catch (err) { /* ignore */ }
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(logVisit, { timeout: 3000 });
        } else {
            setTimeout(logVisit, 1200);
        }
    } catch (e) { /* never break the page for analytics */ }
})();

