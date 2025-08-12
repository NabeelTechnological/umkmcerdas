
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { UserIcon, MailIcon, LockIcon } from '../components/icons';
import AvatarSelectionModal from '../components/AvatarSelectionModal';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const SettingsPage = () => {
    const { user, updateProfile, changePassword, updateAvatar } = useAuth();
    const { t } = useLanguage();
    const { addToast } = useToast();

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    // State for profile info form
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    // State for password change form
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name, email: user.email });
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || (profileForm.name === user.name && profileForm.email === user.email)) return;

        setIsProfileLoading(true);
        try {
            const result = await updateProfile(profileForm.name, profileForm.email);
            if (result.success) {
                addToast('success', t('settings_profile_update_success_title'), t('settings_profile_update_success_message'));
            } else {
                addToast('error', t('form_error_title'), t(result.error));
                if (user) setProfileForm({ name: user.name, email: user.email });
            }
        } catch(error: any) {
             addToast('error', t('form_error_title'), error.message || 'Gagal memperbarui profil.');
             if (user) setProfileForm({ name: user.name, email: user.email });
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            addToast('error', t('form_error_title'), t('settings_password_mismatch'));
            return;
        }
        if(passwordForm.newPassword.length < 6) {
            addToast('error', t('form_error_title'), t('auth_error_weak_password'));
            return;
        }

        setIsPasswordLoading(true);
        try {
            const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            if (result.success) {
                addToast('success', t('settings_password_update_success_title'), t('settings_password_update_success_message'));
                setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            } else {
                addToast('error', t('form_error_title'), t(result.error));
            }
        } catch (error: any) {
             addToast('error', t('form_error_title'), error.message || 'Gagal mengubah kata sandi.');
        } finally {
            setIsPasswordLoading(false);
        }
    };
    
    const handleAvatarSelect = async (avatarUrl: string) => {
        setIsAvatarModalOpen(false);
        try {
            await updateAvatar(avatarUrl);
            addToast('success', t('settings_avatar_update_success_title'), t('settings_avatar_update_success_message'));
        } catch (error: any) {
             addToast('error', 'Gagal', 'Tidak dapat memperbarui avatar.');
        }
    }

    if (!user) {
        return null; // Or a loading/error state
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white p-6 rounded-xl shadow-md"
            >
                <h3 className="text-lg font-bold text-slate-700 mb-4">{t('settings_profile_title')}</h3>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-200" />
                    </div>
                    <div>
                         <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAvatarModalOpen(true)}
                            className="bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition duration-300"
                         >
                             {t('settings_profile_button')}
                         </motion.button>
                    </div>
                </div>
            </motion.div>

            <motion.form
                onSubmit={handleProfileSubmit}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white p-6 rounded-xl shadow-md"
            >
                <h3 className="text-lg font-bold text-slate-700 mb-4">{t('settings_user_info_title')}</h3>
                <div className="space-y-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon className="h-5 w-5 text-slate-400" /></span>
                        <input type="text" name="name" value={profileForm.name} onChange={handleProfileChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon className="h-5 w-5 text-slate-400" /></span>
                        <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <motion.button
                        type="submit"
                        disabled={isProfileLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
                    >
                        {isProfileLoading ? '...' : t('settings_user_info_button')}
                    </motion.button>
                </div>
            </motion.form>
            
            <motion.form
                onSubmit={handlePasswordSubmit}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white p-6 rounded-xl shadow-md"
            >
                <h3 className="text-lg font-bold text-slate-700 mb-4">{t('settings_password_title')}</h3>
                <div className="space-y-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-slate-400" /></span>
                        <input type="password" name="currentPassword" placeholder={t('settings_password_current_label')} value={passwordForm.currentPassword} onChange={handlePasswordChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-slate-400" /></span>
                        <input type="password" name="newPassword" placeholder={t('settings_password_new_label')} value={passwordForm.newPassword} onChange={handlePasswordChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon className="h-5 w-5 text-slate-400" /></span>
                        <input type="password" name="confirmNewPassword" placeholder={t('settings_password_confirm_label')} value={passwordForm.confirmNewPassword} onChange={handlePasswordChange} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <motion.button
                        type="submit"
                        disabled={isPasswordLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400"
                    >
                        {isPasswordLoading ? '...' : t('settings_password_button')}
                    </motion.button>
                </div>
            </motion.form>
            <AvatarSelectionModal 
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSelect={handleAvatarSelect}
            />
        </div>
    );
};

export default SettingsPage;