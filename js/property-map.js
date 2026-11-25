/**
 * Interactive Covered Industrial Parks Map Module for MyFactorySpace
 * Dual-engine architecture:
 *   1. Official Google Maps JS API ("Map data ©2026 Google") when a valid API Key is saved in Dashboard Settings
 *   2. Automatic keyless Leaflet + Esri World Street / Satellite fallback (zero errors or watermarks)
 * Displays Covered Industrial Parks by location with cross-platform Mac (⌘) & Windows (Ctrl) Keyboard Shortcuts.
 */
(function (global) {
    'use strict';

    const PARK_COLOR = '#059669';
    const PARK_DARK = '#064e3b';
    const KLANG_VALLEY_CENTER = [3.0738, 101.5183];

    const CITY_COORDS = {
        'petaling jaya': [3.1073, 101.6067],
        'subang jaya': [3.0567, 101.5851],
        'shah alam': [3.0733, 101.5185],
        'klang': [3.0449, 101.4456]
    };

    const SECTION_COORDS = {
        'seksyen 51': [3.0956, 101.6358],
        'section 51': [3.0956, 101.6358],
        'seksyen 51a': [3.0992, 101.6295],
        'section 51a': [3.0992, 101.6295],
        'seksyen 13': [3.1128, 101.6347],
        'section 13': [3.1128, 101.6347],
        'seksyen 15': [3.0543, 101.5295],
        'section 15': [3.0543, 101.5295],
        'seksyen 16': [3.0596, 101.5036],
        'section 16': [3.0596, 101.5036],
        'seksyen 22': [3.0537, 101.5535],
        'section 22': [3.0537, 101.5535],
        'seksyen 23': [3.0432, 101.5326],
        'section 23': [3.0432, 101.5326],
        'seksyen 26': [3.0259, 101.5458],
        'section 26': [3.0259, 101.5458],
        'seksyen 27': [3.0148, 101.5567],
        'section 27': [3.0148, 101.5567],
        'seksyen 28': [3.0052, 101.5594],
        'section 28': [3.0052, 101.5594],
        'seksyen 31': [2.9998, 101.5356],
        'seksyen 33': [3.0112, 101.5382],
        'seksyen 34': [3.0195, 101.5015],
        'seksyen u5': [3.1682, 101.5467],
        'glenmarie': [3.0881, 101.5597],
        'batu tiga': [3.0715, 101.5528],
        'bukit jelutong': [3.1055, 101.5312],
        'kota kemuning': [2.9998, 101.5356],
        'setia alam': [3.1038, 101.4648],
        'sime uep': [3.0405, 101.5752],
        'subang hi-tech': [3.0638, 101.5653],
        'bandar sunway': [3.0668, 101.6022],
        'usj': [3.0485, 101.5865],
        'ss13': [3.0694, 101.5947],
        'tp7': [3.0472, 101.5594],
        'bandar bukit raja': [3.0954, 101.4408],
        'pulau indah': [2.9368, 101.3215],
        'northport': [3.0198, 101.3802],
        'meru': [3.1265, 101.4368],
        'kapar': [3.1375, 101.3845],
        'telok gong': [2.9765, 101.3912],
        'pandamaran': [3.0112, 101.4148]
    };

    const PARK_COORDS = [
        { keys: ['pj 51 business'], coords: [3.0972, 101.6374] },
        { keys: ['pj 51 industrial', 'pj51'], coords: [3.0956, 101.6358] },
        { keys: ['tiong nam industrial park @ pj', 'tiong nam industrial park pj', 'tiong nam @ pj', 'tiong nam pj'], city: 'Petaling Jaya', coords: [3.0938, 101.6382] },
        { keys: ['pjs 5'], coords: [3.0815, 101.6378] },
        { keys: ['kota damansara', 'emhub'], coords: [3.1536, 101.5764] },
        { keys: ['ara damansara'], coords: [3.1145, 101.5818] },
        { keys: ['tiara square', 'tiara business park'], coords: [3.0432, 101.5833] },
        { keys: ['usj avenue', 'usj 1 industrial', 'usj 1'], coords: [3.0558, 101.5914] },
        { keys: ['usj 19'], coords: [3.0308, 101.5877] },
        { keys: ['sime uep'], coords: [3.0405, 101.5752] },
        { keys: ['subang hi-tech', 'subang hitech'], coords: [3.0638, 101.5653] },
        { keys: ['taman perindustrian subang', 'tp7'], coords: [3.0472, 101.5594] },
        { keys: ['ss13', 'subang jaya industrial estate'], coords: [3.0694, 101.5947] },
        { keys: ['pjs 11', 'sunway'], coords: [3.0668, 101.6022] },
        { keys: ['pjs 7'], coords: [3.0679, 101.6114] },
        { keys: ['putra heights'], coords: [2.9922, 101.5744] },
        { keys: ['hicom-glenmarie', 'hicom glenmarie', 'glenmarie'], coords: [3.0881, 101.5597] },
        { keys: ['temasya'], coords: [3.0808, 101.5646] },
        { keys: ['ace industrial'], coords: [3.0617, 101.5234] },
        { keys: ['tiong nam industrial park shah alam', 'tiong nam shah alam', 'tiong nam industrial park'], city: 'Shah Alam', coords: [3.0642, 101.5436] },
        { keys: ['batu tiga'], coords: [3.0715, 101.5528] },
        { keys: ['sekitar 26'], coords: [3.0259, 101.5458] },
        { keys: ['i-parc 1', 'iparc 1'], coords: [3.0282, 101.5476] },
        { keys: ['i-parc 2', 'iparc 2'], coords: [3.0268, 101.5494] },
        { keys: ['i-parc @ bukit jelutong', 'bukit jelutong'], coords: [3.1055, 101.5312] },
        { keys: ['hicom 27', 'taman alam megah'], coords: [3.0148, 101.5567] },
        { keys: ['kota kemuning'], coords: [2.9998, 101.5356] },
        { keys: ['setia alam'], coords: [3.1038, 101.4648] },
        { keys: ['bandar bukit raja', 'bukit raja'], coords: [3.0954, 101.4408] },
        { keys: ['klang utama'], coords: [3.0895, 101.4252] },
        { keys: ['bandar sultan suleiman', 'northport'], coords: [3.0198, 101.3802] },
        { keys: ['pulau indah', 'westport'], coords: [2.9368, 101.3215] },
        { keys: ['telok gong'], coords: [2.9765, 101.3912] },
        { keys: ['pandamaran'], coords: [3.0112, 101.4148] },
        { keys: ['meru'], coords: [3.1265, 101.4368] },
        { keys: ['kapar'], coords: [3.1375, 101.3845] }
    ];

    // Curated Klang Valley Industrial Road Coordinates for instant 0ms 1st-Road Pin Resolution
    const ROAD_COORDS = [
        // Hicom-Glenmarie & Temasya (Shah Alam U1)
        { keys: ['jalan pentadbir u1/30', 'pentadbir u1/30', 'jalan pentadbir'], coords: [3.0808, 101.5575] },
        { keys: ['jalan pendidik u1/34', 'pendidik u1/34', 'jalan pendidik'], coords: [3.0894, 101.5608] },
        { keys: ['jalan jurunilai u1/20', 'jurunilai u1/20', 'jalan jurunilai'], coords: [3.0835, 101.5559] },
        { keys: ['jalan jurutera u1/23', 'jurutera u1/23', 'jalan jurutera'], coords: [3.0849, 101.5574] },
        { keys: ['jalan juruhebah u1/50', 'jalan juruhebah'], coords: [3.0821, 101.5624] },
        { keys: ['jalan juruanalisis u1/35', 'jalan juruanalisis'], coords: [3.0902, 101.5615] },
        { keys: ['jalan juruukur u1/19', 'jalan juruukur'], coords: [3.0842, 101.5551] },
        { keys: ['jalan pengurus u1/73', 'jalan pengurus'], coords: [3.0872, 101.5584] },
        { keys: ['jalan kerjaya', 'persiaran kerjaya'], coords: [3.0865, 101.5632] },
        { keys: ['jalan pelukis u1/46', 'jalan pelukis'], coords: [3.0814, 101.5641] },
        { keys: ['jalan saujana indah'], coords: [3.0965, 101.5568] },
        // Shah Alam Seksyen 15, 16, 22, 23, 26, 27, Bukit Jelutong, Kota Kemuning
        { keys: ['jalan linggis 15/24', 'linggis 15/24', 'jalan linggis', 'jalan 15/24'], coords: [3.0617, 101.5234] },
        { keys: ['jalan utas 15/7', 'jalan utas'], coords: [3.0658, 101.5352] },
        { keys: ['jalan ragum 15/17', 'jalan ragum'], coords: [3.0688, 101.5428] },
        { keys: ['jalan pahat 15/15', 'jalan pahat'], coords: [3.0650, 101.5270] },
        { keys: ['jalan tukul 15/15', 'jalan tukul'], coords: [3.0648, 101.5315] },
        { keys: ['jalan gergaji 15/14', 'jalan gergaji'], coords: [3.0632, 101.5335] },
        { keys: ['jalan kikir 15/19', 'jalan kikir'], coords: [3.0637, 101.5349] },
        { keys: ['jalan sepana 15/3', 'jalan sepana'], coords: [3.0645, 101.5285] },
        { keys: ['jalan gudang 16/9', 'jalan gudang 16', 'jalan gudang', 'jalan paku 16/6'], coords: [3.0588, 101.5052] },
        { keys: ['persiaran jubli perak'], coords: [3.0537, 101.5458] },
        { keys: ['jalan perusahaan'], coords: [3.0562, 101.5495] },
        { keys: ['jalan sungai rasau'], coords: [3.0554, 101.4912] },
        { keys: ['jalan bukit kemuning'], coords: [3.0124, 101.5298] },
        { keys: ['jalan anggerik mokara'], coords: [2.9985, 101.5372] },
        { keys: ['jalan kebun'], coords: [2.9942, 101.5145] },
        { keys: ['jalan subang 26', 'persiaran sabak bernam', 'seksyen 26'], coords: [3.0264, 101.5469] },
        { keys: ['jalan astaka u8', 'jalan astaka'], coords: [3.1059, 101.5318] },
        { keys: ['jalan utarid u5', 'jalan apollo u5'], coords: [3.1684, 101.5471] },
        // Petaling Jaya (Seksyen 51, 51A, 13, 19, PJS)
        { keys: ['jalan tandang 51/205a', 'tandang 51/205a', 'jalan 51/205a', '51/205a', 'jalan 51/203a', 'jln 51/203a'], coords: [3.0880, 101.6312] },
        { keys: ['jalan tandang'], coords: [3.08915, 101.63485] },
        { keys: ['jalan 51/205', 'jalan 51/'], coords: [3.09465, 101.63615] },
        { keys: ['jalan 51a/225', 'jalan 51a/223', 'jalan 51a/'], coords: [3.0994, 101.6298] },
        { keys: ['jalan penchala'], coords: [3.0924, 101.6375] },
        { keys: ['jalan kemajuan'], coords: [3.1125, 101.6345] },
        { keys: ['jalan semangat', 'jalan profesor khoo kay kim'], coords: [3.1108, 101.6362] },
        { keys: ['jalan pjs 5/'], coords: [3.0818, 101.6381] },
        // Subang Jaya (USJ, SIME UEP, Subang Hi-Tech, SS13, Bandar Sunway)
        { keys: ['jalan subang 1', 'jalan subang 2', 'jalan subang 3', 'jalan subang 4', 'jalan subang 5', 'jalan subang 6', 'jalan subang 7', 'jalan subang'], coords: [3.0468, 101.5892] },
        { keys: ['persiaran teknologi subang', 'jalan nilam'], coords: [3.0642, 101.5656] },
        { keys: ['jalan tp 7', 'jalan tp7', 'jalan tp 5', 'jalan tp'], coords: [3.0475, 101.5596] },
        { keys: ['jalan ss 13/', 'jalan ss13/'], coords: [3.0696, 101.5949] },
        { keys: ['jalan pjs 11/'], coords: [3.0671, 101.6025] },
        { keys: ['jalan pjs 7/'], coords: [3.0681, 101.6116] },
        // Klang (Bukit Raja, Meru, Kapar, Pandamaran, Telok Gong, Pulau Indah)
        { keys: ['jalan keluli', 'persiaran bukit raja', 'lebuh keluli'], coords: [3.0762, 101.4678] },
        { keys: ['jalan korporat', 'jalan meru'], coords: [3.1268, 101.4372] },
        { keys: ['jalan kapar'], coords: [3.1378, 101.3849] },
        { keys: ['jalan banting', 'jalan pandamaran'], coords: [3.0115, 101.4152] },
        { keys: ['jalan telok gong'], coords: [2.9768, 101.3915] }
    ];

    const ROAD_GEOCODE_CACHE_KEY = 'industria_road_geocode_cache_v4';

    /**
     * Extracts the FIRST road name from a Road / Street Address field that may list multiple roads
     * e.g. "Jalan Pentadbir U1/30, Jalan Pendidik" -> "Jalan Pentadbir U1/30"
     * Preserves slashes inside Malaysian road codes (like U1/30, SS13/4, 51A/225).
     */
    function extractPrimaryRoad(roadInput) {
        if (!roadInput || typeof roadInput !== 'string') return '';
        const cleaned = roadInput.replace(/\s+/g, ' ').trim();
        if (!cleaned) return '';

        // Split on commas, semicolons, pipes, " & ", " and ", or " / " (only when surrounded by spaces)
        const segments = cleaned
            .split(/\s*(?:[,;|]|\s+\/\s+|\s+&\s+|\s+and\s+)\s*/i)
            .map(s => s.trim())
            .filter(Boolean);

        if (segments.length === 0) return '';
        if (segments.length === 1) return segments[0];

        const roadKeywordRe = /\b(?:jalan|jln\.?|persiaran|psrn\.?|lorong|lrg\.?|lebuh|lebuhraya|lengkok|lengkuk|solok|lingkaran|ss\s*\d|pjs\s*\d|usj\s*\d|tp\s*\d|u\d+\/\d+|seksyen\s*\w)/i;
        const unitPrefixOnlyRe = /^(?:(?:no\.?|lot|plot|unit|pt|wisman?)\s*)?[0-9a-z-]{1,10}$/i;

        // If the first comma segment is only a lot/unit number (e.g. "Lot 8, Jalan Pentadbir U1/30, Jalan Pendidik"), capture the first actual road segment
        if (unitPrefixOnlyRe.test(segments[0]) && !roadKeywordRe.test(segments[0])) {
            const firstRoadSeg = segments.find(seg => roadKeywordRe.test(seg));
            if (firstRoadSeg) return firstRoadSeg;
        }

        return segments[0];
    }

    function readRoadGeocodeCache() {
        try {
            const raw = global.localStorage && global.localStorage.getItem(ROAD_GEOCODE_CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') return parsed;
            }
        } catch (_) {}
        return {};
    }

    function writeRoadGeocodeCache(cacheKey, coords, source) {
        if (!cacheKey || !coords || !isValidMalaysiaCoord(coords.lat, coords.lng)) return;
        try {
            const cache = readRoadGeocodeCache();
            cache[cacheKey] = {
                lat: Number(Number(coords.lat).toFixed(6)),
                lng: Number(Number(coords.lng).toFixed(6)),
                source: source || 'first-road-geocoded'
            };
            if (global.localStorage) {
                global.localStorage.setItem(ROAD_GEOCODE_CACHE_KEY, JSON.stringify(cache));
            }
        } catch (_) {}
    }

    function extractDistinctiveRoadTokens(roadName) {
        const stopWords = new Set([
            'jalan', 'jln', 'persiaran', 'psrn', 'lorong', 'lrg', 'lebuh', 'lebuhraya',
            'lengkok', 'lengkuk', 'solok', 'lingkaran', 'seksyen', 'section', 'taman',
            'perindustrian', 'industrial', 'park', 'no', 'lot', 'unit', 'pt', 'selangor', 'malaysia'
        ]);
        const cleaned = String(roadName || '').toLowerCase().replace(/[^a-z0-9/\s-]/g, ' ');
        return cleaned
            .split(/\s+/)
            .map(t => t.trim())
            .filter(t => t.length >= 2 && !stopWords.has(t));
    }

    function candidateMatchesRoadTokens(text, tokens) {
        if (!tokens || tokens.length === 0) return true;
        const hay = String(text || '').toLowerCase();
        if (!hay) return false;
        const namedTokens = tokens.filter(t => /[a-z]{3,}/i.test(t));
        if (namedTokens.length > 0) {
            return namedTokens.some(t => hay.includes(t));
        }
        return tokens.some(t => hay.includes(t));
    }

    function resolvePrimaryRoadCoordinates(roadInput, city, parkName) {
        const primaryRoad = extractPrimaryRoad(roadInput);
        if (!primaryRoad) return null;
        const normRoad = primaryRoad.toLowerCase();

        // 1. Check cached live-geocoded street coordinates in localStorage first
        const cache = readRoadGeocodeCache();
        const cacheKey = `${normRoad}|${String(city || '').trim().toLowerCase()}`;
        const hit = cache[cacheKey] || cache[normRoad];
        if (hit && isValidMalaysiaCoord(hit.lat, hit.lng)) {
            return { lat: Number(hit.lat), lng: Number(hit.lng), source: hit.source || 'first-road-geocoded', primaryRoad };
        }

        // 2. Check built-in curated industrial ROAD_COORDS for instant 0ms initial map framing (always upgraded by live geocoder)
        for (const entry of ROAD_COORDS) {
            if (entry.keys.some(k => normRoad.includes(k.toLowerCase()))) {
                return { lat: entry.coords[0], lng: entry.coords[1], source: 'first-road-fallback', primaryRoad };
            }
        }

        return null;
    }

    async function geocodePrimaryRoad(opts) {
        const primaryRoad = extractPrimaryRoad(opts && opts.road);
        if (!primaryRoad) return null;
        const city = String((opts && opts.location) || '').trim();
        const parkName = String((opts && opts.park) || '').trim();
        const forceRefresh = Boolean(opts && opts.forceRefresh);

        const normRoad = primaryRoad.toLowerCase();
        const cacheKey = `${normRoad}|${city.toLowerCase()}`;
        const roadTokens = extractDistinctiveRoadTokens(primaryRoad);

        // 1. Return already-geocoded precise live coordinate from v4 cache unless refresh requested
        //    (Automatically upgrades non-Google cache entries whenever a Google Maps API key is active)
        if (!forceRefresh) {
            const cache = readRoadGeocodeCache();
            const cachedHit = cache[cacheKey] || cache[normRoad];
            if (cachedHit && isValidMalaysiaCoord(cachedHit.lat, cachedHit.lng)) {
                const wantsGoogleUpgrade = shouldUseGoogle() && cachedHit.source !== 'first-road-google';
                if (!wantsGoogleUpgrade) {
                    return { lat: Number(cachedHit.lat), lng: Number(cachedHit.lng), source: cachedHit.source || 'first-road-geocoded', primaryRoad };
                }
            }
        }

        // 2. PRIORITY 1 — Official Google Maps Geocoder (when API Key is configured in Settings)
        if (shouldUseGoogle() && !(global.google && global.google.maps && typeof global.google.maps.Geocoder === 'function')) {
            try {
                await loadGoogleMapsSdk(readConfiguredGoogleMapsKey());
            } catch (_) {}
        }

        if (global.google && global.google.maps && typeof global.google.maps.Geocoder === 'function') {
            try {
                const geocoder = new global.google.maps.Geocoder();
                const gQueries = Array.from(new Set([
                    parkName ? [primaryRoad, parkName, city, 'Selangor', 'Malaysia'].filter(Boolean).join(', ') : '',
                    [primaryRoad, city, 'Selangor', 'Malaysia'].filter(Boolean).join(', '),
                    [primaryRoad, 'Selangor', 'Malaysia'].filter(Boolean).join(', ')
                ].filter(Boolean)));
                for (const q of gQueries) {
                    const gRes = await new Promise((resolve) => {
                        geocoder.geocode({ address: q, region: 'MY', componentRestrictions: { country: 'MY' } }, (results, status) => {
                            if (status === 'OK' && Array.isArray(results) && results.length > 0) {
                                const preciseMatch = results.find(r => {
                                    const types = Array.isArray(r.types) ? r.types : [];
                                    const isStreet = types.some(t => ['route', 'street_address', 'premise', 'subpremise', 'intersection', 'establishment', 'point_of_interest'].includes(t));
                                    return isStreet && candidateMatchesRoadTokens(r.formatted_address, roadTokens);
                                }) || results.find(r => {
                                    const types = Array.isArray(r.types) ? r.types : [];
                                    return types.some(t => ['route', 'street_address', 'premise', 'subpremise', 'intersection', 'establishment', 'point_of_interest', 'neighborhood', 'sublocality'].includes(t));
                                }) || (!results[0].types || !results[0].types.includes('locality') ? results[0] : null);
                                if (preciseMatch && preciseMatch.geometry && preciseMatch.geometry.location) {
                                    const loc = preciseMatch.geometry.location;
                                    resolve({ lat: loc.lat(), lng: loc.lng() });
                                    return;
                                }
                            }
                            resolve(null);
                        });
                    });
                    if (gRes && isValidMalaysiaCoord(gRes.lat, gRes.lng)) {
                        writeRoadGeocodeCache(cacheKey, gRes, 'first-road-google');
                        writeRoadGeocodeCache(normRoad, gRes, 'first-road-google');
                        return { lat: Number(gRes.lat.toFixed(6)), lng: Number(gRes.lng.toFixed(6)), source: 'first-road-google', primaryRoad };
                    }
                }
            } catch (_) {}
        }

        // 3. PRIORITY 2 — OpenStreetMap Nominatim live street geometry (verified against distinctive street name tokens)
        const baseRoadWithoutSectionCode = primaryRoad.replace(/\s+(?:[a-z]{0,2}\d+[a-z]?)\/\d+[a-z]?$/i, '').trim();
        const osmQueries = Array.from(new Set([
            [primaryRoad, city, 'Selangor', 'Malaysia'].filter(Boolean).join(', '),
            [primaryRoad, 'Selangor', 'Malaysia'].filter(Boolean).join(', '),
            (baseRoadWithoutSectionCode && baseRoadWithoutSectionCode.toLowerCase() !== normRoad)
                ? [baseRoadWithoutSectionCode, city, 'Selangor', 'Malaysia'].filter(Boolean).join(', ')
                : ''
        ].filter(Boolean)));
        for (const q of osmQueries) {
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=my&q=${encodeURIComponent(q)}`;
                const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
                if (!res.ok) continue;
                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) continue;
                const cityLower = city.toLowerCase();
                const picked = data.find(item => {
                    if (!item || !isValidMalaysiaCoord(item.lat, item.lon)) return false;
                    if (item.type === 'city' || item.type === 'administrative' || item.class === 'boundary') return false;
                    const addrRoad = (item.address && (item.address.road || item.address.industrial || item.address.neighbourhood)) || '';
                    const text = `${item.display_name || ''} ${addrRoad}`;
                    const roadMatch = candidateMatchesRoadTokens(text, roadTokens);
                    const cityMatch = !cityLower || text.toLowerCase().includes(cityLower);
                    return roadMatch && cityMatch;
                }) || data.find(item => {
                    if (!item || !isValidMalaysiaCoord(item.lat, item.lon)) return false;
                    if (item.type === 'city' || item.type === 'administrative' || item.class === 'boundary') return false;
                    const addrRoad = (item.address && item.address.road) || '';
                    return candidateMatchesRoadTokens(`${item.display_name || ''} ${addrRoad}`, roadTokens);
                });
                if (picked) {
                    const coords = {
                        lat: Number(parseFloat(picked.lat).toFixed(6)),
                        lng: Number(parseFloat(picked.lon).toFixed(6))
                    };
                    writeRoadGeocodeCache(cacheKey, coords, 'first-road-osm');
                    writeRoadGeocodeCache(normRoad, coords, 'first-road-osm');
                    return { lat: coords.lat, lng: coords.lng, source: 'first-road-osm', primaryRoad };
                }
            } catch (_) {}
        }

        // 4. PRIORITY 3 — ArcGIS World Geocoding Service (verified against distinctive street name tokens)
        const arcQueries = Array.from(new Set([
            parkName ? [primaryRoad, parkName, city, 'Selangor', 'Malaysia'].filter(Boolean).join(', ') : '',
            [primaryRoad, city, 'Selangor', 'Malaysia'].filter(Boolean).join(', '),
            [primaryRoad, 'Selangor', 'Malaysia'].filter(Boolean).join(', ')
        ].filter(Boolean)));
        for (const q of arcQueries) {
            try {
                const arcUrl = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(q)}&countryCode=MYS&maxLocations=5&outFields=Match_addr,Addr_type,Score&f=json`;
                const res = await fetch(arcUrl, { headers: { 'Accept': 'application/json' } });
                if (!res.ok) continue;
                const data = await res.json();
                const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
                const validCand = candidates.find(c => {
                    if (!c || !c.location || !isValidMalaysiaCoord(c.location.y, c.location.x)) return false;
                    const t = String((c.attributes && c.attributes.Addr_type) || '');
                    const matchAddr = String((c.attributes && c.attributes.Match_addr) || c.address || '');
                    const score = Number(c.score || (c.attributes && c.attributes.Score) || 0);
                    const isStreet = ['StreetName', 'StreetAddress', 'PointAddress', 'StreetInt', 'Subaddress', 'DistanceMarker', 'POI', 'PostalExt'].includes(t);
                    return isStreet && score >= 78 && candidateMatchesRoadTokens(matchAddr, roadTokens);
                });
                if (validCand) {
                    const coords = {
                        lat: Number(Number(validCand.location.y).toFixed(6)),
                        lng: Number(Number(validCand.location.x).toFixed(6))
                    };
                    writeRoadGeocodeCache(cacheKey, coords, 'first-road-arcgis');
                    writeRoadGeocodeCache(normRoad, coords, 'first-road-arcgis');
                    return { lat: coords.lat, lng: coords.lng, source: 'first-road-arcgis', primaryRoad };
                }
            } catch (_) {}
        }

        // 5. LAST RESORT OFFLINE FALLBACK — Curated built-in ROAD_COORDS (never written to live cache)
        for (const entry of ROAD_COORDS) {
            if (entry.keys.some(k => normRoad.includes(k.toLowerCase()))) {
                return { lat: entry.coords[0], lng: entry.coords[1], source: 'first-road-fallback', primaryRoad };
            }
        }

        return null;
    }

    const FALLBACK_PARKS = {
        'Petaling Jaya': [
            { name: 'PJ 51 Industrial Park', section: 'Seksyen 51' },
            { name: 'PJ 51 Business Centre', section: 'Seksyen 51' },
            { name: 'Tiong Nam Industrial Park PJ', section: 'Seksyen 51' },
            { name: 'PJS 5', section: 'PJS 5' }
        ],
        'Shah Alam': [
            { name: 'Hicom-Glenmarie Industrial Park', section: 'Glenmarie' },
            { name: 'Ace Industrial Park', section: 'Seksyen 15' },
            { name: 'Tiong Nam Industrial Park Shah Alam', section: 'Seksyen 15' },
            { name: 'Batu Tiga Light Industrial Park', section: 'Batu Tiga' },
            { name: 'Temasya Industrial Park', section: 'Glenmarie' },
            { name: 'i-Parc 1', section: 'Seksyen 26' },
            { name: 'i-Parc 2', section: 'Seksyen 26' },
            { name: 'Sekitar 26', section: 'Seksyen 26' },
            { name: 'Hicom 27', section: 'Seksyen 27' }
        ],
        'Subang Jaya': [
            { name: 'SIME UEP Industrial Park', section: 'SIME UEP' },
            { name: 'Subang Hi-Tech Industrial Park', section: 'Subang Hi-Tech' },
            { name: 'PJS 11 (Bandar Sunway)', section: 'Bandar Sunway' },
            { name: 'PJS 7 (Bandar Sunway)', section: 'Bandar Sunway' }
        ],
        'Klang': [
            { name: 'Bandar Bukit Raja Industrial Park', section: 'Bandar Bukit Raja' }
        ]
    };

    function esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function detectUserOS() {
        try {
            const p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
            return /mac|iphone|ipad|ipod/i.test(p) ? 'mac' : 'windows';
        } catch (_) {
            return 'windows';
        }
    }

    function isValidMalaysiaCoord(lat, lng) {
        const a = Number(lat);
        const b = Number(lng);
        return Number.isFinite(a) && Number.isFinite(b) && a >= 1.0 && a <= 7.5 && b >= 99.5 && b <= 119.5;
    }

    function parseCoordsFromUrl(url) {
        if (!url || typeof url !== 'string') return null;
        const s = url.trim();
        if (!s) return null;

        // Prioritize exact Google Maps pin coordinates (!3d...!4d...) over viewport camera center (@lat,lng),
        // and also accept raw "lat, lng" copied directly from Google Maps right-click.
        const patterns = [
            /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
            /[?&](?:q|ll|query|destination)=(-?\d+\.\d+)(?:,|%2C|\s+)(-?\d+\.\d+)/i,
            /@(-?\d+\.\d+),(-?\d+\.\d+)/,
            /^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/
        ];
        for (const re of patterns) {
            const m = s.match(re);
            if (m) {
                const lat = parseFloat(m[1]);
                const lng = parseFloat(m[2]);
                if (isValidMalaysiaCoord(lat, lng)) {
                    return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
                }
            }
        }
        return null;
    }

    function getUnitsCount(prop) {
        if (!prop || prop.status === 'Pending' || prop.status === 'Inactive') return 0;
        if (prop.availableUnits !== undefined && prop.availableUnits !== null && String(prop.availableUnits).trim() !== '') {
            const parsed = parseInt(String(prop.availableUnits).replace(/[^0-9]/g, ''), 10);
            if (!isNaN(parsed)) return parsed;
        }
        return 1;
    }

    function normalizeParkKey(name, city) {
        return `${String(city || '').trim().toLowerCase()}::${String(name || '').trim().toLowerCase()}`;
    }

    function inferSectionForPark(parkName) {
        const norm = String(parkName || '').trim().toLowerCase();
        if (!norm) return '';
        if (norm.includes('pj 51') || norm.includes('pj51') || norm.includes('tiong nam industrial park pj')) return 'Seksyen 51';
        if (norm.includes('pjs 5')) return 'PJS 5';
        if (norm.includes('glenmarie') || norm.includes('temasya')) return 'Glenmarie';
        if (norm.includes('ace industrial') || norm.includes('tiong nam')) return 'Seksyen 15';
        if (norm.includes('sekitar 26') || norm.includes('i-parc 1') || norm.includes('i-parc 2')) return 'Seksyen 26';
        if (norm.includes('hicom 27')) return 'Seksyen 27';
        if (norm.includes('batu tiga')) return 'Batu Tiga';
        if (norm.includes('sime uep')) return 'SIME UEP';
        if (norm.includes('subang hi-tech')) return 'Subang Hi-Tech';
        if (norm.includes('sunway') || norm.includes('pjs 11') || norm.includes('pjs 7')) return 'Bandar Sunway';
        if (norm.includes('bukit raja')) return 'Bandar Bukit Raja';
        if (norm.includes('tiara square') || norm.includes('tiara business')) return 'USJ / Subang Jaya';
        if (norm.includes('usj')) return 'USJ';
        return '';
    }

    function findParkObject(city, parkName, parksObj) {
        if (!parkName || !parksObj || typeof parksObj !== 'object') return null;
        const normPark = String(parkName).trim().toLowerCase();
        const cityList = (city && Array.isArray(parksObj[city])) ? parksObj[city] : [];
        const matchInCity = cityList.find(p => p && typeof p === 'object' && String(p.name || '').trim().toLowerCase() === normPark);
        if (matchInCity) return matchInCity;

        for (const cKey of Object.keys(parksObj)) {
            if (!Array.isArray(parksObj[cKey])) continue;
            const match = parksObj[cKey].find(p => p && typeof p === 'object' && String(p.name || '').trim().toLowerCase() === normPark);
            if (match) return match;
        }
        return null;
    }

    function resolveParkCoordinates(city, parkName, sectionName, parksObj) {
        const parkObj = findParkObject(city, parkName, parksObj);
        if (parkObj && isValidMalaysiaCoord(parkObj.lat, parkObj.lng)) {
            return { lat: Number(parkObj.lat), lng: Number(parkObj.lng), source: 'park-pin' };
        }

        const parkNorm = String(parkName || '').toLowerCase();
        const parkNormClean = parkNorm.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
        const cityNorm = String(city || '').trim().toLowerCase();
        if (parkNorm) {
            for (const entry of PARK_COORDS) {
                if (entry.city && cityNorm && entry.city.toLowerCase() !== cityNorm && !parkNorm.includes(entry.city.toLowerCase())) {
                    continue;
                }
                if (entry.keys.some(k => parkNorm.includes(k) || parkNormClean.includes(k.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()))) {
                    return { lat: entry.coords[0], lng: entry.coords[1], source: 'park-lookup' };
                }
            }
        }

        const secNorm = String(sectionName || (parkObj && parkObj.section) || '').trim().toLowerCase();
        if (secNorm) {
            for (const [k, coords] of Object.entries(SECTION_COORDS)) {
                if (secNorm === k || secNorm.includes(k)) {
                    return { lat: coords[0], lng: coords[1], source: 'section-lookup' };
                }
            }
        }

        if (cityNorm && CITY_COORDS[cityNorm]) {
            return { lat: CITY_COORDS[cityNorm][0], lng: CITY_COORDS[cityNorm][1], source: 'city-lookup' };
        }

        return { lat: KLANG_VALLEY_CENTER[0], lng: KLANG_VALLEY_CENTER[1], source: 'region-default' };
    }

    function resolvePropertyCoordinates(prop, parksObj) {
        if (!prop) return { lat: KLANG_VALLEY_CENTER[0], lng: KLANG_VALLEY_CENTER[1], source: 'region-default', primaryRoad: '' };

        const primaryRoad = extractPrimaryRoad(prop.road || (prop.specs && prop.specs.road) || '');

        const directLat = prop.lat !== undefined && prop.lat !== null && prop.lat !== '' ? prop.lat : (prop.specs && prop.specs.lat);
        const directLng = prop.lng !== undefined && prop.lng !== null && prop.lng !== '' ? prop.lng : (prop.specs && prop.specs.lng);
        if (isValidMalaysiaCoord(directLat, directLng)) {
            return { lat: Number(directLat), lng: Number(directLng), source: 'property-pin', primaryRoad };
        }

        const urlCandidates = [prop.googleMapUrl, prop.mapUrl, prop.googleEarthUrl];
        for (const u of urlCandidates) {
            const parsed = parseCoordsFromUrl(u);
            if (parsed) {
                return { lat: parsed.lat, lng: parsed.lng, source: 'map-url', primaryRoad };
            }
        }

        // Capture & resolve the FIRST road from Road / Street Address for the map pin
        if (primaryRoad) {
            const roadRes = resolvePrimaryRoadCoordinates(primaryRoad, prop.location, prop.park);
            if (roadRes) {
                return roadRes;
            }
        }

        const combinedText = `${prop.park || ''} ${prop.title || ''} ${primaryRoad || prop.road || ''}`.toLowerCase();
        const parkRes = resolveParkCoordinates(prop.location, prop.park || combinedText, prop.section, parksObj);
        if (parkRes.source !== 'city-lookup' && parkRes.source !== 'region-default') {
            return Object.assign({}, parkRes, { primaryRoad });
        }

        for (const entry of PARK_COORDS) {
            if (entry.keys.some(k => combinedText.includes(k))) {
                return { lat: entry.coords[0], lng: entry.coords[1], source: 'title-lookup', primaryRoad };
            }
        }

        return Object.assign({}, parkRes, { primaryRoad });
    }

    function findSpecialistForPark(park, agentsList) {
        if (!park || !Array.isArray(agentsList) || agentsList.length === 0) return null;
        if (park.agentId) {
            const byId = agentsList.find(a => a && String(a.id) === String(park.agentId));
            if (byId) return byId;
        }
        const normName = String(park.name || '').trim().toLowerCase();
        if (park.agentName) {
            const byAgentName = agentsList.find(a => a && String(a.name || '').trim().toLowerCase() === String(park.agentName).trim().toLowerCase());
            if (byAgentName) return byAgentName;
        }
        if (!normName) return null;
        return agentsList.find(a => {
            if (!a) return false;
            const list = Array.isArray(a.parks) && a.parks.length > 0 ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
            return list.some(item => {
                const label = typeof item === 'string' ? item : (item && item.name ? item.name : '');
                const normItem = String(label || '').trim().toLowerCase();
                return normItem && (normItem === normName || normName.includes(normItem) || normItem.includes(normName));
            });
        }) || null;
    }

    function getStoredAgentsFallback() {
        try {
            if (Array.isArray(global.__liveAgents) && global.__liveAgents.length > 0) {
                return global.__liveAgents;
            }
            const raw = global.localStorage && global.localStorage.getItem('industria_agents');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (_) {}
        return [];
    }

    function collectCoveredParks(opts) {
        const sourceParks = (opts && opts.parksObj && typeof opts.parksObj === 'object' && Object.keys(opts.parksObj).length > 0)
            ? opts.parksObj
            : FALLBACK_PARKS;
        const propsList = (opts && Array.isArray(opts.propsList)) ? opts.propsList : [];
        const agentsList = (opts && Array.isArray(opts.agentsList) && opts.agentsList.length > 0)
            ? opts.agentsList
            : getStoredAgentsFallback();

        const parkMap = new Map();
        const hiddenKeys = new Set();

        Object.keys(sourceParks).forEach(city => {
            const list = sourceParks[city];
            if (!Array.isArray(list)) return;
            list.forEach(entry => {
                const rawName = typeof entry === 'string' ? entry : (entry && entry.name ? entry.name : '');
                const name = String(rawName || '').trim();
                if (!name) return;
                const key = normalizeParkKey(name, city);
                const isHidden = !!(entry && typeof entry === 'object' && entry.hidden);
                if (isHidden) {
                    hiddenKeys.add(key);
                    return;
                }
                if (parkMap.has(key)) return;
                const section = (entry && typeof entry === 'object' && entry.section) ? String(entry.section).trim() : inferSectionForPark(name);
                const resolved = resolveParkCoordinates(city, name, section, sourceParks);
                const specialist = findSpecialistForPark({ name, city, agentId: entry && entry.agentId, agentName: entry && entry.agentName }, agentsList);
                parkMap.set(key, {
                    id: (entry && typeof entry === 'object' && entry.id) ? String(entry.id) : key,
                    parkKey: key,
                    name,
                    city: city || 'Selangor',
                    section,
                    lat: resolved.lat,
                    lng: resolved.lng,
                    specialist
                });
            });
        });

        // Include any non-hidden parks referenced on active listings if not yet listed in parksObj
        propsList.forEach(prop => {
            if (!prop || prop.status === 'Pending' || prop.status === 'Inactive') return;
            const pName = String(prop.park || '').trim();
            if (!pName) return;
            const city = String(prop.location || 'Selangor').trim();
            const key = normalizeParkKey(pName, city);
            if (hiddenKeys.has(key) || parkMap.has(key)) return;
            const section = String(prop.section || inferSectionForPark(pName) || '').trim();
            const resolved = resolvePropertyCoordinates(prop, sourceParks);
            const specialist = findSpecialistForPark({ name: pName, city }, agentsList);
            parkMap.set(key, {
                id: 'prop_park_' + key,
                parkKey: key,
                name: pName,
                city,
                section,
                lat: resolved.lat,
                lng: resolved.lng,
                specialist
            });
        });

        const filterCity = String((opts && opts.activeCity) || 'All').trim().toLowerCase();
        const filterSec = String((opts && opts.activeSection) || 'All').trim().toLowerCase();
        const filterPark = String((opts && opts.activePark) || 'All').trim().toLowerCase();
        const kw = String((opts && opts.keyword) || '').trim().toLowerCase();

        return Array.from(parkMap.values()).filter(park => {
            if (filterCity && filterCity !== 'all' && park.city.toLowerCase() !== filterCity) return false;
            if (filterSec && filterSec !== 'all' && park.section.toLowerCase() !== filterSec) return false;
            if (filterPark && filterPark !== 'all' && park.name.toLowerCase() !== filterPark) return false;
            if (kw) {
                const hay = [park.name, park.city, park.section, park.specialist && park.specialist.name].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(kw)) return false;
            }
            return true;
        });
    }

    // --- SHARED COVERED PARK SVG ICONS & POPUP BUILDERS ---
    function buildParkClusterSvg(parkCount, size) {
        const cx = size / 2;
        const cy = size / 2;
        const r = (size / 2) - 3;
        const innerR = Math.max(11, Math.round(size * 0.34));
        const displayNum = parkCount > 999 ? '999+' : String(parkCount);
        const fontSize = displayNum.length >= 3 ? Math.round(size * 0.26) : Math.round(size * 0.32);

        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true" style="display:block; filter: drop-shadow(0 3px 8px rgba(15, 23, 42, 0.26));">
                <circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="#ffffff" />
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${PARK_COLOR}" stroke-width="${Math.round(r * 0.48)}" />
                <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="#ffffff" />
                <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
                    fill="#0f172a" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="${fontSize}">${esc(displayNum)}</text>
            </svg>
        `.trim();
    }

    function buildSingleParkPinSvg(isActive) {
        const fill = isActive ? PARK_DARK : PARK_COLOR;
        const w = isActive ? 40 : 34;
        const h = isActive ? 48 : 42;
        const cx = w / 2;
        const r = isActive ? 15 : 13;
        const cy = r + 3;
        const ring = isActive
            ? `<circle cx="${cx}" cy="${cy}" r="${r + 3.5}" fill="none" stroke="${PARK_COLOR}" stroke-width="2.5" stroke-opacity="0.45"/>`
            : '';

        // Crisp simplified industrial factory roof glyph scaled neatly centered at (cx, cy)
        const s = isActive ? 1.15 : 1;
        const factoryIcon = `
            <g transform="translate(${(cx - 7 * s).toFixed(2)}, ${(cy - 6.5 * s).toFixed(2)}) scale(${s})" fill="#ffffff">
                <path d="M1 12V6l4 2.2V6l4 2.2V5h4v7H1zm8.5-3.5h1.5v1.5H9.5V8.5zm-3.5 0h1.5v1.5H6V8.5z"/>
            </g>
        `;

        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
                ${ring}
                <path d="M ${cx} ${h - 2} L ${cx - 6} ${r * 2 + 1} L ${cx + 6} ${r * 2 + 1} Z" fill="${fill}"/>
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#ffffff" stroke-width="2.5"/>
                ${factoryIcon}
            </svg>
        `.trim();
    }

    function svgToDataUri(svgStr) {
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr);
    }

    function formatWaNumber(raw) {
        const clean = String(raw || '').replace(/[^0-9]/g, '');
        if (!clean) return '';
        return clean.startsWith('0') ? ('6' + clean) : clean;
    }

    function buildParkPopupHtml(park, opts) {
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([park.name, park.section, park.city, 'Selangor'].filter(Boolean).join(', '))}`;
        const primaryActionLabel = (opts && opts.actionLabel) || 'Filter Listings in Park';
        const locLabel = [park.section ? `@ ${park.section}` : '', park.city, 'Selangor'].filter(Boolean).join(' • ');

        let specialistHtml = '';
        if (park.specialist && park.specialist.name) {
            const waClean = formatWaNumber(park.specialist.whatsapp || park.specialist.phone);
            const waMsg = `Hello ${park.specialist.name}, I would like to enquire about industrial properties at ${park.name} (${park.city}).`;
            const waLink = waClean ? `https://wa.me/${waClean}?text=${encodeURIComponent(waMsg)}` : '';
            specialistHtml = `
                <div class="imap-park-specialist-row">
                    <div class="imap-park-spec-info">
                        <i class="fa-solid fa-user-shield"></i>
                        <span><strong>${esc(park.specialist.name)}</strong>${park.specialist.ren ? ` <small>${esc(park.specialist.ren)}</small>` : ''}</span>
                    </div>
                    ${waLink ? `<a href="${esc(waLink)}" target="_blank" rel="noopener noreferrer" class="imap-park-wa-btn" title="WhatsApp Specialist"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
                </div>
            `;
        }

        return `
            <div class="imap-popup-card imap-park-popup">
                <div class="imap-popup-body">
                    <span class="imap-park-badge"><i class="fa-solid fa-industry"></i> COVERED INDUSTRIAL PARK</span>
                    <h4 class="imap-popup-title">${esc(park.name)}</h4>
                    <div class="imap-popup-loc"><i class="fa-solid fa-location-dot"></i> ${esc(locLabel)}</div>
                    ${specialistHtml}
                    <div class="imap-popup-actions">
                        <button type="button" class="imap-popup-btn-primary" data-imap-select-park="${esc(park.name)}" data-imap-park-city="${esc(park.city)}" data-imap-park-key="${esc(park.parkKey || '')}">
                            <i class="fa-solid fa-filter"></i> ${esc(primaryActionLabel)}
                        </button>
                        <a href="${esc(mapUrl)}" target="_blank" rel="noopener noreferrer" class="imap-popup-btn-secondary" title="Open in Google Maps">
                            <i class="fa-solid fa-diamond-turn-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    function buildParkClusterListPopupHtml(items, opts) {
        const normalized = items.map(it => it.parkData || it);
        const firstPark = normalized[0];
        const headerCity = (firstPark && firstPark.city) ? `${firstPark.city} Hub` : 'Selected Area';
        const pillLabel = (opts && opts.clusterRowAction) || 'Filter';

        const rowsHtml = normalized.map(park => {
            const subParts = [
                park.city,
                park.section ? `@ ${park.section}` : '',
                park.specialist && park.specialist.name ? park.specialist.name : ''
            ].filter(Boolean).join(' · ');
            return `
                <button type="button" class="imap-cluster-row" data-imap-select-park="${esc(park.name)}" data-imap-park-city="${esc(park.city)}" data-imap-park-key="${esc(park.parkKey || '')}">
                    <span class="imap-cluster-dot is-park"></span>
                    <span class="imap-cluster-row-main">
                        <strong>${esc(park.name)}</strong>
                        <small>${esc(subParts)}</small>
                    </span>
                    <span class="imap-cluster-row-units">${esc(pillLabel)}</span>
                </button>
            `;
        }).join('');

        return `
            <div class="imap-cluster-popup">
                <div class="imap-cluster-popup-head">
                    <div>
                        <div class="imap-cluster-popup-title">Covered Industrial Parks · ${esc(headerCity)}</div>
                        <div class="imap-cluster-popup-sub">${normalized.length} Covered Industrial ${normalized.length === 1 ? 'Park' : 'Parks'}</div>
                    </div>
                </div>
                <div class="imap-cluster-popup-list">${rowsHtml}</div>
            </div>
        `;
    }

    function bindPopupParkHandlers(containerEl, onSelectPark) {
        if (!containerEl || typeof onSelectPark !== 'function') return;
        containerEl.querySelectorAll('[data-imap-select-park]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const name = btn.getAttribute('data-imap-select-park');
                const city = btn.getAttribute('data-imap-park-city') || 'All';
                const parkKey = btn.getAttribute('data-imap-park-key') || '';
                if (name) onSelectPark({ name, city, parkKey });
            });
        });
    }

    // --- GOOGLE MAPS API KEY STORAGE & ASYNC SDK LOADER ---
    let configuredGoogleMapsKey = null;
    let activeAdapterKey = '';
    let loadedGoogleMapsKey = '';
    let gmapsLoadPromise = null;
    let gmapsAuthFailed = false;
    let gmapsLastErrorCode = '';
    const engineSubscribers = new Set();

    // Capture exact Google Maps JS API error codes (e.g. RefererNotAllowedMapError, ApiNotActivatedMapError, BillingNotEnabledMapError)
    (function hookGoogleConsoleError() {
        if (!global.console || typeof global.console.error !== 'function' || global.console.__mfsGmapsHooked) return;
        const origError = global.console.error;
        const wrapped = function () {
            try {
                const firstArg = arguments[0] ? String(arguments[0]) : '';
                const match = firstArg.match(/Google Maps JavaScript API error:\s*([A-Za-z0-9_]+)/i);
                if (match && match[1]) {
                    gmapsLastErrorCode = match[1];
                }
            } catch (_) {}
            return origError.apply(this, arguments);
        };
        wrapped.__mfsGmapsHooked = true;
        global.console.error = wrapped;
    })();

    function readStorageGoogleMapsKey() {
        if (global.MFS_GOOGLE_MAPS_API_KEY && String(global.MFS_GOOGLE_MAPS_API_KEY).trim()) {
            return String(global.MFS_GOOGLE_MAPS_API_KEY).trim();
        }
        try {
            const raw = global.localStorage && global.localStorage.getItem('industria_settings');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.googleMapsApiKey && String(parsed.googleMapsApiKey).trim()) {
                    return String(parsed.googleMapsApiKey).trim();
                }
            }
        } catch (_) {}
        return '';
    }

    function readConfiguredGoogleMapsKey() {
        if (typeof configuredGoogleMapsKey === 'string' && configuredGoogleMapsKey.length > 0) {
            return configuredGoogleMapsKey;
        }
        const fromStorage = readStorageGoogleMapsKey();
        if (fromStorage) {
            configuredGoogleMapsKey = fromStorage;
            return fromStorage;
        }
        return '';
    }

    function shouldUseGoogle() {
        return !gmapsAuthFailed && !!readConfiguredGoogleMapsKey();
    }

    function emitGmapsStatus(status, extra) {
        try {
            if (typeof global.CustomEvent === 'function') {
                global.dispatchEvent(new global.CustomEvent('mfs:gmaps-status', {
                    detail: Object.assign({
                        status,
                        key: readConfiguredGoogleMapsKey(),
                        authFailed: gmapsAuthFailed,
                        errorCode: gmapsLastErrorCode || ''
                    }, extra || {})
                }));
            }
        } catch (_) {}
    }

    function handleGoogleAuthFailure() {
        gmapsAuthFailed = true;
        gmapsLoadPromise = null;
        emitGmapsStatus('auth-failed', { errorCode: gmapsLastErrorCode || 'AuthFailure' });
        engineSubscribers.forEach(fn => {
            try { fn('auth-failed'); } catch (_) {}
        });
    }

    global.gm_authFailure = function () {
        console.warn('Google Maps API authentication/billing failure detected' + (gmapsLastErrorCode ? ` (${gmapsLastErrorCode})` : '') + '. Falling back cleanly to free Esri map tiles.');
        handleGoogleAuthFailure();
    };

    function loadGoogleMapsSdk(apiKey) {
        if (!apiKey) return Promise.reject(new Error('Missing Google Maps API key'));
        if (gmapsAuthFailed && loadedGoogleMapsKey === apiKey) return Promise.reject(new Error(gmapsLastErrorCode || 'Google Maps auth failed'));
        if (global.google && global.google.maps && typeof global.google.maps.Map === 'function' && loadedGoogleMapsKey === apiKey && !gmapsAuthFailed) {
            return Promise.resolve(global.google.maps);
        }
        if (gmapsLoadPromise && loadedGoogleMapsKey === apiKey) {
            return gmapsLoadPromise;
        }

        if (loadedGoogleMapsKey && loadedGoogleMapsKey !== apiKey && global.google && global.google.maps) {
            try { delete global.google.maps; } catch (_) { global.google.maps = undefined; }
        }

        loadedGoogleMapsKey = apiKey;
        gmapsLoadPromise = new Promise((resolve, reject) => {
            const cbName = '__mfsGoogleMapsReady_' + Date.now();
            const timer = setTimeout(() => {
                delete global[cbName];
                gmapsLoadPromise = null;
                reject(new Error('Google Maps SDK load timeout'));
            }, 9000);

            global[cbName] = function () {
                clearTimeout(timer);
                delete global[cbName];
                if (gmapsAuthFailed) reject(new Error(gmapsLastErrorCode || 'Google Maps auth failed'));
                else resolve(global.google.maps);
            };

            const existing = document.querySelector('script[data-mfs-gmaps-sdk]');
            if (existing) existing.remove();

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly&callback=${cbName}`;
            script.async = true;
            script.defer = true;
            script.setAttribute('data-mfs-gmaps-sdk', '1');
            script.onerror = function () {
                clearTimeout(timer);
                delete global[cbName];
                gmapsLoadPromise = null;
                reject(new Error('Google Maps script failed to load'));
            };
            document.head.appendChild(script);
        });

        return gmapsLoadPromise;
    }

    // --- UNIFIED ENGINE ADAPTER: LEAFLET (WITH ON-DEMAND LAZY LOADER) ---
    let leafletLoadPromise = null;
    function ensureLeafletLoaded() {
        if (global.L && typeof global.L.map === 'function') return Promise.resolve(true);
        if (leafletLoadPromise) return leafletLoadPromise;
        leafletLoadPromise = new Promise((resolve) => {
            if (!document.querySelector('link[href*="leaflet.min.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            }
            const existing = document.querySelector('script[src*="leaflet.min.js"]');
            if (existing) {
                if (global.L && typeof global.L.map === 'function') return resolve(true);
                existing.addEventListener('load', () => resolve(Boolean(global.L && global.L.map)), { once: true });
                existing.addEventListener('error', () => { leafletLoadPromise = null; resolve(false); }, { once: true });
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = () => resolve(Boolean(global.L && global.L.map));
            script.onerror = () => { leafletLoadPromise = null; resolve(false); };
            document.head.appendChild(script);
        });
        return leafletLoadPromise;
    }

    const POPUP_OPTIONS = {
        maxWidth: 310,
        className: 'imap-leaflet-popup',
        autoPanPaddingTopLeft: [20, 68],
        autoPanPaddingBottomRight: [20, 60]
    };

    function addLeafletBaseLayers(map) {
        const street = global.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri &amp; OpenStreetMap',
            maxZoom: 19
        });
        const satellite = global.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri World Imagery',
            maxZoom: 19
        });
        street.addTo(map);
        return { street, satellite };
    }

    function createLeafletClusterIcon(cluster) {
        const count = cluster.getAllChildMarkers().length;
        const size = count >= 25 ? 52 : (count >= 10 ? 46 : 42);
        const html = `<div class="imap-pie-cluster" title="${count} Covered Industrial ${count === 1 ? 'Park' : 'Parks'}">${buildParkClusterSvg(count, size)}</div>`;

        return global.L.divIcon({
            html,
            className: 'imap-cluster-icon-wrap',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    }

    function createLeafletParkIcon(isActive) {
        const w = isActive ? 40 : 34;
        const h = isActive ? 48 : 42;
        const html = `<div class="imap-park-pin-wrap">${buildSingleParkPinSvg(isActive)}</div>`;

        return global.L.divIcon({
            html,
            className: 'imap-single-icon-wrap',
            iconSize: [w, h],
            iconAnchor: [w / 2, h - 2],
            popupAnchor: [0, -(h - 4)]
        });
    }

    let scrollHintTimer = null;
    function showScrollHintToast(canvasEl) {
        if (!canvasEl || !canvasEl.parentElement) return;
        let toast = canvasEl.parentElement.querySelector('.imap-scroll-hint-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'imap-scroll-hint-toast';
            canvasEl.parentElement.appendChild(toast);
        }
        const modKey = detectUserOS() === 'mac' ? '⌘' : 'Ctrl';
        toast.textContent = `Use ${modKey} + scroll to zoom the map`;
        toast.classList.add('is-visible');
        clearTimeout(scrollHintTimer);
        scrollHintTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 1450);
    }

    function createLeafletMapAdapter(canvasEl, options) {
        if (!global.L) return null;
        canvasEl.innerHTML = '';
        canvasEl.setAttribute('tabindex', '0');

        const map = global.L.map(canvasEl, {
            center: options.center || KLANG_VALLEY_CENTER,
            zoom: options.zoom || 11,
            zoomControl: true,
            scrollWheelZoom: !options.cooperativeScroll,
            keyboard: true
        });
        const layers = addLeafletBaseLayers(map);
        let suppressMove = false;
        let markerByParkKey = new Map();
        let activeHighlightKey = null;
        let activeSelectCb = null;

        let clusterGroup = null;
        if (options.useClusters && global.L.markerClusterGroup) {
            clusterGroup = global.L.markerClusterGroup({
                maxClusterRadius: 48,
                spiderfyOnMaxZoom: false,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: false,
                iconCreateFunction: createLeafletClusterIcon
            });
            clusterGroup.on('clusterclick', function (a) {
                const cluster = a.layer;
                const childMarkers = cluster.getAllChildMarkers();
                const bounds = cluster.getBounds();
                const latSpan = Math.abs(bounds.getNorth() - bounds.getSouth());
                const lngSpan = Math.abs(bounds.getEast() - bounds.getWest());
                const isCoLocated = latSpan < 0.0012 && lngSpan < 0.0012;

                if (isCoLocated || map.getZoom() >= 15) {
                    const items = childMarkers.map(m => m.options.parkData);
                    const html = buildParkClusterListPopupHtml(items, options);
                    const popup = global.L.popup(Object.assign({}, POPUP_OPTIONS, { maxWidth: 320 }))
                        .setLatLng(cluster.getLatLng())
                        .setContent(html)
                        .openOn(map);
                    setTimeout(() => bindPopupParkHandlers(popup.getElement(), activeSelectCb), 10);
                } else {
                    map.fitBounds(bounds.pad(0.25), { maxZoom: 15, animate: true });
                }
            });
            map.addLayer(clusterGroup);
        }

        let onWheelCapture = null;
        if (options.cooperativeScroll) {
            onWheelCapture = function (e) {
                if (e.metaKey || e.ctrlKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.deltaY < 0) map.zoomIn(1);
                    else if (e.deltaY > 0) map.zoomOut(1);
                } else {
                    showScrollHintToast(canvasEl);
                }
            };
            canvasEl.addEventListener('wheel', onWheelCapture, { passive: false, capture: true });
        }

        return {
            engine: 'leaflet',
            canvasEl,
            setView(lat, lng, zoom) {
                suppressMove = true;
                map.setView([lat, lng], zoom, { animate: true });
                setTimeout(() => { suppressMove = false; }, 380);
            },
            fitBounds(coordsList, maxZoom) {
                if (!coordsList || coordsList.length === 0) {
                    this.setView(KLANG_VALLEY_CENTER[0], KLANG_VALLEY_CENTER[1], 11);
                    return;
                }
                suppressMove = true;
                if (coordsList.length === 1) {
                    map.setView(coordsList[0], Math.min(14, maxZoom || 15), { animate: true });
                } else {
                    map.fitBounds(global.L.latLngBounds(coordsList).pad(0.18), { maxZoom: maxZoom || 15, animate: true });
                }
                setTimeout(() => { suppressMove = false; }, 420);
            },
            getBoundsContains(lat, lng) {
                return map.getBounds().contains([lat, lng]);
            },
            setSatellite(isSat) {
                if (isSat) {
                    map.removeLayer(layers.street);
                    layers.satellite.addTo(map);
                } else {
                    map.removeLayer(layers.satellite);
                    layers.street.addTo(map);
                }
            },
            zoomIn() { map.zoomIn(); },
            zoomOut() { map.zoomOut(); },
            panBy(dx, dy) { map.panBy([dx, dy], { animate: true }); },
            closePopup() { map.closePopup(); },
            invalidateSize() { map.invalidateSize(); },
            onMoveEnd(cb) {
                map.on('moveend zoomend', () => {
                    if (!suppressMove && typeof cb === 'function') cb();
                });
            },
            setCoveredParks(parksList, handlers) {
                if (!clusterGroup) return { coordsList: [] };
                activeSelectCb = handlers && handlers.onSelectPark;
                clusterGroup.clearLayers();
                markerByParkKey = new Map();
                const coordsList = [];

                parksList.forEach(park => {
                    if (!park) return;
                    const marker = global.L.marker([park.lat, park.lng], {
                        icon: createLeafletParkIcon(false),
                        parkData: park,
                        parkKey: park.parkKey
                    });

                    const tipText = [park.name, park.section ? `@ ${park.section}` : '', park.city].filter(Boolean).join(' • ');
                    marker.bindTooltip(esc(tipText), { direction: 'top', offset: [0, -34], className: 'imap-tooltip' });

                    marker.on('click', () => {
                        const html = buildParkPopupHtml(park, options);
                        marker.unbindPopup();
                        marker.bindPopup(html, Object.assign({}, POPUP_OPTIONS, { maxWidth: 305 })).openPopup();
                        setTimeout(() => {
                            const popup = marker.getPopup();
                            if (popup) bindPopupParkHandlers(popup.getElement(), activeSelectCb);
                        }, 10);
                    });

                    clusterGroup.addLayer(marker);
                    markerByParkKey.set(park.parkKey, marker);
                    coordsList.push([park.lat, park.lng]);
                });

                return { coordsList };
            },
            openParkByKey(parkKey, parkObj) {
                const marker = parkKey ? markerByParkKey.get(parkKey) : null;
                const openDirectPopup = () => {
                    const targetData = (marker && marker.options && marker.options.parkData) || parkObj;
                    if (!targetData) return;
                    const latlng = marker ? marker.getLatLng() : [targetData.lat, targetData.lng];
                    const html = buildParkPopupHtml(targetData, options);
                    const popup = global.L.popup(Object.assign({}, POPUP_OPTIONS, { maxWidth: 305 }))
                        .setLatLng(latlng)
                        .setContent(html)
                        .openOn(map);
                    setTimeout(() => {
                        const el = popup && popup.getElement ? popup.getElement() : null;
                        if (el) bindPopupParkHandlers(el, activeSelectCb);
                    }, 15);
                };

                if (marker && clusterGroup) {
                    suppressMove = true;
                    clusterGroup.zoomToShowLayer(marker, () => {
                        suppressMove = false;
                        if (marker._icon) {
                            marker.fire('click');
                        } else {
                            map.setView(marker.getLatLng(), Math.max(map.getZoom(), 15), { animate: true });
                            openDirectPopup();
                        }
                    });
                    setTimeout(() => { suppressMove = false; }, 600);
                } else if (parkObj) {
                    this.setView(parkObj.lat, parkObj.lng, 15);
                    openDirectPopup();
                }
            },
            highlightPark(parkKey) {
                if (activeHighlightKey && markerByParkKey.has(activeHighlightKey)) {
                    markerByParkKey.get(activeHighlightKey).setIcon(createLeafletParkIcon(false));
                }
                activeHighlightKey = parkKey || null;
                if (activeHighlightKey && markerByParkKey.has(activeHighlightKey)) {
                    markerByParkKey.get(activeHighlightKey).setIcon(createLeafletParkIcon(true));
                }
            },
            destroy() {
                if (onWheelCapture) canvasEl.removeEventListener('wheel', onWheelCapture, true);
                try { map.remove(); } catch (_) {}
                canvasEl.innerHTML = '';
            }
        };
    }

    // --- UNIFIED ENGINE ADAPTER: GOOGLE MAPS JS API ---
    function latLngToWorldPx(lat, lng, zoom) {
        const scale = 256 * Math.pow(2, zoom);
        const siny = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
        const x = ((lng + 180) / 360) * scale;
        const y = (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)) * scale;
        return { x, y };
    }

    function createGoogleMapAdapter(canvasEl, options) {
        if (!global.google || !global.google.maps || typeof global.google.maps.Map !== 'function') return null;
        canvasEl.innerHTML = '';
        canvasEl.setAttribute('tabindex', '0');

        const gm = global.google.maps;
        const centerCoords = options.center || KLANG_VALLEY_CENTER;
        const map = new gm.Map(canvasEl, {
            center: { lat: centerCoords[0], lng: centerCoords[1] },
            zoom: options.zoom || 11,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: { position: gm.ControlPosition.LEFT_CENTER },
            keyboardShortcuts: true,
            gestureHandling: options.cooperativeScroll ? 'cooperative' : 'greedy',
            mapTypeId: gm.MapTypeId.ROADMAP
        });

        const infoWindow = new gm.InfoWindow({ maxWidth: 325 });
        let suppressMove = false;
        let activeHighlightKey = null;
        let currentParks = [];
        let renderedMarkers = [];
        let markerByParkKey = new Map();
        let activeHandlers = {};
        let isOpenPopup = false;
        let pendingOpenParkKey = null;

        infoWindow.addListener('closeclick', () => { isOpenPopup = false; });

        function clearRenderedMarkers() {
            renderedMarkers.forEach(m => m.setMap(null));
            renderedMarkers = [];
            markerByParkKey.clear();
        }

        function openHtmlInfoWindow(position, html, selectCb) {
            isOpenPopup = true;
            const availW = Math.max(228, Math.min(268, ((canvasEl && canvasEl.clientWidth) || 320) - 32));
            infoWindow.setOptions({ maxWidth: availW });
            infoWindow.setContent(html);
            infoWindow.setPosition(position);
            infoWindow.open({ map });
            gm.event.addListenerOnce(infoWindow, 'domready', () => {
                const iwc = canvasEl.querySelector('.gm-style-iw-c');
                const iwd = canvasEl.querySelector('.gm-style-iw-d');
                if (iwc) {
                    const targetW = Math.max(228, Math.min(268, ((canvasEl && canvasEl.clientWidth) || 320) - 32));
                    iwc.style.setProperty('max-width', targetW + 'px', 'important');
                    iwc.style.setProperty('width', targetW + 'px', 'important');
                    iwc.style.setProperty('padding', '0px', 'important');
                }
                if (iwd) {
                    iwd.style.setProperty('max-width', '100%', 'important');
                    iwd.style.setProperty('width', '100%', 'important');
                    iwd.style.setProperty('overflow', 'hidden', 'important');
                }
                bindPopupParkHandlers(canvasEl, selectCb);
            });
        }

        function createGoogleSingleParkMarker(park, isHighlighted) {
            const svg = buildSingleParkPinSvg(isHighlighted);
            const w = isHighlighted ? 40 : 34;
            const h = isHighlighted ? 48 : 42;
            const marker = new gm.Marker({
                position: { lat: park.lat, lng: park.lng },
                map,
                title: [park.name, park.section ? `@ ${park.section}` : '', park.city].filter(Boolean).join(' • '),
                icon: {
                    url: svgToDataUri(svg),
                    scaledSize: new gm.Size(w, h),
                    anchor: new gm.Point(w / 2, h - 2)
                },
                zIndex: isHighlighted ? 999 : 200
            });
            marker.addListener('click', () => {
                openHtmlInfoWindow(marker.getPosition(), buildParkPopupHtml(park, options), activeHandlers.onSelectPark);
            });
            markerByParkKey.set(park.parkKey, { marker, park });
            return marker;
        }

        function renderClusteredParks() {
            clearRenderedMarkers();
            if (!options.useClusters || currentParks.length === 0) return;

            const zoom = Math.max(3, Math.min(20, map.getZoom() || 11));
            const RADIUS_PX = 52;
            const buckets = [];

            currentParks.forEach(park => {
                const pt = latLngToWorldPx(park.lat, park.lng, zoom);
                let targetBucket = null;
                for (let i = 0; i < buckets.length; i++) {
                    const b = buckets[i];
                    const dx = pt.x - b.cx;
                    const dy = pt.y - b.cy;
                    if (dx * dx + dy * dy <= RADIUS_PX * RADIUS_PX) {
                        targetBucket = b;
                        break;
                    }
                }
                if (!targetBucket) {
                    buckets.push({ cx: pt.x, cy: pt.y, sumLat: park.lat, sumLng: park.lng, items: [park] });
                } else {
                    targetBucket.items.push(park);
                    targetBucket.sumLat += park.lat;
                    targetBucket.sumLng += park.lng;
                    const n = targetBucket.items.length;
                    targetBucket.cx = (targetBucket.cx * (n - 1) + pt.x) / n;
                    targetBucket.cy = (targetBucket.cy * (n - 1) + pt.y) / n;
                }
            });

            buckets.forEach(b => {
                if (b.items.length === 1) {
                    const park = b.items[0];
                    const isHi = activeHighlightKey && park.parkKey === activeHighlightKey;
                    renderedMarkers.push(createGoogleSingleParkMarker(park, isHi));
                    return;
                }

                const count = b.items.length;
                const size = count >= 25 ? 52 : (count >= 10 ? 46 : 42);
                const svg = buildParkClusterSvg(count, size);
                const centerLat = b.sumLat / count;
                const centerLng = b.sumLng / count;

                const clusterMarker = new gm.Marker({
                    position: { lat: centerLat, lng: centerLng },
                    map,
                    title: `${count} Covered Industrial ${count === 1 ? 'Park' : 'Parks'}`,
                    icon: {
                        url: svgToDataUri(svg),
                        scaledSize: new gm.Size(size, size),
                        anchor: new gm.Point(size / 2, size / 2)
                    },
                    zIndex: 400
                });

                clusterMarker.addListener('click', () => {
                    const bounds = new gm.LatLngBounds();
                    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                    b.items.forEach(pk => {
                        bounds.extend({ lat: pk.lat, lng: pk.lng });
                        if (pk.lat < minLat) minLat = pk.lat;
                        if (pk.lat > maxLat) maxLat = pk.lat;
                        if (pk.lng < minLng) minLng = pk.lng;
                        if (pk.lng > maxLng) maxLng = pk.lng;
                    });
                    const isCoLocated = Math.abs(maxLat - minLat) < 0.0012 && Math.abs(maxLng - minLng) < 0.0012;

                    if (isCoLocated || (map.getZoom() || 11) >= 15) {
                        const html = buildParkClusterListPopupHtml(b.items, options);
                        openHtmlInfoWindow(clusterMarker.getPosition(), html, activeHandlers.onSelectPark);
                    } else {
                        suppressMove = true;
                        map.fitBounds(bounds, { top: 68, right: 32, bottom: 60, left: 32 });
                        gm.event.addListenerOnce(map, 'idle', () => {
                            if ((map.getZoom() || 11) > 15) map.setZoom(15);
                            suppressMove = false;
                        });
                    }
                });

                renderedMarkers.push(clusterMarker);
            });

            if (pendingOpenParkKey) {
                const targetPark = currentParks.find(p => p.parkKey === pendingOpenParkKey);
                pendingOpenParkKey = null;
                if (targetPark) {
                    openHtmlInfoWindow(new gm.LatLng(targetPark.lat, targetPark.lng), buildParkPopupHtml(targetPark, options), activeHandlers.onSelectPark);
                }
            }
        }

        map.addListener('zoom_changed', () => {
            if (!isOpenPopup) renderClusteredParks();
        });

        let moveCb = null;
        map.addListener('idle', () => {
            if (!suppressMove && typeof moveCb === 'function') moveCb();
        });

        return {
            engine: 'google',
            canvasEl,
            setView(lat, lng, zoom) {
                suppressMove = true;
                map.setCenter({ lat, lng });
                map.setZoom(zoom);
                setTimeout(() => { suppressMove = false; }, 350);
            },
            fitBounds(coordsList, maxZoom) {
                if (!coordsList || coordsList.length === 0) {
                    this.setView(KLANG_VALLEY_CENTER[0], KLANG_VALLEY_CENTER[1], 11);
                    return;
                }
                suppressMove = true;
                if (coordsList.length === 1) {
                    map.setCenter({ lat: coordsList[0][0], lng: coordsList[0][1] });
                    map.setZoom(Math.min(14, maxZoom || 15));
                    setTimeout(() => { suppressMove = false; }, 350);
                    return;
                }
                const bounds = new gm.LatLngBounds();
                coordsList.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
                map.fitBounds(bounds, { top: 68, right: 32, bottom: 60, left: 32 });
                gm.event.addListenerOnce(map, 'idle', () => {
                    const cap = maxZoom || 15;
                    if ((map.getZoom() || 11) > cap) map.setZoom(cap);
                    suppressMove = false;
                });
            },
            getBoundsContains(lat, lng) {
                const b = map.getBounds();
                return b ? b.contains(new gm.LatLng(lat, lng)) : true;
            },
            setSatellite(isSat) {
                map.setMapTypeId(isSat ? gm.MapTypeId.HYBRID : gm.MapTypeId.ROADMAP);
            },
            zoomIn() { map.setZoom((map.getZoom() || 11) + 1); },
            zoomOut() { map.setZoom(Math.max(3, (map.getZoom() || 11) - 1)); },
            panBy(dx, dy) { map.panBy(dx, dy); },
            closePopup() { isOpenPopup = false; infoWindow.close(); },
            invalidateSize() { gm.event.trigger(map, 'resize'); },
            onMoveEnd(cb) { moveCb = cb; },
            setCoveredParks(parksList, handlers) {
                activeHandlers = handlers || {};
                currentParks = Array.isArray(parksList) ? parksList.slice() : [];
                const coordsList = currentParks.map(p => [p.lat, p.lng]);
                isOpenPopup = false;
                infoWindow.close();
                renderClusteredParks();
                return { coordsList };
            },
            openParkByKey(parkKey, parkObj) {
                if (!parkObj) return;
                pendingOpenParkKey = parkKey;
                this.setView(parkObj.lat, parkObj.lng, 15);
                if (markerByParkKey.has(parkKey)) {
                    const entry = markerByParkKey.get(parkKey);
                    pendingOpenParkKey = null;
                    openHtmlInfoWindow(entry.marker.getPosition(), buildParkPopupHtml(entry.park, options), activeHandlers.onSelectPark);
                }
            },
            highlightPark(parkKey) {
                if (activeHighlightKey && markerByParkKey.has(activeHighlightKey)) {
                    markerByParkKey.get(activeHighlightKey).marker.setIcon({
                        url: svgToDataUri(buildSingleParkPinSvg(false)),
                        scaledSize: new gm.Size(34, 42),
                        anchor: new gm.Point(17, 40)
                    });
                    markerByParkKey.get(activeHighlightKey).marker.setZIndex(200);
                }
                activeHighlightKey = parkKey || null;
                if (activeHighlightKey && markerByParkKey.has(activeHighlightKey)) {
                    markerByParkKey.get(activeHighlightKey).marker.setIcon({
                        url: svgToDataUri(buildSingleParkPinSvg(true)),
                        scaledSize: new gm.Size(40, 48),
                        anchor: new gm.Point(20, 46)
                    });
                    markerByParkKey.get(activeHighlightKey).marker.setZIndex(999);
                }
            },
            destroy() {
                clearRenderedMarkers();
                infoWindow.close();
                gm.event.clearInstanceListeners(map);
                canvasEl.innerHTML = '';
            }
        };
    }

    function createAdapterWithFallback(canvasEl, options, onReady) {
        const bootLeaflet = () => {
            if (global.L && typeof global.L.map === 'function') {
                const lAdapter = createLeafletMapAdapter(canvasEl, options);
                if (lAdapter) onReady(lAdapter);
                return;
            }
            ensureLeafletLoaded().then((ok) => {
                if (!ok) return;
                const lAdapter = createLeafletMapAdapter(canvasEl, options);
                if (lAdapter) onReady(lAdapter);
            });
        };

        const apiKey = readConfiguredGoogleMapsKey();
        if (apiKey && !gmapsAuthFailed) {
            loadGoogleMapsSdk(apiKey).then(() => {
                if (!gmapsAuthFailed) {
                    const gAdapter = createGoogleMapAdapter(canvasEl, options);
                    if (gAdapter) {
                        activeAdapterKey = apiKey;
                        emitGmapsStatus('active', { engine: 'google' });
                        onReady(gAdapter);
                        return;
                    }
                }
                activeAdapterKey = '';
                bootLeaflet();
            }).catch((err) => {
                console.warn('Google Maps unavailable, using free Esri map fallback:', err && err.message);
                activeAdapterKey = '';
                bootLeaflet();
            });
            return;
        }
        activeAdapterKey = '';
        bootLeaflet();
    }

    // --- KEYBOARD SHORTCUTS MODAL & MAC/WINDOWS KEY HANDLER ---
    const SHORTCUT_ITEMS = {
        mac: [
            { keys: ['↑', '↓', '←', '→'], desc: 'Pan / move around map (when map is focused)' },
            { keys: ['+ / -'], desc: 'Zoom in / Zoom out on map' },
            { keys: ['⌘', 'Scroll'], desc: 'Zoom homepage overview map cleanly without page scroll' },
            { keys: ['S'], desc: 'Toggle Street View / Satellite Imagery' },
            { keys: ['F'], desc: 'Fit All covered industrial parks into view' },
            { keys: ['⇧', 'F'], desc: 'Toggle Fullscreen map (Listings page)' },
            { keys: ['M'], desc: 'Toggle "Search as I move the map" (Listings page)' },
            { keys: ['?'], extraKeys: ['⌘', '/'], desc: 'Open or close this Keyboard Shortcuts guide' },
            { keys: ['Esc'], desc: 'Close active popup, dialog, fullscreen, or mobile drawer' }
        ],
        windows: [
            { keys: ['↑', '↓', '←', '→'], desc: 'Pan / move around map (when map is focused)' },
            { keys: ['+ / -'], desc: 'Zoom in / Zoom out on map' },
            { keys: ['Ctrl', 'Scroll'], desc: 'Zoom homepage overview map cleanly without page scroll' },
            { keys: ['S'], desc: 'Toggle Street View / Satellite Imagery' },
            { keys: ['F'], desc: 'Fit All covered industrial parks into view' },
            { keys: ['Shift', 'F'], desc: 'Toggle Fullscreen map (Listings page)' },
            { keys: ['M'], desc: 'Toggle "Search as I move the map" (Listings page)' },
            { keys: ['?'], extraKeys: ['Ctrl', '/'], desc: 'Open or close this Keyboard Shortcuts guide' },
            { keys: ['Esc'], desc: 'Close active popup, dialog, fullscreen, or mobile drawer' }
        ]
    };

    function renderShortcutRows(osKey) {
        const list = SHORTCUT_ITEMS[osKey] || SHORTCUT_ITEMS.mac;
        return list.map(row => {
            const kbdMain = row.keys.map(k => `<kbd class="imap-kbd-cap">${esc(k)}</kbd>`).join('<span class="imap-kbd-plus">+</span>');
            const kbdExtra = row.extraKeys
                ? ` <span class="imap-kbd-or">or</span> ` + row.extraKeys.map(k => `<kbd class="imap-kbd-cap">${esc(k)}</kbd>`).join('<span class="imap-kbd-plus">+</span>')
                : '';
            return `
                <div class="imap-kbd-row">
                    <div class="imap-kbd-keys">${kbdMain}${kbdExtra}</div>
                    <div class="imap-kbd-desc">${esc(row.desc)}</div>
                </div>
            `;
        }).join('');
    }

    function ensureShortcutsModal() {
        let modal = document.getElementById('imap-shortcuts-modal');
        if (modal) return modal;

        const detectedOS = detectUserOS();
        modal = document.createElement('div');
        modal.id = 'imap-shortcuts-modal';
        modal.className = 'imap-kbd-modal-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'imap-kbd-modal-title');
        modal.innerHTML = `
            <div class="imap-kbd-modal">
                <div class="imap-kbd-modal-head">
                    <div>
                        <h3 id="imap-kbd-modal-title"><i class="fa-regular fa-keyboard"></i> Map Keyboard Shortcuts</h3>
                        <p>Navigate Covered Industrial Parks faster on Mac &amp; Windows</p>
                    </div>
                    <button type="button" class="imap-kbd-close-btn" id="imap-kbd-close-btn" aria-label="Close shortcuts">&times;</button>
                </div>
                <div class="imap-kbd-os-bar" role="tablist" aria-label="Operating system shortcuts">
                    <button type="button" class="imap-kbd-os-tab${detectedOS === 'mac' ? ' active' : ''}" data-kbd-os="mac">
                        <i class="fa-brands fa-apple"></i> Mac (macOS)
                    </button>
                    <button type="button" class="imap-kbd-os-tab${detectedOS === 'windows' ? ' active' : ''}" data-kbd-os="windows">
                        <i class="fa-brands fa-windows"></i> Windows / Linux
                    </button>
                </div>
                <div class="imap-kbd-modal-body" id="imap-kbd-modal-list">${renderShortcutRows(detectedOS)}</div>
                <div class="imap-kbd-modal-foot">
                    <span>Click anywhere on the map to focus arrow panning &bull; Press <kbd class="imap-kbd-cap">Esc</kbd> to close</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeModal = () => modal.classList.remove('active');
        document.getElementById('imap-kbd-close-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        modal.querySelectorAll('.imap-kbd-os-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const osKey = tab.getAttribute('data-kbd-os') || 'mac';
                modal.querySelectorAll('.imap-kbd-os-tab').forEach(t => t.classList.toggle('active', t === tab));
                document.getElementById('imap-kbd-modal-list').innerHTML = renderShortcutRows(osKey);
            });
        });
        return modal;
    }

    function openShortcutsModal(preferredOS) {
        const modal = ensureShortcutsModal();
        if (preferredOS === 'mac' || preferredOS === 'windows') {
            modal.querySelectorAll('.imap-kbd-os-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-kbd-os') === preferredOS));
            document.getElementById('imap-kbd-modal-list').innerHTML = renderShortcutRows(preferredOS);
        }
        modal.classList.add('active');
    }

    function toggleShortcutsModal() {
        const modal = ensureShortcutsModal();
        if (modal.classList.contains('active')) modal.classList.remove('active');
        else openShortcutsModal();
    }

    let kbdGlobalBound = false;
    function bindGlobalMapKeyboardShortcuts() {
        if (kbdGlobalBound) return;
        kbdGlobalBound = true;

        document.addEventListener('click', (e) => {
            const btn = e.target && e.target.closest ? e.target.closest('[data-imap-open-shortcuts]') : null;
            if (btn) {
                e.preventDefault();
                openShortcutsModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            const target = e.target;
            const tag = target && target.tagName ? target.tagName.toUpperCase() : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (target && target.isContentEditable)) {
                return;
            }

            const shortcutsModal = document.getElementById('imap-shortcuts-modal');
            const isShortcutsOpen = shortcutsModal && shortcutsModal.classList.contains('active');

            if (e.key === 'Escape') {
                if (isShortcutsOpen) {
                    shortcutsModal.classList.remove('active');
                    e.preventDefault();
                    return;
                }
                const pickerModal = document.getElementById('coord-picker-modal');
                if (pickerModal && pickerModal.classList.contains('active')) {
                    pickerModal.classList.remove('active');
                    pickerModal.style.display = 'none';
                    e.preventDefault();
                    return;
                }
                if (splitController && splitController.handleEscape()) { e.preventDefault(); return; }
                if (homeController && homeController.handleEscape()) { e.preventDefault(); return; }
                return;
            }

            if ((e.key === '?' || (e.key === '/' && e.shiftKey)) || ((e.metaKey || e.ctrlKey) && e.key === '/')) {
                if (splitController || homeController) {
                    e.preventDefault();
                    toggleShortcutsModal();
                    return;
                }
            }

            if (isShortcutsOpen) return;

            const activeCtrl = splitController || homeController;
            if (!activeCtrl || typeof activeCtrl.handleKey !== 'function') return;
            activeCtrl.handleKey(e);
        });
    }

    // --- 1. PROPERTIES PAGE SPLIT-VIEW COVERED PARKS MAP CONTROLLER ---
    let splitController = null;

    function initSplitMapController(config) {
        if (splitController) return splitController;

        const splitContainer = document.getElementById('listings-split-container');
        const mapPane = document.getElementById('listings-map-pane');
        const canvasEl = document.getElementById('properties-map-canvas');
        const moveToggle = document.getElementById('map-move-search-toggle');
        const fitBtn = document.getElementById('map-fit-all-btn');
        const layerToggleBtn = document.getElementById('map-layer-toggle-btn');
        const fullscreenBtn = document.getElementById('map-fullscreen-btn');
        const viewGridBtn = document.getElementById('view-mode-grid-btn');
        const viewSplitBtn = document.getElementById('view-mode-split-btn');
        const mobileMapBtn = document.getElementById('mobile-map-toggle-btn');
        const mobileCloseBtn = document.getElementById('mobile-map-close-btn');
        const mobileApplyBtn = document.getElementById('mobile-map-apply-btn');
        const statsUnitsEl = document.getElementById('map-pane-units-summary');

        if (!splitContainer || !mapPane || !canvasEl) return null;

        bindGlobalMapKeyboardShortcuts();

        let adapter = null;
        let isSatellite = false;
        let isFullscreen = false;
        let lastCoordsList = [];
        let lastUpdateArgs = null;
        let moveDebounce = null;
        let activeHighlightKey = null;

        const onSelectPark = (parkInfo) => {
            if (window.innerWidth < 1024 && mapPane.classList.contains('is-mobile-open')) {
                toggleMobileMap(false);
            }
            if (config && typeof config.onSelectPark === 'function') {
                config.onSelectPark(parkInfo);
            }
        };

        function fitMapToCoords(coords) {
            if (!adapter) return;
            adapter.fitBounds(coords, 15);
        }

        function applyParksToAdapter(coveredParks, updateOpts) {
            if (!adapter) return;
            if (!(updateOpts && updateOpts.markersUnchanged)) {
                const res = adapter.setCoveredParks(coveredParks, { onSelectPark });
                lastCoordsList = res.coordsList;
                if (activeHighlightKey) adapter.highlightPark(activeHighlightKey);
            }

            if (!(updateOpts && updateOpts.skipFitBounds) && (!moveToggle || !moveToggle.checked)) {
                setTimeout(() => {
                    if (!adapter) return;
                    adapter.invalidateSize();
                    fitMapToCoords(lastCoordsList);
                }, 80);
            }
        }

        function bootAdapter() {
            if (adapter) {
                try { adapter.destroy(); } catch (_) {}
                adapter = null;
            }
            mapPane.dataset.imapEngine = shouldUseGoogle() ? 'google' : 'leaflet';
            createAdapterWithFallback(canvasEl, {
                center: KLANG_VALLEY_CENTER,
                zoom: 11,
                useClusters: true,
                cooperativeScroll: false,
                actionLabel: 'Filter Listings in Park',
                clusterRowAction: 'Filter'
            }, (created) => {
                adapter = created;
                mapPane.dataset.imapEngine = created.engine;
                adapter.setSatellite(isSatellite);
                adapter.onMoveEnd(() => {
                    if (moveToggle && moveToggle.checked && config && typeof config.onBoundsChange === 'function') {
                        clearTimeout(moveDebounce);
                        moveDebounce = setTimeout(() => config.onBoundsChange(), 160);
                    }
                });
                if (lastUpdateArgs) {
                    applyParksToAdapter(lastUpdateArgs.coveredParks, Object.assign({}, lastUpdateArgs.updateOpts, { markersUnchanged: false }));
                }
            });
        }

        engineSubscribers.add(() => { bootAdapter(); });
        bootAdapter();

        function setDesktopViewMode(mode) {
            const openMap = mode === 'split';
            splitContainer.classList.toggle('is-map-open', openMap);
            const browseContainer = splitContainer.closest('.container');
            if (browseContainer) browseContainer.classList.toggle('is-split-wide', openMap);
            if (viewGridBtn) {
                viewGridBtn.classList.toggle('active', !openMap);
                viewGridBtn.setAttribute('aria-pressed', !openMap ? 'true' : 'false');
            }
            if (viewSplitBtn) {
                viewSplitBtn.classList.toggle('active', openMap);
                viewSplitBtn.setAttribute('aria-pressed', openMap ? 'true' : 'false');
            }
            try { localStorage.setItem('mfs_listings_view_mode', openMap ? 'split' : 'grid'); } catch (_) {}
            if (openMap && adapter) {
                setTimeout(() => {
                    if (!adapter) return;
                    adapter.invalidateSize();
                    if (lastCoordsList.length > 0 && (!moveToggle || !moveToggle.checked)) {
                        fitMapToCoords(lastCoordsList);
                    }
                }, 180);
            }
        }

        function toggleMobileMap(forceOpen) {
            const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !mapPane.classList.contains('is-mobile-open');
            mapPane.classList.toggle('is-mobile-open', shouldOpen);
            document.body.classList.toggle('imap-mobile-locked', shouldOpen);
            if (shouldOpen && adapter) {
                setTimeout(() => {
                    if (!adapter) return;
                    adapter.invalidateSize();
                    if (lastCoordsList.length > 0 && (!moveToggle || !moveToggle.checked)) {
                        fitMapToCoords(lastCoordsList);
                    }
                }, 150);
            }
        }

        function toggleSatelliteLayer() {
            isSatellite = !isSatellite;
            if (adapter) adapter.setSatellite(isSatellite);
            if (layerToggleBtn) {
                layerToggleBtn.innerHTML = isSatellite
                    ? '<i class="fa-solid fa-map"></i> <span>Street</span>'
                    : '<i class="fa-solid fa-satellite"></i> <span>Satellite</span>';
            }
        }

        function toggleFullscreen(forceState) {
            isFullscreen = typeof forceState === 'boolean' ? forceState : !isFullscreen;
            mapPane.classList.toggle('is-fullscreen', isFullscreen);
            document.body.classList.toggle('imap-mobile-locked', isFullscreen);
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = isFullscreen
                    ? '<i class="fa-solid fa-compress"></i>'
                    : '<i class="fa-solid fa-expand"></i>';
            }
            if (adapter) setTimeout(() => adapter && adapter.invalidateSize(), 150);
        }

        function fitAllParks() {
            if (moveToggle && moveToggle.checked) {
                moveToggle.checked = false;
                if (config && typeof config.onBoundsChange === 'function') config.onBoundsChange();
            }
            fitMapToCoords(lastCoordsList);
        }

        if (viewGridBtn) viewGridBtn.addEventListener('click', () => setDesktopViewMode('grid'));
        if (viewSplitBtn) viewSplitBtn.addEventListener('click', () => setDesktopViewMode('split'));
        if (mobileMapBtn) mobileMapBtn.addEventListener('click', () => toggleMobileMap(true));
        if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => toggleMobileMap(false));
        if (mobileApplyBtn) mobileApplyBtn.addEventListener('click', () => toggleMobileMap(false));
        if (fitBtn) fitBtn.addEventListener('click', fitAllParks);
        if (layerToggleBtn) layerToggleBtn.addEventListener('click', toggleSatelliteLayer);
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => toggleFullscreen());

        if (moveToggle) {
            moveToggle.addEventListener('change', () => {
                if (config && typeof config.onBoundsChange === 'function') {
                    config.onBoundsChange();
                }
            });
        }

        try {
            const saved = localStorage.getItem('mfs_listings_view_mode');
            if (saved === 'grid' && window.innerWidth >= 1024) setDesktopViewMode('grid');
            else if (window.innerWidth >= 1024) setDesktopViewMode('split');
        } catch (_) {}

        splitController = {
            isMoveSearchActive() {
                return !!(moveToggle && moveToggle.checked);
            },
            clearMoveSearch() {
                if (moveToggle) moveToggle.checked = false;
            },
            filterByCurrentBounds(propsList, parksObj) {
                if (!moveToggle || !moveToggle.checked || !adapter) return propsList;
                return propsList.filter(p => {
                    const c = resolvePropertyCoordinates(p, parksObj);
                    return adapter.getBoundsContains(c.lat, c.lng);
                });
            },
            updateMarkers(propsList, parksObj, updateOpts) {
                const opts = updateOpts || {};
                const coveredParks = collectCoveredParks({
                    parksObj,
                    propsList: opts.allProps || propsList,
                    agentsList: opts.agents,
                    activeCity: opts.activeCity || 'All',
                    activeSection: opts.activeSection || 'All',
                    activePark: opts.activePark || 'All'
                });
                lastUpdateArgs = { coveredParks, updateOpts: opts };

                const visibleParksCount = (moveToggle && moveToggle.checked && adapter)
                    ? coveredParks.filter(pk => adapter.getBoundsContains(pk.lat, pk.lng)).length
                    : coveredParks.length;
                const visibleProps = Array.isArray(opts.visibleProps) ? opts.visibleProps : propsList;

                if (statsUnitsEl) {
                    statsUnitsEl.innerHTML = `<strong>${visibleParksCount}</strong> Covered ${visibleParksCount === 1 ? 'Park' : 'Parks'}`;
                }
                if (mobileMapBtn) {
                    mobileMapBtn.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> <span>Parks Map · ${visibleParksCount}</span>`;
                }
                if (mobileApplyBtn) {
                    mobileApplyBtn.textContent = `Show ${visibleProps.length} Matching ${visibleProps.length === 1 ? 'Property' : 'Properties'} (${visibleParksCount} ${visibleParksCount === 1 ? 'Park' : 'Parks'})`;
                }

                applyParksToAdapter(coveredParks, opts);
            },
            highlightPark(parkName, city) {
                const key = parkName ? normalizeParkKey(parkName, city) : null;
                activeHighlightKey = key;
                if (adapter) adapter.highlightPark(key);
            },
            handleEscape() {
                if (isFullscreen) { toggleFullscreen(false); return true; }
                if (mapPane.classList.contains('is-mobile-open')) { toggleMobileMap(false); return true; }
                if (adapter) adapter.closePopup();
                return false;
            },
            handleKey(e) {
                if (!adapter || e.metaKey || e.ctrlKey || e.altKey) return;
                const lower = e.key.toLowerCase();
                const mapVisible = splitContainer.classList.contains('is-map-open') || mapPane.classList.contains('is-mobile-open') || isFullscreen;
                if (!mapVisible) return;

                if (lower === 's') { e.preventDefault(); toggleSatelliteLayer(); }
                else if (lower === 'f' && e.shiftKey) { e.preventDefault(); toggleFullscreen(); }
                else if (lower === 'f' && !e.shiftKey) { e.preventDefault(); fitAllParks(); }
                else if (lower === 'm' && moveToggle) {
                    e.preventDefault();
                    moveToggle.checked = !moveToggle.checked;
                    moveToggle.dispatchEvent(new Event('change'));
                } else if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    adapter.zoomIn();
                } else if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    adapter.zoomOut();
                } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && (canvasEl.contains(document.activeElement) || document.activeElement === canvasEl || isFullscreen || mapPane.classList.contains('is-mobile-open'))) {
                    if (adapter.engine === 'google') return;
                    e.preventDefault();
                    const step = 80;
                    if (e.key === 'ArrowUp') adapter.panBy(0, -step);
                    if (e.key === 'ArrowDown') adapter.panBy(0, step);
                    if (e.key === 'ArrowLeft') adapter.panBy(-step, 0);
                    if (e.key === 'ArrowRight') adapter.panBy(step, 0);
                }
            }
        };

        return splitController;
    }

    // --- 2. HOMEPAGE COVERED INDUSTRIAL PARKS OVERVIEW MAP CONTROLLER ---
    let homeController = null;

    function initHomepageOverviewMap(config) {
        if (homeController) return homeController;

        const canvasEl = document.getElementById('homepage-map-canvas');
        const layoutEl = document.getElementById('home-map-layout');
        const toggleBtn = document.getElementById('home-map-toggle-btn');
        const toggleStripEl = document.getElementById('home-map-toggle-strip');
        const quickChipsEl = document.getElementById('home-map-quick-chips');
        const stageEl = canvasEl ? canvasEl.closest('.home-map-stage') : null;
        const sidebarEl = layoutEl ? layoutEl.querySelector('.home-map-sidebar') : document.querySelector('.home-map-sidebar');
        const sidebarHeadEl = sidebarEl ? sidebarEl.querySelector('.home-map-sidebar-head') : null;
        const defaultSidebarHeadHtml = sidebarHeadEl ? sidebarHeadEl.innerHTML : '';
        const breakdownEl = document.getElementById('homepage-map-breakdown');
        const parksBadge = document.getElementById('home-map-total-parks');
        const citiesBadge = document.getElementById('home-map-cities-count');
        const sectionsBadge = document.getElementById('home-map-sections-count');
        const specialistsBadge = document.getElementById('home-map-specialists-count');
        const cityTabs = document.querySelectorAll('.home-map-city-btn');
        const parkSearchInput = document.getElementById('home-map-park-search');
        const layerBtn = document.getElementById('home-map-layer-btn');

        if (!canvasEl) return null;

        bindGlobalMapKeyboardShortcuts();

        let adapter = null;
        let isSatellite = false;
        let isMapRevealed = !(toggleBtn && layoutEl && layoutEl.hasAttribute('hidden'));
        let pendingFocusParkKey = null;
        let activeFocusedParkKey = null;
        let exploredPark = null;
        let latestCoveredParks = [];
        let selectedCity = 'All';
        let searchKeyword = '';
        let latestProps = [];
        let latestParks = {};
        let latestAgents = [];
        let lastCoordsList = [];

        function getMatchingPropsForPark(parkObj) {
            if (!parkObj || !parkObj.name || !Array.isArray(latestProps)) return [];
            const parkCityNorm = String(parkObj.city || '').trim().toLowerCase();
            const hasSpecificParkCity = !!parkCityNorm && parkCityNorm !== 'all' && parkCityNorm !== 'selangor';
            const rawParkNorm = String(parkObj.name || '').trim().toLowerCase();

            const matched = latestProps.filter(prop => {
                if (!prop || prop.status === 'Pending' || prop.status === 'Inactive') return false;
                const propCityNorm = String(prop.location || '').trim().toLowerCase();
                if (hasSpecificParkCity && propCityNorm && propCityNorm !== 'selangor' && propCityNorm !== parkCityNorm) {
                    return false;
                }
                const propPark = String(prop.park || '').trim();
                if (!propPark) return false;
                if (propPark.toLowerCase() === rawParkNorm) return true;
                if (typeof global.parksMatchNormalized === 'function') {
                    return global.parksMatchNormalized(propPark, parkObj.name);
                }
                return false;
            });

            if (typeof global.sortPropertiesWithFeaturedPriority === 'function') {
                return global.sortPropertiesWithFeaturedPriority(matched, 'date-desc');
            }
            return matched;
        }

        function setListingViewClasses(active) {
            if (layoutEl) layoutEl.classList.toggle('is-listing-view', active);
            if (sidebarEl) sidebarEl.classList.toggle('is-listing-view', active);
            if (breakdownEl) breakdownEl.classList.toggle('is-listing-view', active);
        }

        function exitExploreListingsView(shouldRefitMap) {
            exploredPark = null;
            setListingViewClasses(false);
            if (sidebarHeadEl && defaultSidebarHeadHtml) {
                sidebarHeadEl.innerHTML = defaultSidebarHeadHtml;
            }
            if (shouldRefitMap && adapter) {
                adapter.closePopup();
                if (typeof adapter.highlightPark === 'function') adapter.highlightPark(null);
                if (lastCoordsList.length > 0) adapter.fitBounds(lastCoordsList, 14);
                else adapter.setView(KLANG_VALLEY_CENTER[0], KLANG_VALLEY_CENTER[1], 11);
            }
        }

        function renderExploreListingsPanel(parkObj) {
            if (!parkObj || !breakdownEl) return;
            const matchingProps = getMatchingPropsForPark(parkObj);
            setListingViewClasses(true);

            if (sidebarHeadEl) {
                const subText = [parkObj.city, parkObj.section ? `@ ${parkObj.section}` : ''].filter(Boolean).join(' · ');
                const countLabel = matchingProps.length > 0
                    ? `${matchingProps.length} ${matchingProps.length === 1 ? 'Listing' : 'Listings'}`
                    : 'Covered Park';
                sidebarHeadEl.innerHTML = `
                    <button type="button" class="home-map-back-btn" id="home-map-back-to-parks-btn" aria-label="Back to Covered Industrial Parks list">
                        <i class="fa-solid fa-arrow-left"></i> <span>Parks</span>
                    </button>
                    <div class="home-map-sidebar-head-meta">
                        <h4 title="${esc(parkObj.name)}">${esc(parkObj.name)}</h4>
                        ${subText ? `<small>${esc(subText)}</small>` : ''}
                    </div>
                    <span class="home-map-listing-count-pill">${esc(countLabel)}</span>
                `;
                const backBtn = document.getElementById('home-map-back-to-parks-btn');
                if (backBtn) {
                    backBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        exitExploreListingsView(true);
                        renderHomeMapState();
                    });
                }
            }

            breakdownEl.innerHTML = '';
            breakdownEl.scrollTop = 0;

            if (matchingProps.length > 0 && typeof global.createStandardPropertyCard === 'function') {
                matchingProps.forEach(prop => {
                    const cardEl = global.createStandardPropertyCard(prop, { forceExpanded: true });
                    if (cardEl) breakdownEl.appendChild(cardEl);
                });
                return;
            }

            const spec = parkObj.specialist || findSpecialistForPark(parkObj, latestAgents.length > 0 ? latestAgents : getStoredAgentsFallback());
            const waClean = spec ? formatWaNumber(spec.whatsapp || spec.phone) : '';
            const waMsg = spec
                ? `Hello ${spec.name}, I saw ${parkObj.name} (${parkObj.city || 'Selangor'}) on the map and would like to check available off-market or upcoming industrial units.`
                : `Hello MyFactorySpace, I would like to enquire about industrial units at ${parkObj.name}.`;
            const waLink = waClean
                ? `https://wa.me/${waClean}?text=${encodeURIComponent(waMsg)}`
                : `https://wa.me/60163117162?text=${encodeURIComponent(waMsg)}`;
            const specPhoto = (spec && (spec.photo || spec.image)) ? (spec.photo || spec.image) : 'assets/images/agent_marcus.jpg';
            const specName = (spec && spec.name) ? spec.name : 'Area Specialist';
            const specRen = (spec && spec.ren) ? spec.ren : '';

            breakdownEl.innerHTML = `
                <div class="home-map-specialist-empty-card">
                    <span class="home-map-spec-empty-badge"><i class="fa-solid fa-industry"></i> Covered Industrial Hub</span>
                    <p class="home-map-spec-empty-copy">No public listings are currently open in <strong>${esc(parkObj.name)}</strong>, or units are marketed confidentially off-market.</p>
                    <div class="home-map-spec-empty-agent">
                        <img src="${esc(specPhoto)}" alt="${esc(specName)}">
                        <div class="home-map-spec-empty-agent-info">
                            <strong>${esc(specName)}</strong>
                            <span>${esc(specRen || 'Industrial Area Specialist')}</span>
                        </div>
                    </div>
                    <div class="home-map-spec-empty-actions">
                        <a href="${esc(waLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%; justify-content: center;">
                            <i class="fa-brands fa-whatsapp"></i> Enquire With ${esc(specName)}
                        </a>
                        <button type="button" class="btn btn-outline" id="home-map-empty-back-btn" style="width: 100%; justify-content: center;">
                            <i class="fa-solid fa-arrow-left"></i> Back to Covered Parks
                        </button>
                    </div>
                </div>
            `;
            const emptyBackBtn = document.getElementById('home-map-empty-back-btn');
            if (emptyBackBtn) {
                emptyBackBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    exitExploreListingsView(true);
                    renderHomeMapState();
                });
            }
        }

        const onSelectPark = (parkInfo) => {
            if (config && typeof config.onSelectPark === 'function' && !config.inPlaceListings) {
                config.onSelectPark(parkInfo);
                return;
            }
            if (!parkInfo || !parkInfo.name) return;

            const lookupKey = parkInfo.parkKey || normalizeParkKey(parkInfo.name, parkInfo.city);
            const matchedPark = latestCoveredParks.find(p =>
                p.parkKey === lookupKey ||
                (String(p.name || '').trim().toLowerCase() === String(parkInfo.name || '').trim().toLowerCase() &&
                    (!parkInfo.city || parkInfo.city === 'All' || String(p.city || '').trim().toLowerCase() === String(parkInfo.city || '').trim().toLowerCase()))
            );
            const targetPark = matchedPark || {
                parkKey: lookupKey,
                name: parkInfo.name,
                city: parkInfo.city && parkInfo.city !== 'All' ? parkInfo.city : 'Selangor',
                section: inferSectionForPark(parkInfo.name) || ''
            };

            exploredPark = targetPark;
            activeFocusedParkKey = targetPark.parkKey;
            if (!isMapRevealed) revealHomeMap();

            if (adapter) {
                if (typeof adapter.closePopup === 'function') adapter.closePopup();
                if (typeof adapter.highlightPark === 'function') adapter.highlightPark(targetPark.parkKey);
                if (targetPark.lat && targetPark.lng) adapter.setView(targetPark.lat, targetPark.lng, 15);
            }

            renderExploreListingsPanel(targetPark);

            if (window.innerWidth <= 960 && sidebarEl) {
                setTimeout(() => {
                    try { sidebarEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
                }, 120);
            }
        };

        function toggleSatelliteLayer() {
            isSatellite = !isSatellite;
            if (adapter) adapter.setSatellite(isSatellite);
            if (layerBtn) {
                layerBtn.innerHTML = isSatellite
                    ? '<i class="fa-solid fa-map"></i> <span>Street</span>'
                    : '<i class="fa-solid fa-satellite"></i> <span>Satellite</span>';
            }
        }

        if (layerBtn) {
            layerBtn.addEventListener('click', toggleSatelliteLayer);
        }

        function renderHomeMapState() {
            const coveredParks = collectCoveredParks({
                parksObj: latestParks,
                propsList: latestProps,
                agentsList: latestAgents,
                activeCity: selectedCity,
                keyword: searchKeyword
            });

            if (adapter) {
                const res = adapter.setCoveredParks(coveredParks, { onSelectPark });
                lastCoordsList = res.coordsList;
            }

            const citySet = new Set();
            const sectionSet = new Set();
            const specialistSet = new Set();
            coveredParks.forEach(pk => {
                if (pk.city) citySet.add(pk.city);
                if (pk.section) sectionSet.add(pk.section);
                if (pk.specialist && pk.specialist.name) specialistSet.add(String(pk.specialist.id || pk.specialist.name));
            });

            if (parksBadge) parksBadge.textContent = String(coveredParks.length);
            if (citiesBadge) citiesBadge.textContent = String(citySet.size);
            if (sectionsBadge) sectionsBadge.textContent = String(sectionSet.size);
            if (specialistsBadge) specialistsBadge.textContent = String(specialistSet.size || Math.min(coveredParks.length, Math.max(1, getStoredAgentsFallback().length)));

            const sortedParks = coveredParks.slice().sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));

            if (quickChipsEl) {
                const maxChips = window.innerWidth <= 640 ? 5 : 8;
                const featuredSample = sortedParks.slice(0, maxChips);
                const remaining = Math.max(0, sortedParks.length - featuredSample.length);
                if (featuredSample.length === 0) {
                    quickChipsEl.innerHTML = '';
                    quickChipsEl.style.display = 'none';
                } else {
                    quickChipsEl.style.display = isMapRevealed ? 'none' : '';
                    quickChipsEl.innerHTML = featuredSample.map(pk => `
                        <button type="button" class="home-map-quick-chip" data-quick-park-key="${esc(pk.parkKey)}" title="Click to open map at ${esc(pk.name)}${pk.city ? ' (' + esc(pk.city) + ')' : ''}">
                            <span class="home-map-chip-dot"></span>
                            <span class="home-map-chip-name">${esc(pk.name)}</span>
                            ${pk.city ? `<span class="home-map-chip-city">${esc(pk.city)}</span>` : ''}
                        </button>
                    `).join('') + (remaining > 0 ? `
                        <button type="button" class="home-map-quick-chip is-more" data-quick-park-all="true">
                            <i class="fa-solid fa-plus"></i> <span>${remaining} more parks</span>
                        </button>
                    ` : '');

                    quickChipsEl.querySelectorAll('[data-quick-park-key]').forEach(chip => {
                        chip.addEventListener('click', (e) => {
                            e.stopPropagation();
                            const pkKey = chip.getAttribute('data-quick-park-key');
                            pendingFocusParkKey = pkKey;
                            activeFocusedParkKey = pkKey;
                            if (!isMapRevealed) revealHomeMap();
                            else renderHomeMapState();
                        });
                    });
                    const moreBtn = quickChipsEl.querySelector('[data-quick-park-all]');
                    if (moreBtn) {
                        moreBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            pendingFocusParkKey = null;
                            activeFocusedParkKey = null;
                            revealHomeMap();
                        });
                    }
                    if (typeof window.bindHorizontalScrollHintObserver === 'function') {
                        window.bindHorizontalScrollHintObserver(quickChipsEl);
                    }
                }
            }

            latestCoveredParks = coveredParks;

            if (exploredPark) {
                const updatedTarget = coveredParks.find(p => p.parkKey === exploredPark.parkKey);
                if (updatedTarget) {
                    exploredPark = updatedTarget;
                }
                if (breakdownEl) {
                    renderExploreListingsPanel(exploredPark);
                }
                if (adapter) {
                    setTimeout(() => {
                        if (!adapter) return;
                        adapter.invalidateSize();
                        if (exploredPark && typeof adapter.highlightPark === 'function') {
                            adapter.highlightPark(exploredPark.parkKey);
                        }
                    }, 120);
                }
                return;
            }

            if (breakdownEl) {
                setListingViewClasses(false);
                if (sidebarHeadEl && defaultSidebarHeadHtml && !document.getElementById('home-map-back-to-parks-btn')) {
                    // Only preserve default HTML when switching back
                } else if (sidebarHeadEl && defaultSidebarHeadHtml) {
                    sidebarHeadEl.innerHTML = defaultSidebarHeadHtml;
                }
                if (sortedParks.length === 0) {
                    breakdownEl.innerHTML = '<div class="home-map-empty">No covered industrial parks match this filter.</div>';
                } else {
                    breakdownEl.innerHTML = sortedParks.map(pk => {
                        const subLine = [pk.city, pk.section ? `@ ${pk.section}` : ''].filter(Boolean).join(' · ');
                        const agentBadge = pk.specialist && pk.specialist.name
                            ? `<span class="home-map-agent-pill"><i class="fa-solid fa-user-tie"></i> ${esc(pk.specialist.name)}</span>`
                            : '<span class="home-map-units-pill">Covered Hub</span>';
                        const isActiveRow = activeFocusedParkKey && activeFocusedParkKey === pk.parkKey;
                        return `
                            <button type="button" class="home-map-park-row ${isActiveRow ? 'is-active' : ''}" data-park-key="${esc(pk.parkKey)}" data-lat="${pk.lat}" data-lng="${pk.lng}">
                                <div class="home-map-park-info">
                                    <strong>${esc(pk.name)}</strong>
                                    <span><i class="fa-solid fa-location-dot"></i> ${esc(subLine)}</span>
                                </div>
                                <div class="home-map-park-counts">
                                    ${agentBadge}
                                </div>
                            </button>
                        `;
                    }).join('');

                    breakdownEl.querySelectorAll('.home-map-park-row').forEach(row => {
                        row.addEventListener('click', () => {
                            const key = row.getAttribute('data-park-key');
                            activeFocusedParkKey = key;
                            breakdownEl.querySelectorAll('.home-map-park-row').forEach(r => r.classList.toggle('is-active', r === row));
                            const targetPark = sortedParks.find(p => p.parkKey === key);
                            if (adapter && targetPark) {
                                adapter.openParkByKey(key, targetPark);
                            }
                        });
                        row.addEventListener('mouseenter', () => {
                            if (adapter) adapter.highlightPark(row.getAttribute('data-park-key'));
                        });
                        row.addEventListener('mouseleave', () => {
                            if (adapter) adapter.highlightPark(null);
                        });
                    });
                }
            }

            if (adapter) {
                const focusToRun = pendingFocusParkKey || activeFocusedParkKey;
                setTimeout(() => {
                    if (!adapter) return;
                    adapter.invalidateSize();
                    if (focusToRun) {
                        const target = coveredParks.find(p => p.parkKey === focusToRun);
                        pendingFocusParkKey = null;
                        if (target) {
                            activeFocusedParkKey = focusToRun;
                            adapter.openParkByKey(focusToRun, target);
                            return;
                        }
                    }
                    if (lastCoordsList.length > 0) adapter.fitBounds(lastCoordsList, 14);
                    else adapter.setView(KLANG_VALLEY_CENTER[0], KLANG_VALLEY_CENTER[1], 11);
                }, 180);
            }
        }

        function bootAdapter() {
            if (adapter) {
                try { adapter.destroy(); } catch (_) {}
                adapter = null;
            }
            if (stageEl) stageEl.dataset.imapEngine = shouldUseGoogle() ? 'google' : 'leaflet';
            createAdapterWithFallback(canvasEl, {
                center: KLANG_VALLEY_CENTER,
                zoom: 11,
                useClusters: true,
                cooperativeScroll: true,
                actionLabel: 'Explore Park Listings',
                clusterRowAction: 'Explore'
            }, (created) => {
                adapter = created;
                if (stageEl) stageEl.dataset.imapEngine = created.engine;
                adapter.setSatellite(isSatellite);
                renderHomeMapState();
            });
        }

        function updateToggleBtnUI() {
            if (toggleStripEl) toggleStripEl.classList.toggle('is-open', isMapRevealed);
            if (quickChipsEl) quickChipsEl.style.display = isMapRevealed ? 'none' : '';
            if (!toggleBtn) return;
            toggleBtn.setAttribute('aria-expanded', isMapRevealed ? 'true' : 'false');
            toggleBtn.classList.toggle('btn-outline', isMapRevealed);
            toggleBtn.classList.toggle('btn-primary', !isMapRevealed);
            toggleBtn.innerHTML = isMapRevealed
                ? '<i class="fa-solid fa-eye-slash"></i> <span>Hide Map</span>'
                : '<i class="fa-solid fa-map-location-dot"></i> <span>Show Interactive Map</span>';
        }

        document.querySelectorAll('[data-home-map-trigger]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!isMapRevealed) revealHomeMap();
                else if (layoutEl) layoutEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });

        if (toggleStripEl) {
            toggleStripEl.addEventListener('click', (e) => {
                if (isMapRevealed) return;
                if (e.target.closest('button')) return;
                revealHomeMap();
            });
        }

        function revealHomeMap() {
            if (isMapRevealed) return;
            isMapRevealed = true;
            if (layoutEl) layoutEl.hidden = false;
            updateToggleBtnUI();
            if (!adapter) {
                bootAdapter();
            } else {
                renderHomeMapState();
                setTimeout(() => {
                    if (!adapter) return;
                    adapter.invalidateSize();
                    if (lastCoordsList.length > 0) adapter.fitBounds(lastCoordsList, 14);
                }, 80);
            }
        }

        function hideHomeMap() {
            if (!isMapRevealed) return;
            isMapRevealed = false;
            if (layoutEl) layoutEl.hidden = true;
            updateToggleBtnUI();
        }

        if (toggleBtn && layoutEl) {
            updateToggleBtnUI();
            toggleBtn.addEventListener('click', () => {
                if (isMapRevealed) hideHomeMap();
                else revealHomeMap();
            });
        }

        engineSubscribers.add(() => {
            if (isMapRevealed) bootAdapter();
        });
        if (isMapRevealed) {
            bootAdapter();
        } else {
            renderHomeMapState();
        }

        const cityPillsContainer = document.querySelector('.home-map-city-pills');
        if (cityPillsContainer) {
            cityPillsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.home-map-city-btn');
                if (!btn) return;
                cityPillsContainer.querySelectorAll('.home-map-city-btn').forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                selectedCity = btn.getAttribute('data-city') || 'All';
                pendingFocusParkKey = null;
                activeFocusedParkKey = null;
                exploredPark = null;
                if (!isMapRevealed) revealHomeMap();
                else renderHomeMapState();
            });
        } else {
            cityTabs.forEach(btn => {
                btn.addEventListener('click', () => {
                    cityTabs.forEach(b => {
                        b.classList.remove('active');
                        b.setAttribute('aria-pressed', 'false');
                    });
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                    selectedCity = btn.getAttribute('data-city') || 'All';
                    pendingFocusParkKey = null;
                    activeFocusedParkKey = null;
                    exploredPark = null;
                    if (!isMapRevealed) revealHomeMap();
                    else renderHomeMapState();
                });
            });
        }

        if (parkSearchInput) {
            parkSearchInput.addEventListener('input', (e) => {
                searchKeyword = e.target.value || '';
                pendingFocusParkKey = null;
                activeFocusedParkKey = null;
                exploredPark = null;
                if (searchKeyword.trim() && !isMapRevealed) revealHomeMap();
                else renderHomeMapState();
            });
        }

        homeController = {
            update(propsList, parksObj, agentsList) {
                latestProps = Array.isArray(propsList) ? propsList : [];
                latestParks = parksObj || {};
                if (Array.isArray(agentsList)) latestAgents = agentsList;
                renderHomeMapState();
            },
            showParkListings(parkInfo) {
                onSelectPark(parkInfo);
            },
            handleEscape() {
                if (adapter) adapter.closePopup();
                if (exploredPark) {
                    exitExploreListingsView(true);
                    renderHomeMapState();
                    return true;
                }
                return false;
            },
            handleKey(e) {
                if (!adapter || e.metaKey || e.ctrlKey || e.altKey) return;
                const lower = e.key.toLowerCase();
                if (lower === 's') { e.preventDefault(); toggleSatelliteLayer(); }
                else if (lower === 'f' && !e.shiftKey) {
                    e.preventDefault();
                    if (lastCoordsList.length > 0) adapter.fitBounds(lastCoordsList, 14);
                    else adapter.setView(KLANG_VALLEY_CENTER[0], KLANG_VALLEY_CENTER[1], 11);
                } else if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    adapter.zoomIn();
                } else if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    adapter.zoomOut();
                } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && (canvasEl.contains(document.activeElement) || document.activeElement === canvasEl)) {
                    if (adapter.engine === 'google') return;
                    e.preventDefault();
                    const step = 80;
                    if (e.key === 'ArrowUp') adapter.panBy(0, -step);
                    if (e.key === 'ArrowDown') adapter.panBy(0, step);
                    if (e.key === 'ArrowLeft') adapter.panBy(-step, 0);
                    if (e.key === 'ArrowRight') adapter.panBy(step, 0);
                }
            }
        };

        return homeController;
    }

    // --- 3. DASHBOARD CLICK-TO-PIN COORDINATE PICKER MODAL ---
    let pickerState = null;

    function openCoordinatePickerModal(opts) {
        let modal = document.getElementById('coord-picker-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'coord-picker-modal';
            modal.className = 'modal-overlay';
            modal.style.zIndex = '100050';
            modal.innerHTML = `
                <div class="modal modal-card-window modal-neat-window" style="max-width: 760px; width: 94%; display: flex; flex-direction: column;">
                    <div class="modal-header">
                        <div class="modal-header-left">
                            <div class="modal-header-icon theme-emerald"><i class="fa-solid fa-map-pin"></i></div>
                            <div>
                                <h3 id="coord-picker-title">Pin Exact Location on Map</h3>
                                <p class="modal-subtitle">Click anywhere on the map, drag the pin, or paste exact Google Maps coordinates / link</p>
                            </div>
                        </div>
                        <button type="button" class="close-modal" id="close-coord-picker-btn" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.7rem;">
                        <div id="coord-picker-road-banner" style="display: none; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.45rem 0.75rem; border-radius: 8px; background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; font-size: 0.78rem; font-weight: 600;"></div>
                        <div id="coord-picker-search-bar" style="display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: stretch;">
                            <input type="text" id="coord-picker-search-input" class="form-control" placeholder="Search road / park OR paste Google Maps link / lat, lng (e.g. 3.0617, 101.5234)" autocomplete="off" style="flex: 1 1 240px; min-inline-size: 0; font-size: 0.83rem; min-block-size: 38px; padding: 0.42rem 0.75rem;">
                            <button type="button" class="btn btn-sm btn-outline" id="coord-picker-search-btn" style="white-space: nowrap; min-block-size: 38px;">
                                <i class="fa-solid fa-magnifying-glass-location" aria-hidden="true"></i> Find / Snap
                            </button>
                            <a id="coord-picker-gmaps-link" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="white-space: nowrap; min-block-size: 38px; display: inline-flex; align-items: center; gap: 5px; color: #1d4ed8; border-color: #bfdbfe; background: #eff6ff; text-decoration: none;" title="Verify exact pin on Google Maps, right-click to copy coordinates, then paste here">
                                <i class="fa-brands fa-google" aria-hidden="true"></i> Verify on Google Maps <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem;" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div id="coord-picker-canvas" style="width: 100%; height: 370px; border-radius: 12px; border: 1px solid #cbd5e1; overflow: hidden;"></div>
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <div id="coord-picker-readout" style="font-size: 0.85rem; font-weight: 700; color: #0f172a;">Click map to drop pin</div>
                                <div id="coord-picker-engine-note" style="font-size: 0.72rem; color: #64748b;"></div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button type="button" class="btn btn-outline" id="coord-picker-clear-btn">Clear Pin</button>
                                <button type="button" class="btn btn-primary" id="coord-picker-confirm-btn"><i class="fa-solid fa-check" style="margin-right: 4px;"></i> Use Coordinates</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const titleEl = document.getElementById('coord-picker-title');
        const readoutEl = document.getElementById('coord-picker-readout');
        const engineNoteEl = document.getElementById('coord-picker-engine-note');
        const roadBannerEl = document.getElementById('coord-picker-road-banner');
        const searchInput = document.getElementById('coord-picker-search-input');
        const searchBtn = document.getElementById('coord-picker-search-btn');
        const gmapsLink = document.getElementById('coord-picker-gmaps-link');
        const closeBtn = document.getElementById('close-coord-picker-btn');
        const clearBtn = document.getElementById('coord-picker-clear-btn');
        const confirmBtn = document.getElementById('coord-picker-confirm-btn');
        const canvasEl = document.getElementById('coord-picker-canvas');

        if (titleEl && opts && opts.title) titleEl.textContent = opts.title;
        if (searchInput) searchInput.value = '';

        const capturedRoad = extractPrimaryRoad((opts && (opts.primaryRoad || opts.road)) || '');
        const preferRoadDefault = Boolean(capturedRoad && (!opts || opts.preferRoadDefault !== false));
        const syncRoadCoords = capturedRoad
            ? resolvePrimaryRoadCoordinates(capturedRoad, opts && opts.location, opts && opts.park)
            : null;

        const hasExplicitCoords = !preferRoadDefault && isValidMalaysiaCoord(opts && opts.lat, opts && opts.lng);
        let latestPinLat = (preferRoadDefault && syncRoadCoords && isValidMalaysiaCoord(syncRoadCoords.lat, syncRoadCoords.lng))
            ? Number(syncRoadCoords.lat)
            : (isValidMalaysiaCoord(opts && opts.lat, opts && opts.lng)
                ? Number(opts.lat)
                : ((opts && opts.fallbackLat) || KLANG_VALLEY_CENTER[0]));
        let latestPinLng = (preferRoadDefault && syncRoadCoords && isValidMalaysiaCoord(syncRoadCoords.lat, syncRoadCoords.lng))
            ? Number(syncRoadCoords.lng)
            : (isValidMalaysiaCoord(opts && opts.lat, opts && opts.lng)
                ? Number(opts.lng)
                : ((opts && opts.fallbackLng) || KLANG_VALLEY_CENTER[1]));
        const startZoom = (capturedRoad || isValidMalaysiaCoord(opts && opts.lat, opts && opts.lng)) ? 17 : 13;

        let userMovedPin = false;
        let activeGeocodeReq = 0;

        const updateGoogleMapsVerifyHref = (lat, lng, queryFallback) => {
            if (!gmapsLink) return;
            const qStr = queryFallback || [capturedRoad, opts && opts.park, opts && opts.location, 'Selangor', 'Malaysia'].filter(Boolean).join(', ');
            if (qStr && !userMovedPin) {
                gmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qStr)}`;
            } else if (isValidMalaysiaCoord(lat, lng)) {
                gmapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`)}`;
            } else {
                gmapsLink.href = 'https://www.google.com/maps';
            }
        };

        const setBannerStatus = (statusText, tone = 'success') => {
            const statusEl = document.getElementById('coord-picker-road-status');
            if (!statusEl) return;
            const colorMap = {
                loading: '#1d4ed8',
                google: '#166534',
                live: '#047857',
                manual: '#0369a1',
                fallback: '#b45309'
            };
            statusEl.style.color = colorMap[tone] || colorMap.live;
            statusEl.innerHTML = statusText;
        };

        const sourceBadgeFor = (src) => {
            if (src === 'first-road-google') return { html: '<i class="fa-brands fa-google"></i> Google Maps Exact', tone: 'google' };
            if (src === 'first-road-osm' || src === 'first-road-arcgis' || src === 'first-road-geocoded') return { html: '<i class="fa-solid fa-circle-check"></i> Live Street Match', tone: 'live' };
            if (src === 'google-paste') return { html: '<i class="fa-brands fa-google"></i> Google Maps Pin', tone: 'google' };
            return { html: '<i class="fa-solid fa-triangle-exclamation"></i> Approx. Fallback', tone: 'fallback' };
        };

        const snapPinToCapturedRoad = (customRoadQuery, forceRefresh = false) => {
            const roadToFind = extractPrimaryRoad(customRoadQuery || capturedRoad);
            if (!roadToFind) return;
            const reqId = ++activeGeocodeReq;
            userMovedPin = false;
            setBannerStatus('<i class="fa-solid fa-spinner fa-spin"></i> Locating street...', 'loading');

            if (!forceRefresh) {
                const immediate = resolvePrimaryRoadCoordinates(roadToFind, opts && opts.location, opts && opts.park);
                if (immediate && isValidMalaysiaCoord(immediate.lat, immediate.lng)) {
                    latestPinLat = Number(immediate.lat);
                    latestPinLng = Number(immediate.lng);
                    if (pickerState) {
                        pickerState.setPosition(latestPinLat, latestPinLng, 17);
                    }
                    const badge = sourceBadgeFor(immediate.source);
                    setBannerStatus(badge.html, badge.tone);
                }
            }

            geocodePrimaryRoad({
                road: roadToFind,
                park: opts && opts.park,
                location: opts && opts.location,
                forceRefresh
            }).then(geo => {
                if (reqId !== activeGeocodeReq || userMovedPin) return;
                if (geo && isValidMalaysiaCoord(geo.lat, geo.lng)) {
                    latestPinLat = Number(geo.lat);
                    latestPinLng = Number(geo.lng);
                    if (pickerState && modal.classList.contains('active')) {
                        pickerState.setPosition(latestPinLat, latestPinLng, 17);
                    }
                    const badge = sourceBadgeFor(geo.source);
                    setBannerStatus(badge.html, badge.tone);
                    updateGoogleMapsVerifyHref(latestPinLat, latestPinLng, [roadToFind, opts && opts.park, opts && opts.location, 'Selangor', 'Malaysia'].filter(Boolean).join(', '));
                    if (opts && typeof opts.onDefaultResolved === 'function') {
                        opts.onDefaultResolved(latestPinLat, latestPinLng, roadToFind);
                    }
                } else {
                    setBannerStatus('<i class="fa-solid fa-triangle-exclamation"></i> Drag pin or paste Google Maps coords', 'fallback');
                }
            }).catch(() => {
                if (reqId === activeGeocodeReq) {
                    setBannerStatus('<i class="fa-solid fa-triangle-exclamation"></i> Drag pin or paste Google Maps coords', 'fallback');
                }
            });
        };

        if (roadBannerEl) {
            if (capturedRoad) {
                const subParts = [opts && opts.park, opts && opts.location].filter(Boolean).join(' · ');
                roadBannerEl.style.display = 'flex';
                roadBannerEl.style.flexWrap = 'wrap';
                roadBannerEl.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                        <span><i class="fa-solid fa-road" style="margin-right:4px;color:#059669;"></i><strong>Captured 1st Road for Map Pin:</strong></span>
                        <button type="button" id="coord-picker-road-default-pill" style="display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:999px; background:#d1fae5; border:1.5px solid #10b981; color:#065f46; font-weight:800; font-size:0.78rem; cursor:pointer;" title="Click to re-locate ${esc(capturedRoad)}">
                            <i class="fa-solid fa-location-crosshairs"></i> ${esc(capturedRoad)}
                        </button>
                        ${subParts ? `<span style="color:#047857; font-weight:600;">· ${esc(subParts)}</span>` : ''}
                    </div>
                    <span id="coord-picker-road-status" style="font-size:0.72rem; color:#047857; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                        <i class="fa-solid fa-spinner fa-spin"></i> Locating...
                    </span>
                `;
                const roadPillBtn = roadBannerEl.querySelector('#coord-picker-road-default-pill');
                if (roadPillBtn) {
                    roadPillBtn.addEventListener('click', () => {
                        snapPinToCapturedRoad(capturedRoad, true);
                    });
                }
            } else {
                roadBannerEl.style.display = 'none';
                roadBannerEl.innerHTML = '';
            }
        }

        modal.style.display = 'flex';
        modal.classList.add('active');

        const desiredEngine = shouldUseGoogle() ? 'google' : 'leaflet';
        if (pickerState && pickerState.engine !== desiredEngine) {
            try { pickerState.destroy(); } catch (_) {}
            pickerState = null;
        }

        const updateEngineNote = (engineName) => {
            if (!engineNoteEl) return;
            if (engineName === 'google') {
                engineNoteEl.innerHTML = '<i class="fa-brands fa-google" style="color:#4285f4;margin-right:4px;"></i>Powered by official Google Maps &amp; Google Geocoder';
            } else {
                engineNoteEl.innerHTML = 'Free map view · Paste a Google Maps link / right-click coordinates above, or add a Google Maps API key in Settings &gt; General.';
            }
        };

        const updateReadout = (lat, lng, isManualMove = false) => {
            if (!pickerState) return;
            pickerState.selected = { lat: Number(Number(lat).toFixed(6)), lng: Number(Number(lng).toFixed(6)) };
            if (isManualMove) {
                userMovedPin = true;
                setBannerStatus('<i class="fa-solid fa-map-pin"></i> Manual Pin', 'manual');
            }
            if (readoutEl) {
                readoutEl.textContent = `Selected: ${pickerState.selected.lat}, ${pickerState.selected.lng}`;
            }
            updateGoogleMapsVerifyHref(pickerState.selected.lat, pickerState.selected.lng);
        };

        const runSearchOrGooglePaste = async () => {
            const raw = searchInput ? searchInput.value.trim() : '';
            if (!raw) return;

            // 1. Direct Google Maps URL or copied "lat, lng" pair -> instant 1-meter snap
            const parsed = parseCoordsFromUrl(raw);
            if (parsed && isValidMalaysiaCoord(parsed.lat, parsed.lng)) {
                userMovedPin = true;
                activeGeocodeReq++;
                latestPinLat = parsed.lat;
                latestPinLng = parsed.lng;
                if (pickerState) pickerState.setPosition(parsed.lat, parsed.lng, 18);
                setBannerStatus('<i class="fa-brands fa-google"></i> Google Maps Pin Snapped', 'google');
                return;
            }

            // 2. Live address / road / park search
            const origHtml = searchBtn ? searchBtn.innerHTML : '';
            if (searchBtn) {
                searchBtn.disabled = true;
                searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Finding...';
            }
            const reqId = ++activeGeocodeReq;
            userMovedPin = false;
            try {
                const geo = await geocodePrimaryRoad({
                    road: raw,
                    park: opts && opts.park,
                    location: opts && opts.location,
                    forceRefresh: true
                });
                if (reqId === activeGeocodeReq && geo && isValidMalaysiaCoord(geo.lat, geo.lng)) {
                    latestPinLat = Number(geo.lat);
                    latestPinLng = Number(geo.lng);
                    if (pickerState) pickerState.setPosition(latestPinLat, latestPinLng, 17);
                    const badge = sourceBadgeFor(geo.source);
                    setBannerStatus(badge.html, badge.tone);
                    updateGoogleMapsVerifyHref(latestPinLat, latestPinLng, raw);
                } else if (reqId === activeGeocodeReq) {
                    setBannerStatus('<i class="fa-solid fa-triangle-exclamation"></i> Not found — click Verify on Google Maps &amp; paste coords', 'fallback');
                }
            } finally {
                if (searchBtn) {
                    searchBtn.disabled = false;
                    searchBtn.innerHTML = origHtml;
                }
            }
        };

        if (searchBtn) searchBtn.onclick = runSearchOrGooglePaste;
        if (searchInput) {
            searchInput.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    runSearchOrGooglePaste();
                }
            };
            searchInput.onpaste = () => {
                setTimeout(() => {
                    const pasted = searchInput.value.trim();
                    if (parseCoordsFromUrl(pasted)) {
                        runSearchOrGooglePaste();
                    }
                }, 40);
            };
        }

        if (!pickerState) {
            if (desiredEngine === 'google') {
                loadGoogleMapsSdk(readConfiguredGoogleMapsKey()).then((gm) => {
                    if (gmapsAuthFailed) {
                        if (global.L) initLeafletPicker();
                        return;
                    }
                    canvasEl.innerHTML = '';
                    const gMap = new gm.Map(canvasEl, {
                        center: { lat: latestPinLat, lng: latestPinLng },
                        zoom: startZoom,
                        streetViewControl: false,
                        fullscreenControl: false
                    });
                    const gMarker = new gm.Marker({
                        position: { lat: latestPinLat, lng: latestPinLng },
                        map: gMap,
                        draggable: true
                    });
                    gMap.addListener('click', (e) => {
                        gMarker.setPosition(e.latLng);
                        updateReadout(e.latLng.lat(), e.latLng.lng(), true);
                    });
                    gMarker.addListener('dragend', () => {
                        const p = gMarker.getPosition();
                        updateReadout(p.lat(), p.lng(), true);
                    });
                    const onPickerAuthFail = (reason) => {
                        if (reason === 'auth-failed' && pickerState && pickerState.engine === 'google') {
                            const cur = pickerState.selected || { lat: latestPinLat, lng: latestPinLng };
                            try { pickerState.destroy(); } catch (_) {}
                            pickerState = null;
                            if (global.L) {
                                initLeafletPicker();
                                if (pickerState) pickerState.setPosition(cur.lat, cur.lng, startZoom);
                            }
                        }
                    };
                    engineSubscribers.add(onPickerAuthFail);
                    pickerState = {
                        engine: 'google',
                        selected: { lat: latestPinLat, lng: latestPinLng },
                        setPosition(la, ln, z) {
                            gMap.setCenter({ lat: la, lng: ln });
                            gMap.setZoom(z);
                            gMarker.setPosition({ lat: la, lng: ln });
                            updateReadout(la, ln, false);
                        },
                        invalidate() { gm.event.trigger(gMap, 'resize'); },
                        destroy() {
                            engineSubscribers.delete(onPickerAuthFail);
                            gm.event.clearInstanceListeners(gMap);
                            canvasEl.innerHTML = '';
                        }
                    };
                    updateEngineNote('google');
                    updateReadout(latestPinLat, latestPinLng, false);
                    if (capturedRoad && !hasExplicitCoords) {
                        snapPinToCapturedRoad(capturedRoad, false);
                    }
                }).catch(() => {
                    if (!global.L) return;
                    initLeafletPicker();
                });
            } else if (global.L) {
                initLeafletPicker();
            } else {
                canvasEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#64748b;font-size:0.88rem;gap:0.5rem;"><i class="fa-solid fa-spinner fa-spin"></i> Loading interactive map...</div>';
                ensureLeafletLoaded().then((ok) => {
                    if (ok && global.L) {
                        initLeafletPicker();
                    } else {
                        alert('Map library could not be loaded. Please check your internet connection and try again.');
                    }
                });
                return;
            }
        } else {
            updateEngineNote(pickerState.engine);
            pickerState.setPosition(latestPinLat, latestPinLng, startZoom);
            setTimeout(() => pickerState && pickerState.invalidate(), 120);
            if (capturedRoad && !hasExplicitCoords) {
                snapPinToCapturedRoad(capturedRoad, false);
            }
        }

        function initLeafletPicker() {
            canvasEl.innerHTML = '';
            const pMap = global.L.map(canvasEl, { center: [latestPinLat, latestPinLng], zoom: startZoom });
            addLeafletBaseLayers(pMap);
            const pMarker = global.L.marker([latestPinLat, latestPinLng], { draggable: true }).addTo(pMap);

            pMap.on('click', (e) => {
                pMarker.setLatLng(e.latlng);
                updateReadout(e.latlng.lat, e.latlng.lng, true);
            });
            pMarker.on('dragend', () => {
                const pos = pMarker.getLatLng();
                updateReadout(pos.lat, pos.lng, true);
            });

            pickerState = {
                engine: 'leaflet',
                selected: { lat: latestPinLat, lng: latestPinLng },
                setPosition(la, ln, z) {
                    pMap.setView([la, ln], z);
                    pMarker.setLatLng([la, ln]);
                    updateReadout(la, ln, false);
                },
                invalidate() { pMap.invalidateSize(); },
                destroy() { try { pMap.remove(); } catch (_) {} canvasEl.innerHTML = ''; }
            };
            updateEngineNote('leaflet');
            updateReadout(latestPinLat, latestPinLng, false);
            setTimeout(() => pickerState && pickerState.invalidate(), 120);
            if (capturedRoad && !hasExplicitCoords) {
                snapPinToCapturedRoad(capturedRoad, false);
            }
        }

        if (hasExplicitCoords) {
            setBannerStatus('<i class="fa-solid fa-map-pin"></i> Saved Pin', 'manual');
        }

        const closePicker = () => {
            activeGeocodeReq++;
            modal.classList.remove('active');
            modal.style.display = 'none';
        };

        closeBtn.onclick = closePicker;
        modal.onclick = (e) => { if (e.target === modal) closePicker(); };
        clearBtn.onclick = () => {
            if (opts && typeof opts.onApply === 'function') opts.onApply('', '');
            closePicker();
        };
        confirmBtn.onclick = () => {
            if (opts && typeof opts.onApply === 'function' && pickerState && pickerState.selected) {
                opts.onApply(pickerState.selected.lat, pickerState.selected.lng);
            }
            closePicker();
        };
    }

    function setGoogleMapsApiKey(newKey, opts) {
        const cleaned = String(newKey || '').trim();
        const prevConfigured = typeof configuredGoogleMapsKey === 'string' ? configuredGoogleMapsKey : '';
        const forceRetry = !!(opts && opts.forceRetry);
        const keyChanged = cleaned !== prevConfigured;
        const needsEngineUpgrade = Boolean(cleaned && activeAdapterKey !== cleaned && (!gmapsAuthFailed || keyChanged || forceRetry));
        const needsEngineDowngrade = Boolean(!cleaned && activeAdapterKey !== '');

        configuredGoogleMapsKey = cleaned;

        if (keyChanged || forceRetry || needsEngineUpgrade || needsEngineDowngrade) {
            if (keyChanged || forceRetry) {
                gmapsAuthFailed = false;
                gmapsLastErrorCode = '';
                if (keyChanged) {
                    gmapsLoadPromise = null;
                }
            }
            engineSubscribers.forEach(fn => {
                try { fn('key-updated'); } catch (_) {}
            });
        }
    }

    function getGoogleMapsAuthStatus() {
        const key = readConfiguredGoogleMapsKey();
        return {
            hasKey: !!key,
            key,
            authFailed: gmapsAuthFailed,
            errorCode: gmapsLastErrorCode || '',
            activeEngine: shouldUseGoogle() ? 'google' : 'leaflet'
        };
    }

    function verifyGoogleMapsApiKey(candidateKey) {
        const cleaned = String(candidateKey !== undefined ? candidateKey : readConfiguredGoogleMapsKey()).trim();
        if (!cleaned) {
            return Promise.resolve({
                valid: false,
                status: 'empty',
                errorCode: '',
                origin: (global.location && global.location.origin) || ''
            });
        }

        // Reset auth failure state before running a fresh probe
        if (loadedGoogleMapsKey !== cleaned || gmapsAuthFailed) {
            gmapsAuthFailed = false;
            gmapsLastErrorCode = '';
            gmapsLoadPromise = null;
            if (global.google && global.google.maps) {
                try { delete global.google.maps; } catch (_) { global.google.maps = undefined; }
            }
        }

        return new Promise((resolve) => {
            let finished = false;
            let probeDiv = null;
            let timer = null;

            const finish = (result) => {
                if (finished) return;
                finished = true;
                if (timer) clearTimeout(timer);
                global.removeEventListener('mfs:gmaps-status', onStatusEvent);
                if (probeDiv && probeDiv.parentNode) {
                    try { probeDiv.parentNode.removeChild(probeDiv); } catch (_) {}
                }
                resolve(Object.assign({
                    origin: (global.location && global.location.origin) || ''
                }, result));
            };

            const onStatusEvent = (ev) => {
                const d = (ev && ev.detail) || {};
                if (d.status === 'auth-failed') {
                    finish({
                        valid: false,
                        status: 'auth-failed',
                        errorCode: d.errorCode || gmapsLastErrorCode || 'AuthFailure'
                    });
                }
            };

            global.addEventListener('mfs:gmaps-status', onStatusEvent);

            loadGoogleMapsSdk(cleaned).then((gm) => {
                if (gmapsAuthFailed) {
                    finish({
                        valid: false,
                        status: 'auth-failed',
                        errorCode: gmapsLastErrorCode || 'AuthFailure'
                    });
                    return;
                }

                try {
                    probeDiv = document.createElement('div');
                    probeDiv.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:80px;height:80px;opacity:0;pointer-events:none;z-index:-1;';
                    document.body.appendChild(probeDiv);
                    const testMap = new gm.Map(probeDiv, {
                        center: { lat: KLANG_VALLEY_CENTER[0], lng: KLANG_VALLEY_CENTER[1] },
                        zoom: 11,
                        disableDefaultUI: true
                    });
                    gm.event.addListenerOnce(testMap, 'tilesloaded', () => {
                        setTimeout(() => {
                            if (!gmapsAuthFailed) {
                                emitGmapsStatus('verified', { key: cleaned });
                                finish({ valid: true, status: 'verified', errorCode: '' });
                            }
                        }, 250);
                    });
                } catch (err) {
                    finish({
                        valid: false,
                        status: 'error',
                        errorCode: (err && err.message) || 'MapInitError'
                    });
                    return;
                }

                // Wait up to 2.2s for Google AuthenticationService.Authenticate callback
                timer = setTimeout(() => {
                    if (gmapsAuthFailed) {
                        finish({
                            valid: false,
                            status: 'auth-failed',
                            errorCode: gmapsLastErrorCode || 'AuthFailure'
                        });
                    } else {
                        emitGmapsStatus('verified', { key: cleaned });
                        finish({ valid: true, status: 'verified', errorCode: '' });
                    }
                }, 2200);
            }).catch((err) => {
                finish({
                    valid: false,
                    status: 'auth-failed',
                    errorCode: gmapsLastErrorCode || (err && err.message) || 'NetworkOrKeyError'
                });
            });
        });
    }

    if (typeof global.addEventListener === 'function') {
        global.addEventListener('storage', (e) => {
            if (!e || !e.key || e.key === 'industria_settings') {
                const latestKey = readStorageGoogleMapsKey();
                setGoogleMapsApiKey(latestKey);
            }
        });
    }

    global.IndustraMap = {
        extractPrimaryRoad,
        resolvePrimaryRoadCoordinates,
        geocodePrimaryRoad,
        resolvePropertyCoordinates,
        resolveParkCoordinates,
        collectCoveredParks,
        parseCoordsFromUrl,
        isValidMalaysiaCoord,
        getUnitsCount,
        initSplitMapController,
        initHomepageOverviewMap,
        openCoordinatePickerModal,
        openShortcutsModal,
        setGoogleMapsApiKey,
        getGoogleMapsApiKey: readConfiguredGoogleMapsKey,
        getGoogleMapsAuthStatus,
        verifyGoogleMapsApiKey,
        getActiveEngine() { return shouldUseGoogle() ? 'google' : 'leaflet'; }
    };
})(window);
