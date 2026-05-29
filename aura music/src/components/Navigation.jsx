import React, { useState } from 'react';
import { Home, ListMusic, Info, Equal, X } from 'lucide-react';

export const Navigation = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'playlist', label: 'Playlist', icon: ListMusic },
    { id: 'about', label: 'About Us', icon: Info },
  ];

  const handleNavClick = (pageId) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation Bar */}
      <nav className="hidden md:block mb-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="./icons/aura-icon.png"
                alt="Aura Tune Logo"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-400/50 shadow-lg"
              />
              <span
                className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-2xl font-bold text-transparent"
                style={{ fontFamily: "'Kontanter', sans-serif" }}
              >
                AURA TUNE
              </span>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      flex items-center space-x-2 px-5 py-3 rounded-xl
                      transition-all duration-300 font-medium
                      ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                          : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
                      }
                    `}
                    style={{ fontFamily: "'Diphylleia', sans-serif" }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden mb-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img
                src="./icons/aura-icon.png"
                alt="Aura Tune Logo"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-400/50 shadow-lg"
              />
              <span
                className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-lg font-bold text-transparent"
                style={{ fontFamily: "'Kontanter', sans-serif" }}
              >
                AURA TUNE
              </span>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Equal className="h-6 w-6 text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                      transition-all duration-300 font-medium
                      ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                    style={{ fontFamily: "'Diphylleia', sans-serif" }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
