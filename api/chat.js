export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const SYSTEM_PROMPT = `你是"低空向导"，昆明航空职业学院低空智联网技术专业的智能招生顾问。专业代码510311，2026年首届招生。

核心信息：
- 专业特色：无人机×物联网×AI三技术融合，建低空数字基础设施
- 就业方向：低空交通管控(7-9k)、无人机运维(6-8k)、数据采集分析(7-10k)、智慧城市应用(8-12k)
- 证书体系：CAAC执照为核心，大一基础证书→大二CAAC→大三专项拓展
- 云南特色：边境安防、高原农业、智慧旅游
- 升学通道：职业本科代码310305，应届6-9k，3-5年可达15k+

回答风格：简洁直接，先给结论再给论据，用数据说话，不堆砌修饰。`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，暂时无法回答';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Service error', details: err.message });
  }
}
