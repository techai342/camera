'use client';

import React, { useState } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Copy, 
  Check, 
  MapPin, 
  ExternalLink, 
  Camera, 
  Cpu, 
  Battery, 
  Zap, 
  Globe, 
  Clock, 
  Radio,
  Navigation,
  Eye
} from 'lucide-react';
import { formatGpuChipset } from '../lib/deviceDetector';
import { playBubblePop } from '../lib/sound';
import { cn } from '../lib/utils';

interface VisitorAnalyticsCardProps {
  log: any;
  index: number;
  onOpenDeviceInfo: (log: any) => void;
  onOpenImage?: (imageUrl: string) => void;
}

export function VisitorAnalyticsCard({
  log,
  index,
  onOpenDeviceInfo,
  onOpenImage,
}: VisitorAnalyticsCardProps) {
  const [copiedIp, setCopiedIp] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleCopyIp = (e: React.MouseEvent) => {
    e.stopPropagation();
    playBubblePop(620);
    if (log.ip_address) {
      navigator.clipboard.writeText(log.ip_address);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  const isMobile = log.device_type?.toLowerCase().includes('mobile') || log.os?.toLowerCase().includes('android') || log.os?.toLowerCase().includes('ios');
  const isTablet = log.device_type?.toLowerCase().includes('tablet') || log.os?.toLowerCase().includes('ipad');

  const rawDeviceName = log.device_model || (
    log.device_type?.includes('(') 
      ? log.device_type.replace(/\s*\([^)]*\)/, '').trim() 
      : log.device_type
  );

  const deviceModelTitle = rawDeviceName && rawDeviceName !== 'Desktop' && rawDeviceName !== 'Mobile'
    ? rawDeviceName
    : isMobile
      ? 'Mobile Device'
      : isTablet
        ? 'Tablet Device'
        : 'Desktop PC';

  const gpuName = log.gpu_chipset || formatGpuChipset(log.webgl_renderer || log.webgl_vendor);
  const hasGpu = gpuName && gpuName !== 'Not Detected' && gpuName !== 'Generic';

  const batteryPct = log.battery_level !== null && log.battery_level !== undefined
    ? log.battery_level > 1
      ? Math.round(log.battery_level)
      : Math.round(log.battery_level * 100)
    : null;

  return (
    <div className="relative group overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-white/95 via-white/85 to-[#f7f9fc]/90 border border-white/80 shadow-[0_8px_32px_rgba(20,40,65,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-[0_12px_40px_rgba(20,40,65,0.13),inset_0_1px_2px_rgba(255,255,255,1)] transition-all duration-300 p-4 sm:p-5">
      
      {/* Top Bar: Platform pill, IP, Geo and Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-zinc-200/60">
        
        {/* Left: Device Icon + IP with 1-click Copy */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
            isMobile 
              ? "bg-gradient-to-tr from-indigo-500/15 to-violet-500/20 text-indigo-700 border-indigo-500/20" 
              : isTablet
                ? "bg-gradient-to-tr from-cyan-500/15 to-teal-500/20 text-teal-700 border-teal-500/20"
                : "bg-gradient-to-tr from-blue-500/15 to-slate-500/20 text-slate-700 border-slate-500/20"
          )}>
            {isMobile ? <Smartphone className="w-4 h-4" /> : isTablet ? <Tablet className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </div>

          {/* Monospace IP Address with Copy pill */}
          <button
            type="button"
            onClick={handleCopyIp}
            className="group/ip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 font-mono text-[11px] sm:text-[12px] font-bold border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Click to copy IP Address"
          >
            <span>{log.ip_address || '127.0.0.1'}</span>
            {copiedIp ? (
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-400 group-hover/ip:text-zinc-700 transition-colors" />
            )}
          </button>

          {/* Location Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-900 text-[10px] sm:text-[11px] font-bold truncate max-w-[170px] sm:max-w-[220px]">
            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="truncate">{log.location_name || log.city || 'Direct Visit'}</span>
          </div>
        </div>

        {/* Right: Timestamp */}
        <div className="inline-flex items-center gap-1.5 text-zinc-500 font-mono text-[10px] sm:text-[11px] font-semibold shrink-0">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>{log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
          <span className="text-zinc-300">•</span>
          <span className="text-[9.5px] uppercase text-zinc-400 font-bold">{log.created_at ? new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}</span>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="pt-3.5 space-y-3">
        
        {/* Device Title & Browser Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <div className="min-w-0">
            <h4 className="text-[15px] sm:text-[16px] font-black text-zinc-900 tracking-tight leading-tight truncate" title={deviceModelTitle}>
              {deviceModelTitle}
            </h4>
            <p className="text-[11px] font-bold text-zinc-500 tracking-wide mt-0.5">
              <span className="text-zinc-700">{log.os_version || log.os || 'Unknown OS'}</span>
              <span className="mx-1.5 text-zinc-300">•</span>
              <span className="text-zinc-600">{log.browser || 'Browser'}</span>
              {log.timezone && log.timezone !== 'Unknown' && (
                <>
                  <span className="mx-1.5 text-zinc-300">•</span>
                  <span className="text-zinc-500 font-mono text-[10px]">{log.timezone}</span>
                </>
              )}
            </p>
          </div>

          {/* Quick Action: Device Info Modal Trigger */}
          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => {
                playBubblePop(720);
                onOpenDeviceInfo(log);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-900 font-extrabold text-[11px] border border-indigo-500/20 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <span>📱</span>
              <span>Full Specs</span>
            </button>
          </div>
        </div>

        {/* Hardware & Telemetry Badges Strip */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          
          {/* GPU / Processor Badge */}
          {hasGpu && (
            <div 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/25 text-purple-900 text-[10px] font-bold font-mono tracking-tight shadow-xs truncate max-w-[280px]"
              title={gpuName}
            >
              <Cpu className="w-3 h-3 text-purple-600 shrink-0" />
              <span className="text-purple-700 font-black">GPU:</span>
              <span className="truncate">{gpuName}</span>
            </div>
          )}

          {/* Battery Status */}
          {batteryPct !== null && (
            <div className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold font-mono shadow-xs",
              batteryPct > 20 
                ? "bg-emerald-50 border-emerald-500/30 text-emerald-900" 
                : "bg-red-50 border-red-500/30 text-red-900"
            )}>
              <div className="w-2.5 h-3 bg-zinc-200 rounded-[2px] relative overflow-hidden border border-current/30 shrink-0">
                <div 
                  className={cn("absolute bottom-0 left-0 right-0 transition-all", batteryPct > 20 ? "bg-emerald-500" : "bg-red-500")}
                  style={{ height: `${Math.min(100, Math.max(10, batteryPct))}%` }}
                />
              </div>
              <span>{batteryPct}%</span>
              {log.is_charging && <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500 shrink-0 animate-pulse" />}
            </div>
          )}

          {/* CPU Cores */}
          {log.hardware_concurrency && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100/90 border border-zinc-200/80 text-zinc-800 text-[10px] font-bold font-mono shadow-xs">
              <span className="text-zinc-500">Cores:</span>
              <span>{log.hardware_concurrency}</span>
            </div>
          )}

          {/* Touch Points */}
          {typeof log.touch_points === 'number' && log.touch_points > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-500/25 text-emerald-900 text-[10px] font-bold font-mono shadow-xs">
              <span className="text-emerald-700">Touch:</span>
              <span>{log.touch_points}pts</span>
            </div>
          )}

          {/* Screen Resolution */}
          {log.screen_resolution && log.screen_resolution !== 'Unknown' && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100/90 border border-zinc-200/80 text-zinc-800 text-[10px] font-bold font-mono shadow-xs">
              <span className="text-zinc-500">Screen:</span>
              <span>{log.screen_resolution.replace(/x/i, '×')}</span>
            </div>
          )}

          {/* RAM Memory */}
          {log.device_memory && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-500/25 text-indigo-900 text-[10px] font-bold font-mono shadow-xs">
              <span className="text-indigo-600">RAM:</span>
              <span>{log.device_memory}GB</span>
            </div>
          )}

          {/* Network Type */}
          {log.network_type && log.network_type !== 'Unknown' && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50/70 border border-cyan-500/25 text-cyan-900 text-[10px] font-bold font-mono uppercase shadow-xs">
              <Radio className="w-2.5 h-2.5 text-cyan-600 shrink-0" />
              <span>{log.network_type}</span>
            </div>
          )}
        </div>

        {/* Evidence Strip: Photo, Map & GPS */}
        {(log.captured_image || (log.latitude && log.longitude)) && (
          <div className="mt-2 pt-3 border-t border-zinc-200/50 flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Captured Photo Thumbnail */}
            {log.captured_image ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop(700);
                    if (onOpenImage) onOpenImage(log.captured_image);
                  }}
                  className="group/thumb relative w-12 h-12 rounded-xl overflow-hidden border-2 border-purple-500/40 shadow-sm cursor-zoom-in hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  <img 
                    src={log.captured_image} 
                    alt="Captured Intel" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-purple-700 tracking-wider">
                    <Camera className="w-3 h-3" />
                    <span>Photo Evidence</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-semibold">Front-Facing Camera</p>
                </div>
              </div>
            ) : <div />}

            {/* GPS Pin & Map Action */}
            {log.latitude && log.longitude && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop(550);
                    setShowMap(!showMap);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 text-[11px] font-extrabold border border-emerald-500/25 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  <span>{showMap ? 'Hide Map' : 'View GPS Pin'}</span>
                </button>

                <a
                  href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-bold border border-zinc-200/80 shadow-xs transition-all"
                  title="Open in Google Maps"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Embedded Interactive Map Dropdown */}
        {showMap && log.latitude && log.longitude && (
          <div className="mt-3 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-md animate-in slide-in-from-top-2 duration-200">
            <div className="bg-emerald-900/90 text-white text-[10px] font-mono font-bold px-3 py-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>GPS Coordinates: {Number(log.latitude).toFixed(6)}° N, {Number(log.longitude).toFixed(6)}° E</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-200">Live Satellite Node</span>
            </div>
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-zinc-100">
              <iframe
                title="GPS Node Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${log.latitude},${log.longitude}&z=15&output=embed`}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
