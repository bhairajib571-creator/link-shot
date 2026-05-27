import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Link as LinkIcon, 
  FileUp, 
  BarChart3, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ArrowRight,
  Zap,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logoUrl from './assets/images/superlink_logo_1779884999375.png';
import { db } from './lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdsterraNativeAdProps {
  id: string;
  containerId: string;
  rotation: number;
}

const AdsterraNativeAd: React.FC<AdsterraNativeAdProps> = ({ id, containerId, rotation }) => {
  const srcDocHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            background: transparent;
          }
          #${containerId} {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 140px;
          }
          /* Ensure ad iframe/elements are centered nicely */
          #${containerId} > iframe, 
          #${containerId} > div {
            margin: 0 auto !important;
          }
        </style>
      </head>
      <body>
        <div id="${containerId}"></div>
        <script type="text/javascript">
          window.atOptions = {
            'key' : '${id}',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://pl29448598.profitablecpmratenetwork.com/${id}/invoke.js?t=${Date.now()}"></script>
      </body>
    </html>
  `.trim();

  return (
    <div className="w-full flex justify-center items-center min-h-[140px]">
      <iframe
        key={`iframe-${containerId}-${rotation}`}
        title={`Adsterra Slot`}
        srcDoc={srcDocHtml}
        style={{
          width: '100%',
          height: '140px',
          border: 'none',
          overflow: 'hidden',
          display: 'block'
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

// --- Components ---

const Navbar = () => (
  <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-zinc-900">
        <img src={logoUrl} alt="URL Shortener Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
        URL Shortener
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
          <BarChart3 size={16} />
          Dashboard
        </Link>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="border-t border-zinc-100 bg-zinc-50 py-12 mt-20">
    <div className="max-w-5xl mx-auto px-4 text-center">
      <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} URL Shortener. Built for monetization simulation.</p>
    </div>
  </footer>
);

// --- Pages ---

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [shortened, setShortened] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setShortened(null);
    try {
      // Auto-prepend https if missing for convenience
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('mailto:') && !finalUrl.startsWith('tel:')) {
        finalUrl = 'https://' + finalUrl;
      }

      // Generate a consistent 5-character lowercase alphanumeric ID
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let shortId = '';
      for (let i = 0; i < 5; i++) {
        shortId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const linkRef = doc(db, 'links', shortId);
      
      await setDoc(linkRef, {
        id: shortId,
        original_url: finalUrl,
        type: 'link',
        created_at: serverTimestamp(),
        views: 0
      });

      // Robust base URL detection for consistent results on any host
      const currentUrl = window.location.href;
      const baseUrl = currentUrl.split('#')[0].split('?')[0].replace(/\/$/, "");
      const newShortened = `${baseUrl}/${shortId}`;
      setShortened(newShortened);
      
      // Auto-clear input on success
      setUrl('');
    } catch (err: any) {
      console.error("Link generation failed:", err);
      alert('Firebase/Network Error: ' + (err.message || 'Check your internet connection or database setup. Please make sure Firebase is fully deployed.'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortened) {
      navigator.clipboard.writeText(shortened);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 pb-10">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-extrabold text-zinc-900 tracking-tight mb-6"
        >
          Shorten Links. <span className="text-indigo-600">Earn Money.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-zinc-600 max-w-2xl mx-auto"
        >
          The most advanced PPD platform. Share your links with an ad-interstitial page and track your performance.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-zinc-100 p-8 md:p-12 mb-20"
      >
        <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
              <LinkIcon size={20} />
            </div>
            <input
              type="text"
              inputMode="url"
              placeholder="Enter or paste your link here..."
              required
              className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-lg shadow-lg shadow-indigo-200"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : 'Shorten Now'}
            <ArrowRight size={20} />
          </button>
        </form>

        <AnimatePresence>
          {shortened && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 pt-8 border-t border-zinc-100"
            >
              <div className="flex items-center gap-2 mb-4 text-emerald-600">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Success! Link Created</span>
              </div>
              <div className="flex flex-col md:flex-row items-stretch gap-3 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200">
                <div className="flex-1 bg-white p-4 rounded-2xl border border-zinc-100 font-mono text-indigo-600 truncate shadow-inner">
                  {shortened}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a 
                    href={shortened} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-4 bg-white border border-zinc-200 rounded-2xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <TrendingUp className="text-emerald-600" />, title: "High CPM", desc: "Get the best rates for every click from your audience." },
          { icon: <ShieldCheck className="text-blue-600" />, title: "Secure Links", desc: "Advanced protection against bots and malicious traffic." },
          { icon: <DollarSign className="text-amber-600" />, title: "Fast Payouts", desc: "Withdraw your earnings instantly once you reach the threshold." }
        ].map((feature, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{feature.title}</h3>
            <p className="text-zinc-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
const InterstitialPage = () => {
  const { id } = useParams();
  const [timeLeft, setTimeLeft] = useState(30);
  const [canSkip, setCanSkip] = useState(false);
  const [linkData, setLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adRotation, setAdRotation] = useState(0); // Rotates every 7 seconds to change individual ad variants

  useEffect(() => {
    const fetchLink = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'links', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Link not found');
        }
        
        setLinkData({ ...docSnap.data(), id });
      } catch (err: any) {
        console.error(err);
        setLinkData({ error: err.message || 'Link failed to load' });
      } finally {
        setLoading(false);
      }
    };
    fetchLink();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [timeLeft]);

  // Load Social Bar / Notification scripts and rotate them one after another every 7 seconds AFTER they successfully load
  useEffect(() => {
    const scripts = [
      'https://pl29448672.profitablecpmratenetwork.com/2c/23/6c/2c236caf690743a9ba5e2d4d91fc111d.js',
      'https://pl29476399.effectivecpmnetwork.com/58/53/a3/5853a36f8888542d8040c8736261675e.js'
    ];

    const activeScriptSrc = scripts[adRotation % scripts.length];
    
    // Capture the list of existing children in document.body BEFORE appending the script
    // This allows us to only remove elements newly created by Adsterra, completely avoiding breaking the React #root application container.
    const initialChildren = new Set(Array.from(document.body.children));

    // Create and append the active script with its original URL (Adsterra expects exact URL names without query parameters)
    const s = document.createElement('script');
    s.src = activeScriptSrc;
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.id = `adsterra-rotator-script-${adRotation % scripts.length}`;

    let rotationTimeout: NodeJS.Timeout | null = null;
    let hasTriggered = false;

    const triggerNextRotation = (delayMs: number) => {
      if (hasTriggered) return;
      hasTriggered = true;
      rotationTimeout = setTimeout(() => {
        setAdRotation(prev => prev + 1);
      }, delayMs);
    };

    s.onload = () => {
      // The ad script has successfully downloaded and evaluated. Keep it visible for exactly 7 seconds!
      triggerNextRotation(7000);
    };

    s.onerror = () => {
      // If loading fails (e.g. adblock), wait 3 seconds to avoid rapid infinite loops and try next script
      triggerNextRotation(3000);
    };

    // Global fallback timeout: if neither onload nor onerror fired within 12 seconds, force-rotate
    const fallbackTimeout = setTimeout(() => {
      triggerNextRotation(12000);
    }, 12000);

    document.body.appendChild(s);

    return () => {
      hasTriggered = true;
      if (rotationTimeout) clearTimeout(rotationTimeout);
      clearTimeout(fallbackTimeout);

      // 1. Remove the script tag itself
      if (s.parentNode) {
        s.parentNode.removeChild(s);
      }
      
      // 2. Perform a safe, targeted cleanup of ONLY new elements added by this Adsterra placement
      const currentChildren = Array.from(document.body.children);
      currentChildren.forEach(child => {
        if (!initialChildren.has(child) && child !== s) {
          try {
            if (child.parentNode) {
              child.parentNode.removeChild(child);
            }
          } catch (e) {
            console.warn("Cleanup of ad element failed:", e);
          }
        }
      });
    };
  }, [adRotation]);

  // Set up banner configuration once loaded
  useEffect(() => {
    if (!loading && linkData && !linkData.error) {
      (window as any).atOptions = {
        'key' : 'da746eeca9d76d3d5c81c4cb3720e8eb',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    }
  }, [loading, linkData]);

  const handleSkip = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!canSkip || !linkData || !id) return;
    
    // Quick sanitization
    let cleanUrl = linkData.original_url ? linkData.original_url.trim() : '';
    if (!cleanUrl) return;
    if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.startsWith('mailto:') && !cleanUrl.startsWith('tel:')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    // Non-blocking fire-and-forget view count increment to speed up redirection
    const docRef = doc(db, 'links', id);
    updateDoc(docRef, {
      views: increment(1)
    }).catch(err => console.warn("View tracking failed:", err));
    
    // Multi-layered bulletproof redirection methods:
    // 1. Dynamic window.top breakout (essential for bypass within iframe/preview mode)
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = cleanUrl;
        return;
      }
    } catch (err) {
      console.warn("Iframe breakout prevented by origin policy, trying direct methods:", err);
    }

    // 2. Standard location redirection
    window.location.href = cleanUrl;
    
    // 3. High performance fallbacks for standard & mobile browsers
    setTimeout(() => {
      window.location.assign(cleanUrl);
    }, 40);
    setTimeout(() => {
      window.open(cleanUrl, '_self');
    }, 120);
    setTimeout(() => {
      window.open(cleanUrl, '_blank');
    }, 250);
  };

  const activeVar = adRotation % 3;
  const activeAdVar = adRotation % 4; // Synchronized clock for 4 parallel rotating ad slots

  // Compute normalized target URL to ensure absolute redirects and bypass relative routing issues
  let targetUrl = '';
  if (linkData && linkData.original_url) {
    targetUrl = linkData.original_url.trim();
    if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith('mailto:') && !targetUrl.startsWith('tel:')) {
      targetUrl = 'https://' + targetUrl;
    }
  }

  const activeBottomIndex = adRotation % 4; // Cycles bottom spots 0, 1, 2, 3 every 10s

  const topNotifications = [
    {
      badge: "LIVE SHIELD",
      color: "bg-red-500",
      text: "⚡ Dynamic link scan complete! Secure connection state: Verified Clean. Link is safe to open.",
      link: "https://www.effectivecpmnetwork.com/c45pcc4z?key=767d4b178385d96105360f63538c83a9"
    },
    {
      badge: "CLOUD STREAM",
      color: "bg-indigo-600",
      text: "🎁 Get unthrottled maximum download speeds! Limitless cloud stream bandwidth is unlocked today.",
      link: "https://www.effectivecpmnetwork.com/c45pcc4z?key=767d4b178385d96105360f63538c83a9"
    },
    {
      badge: "CREATOR BONUS",
      color: "bg-emerald-600",
      text: "🔥 High CPC networks are outstanding today! Shorten your own links to begin generating automated high CPM payouts.",
      link: "https://www.effectivecpmnetwork.com/c45pcc4z?key=767d4b178385d96105360f63538c83a9"
    },
    {
      badge: "CASH REWARD",
      color: "bg-pink-600",
      text: "💰 Turn passive traffic into daily $50 USD payouts. Join the leading monetization network now.",
      link: "https://www.effectivecpmnetwork.com/c45pcc4z?key=767d4b178385d96105360f63538c83a9"
    },
    {
      badge: "SYSTEM CRITICAL",
      color: "bg-amber-600",
      text: "⚠️ Device IP verification completed. Access route optimized. Confirm your security scan immediately.",
      link: "https://www.effectivecpmnetwork.com/c45pcc4z?key=767d4b178385d96105360f63538c83a9"
    }
  ];

  const activeTopNotification = topNotifications[adRotation % topNotifications.length];

  if (!loading && (!linkData || linkData.error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 text-center max-w-md shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Link Not Found</h2>
          <p className="text-zinc-500 mb-8">{linkData?.error || "The link you're looking for doesn't exist or has been removed."}</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Centered Navbar Logo */}
      <div className="bg-white border-b border-zinc-200 p-4 flex flex-col items-center sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 font-bold text-lg mb-1 hover:opacity-80 transition-opacity">
          <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
          SuperLink
        </Link>
        <div className="text-xs font-semibold text-zinc-500 text-center">
          {canSkip ? '✓ Verification complete. Get Link button is now active below.' : `🔒 Security verification active... (Hold on for ${timeLeft} seconds)`}
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 py-8 flex flex-col items-center gap-6">
        
        {/* Ad Rotation Indicator */}
        <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-zinc-100 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
          Ads auto-rotating in 7-second segments
        </div>

        {/* --- [TOP NOTIFICATION AD BAR] (Auto-rotating every 10 seconds) --- */}
        <div className="w-full bg-white rounded-3xl border border-zinc-100 p-5 shadow-lg flex items-start gap-4 transition-all hover:border-zinc-200">
          <span className={cn("text-[9px] font-black text-white px-3 py-1.5 rounded-lg shrink-0 uppercase tracking-widest", activeTopNotification.color)}>
            {activeTopNotification.badge}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-700 text-xs font-bold leading-relaxed">
              {activeTopNotification.text}
            </p>
            <a 
              href={activeTopNotification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 tracking-wide mt-2"
            >
              CLAIM / ACCESS OFFER <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* --- [1] AD SPOT 1 --- */}
        <div className="bg-white w-full rounded-[2rem] border border-zinc-100 p-5 md:p-6 text-center shadow-lg relative overflow-hidden transition-all hover:border-zinc-200">
          <div className="absolute top-3 left-3 bg-indigo-50 text-[10px] font-bold text-indigo-600 px-2.5 py-1 rounded-lg">ADVERTISER SLOT [1]</div>
          <div className="absolute top-3 right-3 text-[10px] text-zinc-400 font-bold">Auto-rotating (7s)</div>
          <div className="pt-6">
            <p className="text-zinc-650 text-xs font-bold mb-3 md:text-sm">এটি আপনার ওয়েবসাইটের প্রথম প্যারাগ্রাফ বা লেখা।</p>
            
            <div className="w-full min-h-[140px] flex justify-center bg-zinc-50 rounded-2xl border border-zinc-100 p-4 mb-3">
              <AdsterraNativeAd 
                id="da746eeca9d76d3d5c81c4cb3720e8eb" 
                containerId="container-da746eeca9d76d3d5c81c4cb3720e8eb" 
                rotation={adRotation} 
              />
            </div>

            <p className="text-zinc-400 text-[10px] font-bold md:text-xs">এটি বিজ্ঞাপনের নিচের দ্বিতীয় প্যারাগ্রাফ বা লেখা।</p>
          </div>
        </div>

        {/* --- [2] AD SPOT 2 --- */}
        <div className="bg-white w-full rounded-[2rem] border border-zinc-100 p-5 md:p-6 text-center shadow-lg relative overflow-hidden transition-all hover:border-zinc-200">
          <div className="absolute top-3 left-3 bg-amber-50 text-[10px] font-bold text-amber-600 px-2.5 py-1 rounded-lg">ADVERTISER SLOT [2]</div>
          <div className="absolute top-3 right-3 text-[10px] text-zinc-400 font-bold">Auto-rotating (7s)</div>
          <div className="pt-6">
            <p className="text-zinc-650 text-xs font-bold mb-3 md:text-sm">এটি আপনার ওয়েবসাইটের প্রথম প্যারাগ্রাফ বা লেখা।</p>
            
            <div className="w-full min-h-[140px] flex justify-center bg-zinc-50 rounded-2xl border border-zinc-100 p-4 mb-3">
              <AdsterraNativeAd 
                id="da746eeca9d76d3d5c81c4cb3720e8eb" 
                containerId="container-da746eeca9d76d3d5c81c4cb3720e8eb" 
                rotation={adRotation} 
              />
            </div>

            <p className="text-zinc-400 text-[10px] font-bold md:text-xs">এটি বিজ্ঞাপনের নিচের দ্বিতীয় প্যারাগ্রাফ বা লেখা।</p>
          </div>
        </div>

        {/* --- [GET LINK CENTER GATEWAY] (Appears/activates after 30 seconds) --- */}
        <div className="w-full bg-gradient-to-br from-indigo-50 to-zinc-100 rounded-[2rem] border border-indigo-100 p-6 md:p-8 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-xl font-mono font-black text-indigo-600 border border-zinc-200 text-sm shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
          <div className="pt-2 mb-6">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Main Download Gateway</h3>
            <p className="text-xs text-zinc-500 font-semibold max-w-sm mx-auto mt-1">
              Your generated redirect url becomes fully accessible from the button below once the 30-second timer resolves.
            </p>
          </div>

          <div className="w-full">
            {canSkip && !loading && linkData && !linkData.error ? (
              <a
                href={targetUrl}
                onClick={handleSkip}
                className="w-full text-center py-5 rounded-2xl bg-indigo-600 text-white font-black text-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 cursor-pointer animate-pulse transition-all transform hover:scale-[1.02] active:scale-[0.98] block"
              >
                GET LINK (READY)
              </a>
            ) : (
              <div className="w-full">
                <button
                  disabled
                  className="w-full py-5 rounded-2xl bg-zinc-200/80 text-zinc-400 cursor-not-allowed border border-zinc-200 font-black text-lg"
                >
                  {loading ? 'CONNECTING GATEWAY...' : `PLEASE WAIT... GET LINK IN ${timeLeft}s`}
                </button>
                <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden mt-3 max-w-md mx-auto">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-1000"
                    style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- [3] AD SPOT 3 --- */}
        <div className="bg-white w-full rounded-[2rem] border border-zinc-100 p-5 md:p-6 text-center shadow-lg relative overflow-hidden transition-all hover:border-zinc-200">
          <div className="absolute top-3 left-3 bg-emerald-50 text-[10px] font-bold text-emerald-600 px-2.5 py-1 rounded-lg">ADVERTISER SLOT [3]</div>
          <div className="absolute top-3 right-3 text-[10px] text-zinc-400 font-bold">Auto-rotating (7s)</div>
          <div className="pt-6">
            <p className="text-zinc-650 text-xs font-bold mb-3 md:text-sm">এটি আপনার ওয়েবসাইটের প্রথম প্যারাগ্রাফ বা লেখা।</p>
            
            <div className="w-full min-h-[140px] flex justify-center bg-zinc-50 rounded-2xl border border-zinc-100 p-4 mb-3">
              <AdsterraNativeAd 
                id="da746eeca9d76d3d5c81c4cb3720e8eb" 
                containerId="container-da746eeca9d76d3d5c81c4cb3720e8eb" 
                rotation={adRotation} 
              />
            </div>

            <p className="text-zinc-400 text-[10px] font-bold md:text-xs">এটি বিজ্ঞাপনের নিচের দ্বিতীয় প্যারাগ্রাফ বা লেখা।</p>
          </div>
        </div>

        {/* --- [4] AD SPOT 4 --- */}
        <div className="bg-white w-full rounded-[2rem] border border-zinc-100 p-5 md:p-6 text-center shadow-lg relative overflow-hidden transition-all hover:border-zinc-200">
          <div className="absolute top-3 left-3 bg-blue-50 text-[10px] font-bold text-blue-600 px-2.5 py-1 rounded-lg">ADVERTISER SLOT [4]</div>
          <div className="absolute top-3 right-3 text-[10px] text-zinc-400 font-bold">Auto-rotating (7s)</div>
          <div className="pt-6">
            <p className="text-zinc-650 text-xs font-bold mb-3 md:text-sm">এটি আপনার ওয়েবসাইটের প্রথম প্যারাগ্রাফ বা লেখা।</p>
            
            <div className="w-full min-h-[140px] flex justify-center bg-zinc-50 rounded-2xl border border-zinc-100 p-4 mb-3">
              <AdsterraNativeAd 
                id="da746eeca9d76d3d5c81c4cb3720e8eb" 
                containerId="container-da746eeca9d76d3d5c81c4cb3720e8eb" 
                rotation={adRotation} 
              />
            </div>

            <p className="text-zinc-400 text-[10px] font-bold md:text-xs">এটি বিজ্ঞাপনের নিচের দ্বিতীয় প্যারাগ্রাফ বা লেখা।</p>
          </div>
        </div>

        {/* --- GLOBAL BOTTOM BANNER AD (Auto-rotating every 10s) --- */}
        <div className="w-full flex flex-col items-center gap-4 mt-6">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <p className="text-[10px] uppercase font-black tracking-widest">
              SPONSOR BANNER (AUTO-ROTATES EVERY 7S)
            </p>
          </div>
          <div className="w-full max-w-xl bg-white p-4 rounded-[2rem] shadow-xl border border-zinc-100 flex flex-col justify-center items-center overflow-hidden min-h-[140px]">
             <div key={`banner-group-${adRotation}`} className="w-full flex flex-col items-center justify-center">
                <AdsterraNativeAd 
                   id="da746eeca9d76d3d5c81c4cb3720e8eb" 
                   containerId="container-da746eeca9d76d3d5c81c4cb3720e8eb" 
                   rotation={adRotation} 
                />
             </div>
          </div>
          
          <div className="w-[120px] bg-zinc-100 h-1 rounded-full overflow-hidden mt-1 relative">
             <div 
                key={`progress-${adRotation}`}
                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full"
                style={{
                  width: '100%',
                  animation: 'banner-timer 7s linear forwards'
                }}
             />
             {/* Inline CSS to style the animation on the fly */}
             <style>{`
               @keyframes banner-timer {
                 from { width: 0%; }
                 to { width: 100%; }
               }
             `}</style>
          </div>

          <p className="text-[9px] text-zinc-300">Monetized by SuperLink Monetization Engine v4.0</p>
        </div>

      </main>

      <footer className="py-6 text-center text-zinc-400 text-[10px] bg-white border-t border-zinc-100">
        <p>SUPERLINK AD ROTATOR | PROTECTION v4.0 | {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};


const Dashboard = () => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'links'));
        const data = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          let dateObj = new Date();
          if (docData.created_at) {
            if (typeof docData.created_at.toDate === 'function') {
              dateObj = docData.created_at.toDate();
            } else {
              dateObj = new Date(docData.created_at);
            }
          }
          return {
            ...docData,
            id: doc.id,
            created_at: dateObj
          };
        });
        
        // Sort in-memory descending by created_at
        data.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        setLinks(data);
      } catch (err) {
        console.error("Failed to fetch links on dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Create New Link</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <LinkIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Total URL</p>
            <h3 className="text-3xl font-black text-zinc-900">{links.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Total Traffic</p>
            <h3 className="text-3xl font-black text-zinc-900">
              {links.reduce((acc, curr) => acc + (curr.views || 0), 0)}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100">
          <h2 className="font-bold text-lg">Your Links & Files</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">User/URL</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      link.type === 'file' ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {link.type === 'file' ? <FileUp size={16} /> : <LinkIcon size={16} />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 max-w-xs truncate">
                    <span className="font-bold text-zinc-900 block">{link.type === 'file' ? link.file_name : 'Short Link'}</span>
                    <span className="text-xs text-zinc-400 truncate block">{link.original_url}</span>
                  </td>
                  <td className="px-6 py-4 font-bold">{link.views}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{new Date(link.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        const baseUrl = window.location.href.split('#')[0].split('?')[0].replace(/\/$/, "");
                        window.open(`${baseUrl}/${link.id}`, '_blank');
                      }}
                      className="text-indigo-600 hover:underline text-sm font-bold flex items-center gap-1"
                    >
                      View <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No links created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // Direct path router proxy:
  // If the pathname contains a clean short ID like "/hjfjg", rewrite/redirect to HashRouter route "#/go/hjfjg"
  useEffect(() => {
    const pathname = window.location.pathname;
    // Extract everything after the first slash
    const pathSegment = pathname.substring(1);
    
    // Check if the path segment looks like an ID: alphanumeric only, 3 to 10 chars,
    // and not a known static path (like "dashboard" or "go") or containing a dot (like style.css)
    const isShortId = /^[a-zA-Z0-9_-]{3,10}$/.test(pathSegment) && 
                      pathSegment !== 'dashboard' && 
                      pathSegment !== 'go';
                      
    if (isShortId) {
      window.location.hash = `#/go/${pathSegment}`;
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <Routes>
          <Route path="/go/:id" element={<InterstitialPage />} />
          <Route path="/" element={
            <>
              <Navbar />
              <HomePage />
              <Footer />
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <Dashboard />
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}
