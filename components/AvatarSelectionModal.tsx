import React from 'react';
import Modal from './Modal';
import { useLanguage } from '../hooks/useLanguage';
import { motion } from 'framer-motion';

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarUrl: string) => void;
}

const AVATAR_URLS = [
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Mimi',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Abby',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Callie',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Leo',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Max',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Bear',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Loki',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Milo',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Zoe',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Jasper',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Gizmo',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=Aneka',
];

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const { t } = useLanguage();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('settings_avatar_modal_title')}>
            <div className="grid grid-cols-4 gap-4">
                {AVATAR_URLS.map(url => (
                    <motion.button
                        key={url}
                        onClick={() => onSelect(url)}
                        className="rounded-full aspect-square overflow-hidden ring-2 ring-transparent hover:ring-indigo-500 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                    </motion.button>
                ))}
            </div>
        </Modal>
    );
};

export default AvatarSelectionModal;
