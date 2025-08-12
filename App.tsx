import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, Transition } from 'framer-motion';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';
import Advisor from './components/Advisor';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/Auth';
import { useAuth } from './hooks/useAuth';
import { LogoIcon } from './components/icons';
import ToastContainer from './components/ToastContainer';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};


const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex h-screen bg-slate-100 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
    </div>
);

const MainAppRoutes = () => {
    const location = useLocation();
    return (
        <AppLayout>
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                >
                    <Routes location={location}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/produk" element={<Products />} />
                        <Route path="/penjualan" element={<Sales />} />
                        <Route path="/advisor" element={<Advisor />} />
                        <Route path="/pengaturan" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </motion.div>
            </AnimatePresence>
        </AppLayout>
    );
};

const AuthRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
            >
                <Routes location={location}>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
};

const FullPageLoader = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-100">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
            <LogoIcon className="h-20 w-20 text-indigo-600" />
        </motion.div>
        <p className="mt-4 text-lg font-semibold text-slate-700">Memuat Aplikasi...</p>
    </div>
);

const AppContent = () => {
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return <FullPageLoader />;
    }

    return isAuthenticated ? <MainAppRoutes /> : <AuthRoutes />;
}


function App() {
  return (
    <HashRouter>
        <AppContent />
        <ToastContainer />
    </HashRouter>
  );
}

export default App;