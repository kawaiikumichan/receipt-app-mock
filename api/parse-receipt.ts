import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    const prompt = `
以下のレシート画像を解析し、JSON形式でデータを出力してください。
JSONのスキーマは以下の通りです。必ずこの構造に従ってください。
マークダウンのコードブロック(\`\`\`json)などは不要です。そのままJSON文字列のみを返してください。

{
  "store_name": "店舗名（不明な場合は空文字）",
  "purchase_date": "購入日（YYYY-MM-DD形式、不明な場合は空文字）",
  "items": [
    {
      "name": "商品名",
      "category": "カテゴリ（以下のいずれか: meat, fish, vegetable, fruit, dairy, frozen, drink, pantry, seasoning, daily, other）",
      "quantity": 数量（数値、不明なら1）,
      "unit": "単位（個、パック、g、本、など）",
      "price": 価格（数値）,
      "expiry_date_estimate": "推定賞味期限（YYYY-MM-DD形式。購入日とカテゴリから常識的に推定。日用品など期限がないものは空文字）"
    }
  ]
}
`;

    // Extract mime type and base64 data
    const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image format' });
    }
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: data,
            mimeType: mimeType
          }
        }
      ]
    });

    let text = response.text || '';
    
    // Clean up potential markdown formatting
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsedJson = JSON.parse(text);
    return res.status(200).json(parsedJson);
  } catch (error: any) {
    console.error('Error parsing receipt:', error);
    return res.status(500).json({ error: 'Failed to parse receipt', details: error.message });
  }
}
