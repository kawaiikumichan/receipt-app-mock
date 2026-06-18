import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { inventory, urgentItems, settings } = req.body;

    if (!inventory) {
      return res.status(400).json({ error: 'Missing inventory in request body' });
    }

    const familySize = settings?.familySize || 2;
    const maxCookingTime = settings?.maxCookingTime || 30;
    const planDays = settings?.planDays || 1; // Currently unused in prompt for 1 day, but ready

    // Create a compact representation of inventory for the prompt
    const inventoryList = inventory.map((i: any) => 
      `- ${i.name} (Key: ${i.ingredientKey || i.name}): ${i.quantity}${i.unit} (期限: ${i.actualExpiryDate || i.estimatedExpiryDate || '不明'})`
    ).join('\n');

    const urgentList = urgentItems && urgentItems.length > 0 
      ? urgentItems.map((i: any) => `- ${i.name} (Key: ${i.ingredientKey || i.name})`).join('\n')
      : '特になし';

    const prompt = `
あなたはプロの献立提案AIです。
ユーザーの現在の食材在庫と設定に基づいて、最適なレシピを提案してください。
提案するレシピ数は ${planDays * 3} 品としてください。

【ユーザー設定】
- 家族の人数: ${familySize}人
- 最大調理時間: ${maxCookingTime}分

【現在の在庫】
${inventoryList || '在庫なし'}

【優先して消費すべき食材 (賞味期限間近)】
${urgentList}

【AIへの最優先事項 (以下の順序で遵守すること)】
1. 賞味期限が近い食材（上記優先食材）を消費すること
2. 在庫活用率を最大化すること
3. 買い足し量（missingIngredients）を最小化すること
4. 設定された調理時間内に収めること
5. 栄養バランスを考慮すること

【レシピ生成とレシピ管理の分離ルール】
詳細な調理手順は出力しないでください。レシピ名、調理時間、提案理由、材料リスト（在庫と買い足しで分離）、およびスコアのみを出力してください。

以下のJSONスキーマに従い、JSON配列を出力してください。
マークダウンのコードブロック(\`\`\`json)などは不要です。そのままJSON文字列のみを返してください。

[
  {
    "id": "一意の英数字ID",
    "name": "レシピ名",
    "title": "レシピ名 (nameと同じ)",
    "image": "", // 画像URLがない場合は空文字
    "time": 調理時間(数値, 分),
    "matchScore": 総合スコア(0-100),
    "wasteReductionScore": フードロス削減スコア(0-100),
    "inventoryUsageScore": 在庫活用率スコア(0-100),
    "shoppingNeedScore": 買い足し必要度スコア(0-100, 少ない方が高スコアでも可だが、一貫させること),
    "reason": "なぜこのレシピを提案したかの理由 (例: 賞味期限が近い玉ねぎを消費しつつ...)",
    "baseServings": ${familySize},
    "availableIngredients": [
      {
        "ingredientKey": "在庫のKeyと完全に一致させること",
        "name": "表示名",
        "quantity": 消費量(数値),
        "unit": "単位"
      }
    ],
    "missingIngredients": [
      {
        "ingredientKey": "一般的な食材名",
        "name": "表示名",
        "quantity": 必要量(数値),
        "unit": "単位"
      }
    ]
  }
]

Output JSON ONLY, no markdown formatting.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let text = response.text || '';
    
    // Robust JSON extraction
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('JSON array not found in the response text: ' + text.substring(0, 100));
    }

    const parsedJson = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsedJson);
  } catch (error: any) {
    console.error('Error suggesting recipes:', error);
    return res.status(500).json({ 
      error: 'API Error', 
      details: error?.message || String(error)
    });
  }
}
