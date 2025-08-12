
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { LogoIcon, MailIcon, LockIcon, UserIcon, GoogleIcon, AuthIllustrationIcon } from '../components/icons';
import GoogleAuthModal from '../components/GoogleAuthModal';

type AuthMode = 'login' | 'register';

const AuthPage = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const { login, register, loginWithGoogle } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useToast();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

    const handleSwitchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = mode === 'login'
            ? await login(email, password)
            : await register(name, email, password);

        if (result.success) {
            if (mode === 'login') {
                addToast('success', t('login_success_title'), t('login_success_message', { name: result.user.name }));
            } else {
                addToast('success', t('register_success_title'), t('register_success_message', { name: result.user.name }));
            }
        } else {
            setError(t(result.error || 'auth_error_generic'));
        }
        setIsLoading(false);
    };

    const handleGoogleLogin = async (googleUser: { name: string; email: string; }) => {
        setIsGoogleModalOpen(false);
        setIsLoading(true);
        setError('');
    
        const result = await loginWithGoogle(googleUser);
    
        if (result.success) {
            addToast('success', t('login_success_title'), t('login_success_message', { name: result.user.name }));
        } else {
            setError(t(result.error || 'auth_error_generic'));
        }
        setIsLoading(false);
    };

    const formVariants: Variants = {
        hidden: { opacity: 0, x: mode === 'login' ? -50 : 50, transition: { duration: 0.3, ease: 'easeInOut' } },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
        exit: { opacity: 0, x: mode === 'login' ? 50 : -50, transition: { duration: 0.3, ease: 'easeInOut' } },
    };

    const illustrationVariants: Variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white">
            {/* Left Pane - Illustration */}
            <motion.div 
                className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 items-center justify-center p-12 text-white relative overflow-hidden"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 1}}
            >
                 <div className="z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <LogoIcon className="h-16 w-16 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold tracking-tight">{t('auth_slogan_title')}</h1>
                        <p className="mt-4 text-lg text-indigo-200 max-w-md mx-auto">{t('auth_slogan_subtitle')}</p>
                    </motion.div>
                    <motion.div variants={illustrationVariants} initial="hidden" animate="visible">
                        <AuthIllustrationIcon className="w-full h-auto max-w-md mt-10" />
                    </motion.div>
                 </div>
            </motion.div>
            
            {/* Right Pane - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6 sm:p-12">
                <div className="w-full max-w-md">
                     <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <LogoIcon className="h-10 w-10 text-indigo-600" />
                        <h1 className="text-2xl font-bold text-slate-800">{t('sidebar_title')}</h1>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            variants={formVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="text-left mb-6">
                                <h2 className="text-3xl font-bold text-slate-900">{t(mode === 'login' ? 'auth_login_title' : 'auth_register_title')}</h2>
                                <p className="text-slate-500 mt-1">{t(mode === 'login' ? 'auth_login_subtitle' : 'auth_register_subtitle')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'register' && (
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <UserIcon className="h-5 w-5 text-slate-400" />
                                        </span>
                                        <input type="text" placeholder={t('auth_name_label')} value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
                                    </div>
                                )}
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <MailIcon className="h-5 w-5 text-slate-400" />
                                    </span>
                                    <input type="email" placeholder={t('auth_email_label')} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <LockIcon className="h-5 w-5 text-slate-400" />
                                    </span>
                                    <input type="password" placeholder={t('auth_password_label')} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
                                </div>

                                {error && (
                                    <motion.p initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="text-sm text-red-600 text-center">{error}</motion.p>
                                )}

                                <motion.button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400 flex justify-center items-center shadow-lg shadow-indigo-500/30" whileHover={{ scale: isLoading ? 1 : 1.02, y: -2 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                                    {isLoading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : ( t(mode === 'login' ? 'auth_login_button' : 'auth_register_button') )}
                                </motion.button>
                            </form>
                            
                            <div className="flex items-center my-6">
                                <hr className="flex-grow border-slate-300"/>
                                <span className="mx-4 text-xs font-medium text-slate-400">{t('auth_or_separator')}</span>
                                <hr className="flex-grow border-slate-300"/>
                            </div>

                             <motion.button 
                                type="button" 
                                onClick={() => setIsGoogleModalOpen(true)}
                                disabled={isLoading} 
                                className="w-full bg-white text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-200 transition duration-300 disabled:bg-slate-200 flex justify-center items-center gap-3 border border-slate-300" whileHover={{ scale: isLoading ? 1 : 1.02, y:-2 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}>
                               <GoogleIcon />
                               {t('auth_google_button')}
                            </motion.button>

                        </motion.div>
                    </AnimatePresence>

                    <div className="text-center mt-8 text-sm">
                        <p className="text-slate-500">
                            {t(mode === 'login' ? 'auth_to_register_prompt' : 'auth_to_login_prompt')}{' '}
                            <button onClick={() => handleSwitchMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-indigo-600 hover:text-indigo-500 transition">
                                {t(mode === 'login' ? 'auth_to_register_link' : 'auth_to_login_link')}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <GoogleAuthModal 
                isOpen={isGoogleModalOpen}
                onClose={() => !isLoading && setIsGoogleModalOpen(false)}
                onSelectAccount={handleGoogleLogin}
            />
        </div>
    );
};

export default AuthPage;