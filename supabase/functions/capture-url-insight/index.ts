import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_HTML_BYTES = 2_500_000; // 2.5 MB
const MAX_IMAGE_BYTES = 5_000_000; // 5 MB
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 12_000;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 169 && b === 254) return true; // Link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0 && parts[2] === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true; // Benchmarking
  if (a >= 224) return true; // Multicast & reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (lower === "::" || lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // Unique local
  if (/^fe[89ab]/.test(lower)) return true; // Link-local
  if (lower.startsWith("::ffff:")) {
    const mapped = lower.slice(7);
    if (isPrivateIPv4(mapped)) return true;
  }
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".home.arpa") ||
    host === "metadata.google.internal" ||
    host === "instance-data"
  ) {
    return true;
  }
  // Reject raw IPv4 / integer / octal / IPv6 private literals
  if (/^\d+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return isPrivateIPv4(host);
  if (host.includes(":")) return isPrivateIPv6(host);
  return false;
}

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error("Please enter a valid website URL starting with https:// or http://.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http:// and https:// website links are supported.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URLs containing embedded credentials are not allowed.");
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Local or private network addresses cannot be captured.");
  }

  // Defense-in-depth DNS resolution check against SSRF to private IPs
  try {
    if (typeof Deno !== "undefined" && typeof Deno.resolveDns === "function") {
      const [v4, v6] = await Promise.allSettled([
        Deno.resolveDns(parsed.hostname, "A"),
        Deno.resolveDns(parsed.hostname, "AAAA"),
      ]);
      if (v4.status === "fulfilled") {
        for (const ip of v4.value) {
          if (isPrivateIPv4(ip)) {
            throw new Error("Target host resolves to a restricted private IP address.");
          }
        }
      }
      if (v6.status === "fulfilled") {
        for (const ip of v6.value) {
          if (isPrivateIPv6(ip)) {
            throw new Error("Target host resolves to a restricted private IPv6 address.");
          }
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("restricted private")) {
      throw err;
    }
    // Ignore transient DNS lookup API errors; fetch will validate host reachability
  }

  return parsed;
}

async function safeFetchPublic(
  initialUrl: string,
  headers: Record<string, string>,
): Promise<{ response: Response; finalUrl: string }> {
  let currentUrl = (await assertPublicUrl(initialUrl)).toString();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        headers,
        redirect: "manual",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { response, finalUrl: currentUrl };
      const nextUrl = new URL(location, currentUrl).toString();
      await assertPublicUrl(nextUrl);
      currentUrl = nextUrl;
      try {
        await response.body?.cancel();
      } catch {
        // ignore cancel error
      }
      continue;
    }

    return { response, finalUrl: currentUrl };
  }

  throw new Error("Too many redirects while loading the website link.");
}

async function readResponseWithLimit(response: Response, maxBytes: number): Promise<Uint8Array> {
  const contentLen = Number(response.headers.get("content-length") || "0");
  if (Number.isFinite(contentLen) && contentLen > maxBytes) {
    throw new Error(`Remote file exceeds the ${(maxBytes / 1_000_000).toFixed(1)} MB safety limit.`);
  }
  if (!response.body) return new Uint8Array(0);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      break;
    }
    chunks.push(value);
  }

  const out = new Uint8Array(total > maxBytes ? maxBytes : total);
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = out.byteLength - offset;
    if (remaining <= 0) break;
    const slice = chunk.byteLength > remaining ? chunk.subarray(0, remaining) : chunk;
    out.set(slice, offset);
    offset += slice.byteLength;
  }
  return out;
}

function uint8ToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function decodeHtmlEntities(input: string): string {
  if (!input) return "";
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    mdash: "—",
    ndash: "–",
    rsquo: "'",
    lsquo: "'",
    rdquo: '"',
    ldquo: '"',
    hellip: "…",
    bull: "•",
    middot: "·",
    copy: "©",
    reg: "®",
    trade: "™",
  };
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/&([a-z]+);/gi, (full, name) => named[name.toLowerCase()] ?? full);
}

function cleanText(raw: string): string {
  const decoded = decodeHtmlEntities(String(raw || ""));
  return decodeHtmlEntities(
    decoded
      .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\[\d+\]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim(),
  );
}

