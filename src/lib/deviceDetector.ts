/**
 * Real-time Hardware & Device Telemetry Detector
 * Captures 100% genuine visitor device specs without fake/demo fallbacks.
 */

export interface RealTelemetryData {
  deviceModel: string;
  deviceType: string;
  os: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  batteryLevel: number | null;
  isCharging: boolean | null;
  webglVendor: string;
  webglRenderer: string;
  gpuChipset: string;
  touchPoints: number;
  screenResolution: string;
  screenColorDepth: number | null;
  timezone: string;
  language: string;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  networkType: string;
  userAgent: string;
}

// Map common Android model codes to actual commercial marketing names
function resolveCommercialModel(rawModel: string): string {
  if (!rawModel) return '';
  const clean = rawModel.trim();

  // Samsung Galaxy Series
  if (/^SM-S928/i.test(clean)) return 'Samsung Galaxy S24 Ultra';
  if (/^SM-S926/i.test(clean)) return 'Samsung Galaxy S24+';
  if (/^SM-S921/i.test(clean)) return 'Samsung Galaxy S24';
  if (/^SM-S918/i.test(clean)) return 'Samsung Galaxy S23 Ultra';
  if (/^SM-S916/i.test(clean)) return 'Samsung Galaxy S23+';
  if (/^SM-S911/i.test(clean)) return 'Samsung Galaxy S23';
  if (/^SM-S908/i.test(clean)) return 'Samsung Galaxy S22 Ultra';
  if (/^SM-G998/i.test(clean)) return 'Samsung Galaxy S21 Ultra';
  if (/^SM-G991/i.test(clean)) return 'Samsung Galaxy S21';
  if (/^SM-A556/i.test(clean)) return 'Samsung Galaxy A55';
  if (/^SM-A546/i.test(clean)) return 'Samsung Galaxy A54';
  if (/^SM-A536/i.test(clean)) return 'Samsung Galaxy A53';
  if (/^SM-A356/i.test(clean)) return 'Samsung Galaxy A35';
  if (/^SM-A346/i.test(clean)) return 'Samsung Galaxy A34';
  if (/^SM-A256/i.test(clean)) return 'Samsung Galaxy A25';
  if (/^SM-A155|^SM-A156/i.test(clean)) return 'Samsung Galaxy A15';
  if (/^SM-A145|^SM-A146/i.test(clean)) return 'Samsung Galaxy A14';
  if (/^SM-A055|^SM-A057/i.test(clean)) return 'Samsung Galaxy A05';
  if (/^SM-F946/i.test(clean)) return 'Samsung Galaxy Z Fold 5';
  if (/^SM-F731/i.test(clean)) return 'Samsung Galaxy Z Flip 5';
  if (/^SM-[A-Za-z0-9]+/i.test(clean)) return `Samsung ${clean.toUpperCase()}`;

  // Tecno Series
  if (/^CK8n/i.test(clean)) return 'Tecno Camon 20 Pro 5G';
  if (/^CK7n/i.test(clean)) return 'Tecno Camon 20 Premier';
  if (/^CK6n/i.test(clean)) return 'Tecno Camon 20';
  if (/^LH8n/i.test(clean)) return 'Tecno Spark 20 Pro+';
  if (/^BG6/i.test(clean)) return 'Tecno Spark 20';
  if (/^KJ5/i.test(clean)) return 'Tecno Spark 20C';

  // Infinix Series
  if (/^X6836/i.test(clean)) return 'Infinix Zero 30';
  if (/^X6831/i.test(clean)) return 'Infinix Hot 30';
  if (/^X6837/i.test(clean)) return 'Infinix Hot 40 Pro';
  if (/^X6525/i.test(clean)) return 'Infinix Smart 8';
  if (/^X6823/i.test(clean)) return 'Infinix Note 30';
  if (/^X6850/i.test(clean)) return 'Infinix Note 40 Pro';
  if (/^X\d{4}/i.test(clean)) return `Infinix ${clean.toUpperCase()}`;

  // Xiaomi / Redmi / POCO
  if (/^23124RN87G|^2312DRA50G/i.test(clean)) return 'Redmi Note 13 Pro';
  if (/^23129RAA4G/i.test(clean)) return 'Redmi Note 13';
  if (/^22101316G/i.test(clean)) return 'Xiaomi 13 Pro';
  if (/^2311DRK48G/i.test(clean)) return 'POCO X6 Pro';
  if (/^2201116PG/i.test(clean)) return 'POCO X4 Pro';

  // Vivo / iQOO
  if (/^V2324A|^V2309/i.test(clean)) return 'Vivo X100';
  if (/^V2318/i.test(clean)) return 'Vivo V30';
  if (/^V2250/i.test(clean)) return 'Vivo V27';
  if (/^V2111/i.test(clean)) return 'Vivo Y21';
  if (/^V\d{4}/i.test(clean)) return `Vivo ${clean.toUpperCase()}`;

  // Realme & Oppo
  if (/^RMX\d{4}/i.test(clean)) return `Realme ${clean.toUpperCase()}`;
  if (/^CPH\d{4}/i.test(clean)) return `Oppo ${clean.toUpperCase()}`;

  // Google Pixel
  if (/Pixel/i.test(clean)) return clean;

  return clean;
}

