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
      "name": "string (商品名・表示名)",
      "ingredientKey": "string (標準化された食材名・検索キー。例: '玉ねぎ', '豚肉', '牛乳')",
      "category": "meat|fish|vegetable|fruit|dairy|frozen|drink|pantry|seasoning|daily|other",
      "quantity": "number",
      "unit": "string (個, g, パック, 本など)",
      "price": "number",
      "expiry_date_estimate": "YYYY-MM-DD (推定される賞味期限。不明な場合は空白)"
    }
  ]
}

【ingredientKeyのルール】
* 「淡路島産玉ねぎ」→「玉ねぎ」
* 「豚バラ肉」や「豚こま肉」→「豚肉」
* 「北海道牛乳」→「牛乳」
のように、レシピマッチングに使用できる一般的な食材名を指定してください。日用品の場合は商品名をそのまま使用して構いません。

Output JSON ONLY, no markdown formatting.
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
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON format not found in the response text: ' + text.substring(0, 100));
    }

    const parsedJson = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsedJson);
  } catch (error: any) {
    console.error('Error parsing receipt:', error);
    // Return the actual error message to the client for easier debugging
    return res.status(500).json({ 
      error: 'API Error', 
      details: error?.message || String(error)
    });
  }
}