function parseAttributes(tagHtml: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z0-9_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(tagHtml)) !== null) {
    const key = match[1].toLowerCase();
    const val = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[key] = decodeHtmlEntities(val.trim());
  }
  return attrs;
}

function resolveImageUrl(rawSrc: string, baseUrl: string): string | null {
  const trimmed = String(rawSrc || "").trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("javascript:") || trimmed.startsWith("blob:")) {
    return null;
  }
  try {
    const resolved = new URL(trimmed, baseUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
    if (isBlockedHostname(resolved.hostname)) return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

function pickBestFromSrcset(srcset: string): string {
  if (!srcset) return "";
  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split(/\s+/);
      const url = parts[0] || "";
      const descriptor = parts[1] || "";
      let score = 0;
      if (descriptor.endsWith("w")) score = parseInt(descriptor, 10) || 0;
      else if (descriptor.endsWith("x")) score = Math.round((parseFloat(descriptor) || 1) * 800);
      return { url, score };
    })
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.url || "";
}

function isLikelyUsefulPhoto(url: string, alt = "", widthAttr = "", heightAttr = ""): boolean {
  const lower = url.toLowerCase();
  if (/\.(svg|ico|gif)(\?|$)/i.test(lower)) return false;
  const junkPattern =
    /(favicon|sprite|spacer|pixel|tracking|analytics|doubleclick|googlesyndication|gravatar|avatar|emoji|icon[-_/]|logo[-_/.]|badge|button|arrow|chevron|social|share|whatsapp|facebook|twitter|linkedin|instagram|youtube|tiktok|placeholder|blank\.|1x1|adsystem|banner-ad)/i;
  if (junkPattern.test(lower)) return false;
  if (/^(logo|icon|avatar|share|close|menu|search)$/i.test(alt.trim())) return false;

  const w = parseInt(widthAttr, 10);
  const h = parseInt(heightAttr, 10);
  if ((Number.isFinite(w) && w > 0 && w < 180) || (Number.isFinite(h) && h > 0 && h < 120)) {
    return false;
  }
  return true;
}

function extractJsonLdData(html: string): {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  articleBody: string;
  images: string[];
} {
  const result = {
    title: "",
    description: "",
    author: "",
    publishedAt: "",
    articleBody: "",
    images: [] as string[],
  };

  const scriptRegex = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  const pushImages = (imgVal: unknown) => {
    if (!imgVal) return;
    if (typeof imgVal === "string") {
      result.images.push(imgVal);
    } else if (Array.isArray(imgVal)) {
      for (const item of imgVal) pushImages(item);
    } else if (typeof imgVal === "object") {
      const obj = imgVal as Record<string, unknown>;
      if (typeof obj.url === "string") result.images.push(obj.url);
      else if (typeof obj.contentUrl === "string") result.images.push(obj.contentUrl);
    }
  };

  const visitNode = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) visitNode(item);
      return;
    }
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj["@graph"])) visitNode(obj["@graph"]);

    const typeRaw = Array.isArray(obj["@type"]) ? obj["@type"].join(" ") : String(obj["@type"] || "");
    const isArticleLike = /(Article|NewsArticle|BlogPosting|Report|WebPage|AnalysisNewsArticle)/i.test(typeRaw);

    if (isArticleLike) {
      if (!result.title && typeof obj.headline === "string") result.title = cleanText(obj.headline);
      if (!result.title && typeof obj.name === "string") result.title = cleanText(obj.name);
      if (!result.description && typeof obj.description === "string") {
        result.description = cleanText(obj.description);
      }
      if (!result.publishedAt && typeof obj.datePublished === "string") {
        result.publishedAt = obj.datePublished.slice(0, 10);
      }
      if (!result.articleBody && typeof obj.articleBody === "string") {
        result.articleBody = cleanText(obj.articleBody);
      }
      if (!result.author && obj.author) {
        if (typeof obj.author === "string") result.author = cleanText(obj.author);
        else if (Array.isArray(obj.author) && obj.author[0] && typeof obj.author[0] === "object") {
          const name = (obj.author[0] as Record<string, unknown>).name;
          if (typeof name === "string") result.author = cleanText(name);
        } else if (typeof obj.author === "object") {
          const name = (obj.author as Record<string, unknown>).name;
          if (typeof name === "string") result.author = cleanText(name);
        }
      }
      pushImages(obj.image);
      pushImages(obj.thumbnailUrl);
    }
  };

  while ((match = scriptRegex.exec(html)) !== null) {
    const rawJson = match[1].trim();
    if (!rawJson || rawJson.length > 500_000) continue;
    try {
      const parsed = JSON.parse(rawJson);
      visitNode(parsed);
    } catch {
      // Ignore malformed JSON-LD blocks
    }
  }

  return result;
}

