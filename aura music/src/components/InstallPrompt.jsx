import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  Download,
  Monitor,
  Smartphone,
  Sparkles,
  Tablet,
  X,
} from 'lucide-react';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

const getDeviceIcon = () => {
  if (typeof window === 'undefined') return Smartphone;

  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  const isTablet =
    /ipad|tablet|android(?!.*mobile)/i.test(userAgent) ||
    (width >= 768 && width <= 1024);
  const isMobile =
    /iphone|ipod|android.*mobile|windows phone/i.test(userAgent) ||
    width < 768;

  if (isTablet) return Tablet;
  if (isMobile) return Smartphone;
  return Monitor;
};

const getInstallHelp = () => {
  if (typeof window === 'undefined') {
    return {
      title: 'Install App',
      body: 'Use your browser menu to install this app.',
      actionLabel: 'Browser menu',
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isChrome = /chrome|crios/.test(userAgent) && !/edg|opr|opera/.test(userAgent);
  const isEdge = /edg/.test(userAgent);
  const isFirefox = /firefox|fxios/.test(userAgent);

  if (isIOS) {
    return {
      title: 'Add to Home Screen',
      body: 'On iPhone or iPad, tap Share, then choose Add to Home Screen.',
      actionLabel: 'Share menu',
    };
  }

  if (isAndroid && isChrome) {
    return {
      title: 'Install from Chrome',
      body: 'Open the Chrome menu, then choose Install app or Add to Home screen.',
      actionLabel: 'Chrome menu',
    };
  }

  if (isAndroid) {
    return {
      title: 'Add to Home Screen',
      body: 'Open your browser menu, then choose Install app or Add to Home screen.',
      actionLabel: 'Browser menu',
    };
  }

  if (isEdge) {
    return {
      title: 'Install from Edge',
      body: 'Open the Edge menu, then choose Apps > Install this site as an app.',
      actionLabel: 'Edge menu',
    };
  }

  if (isFirefox) {
    return {
      title: 'Install App',
      body: 'Firefox support varies by device. Use the browser menu if Add to Home screen is available.',
      actionLabel: 'Browser menu',
    };
  }

  return {
    title: 'Install App',
    body: 'Open the browser menu and choose Install app or Add to home screen.',
    actionLabel: 'Browser menu',
  };
};

export const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const DeviceIcon = getDeviceIcon();
  const installHelp = getInstallHelp();

  useEffect(() => {
    if (typeof window === 'undefined' || isStandalone()) return undefined;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      window.setTimeout(() => setIsVisible(true), 800);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsVisible(false);
      setShowManualHelp(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const helpTimer = window.setTimeout(() => {
      if (!isStandalone()) {
        setShowManualHelp(true);
        setIsVisible(true);
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.clearTimeout(helpTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    setIsInstalling(true);
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }

    setInstallPrompt(null);
    setIsInstalling(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || (!installPrompt && !showManualHelp)) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-[999] flex justify-center px-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0f1a]/95 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl animate-[popup_.35s_ease]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/10" />
          <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400" />

          <div className="relative p-4">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
                <DeviceIcon className="h-7 w-7 text-white" />
              </div>

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    {installPrompt ? 'Install App' : installHelp.title}
                  </h3>
                  <div className="flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    Fast Access
                  </div>
                </div>

                <p className="pr-4 text-sm leading-relaxed text-gray-300">
                  {installPrompt
                    ? 'Add this app to your home screen for a smoother, faster and full-screen experience.'
                    : installHelp.body}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {['Offline Ready', 'Full Screen', 'Quick Launch'].map((item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-gray-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  {installPrompt ? (
                    <button
                      type="button"
                      onClick={handleInstall}
                      disabled={isInstalling}
                      className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                    >
                      <Download className="h-4 w-4" />
                      {isInstalling ? 'Installing...' : 'Install Now'}
                      <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-200">
                      {installHelp.actionLabel}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm font-medium text-gray-400 transition hover:text-white"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes popup {
            from {
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </>
  );
};
