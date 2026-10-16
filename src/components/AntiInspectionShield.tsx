'use client';
import { useEffect } from 'react';

export function AntiInspectionShield() {
  useEffect(() => {
    // 1. Disable Right-Click Context Menu (Inspect, Save As, View Source)
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

    // 2. Intercept and Block Keyboard Shortcuts (Ctrl+S, Ctrl+U, F12, Ctrl+Shift+I/C/J)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + S or Cmd + S (Save Page)
      if (isCtrlOrMeta && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + U or Cmd + U (View Source)
      if (isCtrlOrMeta && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + Shift + C (Inspect Element / Console)
      if (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Mac Option + Cmd + I / J / U / C
      if (e.altKey && e.metaKey && ['I', 'i', 'J', 'j', 'U', 'u', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. Prevent dragging images and elements to copy/save them
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 4. Scraper / Automation Headless Detection (Puppeteer, Selenium, PhantomJS)
    const detectAutomation = () => {
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
      }
    };

    detectAutomation();

    // 5. Anti-Debugging / Console Cleaner
    const consoleInterval = setInterval(() => {
      if (process.env.NODE_ENV === 'production') {
        try {
          console.clear();
        } catch {}
      }
    }, 2500);

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      clearInterval(consoleInterval);
    };
  }, []);

  return null;
}
