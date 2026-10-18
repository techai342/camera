import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Globe, Sparkles, Check, ExternalLink, User, Radio, Code2 } from 'lucide-react';
import { generateStandaloneHtml } from '../lib/htmlTemplateGenerator';
import { saveAs } from 'file-saver';

interface ExportHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDevName?: string;
  defaultChannelUrl?: string;
  defaultBrandName?: string;
}

export function ExportHtmlModal({
  isOpen,
  onClose,
  defaultDevName = 'Muhammad Saqib',
  defaultChannelUrl = 'https://youtube.com/@saqibvisuals',
  defaultBrandName = 'Saqib Visuals',
}: ExportHtmlModalProps) {
  const [devName, setDevName] = useState(defaultDevName);
  const [channelUrl, setChannelUrl] = useState(defaultChannelUrl);
  const [brandName, setBrandName] = useState(defaultBrandName);
  const [apiEndpoint, setApiEndpoint] = useState(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const htmlContent = generateStandaloneHtml({
        developerName: devName.trim() || 'Muhammad Saqib',
        channelUrl: channelUrl.trim() || 'https://youtube.com/@saqibvisuals',
        brandName: brandName.trim() || 'Saqib Visuals',
        apiEndpoint: apiEndpoint.trim() || window.location.origin,
      });

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      
      try {
        saveAs(blob, 'index.html');
      } catch {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download HTML failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl max-h-[92vh] overflow-y-auto clay-scroll liquid-glass-box rounded-[32px] p-5 sm:p-7 shadow-2xl relative z-10 border-2 border-white/95 text-zinc-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-zinc-950 tracking-tight leading-tight">
                  Export Standalone HTML Webpage
                </h3>
                <p className="text-[11px] text-zinc-500 font-bold">
                  Pre-configured with your Developer Name &amp; Channel Link
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-200/70 hover:bg-zinc-300/80 flex items-center justify-center text-zinc-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleDownload} className="space-y-4">
            {/* Info notice */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5 text-xs text-purple-950">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">
                Download a single, standalone <code className="font-mono font-bold bg-white/70 px-1.5 py-0.5 rounded text-purple-800">index.html</code> file with the exact same 3D Clay UI. You can open it in any browser or upload to any static hosting without modifying any code!
              </p>
            </div>

            {/* Input 1: Developer Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Developer / Creator Name</span>
              </label>
              <input
                type="text"
                required
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                placeholder="e.g. Muhammad Saqib"
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl bg-white/80 border border-zinc-300/80 focus:ring-2 focus:ring-purple-500 text-zinc-900 shadow-inner"
              />
              <span className="text-[10px] text-zinc-500 font-semibold block">
                Displayed in the top navigation badge and bottom signature
              </span>
            </div>

            {/* Input 2: Channel Link */}
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-600" />
                <span>Channel / Community Link</span>
              </label>
              <input
                type="url"
                required
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="e.g. https://youtube.com/@channel or https://t.me/channel"
                className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl bg-white/80 border border-zinc-300/80 focus:ring-2 focus:ring-purple-500 text-zinc-900 shadow-inner"
              />
              <span className="text-[10px] text-zinc-500 font-semibold block">
                Visitors who click &quot;Join Channel&quot; will be redirected here
              </span>
            </div>

            {/* Input 3: Brand Name & API Endpoint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-zinc-800 block">
                  Brand / Tool Name
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Saqib Visuals"
                  className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl bg-white/80 border border-zinc-300/80 focus:ring-2 focus:ring-purple-500 text-zinc-900 shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-zinc-800 block">
                  Connected API Server
                </label>
                <input
                  type="text"
                  required
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="http://localhost:3001"
                  className="w-full text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl bg-white/80 border border-zinc-300/80 focus:ring-2 focus:ring-purple-500 text-zinc-900 shadow-inner"
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Live Badge Preview (As Seen in Downloaded HTML):
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-100/80 border border-zinc-200">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-950">
                  <span>👨‍💻</span>
                  <span>Dev: <strong className="text-indigo-700">{devName || 'Developer Name'}</strong></span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500 text-white text-[10.5px] font-black shadow-xs">
                  <span>📢</span>
                  <span>Official Channel</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Success Alert */}
            {downloadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Downloaded index.html successfully! Check your browser Downloads folder.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download index.html</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
