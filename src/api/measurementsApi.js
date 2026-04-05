import * as math from 'mathjs';

// Format the AI response for the UI
const formatAIResponse = (text, formula, localResult) => {
  const lines = [];
  lines.push(`📐 **Formula:** \`${formula}\``);
  lines.push('');
  if (localResult !== null) {
    lines.push(`**✅ Natija:** ${localResult}`);
    lines.push('');
  }
  lines.push(`**💡 AI Yechimi / Tushuntirish:**\n${text}`);
  return lines.join('\n');
};

export const createMeasurement = async (data) => {
  try {
    const sensorData = data.sensor_data ? JSON.parse(data.sensor_data) : {};
    const formulaText = sensorData.formula || '';

    if (!formulaText.trim()) {
      return { success: false, message: 'Iltimos formula kiriting.', fieldErrors: {} };
    }

    console.log('🧮 Formula tahlil boshlanmoqda:', formulaText);

    // Fast local result using mathjs
    let localResult = null;
    try {
      localResult = math.evaluate(formulaText);
    } catch {
      // Not pure math — AI will handle it
    }

    // === GOOGLE GEMINI AI INTEGRATION ===
    let aiErrorMsg = null;
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error("API_KEY_MISSING");
      }

      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const pollPrompt = `Sen malakali matematika va AI yordamchisisan. 
Foydalanuvchi quyidagi matematik muammoni/formulani yubordi: "${formulaText}".
Agar bu kvadrat ifoda maksimumi / minimumi bo'lsa (masalan: y = -x^2 + 4x + 1), uning hosilasi yoki parabola uchi formulasi (-b/2a) orqali yechib, x va y ning qiymatlarini aniq ko'rsat.
Istalgan misolni qadamma-qadam, aniq va tushunarli o'zbek tilida yechib ber.
Sening vazifang nafaqat hisoblash, balki muammoni yechish uslubini tushuntirishdir.
${localResult !== null ? `Mening dastlabki hisobim bo'yicha natija: ${localResult} chiqdi. Buni tekshirib to'g'ri bo'lsa tasdiqla.` : ''}
Iltimos aniq qilib javobingni yoz.`;

      const result = await model.generateContent(pollPrompt);
      const response = await result.response;
      const pText = response.text();
      
      return {
        success: true,
        data: {
          prediction: {
             advice: formatAIResponse(pText, formulaText, localResult),
             status: 'online',
             status_label: 'Muvaffaqiyatli',
             recommendation: localResult !== null ? `Natija: ${localResult}` : 'AI tahlili yakunlandi',
             gemini_response: '[Google Gemini AI ✅]'
          }
        }
      };

    } catch (e) {
      console.warn("AI xatosi: ", e);
      if (e.message === "API_KEY_MISSING") {
        aiErrorMsg = "Gemini API kaliti topilmadi. Iltimos .env faylida VITE_GEMINI_API_KEY kiriting.";
      } else {
        aiErrorMsg = "AI serveriga ulanishda xatolik: " + e.message;
      }
    }

    // === MATHJS OFFLINE FALLBACK ===
    if (localResult !== null) {
      const lines = [
        `📐 **Formula:** \`${formulaText}\``,
        '',
        `✅ **Natija: ${localResult}**`,
        '',
        `⚡ *Faqat MathJS (offline) orqali hisoblandi, chunki AI tarmoqqa ulanmadi yoki xatolik yuz berdi.*`,
        aiErrorMsg ? `(❗ Xatolik: ${aiErrorMsg})` : ''
      ];
      return {
        success: true,
        data: {
          prediction: {
            advice: lines.join('\n'),
            status: 'online',
            status_label: 'Mahalliy hisob',
            recommendation: `Natija: ${localResult}`,
            gemini_response: '[MathJS — Offline]'
          }
        }
      };
    }

    // Agar hech qaysi o'xshamasa:
    return {
      success: false,
      message: aiErrorMsg || 'Formulani hisoblash uchun AI ulanishi amalga oshmadi. Iltimos formulani to\'g\'ri formatda yozing.',
      fieldErrors: {}
    };

  } catch (error) {
    console.error('Xato:', error);
    return { success: false, message: 'Kutilmagan xato yuz berdi.', fieldErrors: {} };
  }
};
