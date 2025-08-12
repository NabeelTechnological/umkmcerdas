
import React, { useState, useEffect, useMemo } from 'react';
import { useUmkmData } from '../hooks/useUmkmData';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { motion } from 'framer-motion';
import { EditIcon, TrashIcon, SearchIcon, InboxArrowDownIcon } from './icons';
import type { ProcessedSale } from '../types';
import EmptyState from './EmptyState';

const tableContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

const Sales = () => {
    const { sales, products, addSale, updateSale, deleteSale } = useUmkmData();
    const { t, language } = useLanguage();
    const { addToast } = useToast();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [editingSale, setEditingSale] = useState<ProcessedSale | null>(null);
    const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');

    const [formState, setFormState] = useState({ product_id: '', quantity: 1 });

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language === 'cn' ? 'zh-CN' : language, { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    
    useEffect(() => {
        // Set default product for the form when products are loaded
        if (!formState.product_id && products.length > 0) {
            setFormState(prev => ({ ...prev, product_id: products[0].id }));
        }
    }, [products, formState.product_id]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 1 : value }));
    };

    const handleOpenAddModal = () => {
        setEditingSale(null);
        setFormState({ product_id: products.length > 0 ? products[0].id : '', quantity: 1 });
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (sale: ProcessedSale) => {
        setEditingSale(sale);
        setFormState({
            product_id: sale.product_id,
            quantity: sale.quantity,
        });
        setIsFormModalOpen(true);
    };

    const handleOpenDeleteModal = (saleId: string) => {
        setDeletingSaleId(saleId);
        setIsConfirmModalOpen(true);
    };
    
    const handleDeleteConfirm = async () => {
        if (deletingSaleId) {
            try {
                await deleteSale(deletingSaleId);
                addToast('success', t('sales_delete_success_title'), t('sales_delete_success_message'));
            } catch (error: any) {
                addToast('error', t('delete_error_title'), error.message || 'Gagal menghapus penjualan.');
            }
        }
        setIsConfirmModalOpen(false);
        setDeletingSaleId(null);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const product = products.find(p => p.id === formState.product_id);
        if(!formState.product_id || formState.quantity <= 0 || !product){
             addToast('error', t('form_error_title'), t('sales_form_error'));
             return;
        }

        setIsSubmitting(true);
        try {
            if (editingSale) {
                // TODO: Backend doesn't support update sale yet.
                // await updateSale(editingSale.id, { product_id: formState.product_id, quantity: formState.quantity });
                addToast('info', 'Segera Hadir', 'Fitur edit penjualan sedang dalam pengembangan.');
            } else {
                await addSale({ product_id: formState.product_id, quantity: formState.quantity });
                addToast('success', t('sales_add_success_title'), t('sales_add_success_message'));
            }
            setIsFormModalOpen(false);
        } catch (error: any) {
             addToast('warning', t('sales_insufficient_stock_title'), error.message || 'Terjadi kesalahan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const localeForDates = language === 'cn' ? 'zh-CN' : language === 'en' ? 'en-GB' : 'id-ID';
    const modalTitle = editingSale ? t('sales_modal_edit_title') : t('sales_modal_title');
    
    const sortedSales = useMemo(() => {
        return [...sales].sort((a,b) => b.date.getTime() - a.date.getTime());
    }, [sales]);

    const filteredSales = useMemo(() => {
        return sortedSales.filter(sale =>
            sale.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedSales, searchQuery]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50"
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleOpenAddModal}
                    disabled={products.length === 0}
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    {t('sales_add_button')}
                </motion.button>
            </div>
            
             {sales.length === 0 ? (
                <EmptyState
                    icon={<InboxArrowDownIcon className="w-16 h-16" />}
                    title={t('empty_state_no_sales_title')}
                    message={t('empty_state_no_sales_message')}
                />
            ) : filteredSales.length === 0 ? (
                <EmptyState
                    icon={<SearchIcon className="w-16 h-16" />}
                    title={t('empty_state_no_results_title')}
                    message={t('empty_state_no_results_message')}
                    action={{ text: t('empty_state_clear_search'), onClick: () => setSearchQuery('') }}
                />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('sales_table_date')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales_table_name')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales_table_quantity')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales_table_total')}</th>
                                <th scope="col" className="px-6 py-3">{t('sales_table_profit')}</th>
                                <th scope="col" className="px-6 py-3">{t('products_table_actions')}</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={tableContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredSales.map((sale) => (
                                <motion.tr 
                                    key={sale.id}
                                    variants={tableRowVariants}
                                    className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4">{sale.date.toLocaleString(localeForDates, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{sale.productName}</td>
                                    <td className="px-6 py-4">{sale.quantity}</td>
                                    <td className="px-6 py-4">{formatCurrency(sale.total_price)}</td>
                                    <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(sale.profit)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleOpenEditModal(sale)} className="text-indigo-600 hover:text-indigo-900 transition-colors" aria-label={t('products_edit_button')}>
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleOpenDeleteModal(sale.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={t('products_delete_button')}>
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                </div>
            )}


            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={modalTitle}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="product_id" className="block text-sm font-medium text-slate-700">{t('sales_modal_product_label')}</label>
                        <select name="product_id" id="product_id" value={formState.product_id} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900" required>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({t('sales_stock_option', { stock: p.stock})})
                                </option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">{t('sales_modal_quantity_label')}</label>
                        <input type="number" name="quantity" id="quantity" value={formState.quantity} min="1" onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900" required />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                       <button type="button" onClick={() => setIsFormModalOpen(false)} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition duration-300" disabled={isSubmitting}>{t('sales_modal_cancel_button')}</button>
                       <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : t('sales_modal_save_button')}
                       </button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t('sales_delete_confirm_title')}
                message={t('sales_delete_confirm_message')}
            />
        </motion.div>
    );
};

export default Sales;