function detectBotOrGateBlock(status: number, headers: Headers, html: string): string | null {
  const cfMitigated = (headers.get("cf-mitigated") || "").toLowerCase();
  if (cfMitigated.includes("challenge")) {
    return "This website uses anti-bot verification that blocks automated link capture. Please switch to 'Paste Text / Notes' to turn its content into a MyFactorySpace draft.";
  }
  if (status === 401 || status === 403 || status === 429 || status === 451) {
    return `This website returned HTTP ${status} and restricts automated access or requires a login/subscription. Switch to 'Paste Text / Notes' to create your MyFactorySpace version instead.`;
  }
  const lower = html.toLowerCase();
  const shortBody = html.length < 35_000;
  if (
    shortBody &&
    (lower.includes("just a moment...") ||
      lower.includes("cf-turnstile") ||
      lower.includes("verify you are human") ||
      lower.includes("enable javascript and cookies to continue") ||
      lower.includes("attention required! | cloudflare") ||
      lower.includes("access to this page has been denied"))
  ) {
    return "This website requires human verification or blocks automated previews. Please switch to 'Paste Text / Notes' and paste the key article points instead.";
  }
  return null;
}

function isBoilerplateLine(text: string, minLen = 40): boolean {
  const lower = text.toLowerCase();
  return (
    /(cookie policy|accept all cookies|privacy policy|terms of service|subscribe now|sign up for our newsletter|already a subscriber|all rights reserved|follow us on|share this article|read more:|advertisement|sponsored content|javascript is required)/i.test(
      lower,
    ) || text.length < minLen
  );
}

function extractHighlights(paragraphs: string[], bullets: string[]): string[] {
  const pool = [...bullets, ...paragraphs];
  const signalRegex =
    /(RM\s?[\d,.]+|\b\d+(\.\d+)?\s?(%|percent|sq\s?ft|sqft|acres?|hectares?|billion|million|kVA|MW|Amp|tons?|psf|psf\/mth|years?)\b|\b(MIDA|MITI|BOMBA|TNB|DOE|CCC|ESG|FDI|GDP|WCE|NKVE|ELITE|KESAS|ECRL|Port Klang|Shah Alam|Petaling Jaya|Subang Jaya|Klang Valley|Selangor|Freehold|Leasehold|warehouse|factory|industrial|logistics|manufacturing|data cent(?:re|er))\b)/i;

  const hits: string[] = [];
  const seen = new Set<string>();

  for (const block of pool) {
    const sentences = block.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
    for (const s of sentences) {
      if (s.length < 35 || s.length > 260) continue;
      if (!signalRegex.test(s)) continue;
      const key = s.toLowerCase().slice(0, 70);
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push(s);
      if (hits.length >= 10) return hits;
    }
  }
  return hits;
}

