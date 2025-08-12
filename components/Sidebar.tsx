import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardIcon, ProductIcon, SalesIcon, AdvisorIcon, LogoIcon, SettingsIcon, LogoutIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

const sidebarVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const Sidebar = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', textKey: 'sidebar_dashboard', icon: <DashboardIcon /> },
    { to: '/produk', textKey: 'sidebar_products', icon: <ProductIcon /> },
    { to: '/penjualan', textKey: 'sidebar_sales', icon: <SalesIcon /> },
    { to: '/advisor', textKey: 'sidebar_advisor', icon: <AdvisorIcon /> },
    { to: '/pengaturan', textKey: 'sidebar_settings', icon: <SettingsIcon /> },
  ];

  const linkClasses = "flex items-center px-4 py-3 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors duration-200 rounded-lg";
  const activeLinkClasses = "bg-slate-700/80 text-white font-semibold";
  
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-800 flex flex-col p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 px-4 mb-8">
        <LogoIcon className="h-10 w-10 text-indigo-400" />
        <span className="text-white text-xl font-bold">{t('sidebar_title')}</span>
      </motion.div>
      <motion.nav 
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col gap-2"
      >
        {navLinks.map((link) => (
          <motion.div key={link.to} variants={navItemVariants} whileHover={{x: 5}} transition={{type: 'spring', stiffness: 300}}>
            <NavLink
              to={link.to}
              end={link.to === '/'} // end should be true only for the dashboard
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <span className="mr-4">{link.icon}</span>
              {t(link.textKey)}
            </NavLink>
          </motion.div>
        ))}
      </motion.nav>

      {/* User Profile Section */}
      <div className="mt-auto">
         <div className="p-4 bg-slate-900/50 rounded-lg">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                    <img src={user?.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
             </div>
              <motion.button 
                onClick={handleLogout}
                whileHover={{backgroundColor: '#ef4444'}}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-red-400 rounded-lg hover:text-white transition-colors bg-slate-700/50"
              >
                  <LogoutIcon className="w-5 h-5"/>
                  {t('sidebar_logout')}
              </motion.button>
         </div>
      </div>

    </aside>
  );
};

export default Sidebar;