/**
 * Format real GPU chipset from WebGL renderer string
 */
export function formatGpuChipset(rawGpu?: string | null): string {
  if (!rawGpu || rawGpu === 'Unknown' || rawGpu === 'Generic') {
    return 'Not Detected';
  }

  // MediaTek / ARM Mali
  if (/mali[- ]?g720/i.test(rawGpu)) return 'ARM Mali-G720 (MediaTek Dimensity 9300)';
  if (/mali[- ]?g715/i.test(rawGpu)) return 'ARM Mali-G715 (MediaTek Dimensity 9200)';
  if (/mali[- ]?g710/i.test(rawGpu)) return 'ARM Mali-G710 (Dimensity 9000 / Tensor)';
  if (/mali[- ]?g77/i.test(rawGpu)) return 'ARM Mali-G77 (MediaTek Dimensity 8050)';
  if (/mali[- ]?g68/i.test(rawGpu)) return 'ARM Mali-G68 (Dimensity 1080 / Exynos)';
  if (/mali[- ]?g57/i.test(rawGpu)) return 'ARM Mali-G57 (Dimensity 700 / Helio G99)';
  if (/mali[- ]?g52/i.test(rawGpu)) return 'ARM Mali-G52 (Helio G88 / G85)';
  if (/mali/i.test(rawGpu)) {
    const match = rawGpu.match(/Mali-[A-Za-z0-9\s]+/i);
    return match ? `ARM ${match[0]}` : 'ARM Mali GPU';
  }

  // Qualcomm Adreno
  if (/adreno/i.test(rawGpu)) {
    const match = rawGpu.match(/Adreno\s*(?:\(TM\))?\s*(\d+)/i);
    const num = match ? match[1] : '';
    if (num === '750') return 'Qualcomm Adreno 750 (Snapdragon 8 Gen 3)';
    if (num === '740') return 'Qualcomm Adreno 740 (Snapdragon 8 Gen 2)';
    if (num === '730') return 'Qualcomm Adreno 730 (Snapdragon 8 Gen 1)';
    if (num === '660') return 'Qualcomm Adreno 660 (Snapdragon 888)';
    if (num === '650') return 'Qualcomm Adreno 650 (Snapdragon 865)';
    if (num === '642' || num === '642L') return `Qualcomm Adreno ${num} (Snapdragon 778G)`;
    if (num === '619') return 'Qualcomm Adreno 619 (Snapdragon 695)';
    if (num === '610') return 'Qualcomm Adreno 610 (Snapdragon 680)';
    return num ? `Qualcomm Adreno ${num}` : 'Qualcomm Adreno GPU';
  }

  // Apple GPU
  if (/apple/i.test(rawGpu)) {
    return 'Apple Silicon GPU';
  }

  // PowerVR
  if (/powervr/i.test(rawGpu)) {
    const match = rawGpu.match(/PowerVR\s*[A-Za-z0-9]+/i);
    return match ? match[0] : 'PowerVR GPU';
  }

  // Intel Graphics
  if (/intel/i.test(rawGpu)) {
    const match = rawGpu.match(/Intel\(R\)\s*[^,\)]+/i) || rawGpu.match(/Intel\s*[^,\)]+/i);
    return match ? match[0].trim() : 'Intel Graphics';
  }

  // NVIDIA
  if (/nvidia|geforce|rtx|gtx/i.test(rawGpu)) {
    const match = rawGpu.match(/(GeForce\s*[^,\)]+|RTX\s*[^,\)]+|GTX\s*[^,\)]+)/i);
    return match ? `NVIDIA ${match[0].trim()}` : 'NVIDIA GeForce GPU';
  }

  // AMD Radeon
  if (/amd|radeon/i.test(rawGpu)) {
    const match = rawGpu.match(/Radeon\s*[^,\)]+/i);
    return match ? `AMD ${match[0].trim()}` : 'AMD Radeon GPU';
  }

  // Clean ANGLE wrappers
  const cleaned = rawGpu
    .replace(/^ANGLE \(([^,]+),\s*([^,\)]+).*\)$/, '$1 — $2')
    .replace(/^Google Inc\. \((.+)\)$/, '$1')
    .trim();

  return cleaned || rawGpu;
}

