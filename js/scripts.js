document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DOM ELEMENTS ---
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    const searchForm = document.getElementById('search-form');
    const heroLocationSelect = document.getElementById('heroLocationSelect');
    const heroTypeSelect = document.getElementById('heroTypeSelect');
    const propertyList = document.getElementById('property-list');
    const cityFilters = document.querySelectorAll('.city-filter-card');
    const typeFilters = document.querySelectorAll('.type-filter-btn');
    const intentBtns = document.querySelectorAll('.intent-btn');
    const sortSelect = document.getElementById('sort-select');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const resultsCountEl = document.getElementById('results-count');
    const leadForm = document.getElementById('lead-form');
    const leadSuccess = document.getElementById('lead-success');

    // --- STORAGE SANITIZER & SELF-HEALER ---
    (function sanitizeLocalStorage() {
        try {
            const rawPropsStr = localStorage.getItem('industria_properties');
            if (rawPropsStr) {
                const parsed = JSON.parse(rawPropsStr);
                if (!Array.isArray(parsed) || parsed.length === 0 || parsed.every(p => !p || !p.title || !p.location)) {
                    console.warn('Sanitizer: Clearing empty or invalid properties array in localStorage.');
                    localStorage.removeItem('industria_properties');
                }
            }
            const rawParks = localStorage.getItem('industria_industrial_parks');
            if (rawParks) {
                const parsedParks = JSON.parse(rawParks);
                if (!parsedParks || typeof parsedParks !== 'object' || Array.isArray(parsedParks)) {
                    console.warn('Sanitizer: Clearing invalid parks object in localStorage.');
                    localStorage.removeItem('industria_industrial_parks');
                }
            }
        } catch (e) {
            console.warn('Sanitizer error, clearing invalid storage keys:', e);
            try {
                localStorage.removeItem('industria_properties');
                localStorage.removeItem('industria_industrial_parks');
            } catch (err) {}
        }
    })();

    function escapeHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

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
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        try {
            localStorage.setItem(key, valueStr);
            return true;
        } catch (e) {
            console.warn(`localStorage.setItem quota notice for key "${key}", cleaning heavy base64 strings...`, e);
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
                } catch (err) {
                    console.warn('Silent fallback clean failed:', err);
                }
            }
            return false;
        }
    }

    // --- 2. DEFAULT & LOCAL STORAGE DATA ---
    const defaultParks = {
        'Petaling Jaya': ['PJ 51 Industrial Park', 'PJ 51 Business Centre', 'Tiong Nam Industrial Park PJ', 'PJS 5'],
        'Shah Alam': ['Hicom-Glenmarie Industrial Park', 'Ace Industrial Park', 'Ace Industrial', 'Tiong Nam Industrial Park Shah Alam', 'Tiong Nam Industrial Park', 'Batu Tiga Light Industrial Park', 'Temasya Industrial Park', 'i-Parc 1', 'i-Parc 2', 'Sekitar 26', 'Hicom 27'],
        'Subang Jaya': ['SIME UEP Industrial Park', 'Subang Hi-Tech Industrial Park', 'PJS 11 (Bandar Sunway)', 'PJS 7 (Bandar Sunway)'],
        'Klang': ['Bandar Bukit Raja Industrial Park']
    };
    
    function getDefaultSectionForPark(parkName) {
        if (!parkName) return '';
        const name = String(parkName).toLowerCase();
        if (name.includes('pj 51') || name.includes('pjs 5')) return 'Seksyen 51';
        if (name.includes('ace industrial') || name.includes('15/') || name.includes('tiong nam industrial park shah alam') || (name.includes('tiong nam') && !name.includes('pj'))) return 'Seksyen 15';
        if (name.includes('sekitar 26') || name.includes('i-parc 1') || name.includes('i-parc 2') || name.includes('26/')) return 'Seksyen 26';
        if (name.includes('hicom 27') || name.includes('27/')) return 'Seksyen 27';
        if (name.includes('glenmarie') || name.includes('temasya')) return 'Glenmarie';
        if (name.includes('batu tiga')) return 'Batu Tiga';
        if (name.includes('sime uep')) return 'SIME UEP';
        if (name.includes('subang hi-tech')) return 'Subang Hi-Tech';
        if (name.includes('pjs 11') || name.includes('pjs 7') || name.includes('sunway')) return 'Bandar Sunway';
        if (name.includes('bukit raja')) return 'Bandar Bukit Raja';
        return '';
    }

    let parks = safeJsonParse('industria_industrial_parks', defaultParks);
    if (!parks || typeof parks !== 'object') parks = defaultParks;
    for (const city in parks) {
        if (Array.isArray(parks[city])) {
            parks[city] = parks[city].map(park => {
                let pObj = typeof park === 'string' ? { name: park, section: '', hidden: false } : (park || { name: '', section: '', hidden: false });
                if (pObj && typeof pObj === 'object' && !pObj.section) {
                    pObj.section = getDefaultSectionForPark(pObj.name);
                }
                return pObj;
            });
        } else {
            parks[city] = [];
        }
    }
    safeLocalStorageSet('industria_industrial_parks', parks);

    function getSectionForProperty(prop) {
        if (!prop) return '';
        if (prop.section) return prop.section;
        if (prop.park && prop.location && parks && parks[prop.location] && Array.isArray(parks[prop.location])) {
            const found = parks[prop.location].find(p => (p && typeof p === 'object' ? p.name : p) === prop.park);
            if (found && typeof found === 'object' && found.section) {
                return found.section;
            }
        }
        if (prop.park && parks && typeof parks === 'object') {
            for (const city in parks) {
                if (Array.isArray(parks[city])) {
                    const found = parks[city].find(p => (p && typeof p === 'object' ? p.name : p) === prop.park);
                    if (found && typeof found === 'object' && found.section) {
                        return found.section;
                    }
                }
            }
        }
        return getDefaultSectionForPark(prop.park || '');
    }

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

    const defaultCleanImages = {
        1: 'assets/images/seksyen_51_factory.jpg',
        2: 'assets/images/drone_shahalam.jpg',
        3: 'assets/images/factory.jpg',
        4: 'assets/images/hero.jpg',
        5: 'assets/images/drone_subang.jpg',
        6: 'assets/images/drone_klang.jpg'
    };

    const defaultPropertyDescriptions = {
        1: 'Modern 3-storey semi-detached corporate factory in PJ 51 Industrial Park, Petaling Jaya. Features 13,000 sqft land area with 9,500 sqft built-up space, 150 Amp 3-phase power supply, and 1-ton passenger/cargo lift. Strategic frontage along Jalan Tandang with immediate connectivity to Federal Highway, NPE, and LDP for seamless Klang Valley logistics distribution.',
        2: 'Prime freehold semi-detached commercial & industrial facility in Sekitar 26, Shah Alam. Features 9,900 sqft land area with 8,800 sqft built-up area, high-volume ceiling clearance, and 150 Amp power infrastructure. Ideal for corporate headquarters, light assembly, showroom, and regional distribution with direct access to KESAS and LKSA.',
        3: 'High-spec semi-detached factory for rent in Ace Industrial Park, Section 15 Shah Alam. Offers 9,800 sqft land size, 8,800 sqft functional built-up, 5 kN/m² floor loading capacity, and 150 Amp power. Excellent container accessibility and turning radius, positioned minutes away from Federal Highway and KESAS expressway.',
        4: 'Well-established semi-detached industrial unit in Section 15 Shah Alam. Comprising 9,900 sqft land plot and 8,800 sqft built-up, equipped with 150 Amp power, cargo lift facilities, and wide frontage. Tailored for production, warehousing, and corporate operations with quick links to central Klang Valley expressways.'
    };

    const defaultProperties = [
        { id: 1, title: 'PJ 51 Business Park', location: 'Petaling Jaya', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Sale', tenure: 'Leasehold', park: 'PJ 51 Industrial Park', road: 'Jalan Tandang 51/205A', landArea: '13,000 sqft', size: '9,500 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '', ceilingPeak: '', price: 'RM 12,000,000', availableUnits: '2', status: 'Active', featured: true, showOnMainpage: true, dateCreated: '2026-10-03', lastUpdated: '2026-10-03', image: 'assets/images/seksyen_51_factory.jpg', images: ['assets/images/seksyen_51_factory.jpg', 'assets/images/drone_pj.jpg'], description: defaultPropertyDescriptions[1] },
        { id: 2, title: 'Sekitar 26 Business Park', location: 'Shah Alam', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Sale', tenure: 'Freehold', park: 'Sekitar 26', road: 'Jalan Serendah 26/41', landArea: '9,900 sqft', size: '8,800 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '', ceilingPeak: '', price: 'RM 7,000,000', availableUnits: '1', status: 'Active', featured: true, showOnMainpage: true, dateCreated: '2026-10-04', lastUpdated: '2026-10-04', image: 'assets/images/drone_shahalam.jpg', images: ['assets/images/drone_shahalam.jpg'], description: defaultPropertyDescriptions[2] },
        { id: 3, title: 'Ace Industrial Park', location: 'Shah Alam', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Rent', tenure: 'Freehold', park: 'Ace Industrial Park', road: 'Jalan 15/24', landArea: '9,800 sqft', size: '8,800 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '5', ceilingPeak: '', price: 'RM 25,000 / mo', availableUnits: '2', status: 'Active', featured: true, showOnMainpage: true, dateCreated: '2026-10-01', lastUpdated: '2026-10-01', image: 'assets/images/factory.jpg', images: ['assets/images/factory.jpg', 'assets/images/drone_shahalam.jpg'], description: defaultPropertyDescriptions[3] },
        { id: 4, title: 'Tiong Nam Industrial Park @ Shah Alam', location: 'Shah Alam', type: 'Semi-Detached Factory', usage: 'Production', intent: 'Sale', tenure: 'Leasehold', park: 'Tiong Nam Industrial Park Shah Alam', road: 'Jalan 15/22, Jalan 15/23', landArea: '9,900 sqft', size: '8,800 sqft', lift: '1', power: '150', loadingBay: '0', floorLoading: '', ceilingPeak: '', price: 'RM 7,000,000', availableUnits: '1', status: 'Active', featured: true, showOnMainpage: true, dateCreated: '2026-09-25', lastUpdated: '2026-09-25', image: 'assets/images/hero.jpg', images: ['assets/images/hero.jpg'], description: defaultPropertyDescriptions[4] }
    ];

    const defaultPropertyImagesMap = {
        1: ['assets/images/seksyen_51_factory.jpg', 'assets/images/drone_pj.jpg'],
        2: ['assets/images/drone_shahalam.jpg'],
        3: ['assets/images/factory.jpg', 'assets/images/drone_shahalam.jpg'],
        4: ['assets/images/hero.jpg']
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
            safeLocalStorageSet('industria_properties', properties);
        }
    }
    if (!Array.isArray(properties) || properties.length === 0 || properties.every(p => !p || !p.title || !p.location)) {
        properties = defaultProperties;
        safeLocalStorageSet('industria_properties', properties);
    } else {
        properties = properties.filter(p => p && typeof p === 'object' && p.title && p.location);
        if (properties.length === 0) {
            properties = defaultProperties;
            safeLocalStorageSet('industria_properties', properties);
        } else {
            // Auto-supplement missing baseline flagship properties (e.g. newly added Klang & Subang properties)
            let updated = false;
            defaultProperties.forEach(dp => {
                if (!properties.some(p => p && p.id === dp.id)) {
                    properties.push(dp);
                    updated = true;
                }
            });
            if (updated) {
                safeLocalStorageSet('industria_properties', properties);
            }
        }
    }
    // Export globally for cross-module coordination (location-landing, share-modal, etc.)
    window.INITIAL_PROPERTIES = properties;
    window.properties = properties;

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

    function getPropertyDescription(prop) {
        if (!prop) return '';
        if (prop.description && typeof prop.description === 'string' && prop.description.trim()) {
            return prop.description.trim().replace(/^[\r\n\s]+/, '').replace(/[\r\n\s]+$/, '');
        }
        if (prop.id && defaultPropertyDescriptions[prop.id]) {
            return defaultPropertyDescriptions[prop.id].trim();
        }
        const parts = [];
        parts.push(`Prime ${prop.type || 'industrial property'} located in ${prop.park || prop.location || 'Klang Valley'}.`);
        if (prop.landArea || (prop.size && prop.size !== 'N/A')) {
            const areaArr = [];
            if (prop.landArea) areaArr.push(`land area of ${prop.landArea}`);
            if (prop.size && prop.size !== 'N/A') areaArr.push(`built-up space of ${prop.size}`);
            parts.push(`Features ${areaArr.join(' with ')}.`);
        }
        if (prop.power && prop.power !== '0') {
            parts.push(`Equipped with ${prop.power} Amp 3-phase power supply.`);
        }
        if (prop.floorLoading && prop.floorLoading !== '0') {
            parts.push(`Reinforced floor loading capacity of ${prop.floorLoading} kN/m².`);
        }
        if (prop.ceilingClear || prop.ceilingPeak) {
            parts.push(`Ceiling height clearance of ${prop.ceilingClear || prop.ceilingPeak} ft.`);
        }
        parts.push(`Ideal for ${prop.usage || 'corporate production'} and logistics operations with fast access to major Klang Valley highways.`);
        return parts.join(' ');
    }

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
    window.formatPriceString = formatPriceString;

    // Sync with Supabase Database (Industra)
    async function syncWithSupabase(retryCount = 0) {
        if (!window.IndustraSupabase) {
            if (retryCount < 10) {
                setTimeout(() => syncWithSupabase(retryCount + 1), 300);
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

                    const isFeat = (sp.featured !== null && sp.featured !== undefined) 
                        ? (sp.featured === true || String(sp.featured) === 'true') 
                        : (base.showOnMainpage === true || String(base.showOnMainpage) === 'true' || base.featured === true || String(base.featured) === 'true');

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
                        height: sp.height || sp.ceiling_height || base.height || '',
                        floorLoad: sp.floor_load || base.floorLoad || '',
                        floorLoading: sp.floor_load || base.floorLoading || base.floorLoad || '',
                        ceilingPeak: sp.ceiling_peak !== null && sp.ceiling_peak !== undefined ? String(sp.ceiling_peak) : (base.ceilingPeak || ''),
                        ceilingEave: sp.ceiling_eave !== null && sp.ceiling_eave !== undefined ? String(sp.ceiling_eave) : (base.ceilingEave || ''),
                        ceilingClear: sp.ceiling_clear !== null && sp.ceiling_clear !== undefined ? String(sp.ceiling_clear) : (base.ceilingClear || ''),
                        ceilingHeight: sp.ceiling_height !== null && sp.ceiling_height !== undefined ? String(sp.ceiling_height) : (base.ceilingHeight || base.height || ''),
                        road: sp.road || base.road || '',
                        mapUrl: (sp.specs && sp.specs.mapUrl) || sp.map_url || base.mapUrl || '',
                        googleMapUrl: (sp.specs && sp.specs.googleMapUrl) || sp.google_map_url || base.googleMapUrl || '',
                        googleEarthUrl: (sp.specs && sp.specs.googleEarthUrl) || sp.google_earth_url || base.googleEarthUrl || '',
                        usage: sp.usage || base.usage || '',
                        lift: sp.lift !== null && sp.lift !== undefined ? String(sp.lift) : (base.lift || ''),
                        loadingBay: sp.loading_bay !== null && sp.loading_bay !== undefined ? String(sp.loading_bay) : (base.loadingBay || ''),
                        availableUnits: sp.available_units !== null && sp.available_units !== undefined ? String(sp.available_units) : (base.availableUnits || ''),
                        compriseUnits: sp.comprise_units !== null && sp.comprise_units !== undefined ? String(sp.comprise_units) : (base.compriseUnits || ''),
                        description: sp.description || base.description || '',
                        status: sp.status || base.status || 'Active',
                        featured: isFeat,
                        showOnMainpage: isFeat,
                        images: propImages,
                        image: firstImg,
                        rawImages: rawImgs,
                        rawImage: firstRaw
                    });
                });
                // Ensure all authentic default properties (e.g. Klang Plot ID 6, Subang Facility ID 5) are preserved
                defaultProperties.forEach(dp => {
                    if (!mappedProps.some(p => p && String(p.id) === String(dp.id))) {
                        mappedProps.push(dp);
                    }
                });
                properties = mappedProps;
                window.INITIAL_PROPERTIES = properties;
                window.properties = properties;
                window._supabaseSyncComplete = true;
                safeLocalStorageSet('industria_properties', properties);
                if (typeof renderProperties === 'function') {
                    renderProperties();
                }
                if (typeof renderLocationPage === 'function') {
                    renderLocationPage();
                }
                if (typeof populateLeadInterest === 'function') {
                    populateLeadInterest();
                }
                applyWatermarksToProperties().then(() => {
                    if (typeof renderProperties === 'function') renderProperties();
                });
            } else if (sbProps === null && retryCount < 10) {
                setTimeout(() => syncWithSupabase(retryCount + 1), 500);
                return;
            }

            // Fetch industrial parks from Supabase
            const sbParks = await window.IndustraSupabase.fetchIndustrialParks();
            if (sbParks && Array.isArray(sbParks) && sbParks.length > 0) {
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
                if (typeof populateCityParkDropdowns === 'function') {
                    populateCityParkDropdowns();
                }
                if (typeof renderProperties === 'function') {
                    renderProperties();
                }
            }

            // Fetch agents from Supabase DB
            const sbAgents = await window.IndustraSupabase.fetchAgents();
            if (sbAgents && Array.isArray(sbAgents) && sbAgents.length > 0) {
                safeLocalStorageSet('industria_agents', sbAgents);
                if (typeof renderAgents === 'function') {
                    renderAgents();
                }
            }

            if (typeof window.IndustraSupabase.fetchSiteSetting === 'function') {
                const sbWatermark = await window.IndustraSupabase.fetchSiteSetting('watermark_settings');
                if (sbWatermark && typeof sbWatermark === 'object') {
                    safeLocalStorageSet('industria_watermark_settings', sbWatermark);
                }
                const sbGeneral = await window.IndustraSupabase.fetchSiteSetting('general_settings');
                if (sbGeneral && typeof sbGeneral === 'object') {
                    safeLocalStorageSet('industria_settings', sbGeneral);
                    if (sbGeneral.branding) {
                        safeLocalStorageSet('industria_branding_settings', sbGeneral.branding);
                        if (typeof applyBranding === 'function') {
                            applyBranding();
                        }
                    }
                    if (typeof applySiteSettings === 'function') {
                        applySiteSettings();
                    }
                }
            }
        } catch (e) {
            console.warn('Initial Supabase sync notice:', e);
            if (retryCount < 5) {
                setTimeout(() => syncWithSupabase(retryCount + 1), 1000);
            }
        }
    }
    syncWithSupabase();

    // Load Settings
    // Load Settings
    const defaultSettings = {
        whyChooseUs: "We are the leading specialists in industrial real estate\nacross Selangor's prime industrial belt.",
        aboutCard1Title: "Prime Locations",
        aboutCard1Desc: "Strategic positioning near major highways and ports (Port Klang) to optimize your supply chain logistics.",
        aboutCard2Title: "Modern Facilities",
        aboutCard2Desc: "High ceilings, various floor loading capacities, and advanced power infrastructures built for different tier of industries.",
        aboutCard3Title: "Expert Guidance",
        aboutCard3Desc: "Our consultants specialize purely in industrial premises, offering unmatched regulatory and market knowledge.",

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

        address: "No. 2-3, Jalan Radin Anum 2, Bandar Baru Sri Petaling, 57000 Kuala Lumpur",
        phone: "+60 3-9054 8582",
        email: "info@MyFactorySpace.com",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        tiktok: "https://tiktok.com",
        rednote: "https://xiaohongshu.com",
        copyright: "© 2026 MyFactorySpace Real Estate. All rights reserved.",

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
        timeFormat: '12h'
    };

    function applySiteSettings() {
        const siteSettings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});

        // Why Choose Us
        const frontWhyChoose = document.getElementById('front-why-choose-desc');
        if (frontWhyChoose && siteSettings.whyChooseUs) {
            let wcuText = siteSettings.whyChooseUs;
            if (wcuText.trim() === "We are the leading specialists in industrial real estate across Selangor's prime industrial belt.") {
                wcuText = "We are the leading specialists in industrial real estate\nacross Selangor's prime industrial belt.";
            }
            frontWhyChoose.style.whiteSpace = 'pre-line';
            frontWhyChoose.textContent = wcuText;
        }

        const aboutC1T = document.getElementById('front-about-card1-title');
        if (aboutC1T && siteSettings.aboutCard1Title) aboutC1T.textContent = siteSettings.aboutCard1Title;
        const aboutC1D = document.getElementById('front-about-card1-desc');
        if (aboutC1D && siteSettings.aboutCard1Desc) aboutC1D.textContent = siteSettings.aboutCard1Desc;

        const aboutC2T = document.getElementById('front-about-card2-title');
        if (aboutC2T && siteSettings.aboutCard2Title) aboutC2T.textContent = siteSettings.aboutCard2Title;
        const aboutC2D = document.getElementById('front-about-card2-desc');
        if (aboutC2D && siteSettings.aboutCard2Desc) aboutC2D.textContent = siteSettings.aboutCard2Desc;

        const aboutC3T = document.getElementById('front-about-card3-title');
        if (aboutC3T && siteSettings.aboutCard3Title) aboutC3T.textContent = siteSettings.aboutCard3Title;
        const aboutC3D = document.getElementById('front-about-card3-desc');
        if (aboutC3D && siteSettings.aboutCard3Desc) aboutC3D.textContent = siteSettings.aboutCard3Desc;

        // Services
        const frontServices = document.getElementById('front-services-desc');
        if (frontServices && siteSettings.services) {
            let svcText = siteSettings.services;
            if (svcText.trim() === "Comprehensive industrial real estate solutions tailored to your operational requirements.") {
                svcText = "Comprehensive industrial real estate solutions tailored\nto your operational requirements.";
            }
            frontServices.style.whiteSpace = 'pre-line';
            frontServices.textContent = svcText;
        }

        const s1T = document.getElementById('front-services-card1-title');
        if (s1T && siteSettings.servicesCard1Title) s1T.textContent = siteSettings.servicesCard1Title;
        const s1D = document.getElementById('front-services-card1-desc');
        if (s1D && siteSettings.servicesCard1Desc) s1D.textContent = siteSettings.servicesCard1Desc;
        const s1L = document.getElementById('front-services-card1-link');
        if (s1L && siteSettings.servicesCard1Link) s1L.innerHTML = `${siteSettings.servicesCard1Link} <i class="fa-solid fa-arrow-right"></i>`;

        const s2T = document.getElementById('front-services-card2-title');
        if (s2T && siteSettings.servicesCard2Title) s2T.textContent = siteSettings.servicesCard2Title;
        const s2D = document.getElementById('front-services-card2-desc');
        if (s2D && siteSettings.servicesCard2Desc) s2D.textContent = siteSettings.servicesCard2Desc;
        const s2L = document.getElementById('front-services-card2-link');
        if (s2L && siteSettings.servicesCard2Link) s2L.innerHTML = `${siteSettings.servicesCard2Link} <i class="fa-solid fa-arrow-right"></i>`;

        const s3T = document.getElementById('front-services-card3-title');
        if (s3T && siteSettings.servicesCard3Title) s3T.textContent = siteSettings.servicesCard3Title;
        const s3D = document.getElementById('front-services-card3-desc');
        if (s3D && siteSettings.servicesCard3Desc) s3D.textContent = siteSettings.servicesCard3Desc;
        const s3L = document.getElementById('front-services-card3-link');
        if (s3L && siteSettings.servicesCard3Link) s3L.innerHTML = `${siteSettings.servicesCard3Link} <i class="fa-solid fa-arrow-right"></i>`;

        // Property Owner List
        const oBadge = document.getElementById('front-owner-badge');
        if (oBadge && siteSettings.ownerBadge) oBadge.innerHTML = `<i class="fa-solid fa-handshake"></i> ${siteSettings.ownerBadge}`;
        const oHeading = document.getElementById('front-owner-heading');
        if (oHeading && siteSettings.ownerHeading) oHeading.textContent = siteSettings.ownerHeading;
        const oSubtitle = document.getElementById('front-owner-subtitle');
        if (oSubtitle && siteSettings.ownerSubtitle) {
            let ownSubText = siteSettings.ownerSubtitle;
            const normSub = ownSubText.replace(/\s+/g, ' ').trim();
            if (normSub === "Have a warehouse, factory, or industrial land plot in Klang Valley? Partner with Selangor's #1 industrial estate team for corporate buyer matching and fast transaction closing.") {
                ownSubText = "Have a warehouse, factory, or industrial land plot in Klang Valley?\nPartner with Selangor's #1 industrial estate team for\ncorporate buyer matching and fast transaction closing.";
            }
            oSubtitle.style.whiteSpace = 'pre-line';
            oSubtitle.textContent = ownSubText;
        }

        const oC1T = document.getElementById('front-owner-card1-title');
        if (oC1T && siteSettings.ownerCard1Title) oC1T.textContent = siteSettings.ownerCard1Title;
        const oC1D = document.getElementById('front-owner-card1-desc');
        if (oC1D && siteSettings.ownerCard1Desc) oC1D.textContent = siteSettings.ownerCard1Desc;

        const oC2T = document.getElementById('front-owner-card2-title');
        if (oC2T && siteSettings.ownerCard2Title) oC2T.textContent = siteSettings.ownerCard2Title;
        const oC2D = document.getElementById('front-owner-card2-desc');
        if (oC2D && siteSettings.ownerCard2Desc) oC2D.textContent = siteSettings.ownerCard2Desc;

        const oC3T = document.getElementById('front-owner-card3-title');
        if (oC3T && siteSettings.ownerCard3Title) oC3T.textContent = siteSettings.ownerCard3Title;
        const oC3D = document.getElementById('front-owner-card3-desc');
        if (oC3D && siteSettings.ownerCard3Desc) oC3D.textContent = siteSettings.ownerCard3Desc;

        // Owner FAQs
        const oFaq1Q = document.getElementById('front-owner-faq1-q');
        if (oFaq1Q && siteSettings.ownerFaq1Question) oFaq1Q.innerHTML = `<i class="fa-solid fa-chevron-right" style="color: var(--primary); font-size: 0.8rem; margin-right: 6px;"></i> ${siteSettings.ownerFaq1Question}`;
        const oFaq1A = document.getElementById('front-owner-faq1-a');
        if (oFaq1A && siteSettings.ownerFaq1Answer) oFaq1A.innerHTML = siteSettings.ownerFaq1Answer;

        const oFaq2Q = document.getElementById('front-owner-faq2-q');
        if (oFaq2Q && siteSettings.ownerFaq2Question) oFaq2Q.innerHTML = `<i class="fa-solid fa-chevron-right" style="color: var(--primary); font-size: 0.8rem; margin-right: 6px;"></i> ${siteSettings.ownerFaq2Question}`;
        const oFaq2A = document.getElementById('front-owner-faq2-a');
        if (oFaq2A && siteSettings.ownerFaq2Answer) oFaq2A.innerHTML = siteSettings.ownerFaq2Answer;

        const oFaq3Q = document.getElementById('front-owner-faq3-q');
        if (oFaq3Q && siteSettings.ownerFaq3Question) oFaq3Q.innerHTML = `<i class="fa-solid fa-chevron-right" style="color: var(--primary); font-size: 0.8rem; margin-right: 6px;"></i> ${siteSettings.ownerFaq3Question}`;
        const oFaq3A = document.getElementById('front-owner-faq3-a');
        if (oFaq3A && siteSettings.ownerFaq3Answer) oFaq3A.innerHTML = siteSettings.ownerFaq3Answer;

        // Owner FAQ Card Minimization & Expand Toggle
        if (!window._ownerFaqCardToggleInitialized) {
            window._ownerFaqCardToggleInitialized = true;
            const faqWrapper = document.getElementById('owner-faq-wrapper');
            const faqHeader = document.getElementById('owner-faq-header');

            function toggleOwnerFaqCard(forceState) {
                if (!faqWrapper) return;
                const shouldOpen = typeof forceState === 'boolean' ? forceState : !faqWrapper.classList.contains('open');
                if (shouldOpen) {
                    faqWrapper.classList.add('open');
                    if (faqHeader) faqHeader.setAttribute('aria-expanded', 'true');
                    const badgeText = faqWrapper.querySelector('.owner-faq-badge-text');
                    if (badgeText) badgeText.textContent = 'Hide FAQs';
                } else {
                    faqWrapper.classList.remove('open');
                    if (faqHeader) faqHeader.setAttribute('aria-expanded', 'false');
                    const badgeText = faqWrapper.querySelector('.owner-faq-badge-text');
                    if (badgeText) badgeText.textContent = '3 FAQs';
                }
            }

            if (faqHeader) {
                faqHeader.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleOwnerFaqCard();
                });
                faqHeader.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleOwnerFaqCard();
                    }
                });
            }

            if (faqWrapper) {
                faqWrapper.addEventListener('click', function(e) {
                    if (!faqWrapper.classList.contains('open')) {
                        toggleOwnerFaqCard(true);
                    }
                });
            }
        }

        // Owner FAQ Mobile Accordion Toggle
        if (!window._ownerFaqAccordionInitialized) {
            window._ownerFaqAccordionInitialized = true;
            document.addEventListener('click', function(e) {
                const faqItem = e.target.closest('.owner-faq-item');
                if (faqItem) {
                    const wasActive = faqItem.classList.contains('active');
                    const allFaqs = document.querySelectorAll('.owner-faq-item');
                    allFaqs.forEach(item => item.classList.remove('active'));
                    if (!wasActive) {
                        faqItem.classList.add('active');
                    }
                }
            });
        }

        // Contact Email
        if (siteSettings.email) {
            const frontEmail = document.getElementById('front-contact-email');
            if (frontEmail) {
                frontEmail.href = `mailto:${siteSettings.email}`;
                frontEmail.innerHTML = `<i class="fa-solid fa-envelope" style="margin-right:8px;"></i> ${siteSettings.email}`;
            }
            const frontMainEmail = document.getElementById('front-main-email');
            if (frontMainEmail) frontMainEmail.textContent = siteSettings.email;

            const propsFooterEmail = document.getElementById('props-footer-email');
            if (propsFooterEmail) {
                propsFooterEmail.href = `mailto:${siteSettings.email}`;
                propsFooterEmail.innerHTML = `<i class="fa-solid fa-envelope" style="margin-right:8px;"></i> ${siteSettings.email}`;
            }
            const propsMainEmail = document.getElementById('props-main-email');
            if (propsMainEmail) propsMainEmail.textContent = siteSettings.email;
        }

        // Contact Phone
        if (siteSettings.phone) {
            const cleanPhone = siteSettings.phone.replace(/[^0-9+]/g, '');
            const frontPhone = document.getElementById('front-contact-phone');
            if (frontPhone) {
                frontPhone.href = `tel:${cleanPhone}`;
                frontPhone.innerHTML = `<i class="fa-solid fa-phone" style="margin-right:8px;"></i> ${siteSettings.phone}`;
            }
            const frontMainPhone = document.getElementById('front-main-phone');
            if (frontMainPhone) frontMainPhone.textContent = siteSettings.phone;

            const propsFooterPhone = document.getElementById('props-footer-phone');
            if (propsFooterPhone) {
                propsFooterPhone.href = `tel:${cleanPhone}`;
                propsFooterPhone.innerHTML = `<i class="fa-solid fa-phone" style="margin-right:8px;"></i> ${siteSettings.phone}`;
            }
            const propsMainPhone = document.getElementById('props-main-phone');
            if (propsMainPhone) propsMainPhone.textContent = siteSettings.phone;
        }

        // Contact Address
        if (siteSettings.address) {
            const frontAddress = document.getElementById('front-contact-address');
            if (frontAddress) {
                frontAddress.innerHTML = `<i class="fa-solid fa-location-dot" style="margin-right:8px; color:var(--accent);"></i> ${siteSettings.address}`;
            }
            const frontMainAddress = document.getElementById('front-main-address');
            if (frontMainAddress) frontMainAddress.textContent = siteSettings.address;

            const propsFooterAddress = document.getElementById('props-footer-address');
            if (propsFooterAddress) {
                propsFooterAddress.innerHTML = `<i class="fa-solid fa-location-dot" style="margin-right:8px; color:var(--accent);"></i> ${siteSettings.address}`;
            }
            const propsMainAddress = document.getElementById('props-main-address');
            if (propsMainAddress) propsMainAddress.textContent = siteSettings.address;
        }

        // Social Media Links (Facebook, Instagram, TikTok, RedNote)
        const fbUrl = siteSettings.facebook || 'https://facebook.com';
        const igUrl = siteSettings.instagram || 'https://instagram.com';
        const ttUrl = siteSettings.tiktok || 'https://tiktok.com';
        const rnUrl = siteSettings.rednote || 'https://xiaohongshu.com';

        const socialContainers = document.querySelectorAll('.social-links');
        socialContainers.forEach(container => {
            container.innerHTML = `
                <a href="${escapeHtml(fbUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="${escapeHtml(igUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
                <a href="${escapeHtml(ttUrl)}" target="_blank" rel="noopener noreferrer" aria-label="TikTok" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
                <a href="${escapeHtml(rnUrl)}" target="_blank" rel="noopener noreferrer" aria-label="RedNote (小红书)" title="RedNote (小红书)"><span style="font-size: 10.5px; font-weight: 900; font-family: 'PingFang SC', 'Microsoft YaHei', 'SimHei', sans-serif; letter-spacing: -0.5px; line-height: 1; display: inline-block;">小红书</span></a>
            `;
        });

        // Footer Copyright Text
        const copyrightText = siteSettings.copyright || '&copy; 2026 MyFactorySpace Real Estate. All rights reserved.';
        const copyrightEls = document.querySelectorAll('.footer-bottom');
        copyrightEls.forEach(el => {
            el.innerHTML = copyrightText;
        });

        // Main WhatsApp Button Linking (Linked to Dashboard > Settings > Admin Management > Main WhatsApp Contact)
        const users = safeJsonParse('industria_users', []);
        let mainWaNum = '';
        if (Array.isArray(users) && users.length > 0) {
            const mainUser = users.find(u => u && u.isMainWhatsapp && u.whatsapp && u.whatsapp.trim() !== '');
            if (mainUser) {
                mainWaNum = mainUser.whatsapp.trim();
            } else {
                const adminUser = users.find(u => u && u.role === 'Administrator' && u.whatsapp && u.whatsapp.trim() !== '');
                if (adminUser) mainWaNum = adminUser.whatsapp.trim();
            }
        }
        if (!mainWaNum) {
            mainWaNum = siteSettings.whatsappNotificationNumber || siteSettings.mainWhatsapp || siteSettings.phone || '60312345678';
        }

        const cleanMainWa = mainWaNum.replace(/[^0-9]/g, '');
        if (cleanMainWa) {
            const waBtn1 = document.getElementById('main-whatsapp-btn-1');
            if (waBtn1) {
                waBtn1.href = `https://wa.me/${cleanMainWa}?text=${encodeURIComponent('Hello MyFactorySpace Specialist, I have custom industrial property requirements.')}`;
            }
            const waBtn2 = document.getElementById('main-whatsapp-btn-2');
            if (waBtn2) {
                waBtn2.href = `https://wa.me/${cleanMainWa}?text=${encodeURIComponent('Hello MyFactorySpace Team, I am a property owner and would like to list my industrial property.')}`;
            }
            const allWaLinks = document.querySelectorAll('.main-whatsapp-link');
            allWaLinks.forEach(link => {
                if (link.id !== 'main-whatsapp-btn-1' && link.id !== 'main-whatsapp-btn-2') {
                    const defaultMsg = link.getAttribute('data-wa-text') || 'Hello MyFactorySpace Real Estate, I would like to make an inquiry.';
                    link.href = `https://wa.me/${cleanMainWa}?text=${encodeURIComponent(defaultMsg)}`;
                }
            });
        }
    }

    function applyBranding() {
        let b = safeJsonParse('industria_branding_settings', null);
        if (!b) {
            const settings = safeJsonParse('industria_settings', null);
            if (settings && settings.branding) b = settings.branding;
        }
        if (!b) {
            b = { primaryColor: '#059669', primaryDarkColor: '#064e3b', accentColor: '#dcfce7', companyName: 'MyFactorySpace' };
        }

        const root = document.documentElement;
        const primary = b.primaryColor || '#059669';
        const primaryDark = b.primaryDarkColor || '#064e3b';
        const accent = b.accentColor || '#dcfce7';

        function hexToRgbaStr(hex, alpha) {
            if (!hex) return `rgba(37, 99, 235, ${alpha})`;
            hex = hex.replace('#', '');
            if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
            if (hex.length !== 6) return `rgba(37, 99, 235, ${alpha})`;
            const num = parseInt(hex, 16);
            if (isNaN(num)) return `rgba(37, 99, 235, ${alpha})`;
            return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
        }

        root.style.setProperty('--primary', primary);
        root.style.setProperty('--primary-dark', primaryDark);
        root.style.setProperty('--accent', accent);
        root.style.setProperty('--secondary', primary);
        root.style.setProperty('--primary-light', hexToRgbaStr(primary, 0.15));
        root.style.setProperty('--border-light', hexToRgbaStr(primary, 0.12));
        root.style.setProperty('--primary-glow', hexToRgbaStr(primary, 0.35));
        root.style.setProperty('--hero-gradient-start', hexToRgbaStr(primaryDark, 0.88));
        root.style.setProperty('--hero-gradient-end', hexToRgbaStr(primary, 0.65));

        const logoUrl = (b && b.logoUrl) ? b.logoUrl : '';
        let brandName = (b && b.companyName && String(b.companyName).trim() !== '') ? String(b.companyName).trim() : (logoUrl ? '' : 'MyFactorySpace');
        const logoH = (b && b.logoHeight !== undefined && b.logoHeight !== null && !isNaN(b.logoHeight)) ? parseInt(b.logoHeight, 10) : 32;
        const navLogoH = Math.round(logoH * 1.58);

        // Top Header Navbar Logos
        const navBrands = document.querySelectorAll('.nav-brand');
        navBrands.forEach(navBrand => {
            let brandHtml = '';
            if (logoUrl) {
                const marginStyle = brandName ? ' margin-right: 8px;' : '';
                brandHtml += `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName || 'Brand Logo')}" style="height: ${navLogoH}px; max-width: 310px; object-fit: contain; vertical-align: middle;${marginStyle}">`;
            } else {
                const marginStyle = brandName ? ' margin-right: 6px;' : '';
                brandHtml += `<i class="fa-solid fa-industry" style="color: var(--primary);${marginStyle}"></i>`;
            }
            if (brandName) {
                brandHtml += ` <span>${escapeHtml(brandName)}</span>`;
            }
            if (navBrand.innerHTML.trim() !== brandHtml.trim()) {
                navBrand.innerHTML = brandHtml;
            }
        });

        // Bottom Footer Brand Logos (Synchronized with Header Logo & Auto-Converted to White for Dark Backgrounds)
        const footerBrandTitles = document.querySelectorAll('.footer-brand h3, .footer-brand-title');
        footerBrandTitles.forEach(footerBrand => {
            let brandHtml = '';
            if (logoUrl) {
                const marginStyle = brandName ? ' margin-right: 8px;' : '';
                brandHtml += `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName || 'Brand Logo')}" style="height: ${Math.round(logoH * 1.25)}px; max-width: 240px; object-fit: contain; vertical-align: middle; filter: brightness(0) invert(1);${marginStyle}">`;
            } else {
                const marginStyle = brandName ? ' margin-right: 6px;' : '';
                brandHtml += `<i class="fa-solid fa-industry" style="color: #ffffff;${marginStyle}"></i>`;
            }
            if (brandName) {
                brandHtml += ` <span style="color: var(--white);">${escapeHtml(brandName)}</span>`;
            }
            if (footerBrand.innerHTML.trim() !== brandHtml.trim()) {
                footerBrand.innerHTML = brandHtml;
            }
        });

        // Synchronize Dynamic Favicon if custom faviconUrl is configured
        if (b && b.faviconUrl) {
            const favIcons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
            favIcons.forEach(fav => {
                if (fav.getAttribute('sizes') === '48x48' || !fav.getAttribute('sizes')) {
                    fav.href = b.faviconUrl;
                }
            });
        }
    }

    applySiteSettings();
    applyBranding();

    // --- 3. FILTER STATE & URL PARAMETER PARSING ---
    let activeCity = 'All';
    let activeType = 'All';
    let activeSection = 'All';
    let activePark = 'All';
    let activeIntent = 'All';
    let activeKeyword = '';
    let activeSort = 'date-desc'; // Default: Date Added (Newest First)

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('location')) activeCity = urlParams.get('location');
    if (urlParams.has('type')) activeType = urlParams.get('type');
    if (urlParams.has('section')) activeSection = urlParams.get('section');
    if (urlParams.has('park')) activePark = urlParams.get('park');
    if (urlParams.has('intent')) activeIntent = urlParams.get('intent');
    if (urlParams.has('keyword')) activeKeyword = urlParams.get('keyword');
    const directListingId = urlParams.get('id') || urlParams.get('propertyId');

    // Fast-path fetch for direct shared property if not already in local cache
    if (directListingId && Array.isArray(properties) && !properties.some(p => p && String(p.id) === String(directListingId))) {
        (async function fetchTargetPropertyFast() {
            try {
                if (window.IndustraSupabase) {
                    const client = window.IndustraSupabase.getClient();
                    if (client) {
                        const { data, error } = await client.from('properties').select('*').eq('id', String(directListingId)).maybeSingle();
                        if (data && !error) {
                            const base = data.specs && typeof data.specs === 'object' ? data.specs : {};
                            const rawPriceVal = base.price || (typeof data.price === 'number' ? `RM ${data.price}` : data.price) || '';
                            const rawIntent = base.intent || data.intent || (rawPriceVal && String(rawPriceVal).toLowerCase().includes('mo') ? 'Rent' : 'Sale');
                            const propImages = Array.isArray(data.images) && data.images.length > 0 ? data.images : (Array.isArray(base.images) && base.images.length > 0 ? base.images : [(base.image || data.image || 'assets/images/warehouse.jpg')]);
                            const mappedSingle = Object.assign({}, base, {
                                id: data.id,
                                title: data.title || base.title || '',
                                location: data.location || base.location || '',
                                park: data.park || base.park || '',
                                type: data.type || base.type || '',
                                tenure: data.tenure || base.tenure || '',
                                intent: rawIntent,
                                price: formatPriceString(rawPriceVal, rawIntent),
                                landArea: data.land_area ? formatAreaString(data.land_area) : (formatAreaString(base.landArea) || ''),
                                builtUp: data.built_up ? formatAreaString(data.built_up) : (formatAreaString(base.builtUp || base.size) || ''),
                                size: data.built_up ? formatAreaString(data.built_up) : (formatAreaString(base.size || base.builtUp) || ''),
                                description: data.description || base.description || '',
                                status: data.status || base.status || 'Active',
                                featured: true,
                                showOnMainpage: true,
                                images: propImages,
                                image: propImages[0] || 'assets/images/warehouse.jpg'
                            });
                            if (!properties.some(p => String(p.id) === String(mappedSingle.id))) {
                                properties.unshift(mappedSingle);
                                if (typeof renderProperties === 'function') renderProperties();
                            }
                        }
                    }
                }
            } catch(e) {
                console.warn('Fast-path fetch direct property error:', e);
            }
        })();
    }

    if (window.location.hash === '#browse-properties' || directListingId || urlParams.has('location') || urlParams.has('type') || urlParams.has('section') || urlParams.has('park') || urlParams.has('intent') || urlParams.has('keyword')) {
        setTimeout(() => {
            const browseSection = document.getElementById('browse-properties') || document.getElementById('properties');
            if (browseSection) {
                const headerOffset = 85;
                const elementPosition = browseSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
            }
        }, 120);
    }

    // --- 4. NAVIGATION & SCROLL HANDLERS ---
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.classList.contains('nav-dropdown-toggle') && window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = link.closest('.nav-item-dropdown');
                    if (parent) parent.classList.toggle('open');
                    return;
                }
                navLinks.classList.remove('active');
            });
        });
    }

    // --- 5. SEARCH & HERO FILTERS ---
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const heroKw = document.getElementById('heroKeywordInput');
            const kwVal = heroKw ? heroKw.value.trim() : '';
            const locVal = heroLocationSelect ? heroLocationSelect.value : 'All';
            const typeVal = heroTypeSelect ? heroTypeSelect.value : 'All';

            if (window.location.pathname.includes('properties.html')) {
                activeKeyword = kwVal;
                activeCity = locVal;
                activeType = typeVal;
                activeSection = 'All';
                activePark = 'All';
                
                const propKwInput = document.getElementById('property-keyword-search');
                if (propKwInput) propKwInput.value = kwVal;

                syncFilterUI();
                renderProperties();

                const browseSection = document.getElementById('browse-properties');
                if (browseSection) browseSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                const query = new URLSearchParams();
                if (kwVal) query.set('keyword', kwVal);
                if (locVal && locVal !== 'All') query.set('location', locVal);
                if (typeVal && typeVal !== 'All') query.set('type', typeVal);
                window.location.href = `properties.html?${query.toString()}`;
            }
        });
    }

    const citySelectFilter = document.getElementById('city-select-filter');
    const sectionSelectFilter = document.getElementById('section-select-filter');
    const parkSelectFilter = document.getElementById('park-select-filter');

    function populateSectionDropdown() {
        if (!sectionSelectFilter) return;
        
        sectionSelectFilter.innerHTML = '';
        
        const defaultOpt = document.createElement('option');
        defaultOpt.value = 'All';
        defaultOpt.textContent = activeCity === 'All' ? 'All Sections' : `All Sections in ${activeCity}`;
        sectionSelectFilter.appendChild(defaultOpt);
        
        let availableSections = new Set();
        let parksList = [];
        
        if (activeCity !== 'All' && parks[activeCity]) {
            parksList = parks[activeCity];
        } else {
            for (const c in parks) {
                if (Array.isArray(parks[c])) {
                    parksList = parksList.concat(parks[c]);
                }
            }
        }
        
        parksList.forEach(p => {
            const pName = typeof p === 'object' ? p.name : p;
            const pSec = typeof p === 'object' && p.section ? p.section : getDefaultSectionForPark(pName);
            if (pSec) availableSections.add(pSec);
        });

        if (Array.isArray(properties)) {
            properties.forEach(p => {
                if (activeCity === 'All' || p.location === activeCity) {
                    const sec = getSectionForProperty(p);
                    if (sec) availableSections.add(sec);
                }
            });
        }
        
        Array.from(availableSections).sort().forEach(secName => {
            const opt = document.createElement('option');
            opt.value = secName;
            opt.textContent = secName;
            sectionSelectFilter.appendChild(opt);
        });
        
        sectionSelectFilter.value = activeSection;
    }

    function populateParkDropdown() {
        if (!parkSelectFilter) return;
        
        parkSelectFilter.innerHTML = '';
        
        const defaultOpt = document.createElement('option');
        defaultOpt.value = 'All';
        if (activeSection !== 'All') {
            defaultOpt.textContent = `All Parks in ${activeSection}`;
        } else if (activeCity !== 'All') {
            defaultOpt.textContent = `All Parks in ${activeCity}`;
        } else {
            defaultOpt.textContent = 'All Parks';
        }
        parkSelectFilter.appendChild(defaultOpt);
        
        let availableParks = new Set();
        let parksList = [];
        
        if (activeCity !== 'All' && parks[activeCity]) {
            parksList = parks[activeCity];
        } else {
            for (const c in parks) {
                if (Array.isArray(parks[c])) {
                    parksList = parksList.concat(parks[c]);
                }
            }
        }
        
        parksList.forEach(p => {
            const pName = typeof p === 'object' ? p.name : p;
            const pSec = typeof p === 'object' && p.section ? p.section : getDefaultSectionForPark(pName);
            
            if (activeSection === 'All' || (pSec && pSec.toLowerCase() === activeSection.toLowerCase())) {
                if (pName) availableParks.add(pName);
            }
        });

        if (Array.isArray(properties)) {
            properties.forEach(p => {
                const matchesCity = activeCity === 'All' || p.location === activeCity;
                const propSec = getSectionForProperty(p);
                const matchesSection = activeSection === 'All' || (propSec && propSec.toLowerCase() === activeSection.toLowerCase());
                
                if (matchesCity && matchesSection && p.park) {
                    availableParks.add(p.park);
                }
            });
        }
        
        Array.from(availableParks).sort().forEach(parkName => {
            const opt = document.createElement('option');
            opt.value = parkName;
            opt.textContent = parkName;
            parkSelectFilter.appendChild(opt);
        });
        
        if (activePark !== 'All' && !availableParks.has(activePark)) {
            activePark = 'All';
        }
        
        parkSelectFilter.value = activePark;
    }

    function syncFilterUI() {
        if (citySelectFilter) citySelectFilter.value = activeCity;
        populateSectionDropdown();
        populateParkDropdown();

        cityFilters.forEach(c => {
            if (c.getAttribute('data-city') === activeCity) c.classList.add('active');
            else c.classList.remove('active');
        });

        typeFilters.forEach(b => {
            if (b.getAttribute('data-type') === activeType) b.classList.add('active');
            else b.classList.remove('active');
        });

        if (intentBtns.length > 0) {
            intentBtns.forEach(b => {
                const btnIntent = b.getAttribute('data-intent');
                if (btnIntent && btnIntent.toLowerCase() === activeIntent.toLowerCase()) {
                    b.classList.add('active');
                    b.style.background = 'var(--white)';
                    b.style.color = 'var(--primary)';
                    b.style.boxShadow = 'var(--shadow-sm)';
                } else {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-muted)';
                    b.style.boxShadow = 'none';
                }
            });
        }

        if (heroLocationSelect && activeCity !== 'All') heroLocationSelect.value = activeCity;
        if (heroTypeSelect && activeType !== 'All') heroTypeSelect.value = activeType;
    }

    syncFilterUI();

    if (citySelectFilter) {
        citySelectFilter.addEventListener('change', (e) => {
            activeCity = e.target.value;
            activeSection = 'All';
            activePark = 'All';
            syncFilterUI();
            renderProperties();
        });
    }

    if (sectionSelectFilter) {
        sectionSelectFilter.addEventListener('change', (e) => {
            activeSection = e.target.value;
            activePark = 'All';
            syncFilterUI();
            renderProperties();
        });
    }

    if (parkSelectFilter) {
        parkSelectFilter.addEventListener('change', (e) => {
            activePark = e.target.value;
            if (activePark !== 'All' && activeSection === 'All') {
                const autoSec = getDefaultSectionForPark(activePark) || getSectionForProperty({ park: activePark, location: activeCity });
                if (autoSec) {
                    activeSection = autoSec;
                }
            }
            syncFilterUI();
            renderProperties();
        });
    }

    // Intent Buttons Listener
    if (intentBtns.length > 0) {
        intentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                intentBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-muted)';
                    b.style.boxShadow = 'none';
                });
                btn.classList.add('active');
                btn.style.background = 'var(--white)';
                btn.style.color = 'var(--primary)';
                btn.style.boxShadow = 'var(--shadow-sm)';
                
                activeIntent = btn.getAttribute('data-intent');
                renderProperties();
            });
        });
    }

    // Sort Select Listener
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            activeSort = e.target.value;
            renderProperties();
        });
    }

    // Reset Filters Button
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            activeCity = 'All';
            activeType = 'All';
            activeSection = 'All';
            activePark = 'All';
            activeIntent = 'All';
            activeSort = 'date-desc';

            activeKeyword = '';
            const propKwInput = document.getElementById('property-keyword-search');
            if (propKwInput) propKwInput.value = '';
            const heroKwInput = document.getElementById('heroKeywordInput');
            if (heroKwInput) heroKwInput.value = '';

            if (citySelectFilter) citySelectFilter.value = 'All';
            if (heroLocationSelect) heroLocationSelect.value = 'All';
            if (heroTypeSelect) heroTypeSelect.value = 'All';
            if (sortSelect) sortSelect.value = 'date-desc';

            const rangeCriterionEl = document.getElementById('range-filter-criterion');
            const rangeMinEl = document.getElementById('range-filter-min');
            const rangeMaxEl = document.getElementById('range-filter-max');
            if (rangeCriterionEl) rangeCriterionEl.value = 'budget';
            if (rangeMinEl) rangeMinEl.value = '';
            if (rangeMaxEl) rangeMaxEl.value = '';

            syncFilterUI();

            document.querySelectorAll('.city-park-select').forEach(s => s.value = '');
            document.querySelectorAll('.city-label').forEach(l => {
                const defaultText = l.getAttribute('data-default');
                if (defaultText) {
                    const shortCityMap = { 'Petaling Jaya': 'PJ', 'Subang Jaya': 'Subang', 'Shah Alam': 'Shah Alam', 'Klang': 'Klang' };
                    const shortText = shortCityMap[defaultText] || defaultText;
                    l.innerHTML = `<span class="city-label-full">${defaultText} <i class="fa-solid fa-chevron-down" style="font-size: 0.7em; margin-left: 4px;"></i></span><span class="city-label-short">${shortText}</span>`;
                }
            });

            if (intentBtns.length > 0) {
                intentBtns.forEach(b => {
                    if (b.getAttribute('data-intent') === 'All') {
                        b.classList.add('active');
                        b.style.background = 'var(--white)';
                        b.style.color = 'var(--primary)';
                        b.style.boxShadow = 'var(--shadow-sm)';
                    } else {
                        b.classList.remove('active');
                        b.style.background = 'transparent';
                        b.style.color = 'var(--text-muted)';
                        b.style.boxShadow = 'none';
                    }
                });
            }

            renderProperties();
        });
    }

    const propertyKwInput = document.getElementById('property-keyword-search');
    if (propertyKwInput) {
        if (activeKeyword) propertyKwInput.value = activeKeyword;
        propertyKwInput.addEventListener('input', (e) => {
            activeKeyword = e.target.value;
            renderProperties();
        });
    }

    // Range Filter Controls Event Listeners & Thousands Comma Formatter
    const rangeCriterionSelect = document.getElementById('range-filter-criterion');
    const rangeMinInput = document.getElementById('range-filter-min');
    const rangeMaxInput = document.getElementById('range-filter-max');

    function formatNumberInputWithCommas(inputEl) {
        if (!inputEl) return;
        const selectionStart = inputEl.selectionStart;
        const oldLength = inputEl.value.length;

        let raw = inputEl.value.replace(/[^0-9.]/g, '');
        if (!raw) {
            inputEl.value = '';
            return;
        }

        const parts = raw.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const formatted = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];

        if (inputEl.value !== formatted) {
            inputEl.value = formatted;
            if (document.activeElement === inputEl && selectionStart !== null) {
                const newLength = formatted.length;
                const newCursorPos = selectionStart + (newLength - oldLength);
                try {
                    inputEl.setSelectionRange(Math.max(0, newCursorPos), Math.max(0, newCursorPos));
                } catch (err) {
                    // Ignore selection errors on non-text elements
                }
            }
        }
    }

    if (rangeCriterionSelect) {
        rangeCriterionSelect.addEventListener('change', () => {
            renderProperties();
        });
    }

    [rangeMinInput, rangeMaxInput].forEach(inputEl => {
        if (!inputEl) return;
        inputEl.addEventListener('input', () => {
            formatNumberInputWithCommas(inputEl);
            renderProperties();
        });
        inputEl.addEventListener('blur', () => {
            formatNumberInputWithCommas(inputEl);
            renderProperties();
        });
        inputEl.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                formatNumberInputWithCommas(inputEl);
                renderProperties();
            }
        });
    });

    // --- 6. RENDER PROPERTIES ---
    function parsePriceValue(priceStr) {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function parseBuildUpValue(sizeStr) {
        if (!sizeStr || sizeStr === 'N/A') return 0;
        const cleaned = String(sizeStr).replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function parseLandAreaSqftValue(landAreaStr) {
        if (!landAreaStr || landAreaStr === 'N/A') return 0;
        const lower = String(landAreaStr).toLowerCase();
        const cleaned = parseFloat(lower.replace(/[^0-9.]/g, '')) || 0;
        if (lower.includes('acre')) {
            return cleaned * 43560; // 1 Acre = 43,560 sqft
        }
        return cleaned;
    }
    function getPropertyUnitCount(prop) {
        if (!prop || prop.status === 'Pending' || prop.status === 'Inactive') return 0;
        if (prop.availableUnits !== undefined && prop.availableUnits !== null && prop.availableUnits !== '') {
            const val = parseInt(prop.availableUnits, 10);
            return isNaN(val) ? 1 : val;
        }
        return 1;
    }

    function updateCityBadges() {
        const activeProps = properties.filter(p => p.status !== 'Pending' && p.status !== 'Inactive');
        document.querySelectorAll('.city-count-badge').forEach(badge => {
            const city = badge.getAttribute('data-city-count');
            let count = 0;
            if (city === 'All') {
                count = activeProps.reduce((sum, p) => sum + getPropertyUnitCount(p), 0);
            } else {
                count = activeProps.filter(p => p.location === city).reduce((sum, p) => sum + getPropertyUnitCount(p), 0);
            }
            badge.innerHTML = `<span class="city-badge-full">${count} ${count === 1 ? 'Unit' : 'Units'} Available</span><span class="city-badge-short">${count}</span>`;
        });
    }

    function getWatermarkOverlayHtml() {
        return '';
    }

    // --- PHOTO GALLERY LIGHTBOX POPUP MODAL ---
    function ensurePhotoGalleryModal() {
        if (document.getElementById('property-gallery-modal')) return;

        const modalHtml = `
            <div id="property-gallery-modal" class="property-gallery-modal" aria-hidden="true">
                <div class="pg-modal-backdrop" id="pg-modal-backdrop"></div>
                <div class="pg-modal-dialog">
                    <div class="pg-modal-header">
                        <div class="pg-title-container">
                            <h3 id="pg-modal-title" class="pg-modal-title">Property Title</h3>
                            <div id="pg-modal-subtitle" class="pg-modal-subtitle"><i class="fa-solid fa-location-dot" style="color: #38bdf8;"></i> <span id="pg-modal-loc-text">Location</span></div>
                        </div>
                        <div class="pg-header-actions">
                            <button type="button" id="pg-modal-map" class="pg-modal-share-btn" title="View on Google Earth & Maps" style="background: rgba(5, 150, 105, 0.25); border-color: rgba(5, 150, 105, 0.5);">
                                <i class="fa-solid fa-earth-americas"></i> <span>Earth/Map</span>
                            </button>
                            <button type="button" id="pg-modal-share" class="pg-modal-share-btn" title="Share this property">
                                <i class="fa-solid fa-share-nodes"></i> <span>Share</span>
                            </button>
                            <span id="pg-modal-counter" class="pg-modal-counter">Photo 1 of 1</span>
                            <button type="button" id="pg-modal-close" class="pg-modal-close" aria-label="Close Gallery">&times;</button>
                        </div>
                    </div>
                    <div class="pg-modal-body">
                        <button type="button" id="pg-modal-prev" class="pg-nav-btn pg-nav-prev" aria-label="Previous photo">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <div class="pg-image-viewport" oncontextmenu="return false;" ondragstart="return false;">
                            <img id="pg-main-image" src="" alt="Property Detail Photo" style="pointer-events: none; -webkit-user-drag: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;">
                        </div>
                        <button type="button" id="pg-modal-next" class="pg-nav-btn pg-nav-next" aria-label="Next photo">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                    <div class="pg-modal-footer">
                        <div id="pg-thumbnails-strip" class="pg-thumbnails-strip"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    let currentGalleryProperty = null;
    let currentGalleryIndex = 0;

    function openPropertyGalleryModal(prop, startIndex = 0) {
        ensurePhotoGalleryModal();
        const modal = document.getElementById('property-gallery-modal');
        if (!modal) return;

        currentGalleryProperty = prop;
        const photos = (prop.images && prop.images.length > 0) ? prop.images : [prop.image || 'assets/images/warehouse.jpg'];
        currentGalleryIndex = Math.max(0, Math.min(startIndex, photos.length - 1));

        document.getElementById('pg-modal-title').textContent = prop.title || 'Industrial Property';
        document.getElementById('pg-modal-loc-text').textContent = `${prop.location || 'Selangor'}, Selangor ${prop.park ? ' • ' + prop.park : ''}`;
        
        updateGalleryView();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (!modal.dataset.bound) {
            modal.dataset.bound = 'true';
            const mapBtn = document.getElementById('pg-modal-map');
            if (mapBtn) {
                mapBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof openPropertyMapModal === 'function') {
                        openPropertyMapModal(currentGalleryProperty);
                    }
                });
            }
            const shareBtn = document.getElementById('pg-modal-share');
            if (shareBtn) {
                shareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof openPropertyShareModal === 'function') {
                        openPropertyShareModal(currentGalleryProperty);
                    }
                });
            }
            document.getElementById('pg-modal-close').addEventListener('click', closePropertyGalleryModal);
            document.getElementById('pg-modal-backdrop').addEventListener('click', closePropertyGalleryModal);
            document.getElementById('pg-modal-prev').addEventListener('click', () => navigateGallery(-1));
            document.getElementById('pg-modal-next').addEventListener('click', () => navigateGallery(1));

            document.addEventListener('keydown', (e) => {
                if (!modal.classList.contains('active')) return;
                if (e.key === 'Escape') closePropertyGalleryModal();
                if (e.key === 'ArrowLeft') navigateGallery(-1);
                if (e.key === 'ArrowRight') navigateGallery(1);
            });

            // Mobile touch swipe gestures
            const modalBody = modal.querySelector('.pg-modal-body');
            if (modalBody) {
                let touchStartX = 0;
                let touchStartY = 0;
                modalBody.addEventListener('touchstart', (e) => {
                    if (e.touches && e.touches.length === 1) {
                        touchStartX = e.touches[0].clientX;
                        touchStartY = e.touches[0].clientY;
                    }
                }, { passive: true });
                modalBody.addEventListener('touchend', (e) => {
                    if (e.changedTouches && e.changedTouches.length === 1) {
                        const deltaX = e.changedTouches[0].clientX - touchStartX;
                        const deltaY = e.changedTouches[0].clientY - touchStartY;
                        // Check if horizontal swipe exceeds 40px threshold and dominates vertical movement
                        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
                            if (deltaX < 0) {
                                navigateGallery(1);
                            } else {
                                navigateGallery(-1);
                            }
                        }
                    }
                }, { passive: true });
            }
        }
    }

    function closePropertyGalleryModal() {
        const modal = document.getElementById('property-gallery-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function navigateGallery(direction) {
        if (!currentGalleryProperty) return;
        const photos = (currentGalleryProperty.images && currentGalleryProperty.images.length > 0) ? currentGalleryProperty.images : [currentGalleryProperty.image || 'assets/images/warehouse.jpg'];
        currentGalleryIndex = (currentGalleryIndex + direction + photos.length) % photos.length;
        updateGalleryView();
    }

    function updateGalleryView() {
        if (!currentGalleryProperty) return;
        const photos = (currentGalleryProperty.images && currentGalleryProperty.images.length > 0) ? currentGalleryProperty.images : [currentGalleryProperty.image || 'assets/images/warehouse.jpg'];
        
        const mainImg = document.getElementById('pg-main-image');
        const counter = document.getElementById('pg-modal-counter');
        const thumbsStrip = document.getElementById('pg-thumbnails-strip');

        counter.textContent = `Photo ${currentGalleryIndex + 1} of ${photos.length}`;
        
        mainImg.style.opacity = '0.3';
        mainImg.src = photos[currentGalleryIndex];
        mainImg.onload = () => { mainImg.style.opacity = '1'; };
        setTimeout(() => { mainImg.style.opacity = '1'; }, 100);

        thumbsStrip.innerHTML = '';
        photos.forEach((src, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `pg-thumb-btn ${idx === currentGalleryIndex ? 'active' : ''}`;
            btn.ariaLabel = `View photo ${idx + 1}`;
            btn.innerHTML = `<img src="${src}" alt="Thumbnail ${idx + 1}" loading="lazy" style="pointer-events: none; -webkit-user-drag: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;">`;
            btn.addEventListener('click', () => {
                currentGalleryIndex = idx;
                updateGalleryView();
            });
            thumbsStrip.appendChild(btn);
        });

        const prevBtn = document.getElementById('pg-modal-prev');
        const nextBtn = document.getElementById('pg-modal-next');
        if (photos.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
        }
    }

    window.formatPostedDate = function formatPostedDate(propDate) {
        if (!propDate) return '2 days ago';
        
        if (typeof propDate === 'string' && (propDate.toLowerCase().includes('ago') || propDate.toLowerCase() === 'today' || propDate.toLowerCase() === 'yesterday')) {
            return propDate;
        }

        const posted = new Date(propDate);
        if (isNaN(posted.getTime())) {
            return String(propDate);
        }

        const now = new Date();
        const diffMs = now.getTime() - posted.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays <= 7) {
            return `${diffDays} days ago`;
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = posted.getDate();
            const monthStr = months[posted.getMonth()];
            const year = posted.getFullYear();
            if (year === now.getFullYear()) {
                return `${day} ${monthStr}`;
            } else {
                return `${day} ${monthStr} ${year}`;
            }
        }
    };

    function formatFullDate(propDate) {
        if (!propDate) return '';
        const d = new Date(propDate);
        if (isNaN(d.getTime())) return String(propDate);
        const s = JSON.parse(localStorage.getItem('industria_settings')) || {};
        const tz = s.timezone || 'Asia/Kuala_Lumpur';
        const fmt = s.dateFormat || 'DD/MM/YYYY';

        try {
            const parts = new Intl.DateTimeFormat('en-GB', {
                timeZone: tz,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).formatToParts(d);
            const pMap = {};
            parts.forEach(p => { pMap[p.type] = p.value; });
            const day = pMap.day || String(d.getDate()).padStart(2, '0');
            const month = pMap.month || String(d.getMonth() + 1).padStart(2, '0');
            const year = pMap.year || String(d.getFullYear());
            const monthShort = d.toLocaleString('en-US', { timeZone: tz, month: 'short' });

            if (fmt === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
            if (fmt === 'DD MMM YYYY') return `${day} ${monthShort} ${year}`;
            if (fmt === 'MM/DD/YYYY') return `${month}/${day}/${year}`;
            return `${day}/${month}/${year}`;
        } catch (e) {
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
    }

    // Dynamic Answer Engine Optimization (AOE) Schema.org Structured Data Injector
    function syncDynamicSchema(targetProp, displayedProps) {
        try {
            let scriptEl = document.getElementById('dynamic-aoe-schema');
            if (!scriptEl) {
                scriptEl = document.createElement('script');
                scriptEl.id = 'dynamic-aoe-schema';
                scriptEl.type = 'application/ld+json';
                document.head.appendChild(scriptEl);
            }

            if (targetProp) {
                const cleanPrice = String(targetProp.price || '').replace(/[^0-9]/g, '');
                const schemaObj = {
                    "@context": "https://schema.org",
                    "@type": "RealEstateListing",
                    "@id": `https://www.myfactoryspace.com/properties.html?id=${encodeURIComponent(targetProp.id)}`,
                    "name": targetProp.title || 'Industrial Property',
                    "description": targetProp.description || `${targetProp.title} located in ${targetProp.park || targetProp.location || 'Selangor'}.`,
                    "url": `https://www.myfactoryspace.com/properties.html?id=${encodeURIComponent(targetProp.id)}`,
                    "category": targetProp.type || "Industrial Property",
                    "offers": {
                        "@type": "Offer",
                        "price": cleanPrice || undefined,
                        "priceCurrency": "MYR",
                        "availability": "https://schema.org/InStock",
                        "businessFunction": String(targetProp.intent).toLowerCase() === 'rent' ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell"
                    },
                    "containedInPlace": {
                        "@type": "Place",
                        "name": targetProp.park || targetProp.location || 'Klang Valley',
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": targetProp.location || 'Selangor',
                            "addressRegion": "Selangor",
                            "addressCountry": "MY",
                            "streetAddress": targetProp.road || ''
                        }
                    }
                };

                if (targetProp.images && Array.isArray(targetProp.images) && targetProp.images.length > 0) {
                    schemaObj["image"] = targetProp.images;
                } else if (targetProp.image) {
                    schemaObj["image"] = [targetProp.image];
                }

                if (targetProp.size && targetProp.size !== 'N/A') {
                    const numBuiltUp = parseFloat(String(targetProp.size).replace(/[^0-9.]/g, ''));
                    if (!isNaN(numBuiltUp) && numBuiltUp > 0) {
                        schemaObj["floorSize"] = {
                            "@type": "QuantitativeValue",
                            "value": numBuiltUp,
                            "unitCode": "FTK"
                        };
                    }
                }

                scriptEl.textContent = JSON.stringify(schemaObj, null, 2);
            } else if (Array.isArray(displayedProps) && displayedProps.length > 0) {
                const itemList = {
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "name": "Available Industrial Properties",
                    "numberOfItems": displayedProps.length,
                    "itemListElement": displayedProps.slice(0, 10).map((p, idx) => ({
                        "@type": "ListItem",
                        "position": idx + 1,
                        "item": {
                            "@type": "RealEstateListing",
                            "name": p.title,
                            "url": `https://www.myfactoryspace.com/properties.html?id=${encodeURIComponent(p.id)}`,
                            "price": String(p.price || '').replace(/[^0-9]/g, '') || undefined,
                            "priceCurrency": "MYR"
                        }
                    }))
                };
                scriptEl.textContent = JSON.stringify(itemList, null, 2);
            }
        } catch(e) {
            console.warn('AOE dynamic schema sync error:', e);
        }
    }

    // --- STANDARDIZED PROPERTY CARD GENERATOR ---
    // Exposing window.createStandardPropertyCard ensures 100% visual, stylistic, and behavioral
    // consistency across index.html, properties.html, and location.html landing pages.
    window.createStandardPropertyCard = function (prop, options = {}) {
        if (!prop) return null;
        const directPropId = options.directPropId || null;

        const siteSettings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});
        const showFeaturedBadgeSetting = siteSettings.showFeaturedBadge !== false && String(siteSettings.showFeaturedBadge) !== 'false';
        const showTenureBadgeSetting = siteSettings.showTenureBadge !== false && String(siteSettings.showTenureBadge) !== 'false';
        const showSectionBadgeSetting = siteSettings.showSectionBadge !== false && String(siteSettings.showSectionBadge) !== 'false';
        const showPostedDateBadgeSetting = siteSettings.showPostedDateBadge !== false && String(siteSettings.showPostedDateBadge) !== 'false';

            const badgeClass = (prop.type && String(prop.type).toLowerCase().includes('factory')) ? 'factory' : '';
            const sectionName = getSectionForProperty(prop);
            const sectionBadge = (sectionName && showSectionBadgeSetting) ? ` <span class="property-section-tag"><span class="at-symbol">@</span> ${escapeHtml(sectionName)}</span>` : '';
            const parkHtml = prop.park ? `<div class="property-park-text"><i class="fa-solid fa-map" style="margin-right: 5px;"></i> <span>${escapeHtml(prop.park)}</span></div>` : `<div class="property-park-text"></div>`;
            const roadHtml = prop.road ? `
                <div class="property-road-text">
                    <i class="fa-solid fa-road" style="margin-right: 5px;"></i>
                    <span>${escapeHtml(prop.road)}</span>
                    <button type="button" class="property-road-map-btn" title="View on Google Earth & Maps" aria-label="View on Google Earth and Maps">
                        <i class="fa-solid fa-earth-americas"></i> <span>Map</span>
                    </button>
                </div>` : `<div class="property-road-text"></div>`;
            
            const intentVal = (prop.intent || (prop.price && String(prop.price).toLowerCase().includes('mo') ? 'Rent' : 'Sale')).toUpperCase();
            const ribbonClass = intentVal === 'RENT' ? 'rent' : 'sale';
            const ribbonLabel = intentVal === 'RENT' ? 'RENT' : 'SALE';
            const ribbonHtml = `<div class="property-ribbon ${ribbonClass}">${ribbonLabel}</div>`;
            const watermarkOverlayHtml = getWatermarkOverlayHtml();

            const usageVal = prop.usage || '';
            const isUsageApplicable = usageVal && usageVal !== 'Not Applicable' && usageVal !== 'N/A';
            const isFeaturedProp = showFeaturedBadgeSetting && (prop.featured === true || String(prop.featured) === 'true' || prop.showOnMainpage === true || String(prop.showOnMainpage) === 'true');

            let topRightBadgeHtml = '';
            if (isFeaturedProp) {
                const featuredBadgeMarkup = `<div class="property-featured-badge temp-featured-badge"><i class="fa-solid fa-crown"></i> FEATURED</div>`;
                const usageBadgeMarkup = isUsageApplicable ? `<div class="property-usage-badge delayed-usage-badge">${escapeHtml(usageVal.toUpperCase())}</div>` : '';
                topRightBadgeHtml = `${featuredBadgeMarkup}${usageBadgeMarkup}`;
            } else if (isUsageApplicable) {
                topRightBadgeHtml = `<div class="property-usage-badge">${escapeHtml(usageVal.toUpperCase())}</div>`;
            }

            const tenureVal = (prop.tenure || prop.leaseType || 'Freehold').toUpperCase();
            const tenureBadgeHtml = (intentVal === 'SALE' && showTenureBadgeSetting) ? `<span class="tenure-badge-green">${escapeHtml(tenureVal)}</span>` : '';
            const photoCount = (prop.images && prop.images.length > 0) ? prop.images.length : 1;

            const lastUpdatedVal = prop.lastUpdated || prop.updatedAt || prop.dateUpdated || prop.updated_at || prop.dateCreated || prop.dateAdded || prop.postedDate || prop.createdAt || prop.date;
            const postedDateText = formatPostedDate(lastUpdatedVal);
            const postedDateFullText = formatFullDate(lastUpdatedVal);
            const postedDateHtml = showPostedDateBadgeSetting ? `<span class="posted-date-badge last-updated-badge" title="Last Updated: ${escapeHtml(postedDateFullText || postedDateText)}" style="color: var(--text-muted); font-weight: 700; font-size: 0.85rem; white-space: nowrap;">${escapeHtml(postedDateText)}</span>` : '';

            const isTargetListing = directPropId && String(prop.id) === String(directPropId);
            const targetBadgeHtml = isTargetListing ? `<div class="property-targeted-badge"><i class="fa-solid fa-bullseye"></i> SHARED LISTING</div>` : '';

            const rawPriceVal = prop.price || (prop.specs && prop.specs.price) || '';
            const formattedPrice = formatPriceString(rawPriceVal, intentVal);

            const article = document.createElement('article');
            article.className = 'property-card' + (isTargetListing ? ' property-card-highlighted expanded' : '');
            article.dataset.id = prop.id;
            article.id = `property-${prop.id}`;
            article.style.cursor = 'pointer';
            article.title = "Click to Enquire Property";
            article.innerHTML = `
                <div class="property-img-wrapper" style="position: relative;" oncontextmenu="return false;" ondragstart="return false;">
                    ${ribbonHtml}
                    ${topRightBadgeHtml}
                    ${targetBadgeHtml}
                    <img src="${prop.images && prop.images.length > 0 ? prop.images[0] : prop.image || 'assets/images/hero.jpg'}" alt="${prop.title}" loading="lazy" style="pointer-events: none; -webkit-user-drag: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;">
                    ${watermarkOverlayHtml}
                    <div class="photo-view-trigger" title="Click to view photo gallery">
                        <i class="fa-solid fa-images"></i> <span>View ${photoCount} Photos</span>
                    </div>
                </div>
                <div class="property-content">
                    <div class="property-price-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                        <div class="property-price" style="margin-bottom: 0;">${formattedPrice}</div>
                        ${tenureBadgeHtml}
                    </div>
                    <h3 class="property-title">${prop.title}</h3>
                    ${parkHtml}
                    ${roadHtml}
                    <div class="property-location" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;"><i class="fa-solid fa-location-dot" style="margin-right: 2px;"></i> <span>${prop.location}, Selangor</span>${sectionBadge}</div>
                        ${postedDateHtml}
                    </div>
                    <!-- Compact Quick Spec & Tap-to-Enlarge Cue for Mobile Grid View -->
                    <div class="mobile-compact-specs-bar">
                        <span class="mobile-compact-spec-pill" title="${escapeHtml(prop.size || prop.landArea || 'Industrial Spec')}">
                            <i class="fa-solid fa-industry" style="color: var(--primary); font-size: 0.65rem;"></i>
                            <span>${escapeHtml(prop.size && prop.size !== 'N/A' ? prop.size : (prop.landArea || 'Specs'))}</span>
                        </span>
                        <span class="mobile-expand-hint">
                            <i class="fa-solid fa-up-right-and-down-left-from-center" style="font-size: 0.6rem;"></i> Expand
                        </span>
                    </div>
                    <div class="property-meta">
                        ${prop.landArea ? `<div class="meta-item" title="Land Area"><i class="fa-solid fa-map"></i> ${prop.landArea}</div>` : ''}
                        ${prop.size && prop.size !== 'N/A' ? `<div class="meta-item" title="Build Up"><i class="fa-solid fa-building"></i> ${prop.size}</div>` : ''}
                        ${prop.lift && prop.lift !== '0' ? `<div class="meta-item" title="Lift"><i class="fa-solid fa-elevator"></i> ${prop.lift} Lifts</div>` : ''}
                        ${prop.power && prop.power !== '0' ? `<div class="meta-item" title="Power"><i class="fa-solid fa-bolt"></i> ${prop.power} Amp</div>` : ''}
                        ${prop.loadingBay && prop.loadingBay !== '0' ? `<div class="meta-item" title="Loading Bay"><i class="fa-solid fa-truck-ramp-box"></i> ${prop.loadingBay} Bays</div>` : ''}
                        ${prop.floorLoading && prop.floorLoading !== '0' ? `<div class="meta-item" title="Floor Loading"><i class="fa-solid fa-weight-hanging"></i> ${prop.floorLoading} kN/m²</div>` : ''}
                        ${prop.ceilingPeak && prop.ceilingPeak !== '0' ? `<div class="meta-item" title="Ceiling Peak / Ridge Height"><i class="fa-solid fa-arrows-up-to-line"></i> Peak: ${prop.ceilingPeak} ft</div>` : ''}
                        ${prop.ceilingEave && prop.ceilingEave !== '0' ? `<div class="meta-item" title="Ceiling Eave Height"><i class="fa-solid fa-arrows-up-to-line"></i> Eave: ${prop.ceilingEave} ft</div>` : ''}
                        ${prop.ceilingClear && prop.ceilingClear !== '0' ? `<div class="meta-item" title="Clear Internal Ceiling Height"><i class="fa-solid fa-arrows-up-to-line"></i> Clear: ${prop.ceilingClear} ft</div>` : ''}
                    </div>
                    <div class="property-card-action">
                        <div class="card-action-row" style="display: flex; gap: 0.45rem; align-items: center; width: 100%;">
                            <button type="button" class="btn btn-primary enquire-now-btn" style="flex: 1; justify-content: center; font-size: 0.88rem; font-weight: 700; white-space: nowrap; padding: 0.65rem 0.75rem;">
                                Enquire Now <i class="fa-solid fa-arrow-down" style="font-size: 0.8em; margin-left: 5px;"></i>
                            </button>
                            <button type="button" class="property-brochure-btn" title="View & Download Property E-Brochure (Flyer / PDF)" aria-label="Property E-Brochure">
                                <i class="fa-solid fa-file-pdf"></i> <span>Brochure</span>
                            </button>
                            <button type="button" class="property-map-btn" title="View on Google Earth & Google Maps" aria-label="Google Earth and Maps">
                                <i class="fa-solid fa-earth-americas"></i>
                            </button>
                            <button type="button" class="property-share-btn" title="Share Property to Social Media (Facebook, WhatsApp, IG, TikTok...)" aria-label="Share Property">
                                <i class="fa-solid fa-share-nodes"></i>
                            </button>
                        </div>
                        <div class="mobile-collapse-bar">
                            <button type="button" class="mobile-collapse-card-btn">
                                <i class="fa-solid fa-compress"></i> Collapse back to Grid
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            function getPropertyDirectContact(targetProp) {
                let waNumber = '';
                let callNumber = '';
                try {
                    const agents = safeJsonParse('industria_agents', []);
                    const users = safeJsonParse('industria_users', []);
                    const siteSettings = safeJsonParse('industria_settings', {});

                    let matchedAgent = null;
                    if (targetProp) {
                        if (targetProp.assignedAgentId) {
                            matchedAgent = agents.find(a => String(a.id) === String(targetProp.assignedAgentId));
                        }
                        if (!matchedAgent && targetProp.park) {
                            const normPark = String(targetProp.park).trim().toLowerCase();
                            matchedAgent = agents.find(a => {
                                const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                                return pList.some(p => {
                                    const name = typeof p === 'string' ? p : (p && p.name ? p.name : '');
                                    return name.trim().toLowerCase() === normPark;
                                });
                            });
                        }
                    }

                    if (matchedAgent) {
                        const linkedUser = users.find(u => String(u.agentId) === String(matchedAgent.id) && u.whatsapp && u.whatsapp.trim() !== '');
                        if (linkedUser) {
                            waNumber = linkedUser.whatsapp;
                        } else if (matchedAgent.whatsapp) {
                            waNumber = matchedAgent.whatsapp;
                        } else if (matchedAgent.phone) {
                            waNumber = matchedAgent.phone;
                        }
                        if (matchedAgent.phone) {
                            callNumber = matchedAgent.phone;
                        }
                    }

                    // Priority 1.5: If unassigned park (or no specialist agent assigned to this park), route directly to Property Creator!
                    if (!waNumber && targetProp) {
                        // 1. If property creator is linked to an agent
                        if (targetProp.createdByAgentId) {
                            const creatorAgent = agents.find(a => String(a.id) === String(targetProp.createdByAgentId));
                            if (creatorAgent) {
                                const linkedUser = users.find(u => String(u.agentId) === String(creatorAgent.id) && u.whatsapp && u.whatsapp.trim() !== '');
                                if (linkedUser) {
                                    waNumber = linkedUser.whatsapp;
                                } else if (creatorAgent.whatsapp) {
                                    waNumber = creatorAgent.whatsapp;
                                } else if (creatorAgent.phone) {
                                    waNumber = creatorAgent.phone;
                                }
                                if (creatorAgent.phone) {
                                    callNumber = creatorAgent.phone;
                                }
                            }
                        }

                        // 2. If property creator is a registered user account (username / id)
                        if (!waNumber && (targetProp.createdBy || targetProp.createdByUserId)) {
                            const creatorUser = users.find(u => 
                                (targetProp.createdByUserId && String(u.id) === String(targetProp.createdByUserId)) ||
                                (targetProp.createdBy && u.username && u.username.toLowerCase() === String(targetProp.createdBy).toLowerCase())
                            );
                            if (creatorUser) {
                                if (creatorUser.whatsapp && creatorUser.whatsapp.trim() !== '') {
                                    waNumber = creatorUser.whatsapp;
                                } else if (creatorUser.phone && creatorUser.phone.trim() !== '') {
                                    waNumber = creatorUser.phone;
                                }
                                if (creatorUser.phone && creatorUser.phone.trim() !== '') {
                                    callNumber = creatorUser.phone;
                                }
                            }
                        }

                        // 3. Fallback to direct creator phone/whatsapp stored on property object
                        if (!waNumber && targetProp.createdByPhone) {
                            waNumber = targetProp.createdByPhone;
                            if (!callNumber) callNumber = targetProp.createdByPhone;
                        }
                    }

                    if (!waNumber) {
                        const mainUser = users.find(u => u && u.isMainWhatsapp && u.whatsapp && u.whatsapp.trim() !== '');
                        if (mainUser) waNumber = mainUser.whatsapp;
                    }
                    if (!waNumber) {
                        const adminUser = users.find(u => u && u.role === 'Administrator' && u.whatsapp && u.whatsapp.trim() !== '');
                        if (adminUser) waNumber = adminUser.whatsapp;
                    }
                    if (!waNumber) {
                        waNumber = siteSettings.whatsappNotificationNumber || siteSettings.mainWhatsapp || siteSettings.phone || '60163117162';
                    }

                    if (!callNumber) {
                        callNumber = siteSettings.phone || '+60 3-9054 8582';
                    }
                } catch (e) {
                    waNumber = '60163117162';
                    callNumber = '+60390548582';
                }

                let cleanWa = waNumber.replace(/[^0-9]/g, '');
                if (cleanWa.startsWith('0')) {
                    cleanWa = '6' + cleanWa;
                }
                const cleanCall = callNumber.replace(/[^0-9+]/g, '');

                return {
                    waNumber: cleanWa || '60163117162',
                    callNumber: cleanCall || '+60390548582'
                };
            }

            const triggerEnquire = (shouldScroll = true) => {
                const interestSelect = document.getElementById('leadInterest');
                if (interestSelect) {
                    const interestString = formatPropertyInterest(prop);
                    interestSelect.value = interestString;
                    if (leadForm) {
                        leadForm.dataset.selectedIntent = prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale');
                        leadForm.dataset.selectedPropertyId = prop.id;
                        leadForm.dataset.selectedPark = prop.park || '';
                    }
                    
                    // Update Left Contact Info Panel with selected property details
                    const defaultInfo = document.getElementById('default-contact-info');
                    const selectedInfo = document.getElementById('selected-property-info');

                    if (defaultInfo && selectedInfo) {
                        const rawDesc = getPropertyDescription(prop);
                        const propDesc = (rawDesc && typeof rawDesc === 'string') ? rawDesc.trim().replace(/^[\r\n\s]+/, '').replace(/[\r\n\s]+$/, '') : '';

                        // Direct contact info for WhatsApp & Call
                        const directContact = getPropertyDirectContact(prop);
                        const propTitle = prop.title || 'Industrial Property';
                        const propPrice = prop.price || '';
                        const propLocation = [prop.location, prop.park].filter(Boolean).join(', ');
                        const propType = prop.type || 'Industrial Property';
                        const propSpecs = [
                            prop.size && prop.size !== 'N/A' ? `Built-up: ${prop.size}` : '',
                            prop.landArea && prop.landArea !== 'N/A' ? `Land: ${prop.landArea}` : ''
                        ].filter(Boolean).join(' | ');

                        const waInterestMessage = 
`Hello MyFactorySpace, I am inquiring about this Property of Interest:

