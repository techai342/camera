import React from 'react';
import { cn } from '../lib/utils';
import { 
  SiYoutube, 
  SiInstagram, 
  SiFacebook, 
  SiX, 
  SiWhatsapp, 
  SiTelegram,
  SiSnapchat, 
  SiTiktok 
} from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';
import { Link2 } from 'lucide-react';

interface SocialIconProps {
  id: string;
  className?: string;
}

export function SocialIcon({ id, className }: SocialIconProps) {
  const baseClasses = "flex items-center justify-center shrink-0 text-white rounded-full shadow-lg border border-white/10";
  const iconBase = "w-[50%] h-[50%] z-10 shrink-0";
  
  switch (id) {
    case 'youtube':
      return (
        <div className={cn(baseClasses, "bg-[#FF0000]", className)}>
          <SiYoutube className={iconBase} />
        </div>
      );
    case 'instagram':
      return (
        <div className={cn(baseClasses, "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]", className)}>
          <SiInstagram className={iconBase} />
        </div>
      );
    case 'facebook':
      return (
        <div className={cn(baseClasses, "bg-[#1877F2]", className)}>
          <SiFacebook className={iconBase} />
        </div>
      );
    case 'twitter':
    case 'x':
      return (
        <div className={cn(baseClasses, "bg-black", className)}>
          <SiX className={iconBase} />
        </div>
      );
    case 'whatsapp':
      return (
        <div className={cn(baseClasses, "bg-[#25D366]", className)}>
          <SiWhatsapp className={iconBase} />
        </div>
      );
    case 'telegram':
      return (
        <div className={cn(baseClasses, "bg-[#24A1DE]", className)}>
          <SiTelegram className={iconBase} />
        </div>
      );
    case 'linkedin':
      return (
        <div className={cn(baseClasses, "bg-[#0A66C2]", className)}>
          <FaLinkedin className={iconBase} />
        </div>
      );
    case 'snapchat':
      return (
        <div className={cn(baseClasses, "bg-[#FFFC00] text-black", className)}>
          <SiSnapchat className={cn(iconBase, "text-black fill-black")} />
        </div>
      );
    case 'tiktok':
      return (
        <div className={cn(baseClasses, "bg-[#000000]", className)}>
          <SiTiktok className={iconBase} />
        </div>
      );
    default:
      return (
        <div className={cn(baseClasses, "bg-gradient-to-b from-zinc-500 to-zinc-700", className)}>
          <Link2 className={iconBase} />
        </div>
      );
  }
}