/**
 * Capture 100% real visitor hardware and device telemetry.
 * Safe timeout guarantees redirect never hangs.
 */
export async function collectRealVisitorTelemetry(): Promise<RealTelemetryData> {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const touchPoints = typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number'
    ? navigator.maxTouchPoints
    : 0;

  // 1. Client Hints (Real Model, OS Version, Architecture in modern Chrome / Chromium)
  let rawModel = '';
  let clientPlatform = '';
  let clientPlatformVersion = '';
  let clientBrand = '';

  if (typeof navigator !== 'undefined' && (navigator as any).userAgentData) {
    try {
      const uad = (navigator as any).userAgentData;
      if (uad.brands && Array.isArray(uad.brands)) {
        const candidate = uad.brands.find((b: any) => !b.brand.includes('Not') && !b.brand.includes('Chromium'));
        if (candidate) clientBrand = candidate.brand;
      }
      if (typeof uad.getHighEntropyValues === 'function') {
        const hints: any = await Promise.race([
          uad.getHighEntropyValues(['model', 'platform', 'platformVersion', 'architecture', 'bitness']),
          new Promise(res => setTimeout(res, 200))
        ]);
        if (hints) {
          if (hints.model) rawModel = hints.model;
          if (hints.platform) clientPlatform = hints.platform;
          if (hints.platformVersion) clientPlatformVersion = hints.platformVersion;
        }
      }
    } catch {}
  }

  // 2. Fallback Model Detection from User-Agent String
  if (!rawModel && ua) {
    // Check known vendor patterns in UA
    const samsungMatch = ua.match(/\b(SM-[A-Za-z0-9]+)\b/i);
    const tecnoMatch = ua.match(/\b(Tecno[\s\-][A-Za-z0-9\s]+?)(?=[;\)\/])/i);
    const infinixMatch = ua.match(/\b(Infinix[\s\-][A-Za-z0-9\s]+?)(?=[;\)\/])/i);
    const redmiMatch = ua.match(/\b(Redmi[\s\-][A-Za-z0-9\s]+?)(?=[;\)\/])/i);
    const xiaomiMatch = ua.match(/\b(POCO[\s\-][A-Za-z0-9\s]+?|Mi[\s\-][A-Za-z0-9\s]+?)(?=[;\)\/])/i);
    const genericBuildMatch = ua.match(/;\s*([A-Za-z0-9\-\_\s]{3,30})\s+Build\//i);

    if (samsungMatch) rawModel = samsungMatch[1];
    else if (tecnoMatch) rawModel = tecnoMatch[1].trim();
    else if (infinixMatch) rawModel = infinixMatch[1].trim();
    else if (redmiMatch) rawModel = redmiMatch[1].trim();
    else if (xiaomiMatch) rawModel = xiaomiMatch[1].trim();
    else if (genericBuildMatch) {
      const candidate = genericBuildMatch[1].trim();
      if (!/^(Linux|Android|U|arm|x86|Release|Version)/i.test(candidate)) {
        rawModel = candidate;
      }
    }
  }

  // 3. Resolve OS and Category
  let osName = clientPlatform || 'Unknown';
  let osVersion = clientPlatformVersion || '';

  if (osName === 'Unknown' || !osName) {
    if (/android/i.test(ua)) osName = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) osName = 'iOS';
    else if (/windows nt 10\.0/i.test(ua)) osName = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) osName = 'macOS';
    else if (/linux/i.test(ua)) osName = 'Linux';
  }

  // Parse OS Version from UA if not from Client Hints
  if (!osVersion && ua) {
    if (osName === 'Android') {
      const m = ua.match(/Android\s+([0-9\.]+)/i);
      if (m) osVersion = m[1];
    } else if (osName === 'iOS') {
      const m = ua.match(/OS\s+([0-9\_]+)/i);
      if (m) osVersion = m[1].replace(/_/g, '.');
    } else if (osName === 'Windows') {
      if (/Windows NT 10\.0/i.test(ua)) osVersion = '10/11';
      else if (/Windows NT 6\.3/i.test(ua)) osVersion = '8.1';
      else if (/Windows NT 6\.1/i.test(ua)) osVersion = '7';
    } else if (osName === 'macOS') {
      const m = ua.match(/Mac OS X\s+([0-9\_]+)/i);
      if (m) osVersion = m[1].replace(/_/g, '.');
    }
  }

  // Formatted Device Model
  let finalDeviceModel = '';
  if (rawModel) {
    finalDeviceModel = resolveCommercialModel(rawModel);
  } else {
    if (osName === 'Android') finalDeviceModel = 'Android Phone';
    else if (osName === 'iOS') finalDeviceModel = /ipad/i.test(ua) ? 'Apple iPad' : 'Apple iPhone';
    else if (osName === 'Windows') finalDeviceModel = 'Windows PC';
    else if (osName === 'macOS') finalDeviceModel = 'Apple Mac';
    else if (osName === 'Linux') finalDeviceModel = 'Linux Desktop';
    else finalDeviceModel = touchPoints > 0 ? 'Mobile Device' : 'Desktop PC';
  }

  const isMobile = /android|iphone|ipod/i.test(ua) || (touchPoints > 0 && screen.width < 768);
  const isTablet = /ipad|tablet/i.test(ua) || (touchPoints > 0 && screen.width >= 768 && screen.width <= 1024);
  const category = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';
  const formattedDeviceType = `${finalDeviceModel} (${category})`;

  // 4. Browser Detection
  let browser = clientBrand || 'Unknown';
  let browserVersion = '';
  if (ua) {
    if (/edg\//i.test(ua)) {
      browser = 'Edge';
      browserVersion = (ua.match(/edg\/([0-9\.]+)/i) || [])[1] || '';
    } else if (/chrome\//i.test(ua) && !/opr|opera/i.test(ua)) {
      browser = 'Chrome';
      browserVersion = (ua.match(/chrome\/([0-9\.]+)/i) || [])[1] || '';
    } else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) {
      browser = 'Safari';
      browserVersion = (ua.match(/version\/([0-9\.]+)/i) || [])[1] || '';
    } else if (/firefox\//i.test(ua)) {
      browser = 'Firefox';
      browserVersion = (ua.match(/firefox\/([0-9\.]+)/i) || [])[1] || '';
    } else if (/opr|opera/i.test(ua)) {
      browser = 'Opera';
      browserVersion = (ua.match(/(?:opr|opera)\/([0-9\.]+)/i) || [])[1] || '';
    }
  }

  // 5. Real Battery Status (async promise race max 200ms)
  let batteryLevel: number | null = null;
  let isCharging: boolean | null = null;
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery: any = await Promise.race([
        (navigator as any).getBattery(),
        new Promise(res => setTimeout(res, 200))
      ]);
      if (battery && typeof battery.level === 'number') {
        batteryLevel = Number(battery.level.toFixed(2));
        isCharging = !!battery.charging;
      }
    } catch {}
  }

  // 6. Real WebGL Renderer & Vendor
  let webglVendor = 'Unknown';
  let webglRenderer = 'Unknown';
  if (typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglVendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
          webglRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
        }
      }
    } catch {}
  }

  const gpuChipset = formatGpuChipset(webglRenderer !== 'Unknown' ? webglRenderer : webglVendor);

  // 7. Screen, Locale, Hardware
  const screenResolution = typeof window !== 'undefined'
    ? `${window.screen.width}×${window.screen.height}`
    : 'Unknown';
  const screenColorDepth = typeof window !== 'undefined' ? window.screen.colorDepth || null : null;
  const timezone = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown'
    : 'Unknown';
  const language = typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en';
  const hardwareConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || null : null;
  const deviceMemory = typeof navigator !== 'undefined' ? (navigator as any).deviceMemory || null : null;
  const networkType = typeof navigator !== 'undefined'
    ? ((navigator as any).connection?.effectiveType || (navigator as any).connection?.type || 'Unknown')
    : 'Unknown';

  const formattedOs = osVersion ? `${osName} ${osVersion}` : osName;

  return {
    deviceModel: finalDeviceModel,
    deviceType: formattedDeviceType,
    os: formattedOs,
    osVersion: formattedOs,
    browser: browserVersion ? `${browser} ${browserVersion.split('.')[0]}` : browser,
    browserVersion,
    batteryLevel,
    isCharging,
    webglVendor,
    webglRenderer,
    gpuChipset,
    touchPoints,
    screenResolution,
    screenColorDepth,
    timezone,
    language,
    hardwareConcurrency,
    deviceMemory,
    networkType,
    userAgent: ua,
  };
}
