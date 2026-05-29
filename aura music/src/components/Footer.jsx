import React from 'react';

export const Footer = () => {
  return (
    <footer className="relative mt-20 bg-black/40 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>
        <p className="text-gray-500 text-center text-sm">© 2025-26 Aura Tune. All rights reserved.</p>
        <p className="text-gray-500 text-center text-sm mt-2">
          Built with 💖 by <a href="https://ak-folio.netlify.app" target="_blank" rel="noreferrer" className="text-purple-300 underline">AkDev</a>
        </p>
      </div>
    </footer>
  );
};