function parseCapturedHtml(html: string, finalUrl: string) {
  const parsedUrl = new URL(finalUrl);
  const domain = parsedUrl.hostname.replace(/^www\./i, "");

  // 1. Meta tags
  const meta: Record<string, string> = {};
  const metaImages: Array<{ url: string; alt: string; source: string }> = [];
  const metaRegex = /<meta\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRegex.exec(html)) !== null) {
    const attrs = parseAttributes(m[0]);
    const key = (attrs.property || attrs.name || attrs["http-equiv"] || "").toLowerCase();
    const content = attrs.content || "";
    if (!key || !content) continue;
    if (!meta[key]) meta[key] = content;
    if (
      key === "og:image" ||
      key === "og:image:url" ||
      key === "og:image:secure_url" ||
      key === "twitter:image" ||
      key === "twitter:image:src"
    ) {
      const resolved = resolveImageUrl(content, finalUrl);
      if (resolved) {
        metaImages.push({
          url: resolved,
          alt: meta["og:image:alt"] || meta["twitter:image:alt"] || "",
          source: key,
        });
      }
    }
  }

  // Canonical & image_src link tags
  let canonicalUrl = finalUrl;
  const linkRegex = /<link\b[^>]*>/gi;
  while ((m = linkRegex.exec(html)) !== null) {
    const attrs = parseAttributes(m[0]);
    const rel = (attrs.rel || "").toLowerCase();
    if (rel === "canonical" && attrs.href) {
      const resolved = resolveImageUrl(attrs.href, finalUrl);
      if (resolved) canonicalUrl = resolved;
    } else if (rel === "image_src" && attrs.href) {
      const resolved = resolveImageUrl(attrs.href, finalUrl);
      if (resolved) metaImages.push({ url: resolved, alt: "", source: "link:image_src" });
    }
  }

  // 2. JSON-LD structured data
  const jsonLd = extractJsonLdData(html);

  // 3. <title>
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const rawDocTitle = titleMatch ? cleanText(titleMatch[1]) : "";

  // 4. Clean content scope (strip scripts/styles/chrome)
  const stripped = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|nav|header|footer|aside|form|button)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");

  const articleMatch = stripped.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = stripped.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const contentScope =
    (articleMatch && articleMatch[1].length > 300 && articleMatch[1]) ||
    (mainMatch && mainMatch[1].length > 300 && mainMatch[1]) ||
    stripped;

  // 5. Headings
  const headings: string[] = [];
  const headingSeen = new Set<string>();
  const headingRegex = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let firstH1 = "";
  while ((m = headingRegex.exec(contentScope)) !== null) {
    const text = cleanText(m[2]);
    if (!text || text.length < 6 || text.length > 180) continue;
    if (m[1] === "1" && !firstH1) firstH1 = text;
    const key = text.toLowerCase();
    if (headingSeen.has(key)) continue;
    headingSeen.add(key);
    headings.push(text);
    if (headings.length >= 12) break;
  }

  // 6. Paragraphs
  const paragraphs: string[] = [];
  const paraSeen = new Set<string>();
  const paraRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  while ((m = paraRegex.exec(contentScope)) !== null) {
    const text = cleanText(m[1]);
    if (!text || text.length > 1400 || isBoilerplateLine(text)) continue;
    const key = text.toLowerCase().slice(0, 80);
    if (paraSeen.has(key)) continue;
    paraSeen.add(key);
    paragraphs.push(text);
    if (paragraphs.length >= 26) break;
  }

  // Fallback to JSON-LD articleBody if HTML paragraphs were sparse (common on JS-rendered news sites)
  if (paragraphs.length < 3 && jsonLd.articleBody && jsonLd.articleBody.length > 120) {
    const sentences = jsonLd.articleBody.split(/(?<=[.!?])\s+/);
    let buf = "";
    for (const s of sentences) {
      if ((buf + " " + s).length > 340 && buf.length > 80) {
        paragraphs.push(buf.trim());
        buf = s;
      } else {
        buf = (buf + " " + s).trim();
      }
      if (paragraphs.length >= 18) break;
    }
    if (buf.length > 60 && paragraphs.length < 18) paragraphs.push(buf.trim());
  }

  // 7. Bullets
  const bullets: string[] = [];
  const bulletSeen = new Set<string>();
  const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  while ((m = liRegex.exec(contentScope)) !== null) {
    const text = cleanText(m[1]);
    if (!text || text.length < 22 || text.length > 260 || isBoilerplateLine(text, 22)) continue;
    const key = text.toLowerCase().slice(0, 70);
    if (bulletSeen.has(key)) continue;
    bulletSeen.add(key);
    bullets.push(text);
    if (bullets.length >= 12) break;
  }

  // 8. Images gallery (deduplicated, high-signal first)
  const images: Array<{ url: string; alt: string; source: string }> = [];
  const imgSeen = new Set<string>();
  const pushPhoto = (rawUrl: string, alt: string, source: string, w = "", h = "") => {
    const resolved = resolveImageUrl(rawUrl, finalUrl);
    if (!resolved) return;
    if (source === "article-img" && !isLikelyUsefulPhoto(resolved, alt, w, h)) return;
    if (/\.(svg|ico)(\?|$)/i.test(resolved)) return;
    const dedupKey = resolved.replace(/^https?:\/\//i, "").split("#")[0];
    if (imgSeen.has(dedupKey)) return;
    imgSeen.add(dedupKey);
    images.push({ url: resolved, alt: cleanText(alt).slice(0, 140), source });
  };

  for (const mi of metaImages) pushPhoto(mi.url, mi.alt, mi.source);
  for (const ji of jsonLd.images) pushPhoto(ji, "", "json-ld");

  const imgRegex = /<img\b[^>]*>/gi;
  const imgScanScope = contentScope.length > 200 ? contentScope : html;
  while ((m = imgRegex.exec(imgScanScope)) !== null) {
    if (images.length >= 12) break;
    const attrs = parseAttributes(m[0]);
    const srcsetCandidate = pickBestFromSrcset(attrs.srcset || attrs["data-srcset"] || "");
    const candidate =
      attrs["data-src"] ||
      attrs["data-lazy-src"] ||
      attrs["data-original"] ||
      attrs["data-image"] ||
      srcsetCandidate ||
      attrs.src ||
      "";
    if (!candidate) continue;
    pushPhoto(candidate, attrs.alt || attrs.title || "", "article-img", attrs.width || "", attrs.height || "");
  }

  const title = cleanText(
    meta["og:title"] ||
      meta["twitter:title"] ||
      jsonLd.title ||
      firstH1 ||
      rawDocTitle ||
      domain,
  );
  const description = cleanText(
    meta["og:description"] ||
      meta.description ||
      meta["twitter:description"] ||
      jsonLd.description ||
      paragraphs[0] ||
      "",
  );
  const siteName = cleanText(meta["og:site_name"] || domain);
  const author = cleanText(meta.author || meta["article:author"] || jsonLd.author || "");
  const publishedAt = (
    meta["article:published_time"] ||
    meta["og:updated_time"] ||
    jsonLd.publishedAt ||
    ""
  ).slice(0, 10);

  const highlights = extractHighlights(paragraphs, bullets);
  const wordCount = paragraphs
    .concat(bullets)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    ok: true,
    url: canonicalUrl,
    fetchedUrl: finalUrl,
    domain,
    siteName,
    title,
    description,
    author,
    publishedAt,
    headings,
    paragraphs,
    bullets,
    highlights,
    images,
    wordCount,
  };
}

