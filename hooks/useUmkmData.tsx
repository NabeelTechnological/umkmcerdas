

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { Product, Sale, DataContextType, ProcessedSale } from '../types';
import { useAuth } from './useAuth';
import { apiFetch } from '../services/supabase';

const DataContext = createContext<DataContextType | null>(null);

const processFetchedSales = (sales: Sale[], products: Product[]): ProcessedSale[] => {
    return sales.map(sale => {
        const product = products.find(p => p.id === sale.product_id);
        return {
            ...sale,
            date: new Date(sale.created_at),
            productName: product ? product.name : 'Produk Dihapus',
            products: product ? { name: product.name } : null,
        };
    });
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<ProcessedSale[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [productsData, salesData] = await Promise.all([
                apiFetch('/products'),
                apiFetch('/sales')
            ]);
            setProducts(productsData);
            setSales(processFetchedSales(salesData, productsData));
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            // Optionally, show a toast to the user
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        } else {
            // Clear data on logout
            setProducts([]);
            setSales([]);
        }
    }, [isAuthenticated, fetchData]);

    const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
        const newProduct = await apiFetch('/products', { method: 'POST', body: productData });
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = async (updatedProductData: Omit<Product, 'created_at'>) => {
        const updatedProduct = await apiFetch(`/products/${updatedProductData.id}`, { method: 'PUT', body: updatedProductData });
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = async (productId: string) => {
        await apiFetch(`/products/${productId}`, { method: 'DELETE' });
        setProducts(prev => prev.filter(p => p.id !== productId));
        return { success: true };
    };
    
    const addSale = async (saleData: { product_id: string, quantity: number }) => {
        const { newSale, updatedProduct } = await apiFetch('/sales', { method: 'POST', body: saleData });
        
        // 1. Create the updated list of products to ensure consistency
        const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        setProducts(updatedProducts);
        
        // 2. Process the new sale using the *updated* product list
        const processedNewSale = processFetchedSales([newSale], updatedProducts)[0];
        setSales(prev => [processedNewSale, ...prev]);

        return { success: true };
    };
    
    const updateSale = async (saleId: string, newValues: { product_id: string, quantity: number }) => {
        throw new Error("Update sale functionality is not implemented yet.");
    };

    const deleteSale = async (saleId: string) => {
        const { updatedProduct } = await apiFetch(`/sales/${saleId}`, { method: 'DELETE' });

        // Update product stock locally if it was returned
        if (updatedProduct) {
            setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        }
        
        setSales(prev => prev.filter(s => s.id !== saleId));
    };

    const getSummary = useCallback((range: 'today' | '7days' | '30days' | 'all' = 'all') => {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const filteredSales = sales.filter(sale => {
            if (range === 'all') return true;
            
            const saleDate = new Date(sale.created_at);
            if (range === 'today') {
                return saleDate.toDateString() === now.toDateString();
            }
            if (range === '7days') {
                return saleDate >= sevenDaysAgo;
            }
            if (range === '30days') {
                return saleDate >= thirtyDaysAgo;
            }
            return true;
        });

        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_price, 0);
        const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
        const totalProducts = products.length;
        const totalSales = filteredSales.length;

        const salesByDayData: { [key: string]: { penjualan: number; keuntungan: number } } = {};
        filteredSales.forEach(sale => {
            const saleDate = sale.date;
            const dateStr = saleDate.toLocaleDateString('en-CA');
            if (!salesByDayData[dateStr]) {
                salesByDayData[dateStr] = { penjualan: 0, keuntungan: 0 };
            }
            salesByDayData[dateStr].penjualan += sale.total_price;
            salesByDayData[dateStr].keuntungan += sale.profit;
        });

        const salesByDay = Object.entries(salesByDayData)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const productSalesCount: { [key: string]: number } = {};
        filteredSales.forEach(sale => {
            const productName = sale.productName;
            if (!productName || productName === 'Produk Dihapus') return;
            if (!productSalesCount[productName]) {
                productSalesCount[productName] = 0;
            }
            productSalesCount[productName] += sale.quantity;
        });
        const topProducts = Object.entries(productSalesCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a,b) => b.value - a.value)
            .slice(0, 5);

        return { totalRevenue, totalProfit, totalProducts, totalSales, salesByDay, topProducts, filteredSales };
    }, [sales, products]);

    const value = useMemo(() => ({
        products,
        sales,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        updateSale,
        deleteSale,
        getSummary
    }), [products, sales, getSummary, addProduct, updateProduct, deleteProduct, addSale, updateSale, deleteSale]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useUmkmData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useUmkmData must be used within a DataProvider');
    }
    return context;
};