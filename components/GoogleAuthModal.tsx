
import React from 'react';
import Modal from './Modal';
import { useLanguage } from '../hooks/useLanguage';
import { GoogleIcon, UserCircleIcon } from './icons';

interface MockUser {
    name: string;
    email: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (user: MockUser) => void;
}

const mockUsers: MockUser[] = [
    { name: 'Budi Santoso', email: 'budi.s@example.com' },
    { name: 'Siti Aminah', email: 'siti.a@example.com' },
    { name: 'Alex Johnson', email: 'alex.j@example.com' },
];

const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, onSelectAccount }) => {
    const { t } = useLanguage();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="">
            <div className="flex flex-col items-center text-center">
                <GoogleIcon className="w-10 h-10 mb-2"/>
                <h3 className="text-2xl font-semibold text-slate-800">{t('google_auth_modal_title')}</h3>
                <p className="mt-1 text-slate-500">{t('google_auth_modal_subtitle')}</p>
                <div className="w-full border-t my-6"></div>
                <ul className="space-y-2 w-full">
                    {mockUsers.map(user => (
                        <li key={user.email}>
                           <button 
                                onClick={() => onSelectAccount(user)}
                                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                            >
                                <UserCircleIcon className="w-10 h-10 text-slate-400"/>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-700">{user.name}</p>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                           </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

export default GoogleAuthModal;