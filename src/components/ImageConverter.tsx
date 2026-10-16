import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Copy, ArrowRight, Image as ImageIcon, Loader2, Download, Trash2, RefreshCw, X, Link as LinkIcon, QrCode } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../lib/utils';
import { uploadImage } from '../lib/imageUpload';

interface UploadedFile {
  id: string;
  originalFile: File;
  originalSize: number;
  compressedSize?: number;
  compressedBlob?: Blob;
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error';
  url?: string;
  previewUrl: string;
  originalUrl?: string;
  error?: string;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const compressImage = (file: File, targetSizeKB: number, format: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1600; 
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas context not found"));
      
      const isTransparent = file.type === 'image/png' || file.type === 'image/webp';
      const outputType = format === 'auto' 
        ? (isTransparent ? 'image/webp' : 'image/jpeg')
        : `image/${format}`;

      ctx.clearRect(0, 0, width, height);
      if (outputType === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      let quality = 0.9;

      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Compression error"));
          if (blob.size <= (targetSizeKB * 1024) || quality <= 0.1) {
            resolve(blob);
          } else {
            quality = Math.max(0.1, quality - 0.1);
            tryCompress(); 
          }
        }, outputType, quality);
      };
      tryCompress();
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
  });
};

export function ImageConverter() {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateUploadStatus = useCallback((id: string, updates: Partial<UploadedFile>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const processSingleFile = useCallback(async (id: string, file: File) => {
    try {
      updateUploadStatus(id, { status: 'uploading' });
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const url = await uploadImage(dataUrl);
        if (url) {
          updateUploadStatus(id, { status: 'success', url });
        } else {
          updateUploadStatus(id, { status: 'error', error: 'Upload failed' });
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      updateUploadStatus(id, { status: 'error', error: error.message || 'Upload failed' });
    }
  }, [updateUploadStatus]);

  const processFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const newUploads = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      originalFile: file,
      originalSize: file.size,
      status: 'pending' as const,
      previewUrl: URL.createObjectURL(file),
    }));

    setUploads(prev => [...newUploads, ...prev]);

    newUploads.forEach(upload => {
      processSingleFile(upload.id, upload.originalFile);
    });
  }, [processSingleFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'));
      processFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((f: File) => f.type.startsWith('image/'));
      processFiles(files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadAll = async () => {
    const successfulUploads = uploads.filter(u => u.status === 'success' && u.url);
    if (successfulUploads.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const upload of successfulUploads) {
        const response = await fetch(upload.url!);
        const blob = await response.blob();
        zip.file(upload.originalFile.name, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'shorty_images.zip');
    } catch (error) {
      console.error('Failed to create zip', error);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="clay-board p-4 sm:p-7 text-[#162432] shadow-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold embossed-title mb-1">
            Media Studio • Image to Link
          </h2>
          <p className="text-xs text-[#2c4558] font-bold">Upload your images and generate instant sharing links with camera intelligence.</p>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "clay-recessed p-6 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[190px] sm:min-h-[220px] border-2 border-dashed active:scale-[0.99]",
            isDragging ? "border-[#3a7d8c] bg-white/40" : "border-[#62859e]/40 hover:border-[#3a7d8c]"
          )}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handleFileInput}
          />
          <div className="w-14 h-14 clay-circle-grey flex items-center justify-center mb-3 text-[#2c6574]">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-base text-[#142636]">Select or Drag Images</h3>
          <p className="text-[11px] text-[#3e5a6e] font-bold mt-1">Maximum file size: 10MB per image</p>
        </div>

        {uploads.length > 0 && (
          <div className="mt-6 space-y-3 max-h-[380px] overflow-y-auto pr-1 clay-scroll">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-extrabold text-[#2c445a] uppercase tracking-widest">{uploads.length} Files</span>
              <button 
                onClick={handleDownloadAll}
                disabled={isZipping}
                className="clay-teal-btn px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white flex items-center gap-1.5 shadow"
              >
                {isZipping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                Download All
              </button>
            </div>

            {uploads.map((upload) => (
              <div key={upload.id} className="clay-recessed p-3.5 rounded-2xl flex items-center gap-3.5 group">
                <div className="w-14 h-14 clay-thumb-frame shrink-0">
                  <img src={upload.previewUrl} className="w-full h-full object-cover" alt="preview" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#142636] truncate">{upload.originalFile.name}</h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {upload.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 text-[#2c6574] animate-spin" />}
                      {upload.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {upload.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] text-[#3e5a6e] font-mono font-bold tracking-wider">{formatBytes(upload.originalSize)}</p>
                    
                    {upload.status === 'success' && upload.url && (
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            copyToClipboard(upload.url!);
                            alert('Link copied!');
                          }}
                          className="clay-small-pill p-2 text-[#243d4e]"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setActiveQR(activeQR === upload.id ? null : upload.id)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            activeQR === upload.id ? "clay-badge-teal text-white" : "clay-small-pill text-[#243d4e]"
                          )}
                          title="Show QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setUploads(prev => prev.filter(u => u.id !== upload.id))}
                          className="clay-small-pill p-2 text-red-600 hover:text-red-700"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {activeQR === upload.id && upload.url && (
                    <div className="mt-3 p-3 bg-white rounded-xl inline-block shadow-md animate-in zoom-in-95 duration-200">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upload.url)}`} 
                        alt="QR" 
                        className="w-24 h-24"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