interface PublicNewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  description: string;
  image: string;
  directUrl: boolean;
}

function extractXmlTag(block: string, tagName: string): string {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i");
  const m = block.match(re);
  if (!m) return "";
  return m[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, "$1").trim();
}

function formatPubDateIso(rawDate: string): string {
  if (!rawDate) return "";
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function unwrapBingNewsUrl(rawLink: string): { url: string; directUrl: boolean } {
  const clean = decodeHtmlEntities(rawLink).trim();
  try {
    const parsed = new URL(clean);
    if (parsed.hostname.includes("bing.com") && parsed.searchParams.has("url")) {
      const target = parsed.searchParams.get("url") || "";
      const targetUrl = new URL(target);
      if ((targetUrl.protocol === "http:" || targetUrl.protocol === "https:") && !isBlockedHostname(targetUrl.hostname)) {
        return { url: targetUrl.toString(), directUrl: true };
      }
    }
    if ((parsed.protocol === "http:" || parsed.protocol === "https:") && !isBlockedHostname(parsed.hostname)) {
      return { url: parsed.toString(), directUrl: !parsed.hostname.includes("news.google.com") };
    }
  } catch {
    // ignore malformed
  }
  return { url: "", directUrl: false };
}

async function fetchPublicRssFeed(feedUrl: string, provider: "bing" | "google"): Promise<PublicNewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9_000);
  try {
    const res = await fetch(feedUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
        "Accept-Language": "en-MY,en-US;q=0.9,en;q=0.8",
      },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const bytes = await readResponseWithLimit(res, 1_500_000);
    const xml = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    const items: PublicNewsItem[] = [];
    const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
    let m: RegExpExecArray | null;

    while ((m = itemRegex.exec(xml)) !== null) {
      const block = m[1];
      let title = cleanText(extractXmlTag(block, "title"));
      const rawLink = extractXmlTag(block, "link");
      const rawDesc = extractXmlTag(block, "description");
      const pubDate = formatPubDateIso(extractXmlTag(block, "pubDate"));

      let source = cleanText(
        extractXmlTag(block, "News:Source") ||
          extractXmlTag(block, "source") ||
          "",
      );

      // Google News titles often end with " - Publisher"
      if (provider === "google" && source && title.endsWith(` - ${source}`)) {
        title = title.slice(0, -(source.length + 3)).trim();
      }

      const { url, directUrl } = unwrapBingNewsUrl(rawLink);
      if (!title || !url) continue;

      if (!source) {
        try {
          source = new URL(url).hostname.replace(/^www\./i, "");
        } catch {
          source = "Public News";
        }
      }

      const rawImg =
        decodeHtmlEntities(extractXmlTag(block, "News:Image")) ||
        decodeHtmlEntities((block.match(/<media:content\b[^>]*url\s*=\s*["']([^"']+)["']/i) || [])[1] || "") ||
        decodeHtmlEntities((block.match(/<enclosure\b[^>]*url\s*=\s*["']([^"']+)["']/i) || [])[1] || "");
      const safeImg = rawImg ? resolveImageUrl(rawImg, url) || "" : "";

      let description = cleanText(rawDesc).slice(0, 320);
      if (
        !description ||
        description.toLowerCase().startsWith(title.toLowerCase().slice(0, 28)) ||
        description.length < 25
      ) {
        description = `Original industrial market coverage published by ${source}. Click Original Link to read the full article or Capture & Preview to draft your MyFactorySpace version.`;
      }
      items.push({
        title,
        url,
        source,
        publishedAt: pubDate,
        description,
        image: safeImg,
        directUrl,
      });
      if (items.length >= 12) break;
    }

    return items;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function discoverPublicIndustrialNews(rawQuery: string, city = ""): Promise<{
  query: string;
  providersUsed: string[];
  items: PublicNewsItem[];
}> {
  const baseQuery = String(rawQuery || "").trim() || "Malaysia Klang Valley industrial property warehouse factory";
  const cityPrefix = city && !baseQuery.toLowerCase().includes(city.toLowerCase()) ? `${city} ` : "";
  const fullQuery = `${cityPrefix}${baseQuery}`.trim();
  const encoded = encodeURIComponent(fullQuery);

  const bingUrl = `https://www.bing.com/news/search?q=${encoded}&format=rss&mkt=en-MY`;
  const googleUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-MY&gl=MY&ceid=MY:en`;

  const [bingItems, googleItems] = await Promise.all([
    fetchPublicRssFeed(bingUrl, "bing"),
    fetchPublicRssFeed(googleUrl, "google"),
  ]);

  const providersUsed: string[] = [];
  if (bingItems.length) providersUsed.push("Bing News MY");
  if (googleItems.length) providersUsed.push("Google News MY");

  // Deduplicate and rank freshest Malaysia industrial articles first (tie-breaking on direct publisher URLs)
  const merged = [...bingItems, ...googleItems];
  const deduped: PublicNewsItem[] = [];
  const seenKeys = new Set<string>();

  for (const item of merged) {
    const titleKey = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 52);
    if (!titleKey || seenKeys.has(titleKey)) continue;
    seenKeys.add(titleKey);
    deduped.push(item);
  }

  // Rank direct publisher links (EdgeProp.my, The Star, FMT, NST, Bernama) first, then newest date
  deduped.sort((a, b) => {
    if (a.directUrl !== b.directUrl) return Number(b.directUrl) - Number(a.directUrl);
    const da = a.publishedAt || "0000-00-00";
    const db = b.publishedAt || "0000-00-00";
    return db.localeCompare(da);
  });

  return { query: fullQuery, providersUsed, items: deduped.slice(0, 10) };
}

async function captureWebpageInternal(targetUrl: string) {
  const { response, finalUrl } = await safeFetchPublic(targetUrl, {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-MY,en-US;q=0.9,en;q=0.8",
  });

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  const rawBytes = await readResponseWithLimit(response, MAX_HTML_BYTES);
  const html = new TextDecoder("utf-8", { fatal: false }).decode(rawBytes);

  const blockMsg = detectBotOrGateBlock(response.status, response.headers, html);
  if (blockMsg) {
    return { ok: false, blocked: true, status: response.status, error: blockMsg };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: `Website returned HTTP ${response.status}. Check the link or use 'Paste Text / Notes'.`,
    };
  }

  if (contentType && !contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
    return {
      ok: false,
      error: `This link points to "${contentType.split(";")[0]}" rather than a readable webpage. Paste a news or article webpage URL instead.`,
    };
  }

  const parsed = parseCapturedHtml(html, finalUrl);
  if (!parsed.title && parsed.paragraphs.length === 0 && parsed.images.length === 0) {
    return {
      ok: false,
      blocked: true,
      error: "This page appears to require JavaScript or login to display its article content. Switch to 'Paste Text / Notes' to create your draft.",
    };
  }
  return parsed;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed. Use POST." }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ ok: false, error: "Invalid JSON request body." }, 400);
    }

    const action = String(body.action || "capture").toLowerCase();

    // ACTION 0A: Discover fresh public Malaysia / Klang Valley industrial news from public RSS feeds
    if (action === "discover_public") {
      const query = String(body.query || "").trim();
      const city = String(body.city || "").trim();
      const discovery = await discoverPublicIndustrialNews(query, city);
      if (!discovery.items.length) {
        return jsonResponse(
          {
            ok: false,
            query: discovery.query,
            error: "No public news articles matched that query right now. Try a broader keyword like 'Selangor warehouse factory' or 'Malaysia industrial property'.",
          },
          200,
        );
      }
      return jsonResponse({
        ok: true,
        query: discovery.query,
        providersUsed: discovery.providersUsed,
        items: discovery.items,
      });
    }

    // ACTION 0B: Auto-discover top fresh public news & capture full article + photos (with RSS multi-story fallback)
    if (action === "discover_and_capture") {
      const query = String(body.query || "").trim();
      const city = String(body.city || "").trim();
      const excludeUrls = new Set(
        (Array.isArray(body.excludeUrls) ? body.excludeUrls : []).map((u: unknown) => String(u || "").toLowerCase()),
      );
      const excludeTitles = new Set(
        (Array.isArray(body.excludeTitles) ? body.excludeTitles : []).map((t: unknown) =>
          String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 42),
        ),
      );

      const discovery = await discoverPublicIndustrialNews(query, city);
      if (!discovery.items.length) {
        return jsonResponse(
          {
            ok: false,
            error: "Could not find fresh public industrial news for that topic. Try a different keyword or switch to Inventory / Website Link.",
          },
          200,
        );
      }

      const freshItems = discovery.items.filter((it) => {
        const tKey = it.title.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 42);
        return !excludeUrls.has(it.url.toLowerCase()) && !excludeTitles.has(tKey);
      });
      const ranked = freshItems.length ? freshItems : discovery.items;

      // Try direct-URL candidates first (up to 3) so we capture rich text + photos without bypassing any bot gate
      const directCandidates = ranked.filter((it) => it.directUrl).slice(0, 3);
      for (const candidate of directCandidates) {
        try {
          const cap = await captureWebpageInternal(candidate.url);
          if (cap && cap.ok && ((cap.paragraphs && cap.paragraphs.length >= 2) || (cap.images && cap.images.length >= 1))) {
            const imgs = Array.isArray(cap.images) ? [...cap.images] : [];
            if (!imgs.length && candidate.image) {
              imgs.push({ url: candidate.image, alt: candidate.title, source: "public-news" });
            }
            return jsonResponse({
              ...cap,
              images: imgs,
              siteName: candidate.source || cap.siteName,
              publishedAt: candidate.publishedAt || cap.publishedAt,
              discoveredFrom: discovery.providersUsed.join(" & ") || "Public News",
              relatedHeadlines: ranked.slice(0, 5).map((r) => `${r.title} (${r.source})`),
            });
          }
        } catch {
          // Try next public article
        }
      }

      // Fallback: Synthesize clean public-feed brief from top discovered public items (never bypasses paywalls/bots)
      const lead = ranked[0];
      const images: Array<{ url: string; alt: string; source: string }> = [];
      for (const item of ranked) {
        if (item.image && !images.some((i) => i.url === item.image)) {
          images.push({ url: item.image, alt: item.title, source: "public-news" });
          if (images.length >= 6) break;
        }
      }
      const paragraphs = ranked
        .slice(0, 6)
        .map((r) => (r.description && r.description.length > 35 ? `${r.title} (${r.source}): ${r.description}` : `${r.title} — reported by ${r.source}.`));
      const highlights = extractHighlights(paragraphs, ranked.slice(0, 6).map((r) => r.title));

      let leadDomain = lead.source || "public-news";
      try {
        leadDomain = new URL(lead.url).hostname.replace(/^www\./i, "");
      } catch {
        // keep source
      }

      return jsonResponse({
        ok: true,
        url: lead.url,
        fetchedUrl: lead.url,
        domain: leadDomain,
        siteName: lead.source || leadDomain,
        title: lead.title,
        description: lead.description || paragraphs[0] || "",
        author: "",
        publishedAt: lead.publishedAt,
        headings: ranked.slice(0, 5).map((r) => r.title),
        paragraphs,
        bullets: ranked.slice(0, 5).map((r) => `${r.title} (${r.source})`),
        highlights: highlights.length ? highlights : paragraphs.slice(0, 5),
        images,
        wordCount: paragraphs.join(" ").split(/\s+/).filter(Boolean).length,
        discoveredFrom: discovery.providersUsed.join(" & ") || "Public News",
        synthesizedFromFeed: true,
      });
    }

    // ACTION 1: Server-side safe image import (CORS-free for HD Infographic Canvas & Supabase Storage)
    if (action === "import_image") {
      const imageUrl = String(body.imageUrl || "").trim();
      if (!imageUrl) {
        return jsonResponse({ ok: false, error: "Missing imageUrl parameter." }, 400);
      }

      const { response } = await safeFetchPublic(imageUrl, {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "image/webp,image/png,image/jpeg,image/gif,*/*;q=0.5",
      });

      if (!response.ok) {
        return jsonResponse(
          { ok: false, error: `Could not download photo (HTTP ${response.status}).` },
          200,
        );
      }

      const rawCt = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      if (!ALLOWED_IMAGE_TYPES.has(rawCt)) {
        return jsonResponse(
          { ok: false, error: `Unsupported image format (${rawCt || "unknown"}). Only JPG, PNG, WebP, and GIF are allowed.` },
          200,
        );
      }

      const bytes = await readResponseWithLimit(response, MAX_IMAGE_BYTES);
      if (!bytes.byteLength) {
        return jsonResponse({ ok: false, error: "Captured image was empty." }, 200);
      }

      const contentType = rawCt === "image/jpg" ? "image/jpeg" : rawCt;
      const base64 = uint8ToBase64(bytes);
      return jsonResponse({
        ok: true,
        contentType,
        byteLength: bytes.byteLength,
        dataUrl: `data:${contentType};base64,${base64}`,
      });
    }

    // ACTION 2: Capture webpage metadata, photos, and clean article facts
    const targetUrl = String(body.url || "").trim();
    if (!targetUrl) {
      return jsonResponse({ ok: false, error: "Please enter a website URL to capture." }, 400);
    }

    const captured = await captureWebpageInternal(targetUrl);
    return jsonResponse(captured, 200);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "The website took too long to respond (12s timeout). Try again or use 'Paste Text / Notes'."
          : err.message
        : "Unexpected error capturing website link.";
    return jsonResponse({ ok: false, error: message }, 200);
  }
});
