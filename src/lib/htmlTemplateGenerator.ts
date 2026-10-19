export interface HtmlTemplateOptions {
  developerName?: string;
  channelUrl?: string;
  brandName?: string;
  apiEndpoint?: string;
  tier?: 'free' | 'pro' | 'premium';
}

/**
 * Main dispatcher to generate standalone single-file HTML client
 * according to the user's subscription tier:
 * - 'free': Clean Minimalist Flat UI
 * - 'pro': Sleek Modern Cyber-Glass Dark UI
 * - 'premium': Exact 3D Claymorphic Liquid Glass OS UI (Full Experience)
 */
export function generateStandaloneHtml(options: HtmlTemplateOptions): string {
  const tier = options.tier || 'premium';

  if (tier === 'free') {
    return generateSimpleFreeHtml(options);
  } else if (tier === 'pro') {
    return generateModernProHtml(options);
  } else {
    return generatePremiumClayGlassHtml(options);
  }
}

// =========================================================================
// 1. FREE TIER: Clean Minimalist Flat UI
// =========================================================================
function generateSimpleFreeHtml(options: HtmlTemplateOptions): string {
  const {
    developerName = 'Muhammad Saqib',
    channelUrl = 'https://youtube.com/@saqibvisuals',
    brandName = 'Saqib Visuals',
    apiEndpoint = 'http://localhost:3005',
  } = options;

  const safeDevName = developerName.replace(/"/g, '&quot;');
  const safeChannelUrl = channelUrl.replace(/"/g, '&quot;');
  const safeBrandName = brandName.replace(/"/g, '&quot;');
  const cleanApiEndpoint = apiEndpoint.replace(/\/+$/, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrandName} - Standard Shortlink Client (Free Tier)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 md:p-8">
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <header class="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
          🔗
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-bold text-slate-900">${safeBrandName}</h1>
          <p class="text-xs text-slate-500">Standard URL Shortener (Free Tier)</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">Dev: ${safeDevName}</span>
        <a href="${safeChannelUrl}" target="_blank" rel="noreferrer" class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors">
          Channel ↗
        </a>
      </div>
    </header>

    <!-- Shortener Form -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
      <h2 class="text-base font-bold text-slate-900">Shorten URL</h2>
      <form id="shortenForm" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Destination URL</label>
          <input type="url" id="longUrl" required placeholder="https://example.com" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Custom Alias (Optional)</label>
            <input type="text" id="customAlias" placeholder="alias" class="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Tracking ID / User ID</label>
            <input type="text" id="phoneNumber" placeholder="dev-user" value="${safeDevName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'dev'}" class="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div class="flex flex-wrap gap-4 pt-1 text-xs">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="captureCamera" class="rounded text-blue-600" checked />
            <span class="text-slate-700">Camera Check</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="captureLocation" class="rounded text-blue-600" checked />
            <span class="text-slate-700">Location GPS Check</span>
          </label>
        </div>
        <button type="submit" id="submitBtn" class="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
          Create Link
        </button>
      </form>

      <div id="alertBox" class="hidden p-3 rounded-lg text-xs font-medium"></div>

      <!-- Result Box -->
      <div id="resultCard" class="hidden p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
        <div class="flex items-center justify-between text-xs font-semibold text-blue-900">
          <span>Link Created!</span>
          <span id="resultShortCode" class="font-mono text-slate-600"></span>
        </div>
        <div class="flex gap-2">
          <input type="text" id="resultUrlInput" readonly class="flex-1 px-3 py-2 text-xs font-mono bg-white border border-blue-200 rounded-lg select-all" />
          <button type="button" id="copyBtn" class="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">Copy</button>
          <a id="openLinkBtn" href="#" target="_blank" rel="noreferrer" class="px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50">Open ↗</a>
        </div>
      </div>
    </div>

    <!-- Upgrade Notice -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900">
      <div>
        <p class="font-bold">✨ Want the 3D Liquid Clay Glass UI?</p>
        <p class="text-amber-700">Upgrade your account or apply a Pro/VIP coupon to download the full 3D Glass OS client with sound &amp; live GPS maps!</p>
      </div>
      <a href="${safeChannelUrl}" target="_blank" rel="noreferrer" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold shrink-0">Upgrade</a>
    </div>

    <!-- Telemetry Table -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">Recent Visitor Logs</h3>
        <button id="fetchLogsBtn" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50">Refresh Logs</button>
      </div>
      <div id="logsContainer" class="text-xs text-slate-500 text-center py-4">Click "Refresh Logs" to load recent visitors.</div>
    </div>

    <!-- Footer -->
    <footer class="text-center text-xs text-slate-500 py-3">
      Developed by ${safeDevName} • ${safeBrandName}
    </footer>
  </div>

  <script>
    const API_BASE = '${cleanApiEndpoint}';
    const shortenForm = document.getElementById('shortenForm');
    const submitBtn = document.getElementById('submitBtn');
    const alertBox = document.getElementById('alertBox');
    const resultCard = document.getElementById('resultCard');
    const resultUrlInput = document.getElementById('resultUrlInput');
    const resultShortCode = document.getElementById('resultShortCode');
    const copyBtn = document.getElementById('copyBtn');
    const openLinkBtn = document.getElementById('openLinkBtn');
    const fetchLogsBtn = document.getElementById('fetchLogsBtn');
    const logsContainer = document.getElementById('logsContainer');

    function showAlert(msg, isErr) {
      alertBox.className = isErr ? 'p-3 rounded-lg text-xs bg-red-50 border border-red-200 text-red-800 block' : 'p-3 rounded-lg text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 block';
      alertBox.textContent = msg;
    }

    shortenForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');
      resultCard.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating...';
      try {
        const res = await fetch(\`\${API_BASE}/api/shorten\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            longUrl: document.getElementById('longUrl').value.trim(),
            customAlias: document.getElementById('customAlias').value.trim() || undefined,
            phoneNumber: document.getElementById('phoneNumber').value.trim() || undefined,
            captureCamera: document.getElementById('captureCamera').checked,
            captureLocation: document.getElementById('captureLocation').checked,
            deviceId: 'standalone-free'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          resultCard.classList.remove('hidden');
          resultUrlInput.value = data.shortUrl;
          resultShortCode.textContent = data.data?.short_code || '';
          openLinkBtn.href = data.shortUrl;
          showAlert('Smart link created successfully!');
          setTimeout(loadLogs, 1500);
        } else {
          showAlert(data.message || 'Failed to create link', true);
        }
      } catch (err) {
        showAlert('Network error: ' + err.message, true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Link';
      }
    });

    copyBtn.addEventListener('click', () => {
      resultUrlInput.select();
      navigator.clipboard.writeText(resultUrlInput.value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });

    async function loadLogs() {
      const phone = document.getElementById('phoneNumber').value.trim();
      logsContainer.innerHTML = 'Loading...';
      try {
        const q = phone ? \`phoneNumber=\${encodeURIComponent(phone)}\` : 'deviceId=standalone-free';
        const res = await fetch(\`\${API_BASE}/api/shorten?\${q}\`);
        const data = await res.json();
        if (res.ok && data.success && data.logs?.length) {
          logsContainer.innerHTML = data.logs.map(l => \`
            <div class="border-b border-slate-100 py-2 flex items-center justify-between text-left">
              <div>
                <span class="font-mono font-bold text-slate-800">\${l.ip_address || 'IP'}</span>
                <span class="text-slate-400 ml-2">\${l.location_name || ''}</span>
              </div>
              <span class="text-slate-400">\${new Date(l.created_at).toLocaleTimeString()}</span>
            </div>
          \`).join('');
        } else {
          logsContainer.innerHTML = 'No logs yet.';
        }
      } catch (err) {
        logsContainer.innerHTML = 'Error loading logs.';
      }
    }
    fetchLogsBtn.addEventListener('click', loadLogs);
  </script>
</body>
</html>`;
}

// =========================================================================
// 2. PRO TIER: Sleek Modern Cyber-Glass Dark UI
// =========================================================================
function generateModernProHtml(options: HtmlTemplateOptions): string {
  const {
    developerName = 'Muhammad Saqib',
    channelUrl = 'https://youtube.com/@saqibvisuals',
    brandName = 'Saqib Visuals',
    apiEndpoint = 'http://localhost:3005',
  } = options;

  const safeDevName = developerName.replace(/"/g, '&quot;');
  const safeChannelUrl = channelUrl.replace(/"/g, '&quot;');
  const safeBrandName = brandName.replace(/"/g, '&quot;');
  const cleanApiEndpoint = apiEndpoint.replace(/\/+$/, '');

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrandName} - Pro Cyber-Glass Client</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .cyber-glass {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.2);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .neon-glow {
      box-shadow: 0 0 20px -5px rgba(6, 182, 212, 0.5);
    }
  </style>
</head>
<body class="min-h-screen bg-[#070b14] text-slate-100 p-3 sm:p-6 md:p-8 relative overflow-x-hidden">
  <!-- Neon ambient glow points -->
  <div class="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

  <div class="relative z-10 max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <header class="cyber-glass rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/20">
          💎
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-display text-lg font-bold text-white tracking-wide">${safeBrandName}</h1>
            <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold">PRO EDITION</span>
          </div>
          <p class="text-xs text-slate-400 font-mono">Cyber Telemetry Engine</p>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <div class="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-cyan-400 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Dev: ${safeDevName}</span>
        </div>
        <a href="${safeChannelUrl}" target="_blank" rel="noreferrer" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20">
          Channel ↗
        </a>
      </div>
    </header>

    <!-- Create Card -->
    <div class="cyber-glass rounded-2xl p-6 sm:p-7 space-y-5">
      <div>
        <h2 class="font-display text-xl font-bold text-white">Generate Cyber Smart Link</h2>
        <p class="text-xs text-slate-400 mt-1">Endpoint: <code class="font-mono text-cyan-400">${cleanApiEndpoint}</code></p>
      </div>

      <form id="shortenForm" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Target Long URL</label>
          <input type="url" id="longUrl" required placeholder="https://target.com" class="w-full px-4 py-3 text-sm font-mono rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Custom Alias</label>
            <input type="text" id="customAlias" placeholder="cyber-alias" class="w-full px-4 py-2.5 text-sm font-mono rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Sync ID / Phone</label>
            <input type="text" id="phoneNumber" value="${safeDevName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'dev'}" class="w-full px-4 py-2.5 text-sm font-mono rounded-xl bg-slate-900/80 border border-slate-700 focus:border-cyan-400 focus:outline-none text-white" />
          </div>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap gap-4 text-xs font-semibold">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="captureCamera" class="rounded text-cyan-500" checked />
            <span class="text-slate-200">📸 Camera Verification</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="captureLocation" class="rounded text-cyan-500" checked />
            <span class="text-slate-200">📍 GPS Telemetry</span>
          </label>
        </div>
        <button type="submit" id="submitBtn" class="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all neon-glow">
          ⚡ Spawn Protected Link
        </button>
      </form>

      <div id="alertBox" class="hidden p-3.5 rounded-xl text-xs font-mono font-bold"></div>

      <div id="resultCard" class="hidden p-5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-4">
        <div class="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
          <span>⚡ TARGET LINK SPAWNED</span>
          <span id="resultShortCode" class="text-slate-400"></span>
        </div>
        <div class="flex gap-2">
          <input type="text" id="resultUrlInput" readonly class="flex-1 px-4 py-2.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 select-all" />
          <button type="button" id="copyBtn" class="px-4 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-cyan-400 transition-colors">Copy</button>
          <a id="openLinkBtn" href="#" target="_blank" rel="noreferrer" class="px-3.5 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700">Open ↗</a>
        </div>
        <div class="flex items-center gap-4 pt-3 border-t border-slate-800">
          <img id="qrCodeImg" src="" alt="QR" class="w-16 h-16 rounded-lg bg-white p-1" />
          <div class="text-xs text-slate-400 font-mono">Scan QR to trigger verification flow directly on mobile devices.</div>
        </div>
      </div>
    </div>

    <!-- Telemetry Intel Stream -->
    <div class="cyber-glass rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-display text-base font-bold text-white flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Visitor Telemetry</span>
        </h3>
        <button id="fetchLogsBtn" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700">Sync Telemetry</button>
      </div>
      <div id="logsContainer" class="space-y-2 text-xs font-mono text-slate-400">
        <div class="py-6 text-center text-slate-500">Telemetry ready. Sync to monitor traffic.</div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="text-center text-xs font-mono text-slate-500 py-4">
      Architected by ${safeDevName} • ${safeBrandName}
    </footer>
  </div>

  <script>
    const API_BASE = '${cleanApiEndpoint}';
    const shortenForm = document.getElementById('shortenForm');
    const submitBtn = document.getElementById('submitBtn');
    const alertBox = document.getElementById('alertBox');
    const resultCard = document.getElementById('resultCard');
    const resultUrlInput = document.getElementById('resultUrlInput');
    const resultShortCode = document.getElementById('resultShortCode');
    const copyBtn = document.getElementById('copyBtn');
    const openLinkBtn = document.getElementById('openLinkBtn');
    const qrCodeImg = document.getElementById('qrCodeImg');
    const fetchLogsBtn = document.getElementById('fetchLogsBtn');
    const logsContainer = document.getElementById('logsContainer');

    function showAlert(msg, isErr) {
      alertBox.className = isErr ? 'p-3.5 rounded-xl text-xs font-mono bg-rose-950/40 border border-rose-500/40 text-rose-300 block' : 'p-3.5 rounded-xl text-xs font-mono bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 block';
      alertBox.textContent = msg;
    }

    shortenForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');
      resultCard.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Spawning Link...';
      try {
        const res = await fetch(\`\${API_BASE}/api/shorten\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            longUrl: document.getElementById('longUrl').value.trim(),
            customAlias: document.getElementById('customAlias').value.trim() || undefined,
            phoneNumber: document.getElementById('phoneNumber').value.trim() || undefined,
            captureCamera: document.getElementById('captureCamera').checked,
            captureLocation: document.getElementById('captureLocation').checked,
            deviceId: 'standalone-pro'
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          resultCard.classList.remove('hidden');
          resultUrlInput.value = data.shortUrl;
          resultShortCode.textContent = \`[\${data.data?.short_code || ''}]\`;
          openLinkBtn.href = data.shortUrl;
          qrCodeImg.src = \`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${encodeURIComponent(data.shortUrl)}\`;
          showAlert('Link spawned into active telemetry nodes!');
          setTimeout(loadLogs, 1500);
        } else {
          showAlert(data.message || 'Generation rejected', true);
        }
      } catch (err) {
        showAlert('API Exception: ' + err.message, true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '⚡ Spawn Protected Link';
      }
    });

    copyBtn.addEventListener('click', () => {
      resultUrlInput.select();
      navigator.clipboard.writeText(resultUrlInput.value);
      copyBtn.textContent = 'Copied';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });

    async function loadLogs() {
      const phone = document.getElementById('phoneNumber').value.trim();
      logsContainer.innerHTML = 'Connecting to nodes...';
      try {
        const q = phone ? \`phoneNumber=\${encodeURIComponent(phone)}\` : 'deviceId=standalone-pro';
        const res = await fetch(\`\${API_BASE}/api/shorten?\${q}\`);
        const data = await res.json();
        if (res.ok && data.success && data.logs?.length) {
          logsContainer.innerHTML = data.logs.map(l => \`
            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-cyan-400 font-bold">\${l.ip_address || 'IP'}</span>
                <span class="text-slate-500">\${new Date(l.created_at).toLocaleTimeString()}</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 text-[11px]">
                <div>📍 \${l.location_name || 'N/A'}</div>
                <div>💻 \${l.os || 'OS'} / \${l.browser || 'Browser'}</div>
                <div>📱 \${l.device_type || 'Device'}</div>
                <div>🔋 \${l.battery_level !== null ? Math.round(l.battery_level * 100) + '%' : 'N/A'}</div>
              </div>
              \${l.captured_image ? \`
                <div class="pt-2">
                  <img src="\${l.captured_image}" alt="Cam" class="w-24 h-16 object-cover rounded-lg border border-slate-700" />
                </div>
              \` : ''}
            </div>
          \`).join('');
        } else {
          logsContainer.innerHTML = '<div class="py-6 text-center text-slate-500">No telemetry packets received yet.</div>';
        }
      } catch (err) {
        logsContainer.innerHTML = 'Error fetching telemetry.';
      }
    }
    fetchLogsBtn.addEventListener('click', loadLogs);
  </script>
</body>
</html>`;
}

// =========================================================================
// 3. PREMIUM VIP TIER: Exact 3D Claymorphic Liquid Glass OS UI (Full Experience)
// =========================================================================
function generatePremiumClayGlassHtml(options: HtmlTemplateOptions): string {
  const {
    developerName = 'Muhammad Saqib',
    channelUrl = 'https://youtube.com/@saqibvisuals',
    brandName = 'Saqib Visuals',
    apiEndpoint = 'http://localhost:3005',
  } = options;

  const safeDevName = developerName.replace(/"/g, '&quot;');
  const safeChannelUrl = channelUrl.replace(/"/g, '&quot;');
  const safeBrandName = brandName.replace(/"/g, '&quot;');
  const cleanApiEndpoint = apiEndpoint.replace(/\/+$/, '');

  // Extract letters for cartoon header
  const parts = (developerName || 'Saqib').trim().split(/\s+/);
  const targetWord = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).toUpperCase().slice(0, 8);
  const cartoonLetters = targetWord.split('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrandName} - 3D Liquid Glass OS Client (Premium VIP)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=JetBrains+Mono:wght@500;700;800&family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .font-fredoka { font-family: 'Fredoka', cursive; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* 3D Claymorphic Liquid Glass Box */
    .liquid-glass-box {
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.09),
        0 2px 4px 0 rgba(0, 0, 0, 0.02),
        inset 0 1px 2px 0 rgba(255, 255, 255, 0.95),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.04);
      border: 2px solid rgba(255, 255, 255, 0.95);
    }

    .liquid-glass-input {
      background: rgba(255, 255, 255, 0.85);
      border: 1.5px solid rgba(255, 255, 255, 0.95);
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.04);
    }

    /* Tactile Candy Glass Orbs */
    .glass-orb {
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 
        0 8px 16px -4px rgba(0, 0, 0, 0.12),
        inset 0 2px 3px rgba(255, 255, 255, 0.9),
        inset 0 -2px 3px rgba(0, 0, 0, 0.15);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .glass-orb:active {
      transform: scale(0.92);
    }

    .orb-blue {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: 1.5px solid rgba(255, 255, 255, 0.8);
    }

    .orb-green {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: 1.5px solid rgba(255, 255, 255, 0.8);
    }

    .orb-amber {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #78350f;
      border: 1.5px solid rgba(255, 255, 255, 0.9);
    }

    .orb-champagne {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      color: #78350f;
      border: 1.5px solid rgba(255, 255, 255, 0.95);
    }

    /* Ambient Floating Blobs */
    .ambient-blob {
      position: fixed;
      border-radius: 9999px;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.55;
      animation: floatSlow 18s infinite alternate ease-in-out;
    }

    @keyframes floatSlow {
      0% { transform: translate(0px, 0px) scale(1); }
      100% { transform: translate(35px, 45px) scale(1.12); }
    }

    /* Cartoon Pop Letters */
    .cartoon-letter {
      font-family: 'Fredoka', cursive;
      font-weight: 700;
      display: inline-block;
      text-shadow: 
        0 1px 0 #fff,
        0 2px 0 #fff,
        0 3px 0 rgba(0,0,0,0.1),
        0 5px 10px rgba(0,0,0,0.12);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cartoon-letter:hover {
      transform: translateY(-4px) scale(1.15) rotate(0deg) !important;
    }
  </style>
</head>
<body class="min-h-screen bg-[#e8ecf4] text-zinc-900 relative overflow-x-hidden p-3 sm:p-6 md:p-8">

  <!-- Colorful Ambient Refraction Blobs -->
  <div class="ambient-blob w-80 h-80 bg-blue-400/40 -top-10 -left-10"></div>
  <div class="ambient-blob w-96 h-96 bg-purple-400/35 top-96 -right-20" style="animation-delay: -5s;"></div>
  <div class="ambient-blob w-80 h-80 bg-emerald-400/30 bottom-10 left-1/3" style="animation-delay: -10s;"></div>

  <div class="relative z-10 max-w-4xl mx-auto space-y-6">

    <!-- Top Sticky Header with Cartoon Title, VIP Badge & Channel Button -->
    <header class="liquid-glass-box rounded-[28px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="relative group cursor-pointer" onclick="playBubblePop(620)">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/25 border-2 border-white/80">
            ⚡
          </div>
          <span class="glass-orb orb-blue w-5 h-5 text-[9px] text-white absolute -top-1.5 -left-1.5 shadow-sm flex items-center justify-center pointer-events-none">
            📸
          </span>
          <span class="glass-orb orb-green w-5 h-5 text-[9px] text-white absolute -bottom-1 -right-1.5 shadow-sm flex items-center justify-center pointer-events-none">
            📍
          </span>
        </div>
        <div>
          <!-- Cartoon Brand Name -->
          <div class="flex items-center gap-0.5 text-xl sm:text-2xl leading-none select-none cursor-pointer" onclick="playBubblePop(720)">
            ${cartoonLetters.map((char, i) => {
              const colors = ['text-[#2e45b8]', 'text-[#e03c28]', 'text-[#f2b726]', 'text-[#278c68]', 'text-[#8b5cf6]'];
              const rots = ['-rotate-6', 'rotate-3', '-rotate-3', 'rotate-6', '-rotate-6'];
              return `<span class="cartoon-letter ${colors[i % colors.length]} ${rots[i % rots.length]}">${char}</span>`;
            }).join('')}
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-[10px] sm:text-[11px] text-zinc-600 font-extrabold uppercase tracking-wider">${safeBrandName}</span>
            <span class="px-2 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black uppercase tracking-wider shadow-xs">👑 VIP OS</span>
          </div>
        </div>
      </div>

      <!-- Developer Credentials Badge & Official Channel Button -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-950 text-xs font-black flex items-center gap-1.5 shadow-xs" onclick="playBubblePop(540)">
          <span>👨‍💻</span>
          <span>Dev: <strong class="text-indigo-700">${safeDevName}</strong></span>
        </div>
        <a 
          href="${safeChannelUrl}" 
          target="_blank" 
          rel="noopener noreferrer" 
          onclick="playBubblePop(750)"
          class="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-xs font-black shadow-md shadow-rose-500/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span>📢</span>
          <span>Official Channel</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </div>
    </header>

    <!-- Main 3D Clay Creation Box -->
    <div class="liquid-glass-box rounded-[32px] p-5 sm:p-7 md:p-8 shadow-2xl space-y-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">
          <span>✨</span>
          <span>3D Liquid Glass OS • Interactive Generator</span>
        </div>
        <h2 class="text-xl sm:text-2xl md:text-3xl font-black text-zinc-950 tracking-tight">
          Create Smart Protected Link
        </h2>
        <p class="text-xs sm:text-sm text-zinc-600 font-semibold mt-1">
          Connected directly to API endpoint: <code class="font-mono text-indigo-700 font-bold bg-white/70 px-2 py-0.5 rounded-lg border border-zinc-300 text-[11px]">${cleanApiEndpoint}</code>
        </p>
      </div>

      <form id="shortenForm" class="space-y-4">
        <!-- Target Long URL -->
        <div class="space-y-1.5">
          <label class="text-xs font-black uppercase tracking-wider text-zinc-800 block">
            Target Destination URL <span class="text-rose-500">*</span>
          </label>
          <input 
            type="url" 
            id="longUrl" 
            required 
            placeholder="https://example.com/target-page"
            class="w-full text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl liquid-glass-input text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
          />
        </div>

        <!-- Row: Custom Alias & User Identifier -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1.5">
            <label class="text-xs font-black uppercase tracking-wider text-zinc-800 block">
              Custom Alias (Optional)
            </label>
            <input 
              type="text" 
              id="customAlias" 
              placeholder="e.g. secret-link-99"
              class="w-full text-xs sm:text-sm font-mono font-bold px-4 py-2.5 rounded-2xl liquid-glass-input text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-black uppercase tracking-wider text-zinc-800 block">
              User ID / Phone (Sync Identifier)
            </label>
            <input 
              type="text" 
              id="phoneNumber" 
              placeholder="e.g. developer-01 or +123456"
              value="${safeDevName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'dev'}"
              class="w-full text-xs sm:text-sm font-mono font-bold px-4 py-2.5 rounded-2xl liquid-glass-input text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <!-- Verification Options with 3D Pills -->
        <div class="p-4 rounded-2xl bg-white/60 border border-white/80 shadow-xs space-y-3">
          <p class="text-xs font-black uppercase tracking-wider text-zinc-800">Verification &amp; Capture Options</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-zinc-200/70 cursor-pointer select-none" onclick="playBubblePop(450)">
              <input type="checkbox" id="captureCamera" class="w-4 h-4 rounded text-indigo-600 cursor-pointer" checked />
              <div class="text-xs">
                <span class="font-extrabold text-zinc-900 block">📸 Camera Verification</span>
                <span class="text-[10.5px] text-zinc-500 font-medium">Prompts visitor for camera check</span>
              </div>
            </label>

            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-zinc-200/70 cursor-pointer select-none" onclick="playBubblePop(450)">
              <input type="checkbox" id="captureLocation" class="w-4 h-4 rounded text-indigo-600 cursor-pointer" checked />
              <div class="text-xs">
                <span class="font-extrabold text-zinc-900 block">📍 Location Verification</span>
                <span class="text-[10.5px] text-zinc-500 font-medium">Prompts visitor for GPS location</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Submit Button (Tactile 3D Orb Button) -->
        <button 
          type="submit" 
          id="submitBtn"
          onclick="playBubblePop(780)"
          class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/60"
        >
          <span>⚡ Generate Protected Smart Link</span>
        </button>
      </form>

      <!-- Alert Message Box -->
      <div id="alertBox" class="hidden p-3.5 rounded-2xl text-xs font-bold"></div>

      <!-- Result Box with 3D Preview -->
      <div id="resultCard" class="hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-blue-50/90 border-2 border-indigo-200/90 shadow-md space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
            <span>🎉</span>
            <span>Link Created Successfully!</span>
          </span>
          <span class="text-[10.5px] font-mono text-zinc-500 font-bold" id="resultShortCode"></span>
        </div>

        <div class="flex items-center gap-2">
          <input 
            type="text" 
            id="resultUrlInput" 
            readonly 
            class="flex-1 text-xs sm:text-sm font-mono font-black px-4 py-2.5 rounded-xl bg-white border border-indigo-300 text-indigo-950 select-all shadow-inner"
          />
          <button 
            type="button" 
            id="copyBtn"
            onclick="playBubblePop(650)"
            class="glass-orb orb-blue px-4 py-2.5 text-xs font-black shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            📋 Copy
          </button>
          <a 
            id="openLinkBtn" 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            onclick="playBubblePop(680)"
            class="glass-orb orb-champagne px-3.5 py-2.5 text-xs font-black active:scale-95 transition-all cursor-pointer shrink-0"
          >
            ↗ Open
          </a>
        </div>

        <!-- QR Code & Download Button -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-indigo-200/60">
          <div class="flex items-center gap-3">
            <img id="qrCodeImg" src="" alt="QR Code" class="w-20 h-20 rounded-xl border border-white shadow-md bg-white p-1" />
            <div class="text-xs space-y-1">
              <p class="font-extrabold text-zinc-900">Scan QR Code</p>
              <p class="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                Scan on mobile to trigger facial camera &amp; GPS verification flow.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="downloadQrBtn"
            onclick="playBubblePop(720)"
            class="glass-orb orb-green px-3.5 py-2 text-xs font-bold shadow-sm"
          >
            ⬇ Download QR
          </button>
        </div>
      </div>
    </div>

    <!-- Live Captured Logs Stream Box (Full 3D Glass) -->
    <div class="liquid-glass-box rounded-[32px] p-5 sm:p-7 shadow-xl space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-black text-zinc-950 flex items-center gap-2">
            <span>📡</span>
            <span>Captured Visitor Intel Stream</span>
          </h3>
          <p class="text-[11px] text-zinc-500 font-semibold">Realtime telemetry synced with your identifier</p>
        </div>
        <button 
          id="fetchLogsBtn"
          onclick="playBubblePop(550)"
          class="glass-orb orb-champagne px-4 py-2 text-xs font-black shadow-xs flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>Refresh Intel Logs</span>
        </button>
      </div>

      <div id="logsContainer" class="space-y-3">
        <p class="text-xs text-zinc-500 font-semibold text-center py-6 bg-white/50 rounded-2xl border border-zinc-200/60">
          Click "Refresh Intel Logs" to view visitor analytics for your links.
        </p>
      </div>
    </div>

    <!-- Footer Signature -->
    <footer class="text-center py-4 space-y-1.5">
      <p class="text-xs font-extrabold text-zinc-700">
        Engineered &amp; Designed with 💎 by <strong class="text-indigo-700">${safeDevName}</strong>
      </p>
      <p class="text-[11px] text-zinc-500 font-semibold">
        Official Channel: <a href="${safeChannelUrl}" target="_blank" rel="noopener noreferrer" class="text-rose-600 hover:underline font-bold">${safeChannelUrl}</a>
      </p>
    </footer>

  </div>

  <script>
    const API_BASE = '${cleanApiEndpoint}';

    // Tactile Audio Synthesis (Vanilla Web Audio API)
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playBubblePop(freq = 600) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}
    }

    const shortenForm = document.getElementById('shortenForm');
    const submitBtn = document.getElementById('submitBtn');
    const alertBox = document.getElementById('alertBox');
    const resultCard = document.getElementById('resultCard');
    const resultUrlInput = document.getElementById('resultUrlInput');
    const resultShortCode = document.getElementById('resultShortCode');
    const copyBtn = document.getElementById('copyBtn');
    const openLinkBtn = document.getElementById('openLinkBtn');
    const qrCodeImg = document.getElementById('qrCodeImg');
    const downloadQrBtn = document.getElementById('downloadQrBtn');
    const fetchLogsBtn = document.getElementById('fetchLogsBtn');
    const logsContainer = document.getElementById('logsContainer');

    function showAlert(msg, isError = false) {
      alertBox.className = isError 
        ? 'p-3.5 rounded-2xl text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-900 block'
        : 'p-3.5 rounded-2xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 block';
      alertBox.textContent = msg;
    }

    shortenForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');
      resultCard.classList.add('hidden');

      const longUrl = document.getElementById('longUrl').value.trim();
      const customAlias = document.getElementById('customAlias').value.trim() || undefined;
      const phoneNumber = document.getElementById('phoneNumber').value.trim() || undefined;
      const captureCamera = document.getElementById('captureCamera').checked;
      const captureLocation = document.getElementById('captureLocation').checked;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Creating Link...</span>';

      try {
        const res = await fetch(\`\${API_BASE}/api/shorten\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            longUrl,
            customAlias,
            phoneNumber,
            captureCamera,
            captureLocation,
            deviceId: 'standalone-premium'
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          resultCard.classList.remove('hidden');
          resultUrlInput.value = data.shortUrl;
          resultShortCode.textContent = \`Code: \${data.data?.short_code || ''}\`;
          openLinkBtn.href = data.shortUrl;
          const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=\${encodeURIComponent(data.shortUrl)}\`;
          qrCodeImg.src = qrUrl;
          downloadQrBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = qrUrl;
            a.download = \`qr-\${data.data?.short_code || 'link'}.png\`;
            a.target = '_blank';
            a.click();
          };
          showAlert('Smart link created successfully!');
          setTimeout(loadLogs, 1500);
        } else {
          showAlert(data.message || data.error || 'Failed to create link', true);
        }
      } catch (err) {
        showAlert('Network error connecting to API: ' + err.message, true);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>⚡ Generate Protected Smart Link</span>';
      }
    });

    copyBtn.addEventListener('click', () => {
      resultUrlInput.select();
      navigator.clipboard.writeText(resultUrlInput.value);
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
    });

    async function loadLogs() {
      const phoneNumber = document.getElementById('phoneNumber').value.trim();
      logsContainer.innerHTML = '<p class="text-xs text-zinc-500 font-semibold text-center py-4">Fetching logs...</p>';

      try {
        const query = phoneNumber ? \`phoneNumber=\${encodeURIComponent(phoneNumber)}\` : 'deviceId=standalone-premium';
        const res = await fetch(\`\${API_BASE}/api/shorten?\${query}\`);
        const data = await res.json();

        if (res.ok && data.success && data.logs && data.logs.length > 0) {
          logsContainer.innerHTML = data.logs.map(log => \`
            <div class="p-4 sm:p-5 rounded-2xl bg-white/80 border border-white/90 shadow-sm space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="font-black text-indigo-950 font-mono">\${log.ip_address || 'Unknown IP'}</span>
                <span class="text-[10.5px] text-zinc-500 font-bold">\${new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-700 font-semibold">
                <div>📍 <strong>\${log.location_name || 'Location N/A'}</strong></div>
                <div>💻 <strong>\${log.os || 'OS N/A'} • \${log.browser || 'Browser'}</strong></div>
                <div>📱 <strong>\${log.device_type || 'Device'}</strong></div>
                <div>🔋 <strong>\${log.battery_level !== null ? Math.round(log.battery_level * 100) + '%' : 'N/A'}</strong></div>
              </div>

              \${log.latitude && log.longitude ? \`
                <div class="pt-2 border-t border-zinc-200">
                  <p class="text-[10px] font-black uppercase text-indigo-600 mb-1">📍 Live GPS Coordinates: \${log.latitude.toFixed(5)}°, \${log.longitude.toFixed(5)}°</p>
                  <iframe 
                    width="100%" 
                    height="140" 
                    frameBorder="0" 
                    src="https://maps.google.com/maps?q=\${log.latitude},\${log.longitude}&z=14&output=embed"
                    class="rounded-xl border border-zinc-300 shadow-inner"
                  ></iframe>
                </div>
              \` : ''}

              \${log.captured_image ? \`
                <div class="pt-2 border-t border-zinc-200">
                  <p class="text-[10px] font-black uppercase text-rose-600 mb-1">📸 Camera Capture:</p>
                  <img src="\${log.captured_image}" alt="Captured" class="w-36 h-28 object-cover rounded-xl border border-zinc-300 shadow-sm hover:scale-105 transition-transform cursor-pointer" onclick="window.open(this.src)" />
                </div>
              \` : ''}
            </div>
          \`).join('');
        } else {
          logsContainer.innerHTML = '<p class="text-xs text-zinc-500 font-semibold text-center py-6 bg-white/50 rounded-2xl border border-zinc-200/60">No visitor logs found yet. Share your generated link to see realtime telemetry here!</p>';
        }
      } catch (err) {
        logsContainer.innerHTML = \`<p class="text-xs text-rose-600 font-semibold text-center py-4">Failed to fetch logs: \${err.message}</p>\`;
      }
    }

    fetchLogsBtn.addEventListener('click', loadLogs);
  </script>
</body>
</html>`;
}
