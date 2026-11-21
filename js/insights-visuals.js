/**
 * MyFactorySpace Publisher Specialized Edition — Split Visual Engine
 * Module A: Interactive Executive Mind Map (Pure Diagram + 1600x900 Mind Map PNG Export)
 * Module B: HD Enhanced Infographic Photo (Photo-First Aerial Visual + 4-KPI Strip + 1600x900 PNG Export)
 * Shared by Dashboard > Insights (Automation & Editor Studios) and insights.html (Public Reader).
 */
(function () {
    'use strict';

    const BRANCH_PALETTE = [
        { color: '#059669', soft: '#ecfdf5', border: '#a7f3d0', icon: 'fa-solid fa-sack-dollar' },
        { color: '#2563eb', soft: '#eff6ff', border: '#bfdbfe', icon: 'fa-solid fa-bolt' },
        { color: '#7c3aed', soft: '#f5f3ff', border: '#ddd6fe', icon: 'fa-solid fa-industry' },
        { color: '#d97706', soft: '#fffbeb', border: '#fde68a', icon: 'fa-solid fa-shield-halved' }
    ];

    const EDITION_LABELS = {
        specialized: 'Specialized Executive Brief',
        investor: 'Investor & Yield Playbook',
        compliance: 'Technical & Compliance Blueprint'
    };

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function shortClip(text, maxLen) {
        const clean = String(text || '').replace(/\s+/g, ' ').trim();
        if (!clean) return '';
        return clean.length > maxLen ? clean.slice(0, maxLen - 1).trim() + '…' : clean;
    }

    function getBrandPrimary() {
        try {
            const computed = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            if (computed) return computed;
        } catch (e) {}
        return '#059669';
    }

    function normalizeMindMap(rawMap, article) {
        const fallback = buildDefaultMindMapFromArticle(article || {});
        if (!rawMap || typeof rawMap !== 'object' || !Array.isArray(rawMap.branches) || rawMap.branches.length === 0) {
            return fallback;
        }
        const branches = rawMap.branches.slice(0, 4).map((b, idx) => {
            const pal = BRANCH_PALETTE[idx % BRANCH_PALETTE.length];
            const pts = Array.isArray(b.points)
                ? b.points.map(p => String(p || '').trim()).filter(Boolean).slice(0, 3)
                : String(b.points || '').split('\n').map(p => p.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).slice(0, 3);
            return {
                title: String(b.title || fallback.branches[idx]?.title || `Pillar ${idx + 1}`).trim(),
                metric: String(b.metric || '').trim(),
                color: b.color || pal.color,
                soft: b.soft || pal.soft,
                border: b.border || pal.border,
                icon: b.icon || pal.icon,
                points: pts.length ? pts : (fallback.branches[idx]?.points || ['Verified industrial benchmark'])
            };
        });
        while (branches.length < 4 && fallback.branches[branches.length]) {
            branches.push(fallback.branches[branches.length]);
        }
        return {
            centerTitle: String(rawMap.centerTitle || fallback.centerTitle).trim(),
            centerSubtitle: String(rawMap.centerSubtitle || fallback.centerSubtitle).trim(),
            edition: rawMap.edition || (article && article.edition) || 'specialized',
            branches
        };
    }

    function buildDefaultMindMapFromArticle(article) {
        const a = article || {};
        const city = a.targetCity && a.targetCity !== 'All' ? a.targetCity : 'Klang Valley';
        const propType = a.targetType && a.targetType !== 'All' ? a.targetType : 'Industrial Assets';
        const category = a.category || 'Industry Guide';
        const takeaways = Array.isArray(a.keyTakeaways)
            ? a.keyTakeaways.filter(Boolean)
            : String(a.keyTakeaways || '').split('\n').map(s => s.trim()).filter(Boolean);
        const faqs = Array.isArray(a.faqs) ? a.faqs.filter(f => f && f.q) : [];

        return {
            centerTitle: shortClip(a.title ? a.title.split(':')[0] : `${city} ${propType}`, 38),
            centerSubtitle: `${category} · ${city}`,
            edition: a.edition || 'specialized',
            branches: [
                {
                    title: 'Strategic Focus',
                    metric: city,
                    color: BRANCH_PALETTE[0].color,
                    soft: BRANCH_PALETTE[0].soft,
                    border: BRANCH_PALETTE[0].border,
                    icon: 'fa-solid fa-location-dot',
                    points: [
                        shortClip(takeaways[0] || `Core demand hub across ${city} industrial parks.`, 88),
                        shortClip(`Focused format: ${propType}`, 88)
                    ]
                },
                {
                    title: 'Technical Benchmarks',
                    metric: 'Specs & Power',
                    color: BRANCH_PALETTE[1].color,
                    soft: BRANCH_PALETTE[1].soft,
                    border: BRANCH_PALETTE[1].border,
                    icon: 'fa-solid fa-bolt',
                    points: [
                        shortClip(takeaways[1] || 'Verify TNB 3-phase amp capacity & slab floor loading.', 88),
                        'Confirm clear eave height & 40ft container access'
                    ]
                },
                {
                    title: 'Compliance & Value',
                    metric: 'CCC · BOMBA · DOE',
                    color: BRANCH_PALETTE[2].color,
                    soft: BRANCH_PALETTE[2].soft,
                    border: BRANCH_PALETTE[2].border,
                    icon: 'fa-solid fa-shield-halved',
                    points: [
                        shortClip(takeaways[2] || 'Validate DOE Light/Medium/Heavy zoning & CCC status.', 88),
                        shortClip(faqs[0] ? faqs[0].q : 'Check BOMBA sprinkler & fire certificate readiness', 88)
                    ]
                },
                {
                    title: 'Quick Action Plan',
                    metric: 'Next Steps',
                    color: BRANCH_PALETTE[3].color,
                    soft: BRANCH_PALETTE[3].soft,
                    border: BRANCH_PALETTE[3].border,
                    icon: 'fa-solid fa-compass',
                    points: [
                        `Shortlist verified ${city} units on MyFactorySpace`,
                        'Book technical walkthrough with area specialist'
                    ]
                }
            ]
        };
    }

    // Shared Canvas Helpers
    function drawRoundedRect(ctx, x, y, w, h, r) {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    }

    function wrapCanvasLines(ctx, text, maxWidth, maxLines) {
        const words = String(text || '').trim().split(/\s+/).filter(Boolean);
        if (!words.length) return [];
        const lines = [];
        let line = words[0];
        for (let i = 1; i < words.length; i++) {
            const test = line + ' ' + words[i];
            if (ctx.measureText(test).width <= maxWidth) {
                line = test;
            } else {
                lines.push(line);
                line = words[i];
                if (maxLines && lines.length >= maxLines) {
                    const lastIdx = lines.length - 1;
                    lines[lastIdx] = shortClip(lines[lastIdx], Math.max(10, lines[lastIdx].length - 2));
                    return lines;
                }
            }
        }
        lines.push(line);
        if (maxLines && lines.length > maxLines) {
            const trimmed = lines.slice(0, maxLines);
            trimmed[maxLines - 1] = shortClip(trimmed[maxLines - 1], Math.max(10, trimmed[maxLines - 1].length - 2));
            return trimmed;
        }
        return lines;
    }

    function loadCanvasImage(src) {
        return new Promise((resolve) => {
            if (!src) { resolve(null); return; }
            const img = new Image();
            if (/^https?:\/\//i.test(src) && !src.startsWith(window.location.origin)) {
                img.crossOrigin = 'anonymous';
            }
            const timer = setTimeout(() => resolve(null), 4000);
            img.onload = () => { clearTimeout(timer); resolve(img); };
            img.onerror = () => { clearTimeout(timer); resolve(null); };
            img.src = src;
        });
    }

    function drawCoverImage(ctx, img, w, h) {
        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    async function exportCanvasSafely(canvas) {
        let dataUrl = '';
        let blob = null;
        try {
            dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            blob = await new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.9));
        } catch (err) {
            console.warn('Canvas export skipped due to cross-origin image:', err);
        }
        return { dataUrl, blob };
    }

    /**
     * MODULE A: Pure Executive Mind Map Diagram Canvas (1600x900)
     * Clean light boardroom whiteboard/slate aesthetic — NO photo clutter behind nodes.
     */
    async function renderMindMapCanvas(canvas, article, rawMindMap, opts = {}) {
        if (!canvas) return null;
        const W = 1600;
        const H = 900;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const a = article || {};
        const map = normalizeMindMap(rawMindMap || a.mindMap, a);
        const editionKey = opts.edition || map.edition || a.edition || 'specialized';
        const editionLabel = EDITION_LABELS[editionKey] || EDITION_LABELS.specialized;
        const brandPrimary = getBrandPrimary();

        // 1. Clean Light Executive Whiteboard Surface + Subtle Dot Matrix
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#ffffff');
        bgGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        for (let gx = 32; gx < W; gx += 36) {
            for (let gy = 32; gy < H - 48; gy += 36) {
                ctx.beginPath();
                ctx.arc(gx, gy, 1.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const padX = 60;

        // 2. Crisp Top Header Strip
        drawRoundedRect(ctx, padX, 34, 240, 36, 18);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(padX + 20, 52, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 14px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('EXECUTIVE MIND MAP', padX + 34, 53);

        const badgeText = `${String(a.category || 'INDUSTRY GUIDE').toUpperCase()}  ·  ${editionLabel.toUpperCase()}`;
        ctx.font = '700 13px Inter, sans-serif';
        const badgeW = Math.min(580, ctx.measureText(badgeText).width + 32);
        drawRoundedRect(ctx, padX + 254, 34, badgeW, 36, 18);
        ctx.fillStyle = '#ecfdf5';
        ctx.fill();
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#047857';
        ctx.fillText(badgeText, padX + 270, 53);

        const rightMeta = `${a.targetCity || 'Klang Valley'}  ·  ${a.publishedAt || new Date().toISOString().slice(0, 10)}`;
        ctx.font = '600 14px Inter, sans-serif';
        const rmW = ctx.measureText(rightMeta).width + 28;
        drawRoundedRect(ctx, W - padX - rmW, 34, rmW, 36, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();
        ctx.fillStyle = '#475569';
        ctx.fillText(rightMeta, W - padX - rmW + 14, 53);

        // Article Title
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 34px Outfit, Inter, sans-serif';
        const titleLines = wrapCanvasLines(ctx, a.title || map.centerTitle, W - padX * 2, 2);
        titleLines.forEach((ln, idx) => ctx.fillText(ln, padX, 112 + idx * 42));

        const dividerY = titleLines.length > 1 ? 178 : 148;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(padX, dividerY, W - padX * 2, 2);

        // 3. Hub-and-Spoke Mind Map Layout
        const centerX = W / 2;
        const centerY = dividerY + 322;
        const hubW = 316;
        const hubH = 176;

        const cardW = 496;
        const cardH = 262;
        const leftX = padX;
        const rightX = W - padX - cardW;
        const topY = dividerY + 34;
        const botY = dividerY + 332;

        const slots = [
            { x: leftX, y: topY, side: 'left', anchorX: leftX + cardW, anchorY: topY + cardH * 0.56 },
            { x: rightX, y: topY, side: 'right', anchorX: rightX, anchorY: topY + cardH * 0.56 },
            { x: leftX, y: botY, side: 'left', anchorX: leftX + cardW, anchorY: botY + cardH * 0.44 },
            { x: rightX, y: botY, side: 'right', anchorX: rightX, anchorY: botY + cardH * 0.44 }
        ];

        // Curved Bézier Connectors
        map.branches.slice(0, 4).forEach((br, idx) => {
            const slot = slots[idx];
            const accent = br.color || BRANCH_PALETTE[idx % 4].color;
            const startX = slot.side === 'left' ? centerX - hubW / 2 : centerX + hubW / 2;
            const startY = idx < 2 ? centerY - 28 : centerY + 28;
            const cp1X = slot.side === 'left' ? startX - 66 : startX + 66;
            const cp2X = slot.side === 'left' ? slot.anchorX + 62 : slot.anchorX - 62;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.bezierCurveTo(cp1X, startY, cp2X, slot.anchorY, slot.anchorX, slot.anchorY);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(slot.anchorX, slot.anchorY, 7.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(slot.anchorX, slot.anchorY, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // 4 Clean Elevated White Branch Cards
        map.branches.slice(0, 4).forEach((br, idx) => {
            const slot = slots[idx];
            const accent = br.color || BRANCH_PALETTE[idx % 4].color;
            const soft = br.soft || BRANCH_PALETTE[idx % 4].soft;
            const border = br.border || BRANCH_PALETTE[idx % 4].border;

            ctx.save();
            drawRoundedRect(ctx, slot.x, slot.y, cardW, cardH, 18);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;
            ctx.fill();
            ctx.restore();

            drawRoundedRect(ctx, slot.x, slot.y, cardW, cardH, 18);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Left accent stripe
            drawRoundedRect(ctx, slot.x, slot.y, 7, cardH, 4);
            ctx.fillStyle = accent;
            ctx.fill();

            // Pillar Number Circle
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(slot.x + 34, slot.y + 38, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 15px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(idx + 1), slot.x + 34, slot.y + 39);

            // Title
            ctx.textAlign = 'left';
            ctx.fillStyle = '#0f172a';
            ctx.font = '800 20px Outfit, Inter, sans-serif';
            ctx.fillText(shortClip(br.title, 25), slot.x + 58, slot.y + 39);

            // Metric Badge
            if (br.metric) {
                const mText = shortClip(br.metric, 22);
                ctx.font = '700 13px Inter, sans-serif';
                const mw = Math.min(205, ctx.measureText(mText).width + 22);
                drawRoundedRect(ctx, slot.x + cardW - mw - 18, slot.y + 23, mw, 30, 15);
                ctx.fillStyle = soft;
                ctx.fill();
                ctx.strokeStyle = border;
                ctx.lineWidth = 1.2;
                ctx.stroke();
                ctx.fillStyle = accent;
                ctx.textAlign = 'center';
                ctx.fillText(mText, slot.x + cardW - mw / 2 - 18, slot.y + 39);
                ctx.textAlign = 'left';
            }

            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(slot.x + 22, slot.y + 68, cardW - 44, 1.5);

            // Crisp Bullet Points
            let curY = slot.y + 96;
            (br.points || []).slice(0, 3).forEach(pt => {
                if (curY > slot.y + cardH - 22) return;
                ctx.fillStyle = accent;
                ctx.beginPath();
                ctx.arc(slot.x + 28, curY, 4.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#334155';
                ctx.font = '500 16px Inter, sans-serif';
                const wrapped = wrapCanvasLines(ctx, pt, cardW - 64, 2);
                wrapped.forEach((wl, wi) => ctx.fillText(wl, slot.x + 42, curY + wi * 23));
                curY += wrapped.length * 23 + 14;
            });
        });

        // Central Gradient Hub Card
        const hx = centerX - hubW / 2;
        const hy = centerY - hubH / 2;
        ctx.save();
        drawRoundedRect(ctx, hx, hy, hubW, hubH, 24);
        const hubGrad = ctx.createLinearGradient(hx, hy, hx + hubW, hy + hubH);
        hubGrad.addColorStop(0, brandPrimary);
        hubGrad.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = hubGrad;
        ctx.shadowColor = 'rgba(15, 23, 42, 0.22)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;
        ctx.fill();
        ctx.restore();

        drawRoundedRect(ctx, hx, hy, hubW, hubH, 24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '700 12px Inter, sans-serif';
        ctx.fillText('AT-A-GLANCE HUB', centerX, hy + 34);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 23px Outfit, Inter, sans-serif';
        const hubLines = wrapCanvasLines(ctx, map.centerTitle, hubW - 34, 2);
        hubLines.forEach((hl, hi) => ctx.fillText(hl, centerX, hy + 76 + hi * 28));

        drawRoundedRect(ctx, centerX - 142, hy + hubH - 44, 284, 28, 14);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 12.5px Inter, sans-serif';
        ctx.fillText(shortClip(map.centerSubtitle, 38), centerX, hy + hubH - 30);
        ctx.textAlign = 'left';

        // Footer Strip
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, H - 48, W, 48);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 14px Inter, sans-serif';
        ctx.fillText('www.myfactoryspace.com  ·  Executive Mind Map Briefing', padX, H - 23);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#34d399';
        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillText('4-Pillar Clear-Cut Summary', W - padX, H - 23);
        ctx.textAlign = 'left';

        const exp = await exportCanvasSafely(canvas);
        return Object.assign(exp, { mindMap: map });
    }

    /**
     * MODULE B: HD Enhanced Infographic Photo Canvas (1600x900)
     * Photo-first editorial layout: crisp aerial industrial imagery dominates the upper 62%,
     * paired with a magazine masthead + translucent bottom 4-KPI summary strip.
     */
    async function renderInfographicPhotoCanvas(canvas, article, rawMindMap, opts = {}) {
        if (!canvas) return null;
        const W = 1600;
        const H = 900;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const a = article || {};
        const map = normalizeMindMap(rawMindMap || a.mindMap, a);
        const editionKey = opts.edition || map.edition || a.edition || 'specialized';
        const editionLabel = EDITION_LABELS[editionKey] || EDITION_LABELS.specialized;
        const brandPrimary = getBrandPrimary();

        // 1. Full-Bleed Crisp Aerial Drone / Property Photograph
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#0b1528');
        bgGrad.addColorStop(1, '#082f49');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        const bgSrc = opts.bgImage || a.coverImage || 'assets/images/drone_all.jpg';
        const bgImg = await loadCanvasImage(bgSrc);
        if (bgImg) {
            drawCoverImage(ctx, bgImg, W, H);
        }

        // Magazine-style directional scrim: keeps center-right aerial photo bright & vivid while giving AAA contrast behind text & bottom KPI strip
        const scrim = ctx.createLinearGradient(0, 0, 0, H);
        scrim.addColorStop(0, 'rgba(9, 17, 34, 0.78)');
        scrim.addColorStop(0.32, 'rgba(9, 17, 34, 0.28)');
        scrim.addColorStop(0.58, 'rgba(9, 17, 34, 0.45)');
        scrim.addColorStop(1, 'rgba(9, 17, 34, 0.94)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, W, H);

        const leftVignette = ctx.createLinearGradient(0, 0, W * 0.72, 0);
        leftVignette.addColorStop(0, 'rgba(9, 17, 34, 0.65)');
        leftVignette.addColorStop(1, 'rgba(9, 17, 34, 0)');
        ctx.fillStyle = leftVignette;
        ctx.fillRect(0, 0, W, H * 0.65);

        const padX = 64;

        // 2. Top Publisher Masthead
        drawRoundedRect(ctx, padX, 44, 248, 38, 19);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(padX + 22, 63, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 15px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('MYFACTORYSPACE INSIGHTS', padX + 36, 64);

        const badgeText = `${String(a.category || 'INDUSTRY GUIDE').toUpperCase()}  ·  ${editionLabel.toUpperCase()}`;
        ctx.font = '700 13px Inter, sans-serif';
        const badgeW = Math.min(600, ctx.measureText(badgeText).width + 36);
        drawRoundedRect(ctx, padX + 264, 44, badgeW, 38, 19);
        ctx.fillStyle = brandPrimary;
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, padX + 282, 64);

        const rightMeta = `${a.targetCity || 'Klang Valley'}  ·  ${a.publishedAt || new Date().toISOString().slice(0, 10)}`;
        ctx.font = '600 14px Inter, sans-serif';
        const rmW = ctx.measureText(rightMeta).width + 32;
        drawRoundedRect(ctx, W - padX - rmW, 44, rmW, 38, 19);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.74)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.stroke();
        ctx.fillStyle = '#f1f5f9';
        ctx.fillText(rightMeta, W - padX - rmW + 16, 64);

        // 3. Editorial Hero Headline & Standfirst (Clean Magazine Left-Aligned Overlay)
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 48px Outfit, Inter, sans-serif';
        const heroTitleLines = wrapCanvasLines(ctx, a.title || map.centerTitle, W - padX * 2 - 220, 3);
        heroTitleLines.forEach((ln, idx) => ctx.fillText(ln, padX, 170 + idx * 58));
        ctx.restore();

        const standfirstY = 170 + heroTitleLines.length * 58 + 18;
        if (a.excerpt && standfirstY < 470) {
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '500 21px Inter, sans-serif';
            const exLines = wrapCanvasLines(ctx, a.excerpt, W - padX * 2 - 280, 2);
            exLines.forEach((ln, idx) => ctx.fillText(ln, padX, standfirstY + idx * 31));
        }

        // 4. Bottom 4-Card Frosted Glass KPI Infographic Strip
        const stripY = 588;
        const cardGap = 22;
        const cardW = (W - padX * 2 - cardGap * 3) / 4;
        const cardH = 226;

        map.branches.slice(0, 4).forEach((br, idx) => {
            const cx = padX + idx * (cardW + cardGap);
            const accent = br.color || BRANCH_PALETTE[idx % 4].color;

            ctx.save();
            drawRoundedRect(ctx, cx, stripY, cardW, cardH, 18);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.restore();

            drawRoundedRect(ctx, cx, stripY, cardW, cardH, 18);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = 1.4;
            ctx.stroke();

            // Top color strip
            drawRoundedRect(ctx, cx, stripY, cardW, 7, 4);
            ctx.fillStyle = accent;
            ctx.fill();

            // Number pill + Branch label
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.arc(cx + 28, stripY + 38, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(idx + 1), cx + 28, stripY + 39);
            ctx.textAlign = 'left';

            ctx.fillStyle = '#94a3b8';
            ctx.font = '700 13px Inter, sans-serif';
            ctx.fillText(shortClip(String(br.title || '').toUpperCase(), 24), cx + 48, stripY + 39);

            // Big Highlight Metric
            ctx.fillStyle = '#ffffff';
            ctx.font = '800 24px Outfit, Inter, sans-serif';
            ctx.fillText(shortClip(br.metric || br.title, 22), cx + 22, stripY + 84);

            // Divider
            ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.fillRect(cx + 22, stripY + 108, cardW - 44, 1);

            // 2 Crisp Short Takeaways
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '500 15px Inter, sans-serif';
            let py = stripY + 134;
            (br.points || []).slice(0, 2).forEach(pt => {
                if (py > stripY + cardH - 18) return;
                const lines = wrapCanvasLines(ctx, '• ' + pt, cardW - 44, 2);
                lines.forEach((l, li) => ctx.fillText(l, cx + 22, py + li * 21));
                py += lines.length * 21 + 10;
            });
        });

        // 5. Publisher Footer Strip
        ctx.fillStyle = 'rgba(9, 17, 34, 0.9)';
        ctx.fillRect(0, H - 52, W, 52);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(0, H - 52, W, 1);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 14px Inter, sans-serif';
        ctx.fillText('www.myfactoryspace.com  ·  HD Enhanced Industrial Infographic Photo', padX, H - 25);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#34d399';
        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillText('Verified Klang Valley Specs · Power · Floor Load · Parks', W - padX, H - 25);
        ctx.textAlign = 'left';

        const exp = await exportCanvasSafely(canvas);
        return Object.assign(exp, { mindMap: map });
    }

    async function downloadCanvasAsPng(renderFn, article, rawMindMap, suffix, opts = {}) {
        const tempCanvas = document.createElement('canvas');
        await renderFn(tempCanvas, article, rawMindMap, opts);
        try {
            const url = tempCanvas.toDataURL('image/png');
            const a = document.createElement('a');
            const safeName = String((article && article.slug) || 'myfactoryspace-insight').replace(/[^a-z0-9-]+/gi, '-');
            a.href = url;
            a.download = `${safeName}-${suffix}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            return true;
        } catch (e) {
            return false;
        }
    }

    function downloadMindMapPng(article, rawMindMap, opts = {}) {
        return downloadCanvasAsPng(renderMindMapCanvas, article, rawMindMap, 'mindmap', opts);
    }

    function downloadInfographicPhotoPng(article, rawMindMap, opts = {}) {
        return downloadCanvasAsPng(renderInfographicPhotoCanvas, article, rawMindMap, 'infographic-photo', opts);
    }

    /**
     * PUBLIC SECTION A: Standalone Interactive Executive Mind Map
     */
    function renderInteractiveMindMapSection(container, article) {
        if (!container || !article) return;
        const map = normalizeMindMap(article.mindMap, article);
        const editionLabel = EDITION_LABELS[article.edition || map.edition || 'specialized'] || EDITION_LABELS.specialized;
        const branches = map.branches.slice(0, 4);

        const renderBranchCard = (br, idx, side) => `
            <button type="button"
                class="mm-branch-card mm-side-${side}"
                data-mm-branch="${idx}"
                aria-pressed="false"
                style="--mm-accent: ${escapeHtml(br.color)}; --mm-soft: ${escapeHtml(br.soft)}; --mm-border: ${escapeHtml(br.border)};">
                <span class="mm-branch-head">
                    <span class="mm-branch-num" aria-hidden="true">${idx + 1}</span>
                    <span class="mm-branch-title-wrap">
                        <span class="mm-branch-title">${escapeHtml(br.title)}</span>
                        ${br.metric ? `<span class="mm-branch-metric">${escapeHtml(br.metric)}</span>` : ''}
                    </span>
                </span>
                <ul class="mm-branch-points">
                    ${(br.points || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
                </ul>
            </button>
        `;

        container.innerHTML = `
            <figure class="insights-mindmap-figure">
                <div class="insights-mindmap-topbar">
                    <div class="insights-mindmap-heading-wrap">
                        <span class="insights-mm-edition-pill"><i class="fa-solid fa-diagram-project" aria-hidden="true"></i> ${escapeHtml(editionLabel)}</span>
                        <h2 class="insights-mm-heading">Interactive Executive Mind Map</h2>
                    </div>
                    <div class="insights-mm-toolbar">
                        <button type="button" class="btn btn-outline insights-mm-dl-btn" data-mm-download-diagram>
                            <i class="fa-solid fa-download" aria-hidden="true"></i> Save Mind Map PNG
                        </button>
                    </div>
                </div>

                <div class="insights-mm-stage">
                    <svg class="insights-mm-connectors" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
                        <path class="mm-curve mm-curve-0" d="M 380 186 C 330 186, 330 104, 290 104" stroke="${escapeHtml(branches[0]?.color || '#059669')}" />
                        <path class="mm-curve mm-curve-1" d="M 620 186 C 670 186, 670 104, 710 104" stroke="${escapeHtml(branches[1]?.color || '#2563eb')}" />
                        <path class="mm-curve mm-curve-2" d="M 380 234 C 330 234, 330 316, 290 316" stroke="${escapeHtml(branches[2]?.color || '#7c3aed')}" />
                        <path class="mm-curve mm-curve-3" d="M 620 234 C 670 234, 670 316, 710 316" stroke="${escapeHtml(branches[3]?.color || '#d97706')}" />
                    </svg>

                    <div class="insights-mm-grid">
                        <div class="insights-mm-col insights-mm-col-left">
                            ${branches[0] ? renderBranchCard(branches[0], 0, 'left') : ''}
                            ${branches[2] ? renderBranchCard(branches[2], 2, 'left') : ''}
                        </div>

                        <div class="insights-mm-hub-col">
                            <div class="insights-mm-hub">
                                <span class="insights-mm-hub-kicker">AT-A-GLANCE HUB</span>
                                <strong class="insights-mm-hub-title">${escapeHtml(map.centerTitle)}</strong>
                                <span class="insights-mm-hub-sub">${escapeHtml(map.centerSubtitle)}</span>
                            </div>
                        </div>

                        <div class="insights-mm-col insights-mm-col-right">
                            ${branches[1] ? renderBranchCard(branches[1], 1, 'right') : ''}
                            ${branches[3] ? renderBranchCard(branches[3], 3, 'right') : ''}
                        </div>
                    </div>
                </div>

                <figcaption class="insights-mm-caption">
                    <strong>Mind Map Overview:</strong> ${escapeHtml(map.centerTitle)} structured into 4 clear pillars — ${branches.map(b => escapeHtml(b.title)).join(', ')}. Click any pillar to focus.
                </figcaption>
            </figure>
        `;

        const cards = container.querySelectorAll('.mm-branch-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const already = card.classList.contains('is-focused');
                cards.forEach(c => {
                    c.classList.remove('is-focused');
                    c.setAttribute('aria-pressed', 'false');
                });
                if (!already) {
                    card.classList.add('is-focused');
                    card.setAttribute('aria-pressed', 'true');
                }
            });
        });

        const dlBtn = container.querySelector('[data-mm-download-diagram]');
        if (dlBtn) {
            dlBtn.addEventListener('click', async () => {
                const origHtml = dlBtn.innerHTML;
                dlBtn.disabled = true;
                dlBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Exporting…';
                try {
                    await downloadMindMapPng(article, map);
                } finally {
                    dlBtn.disabled = false;
                    dlBtn.innerHTML = origHtml;
                }
            });
        }
    }

    /**
     * PUBLIC SECTION B: Standalone HD Enhanced Infographic Photo Card
     */
    function renderInfographicPhotoSection(container, article) {
        if (!container || !article) return;
        const map = normalizeMindMap(article.mindMap, article);
        const hasUploadedPhoto = Boolean(article.visualInfographic && String(article.visualInfographic).trim());

        container.innerHTML = `
            <figure class="insights-infographic-figure">
                <div class="insights-mindmap-topbar">
                    <div class="insights-mindmap-heading-wrap">
                        <span class="insights-ig-pill"><i class="fa-solid fa-camera-retro" aria-hidden="true"></i> HD Enhanced Infographic Photo</span>
                        <h2 class="insights-mm-heading">Shareable Visual Snapshot (1600&times;900)</h2>
                    </div>
                    <div class="insights-mm-toolbar">
                        <button type="button" class="btn btn-outline insights-mm-dl-btn" data-ig-download-photo>
                            <i class="fa-solid fa-download" aria-hidden="true"></i> Save Infographic PNG
                        </button>
                    </div>
                </div>

                <div class="insights-mm-photo-panel">
                    ${hasUploadedPhoto
                        ? `<img class="insights-mm-photo-img" src="${escapeHtml(article.visualInfographic)}" alt="HD enhanced infographic photo for ${escapeHtml(article.title)}" loading="lazy">`
                        : `<canvas class="insights-ig-live-canvas" width="1600" height="900" role="img" aria-label="HD enhanced infographic photo for ${escapeHtml(article.title)}"></canvas>`
                    }
                </div>

                <figcaption class="insights-mm-caption">
                    <strong>Enhanced Visual Card:</strong> Photo-first aerial briefing for ${escapeHtml(article.targetCity || 'Klang Valley')} featuring 4 live key metrics (${map.branches.map(b => escapeHtml(b.metric || b.title)).join(' · ')}). Ready to save &amp; share on WhatsApp or presentations.
                </figcaption>
            </figure>
        `;

        if (!hasUploadedPhoto) {
            const liveCanvas = container.querySelector('.insights-ig-live-canvas');
            if (liveCanvas) {
                renderInfographicPhotoCanvas(liveCanvas, article, map);
            }
        }

        const dlBtn = container.querySelector('[data-ig-download-photo]');
        if (dlBtn) {
            dlBtn.addEventListener('click', async () => {
                const origHtml = dlBtn.innerHTML;
                dlBtn.disabled = true;
                dlBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Exporting HD…';
                try {
                    await downloadInfographicPhotoPng(article, map);
                } finally {
                    dlBtn.disabled = false;
                    dlBtn.innerHTML = origHtml;
                }
            });
        }
    }

    window.InsightsVisualEngine = {
        BRANCH_PALETTE,
        EDITION_LABELS,
        normalizeMindMap,
        buildDefaultMindMapFromArticle,
        renderMindMapCanvas,
        renderInfographicPhotoCanvas,
        downloadMindMapPng,
        downloadInfographicPhotoPng,
        renderInteractiveMindMapSection,
        renderInfographicPhotoSection,
        // Backwards-compatible aliases
        renderEnhancedPhotoCanvas: renderInfographicPhotoCanvas,
        downloadEnhancedPhotoPng: downloadInfographicPhotoPng,
        renderInteractiveMindMap: renderInteractiveMindMapSection
    };
})();
