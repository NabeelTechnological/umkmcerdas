
import React, { useState, useMemo } from 'react';
import { useUmkmData } from '../hooks/useUmkmData';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { motion } from 'framer-motion';
import { EditIcon, TrashIcon, SearchIcon, InboxArrowDownIcon } from './icons';
import type { Product } from '../types';
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

const Products = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useUmkmData();
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formState, setFormState] = useState({
        name: '',
        purchase_price: 0,
        selling_price: 0,
        stock: 0
    });
    
    const [searchQuery, setSearchQuery] = useState('');

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language === 'cn' ? 'zh-CN' : language, { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: name.includes('price') || name === 'stock' ? parseFloat(value) || 0 : value }));
    };

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setFormState({ name: '', purchase_price: 0, selling_price: 0, stock: 0 });
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormState({
            name: product.name,
            purchase_price: product.purchase_price,
            selling_price: product.selling_price,
            stock: product.stock,
        });
        setIsFormModalOpen(true);
    };
    
    const handleOpenDeleteModal = (productId: string) => {
        setDeletingProductId(productId);
        setIsConfirmModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingProductId) {
            try {
                await deleteProduct(deletingProductId);
                addToast('success', t('delete_success_title'), t('products_delete_success_message'));
            } catch (error: any) {
                addToast('error', t('delete_error_title'), error.message || t('delete_error_has_sales'));
            }
        }
        setDeletingProductId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(formState.name && formState.selling_price > 0 && formState.purchase_price >= 0){
            setIsSubmitting(true);
            try {
                if (editingProduct) {
                    await updateProduct({
                        id: editingProduct.id,
                        ...formState,
                    });
                    addToast('success', t('products_edit_success_title'), t('products_edit_success_message', { name: formState.name }));
                } else {
                    await addProduct(formState);
                    addToast('success', t('products_add_success_title'), t('products_add_success_message', { name: formState.name }));
                }
                setIsFormModalOpen(false);
            } catch (error: any) {
                addToast('error', t('form_error_title'), error.message || 'Gagal menyimpan produk.');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            addToast('error', t('form_error_title'), t('products_form_error'));
        }
    };

    const modalTitle = editingProduct ? t('products_modal_edit_title') : t('products_modal_title');
    
    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);


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
                    className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    {t('products_add_button')}
                </motion.button>
            </div>

            {products.length === 0 ? (
                <EmptyState
                    icon={<InboxArrowDownIcon className="w-16 h-16" />}
                    title={t('empty_state_no_products_title')}
                    message={t('empty_state_no_products_message')}
                    action={{ text: t('products_add_button'), onClick: handleOpenAddModal }}
                />
            ) : filteredProducts.length === 0 ? (
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
                                <th scope="col" className="px-6 py-3">{t('products_table_name')}</th>
                                <th scope="col" className="px-6 py-3">{t('products_table_purchase_price')}</th>
                                <th scope="col" className="px-6 py-3">{t('products_table_selling_price')}</th>
                                <th scope="col" className="px-6 py-3">{t('products_table_stock')}</th>
                                <th scope="col" className="px-6 py-3">{t('products_table_potential_profit')}</th>
                                <th scope="col" className="px-6 py-3">{t('products_table_actions')}</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            variants={tableContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredProducts.map((product) => (
                                <motion.tr 
                                    key={product.id}
                                    variants={tableRowVariants}
                                    className="bg-white border-b hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                                    <td className="px-6 py-4">{formatCurrency(product.purchase_price)}</td>
                                    <td className="px-6 py-4">{formatCurrency(product.selling_price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 20 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                          {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(product.selling_price - product.purchase_price)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleOpenEditModal(product)} className="text-indigo-600 hover:text-indigo-900 transition-colors" aria-label={t('products_edit_button')}>
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleOpenDeleteModal(product.id)} className="text-red-600 hover:text-red-900 transition-colors" aria-label={t('products_delete_button')}>
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
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t('products_modal_name_label')}</label>
                        <input type="text" name="name" id="name" value={formState.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900" required />
                    </div>
                     <div>
                        <label htmlFor="purchase_price" className="block text-sm font-medium text-slate-700">{t('products_modal_purchase_price_label')}</label>
                        <input type="number" name="purchase_price" id="purchase_price" value={formState.purchase_price} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900" required min="0"/>
                    </div>
                     <div>
                        <label htmlFor="selling_price" className="block text-sm font-medium text-slate-700">{t('products_modal_selling_price_label')}</label>
                        <input type="number" name="selling_price" id="selling_price" value={formState.selling_price} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900" required min="0"/>
                    </div>
                     <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-slate-700">{t('products_modal_stock_label')}</label>
                        <input type="number" name="stock" id="stock" value={formState.stock} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900" required min="0"/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                       <button type="button" onClick={() => setIsFormModalOpen(false)} className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition duration-300" disabled={isSubmitting}>{t('products_modal_cancel_button')}</button>
                       <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400" disabled={isSubmitting}>
                         {isSubmitting ? 'Menyimpan...' : t('products_modal_save_button')}
                       </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal 
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={t('delete_confirm_title')}
                message={t('products_delete_confirm_message')}
            />
        </motion.div>
    );
};

export default Products;