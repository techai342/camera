export interface HtmlTemplateOptions {
  developerName?: string;
  channelUrl?: string;
  brandName?: string;
  apiEndpoint?: string;
}

export function generateStandaloneHtml(options: HtmlTemplateOptions): string {
  const {
    developerName = 'Muhammad Saqib',
    channelUrl = 'https://youtube.com/@saqibvisuals',
    brandName = 'Saqib Visuals',
    apiEndpoint = 'http://localhost:3001',
  } = options;

  // Escape special characters for safe HTML injection
  const safeDevName = developerName.replace(/"/g, '&quot;');
  const safeChannelUrl = channelUrl.replace(/"/g, '&quot;');
  const safeBrandName = brandName.replace(/"/g, '&quot;');
  const cleanApiEndpoint = apiEndpoint.replace(/\/+$/, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeBrandName} - Smart Shortener & Intel Client</title>
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
      background: rgba(255, 255, 255, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 
        0 20px 40px -15px rgba(0, 0, 0, 0.08),
        0 1px 3px 0 rgba(0, 0, 0, 0.02),
        inset 0 1px 2px 0 rgba(255, 255, 255, 0.95),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.04);
      border: 2px solid rgba(255, 255, 255, 0.9);
    }

    .ambient-blob {
      position: fixed;
      border-radius: 9999px;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.6;
      animation: floatSlow 20s infinite alternate ease-in-out;
    }

    @keyframes floatSlow {
      0% { transform: translate(0px, 0px) scale(1); }
      100% { transform: translate(30px, 40px) scale(1.1); }
    }
  </style>
</head>
<body class="min-h-screen bg-[#e8ecf4] text-zinc-900 relative overflow-x-hidden p-3 sm:p-6 md:p-8">

  <!-- Ambient Refraction Blobs -->
  <div class="ambient-blob w-80 h-80 bg-blue-400/40 -top-10 -left-10"></div>
  <div class="ambient-blob w-96 h-96 bg-purple-400/35 top-96 -right-20" style="animation-delay: -5s;"></div>
  <div class="ambient-blob w-80 h-80 bg-emerald-400/30 bottom-10 left-1/3" style="animation-delay: -10s;"></div>

  <div class="relative z-10 max-w-4xl mx-auto space-y-6">

    <!-- Top Sticky Header with Developer Badge & Channel Button -->
    <header class="liquid-glass-box rounded-[28px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-500/25">
          ⚡
        </div>
        <div>
          <h1 class="text-base sm:text-lg font-black tracking-tight text-zinc-950">${safeBrandName}</h1>
          <p class="text-[10px] sm:text-[11px] text-zinc-500 font-extrabold uppercase tracking-wider">Standalone Shortlink Hub</p>
        </div>
      </div>

      <!-- Developer Credentials Badge -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-950 text-xs font-black flex items-center gap-1.5 shadow-xs">
          <span>👨‍💻</span>
          <span>Dev: <strong class="text-indigo-700">${safeDevName}</strong></span>
        </div>
        <a 
          href="${safeChannelUrl}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-xs font-black shadow-md shadow-rose-500/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span>📢</span>
          <span>Official Channel</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </div>
    </header>

    <!-- Main Creation Box -->
    <div class="liquid-glass-box rounded-[32px] p-5 sm:p-7 md:p-8 shadow-2xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">
          <span>✨</span>
          <span>3D Clay Interactive Generator</span>
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
            class="w-full text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl bg-white/85 border border-zinc-300/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 shadow-inner"
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
              class="w-full text-xs sm:text-sm font-mono font-bold px-4 py-2.5 rounded-2xl bg-white/85 border border-zinc-300/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 shadow-inner"
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
              class="w-full text-xs sm:text-sm font-mono font-bold px-4 py-2.5 rounded-2xl bg-white/85 border border-zinc-300/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 shadow-inner"
            />
          </div>
        </div>

        <!-- Verification Options -->
        <div class="p-4 rounded-2xl bg-white/60 border border-white/80 shadow-xs space-y-3">
          <p class="text-xs font-black uppercase tracking-wider text-zinc-800">Verification &amp; Capture Options</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-zinc-200/70 cursor-pointer select-none">
              <input type="checkbox" id="captureCamera" class="w-4 h-4 rounded text-indigo-600 cursor-pointer" checked />
              <div class="text-xs">
                <span class="font-extrabold text-zinc-900 block">📸 Camera Verification</span>
                <span class="text-[10.5px] text-zinc-500 font-medium">Prompts visitor for camera check</span>
              </div>
            </label>

            <label class="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-zinc-200/70 cursor-pointer select-none">
              <input type="checkbox" id="captureLocation" class="w-4 h-4 rounded text-indigo-600 cursor-pointer" checked />
              <div class="text-xs">
                <span class="font-extrabold text-zinc-900 block">📍 Location Verification</span>
                <span class="text-[10.5px] text-zinc-500 font-medium">Prompts visitor for GPS location</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          id="submitBtn"
          class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>⚡ Generate Protected Smart Link</span>
        </button>
      </form>

      <!-- Alert Message Box -->
      <div id="alertBox" class="hidden p-3.5 rounded-2xl text-xs font-bold"></div>

      <!-- Result Box -->
      <div id="resultCard" class="hidden p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border-2 border-indigo-200/80 shadow-md space-y-4">
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
            class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            📋 Copy
          </button>
          <a 
            id="openLinkBtn" 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer"
            class="px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            ↗ Open
          </a>
        </div>

        <!-- QR Code -->
        <div class="flex items-center gap-4 pt-2 border-t border-indigo-200/60">
          <img id="qrCodeImg" src="" alt="QR Code" class="w-20 h-20 rounded-xl border border-white shadow-md bg-white p-1" />
          <div class="text-xs space-y-1">
            <p class="font-extrabold text-zinc-900">Scan QR Code</p>
            <p class="text-[11px] text-zinc-500 font-semibold leading-relaxed">
              Anyone scanning this QR code will open the protected link directly on their mobile phone.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Captured Logs Stream Box -->
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
          class="px-4 py-2 rounded-xl bg-white/80 hover:bg-white border border-zinc-300 text-zinc-800 text-xs font-black shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
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
            deviceId: 'standalone-html-client'
          })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          resultCard.classList.remove('hidden');
          resultUrlInput.value = data.shortUrl;
          resultShortCode.textContent = \`Code: \${data.data?.short_code || ''}\`;
          openLinkBtn.href = data.shortUrl;
          qrCodeImg.src = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(data.shortUrl)}\`;
          showAlert('Smart link created successfully!');
          // Auto fetch logs after 2 seconds
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
        const query = phoneNumber ? \`phoneNumber=\${encodeURIComponent(phoneNumber)}\` : 'deviceId=standalone-html-client';
        const res = await fetch(\`\${API_BASE}/api/shorten?\${query}\`);
        const data = await res.json();

        if (res.ok && data.success && data.logs && data.logs.length > 0) {
          logsContainer.innerHTML = data.logs.map(log => \`
            <div class="p-4 rounded-2xl bg-white/80 border border-white/90 shadow-sm space-y-2">
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
              \${log.captured_image ? \`
                <div class="mt-2 pt-2 border-t border-zinc-200">
                  <p class="text-[10px] font-black uppercase text-indigo-600 mb-1">📸 Camera Capture:</p>
                  <img src="\${log.captured_image}" alt="Captured" class="w-32 h-24 object-cover rounded-xl border border-zinc-300 shadow-sm" />
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
