/**
 * ============================================================================
 * INDUSTRIA INDUSTRIAL REAL ESTATE — 1-CLICK SOCIAL MEDIA SHARE ENGINE
 * Supports: Facebook, WhatsApp, LinkedIn, Instagram, TikTok, X (Twitter), Copy Link
 * ============================================================================
 */

(function () {
    'use strict';

    let currentShareProp = null;
    let currentShareUrl = '';
    let currentShareAllowPhoto = false;

    // Check whether current execution context is the admin Dashboard
    function isDashboardContext() {
        try {
            const path = (window.location.pathname || '').toLowerCase();
            if (path.includes('dashboard')) return true;
            if (document.getElementById('properties-table-body') || document.getElementById('dashboard-app') || document.getElementById('admin-management-view')) return true;
            return false;
        } catch (e) {
            return false;
        }
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Resolve public live URL for a property (ensures QR code & mobile links always work)
    function getPropertyPublicUrl(propId) {
        if (!propId) return 'https://www.myfactoryspace.com/properties.html';
        try {
            const loc = window.location;
            const host = (loc.hostname || '').toLowerCase();
            // If running on live domain or non-local server, use current origin
            if (host.includes('myfactoryspace.com') || (host && !host.includes('localhost') && !host.includes('127.0.0.1') && loc.protocol !== 'file:')) {
                const origin = loc.origin && loc.origin !== 'null' ? loc.origin : 'https://www.myfactoryspace.com';
                const pathParts = loc.pathname.split('/');
                pathParts.pop();
                const basePath = pathParts.join('/');
                const cleanBasePath = basePath ? basePath + '/' : '/';
                return `${origin}${cleanBasePath}properties.html?id=${encodeURIComponent(propId)}`;
            }
        } catch (e) {}
        // Default to official production URL so smartphone QR scans and WhatsApp links always route to live site
        return `https://www.myfactoryspace.com/properties.html?id=${encodeURIComponent(propId)}`;
    }

    // Resolve direct share URL for a property
    function getPropertyShareUrl(propId) {
        return getPropertyPublicUrl(propId);
    }

    // Derive search query string based on road, park, location
    function getPropertyLocationQuery(prop) {
        if (!prop) return 'Selangor, Malaysia';
        const parts = [];
        if (prop.road && String(prop.road).trim()) parts.push(String(prop.road).trim());
        if (prop.park && String(prop.park).trim()) parts.push(String(prop.park).trim());
        if (prop.location && String(prop.location).trim()) parts.push(String(prop.location).trim());
        parts.push('Selangor');
        parts.push('Malaysia');
        return parts.join(', ');
    }

    // Google Maps direct URL
    function getGoogleMapsUrl(prop) {
        if (!prop) return 'https://www.google.com/maps';
        if (prop.googleMapUrl && typeof prop.googleMapUrl === 'string' && prop.googleMapUrl.trim()) {
            return prop.googleMapUrl.trim();
        }
        if (prop.mapUrl && typeof prop.mapUrl === 'string' && prop.mapUrl.trim()) {
            const trimmed = prop.mapUrl.trim();
            if (trimmed.includes('maps.google.com') || trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
                return trimmed;
            }
        }
        const query = getPropertyLocationQuery(prop);
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }

    // Google Earth direct Web URL (opens 3D Earth view focused on location)
    function getGoogleEarthUrl(prop) {
        if (!prop) return 'https://earth.google.com/web';
        if (prop.googleEarthUrl && typeof prop.googleEarthUrl === 'string' && prop.googleEarthUrl.trim()) {
            return prop.googleEarthUrl.trim();
        }
        if (prop.mapUrl && typeof prop.mapUrl === 'string' && prop.mapUrl.trim()) {
            const trimmed = prop.mapUrl.trim();
            if (trimmed.includes('earth.google.com')) {
                return trimmed;
            }
        }
        const query = getPropertyLocationQuery(prop);
        return `https://earth.google.com/web/search/${encodeURIComponent(query)}`;
    }

    // Waze navigation direct URL
    function getWazeUrl(prop) {
        if (!prop) return 'https://www.waze.com';
        if (prop.wazeUrl && typeof prop.wazeUrl === 'string' && prop.wazeUrl.trim()) {
            return prop.wazeUrl.trim();
        }
        const query = getPropertyLocationQuery(prop);
        return `https://waze.com/ul?q=${encodeURIComponent(query)}`;
    }

    // Resolve assigned agent for property
    function resolveAgentForProp(prop) {
        try {
            const agentsStr = localStorage.getItem('industria_agents');
            const agents = agentsStr ? JSON.parse(agentsStr) : [];
            if (!Array.isArray(agents) || agents.length === 0) return null;

            if (prop.assignedAgentId) {
                const found = agents.find(a => String(a.id) === String(prop.assignedAgentId));
                if (found) return found;
            }

            if (prop.park) {
                const normPark = String(prop.park).trim().toLowerCase();
                const matched = agents.find(a => {
                    const pList = Array.isArray(a.parks) ? a.parks : (Array.isArray(a.assignedParks) ? a.assignedParks : []);
                    return pList.some(p => {
                        const name = typeof p === 'string' ? p : (p && p.name ? p.name : '');
                        return name.trim().toLowerCase() === normPark;
                    });
                });
                if (matched) return matched;
            }
        } catch (e) {
            console.warn('resolveAgentForProp error:', e);
        }
        return null;
    }

    // Generate tailored marketing captions for each platform
    function generatePropertyShareCaption(prop, shareUrl, platform = 'general') {
        if (!prop) return '';

        const title = prop.title || 'Industrial Property';
        const rawIntent = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale')).toUpperCase();
        const intentLabel = rawIntent === 'RENT' ? 'FOR RENT' : 'FOR SALE';
        const price = prop.price || 'Contact for Price';
        const loc = prop.location || 'Selangor';
        const park = prop.park ? ` (${prop.park})` : '';
        const road = prop.road ? ` • ${prop.road}` : '';
        const type = prop.type || 'Industrial Property';

        const specs = [];
        if (prop.size && prop.size !== 'N/A') specs.push(`📐 Built-up: ${prop.size}`);
        if (prop.landArea && prop.landArea !== 'N/A') specs.push(`🗺️ Land Area: ${prop.landArea}`);
        if (prop.power && prop.power !== '0') specs.push(`⚡ Power Supply: ${prop.power} Amp`);
        if (prop.ceilingClear && prop.ceilingClear !== '0') specs.push(`📏 Clear Ceiling Height: ${prop.ceilingClear} ft`);
        else if (prop.ceilingEave && prop.ceilingEave !== '0') specs.push(`🏗️ Ceiling Eave Height: ${prop.ceilingEave} ft`);
        if (prop.floorLoading && prop.floorLoading !== '0') specs.push(`⚖️ Floor Loading: ${prop.floorLoading} kN/m²`);
        if (prop.loadingBay && prop.loadingBay !== '0') specs.push(`🚛 Loading Bays: ${prop.loadingBay} Bays`);
        if (prop.lift && prop.lift !== '0') specs.push(`🛗 Cargo Lift: ${prop.lift} Units`);

        const specsText = specs.length > 0 ? specs.join('\n') : '';

        // Contact info
        let contactText = '';
        const agent = resolveAgentForProp(prop);
        if (agent) {
            contactText = `*Contact Agent:* ${agent.name} (${agent.ren || 'Industrial Specialist'})\n- *WhatsApp / Call:* +${agent.whatsapp || agent.phone || ''}`;
        } else {
            contactText = `*Inquiries & Viewing Appointments:* Reach out to our specialist team`;
        }

        // WhatsApp: Formatted with bold markers and direct link
        if (platform === 'whatsapp') {
            const mapUrl = getGoogleMapsUrl(prop);
            return `*${intentLabel}: ${title}*\n\n` +
                   `- *Price:* ${price}\n` +
                   `- *Location:* ${loc}, Selangor${park}${road}\n` +
                   `- *Category:* ${type}\n\n` +
                   (specsText ? `*Key Specifications:*\n${specsText}\n\n` : '') +
                   `${contactText}\n\n` +
                   `- *Google Earth / Map:* ${mapUrl}\n` +
                   `- *View Photos, Floor Plan & Specs:*\n${shareUrl}`;
        }

        // TikTok: Short hook, compact specs, trending hashtags
        if (platform === 'tiktok') {
            return `🔥 ${intentLabel}: ${title}\n` +
                   `📍 ${loc}, Selangor${park} • 💰 ${price}\n` +
                   (specs.length > 0 ? `✨ ${specs.slice(0, 3).join(' • ')}\n` : '') +
                   `\n🔗 Full specs and photos via link in bio!\n\n` +
                   `#IndustrialProperty #FactoryForRent #FactoryForSale #WarehouseSelangor #ShahAlamFactory #KlangWarehouse #SubangFactory #MalaysiaRealEstate #PropertyHunting`;
        }

        // Instagram: Visually structured with emojis and comprehensive hashtags
        if (platform === 'instagram') {
            return `🏢 ${intentLabel} | ${title}\n\n` +
                   `💰 Price: ${price}\n` +
                   `📍 Location: ${loc}, Selangor${park}${road}\n` +
                   `🏗️ Property Type: ${type}\n\n` +
                   (specsText ? `✨ Key Highlights:\n${specsText}\n\n` : '') +
                   `${contactText}\n\n` +
                   `📲 DM us or click the link in bio to schedule an exclusive viewing or request the technical dossier!\n` +
                   `🔗 Listing Link: ${shareUrl}\n\n` +
                   `#IndustrialRealEstate #FactoryForSale #FactoryForRent #WarehouseForSale #LogisticsHub #SelangorIndustrial #ShahAlamFactory #KlangFactory #IndustrialSpecialist`;
        }

        // Twitter / X: Compact hook
        if (platform === 'twitter') {
            return `🏭 ${intentLabel}: ${title}\n` +
                   `💰 ${price} | 📍 ${loc}, Selangor${park}\n` +
                   `🔗 Full details: ${shareUrl}\n` +
                   `#IndustrialProperty #FactoryForSale #Selangor`;
        }

        // Default / Facebook / LinkedIn
        return `🏢 ${intentLabel}: ${title}\n\n` +
               `💰 Price: ${price}\n` +
               `📍 Location: ${loc}, Selangor${park}${road}\n` +
               `🏗️ Category: ${type}\n\n` +
               (specsText ? `Key Specifications:\n${specsText}\n\n` : '') +
               `${contactText}\n\n` +
               `🔗 Explore complete listing specs, gallery and viewing request:\n${shareUrl}\n\n` +
               `#IndustrialProperty #FactoryForSale #WarehouseForRent #MalaysiaProperties #IndustrialRealEstate`;
    }

    // Ensure Share Modal DOM structure is injected
    function ensurePropertyShareModal() {
        if (document.getElementById('property-share-modal')) return;

        const modalHtml = `
            <div id="property-share-modal" class="property-share-modal" aria-hidden="true" role="dialog" aria-labelledby="share-modal-title">
                <div class="share-modal-backdrop" id="share-modal-backdrop"></div>
                <div class="share-modal-dialog">
                    <!-- Header -->
                    <div class="share-modal-header">
                        <div>
                            <h3 class="share-modal-title">
                                <i class="fa-solid fa-share-nodes" style="color: var(--primary, #0077b6);"></i> Share Property Listing
                            </h3>
                            <p class="share-modal-subtitle">1-Click share to social media or copy marketing text</p>
                        </div>
                        <button type="button" class="share-modal-close" id="share-modal-close" aria-label="Close">&times;</button>
                    </div>

                    <!-- Newly Created Listing Banner -->
                    <div id="share-modal-new-banner" class="share-modal-new-banner" style="display: none;">
                        <i class="fa-solid fa-circle-check"></i>
                        <div>
                            <strong>Listing Published Successfully!</strong>
                            <span>Reach potential clients now by sharing this property across your channels.</span>
                        </div>
                    </div>

                    <div class="share-modal-body">
                        <!-- Property Preview Card -->
                        <div class="share-modal-preview">
                            <img id="share-modal-img" src="" alt="Property Thumbnail" class="share-modal-thumb" style="pointer-events: none; -webkit-user-drag: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;">
                            <div class="share-modal-preview-info">
                                <div class="share-modal-preview-header">
                                    <span id="share-modal-intent" class="share-badge-intent">FOR SALE</span>
                                    <span id="share-modal-price" class="share-preview-price">RM 0</span>
                                </div>
                                <h4 id="share-modal-title-text" class="share-preview-title">Property Title</h4>
                                <div id="share-modal-location" class="share-preview-loc"><i class="fa-solid fa-location-dot"></i> <span>Location</span></div>
                                <div id="share-modal-specs" class="share-preview-specs">Built-up: ...</div>
                            </div>
                        </div>

                        <!-- 1-Click Property Marketing Brochure / Flyer Banner -->
                        <div class="share-brochure-feature-box">
                            <div class="share-brochure-feature-header">
                                <div class="share-brochure-title-group">
                                    <span class="share-brochure-badge"><i class="fa-solid fa-sparkles"></i> 1-Click Flyer</span>
                                    <h4 class="share-brochure-heading"><i class="fa-solid fa-file-pdf" style="color: #ea580c;"></i> Property Marketing Brochure</h4>
                                    <p class="share-brochure-desc">Replicates high-impact industrial brochure with full specs, 3-photo strip &amp; agent contact details — ready to download, print, or share.</p>
                                </div>
                            </div>
                            <div class="share-brochure-actions">
                                <button type="button" class="btn btn-outline share-brochure-action-btn" id="share-btn-view-brochure" title="Preview interactive brochure">
                                    <i class="fa-solid fa-eye"></i> <span>Preview Flyer</span>
                                </button>
                                <button type="button" class="btn btn-primary share-brochure-action-btn btn-brochure-dl" id="share-btn-download-brochure" title="Download High-Resolution Image (PNG)">
                                    <i class="fa-solid fa-download"></i> <span>Download Image (HD)</span>
                                </button>
                                <button type="button" class="btn btn-outline share-brochure-action-btn" id="share-btn-print-brochure" title="Print or Save as A4 PDF">
                                    <i class="fa-solid fa-print"></i> <span>Print / PDF</span>
                                </button>
                            </div>
                        </div>

                        <!-- 1-Click Platform Selection Grid -->
                        <div class="share-platforms-section">
                            <label class="share-section-label">Select Platform to Share:</label>
                            <div class="share-platform-grid">
                                <!-- Facebook -->
                                <button type="button" class="share-platform-btn platform-fb" id="share-btn-facebook" title="Share to Facebook Feed / Groups">
                                    <div class="platform-icon"><i class="fa-brands fa-facebook-f"></i></div>
                                    <div class="platform-text">
                                        <strong>Facebook</strong>
                                        <span>Direct Post</span>
                                    </div>
                                </button>

                                <!-- WhatsApp -->
                                <button type="button" class="share-platform-btn platform-wa" id="share-btn-whatsapp" title="Share pre-formatted message via WhatsApp">
                                    <div class="platform-icon"><i class="fa-brands fa-whatsapp"></i></div>
                                    <div class="platform-text">
                                        <strong>WhatsApp</strong>
                                        <span>Send Specs</span>
                                    </div>
                                </button>

                                <!-- LinkedIn -->
                                <button type="button" class="share-platform-btn platform-li" id="share-btn-linkedin" title="Share to LinkedIn B2B Network">
                                    <div class="platform-icon"><i class="fa-brands fa-linkedin-in"></i></div>
                                    <div class="platform-text">
                                        <strong>LinkedIn</strong>
                                        <span>B2B Post</span>
                                    </div>
                                </button>

                                <!-- Instagram -->
                                <button type="button" class="share-platform-btn platform-ig" id="share-btn-instagram" title="Copy Instagram Caption &amp; Auto-Download Photo">
                                    <div class="platform-icon"><i class="fa-brands fa-instagram"></i></div>
                                    <div class="platform-text">
                                        <strong>Instagram</strong>
                                        <span>Caption &amp; Photo</span>
                                    </div>
                                </button>

                                <!-- TikTok -->
                                <button type="button" class="share-platform-btn platform-tt" id="share-btn-tiktok" title="Copy TikTok Description &amp; Auto-Download Photo">
                                    <div class="platform-icon"><i class="fa-brands fa-tiktok"></i></div>
                                    <div class="platform-text">
                                        <strong>TikTok</strong>
                                        <span>Script &amp; Photo</span>
                                    </div>
                                </button>

                                <!-- X / Twitter -->
                                <button type="button" class="share-platform-btn platform-x" id="share-btn-x" title="Tweet listing on X">
                                    <div class="platform-icon"><i class="fa-brands fa-x-twitter"></i></div>
                                    <div class="platform-text">
                                        <strong>X / Twitter</strong>
                                        <span>Tweet Listing</span>
                                    </div>
                                </button>

                                <!-- Property Brochure / Flyer -->
                                <button type="button" class="share-platform-btn platform-brochure" id="share-btn-brochure-grid" title="Generate &amp; Download Property E-Brochure (Flyer / PDF)">
                                    <div class="platform-icon"><i class="fa-solid fa-file-pdf"></i></div>
                                    <div class="platform-text">
                                        <strong>E-Brochure</strong>
                                        <span>Flyer &amp; PDF</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Direct Link Bar -->
                        <div>
                            <label class="share-section-label" style="margin-bottom: 0.4rem;">Direct Listing URL:</label>
                            <div class="share-link-box">
                                <div class="share-link-input-wrap">
                                    <i class="fa-solid fa-link"></i>
                                    <input type="text" id="share-modal-url" readonly value="">
                                </div>
                                <button type="button" class="btn btn-primary share-copy-link-btn" id="share-btn-copylink">
                                    <i class="fa-regular fa-copy"></i> <span>Copy Link</span>
                                </button>
                            </div>
                        </div>

                        <!-- Google Earth & Map URL Bar -->
                        <div style="margin-top: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 4px;">
                                <label class="share-section-label" style="margin-bottom: 0;"><i class="fa-solid fa-earth-americas" style="color: #059669; margin-right: 4px;"></i> Google Earth / Map URL:</label>
                                <span id="share-modal-road-badge" style="font-size: 0.75rem; color: #059669; font-weight: 600; background: #ecfdf5; padding: 2px 8px; border-radius: 6px;">Based on road &amp; park</span>
                            </div>
                            <div class="share-link-box">
                                <div class="share-link-input-wrap">
                                    <i class="fa-solid fa-map-location-dot" style="color: #059669;"></i>
                                    <input type="text" id="share-modal-map-url" readonly value="">
                                </div>
                                <button type="button" class="btn btn-outline share-copy-link-btn" id="share-btn-copymap" title="Copy Google Earth/Map link">
                                    <i class="fa-regular fa-copy"></i> <span>Copy Map URL</span>
                                </button>
                                <a href="#" target="_blank" rel="noopener noreferrer" class="btn btn-outline map-open-external-btn" id="share-btn-openearth" title="Open Location in Google Earth / Maps" style="padding: 0.45rem 0.85rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; border-color: #059669; color: #059669;">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Open</span>
                                </a>
                            </div>
                        </div>

                        <!-- Social Caption & Hashtags -->
                        <div class="share-caption-section">
                            <div class="share-caption-header">
                                <label class="share-section-label" style="margin-bottom: 0;">Social Caption &amp; Hashtags:</label>
                                <div class="share-caption-actions">
                                    <button type="button" class="share-action-link" id="share-caption-download-photo" title="Download property photo for social post" style="display: none;">
                                        <i class="fa-solid fa-download"></i> Save Photo
                                    </button>
                                    <button type="button" class="share-action-link" id="share-caption-copy-btn" title="Copy full caption to clipboard">
                                        <i class="fa-regular fa-copy"></i> Copy Text
                                    </button>
                                </div>
                            </div>
                            <textarea id="share-modal-caption" class="share-caption-textarea" rows="4" readonly></textarea>
                            <div id="share-status-toast" class="share-status-toast" style="display: none;"></div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="share-modal-footer">
                        <button type="button" class="btn btn-outline share-native-btn" id="share-btn-native" style="display: none;">
                            <i class="fa-solid fa-arrow-up-from-bracket" style="margin-right: 5px;"></i> More Apps (Share Sheet)
                        </button>
                        <button type="button" class="btn btn-secondary" id="share-modal-dismiss-btn" style="margin-left: auto;">Done</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        bindShareModalEvents();
    }

    // Helper: Show brief visual feedback toast inside modal
    function showShareToast(message, iconClass = 'fa-solid fa-circle-check') {
        const toast = document.getElementById('share-status-toast');
        if (!toast) return;
        toast.innerHTML = `<i class="${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
        toast.style.display = 'flex';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
    }

    // Helper: Download property image for social sharing
    async function downloadPropertyPhoto(imgUrl, filename) {
        if (!imgUrl) return;
        try {
            const res = await fetch(imgUrl);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.download = filename || 'property-photo.jpg';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                link.remove();
            }, 500);
        } catch (e) {
            const link = document.createElement('a');
            link.target = '_blank';
            link.href = imgUrl;
            link.download = filename || 'property-photo.jpg';
            link.click();
        }
    }

    // Bind modal actions
    function bindShareModalEvents() {
        const modal = document.getElementById('property-share-modal');
        if (!modal || modal.dataset.bound) return;
        modal.dataset.bound = 'true';

        const closeModal = () => closePropertyShareModal();
        document.getElementById('share-modal-close').addEventListener('click', closeModal);
        document.getElementById('share-modal-backdrop').addEventListener('click', closeModal);
        document.getElementById('share-modal-dismiss-btn').addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Copy Direct Link
        const copyLinkBtn = document.getElementById('share-btn-copylink');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                if (!currentShareUrl) return;
                navigator.clipboard.writeText(currentShareUrl).then(() => {
                    const labelSpan = copyLinkBtn.querySelector('span');
                    const origText = labelSpan ? labelSpan.textContent : 'Copy Link';
                    if (labelSpan) labelSpan.textContent = 'Copied!';
                    showShareToast('Listing URL copied to clipboard!', 'fa-solid fa-link');
                    setTimeout(() => {
                        if (labelSpan) labelSpan.textContent = origText;
                    }, 2000);
                }).catch(() => {
                    showShareToast('Select the link above to copy.', 'fa-solid fa-triangle-exclamation');
                });
            });
        }

        // Copy Google Earth / Map Link
        const copyMapBtn = document.getElementById('share-btn-copymap');
        if (copyMapBtn) {
            copyMapBtn.addEventListener('click', () => {
                const mapInput = document.getElementById('share-modal-map-url');
                const mapVal = mapInput ? mapInput.value : '';
                if (!mapVal) return;
                navigator.clipboard.writeText(mapVal).then(() => {
                    const labelSpan = copyMapBtn.querySelector('span');
                    const origText = labelSpan ? labelSpan.textContent : 'Copy Map URL';
                    if (labelSpan) labelSpan.textContent = 'Copied!';
                    showShareToast('Google Earth/Map URL copied to clipboard!', 'fa-solid fa-earth-americas');
                    setTimeout(() => {
                        if (labelSpan) labelSpan.textContent = origText;
                    }, 2000);
                }).catch(() => {
                    showShareToast('Select the map URL to copy.', 'fa-solid fa-triangle-exclamation');
                });
            });
        }

        // Copy Full Caption
        const copyCaptionBtn = document.getElementById('share-caption-copy-btn');
        if (copyCaptionBtn) {
            copyCaptionBtn.addEventListener('click', () => {
                const textarea = document.getElementById('share-modal-caption');
                if (!textarea || !textarea.value) return;
                navigator.clipboard.writeText(textarea.value).then(() => {
                    showShareToast('Full caption and hashtags copied to clipboard!', 'fa-regular fa-copy');
                });
            });
        }

        // Save Photo Action (Dashboard only)
        const downloadPhotoBtn = document.getElementById('share-caption-download-photo');
        if (downloadPhotoBtn) {
            downloadPhotoBtn.addEventListener('click', () => {
                if (!currentShareProp || !currentShareAllowPhoto) return;
                const photoSrc = (currentShareProp.images && currentShareProp.images.length > 0)
                    ? currentShareProp.images[0]
                    : (currentShareProp.image || 'assets/images/hero.jpg');
                const safeSlug = (currentShareProp.title || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                downloadPropertyPhoto(photoSrc, `${safeSlug}-property.jpg`);
                showShareToast('Property photo download started!', 'fa-solid fa-download');
            });
        }

        // Facebook 1-Click
        document.getElementById('share-btn-facebook').addEventListener('click', () => {
            if (!currentShareUrl) return;
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`;
            window.open(fbUrl, 'fb_share', 'width=620,height=520,toolbar=0,menubar=0,location=0,status=0');
            showShareToast('Opened Facebook share dialog.', 'fa-brands fa-facebook');
        });

        // WhatsApp 1-Click
        document.getElementById('share-btn-whatsapp').addEventListener('click', () => {
            if (!currentShareProp) return;
            const waCaption = generatePropertyShareCaption(currentShareProp, currentShareUrl, 'whatsapp');
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waCaption)}`;
            window.open(waUrl, '_blank');
            showShareToast('Opened WhatsApp with formatted listing details.', 'fa-brands fa-whatsapp');
        });

        // LinkedIn 1-Click
        document.getElementById('share-btn-linkedin').addEventListener('click', () => {
            if (!currentShareUrl) return;
            const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentShareUrl)}`;
            window.open(liUrl, 'li_share', 'width=620,height=600,toolbar=0,menubar=0,location=0,status=0');
            showShareToast('Opened LinkedIn share dialog.', 'fa-brands fa-linkedin');
        });

        // Instagram 1-Click (Copy Caption + Auto-Download Photo on Dashboard)
        document.getElementById('share-btn-instagram').addEventListener('click', async () => {
            if (!currentShareProp) return;
            const igCaption = generatePropertyShareCaption(currentShareProp, currentShareUrl, 'instagram');
            
            // 1. Copy formatted IG caption & link
            try {
                await navigator.clipboard.writeText(igCaption);
            } catch (err) {}

            // 2. In Dashboard: Auto-download photo for social post
            if (currentShareAllowPhoto) {
                const photoSrc = (currentShareProp.images && currentShareProp.images.length > 0)
                    ? currentShareProp.images[0]
                    : (currentShareProp.image || 'assets/images/hero.jpg');
                const safeSlug = (currentShareProp.title || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                downloadPropertyPhoto(photoSrc, `${safeSlug}-instagram.jpg`);
            }

            // 3. If on mobile, invoke native share sheet so user can pick Instagram
            if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({
                        title: currentShareProp.title,
                        text: igCaption,
                        url: currentShareUrl
                    });
                } catch (e) {}
            }

            if (currentShareAllowPhoto) {
                showShareToast('📸 Instagram caption copied & photo downloaded! Ready to post.', 'fa-brands fa-instagram');
            } else {
                showShareToast('📸 Instagram caption & link copied to clipboard! Paste into Instagram.', 'fa-brands fa-instagram');
            }
        });

        // TikTok 1-Click (Copy Script, Tags + Auto-Download Photo on Dashboard)
        document.getElementById('share-btn-tiktok').addEventListener('click', async () => {
            if (!currentShareProp) return;
            const ttCaption = generatePropertyShareCaption(currentShareProp, currentShareUrl, 'tiktok');

            // 1. Copy TikTok caption & link
            try {
                await navigator.clipboard.writeText(ttCaption);
            } catch (err) {}

            // 2. In Dashboard: Auto-download photo for social post
            if (currentShareAllowPhoto) {
                const photoSrc = (currentShareProp.images && currentShareProp.images.length > 0)
                    ? currentShareProp.images[0]
                    : (currentShareProp.image || 'assets/images/hero.jpg');
                const safeSlug = (currentShareProp.title || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                downloadPropertyPhoto(photoSrc, `${safeSlug}-tiktok.jpg`);
            }

            // 3. Mobile native share if available
            if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
                try {
                    await navigator.share({
                        title: currentShareProp.title,
                        text: ttCaption,
                        url: currentShareUrl
                    });
                } catch (e) {}
            }

            if (currentShareAllowPhoto) {
                showShareToast('🎵 TikTok caption copied & photo downloaded! Ready to post.', 'fa-brands fa-tiktok');
            } else {
                showShareToast('🎵 TikTok caption & link copied to clipboard! Paste into TikTok.', 'fa-brands fa-tiktok');
            }
        });

        // X / Twitter 1-Click
        document.getElementById('share-btn-x').addEventListener('click', () => {
            if (!currentShareProp) return;
            const xCaption = generatePropertyShareCaption(currentShareProp, currentShareUrl, 'twitter');
            const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xCaption)}`;
            window.open(xUrl, 'tw_share', 'width=600,height=450,toolbar=0,menubar=0,location=0,status=0');
            showShareToast('Opened X (Twitter) post dialog.', 'fa-brands fa-x-twitter');
        });

        // Property Brochure / Marketing Flyer Actions
        const viewBrochureBtn = document.getElementById('share-btn-view-brochure');
        if (viewBrochureBtn) {
            viewBrochureBtn.addEventListener('click', () => {
                if (currentShareProp) openPropertyBrochureModal(currentShareProp);
            });
        }

        const dlBrochureBtn = document.getElementById('share-btn-download-brochure');
        if (dlBrochureBtn) {
            dlBrochureBtn.addEventListener('click', () => {
                if (currentShareProp) downloadPropertyBrochure(currentShareProp);
            });
        }

        const printBrochureBtn = document.getElementById('share-btn-print-brochure');
        if (printBrochureBtn) {
            printBrochureBtn.addEventListener('click', () => {
                if (currentShareProp) printPropertyBrochure(currentShareProp);
            });
        }

        const brochureGridBtn = document.getElementById('share-btn-brochure-grid');
        if (brochureGridBtn) {
            brochureGridBtn.addEventListener('click', () => {
                if (currentShareProp) openPropertyBrochureModal(currentShareProp);
            });
        }

        // Native Share Sheet Button (if supported)
        const nativeBtn = document.getElementById('share-btn-native');
        if (nativeBtn) {
            nativeBtn.addEventListener('click', async () => {
                if (!currentShareProp || !navigator.share) return;
                const genCaption = generatePropertyShareCaption(currentShareProp, currentShareUrl, 'general');
                try {
                    await navigator.share({
                        title: currentShareProp.title,
                        text: genCaption,
                        url: currentShareUrl
                    });
                    showShareToast('Shared successfully!', 'fa-solid fa-check');
                } catch (e) {
                    if (e.name !== 'AbortError') {
                        showShareToast('Native share closed.', 'fa-solid fa-info');
                    }
                }
            });
        }
    }

    // Public API: Open Share Modal for a property (accepts object or ID)
    function openPropertyShareModal(propOrId, options = {}) {
        ensurePropertyShareModal();
        const modal = document.getElementById('property-share-modal');
        if (!modal) return;

        let prop = null;
        if (typeof propOrId === 'object' && propOrId !== null) {
            prop = propOrId;
        } else if (propOrId) {
            // Find in window.properties or localStorage
            let allProps = (typeof window.properties !== 'undefined' && Array.isArray(window.properties)) ? window.properties : [];
            if (allProps.length === 0) {
                try {
                    const stored = localStorage.getItem('industria_properties');
                    if (stored) allProps = JSON.parse(stored);
                } catch (e) {}
            }
            prop = allProps.find(p => p && (String(p.id) === String(propOrId) || p.id == propOrId));
        }

        if (!prop) {
            console.warn('openPropertyShareModal: Property not found', propOrId);
            return;
        }

        currentShareProp = prop;
        currentShareUrl = getPropertyShareUrl(prop.id);

        // Determine whether modal is opened within admin Dashboard or public Mainpage
        const isDashboard = (options && options.isDashboard !== undefined)
            ? !!options.isDashboard
            : isDashboardContext();
        currentShareAllowPhoto = isDashboard;

        // Toggle "Save Photo" button (Dashboard only)
        const downloadPhotoBtn = document.getElementById('share-caption-download-photo');
        if (downloadPhotoBtn) {
            downloadPhotoBtn.style.display = isDashboard ? 'inline-flex' : 'none';
        }

        // Toggle Instagram & TikTok subtext (Caption & Photo for Dashboard vs Caption & Link for Mainpage)
        const igBtn = document.getElementById('share-btn-instagram');
        if (igBtn) {
            const igSub = igBtn.querySelector('.platform-text span');
            if (igSub) igSub.textContent = isDashboard ? 'Caption & Photo' : 'Caption & Link';
            igBtn.title = isDashboard
                ? 'Copy Instagram Caption & Auto-Download Photo'
                : 'Copy Instagram Caption & Listing Link';
        }

        const ttBtn = document.getElementById('share-btn-tiktok');
        if (ttBtn) {
            const ttSub = ttBtn.querySelector('.platform-text span');
            if (ttSub) ttSub.textContent = isDashboard ? 'Script & Photo' : 'Script & Link';
            ttBtn.title = isDashboard
                ? 'Copy TikTok Description & Auto-Download Photo'
                : 'Copy TikTok Description & Listing Link';
        }

        // Populate Preview
        const imgEl = document.getElementById('share-modal-img');
        const titleEl = document.getElementById('share-modal-title-text');
        const priceEl = document.getElementById('share-modal-price');
        const intentEl = document.getElementById('share-modal-intent');
        const locEl = document.getElementById('share-modal-location');
        const specsEl = document.getElementById('share-modal-specs');
        const urlInput = document.getElementById('share-modal-url');
        const captionTextarea = document.getElementById('share-modal-caption');
        const newBanner = document.getElementById('share-modal-new-banner');
        const nativeBtn = document.getElementById('share-btn-native');

        const photoSrc = (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || 'assets/images/hero.jpg');
        if (imgEl) imgEl.src = photoSrc;
        if (titleEl) titleEl.textContent = prop.title || 'Industrial Property';
        if (priceEl) priceEl.textContent = prop.price || 'Price on Application';

        const rawIntent = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale')).toUpperCase();
        if (intentEl) {
            intentEl.textContent = rawIntent === 'RENT' ? 'FOR RENT' : 'FOR SALE';
            intentEl.style.backgroundColor = rawIntent === 'RENT' ? '#eab308' : '#0077b6';
        }

        if (locEl) {
            locEl.innerHTML = `<i class="fa-solid fa-location-dot" style="color: var(--primary, #0077b6);"></i> <span>${escapeHtml(prop.location || 'Selangor')}, Selangor ${prop.park ? ' • ' + escapeHtml(prop.park) : ''}</span>`;
        }

        if (specsEl) {
            const specSummary = [];
            if (prop.size && prop.size !== 'N/A') specSummary.push(`Built-up: ${prop.size}`);
            if (prop.landArea && prop.landArea !== 'N/A') specSummary.push(`Land: ${prop.landArea}`);
            if (prop.power && prop.power !== '0') specSummary.push(`Power: ${prop.power}A`);
            specsEl.textContent = specSummary.length > 0 ? specSummary.join(' • ') : (prop.type || 'Industrial Asset');
        }

        if (urlInput) urlInput.value = currentShareUrl;

        // Populate Google Earth / Map Location URL based on road & park
        const mapUrlInput = document.getElementById('share-modal-map-url');
        const mapRoadBadge = document.getElementById('share-modal-road-badge');
        const openEarthBtn = document.getElementById('share-btn-openearth');
        const earthUrl = getGoogleEarthUrl(prop);
        const gmapsUrl = getGoogleMapsUrl(prop);
        const chosenMapUrl = earthUrl || gmapsUrl;

        if (mapUrlInput) mapUrlInput.value = chosenMapUrl;
        if (openEarthBtn) openEarthBtn.href = chosenMapUrl;
        if (mapRoadBadge) {
            if (prop.road && String(prop.road).trim()) {
                mapRoadBadge.textContent = `Road: ${prop.road}`;
            } else if (prop.park && String(prop.park).trim()) {
                mapRoadBadge.textContent = `Park: ${prop.park}`;
            } else {
                mapRoadBadge.textContent = `${prop.location || 'Selangor'}`;
            }
        }

        // Populate Caption (default Instagram / comprehensive format)
        if (captionTextarea) {
            captionTextarea.value = generatePropertyShareCaption(prop, currentShareUrl, 'instagram');
        }

        // Toggle newly created banner
        if (newBanner) {
            newBanner.style.display = options.isNew ? 'flex' : 'none';
        }

        // Toggle native share button if supported
        if (nativeBtn) {
            nativeBtn.style.display = (navigator.share) ? 'inline-flex' : 'none';
        }

        // Reset toast
        const toast = document.getElementById('share-status-toast');
        // Reset scroll position so modal always starts neatly at the top
        const modalBody = modal.querySelector('.share-modal-body');
        if (modalBody) modalBody.scrollTop = 0;

        // Open
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePropertyShareModal() {
        const modal = document.getElementById('property-share-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /* ==========================================================================
       PROPERTY MARKETING BROCHURE / FLYER SYSTEM (TERRA GROUP E-FLYER REPLICATION)
       ========================================================================== */

    let currentBrochureProp = null;

    // Helper: Safely resolve a property object by ID or object
    function resolvePropertyObject(propOrId) {
        if (typeof propOrId === 'object' && propOrId !== null) return propOrId;
        if (!propOrId) return null;
        let allProps = (typeof window.properties !== 'undefined' && Array.isArray(window.properties)) ? window.properties : [];
        if (allProps.length === 0) {
            try {
                const stored = localStorage.getItem('industria_properties');
                if (stored) allProps = JSON.parse(stored);
            } catch (e) {}
        }
        return allProps.find(p => p && (String(p.id) === String(propOrId) || p.id == propOrId)) || null;
    }

    // Helper: Calculate accurate PSF (Price Per Sq Ft) matching real estate brochure standards
    function calculatePropertyPsf(priceStr, sizeStr, landAreaStr, intent) {
        if (!priceStr) return 'Market Rate';
        
        const cleanPrice = String(priceStr).replace(/,/g, '').replace(/[^\d.]/g, '');
        const priceNum = parseFloat(cleanPrice);
        if (isNaN(priceNum) || priceNum <= 0) return 'Market Rate';

        let sqft = 0;
        const testArea = (sizeStr && sizeStr !== 'N/A') ? sizeStr : (landAreaStr || '');
        if (testArea) {
            const cleanArea = String(testArea).toLowerCase().replace(/,/g, '');
            if (cleanArea.includes('acre')) {
                const acreNum = parseFloat(cleanArea.replace(/[^\d.]/g, ''));
                if (!isNaN(acreNum) && acreNum > 0) sqft = acreNum * 43560;
            } else {
                const sqftNum = parseFloat(cleanArea.replace(/[^\d.]/g, ''));
                if (!isNaN(sqftNum) && sqftNum > 0) sqft = sqftNum;
            }
        }

        if (sqft > 0) {
            const psf = (priceNum / sqft).toFixed(2);
            const isRent = String(intent || priceStr).toLowerCase().includes('rent') || String(priceStr).toLowerCase().includes('mo');
            return `RM${psf} psf${isRent ? ' / mo' : ''}`;
        }

        return 'Competitive PSF';
    }

    // Helper: Clean phone number into international WhatsApp format (e.g. 60176008088)
    function getAgentCleanWhatsAppPhone(agent) {
        if (!agent) return '60162577617';
        const raw = agent.whatsapp || agent.phone || '';
        let clean = String(raw).replace(/\D/g, '');
        if (clean.startsWith('0')) {
            clean = '60' + clean.slice(1);
        } else if (clean.startsWith('1')) {
            clean = '60' + clean;
        }
        return clean || '60162577617';
    }

    // Helper: Format agent phone into standard readable Malaysian format (e.g. +6017-600 8088)
    function formatAgentDisplayPhone(rawPhone) {
        if (!rawPhone) return '016-257 7617';
        let clean = String(rawPhone).trim();
        if (/[\s-]/.test(clean) && !clean.startsWith('60')) return clean;
        let digits = clean.replace(/[^\d]/g, '');
        if (digits.startsWith('60')) digits = digits.substring(2);
        if (digits.startsWith('0')) digits = digits.substring(1);
        if (digits.startsWith('11') && digits.length >= 9) {
            return `+6011-${digits.substring(2, 6)} ${digits.substring(6)}`;
        } else if (digits.length >= 8) {
            return `+60${digits.substring(0, 2)}-${digits.substring(2, 5)} ${digits.substring(5)}`;
        }
        return rawPhone;
    }

    // Dynamic loader for html-to-image (primary high-fidelity foreignObject engine)
    function loadHtmlToImage() {
        return new Promise((resolve) => {
            if (window.htmlToImage && typeof window.htmlToImage.toBlob === 'function') {
                return resolve(window.htmlToImage);
            }
            const script = document.createElement('script');
            script.src = 'js/vendor/html-to-image.min.js';
            script.async = true;
            script.onload = () => resolve(window.htmlToImage);
            script.onerror = () => {
                const s2 = document.createElement('script');
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
                s2.async = true;
                s2.onload = () => resolve(window.htmlToImage);
                s2.onerror = () => {
                    const s3 = document.createElement('script');
                    s3.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js';
                    s3.async = true;
                    s3.onload = () => resolve(window.htmlToImage);
                    s3.onerror = () => resolve(null);
                    document.head.appendChild(s3);
                };
                document.head.appendChild(s2);
            };
            document.head.appendChild(script);
        });
    }

    // Dynamic loader for html2canvas
    function loadHtml2Canvas() {
        return new Promise((resolve) => {
            if (typeof window.html2canvas === 'function') {
                return resolve(window.html2canvas);
            }
            const script = document.createElement('script');
            script.src = 'js/vendor/html2canvas.min.js';
            script.async = true;
            script.onload = () => resolve(window.html2canvas);
            script.onerror = () => {
                const s2 = document.createElement('script');
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                s2.async = true;
                s2.onload = () => resolve(window.html2canvas);
                s2.onerror = () => {
                    const s3 = document.createElement('script');
                    s3.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
                    s3.async = true;
                    s3.onload = () => resolve(window.html2canvas);
                    s3.onerror = () => resolve(null);
                    document.head.appendChild(s3);
                };
                document.head.appendChild(s2);
            };
            document.head.appendChild(script);
        });
    }

    // Dynamic loader for jsPDF (A4 Single-Page PDF export engine)
    function loadJsPdf() {
        return new Promise((resolve) => {
            const getPdf = () => (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || null;
            if (getPdf()) return resolve(getPdf());
            const script = document.createElement('script');
            script.src = 'js/vendor/jspdf.umd.min.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => resolve(getPdf());
            script.onerror = () => {
                const s2 = document.createElement('script');
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                s2.async = true;
                s2.crossOrigin = 'anonymous';
                s2.onload = () => resolve(getPdf());
                s2.onerror = () => resolve(null);
                document.head.appendChild(s2);
            };
            document.head.appendChild(script);
        });
    }

    // Dynamic loader for QRCode library (client-side QR canvas generation)
    function loadQRCodeLibrary() {
        return new Promise((resolve) => {
            if (typeof window.QRCode === 'function') {
                return resolve(window.QRCode);
            }
            const script = document.createElement('script');
            script.src = 'js/vendor/qrcode.min.js';
            script.async = true;
            script.onload = () => resolve(window.QRCode);
            script.onerror = () => {
                const s2 = document.createElement('script');
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
                s2.async = true;
                s2.onload = () => resolve(window.QRCode);
                s2.onerror = () => resolve(null);
                document.head.appendChild(s2);
            };
            document.head.appendChild(script);
        });
    }

    // Ensure Brochure Modal DOM structure is injected
    function ensurePropertyBrochureModal() {
        if (document.getElementById('property-brochure-modal')) return;

        const modalHtml = `
            <div id="property-brochure-modal" class="property-brochure-modal" aria-hidden="true" role="dialog" aria-labelledby="brochure-modal-title">
                <div class="brochure-modal-backdrop" id="brochure-modal-backdrop"></div>
                <div class="brochure-modal-dialog">
                    <!-- Top Toolbar -->
                    <div class="brochure-modal-toolbar">
                        <div class="brochure-toolbar-left">
                            <button type="button" class="btn btn-outline brochure-toolbar-back-btn" id="brochure-modal-back-btn" title="Back to Share Options" aria-label="Back">
                                <svg class="brochure-btn-svg" viewBox="0 0 448 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
                                <span class="brochure-back-text">Back</span>
                            </button>
                            <div class="brochure-toolbar-title" id="brochure-modal-title">
                                <svg class="brochure-btn-svg" style="fill: #ea580c;" viewBox="0 0 384 512"><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0v128h128L256 0zM80 224h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h96c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>
                                <span class="brochure-title-full">Property Brochure Preview</span>
                                <span class="brochure-title-short">Brochure</span>
                            </div>
                        </div>
                        <div class="brochure-toolbar-actions">
                            <button type="button" class="btn btn-outline brochure-toolbar-btn brochure-btn-zoom" id="brochure-btn-zoom" title="Toggle Zoom: Fit to Screen / Full Size (100%)" aria-label="Toggle Zoom">
                                <svg class="brochure-btn-svg brochure-zoom-icon" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM184 104c0-13.3 10.7-24 24-24s24 10.7 24 24v80h80c13.3 0 24 10.7 24 24s-10.7 24-24 24H232v80c0 13.3-10.7 24-24 24s-24-10.7-24-24V232H104c-13.3 0-24-10.7-24-24s10.7-24 24-24h80V104z"/></svg>
                                <span class="brochure-zoom-label">100%</span>
                            </button>
                            <button type="button" class="btn btn-primary brochure-toolbar-btn brochure-btn-download" id="brochure-btn-download" title="Download High-Resolution Flyer Image (PNG)" aria-label="Download Image">
                                <svg class="brochure-btn-svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64z"/></svg>
                                <span class="brochure-btn-text">Download (HD)</span>
                            </button>
                            <button type="button" class="btn btn-outline brochure-toolbar-btn brochure-btn-print" id="brochure-btn-print" title="Print or Save as A4 PDF" aria-label="Print or PDF">
                                <svg class="brochure-btn-svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64v96h64V64H384v96h64V64c0-35.3-28.7-64-64-64H128zM64 224c-35.3 0-64 28.7-64 64v128c0 35.3 28.7 64 64 64h32v-80c0-17.7 14.3-32 32-32H384c17.7 0 32 14.3 32 32v80h32c35.3 0 64-28.7 64-64V288c0-35.3-28.7-64-64-64H64zm320 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM384 416H128v96H384V416z"/></svg>
                                <span class="brochure-btn-text">Print / PDF</span>
                            </button>
                            <button type="button" class="btn btn-outline brochure-toolbar-btn btn-wa-share brochure-btn-wa" id="brochure-btn-whatsapp" title="Send WhatsApp to Agent" aria-label="WhatsApp Agent">
                                <svg class="brochure-btn-svg" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                                <span class="brochure-btn-text">WhatsApp Agent</span>
                            </button>
                            <button type="button" class="brochure-modal-close" id="brochure-modal-close" aria-label="Close">&times;</button>
                        </div>
                    </div>

                    <!-- Scrollable Brochure Viewport -->
                    <div class="brochure-modal-viewport" id="brochure-modal-viewport">
                        <div class="brochure-sheet-wrapper" id="brochure-sheet-wrapper">
                            <div class="brochure-sheet" id="brochure-sheet">
                                <!-- Populated dynamically by renderBrochureContent(prop) -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        bindPropertyBrochureModalEvents();
    }

    // Bind events for brochure modal
    function bindPropertyBrochureModalEvents() {
        const modal = document.getElementById('property-brochure-modal');
        if (!modal || modal.dataset.bound) return;
        modal.dataset.bound = 'true';

        const closeModal = () => closePropertyBrochureModal();
        const closeBtn = document.getElementById('brochure-modal-close');
        const backdrop = document.getElementById('brochure-modal-backdrop');
        const backBtn = document.getElementById('brochure-modal-back-btn');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                closeModal();
                if (currentBrochureProp) {
                    openPropertyShareModal(currentBrochureProp);
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Download HD Image action
        const dlBtn = document.getElementById('brochure-btn-download');
        if (dlBtn) {
            dlBtn.addEventListener('click', () => {
                if (currentBrochureProp) downloadPropertyBrochure(currentBrochureProp);
            });
        }

        // Print / PDF action
        const printBtn = document.getElementById('brochure-btn-print');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                if (currentBrochureProp) printPropertyBrochure(currentBrochureProp);
            });
        }

        // WhatsApp Share directly to respective agent
        const waBtn = document.getElementById('brochure-btn-whatsapp');
        if (waBtn) {
            waBtn.addEventListener('click', () => {
                if (!currentBrochureProp) return;
                const agent = resolveAgentForProp(currentBrochureProp);
                const cleanPhone = getAgentCleanWhatsAppPhone(agent);
                const agentName = agent ? agent.name : 'Industrial Specialist';
                const propTitle = currentBrochureProp.title || 'Industrial Property';
                const propPrice = currentBrochureProp.price || 'P.O.A.';
                const propLoc = currentBrochureProp.location || 'Selangor';
                const publicUrl = getPropertyPublicUrl(currentBrochureProp.id);

                const inquiryMsg = `Hi ${agentName}, I am inquiring about the property brochure for *${propTitle}* (${propPrice}) in ${propLoc}.\n\nListing details: ${publicUrl}\n\nPlease share more details and viewing appointment. Thank you!`;

                const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(inquiryMsg)}`;
                window.open(directWaUrl, '_blank');
            });
        }

        // Toggle Zoom mode (Fit Screen / 100% Full Resolution)
        const zoomBtn = document.getElementById('brochure-btn-zoom');
        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => {
                updateBrochurePreviewScale(!brochureZoom100);
            });
        }

        // Auto-recalculate scaling on device orientation change or window resize
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const bModal = document.getElementById('property-brochure-modal');
                if (bModal && bModal.classList.contains('active')) {
                    updateBrochurePreviewScale();
                }
            }, 100);
        });
    }

    // Helper: Resolve active color theme from Dashboard > Settings (Suggested Color Themes / Custom Branding)
    function getActiveBrochureTheme() {
        let branding = null;
        try {
            const bStr = localStorage.getItem('industria_branding_settings');
            if (bStr) branding = JSON.parse(bStr);
        } catch (e) {}

        if (!branding) {
            try {
                const sStr = localStorage.getItem('industria_settings');
                if (sStr) {
                    const s = JSON.parse(sStr);
                    if (s && s.branding) branding = s.branding;
                }
            } catch (e) {}
        }

        // Preset palette mapping from Dashboard > Settings > Suggested Website Color Themes
        const themePresets = {
            blue: { primary: '#0077b6', primaryDark: '#023e8a', accent: '#e0f2fe' },
            emerald: { primary: '#059669', primaryDark: '#064e3b', accent: '#dcfce7' },
            crimson: { primary: '#dc2626', primaryDark: '#7f1d1d', accent: '#fee2e2' },
            indigo: { primary: '#7c3aed', primaryDark: '#4c1d95', accent: '#f3e8ff' },
            amber: { primary: '#d97706', primaryDark: '#78350f', accent: '#fef3c7' },
            darkluxe: { primary: '#2563eb', primaryDark: '#0f172a', accent: '#e2e8f0' }
        };

        let rootPrimary = '';
        let rootDark = '';
        let rootAccent = '';
        try {
            const style = getComputedStyle(document.documentElement);
            rootPrimary = (style.getPropertyValue('--primary') || '').trim();
            rootDark = (style.getPropertyValue('--primary-dark') || '').trim();
            rootAccent = (style.getPropertyValue('--accent') || '').trim();
        } catch (e) {}

        const presetKey = (branding && branding.preset) ? branding.preset : 'emerald';
        const presetObj = themePresets[presetKey] || themePresets.emerald;

        const primary = (branding && branding.primaryColor) || (rootPrimary && rootPrimary.startsWith('#') ? rootPrimary : '') || presetObj.primary;
        const primaryDark = (branding && branding.primaryDarkColor) || (rootDark && rootDark.startsWith('#') ? rootDark : '') || presetObj.primaryDark;
        const accent = (branding && branding.accentColor) || (rootAccent && rootAccent.startsWith('#') ? rootAccent : '') || presetObj.accent;
        const companyName = (branding && (branding.companyName || branding.brandName)) || 'MyFactorySpace';
        const logoUrl = (branding && (branding.logoUrl || branding.companyLogo)) || '';

        function lightenHex(hex, percent = 30) {
            try {
                let clean = String(hex).replace('#', '').trim();
                if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
                if (clean.length !== 6) return hex;
                let num = parseInt(clean, 16);
                let r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * (percent / 100))));
                let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100))));
                let b = Math.min(255, Math.max(0, (num & 0x0000FF) + Math.round(255 * (percent / 100))));
                return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
            } catch (e) {
                return hex;
            }
        }

        function hexToRgbaStr(hex, alpha = 0.35) {
            try {
                let clean = String(hex).replace('#', '').trim();
                if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
                if (clean.length !== 6) return `rgba(5, 150, 105, ${alpha})`;
                let num = parseInt(clean, 16);
                let r = (num >> 16);
                let g = ((num >> 8) & 0x00FF);
                let b = (num & 0x0000FF);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            } catch (e) {
                return `rgba(5, 150, 105, ${alpha})`;
            }
        }

        return {
            primary,
            primaryDark,
            primaryLight: lightenHex(primary, 32),
            accent,
            borderLight: hexToRgbaStr(primary, 0.2),
            shadowRgba: hexToRgbaStr(primary, 0.35),
            companyName,
            logoUrl
        };
    }
    window.getActiveBrochureTheme = getActiveBrochureTheme;

    // High-Definition Vector SVG Icon Registry for Brochure Export
    // (Bypasses cross-origin webfont CORS restrictions, eliminating square tofu blocks permanently)
    const BROCHURE_SVG_ICONS = {
        'location-dot': '<svg class="brochure-svg" viewBox="0 0 384 512" fill="currentColor"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>',
        'sparkles': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M327.5 85.2c-4.5 1.7-7.5 6-7.5 10.8s3 9.1 7.5 10.8L384 128l21.2 56.5c1.7 4.5 6 7.5 10.8 7.5s9.1-3 10.8-7.5L448 128l56.5-21.2c4.5-1.7 7.5-6 7.5-10.8s-3-9.1-7.5-10.8L448 64l-21.2-56.5C425.1 3 420.8 0 416 0s-9.1 3-10.8 7.5L384 64 327.5 85.2zM288 352a144 144 0 1 0 -288 0 144 144 0 1 0 288 0zm-144-80c8.8 0 16 7.2 16 16v48h48c8.8 0 16 7.2 16 16s-7.2 16-16 16h-48v48c0 8.8-7.2 16-16 16s-16-7.2-16-16v-48h-48c-8.8 0-16-7.2-16-16s7.2-16 16-16h48v-48c0-8.8 7.2-16 16-16z"/></svg>',
        'square-full': '<svg class="brochure-svg" viewBox="0 0 448 512" fill="currentColor"><rect x="32" y="64" width="384" height="384" rx="28" fill="none" stroke="currentColor" stroke-width="48"/></svg>',
        'city': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M48 64C21.5 64 0 85.5 0 112V448c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32V208c0-26.5-21.5-48-48-48H352V112c0-26.5-21.5-48-48-48H48zM96 144h32v32H96V144zm0 64h32v32H96V208zm0 64h32v32H96V272zm0 64h32v32H96V336zm80-192h32v32H176V144zm0 64h32v32H176V208zm0 64h32v32H176V272zm0 64h32v32H176V336zm80-192h32v32H256V144zm0 64h32v32H256V208zm0 64h32v32H256V272zm0 64h32v32H256V336zm144 0h32v32H400V336zm0-64h32v32H400V272zm0-64h32v32H400V208z"/></svg>',
        'warehouse': '<svg class="brochure-svg" viewBox="0 0 640 512" fill="currentColor"><path d="M32 32c17.7 0 32 14.3 32 32V96h512V64c0-17.7 14.3-32 32-32s32 14.3 32 32V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V416H64v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 46.3 14.3 32 32 32zm96 320V160c0-17.7 14.3-32 32-32h320c17.7 0 32 14.3 32 32V352H128zm64-160v128h192V192H192z"/></svg>',
        'building-user': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M64 48C28.7 48 0 76.7 0 112V432c0 26.5 21.5 48 48 48H288c17.7 0 32-14.3 32-32V352h64V448c0 17.7 14.3 32 32 32s32-14.3 32-32V240c0-26.5-21.5-48-48-48H320V112c0-35.3-28.7-64-64-64H64zM96 128h32v32H96V128zm0 64h32v32H96V192zm0 64h32v32H96V256zm80-128h32v32H176V128zm0 64h32v32H176V192zm0 64h32v32H176V256zM384 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm32 32h-64c-26.5 0-48 21.5-48 48v8h160v-8c0-26.5-21.5-48-48-48z"/></svg>',
        'file-contract': '<svg class="brochure-svg" viewBox="0 0 384 512" fill="currentColor"><path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0v128h128L256 0zM80 224h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h160c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h96c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg>',
        'industry': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M32 32c17.7 0 32 14.3 32 32V256l160-80v80l160-80V448H32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V480c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32V160c0-14.2-9.4-26.6-23.2-30.5s-28.5 2.1-36.8 14.5L320 208V160c0-14.2-9.4-26.6-23.2-30.5s-28.5 2.1-36.8 14.5L128 208V64c0-17.7-14.3-32-32-32H32z"/></svg>',
        'list-check': '<svg class="brochure-svg" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M152 64H440c13.3 0 24 10.7 24 24s-10.7 24-24 24H152c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0 160H440c13.3 0 24 10.7 24 24s-10.7 24-24 24H152c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0 160H440c13.3 0 24 10.7 24 24s-10.7 24-24 24H152c-13.3 0-24-10.7-24-24s10.7-24 24-24zM48 64c26.5 0 48 21.5 48 48s-21.5 48-48 48S0 138.5 0 112s21.5-48 48-48zm0 160c26.5 0 48 21.5 48 48s-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48zm0 160c26.5 0 48 21.5 48 48s-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48z"/></svg>',
        'circle-check': '<svg class="brochure-svg" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>',
        'bullseye': '<svg class="brochure-svg" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" fill="currentColor"><circle cx="256" cy="256" r="216" fill="none" stroke="currentColor" stroke-width="48"/><circle cx="256" cy="256" r="128" fill="none" stroke="currentColor" stroke-width="40"/><circle cx="256" cy="256" r="48"/></svg>',
        'gear': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6 4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2 5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8 8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>',
        'cubes': '<svg class="brochure-svg" viewBox="0 0 576 512" fill="currentColor"><path d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.9 32 137.4 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM288 160a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM32 233.4V384c0 14.3 9.5 26.9 23.3 30.8l208 58.7c16 4.5 33.3-1.6 42.7-15.1l7-10.1c-15.2-12.7-27.4-28.5-35.7-46.4H192c-17.7 0-32-14.3-32-32s14.3-32 32-32h66.7c-.5-5.3-.7-10.6-.7-16s.2-10.7 .7-16H160c-17.7 0-32-14.3-32-32s14.3-32 32-32h82.7c8.3-17.9 20.5-33.7 35.7-46.4l-7-10.1c-9.4-13.5-26.7-19.6-42.7-15.1L55.3 202.6C41.5 206.5 32 219.1 32 233.4zM544 233.4c0-14.3-9.5-26.9-23.3-30.8L347.4 149.8c-16-4.5-33.3 1.6-42.7 15.1l-7 10.1c15.2 12.7 27.4 28.5 35.7 46.4H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H349.3c.5 5.3 .7 10.6 .7 16s-.2 10.7-.7 16H384c17.7 0 32 14.3 32 32s-14.3 32-32 32H333.3c-8.3 17.9-20.5 33.7-35.7 46.4l7 10.1c9.4 13.5 26.7 19.6 42.7 15.1l173.3-48.9c13.8-3.9 23.3-16.5 23.3-30.8V233.4z"/></svg>',
        'handshake': '<svg class="brochure-svg" viewBox="0 0 640 512" fill="currentColor"><path d="M323.4 85.2l-96.8 78.4c-16.1 13-19.2 36.4-7 53.1 12.9 17.8 38 21.8 55.8 8.9l69.1-50.1c6.5-4.7 15.5-3.9 21.1 1.9l9.3 9.7c5.8 6.1 5.3 15.9-1.1 21.3l-83 70.3c-41 34.8-102.3 30.6-138.4-9.5L25.3 125.6c-33.7-37.4-33.7-93.7 0-131.1C59-19 114.9-19 148.6 14.6l74.9 83.1 99.9-12.5zM316.6 426.8l96.8-78.4c16.1-13 19.2-36.4 7-53.1-12.9-17.8-38-21.8-55.8-8.9l-69.1 50.1c-6.5 4.7-15.5 3.9-21.1-1.9l-9.3-9.7c-5.8-6.1-5.3-15.9 1.1-21.3l83-70.3c41-34.8 102.3-30.6 138.4 9.5l127.1 141.7c33.7 37.4 33.7 93.7 0 131.1C614.7 531 558.8 531 525.1 497.4l-74.9-83.1-99.9 12.5z"/></svg>',
        'truck-fast': '<svg class="brochure-svg" viewBox="0 0 640 512" fill="currentColor"><path d="M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H112C85.5 0 64 21.5 64 48v48H16c-8.8 0-16 7.2-16 16s7.2 16 16 16h48v64H32c-8.8 0-16 7.2-16 16s7.2 16 16 16h48v64H16c-8.8 0-16 7.2-16 16s7.2 16 16 16h48v64c0 26.5 21.5 48 48 48h24c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-64c0-17.7-14.3-32-32-32zM216 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm304 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zM464 144l96 96H464V144z"/></svg>',
        'chart-line': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V448c0 17.7 14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/></svg>',
        'whatsapp': '<svg class="brochure-svg" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>',
        'globe': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.7-29.8-117.4-55.3-151.6c78.3 20.7 142 75.8 172 151.6zm-149.1 0H167.7c11.6-73.4 38.3-128 88.3-128s76.7 54.6 88.3 128zM135.3 160H16.7c30-75.8 93.7-130.9 172-151.6c-25.5 34.2-45.3 87.9-55.4 151.6zM131.2 256c0 22 1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64h126.3c-2.1 20.6-3.2 42-3.2 64zm4.1 96H16.7c30 75.8 93.7 130.9 172 151.6c-25.5-34.2-45.3-87.9-55.4-151.6zm35.4 0h170.6c-11.6 73.4-38.3 128-88.3 128s-76.7-54.6-88.3-128zm190.6 0H495.3c-30 75.8-93.7 130.9-172 151.6c25.5-34.2 45.3-87.9 55.4-151.6z"/></svg>',
        'shield-halved': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zM256 66.8v381.1c121.7-58.4 157.9-189.6 159.9-270.8L256 94.7V66.8z"/></svg>',
        'bolt': '<svg class="brochure-svg" viewBox="0 0 448 512" fill="currentColor"><path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288h111.5L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7H272.5L349.4 44.6z"/></svg>',
        'arrows-up-to-line': '<svg class="brochure-svg" viewBox="0 0 448 512" fill="currentColor"><path d="M32 32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM246.6 153.4c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 253.3V448c0 17.7 14.3 32 32 32s32-14.3 32-32V253.3l41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96z"/></svg>',
        'weight-hanging': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M224 96a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm122.5 32c3.5-10 5.5-20.8 5.5-32c0-53-43-96-96-96s-96 43-96 96c0 11.2 1.9 22 5.5 32H120c-22 0-41.2 15-46.6 36.4l-72 288c-3.6 14.3-.4 29.5 8.7 41.2S33.2 512 48 512H464c14.8 0 28.7-6.8 37.8-18.5s12.3-26.8 8.7-41.2l-72-288C433.2 143 414 128 392 128H346.5z"/></svg>',
        'elevator': '<svg class="brochure-svg" viewBox="0 0 512 512" fill="currentColor"><path d="M132.7 4.7c12.5-6.2 27.5-6.2 40 0l64 32c16.5 8.2 26.6 25.1 26.6 43.3V112H96V80c0-18.2 10.1-35.1 26.6-43.3l10.1-32zM352 48V160H464L352 48zM64 160C28.7 160 0 188.7 0 224V448c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V224c0-35.3-28.7-64-64-64H64zm160 96l56 72H168l56-72zm0 160l-56-72H280l-56 72z"/></svg>'
    };

    function cleanBrochureField(val) {
        if (val === undefined || val === null) return '';
        const s = String(val).trim();
        if (!s || s === '0' || /^n\/?a$/i.test(s) || /^none$/i.test(s) || s === '-') return '';
        return s;
    }

    function formatBrochureHeight(val) {
        const s = cleanBrochureField(val);
        if (!s) return '';
        return /\b(ft|feet|m)\b/i.test(s) ? s : `${s} ft`;
    }

    /**
     * Derives the 6 brochure specification boxes and Key Features checklist
     * directly from Dashboard > Properties > Manage Properties > Property Listing fields.
     */
    function deriveBrochureListingDetails(prop, rawIntent) {
        const landAreaVal = cleanBrochureField(prop.landArea) || 'N/A';
        const builtUpVal = cleanBrochureField(prop.builtUp) || cleanBrochureField(prop.size) || 'N/A';
        const tenureVal = cleanBrochureField(prop.tenure) || 'Freehold';
        const propertyTypeVal = cleanBrochureField(prop.type) || 'Detached Factory';

        const rawPower = cleanBrochureField(prop.power);
        let powerDisplay = '';
        if (rawPower) {
            const cleanedPower = rawPower.replace(/\s*amps?$/i, '').trim();
            if (cleanedPower && cleanedPower !== '0') {
                powerDisplay = `${cleanedPower} Amp`;
            }
        }

        const clearH = cleanBrochureField(prop.ceilingClear) || cleanBrochureField(prop.ceilingHeight) || cleanBrochureField(prop.height);
        const eaveH = cleanBrochureField(prop.ceilingEave);
        const peakH = cleanBrochureField(prop.ceilingPeak);

        let ceilingSpec = null;
        if (clearH) {
            ceilingSpec = { icon: 'arrows-up-to-line', label: 'Clear Height', value: formatBrochureHeight(clearH) };
        } else if (eaveH) {
            ceilingSpec = { icon: 'arrows-up-to-line', label: 'Eave Height', value: formatBrochureHeight(eaveH) };
        } else if (peakH) {
            ceilingSpec = { icon: 'arrows-up-to-line', label: 'Peak Height', value: formatBrochureHeight(peakH) };
        }

        const rawFloor = cleanBrochureField(prop.floorLoading) || cleanBrochureField(prop.floorLoad);
        const floorDisplay = rawFloor
            ? (/kn|ton|kg|psf/i.test(rawFloor) ? rawFloor : `${rawFloor} kN/m²`)
            : '';

        const rawBays = cleanBrochureField(prop.loadingBay);
        const bayDisplay = rawBays
            ? (/bay/i.test(rawBays) ? rawBays : `${rawBays} ${Number(rawBays) === 1 ? 'Bay' : 'Bays'}`)
            : '';

        const rawLift = cleanBrochureField(prop.lift);
        const liftDisplay = rawLift
            ? (/unit|lift/i.test(rawLift) ? rawLift : `${rawLift} ${Number(rawLift) === 1 ? 'Unit' : 'Units'}`)
            : '';

        const usageVal = cleanBrochureField(prop.usage);
        const compriseVal = cleanBrochureField(prop.compriseUnits);
        const locationVal = cleanBrochureField(prop.location) || 'Selangor';
        const intentLabelVal = rawIntent === 'RENT' ? 'For Rent' : 'For Sale';

        // Pick top 2 real technical / listing specs from Dashboard instead of estimating Warehouse/Office split
        const extraSpecCandidates = [];
        if (powerDisplay) extraSpecCandidates.push({ icon: 'bolt', label: 'Power Supply', value: powerDisplay });
        if (ceilingSpec) extraSpecCandidates.push(ceilingSpec);
        if (floorDisplay) extraSpecCandidates.push({ icon: 'weight-hanging', label: 'Floor Loading', value: floorDisplay });
        if (bayDisplay) extraSpecCandidates.push({ icon: 'truck-fast', label: 'Loading Bays', value: bayDisplay });
        if (liftDisplay) extraSpecCandidates.push({ icon: 'elevator', label: 'Cargo Lift', value: liftDisplay });
        if (usageVal) extraSpecCandidates.push({ icon: 'gear', label: 'Usage', value: usageVal });
        if (compriseVal) extraSpecCandidates.push({ icon: 'building-user', label: 'Comprises', value: compriseVal });

        if (extraSpecCandidates.length < 2) {
            extraSpecCandidates.push({ icon: 'location-dot', label: 'Location', value: locationVal });
        }
        if (extraSpecCandidates.length < 2) {
            extraSpecCandidates.push({ icon: 'bullseye', label: 'Listing Intent', value: intentLabelVal });
        }

        const specBoxes = [
            { icon: 'square-full', label: 'Land Area', value: landAreaVal },
            { icon: 'city', label: 'Built-Up Area', value: builtUpVal },
            extraSpecCandidates[0],
            extraSpecCandidates[1],
            { icon: 'file-contract', label: 'Tenure', value: tenureVal },
            { icon: 'industry', label: 'Property Type', value: propertyTypeVal }
        ];

        // Key Features Checklist strictly reflecting structured Dashboard listing fields
        const checklist = [];
        if (landAreaVal !== 'N/A') checklist.push(`Land area: ${landAreaVal}`);
        if (builtUpVal !== 'N/A') checklist.push(`Built-up area: ${builtUpVal}`);
        checklist.push(`${propertyTypeVal}`);
        checklist.push(`Tenure: ${tenureVal}`);
        if (usageVal) checklist.push(`Usage: ${usageVal}`);
        if (powerDisplay) checklist.push(`Power supply: ${powerDisplay}`);
        if (clearH) checklist.push(`Clear ceiling height: ${formatBrochureHeight(clearH)}`);
        if (eaveH && eaveH !== clearH) checklist.push(`Eave height: ${formatBrochureHeight(eaveH)}`);
        if (peakH && peakH !== clearH && peakH !== eaveH) checklist.push(`Peak height: ${formatBrochureHeight(peakH)}`);
        if (floorDisplay) checklist.push(`Floor loading: ${floorDisplay}`);
        if (bayDisplay) checklist.push(`Loading bays: ${bayDisplay}`);
        if (liftDisplay) checklist.push(`Cargo lift: ${liftDisplay}`);
        if (compriseVal) checklist.push(`Comprises: ${compriseVal}`);

        const parkVal = cleanBrochureField(prop.park);
        checklist.push(parkVal ? `Park: ${parkVal}` : `Location: ${locationVal}`);

        const statusVal = cleanBrochureField(prop.status);
        if (checklist.length < 10 && statusVal) {
            checklist.push(`Listing status: ${statusVal}`);
        }

        return {
            specBoxes,
            displayedChecks: checklist.slice(0, 10)
        };
    }

    if (typeof window !== 'undefined') {
        window._deriveBrochureListingDetails = deriveBrochureListingDetails;
    }

    function bIcon(name, style = '') {
        const svg = BROCHURE_SVG_ICONS[name] || '';
        if (!style || !svg) return svg;
        return svg.replace('<svg ', `<svg style="${style}" `);
    }

    // Resolves asset URLs strictly to same-origin to eliminate CORS blocking and canvas tainting completely
    function resolveCanonicalAssetUrl(url) {
        if (!url || typeof url !== 'string') return url;
        let clean = url.trim();
        if (!clean || clean.startsWith('data:') || clean.startsWith('blob:')) return clean;

        // If running under file:// or origin is null/empty, keep relative path
        const isFileProtocol = typeof window !== 'undefined' && (!window.location.origin || window.location.origin === 'null' || window.location.protocol.startsWith('file'));

        // If it's a relative path e.g. 'assets/images/...' or '/assets/images/...'
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
            if (isFileProtocol) {
                return clean.replace(/^\.?\//, '');
            }
            clean = '/' + clean.replace(/^\.?\//, '');
        }

        // Always resolve same-origin relative to current window.location.origin
        // This eliminates cross-origin tainting, 308 redirects, and CORS blocks completely!
        if (clean.startsWith('/')) {
            if (typeof window !== 'undefined' && window.location.origin && !isFileProtocol) {
                return window.location.origin + clean;
            }
            return clean.replace(/^\//, '');
        } else if (typeof window !== 'undefined' && window.location.origin && !isFileProtocol && clean.includes('://myfactoryspace.com/')) {
            // Keep on current origin (e.g. www vs apex)
            return clean.replace(/https?:\/\/[^\/]+/, window.location.origin);
        }

        return clean;
    }

    // Render the exact brochure layout matching the Terra Group brochure (Image 1)
    function renderBrochureContent(prop) {
        const sheet = document.getElementById('brochure-sheet');
        if (!sheet || !prop) return;

        // Resolve active theme from Dashboard > Settings
        const theme = getActiveBrochureTheme();

        // Apply dynamic theme custom properties to brochure sheet
        sheet.style.setProperty('--brochure-primary', theme.primary);
        sheet.style.setProperty('--brochure-primary-dark', theme.primaryDark);
        sheet.style.setProperty('--brochure-primary-light', theme.primaryLight);
        sheet.style.setProperty('--brochure-accent', theme.accent);
        sheet.style.setProperty('--brochure-shadow', theme.shadowRgba);

        const rawIntent = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale')).toUpperCase();
        const intentText = rawIntent === 'RENT' ? 'FOR RENT' : 'FOR SALE';
        const priceLabel = rawIntent === 'RENT' ? 'Monthly Rental' : 'Selling Price';
        const priceVal = prop.price || 'Price on Application';
        const psfVal = calculatePropertyPsf(prop.price, prop.size, prop.landArea, rawIntent);

        // Derive Town / Location and Type
        const townName = (prop.location || 'Selangor').toUpperCase();
        let propType = (prop.type || 'DETACHED FACTORY').toUpperCase();
        if (!propType.includes('FACTORY') && !propType.includes('WAREHOUSE') && !propType.includes('LAND') && !propType.includes('SHOPLOT')) {
            propType += ' FACTORY';
        }

        // Full location line
        const locParts = [];
        if (prop.road && String(prop.road).trim()) locParts.push(String(prop.road).trim());
        if (prop.park && String(prop.park).trim()) locParts.push(String(prop.park).trim());
        locParts.push(prop.location || 'Selangor');
        locParts.push('Selangor');
        const locationFull = locParts.join(', ');

        // Images setup: hero + 3-photo strip gallery
        const allImages = [];
        if (Array.isArray(prop.images) && prop.images.length > 0) {
            prop.images.forEach(img => {
                if (img && typeof img === 'string' && img.trim() && !allImages.includes(img.trim())) {
                    allImages.push(img.trim());
                }
            });
        }
        if (prop.image && typeof prop.image === 'string' && prop.image.trim() && !allImages.includes(prop.image.trim())) {
            allImages.unshift(prop.image.trim());
        }
        if (allImages.length === 0) {
            allImages.push('assets/images/warehouse.jpg');
        }

        const totalPhotos = allImages.length;
        const heroPhoto = resolveCanonicalAssetUrl(allImages[0]);

        let stripPhoto1 = '';
        let stripPhoto2 = '';
        let stripPhoto3 = '';
        let isThirdSlotBrandLogo = false;

        if (totalPhotos >= 4) {
            stripPhoto1 = resolveCanonicalAssetUrl(allImages[1]);
            stripPhoto2 = resolveCanonicalAssetUrl(allImages[2]);
            stripPhoto3 = resolveCanonicalAssetUrl(allImages[3]);
        } else if (totalPhotos === 3) {
            stripPhoto1 = resolveCanonicalAssetUrl(allImages[0]);
            stripPhoto2 = resolveCanonicalAssetUrl(allImages[1]);
            stripPhoto3 = resolveCanonicalAssetUrl(allImages[2]);
        } else if (totalPhotos === 2) {
            // Exactly 2 photos: 1st & 2nd show the photos, 3rd slot replaced with company logo
            stripPhoto1 = resolveCanonicalAssetUrl(allImages[0]);
            stripPhoto2 = resolveCanonicalAssetUrl(allImages[1]);
            isThirdSlotBrandLogo = true;
        } else {
            // 1 photo: show photo 1 in hero & slot 1, slot 2 fallback, 3rd slot is company logo
            stripPhoto1 = resolveCanonicalAssetUrl(allImages[0]);
            stripPhoto2 = resolveCanonicalAssetUrl(allImages[0]);
            isThirdSlotBrandLogo = true;
        }

        // Derived specs and Key Features strictly following Dashboard > Properties > Property Listing fields
        const { specBoxes, displayedChecks } = deriveBrochureListingDetails(prop, rawIntent);

        // Assigned Agent
        const agent = resolveAgentForProp(prop);
        const agentName = agent ? agent.name : 'Joanne Cheong';
        const rawAgentPhone = agent ? (agent.phone || agent.whatsapp || '016-257 7617') : '016-257 7617';
        const agentPhone = formatAgentDisplayPhone(rawAgentPhone);
        const agentRen = agent ? (agent.ren || 'REN 27240') : 'REN 27240';
        const cleanWhatsAppPhone = getAgentCleanWhatsAppPhone(agent);

        // Domain & Real Public URL for QR Code & direct agent WhatsApp inquiry
        const publicUrl = getPropertyPublicUrl(prop.id);
        const domainText = window.location.host && !window.location.host.includes('localhost') && !window.location.host.includes('127.0.0.1')
            ? 'www.' + window.location.host.replace(/^www\./, '')
            : 'www.myfactoryspace.com';
        
        // High resolution QR code pointing to real public URL (prefers local QRCode library for 100% CORS-safe canvas export)
        let qrCodeUrl = '';
        if (typeof window.QRCode === 'function') {
            try {
                const qrContainer = document.createElement('div');
                new window.QRCode(qrContainer, {
                    text: publicUrl,
                    width: 150,
                    height: 150,
                    colorDark: '#0f172a',
                    colorLight: '#ffffff',
                    correctLevel: (window.QRCode.CorrectLevel && window.QRCode.CorrectLevel.M !== undefined) ? window.QRCode.CorrectLevel.M : 0
                });
                const qrCanvas = qrContainer.querySelector('canvas');
                if (qrCanvas) {
                    qrCodeUrl = qrCanvas.toDataURL('image/png');
                } else {
                    const qrImg = qrContainer.querySelector('img');
                    if (qrImg && qrImg.src) qrCodeUrl = qrImg.src;
                }
            } catch (e) {
                console.warn('Local QRCode generator warning:', e);
            }
        }
        if (!qrCodeUrl) {
            qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}&margin=2`;
        }

        // Direct WhatsApp Inquiry link for this agent
        const inquiryMsg = `Hi ${agentName}, I am inquiring about the property brochure for *${prop.title || 'Industrial Property'}* (${priceVal}) in ${prop.location || 'Selangor'}.\n\nListing details: ${publicUrl}\n\nPlease share more details and viewing appointment. Thank you!`;
        const agentWaUrl = `https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(inquiryMsg)}`;

        // 1. Header Brand: MyFactorySpace Logo (replaces TERRA GROUP in header)
        const canonicalLogoUrl = resolveCanonicalAssetUrl(theme.logoUrl);
        let logoHtml = '';
        if (canonicalLogoUrl) {
            logoHtml = `<img src="${escapeHtml(canonicalLogoUrl)}" alt="${escapeHtml(theme.companyName || 'MyFactorySpace')} Logo" class="brochure-logo-img" crossorigin="anonymous">`;
        } else {
            logoHtml = `
                <div class="brochure-mfs-logo-box">
                    <div class="brochure-mfs-icon-wrap" style="background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);">
                        ${bIcon('industry')}
                    </div>
                    <div class="brochure-mfs-text-wrap">
                        <div class="brochure-mfs-title">
                            <span style="color: #0f172a; font-weight: 900;">MyFactory</span><span style="color: ${theme.primary}; font-weight: 900;">Space</span>
                        </div>
                        <div class="brochure-mfs-subtitle">INDUSTRIAL REAL ESTATE</div>
                    </div>
                </div>
            `;
        }

        let card3Html = '';
        if (isThirdSlotBrandLogo) {
            let brandLogoContent = '';
            if (canonicalLogoUrl) {
                brandLogoContent = `
                    <img src="${escapeHtml(canonicalLogoUrl)}" alt="${escapeHtml(theme.companyName || 'Company')} Logo" class="brochure-brand-slot-logo" crossorigin="anonymous">
                    <div class="brochure-brand-slot-tagline" style="color: ${theme.primary};">Your Industrial Property Partner</div>
                `;
            } else {
                brandLogoContent = `
                    <div class="brochure-brand-slot-icon" style="background: linear-gradient(135deg, ${theme.primaryDark} 0%, ${theme.primary} 100%);">
                        ${bIcon('industry')}
                    </div>
                    <div class="brochure-brand-slot-title">
                        <span style="color: #0f172a;">MyFactory</span><span style="color: ${theme.primary};">Space</span>
                    </div>
                    <div class="brochure-brand-slot-tagline">Industrial Real Estate</div>
                `;
            }

            card3Html = `
                <div class="brochure-gallery-card brochure-gallery-brand-card" style="background: #ffffff; border: 1.5px solid ${theme.borderLight};">
                    <div class="brochure-brand-slot-wrap">
                        ${brandLogoContent}
                        <div class="brochure-brand-slot-badge" style="background: ${theme.primary}; color: #ffffff;">
                            ${bIcon('shield-halved')} <span>Verified Partner</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            card3Html = `
                <div class="brochure-gallery-card">
                    <img src="${escapeHtml(stripPhoto3)}" alt="Property Photo 3" crossorigin="anonymous">
                </div>
            `;
        }

        sheet.innerHTML = `
            <!-- 1. Header (Logo & Slogan) -->
            <div class="brochure-header">
                <div class="brochure-logo-block">
                    ${logoHtml}
                </div>
                <div class="brochure-tagline-block">
                    <div class="brochure-script-text">Your Industrial Property Partner</div>
                    <svg class="brochure-script-svg-line" width="220" height="4" viewBox="0 0 220 4" style="display: block; margin: 3px 0 4px auto; overflow: visible;">
                        <line x1="0" y1="2" x2="220" y2="2" stroke="${theme.primary}" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                    <div class="brochure-slogan-pills">BUY &bull; SELL &bull; RENT</div>
                </div>
            </div>

            <!-- 2. Hero Section (Angled Dark Title + Large Exterior Photo) -->
            <div class="brochure-hero-section">
                <div class="brochure-hero-left">
                    <div class="brochure-hero-content">
                        <div class="brochure-headline-town">${escapeHtml(townName)}</div>
                        <div class="brochure-headline-type" style="color: ${theme.primaryLight}; text-shadow: 0 2px 10px ${theme.shadowRgba};">${escapeHtml(propType)}</div>
                        <div class="brochure-headline-intent">${escapeHtml(intentText)}</div>
                        <div class="brochure-headline-loc">
                            ${bIcon('location-dot', 'color:' + theme.primaryLight + ';')}
                            <span>${escapeHtml(locationFull)}</span>
                        </div>
                    </div>
                </div>
                <!-- Vector SVG Angle (Positioned precisely at 48% boundary) -->
                <div class="brochure-hero-divider">
                    <svg viewBox="0 0 32 320" preserveAspectRatio="none">
                        <polygon points="0,0 32,0 0,320" fill="#0f172a"/>
                        <line x1="32" y1="0" x2="0" y2="320" stroke="${theme.primary}" stroke-width="3"/>
                    </svg>
                </div>
                <div class="brochure-hero-right">
                    <img src="${escapeHtml(heroPhoto)}" alt="${escapeHtml(prop.title || 'Industrial Property Exterior')}" crossorigin="anonymous">
                </div>
            </div>

            <!-- 3. Angled Vibrant Price Banner (SVG wedge for 100% cross-engine & html2canvas alignment) -->
            <div class="brochure-price-banner-wrap">
                <div class="brochure-price-banner" style="background: ${theme.primary};">
                    <span class="brochure-price-label">${escapeHtml(priceLabel)}</span>
                    <span class="brochure-price-val">${escapeHtml(priceVal)}</span>
                    <span class="brochure-price-psf">${escapeHtml(psfVal)}</span>
                </div>
                <div class="brochure-price-wedge">
                    <svg viewBox="0 0 24 78" preserveAspectRatio="none" style="width: 24px; height: 100%; display: block;">
                        <polygon points="0,0 24,0 0,78" fill="${theme.primary}"/>
                    </svg>
                </div>
            </div>

            <!-- 4. 6-Box Key Specifications Row -->
            <div class="brochure-specs-bar">
                ${specBoxes.map(spec => `
                <div class="brochure-spec-item">
                    <div class="brochure-spec-icon">${bIcon(spec.icon)}</div>
                    <span class="brochure-spec-label">${escapeHtml(spec.label)}</span>
                    <strong class="brochure-spec-val" style="color: ${theme.primaryDark};">${escapeHtml(spec.value)}</strong>
                </div>`).join('')}
            </div>

            <!-- 5. 3-Photo Showcase Gallery Strip -->
            <div class="brochure-gallery-strip">
                <div class="brochure-gallery-card">
                    <img src="${escapeHtml(stripPhoto1)}" alt="Property Photo 1" crossorigin="anonymous">
                </div>
                <div class="brochure-gallery-card">
                    <img src="${escapeHtml(stripPhoto2)}" alt="Property Photo 2" crossorigin="anonymous">
                </div>
                ${card3Html}
            </div>

            <!-- 6. Dual Section: Key Features (Dark) + Suitable For (White) -->
            <div class="brochure-dual-section">
                <!-- Left: Key Features -->
                <div class="brochure-features-card">
                    <div class="brochure-features-header">
                        <span class="brochure-features-badge" style="background: ${theme.primary};">${bIcon('list-check')} <span>KEY FEATURES</span></span>
                    </div>
                    <div class="brochure-checklist-grid">
                        ${displayedChecks.map(item => `
                            <div class="brochure-check-item">
                                ${bIcon('circle-check', 'color:' + theme.primaryLight + ';')}
                                <span>${escapeHtml(item)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Right: Suitable For -->
                <div class="brochure-suitable-card">
                    <div class="brochure-suitable-header">
                        <span class="brochure-suitable-badge" style="background: ${theme.primary};">${bIcon('bullseye')} <span>SUITABLE FOR</span></span>
                    </div>
                    <div class="brochure-suitable-grid">
                        <div class="brochure-suitable-tile">
                            <div class="brochure-suitable-icon" style="color: ${theme.primary};">${bIcon('gear')}</div>
                            <span class="brochure-suitable-text">Manufacturer</span>
                        </div>
                        <div class="brochure-suitable-tile">
                            <div class="brochure-suitable-icon" style="color: ${theme.primary};">${bIcon('warehouse')}</div>
                            <span class="brochure-suitable-text">Warehouse Operation</span>
                        </div>
                        <div class="brochure-suitable-tile">
                            <div class="brochure-suitable-icon" style="color: ${theme.primary};">${bIcon('cubes')}</div>
                            <span class="brochure-suitable-text">Corporate Expansion</span>
                        </div>
                        <div class="brochure-suitable-tile">
                            <div class="brochure-suitable-icon" style="color: ${theme.primary};">${bIcon('handshake')}</div>
                            <span class="brochure-suitable-text">Own Business Use</span>
                        </div>
                        <div class="brochure-suitable-tile">
                            <div class="brochure-suitable-icon" style="color: ${theme.primary};">${bIcon('truck-fast')}</div>
                            <span class="brochure-suitable-text">Trading &amp; Distribution</span>
                        </div>
                        <div class="brochure-suitable-tile">
                            <div class="brochure-suitable-icon" style="color: ${theme.primary};">${bIcon('chart-line')}</div>
                            <span class="brochure-suitable-text">Industrial Investment</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 7. Footer Contact Banner (Clickable WhatsApp to Respective Agent + Agency Branding + Live Scannable QR) -->
            <div class="brochure-footer-banner" style="background: ${theme.primary};">
                <a href="${agentWaUrl}" target="_blank" rel="noopener noreferrer" class="brochure-footer-agent-group" title="Click to WhatsApp ${escapeHtml(agentName)} (${escapeHtml(cleanWhatsAppPhone)})">
                    <div class="brochure-footer-phone-icon">
                        ${bIcon('whatsapp')}
                    </div>
                    <div class="brochure-footer-agent-info">
                        <span class="brochure-footer-agent-sub">For Viewing / WhatsApp Inquiries</span>
                        <strong class="brochure-footer-agent-name">${escapeHtml(agentName)} &nbsp;${escapeHtml(agentPhone)} <span class="brochure-footer-agent-ren">| ${escapeHtml(agentRen)}</span></strong>
                    </div>
                </a>

                <div class="brochure-footer-web-group">
                    <a href="${publicUrl}" target="_blank" rel="noopener noreferrer" class="brochure-footer-domain-wrap" style="color:#ffffff; text-decoration:none;">
                        ${bIcon('globe')}
                        <span>${escapeHtml(domainText)}</span>
                    </a>
                    <a href="${publicUrl}" target="_blank" rel="noopener noreferrer" title="Scan or click to open listing">
                        <img src="${qrCodeUrl}" alt="Listing QR Code" class="brochure-footer-qr" title="Scan to open property listing" crossorigin="anonymous">
                    </a>
                </div>
            </div>

            <!-- 8. Sub-Bottom Agency Compliance Strip -->
            <div class="brochure-sub-bottom-bar" style="background: ${theme.primary}; border-top: 1px solid rgba(255, 255, 255, 0.2);">
                <div class="brochure-sub-bottom-portal">
                    <span>Industrial Specialist Partner &bull; Powered by MyFactorySpace</span>
                </div>
            </div>
        `;
    }

    let brochureZoom100 = false;
    let brochureResizeObserver = null;

    // Adjust mobile scaling & zoom mode for brochure preview
    function updateBrochurePreviewScale(forceZoom100) {
        const modal = document.getElementById('property-brochure-modal');
        if (!modal || !modal.classList.contains('active')) return;

        const sheet = document.getElementById('brochure-sheet');
        const wrapper = document.getElementById('brochure-sheet-wrapper');
        const viewport = document.getElementById('brochure-modal-viewport');
        if (!sheet || !wrapper || !viewport) return;

        if (typeof forceZoom100 === 'boolean') {
            brochureZoom100 = forceZoom100;
        }

        const zoomBtn = document.getElementById('brochure-btn-zoom');
        const zoomIcon = zoomBtn ? zoomBtn.querySelector('i') : null;
        const zoomLabel = zoomBtn ? zoomBtn.querySelector('.brochure-zoom-label') : null;

        // Ensure brochure sheet maintains exactly 800px width and 1131px height (exact A4 ratio) internally
        sheet.style.width = '800px';
        sheet.style.minWidth = '800px';
        sheet.style.maxWidth = '800px';
        sheet.style.height = '1131px';
        sheet.style.minHeight = '1131px';
        sheet.style.maxHeight = '1131px';
        sheet.style.boxSizing = 'border-box';

        // Calculate available viewport width (accounting for comfortable safe padding)
        const viewportWidth = viewport.clientWidth || window.innerWidth;
        const pad = window.innerWidth < 640 ? 16 : 28;
        const availWidth = Math.max(260, viewportWidth - pad);
        const fitScale = Math.min(1, availWidth / 800);

        if (!brochureZoom100 && fitScale < 0.98) {
            // Mobile Fit Mode: scale down cleanly to screen width without clipping or voids
            sheet.style.position = 'relative';
            sheet.style.transform = 'none';
            const naturalHeight = 1131;
            const scaledWidth = Math.round(800 * fitScale);
            const scaledHeight = Math.round(naturalHeight * fitScale);

            wrapper.classList.add('scaled-mode');
            wrapper.style.width = `${scaledWidth}px`;
            wrapper.style.minWidth = `${scaledWidth}px`;
            wrapper.style.maxWidth = `${scaledWidth}px`;
            wrapper.style.height = `${scaledHeight}px`;
            wrapper.style.minHeight = `${scaledHeight}px`;
            wrapper.style.position = 'relative';
            wrapper.style.margin = '0 auto';
            wrapper.style.overflow = 'visible';
            wrapper.style.borderRadius = '12px';

            sheet.style.position = 'absolute';
            sheet.style.top = '0';
            sheet.style.left = '50%';
            sheet.style.transformOrigin = 'top center';
            sheet.style.setProperty('transform', `translateX(-50%) scale(${fitScale})`, 'important');
            sheet.style.zoom = '';

            if (zoomBtn) {
                zoomBtn.classList.remove('active');
                zoomBtn.title = 'Zoom in to 100% full resolution';
                const zoomIcon = zoomBtn.querySelector('.brochure-zoom-icon');
                if (zoomIcon) {
                    zoomIcon.innerHTML = '<path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM184 104c0-13.3 10.7-24 24-24s24 10.7 24 24v80h80c13.3 0 24 10.7 24 24s-10.7 24-24 24H232v80c0 13.3-10.7 24-24 24s-24-10.7-24-24V232H104c-13.3 0-24-10.7-24-24s10.7-24 24-24h80V104z"/>';
                }
                if (zoomLabel) zoomLabel.textContent = '100%';
            }
        } else {
            // Desktop or 100% Zoom mode (full 800px unscaled with pan capability)
            wrapper.classList.remove('scaled-mode');
            wrapper.style.width = '800px';
            wrapper.style.minWidth = '800px';
            wrapper.style.maxWidth = 'none';
            wrapper.style.height = 'auto';
            wrapper.style.minHeight = 'auto';
            wrapper.style.position = 'relative';
            wrapper.style.margin = '0 auto';
            wrapper.style.overflow = 'visible';
            wrapper.style.borderRadius = '12px';

            sheet.style.position = 'relative';
            sheet.style.top = 'auto';
            sheet.style.left = 'auto';
            sheet.style.zoom = '';
            sheet.style.transformOrigin = 'top center';
            sheet.style.setProperty('transform', 'none', 'important');

            if (zoomBtn) {
                if (fitScale < 0.98) {
                    zoomBtn.classList.add('active');
                    zoomBtn.title = 'Fit brochure to screen width';
                    const zoomIcon = zoomBtn.querySelector('.brochure-zoom-icon');
                    if (zoomIcon) {
                        zoomIcon.innerHTML = '<path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM480 192c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H352c-17.7 0-32 14.3-32 32s14.3 32 32 32h128zM352 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H352z"/>';
                    }
                    if (zoomLabel) zoomLabel.textContent = 'Fit';
                } else {
                    zoomBtn.classList.remove('active');
                    zoomBtn.title = 'Full resolution view';
                    const zoomIcon = zoomBtn.querySelector('.brochure-zoom-icon');
                    if (zoomIcon) {
                        zoomIcon.innerHTML = '<path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM184 104c0-13.3 10.7-24 24-24s24 10.7 24 24v80h80c13.3 0 24 10.7 24 24s-10.7 24-24 24H232v80c0 13.3-10.7 24-24 24s-24-10.7-24-24V232H104c-13.3 0-24-10.7-24-24s10.7-24 24-24h80V104z"/>';
                    }
                    if (zoomLabel) zoomLabel.textContent = '100%';
                }
            }
        }
    }

    // Public API: Open Property Brochure Preview Modal
    function openPropertyBrochureModal(propOrId) {
        ensurePropertyBrochureModal();
        try { loadHtmlToImage().catch(() => {}); } catch(e) {}
        try { loadHtml2Canvas().catch(() => {}); } catch(e) {}
        try { loadQRCodeLibrary().catch(() => {}); } catch(e) {}
        const modal = document.getElementById('property-brochure-modal');
        if (!modal) return;

        let prop = resolvePropertyObject(propOrId) || currentShareProp;
        if (!prop) {
            console.warn('openPropertyBrochureModal: Property not found', propOrId);
            return;
        }

        currentBrochureProp = prop;
        renderBrochureContent(prop);

        // Update WhatsApp button in toolbar to reflect agent name & phone
        const agent = resolveAgentForProp(prop);
        const agentName = agent ? agent.name : 'Agent';
        const cleanPhone = getAgentCleanWhatsAppPhone(agent);
        const waBtn = document.getElementById('brochure-btn-whatsapp');
        if (waBtn) {
            waBtn.title = `WhatsApp Agent ${agentName} (+${cleanPhone})`;
            const waLabel = waBtn.querySelector('.brochure-btn-text') || waBtn.querySelector('span');
            if (waLabel) waLabel.textContent = `WhatsApp (${agentName})`;
        }

        const sheet = document.getElementById('brochure-sheet');
        brochureZoom100 = false;

        // Close share modal if active
        closePropertyShareModal();

        modal.classList.add('active');
        document.body.classList.add('brochure-modal-open');
        document.body.style.overflow = 'hidden';

        // Apply responsive scaling immediately & after layout settles
        updateBrochurePreviewScale(false);
        requestAnimationFrame(() => updateBrochurePreviewScale());
        setTimeout(() => updateBrochurePreviewScale(), 80);

        // Automatically observe layout and image reflows via ResizeObserver
        if (sheet && window.ResizeObserver) {
            if (brochureResizeObserver) {
                try { brochureResizeObserver.disconnect(); } catch(e){}
            }
            brochureResizeObserver = new ResizeObserver(() => {
                const bModal = document.getElementById('property-brochure-modal');
                if (bModal && bModal.classList.contains('active')) {
                    updateBrochurePreviewScale();
                }
            });
            brochureResizeObserver.observe(sheet);
        }

        // Recalculate once images finish loading as backup
        if (sheet) {
            const sheetImgs = sheet.querySelectorAll('img');
            sheetImgs.forEach(img => {
                if (!img.complete) {
                    img.addEventListener('load', () => updateBrochurePreviewScale(), { once: true });
                    img.addEventListener('error', () => updateBrochurePreviewScale(), { once: true });
                }
            });
        }
    }

    // Public API: Close Property Brochure Modal
    function closePropertyBrochureModal() {
        if (brochureResizeObserver) {
            try { brochureResizeObserver.disconnect(); } catch(e){}
            brochureResizeObserver = null;
        }
        const modal = document.getElementById('property-brochure-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('brochure-modal-open');
            document.body.style.overflow = '';
        }
    }

    // Converts any image URL (remote or local) to a lossless Base64 Data URI
    // Guarantees zero CORS blocking, zero canvas tainting, and eliminates WebKit SVG foreignObject dropouts on iOS/mobile
    async function convertUrlToDataUri(url) {
        if (!url || typeof url !== 'string' || url.startsWith('data:')) {
            return url;
        }
        const canonicalUrl = resolveCanonicalAssetUrl(url);
        if (!canonicalUrl) return url;

        // Method 1: Fetch as Blob -> FileReader (lossless, preserves exact format & dimensions, 100% CORS-safe)
        try {
            const resp = await fetch(canonicalUrl, { mode: 'cors', credentials: 'omit' });
            if (resp.ok) {
                const blob = await resp.blob();
                if (blob && blob.size > 0) {
                    const dataUri = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(blob);
                    });
                    if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image')) {
                        return dataUri;
                    }
                }
            }
        } catch (fetchErr) {
            // Fetch blocked, proceed to Method 2
        }

        // Method 2: new Image with crossOrigin='anonymous' + HTML5 Canvas
        // STRICT GUARD: Must have naturalWidth > 0 and naturalHeight > 0 to prevent 300x200 blank canvases!
        try {
            const dataUri = await new Promise((resolve) => {
                const tempImg = new Image();
                tempImg.crossOrigin = 'anonymous';
                tempImg.onload = () => {
                    try {
                        const nw = tempImg.naturalWidth;
                        const nh = tempImg.naturalHeight;
                        if (!nw || !nh) {
                            return resolve(canonicalUrl);
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = nw;
                        canvas.height = nh;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(tempImg, 0, 0);
                        const isPng = canonicalUrl.toLowerCase().includes('.png');
                        const b64 = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.95);
                        if (b64 && b64.length > 500) {
                            resolve(b64);
                        } else {
                            resolve(canonicalUrl);
                        }
                    } catch (canvasErr) {
                        resolve(canonicalUrl);
                    }
                };
                tempImg.onerror = () => resolve(canonicalUrl);
                tempImg.src = canonicalUrl;
                setTimeout(() => resolve(canonicalUrl), 3500);
            });
            if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image')) {
                return dataUri;
            }
        } catch (imgErr) {}

        return canonicalUrl;
    }

    // Captures a 1:1 pixel-perfect screenshot directly from the live Property Brochure Preview element (#brochure-sheet) as a high-resolution PNG
    // Supports iOS Safari, Android, and Desktop with 100% photo preservation and verified alignment parity
    async function createBrochureOffscreenCanvas(prop) {
        ensurePropertyBrochureModal();
        renderBrochureContent(prop);

        const modal = document.getElementById('property-brochure-modal');
        const sheet = document.getElementById('brochure-sheet');
        const wrapper = document.getElementById('brochure-sheet-wrapper');
        const viewport = document.getElementById('brochure-modal-viewport') || document.getElementById('brochure-viewport');

        if (!sheet) throw new Error('Brochure sheet element not found');

        // Save current scroll & modal state so we can restore them seamlessly
        const prevViewportScroll = viewport ? viewport.scrollTop : 0;
        const wasModalActive = modal && modal.classList.contains('active');
        const prevModalCss = modal ? modal.style.cssText : '';

        // If modal was not already visible/active, position it offscreen without visibility:hidden so the browser layout engine can measure and paint it
        if (modal && !wasModalActive) {
            modal.style.position = 'fixed';
            modal.style.left = '-99999px';
            modal.style.top = '0';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.display = 'flex';
        }

        // Temporarily reset viewport scroll
        if (viewport) viewport.scrollTop = 0;

        // Platform detection: Mobile Safari and iOS WebKit block raster <img> inside SVG <foreignObject> (WebKit Bug 170049)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 850);
        const isAppleOrMobile = isIOS || isSafari || isMobile;

        const modifiedStyles = [];
        const recordAndSetStyle = (el, propName, val, prio) => {
            if (!el) return;
            modifiedStyles.push({ el, propName, prevVal: el.style.getPropertyValue(propName), prevPrio: el.style.getPropertyPriority(propName) });
            el.style.setProperty(propName, val, prio || '');
        };

        const origImgs = Array.from(sheet.querySelectorAll('img'));
        const origSources = origImgs.map(img => img.src);
        const prevWrapperCss = wrapper ? wrapper.style.cssText : '';
        const prevSheetCss = sheet.style.cssText;
        const prevWrapperClass = wrapper ? wrapper.className : '';

        try {
            // Load html-to-image and html2canvas in parallel
            await Promise.all([
                loadHtmlToImage().catch(() => null),
                loadHtml2Canvas().catch(() => null)
            ]);

            // Ensure web fonts are completely loaded
            if (document.fonts && document.fonts.ready) {
                try { await document.fonts.ready; } catch(e) {}
            }

            // Ensure all images in sheet are loaded and decoded
            await Promise.all(origImgs.map(img => {
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise(res => {
                    img.onload = () => res();
                    img.onerror = () => res();
                    setTimeout(res, 2000);
                });
            }));

            // Convert images in the live sheet to Base64 Data URIs:
            // 1. Direct in-memory Canvas2D extraction (instant, zero network roundtrip, 100% reliable)
            // 2. Fallback to convertUrlToDataUri if canvas extraction is not ready
            await Promise.all(origImgs.map(async img => {
                if (img.src && !img.src.startsWith('data:')) {
                    let dataUri = null;
                    try {
                        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                            const c = document.createElement('canvas');
                            c.width = img.naturalWidth;
                            c.height = img.naturalHeight;
                            const ctx = c.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            const isPng = (img.src || '').toLowerCase().includes('.png') || (img.currentSrc || '').toLowerCase().includes('.png');
                            dataUri = c.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.95);
                        }
                    } catch(e) {}

                    if (!dataUri || !dataUri.startsWith('data:image')) {
                        try {
                            dataUri = await convertUrlToDataUri(img.src);
                        } catch(e) {}
                    }

                    if (dataUri && dataUri.startsWith('data:image')) {
                        img.src = dataUri;
                        if (img.decode) {
                            try { await img.decode(); } catch(e) {}
                        }
                    }
                }
            }));

            // Layout settle tick
            await new Promise(r => setTimeout(r, 120));

            // Unscale wrapper & sheet to exact 800px x 1131px (1:1 A4 proportion)
            if (wrapper) {
                wrapper.classList.remove('scaled-mode');
                wrapper.style.width = '800px';
                wrapper.style.minWidth = '800px';
                wrapper.style.maxWidth = '800px';
                wrapper.style.height = '1131px';
                wrapper.style.position = 'relative';
                wrapper.style.margin = '0';
                wrapper.style.padding = '0';
                wrapper.style.transform = 'none';
            }
            sheet.style.position = 'relative';
            sheet.style.top = '0';
            sheet.style.left = '0';
            sheet.style.width = '800px';
            sheet.style.minWidth = '800px';
            sheet.style.maxWidth = '800px';
            sheet.style.height = '1131px';
            sheet.style.minHeight = '1131px';
            sheet.style.maxHeight = '1131px';
            sheet.style.margin = '0';
            sheet.style.transform = 'none';
            sheet.style.webkitTransform = 'none';
            sheet.style.zoom = '1';

            // Fine-tune styles for zero-clipping and vertical balance across all renderers
            const priceBanner = sheet.querySelector('.brochure-price-banner');
            if (priceBanner) {
                recordAndSetStyle(priceBanner, 'padding', '6px 24px 6px 26px', 'important');
                recordAndSetStyle(priceBanner, 'gap', '0px', 'important');
            }
            const pLabel = sheet.querySelector('.brochure-price-label');
            if (pLabel) {
                recordAndSetStyle(pLabel, 'margin', '0 0 2px 0', 'important');
                recordAndSetStyle(pLabel, 'line-height', '1.15', 'important');
            }
            const pVal = sheet.querySelector('.brochure-price-val');
            if (pVal) {
                recordAndSetStyle(pVal, 'margin', '0 0 2px 0', 'important');
                recordAndSetStyle(pVal, 'line-height', '1.05', 'important');
            }
            const pPsf = sheet.querySelector('.brochure-price-psf');
            if (pPsf) {
                recordAndSetStyle(pPsf, 'margin', '0', 'important');
                recordAndSetStyle(pPsf, 'line-height', '1.15', 'important');
            }

            sheet.querySelectorAll('.brochure-features-badge, .brochure-suitable-badge, .brochure-brand-slot-badge').forEach(badge => {
                recordAndSetStyle(badge, 'display', 'inline-flex', 'important');
                recordAndSetStyle(badge, 'align-items', 'center', 'important');
                recordAndSetStyle(badge, 'height', '26px', 'important');
                recordAndSetStyle(badge, 'min-height', '26px', 'important');
                recordAndSetStyle(badge, 'padding', '0 10px', 'important');
                recordAndSetStyle(badge, 'box-sizing', 'border-box', 'important');
                const span = badge.querySelector('span');
                if (span) {
                    recordAndSetStyle(span, 'line-height', '1.1', 'important');
                    recordAndSetStyle(span, 'margin-top', '-1px', 'important');
                }
                const svg = badge.querySelector('.brochure-svg');
                if (svg) {
                    recordAndSetStyle(svg, 'margin-top', '0px', 'important');
                    recordAndSetStyle(svg, 'margin-right', '6px', 'important');
                }
            });

            sheet.querySelectorAll('.brochure-check-item').forEach(item => {
                recordAndSetStyle(item, 'display', 'flex', 'important');
                recordAndSetStyle(item, 'align-items', 'center', 'important');
                const svg = item.querySelector('.brochure-svg');
                if (svg) {
                    recordAndSetStyle(svg, 'margin-top', '-1px', 'important');
                    recordAndSetStyle(svg, 'margin-right', '7px', 'important');
                    recordAndSetStyle(svg, 'aspect-ratio', '1 / 1', 'important');
                }
                const span = item.querySelector('span');
                if (span) {
                    recordAndSetStyle(span, 'line-height', '1.25', 'important');
                }
            });

            const totalHeight = 1131;
            let pngUrl = '';
            let canvas = null;

            if (isAppleOrMobile) {
                // On Mobile & Apple Safari: html2canvas directly renders via Canvas2D ctx.drawImage(),
                // guaranteeing 100% of property photos render with zero blank boxes
                if (window.html2canvas) {
                    canvas = await window.html2canvas(sheet, {
                        scale: 2,
                        width: 800,
                        height: totalHeight,
                        windowWidth: 800,
                        windowHeight: totalHeight,
                        scrollX: 0,
                        scrollY: 0,
                        backgroundColor: '#ffffff',
                        useCORS: true,
                        allowTaint: false,
                        logging: false
                    });
                    if (canvas) {
                        pngUrl = canvas.toDataURL('image/png');
                    }
                }
            } else {
                // Strategy 1: Desktop Chromium / Firefox - html-to-image native foreignObject snapshot
                try {
                    if (window.htmlToImage && typeof window.htmlToImage.toPng === 'function') {
                        pngUrl = await window.htmlToImage.toPng(sheet, {
                            pixelRatio: 2, // 1600 x 2262 Ultra HD (Crisp 2x A4)
                            width: 800,
                            height: totalHeight,
                            backgroundColor: '#ffffff',
                            cacheBust: false
                        });
                    }
                } catch (h2iErr) {
                    console.warn('htmlToImage direct screenshot failed, falling back to html2canvas:', h2iErr);
                }

                // Strategy 2: Fallback to html2canvas if htmlToImage failed
                if (!pngUrl && window.html2canvas) {
                    canvas = await window.html2canvas(sheet, {
                        scale: 2,
                        width: 800,
                        height: totalHeight,
                        windowWidth: 800,
                        windowHeight: totalHeight,
                        scrollX: 0,
                        scrollY: 0,
                        backgroundColor: '#ffffff',
                        useCORS: true,
                        allowTaint: false,
                        logging: false
                    });
                    if (canvas) {
                        pngUrl = canvas.toDataURL('image/png');
                    }
                }
            }

            // Restore fine-tuned inline styles
            modifiedStyles.forEach(({ el, propName, prevVal, prevPrio }) => {
                if (prevVal) {
                    el.style.setProperty(propName, prevVal, prevPrio);
                } else {
                    el.style.removeProperty(propName);
                }
            });

            // Restore image sources in live sheet
            origImgs.forEach((img, idx) => {
                if (origSources[idx]) img.src = origSources[idx];
            });

            // Restore wrapper & sheet styles
            if (wrapper) {
                wrapper.className = prevWrapperClass;
                wrapper.style.cssText = prevWrapperCss;
            }
            sheet.style.cssText = prevSheetCss;

            // Restore viewport scroll
            if (viewport) viewport.scrollTop = prevViewportScroll;

            // Restore modal state if it was hidden
            if (modal && !wasModalActive) {
                modal.style.cssText = prevModalCss;
            } else if (modal && wasModalActive) {
                updateBrochurePreviewScale();
            }

            return { canvas, downloadUrl: pngUrl, pngUrl, totalHeight };
        } catch (err) {
            // Guarantee cleanup on error
            modifiedStyles.forEach(({ el, propName, prevVal, prevPrio }) => {
                try {
                    if (prevVal) el.style.setProperty(propName, prevVal, prevPrio);
                    else el.style.removeProperty(propName);
                } catch(e) {}
            });
            origImgs.forEach((img, idx) => {
                if (origSources && origSources[idx]) img.src = origSources[idx];
            });
            if (wrapper) {
                wrapper.className = prevWrapperClass;
                wrapper.style.cssText = prevWrapperCss;
            }
            if (sheet) sheet.style.cssText = prevSheetCss;
            if (modal && !wasModalActive) {
                modal.style.cssText = prevModalCss;
            } else if (modal && wasModalActive) {
                updateBrochurePreviewScale();
            }
            if (viewport) viewport.scrollTop = prevViewportScroll;
            throw err;
        }
    }

    // Public API: Download High-Resolution Brochure Image (PNG) Directly from Preview Screenshot
    async function downloadPropertyBrochure(propOrId) {
        let prop = resolvePropertyObject(propOrId) || currentShareProp || currentBrochureProp;
        if (!prop) return;

        const dlBtn = document.getElementById('brochure-btn-download');
        const origHtml = dlBtn ? dlBtn.innerHTML : '';
        if (dlBtn) {
            dlBtn.disabled = true;
            dlBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Generating HD PNG...</span>';
        }
        showShareToast('Capturing High-Resolution PNG from Brochure Preview (1600x2262)...', 'fa-solid fa-image');

        try {
            const { pngUrl, downloadUrl } = await createBrochureOffscreenCanvas(prop);
            const finalUrl = pngUrl || downloadUrl;
            if (!finalUrl) throw new Error('Brochure screenshot produced empty output');

            const safeSlug = (prop.title || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const fileName = `${safeSlug}-brochure.png`;

            const link = document.createElement('a');
            link.download = fileName;
            link.href = finalUrl;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                link.remove();
                if (finalUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(finalUrl);
                }
            }, 60000);

            showShareToast('🎉 High-Resolution Property Brochure (.PNG) downloaded!', 'fa-solid fa-circle-check');
        } catch (err) {
            console.error('downloadPropertyBrochure error:', err);
            showShareToast('PNG export error: ' + (err.message || 'Please try again'), 'fa-solid fa-circle-exclamation');
        } finally {
            if (dlBtn) {
                dlBtn.disabled = false;
                dlBtn.innerHTML = origHtml;
            }
        }
    }

    // Public API: Direct Single-Page A4 PDF File Download from Exact Preview PNG Screenshot
    async function downloadPropertyBrochurePdf(propOrId) {
        let prop = resolvePropertyObject(propOrId) || currentShareProp || currentBrochureProp;
        if (!prop) return;

        const printBtn = document.getElementById('brochure-btn-print');
        const origHtml = printBtn ? printBtn.innerHTML : '';
        if (printBtn) {
            printBtn.disabled = true;
            printBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Generating A4 PDF...</span>';
        }
        showShareToast('Rendering Single-Page A4 PDF Flyer from Live Preview...', 'fa-solid fa-file-pdf');

        try {
            await Promise.all([
                loadHtml2Canvas().catch(() => null),
                loadJsPdf().catch(() => null)
            ]);

            const { pngUrl, downloadUrl } = await createBrochureOffscreenCanvas(prop);
            const finalImg = pngUrl || downloadUrl;
            if (!finalImg) throw new Error('Brochure screenshot produced empty output');

            const JsPdf = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
            if (!JsPdf) {
                throw new Error('PDF generator library could not be loaded');
            }

            const pdf = new JsPdf({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            // Exact edge-to-edge A4 fit (210mm x 297mm) using the high-resolution PNG screenshot
            pdf.addImage(finalImg, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

            const safeSlug = (prop.title || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const fileName = `${safeSlug}-brochure.pdf`;

            // Deliver PDF file via direct blob download to eliminate iOS print spooler timeouts & multi-step dialogs
            const pdfBlob = pdf.output('blob');
            if (pdfBlob && pdfBlob.size > 2000) {
                const blobUrl = URL.createObjectURL(pdfBlob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                link.target = '_blank';
                link.rel = 'noopener';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    link.remove();
                    URL.revokeObjectURL(blobUrl);
                }, 60000);
            } else {
                pdf.save(fileName);
            }

            showShareToast('🎉 Single-Page A4 PDF Brochure downloaded!', 'fa-solid fa-circle-check');
        } catch (err) {
            console.error('downloadPropertyBrochurePdf error:', err);
            // Fallback to native print if PDF generation fails
            try {
                await nativePrintPropertyBrochure(prop);
            } catch (pErr) {
                showShareToast('PDF export error: ' + (err.message || 'Please try again'), 'fa-solid fa-circle-exclamation');
            }
        } finally {
            if (printBtn) {
                printBtn.disabled = false;
                printBtn.innerHTML = origHtml;
            }
        }
    }

    // Native Browser Print Engine for Desktop (100% Pixel-Identical High-Resolution PNG Snapshot)
    async function nativePrintPropertyBrochure(propOrId) {
        let prop = resolvePropertyObject(propOrId) || currentShareProp || currentBrochureProp;
        if (!prop) return;

        ensurePropertyBrochureModal();
        renderBrochureContent(prop);

        const printBtn = document.getElementById('brochure-btn-print');
        const origHtml = printBtn ? printBtn.innerHTML : '';
        if (printBtn) {
            printBtn.disabled = true;
            printBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Preparing Print...</span>';
        }
        showShareToast('Rendering Single-Page A4 Print Flyer...', 'fa-solid fa-print');

        try {
            const { pngUrl, downloadUrl } = await createBrochureOffscreenCanvas(prop);
            const finalImg = pngUrl || downloadUrl;
            if (!finalImg) throw new Error('Print snapshot produced empty output');

            // Remove any existing print stage
            let printStage = document.getElementById('brochure-print-stage');
            if (!printStage) {
                printStage = document.createElement('div');
                printStage.id = 'brochure-print-stage';
                document.body.appendChild(printStage);
            }

            printStage.innerHTML = `<img src="${finalImg}" alt="Property Brochure Print" class="brochure-print-img" style="width: 210mm; height: 297mm; max-width: 210mm; max-height: 297mm; display: block; margin: 0 auto; object-fit: fill;" />`;

            const printImg = printStage.querySelector('img');
            if (printImg && !printImg.complete) {
                await new Promise(res => {
                    printImg.onload = () => res();
                    printImg.onerror = () => res();
                    setTimeout(res, 500);
                });
            }

            // Activate print isolation mode (hides all other elements from print layout flow)
            document.body.classList.add('brochure-printing-mode');

            const cleanUpPrint = () => {
                document.body.classList.remove('brochure-printing-mode');
                if (printStage && printStage.parentNode) {
                    printStage.parentNode.removeChild(printStage);
                }
                window.removeEventListener('afterprint', cleanUpPrint);
            };
            window.addEventListener('afterprint', cleanUpPrint);

            setTimeout(() => {
                window.print();
                // Safety cleanup timer
                setTimeout(cleanUpPrint, 120000);
            }, 150);
        } catch (err) {
            console.error('nativePrintPropertyBrochure error:', err);
            showShareToast('Print error: ' + (err.message || 'Please try again'), 'fa-solid fa-circle-exclamation');
        } finally {
            if (printBtn) {
                printBtn.disabled = false;
                printBtn.innerHTML = origHtml;
            }
        }
    }

    // Public API: Print or Save as Single-Page A4 PDF
    // On Mobile: Directly downloads single-page A4 PDF file (~700KB) to completely avoid print spooling bugs & 2-page spilling!
    // On Desktop: Runs native high-fidelity print
    async function printPropertyBrochure(propOrId) {
        let prop = resolvePropertyObject(propOrId) || currentShareProp || currentBrochureProp;
        if (!prop) return;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth < 850);

        if (isIOS || isMobile) {
            await downloadPropertyBrochurePdf(prop);
            return;
        }

        await nativePrintPropertyBrochure(prop);
    }

    // Global Print Engine Hook: Guarantees browser native Cmd+P / Ctrl+P while brochure modal is open cleanly prints 1 single A4 page
    window.addEventListener('beforeprint', () => {
        const modal = document.getElementById('property-brochure-modal');
        if (modal && modal.classList.contains('active')) {
            let printStage = document.getElementById('brochure-print-stage');
            if (!printStage) {
                const sheet = document.getElementById('brochure-sheet');
                if (sheet) {
                    printStage = document.createElement('div');
                    printStage.id = 'brochure-print-stage';
                    printStage.style.width = '210mm';
                    printStage.style.maxWidth = '210mm';
                    printStage.style.height = '297mm';
                    printStage.style.maxHeight = '297mm';
                    printStage.style.padding = '0';
                    printStage.style.boxSizing = 'border-box';
                    printStage.style.margin = '0 auto';
                    printStage.style.overflow = 'hidden';
                    printStage.style.pageBreakInside = 'avoid';
                    printStage.style.breakInside = 'avoid';
                    printStage.style.pageBreakAfter = 'avoid';
                    printStage.style.breakAfter = 'avoid';

                    const clone = sheet.cloneNode(true);
                    clone.id = 'brochure-print-sheet';
                    clone.style.transform = 'none';
                    clone.style.webkitTransform = 'none';
                    clone.style.position = 'relative';
                    clone.style.top = 'auto';
                    clone.style.left = 'auto';
                    clone.style.width = '100%';
                    clone.style.maxWidth = '100%';
                    clone.style.height = '100%';
                    clone.style.maxHeight = '297mm';
                    clone.style.boxSizing = 'border-box';
                    clone.style.margin = '0 auto';
                    clone.style.overflow = 'hidden';
                    clone.style.boxShadow = 'none';
                    clone.style.filter = 'none';
                    clone.style.pageBreakAfter = 'avoid';
                    clone.style.breakAfter = 'avoid';
                    clone.style.pageBreakInside = 'avoid';
                    clone.style.breakInside = 'avoid';
                    printStage.appendChild(clone);
                    document.body.appendChild(printStage);
                }
            }
            document.body.classList.add('brochure-printing-mode');
            document.body.classList.add('brochure-direct-printing');
        }
    });

    window.addEventListener('afterprint', () => {
        if (document.body.classList.contains('brochure-direct-printing')) {
            document.body.classList.remove('brochure-direct-printing');
            document.body.classList.remove('brochure-printing-mode');
            const printStage = document.getElementById('brochure-print-stage');
            if (printStage && printStage.parentNode) {
                printStage.parentNode.removeChild(printStage);
            }
        }
    });

    /* ==========================================================================
       GOOGLE EARTH & GOOGLE MAPS MODAL ENGINE
       ========================================================================== */

    let currentMapProp = null;
    let currentMapActiveTab = 'gearth'; // 'gearth' | 'gmaps' | 'waze'

    function ensurePropertyMapModal() {
        if (document.getElementById('property-map-modal')) return;

        const modalHtml = `
            <div id="property-map-modal" class="property-share-modal property-map-modal" aria-hidden="true" role="dialog" aria-labelledby="map-modal-title">
                <div class="share-modal-backdrop" id="map-modal-backdrop"></div>
                <div class="share-modal-dialog">
                    <!-- Header -->
                    <div class="share-modal-header">
                        <div>
                            <h3 class="share-modal-title" id="map-modal-title">
                                <i class="fa-solid fa-earth-americas" style="color: #059669;"></i> Location, Google Earth &amp; Map
                            </h3>
                            <p class="share-modal-subtitle">Satellite 3D view, street maps, and direct location links</p>
                        </div>
                        <button type="button" class="share-modal-close" id="map-modal-close" aria-label="Close">&times;</button>
                    </div>

                    <div class="share-modal-body">
                        <!-- Property Preview Card -->
                        <div class="share-modal-preview">
                            <img id="map-modal-img" src="" alt="Property Thumbnail" class="share-modal-thumb" style="pointer-events: none; -webkit-user-drag: none; user-select: none;" oncontextmenu="return false;" ondragstart="return false;">
                            <div class="share-modal-preview-info">
                                <div class="share-modal-preview-header">
                                    <span id="map-modal-intent" class="share-badge-intent">FOR SALE</span>
                                    <span id="map-modal-price" class="share-preview-price">RM 0</span>
                                </div>
                                <h4 id="map-modal-title-text" class="share-preview-title">Property Title</h4>
                                <div id="map-modal-road" class="share-preview-loc"><i class="fa-solid fa-road" style="color: #059669;"></i> <span>Road Address</span></div>
                                <div id="map-modal-location" class="share-preview-loc"><i class="fa-solid fa-location-dot" style="color: #059669;"></i> <span>Location</span></div>
                            </div>
                        </div>

                        <!-- 1-Click Platform Selection Grid -->
                        <div class="share-platforms-section">
                            <label class="share-section-label">Launch in Map App (1-Click):</label>
                            <div class="share-platform-grid">
                                <!-- Google Earth 3D -->
                                <button type="button" class="share-platform-btn platform-gearth" id="map-btn-gearth" title="Open 3D Satellite &amp; Terrain View in Google Earth">
                                    <div class="platform-icon"><i class="fa-solid fa-earth-americas"></i></div>
                                    <div class="platform-text">
                                        <strong>Google Earth</strong>
                                        <span>3D Satellite View</span>
                                    </div>
                                </button>

                                <!-- Google Maps -->
                                <button type="button" class="share-platform-btn platform-gmaps" id="map-btn-gmaps" title="Open Street View &amp; Directions in Google Maps">
                                    <div class="platform-icon"><i class="fa-solid fa-map-location-dot"></i></div>
                                    <div class="platform-text">
                                        <strong>Google Maps</strong>
                                        <span>Route &amp; Street View</span>
                                    </div>
                                </button>

                                <!-- Waze Navigation -->
                                <button type="button" class="share-platform-btn platform-waze" id="map-btn-waze" title="Open Live GPS Navigation in Waze">
                                    <div class="platform-icon"><i class="fa-solid fa-diamond-turn-right"></i></div>
                                    <div class="platform-text">
                                        <strong>Waze App</strong>
                                        <span>Live GPS &amp; Traffic</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Direct URL Box with Tabs for Earth / Maps / Waze -->
                        <div class="map-direct-url-section">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 6px;">
                                <label class="share-section-label" style="margin-bottom: 0;">Direct Location URL:</label>
                                <div class="map-url-tabs" role="tablist">
                                    <button type="button" class="map-url-tab active" data-tab="gearth" id="map-tab-gearth">Google Earth (3D)</button>
                                    <button type="button" class="map-url-tab" data-tab="gmaps" id="map-tab-gmaps">Google Maps</button>
                                    <button type="button" class="map-url-tab" data-tab="waze" id="map-tab-waze">Waze</button>
                                </div>
                            </div>
                            <div class="share-link-box">
                                <div class="share-link-input-wrap">
                                    <i id="map-url-type-icon" class="fa-solid fa-earth-americas" style="color: #059669;"></i>
                                    <input type="text" id="map-modal-url-input" readonly value="">
                                </div>
                                <button type="button" class="btn btn-primary share-copy-link-btn" id="map-btn-copylink" title="Copy direct map URL to clipboard">
                                    <i class="fa-regular fa-copy"></i> <span>Copy Link</span>
                                </button>
                                <a href="#" target="_blank" rel="noopener noreferrer" class="btn btn-outline map-open-external-btn" id="map-btn-openurl" title="Open URL in new tab">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> <span>Open</span>
                                </a>
                            </div>
                        </div>

                        <!-- Location Query & Road Details Info Box -->
                        <div class="map-location-info-box">
                            <div class="map-info-header">
                                <i class="fa-solid fa-circle-info" style="color: #059669;"></i>
                                <span>Derived from Listing Address</span>
                            </div>
                            <div class="map-info-query" id="map-modal-query-text">
                                Selangor, Malaysia
                            </div>
                            <div class="map-info-note">
                                Automatically mapped based on road and industrial park. You can copy the exact direct URL above or launch directly into Google Earth / Maps.
                            </div>
                        </div>

                        <div id="map-status-toast" class="share-status-toast" style="display: none;"></div>
                    </div>

                    <!-- Footer -->
                    <div class="share-modal-footer">
                        <button type="button" class="btn btn-secondary" id="map-modal-dismiss-btn" style="margin-left: auto;">Done</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        bindPropertyMapModalEvents();
    }

    function showMapToast(message, iconClass = 'fa-solid fa-circle-check') {
        const toast = document.getElementById('map-status-toast');
        if (!toast) return;
        toast.innerHTML = `<i class="${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
        toast.style.display = 'flex';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
    }

    function updateMapModalUrlView(tabKey) {
        if (!currentMapProp) return;
        currentMapActiveTab = tabKey || currentMapActiveTab || 'gearth';

        const tabs = document.querySelectorAll('.map-url-tab');
        tabs.forEach(t => {
            if (t.dataset.tab === currentMapActiveTab) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        let targetUrl = '';
        const iconEl = document.getElementById('map-url-type-icon');
        if (currentMapActiveTab === 'gearth') {
            targetUrl = getGoogleEarthUrl(currentMapProp);
            if (iconEl) iconEl.className = 'fa-solid fa-earth-americas';
        } else if (currentMapActiveTab === 'waze') {
            targetUrl = getWazeUrl(currentMapProp);
            if (iconEl) iconEl.className = 'fa-solid fa-diamond-turn-right';
        } else {
            targetUrl = getGoogleMapsUrl(currentMapProp);
            if (iconEl) iconEl.className = 'fa-solid fa-map-location-dot';
        }

        const urlInput = document.getElementById('map-modal-url-input');
        if (urlInput) urlInput.value = targetUrl;

        const openBtn = document.getElementById('map-btn-openurl');
        if (openBtn) openBtn.href = targetUrl;
    }

    function bindPropertyMapModalEvents() {
        const modal = document.getElementById('property-map-modal');
        if (!modal || modal.dataset.bound) return;
        modal.dataset.bound = 'true';

        const closeModal = () => closePropertyMapModal();
        const closeBtn = document.getElementById('map-modal-close');
        const backdrop = document.getElementById('map-modal-backdrop');
        const dismissBtn = document.getElementById('map-modal-dismiss-btn');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);
        if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Tabs
        ['gearth', 'gmaps', 'waze'].forEach(tab => {
            const tabBtn = document.getElementById(`map-tab-${tab}`);
            if (tabBtn) {
                tabBtn.addEventListener('click', () => {
                    updateMapModalUrlView(tab);
                });
            }
        });

        // Copy direct URL
        const copyBtn = document.getElementById('map-btn-copylink');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const urlInput = document.getElementById('map-modal-url-input');
                const targetUrl = urlInput ? urlInput.value : '';
                if (!targetUrl) return;

                navigator.clipboard.writeText(targetUrl).then(() => {
                    const labelSpan = copyBtn.querySelector('span');
                    const origText = labelSpan ? labelSpan.textContent : 'Copy Link';
                    if (labelSpan) labelSpan.textContent = 'Copied!';
                    const name = currentMapActiveTab === 'gearth' ? 'Google Earth' : (currentMapActiveTab === 'waze' ? 'Waze' : 'Google Maps');
                    showMapToast(`${name} URL copied to clipboard!`, 'fa-solid fa-link');
                    setTimeout(() => {
                        if (labelSpan) labelSpan.textContent = origText;
                    }, 2000);
                }).catch(() => {
                    showMapToast('Select the link above to copy.', 'fa-solid fa-triangle-exclamation');
                });
            });
        }

        // 1-Click Platform Launch Buttons
        const btnEarth = document.getElementById('map-btn-gearth');
        if (btnEarth) {
            btnEarth.addEventListener('click', () => {
                if (!currentMapProp) return;
                const url = getGoogleEarthUrl(currentMapProp);
                window.open(url, '_blank');
                showMapToast('Opened Google Earth 3D view in new tab.', 'fa-solid fa-earth-americas');
            });
        }

        const btnMaps = document.getElementById('map-btn-gmaps');
        if (btnMaps) {
            btnMaps.addEventListener('click', () => {
                if (!currentMapProp) return;
                const url = getGoogleMapsUrl(currentMapProp);
                window.open(url, '_blank');
                showMapToast('Opened Google Maps street view & directions.', 'fa-solid fa-map-location-dot');
            });
        }

        const btnWaze = document.getElementById('map-btn-waze');
        if (btnWaze) {
            btnWaze.addEventListener('click', () => {
                if (!currentMapProp) return;
                const url = getWazeUrl(currentMapProp);
                window.open(url, '_blank');
                showMapToast('Opened Waze GPS navigation.', 'fa-solid fa-diamond-turn-right');
            });
        }
    }

    function openPropertyMapModal(propOrId) {
        ensurePropertyMapModal();
        const modal = document.getElementById('property-map-modal');
        if (!modal) return;

        let prop = null;
        if (typeof propOrId === 'object' && propOrId !== null) {
            prop = propOrId;
        } else if (propOrId) {
            let allProps = (typeof window.properties !== 'undefined' && Array.isArray(window.properties)) ? window.properties : [];
            if (allProps.length === 0) {
                try {
                    const stored = localStorage.getItem('industria_properties');
                    if (stored) allProps = JSON.parse(stored);
                } catch (e) {}
            }
            prop = allProps.find(p => p && (String(p.id) === String(propOrId) || p.id == propOrId));
        }

        if (!prop) {
            console.warn('openPropertyMapModal: Property not found', propOrId);
            return;
        }

        currentMapProp = prop;

        // Populate Preview
        const imgEl = document.getElementById('map-modal-img');
        const titleEl = document.getElementById('map-modal-title-text');
        const priceEl = document.getElementById('map-modal-price');
        const intentEl = document.getElementById('map-modal-intent');
        const roadEl = document.getElementById('map-modal-road');
        const locEl = document.getElementById('map-modal-location');
        const queryEl = document.getElementById('map-modal-query-text');

        const photoSrc = (prop.images && prop.images.length > 0) ? prop.images[0] : (prop.image || 'assets/images/hero.jpg');
        if (imgEl) imgEl.src = photoSrc;
        if (titleEl) titleEl.textContent = prop.title || 'Industrial Property';
        if (priceEl) priceEl.textContent = prop.price || 'Price on Application';

        const rawIntent = (prop.intent || (prop.price && prop.price.toLowerCase().includes('mo') ? 'Rent' : 'Sale')).toUpperCase();
        if (intentEl) {
            intentEl.textContent = rawIntent === 'RENT' ? 'FOR RENT' : 'FOR SALE';
            intentEl.style.backgroundColor = rawIntent === 'RENT' ? '#eab308' : '#0077b6';
        }

        const roadText = prop.road ? String(prop.road).trim() : 'Road name not specified';
        if (roadEl) {
            roadEl.innerHTML = `<i class="fa-solid fa-road" style="color: #059669;"></i> <span><strong>Road:</strong> ${escapeHtml(roadText)}</span>`;
        }

        const parkText = prop.park ? ` • ${escapeHtml(prop.park)}` : '';
        if (locEl) {
            locEl.innerHTML = `<i class="fa-solid fa-location-dot" style="color: #059669;"></i> <span>${escapeHtml(prop.location || 'Selangor')}, Selangor${parkText}</span>`;
        }

        const query = getPropertyLocationQuery(prop);
        if (queryEl) {
            queryEl.textContent = query;
        }

        // Set default tab (gearth)
        currentMapActiveTab = 'gearth';
        updateMapModalUrlView('gearth');

        // Reset scroll position
        const modalBody = modal.querySelector('.share-modal-body');
        if (modalBody) modalBody.scrollTop = 0;

        // Open
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePropertyMapModal() {
        const modal = document.getElementById('property-map-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Handle deep-linking on page load: ?id=... or ?propertyId=...
    let deepLinkInterval = null;
    function handleDeepLinkedProperty(overrideId) {
        try {
            const params = new URLSearchParams(window.location.search);
            const targetId = overrideId || params.get('id') || params.get('propertyId');
            if (!targetId) return;

            if (deepLinkInterval) {
                clearInterval(deepLinkInterval);
                deepLinkInterval = null;
            }

            // Immediately scroll down toward browse section if opening with an ID
            const targetSection = document.getElementById('browse-properties') || document.getElementById('properties');
            if (targetSection && !window.__initialDeepLinkScrolled) {
                window.__initialDeepLinkScrolled = true;
                const headerOffset = 85;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
            }

            // Wait until the specific property card is rendered
            let attempts = 0;
            const maxAttempts = 50; // 50 * 150ms = 7.5 seconds
            deepLinkInterval = setInterval(() => {
                attempts++;
                const card = document.querySelector(`.property-card[data-id="${targetId}"]`) || 
                             document.getElementById(`property-${targetId}`);
                if (card) {
                    clearInterval(deepLinkInterval);
                    deepLinkInterval = null;

                    card.classList.add('property-card-highlighted', 'expanded');

                    setTimeout(() => {
                        const headerOffset = 85;
                        const bannerEl = document.getElementById('direct-listing-banner');
                        const scrollTarget = (bannerEl && bannerEl.style.display !== 'none') ? bannerEl : card;
                        const rect = scrollTarget.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        const targetY = rect.top + scrollTop - headerOffset;
                        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

                        // Gentle temporary pulse glow
                        card.style.transition = 'box-shadow 0.5s ease';
                        card.style.boxShadow = '0 0 0 4px var(--primary-light, rgba(5, 150, 105, 0.3)), 0 20px 30px rgba(5, 150, 105, 0.2)';
                        setTimeout(() => {
                            card.style.boxShadow = '';
                        }, 4000);
                    }, 120);
                } else if (attempts >= maxAttempts) {
                    clearInterval(deepLinkInterval);
                    deepLinkInterval = null;
                    const bannerEl = document.getElementById('direct-listing-banner');
                    if (bannerEl) {
                        const dlTitle = document.getElementById('direct-listing-title');
                        const dlMeta = document.getElementById('direct-listing-meta');
                        if (dlTitle) dlTitle.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #f59e0b; margin-right: 6px;"></i> Listing #${escapeHtml(targetId)} Unavailable`;
                        if (dlMeta) dlMeta.textContent = `This listing may have been sold, leased, or updated. Showing all available properties below.`;
                    }
                }
            }, 150);
        } catch (e) {
            console.warn('handleDeepLinkedProperty error:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => handleDeepLinkedProperty());
    } else {
        handleDeepLinkedProperty();
    }

    // Expose Global APIs
    window.openPropertyShareModal = openPropertyShareModal;
    window.openSharePropertyModal = openPropertyShareModal; // Convenient alias
    window.closePropertyShareModal = closePropertyShareModal;
    window.openPropertyBrochureModal = openPropertyBrochureModal;
    window.openBrochurePropertyModal = openPropertyBrochureModal; // Convenient alias
    window.closePropertyBrochureModal = closePropertyBrochureModal;
    window.downloadPropertyBrochure = downloadPropertyBrochure;
    window.downloadPropertyBrochurePdf = downloadPropertyBrochurePdf;
    window.createBrochureOffscreenCanvas = createBrochureOffscreenCanvas;
    window.printPropertyBrochure = printPropertyBrochure;
    window.renderBrochureContent = renderBrochureContent;
    window.calculatePropertyPsf = calculatePropertyPsf;
    window.openPropertyMapModal = openPropertyMapModal;
    window.openMapPropertyModal = openPropertyMapModal; // Convenient alias
    window.closePropertyMapModal = closePropertyMapModal;
    window.getPropertyLocationQuery = getPropertyLocationQuery;
    window.getGoogleMapsUrl = getGoogleMapsUrl;
    window.getGoogleEarthUrl = getGoogleEarthUrl;
    window.getWazeUrl = getWazeUrl;
    window.ensurePropertyMapModal = ensurePropertyMapModal;
    window.generatePropertyShareCaption = generatePropertyShareCaption;
    window.ensurePropertyShareModal = ensurePropertyShareModal;
    window.handleDeepLinkedProperty = handleDeepLinkedProperty;

})();
