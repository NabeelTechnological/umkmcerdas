import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    message: string;
    action?: {
        text: string;
        onClick: () => void;
    }
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, action }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16 px-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200"
        >
            <div className="mx-auto text-slate-400">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{message}</p>
            {action && (
                <div className="mt-6">
                    <motion.button
                        onClick={action.onClick}
                        className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center gap-2 mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                         {action.text}
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

export default EmptyState;
