const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-52c65978365d48ed93233f16d57d6d4f';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: 'No message' });
  }

  try {
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是"低空向导"，昆明航空职业学院低空智联网技术专业(代码510311)的智能招生咨询助手。

核心信息：
- 专业：低空智联网技术，无人机+物联网+AI三技术融合
- 学校：昆明航空职业学院，2026年首届招生
- 就业：低空交通管控/无人机运维/数据采集分析/智慧城市应用，应届6k-9k，3-5年15k+
- 证书：CAAC执照(核心)、AOPA合格证、1+X物联网等20+证书
- 低空经济：2025年1.5万亿，2030年预计3.5万亿
- 云南特色：边境安防、高原农业、智慧旅游三大场景
- 升学：可升职业本科(无人机系统工程/物联网工程/人工智能)

回答规则：
1. 只回答与专业相关的问题（课程/就业/证书/升学/行业前景）
2. 回答简洁直接，不超过150字
3. 用口语化表达，像学长学姐在聊天
4. 不确定的信息说"建议联系招办确认"
5. 如果问其他话题，礼貌引导回专业问题`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，服务暂时不可用';
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ reply: '网络异常，请稍后重试' });
  }
}
