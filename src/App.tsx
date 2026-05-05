/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, FormEvent, ReactNode, KeyboardEvent } from "react";
import { Search, User, Users, BarChart3, MoreHorizontal, Tv, Calendar, Home, Play, Pause, Radio, Info, Sun, Moon, Maximize, Settings, Volume2, VolumeX, CheckCircle2, Check, ChevronLeft, ChevronRight, ChevronDown, Shield, LogOut, LogIn, Heart, X, Lock, Terminal, Zap, Clock, History, MousePointer2, Sliders, Mic, Layers, Filter, Sparkles, Camera, Palette, Layout, MessageSquare, Eye, EyeOff, ExternalLink, Monitor, Columns, Maximize2, Circle, AlertCircle, RotateCcw, Crown, Bell, ShoppingCart, Smartphone, Wallet, Facebook, Youtube, Film, GraduationCap, Gavel, MonitorPlay, Theater, Trophy, Compass, Baby, Music, Cat, Mic2, Clapperboard, Bird, HeartPulse, Scale, PlayCircle, Mail, LayoutGrid, Star, Smile, Package, Repeat, Globe, BookOpen, ShoppingBag, CreditCard, ShieldCheck, Edit3, Key, Verified, Gamepad2, Wrench, Twitter } from "lucide-react";
import Hls from "hls.js";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp, updateDoc, arrayUnion, getDocFromServer } from "firebase/firestore";

import { channels, Channel } from "./channels";
import Logo from "./components/Logo";

// Test connection as per critical directive
// Test connection removed

const SettingsIcon = ({ className }: { className?: string }) => (
  <Settings className={`${className} flex-shrink-0`} />
);

const SplashScreen = ({ isDark, onEnter }: { isDark: boolean, onEnter: () => void }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="relative">
          <Logo size="xl" />
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-white text-lg font-medium tracking-[0.3em] uppercase opacity-90"
        >
          Theo cách của bạn
        </motion.p>
      </motion.div>

      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 flex flex-col items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="px-12 py-4 bg-red-600 text-white rounded-[40px] font-black text-xl shadow-2xl shadow-red-600/30 active:bg-red-700 transition-all border border-red-500/20"
            >
              Bắt đầu
            </motion.button>
            <p className="text-white/40 text-xs font-medium tracking-wide">Chạm để khởi động hệ thống</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Sparkles2 = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <circle cx="19" cy="5" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const baseTabs = [
  { name: "Trang chủ", icon: Home, id: "Trang chủ" },
  { name: "Truyền hình", icon: Tv, id: "Truyền hình" },
  { name: "Phim", icon: Clapperboard, id: "Phim" },
  { name: "Thể thao", icon: Trophy, id: "Thể thao" },
  { name: "HBO GO", icon: Layout, id: "HBO GO" },
  { name: "Video", icon: PlayCircle, id: "Video" },
  { name: "Gói cước", icon: Wallet, id: "Gói cước" },
  { name: "Danh mục", icon: LayoutGrid, id: "Danh mục" },
];

const bottomTabs = [
  { name: "Home", icon: Home, id: "Trang chủ" },
  { name: "Charts", icon: BarChart3, id: "Truyền hình" },
  { name: "Avatar", icon: Smile, id: "Cài đặt" },
  { name: "Connect", icon: Users, id: "Video" },
  { name: "More", icon: MoreHorizontal, id: "Danh mục" },
];

const robloxTabs = [
  { name: "Trang chủ", icon: Home, id: "Trang chủ" },
  { name: "Truyền hình", icon: Tv, id: "Truyền hình" },
  { name: "Phim", icon: Clapperboard, id: "Phim" },
  { name: "Thể thao", icon: Trophy, id: "Thể thao" },
  { name: "HBO GO", icon: Layout, id: "HBO GO" },
  { name: "Profile", icon: User, id: "Cài đặt" },
  { name: "Messages", icon: MessageSquare, id: "Trang chủ" },
  { name: "Connect", icon: Users, id: "Video" },
  { name: "Avatar", icon: Smile, id: "Cài đặt" },
  { name: "Inventory", icon: Package, id: "Truyền hình" },
  { name: "Trade", icon: Repeat, id: "Phim" },
  { name: "Communities", icon: Globe, id: "Video" },
  { name: "Blog", icon: BookOpen, id: "Video" },
  { name: "Official Store", icon: ShoppingBag, id: "Gói cước" },
  { name: "Buy Gift Cards", icon: CreditCard, id: "Gói cước" },
];

const RobuxIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <div className="absolute inset-0 bg-white transform rotate-[-30deg]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
    <div className="w-[40%] h-[40%] bg-black transform rotate-[-30deg]" />
  </div>
);

// Channel type is imported from channels.ts

const getMockEpg = (channelName: string) => {
  // Deterministic seed based on name
  const seed = channelName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const programs = [
    "Chào ngày mới", "Phim truyện buổi sáng", "Bản tin trưa", "Ca nhạc đặc sắc", 
    "Thế giới động vật", "Ký sự pháp đình", "Ẩm thực 3 miền", "Tổ ấm Việt",
    "Trường học siêu sao", "Hành trình di sản", "Dấu ấn thương hiệu", "Gala âm nhạc",
    "Thời sự tối", "Phim truyện đêm khuya", "Ký ức vui vẻ", "Thách thức danh hài",
    "Giọng hát Việt", "Chuyển động 24h", "Cặp lá yêu thương", "Việc tử tế"
  ];
  
  const schedules = [];
  const startHour = 6;
  for (let i = 0; i < 8; i++) {
    const hour = (startHour + i * 2) % 24;
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const title = programs[(seed + i) % programs.length];
    schedules.push({ time, title, isCurrent: i === 4 });
  }
  return schedules;
};

