/**
 * ME:Verse AI 分析端點（OpenAI GPT 版本）
 *
 * Vercel Serverless Function（會自動部署到 /api/analyze）
 * 接收使用者紀錄資料，呼叫 OpenAI API 產生個人化分析
 *
 * 環境變數需求：
 *   OPENAI_API_KEY  — 在 Vercel Dashboard → Settings → Environment Variables 設定
 *
 * 預設使用 gpt-4o-mini（便宜、快、效果好），每次分析約 NT$0.05
 */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not configured',
      hint: '請到 Vercel Dashboard → Settings → Environment Variables 設定 OPENAI_API_KEY',
    });
  }

  try {
    const { records = [], profile = {}, missions = [], holland = {} } = req.body || {};

    const recordsText = records.slice(-10).map((r, i) => {
      const parts = [];
      if (r.date) parts.push(`日期：${r.date}`);
      if (r.discoveries?.length) parts.push(`發現：${r.discoveries.filter(Boolean).join('、')}`);
      if (r.interests?.length) parts.push(`興趣：${r.interests.filter(Boolean).join('、')}`);
      if (r.mood) parts.push(`心情：${r.mood}`);
      if (r.flowMoment) parts.push(`心流：${r.flowMoment}`);
      if (r.stuckPoint) parts.push(`卡關：${r.stuckPoint}`);
      if (r.expressionModes?.length) parts.push(`產出方式：${r.expressionModes.join('、')}`);
      if (r.schoolReflection) {
        const sr = r.schoolReflection;
        parts.push(`課業：生物${sr.生物}/10、國文${sr.國文}/10、數學${sr.數學}/10${sr.custom ? `、${sr.custom}${sr.customScore}/10` : ''}${sr.mood ? `（${sr.mood}）` : ''}`);
      }
      return `[紀錄 ${i + 1}] ${parts.join('；')}`;
    }).join('\n');

    const completedMissions = missions.filter(m => m.status === 'completed').map(m => m.title).join('、');
    const inProgressMissions = missions.filter(m => m.status === 'in-progress').map(m => m.title).join('、');

    const systemPrompt = `你是一個專為青少年設計的人格探索分析助理。你要根據使用者的紀錄，產生溫暖、具體、個人化的分析洞察。

重要原則：
1. 不要套用模板，每次分析都要根據實際輸入內容做出真正不同的結果
2. 用青少年聽得懂、能感受到「被看見」的語氣
3. 不要過於樂觀或敷衍，要誠實具體
4. 如果使用者紀錄很少或內容偏向特定主題，要忠實反映，不要硬塞無關內容

你必須以純 JSON 格式回應，不要有任何 markdown 包裝或其他文字。`;

    const userPrompt = `【使用者資料】
姓名：${profile.name || '使用者'}
年齡 / 年級：${profile.customAge ? `${profile.customAge} 歲` : (profile.grade || '未填')}
角色風格：${profile.style || '未設定'}

【最近紀錄（共 ${records.length} 筆）】
${recordsText || '（尚無紀錄）'}

【任務進度】
完成任務：${completedMissions || '（無）'}
進行中：${inProgressMissions || '（無）'}

【Holland 測驗】
${holland.current ? `當前分數：R${holland.current.R}、I${holland.current.I}、A${holland.current.A}、S${holland.current.S}、E${holland.current.E}、C${holland.current.C}` : '（尚未測驗）'}

請以以下 JSON 結構回應（純 JSON，不要 markdown 包裝）：
{
  "headline": "一句精準描述使用者狀態的洞察（30 字內，要根據實際輸入而不同）",
  "topInterests": ["興趣主題1", "興趣主題2", "興趣主題3"],
  "expressionModes": ["最常用的產出方式1", "方式2", "方式3"],
  "discoveries": ["本週發現1（具體、根據紀錄）", "本週發現2", "本週發現3"],
  "hiddenTraits": ["潛在特質1（深入觀察）", "特質2", "特質3"],
  "nextMissions": [
    {"title": "推薦任務1", "reason": "為什麼推薦", "difficulty": "low"},
    {"title": "推薦任務2", "reason": "為什麼推薦", "difficulty": "mid"}
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: 'OpenAI API error',
        detail: errText,
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    let insight = null;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      insight = JSON.parse(clean);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Failed to parse AI response as JSON',
        raw: text,
      });
    }

    return res.status(200).json({
      insight,
      model: data.model,
      usage: data.usage,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Server error',
      message: err.message,
    });
  }
}