- *Property:* ${propTitle}
- *Price:* ${propPrice}
- *Location:* ${propLocation}, Selangor
- *Type:* ${propType}${propSpecs ? '\n- *Specs:* ' + propSpecs : ''}

Could you please share more information and arrange a viewing appointment? Thank you!`;

                        const waUrl = `https://wa.me/${directContact.waNumber}?text=${encodeURIComponent(waInterestMessage)}`;
                        const callUrl = `tel:${directContact.callNumber}`;
                        selectedInfo.innerHTML = `
                            <div class="selected-property-card">
                                <div class="selected-property-step-bar">
                                    <span><i class="fa-solid fa-bullseye" style="color: var(--accent, #ffffff); margin-right: 6px;"></i> Selected Property Details</span>
                                    <span class="selected-property-step-tag">Step 1 of 2</span>
                                </div>
                                <div class="selected-property-img-wrapper" style="position: relative; cursor: pointer;" oncontextmenu="return false;" ondragstart="return false;">
                                    ${ribbonHtml}
                                    ${topRightBadgeHtml}
                                    <img src="${prop.images && prop.images.length > 0 ? prop.images[0] : prop.image || 'assets/images/hero.jpg'}" alt="${prop.title}" style="width: 100%; height: 210px; object-fit: cover; pointer-events: none; -webkit-user-drag: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;">
                                    ${getWatermarkOverlayHtml()}
                                    <div style="position: absolute; bottom: 0.75rem; left: 1rem; background: rgba(0, 0, 0, 0.75); color: var(--white); backdrop-filter: blur(4px); padding: 0.25rem 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem;">
                                        ${escapeHtml(prop.type)}
                                    </div>
                                    <div class="photo-view-trigger" title="Click to view photo gallery">
                                        <i class="fa-solid fa-images"></i> <span>View ${photoCount} Photos</span>
                                    </div>
                                    <button type="button" class="property-selected-map-trigger" title="View on Google Earth & Maps" aria-label="Google Earth and Maps">
                                        <i class="fa-solid fa-earth-americas"></i>
                                    </button>
                                    <button type="button" class="property-selected-share-trigger" title="Share Property to Social Media" aria-label="Share Property">
                                        <i class="fa-solid fa-share-nodes"></i>
                                    </button>
                                </div>
                                <div class="selected-property-body">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.5rem;">
                                            <div style="color: var(--primary); font-weight: 800; font-size: 1.35rem;">${prop.price}</div>
                                            ${tenureBadgeHtml}
                                        </div>
                                        <h3 style="font-size: 1.18rem; color: var(--text-dark); margin-bottom: 0.35rem; font-weight: 700;">${prop.title}</h3>
                                        ${prop.park ? `<div style="color: var(--primary); font-weight: 600; font-size: 0.88rem; margin-bottom: 0.3rem; display: flex; align-items: center; flex-wrap: wrap;"><i class="fa-solid fa-map" style="margin-right: 5px;"></i> <span>${escapeHtml(prop.park)}</span></div>` : ''}
                                        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1rem; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;"><i class="fa-solid fa-location-dot" style="margin-right: 2px;"></i> <span>${prop.location}, Selangor</span>${sectionBadge}</p>
                                        
                                        <div class="selected-property-specs-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; padding: 0.85rem; background: var(--bg-light); border-radius: 10px; font-size: 0.84rem; color: var(--text-dark); margin-bottom: 0.85rem; border: 1px solid var(--border-light);">
                                            ${prop.landArea ? `<div><i class="fa-solid fa-map" style="color: var(--primary); margin-right: 4px;"></i> <strong>Land:</strong> ${prop.landArea}</div>` : ''}
                                            ${prop.size && prop.size !== 'N/A' ? `<div><i class="fa-solid fa-building" style="color: var(--primary); margin-right: 4px;"></i> <strong>Build Up:</strong> ${prop.size}</div>` : ''}
                                            ${prop.power && prop.power !== '0' ? `<div><i class="fa-solid fa-bolt" style="color: var(--primary); margin-right: 4px;"></i> <strong>Power:</strong> ${prop.power} Amp</div>` : ''}
                                            ${prop.lift && prop.lift !== '0' ? `<div><i class="fa-solid fa-elevator" style="color: var(--primary); margin-right: 4px;"></i> <strong>Lifts:</strong> ${prop.lift}</div>` : ''}
                                            ${prop.loadingBay && prop.loadingBay !== '0' ? `<div><i class="fa-solid fa-truck-ramp-box" style="color: var(--primary); margin-right: 4px;"></i> <strong>Bays:</strong> ${prop.loadingBay}</div>` : ''}
                                            ${prop.floorLoading && prop.floorLoading !== '0' ? `<div><i class="fa-solid fa-weight-hanging" style="color: var(--primary); margin-right: 4px;"></i> <strong>Floor Load:</strong> ${prop.floorLoading} kN/m²</div>` : ''}
                                            ${prop.ceilingPeak && prop.ceilingPeak !== '0' ? `<div><i class="fa-solid fa-arrows-up-to-line" style="color: var(--primary); margin-right: 4px;"></i> <strong>Peak Height:</strong> ${prop.ceilingPeak} ft</div>` : ''}
                                            ${prop.ceilingEave && prop.ceilingEave !== '0' ? `<div><i class="fa-solid fa-arrows-up-to-line" style="color: var(--primary); margin-right: 4px;"></i> <strong>Eave Height:</strong> ${prop.ceilingEave} ft</div>` : ''}
                                            ${prop.ceilingClear && prop.ceilingClear !== '0' ? `<div><i class="fa-solid fa-arrows-up-to-line" style="color: var(--primary); margin-right: 4px;"></i> <strong>Clear Height:</strong> ${prop.ceilingClear} ft</div>` : ''}
                                        </div>

                                        ${propDesc ? `
                                        <div class="selected-property-desc-box">
                                            <div class="selected-property-desc-header">
                                                <i class="fa-solid fa-align-left"></i>
                                                <span>Description</span>
                                            </div>
                                            <div class="selected-property-desc-content">${escapeHtml(propDesc)}</div>
                                        </div>
                                        ` : ''}
                                    </div>

                                    <div class="selected-property-actions-box" style="margin-top: 1rem;">
                                        <!-- Direct Contact Buttons: WhatsApp Us & Call Us -->
                                        <div class="selected-property-contact-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; margin-bottom: 0.65rem;">
                                            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="selected-property-wa-btn" id="selected-prop-wa-btn" style="background: #25D366; color: #ffffff; text-decoration: none; padding: 0.72rem 0.85rem; border-radius: 10px; font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3); transition: all 0.2s ease;">
                                                <i class="fa-brands fa-whatsapp" style="font-size: 1.15rem;"></i>
                                                <span>WhatsApp Us</span>
                                            </a>
                                            <a href="${callUrl}" class="selected-property-call-btn" id="selected-prop-call-btn" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 0.72rem 0.85rem; border-radius: 10px; font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); transition: all 0.2s ease;">
                                                <i class="fa-solid fa-phone" style="font-size: 0.92rem;"></i>
                                                <span>Call Us</span>
                                            </a>
                                        </div>

                                        <button type="button" id="scroll-to-lead-form-btn" class="btn btn-primary" style="width: 100%; justify-content: center; font-size: 0.92rem; font-weight: 700; padding: 0.75rem 1rem; border-radius: 10px; box-shadow: 0 4px 14px var(--primary-glow); display: flex; align-items: center; gap: 8px;">
                                            <i class="fa-solid fa-pen-to-square"></i>
                                            <span class="btn-text-desktop">Fill Up Inquiry Form <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i></span>
                                            <span class="btn-text-mobile">Fill Up Inquiry Form Below <i class="fa-solid fa-arrow-down form-bounce-arrow" style="margin-left: 4px;"></i></span>
                                        </button>

                                        <div style="text-align: center; margin-top: 0.65rem;">
                                            <button type="button" id="reset-contact-info-btn" style="background: none; border: none; color: var(--primary); font-size: 0.82rem; font-weight: 600; cursor: pointer; padding: 4px; display: inline-flex; align-items: center; gap: 6px;">
                                                <i class="fa-solid fa-arrow-left"></i> Not this property? <span style="text-decoration: underline;">Go to Property Listing</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Add matching Step 2 header bar on the right form card
                        let formWrapper = document.querySelector('.contact-form-wrapper');
                        let formHeaderBar = document.getElementById('contact-form-step-bar');
                        if (!formHeaderBar && formWrapper) {
                            formHeaderBar = document.createElement('div');
                            formHeaderBar.id = 'contact-form-step-bar';
                            formHeaderBar.className = 'selected-property-step-bar';
                            formWrapper.insertBefore(formHeaderBar, formWrapper.firstChild);
                        }
                        if (formHeaderBar) {
                            formHeaderBar.style.display = 'flex';
                            formHeaderBar.innerHTML = `
                                <span><i class="fa-solid fa-file-signature" style="color: var(--accent, #ffffff); margin-right: 6px;"></i> Send Your Inquiry</span>
                                <span class="selected-property-step-tag">Step 2 of 2</span>
                            `;
                        }

                        // Display active enquiry context banner inside lead-form
                        let leadFormPropBanner = document.getElementById('lead-form-prop-banner');
                        if (!leadFormPropBanner && leadForm) {
                            leadFormPropBanner = document.createElement('div');
                            leadFormPropBanner.id = 'lead-form-prop-banner';
                            leadForm.insertBefore(leadFormPropBanner, leadForm.firstChild);
                        }
                        if (leadFormPropBanner) {
                            leadFormPropBanner.style.display = 'block';
                            leadFormPropBanner.innerHTML = `
                                <div style="background: var(--primary-light, rgba(0, 119, 182, 0.1)); border: 1px solid var(--border-light, rgba(0, 119, 182, 0.25)); border-radius: 10px; padding: 0.65rem 0.95rem; margin-bottom: 1.15rem; display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;">
                                    <div style="font-size: 0.85rem; color: var(--primary-dark); font-weight: 600; line-height: 1.35;">
                                        <i class="fa-solid fa-building" style="color: var(--primary); margin-right: 6px;"></i> Inquiring: <strong style="color: var(--primary-dark);">${escapeHtml(prop.title)}</strong>
                                    </div>
                                    <div style="font-size: 0.88rem; font-weight: 800; color: var(--primary); white-space: nowrap;">${escapeHtml(prop.price)}</div>
                                </div>
                            `;
                        }

                        const selImgWrapper = selectedInfo.querySelector('.selected-property-img-wrapper');
                        if (selImgWrapper) {
                            selImgWrapper.addEventListener('click', (e) => {
                                if (e.target.closest('.property-selected-share-trigger') || e.target.closest('.property-selected-map-trigger')) return;
                                e.stopPropagation();
                                openPropertyGalleryModal(prop, 0);
                            });
                        }

                        const selMapBtn = selectedInfo.querySelector('.property-selected-map-trigger');
                        if (selMapBtn) {
                            selMapBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (typeof openPropertyMapModal === 'function') {
                                    openPropertyMapModal(prop);
                                }
                            });
                        }

                        const selShareBtn = selectedInfo.querySelector('.property-selected-share-trigger');
                        if (selShareBtn) {
                            selShareBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (typeof openPropertyShareModal === 'function') {
                                    openPropertyShareModal(prop);
                                }
                            });
                        }

                        const scrollToFormBtn = selectedInfo.querySelector('#scroll-to-lead-form-btn');
                        if (scrollToFormBtn) {
                            scrollToFormBtn.addEventListener('click', () => {
                                const leadFormEl = document.getElementById('lead-form');
                                const nameInput = document.getElementById('leadName');
                                if (window.innerWidth <= 768 && leadFormEl) {
                                    const headerOffset = 80;
                                    const elementPosition = leadFormEl.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                    window.scrollTo({
                                        top: offsetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                                setTimeout(() => {
                                    if (nameInput) nameInput.focus();
                                }, 300);
                            });
                        }

                        const resetBtn = selectedInfo.querySelector('#reset-contact-info-btn');
                        if (resetBtn) {
                            resetBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                selectedInfo.style.opacity = '0';
                                setTimeout(() => {
                                    selectedInfo.style.display = 'none';
                                    defaultInfo.style.display = 'block';
                                    setTimeout(() => defaultInfo.style.opacity = '1', 50);
                                }, 300);
                                if (interestSelect) interestSelect.value = 'General Inquiry';
                                if (leadForm) {
                                    delete leadForm.dataset.selectedIntent;
                                    delete leadForm.dataset.selectedPropertyId;
                                    delete leadForm.dataset.selectedPark;
                                }
                                const fBar = document.getElementById('contact-form-step-bar');
                                if (fBar) fBar.style.display = 'none';
                                const pBanner = document.getElementById('lead-form-prop-banner');
                                if (pBanner) pBanner.style.display = 'none';

                                // Smooth scroll back to property listings section
                                const propSection = document.getElementById('properties') || document.getElementById('browse-properties');
                                if (propSection) {
                                    const headerOffset = 70;
                                    const elementPosition = propSection.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                    window.scrollTo({
                                        top: offsetPosition,
                                        behavior: 'smooth'
                                    });
                                } else {
                                    window.location.href = 'properties.html';
                                }
                            });
                        }

                        defaultInfo.style.opacity = '0';
                        setTimeout(() => {
                            defaultInfo.style.display = 'none';
                            selectedInfo.style.display = 'block';
                            setTimeout(() => selectedInfo.style.opacity = '1', 50);
                        }, 300);
                    }
                    
                    if (shouldScroll) {
                        const targetScroll = (window.innerWidth <= 768 && selectedInfo) ? selectedInfo : document.getElementById('contact');
                        if (targetScroll) {
                            const headerOffset = 70;
                            const elementPosition = targetScroll.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                } else {
                    window.location.href = 'index.html?id=' + encodeURIComponent(prop.id) + '#contact';
                }
            };
            prop._selectForEnquiry = triggerEnquire;
            const handleEnquire = (e) => {
                if (e) e.stopPropagation();
                triggerEnquire(true);
            };

            const cardImgWrapper = article.querySelector('.property-img-wrapper');
            if (cardImgWrapper) {
                cardImgWrapper.addEventListener('click', (e) => {
                    // On mobile (<= 768px), if card is not yet expanded, clicking image expands the card instead of opening modal directly
                    if (window.innerWidth <= 768 && !article.classList.contains('expanded')) {
                        return; // Let click bubble to article handler to expand
                    }
                    e.stopPropagation();
                    openPropertyGalleryModal(prop, 0);
                });
            }

            const collapseBtn = article.querySelector('.mobile-collapse-card-btn');
            if (collapseBtn) {
                collapseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    article.classList.remove('expanded');
                });
            }

            article.addEventListener('click', (e) => {
                // If clicked map button (desktop or mobile) or road map button
                if (e.target.closest('.property-map-btn') || e.target.closest('.property-road-map-btn')) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof openPropertyMapModal === 'function') {
                        openPropertyMapModal(prop);
                    }
                    return;
                }

                // If clicked brochure button (desktop or mobile)
                if (e.target.closest('.property-brochure-btn')) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof openPropertyBrochureModal === 'function') {
                        openPropertyBrochureModal(prop);
                    }
                    return;
                }

                // If clicked share button (desktop or mobile)
                if (e.target.closest('.property-share-btn')) {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof openPropertyShareModal === 'function') {
                        openPropertyShareModal(prop);
                    }
                    return;
                }

                if (window.innerWidth <= 768) {
                    // 1. If clicked collapse button
                    if (e.target.closest('.mobile-collapse-card-btn')) {
                        e.stopPropagation();
                        e.preventDefault();
                        article.classList.remove('expanded');
                        return;
                    }

                    // 2. If unexpanded: expand into normal card
                    if (!article.classList.contains('expanded')) {
                        e.stopPropagation();
                        e.preventDefault();
                        const parentGrid = article.closest('.property-grid');
                        if (parentGrid) {
                            parentGrid.querySelectorAll('.property-card.expanded').forEach(c => {
                                if (c !== article) c.classList.remove('expanded');
                            });
                        }
                        article.classList.add('expanded');
                        setTimeout(() => {
                            const rect = article.getBoundingClientRect();
                            if (rect.top < 60 || rect.bottom > window.innerHeight) {
                                article.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                        }, 120);
                        return;
                    }

                    // 3. If already expanded and clicked enquire button
                    if (e.target.closest('.enquire-now-btn')) {
                        handleEnquire(e);
                        return;
                    }

                    // 4. If already expanded and clicked photo trigger
                    if (e.target.closest('.photo-view-trigger') || e.target.closest('.property-img-wrapper')) {
                        e.stopPropagation();
                        openPropertyGalleryModal(prop, 0);
                        return;
                    }
                } else {
                    // Desktop view: handle enquire directly
                    handleEnquire(e);
                }
            });

            const cardMapBtn = article.querySelector('.property-map-btn');
            if (cardMapBtn) {
                cardMapBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof openPropertyMapModal === 'function') {
                        openPropertyMapModal(prop);
                    }
                });
            }

            const roadMapBtn = article.querySelector('.property-road-map-btn');
            if (roadMapBtn) {
                roadMapBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof openPropertyMapModal === 'function') {
                        openPropertyMapModal(prop);
                    }
                });
            }

            const cardBrochureBtn = article.querySelector('.property-brochure-btn');
            if (cardBrochureBtn) {
                cardBrochureBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof openPropertyBrochureModal === 'function') {
                        openPropertyBrochureModal(prop);
                    }
                });
            }

            const cardShareBtn = article.querySelector('.property-share-btn');
            if (cardShareBtn) {
                cardShareBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (typeof openPropertyShareModal === 'function') {
                        openPropertyShareModal(prop);
                    }
                });
            }

            const enquireBtn = article.querySelector('.enquire-now-btn');
            if (enquireBtn) {
                enquireBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleEnquire(e);
                });
            }
            
            return article;
    };

    function renderProperties() {
        updateCityBadges();
        if (!propertyList) return;
        propertyList.innerHTML = '';
        
        const urlParamsNow = new URLSearchParams(window.location.search);
        const directPropId = urlParamsNow.get('id') || urlParamsNow.get('propertyId');
        let targetProp = null;
        if (directPropId && Array.isArray(properties)) {
            targetProp = properties.find(p => p && String(p.id) === String(directPropId));
        }

        // Direct Shared Listing Banner UI Sync
        const dlBanner = document.getElementById('direct-listing-banner');
        if (dlBanner) {
            if (directPropId) {
                dlBanner.style.display = 'flex';
                const dlTitle = document.getElementById('direct-listing-title');
                const dlMeta = document.getElementById('direct-listing-meta');
                const dlCity = document.getElementById('direct-listing-city');
                if (targetProp) {
                    if (dlTitle) dlTitle.textContent = targetProp.title || 'Property Listing';
                    if (targetProp.title) {
                        try {
                            document.title = `${targetProp.title} | MyFactorySpace Industrial Real Estate`;
                        } catch(e) {}
                    }
                    if (dlCity) dlCity.textContent = targetProp.location ? `${targetProp.location}, Selangor` : 'Selangor';
                    if (dlMeta) {
                        const parkText = targetProp.park ? ` • ${targetProp.park}` : '';
                        const specsText = targetProp.size && targetProp.size !== 'N/A' ? ` • Built-up: ${targetProp.size}` : (targetProp.landArea ? ` • Land: ${targetProp.landArea}` : '');
                        dlMeta.innerHTML = `<i class="fa-solid fa-map-location-dot" style="color: var(--primary);"></i> <span>${escapeHtml(targetProp.location || 'Selangor')}${escapeHtml(parkText)}</span> • <strong style="color: var(--primary); font-weight: 800;">${escapeHtml(targetProp.price || '')}</strong>${escapeHtml(specsText)}`;
                    }
                } else {
                    if (window._supabaseSyncComplete) {
                        if (dlTitle) dlTitle.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #f59e0b; margin-right: 6px;"></i> Listing #${escapeHtml(directPropId)} Unavailable`;
                        if (dlCity) dlCity.textContent = 'All Listings';
                        if (dlMeta) dlMeta.textContent = `This listing may have been sold, leased, or updated. Showing all available properties below.`;
                    } else {
                        if (dlTitle) dlTitle.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Loading Shared Listing...`;
                        if (dlCity) dlCity.textContent = 'Selangor';
                        if (dlMeta) dlMeta.textContent = `Retrieving property #${escapeHtml(directPropId)} details from database...`;
                    }
                }

                const resetBtn = document.getElementById('direct-listing-reset-btn');
                if (resetBtn && !resetBtn.dataset.bound) {
                    resetBtn.dataset.bound = 'true';
                    resetBtn.addEventListener('click', () => {
                        dlBanner.style.display = 'none';
                        const cleanUrl = window.location.pathname + (window.location.hash || '');
                        window.history.replaceState({}, '', cleanUrl);
                        try {
                            document.title = 'Factories & Warehouses For Sale & Rent | MyFactorySpace Listings';
                        } catch(e) {}
                        renderProperties();
                        const browseSec = document.getElementById('browse-properties') || document.getElementById('properties');
                        if (browseSec) {
                            const headerOffset = 80;
                            const elementPosition = browseSec.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                            window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
                        }
                    });
                }
            } else {
                dlBanner.style.display = 'none';
            }
        }

        const propKwInput = document.getElementById('property-keyword-search');
        const searchKw = propKwInput ? propKwInput.value.toLowerCase().trim() : (activeKeyword || '').toLowerCase().trim();

        const rangeCriterionEl = document.getElementById('range-filter-criterion');
        const rangeMinEl = document.getElementById('range-filter-min');
        const rangeMaxEl = document.getElementById('range-filter-max');

        const rangeCriterion = rangeCriterionEl ? rangeCriterionEl.value : 'budget';
        const rangeMinValStr = rangeMinEl ? rangeMinEl.value.replace(/[^0-9.]/g, '').trim() : '';
        const rangeMaxValStr = rangeMaxEl ? rangeMaxEl.value.replace(/[^0-9.]/g, '').trim() : '';

        const rangeMin = rangeMinValStr !== '' ? parseFloat(rangeMinValStr) : null;
        const rangeMax = rangeMaxValStr !== '' ? parseFloat(rangeMaxValStr) : null;
        const hasRangeFilter = (rangeMin !== null && !isNaN(rangeMin)) || (rangeMax !== null && !isNaN(rangeMax));

        let filtered = properties.filter(prop => {
            const matchCity = activeCity === 'All' || prop.location === activeCity;
            const matchType = activeType === 'All' || 
                prop.type === activeType || 
                (activeType === 'Factory' && prop.type && prop.type.toLowerCase().includes('factory'));
            
            const propSec = getSectionForProperty(prop);
            const matchSection = activeSection === 'All' || propSec === activeSection || prop.section === activeSection;
            const matchPark = activePark === 'All' || prop.park === activePark;
            
            const propIntent = prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale');
            const matchIntent = activeIntent === 'All' || propIntent.toLowerCase() === activeIntent.toLowerCase();

            const searchHaystack = [
                prop.title, prop.location, prop.section, prop.park, prop.type, prop.price, prop.tenure, prop.landArea, prop.builtUp, prop.power, prop.ceilingHeight, prop.floorLoading, prop.specs, prop.road, prop.description
            ].filter(Boolean).join(' ').toLowerCase();

            const matchKw = !searchKw || searchHaystack.includes(searchKw);

            let matchRange = true;
            if (hasRangeFilter) {
                let propVal = 0;
                if (rangeCriterion === 'budget') {
                    propVal = parsePriceValue(prop.price);
                } else if (rangeCriterion === 'buildup') {
                    propVal = parseBuildUpValue(prop.size || prop.builtUp);
                } else if (rangeCriterion === 'landarea') {
                    propVal = parseLandAreaSqftValue(prop.landArea);
                }

                if (rangeMin !== null && !isNaN(rangeMin) && propVal < rangeMin) {
                    matchRange = false;
                }
                if (rangeMax !== null && !isNaN(rangeMax) && propVal > rangeMax) {
                    matchRange = false;
                }
            }

            return matchCity && matchType && matchSection && matchPark && matchIntent && matchKw && matchRange && prop.status !== 'Pending' && prop.status !== 'Inactive';
        });

        // Ensure direct shared property is always visible in results
        if (targetProp && !filtered.some(p => String(p.id) === String(directPropId))) {
            filtered.unshift(targetProp);
        }

        // Sort properties by Date, Location/City, Section/Park, or Price
        filtered.sort((a, b) => {
            if (activeSort === 'date-desc') {
                const dateA = a.lastUpdated || a.updatedAt || a.dateAdded || a.dateCreated;
                const dateB = b.lastUpdated || b.updatedAt || b.dateAdded || b.dateCreated;
                const timeA = dateA ? new Date(dateA).getTime() : (typeof a.id === 'number' ? a.id : 0);
                const timeB = dateB ? new Date(dateB).getTime() : (typeof b.id === 'number' ? b.id : 0);
                return timeB - timeA;
            } else if (activeSort === 'date-asc') {
                const dateA = a.lastUpdated || a.updatedAt || a.dateAdded || a.dateCreated;
                const dateB = b.lastUpdated || b.updatedAt || b.dateAdded || b.dateCreated;
                const timeA = dateA ? new Date(dateA).getTime() : (typeof a.id === 'number' ? a.id : 0);
                const timeB = dateB ? new Date(dateB).getTime() : (typeof b.id === 'number' ? b.id : 0);
                return timeA - timeB;
            } else if (activeSort === 'location-asc') {
                const locA = (a.location || '').toLowerCase();
                const locB = (b.location || '').toLowerCase();
                if (locA !== locB) return locA.localeCompare(locB);
                const secA = (getSectionForProperty(a) || a.park || '').toLowerCase();
                const secB = (getSectionForProperty(b) || b.park || '').toLowerCase();
                return secA.localeCompare(secB);
            } else if (activeSort === 'location-desc') {
                const locA = (a.location || '').toLowerCase();
                const locB = (b.location || '').toLowerCase();
                if (locA !== locB) return locB.localeCompare(locA);
                const secA = (getSectionForProperty(a) || a.park || '').toLowerCase();
                const secB = (getSectionForProperty(b) || b.park || '').toLowerCase();
                return secB.localeCompare(secA);
            } else if (activeSort === 'section-asc') {
                const secA = (getSectionForProperty(a) || a.park || '').toLowerCase();
                const secB = (getSectionForProperty(b) || b.park || '').toLowerCase();
                if (secA !== secB) return secA.localeCompare(secB);
                const locA = (a.location || '').toLowerCase();
                const locB = (b.location || '').toLowerCase();
                return locA.localeCompare(locB);
            } else if (activeSort === 'section-desc') {
                const secA = (getSectionForProperty(a) || a.park || '').toLowerCase();
                const secB = (getSectionForProperty(b) || b.park || '').toLowerCase();
                if (secA !== secB) return secB.localeCompare(secA);
                const locA = (a.location || '').toLowerCase();
                const locB = (b.location || '').toLowerCase();
                return locB.localeCompare(locA);
            } else if (activeSort === 'price-asc') {
                return parsePriceValue(a.price) - parsePriceValue(b.price);
            } else if (activeSort === 'price-desc') {
                return parsePriceValue(b.price) - parsePriceValue(a.price);
            }
            return 0;
        });

        // If direct listing target is specified, sort it to the very top (index 0)
        if (targetProp) {
            filtered.sort((a, b) => {
                const aIsTarget = String(a.id) === String(directPropId);
                const bIsTarget = String(b.id) === String(directPropId);
                if (aIsTarget) return -1;
                if (bIsTarget) return 1;
                return 0;
            });
        }

        const isFiltered = activeCity !== 'All' || activeType !== 'All' || activeSection !== 'All' || activePark !== 'All' || activeIntent !== 'All' || searchKw !== '' || hasRangeFilter;
        
        if (resultsCountEl) {
            if (targetProp) {
                resultsCountEl.innerHTML = `<span style="color: var(--primary); font-weight: 800;"><i class="fa-solid fa-bullseye"></i> Showing Shared Property: ${escapeHtml(targetProp.title)}</span> <span style="font-weight: 500; color: var(--text-muted);">(${filtered.length} total listings available)</span>`;
            } else if (isFiltered) {
                let filterLabels = [];
                if (activeCity !== 'All') filterLabels.push(activeCity);
                if (activeSection !== 'All') filterLabels.push(activeSection);
                if (activePark !== 'All') filterLabels.push(activePark);
                if (activeType !== 'All') filterLabels.push(activeType);
                if (activeIntent !== 'All') filterLabels.push(`For ${activeIntent}`);
                if (searchKw !== '') filterLabels.push(`"${searchKw}"`);

                if (hasRangeFilter) {
                    let rangeLabelName = 'Budget';
                    let rangeUnit = 'RM';
                    if (rangeCriterion === 'buildup') { rangeLabelName = 'Build Up'; rangeUnit = 'sqft'; }
                    else if (rangeCriterion === 'landarea') { rangeLabelName = 'Land Area'; rangeUnit = 'sqft'; }

                    if (rangeMin !== null && rangeMax !== null) {
                        filterLabels.push(`${rangeLabelName}: ${rangeMin.toLocaleString()} - ${rangeMax.toLocaleString()} ${rangeUnit}`);
                    } else if (rangeMin !== null) {
                        filterLabels.push(`${rangeLabelName}: ≥ ${rangeMin.toLocaleString()} ${rangeUnit}`);
                    } else if (rangeMax !== null) {
                        filterLabels.push(`${rangeLabelName}: ≤ ${rangeMax.toLocaleString()} ${rangeUnit}`);
                    }
                }

                resultsCountEl.textContent = `Showing ${filtered.length} property${filtered.length === 1 ? '' : 'ies'} (${filterLabels.join(', ')})`;
            } else {
                let sortName = 'Date Added';
                if (activeSort === 'location-asc' || activeSort === 'location-desc') sortName = 'Location / City';
                else if (activeSort === 'section-asc' || activeSort === 'section-desc') sortName = 'Section / Industrial Park';
                else if (activeSort === 'price-asc' || activeSort === 'price-desc') sortName = 'Price';
                resultsCountEl.textContent = `Showing All ${filtered.length} Properties (Sorted by ${sortName})`;
            }
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.style.display = isFiltered ? 'inline-block' : 'none';
        }

        if (filtered.length === 0) {
            propertyList.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: var(--white); border-radius: 16px; border: 1px solid var(--border-light); color: var(--text-muted); font-size: 1.1rem;"><i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--primary-light); display: block;"></i>No properties found matching your criteria. Try adjusting your location or property type filters.</div>';
            return;
        }

        const isHomepage = !!document.getElementById('view-all-properties-btn');
        let propertiesToDisplay = filtered;
        
        if (isHomepage && !isFiltered) {
            const manualFeatured = filtered.filter(p => p && (p.showOnMainpage === true || String(p.showOnMainpage) === 'true' || p.featured === true || String(p.featured) === 'true'));
            const currentSettings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});
            const isRandomEnabled = currentSettings.randomFeaturedProperties !== false && String(currentSettings.randomFeaturedProperties) !== 'false';
            const maxMainpageFeatured = (typeof currentSettings.maxFeaturedPropertiesDisplayed === 'number' && currentSettings.maxFeaturedPropertiesDisplayed > 0)
                ? Math.min(18, currentSettings.maxFeaturedPropertiesDisplayed)
                : 6;

            if (manualFeatured.length > 0) {
                const storedAgents = safeJsonParse('industria_agents', []);
                // Group featured properties by matched agent
                const agentGroups = new Map();
                const unassignedGroup = [];

                manualFeatured.forEach(p => {
                    const matchedAgent = getAgentForProperty(p, storedAgents);
                    if (matchedAgent) {
                        const agentId = String(matchedAgent.id);
                        if (!agentGroups.has(agentId)) {
                            agentGroups.set(agentId, []);
                        }
                        agentGroups.get(agentId).push(p);
                    } else {
                        unassignedGroup.push(p);
                    }
                });

                // Shuffle or sort each agent's pool
                agentGroups.forEach((groupProps) => {
                    if (isRandomEnabled) {
                        for (let i = groupProps.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [groupProps[i], groupProps[j]] = [groupProps[j], groupProps[i]];
                        }
                    } else {
                        groupProps.sort((a, b) => {
                            const dateA = a.lastUpdated || a.updatedAt || a.dateAdded || a.dateCreated;
                            const dateB = b.lastUpdated || b.updatedAt || b.dateAdded || b.dateCreated;
                            const timeA = dateA ? new Date(dateA).getTime() : (typeof a.id === 'number' ? a.id : (parseFloat(String(a.id).replace(/[^0-9]/g, '')) || 0));
                            const timeB = dateB ? new Date(dateB).getTime() : (typeof b.id === 'number' ? b.id : (parseFloat(String(b.id).replace(/[^0-9]/g, '')) || 0));
                            return timeB - timeA;
                        });
                    }
                });

                if (isRandomEnabled) {
                    for (let i = unassignedGroup.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [unassignedGroup[i], unassignedGroup[j]] = [unassignedGroup[j], unassignedGroup[i]];
                    }
                } else {
                    unassignedGroup.sort((a, b) => {
                        const dateA = a.lastUpdated || a.updatedAt || a.dateAdded || a.dateCreated;
                        const dateB = b.lastUpdated || b.updatedAt || b.dateAdded || b.dateCreated;
                        const timeA = dateA ? new Date(dateA).getTime() : (typeof a.id === 'number' ? a.id : (parseFloat(String(a.id).replace(/[^0-9]/g, '')) || 0));
                        const timeB = dateB ? new Date(dateB).getTime() : (typeof b.id === 'number' ? b.id : (parseFloat(String(b.id).replace(/[^0-9]/g, '')) || 0));
                        return timeB - timeA;
                    });
                }

                // Fair round-robin distribution across agent groups (maximum maxMainpageFeatured displayed)
                const selected = [];
                const groupArrays = Array.from(agentGroups.values());
                if (isRandomEnabled) {
                    for (let i = groupArrays.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [groupArrays[i], groupArrays[j]] = [groupArrays[j], groupArrays[i]];
                    }
                }
                let hasMore = true;
                let roundIndex = 0;

                while (hasMore && selected.length < maxMainpageFeatured) {
                    hasMore = false;
                    for (let g = 0; g < groupArrays.length; g++) {
                        if (roundIndex < groupArrays[g].length && selected.length < maxMainpageFeatured) {
                            selected.push(groupArrays[g][roundIndex]);
                            hasMore = true;
                        }
                    }
                    roundIndex++;
                }

                // If fewer than maxMainpageFeatured selected from agent groups, fill from unassigned featured properties
                let uIndex = 0;
                while (selected.length < maxMainpageFeatured && uIndex < unassignedGroup.length) {
                    selected.push(unassignedGroup[uIndex]);
                    uIndex++;
                }

                // If still fewer than maxMainpageFeatured and more featured properties exist, fill remaining
                if (selected.length < maxMainpageFeatured) {
                    const remainingFeatured = manualFeatured.filter(p => !selected.some(s => String(s.id) === String(p.id)));
                    if (isRandomEnabled) {
                        for (let i = remainingFeatured.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [remainingFeatured[i], remainingFeatured[j]] = [remainingFeatured[j], remainingFeatured[i]];
                        }
                    }
                    selected.push(...remainingFeatured.slice(0, maxMainpageFeatured - selected.length));
                }

                propertiesToDisplay = selected.slice(0, maxMainpageFeatured);
            } else {
                if (isRandomEnabled) {
                    let pool = [...filtered];
                    for (let i = pool.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [pool[i], pool[j]] = [pool[j], pool[i]];
                    }
                    propertiesToDisplay = pool.slice(0, maxMainpageFeatured);
                } else {
                    propertiesToDisplay = filtered.slice(0, maxMainpageFeatured); // Fallback to newest if none selected
                }
            }
        }

        // Guarantee direct shared property is always displayed first on homepage if present
        if (targetProp && !propertiesToDisplay.some(p => String(p.id) === String(directPropId))) {
            propertiesToDisplay.unshift(targetProp);
        }

        propertiesToDisplay.forEach(prop => {
            const article = window.createStandardPropertyCard(prop, { directPropId });
            if (article) {
                propertyList.appendChild(article);
            }
        });

        // If direct listing target is present, smoothly scroll to it with navbar offset
        if (directPropId) {
            setTimeout(() => {
                const targetCard = document.getElementById(`property-${directPropId}`) || document.getElementById('direct-listing-banner');
                if (targetCard) {
                    const headerOffset = 85;
                    const bannerEl = document.getElementById('direct-listing-banner');
                    const scrollTarget = (bannerEl && bannerEl.style.display !== 'none') ? bannerEl : targetCard;
                    const rect = scrollTarget.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetY = rect.top + scrollTop - headerOffset;
                    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
                }
                if (typeof window.handleDeepLinkedProperty === 'function') {
                    window.handleDeepLinkedProperty(directPropId);
                }
            }, 100);
        }

        // Sync Answer Engine Optimization (AOE) structured data
        syncDynamicSchema(targetProp, propertiesToDisplay);

        setTimeout(() => {
            document.querySelectorAll('.temp-featured-badge').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.delayed-usage-badge').forEach(el => {
                el.classList.remove('delayed-usage-badge');
                el.style.opacity = '1';
                el.style.visibility = 'visible';
            });
        }, 20600);
    }

    // --- 7. CITY & PARK DROPDOWNS ---
    function populateCityParkDropdowns() {
        document.querySelectorAll('.city-park-select').forEach(select => {
            const city = select.getAttribute('data-city');
            select.innerHTML = `
                <option value="" disabled selected hidden style="display:none;"></option>
                <option value="All">All Parks in ${city}</option>
            `;
            if (city && parks && parks[city] && Array.isArray(parks[city])) {
                parks[city].forEach(park => {
                    if (!park) return;
                    const parkName = typeof park === 'string' ? park : (park.name || '');
                    const isHidden = park && typeof park === 'object' && !!park.hidden;
                    if (!isHidden && parkName) {
                        const option = document.createElement('option');
                        option.value = parkName;
                        let displayText = parkName;
                        if (typeof park === 'object' && park.section) {
                            displayText = `${parkName} (${park.section})`;
                        }
                        option.textContent = displayText;
                        select.appendChild(option);
                    }
                });
            }
            select.value = '';
        });
    }

    populateCityParkDropdowns();

    function selectCityFilter(cityName, shouldScroll = true) {
        if (!cityName) return;
        const targetCard = document.querySelector(`.city-filter-card[data-city="${cityName}"]`);
        if (!targetCard) return;

        cityFilters.forEach(c => c.classList.remove('active'));
        targetCard.classList.add('active');
        activeCity = cityName;
        activePark = 'All';
        activeSection = 'All';

        document.querySelectorAll('.city-park-select').forEach(s => {
            s.value = '';
        });

        document.querySelectorAll('.city-label').forEach(l => {
            const defaultText = l.getAttribute('data-default');
            if (defaultText) {
                const shortCityMap = { 'Petaling Jaya': 'PJ', 'Subang Jaya': 'Subang', 'Shah Alam': 'Shah Alam', 'Klang': 'Klang' };
                const shortText = shortCityMap[defaultText] || defaultText;
                l.innerHTML = `<span class="city-label-full">${defaultText} <i class="fa-solid fa-chevron-down" style="font-size: 0.7em; margin-left: 4px;"></i></span><span class="city-label-short">${shortText}</span>`;
            }
        });

        syncFilterUI();
        renderProperties();

        if (shouldScroll) {
            const filterContainer = document.getElementById('city-filters') || document.querySelector('.property-filters');
            if (filterContainer) {
                filterContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    window.selectCityFilter = selectCityFilter;

    function scrollToFeaturedProperties() {
        const isHomepage = !!document.getElementById('view-all-properties-btn');
        const targetSection = isHomepage 
            ? document.getElementById('properties') 
            : (document.getElementById('browse-properties') || document.getElementById('property-list'));

        if (targetSection) {
            setTimeout(() => {
                const nav = document.getElementById('navbar');
                const navHeight = nav ? nav.offsetHeight : 80;
                const targetPos = targetSection.getBoundingClientRect().top + window.pageYOffset - (navHeight + 20);
                window.scrollTo({
                    top: Math.max(0, targetPos),
                    behavior: 'smooth'
                });
            }, 60);
        }
    }

    if (cityFilters.length > 0) {
        cityFilters.forEach(card => {
            const city = card.getAttribute('data-city');
            const select = card.querySelector('.city-park-select');
            const label = card.querySelector('.city-label');

            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'SELECT') return;
                selectCityFilter(city, false);
                scrollToFeaturedProperties();
            });

            if (select) {
                const prepareSelectForPick = () => {
                    select.value = '';
                };
                select.addEventListener('pointerdown', prepareSelectForPick);
                select.addEventListener('mousedown', prepareSelectForPick);
                select.addEventListener('touchstart', prepareSelectForPick, { passive: true });
                select.addEventListener('focus', prepareSelectForPick);

                select.addEventListener('change', (e) => {
                    const chosenValue = e.target.value;
                    if (!chosenValue) return;

                    cityFilters.forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    activeCity = city;
                    activePark = chosenValue;
                    activeSection = 'All';

                    document.querySelectorAll('.city-park-select').forEach(s => {
                        s.value = '';
                    });
                    document.querySelectorAll('.city-label').forEach(l => {
                        if (l !== label) {
                            const defaultText = l.getAttribute('data-default');
                            if (defaultText) {
                                const shortCityMap = { 'Petaling Jaya': 'PJ', 'Subang Jaya': 'Subang', 'Shah Alam': 'Shah Alam', 'Klang': 'Klang' };
                                const shortText = shortCityMap[defaultText] || defaultText;
                                l.innerHTML = `<span class="city-label-full">${defaultText} <i class="fa-solid fa-chevron-down" style="font-size: 0.7em; margin-left: 4px;"></i></span><span class="city-label-short">${shortText}</span>`;
                            }
                        }
                    });

                    const defaultCityName = label.getAttribute('data-default') || city;
                    const shortCityMap = { 'Petaling Jaya': 'PJ', 'Subang Jaya': 'Subang', 'Shah Alam': 'Shah Alam', 'Klang': 'Klang' };
                    const shortCityName = shortCityMap[defaultCityName] || defaultCityName;
                    if (activePark === 'All') {
                        label.innerHTML = `<span class="city-label-full">${defaultCityName} <i class="fa-solid fa-chevron-down" style="font-size: 0.7em; margin-left: 4px;"></i></span><span class="city-label-short">${shortCityName}</span>`;
                    } else {
                        label.innerHTML = `<span class="city-label-full">${activePark} <i class="fa-solid fa-chevron-down" style="font-size: 0.7em; margin-left: 4px;"></i></span><span class="city-label-short">${activePark}</span>`;
                    }

                    syncFilterUI();
                    renderProperties();
                    scrollToFeaturedProperties();

                    setTimeout(() => {
                        select.value = '';
                    }, 100);
                });
            }
        });

        if (typeFilters.length > 0) {
            typeFilters.forEach(btn => {
                btn.addEventListener('click', () => {
                    typeFilters.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeType = btn.getAttribute('data-type');
                    renderProperties();
                    scrollToFeaturedProperties();
                });
            });
        }
    }

    document.querySelectorAll('.coverage-city-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const city = link.getAttribute('data-city');
            if (city) {
                selectCityFilter(city, true);
            }
        });
    });

    function formatPropertyInterest(prop) {
        if (!prop) return '';
        const sectionName = getSectionForProperty(prop);
        const sectionOrPark = sectionName ? `@ ${sectionName}` : (prop.park || '');
        const details = [prop.type, prop.location, sectionOrPark].filter(Boolean).join(', ');
        return `${prop.title} (${details})`;
    }

    // --- 8. LEAD & INTEREST FORM ---
    function populateLeadInterest() {
        const leadInterestSelect = document.getElementById('leadInterest');
        if (leadInterestSelect) {
            const currentVal = leadInterestSelect.value;
            leadInterestSelect.innerHTML = '<option value="">Select an option</option><option value="General Inquiry">General Inquiry</option>';
            properties.forEach(prop => {
                if (prop.status !== 'Pending') {
                    const option = document.createElement('option');
                    const interestString = formatPropertyInterest(prop);
                    option.value = interestString;
                    option.textContent = interestString;
                    leadInterestSelect.appendChild(option);
                }
            });
            if (currentVal) {
                leadInterestSelect.value = currentVal;
            }
            if (!leadInterestSelect.dataset.syncBound) {
                leadInterestSelect.dataset.syncBound = 'true';
                leadInterestSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    const defaultInfo = document.getElementById('default-contact-info');
                    const selectedInfo = document.getElementById('selected-property-info');
                    const fBar = document.getElementById('contact-form-step-bar');
                    const pBanner = document.getElementById('lead-form-prop-banner');

                    if (!val || val === 'General Inquiry') {
                        if (defaultInfo && selectedInfo && selectedInfo.style.display !== 'none') {
                            selectedInfo.style.opacity = '0';
                            setTimeout(() => {
                                selectedInfo.style.display = 'none';
                                defaultInfo.style.display = 'block';
                                setTimeout(() => defaultInfo.style.opacity = '1', 50);
                            }, 300);
                        }
                        if (leadForm) {
                            delete leadForm.dataset.selectedIntent;
                            delete leadForm.dataset.selectedPropertyId;
                            delete leadForm.dataset.selectedPark;
                        }
                        if (fBar) fBar.style.display = 'none';
                        if (pBanner) pBanner.style.display = 'none';
                    } else {
                        const matchedProp = properties.find(p => {
                            if (!p) return false;
                            const str = formatPropertyInterest(p);
                            return str === val || (p.title && val.includes(p.title));
                        });
                        if (matchedProp && typeof matchedProp._selectForEnquiry === 'function') {
                            matchedProp._selectForEnquiry(false);
                        }
                    }
                });
            }
        }
    }
    
    populateLeadInterest();

    function triggerWhatsAppNotification(type, data) {
        let targetWaNumber = '';
        
        try {
            const siteSettings = JSON.parse(localStorage.getItem('industria_settings')) || {};

            // Check if WhatsApp notifications are globally disabled
            if (siteSettings.whatsappNotificationsEnabled === 'disabled' || siteSettings.whatsappNotificationsEnabled === false) {
                console.log('WhatsApp notifications are disabled in settings.');
                return;
            }

            // Check granular notification settings for lead / owner listing
            if (type === 'lead' && siteSettings.whatsappLeadNotificationEnabled === false) {
                console.log('WhatsApp notifications for leads are disabled in settings.');
                return;
            }

            if (type === 'owner' && siteSettings.whatsappOwnerNotificationEnabled === false) {
                console.log('WhatsApp notifications for owner listings are disabled in settings.');
                return;
            }

            const users = JSON.parse(localStorage.getItem('industria_users')) || [];
            const agents = JSON.parse(localStorage.getItem('industria_agents')) || [];
            const catalogProperties = JSON.parse(localStorage.getItem('industria_properties')) || (typeof properties !== 'undefined' ? properties : []);
            
            let targetPark = data.park || '';
            let targetInterest = data.interest || '';
            let targetLocation = data.location || '';
            let targetMessage = data.message || '';

            // If park is not explicitly set, try resolving from property catalog via interest match
            if (!targetPark && targetInterest) {
                const matchedProp = catalogProperties.find(p => {
                    if (!p) return false;
                    const formatted = typeof formatPropertyInterest === 'function' ? formatPropertyInterest(p) : '';
                    return (formatted && formatted.toLowerCase() === targetInterest.toLowerCase()) ||
                           (p.title && targetInterest.toLowerCase().includes(p.title.toLowerCase()));
                });

                if (matchedProp && matchedProp.park) {
                    targetPark = matchedProp.park;
                }
            }

            // Create haystack string for matching assigned parks
            const searchHaystack = [targetPark, targetInterest, targetLocation, targetMessage].filter(Boolean).join(' ').toLowerCase();

            if (searchHaystack) {
                const matchedAgent = agents.find(a => {
                    const agentParks = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                    return agentParks.some(p => {
                        if (!p || typeof p !== 'string') return false;
                        const cleanP = p.trim().toLowerCase();
                        if (!cleanP) return false;

                        return (targetPark && targetPark.toLowerCase() === cleanP) ||
                               (targetPark && targetPark.toLowerCase().includes(cleanP)) ||
                               searchHaystack.includes(cleanP);
                    });
                });

                if (matchedAgent) {
                    // Priority 1: User/Assistant account linked to this agent with whatsapp number
                    const linkedUser = users.find(u => String(u.agentId) === String(matchedAgent.id) && u.whatsapp && u.whatsapp.trim() !== '');
                    if (linkedUser) {
                        targetWaNumber = linkedUser.whatsapp;
                    } 
                    // Priority 2: Direct WhatsApp / Phone number stored on the agent profile
                    else if (matchedAgent.whatsapp || matchedAgent.phone) {
                        targetWaNumber = matchedAgent.whatsapp || matchedAgent.phone;
                    }
                }
            }
            
            // Priority 2.5: If unassigned park (no specialist agent matched via park), route directly to Property Creator!
            if (!targetWaNumber && (data.propertyId || data.assignedAgentId || data.assignedUser || data.creatorUsername || targetInterest)) {
                let relatedProp = null;
                if (data.propertyId) {
                    relatedProp = catalogProperties.find(p => String(p.id) === String(data.propertyId));
                }
                if (!relatedProp && targetInterest) {
                    relatedProp = catalogProperties.find(p => {
                        if (!p) return false;
                        const formatted = typeof formatPropertyInterest === 'function' ? formatPropertyInterest(p) : '';
                        return (formatted && formatted.toLowerCase() === targetInterest.toLowerCase()) ||
                               (p.title && targetInterest.toLowerCase().includes(p.title.toLowerCase()));
                    });
                }

                // If agent ID is linked (on data or on property)
                const creatorAgentId = data.assignedAgentId || (relatedProp && (relatedProp.createdByAgentId || relatedProp.assignedAgentId));
                if (creatorAgentId) {
                    const cAgent = agents.find(a => String(a.id) === String(creatorAgentId));
                    if (cAgent) {
                        const linkedUser = users.find(u => String(u.agentId) === String(cAgent.id) && u.whatsapp && u.whatsapp.trim() !== '');
                        if (linkedUser) targetWaNumber = linkedUser.whatsapp;
                        else if (cAgent.whatsapp) targetWaNumber = cAgent.whatsapp;
                        else if (cAgent.phone) targetWaNumber = cAgent.phone;
                    }
                }

                // If creator username is linked (on data or on property)
                if (!targetWaNumber) {
                    const creatorUName = data.assignedUser || data.creatorUsername || (relatedProp && relatedProp.createdBy);
                    if (creatorUName) {
                        const cUser = users.find(u => u && u.username && u.username.toLowerCase() === String(creatorUName).toLowerCase());
                        if (cUser) {
                            if (cUser.whatsapp && cUser.whatsapp.trim() !== '') targetWaNumber = cUser.whatsapp;
                            else if (cUser.phone && cUser.phone.trim() !== '') targetWaNumber = cUser.phone;
                        }
                    }
                }

                // Direct creator phone fallback from property object
                if (!targetWaNumber && relatedProp && relatedProp.createdByPhone) {
                    targetWaNumber = relatedProp.createdByPhone;
                }
            }

            // Priority 3: Fallback to Administrator account in Admin Management with configured WhatsApp number
            if (!targetWaNumber) {
                const adminUser = users.find(u => u.role === 'Administrator' && u.whatsapp && u.whatsapp.trim() !== '');
                if (adminUser) {
                    targetWaNumber = adminUser.whatsapp;
                }
            }
        } catch(e) { console.error('Error routing WhatsApp notification:', e); }

        // Priority 4: Fallback to General Site Settings WhatsApp Number
        if (!targetWaNumber) {
            const siteSettings = JSON.parse(localStorage.getItem('industria_settings')) || {};
            targetWaNumber = siteSettings.whatsappNotificationNumber;
        }

        if (!targetWaNumber) return;

        let message = '';
        if (type === 'lead') {
            message = `*New Lead Submitted!*\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email || 'N/A'}\nInterest: ${data.interest}\nMessage: ${data.message || 'N/A'}`;
        } else if (type === 'owner') {
            message = `*New Owner Listing Submitted!*\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email || 'N/A'}\nLocation: ${data.location}\nPark: ${data.park || 'N/A'}\nType: ${data.type}\nIntent: ${data.intent}\nAsking Price / Rent: ${data.price || 'Open for Negotiation'}\nAddress & Property Notes: ${data.notes || 'N/A'}`;
        }

        const encodedMessage = encodeURIComponent(message);
        const cleanWaNumber = targetWaNumber.replace(/[^0-9]/g, '');
        if (cleanWaNumber) {
            const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodedMessage}`;
            window.open(waUrl, '_blank');
        }
    }

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const interestVal = document.getElementById('leadInterest') ? document.getElementById('leadInterest').value : '';
            const detectedIntent = leadForm.dataset.selectedIntent || (interestVal.toLowerCase().includes('rent') || interestVal.toLowerCase().includes('mo') ? 'Rent' : 'Sale');

            const selectedPropId = leadForm.dataset.selectedPropertyId || null;
            const selectedPark = leadForm.dataset.selectedPark || '';

            const catalogProperties = safeJsonParse('industria_properties', typeof properties !== 'undefined' ? properties : []);
            let detectedPark = selectedPark || '';
            let assignedAgentId = null;
            let matchedProp = null;

            if (selectedPropId && catalogProperties.length > 0) {
                matchedProp = catalogProperties.find(p => String(p.id) === String(selectedPropId));
                if (matchedProp && matchedProp.park) {
                    detectedPark = matchedProp.park;
                }
            }

            if (!detectedPark && interestVal && catalogProperties.length > 0) {
                matchedProp = catalogProperties.find(p => {
                    if (!p) return false;
                    const formatted = typeof formatPropertyInterest === 'function' ? formatPropertyInterest(p) : '';
                    return (formatted && formatted.toLowerCase() === interestVal.toLowerCase()) ||
                           (p.title && interestVal.toLowerCase().includes(p.title.toLowerCase()));
                });
                if (matchedProp && matchedProp.park) {
                    detectedPark = matchedProp.park;
                }
            }

            if (!detectedPark) {
                const parksObj = safeJsonParse('industria_industrial_parks', {});
                let allParks = [];
                Object.values(parksObj).forEach(arr => {
                    if (Array.isArray(arr)) {
                        arr.forEach(p => {
                            const pName = typeof p === 'string' ? p : p.name;
                            if (pName) allParks.push(pName);
                        });
                    }
                });
                const msgVal = document.getElementById('leadMessage') ? document.getElementById('leadMessage').value : '';
                const haystack = `${interestVal} ${msgVal}`.toLowerCase();
                for (const park of allParks) {
                    if (park && (haystack.includes(park.toLowerCase()) || park.toLowerCase().includes('bukit raja') && haystack.includes('bukit raja'))) {
                        detectedPark = park;
                        break;
                    }
                }
            }

            if (!detectedPark && interestVal.toLowerCase().includes('klang')) {
                detectedPark = 'Bandar Bukit Raja Industrial Park';
            }

            if (detectedPark) {
                const agents = safeJsonParse('industria_agents', []);
                const matchedAgent = agents.find(a => {
                    const agentParks = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                    return agentParks.some(p => p && (p.toLowerCase() === detectedPark.toLowerCase() || detectedPark.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(detectedPark.toLowerCase())));
                });
                if (matchedAgent) {
                    assignedAgentId = matchedAgent.id;
                }
            }

            // If park is unassigned or no specialist agent matched via park, route lead attribution to Property Creator!
            let creatorUsername = null;
            if (!assignedAgentId && matchedProp) {
                if (matchedProp.createdByAgentId) {
                    assignedAgentId = matchedProp.createdByAgentId;
                }
                if (matchedProp.createdBy) {
                    creatorUsername = matchedProp.createdBy;
                }
            }

            const newLead = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                date: new Date().toLocaleDateString(),
                name: document.getElementById('leadName').value,
                email: document.getElementById('leadEmail').value,
                phone: document.getElementById('leadPhone').value,
                interest: interestVal,
                intent: detectedIntent,
                propertyId: selectedPropId || (matchedProp ? matchedProp.id : null),
                park: detectedPark,
                assignedAgentId: assignedAgentId,
                assignedUser: creatorUsername,
                creatorUsername: creatorUsername,
                message: document.getElementById('leadMessage').value,
                status: 'New'
            };

            let leads = safeJsonParse('industria_leads', []);
            leads.unshift(newLead); // Newest first
            safeLocalStorageSet('industria_leads', leads);

            // Sync lead to Supabase Industra project
            if (window.IndustraSupabase && typeof window.IndustraSupabase.addLead === 'function') {
                window.IndustraSupabase.addLead({
                    id: String(newLead.id),
                    name: newLead.name,
                    email: newLead.email,
                    phone: newLead.phone,
                    interest: newLead.interest || '',
                    intent: newLead.intent || '',
                    date: newLead.date,
                    timestamp: newLead.timestamp,
                    property_id: newLead.propertyId ? String(newLead.propertyId) : null,
                    message: `${newLead.interest ? 'Interest: ' + newLead.interest + '\n' : ''}${newLead.park ? 'Park: ' + newLead.park + '\n' : ''}${newLead.message || ''}`,
                    status: 'New',
                    specs: newLead
                });
            }

            triggerWhatsAppNotification('lead', newLead);

            if (leadSuccess) leadSuccess.style.display = 'block';
            leadForm.reset();
            delete leadForm.dataset.selectedIntent;
            delete leadForm.dataset.selectedPropertyId;
            delete leadForm.dataset.selectedPark;

            const pBanner = document.getElementById('lead-form-prop-banner');
            if (pBanner) pBanner.style.display = 'none';

            const defaultInfo = document.getElementById('default-contact-info');
            const selectedInfo = document.getElementById('selected-property-info');
            if (defaultInfo && selectedInfo && selectedInfo.style.display !== 'none') {
                selectedInfo.style.opacity = '0';
                setTimeout(() => {
                    selectedInfo.style.display = 'none';
                    defaultInfo.style.display = 'block';
                    setTimeout(() => defaultInfo.style.opacity = '1', 50);
                }, 300);
            }

            setTimeout(() => {
                if (leadSuccess) leadSuccess.style.display = 'none';
            }, 5000);
        });
    }

    // --- PROPERTY OWNER LISTING SUBMISSIONS & MODALS ---
    const ownerListingForm = document.getElementById('owner-listing-form');
    const ownerFormSuccess = document.getElementById('owner-form-success');

    // Populate Industrial Park select dropdowns based on chosen Location
    const ownerLocationSelect = document.getElementById('ownerLocation');
    const ownerParkSelect = document.getElementById('ownerPark');
    const modalOwnerLocationSelect = document.getElementById('modalOwnerLocation');
    const modalOwnerParkSelect = document.getElementById('modalOwnerPark');

    function populateParksDropdown(city, targetSelect) {
        if (!targetSelect) return;
        targetSelect.innerHTML = '<option value="">Select Industrial Park (Optional)...</option>';
        if (!city) return;

        try {
            const parksData = JSON.parse(localStorage.getItem('industria_industrial_parks')) || {};
            const parkList = parksData[city];
            if (Array.isArray(parkList) && parkList.length > 0) {
                parkList.forEach(p => {
                    const parkName = (typeof p === 'string') ? p : p.name;
                    const isHidden = (typeof p === 'object' && p.hidden);
                    if (parkName && !isHidden) {
                        const opt = document.createElement('option');
                        opt.value = parkName;
                        opt.textContent = parkName;
                        targetSelect.appendChild(opt);
                    }
                });
            }
        } catch (e) {
            console.warn('Error reading parks for dropdown:', e);
        }
    }

    if (ownerLocationSelect && ownerParkSelect) {
        ownerLocationSelect.addEventListener('change', (e) => {
            populateParksDropdown(e.target.value, ownerParkSelect);
        });
    }
    if (modalOwnerLocationSelect && modalOwnerParkSelect) {
        modalOwnerLocationSelect.addEventListener('change', (e) => {
            populateParksDropdown(e.target.value, modalOwnerParkSelect);
        });
    }

    function resolveAgentForListing(listingData) {
        if (!listingData) return null;
        const targetPark = listingData.park || '';
        const targetLoc = listingData.location || '';
        const agents = safeJsonParse('industria_agents', []);

        if (agents.length === 0) return null;

        const matched = agents.find(a => {
            const agentParks = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            return agentParks.some(p => {
                if (!p) return false;
                const pLower = p.toLowerCase();
                if (targetPark && (pLower === targetPark.toLowerCase() || targetPark.toLowerCase().includes(pLower) || pLower.includes(targetPark.toLowerCase()))) {
                    return true;
                }
                if (targetLoc && (pLower.includes(targetLoc.toLowerCase()) || targetLoc.toLowerCase().includes(pLower))) {
                    return true;
                }
                return false;
            });
        });

        return matched ? matched.id : null;
    }

    async function saveOwnerListing(listingData) {
        if (!listingData.assignedAgentId) {
            listingData.assignedAgentId = resolveAgentForListing(listingData);
        }
        let listings = safeJsonParse('industria_owner_listings', []);
        listings.unshift(listingData); // Newest first
        safeLocalStorageSet('industria_owner_listings', listings);

        if (window.IndustraSupabase && typeof window.IndustraSupabase.upsertOwnerListing === 'function') {
            await window.IndustraSupabase.upsertOwnerListing(listingData);
        }
    }

    if (ownerListingForm) {
        ownerListingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const parkVal = document.getElementById('ownerPark') ? document.getElementById('ownerPark').value : '';
            const listingData = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                date: new Date().toLocaleDateString(),
                name: document.getElementById('ownerName').value,
                phone: document.getElementById('ownerPhone').value,
                email: document.getElementById('ownerEmail').value,
                location: document.getElementById('ownerLocation').value,
                park: parkVal,
                type: document.getElementById('ownerType').value,
                intent: document.getElementById('ownerIntent').value,
                size: document.getElementById('ownerSize').value || 'Not specified',
                price: document.getElementById('ownerPrice').value || 'Open for Negotiation',
                notes: document.getElementById('ownerNotes').value || '',
                status: 'Pending'
            };

            saveOwnerListing(listingData);
            triggerWhatsAppNotification('owner', listingData);

            if (ownerFormSuccess) ownerFormSuccess.style.display = 'block';
            ownerListingForm.reset();
            if (ownerParkSelect) ownerParkSelect.innerHTML = '<option value="">Select Location First...</option>';

            setTimeout(() => {
                if (ownerFormSuccess) ownerFormSuccess.style.display = 'none';
            }, 6000);
        });
    }

    // Modal Property Owner Listing Form
    const modalOwnerForm = document.getElementById('modal-owner-form');
    const modalOwnerFormSuccess = document.getElementById('modal-owner-form-success');
    const ownerModal = document.getElementById('ownerModal');
    const closeOwnerModalBtn = document.getElementById('close-owner-modal');
    const openOwnerModalBtns = document.querySelectorAll('.open-owner-modal-btn');

    openOwnerModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (ownerModal) ownerModal.style.display = 'block';
        });
    });

    if (closeOwnerModalBtn && ownerModal) {
        closeOwnerModalBtn.addEventListener('click', () => {
            ownerModal.style.display = 'none';
        });
    }

    if (ownerModal) {
        window.addEventListener('click', (e) => {
            if (e.target === ownerModal) {
                ownerModal.style.display = 'none';
            }
        });
    }

    if (modalOwnerForm) {
        modalOwnerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const modalParkVal = document.getElementById('modalOwnerPark') ? document.getElementById('modalOwnerPark').value : '';
            const listingData = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                date: new Date().toLocaleDateString(),
                name: document.getElementById('modalOwnerName').value,
                phone: document.getElementById('modalOwnerPhone').value,
                email: document.getElementById('modalOwnerEmail').value,
                location: document.getElementById('modalOwnerLocation').value,
                park: modalParkVal,
                type: document.getElementById('modalOwnerType').value,
                intent: document.getElementById('modalOwnerIntent').value,
                size: 'Not specified',
                price: document.getElementById('modalOwnerPrice').value || 'Open for Negotiation',
                notes: document.getElementById('modalOwnerNotes').value || '',
                status: 'Pending'
            };

            saveOwnerListing(listingData);
            triggerWhatsAppNotification('owner', listingData);

            if (modalOwnerFormSuccess) modalOwnerFormSuccess.style.display = 'block';
            modalOwnerForm.reset();
            if (modalOwnerParkSelect) modalOwnerParkSelect.innerHTML = '<option value="">Select Location First...</option>';

            setTimeout(() => {
                if (modalOwnerFormSuccess) modalOwnerFormSuccess.style.display = 'none';
                if (ownerModal) ownerModal.style.display = 'none';
            }, 2500);
        });
    }

    // Number Input Formatters
    const formatNumberWithCommas = (input, prefix = '') => {
        if (!input) return;
        
        const formatValue = (val) => {
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
        
        input.addEventListener('change', function() {
            this.value = formatValue(this.value);
        });
    };

    formatNumberWithCommas(document.getElementById('ownerPrice'), 'RM ');
    formatNumberWithCommas(document.getElementById('modalOwnerPrice'), 'RM ');
    // Not formatting ownerSize because it might need text like "sqft" or "Acres" since there is no separate unit dropdown on this form

    // Initial render calls
    renderProperties();
    renderAgents();

    // Render Agents
    function renderAgents() {
        const teamGrid = document.getElementById('team-grid');
        if (!teamGrid) return;
        
        teamGrid.innerHTML = '';
        const defaultAgents = [
            { id: 1, name: 'Marcus Chen', ren: 'REN 44824', phone: '60168882311', whatsapp: '60168882311', email: 'marcus@myfactoryspace.com', bio: 'Specializing in large-scale factory acquisitions and heavy industrial plots across Shah Alam and Klang.', image: 'assets/images/agent_marcus.jpg', assignedParks: ['Subang Hi-Tech', 'Klang Utama Industrial Park'], parks: ['Subang Hi-Tech', 'Klang Utama Industrial Park'], showOnMainpage: true },
            { id: 2, name: 'Renvin', ren: 'REN 61030', phone: '60124557890', whatsapp: '60124557890', email: 'sarah@myfactoryspace.com', bio: 'Expert in warehouse space rentals, high-floor-load logistics hubs, and built-to-suit industrial leases.', image: 'https://vnsinkesbbikeqbywxfd.supabase.co/storage/v1/object/public/property-images/prop_1791373830746_hoby4a.jpg', assignedParks: ['Eco Business Park I', 'i-Park @ Indahpura', 'Ace Industrial Park'], parks: ['Eco Business Park I', 'i-Park @ Indahpura', 'Ace Industrial Park'], showOnMainpage: true },
            { id: 3, name: 'David Raj', ren: 'REN 51203', phone: '60193321144', whatsapp: '60193321144', email: 'david@myfactoryspace.com', bio: 'Focusing on corporate property expansion, regulatory compliance, and multi-facility industrial portfolios.', image: 'assets/images/agent_david.jpg', assignedParks: ['Tiong Nam Industrial Park'], parks: ['Tiong Nam Industrial Park'], showOnMainpage: true }
        ];
        
        const storedAgents = JSON.parse(localStorage.getItem('industria_agents'));
        let agents;
        if (!Array.isArray(storedAgents) || storedAgents.length === 0) {
            agents = JSON.parse(JSON.stringify(defaultAgents));
            localStorage.setItem('industria_agents', JSON.stringify(agents));
        } else {
            const ag2 = storedAgents.find(a => String(a.id) === '2');
            if (ag2 && (ag2.name === 'Sarah Lin' || ag2.ren === 'REN 38192')) {
                ag2.name = 'Renvin';
                ag2.ren = 'REN 61030';
                ag2.image = 'https://vnsinkesbbikeqbywxfd.supabase.co/storage/v1/object/public/property-images/prop_1791373830746_hoby4a.jpg';
                localStorage.setItem('industria_agents', JSON.stringify(storedAgents));
            }
            agents = storedAgents;
        }

        const siteSettings = Object.assign({}, defaultSettings, JSON.parse(localStorage.getItem('industria_settings')) || {});
        const isRandomAgentsEnabled = siteSettings.randomFeaturedAgents !== false && String(siteSettings.randomFeaturedAgents) !== 'false';
        const maxAgentsDisplayed = (typeof siteSettings.maxFeaturedAgentsDisplayed === 'number' && siteSettings.maxFeaturedAgentsDisplayed > 0)
            ? Math.min(6, siteSettings.maxFeaturedAgentsDisplayed)
            : 3;

        // Render featured specialist agents dynamically
        let featuredAgents = agents.filter(a => a.showOnMainpage === true || String(a.showOnMainpage) === 'true');
        if (featuredAgents.length === 0) {
            featuredAgents = agents.filter(a => a.showOnMainpage !== false);
            if (featuredAgents.length === 0) featuredAgents = agents;
        }

        let mainpageAgents = [...featuredAgents];
        if (isRandomAgentsEnabled) {
            for (let i = mainpageAgents.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mainpageAgents[i], mainpageAgents[j]] = [mainpageAgents[j], mainpageAgents[i]];
            }
        }

        mainpageAgents = mainpageAgents.slice(0, maxAgentsDisplayed);
        
        mainpageAgents.forEach(agent => {
            const card = document.createElement('div');
            card.className = 'agent-card';
            card.innerHTML = `
                <div class="agent-img-box" oncontextmenu="return false;" ondragstart="return false;">
                    <img src="${agent.image || 'assets/images/agent_marcus.jpg'}" alt="${agent.name}" loading="lazy" width="400" height="400" style="object-fit: cover; pointer-events: none; -webkit-user-drag: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;">
                    <span class="agent-ren-badge">${agent.ren || 'REN Certified'}</span>
                </div>
                <div class="agent-info">
                    <div class="agent-name-wrap">
                        <span class="agent-name">${agent.name}</span>
                    </div>
                    <p class="agent-bio">${agent.bio || 'Industrial Real Estate Specialist'}</p>
                </div>
            `;
            teamGrid.appendChild(card);
        });
    }

    // Prevent right-click context menu and dragging on all agent photos and property photos
    document.addEventListener('contextmenu', function(e) {
        if (e.target && e.target.closest && (
            e.target.closest('.agent-img-box') || 
            e.target.closest('.agent-card') ||
            e.target.closest('.property-img-wrapper') ||
            e.target.closest('.selected-property-img-wrapper') ||
            e.target.closest('.property-card') ||
            e.target.closest('.property-gallery-modal') ||
            e.target.closest('.pg-image-viewport') ||
            e.target.closest('.city-filter-card')
        )) {
            e.preventDefault();
            return false;
        }
    });

    document.addEventListener('dragstart', function(e) {
        if (e.target && e.target.closest && (
            e.target.closest('.agent-img-box') || 
            e.target.closest('.agent-card') ||
            e.target.closest('.property-img-wrapper') ||
            e.target.closest('.selected-property-img-wrapper') ||
            e.target.closest('.property-card') ||
            e.target.closest('.property-gallery-modal') ||
            e.target.closest('.pg-image-viewport') ||
            e.target.closest('.city-filter-card')
        )) {
            e.preventDefault();
            return false;
        }
    });

    // --- STATS BANNER INTERACTIVITY & DYNAMIC COUNT-UP LOGIC ---
    window.scrollToProperties = function() {
        const section = document.getElementById('properties');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            section.style.transition = 'outline 0.5s ease';
            section.style.outline = '3px solid var(--primary)';
            setTimeout(() => { section.style.outline = 'none'; }, 1500);
        }
    };

    function initStatCountUp() {
        const el1 = document.getElementById('stat-count-1');
        const el2 = document.getElementById('stat-count-2');
        const el3 = document.getElementById('stat-count-3');
        const banner = document.querySelector('.stats-banner');
        if (!banner || !el1 || !el2 || !el3) return;

        let hasAnimated = false;

        function runCountUp() {
            if (hasAnimated) return;
            hasAnimated = true;

            const startTime = performance.now();
            const duration = 1600; // ms

            function step() {
                const now = performance.now();
                const progress = Math.min((now - startTime) / duration, 1);
                // Cubic ease-out curve
                const ease = 1 - Math.pow(1 - progress, 3);

                // Item 1: 0 -> 500
                const val1 = Math.floor(500 * ease);
                el1.textContent = val1 + '+';

                // Item 2: RM 0M+ -> RM 1200M+ -> RM 1.2B+ (Counts in Millions for high-impact visual roll)
                if (progress < 0.88) {
                    const mVal = Math.floor(1200 * ease);
                    el2.textContent = 'RM ' + mVal + 'M+';
                } else {
                    const bVal = (1.2 * ease).toFixed(1);
                    el2.textContent = 'RM ' + bVal + 'B+';
                }

                // Item 3: 0 -> 45
                const val3 = Math.floor(45 * ease);
                el3.textContent = val3 + '+';

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    // Final exact values
                    el1.textContent = '500+';
                    el2.textContent = 'RM 1.2B+';
                    el3.textContent = '45+';
                }
            }

            requestAnimationFrame(step);
        }

        function checkScroll() {
            if (hasAnimated) return;
            const rect = banner.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.95 && rect.bottom >= 0) {
                runCountUp();
            }
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        runCountUp();
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.05 });
            observer.observe(banner);
        }

        window.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll();
    }

    initStatCountUp();

    const defaultLogoSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCAzMDAgOTAiPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iOTAiIHJ4PSIxMCIgZmlsbD0iIzAwNzdiNiIvPjxwYXRoIGQ9Ik0zMCA2MFYzMGwyMC0xMHY0MGwyMC0xMHYzNUgzMHoiIGZpbGw9IiMzOGJkZjgiLz48dGV4dCB4PSI4NSIgeT0iNTIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2ZmZmZmZiIgbGV0dGVyLXNwYWNpbmc9IjIiPk5PIExPR088L3RleHQ+PC9zdmc+';

    const defaultWatermarkSettings = {
        type: 'logo',
        text: 'MyFactorySpace',
        position: 'bottom-right',
        opacity: 85,
        textSize: 5,
        logoSize: 25,
        logoBase64: defaultLogoSvg
    };

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

    async function applyWatermark(base64Image) {
        if (!base64Image) return base64Image;

        const currentSettings = JSON.parse(localStorage.getItem('industria_watermark_settings')) || defaultWatermarkSettings;
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
    }

    let isScriptWatermarkProcessing = false;

    async function applyWatermarksToProperties() {
        if (isScriptWatermarkProcessing) return;
        isScriptWatermarkProcessing = true;

        try {
            const watermarkSettings = JSON.parse(localStorage.getItem('industria_watermark_settings')) || defaultWatermarkSettings;
            const isWatermarkDisabled = !watermarkSettings || watermarkSettings.type === 'none';

            if (isWatermarkDisabled) {
                let changed = false;
                for (let i = 0; i < properties.length; i++) {
                    let p = properties[i];
                    if (!p) continue;
                    if ((!p.rawImages || p.rawImages.length === 0) && (!p.images || p.images.length === 0)) {
                        if (p.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[p.id]) {
                            p.rawImages = [...defaultPropertyImagesMap[p.id]];
                            p.rawImage = p.rawImages[0];
                        }
                    }
                    if (p.rawImages && p.rawImages.length > 0) {
                        if (JSON.stringify(p.images) !== JSON.stringify(p.rawImages)) {
                            p.images = [...p.rawImages];
                            p.image = p.images[0];
                            changed = true;
                        }
                    }
                }
                if (changed && typeof renderProperties === 'function') {
                    renderProperties();
                }
                return;
            }

            let updatedAny = false;

            for (let i = 0; i < properties.length; i++) {
                let p = properties[i];
                if (!p) continue;

                if (!p.rawImages || p.rawImages.length === 0) {
                    if (p.id && typeof defaultPropertyImagesMap !== 'undefined' && defaultPropertyImagesMap[p.id]) {
                        p.rawImages = [...defaultPropertyImagesMap[p.id]];
                        p.rawImage = p.rawImages[0];
                    } else if (p.rawImage && !p.rawImage.startsWith('data:')) {
                        p.rawImages = [p.rawImage];
                    } else if (p.images && p.images.length > 0 && !p.images.some(img => typeof img === 'string' && img.startsWith('data:'))) {
                        p.rawImages = [...p.images];
                        p.rawImage = p.rawImages[0];
                    } else {
                        p.rawImages = ['assets/images/warehouse.jpg'];
                        p.rawImage = 'assets/images/warehouse.jpg';
                    }
                }

                const newWatermarkedImages = await Promise.all(p.rawImages.map(async (rawItem) => {
                    return await applyWatermark(rawItem);
                }));

                const newPrimaryImage = (newWatermarkedImages && newWatermarkedImages.length > 0) ? newWatermarkedImages[0] : p.rawImage;

                if (JSON.stringify(p.images) !== JSON.stringify(newWatermarkedImages)) {
                    p.images = newWatermarkedImages;
                    p.image = newPrimaryImage;
                    updatedAny = true;
                }
            }

            if (updatedAny && typeof renderProperties === 'function') {
                renderProperties();
            }
        } catch (err) {
            console.warn('applyWatermarksToProperties error:', err);
        } finally {
            isScriptWatermarkProcessing = false;
        }
    }

    // Run watermark process on index page load
    applyWatermarksToProperties();

    // Real-Time Cross-Tab / Dashboard Sync Handler
    window.addEventListener('storage', (e) => {
        if (!e.key || e.key === 'industria_properties' || e.key === 'industria_watermark_settings') {
            const rawStoredProps = safeJsonParse('industria_properties', null);
            if (Array.isArray(rawStoredProps) && rawStoredProps.length > 0) {
                properties = rawStoredProps;
            } else {
                properties = defaultProperties;
            }
            properties.forEach(p => {
                if (p && !p.intent) {
                    p.intent = p.price && String(p.price).toLowerCase().includes('mo') ? 'Rent' : 'Sale';
                }
            });
            if (typeof renderProperties === 'function') renderProperties();
            if (typeof populateLeadInterest === 'function') populateLeadInterest();
        }
        if (!e.key || e.key === 'industria_industrial_parks') {
            const rawStoredParks = safeJsonParse('industria_industrial_parks', null);
            if (rawStoredParks && typeof rawStoredParks === 'object') {
                parks = rawStoredParks;
                populateCityParkDropdowns();
                renderProperties();
            }
        }
        if (!e.key || e.key === 'industria_agents') {
            renderAgents();
        }
        if (!e.key || e.key === 'industria_settings' || e.key === 'industria_branding_settings') {
            applySiteSettings();
            applyBranding();
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

    // --- 12. FLOATING BACK-TO-TOP & SCROLLSPY NAVIGATION UX ---
    (function initScrollUX() {
        let topBtn = document.getElementById('scroll-to-top-btn');
        if (!topBtn) {
            topBtn = document.createElement('button');
            topBtn.id = 'scroll-to-top-btn';
            topBtn.className = 'scroll-to-top-btn';
            topBtn.setAttribute('aria-label', 'Scroll back to top');
            topBtn.setAttribute('title', 'Back to Top');
            topBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
            document.body.appendChild(topBtn);
            topBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        const sectionIds = ['home', 'about', 'services', 'who-we-are', 'properties', 'owner-section', 'contact'];
        const navAnchors = Array.from(document.querySelectorAll('#nav-links a[href^="#"]'));

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY || window.pageYOffset;
                    if (topBtn) {
                        topBtn.classList.toggle('visible', scrollY > 420);
                    }
                    if (navAnchors.length > 1) {
                        let currentSection = 'home';
                        for (let i = 0; i < sectionIds.length; i++) {
                            const sec = document.getElementById(sectionIds[i]);
                            if (sec) {
                                const rect = sec.getBoundingClientRect();
                                if (rect.top <= 160 && rect.bottom >= 140) {
                                    currentSection = sectionIds[i];
                                }
                            }
                        }
                        navAnchors.forEach(a => {
                            const href = a.getAttribute('href');
                            a.classList.toggle('active', href === '#' + currentSection);
                        });
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    })();

    // Keyboard Escape to close any active public modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const ownerModal = document.getElementById('ownerModal');
            if (ownerModal && ownerModal.style.display !== 'none' && ownerModal.style.display !== '') {
                const closeBtn = document.getElementById('close-owner-modal');
                if (closeBtn) closeBtn.click();
                else ownerModal.style.display = 'none';
            }
            const propModal = document.getElementById('propertyDetailModal') || document.querySelector('.property-detail-modal.show');
            if (propModal) {
                const closeDetailBtn = propModal.querySelector('.modal-close-btn, .close-modal');
                if (closeDetailBtn) closeDetailBtn.click();
            }
        }
    });
});

