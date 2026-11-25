/**
 * Location Landing Pages & SEO Engine
 * Powers dedicated landing pages for Petaling Jaya, Subang Jaya, Shah Alam, and Klang.
 * Target: Google No. 1 search positions for industrial real estate in Klang Valley.
 */

(function () {
    'use strict';

    // Storage key shared with Dashboard > Landing Page
    const LOCATION_SETTINGS_KEY = 'industria_location_settings';
    let currentCityData = null;

    // Default High-Ranking SEO & Real-World Industrial Data for the 4 Prime Cities
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
                parks: '7+ Key Clusters',
                highways: 'Federal, NPE, LDP',
                portDist: '30 Mins to Port Klang',
                airportDist: '18 Km to Subang (SZB)'
            },
            keyLogistics: [
                {
                    title: 'Highway Arteries',
                    desc: 'Direct on-ramps to Federal Highway, New Pantai Expressway (NPE), and Damansara-Puchong Highway (LDP).'
                },
                {
                    title: 'Port & Airport Links',
                    desc: '18km to Sultan Abdul Aziz Shah Airport (SZB), 32km to Port Klang terminals, and 48km to KLIA.'
                },
                {
                    title: 'Power & Infrastructure',
                    desc: 'Robust TNB substations supporting 150A to 1,200A 3-phase power and heavy floor slabs (15 to 30 kN/m²).'
                },
                {
                    title: 'High-Value Labor Pool',
                    desc: 'Immediate access to Selangor’s premier engineering, technical, and corporate management workforce.'
                }
            ],
            industrialParks: [
                'Section 51 Industrial Area',
                'Section 51A Industrial Park',
                'Section 13 Commercial & Industrial Hub',
                'Section 19 Industrial Zone',
                'Section 22 Industrial Estate',
                'Sunway Damansara Technology Park',
                'Kota Damansara Science Park'
            ],
            faqs: [
                {
                    q: 'What types of industrial properties are most prevalent in Petaling Jaya?',
                    a: 'Petaling Jaya predominantly features semi-detached factories, detached corporate headquarters, and high-tech urban logistics facilities. Older warehouses in Section 51 and 51A have been extensively rebuilt into modern 3-to-4 storey commercial showrooms and corporate production facilities.'
                },
                {
                    q: 'What are the typical electrical power specifications for factories in PJ?',
                    a: 'Standard semi-detached factories in PJ typically provide 100 to 200 Amp 3-phase supply. Standalone detached manufacturing facilities in Section 51 and 51A offer 300 to 1,000+ Amp, backed by direct TNB substations.'
                },
                {
                    q: 'Can 40ft container trailers access Petaling Jaya industrial estates?',
                    a: 'Yes. Major zones including Section 51, Section 51A, and Kota Damansara feature wide road reserves (66ft) specifically engineered for 40ft articulated container haulage and articulated trucks.'
                }
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
                parks: '6+ Prime Parks',
                highways: 'KESAS, ELITE, NPE',
                portDist: '25 Mins to Port Klang',
                airportDist: '12 Km to Subang (SZB)'
            },
            keyLogistics: [
                {
                    title: 'Highway Crossroads',
                    desc: 'Direct interlink to KESAS, ELITE Highway, Federal Highway, and New Pantai Expressway (NPE).'
                },
                {
                    title: 'Aviation Proximity',
                    desc: 'Only 12km to Sultan Abdul Aziz Shah Airport (SZB aerospace hub) and 35km to KLIA Cargo Terminal.'
                },
                {
                    title: 'Modern High-Bay Logistics',
                    desc: 'Clear ceiling heights from 30 to 45 ft, automated dock levellers, and 20 to 40 kN/m² slab capacity.'
                },
                {
                    title: 'DOE Clean Zoning',
                    desc: 'Approved light and medium industrial zoning ideal for high-tech, precision, and clean industries.'
                }
            ],
            industrialParks: [
                'Subang Hi-Tech Industrial Park',
                'USJ 19 Digital Mall Industrial Area',
                'Taman Perindustrian Subang (TP7)',
                'Subang Jaya Industrial Estate (SS13)',
                'USJ 1 Industrial Park',
                'Sunway Industrial Park'
            ],
            faqs: [
                {
                    q: 'Why do logistics and e-commerce companies prefer Subang Jaya?',
                    a: 'Subang Jaya sits at the confluence of KESAS, ELITE, and Federal Highway, providing rapid same-day dispatch access to Petaling Jaya, Kuala Lumpur, Shah Alam, and Putrajaya/Cyberjaya.'
                },
                {
                    q: 'What ceiling clearances are standard for warehouses in Subang Hi-Tech?',
                    a: 'Modern logistics facilities in Subang Hi-Tech and USJ feature clear heights between 30 to 40 feet (9 to 12 meters), supporting 5-tier pallet racking systems.'
                },
                {
                    q: 'Are industrial properties in Subang Jaya predominantly Freehold or Leasehold?',
                    a: 'Subang Jaya features a balanced mix: prominent estates like Subang Hi-Tech and SS13 offer coveted Freehold titles, while certain UEP parcels offer established 99-year leasehold tenures.'
                }
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
                parks: '10+ Industrial Zones',
                highways: 'NKVE, Federal, GCE',
                portDist: '20 Mins to Port Klang',
                airportDist: '15 Km to Subang (SZB)'
            },
            keyLogistics: [
                {
                    title: 'Expressway Interchanges',
                    desc: 'Direct junctions with NKVE, Guthrie Corridor (GCE), Federal Highway, ELITE, and KESAS.'
                },
                {
                    title: 'Port Klang Gateway',
                    desc: 'Dedicated heavy transport corridors delivering 20-minute haulage transit to Northport and Westport.'
                },
                {
                    title: 'Heavy Industry Utilities',
                    desc: 'TNB high-voltage incoming substations delivering 400A to 2,000+ Amps and natural gas pipeline access.'
                },
                {
                    title: 'Tier-1 Multinational Ecosystem',
                    desc: 'Surrounded by top automotive marques, FMCG cold chain facilities, and pharmaceutical logistics.'
                }
            ],
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
            ],
            faqs: [
                {
                    q: 'Which industrial areas in Shah Alam are best suited for corporate headquarters?',
                    a: 'Glenmarie (HICOM and Temasya) and Bukit Jelutong are the top choices for corporate headquarters, offering prestigious modern architecture, wide boulevards, and close proximity to Subang Jaya.'
                },
                {
                    q: 'Does Shah Alam have natural gas (Gas Malaysia) pipeline connectivity?',
                    a: 'Yes. Sections 15, 16, and Bukit Kemuning feature extensive natural gas reticulation pipelines operated by Gas Malaysia for heavy thermal processing and industrial manufacturing.'
                },
                {
                    q: 'What floor load capacity is standard for Shah Alam warehouse facilities?',
                    a: 'Standard industrial units range between 10 to 20 kN/m², while heavy Grade-A logistics warehouses in Section 22 and Bukit Jelutong provide up to 30 to 50 kN/m².'
                }
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
                parks: '7+ Port Gateways',
                highways: 'WCE, Shahpadu, KESAS',
                portDist: 'Immediate (North/Westport)',
                airportDist: '40 Mins to KLIA'
            },
            keyLogistics: [
                {
                    title: 'Seaport Terminals',
                    desc: 'Direct haulage minutes from Northport, Westport, and Southport deepwater container terminals.'
                },
                {
                    title: 'West Coast Expressway (WCE)',
                    desc: 'Direct heavy transit bypass to Northern Perak, Penang Port, and the Southern corridor.'
                },
                {
                    title: 'Free Commercial Zones (FCZ)',
                    desc: 'Extensive bonded warehouse facilities, duty-free transshipment, and automated container depots.'
                },
                {
                    title: 'Heavy Development Land',
                    desc: 'Medium and heavy industrial land plots ready for customized build-to-suit manufacturing.'
                }
            ],
            industrialParks: [
                'Bandar Sultan Suleiman (Northport) Industrial Park',
                'Pulau Indah Industrial Park (Westport)',
                'Bandar Bukit Raja Industrial Gateway',
                'Meru Industrial Park',
                'Kapar Industrial Estate',
                'Telok Gong Industrial Area',
                'Taman Klang Utama Industrial Zone'
            ],
            faqs: [
                {
                    q: 'What is the advantage of locating an industrial facility in Pulau Indah (Westport)?',
                    a: 'Pulau Indah offers direct container haulage to Westport terminals with zero toll congestion, gazetted Free Commercial Zone (FCZ) bonded status, and dedicated high-voltage power lines.'
                },
                {
                    q: 'Can heavy manufacturing industries operate in Klang?',
                    a: 'Yes. Zones such as Kapar, Telok Gong, and Bandar Sultan Suleiman offer gazetted Medium and Heavy Industrial zoning compliant with Department of Environment (DOE) standards.'
                },
                {
                    q: 'How does the West Coast Expressway (WCE) benefit industrial logistics in Klang?',
                    a: 'The WCE provides an uninterrupted commercial bypass avoiding Kuala Lumpur city traffic, connecting Port Klang directly to raw material suppliers and distribution points across Perak and Penang.'
                }
            ]
        }
    };


    // Load active settings (from localStorage or defaults)
    function getLocationSettings() {
        try {
            const raw = localStorage.getItem(LOCATION_SETTINGS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return Object.assign({}, DEFAULT_LOCATION_DATA, parsed);
            }
        } catch (e) {
            console.warn('Failed to parse location settings, using defaults:', e);
        }
        return DEFAULT_LOCATION_DATA;
    }

    // Determine current city slug from URL (?city=shah-alam)
    function resolveCurrentCity(allData) {
        const dataMap = allData || getLocationSettings();
        const params = new URLSearchParams(window.location.search);
        let slug = (params.get('city') || '').toLowerCase().trim();
        if (!slug || !dataMap[slug]) {
            const hash = window.location.hash.replace('#', '').toLowerCase();
            if (dataMap[hash]) {
                slug = hash;
            } else {
                slug = 'petaling-jaya'; // Default flagship city
            }
        }
        return slug;
    }

    function renderLocationSubNavBar(allData, activeSlug) {
        const navInner = document.querySelector('.city-nav-inner');
        if (!navInner) return;
        const visibleLocs = Object.values(allData).filter(loc => loc && loc.city && loc.showOnMainpage !== false);
        const iconMap = {
            'petaling-jaya': 'fa-city',
            'subang-jaya': 'fa-warehouse',
            'shah-alam': 'fa-industry',
            'klang': 'fa-anchor'
        };
        const labelHtml = `<span class="city-nav-label"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Hubs:</span>`;
        const linksHtml = visibleLocs.map(loc => {
            const ic = iconMap[loc.slug] || 'fa-map-location-dot';
            const isAct = loc.slug === activeSlug;
            return `<a href="location.html?city=${encodeURIComponent(loc.slug)}" class="city-nav-btn${isAct ? ' active' : ''}" id="city-nav-${escapeHtml(loc.slug)}"${isAct ? ' aria-current="page"' : ''}><i class="fa-solid ${ic}" aria-hidden="true"></i> ${escapeHtml(loc.city)}</a>`;
        }).join('');
        const allBtnHtml = `<a href="properties.html" class="city-nav-btn city-nav-btn--all"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> All Klang Valley</a>`;
        navInner.innerHTML = labelHtml + linksHtml + allBtnHtml;
        if (typeof window.bindHorizontalScrollHintObserver === 'function') {
            window.bindHorizontalScrollHintObserver(navInner);
        }
    }

    // Update Schema.org JSON-LD structured data for Googlebot SEO
    function updateSchemaMarkup(cityData) {
        const schemaEl = document.getElementById('location-schema-json');
        if (!schemaEl || !cityData) return;

        const currentUrl = `https://www.myfactoryspace.com/location.html?city=${cityData.slug}`;

        const schema = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "Place",
                    "@id": `${currentUrl}#place`,
                    "name": `${cityData.city} Industrial Zone`,
                    "description": cityData.seoSummary,
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": cityData.city,
                        "addressRegion": cityData.state || "Selangor",
                        "addressCountry": "MY"
                    }
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": `${currentUrl}#breadcrumb`,
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://www.myfactoryspace.com/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Industrial Locations",
                            "item": "https://www.myfactoryspace.com/properties.html"
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": cityData.city,
                            "item": currentUrl
                        }
                    ]
                },
                {
                    "@type": "FAQPage",
                    "@id": `${currentUrl}#faq`,
                    "mainEntity": (cityData.faqs || []).map(faq => ({
                        "@type": "Question",
                        "name": faq.q,
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": faq.a
                        }
                    }))
                }
            ]
        };

        schemaEl.textContent = JSON.stringify(schema, null, 2);
    }

    // --- DYNAMIC INDUSTRIAL PARKS DIRECTORY REFLECTION SYSTEM ---
    function cityMatches(targetCity, cityName, citySlug) {
        if (!targetCity) return false;
        let t = String(targetCity).toLowerCase().trim().replace(/klang\s+valley/gi, '');
        const c = String(cityName || '').toLowerCase().trim().replace(/klang\s+valley/gi, '');
        const s = String(citySlug || '').toLowerCase().trim();
        if (!t) return false;
        if (t === c || t === s) return true;
        if (c && (t.includes(c) || c.includes(t))) return true;
        if (s && (t.includes(s) || s.includes(t))) return true;

        // Petaling Jaya synonyms & zones
        if ((s.includes('petaling') || c.includes('petaling')) &&
            (t.includes('petaling') || t.includes('pj') || t.includes('seksyen 51') || t.includes('section 51') || t.includes('tandang') || t.includes('sungai way') || t.includes('damansara'))) {
            return true;
        }

        // Subang Jaya synonyms & zones
        if ((s.includes('subang') || c.includes('subang')) &&
            (t.includes('subang') || t.includes('usj') || t.includes('sunway') || t.includes('sime uep') || t.includes('tp7') || t.includes('batu tiga'))) {
            return true;
        }

        // Shah Alam synonyms & zones
        if ((s.includes('shah-alam') || s.includes('shah alam') || c.includes('shah alam')) &&
            (t.includes('shah alam') || t.includes('sa ') || t === 'sa' || t.includes('bukit jelutong') || t.includes('glenmarie') || t.includes('kota kemuning') || t.includes('seksyen 15') || t.includes('section 15') || t.includes('seksyen 16') || t.includes('section 16') || t.includes('seksyen 22') || t.includes('section 22') || t.includes('seksyen 23') || t.includes('section 23') || t.includes('seksyen 26') || t.includes('section 26') || t.includes('seksyen 27') || t.includes('section 27') || t.includes('seksyen 28') || t.includes('section 28') || t.includes('seksyen 33') || t.includes('section 33') || t.includes('alam megah') || t.includes('sekitar 26') || t.includes('tiong nam'))) {
            return true;
        }

        // Klang synonyms & zones
        if ((s.includes('klang') || c.includes('klang')) &&
            (t.includes('klang') || t.includes('port klang') || t.includes('westport') || t.includes('northport') || t.includes('pulau indah') || t.includes('bukit raja') || t.includes('bandar bukit raja') || t.includes('telok gong') || t.includes('kapar') || t.includes('meru') || t.includes('pandamaran') || t.includes('sobena jaya') || t.includes('sultan suleiman'))) {
            return true;
        }

        return false;
    }

    // Merge parks from Location Settings, Dashboard > Parks (industria_industrial_parks), properties, and Supabase
    function getMergedCityParks(cityName, citySlug, initialParks = [], extraParks = []) {
        const parkMap = new Map();

        // 1. Initial configured parks in settings/defaults
        if (Array.isArray(initialParks)) {
            initialParks.forEach(p => {
                if (p && typeof p === 'string' && p.trim()) {
                    parkMap.set(p.trim().toLowerCase(), p.trim());
                }
            });
        }

        // 2. Parks from Dashboard > Parks (localStorage key: 'industria_industrial_parks')
        try {
            const raw = localStorage.getItem('industria_industrial_parks');
            if (raw) {
                const parsed = JSON.parse(raw);
                for (const c in parsed) {
                    if (cityMatches(c, cityName, citySlug)) {
                        const list = parsed[c];
                        if (Array.isArray(list)) {
                            list.forEach(item => {
                                if (!item) return;
                                const pName = typeof item === 'string' ? item.trim() : (item.name ? String(item.name).trim() : '');
                                const isHidden = typeof item === 'object' && item.hidden === true;
                                if (pName && !isHidden) {
                                    parkMap.set(pName.toLowerCase(), pName);
                                }
                            });
                        }
                    }
                }
            }
        } catch(e) {
            console.warn('Error reading dashboard industrial parks:', e);
        }

        // 3. Optional extra parks (e.g. from real-time Supabase query)
        if (Array.isArray(extraParks)) {
            extraParks.forEach(item => {
                if (!item) return;
                const pCity = item.city || item.location || '';
                if (cityMatches(pCity, cityName, citySlug)) {
                    const pName = typeof item === 'string' ? item.trim() : (item.name ? String(item.name).trim() : '');
                    const isHidden = typeof item === 'object' && item.hidden === true;
                    if (pName && !isHidden) {
                        parkMap.set(pName.toLowerCase(), pName);
                    }
                }
            });
        }

        // 4. Parks attached to active properties in this city
        try {
            const rawProps = localStorage.getItem('industria_properties');
            if (rawProps) {
                const props = JSON.parse(rawProps);
                if (Array.isArray(props)) {
                    props.forEach(pr => {
                        if (pr && pr.park && typeof pr.park === 'string' && pr.park.trim()) {
                            if (cityMatches(pr.location, cityName, citySlug)) {
                                const pName = pr.park.trim();
                                if (!parkMap.has(pName.toLowerCase())) {
                                    parkMap.set(pName.toLowerCase(), pName);
                                }
                            }
                        }
                    });
                }
            }
        } catch(e) {}

        return Array.from(parkMap.values());
    }
    window.cityMatches = cityMatches;
    window.getMergedCityParks = getMergedCityParks;

    function renderIndustrialParksChips(parks) {
        const chipsContainer = document.getElementById('location-parks-chips');
        if (!chipsContainer) return;

        if (parks && parks.length > 0) {
            const allChipHtml = `
                <button type="button" class="park-chip park-chip--reset active" data-park="__ALL__" aria-pressed="true" onclick="resetParkFilter()">
                    <i class="fa-solid fa-layer-group" aria-hidden="true"></i>
                    <span>All Parks (${parks.length})</span>
                </button>
            `;
            const parkChipsHtml = parks.map(park => `
                <button type="button" class="park-chip" data-park="${escapeHtml(park)}" aria-pressed="false" onclick="filterPropertiesByPark(this.getAttribute('data-park'))">
                    <i class="fa-solid fa-map-pin" aria-hidden="true"></i>
                    <span>${escapeHtml(park)}</span>
                </button>
            `).join('');
            chipsContainer.innerHTML = allChipHtml + parkChipsHtml;
            if (typeof window.bindHorizontalScrollHintObserver === 'function') {
                window.bindHorizontalScrollHintObserver(chipsContainer);
            }
        } else {
            chipsContainer.innerHTML = '<p style="color: #64748b; font-size: 0.8rem; margin: 0;">No industrial parks registered for this area yet.</p>';
        }
    }

    // Hydrate the location page UI
    window.renderLocationPage = function renderLocationPage() {
        const allData = getLocationSettings();
        const citySlug = resolveCurrentCity(allData);
        const rawCityData = allData[citySlug] || DEFAULT_LOCATION_DATA['petaling-jaya'];
        const data = Object.assign({
            state: 'Selangor',
            heroImage: rawCityData.cardImage || 'assets/images/drone_all.jpg',
            keyLogistics: [
                { title: 'Highway Connectivity', desc: `Direct expressway links connecting ${rawCityData.city} industrial parks to Klang Valley distribution corridors.` },
                { title: 'Port & Airport Access', desc: 'Convenient commercial haulage routes to Port Klang terminals, KLIA Cargo, and Subang Airport (SZB).' },
                { title: 'Industrial Infrastructure', desc: '3-phase high-amp power supply, heavy floor loading slabs, and wide articulated truck access roads.' },
                { title: 'Workforce & Ecosystem', desc: 'Established surrounding commercial townships, skilled technical talent, and supplier networks.' }
            ],
            faqs: [
                { q: `What industrial properties are available in ${rawCityData.city}?`, a: `${rawCityData.city} offers factories, logistics warehouses, and industrial land plots suited for manufacturing, storage, and regional distribution.` },
                { q: `How do I arrange a site viewing in ${rawCityData.city}?`, a: 'Select any property below or contact our specialist team via WhatsApp for full technical specs and viewing scheduling.' }
            ]
        }, rawCityData);
        if (!data.heroImage) data.heroImage = data.cardImage || 'assets/images/drone_all.jpg';
        currentCityData = data;

        renderLocationSubNavBar(allData, data.slug);

        // Gather all merged industrial parks (from Settings + Dashboard > Parks)
        const allParks = getMergedCityParks(data.city, data.slug, data.industrialParks);

        // 1. Meta Titles & Open Graph Tags
        document.title = data.metaTitle || `${data.city} Industrial Properties | MyFactorySpace`;
        const metaTitleEl = document.getElementById('page-meta-title');
        if (metaTitleEl) metaTitleEl.textContent = data.metaTitle;
        const metaDescEl = document.getElementById('page-meta-desc');
        if (metaDescEl) metaDescEl.setAttribute('content', data.metaDescription);

        const ogTitle = document.getElementById('og-title');
        if (ogTitle) ogTitle.setAttribute('content', data.metaTitle);
        const ogDesc = document.getElementById('og-desc');
        if (ogDesc) ogDesc.setAttribute('content', data.metaDescription);
        const ogUrl = document.getElementById('og-url');
        const cityCanonicalUrl = `https://www.myfactoryspace.com/location.html?city=${data.slug}`;
        if (ogUrl) ogUrl.setAttribute('content', cityCanonicalUrl);
        const canonicalEl = document.getElementById('page-canonical') || document.querySelector('link[rel="canonical"]');
        if (canonicalEl) canonicalEl.setAttribute('href', cityCanonicalUrl);

        // 2. Active Tab in City Navigation Bar
        document.querySelectorAll('.city-nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeNavBtn = document.getElementById(`city-nav-${data.slug}`);
        if (activeNavBtn) activeNavBtn.classList.add('active');

        // 3. Hero Visual & Headline
        const heroBg = document.getElementById('location-hero-bg');
        if (heroBg && data.heroImage) {
            heroBg.style.backgroundImage = `url('${data.heroImage}')`;
        }
        const heroTitle = document.getElementById('location-hero-title');
        if (heroTitle) heroTitle.innerHTML = data.headline || `${data.city} Industrial Properties`;
        const heroTagline = document.getElementById('location-hero-tagline');
        if (heroTagline) heroTagline.textContent = data.tagline || data.seoSummary;

        const badgeText = document.getElementById('location-badge-text');
        if (badgeText) badgeText.textContent = `${data.city} Industrial Cluster`;

        // 4. Quick Stats
        const statParks = document.getElementById('stat-parks-count');
        if (statParks) {
            let suffix = 'Key Clusters';
            if (data.stats && data.stats.parks) {
                const m = String(data.stats.parks).match(/^\d+\+?\s*(.*)$/);
                if (m && m[1]) suffix = m[1];
            }
            statParks.textContent = `${allParks.length}+ ${suffix}`;
        }
        const statHighways = document.getElementById('stat-highways');
        if (statHighways && data.stats) statHighways.textContent = data.stats.highways;
        const statPort = document.getElementById('stat-port-dist');
        if (statPort && data.stats) statPort.textContent = data.stats.portDist;
        const statAirport = document.getElementById('stat-airport-dist');
        if (statAirport && data.stats) statAirport.textContent = data.stats.airportDist;

        // 5. Section City Names
        ['breadcrumb-city-name', 'directory-city-name', 'properties-city-name', 'cta-city-name'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = data.city;
        });

        // 6. Industrial Parks Chips (Reflects all parks from Dashboard > Parks)
        renderIndustrialParksChips(allParks);

        // 7. SEO In-Depth Article
        const seoHeading = document.getElementById('seo-article-heading');
        if (seoHeading) seoHeading.textContent = `Strategic Industrial & Logistics Analysis — ${data.city}`;
        const seoContent = document.getElementById('seo-article-content');
        if (seoContent) {
            seoContent.innerHTML = `<p>${data.seoSummary || ''}</p>`;
        }

        // 8. Logistics Cards (Compact inline-icon cards)
        const logisticsGrid = document.getElementById('location-logistics-grid');
        if (logisticsGrid && data.keyLogistics) {
            const icons = ['fa-road', 'fa-plane-departure', 'fa-bolt', 'fa-users-gear', 'fa-ship', 'fa-shield-halved'];
            logisticsGrid.innerHTML = data.keyLogistics.map((item, idx) => `
                <div class="logistics-card">
                    <div class="logistics-card-head">
                        <div class="logistics-icon-wrap" aria-hidden="true">
                            <i class="fa-solid ${icons[idx % icons.length]}"></i>
                        </div>
                        <h3 class="logistics-card-title">${escapeHtml(item.title)}</h3>
                    </div>
                    <p class="logistics-card-desc">${escapeHtml(item.desc)}</p>
                </div>
            `).join('');
        }

        // 9. Native <details> FAQ Accordion
        const faqList = document.getElementById('location-faq-list');
        if (faqList && data.faqs) {
            faqList.innerHTML = data.faqs.map((faq, idx) => `
                <details class="faq-accordion-item"${idx === 0 ? ' open' : ''}>
                    <summary class="faq-accordion-header">
                        <span class="faq-marker" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
                        <span>${escapeHtml(faq.q)}</span>
                    </summary>
                    <div class="faq-accordion-body">
                        ${escapeHtml(faq.a)}
                    </div>
                </details>
            `).join('');
        }

        // 10. Update Schema.org
        updateSchemaMarkup(data);

        // 11. Load & Filter Properties for this city & sync live parks
        loadCityProperties(data.city, data.slug, allParks);
    }

    // Filter properties in grid by clicked industrial park
    let allLoadedCityProperties = [];
    window.filterPropertiesByPark = function (parkName) {
        document.querySelectorAll('.park-chip').forEach(c => {
            const isMatch = c.getAttribute('data-park') === parkName;
            c.classList.toggle('active', isMatch);
            c.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
        });

        const pLower = (parkName || '').toLowerCase().trim();
        const pQuery = pLower.replace(/industrial\s*(park|area|estate|gateway|zone|hub)/gi, '').replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
        const stopWords = new Set([
            'industrial', 'park', 'area', 'estate', 'gateway', 'zone', 'hub', 'the', 'and',
            'section', 'seksyen', 'jalan', 'taman', 'perindustrian', 'shah', 'alam',
            'petaling', 'jaya', 'subang', 'klang', 'bandar', 'business', 'commercial',
            'technology', 'science', 'digital', 'mall', 'selangor'
        ]);
        const pTokens = pLower.split(/[\s@(),\/-]+/).filter(w => w.length > 2 && !stopWords.has(w));
        const secNums = [];
        const secRe = /\b(?:section|seksyen)\s+([0-9a-z]+)\b/gi;
        let sm;
        while ((sm = secRe.exec(pLower)) !== null) {
            secNums.push(sm[1].toLowerCase());
        }

        const filtered = allLoadedCityProperties.filter(p => {
            const title = (p.title || '').toLowerCase();
            const road = (p.road || '').toLowerCase();
            const park = (p.park || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const combined = `${title} ${road} ${park} ${desc}`;

            if (combined.includes(pLower)) return true;
            if (pQuery && pQuery.length > 3 && combined.includes(pQuery)) return true;
            if (secNums.some(num => new RegExp(`\\b(?:section|seksyen)\\s+${num}\\b`, 'i').test(combined))) return true;
            if (pTokens.length > 0 && pTokens.some(token => combined.includes(token))) return true;
            return false;
        });

        renderPropertyCards(filtered, parkName);
    };

    window.resetParkFilter = function () {
        document.querySelectorAll('.park-chip').forEach(c => {
            const isAll = c.getAttribute('data-park') === '__ALL__';
            c.classList.toggle('active', isAll);
            c.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        renderPropertyCards(allLoadedCityProperties);
    };

    // Load Properties from Supabase, localStorage, or Cache for this specific city & reflect live cloud parks
    async function loadCityProperties(cityName, citySlug, baseParks = []) {
        const container = document.getElementById('location-properties-container');
        if (!container) return;

        let props = [];

        // 1. Check live Supabase memory or global window properties
        if (Array.isArray(window.__liveProperties) && window.__liveProperties.length > 0) {
            props = window.__liveProperties.slice();
        } else if (window.INITIAL_PROPERTIES && Array.isArray(window.INITIAL_PROPERTIES) && window.INITIAL_PROPERTIES.length > 0) {
            props = window.INITIAL_PROPERTIES.slice();
        } else if (window.properties && Array.isArray(window.properties) && window.properties.length > 0) {
            props = window.properties.slice();
        }

        // 2. Check localStorage 'industria_properties'
        if (props.length === 0) {
            try {
                const stored = localStorage.getItem('industria_properties');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        props = parsed;
                    }
                }
            } catch(e) {
                console.warn('Error reading stored properties:', e);
            }
        }

        // Cleanse legacy hardcoded mock titles only (preserve genuine Supabase properties with any ID)
        const mockTitles = [
            'SIME UEP Modern Logistics Facility',
            'Sime Darby Industrial Plot',
            'Westport High-Bay Logistics Hub',
            'Northport Heavy Industrial Factory',
            'Subang Hi-Tech Corporate Industrial Facility',
            'Seksyen 51A Prime Logistics Warehouse'
        ];
        if (Array.isArray(props)) {
            props = props.filter(p => p && !mockTitles.includes(p.title));
        }

        function formatLocalPrice(val, intent) {
            if (!val) return 'RM 0';
            let str = String(val).trim();
            if (str.includes(',') && str.toLowerCase().includes('rm')) return str;
            const isRent = (intent && String(intent).toLowerCase() === 'rent') || str.toLowerCase().includes('/ mo') || str.toLowerCase().includes('/mo');
            const numOnly = str.replace(/[^0-9.]/g, '');
            if (!numOnly) return str;
            const parts = numOnly.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return `RM ${parts.join('.')}${isRent && !str.toLowerCase().includes('/ mo') ? ' / mo' : ''}`;
        }

        function normalizePropertyData(p) {
            if (!p) return null;
            const base = (p.specs && typeof p.specs === 'object') ? p.specs : {};
            const rawIntent = p.intent || base.intent || (p.price && String(p.price).toLowerCase().includes('mo') ? 'Rent' : 'Sale');
            const rawPrice = base.price || p.price || '';
            const fmtPrice = typeof window.formatPriceString === 'function'
                ? window.formatPriceString(rawPrice, rawIntent)
                : formatLocalPrice(rawPrice, rawIntent);
            const rawImgs = (Array.isArray(p.images) && p.images.length > 0)
                ? p.images
                : ((Array.isArray(base.images) && base.images.length > 0)
                    ? base.images
                    : ((Array.isArray(base.rawImages) && base.rawImages.length > 0)
                        ? base.rawImages
                        : ((p.image || base.image) ? [p.image || base.image] : [])));
            const propImages = rawImgs.filter(u => u && typeof u === 'string' && !u.startsWith('data:'));

            return Object.assign({}, base, p, {
                price: fmtPrice,
                intent: rawIntent,
                images: propImages,
                image: propImages[0] || p.image || base.image || 'assets/images/hero.jpg'
            });
        }

        function filterForCity(list) {
            if (!Array.isArray(list)) return [];
            return list.filter(p => {
                if (!p) return false;
                return cityMatches(p.location, cityName, citySlug) ||
                       cityMatches(p.city, cityName, citySlug) ||
                       cityMatches(p.park, cityName, citySlug) ||
                       cityMatches(p.road, cityName, citySlug) ||
                       cityMatches(p.title, cityName, citySlug);
            }).map(normalizePropertyData);
        }

        // Match properties for current city
        let matched = filterForCity(props);
        if (matched.length === 0 && window.INITIAL_PROPERTIES && Array.isArray(window.INITIAL_PROPERTIES)) {
            matched = filterForCity(window.INITIAL_PROPERTIES);
        }
        if (matched.length === 0 && window.properties && Array.isArray(window.properties)) {
            matched = filterForCity(window.properties);
        }

        allLoadedCityProperties = matched;
        renderPropertyCards(allLoadedCityProperties);

        if (window.location.search.includes('scroll=props') || window.location.hash === '#properties' || window.location.hash === '#location-properties-container') {
            const heading = document.getElementById('properties-city-name');
            if (heading) heading.scrollIntoView({ behavior: 'instant', block: 'start' });
        }

        // 3. If Supabase is available, query real-time properties AND real-time parks
        if (window.IndustraSupabase) {
            try {
                const fetchFn = typeof window.IndustraSupabase.fetchProperties === 'function'
                    ? window.IndustraSupabase.fetchProperties
                    : (typeof window.IndustraSupabase.getProperties === 'function' ? window.IndustraSupabase.getProperties : null);
                const livePropsPromise = fetchFn ? fetchFn.call(window.IndustraSupabase) : Promise.resolve(null);
                const liveParksPromise = typeof window.IndustraSupabase.fetchIndustrialParks === 'function' ? window.IndustraSupabase.fetchIndustrialParks() : Promise.resolve(null);

                const [liveProps, liveParks] = await Promise.all([livePropsPromise, liveParksPromise]);

                if (Array.isArray(liveProps) && liveProps.length > 0) {
                    const cleanedLive = liveProps.filter(p => p && !mockTitles.includes(p.title));
                    const liveMatched = filterForCity(cleanedLive);
                    if (liveMatched.length > 0) {
                        allLoadedCityProperties = liveMatched;
                        renderPropertyCards(allLoadedCityProperties);
                    }
                }

                if (Array.isArray(liveParks) && liveParks.length > 0) {
                    const refreshedParks = getMergedCityParks(cityName, citySlug, baseParks, liveParks);
                    renderIndustrialParksChips(refreshedParks);
                    const statParks = document.getElementById('stat-parks-count');
                    if (statParks) {
                        let suffix = 'Key Clusters';
                        if (currentCityData && currentCityData.stats && currentCityData.stats.parks) {
                            const m = String(currentCityData.stats.parks).match(/^\d+\+?\s*(.*)$/);
                            if (m && m[1]) suffix = m[1];
                        }
                        statParks.textContent = `${refreshedParks.length}+ ${suffix}`;
                    }
                }
            } catch (e) {
                console.warn('Live fetch error, falling back:', e);
            }
        }
    }

    // Render Property Cards into Grid using standard 100% matched card generator
    function renderPropertyCards(propsList, activeFilterName) {
        const container = document.getElementById('location-properties-container');
        if (!container) return;

        const cityName = (currentCityData && currentCityData.city) || 'this area';
        const count = Array.isArray(propsList) ? propsList.length : 0;
        const countEl = document.getElementById('loc-properties-count-text');
        if (countEl) {
            const noun = count === 1 ? 'Property' : 'Properties';
            countEl.textContent = activeFilterName
                ? `${count} ${noun} in ${activeFilterName}`
                : `${count} ${noun} in ${cityName}`;
        }

        if (count === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2.25rem 1.25rem; background: #f8fafc; border-radius: 14px; border: 1px solid #cbd5e1;">
                    <i class="fa-solid fa-building-circle-exclamation" aria-hidden="true" style="font-size: 1.85rem; color: #94a3b8; margin-bottom: 0.65rem; display: block;"></i>
                    <h3 style="font-family: 'Outfit', sans-serif; font-size: 1rem; color: #0f172a; margin: 0 0 0.35rem; font-weight: 700;">No active public listings in ${escapeHtml(activeFilterName || cityName)} right now</h3>
                    <p style="color: #475569; font-size: 0.82rem; max-width: 54ch; margin: 0 auto 1.1rem; line-height: 1.5;">
                        We regularly handle off-market and pre-launch industrial facilities in this cluster. Speak with our regional specialist for tailored options.
                    </p>
                    <div style="display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap;">
                        ${activeFilterName ? `<button type="button" onclick="resetParkFilter()" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px; border-radius: 9px; padding: 0.48rem 1rem; font-size: 0.8rem; font-weight: 700;"><i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i> All ${escapeHtml(cityName)} Listings</button>` : ''}
                        <a href="https://wa.me/60163117162?text=${encodeURIComponent(`Hi, I'm looking for industrial properties in ${activeFilterName || cityName}`)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px; border-radius: 9px; padding: 0.48rem 1rem; font-size: 0.8rem; font-weight: 700;">
                            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Inquire Off-Market Listings
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        const orderedProps = typeof window.sortPropertiesWithFeaturedPriority === 'function'
            ? window.sortPropertiesWithFeaturedPriority(propsList, 'date-desc')
            : propsList;

        container.innerHTML = '';
        orderedProps.forEach(prop => {
            if (typeof window.createStandardPropertyCard === 'function') {
                const card = window.createStandardPropertyCard(prop);
                if (card) container.appendChild(card);
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Cross-tab & Supabase auto sync: re-render location page whenever live data updates
    window.addEventListener('mfs:supabase-synced', () => {
        renderLocationPage();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'industria_industrial_parks' || e.key === 'industria_location_settings' || e.key === 'industria_properties' || e.key === 'industria_settings' || e.key === 'industria_agents') {
            renderLocationPage();
        }
    });

    async function syncLocationSettingsAndRender() {
        renderLocationPage();
        if (window.IndustraSupabase && typeof window.IndustraSupabase.fetchSiteSetting === 'function') {
            try {
                const sbLocs = await window.IndustraSupabase.fetchSiteSetting('location_landing_settings');
                if (sbLocs && typeof sbLocs === 'object') {
                    window.__liveLocationSettings = sbLocs;
                    if (typeof window.safeLocalStorageSet === 'function') {
                        window.safeLocalStorageSet(LOCATION_SETTINGS_KEY, sbLocs);
                    } else {
                        try { localStorage.setItem(LOCATION_SETTINGS_KEY, JSON.stringify(sbLocs)); } catch (_) {}
                    }
                    renderLocationPage();
                }
            } catch (e) {}
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncLocationSettingsAndRender);
    } else {
        syncLocationSettingsAndRender();
    }
})();
