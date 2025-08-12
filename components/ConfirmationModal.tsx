
import React from 'react';
import Modal from './Modal';
import { motion } from 'framer-motion';
import { WarningIcon } from './icons';
import { useLanguage } from '../hooks/useLanguage';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { t } = useLanguage();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                   <WarningIcon className="h-6 w-6 text-red-600" />
                </div>
                <p className="mt-4 text-slate-600">{message}</p>
            </div>
            <div className="mt-6 flex justify-center gap-4">
                 <motion.button
                    type="button"
                    onClick={onClose}
                    className="w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {t('products_modal_cancel_button')}
                </motion.button>
                <motion.button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {t('delete_confirm_button')}
                </motion.button>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;