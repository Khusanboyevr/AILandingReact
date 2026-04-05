import * as math from 'mathjs';

// =====================================================
// GOOGLE GEMINI API (gemini-1.5-flash) — FREE TIER
// Get your free key at: https://aistudio.google.com/apikey
// =====================================================
const GEMINI_API_KEY = 'AIzaSyB_omi4biHxLsFdOLfPQ-y5aT4JYgVkXh4';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Structured prompt — step by step + Uzbek
const buildPrompt = (formula, localResult) => {
  let prompt = `Quyidagi matematik formulani yoki masalani o'zbek tilida qadamma-qadam yeching va tushuntiring:\n\n"${formula}"\n\n`;

  if (localResult !== null) {
    prompt += `MathJS hisob-kitobi bo'yicha natija: ${localResult}\n\n`;
  }

  prompt += `Javobni quyidagi formatda JSON shaklida qaytar (faqat JSON, boshqa matn yo'q):
{
  "steps": [
    "1-qadam: ...",
    "2-qadam: ...",
    "3-qadam: ..."
  ],
  "result": "Yakuniy natija: ...",
  "explanation": "Qisqacha tushuntirish...",
  "tip": "Maslahat yoki qo'shimcha ma'lumot (ixtiyoriy)"
}`;

  return prompt;
};

// Format the AI response for the UI
const formatAIResponse = (json, formula, localResult) => {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    const lines = [];

    lines.push(`📐 **Formula:** \`${formula}\``);
    lines.push('');

    if (data.steps && data.steps.length > 0) {
      lines.push('**🔢 Yechish jarayoni:**');
      data.steps.forEach(step => lines.push(`• ${step}`));
      lines.push('');
    }

    if (data.result) {
      lines.push(`**✅ ${data.result}**`);
      lines.push('');
    }

    if (data.explanation) {
      lines.push(`**💡 Izoh:** ${data.explanation}`);
    }

    if (data.tip) {
      lines.push('');
      lines.push(`**📌 Maslahat:** ${data.tip}`);
    }

    return lines.join('\n');
  } catch {
    // If JSON parsing fails, return raw text
    return typeof json === 'string' ? json : JSON.stringify(json);
  }
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

    // === GOOGLE GEMINI AI ===
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY') {
      try {
        const response = await fetch(GEMINI_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: buildPrompt(formulaText, localResult) }]
            }]
          })
        });

        if (response.ok) {
          const json = await response.json();
          const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';

          // Try to extract JSON from code block if wrapped
          const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
          const cleanJson = jsonMatch[1].trim();

          const advice = formatAIResponse(cleanJson, formulaText, localResult);

          return {
            success: true,
            data: {
              prediction: {
                advice,
                status: 'online',
                status_label: 'Muvaffaqiyatli',
                recommendation: localResult !== null ? `Tez natija: ${localResult}` : 'AI tahlil yakunlandi.',
                gemini_response: '[Google Gemini 1.5 Flash ✅]'
              }
            }
          };
        }
      } catch (geminiErr) {
        console.warn('Gemini API xatosi, fallbackga o\'tilmoqda:', geminiErr.message);
      }
    }

    // === MATHJS OFFLINE FALLBACK ===
    if (localResult !== null) {
      const lines = [
        `📐 **Formula:** \`${formulaText}\``,
        '',
        `✅ **Natija: ${localResult}**`,
        '',
        `⚡ *MathJS v${math.version} bilan hisoblandi (oflayn)*`
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

    return {
      success: false,
      message: 'Formula hisoblashda xato yuz berdi. Formulani tekshirib qayta kiriting.',
      fieldErrors: {}
    };

  } catch (error) {
    console.error('Xato:', error);
    return { success: false, message: 'Kutilmagan xato yuz berdi.', fieldErrors: {} };
  }
};