function EpgModal({ isOpen, onClose, channel, isDark, liquidGlass }: {
  isOpen: boolean,
  onClose: () => void,
  channel: Channel | null,
  isDark: boolean,
  liquidGlass: boolean
}) {
  if (!channel) return null;
  const epg = getMockEpg(channel.name);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/80 ${liquidGlass ? "backdrop-blur-md" : ""}`}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-lg overflow-hidden border shadow-2xl flex flex-col max-h-[80vh] ${
              isDark ? "bg-[#111] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            } ${liquidGlass ? "rounded-[40px]" : "rounded-2xl"}`}
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                   <img src={channel.logo} alt={channel.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter">{channel.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Lịch phát sóng</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
               {epg.map((item, idx) => (
                 <div key={idx} className={`flex items-center gap-6 p-4 rounded-2xl transition-all ${item.isCurrent ? "bg-red-600/10 border border-red-600/20" : "hover:bg-white/5"}`}>
                   <span className={`text-lg font-black font-mono w-16 shrink-0 ${item.isCurrent ? "text-red-500" : "opacity-40"}`}>{item.time}</span>
                   <div className="flex items-center gap-3">
                     {item.isCurrent && <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)]" />}
                     <span className={`text-lg font-bold ${item.isCurrent ? "" : "opacity-40"}`}>{item.title}</span>
                   </div>
                 </div>
               ))}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20">
               <button 
                 onClick={() => { onClose(); }}
                 className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all"
               >
                 XEM NGAY
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function LiquidModal({ isOpen, onClose, children, isDark, title, description, liquidGlass }: { 
  isOpen: boolean, 
  onClose: () => void, 
  children?: ReactNode, 
  isDark: boolean,
  title?: string,
  description?: string,
  liquidGlass: boolean
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/40 ${liquidGlass ? "backdrop-blur-sm" : ""}`}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-sm overflow-hidden border shadow-2xl ${
              isDark 
                ? "bg-slate-900/90 border-white/10 text-white" 
                : "bg-white/90 border-white/60 text-slate-900"
            } ${
              liquidGlass ? "rounded-[40px] backdrop-blur-3xl" : "rounded-2xl backdrop-blur-none"
            }`}
          >
            <div className="p-8 text-center">
              {title && <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>}
              {description && <p className={`${isDark ? "text-white/60" : "text-black/60"} text-sm leading-relaxed mb-6 font-medium`}>{description}</p>}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Tooltip({ text, show, targetRect }: { text: string, show: boolean, targetRect: DOMRect | null }) {
  return (
    <AnimatePresence>
      {show && targetRect && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          style={{ 
            position: 'fixed', 
            top: targetRect.top - 50, 
            left: targetRect.left + (targetRect.width / 2),
            translateX: '-50%'
          }}
          className="px-4 py-2 bg-white/80 backdrop-blur-xl text-slate-900 text-[12px] font-black rounded-2xl whitespace-nowrap pointer-events-none z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/40"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChannelLogo({ src, alt, className, isDark }: { src: string, alt: string, className?: string, isDark: boolean }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700/50 p-1 text-center`}>
        <Tv className="h-6 w-6 mb-1 text-slate-500" />
        <span className="text-[10px] font-bold leading-tight line-clamp-2 uppercase opacity-60">{alt}</span>
      </div>
    );
  }

  const scaleMap: { [key: string]: string } = {
    "Lâm Đồng 1 (LTV1)": "md:scale-[1.4]",
    "Đà Nẵng 1 (DNRT1)": "scale-[1.5] md:scale-[1.7]",
    "Đà Nẵng 2 (DNRT2)": "scale-[1.4] md:scale-[1.7]",
    "Thái Nguyên (TN)": "md:scale-[1.5]",
    "Điện Biên (ĐTV)": "md:scale-[0.8]",
    "Hưng Yên (HYTV)": "md:scale-[1.7]",
    "Đồng Tháp 1 (THĐT1)": "scale-[2.0] md:scale-[1.4]",
    "Huế (HueTV)": "md:scale-[1.4]",
    "Tây Ninh (TN)": "md:scale-[1.4]",
    "H1": "scale-[1.6] md:scale-[2.0]",
    "H2": "scale-[1.6] md:scale-[2.0]",
    "Đắk Lắk (DRT)": "scale-[1.2] md:scale-[1.4]",
    "ĐNNRTV1": "scale-[1.1] md:scale-[1.1]",
    "ĐNNRTV2": "scale-[1.1] md:scale-[1.1]",
    "Nghệ An (NTV)": "md:scale-[1.4]",
    "Quảng Ngãi 1 (QNgTV1)": "md:scale-[1.5]",
    "Quảng Ngãi 2 (QNgTV2)": "md:scale-[1.5]",
    "HTV Thể Thao": "scale-[1.5] md:scale-[1.5]",
    "VTV1": "scale-[1.14] md:scale-[0.92]",
    "VTV7": "scale-[1.24] md:scale-[1.01]",
    "VTV10": "scale-[1.11] md:scale-[1.0]"
  };

  const scaleClass = scaleMap[alt] || (alt.startsWith("VTV") ? "md:scale-[0.9]" : "");

  return (
    <img 
      src={src} 
      alt={alt} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={`${className} object-contain transition-all duration-300 ${!isDark ? "drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" : ""} ${scaleClass}`} 
    />
  );
}

function ChannelCard({ ch, onClick, onShowEpg, isDark, isActive, favorites, toggleFavorite, liquidGlass }: {
  ch: Channel,
  onClick: () => void,
  onShowEpg?: (ch: Channel) => void,
  isDark: boolean,
  isActive?: boolean,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  liquidGlass: boolean,
  key?: string | number
}) {
  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.12, boxShadow: isActive ? "0 0 40px rgba(168,85,247,0.7)" : "0 0 25px rgba(0,0,0,0.15)" }}
        whileTap={{ scale: 0.95, rotate: -1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={`w-full aspect-video p-4 md:p-8 flex items-center justify-center transition-all duration-200 border relative overflow-hidden ${
          liquidGlass ? "rounded-[32px] backdrop-blur-2xl border-white/20 shadow-2xl" : "rounded-xl backdrop-blur-none border-slate-200"
        } ${
          isActive
            ? `bg-white/20 border-[#f24242] ring-2 ring-[#f24242]/50 shadow-[0_0_20px_rgba(242,66,66,0.4)]`
            : isDark
            ? "bg-[#1a1a1a] border-white/5 shadow-sm shadow-black/20"
            : "bg-white border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.05)]"
        }`}
      >
        {ch.isVip && (
          <div className="absolute top-0 left-0 bg-[#e31e24] text-white flex items-center gap-1 px-1.5 py-0.5 rounded-br-lg z-20 shadow-lg group-hover:scale-110 transition-transform origin-top-left">
            <Crown className="w-3 h-3 fill-white" />
            <span className="text-[10px] font-black tracking-tight">VIP</span>
          </div>
        )}
        <ChannelLogo src={ch.logo} alt={ch.name} className={`w-full h-full`} isDark={isDark} />
      </motion.button>
      <div className="absolute top-2 right-2 flex gap-1 group-hover:opacity-100 opacity-0 transition-opacity z-10">
        {onShowEpg && (
          <button 
            onClick={(e) => { e.stopPropagation(); onShowEpg(ch); }}
            className={`p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white`}
            title="Lịch phát sóng"
          >
            <Calendar className="h-4 w-4" />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(ch); }}
          className={`p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors ${favorites.includes(ch.name) ? "text-red-500" : "text-white"}`}
        >
          <Heart className={`h-4 w-4 ${favorites.includes(ch.name) ? "fill-red-500" : ""}`} />
        </button>
      </div>
    </div>
  );
}

function HomeContent({ setActiveTab, setActiveChannel, onShowEpg, isDark, favorites, toggleFavorite, liquidGlass }: {
  setActiveTab: (tab: string) => void,
  setActiveChannel: (ch: typeof channels[0]) => void,
  onShowEpg: (ch: Channel) => void,
  isDark: boolean,
  favorites: string[],
  toggleFavorite: (ch: typeof channels[0]) => void,
  liquidGlass: boolean
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [randomChannels, setRandomChannels] = useState<typeof channels>([]);
  const slides = [
    "https://plain-apac-prod-public.komododecks.com/202604/06/0rdrbV8FYCssv6LnT4aJ/image.png",
    "https://plain-apac-prod-public.komododecks.com/202604/06/DN6JPkubjkRfKgJlYYIa/image.png"
  ];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setSlideIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  useEffect(() => {
    const shuffled = [...channels].sort(() => 0.5 - Math.random());
    setRandomChannels(shuffled.slice(0, 12));

    const interval = setInterval(() => {
      paginate(1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const favoriteChannels = channels.filter(ch => favorites.includes(ch.name));

  return (
    <div className="p-0 overflow-x-hidden space-y-12 pb-20">
      {/* Cinematic Hero Banner */}
      <div className="relative w-full aspect-[21/9] md:aspect-[24/10] overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img 
              src={slides[slideIndex]} 
              className="w-full h-full object-cover" 
              alt="Featured"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-transparent to-transparent" />
            
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-10 md:p-20 space-y-4 md:space-y-8 max-w-3xl z-10">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-white" /> TOP RATED
                </div>
                <span className="text-white/60 text-sm font-bold tracking-widest uppercase">Adventure • Roleplay • Trending 2024</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter"
              >
                BLOX FRUITS <br /> <span className="text-blue-500">UPDATE 21</span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white/70 text-lg md:text-2xl font-medium leading-relaxed max-w-xl"
              >
                Become a master swordsman or a powerful blox fruit user as you train to become the strongest player to ever live.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-6"
              >
                <button className="px-10 py-5 bg-[#00A2FF] hover:bg-[#0084D1] text-white font-black text-2xl rounded-2xl flex items-center gap-3 transition-all shadow-2xl shadow-blue-600/30">
                  <Play className="w-8 h-8 fill-white" /> PLAY NOW
                </button>
                <button className="px-8 py-5 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white font-black text-2xl rounded-2xl flex items-center gap-3 transition-all border border-white/10">
                  <Heart className="w-7 h-7" /> FAVORITE
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 right-20 flex gap-4 z-20">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setSlideIndex(i)}
              className={`h-2 transition-all duration-500 rounded-full ${i === slideIndex ? "w-12 bg-red-600" : "w-4 bg-white/30"}`}
            />
          ))}
        </div>
      </div>

      {/* Recently Visited */}
      <div className="px-6 md:px-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-black tracking-tighter uppercase italic ${isDark ? "text-white" : "text-slate-900"}`}>Recently Visited</h2>
          <button className="text-sm font-bold text-slate-500 hover:text-white transition-colors">See All {">"}</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {channels.slice(0, 10).map((ch, idx) => (
            <motion.button
              key={ch.name + idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveChannel(ch)}
              className="flex-shrink-0 w-[140px] group relative"
            >
              <div className={`aspect-square rounded-3xl overflow-hidden shadow-xl transition-all border ${isDark ? "bg-[#181818] border-white/5 group-hover:border-white/20" : "bg-white border-slate-200"}`}>
                <img src={ch.logo} alt={ch.name} className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className={`absolute inset-0 bg-gradient-to-t opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? "from-black/80 to-transparent" : "from-black/40 to-transparent"}`} />
              </div>
              <p className={`mt-3 text-sm font-black text-center truncate ${isDark ? "text-white/70 group-hover:text-white" : "text-slate-600"}`}>
                {ch.name}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-12 space-y-12">
        {/* Categories Grid */}
      <div className="space-y-6">
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Khám phá danh mục</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4">
          {[
            { name: "VTV", icon: Zap, logo: "https://static.tv360.vn/public/v1/images/genres/vtv.png", color: "from-blue-600 to-indigo-700" },
            { name: "HTV", icon: User, logo: "https://static.tv360.vn/public/v1/images/genres/htv.png", color: "from-purple-500 to-cyan-600" },
            { name: "VTVcab", icon: Compass, logo: "https://static.tv360.vn/public/v1/images/genres/vtvcab.png", color: "from-slate-700 to-slate-900" },
            { name: "SCTV", icon: Wrench, logo: "https://static.tv360.vn/public/v1/images/genres/sctv.png", color: "from-sky-500 to-blue-700" },
            { name: "Kênh quốc tế", icon: Gamepad2, logo: "https://static.tv360.vn/public/v1/images/genres/kenh-quoc-te.png", color: "from-violet-500 to-purple-800" },
            { name: "Địa phương", icon: Eye, logo: "https://static.tv360.vn/public/v1/images/genres/dia-phuong.png", color: "from-emerald-500 to-teal-700" },
            { name: "Thiết yếu", icon: MousePointer2, logo: "https://static.tv360.vn/public/v1/images/genres/thiet-yeu.png", color: "from-blue-600 to-blue-900" },
            { name: "Phát thanh", icon: Users, logo: "https://static.tv360.vn/public/v1/images/genres/phat-thanh.png", color: "from-amber-400 to-orange-600" },
          ].map((cat, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 p-4 shadow-lg overflow-hidden group transition-all bg-gradient-to-br ${cat.color}`}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              <div className="relative z-10 w-16 h-16 flex items-center justify-center transition-all group-hover:scale-110">
                <img 
                  src={cat.logo} 
                  alt={cat.name} 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const iconParent = target.parentElement;
                    if (iconParent) {
                      const icon = document.createElement('div');
                      icon.className = "w-8 h-8 text-white flex items-center justify-center";
                      iconParent.appendChild(icon);
                    }
                  }}
                />
              </div>
              <span className="relative z-10 text-white font-black text-xs md:text-sm text-center leading-tight uppercase tracking-wide">
                {cat.title || cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Phim đề xuất */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Phim đề xuất</h3>
          <button className="text-slate-500 text-sm font-medium flex items-center gap-1 hover:text-blue-500 transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {[
            { id: 1, title: "Doraemon Mùa 13", img: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=300&h=450&fit=crop", isVip: false },
            { id: 2, title: "Doraemon Mùa 12", img: "https://images.unsplash.com/photo-1541560052-77ec1bbc09f7?q=80&w=300&h=450&fit=crop", isVip: false },
            { id: 3, title: "Bạch Nhật Đề Đăng", img: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=300&h=450&fit=crop", isVip: true },
            { id: 4, title: "Băng Hổ Trọng Sinh", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&h=450&fit=crop", isVip: true },
            { id: 5, title: "Mưa Đỏ", img: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&h=450&fit=crop", isVip: false, is4k: true },
            { id: 6, title: "Luật Sư Bóng Ma", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&h=450&fit=crop", isVip: true },
          ].map(movie => (
            <motion.div 
              key={movie.id}
              whileHover={{ y: -5 }}
              className="relative min-w-[140px] md:min-w-[180px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg snap-start group cursor-pointer"
            >
              <img src={movie.img} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              {movie.isVip && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg">
                  <Star className="w-2.5 h-2.5 fill-white" /> POPULAR
                </div>
              )}
              {movie.is4k && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">
                  NEW UPDATE
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-xs font-bold leading-tight">{movie.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mới nhất trên TV360 */}
      <div className="space-y-4">
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Mới nhất trên TV360</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {[
            { id: 7, title: "Cánh Chim Giấu Tình", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&h=450&fit=crop", isVip: true },
            { id: 8, title: "Nhân Tài Đại Việt", img: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&h=450&fit=crop", isVip: false },
            { id: 9, title: "Bù Nhìn Bóng Đêm", img: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=300&h=450&fit=crop", isVip: true },
            { id: 10, title: "Cuộc Tình Vụng Trộm", img: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=300&h=450&fit=crop", isHbo: true },
            { id: 11, title: "My Hero Academia", img: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=300&h=450&fit=crop", isVip: false },
            { id: 12, title: "Doc", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&h=450&fit=crop", isVip: false },
          ].map(movie => (
            <motion.div 
              key={movie.id}
              whileHover={{ y: -5 }}
              className="relative min-w-[140px] md:min-w-[180px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg snap-start group cursor-pointer"
            >
              <img src={movie.img} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              {movie.isVip && (
                <div className="absolute top-2 left-2 bg-[#00A2FF] text-white text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg">
                   ACTIVE
                </div>
              )}
              {movie.isHbo && (
                <div className="absolute top-2 right-2 bg-white text-black text-[8px] font-black px-1 py-0.5 rounded shadow-lg flex items-center">
                  TOP TRENDING
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-xs font-bold leading-tight">{movie.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top 10 phim HOT */}
      <div className="space-y-4">
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Top 10 phim HOT</h3>
        <div className="flex gap-16 overflow-x-auto pb-4 pt-10 scrollbar-hide snap-x pl-14">
          {[
            { id: 1, title: "Băng Hổ Trọng Sinh", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&h=450&fit=crop" },
            { id: 2, title: "Cánh Chim Giấu Tình", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&h=450&fit=crop" },
            { id: 3, title: "Bù Nhìn Bóng Đêm", img: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=300&h=450&fit=crop" },
            { id: 4, title: "Quá Nhanh Quá Nguy Hiểm 9", img: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=300&h=450&fit=crop" },
            { id: 5, title: "Doc", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&h=450&fit=crop" },
            { id: 6, title: "My Hero Academia", img: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=300&h=450&fit=crop" },
          ].map((movie, index) => (
            <motion.div 
              key={movie.id}
              whileHover={{ y: -5 }}
              className="relative min-w-[140px] md:min-w-[180px] aspect-[2/3] snap-start cursor-pointer"
            >
              <div className="absolute -left-14 bottom-0 select-none pointer-events-none">
                 <span className={`text-[12rem] font-black leading-none italic ${isDark ? "text-white/10" : "text-slate-200"}`}>
                   {index + 1}
                 </span>
              </div>
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                <img src={movie.img} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-xs font-bold leading-tight">{movie.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Truyền hình đặc sắc */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Truyền hình đặc sắc</h3>
          <button onClick={() => setActiveTab("Phát sóng")} className="text-slate-500 text-sm font-medium flex items-center gap-1 hover:text-blue-500 transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {channels.slice(0, 10).map((ch, idx) => (
             <div key={ch.name + idx} className="snap-start min-w-[180px] md:min-w-[240px]">
               <ChannelCard ch={ch} onClick={() => setActiveChannel(ch)} onShowEpg={onShowEpg} isDark={isDark} favorites={favorites} toggleFavorite={toggleFavorite} liquidGlass={liquidGlass} />
             </div>
          ))}
        </div>
      </div>

      {/* Shorts */}
      <div className="space-y-4">
        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Shorts</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {[
            { id: 1, title: "Bù Nhìn Bóng Đêm", img: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?q=80&w=300&h=500&fit=crop", count: 14 },
            { id: 2, title: "Chồng Của Em Là...", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&h=500&fit=crop", count: 41 },
            { id: 3, title: "Băng Hổ Trọng Sinh", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&h=500&fit=crop", count: 20 },
            { id: 4, title: "Chị Cũng Bản Yêu Em", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&h=500&fit=crop", count: 48 },
            { id: 5, title: "Khách Sạn Bí Ẩn", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&h=500&fit=crop", count: 32 },
          ].map(short => (
            <motion.div 
              key={short.id}
              whileHover={{ y: -5 }}
              className="relative min-w-[160px] md:min-w-[200px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg snap-start group cursor-pointer"
            >
              <img src={short.img} alt={short.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4 gap-2">
                <p className="text-white text-sm font-bold leading-tight line-clamp-2">{short.title}</p>
                <div className={`px-2 py-1 rounded-lg backdrop-blur-md flex items-center justify-center gap-1.5 self-end ${isDark ? "bg-white/10" : "bg-black/20"}`}>
                  <Play className="w-3 h-3 text-white fill-white" />
                  <span className="text-white text-[10px] font-bold">{short.count} videos</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Thể thao */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-950"}`}>Thể thao</h3>
          <button className="text-slate-500 text-sm font-medium flex items-center gap-1 hover:text-red-500 transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {[
            { id: 1, title: "Man City vs Arsenal", img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&h=337&fit=crop", league: "Premier League", live: true, time: "90+5'" },
            { id: 2, title: "Vietnam vs Thailand", img: "https://images.unsplash.com/photo-1543326168-18e470876403?q=80&w=600&h=337&fit=crop", league: "AFF Cup", live: false, time: "20:00" },
            { id: 3, title: "Barcelona vs Real Madrid", img: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=600&h=337&fit=crop", league: "La Liga", live: false, time: "Mai - 02:00" },
            { id: 4, title: "Lakers vs Celtics", img: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=600&h=337&fit=crop", league: "NBA", live: true, time: "Q3 - 04:12" },
          ].map(sport => (
            <motion.div 
              key={sport.id}
              whileHover={{ y: -5 }}
              className="relative min-w-[280px] md:min-w-[400px] aspect-video rounded-3xl overflow-hidden shadow-xl snap-start group cursor-pointer"
            >
              <img src={sport.img} alt={sport.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 space-y-2">
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{sport.league}</span>
                <div className="flex items-end justify-between gap-4">
                  <h4 className="text-white text-xl font-black">{sport.title}</h4>
                  <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 ${sport.live ? "bg-red-600 animate-pulse" : "bg-white/10 backdrop-blur-md"}`}>
                    {sport.live && <div className="w-2 h-2 bg-white rounded-full" />}
                    <span className="text-white text-xs font-black">{sport.live ? "TRỰC TIẾP" : sport.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}

function TVContent({ active, setActive, onShowEpg, isDark, favorites, toggleFavorite, user, onLogin, isDev, liquidGlass, sortOrder, setSortOrder, showSplash, autoFullscreen, initialCategory = "Tất cả" }: { 
  active: Channel, 
  setActive: (ch: Channel) => void, 
  onShowEpg: (ch: Channel) => void,
  isDark: boolean,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  user: any,
  onLogin: () => void,
  isDev?: boolean,
  liquidGlass: boolean,
  sortOrder: "default" | "az" | "za",
  setSortOrder: (val: "default" | "az" | "za") => void,
  showSplash?: boolean,
  autoFullscreen?: boolean,
  initialCategory?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Default to sound ON
  const [volume, setVolume] = useState(1);
  const [levels, setLevels] = useState<Hls.Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>(initialCategory);
  const [streamError, setStreamError] = useState<string | null>(null);

  // categories definition removed to avoid duplication

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isIframeStream = (url: string) => {
    // Only return true for sites known to support embedding
    return url.includes('hd.xemtv.net') || url.includes('vtvgo.vn') || url.includes('vtvprime.vn') || url.endsWith('.html');
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

  const filteredChannels = channels
    .filter(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "Tất cả" 
        || ch.category === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortOrder === "default") return 0;
      if (sortOrder === "az") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  const CATEGORY_ORDER = ["VTV", "HTV", "VTVcab", "SCTV", "Địa phương", "HTV Hà Nội FM", "TV360 TV", "Phim truyện TV360", "Thể thao TV360", "Kênh quốc tế", "Thiết yếu", "Phát thanh"];
  const filteredCategories = CATEGORY_ORDER.filter(cat => 
    filteredChannels.some(ch => ch.category === cat)
  );

  useEffect(() => {
    if (!user && !isDev) return;
    if (showSplash) return; // Wait until sound is unblocked by user interaction
    
    // Always try to reset mute when splash is gone
    setIsMuted(false);

    const video = videoRef.current;
    if (!video) return;

    // Track watched channel
    if (user) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        watchedChannels: arrayUnion(active.name),
        updatedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'users/' + user.uid));
    }

    video.volume = volume;
    setStreamError(null);
    let isEffectMounted = true;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      const isTv360Stream = active.stream.includes('tv360.vn');
      
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsRef.current = hls;
      hls.attachMedia(video);
      
      if (!isTv360Stream) {
        hls.loadSource(active.stream);
      }

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isEffectMounted) return;
        setStreamError(null);
        setIsPlaying(true);
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name === 'AbortError') return;
            console.warn("Autoplay prevented, trying muted", e);
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }

        // Auto Fullscreen Logic
        if (autoFullscreen && video.parentElement) {
          try {
            if (!document.fullscreenElement) {
              video.parentElement.requestFullscreen().catch(err => {
                console.warn("Fullscreen request failed:", err);
              });
            }
          } catch (err) {
            console.warn("Fullscreen error:", err);
          }
        }

        setLevels(hls!.levels);
        setCurrentLevel(hls!.currentLevel);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (!isEffectMounted) return;
        setCurrentLevel(data.level);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!isEffectMounted) return;
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setStreamError("Không thể kết nối tới luồng phát. Có thể do giới hạn khu vực hoặc bản quyền.");
              hls!.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setStreamError("Định dạng video không được hỗ trợ trên thiết bị này.");
              hls!.recoverMediaError();
              break;
            default:
              setStreamError("Nội dung chưa hỗ trợ xem trên trình duyệt này. Vui lòng tải app TV360.");
              hls!.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      const proxyUrl = `/proxy?url=${encodeURIComponent(active.stream)}`;
      video.src = proxyUrl;
      const onLoadedMetadata = () => {
        if (!isEffectMounted) return;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }

        // Auto Fullscreen Logic for non-HLS
        if (autoFullscreen && video.parentElement) {
          try {
            if (!document.fullscreenElement) {
              video.parentElement.requestFullscreen().catch(err => {
                console.warn("Fullscreen request failed:", err);
              });
            }
          } catch (err) {
            console.warn("Fullscreen error:", err);
          }
        }
      };
      const onError = () => {
        if (!isEffectMounted) return;
        setStreamError("Trình duyệt báo lỗi khi phát luồng này.");
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);
    }

    return () => {
      isEffectMounted = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [active, user]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else if (val === 0 && !isMuted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const setQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setShowQualityMenu(false);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      const video = videoRef.current;
      if (!video) return;

      try {
        // @ts-ignore - captureStream is semi-standard
        const stream = video.captureStream ? video.captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
        
        if (!stream) {
          alert("Trình duyệt không hỗ trợ ghi hình video.");
          return;
        }

        const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          
          const date = new Date();
          const timestamp = date.getFullYear() + 
                          ('0' + (date.getMonth() + 1)).slice(-2) + 
                          ('0' + date.getDate()).slice(-2) + "_" + 
                          ('0' + date.getHours()).slice(-2) + 
                          ('0' + date.getMinutes()).slice(-2);
          
          const filename = `${active.name}_${timestamp}_ldaplayrec.mp4`;
          
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Recording error:", err);
        alert("Lỗi khi ghi hình. Có thể do giới hạn bảo mật (CORS) của luồng phát này.");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  // categories definition removed to avoid duplication

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      {/* VIDEO PLAYER */}
      <div className={`aspect-video bg-black mb-6 flex items-center justify-center border shadow-2xl relative overflow-hidden group ${
        liquidGlass ? "rounded-2xl" : "rounded-lg"
      } ${isDark ? "border-slate-800" : "border-slate-300"}`}>
        {!user && !isDev ? (
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 p-6 text-center ${
            liquidGlass ? "backdrop-blur-xl" : "backdrop-blur-none"
          }`}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-10 border shadow-2xl flex flex-col items-center space-y-6 bg-white/80 border-black/5 ${
                liquidGlass ? "rounded-[40px]" : "rounded-2xl"
              }`}
            >
              <div className="p-4 rounded-full bg-purple-50">
                <Lock className="h-10 w-10 text-purple-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">Đăng nhập để xem</h3>
                <p className="text-slate-500 text-sm max-w-[280px]">Vui lòng đăng nhập tài khoản TV360 để có thể xem kênh trực tuyến này.</p>
              </div>
              <button 
                onClick={onLogin}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-3xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/20"
              >
                Đăng nhập ngay
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {isIframeStream(active.stream) ? (
              <iframe
                src={active.stream}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={active.name}
              />
            ) : active.stream.includes('tv360.vn') || active.stream.includes('vietteltv.vn') ? (
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />
                </div>

                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 flex flex-col items-center space-y-8 max-w-md"
                >
                  <div className="w-24 h-24 bg-red-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-red-600/40 border border-white/20">
                    <ExternalLink size={48} className="text-white" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-white text-3xl font-black tracking-tight">KẾT NỐI TV360</h2>
                    <p className="text-white/60 text-lg font-medium leading-relaxed">
                      Để bảo mật và tối ưu trải nghiệm, kênh <span className="text-white font-bold">{active.name}</span> cần được mở trực tiếp trên hệ thống TV360.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 w-full gap-4 pt-4">
                    <a 
                      href={active.stream}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative px-8 py-5 bg-white text-black rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl"
                    >
                      <Play className="w-6 h-6 fill-black" />
                      XEM TRÊN TV360
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                    </a>
                    
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-8 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={20} />
                      THỬ LẠI KẾT NỐI
                    </button>
                  </div>

                  <p className="text-white/30 text-xs font-mono uppercase tracking-[0.3em]">
                    Redirect Protocol Safe-Chain Actived
                  </p>
                </motion.div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full"
                autoPlay
                muted={isMuted}
                onClick={togglePlay}
              />
            )}
            
            {/* Error overlay */}
            {streamError && (
              <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                {/* Top Error Bar */}
                <motion.div 
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute top-0 left-0 right-0 h-14 bg-red-600 flex items-center justify-between px-6 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white text-lg font-bold">Thiết bị không hỗ trợ.(D-166)</span>
                  </div>
                  <button onClick={() => setStreamError(null)} className="text-white hover:opacity-70 transition-opacity">
                    <X size={24} />
                  </button>
                </motion.div>

                {/* Center Content / Modal */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#1a1a1a] p-8 rounded-[40px] max-w-sm w-full space-y-8 shadow-2xl border border-white/5"
                >
                  <div className="space-y-4">
                    <h3 className="text-white text-2xl font-bold">Thông báo</h3>
                    <p className="text-white/80 text-lg leading-relaxed">
                      Nội dung này chưa hỗ trợ xem trên phiên bản trình duyệt. Quý khách vui lòng tải ứng dụng TV360 để có trải nghiệm tốt nhất.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => window.open("https://play.google.com/store/apps/details?id=com.viettel.tv360.ott", "_blank")}
                      className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-2xl font-bold transition-all active:scale-95 shadow-xl shadow-red-600/20"
                    >
                      Đồng ý
                    </button>
                    <button 
                      onClick={() => setStreamError(null)}
                      className="w-full py-5 border-2 border-white/80 hover:bg-white/5 text-white rounded-2xl text-2xl font-bold transition-all active:scale-95"
                    >
                      Hủy
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Tap to Unmute Overlay */}
            {isMuted && isPlaying && !isIframeStream(active.stream) && (
              <button 
                onClick={toggleMute}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-black/80 transition-all animate-bounce"
              >
                <VolumeX className="h-4 w-4" />
                CHẠM ĐỂ BẬT TIẾNG
              </button>
            )}
            {/* Modern Redesigned Control Bar */}
            {!isIframeStream(active.stream) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 pb-4 pt-10 ring-1 ring-inset ring-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={togglePlay} 
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95 group/btn"
                    >
                      {isPlaying ? <Pause size={20} fill="white" className="group-hover/btn:scale-110 transition-transform" /> : <Play size={20} fill="white" className="group-hover/btn:scale-110 transition-transform" />}
                    </button>

                    <div className="flex items-center gap-3 bg-black/40 hover:bg-black/60 transition-all rounded-full p-1.5 px-3 group/vol">
                      <button onClick={toggleMute} className="text-white hover:text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange}
                        className="w-0 group-hover/vol:w-20 transition-all duration-300 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-full select-none">
                      <span className="text-white text-base font-medium tracking-tight h-5 flex items-center">{timeString}</span>
                      <div className="flex items-center gap-2 border-l border-white/20 ml-1 pl-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                        <span className="text-white text-sm font-bold tracking-wide uppercase">Trực tiếp</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button 
                        onClick={() => setShowQualityMenu(!showQualityMenu)} 
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <div className="w-6 h-6 border-2 border-white rounded-sm flex items-center justify-center text-[10px] font-black leading-none pt-[1px]">HD</div>
                      </button>
                      
                      <AnimatePresence>
                        {showQualityMenu && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10, x: 20 }}
                            className="absolute bottom-14 right-0 bg-black/90 backdrop-blur-2xl rounded-2xl p-2 text-sm text-white border border-white/10 w-40 shadow-2xl z-50 overflow-hidden"
                          >
                            <div className="px-4 py-2 border-b border-white/10 mb-1 opacity-50 text-[10px] font-black uppercase tracking-widest">Chất lượng</div>
                            <button onClick={() => setQuality(-1)} className={`flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-white/10 rounded-xl transition-colors ${currentLevel === -1 ? "text-purple-400 font-bold bg-white/5" : ""}`}>
                              <span>Tự động</span>
                              {currentLevel === -1 && <CheckCircle2 size={14} />}
                            </button>
                            {levels.map((level, index) => (
                              <button key={index} onClick={() => setQuality(index)} className={`flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-white/10 rounded-xl transition-colors ${currentLevel === index ? "text-purple-400 font-bold bg-white/5" : ""}`}>
                                <span>{level.height}p</span>
                                {currentLevel === index && <CheckCircle2 size={14} />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={toggleRecording} 
                      className={`p-3 rounded-full text-white transition-all active:scale-95 group/record ${isRecording ? "bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-white/10 hover:bg-white/20"}`}
                      title={isRecording ? "Dừng ghi hình" : "Bắt đầu ghi hình"}
                    >
                      <Circle size={20} className={isRecording ? "fill-white" : "group-hover/record:fill-red-500 transition-colors"} />
                    </button>
                    <button onClick={toggleFullscreen} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95">
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CHANNEL INFO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? "text-white" : "text-slate-950"}`}>
            {active.name}
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              TRỰC TIẾP
            </span>
          </h2>
          <button 
            onClick={() => toggleFavorite(active)}
            className={`p-2 rounded-full transition-all hover:scale-110 ${favorites.includes(active.name) ? "text-red-500" : isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Heart className={`h-6 w-6 ${favorites.includes(active.name) ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* LỊCH PHÁT SỐNG (EPG) */}
      <div className={`mt-8 overflow-hidden border ${
        liquidGlass ? "rounded-[32px]" : "rounded-2xl"
      } ${isDark ? "bg-[#111] border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
        <div className="p-6 md:p-8 text-center border-b border-white/5">
          <h3 className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>Lịch phát sóng</h3>
        </div>
        
        <div className="border-y border-red-600 py-3 md:py-4 flex items-center justify-between px-6 md:px-12 bg-black/40">
          <button className="text-white/40 hover:text-white transition-colors p-2">
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <span className="text-lg md:text-xl font-black uppercase tracking-[0.2em] text-white">Hôm nay</span>
          <button className="text-white/40 hover:text-white transition-colors p-2">
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {getMockEpg(active.name).map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-6 md:gap-12 py-5 md:py-7 px-8 md:px-16 transition-colors ${
                item.isCurrent ? "bg-white/5" : "hover:bg-white/5"
              }`}
            >
              <span className={`text-xl md:text-2xl font-black font-mono w-20 md:w-24 shrink-0 ${
                item.isCurrent ? "text-white" : "text-white/40"
              }`}>
                {item.time}
              </span>
              
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {item.isCurrent && (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)] shrink-0" />
                )}
                <span className={`text-xl md:text-2xl font-bold truncate ${
                  item.isCurrent ? "text-white" : "text-white/40"
                }`}>
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
            {["Tất cả", "VTV", "HTV", "VTVcab", "SCTV", "Địa phương", "HTV Hà Nội FM", "TV360 TV", "Phim truyện TV360", "Thể thao TV360", "Kênh quốc tế", "Thiết yếu", "Phát thanh"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 md:px-4 md:py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === type
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                    : isDark
                    ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    : "bg-white/10 border-white/20 text-slate-600 hover:bg-white/20"
                } ${liquidGlass ? "backdrop-blur-md" : ""}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Desktop Sort Button */}
            <button
              onClick={() => {
                if (sortOrder === "default") setSortOrder("az");
                else if (sortOrder === "az") setSortOrder("za");
                else setSortOrder("default");
              }}
              className={`hidden md:flex p-3.5 md:p-3 rounded-xl border transition-all items-center gap-2 ${
                isDark 
                  ? "bg-slate-800/50 border-slate-700/50 text-white" 
                  : "bg-white/50 border-white/60 text-slate-900"
              } ${liquidGlass ? "backdrop-blur-md" : ""}`}
              title={sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "Sắp xếp A-Z" : "Sắp xếp Z-A"}
            >
              <Filter className="h-5 w-5" />
              <span className="text-sm font-medium">
                {sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "A-Z" : "Z-A"}
              </span>
            </button>

            {/* Mobile Sort Dropdown */}
            <div className="relative md:hidden flex-1">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  isDark 
                    ? "bg-white/5 border-white/5 text-white" 
                    : "bg-white/10 border-white/20 text-slate-900"
                } ${liquidGlass ? "backdrop-blur-md" : ""}`}
              >
                <Sliders className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Sort</span>
                <span className="ml-auto text-[10px] opacity-50">
                  {sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "A-Z" : "Z-A"}
                </span>
              </button>
              
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute top-full left-0 right-0 mt-2 z-50 p-2 border shadow-2xl ${
                      isDark ? "bg-slate-900/95 border-white/10" : "bg-white/95 border-black/5"
                    } ${liquidGlass ? "rounded-2xl backdrop-blur-3xl" : "rounded-xl"}`}
                  >
                    {[
                      { id: "default", label: "Mặc định" },
                      { id: "az", label: "Sắp xếp A-Z" },
                      { id: "za", label: "Sắp xếp Z-A" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortOrder(opt.id as any);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          sortOrder === opt.id 
                            ? "bg-purple-600 text-white" 
                            : isDark ? "text-white hover:bg-white/5" : "text-slate-900 hover:bg-black/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CHANNEL LIST */}
        <div className="space-y-8">
          {filteredCategories.map(cat => (
            <div key={cat}>
              <h3 className={`mb-4 text-lg font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>{cat}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
                {filteredChannels.filter(c => c.category === cat).map((ch) => (
                  <ChannelCard 
                    key={`${ch.name}-${ch.category}-${ch.stream}`} 
                    ch={ch} 
                    onClick={() => setActive(ch)} 
                    onShowEpg={onShowEpg}
                    isDark={isDark} 
                    isActive={active.name === ch.name} 
                    favorites={favorites} 
                    toggleFavorite={toggleFavorite} 
                    liquidGlass={liquidGlass}
                  />
                ))}
              </div>
            </div>
          ))}
          {filteredChannels.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-4">
                <img 
                  src="https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi" 
                  alt="Search" 
                  className="h-10 w-10 object-contain" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Không tìm thấy kênh nào</h3>
              <p className="text-slate-500">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: boolean }) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState("phone");
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"main" | "extra" | "manage">("main");

  const steps = [
    { num: 1, label: "Chọn gói" },
    { num: 2, label: "Thanh toán" },
    { num: 3, label: "Kết quả" }
  ];

  const paymentMethods = [
    { id: "phone", name: "Tài khoản điện thoại", icon: Smartphone, color: "bg-orange-500" },
    { id: "viettel", name: "Viettel Money", logo: "input_file_0.png" },
    { id: "shopee", name: "Ví ShopeePay", logo: "input_file_1.png" },
    { id: "momo", name: "Ví Momo", logo: "input_file_2.png" },
    { id: "zalopay", name: "Ví ZaloPay", logo: "input_file_3.png" },
  ];

  const plans = activeCategory === "main" ? [
    {
      name: "Gói Standard",
      price: "3.000",
      features: [
        { label: "Độc quyền giải C1 & Bundesliga", active: true },
        { label: "Độc quyền giải đua xe F1", active: false },
        { label: "Trực tiếp Cúp Châu Âu, La Liga và nhiều giải thể thao lớn", active: true },
        { label: "Hơn 130 kênh truyền hình trong nước & quốc tế", active: true },
        { label: "Phim Châu Á hay nhất", active: true },
        { label: "Kho bom tấn Âu Mỹ", active: true },
        { label: "Kho phim HBO Go", active: false },
        { label: "Phim điện ảnh Việt Nam mới nhất", active: false },
        { label: "Xem 2 thiết bị tại 1 thời điểm", active: true },
        { label: "Miễn phí Data 4G/5G Viettel", active: true },
      ],
      color: "from-blue-600/20 to-blue-900/40",
      border: "border-blue-500/30"
    },
    {
      name: "V Cine",
      price: "20.000",
      features: [
        { label: "Độc quyền giải C1 & Bundesliga", active: false },
        { label: "Độc quyền giải đua xe F1", active: false },
        { label: "Trực tiếp Cúp Châu Âu, La Liga và nhiều giải thể thao lớn", active: false },
        { label: "Hơn 120 kênh truyền hình trong nước & quốc tế", active: true },
        { label: "Phim Châu Á hay nhất", active: true },
        { label: "Kho bom tấn Âu Mỹ", active: true },
        { label: "Kho phim HBO Go", active: false },
        { label: "Phim điện ảnh Việt Nam mới nhất", active: false },
        { label: "Xem 1 thiết bị tại 1 thời điểm", active: true },
        { label: "Miễn phí Data 4G/5G Viettel", active: true },
      ],
      color: "from-rose-600/20 to-rose-900/40",
      border: "border-rose-500/30"
    },
    {
      name: "V Sport",
      price: "30.000",
      features: [
        { label: "Độc quyền giải C1 & Bundesliga", active: true },
        { label: "Độc quyền giải đua xe F1", active: false },
        { label: "Trực tiếp Cúp Châu Âu, La Liga và nhiều giải thể thao lớn", active: true },
        { label: "Hơn 120 kênh truyền hình trong nước & quốc tế", active: true },
        { label: "Phim Châu Á hay nhất", active: false },
        { label: "Kho bom tấn Âu Mỹ", active: false },
        { label: "Kho phim HBO Go", active: false },
        { label: "Xem 1 thiết bị tại 1 thời điểm", active: true },
        { label: "Miễn phí Data 4G/5G Viettel", active: true },
      ],
      color: "from-teal-600/20 to-teal-900/40",
      border: "border-teal-500/30"
    },
    {
      name: "VIP",
      price: "25.000",
      features: [
        { label: "Độc quyền giải C1 & Bundesliga", active: true },
        { label: "Độc quyền giải đua xe F1", active: true },
        { label: "Trực tiếp Cúp Châu Âu, La Liga và nhiều giải thể thao lớn", active: true },
        { label: "Hơn 130 kênh truyền hình trong nước & quốc tế", active: true },
        { label: "Phim Châu Á hay nhất", active: true },
        { label: "Kho bom tấn Âu Mỹ", active: true },
        { label: "Kho phim HBO Go", active: false },
        { label: "Xem 2 thiết bị tại 1 thời điểm", active: true },
        { label: "Miễn phí Data 4G/5G Viettel", active: true },
      ],
      color: "from-indigo-600/20 to-indigo-900/40",
      border: "border-indigo-500/30"
    },
    {
      name: "VIP Mobile",
      price: "12.000",
      features: [
        { label: "Độc quyền giải C1 & Bundesliga", active: true },
        { label: "Độc quyền giải đua xe F1", active: false },
        { label: "Trực tiếp Cúp Châu Âu, La Liga và nhiều giải thể thao lớn", active: true },
        { label: "Hơn 130 kênh truyền hình trong nước & quốc tế", active: true },
        { label: "Phim Châu Á hay nhất", active: true },
        { label: "Kho bom tấn Âu Mỹ", active: true },
        { label: "Kho phim HBO Go", active: false },
        { label: "Phim điện ảnh Việt Nam mới nhất", active: false },
        { label: "Xem 1 thiết bị tại 1 thời điểm", active: true },
        { label: "Miễn phí Data 4G/5G Viettel", active: true },
      ],
      color: "from-purple-600/20 to-purple-900/40",
      border: "border-purple-500/30"
    }
  ] : [
    {
      name: "Cloud Store",
      price: "10.000",
      features: [
        { label: "Lưu trữ nội dung offline", active: true },
        { label: "Dung lượng 50GB", active: true },
        { label: "Miễn phí 30 ngày đầu", active: true },
      ],
      color: "from-amber-600/20 to-amber-900/40",
      border: "border-amber-500/30"
    },
    {
      name: "F1",
      price: "45.000",
      features: [
        { label: "Xem toàn bộ các chặng đua F1", active: true },
        { label: "Bình luận chuyên sâu", active: true },
        { label: "Chất lượng 4K/UHD", active: true },
      ],
      color: "from-red-700/30 to-black/60",
      border: "border-red-600/40"
    },
    {
      name: "C1 (UEFA)",
      price: "50.000",
      features: [
        { label: "Toàn bộ cúp Châu Âu (C1, C2, C3)", active: true },
        { label: "Xem trực tiếp & xem lại trọn mùa", active: true },
      ],
      color: "from-blue-700/30 to-indigo-900/60",
      border: "border-blue-500/40"
    },
    {
      name: "HBO GO",
      price: "79.000",
      features: [
        { label: "Toàn bộ kho phim bom tấn HBO", active: true },
        { label: "Phim phát hành cùng lúc với Mỹ", active: true },
      ],
      color: "from-zinc-800/80 to-black",
      border: "border-zinc-700/50"
    },
    {
      name: "Không quảng cáo",
      price: "30.000",
      features: [
        { label: "Loại bỏ hoàn toàn quảng cáo", active: true },
        { label: "Tăng tốc độ tải video", active: true },
      ],
      color: "from-yellow-600/30 to-orange-900/60",
      border: "border-yellow-500/40"
    },
    {
      name: "Galaxy Play Mobile",
      price: "20.000",
      features: [
        { label: "Kho phim Galaxy Play Mobile", active: true },
        { label: "Dành riêng di động", active: true },
      ],
      color: "from-cyan-600/30 to-sky-900/60",
      border: "border-cyan-500/40"
    },
    {
      name: "Galaxy Play HD",
      price: "50.000",
      features: [
        { label: "Kho phim Galaxy Play TV/Web", active: true },
        { label: "Chất lượng 4K", active: true },
      ],
      color: "from-cyan-700/40 to-blue-900/80",
      border: "border-cyan-400/50"
    }
  ];

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = () => {
    setStep(3);
  };

  return (
    <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#0f0f0f]" : "bg-white"}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className={`${isDark ? "text-white" : "text-black"}`}>
              <ChevronLeft size={32} />
            </button>
          )}
          <h2 className={`flex-1 text-2xl font-black text-center uppercase tracking-tighter italic ${isDark ? "text-white" : "text-slate-900"}`}>
            {step === 3 ? "Hoàn tất" : "Gói cước"}
          </h2>
          {step > 1 && <div className="w-8" />}
        </div>

        {/* Stepper */}
        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2" />
          {steps.map((s, idx) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-500 ${
                s.num <= step ? "bg-red-600 border-red-600 text-white" : "bg-slate-900 border-slate-700 text-slate-400"
              }`}>
                {s.num < step ? <Check size={18} strokeWidth={3} /> : s.num}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${
                s.num <= step ? "text-white" : "text-slate-500"
              }`}>{s.label}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Plan Tabs */}
              <div className="flex items-center justify-center gap-4 md:gap-12 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
                <button 
                  onClick={() => setActiveCategory("main")}
                  className={`${activeCategory === "main" ? "text-red-500" : "text-slate-500"} font-bold uppercase tracking-wider relative transition-colors`}
                >
                  Gói cước chính
                  {activeCategory === "main" && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-red-600" />}
                </button>
                <button 
                  onClick={() => setActiveCategory("extra")}
                  className={`${activeCategory === "extra" ? "text-red-500" : "text-slate-500"} font-bold uppercase tracking-wider relative transition-colors`}
                >
                  Gói mua thêm
                  {activeCategory === "extra" && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-red-600" />}
                </button>
                <button 
                  onClick={() => setActiveCategory("manage")}
                  className={`${activeCategory === "manage" ? "text-red-500" : "text-slate-500"} font-bold uppercase tracking-wider relative transition-colors`}
                >
                  Quản lý gói cước
                  {activeCategory === "manage" && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-red-600" />}
                </button>
              </div>

              {activeCategory === "manage" ? (
                <div className="space-y-6 pb-20">
                  <div className="bg-[#1a1a1a] rounded-[32px] p-8 border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-900 rounded-[24%] flex items-center justify-center text-white">
                        <Crown size={32} />
                      </div>
                      <div>
                        <h3 className="text-white text-xl font-bold">Gói Miễn Phí</h3>
                        <p className="text-slate-400">Bạn đang sử dụng quyền lợi cơ bản</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Trạng thái</span>
                        <p className="text-green-500 font-black">HOẠT ĐỘNG</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Hết hạn</span>
                        <p className="text-white font-black">VÔ THỜI HẠN</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveCategory("main")}
                      className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold uppercase tracking-widest transition-all"
                    >
                      Nâng cấp gói ngay
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-bold ml-2">Lịch sử thanh toán</h4>
                    <div className="bg-[#1a1a1a] rounded-3xl p-4 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                          <History size={18} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">Hệ thống</p>
                          <p className="text-slate-500 text-xs">02/05/2026 13:46</p>
                        </div>
                      </div>
                      <span className="text-white font-bold">0đ</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Plans Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
                {plans.map((plan, idx) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative rounded-[32px] overflow-hidden border ${plan.border} ${isDark ? "bg-[#1a1a1a]" : "bg-slate-50"} flex flex-col`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.color}`} />
                    
                    <div className="relative p-6 space-y-6 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-white text-2xl font-black italic uppercase tracking-tighter">{plan.name}</h3>
                        <button className="text-white/60 text-xs font-bold underline">Chính sách gói</button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-white/60 text-sm font-bold">Chỉ từ</span>
                          <div className="text-white text-4xl font-black">{plan.price}đ</div>
                        </div>
                        <button 
                          onClick={() => handleSelectPlan(plan)}
                          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/20"
                        >
                          Đăng ký
                        </button>
                      </div>

                      <div className="space-y-3 pt-4">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                              f.active ? "bg-white text-slate-900" : "bg-white/10 text-white/30"
                            }`}>
                              {f.active ? (
                                <Check size={12} strokeWidth={4} />
                              ) : (
                                <X size={10} strokeWidth={4} />
                              )}
                            </div>
                            <span className={`text-sm font-medium leading-tight ${
                              f.active ? "text-white" : "text-white/30"
                            }`}>
                              {f.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}
            </motion.div>
          )}

          {step === 2 && selectedPlan && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 pb-32"
            >
              {/* Selected Plan Summary */}
              <div className="bg-[#1a1a1a] rounded-[32px] p-6 space-y-6 border border-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="text-white text-xl font-bold">{selectedPlan.name}</h3>
                  <div className="text-white text-xl font-black">{selectedPlan.price}đ</div>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="flex items-center gap-2 text-slate-400 font-bold text-sm mx-auto"
                  >
                    {showAllFeatures ? "Thu gọn" : "Xem thêm"}
                    <motion.div animate={{ rotate: showAllFeatures ? 180 : 0 }}>
                      <ChevronRight size={16} className="rotate-90" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showAllFeatures && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-3 pt-2"
                      >
                        {selectedPlan.features.filter((f: any) => f.active).map((f: any, i: number) => (
                          <div key={i} className="flex gap-3 items-center">
                            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-white">
                              <Check size={10} strokeWidth={4} />
                            </div>
                            <span className="text-white/80 text-sm">{f.label}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-6">
                <h3 className="text-white text-lg font-bold">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedPayment(m.id)}
                      className={`w-full p-6 rounded-[24px] border-2 transition-all flex items-center justify-between ${
                        selectedPayment === m.id 
                          ? "bg-red-600/10 border-red-600" 
                          : "bg-[#1a1a1a] border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === m.id ? "border-red-600" : "border-slate-700"
                        }`}>
                          {selectedPayment === m.id && <div className="w-3 h-3 bg-red-600 rounded-full" />}
                        </div>
                        <div className={`w-10 h-10 ${m.logo ? "bg-white" : m.color} rounded-xl flex items-center justify-center overflow-hidden`}>
                          {m.logo ? (
                            <img src={m.logo} alt={m.name} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                          ) : (
                            m.icon && <m.icon size={20} className="text-white" />
                          )}
                        </div>
                        <span className={`text-lg font-medium ${selectedPayment === m.id ? "text-white" : "text-slate-400"}`}>
                          {m.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Checkout Bar */}
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0f0f0f]/80 backdrop-blur-xl border-t border-white/10 z-50">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="bg-[#1a1a1a] p-6 rounded-[24px] flex justify-between items-center">
                    <span className="text-slate-400 text-lg font-medium">Tổng cộng</span>
                    <span className="text-white text-2xl font-black">{selectedPlan.price}đ</span>
                  </div>
                  <button 
                    onClick={handlePayment}
                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-[24px] text-xl font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-600/20"
                  >
                    Thanh Toán
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/20">
                <CheckCircle2 size={64} />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-white text-3xl font-black uppercase italic tracking-tight">Thanh toán thành công!</h3>
                <p className="text-slate-400 text-lg max-w-sm mx-auto">
                  Cảm ơn bạn đã lựa chọn dịch vụ của TV360. Gói cước của bạn đã được kích hoạt.
                </p>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="px-12 py-4 bg-[#1a1a1a] text-white rounded-full font-bold uppercase tracking-widest border border-white/10"
              >
                Quay lại trang chủ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CategoriesContent({ isDark, liquidGlass, setActiveTab }: { isDark: boolean, liquidGlass: boolean, setActiveTab: (t: string) => void }) {
  const moreItems = [
    { name: "Home", icon: Home, id: "Trang chủ" },
    { name: "Truyền hình", icon: Tv, id: "Truyền hình" },
    { name: "Profile", icon: User, id: "Cài đặt" },
    { name: "Messages", icon: MessageSquare, id: "Trang chủ" },
    { name: "Connect", icon: Users, id: "Trang chủ" },
    { name: "Avatar", icon: Smile, id: "Cài đặt" },
    { name: "Inventory", icon: Package, id: "Truyền hình" },
    { name: "Trade", icon: Repeat, id: "Phim" },
    { name: "Communities", icon: Globe, id: "Video" },
    { name: "Blog", icon: BookOpen, id: "Video" },
    { name: "Official Store", icon: ShoppingBag, id: "Gói cước" },
    { name: "Buy Gift Cards", icon: CreditCard, id: "Gói cước" },
    { name: "Get Premium", icon: ShieldCheck, id: "Gói cước", isSpecial: true },
  ];

  return (
    <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#1f2127]" : "bg-[#f2f4f5]"} p-6 pb-24 md:p-12`}>
      <div className="max-w-3xl space-y-2">
        {moreItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-6 px-6 py-4 rounded-xl transition-all group ${
              isDark ? "hover:bg-white/5 text-white" : "hover:bg-white text-slate-800 shadow-sm border border-slate-100"
            }`}
          >
            <item.icon size={28} className={item.isSpecial ? "text-amber-400" : (isDark ? "text-white" : "text-slate-900")} />
            <span className="text-2xl font-bold">{item.name}</span>
          </button>
        ))}
        
        <div className="pt-10 flex flex-col gap-4">
          <button className={`w-full py-5 rounded-2xl font-bold transition-all border ${
            isDark ? "bg-[#181818] border-white/5 text-white hover:bg-white/5" : "bg-white border-slate-100 text-slate-800 hover:bg-slate-50"
          }`}>
            Help
          </button>
          <button className={`w-full py-5 rounded-2xl font-bold transition-all border ${
            isDark ? "bg-[#181818] border-white/5 text-white hover:bg-white/5" : "bg-white border-slate-100 text-slate-800 hover:bg-slate-50"
          }`}>
            Quick Login
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchPopup({ 
  isDark, 
  searchQuery, 
  setActiveChannel, 
  onClose, 
  favorites, 
  liquidGlass,
  setActiveTab,
  setIsDark,
  setLiquidGlass,
  onLogin,
  onLogout,
  setSortOrder
}: { 
  isDark: boolean,
  searchQuery: string,
  setActiveChannel: (ch: typeof channels[0]) => void,
  onClose: () => void,
  favorites: string[],
  liquidGlass: boolean,
  setActiveTab: (tab: string) => void,
  setIsDark: (val: boolean) => void,
  setLiquidGlass: (val: boolean) => void,
  onLogin: () => void,
  onLogout: () => void,
  setSortOrder: (val: "az" | "za") => void
}) {
  const [activeCategory, setActiveCategory] = useState("Games");

  const filteredChannels = searchQuery.trim() === "" ? [] : channels.filter(ch => 
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemItems = [
    { name: "Thông báo", type: "system", icon: Bell, action: () => setActiveTab("Thông báo") },
    { name: "Mua gói", type: "system", icon: ShoppingCart, action: () => setActiveTab("Gói cước") },
    { name: "Trang chủ", type: "system", icon: Home, action: () => setActiveTab("Trang chủ") },
    { name: "Truyền hình", type: "system", icon: Tv, action: () => setActiveTab("Truyền hình") },
    { name: "Cài đặt", type: "system", icon: SettingsIcon, action: () => setActiveTab("Cài đặt") },
  ];

  const filteredSystem = searchQuery.trim() === "" ? [] : systemItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchCategories = [
    { name: "Games", icon: Gamepad2, id: "Games" },
    { name: "Profile", icon: User, id: "Profile" },
    { name: "Marketplace", icon: ShoppingBag, id: "Marketplace" },
    { name: "Communities", icon: Globe, id: "Communities" },
    { name: "Creator Store", icon: Wrench, id: "Creator Store" },
  ];

  const suggestions = ["Tycoon", "Escape", "Survival", "Story", "Horror", "Sim"];

  const renderContent = () => {
    if (searchQuery.trim() === "") {
      return (
        <div className="py-2 space-y-6">
          <div className="space-y-4">
            <h3 className={`px-4 text-xl font-bold ${isDark ? "text-white" : "text-black text-opacity-80"}`}>Recently Visited</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 px-4 scrollbar-hide">
              {channels.slice(0, 5).map((ch, idx) => (
                <button 
                  key={ch.name + idx}
                  onClick={() => { setActiveChannel(ch); onClose(); }}
                  className="flex flex-col items-center gap-2 min-w-[80px]"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                    <img src={ch.logo} className="w-10 h-10 object-contain" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <span className={`text-[10px] font-bold truncate w-full text-center ${isDark ? "text-white/60" : "text-slate-500"}`}>{ch.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className={`px-4 text-xl font-bold ${isDark ? "text-white" : "text-black text-opacity-80"}`}>Try searching for</h3>
            <div className="flex flex-wrap gap-2 px-4">
              {suggestions.map(s => (
                <button 
                  key={s}
                  className={`px-6 py-2.5 font-bold text-sm rounded-full border transition-all active:scale-95 ${
                    isDark 
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/5" 
                      : "bg-white text-slate-800 border-slate-200 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {searchCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeCategory === cat.id
                  ? (isDark ? "bg-white text-black" : "bg-slate-900 text-white")
                  : (isDark ? "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10" : "bg-slate-100 text-slate-500 border border-slate-200")
              }`}
            >
              <cat.icon size={14} />
              {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeCategory === "Games" && (
            <div className="space-y-1">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((ch, idx) => (
                  <button
                    key={ch.name + idx}
                    onClick={() => { setActiveChannel(ch); onClose(); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"}`}>
                      <img src={ch.logo} alt={ch.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm ${isDark ? "text-white" : "text-black"}`}>{ch.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-black/40"}`}>{ch.category}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDark ? "text-white/20" : "text-black/30"}`} />
                  </button>
                ))
              ) : (
                <p className="text-center py-4 text-xs opacity-40">No games found</p>
              )}
            </div>
          )}

          {activeCategory === "Profile" && (
            <div className="space-y-2">
              {[1, 2, 3].map(id => (
                <div key={id} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className={`w-12 h-12 rounded-full border-2 ${isDark ? "bg-white/10 border-white/20" : "bg-slate-100 border-white"}`}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id + searchQuery}`} className="w-full h-full rounded-full" alt="" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>User_{id}_{searchQuery}</p>
                    <p className="text-[10px] opacity-40">@roblox_user_{id}</p>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${isDark ? "bg-white text-black" : "bg-slate-900 text-white"}`}>Add</button>
                </div>
              ))}
            </div>
          )}

          {activeCategory === "Marketplace" && (
            <div className="grid grid-cols-2 gap-4">
               {[1, 2, 3, 4].map(id => (
                 <div key={id} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                   <div className="w-full aspect-square rounded-xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                     <Package size={24} className="opacity-40" />
                   </div>
                   <div className="text-center">
                     <p className={`text-[10px] font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Roblox Catalog Item {id}</p>
                     <p className="text-[10px] text-amber-500 font-black">{id * 100} R$</p>
                   </div>
                   <button className="w-full py-2 bg-amber-500 text-white text-[10px] font-bold rounded-lg uppercase">Inspect</button>
                 </div>
               ))}
            </div>
          )}

          {activeCategory === "Communities" && (
            <div className="space-y-2">
               {[1, 2, 3].map(id => (
                 <div key={id} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? "bg-blue-500/20" : "bg-blue-50"}`}>
                     <Users size={20} className="text-blue-500" />
                   </div>
                   <div className="flex-1">
                     <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{id === 1 ? "Blox Fruit Fans" : id === 2 ? "Adopt Me! Official" : "Roblox Devs"}</p>
                     <p className="text-[10px] opacity-40">{id === 1 ? "2.5M" : id === 2 ? "1.8M" : "500K"} Members</p>
                   </div>
                   <ChevronRight size={14} className="opacity-40" />
                 </div>
               ))}
            </div>
          )}

          {activeCategory === "Creator Store" && (
            <div className="space-y-4">
               <div className={`p-6 rounded-3xl border border-dashed text-center space-y-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-300 bg-slate-50"}`}>
                 <Wrench size={32} className="mx-auto opacity-20" />
                 <div className="space-y-1">
                   <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Roblox Creator Store</p>
                   <p className="text-[10px] opacity-60">Find assets, plugins, and more for your experiences</p>
                 </div>
                 <button 
                   onClick={() => window.open('https://www.roblox.com/create', '_blank')}
                   className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${isDark ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20" : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20"}`}
                 >
                   Open Creator Store
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`absolute bottom-full mb-6 w-[90vw] md:w-full max-w-[400px] border shadow-2xl overflow-hidden ${
        liquidGlass ? "rounded-[32px] backdrop-blur-3xl" : "rounded-xl"
      } ${isDark ? "bg-[#181818] border-white/10" : "bg-white/95 border-white/80"}`}
    >
      <div className="p-4 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {renderContent()}
      </div>
    </motion.div>
  );
}

function NotificationsContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: boolean }) {
  const notifications = [
    { title: "Welcome to Roblox", message: "Experience high-quality games with over 200 trending titles.", time: "Just now", type: "system" },
    { title: "Premium Subscription", message: "Renew now to get exclusive items and 10% more Robux.", time: "2 hours ago", type: "promo" },
    { title: "Scheduled Maintenance", message: "Roblox will be down for maintenance from 2:00 to 4:00 AM tomorrow.", time: "1 day ago", type: "alert" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <Bell size={24} />
        </div>
        <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Notifications</h2>
      </div>

      <div className="space-y-4">
        {notifications.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 border transition-all ${
              liquidGlass ? "rounded-3xl backdrop-blur-xl" : "rounded-2xl"
            } ${
              isDark 
                ? "bg-white/5 border-white/10 hover:bg-white/10" 
                : "bg-white border-slate-200 shadow-sm hover:shadow-md"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{n.title}</h3>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{n.message}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-blue-500 mt-2">{n.time}</p>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-red-500' : 'bg-purple-500'} shadow-[0_0_10px_currentColor]`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PurchaseContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: boolean }) {
  const [selectedMethod, setSelectedMethod] = useState('phone');
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const plans = [
    { id: 'basic', name: "Cơ bản", price: "Miễn phí", features: ["Hơn 100 kênh phổ thông", "Chất lượng SD/HD", "Có quảng cáo"], color: "slate", current: true },
    { id: 'vip', name: "VIP", price: "29.000đ", duration: "/tháng", features: ["Hơn 200 kênh cao cấp", "Toàn bộ VTVCab & HTV", "Chất lượng Full HD", "Không quảng cáo"], color: "purple", popular: true },
    { id: 'premium', name: "Premium", price: "59.000đ", duration: "/tháng", features: ["Bao gồm tất cả gói VIP", "Chất lượng 4K Ultra HD", "Xem trên 3 thiết bị"], color: "amber" },
  ];

  const durations = [
    { id: '1', price: '3.000đ', period: '1 ngày' },
    { id: '7', price: '15.000đ', period: '7 ngày' },
    { id: '30', price: '50.000đ', period: '30 ngày' },
    { id: '90', price: '150.000đ', period: '90 ngày' },
    { id: '180', price: '300.000đ', period: '180 ngày' },
    { id: '270', price: '450.000đ', period: '270 ngày' },
    { id: '360', price: '600.000đ', period: '360 ngày' }
  ];

  const visibleDurations = isExpanded ? durations : durations.slice(0, 3);

  const paymentMethods = [
    { id: 'phone', name: 'Tài khoản điện thoại', icon: Smartphone, color: 'bg-red-500' },
    { id: 'viettel', name: 'Viettel Money', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Logo_Viettel_Money.png' },
    { id: 'shopeepay', name: 'Ví ShopeePay', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/ShopeePay_logo.svg/2560px-ShopeePay_logo.svg.png' },
    { id: 'momo', name: 'Ví Momo', logo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
    { id: 'zalopay', name: 'Ví ZaloPay', logo: 'https://images.careerbuilder.vn/content/images/ZaloPay-logo-Social.png' }
  ];

  const currentDuration = durations.find(d => d.id === selectedDuration);
  const currentPlan = plans.find(p => p.id === activePlan) || plans[2]; // Default to Premium if none selected

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-12 pb-24">
      <div className="text-center space-y-4">
        <h2 className={`text-4xl font-black tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>Loại gói cước</h2>
        <p className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>Chọn gói phù hợp nhất với nhu cầu giải trí của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => !p.current && setActivePlan(p.id)}
            className={`relative p-8 border flex flex-col transition-all cursor-pointer group overflow-hidden ${
              liquidGlass ? "rounded-[40px] backdrop-blur-3xl" : "rounded-3xl"
            } ${
              isDark 
                ? "bg-white/5 border-white/10 hover:border-purple-500/50" 
                : "bg-white border-slate-200 shadow-xl hover:shadow-2xl"
            } ${p.popular ? "ring-2 ring-purple-500/50 scale-105" : ""} ${activePlan === p.id ? "ring-2 ring-red-500 border-red-500/50" : ""}`}
          >
            {p.popular && (
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">Phổ biến nhất</div>
            )}
            
            <div className="space-y-6 flex-1">
              <div className="space-y-1">
                <h3 className={`text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{p.price}</span>
                  {p.duration && <span className="text-sm opacity-50">{p.duration}</span>}
                </div>
              </div>

              <div className="space-y-3">
                {p.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={16} className={p.color === 'amber' ? 'text-amber-500' : 'text-purple-500'} />
                    <span className={isDark ? "text-slate-300" : "text-slate-600"}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className={`mt-8 w-full py-4 rounded-2xl font-black transition-all active:scale-95 ${
              p.current 
                ? (isDark ? "bg-white/10 text-white cursor-default" : "bg-slate-100 text-slate-400 cursor-default")
                : (p.color === 'amber' ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20")
            }`}>
              {p.current ? "Đang sử dụng" : "Chọn gói"}
            </button>
          </motion.div>
        ))}
      </div>

      {(activePlan || true) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12 max-w-2xl mx-auto"
        >
          {/* Extended Periods */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {visibleDurations.map((d) => (
                <button 
                  key={d.id}
                  onClick={() => setSelectedDuration(d.id)}
                  className={`flex items-center justify-between p-6 border transition-all ${
                    liquidGlass ? "rounded-3xl" : "rounded-2xl"
                  } ${
                    selectedDuration === d.id
                      ? (isDark ? "bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/5" : "bg-red-50/50 border-red-500 shadow-red-500/20 shadow-md")
                      : (isDark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm")
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedDuration === d.id 
                        ? "border-red-500 bg-red-500" 
                        : (isDark ? "border-slate-700 font-bold" : "border-slate-300")
                    }`}>
                      {selectedDuration === d.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{d.price}/{d.period}</span>
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-full flex items-center justify-center gap-2 font-bold py-2 transition-all ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
            >
              {isExpanded ? "Thu gọn" : "Xem thêm"} <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "-rotate-90" : "rotate-90"}`} />
            </button>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Phương thức thanh toán</h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((m) => (
                <motion.button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 p-5 border transition-all ${
                    liquidGlass ? "rounded-3xl" : "rounded-2xl"
                  } ${
                    selectedMethod === m.id
                      ? (isDark ? "bg-red-500/10 border-red-500/50 shadow-lg shadow-red-500/5" : "bg-red-50/50 border-red-500/50 shadow-md shadow-red-500/5")
                      : (isDark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm")
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMethod === m.id 
                      ? "border-red-500 bg-red-500" 
                      : (isDark ? "border-slate-700" : "border-slate-300")
                  }`}>
                    {selectedMethod === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                    {m.icon ? (
                      <div className={`p-2 rounded-lg ${m.color} text-white`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                    ) : (
                      <img src={m.logo} alt={m.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  
                  <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{m.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer Promo */}
          <div className="pt-8 space-y-6">
            <div className={`p-6 flex items-center justify-between ${
              liquidGlass ? "rounded-3xl" : "rounded-2xl"
            } ${isDark ? "bg-[#222]" : "bg-slate-100"}`}>
              <span className={`text-2xl font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Tổng cộng</span>
              <span className="text-red-500 text-3xl font-black">
                {durations.find(d => d.id === selectedDuration)?.price || "0đ"}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowConfirm(true)}
              className="w-full py-5 bg-red-600 text-white rounded-2xl text-2xl font-black shadow-xl shadow-red-600/30 active:bg-red-700 transition-colors"
            >
              Thanh Toán
            </motion.button>

            <div className="bg-red-600 rounded-[32px] p-4 flex items-center gap-4 shadow-xl shadow-red-600/20">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2.5 overflow-hidden shadow-inner">
                <Logo size="sm" />
              </div>
              <p className="text-white font-black text-lg flex-1">Tải app TV360 để trải nghiệm tốt hơn</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm ${
                isDark ? "bg-[#222]" : "bg-white"
              } rounded-[2rem] shadow-2xl overflow-hidden p-8 space-y-8`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8" />
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Xác nhận</h3>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className={`p-2 rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"} transition-colors`}
                >
                  <X className={isDark ? "text-white" : "text-slate-900"} />
                </button>
              </div>

              <div className={`p-6 ${isDark ? "bg-[#333]" : "bg-slate-50"} rounded-2xl space-y-4`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Tài khoản</span>
                  <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>84352xxx944</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Gói cước</span>
                  <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{currentPlan.name} {currentDuration?.period}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Tổng thanh toán</span>
                  <span className="text-red-500 font-black text-lg">{currentDuration?.price}</span>
                </div>
              </div>

              <p className={`text-center text-xs italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                (đã gồm phí thanh toán qua nhắn tin)
              </p>

              <div className={`p-8 ${isDark ? "bg-[#333]" : "bg-slate-100"} rounded-2xl text-center space-y-2`}>
                <span className={`text-xs uppercase font-bold tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Soạn SMS</span>
                <p className={`text-xl font-bold leading-relaxed ${isDark ? "text-white" : "text-slate-900"}`}>
                  Để confirm soạn tin <span className="text-red-500 italic">Y</span> gửi <span className="text-red-500 italic">1331</span>
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className={`flex-1 py-4 border rounded-2xl font-bold transition-all ${
                    isDark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-200 text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Đóng
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 active:bg-red-700 transition-all"
                >
                  Gửi SMS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventsContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: boolean }) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-full ${isDark ? "bg-white/5" : "bg-black/5"}`}
      >
        <Sparkles className="w-12 h-12 text-purple-500 opacity-20 animate-pulse" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Kho lưu trữ sự kiện trực tiếp</h2>
        <p className={`text-sm opacity-50 max-w-xs mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Hiện tại chưa có sự kiện nào được lưu trữ. Các sự kiện trực tiếp sẽ xuất hiện tại đây sau khi kết thúc.
        </p>
      </motion.div>
    </div>
  );
}

function Footer({ isDark }: { isDark: boolean }) {
  return (
    <footer className={`mt-auto pt-16 pb-32 px-6 ${isDark ? "bg-[#0b1221]" : "bg-white"} border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Branding Section */}
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo size="lg" />
          <h3 className={`text-2xl md:text-3xl font-bold tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Download the app and follow TV360_roblox
          </h3>
          <div className="flex gap-4">
            <a href="#" className={`p-3 rounded-full transition-all ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className={`p-3 rounded-full transition-all ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
              <Youtube className="w-6 h-6" />
            </a>
            <a href="#" className={`p-3 rounded-full transition-all ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"}`}>
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Store Buttons */}
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="transition-transform hover:scale-105">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" 
              alt="Google Play" 
              className="h-14 md:h-16 object-contain"
              referrerPolicy="no-referrer"
            />
          </a>
          <a href="#" className="transition-transform hover:scale-105">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" 
              alt="App Store" 
              className="h-14 md:h-16 object-contain"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>

        {/* Corporate Info */}
        <div className={`text-center space-y-4 max-w-3xl mx-auto ${isDark ? "text-slate-400" : "text-slate-500"} text-sm leading-relaxed font-medium`}>
          <p className="font-bold">Managing Authority: Military Industry and Telecommunications Group.</p>
          <p>Address: Lot D26, Cau Giay New Urban Area, Yen Hoa Ward, Cau Giay District, Hanoi City, Vietnam.</p>
          <p>Customer Service Hotline 18008119</p>
        </div>

        {/* Certification Logos */}
        <div className="flex flex-col items-center gap-8">
          <a href="#" className="transition-opacity hover:opacity-80">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Roblox_logo.svg/2560px-Roblox_logo.svg.png" 
              alt="Roblox Logo" 
              className="h-10 object-contain opacity-20 grayscale"
              referrerPolicy="no-referrer"
            />
          </a>
          <a href="#" className="transition-opacity hover:opacity-80">
            <img 
              src="https://www.dmca.com/img/dmca_protected_sml_120l.png?ID=287611" 
              alt="DMCA Protected" 
              className="h-10 object-contain brightness-110"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

function AdminContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: boolean }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersData = snapshot.docs.map(doc => doc.data());
        setUsers(usersData);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.LIST, "users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

  const filteredUsers = users.filter(u => u.email !== "sonhuyc2kl@gmail.com");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Quản trị</h2>
      <div className={`rounded-xl border overflow-x-auto ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
        <table className="w-full text-left min-w-[600px]">
          <thead className={`border-b ${isDark ? "border-slate-800 bg-slate-800/50 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
            <tr>
              <th className="p-4 font-medium">Người dùng</th>
              <th className="p-4 font-medium">Ngày tạo</th>
              <th className="p-4 font-medium">Đã xem</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800 text-slate-300" : "divide-slate-200 text-slate-700"}`}>
            {filteredUsers.map(u => (
              <tr key={u.uid}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center"><User className="w-4 h-4 text-slate-600" /></div>}
                    <div className="flex flex-col">
                      <span className="font-medium">{u.displayName || "Chưa có tên"}</span>
                      <span className="text-xs opacity-50">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : ""}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {u.watchedChannels && u.watchedChannels.length > 0 ? (
                      u.watchedChannels.map((chName: string) => (
                        <span key={chName} className={`px-2 py-0.5 rounded-full text-[10px] ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                          {chName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs opacity-40 italic">Chưa xem kênh nào</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">Chưa có người dùng nào khác.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function SettingsContent({ 
  isDark, 
  setIsDark, 
  isDev, 
  setIsDev, 
  liquidGlass, 
  setLiquidGlass,
  useSidebar,
  setUseSidebar,
  autoFullscreen,
  setAutoFullscreen,
  user,
  userData,
  setUserData,
  onAlert,
  onLogin
}: { 
  isDark: boolean, 
  setIsDark: (val: boolean) => void, 
  isDev: boolean, 
  setIsDev: (val: boolean) => void,
  liquidGlass: boolean,
  setLiquidGlass: (val: boolean) => void,
  useSidebar: boolean,
  setUseSidebar: (val: boolean) => void,
  autoFullscreen: boolean,
  setAutoFullscreen: (val: boolean) => void,
  user: FirebaseUser | null,
  userData: any,
  setUserData: any,
  onAlert: (title: string, msg: string) => void,
  onLogin: () => void
}) {
  const [activeCategory, setActiveCategory] = useState("Account info");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [twoStepMethod, setTwoStepMethod] = useState("Email (Secure)");

  const categories = [
    "Account info",
    "Security",
    "Privacy & content restrictions",
    "Notifications",
    "Spending",
    "Subscriptions",
    "App permissions",
    "Browser preferences"
  ];

  const securityOptions = [
    { title: "None", desc: "Do not protect my account with any of the 2-Step Verification options below." },
    { title: "Email (Secure)", desc: `Receive unique security codes at ${user?.email ? user.email.replace(/(.).*(@.*)/, "$1***$2") : "h***************@gmail.com"}.` },
    { title: "Authenticator App (Very Secure)", desc: "Download an app on your phone to generate unique security codes. Suggested apps include Google Authenticator, Microsoft Authenticator, and Twilio's Authy." },
    { title: "Hardware Security Keys & Authenticator App (Very Secure)", desc: "Enable both a hardware security key and the authenticator app for enhanced account security. Hardware security keys add strong protection on the web, iPhone, and iPad, and the authenticator app ensures secure access everywhere." }
  ];

  return (
    <div className={`flex-1 overflow-y-auto ${isDark ? "bg-[#121212]" : "bg-[#f2f4f5]"} p-6 pb-24 md:p-12`}>
      <div className="max-w-4xl mx-auto space-y-10">
        <h2 className={`text-4xl md:text-5xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Settings</h2>
        
        {/* Selector */}
        <div className="relative max-w-2xl mx-auto">
          <button 
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${
              isDark 
                ? "bg-[#1f2127] border-white/5 text-white" 
                : "bg-white border-slate-200 text-slate-800 shadow-sm"
            }`}
          >
            <span className="font-bold text-lg">{activeCategory}</span>
            <ChevronDown className={`transition-transform duration-300 ${isSelectorOpen ? "rotate-180" : ""} ${isDark ? "text-white/40" : "text-slate-400"}`} size={24} />
          </button>
          
          <AnimatePresence>
            {isSelectorOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className={`absolute z-30 top-full left-0 w-full mt-2 rounded-[24px] border overflow-hidden shadow-2xl p-2 ${
                  isDark ? "bg-[#1f2127] border-white/10" : "bg-white border-slate-200"
                }`}
              >
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setIsSelectorOpen(false); }}
                    className={`w-full text-left px-5 py-4 rounded-xl font-bold text-sm transition-all ${
                      cat === activeCategory 
                        ? (isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900")
                        : (isDark ? "text-white/60 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-50")
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Categories List (Hidden if selector open or if content is shown) */}
          {activeCategory === "" && !isSelectorOpen && (
            <div className={`rounded-[32px] border overflow-hidden ${
              isDark ? "bg-[#1f2127] border-white/5" : "bg-white border-slate-200 shadow-sm"
            }`}>
              {categories.map((cat, idx) => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-8 py-6 transition-all group ${
                    idx !== categories.length - 1 ? "border-b " + (isDark ? "border-white/5" : "border-slate-100") : ""
                  }`}
                >
                  <span className={`text-xl font-bold transition-transform group-active:translate-x-1 ${
                    cat === activeCategory 
                      ? (isDark ? "text-white" : "text-slate-900") 
                      : (isDark ? "text-white/80 group-hover:text-white" : "text-slate-600 group-hover:text-slate-900")
                  }`}>
                    {cat}
                  </span>
                  <ChevronRight size={20} className={`opacity-0 group-hover:opacity-40 transition-opacity ${isDark ? "text-white" : "text-black"}`} />
                </button>
              ))}
            </div>
          )}

          {/* Account info Content */}
          {activeCategory === "Account info" && !isSelectorOpen && (
            <div className="space-y-12">
              {/* Account Details */}
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>Display Name</p>
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{userData?.displayName || user?.displayName || "N/A"}</p>
                  </div>
                  <button className={`p-2 transition-all opacity-40 group-hover:opacity-100 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>Username</p>
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{user?.email?.split('@')[0] || "N/A"}</p>
                  </div>
                  <button className={`p-2 transition-all opacity-40 group-hover:opacity-100 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>Parental Recovery Email</p>
                      {user?.emailVerified && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">
                          <CheckCircle2 size={10} /> Verified
                        </div>
                      )}
                    </div>
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {user?.email ? user.email.replace(/(.).*(@.*)/, "$1***$2") : "Not set"}
                    </p>
                  </div>
                  <button className={`p-2 transition-all opacity-40 group-hover:opacity-100 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <Edit3 size={18} />
                  </button>
                </div>
              </div>

              {/* Login Methods */}
              <div className="space-y-6">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Login Methods</h3>
                
                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Passkey: 1 passkey(s) added</p>
                  </div>
                  <button className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${isDark ? "border-white/20 text-white hover:bg-white/5" : "border-slate-300 text-slate-800 hover:bg-slate-50"}`}>
                    Manage
                  </button>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Password: ******</p>
                  </div>
                  <button className={`p-2 transition-all opacity-40 group-hover:opacity-100 ${isDark ? "text-white" : "text-slate-900"}`}>
                    <Edit3 size={18} />
                  </button>
                </div>
              </div>

              {/* Personal Section */}
              <div className="space-y-8">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Personal</h3>
                
                <div className="space-y-2">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>Age Group</p>
                  <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>5-8</p>
                </div>

                <div className="space-y-3">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>Gender (Optional)</p>
                  <div className="flex rounded-xl overflow-hidden border border-white/10 max-w-[300px]">
                    <button className={`flex-1 py-3 flex justify-center items-center transition-all ${isDark ? "bg-white/10 text-white" : "bg-slate-100 text-slate-900"}`}>
                      <User size={20} />
                    </button>
                    <button className={`flex-1 py-3 flex justify-center items-center transition-all ${isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-slate-50 text-slate-400"}`}>
                      <User size={20} className="rotate-180" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>Language</p>
                  <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? "bg-transparent border-white/10 text-white" : "bg-white border-slate-200"}`}>
                    <span className="font-bold">English (United States)</span>
                    <ChevronDown size={20} className="opacity-40" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>Account Location</p>
                  <p className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Vietnam</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Content */}
          {activeCategory === "Security" && !isSelectorOpen && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Two-step verification</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-slate-600"}`}>
                  Add an extra layer of protection to your account with 2-Step Verification at login, account recovery, and high-value transactions. You can only enable one of the following options at a time.
                </p>
              </div>

              <div className="space-y-3">
                {securityOptions.map((opt) => (
                  <button 
                    key={opt.title}
                    onClick={() => setTwoStepMethod(opt.title)}
                    className={`w-full text-left p-6 rounded-2xl border transition-all relative ${
                      twoStepMethod === opt.title 
                        ? (isDark ? "border-white bg-white/5 shadow-[0_0_0_1.5px_#fff]" : "border-slate-900 bg-slate-50 shadow-[0_0_0_1px_#0f172a]")
                        : (isDark ? "border-white/10 bg-transparent hover:bg-white/5" : "border-slate-200 bg-white hover:bg-slate-50")
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{opt.title}</p>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>{opt.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center transition-colors ${
                        twoStepMethod === opt.title 
                          ? (isDark ? "border-blue-400 bg-blue-400" : "border-blue-600 bg-blue-600")
                          : (isDark ? "border-white/20" : "border-slate-300")
                      }`}>
                        {twoStepMethod === opt.title && (
                          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Backup Codes */}
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Backup Codes</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-slate-600"}`}>
                     Generate and use backup codes in case you lose access to your 2-Step Verification option. Do not share your backup codes with anyone. You have 9 unused backup codes.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? "bg-[#1f2127] border border-white/10 text-white hover:bg-white/10" : "bg-white border border-slate-200 text-slate-800 shadow-sm"}`}>
                    Generate
                  </button>
                  <button className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? "bg-[#1f2127] border border-white/10 text-white hover:bg-white/10" : "bg-white border border-slate-200 text-slate-800 shadow-sm"}`}>
                    Clear
                  </button>
                </div>
              </div>

              {/* Devices */}
              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Devices where you're logged in</h3>
                  <AlertCircle size={20} className="text-white/40 cursor-help" />
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-slate-600"}`}>
                  We mark a device as trusted when we have high confidence that you're the one using it. We'll never ask you to change your settings to mark a device as trusted.
                </p>
              </div>
            </div>
          )}

          {/* Privacy Content */}
          {activeCategory === "Privacy & content restrictions" && !isSelectorOpen && (
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Contact Settings</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>Choose how people can reach you on the platform.</p>
              </div>

              <button 
                onClick={() => window.open('https://www.roblox.com/my/account#!/privacy', '_blank')}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isDark ? "bg-[#1f2127] text-white border border-white/10" : "bg-white text-slate-900 border border-slate-200"}`}
              >
                Open Official Privacy Settings
                <ExternalLink size={14} />
              </button>

              <div className="space-y-8">
                {[
                  { label: "Who can message me?", value: "Everyone" },
                  { label: "Who can chat with me in app?", value: "Friends" },
                  { label: "Who can chat with me in events?", value: "Everyone" }
                ].map((item) => (
                  <div key={item.label} className="space-y-3">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>{item.label}</p>
                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? "bg-transparent border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
                      <span className="font-bold">{item.value}</span>
                      <ChevronDown size={20} className="opacity-40" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-white/5">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Other Settings</h3>
                <div className="space-y-8 mt-6">
                   {[
                      { label: "Who can invite me to private servers?", value: "Everyone" },
                      { label: "Who can join me?", value: "Friends" },
                      { label: "Who can see my inventory?", value: "Everyone" }
                   ].map((item) => (
                      <div key={item.label} className="space-y-3">
                        <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-slate-500"}`}>{item.label}</p>
                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? "bg-transparent border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"}`}>
                          <span className="font-bold">{item.value}</span>
                          <ChevronDown size={20} className="opacity-40" />
                        </div>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Content */}
          {activeCategory === "Notifications" && !isSelectorOpen && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Notification Preferences</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>Manage how and when you receive notifications.</p>
              </div>

              <button 
                onClick={() => window.open('https://www.roblox.com/my/account#!/notifications', '_blank')}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isDark ? "bg-[#1f2127] text-white border border-white/10" : "bg-white text-slate-900 border border-slate-200"}`}
              >
                Open Official Notification Settings
                <ExternalLink size={14} />
              </button>

              <div className="space-y-2">
                {[
                  { title: "Push Notifications", desc: "Get notifications on your mobile device." },
                  { title: "Email Notifications", desc: "Get emails about account activity and updates." },
                  { title: "Desktop Notifications", desc: "Get notifications in your browser." },
                  { title: "Flash Sale Alerts", desc: "Be the first to know about upcoming sales." },
                  { title: "Event Reminders", desc: "Never miss a live show or event." }
                ].map((item, idx) => (
                  <div key={item.title} className={`py-6 flex items-center justify-between ${idx !== 4 ? "border-b border-white/5" : ""}`}>
                    <div className="space-y-1">
                      <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</p>
                      <p className={`text-xs ${isDark ? "text-white/40" : "text-slate-500"}`}>{item.desc}</p>
                    </div>
                    <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${idx < 3 ? "bg-blue-600" : (isDark ? "bg-white/10" : "bg-slate-200")}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${idx < 3 ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spending Content */}
          {activeCategory === "Spending" && !isSelectorOpen && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Billing & Robux</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>Manage your payment methods and view Robux history.</p>
              </div>

              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${isDark ? "bg-[#1f2127] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Payment Methods</h4>
                    <button onClick={() => window.open('https://www.roblox.com/my/account#!/billing', '_blank')} className="text-blue-500 text-sm font-bold hover:underline">Manage at Roblox</button>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                    <CreditCard size={24} className="text-white/40" />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Visa ending in 4242</p>
                      <p className="text-[10px] opacity-40 uppercase font-black">Expires 12/26</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Recent Robux Transactions</h4>
                   <div className="space-y-2">
                     {[
                       { date: "May 01, 2026", desc: "Premium Payout", price: "450 R$" },
                       { date: "Apr 01, 2026", desc: "Purchase: Blox Fruits Gamepass", price: "-1,000 R$" }
                     ].map((item) => (
                       <div key={item.date} className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
                         <div>
                           <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{item.desc}</p>
                           <p className="text-[10px] opacity-40">{item.date}</p>
                         </div>
                         <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{item.price}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Content */}
          {activeCategory === "Subscriptions" && !isSelectorOpen && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>My Subscriptions</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>Manage your active Roblox Premium memberships.</p>
              </div>

              <div className={`p-8 rounded-[32px] border flex flex-col items-center text-center space-y-6 ${isDark ? "bg-[#1f2127] border-white/10" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-xl">
                  <Crown size={32} />
                </div>
                <div>
                  <h4 className={`text-xl font-black italic uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>Roblox Premium</h4>
                  <p className="text-sm opacity-50 mt-1">Next billing date: June 01, 2026</p>
                </div>
                <div className="w-full pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => window.open('https://www.roblox.com/my/account#!/subscriptions', '_blank')}
                     className={`py-4 rounded-2xl font-bold text-sm ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-800"}`}
                   >
                    Update Plan
                   </button>
                   <button 
                     onClick={() => window.open('https://www.roblox.com/my/account#!/subscriptions', '_blank')}
                     className="py-4 rounded-2xl font-bold text-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                   >
                    Cancel Membership
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* App Permissions Content */}
          {activeCategory === "App permissions" && !isSelectorOpen && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Connected Apps</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>Third-party apps with access to your account data.</p>
              </div>

              <button 
                onClick={() => window.open('https://www.roblox.com/my/account#!/app-permissions', '_blank')}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isDark ? "bg-[#1f2127] text-white border border-white/10" : "bg-white text-slate-900 border border-slate-200"}`}
              >
                Manage App Permissions
                <ExternalLink size={14} />
              </button>

              <div className="space-y-4">
                 {[
                   { name: "LG WebOS TV", date: "Connected Jan 2026", icon: Monitor },
                   { name: "Samsung Smart View", date: "Connected Mar 2026", icon: Smartphone },
                   { name: "Apple TV Connector", date: "Connected Apr 2026", icon: MonitorPlay }
                 ].map((app) => (
                   <div key={app.name} className={`flex items-center justify-between p-6 rounded-2xl border ${isDark ? "border-white/5 bg-[#1f2127]" : "border-slate-200 bg-white shadow-sm"}`}>
                     <div className="flex items-center gap-4">
                       <div className="p-3 rounded-xl bg-white/5">
                         <app.icon size={24} className="text-white/60" />
                       </div>
                       <div>
                         <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{app.name}</p>
                         <p className="text-xs opacity-40">{app.date}</p>
                       </div>
                     </div>
                     <button className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 text-red-500">Revoke</button>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Browser Preferences Content */}
          {activeCategory === "Browser preferences" && !isSelectorOpen && (
            <div className="space-y-10">
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Browser & Platform</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/50" : "text-slate-500"}`}>Customize your experience on this specific browser.</p>
              </div>

              <button 
                onClick={() => window.open('https://www.roblox.com/my/account#!/browser-preferences', '_blank')}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isDark ? "bg-[#1f2127] text-white border border-white/10" : "bg-white text-slate-900 border border-slate-200"}`}
              >
                Open Official Browser Preferences
                <ExternalLink size={14} />
              </button>

              <div className="space-y-2">
                 {[
                   { title: "Hardware Acceleration", desc: "Use GPU for smoother video playback.", active: true },
                   { title: "Auto-Play Next", desc: "Automatically play the next recommended channel.", active: true },
                   { title: "Low Latency Mode", desc: "Reduce delay for live sports broadcasts.", active: false },
                   { title: "Data Saver", desc: "Reduce video quality to save bandwidth.", active: false }
                 ].map((item, idx) => (
                    <div key={item.title} className={`py-6 flex items-center justify-between ${idx !== 3 ? "border-b border-white/5" : ""}`}>
                      <div className="space-y-1">
                        <p className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</p>
                        <p className={`text-xs ${isDark ? "text-white/40" : "text-slate-500"}`}>{item.desc}</p>
                      </div>
                      <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${item.active ? "bg-blue-600" : (isDark ? "bg-white/10" : "bg-slate-200")}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.active ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Universal Settings Footer */}
        <div className="pt-20 border-t border-white/5 space-y-12 pb-24">
          <div className="flex justify-center">
            <button 
              onClick={() => signOut(auth)}
              className={`w-full max-w-2xl py-5 rounded-2xl font-bold transition-all ${
                isDark ? "bg-[#1f2127] text-white hover:bg-white/5" : "bg-slate-200 text-slate-800 hover:bg-slate-300"
              }`}
            >
              Log Out of All Other Sessions
            </button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 text-xs font-bold text-white/60">
            <button className="hover:text-white transition-colors">About Us</button>
            <button className="hover:text-white transition-colors">Jobs</button>
            <button className="hover:text-white transition-colors">Blog</button>
            <button className="hover:text-white transition-colors">Parents</button>
            <button className="hover:text-white transition-colors">Buy Gift Cards</button>
            <button className="hover:text-white transition-colors">Help</button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 text-xs font-bold text-white/60">
            <button className="hover:text-white transition-colors">Terms</button>
            <button className="hover:text-white transition-colors">Accessibility</button>
            <button className="hover:text-white transition-colors">Privacy</button>
            <button className="hover:text-white transition-colors flex items-center gap-1">
              Your Privacy Choices <Verified size={14} className="text-blue-400" />
            </button>
            <button className="hover:text-white transition-colors">Sitemap</button>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className={`flex items-center justify-between px-5 py-4 rounded-xl border w-full md:w-auto md:min-w-[300px] ${
              isDark ? "bg-transparent border-white/10 text-white" : "bg-white border-slate-200 text-slate-800 shadow-sm"
            }`}>
              <span className="font-bold">English (United States)</span>
              <ChevronDown size={20} className="opacity-40" />
            </div>

            <p className="text-[10px] text-white/40 text-center md:text-right font-medium max-w-[400px]">
              ©2026 TV360 Corporation. TV360, the TV360 logo and Powering Imagination are among our registered and unregistered trademarks in the U.S. and other countries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ isOpen, onClose, isDark, liquidGlass, setIsDev, setUserData }: { isOpen: boolean, onClose: () => void, isDark: boolean, liquidGlass: boolean, setIsDev: (v: boolean) => void, setUserData: (d: any) => void }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(176); // 2:56
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setStep(2);
    setError("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    if (password === "123456") { // Mock success
      setLoading(true);
      setTimeout(() => {
        setUserData({
          uid: "user_123",
          displayName: username || "0352298944",
          email: `${username}@viettel.vn`
        });
        onClose();
        setLoading(false);
      }, 1000);
    } else {
      setError("Mật khẩu không chính xác. Vui lòng thử lại.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Tên miền này chưa được cấp phép trong Firebase Console. Vui lòng thêm tên miền của app vào danh sách 'Authorized domains' trong phần Authentication Settings của Firebase.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Cửa sổ đăng nhập bị chặn. Vui lòng cho phép hiện popup.");
      } else {
        setError("Lỗi đăng nhập Google: " + (err.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose} />
          <motion.div
            key={step}
            initial={{ scale: 0.95, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.95, opacity: 0, x: -20 }}
            className="relative w-full max-w-lg bg-black text-white p-12 rounded-[40px] shadow-2xl border border-white/5"
          >
            {step === 3 && (
              <button 
                onClick={() => setStep(2)}
                className="absolute top-8 left-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="space-y-12 text-center">
              <div>
                <h2 className="text-5xl font-black tracking-tight">
                  {step === 3 ? "Lấy lại mật khẩu" : step === 2 ? "Xin Chào" : "Đăng nhập"}
                </h2>
                {(step === 2 || step === 3) && (
                  <p className="text-2xl font-medium mt-4 text-white/70">{username || "0352298944"}</p>
                )}
              </div>

              {step < 3 ? (
                <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-8 text-left">
                  <div className="space-y-4">
                    <label className="text-xl font-bold ml-1 block">
                      {step === 1 ? "Số điện thoại/Email/Tài khoản" : "Nhập mật khẩu"}
                    </label>
                    <div className="relative">
                      <input
                        type={step === 1 ? "text" : (showPassword ? "text" : "password")}
                        value={step === 1 ? username : password}
                        onChange={(e) => step === 1 ? setUsername(e.target.value) : setPassword(e.target.value)}
                        placeholder={step === 1 ? "Nhập số điện thoại/Email/Tài khoản" : "Nhập mật khẩu"}
                        autoFocus
                        className="w-full bg-[#1a1a1a] border border-white/10 focus:border-red-600/50 rounded-2xl px-8 py-6 text-xl transition-all placeholder:text-white/20 outline-none"
                      />
                      {step === 2 && (
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      )}
                    </div>
                    {step === 2 && (
                      <button type="button" onClick={() => setStep(3)} className="text-lg font-medium text-red-500/80 hover:text-red-500 transition-colors ml-1">
                        Quên mật khẩu?
                      </button>
                    )}
                    {error && <p className="text-red-500 text-sm ml-1 font-medium">{error}</p>}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black text-2xl rounded-2xl transition-all shadow-2xl shadow-red-600/20"
                  >
                    {step === 1 ? "Tiếp tục" : "Hoàn thành"}
                  </motion.button>

                  {step === 1 && (
                    <>
                      <div className="flex flex-col items-center gap-6 mt-4">
                        <div className="flex justify-center gap-6 text-xl font-medium text-white/60">
                          <button type="button" onClick={() => setStep(3)} className="hover:text-red-500 transition-colors">Quên mật khẩu</button>
                          <span className="opacity-20">|</span>
                          <button type="button" className="hover:text-red-500 transition-colors">Quên email</button>
                        </div>
                        
                        <button type="button" onClick={handleGoogleLogin} className="text-xl font-medium text-white underline decoration-white/20 underline-offset-8 hover:text-red-500 transition-colors">
                          Đăng nhập bằng Gmail
                        </button>
                      </div>

                      <div className="space-y-8 text-center mt-12">
                        <p className="text-2xl font-bold text-white/90">Hoặc đăng nhập bằng</p>
                      <div className="flex justify-center gap-8">
                        <motion.button 
                          whileHover={{ y: -5 }}
                          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
                        >
                          <Facebook className="w-10 h-10 text-[#1877F2] fill-[#1877F2]" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ y: -5 }}
                          onClick={handleGoogleLogin}
                          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
                        >
                          <svg viewBox="0 0 24 24" className="w-10 h-10">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                        </motion.button>
                        <motion.button 
                          whileHover={{ y: -5 }}
                          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg"
                        >
                          <Mail className="w-10 h-10 text-[#4285F4]" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ y: -5 }}
                          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg group"
                        >
                          <div className="bg-[#E11111] rounded-full p-2.5">
                            <span className="text-white font-black text-xl italic tracking-tighter text-center block">4G</span>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </>
                  )}

                  {step === 2 && (
                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          onClick={() => setRememberMe(!rememberMe)}
                          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                            rememberMe ? "bg-red-600 border-red-600" : "border-white/20 group-hover:border-white/40"
                          }`}
                        >
                          {rememberMe && <Check className="w-5 h-5 text-white stroke-[4]" />}
                        </div>
                        <span className="text-xl font-medium text-white/80 select-none">Lưu tài khoản</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setStep(3)}
                        className="text-xl font-medium text-white underline decoration-white/20 underline-offset-8 hover:text-red-500 transition-colors"
                      >
                        Đăng nhập bằng OTP
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <p className="text-2xl font-medium text-white/80">Nhập mã xác thực OTP gửi đến số</p>
                    <p className="text-4xl font-black">{username || "0352298944"}</p>
                  </div>

                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-16 h-20 bg-[#2a2a2a] rounded-2xl text-center text-3xl font-bold border border-white/5 focus:border-red-600/50 outline-none"
                      />
                    ))}
                  </div>

                  <div className="space-y-12">
                    <p className="text-xl font-medium text-white/40">Mã xác thực hết hạn sau <span className="text-white/60">{formatTime(timer)}</span></p>
                    
                    <button 
                      onClick={() => setStep(2)}
                      className="text-2xl font-bold text-white/70 hover:text-white transition-colors underline underline-offset-8 decoration-white/10"
                    >
                      Nhập mật khẩu
                    </button>
                  </div>
                </div>
              )}

              <p className="text-white/40 text-xl leading-relaxed max-w-sm mx-auto">
                Bằng việc đăng nhập, quý khách đồng ý giao kết{" "}
                <a href="#" className="text-red-500/80 underline underline-offset-4">Hợp đồng cung cấp và sử dụng dịch vụ Truyền hình TV360</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TopHeader({ isDark, isSearchOpen, setIsSearchOpen, user, onLogin, activeTab, setActiveTab, liquidGlass }: any) {
  return (
    <header className={`sticky top-0 z-[40] w-full flex items-center justify-between px-4 md:px-8 py-3 transition-all ${
      liquidGlass ? "bg-black/60 backdrop-blur-[40px]" : "bg-[#181818]"
    } border-b border-white/5`}>
      <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
        <button className="p-2 text-white/80 hover:text-white transition-colors">
          <MoreHorizontal className="w-8 h-8" />
        </button>
        <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95 flex-shrink-0" onClick={() => setActiveTab("Trang chủ")}>
          <Logo size="sm" />
        </div>
        <nav className="hidden lg:flex items-center gap-8 xl:gap-14 ml-4">
          {[
            { name: "Television", id: "Truyền hình" },
            { name: "Broadcast schedule", id: "Phát sóng" },
            { name: "Category", id: "Danh mục" },
            { name: "movies", id: "Phim" }
          ].map(navItem => (
             <button 
               key={navItem.name}
               onClick={() => setActiveTab(navItem.id)}
               className={`text-[19px] font-bold transition-all relative group ${
                 activeTab === navItem.id ? "text-white" : "text-white hover:opacity-80"
               }`}
             >
               <span className="relative z-10">{navItem.name}</span>
               {activeTab === navItem.id && (
                 <motion.div layoutId="topNavActive" className="absolute -bottom-[21px] left-0 right-0 h-[4px] bg-white rounded-t-full" />
               )}
             </button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-1 md:gap-4">
        {user ? (
          <div className="flex items-center gap-1 md:gap-6">
            <button className="p-2 md:p-3 text-white/90 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=e11111&color=fff`} 
                className="w-8 h-8 rounded-full border border-white/20 object-cover" 
                referrerPolicy="no-referrer" 
                onClick={() => setActiveTab("Cài đặt")}
              />
            </button>
            <button className="p-2 md:p-3 text-white/90 hover:text-white hover:bg-white/5 rounded-full transition-all" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-8 h-8" />
            </button>
            <button className="p-2 md:p-3 text-white/90 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <RobuxIcon className="w-8 h-8" />
            </button>
            <button className="p-2 md:p-3 text-white/90 hover:text-white hover:bg-white/5 rounded-full transition-all" onClick={() => setActiveTab("Cài đặt")}>
              <Settings className="w-8 h-8" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button className="p-3 text-white/90 hover:text-white" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-8 h-8" />
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              className="px-6 py-2 bg-white text-black text-sm font-bold rounded-lg transition-all"
            >
              Log In
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
}

function SearchBar({ isDark, query, setQuery, onClose }: { isDark: boolean, query: string, setQuery: (q: string) => void, onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Không thể nhận diện giọng nói");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex items-center gap-1 md:gap-4 px-0 md:px-6 py-2 h-14 md:h-16 w-full max-w-4xl">
      <div className="flex items-center gap-1 md:gap-2 flex-1">
        <Search className="h-6 w-6 text-black flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`flex-1 bg-transparent border-none outline-none text-lg font-medium text-black placeholder-black`}
        />
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={startVoiceSearch}
          className={`p-2 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "text-black hover:opacity-70"}`}
          title="Đang nghe..."
        >
          <Mic className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

function ProtectedContent({ children, user, onLogin, isDark, isDev, liquidGlass }: { children: ReactNode, user: any, onLogin: () => void, isDark: boolean, isDev?: boolean, liquidGlass: boolean }) {
  if (!user && !isDev) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-6 ${liquidGlass ? "rounded-full" : "rounded-xl"} ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}
        >
          <Lock className={`h-12 w-12 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
        </motion.div>
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Đăng nhập</h2>
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} max-w-md mx-auto`}>
            Tận hưởng và trải nghiệm đầy đủ các tính năng của TV360 ngay hôm nay!
          </p>
        </div>
        <button
          onClick={onLogin}
          className={`px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95 ${
            liquidGlass ? "rounded-2xl" : "rounded-lg"
          } ${
            isDark 
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
              : "bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          }`}
        >
          Đăng nhập
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("Trang chủ");
  const [lastTab, setLastTab] = useState("Trang chủ");
  const [prevTab, setPrevTab] = useState("Trang chủ");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoveredTabRect, setHoveredTabRect] = useState<DOMRect | null>(null);
  const [liquidGlass, setLiquidGlass] = useState(true);
  const [useSidebar, setUseSidebar] = useState(() => {
    return localStorage.getItem("ldaplay_sidebar") === "true";
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [sortOrder, setSortOrder] = useState<"default" | "az" | "za">("default");
  const [autoFullscreen, setAutoFullscreen] = useState(() => {
    return localStorage.getItem("ldaplay_auto_fullscreen") === "true";
  });

  useEffect(() => {
    // Splash screen now requires manual click to unblock audio
  }, []);

  useEffect(() => {
    if (activeTab !== "Cài đặt") {
      setLastTab(activeTab);
    }
    if (activeTab !== "Cài đặt" && activeTab !== "Tìm kiếm") {
      setPrevTab(activeTab);
    }
  }, [activeTab]);
  const [isDark, setIsDark] = useState(true); // Default to dark for better gradient look
  const [searchQuery, setSearchQuery] = useState("");
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [showDevPrompt, setShowDevPrompt] = useState(false);
  const [devPass, setDevPass] = useState("");
  const [devError, setDevError] = useState(false);

  useEffect(() => {
    if (searchQuery.toLowerCase() === "devmode") {
      setShowDevSettings(true);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  const verifyDev = (e: FormEvent) => {
    e.preventDefault();
    if (devPass === "devunlock") {
      setIsDev(true);
      setShowDevPrompt(false);
      setDevPass("");
      setDevError(false);
    } else {
      setDevError(true);
      setDevPass("");
    }
  };

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [selectedEpgChannel, setSelectedEpgChannel] = useState<Channel | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDev, setIsDev] = useState(() => {
    return localStorage.getItem("ldaplay_dev_mode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("ldaplay_dev_mode", isDev.toString());
  }, [isDev]);

  useEffect(() => {
    localStorage.setItem("ldaplay_sidebar", useSidebar.toString());
  }, [useSidebar]);

  useEffect(() => {
    localStorage.setItem("ldaplay_auto_fullscreen", autoFullscreen.toString());
  }, [autoFullscreen]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("ldaplay_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [customAlert, setCustomAlert] = useState<{ title: string, message: string } | null>(null);

  useEffect(() => {
    localStorage.setItem("ldaplay_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (ch: typeof channels[0]) => {
    setFavorites(prev => 
      prev.includes(ch.name) 
        ? prev.filter(name => name !== ch.name) 
        : [...prev, ch.name]
    );
  };

  const handleChannelSelect = (ch: typeof channels[0]) => {
    if (!user && !isDev) {
      setShowAuthModal(true);
      return;
    }
    setActiveChannel(ch);
    setActiveTab("Phát sóng");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          let role = "user";
          if (userSnap.exists()) {
            role = userSnap.data().role;
            setUserData(userSnap.data());
          } else if (currentUser.uid === "special_guest_uid") {
            // Special guest mock data
            role = "user";
            setUserData({
              uid: "special_guest_uid",
              email: "special_guest@ldaplay.vn",
              displayName: "Tài khoản đặc biệt",
              role: "user"
            });
          } else {
            // Check if it's the default admin
            if (currentUser.email === "nguyentrungthu1610@gmail.com") {
              role = "admin";
            }
            const newUserData: any = {
              uid: currentUser.uid,
              email: currentUser.email,
              role: role,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            if (currentUser.displayName) newUserData.displayName = currentUser.displayName;
            if (currentUser.photoURL) newUserData.photoURL = currentUser.photoURL;
            
            await setDoc(userRef, newUserData).catch(err => handleFirestoreError(err, OperationType.CREATE, 'users/' + currentUser.uid));
            setUserData(newUserData);
          }
          setIsAdmin(role === "admin");
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsAdmin(false);
          setUserData(null);
        }
      } else {
        setIsAdmin(false);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab("Trang chủ");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const tabs = [...robloxTabs];
  if (isAdmin || isDev) {
    tabs.push({ name: "Quản trị", icon: Shield, id: "Quản trị" });
  }

  const displayTab = activeTab;

  const handleEnterApp = () => {
    setShowSplash(false);
    // This empty play/pause logic unblocks audio globally for the session
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.resume();
  };

  return (
    <div className={`${
      isDark 
        ? "bg-[#121212] text-white" 
        : "bg-slate-50 text-slate-950"
    } min-h-screen flex transition-colors duration-500 ${useSidebar ? "flex-row" : "flex-col"}`}>
      <AnimatePresence>
        {showSplash && <SplashScreen isDark={isDark} onEnter={handleEnterApp} />}
      </AnimatePresence>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDark={isDark} liquidGlass={liquidGlass} setIsDev={setIsDev} setUserData={setUserData} />
      <EpgModal isOpen={!!selectedEpgChannel} onClose={() => setSelectedEpgChannel(null)} channel={selectedEpgChannel} isDark={isDark} liquidGlass={liquidGlass} />
      
      {/* Developer Settings Choice */}
      <LiquidModal
        isOpen={showDevSettings}
        onClose={() => setShowDevSettings(false)}
        isDark={isDark}
        title="Cài đặt nhà phát triển"
        description={isDev ? "Bạn đang ở chế độ nhà phát triển. Bạn có muốn tắt nó không?" : "Bạn muốn kích hoạt chế độ nhà phát triển?"}
        liquidGlass={liquidGlass}
      >
        <div className="flex flex-col gap-3">
          {!isDev ? (
            <button 
              onClick={() => { setShowDevSettings(false); setShowDevPrompt(true); }}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-[32px] font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
            >
              Kích hoạt (Yêu cầu mật khẩu)
            </button>
          ) : (
            <button 
              onClick={() => { setIsDev(false); setShowDevSettings(false); }}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-[32px] font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              Hủy kích hoạt
            </button>
          )}
          <button 
            onClick={() => setShowDevSettings(false)}
            className={`w-full py-3 rounded-3xl font-bold transition-all ${
              isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-black/5 text-slate-500 hover:text-slate-900"
            }`}
          >
            Đóng
          </button>
        </div>
      </LiquidModal>

      {/* Developer Mode Prompt */}
      <LiquidModal
        isOpen={showDevPrompt}
        onClose={() => { setShowDevPrompt(false); setDevPass(""); setDevError(false); }}
        isDark={isDark}
        title="Chế độ nhà phát triển"
        description="Kích hoạt tính năng nhà phát triển để truy cập vào các quyền đặc biệt. Bạn cần phải có mật khẩu dành cho nhà phát triển được chia sẻ bởi Chủ Thớt để kích hoạt"
        liquidGlass={liquidGlass}
      >
        <form onSubmit={verifyDev} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-wider opacity-50 ml-4 ${isDark ? "text-white" : "text-slate-900"}`}>Mật khẩu</label>
            <input 
              autoFocus
              type="password" 
              value={devPass} 
              onChange={e => setDevPass(e.target.value)}
              className={`w-full px-5 py-3 rounded-3xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                devError 
                  ? "border-red-500 bg-red-500/5" 
                  : isDark 
                    ? "bg-white/5 border-white/10 text-white placeholder-white/30" 
                    : "bg-black/5 border-black/5 text-slate-900 placeholder-slate-400"
              }`}
              placeholder="••••••••"
            />
            {devError && <p className="text-red-500 text-[10px] mt-2 font-bold text-center">Mật khẩu không chính xác!</p>}
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-[32px] font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
            >
              Xác nhận
            </button>
            <button 
              type="button"
              onClick={() => { setShowDevPrompt(false); setDevPass(""); setDevError(false); }}
              className={`w-full py-3 rounded-3xl font-bold transition-all ${
                isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-black/5 text-slate-500 hover:text-slate-900"
              }`}
            >
              Hủy
            </button>
          </div>
        </form>
      </LiquidModal>

      <div className={`flex-1 flex flex-col min-h-screen ${useSidebar ? (isSidebarExpanded ? "md:pl-80" : "md:pl-24") : ""}`}>
        <TopHeader 
          isDark={isDark} 
          isSearchOpen={isSearchOpen} 
          setIsSearchOpen={setIsSearchOpen} 
          user={user} 
          onLogin={handleLogin} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          liquidGlass={liquidGlass} 
        />
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className={`fixed inset-0 z-[45] bg-black/20 ${liquidGlass ? "backdrop-blur-[2px]" : ""}`}
            />
          )}
        </AnimatePresence>

      <LiquidModal 
        isOpen={!!customAlert} 
        onClose={() => setCustomAlert(null)} 
        isDark={isDark}
        title={customAlert?.title}
        description={customAlert?.message}
        liquidGlass={liquidGlass}
      >
        <button 
          onClick={() => setCustomAlert(null)}
          className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-3xl font-bold transition-all active:scale-95"
        >
          Xác nhận
        </button>
      </LiquidModal>


      <div className="flex-1 overflow-y-auto pb-32 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full flex flex-col"
          >
            {displayTab === "Trang chủ" && (
              <HomeContent 
                setActiveTab={setActiveTab} 
                setActiveChannel={handleChannelSelect} 
                onShowEpg={(ch) => setSelectedEpgChannel(ch)}
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                liquidGlass={liquidGlass}
              />
            )}
            {displayTab === "Truyền hình" && (
              <TVContent 
                active={activeChannel} 
                setActive={handleChannelSelect} 
                onShowEpg={(ch) => setSelectedEpgChannel(ch)}
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                user={user}
                onLogin={handleLogin}
                isDev={isDev}
                liquidGlass={liquidGlass}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                showSplash={showSplash}
                autoFullscreen={autoFullscreen}
              />
            )}
            {displayTab === "Phim" && (
              <TVContent 
                active={activeChannel} 
                setActive={handleChannelSelect} 
                onShowEpg={(ch) => setSelectedEpgChannel(ch)}
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                user={user}
                onLogin={handleLogin}
                isDev={isDev}
                liquidGlass={liquidGlass}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                showSplash={showSplash}
                initialCategory="VTVcab"
                autoFullscreen={autoFullscreen}
              />
            )}
            {displayTab === "Thể thao" && (
              <TVContent 
                active={activeChannel} 
                setActive={handleChannelSelect} 
                onShowEpg={(ch) => setSelectedEpgChannel(ch)}
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                user={user}
                onLogin={handleLogin}
                isDev={isDev}
                liquidGlass={liquidGlass}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                showSplash={showSplash}
                initialCategory="HTV"
                autoFullscreen={autoFullscreen}
              />
            )}
            {displayTab === "HBO GO" && (
              <TVContent 
                active={activeChannel} 
                setActive={handleChannelSelect} 
                onShowEpg={(ch) => setSelectedEpgChannel(ch)}
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                user={user}
                onLogin={handleLogin}
                isDev={isDev}
                liquidGlass={liquidGlass}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                showSplash={showSplash}
                initialCategory="Kênh quốc tế"
                autoFullscreen={autoFullscreen}
              />
            )}
            {displayTab === "Video" && (
              <TVContent 
                active={activeChannel} 
                setActive={handleChannelSelect} 
                onShowEpg={(ch) => setSelectedEpgChannel(ch)}
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                user={user}
                onLogin={handleLogin}
                isDev={isDev}
                liquidGlass={liquidGlass}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                showSplash={showSplash}
                initialCategory="Thiết yếu"
                autoFullscreen={autoFullscreen}
              />
            )}
            {displayTab === "Gói cước" && (
              <PricingContent 
                isDark={isDark} 
                liquidGlass={liquidGlass} 
              />
            )}
            {displayTab === "Danh mục" && (
              <CategoriesContent 
                isDark={isDark} 
                liquidGlass={liquidGlass} 
                setActiveTab={setActiveTab} 
              />
            )}
            {displayTab === "Cài đặt" && (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-purple-500" />
          <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Cài đặt</h2>
        </div>
        <SettingsContent 
          isDark={isDark} 
          setIsDark={setIsDark} 
          isDev={isDev} 
          setIsDev={setIsDev} 
          liquidGlass={liquidGlass}
          setLiquidGlass={setLiquidGlass}
          useSidebar={useSidebar}
          setUseSidebar={setUseSidebar}
          autoFullscreen={autoFullscreen}
          setAutoFullscreen={setAutoFullscreen}
          user={user}
          userData={userData}
          setUserData={setUserData}
          onAlert={(title, msg) => setCustomAlert({ title, message: msg })}
          onLogin={handleLogin}
        />
      </div>
    )}
    {displayTab === "Quản trị" && (isAdmin || isDev) && <AdminContent isDark={isDark} liquidGlass={liquidGlass} />}
          </motion.div>
        </AnimatePresence>
        <Footer isDark={isDark} />
      </div>
      
      {/* Sidebar Redesign */}
      {useSidebar && (
        <div className={`fixed z-50 transition-all duration-500 left-0 top-0 h-full flex flex-col border-r hidden md:flex ${
          isDark ? "bg-[#0a0a0a] border-white/5" : "bg-white border-slate-200"
        } ${isSidebarExpanded ? "w-80" : "w-24"}`}>
          {/* Account Section */}
          <div className={`p-8 border-b border-white/5 space-y-2 ${isSidebarExpanded ? "" : "flex flex-col items-center"}`}>
            <div className="flex items-center gap-5 text-red-500">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 shadow-lg shadow-red-900/20">
                <Smartphone size={28} strokeWidth={2.5} className="text-white" />
              </div>
              {isSidebarExpanded && (
                <div className="flex flex-col">
                  <span className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Tài khoản</span>
                  <p className={`text-sm font-bold opacity-50 ${isDark ? "text-slate-400" : "text-slate-500"}`}>ID: 267380779</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === (tab.id || tab.name);
              
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.id || tab.name)}
                  className={`w-full flex items-center gap-6 p-5 transition-all relative group ${
                    isActive 
                      ? (isDark ? "text-red-500" : "text-red-600") 
                      : (isDark ? "text-slate-500 hover:text-white" : "text-slate-600 hover:bg-slate-50")
                  }`}
                >
                  {/* Indicator Line */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-1.5 bg-red-600 rounded-l-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    />
                  )}
                  
                  <Icon className={`w-8 h-8 transition-colors ${isActive ? "text-red-500" : "group-hover:text-red-500"}`} />
                  {isSidebarExpanded && (
                    <span className={`font-bold text-xl tracking-tight transition-colors ${isActive ? "text-red-500" : ""}`}>
                      {tab.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-8 text-center border-t border-white/5 space-y-2">
            <p className="text-sm text-slate-500 font-mono opacity-50">Ldev.26416</p>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-yellow-400 text-[10px] font-black text-black">
              <Sparkles size={10} />
              PREVIEW
            </div>
          </div>

          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-[60]`}
          >
            {isSidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      )}

      <div className={`fixed z-50 transition-all duration-500 bottom-0 left-0 w-full flex justify-center`}>
        <div className="w-full max-w-md pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {!isSearchOpen && (
              <motion.nav 
                key="roblox-nav"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="bg-[#181818] border-t border-white/5 flex items-center justify-around pb-6 pt-3 px-2 shadow-2xl"
              >
                {bottomTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isAvatar = tab.name === "Avatar";
                  const userAvatar = (isAvatar && user) ? (userData?.photoURL || user.photoURL) : null;
                  
                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex flex-col items-center justify-center gap-1.5 flex-1 relative group"
                    >
                      <div className="relative flex items-center justify-center">
                        {isAvatar && (
                          <div className={`absolute inset-[-8px] rounded-full transition-all duration-300 ${isActive ? "bg-[#f24242]" : "bg-transparent group-hover:bg-white/5"}`} />
                        )}
                        <div className="relative z-10">
                          {userAvatar ? (
                            <img 
                              src={userAvatar} 
                              alt="Avatar" 
                              className={`h-7 w-7 rounded-full object-cover border-2 ${isActive ? "border-white" : "border-transparent"}`} 
                              referrerPolicy="no-referrer" 
                            />
                          ) : (
                            <Icon 
                              className={`h-7 w-7 transition-all duration-300 ${
                                isActive 
                                  ? (isAvatar ? "text-white" : "text-white scale-110") 
                                  : "text-white/60 group-hover:text-white"
                              }`} 
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold tracking-tight transition-colors duration-300 ${
                        isActive ? "text-white" : "text-white/60 group-hover:text-white"
                      }`}>
                        {tab.name}
                      </span>
                      {isActive && !isAvatar && (
                        <motion.div 
                          layoutId="roblox-active-dot"
                          className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </motion.nav>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {isSearchOpen ? (
              <div className="relative flex flex-col items-center">
                <SearchPopup 
                  isDark={isDark} 
                  searchQuery={searchQuery} 
                  setActiveChannel={handleChannelSelect} 
                  onClose={() => setIsSearchOpen(false)} 
                  favorites={favorites}
                  liquidGlass={liquidGlass}
                  setActiveTab={setActiveTab}
                  setIsDark={setIsDark}
                  setLiquidGlass={setLiquidGlass}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  setSortOrder={setSortOrder}
                />
                <motion.div 
                  key="search-expanded"
                  initial={{ width: 60, height: 60, opacity: 0 }}
                  animate={{ width: "auto", height: 60, opacity: 1 }}
                  exit={{ width: 60, height: 60, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`p-1.5 flex items-center border shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden bg-white/60 border-white/40 shadow-2xl ${
                    liquidGlass ? "rounded-[30px] backdrop-blur-3xl" : "rounded-xl backdrop-blur-none"
                  }`}
                >
                  <SearchBar 
                    isDark={isDark} 
                    query={searchQuery} 
                    setQuery={setSearchQuery} 
                    onClose={() => setIsSearchOpen(false)} 
                  />
                </motion.div>
              </div>
            ) : (
              liquidGlass && (
                <motion.button
                  key="search-circle"
                  layoutId="search-button"
                  onClick={() => setIsSearchOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ borderRadius: "50%" }}
                  animate={{ borderRadius: "50%" }}
                  className={`w-[60px] h-[60px] md:w-[72px] md:h-[72px] flex items-center justify-center rounded-full border shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-3xl transition-all duration-500 bg-white/60 border-white/40 shadow-2xl text-black hover:opacity-70`}
                >
                  <img 
                    src="https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi" 
                    alt="Search" 
                    className="h-7 w-7 md:h-8 md:w-8 object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                </motion.button>
              )
            )}
          </AnimatePresence>
          <Tooltip text={hoveredTab || ""} show={!!hoveredTab} targetRect={hoveredTabRect} />
        </div>
      </div>
    </div>
  </div>
);
}

export default App;
