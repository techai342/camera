'use client';
import { useEffect } from 'react';

export function AntiInspectionShield() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // =========================================================================
    // 1. Anti-Offline-Save Trap: If saved as file or viewed offline, wipe DOM
    // =========================================================================
    const checkOfflineFileTrap = () => {
      try {
        const isFile = window.location.protocol === 'file:' || window.location.origin === 'null';
        const isBlob = window.location.protocol === 'blob:';

        if (isFile || isBlob) {
          document.documentElement.innerHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Security Clearance Required</title>
              <style>
                * { box-sizing: border-box; }
                body {
                  background: #090d16;
                  color: #f1f5f9;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  padding: 24px;
                  text-align: center;
                }
                .shield-card {
                  max-width: 500px;
                  width: 100%;
                  padding: 36px 28px;
                  background: rgba(255, 255, 255, 0.04);
                  border: 1.5px solid rgba(255, 255, 255, 0.1);
                  border-radius: 28px;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                }
                .shield-icon {
                  font-size: 42px;
                  margin-bottom: 16px;
                }
                h2 {
                  color: #ef4444;
                  font-size: 20px;
                  font-weight: 800;
                  margin: 0 0 10px 0;
                  letter-spacing: -0.02em;
                }
                p {
                  color: #94a3b8;
                  font-size: 13px;
                  line-height: 1.6;
                  margin: 0 0 14px 0;
                }
                .badge {
                  display: inline-block;
                  padding: 6px 14px;
                  border-radius: 9999px;
                  background: rgba(239, 68, 68, 0.12);
                  border: 1px solid rgba(239, 68, 68, 0.3);
                  color: #f87171;
                  font-size: 11px;
                  font-weight: 800;
                  letter-spacing: 0.05em;
                }
              </style>
            </head>
            <body>
              <div class="shield-card">
                <div class="shield-icon">🛡️</div>
                <h2>[SECURITY PROTOCOL ACTIVE]</h2>
                <p>Direct offline saving, unauthorized scraping, or client deconstruction of this application is prohibited.</p>
                <p>All active sessions, components, and telemetry listeners have been purged from memory.</p>
                <span class="badge">SECURED BY CYBER DEFENSE PROTOCOL</span>
              </div>
            </body>
            </html>
          `;
          try { window.stop(); } catch {}
          return true;
        }
      } catch {}
      return false;
    };

    if (checkOfflineFileTrap()) return;

    // =========================================================================
    // 2. Anti-Frame / Anti-Clickjacking Framebuster
    // =========================================================================
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = window.self.location.href;
      }
    } catch {
      try { window.location.href = 'about:blank'; } catch {}
    }

    // =========================================================================
    // 3. Disable Right-Click Context Menu (Inspect, Save As, View Source)
    // =========================================================================
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow right-click only inside form inputs for copy/paste
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // =========================================================================
    // 4. Intercept and Block Keyboard Shortcuts (Save, View Source, DevTools, Print)
    // =========================================================================
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const keyUpper = e.key ? e.key.toUpperCase() : '';

      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S / Ctrl+Shift+S (Save Page As)
      if (isCtrlOrMeta && (keyUpper === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+U (View Source)
      if (isCtrlOrMeta && (keyUpper === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P / Cmd+P (Print / Save to PDF)
      if (isCtrlOrMeta && (keyUpper === 'P' || e.keyCode === 80)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / J / C (Inspect Element & Console)
      if (isCtrlOrMeta && e.shiftKey && ['I', 'J', 'C'].includes(keyUpper)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Mac Alt + Cmd + I / J / U / C / S
      if (e.altKey && e.metaKey && ['I', 'J', 'U', 'C', 'S'].includes(keyUpper)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // =========================================================================
    // 5. Prevent Dragging Assets (Images, Badges, Buttons)
    // =========================================================================
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // =========================================================================
    // 6. Automation / Headless Scraper Detection (Puppeteer, Selenium, PhantomJS)
    // =========================================================================
    const detectAutomation = () => {
      try {
        const isAutomated = 
          typeof navigator !== 'undefined' && (
            (navigator as any).webdriver ||
            (window as any).__nightmare ||
            (window as any)._phantom ||
            (window as any).callPhantom ||
            document.documentElement.getAttribute('webdriver')
          );

        if (isAutomated) {
          document.body.innerHTML = `
            <div style="background:#050505;color:#fff;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">
              <h2>Protected by Security Shield</h2>
            </div>
          `;
          try { window.stop(); } catch {}
        }
      } catch {}
    };

    detectAutomation();

    // =========================================================================
    // 7. Anti-Debugging & Console Cloaking in Production
    // =========================================================================
    let antiDebugTimer: any = null;
    if (process.env.NODE_ENV === 'production') {
      try {
        const noop = () => {};
        console.log = noop;
        console.info = noop;
        console.debug = noop;
        console.dir = noop;
        console.table = noop;
      } catch {}

      // Active DevTools timing debugger detection trap
      antiDebugTimer = setInterval(() => {
        try {
          const t0 = performance.now();
          // eslint-disable-next-line no-eval
          eval("debugger");
          if (performance.now() - t0 > 100) {
            console.clear();
          }
        } catch {}
      }, 1500);
    }

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      if (antiDebugTimer) clearInterval(antiDebugTimer);
    };
  }, []);

  return null;
}
