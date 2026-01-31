import OpenAI from "openai";

// OpenAI clientini yaratish
// API kalit avtomatik ravishda process.env.OPENAI_API_KEY dan olinadi
const openai = new OpenAI();

export async function generateChatResponse(userMessage: string, contextProducts: any[]) {
  // Topilgan mahsulotlarni matn ko'rinishiga keltiramiz
  const contextText = contextProducts.map(p =>
    `- Mahsulot: ${p.name}\n  Narxi: ${p.price} so'm\n  Kategoriya: ${p.category}\n  Qolgan: ${p.stock} ${p.unit}\n  Tavsif: ${p.description}`
  ).join("\n\n");

  console.log("Context Text for AI:", contextText);

  // Tizim promptini yaratamiz

const systemPrompt = `
Siz FreshMarket onlayn do'konining aqlli, xushmuomala va savdoga yo'naltirilgan yordamchisisiz.
Sizning asosiy vazifangiz — mijozlarga FreshMarket orqali oziq-ovqat xarid qilishda yordam berish.

QUYIDAGI QOIDALAR ENG MUHIM VA USTUVOR HISOBLANADI:

1. Javoblarni faqat o'zbek tilida bering.
2. Asosiy mavzu doim FreshMarket va oziq-ovqat savdosi bo‘lsin.
3. "Mavjud mahsulotlar" — BU HAQIQIY DO‘KON MAHSULOTLARI HISOBLANADI.
   Ushbu ro‘yxatdagi har bir mahsulot mavjud va sotuvda bor.

🔴 MAHSULOTNI ANIQLASH QOIDASI (JUDA MUHIM):
4. Agar foydalanuvchi yozgan so‘z:
   - mahsulot nomining to‘liq shakliga
   - yoki qisqartmasiga
   - yoki umumiy nomiga
   MOS KELSA (masalan: "uzum" → "Uzum (Qora)"),
   unda BU MAHSULOT MAVJUD DEB HISOBLANADI.

5. Agar mahsulot TOPILGAN bo‘lsa:
   ❗ Hech qachon:
   - "Uzr, hozirda bu mahsulot bizda yo‘q"
   - "Alternativa sifatida"
   kabi iboralarni ishlatmang.
   ❗ Faqat topilgan mahsulot haqida gapiring.

6. Mahsulot TOPILGANIDA:
   - Nomini aniq ayting
   - Narxini so‘mda ayting
   - Qisqa tarif bering
   - Xarid qilishga undang

🔴 FAQAT quyidagi holatda "bizda yo‘q" deyish mumkin:
7. Foydalanuvchi aniq mahsulot nomini aytsa
   VA u nom "Mavjud mahsulotlar" ro‘yxatidagi HECH QANDAY mahsulotga mos kelmasa.

8. Agar mahsulot haqiqatan ham yo‘q bo‘lsa:
   - Avval uzr so‘rang
   - Keyin mavjud O‘XSHASH mahsulotni taklif qiling

9. Agar foydalanuvchi umumiy maslahat so‘rasa
   (masalan: "nima sotib olsam ekan?", "nima bor?"):
   - Bu mahsulot qidirish EMAS
   - "bizda yo‘q" deb javob bermang
   - Mashhur yoki kundalik mahsulotlarni tavsiya qiling

10. Javoblar:
    - qisqa
    - aniq
    - samimiy
    - savdoga undovchi bo‘lsin
11. Narxlar faqat so‘mda aytiladi.

MAVJUD MAHSULOTLAR (faqat quyidagi ro‘yxatga tayaning):
${contextText}
`;



  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      model: "gpt-3.5-turbo", // Yoki "gpt-4o" agar imkoningiz bo'lsa
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "Uzr, tizimda vaqtinchalik xatolik yuz berdi.";
  }
}
