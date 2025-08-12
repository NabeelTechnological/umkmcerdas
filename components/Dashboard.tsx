

import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useUmkmData } from '../hooks/useUmkmData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, Variants } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { ExcelIcon, PdfIcon, CalendarIcon } from './icons';
import type { Product, ProcessedSale } from '../types';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    }
};

const StatCard: React.FC<{ title: string; value: string | number; description: string; children: React.ReactNode }> = ({ title, value, description, children }) => (
  <motion.div
    variants={itemVariants} 
    whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 300 } }}
    className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
    <div className="bg-indigo-100 p-3 rounded-full">
      {children}
    </div>
  </motion.div>
);

type DateRange = 'today' | '7days' | '30days' | 'all';

const Dashboard = () => {
    const { getSummary, products } = useUmkmData();
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);

    const { totalRevenue, totalProfit, totalProducts, totalSales, salesByDay, topProducts, filteredSales } = useMemo(() => getSummary(dateRange), [dateRange, getSummary]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatCurrency = (amount: number) => new Intl.NumberFormat(language === 'cn' ? 'zh-CN' : language, { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);

    const handleExport = () => {
        const wb = XLSX.utils.book_new();

        const headerStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4F46E5" } } };
        const currencyFormat = `Rp #,##0;[Red]Rp -#,##0`;
        const numberFormat = '#,##0';
        
        // --- 1. Summary Sheet ---
        const summaryData = [
            [{ v: t('dashboard_summary_title'), s: { font: { bold: true, sz: 16 }, alignment: { vertical: 'center', horizontal: 'center' } } }, null, null, null],
            [{ v: `(${t(dateFilterOptions.find(o => o.key === dateRange)!.labelKey)})`}, null, null, null],
            [],
            [{ v: t('dashboard_total_revenue'), s: { font: { bold: true } } }, { v: totalRevenue, t: 'n', s: { numFmt: currencyFormat } }, null, { v: t('dashboard_total_revenue_desc') }],
            [{ v: t('dashboard_total_profit'), s: { font: { bold: true } } }, { v: totalProfit, t: 'n', s: { numFmt: currencyFormat } }, null, { v: t('dashboard_total_profit_desc') }],
            [{ v: t('dashboard_products_sold'), s: { font: { bold: true } } }, { v: filteredSales.reduce((acc, s) => acc + s.quantity, 0), t: 'n', s: { numFmt: numberFormat } }, null, { v: t('dashboard_products_sold_desc', { totalSales }) }],
            [{ v: t('dashboard_total_products'), s: { font: { bold: true } } }, { v: totalProducts, t: 'n', s: { numFmt: numberFormat } }, null, { v: t('dashboard_total_products_desc') }],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }];
        wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 5 }, { wch: 30 }];


        // --- 2. Products Sheet ---
        const productsData = products.map(p => ({
            [t('products_table_name')]: p.name,
            [t('products_table_purchase_price')]: p.purchase_price,
            [t('products_table_selling_price')]: p.selling_price,
            [t('products_table_stock')]: p.stock,
            [t('products_table_potential_profit')]: p.selling_price - p.purchase_price
        }));
        const wsProducts = XLSX.utils.json_to_sheet(productsData);
        const productHeaders = Object.keys(productsData[0] || {});
        for (let i = 0; i < productHeaders.length; i++) {
            const cellRef = XLSX.utils.encode_cell({ c: i, r: 0 });
            if (wsProducts[cellRef]) wsProducts[cellRef].s = headerStyle;
            if (i === 1 || i === 2 || i === 4) { // Currency columns
                for (let j = 1; j <= products.length; j++) {
                     const dataCellRef = XLSX.utils.encode_cell({c: i, r: j});
                     if (wsProducts[dataCellRef]) wsProducts[dataCellRef].s = { numFmt: currencyFormat };
                }
            }
        }
        wsProducts['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 20 }];

        // --- 3. Sales Sheet ---
        const salesData = [...filteredSales].sort((a, b) => b.date.getTime() - a.date.getTime()).map(s => ({
            [t('sales_table_date')]: s.date,
            [t('sales_table_name')]: s.productName,
            [t('sales_table_quantity')]: s.quantity,
            [t('sales_table_total')]: s.total_price,
            [t('sales_table_profit')]: s.profit,
        }));
        const wsSales = XLSX.utils.json_to_sheet(salesData, { cellDates: true });
        const salesHeaders = Object.keys(salesData[0] || {});
         for (let i = 0; i < salesHeaders.length; i++) {
            const cellRef = XLSX.utils.encode_cell({ c: i, r: 0 });
            if (wsSales[cellRef]) wsSales[cellRef].s = headerStyle;
            if (i === 3 || i === 4) { // Currency columns
                for (let j = 1; j <= filteredSales.length; j++) {
                     const dataCellRef = XLSX.utils.encode_cell({c: i, r: j});
                     if (wsSales[dataCellRef]) wsSales[dataCellRef].s = { numFmt: currencyFormat };
                }
            }
         }
        wsSales['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 20 }];


        XLSX.utils.book_append_sheet(wb, wsSummary, t('sidebar_dashboard'));
        XLSX.utils.book_append_sheet(wb, wsProducts, t('sidebar_products'));
        XLSX.utils.book_append_sheet(wb, wsSales, t('sidebar_sales'));
        
        XLSX.writeFile(wb, `Laporan Bisnis - ${new Date().toLocaleDateString('id-ID')}.xlsx`);
    };
    
    const handleExportPdf = async () => {
        if (!dashboardRef.current || isPdfLoading) return;
        setIsPdfLoading(true);
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#f1f5f9' // Tailwind's slate-100 color
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Dashboard - ${new Date().toLocaleDateString('id-ID')}.pdf`);
        } catch (error) {
            console.error("Could not generate PDF", error);
            addToast('error', t('dashboard_export_pdf_error_title'), t('dashboard_export_pdf_error_message'));
        } finally {
            setIsPdfLoading(false);
        }
    };

    const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

    const localeForDates = language === 'cn' ? 'zh-CN' : language === 'en' ? 'en-GB' : 'id-ID';

    const dateFilterOptions: { key: DateRange; labelKey: string }[] = [
        { key: 'all', labelKey: 'dashboard_date_filter_all_time' },
        { key: 'today', labelKey: 'dashboard_date_filter_today' },
        { key: '7days', labelKey: 'dashboard_date_filter_7_days' },
        { key: '30days', labelKey: 'dashboard_date_filter_30_days' },
    ];
    const selectedLabel = dateFilterOptions.find(opt => opt.key === dateRange)!.labelKey;

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6">
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-slate-800">{t('dashboard_summary_title')}</h2>
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 text-slate-600 bg-white hover:text-indigo-600 p-2 rounded-lg transition-colors border border-slate-300 shadow-sm"
                            aria-haspopup="true"
                            aria-expanded={isFilterOpen}
                        >
                            <CalendarIcon className="w-5 h-5 text-slate-500" />
                            <span className="font-medium text-sm">{t(selectedLabel)}</span>
                            <svg className={`w-5 h-5 text-slate-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        {isFilterOpen && (
                          <motion.div 
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20 border border-slate-200">
                            {dateFilterOptions.map(opt => (
                              <a
                                key={opt.key}
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDateRange(opt.key);
                                  setIsFilterOpen(false);
                                }}
                                className={`block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${dateRange === opt.key ? 'font-bold text-indigo-600' : ''}`}
                              >
                                {t(opt.labelKey)}
                              </a>
                            ))}
                          </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        onClick={handleExport}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center gap-2"
                    >
                        <ExcelIcon className="w-5 h-5"/>
                        {t('dashboard_export_button')}
                    </motion.button>
                     <motion.button
                        onClick={handleExportPdf}
                        disabled={isPdfLoading}
                        whileHover={{ scale: isPdfLoading ? 1 : 1.05 }}
                        whileTap={{ scale: isPdfLoading ? 1 : 0.95 }}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 flex items-center gap-2 disabled:bg-red-400 disabled:cursor-wait"
                    >
                        {isPdfLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        ) : (
                           <PdfIcon className="w-5 h-5"/>
                        )}
                        {t('dashboard_export_pdf_button')}
                    </motion.button>
                </div>
            </motion.div>
            
            <div ref={dashboardRef} className="space-y-6">
                <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title={t('dashboard_total_revenue')} value={formatCurrency(totalRevenue)} description={t('dashboard_total_revenue_desc')}>
                        <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>
                    </StatCard>
                    <StatCard title={t('dashboard_total_profit')} value={formatCurrency(totalProfit)} description={t('dashboard_total_profit_desc')}>
                       <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    </StatCard>
                    <StatCard title={t('dashboard_products_sold')} value={filteredSales.reduce((acc, s) => acc + s.quantity, 0)} description={t('dashboard_products_sold_desc', { totalSales })}>
                        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
                    </StatCard>
                    <StatCard title={t('dashboard_total_products')} value={totalProducts} description={t('dashboard_total_products_desc')}>
                         <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                    </StatCard>
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-lg mb-4 text-slate-700">{t('dashboard_sales_analysis_title')}</h3>
                        {salesByDay.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salesByDay} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" tickFormatter={(value) => `Rp${Number(value)/1000}k`} fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis yAxisId="right" orientation="right" stroke="#16a34a" tickFormatter={(value) => `Rp${Number(value)/1000}k`} fontSize={12} tickLine={false} axisLine={false}/>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="penjualan" fill="#4f46e5" name={t('dashboard_sales_analysis_sales')} radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="keuntungan" fill="#16a34a" name={t('dashboard_sales_analysis_profit')} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-slate-500">{t('dashboard_no_sales_data')}</div>
                        )}
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-lg mb-4 text-slate-700">{t('dashboard_top_products_title')}</h3>
                        {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={topProducts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                    {topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number, name) => [t('dashboard_top_products_tooltip', { value }), name]} />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : (
                             <div className="flex items-center justify-center h-[300px] text-slate-500">{t('dashboard_no_top_products_data')}</div>
                        )}
                    </motion.div>
                </motion.div>

                 <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-lg mb-4 text-slate-700">{t('dashboard_activity_title')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('dashboard_activity_product')}</th>
                                    <th scope="col" className="px-6 py-3">{t('dashboard_activity_quantity')}</th>
                                    <th scope="col" className="px-6 py-3">{t('dashboard_activity_total')}</th>
                                    <th scope="col" className="px-6 py-3">{t('dashboard_activity_date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.length > 0 ? filteredSales.map((sale) => (
                                    <tr key={sale.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{sale.productName}</td>
                                        <td className="px-6 py-4">{sale.quantity}</td>
                                        <td className="px-6 py-4">{formatCurrency(sale.total_price)}</td>
                                        <td className="px-6 py-4">{sale.date.toLocaleDateString(localeForDates)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                       <td colSpan={4} className="text-center py-8 text-slate-500">{t('dashboard_no_sales_data')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;