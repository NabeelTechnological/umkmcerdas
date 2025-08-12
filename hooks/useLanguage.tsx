
import React, { createContext, useState, useContext, useMemo } from 'react';

// Define types for language and translations
type Language = 'id' | 'en' | 'cn';
type Translations = { [key: string]: { [lang in Language]: string } };
type Replacements = { [key: string]: string | number };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Replacements) => string;
}

// Translations object
const translations: Translations = {
  // Sidebar
  'sidebar_title': { id: 'UMKM Cerdas', en: 'Smart SME', cn: '智能中小微企业' },
  'sidebar_dashboard': { id: 'Dashboard', en: 'Dashboard', cn: '仪表板' },
  'sidebar_products': { id: 'Produk', en: 'Products', cn: '产品' },
  'sidebar_sales': { id: 'Penjualan', en: 'Sales', cn: '销售' },
  'sidebar_advisor': { id: 'AI Advisor', en: 'AI Advisor', cn: 'AI顾问' },
  'sidebar_settings': { id: 'Pengaturan', en: 'Settings', cn: '设置' },
  'sidebar_user_role': { id: 'Pemilik Toko', en: 'Store Owner', cn: '店主' },
  'sidebar_logout': { id: 'Keluar', en: 'Logout', cn: '登出' },

  // Header
  'header_dashboard': { id: 'Dashboard Ringkasan', en: 'Summary Dashboard', cn: '摘要仪表板' },
  'header_products': { id: 'Manajemen Produk', en: 'Product Management', cn: '产品管理' },
  'header_sales': { id: 'Riwayat Penjualan', en: 'Sales History', cn: '销售历史' },
  'header_advisor': { id: 'Advisor Bisnis AI', en: 'AI Business Advisor', cn: 'AI商业顾问' },
  'header_settings': { id: 'Pengaturan Akun', en: 'Account Settings', cn: '账户设置' },
  
  // Auth Page
  'auth_login_title': { id: 'Selamat Datang Kembali', en: 'Welcome Back', cn: '欢迎回来' },
  'auth_login_subtitle': { id: 'Masuk untuk mengelola bisnis Anda.', en: 'Sign in to manage your business.', cn: '登录以管理您的业务。' },
  'auth_register_title': { id: 'Buat Akun Baru', en: 'Create a New Account', cn: '创建新账户' },
  'auth_register_subtitle': { id: 'Mulai perjalanan bisnis Anda bersama kami.', en: 'Start your business journey with us.', cn: '与我们一起开启您的商业之旅。' },
  'auth_name_label': { id: 'Nama Lengkap', en: 'Full Name', cn: '全名' },
  'auth_email_label': { id: 'Email', en: 'Email', cn: '电子邮件' },
  'auth_password_label': { id: 'Kata Sandi', en: 'Password', cn: '密码' },
  'auth_login_button': { id: 'Masuk', en: 'Sign In', cn: '登录' },
  'auth_register_button': { id: 'Daftar', en: 'Sign Up', cn: '注册' },
  'auth_to_register_prompt': { id: 'Belum punya akun?', en: 'Don\'t have an account?', cn: '还没有账户？' },
  'auth_to_register_link': { id: 'Daftar di sini', en: 'Sign up here', cn: '在此注册' },
  'auth_to_login_prompt': { id: 'Sudah punya akun?', en: 'Already have an account?', cn: '已经有账户了？' },
  'auth_to_login_link': { id: 'Masuk di sini', en: 'Sign in here', cn: '在此登录' },
  'auth_error_generic': { id: 'Terjadi kesalahan. Silakan coba lagi.', en: 'An error occurred. Please try again.', cn: '发生错误。请再试一次。' },
  'auth_error_invalid_credentials': { id: 'Email atau kata sandi salah.', en: 'Invalid email or password.', cn: '无效的电子邮件或密码。' },
  'auth_error_email_exists': { id: 'Email ini sudah terdaftar.', en: 'This email is already registered.', cn: '此电子邮件已被注册。' },
  'auth_error_weak_password': { id: 'Kata sandi harus minimal 6 karakter.', en: 'Password must be at least 6 characters.', cn: '密码必须至少为6个字符。' },
  'auth_slogan_title': { id: 'Transformasi Bisnis Anda Dimulai Di Sini', en: 'Your Business Transformation Starts Here', cn: '您的业务转型始于此' },
  'auth_slogan_subtitle': { id: 'Kelola, analisis, dan kembangkan usaha Anda dengan alat yang tepat.', en: 'Manage, analyze, and grow your business with the right tools.', cn: '使用正确的工具管理、分析和发展您的业务。' },
  'auth_or_separator': { id: 'ATAU', en: 'OR', cn: '或者' },
  'auth_google_button': { id: 'Masuk dengan Google', en: 'Sign in with Google', cn: '使用Google登录' },
  'google_auth_modal_title': { id: 'Pilih Akun', en: 'Choose an Account', cn: '选择一个账户' },
  'google_auth_modal_subtitle': { id: 'untuk melanjutkan ke UMKM Cerdas', en: 'to continue to Smart SME', cn: '以继续访问 智能中小微企业' },

  // Dashboard Page
  'dashboard_export_button': { id: 'Ekspor Laporan', en: 'Export Report', cn: '导出报告' },
  'dashboard_export_pdf_button': { id: 'Ekspor PDF', en: 'Export PDF', cn: '导出PDF' },
  'dashboard_export_pdf_error_title': { id: 'Ekspor Gagal', en: 'Export Failed', cn: '导出失败' },
  'dashboard_export_pdf_error_message': { id: 'Tidak dapat membuat laporan PDF saat ini.', en: 'Could not generate PDF report at this time.', cn: '目前无法生成PDF报告。' },
  'dashboard_summary_title': { id: 'Ringkasan Kinerja', en: 'Performance Summary', cn: '业绩摘要' },
  'dashboard_date_filter_title': { id: 'Periode Waktu', en: 'Time Period', cn: '时间段' },
  'dashboard_date_filter_today': { id: 'Hari Ini', en: 'Today', cn: '今天' },
  'dashboard_date_filter_7_days': { id: '7 Hari Terakhir', en: 'Last 7 Days', cn: '过去7天' },
  'dashboard_date_filter_30_days': { id: '30 Hari Terakhir', en: 'Last 30 Days', cn: '过去30天' },
  'dashboard_date_filter_all_time': { id: 'Semua Waktu', en: 'All Time', cn: '所有时间' },
  'dashboard_total_revenue': { id: 'Total Pendapatan', en: 'Total Revenue', cn: '总收入' },
  'dashboard_total_revenue_desc': { id: 'Dari semua penjualan', en: 'From all sales', cn: '来自所有销售' },
  'dashboard_total_profit': { id: 'Total Keuntungan', en: 'Total Profit', cn: '总利润' },
  'dashboard_total_profit_desc': { id: 'Pendapatan dikurangi modal', en: 'Revenue minus cost', cn: '收入减去成本' },
  'dashboard_products_sold': { id: 'Produk Terjual', en: 'Products Sold', cn: '已售产品' },
  'dashboard_products_sold_desc': { id: 'Dari {totalSales} transaksi', en: 'From {totalSales} transactions', cn: '来自 {totalSales} 笔交易' },
  'dashboard_total_products': { id: 'Jumlah Produk', en: 'Total Products', cn: '产品总数' },
  'dashboard_total_products_desc': { id: 'Jenis produk di inventaris', en: 'Product types in inventory', cn: '库存中的产品类型' },
  'dashboard_sales_analysis_title': { id: 'Analisis Penjualan & Keuntungan', en: 'Sales & Profit Analysis', cn: '销售与利润分析' },
  'dashboard_sales_analysis_sales': { id: 'Penjualan', en: 'Sales', cn: '销售额' },
  'dashboard_sales_analysis_profit': { id: 'Keuntungan', en: 'Profit', cn: '利润' },
  'dashboard_no_sales_data': { id: 'Belum ada data penjualan untuk periode ini.', en: 'No sales data for this period yet.', cn: '此期间暂无销售数据。' },
  'dashboard_top_products_title': { id: 'Produk Terlaris', en: 'Top Selling Products', cn: '最畅销产品' },
  'dashboard_top_products_tooltip': { id: '{value} unit terjual', en: '{value} units sold', cn: '售出 {value} 件' },
  'dashboard_no_top_products_data': { id: 'Belum ada data produk terlaris untuk periode ini.', en: 'No top selling products data for this period yet.', cn: '此期间暂无最畅销产品数据。' },
  'dashboard_activity_title': { id: 'Aktivitas Penjualan', en: 'Sales Activity', cn: '销售活动' },
  'dashboard_activity_product': { id: 'Produk', en: 'Product', cn: '产品' },
  'dashboard_activity_quantity': { id: 'Jumlah', en: 'Quantity', cn: '数量' },
  'dashboard_activity_total': { id: 'Total Harga', en: 'Total Price', cn: '总价' },
  'dashboard_activity_date': { id: 'Tanggal', en: 'Date', cn: '日期' },

  // Products Page
  'products_title': { id: 'Daftar Produk', en: 'Product List', cn: '产品列表' },
  'products_add_button': { id: 'Tambah Produk', en: 'Add Product', cn: '添加产品' },
  'products_table_name': { id: 'Nama Produk', en: 'Product Name', cn: '产品名称' },
  'products_table_purchase_price': { id: 'Harga Beli', en: 'Purchase Price', cn: '采购价格' },
  'products_table_selling_price': { id: 'Harga Jual', en: 'Selling Price', cn: '销售价格' },
  'products_table_stock': { id: 'Stok', en: 'Stock', cn: '库存' },
  'products_table_potential_profit': { id: 'Potensi Keuntungan', en: 'Potential Profit', cn: '潜在利润' },
  'products_table_actions': { id: 'Aksi', en: 'Actions', cn: '操作' },
  'products_edit_button': { id: 'Edit Produk', en: 'Edit Product', cn: '编辑产品' },
  'products_delete_button': { id: 'Hapus Produk', en: 'Delete Product', cn: '删除产品' },
  'products_modal_title': { id: 'Tambah Produk Baru', en: 'Add New Product', cn: '添加新产品' },
  'products_modal_edit_title': { id: 'Edit Produk', en: 'Edit Product', cn: '编辑产品' },
  'products_modal_name_label': { id: 'Nama Produk', en: 'Product Name', cn: '产品名称' },
  'products_modal_purchase_price_label': { id: 'Harga Beli (Modal)', en: 'Purchase Price (Cost)', cn: '采购价格（成本）' },
  'products_modal_selling_price_label': { id: 'Harga Jual', en: 'Selling Price', cn: '销售价格' },
  'products_modal_stock_label': { id: 'Stok Awal', en: 'Initial Stock', cn: '初始库存' },
  'products_modal_cancel_button': { id: 'Batal', en: 'Cancel', cn: '取消' },
  'products_modal_save_button': { id: 'Simpan', en: 'Save', cn: '保存' },
  'products_form_error': { id: 'Harap isi semua data produk dengan benar.', en: 'Please fill all product data correctly.', cn: '请正确填写所有产品数据。' },
  
  // Sales Page
  'sales_title': { id: 'Riwayat Penjualan', en: 'Sales History', cn: '销售历史' },
  'sales_add_button': { id: 'Catat Penjualan', en: 'Record Sale', cn: '记录销售' },
  'sales_table_date': { id: 'Tanggal', en: 'Date', cn: '日期' },
  'sales_table_name': { id: 'Nama Produk', en: 'Product Name', cn: '产品名称' },
  'sales_table_quantity': { id: 'Jumlah', en: 'Quantity', cn: '数量' },
  'sales_table_total': { id: 'Total Penjualan', en: 'Total Sale', cn: '销售总额' },
  'sales_table_profit': { id: 'Keuntungan', en: 'Profit', cn: '利润' },
  'sales_modal_title': { id: 'Catat Penjualan Baru', en: 'Record New Sale', cn: '记录新销售' },
  'sales_modal_edit_title': { id: 'Edit Penjualan', en: 'Edit Sale', cn: '编辑销售' },
  'sales_modal_product_label': { id: 'Produk', en: 'Product', cn: '产品' },
  'sales_modal_quantity_label': { id: 'Jumlah Terjual', en: 'Quantity Sold', cn: '销售数量' },
  'sales_modal_cancel_button': { id: 'Batal', en: 'Cancel', cn: '取消' },
  'sales_modal_save_button': { id: 'Simpan', en: 'Save', cn: '保存' },
  'sales_form_error': { id: 'Harap pilih produk dan masukkan jumlah yang valid.', en: 'Please select a product and enter a valid quantity.', cn: '请选择产品并输入有效的数量。' },
  'sales_insufficient_stock': { id: 'Stok tidak cukup untuk produk {productName}. Sisa stok: {stock}', en: 'Insufficient stock for {productName}. Remaining stock: {stock}', cn: '{productName} 库存不足。剩余库存: {stock}' },
  'sales_stock_option': { id: 'Stok: {stock}', en: 'Stock: {stock}', cn: '库存: {stock}' },
  'sales_delete_confirm_title': { id: 'Hapus Catatan Penjualan?', en: 'Delete Sales Record?', cn: '删除销售记录?' },
  'sales_delete_confirm_message': { id: 'Anda yakin ingin menghapus transaksi ini? Stok produk terkait akan dikembalikan.', en: 'Are you sure you want to delete this transaction? The related product stock will be restored.', cn: '您确定要删除此交易吗？相关产品库存将会恢复。' },

  // Advisor Page
  'advisor_initial_message': { id: 'Halo! Saya adalah advisor bisnis AI Anda. Tanyakan apa saja tentang data bisnis Anda, misalnya "Produk apa yang paling menguntungkan?" atau "Beri saya ide marketing untuk meningkatkan penjualan Kopi".', en: 'Hello! I am your AI business advisor. Ask me anything about your business data, for example "Which product is most profitable?" or "Give me marketing ideas to increase sales of Coffee".', cn: '您好！我是您的AI业务顾问。您可以问我任何关于您业务数据的问题，例如“哪个产品最赚钱？”或“给我一些增加咖啡销量的营销建议”。' },
  'advisor_error_message': { id: 'Maaf, terjadi kesalahan saat menghubungi AI. Coba lagi nanti.', en: 'Sorry, an error occurred while contacting the AI. Please try again later.', cn: '抱歉，联系AI时发生错误。请稍后再试。' },
  'advisor_input_placeholder': { id: 'Ketik pertanyaan Anda di sini...', en: 'Type your question here...', cn: '在此输入您的问题...' },

  // Settings Page
  'settings_profile_title': { id: 'Foto Profil', en: 'Profile Picture', cn: '个人资料照片' },
  'settings_profile_button': { id: 'Ubah Foto', en: 'Change Photo', cn: '更换照片' },
  'settings_user_info_title': { id: 'Informasi Pengguna', en: 'User Information', cn: '用户信息' },
  'settings_user_info_button': { id: 'Simpan Perubahan', en: 'Save Changes', cn: '保存更改' },
  'settings_password_title': { id: 'Ubah Kata Sandi', en: 'Change Password', cn: '更改密码' },
  'settings_password_current_label': { id: 'Kata Sandi Saat Ini', en: 'Current Password', cn: '当前密码' },
  'settings_password_new_label': { id: 'Kata Sandi Baru', en: 'New Password', cn: '新密码' },
  'settings_password_confirm_label': { id: 'Konfirmasi Kata Sandi Baru', en: 'Confirm New Password', cn: '确认新密码' },
  'settings_password_button': { id: 'Ubah Kata Sandi', en: 'Change Password', cn: '更改密码' },
  'settings_avatar_modal_title': { id: 'Pilih Avatar Baru', en: 'Select New Avatar', cn: '选择新头像' },
  'settings_profile_update_success_title': { id: 'Profil Diperbarui', en: 'Profile Updated', cn: '个人资料已更新' },
  'settings_profile_update_success_message': { id: 'Informasi akun Anda telah berhasil diperbarui.', en: 'Your account information has been updated successfully.', cn: '您的帐户信息已成功更新。' },
  'settings_password_update_success_title': { id: 'Kata Sandi Diperbarui', en: 'Password Updated', cn: '密码已更新' },
  'settings_password_update_success_message': { id: 'Kata sandi Anda telah berhasil diubah.', en: 'Your password has been changed successfully.', cn: '您的密码已成功更改。' },
  'settings_avatar_update_success_title': { id: 'Avatar Diperbarui', en: 'Avatar Updated', cn: '头像已更新' },
  'settings_avatar_update_success_message': { id: 'Foto profil Anda telah berhasil diubah.', en: 'Your profile picture has been changed successfully.', cn: '您的个人资料照片已成功更改。' },
  'settings_password_incorrect': { id: 'Kata sandi saat ini yang Anda masukkan salah.', en: 'The current password you entered is incorrect.', cn: '您输入的当前密码不正确。' },
  'settings_password_mismatch': { id: 'Kata sandi baru dan konfirmasi tidak cocok.', en: 'New password and confirmation do not match.', cn: '新密码和确认密码不匹配。' },
  
  // Generic & Toasts
  'login_success_title': { id: 'Login Berhasil', en: 'Login Successful', cn: '登录成功' },
  'login_success_message': { id: 'Selamat datang kembali, {name}!', en: 'Welcome back, {name}!', cn: '欢迎回来，{name}！' },
  'register_success_title': { id: 'Pendaftaran Berhasil', en: 'Registration Successful', cn: '注册成功' },
  'register_success_message': { id: 'Selamat datang, {name}! Akun Anda telah dibuat.', en: 'Welcome, {name}! Your account has been created.', cn: '欢迎，{name}！您的帐户已创建。' },
  'form_error_title': { id: 'Data Tidak Lengkap', en: 'Incomplete Data', cn: '数据不完整' },
  'delete_confirm_title': { id: 'Konfirmasi Penghapusan', en: 'Confirm Deletion', cn: '确认删除' },
  'delete_confirm_button': { id: 'Ya, Hapus', en: 'Yes, Delete', cn: '是的，删除' },
  'products_delete_confirm_message': { id: 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.', en: 'Are you sure you want to delete this product? This action cannot be undone.', cn: '您确定要删除此产品吗？此操作无法撤销。' },
  'delete_error_title': { id: 'Gagal Menghapus', en: 'Deletion Failed', cn: '删除失败' },
  'delete_error_has_sales': { id: 'Produk ini tidak dapat dihapus karena memiliki riwayat penjualan.', en: 'This product cannot be deleted as it has a sales history.', cn: '该产品因有销售历史而无法删除。' },
  'delete_success_title': { id: 'Berhasil Dihapus', en: 'Deleted Successfully', cn: '删除成功' },
  'products_delete_success_message': { id: 'Produk telah dihapus dari daftar Anda.', en: 'The product has been removed from your list.', cn: '产品已从您的列表中删除。' },
  'products_add_success_title': { id: 'Produk Ditambahkan', en: 'Product Added', cn: '产品已添加' },
  'products_add_success_message': { id: 'Produk "{name}" berhasil ditambahkan.', en: 'Product "{name}" was successfully added.', cn: '产品“{name}”已成功添加。' },
  'products_edit_success_title': { id: 'Produk Diperbarui', en: 'Product Updated', cn: '产品已更新' },
  'products_edit_success_message': { id: 'Produk "{name}" berhasil diperbarui.', en: 'Product "{name}" was successfully updated.', cn: '产品“{name}”已成功更新。' },
  'sales_add_success_title': { id: 'Penjualan Dicatat', en: 'Sale Recorded', cn: '销售已记录' },
  'sales_add_success_message': { id: 'Transaksi baru telah berhasil dicatat.', en: 'The new transaction has been recorded successfully.', cn: '新交易已成功记录。' },
  'sales_edit_success_title': { id: 'Penjualan Diperbarui', en: 'Sale Updated', cn: '销售已更新' },
  'sales_edit_success_message': { id: 'Data transaksi telah berhasil diperbarui.', en: 'The transaction data has been successfully updated.', cn: '交易数据已成功更新。' },
  'sales_delete_success_title': { id: 'Penjualan Dihapus', en: 'Sale Deleted', cn: '销售已删除' },
  'sales_delete_success_message': { id: 'Catatan penjualan telah dihapus dan stok dikembalikan.', en: 'The sales record has been deleted and stock restored.', cn: '销售记录已删除，库存已恢复。' },
  'sales_insufficient_stock_title': { id: 'Stok Tidak Cukup', en: 'Insufficient Stock', cn: '库存不足' },

  // Search
  'search_placeholder': { id: 'Cari...', en: 'Search...', cn: '搜索...' },

  // Empty State
  'empty_state_no_products_title': { id: 'Anda Belum Punya Produk', en: 'You Have No Products Yet', cn: '您还没有任何产品' },
  'empty_state_no_products_message': { id: 'Mulai dengan menambahkan produk pertama Anda untuk melihatnya di sini.', en: 'Get started by adding your first product to see it here.', cn: '从添加您的第一个产品开始，以便在此处查看。' },
  'empty_state_no_sales_title': { id: 'Belum Ada Riwayat Penjualan', en: 'No Sales History Yet', cn: '尚无销售历史' },
  'empty_state_no_sales_message': { id: 'Setelah Anda mencatat penjualan, riwayatnya akan muncul di sini.', en: 'Once you record a sale, its history will appear here.', cn: '记录销售后，其历史记录将显示在此处。' },
  'empty_state_no_results_title': { id: 'Hasil Tidak Ditemukan', en: 'No Results Found', cn: '未找到结果' },
  'empty_state_no_results_message': { id: 'Pencarian Anda tidak cocok dengan data apapun. Coba kata kunci yang berbeda.', en: 'Your search did not match any data. Try a different keyword.', cn: '您的搜索与任何数据都不匹配。请尝试其他关键字。' },
  'empty_state_clear_search': { id: 'Hapus Filter Pencarian', en: 'Clear Search Filter', cn: '清除搜索筛选' },
};


const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('id');

    const t = (key: string, replacements?: Replacements): string => {
        let translation = translations[key]?.[language] || key;
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
            });
        }
        return translation;
    };

    const value = useMemo(() => ({
        language,
        setLanguage,
        t
    }), [language]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};