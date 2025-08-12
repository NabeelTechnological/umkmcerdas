import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { GlobeIcon } from './icons';

const Header = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getTitleKey = () => {
    switch (location.pathname) {
      case '/':
        return 'header_dashboard';
      case '/produk':
        return 'header_products';
      case '/penjualan':
        return 'header_sales';
      case '/advisor':
        return 'header_advisor';
      case '/pengaturan':
        return 'header_settings';
      default:
        return 'header_dashboard';
    }
  };

  const languages: { code: 'id' | 'en' | 'cn', name: string }[] = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' },
    { code: 'cn', name: '中文' },
  ];
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-slate-800">{t(getTitleKey())}</h1>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 p-2 rounded-lg transition-colors"
          aria-haspopup="true"
          aria-expanded={isDropdownOpen}
        >
          <GlobeIcon className="w-6 h-6" />
          <span className="font-medium uppercase">{language}</span>
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20">
            {languages.map(lang => (
              <a
                key={lang.code}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLanguage(lang.code);
                  setIsDropdownOpen(false);
                }}
                className={`block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${language === lang.code ? 'font-bold text-indigo-600' : ''}`}
              >
                {lang.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;