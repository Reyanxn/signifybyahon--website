'use client';

import { useEffect, useState } from 'react';
import { HiX, HiDownload } from 'react-icons/hi';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] max-w-sm mx-auto bg-[#1C1C1C] text-white p-4 flex items-center gap-3 shadow-lg">
      <HiDownload className="w-5 h-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-[0.1em]">Install MESO Dev</p>
        <p className="text-[10px] opacity-60 mt-0.5">Manage your store from your phone</p>
      </div>
      <button onClick={install} className="text-[10px] uppercase tracking-[0.1em] bg-white text-[#1C1C1C] px-3 py-1.5 shrink-0">Install</button>
      <button onClick={() => setShow(false)} className="opacity-40 hover:opacity-100 shrink-0"><HiX className="w-4 h-4" /></button>
    </div>
  );
}
