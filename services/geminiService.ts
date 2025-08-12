
import { GoogleGenAI } from "@google/genai";

// Ensure the API_KEY is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

// Function to format currency for display
const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Store translations for system prompts and errors
const serviceTranslations = {
    gemini_error: {
        id: 'Maaf, saya sedang mengalami kendala teknis. Silakan coba beberapa saat lagi.',
        en: 'Sorry, I am currently experiencing technical difficulties. Please try again in a few moments.',
        cn: '抱歉，我目前遇到技术问题。请稍后再试。',
    },
    system_instruction: {
        id: `Anda adalah seorang konsultan bisnis ahli dan ramah untuk pemilik UMKM di Indonesia.
Tugas Anda adalah menganalisis data bisnis yang diberikan dan menjawab pertanyaan pengguna dengan wawasan yang tajam, praktis, dan mudah dimengerti.
Selalu berkomunikasi dalam Bahasa Indonesia yang sopan dan profesional.
Gunakan data dari konteks untuk memberikan jawaban yang spesifik dan relevan.
Berikan saran yang bisa langsung diterapkan oleh pemilik usaha.
Format jawaban Anda agar mudah dibaca, gunakan poin-poin atau daftar bernomor jika perlu.`,
        en: `You are an expert and friendly business consultant for SME owners in Indonesia.
Your task is to analyze the provided business data and answer user questions with sharp, practical, and easy-to-understand insights.
Always communicate in polite and professional English.
Use the data from the context to provide specific and relevant answers.
Provide actionable advice for the business owner.
Format your answers for readability, using bullet points or numbered lists where appropriate.`,
        cn: `您是为印尼中小微企业主服务的专业且友好的商业顾问。
您的任务是分析所提供的业务数据，并以敏锐、实用且易于理解的见解回答用户的问题。
始终使用礼貌和专业的中文进行交流。
使用上下文中的数据来提供具体和相关的答案。
为企业主提供可行的建议。
请格式化您的答案以提高可读性，在适当时使用项目符号或编号列表。`
    }
};


export const askAdvisor = async (question: string, businessData: any, language: 'id' | 'en' | 'cn'): Promise<string> => {
    // Construct a detailed context string from the business data
    const { summary, products } = businessData;
    const context = `
        Analisis Data Bisnis UMKM (Data is in Indonesian Rupiah - IDR):

        Ringkasan Keuangan:
        - Total Pendapatan: ${formatCurrency(summary.totalRevenue)}
        - Total Keuntungan: ${formatCurrency(summary.totalProfit)}
        - Total Transaksi Penjualan: ${summary.totalSales}
        - Jumlah Jenis Produk: ${summary.totalProducts}

        Daftar Produk (Nama, Harga Beli, Harga Jual, Stok Sisa, Keuntungan per item):
        ${products.map((p: any) => 
            `- ${p.name}, Modal: ${formatCurrency(p.purchase_price)}, Jual: ${formatCurrency(p.selling_price)}, Stok: ${p.stock}, Untung: ${formatCurrency(p.selling_price - p.purchase_price)}`
        ).join('\n')}

        Data penjualan terkini dan produk terlaris juga tersedia dalam sistem.
    `;
    
    // Select the system instruction based on the chosen language
    const systemInstruction = `
${serviceTranslations.system_instruction[language]}
---
KONTEKS DATA (Gunakan data ini untuk jawabanmu):
${context}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: question,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        return serviceTranslations.gemini_error[language];
    }
};
