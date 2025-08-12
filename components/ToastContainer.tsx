
import React from 'react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import { AnimatePresence } from 'framer-motion';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ToastContainer;
