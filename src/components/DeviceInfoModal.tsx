'use client';
import React, { useState } from 'react';
import { X, Search, Check, Copy } from 'lucide-react';
import { playBubblePop } from '../lib/sound';

interface DeviceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
  shortUrl?: string;
}

import { formatGpuChipset } from '../lib/deviceDetector';
export { formatGpuChipset };

export function DeviceInfoModal({ isOpen, onClose, log, shortUrl }: DeviceInfoModalProps) {
  const [copiedIp, setCopiedIp] = useState(false);

  if (!isOpen || !log) return null;

  const ip = log.ip_address && log.ip_address !== 'Hidden' && log.ip_address !== 'Auto' ? log.ip_address : '127.0.0.1';

  // Extract real device model without fake placeholders
  const rawDeviceType = log.device_type || 'Desktop';
  let deviceModel = log.device_model;
  if (!deviceModel) {
    if (rawDeviceType.includes('(')) {
      deviceModel = rawDeviceType.replace(/\s*\([^)]*\)/, '').trim();
    } else if (log.os?.toLowerCase().includes('android')) {
      deviceModel = 'Android Device';
    } else if (log.os?.toLowerCase().includes('ios')) {
      deviceModel = 'Apple iPhone';
    } else if (log.os?.toLowerCase().includes('windows')) {
      deviceModel = 'Windows PC';
    } else if (log.os?.toLowerCase().includes('mac')) {
      deviceModel = 'Apple Mac';
    } else {
      deviceModel = rawDeviceType || 'Desktop PC';
    }
  }

  const deviceType = rawDeviceType.includes('(')
    ? rawDeviceType
    : `${deviceModel} (${rawDeviceType === 'Desktop' ? 'Desktop' : 'Mobile'})`;

  // OS Version
  const osVersion = log.os_version || log.os || 'Not Detected';

  // Browser
  const browser = log.browser || 'Not Detected';

  // Screen
  const screen = log.screen_resolution && log.screen_resolution !== 'Unknown'
    ? log.screen_resolution.replace(/x/i, '×')
    : 'Not Detected';

  // GPU / Chipset
  const gpuChipset = formatGpuChipset(log.gpu_chipset || log.webgl_renderer || log.webgl_vendor);

  // Timezone
  const timezone = log.timezone && log.timezone !== 'Unknown' ? log.timezone : 'Not Available';

  // CPU Cores
  const cpuCores = log.hardware_concurrency ? `${log.hardware_concurrency} cores` : 'Not Detected';

  // Touch
  const touchPoints = typeof log.touch_points === 'number'
    ? `${log.touch_points} points`
    : 'Not Detected';

  // User Agent
  const userAgent = log.raw_user_agent || log.user_agent || 'Not Available';

  const displayUrl = shortUrl || (typeof window !== 'undefined' ? `${window.location.host}/${log.short_code || 'link'}` : 'mrsaqib242.vercel.app/contact');

  const handleLookupIp = () => {
    playBubblePop(720);
    window.open(`https://ipinfo.io/${encodeURIComponent(ip)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyIp = () => {
    playBubblePop(620);
    navigator.clipboard.writeText(ip);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playBubblePop(450);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl border border-zinc-200/80 animate-in slide-in-from-bottom-6 duration-200 max-h-[92dvh] overflow-y-auto clay-scroll">
        
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1.5 bg-zinc-300 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Server / Network Cable Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#eef2ff] to-[#e0e7ff] border border-[#c7d2fe] flex items-center justify-center shadow-sm shrink-0">
              <svg 
                className="w-7 h-7 text-[#4f46e5]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
                <path d="M10 6h8"></path>
                <path d="M10 18h8"></path>
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">
                Device Info
              </h3>
              <p className="text-xs font-semibold text-indigo-600/90 truncate max-w-[230px] sm:max-w-[270px]">
                {displayUrl}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              playBubblePop(450);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-[#f3f0fa] hover:bg-[#eae5f7] text-[#6d5ba8] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Information Table Rows */}
        <div className="space-y-0 text-sm">

          {/* IP Address Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              IP Address
            </span>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleCopyIp}
                title="Click to copy IP"
                className="font-extrabold text-zinc-900 font-mono text-[13.5px] hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{ip}</span>
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-400 opacity-60" />}
              </button>
              <button
                type="button"
                onClick={handleLookupIp}
                className="bg-gradient-to-r from-[#8ba3fb] to-[#7088f5] hover:from-[#7a93f5] hover:to-[#5c77eb] text-white text-[11px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Search className="w-3 h-3 stroke-[3]" />
                <span>Lookup</span>
              </button>
            </div>
          </div>

          {/* Device Model Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              Device Model
            </span>
            <span className="font-black text-zinc-900 text-[13.5px] text-right">
              {deviceModel}
            </span>
          </div>

          {/* Device Type Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              Device Type
            </span>
            <span className="font-black text-zinc-900 text-[13.5px] text-right max-w-[240px] truncate" title={deviceType}>
              {deviceType}
            </span>
          </div>

          {/* OS Version Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              OS Version
            </span>
            <span className="font-black text-zinc-900 text-[13.5px] text-right">
              {osVersion}
            </span>
          </div>

          {/* Browser Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              Browser
            </span>
            <span className="font-black text-zinc-900 text-[13.5px] text-right">
              {browser}
            </span>
          </div>

          {/* Screen Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              Screen
            </span>
            <span className="font-black text-zinc-900 font-mono text-[13.5px] text-right">
              {screen}
            </span>
          </div>

          {/* GPU / Chipset Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight shrink-0 mr-2">
              GPU / Chipset
            </span>
            <span className="font-black text-zinc-900 text-[12.5px] sm:text-[13px] text-right leading-tight max-w-[220px]" title={gpuChipset}>
              {gpuChipset}
            </span>
          </div>

          {/* Timezone Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              Timezone
            </span>
            <span className="font-black text-zinc-900 text-[13.5px] text-right">
              {timezone}
            </span>
          </div>

          {/* CPU Cores Row */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-100/90">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              CPU Cores
            </span>
            <span className="font-black text-zinc-900 text-[13.5px] text-right">
              {cpuCores}
            </span>
          </div>

          {/* Touch Row */}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[13px] font-bold text-indigo-950/60 tracking-tight">
              Touch
            </span>
            <span className="font-black text-zinc-900 text-[13.5px] text-right">
              {touchPoints}
            </span>
          </div>

        </div>

        {/* Raw User Agent Box */}
        <div className="mt-4 p-3 bg-[#f6f4fe] border border-[#e5defc] rounded-2xl">
          <p className="text-[11px] font-mono text-[#5b4cb5] break-all leading-relaxed select-all">
            {userAgent}
          </p>
        </div>

      </div>
    </div>
  );
}
