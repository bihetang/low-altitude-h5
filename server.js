const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DEEPSEEK_KEY = 'sk-52c65978365d48ed93233f16d57d6d4f';

const SYSTEM_PROMPT = `你是"低空向导"，昆明航空职业学院低空智联网技术专业(510311)的智能招生顾问。

说话规则：
- 极简直接，一句话能说清的不说两句
- 先给结论再解释，不堆砌废话
- 像一个靠谱的学长，不是销售
- 绝不编造数据，不确定就说不知道

专业核心信息：
- 专业代码510311，2026年首届招生
- 三技术融合：物联网(感知) + AI(决策) + 无人机(执行)
- 4大就业方向：低空交通管控、无人机运维、数据采集分析、智慧城市应用
- 薪资：应届专科6k-9k，3-5年15k+
- 核心证书：CAAC执照，三阶段考证路径
- 职业本科代码310305，可升本
- 云南特色：边境安防、高原农业、智慧旅游
- 低空经济2025年1.5万亿，2030年预计3.5万亿

只回答与本专业、低空经济、昆明航空职业学院相关的问题。其他问题礼貌拒绝。`;

function chatAPI(userMsg) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const options = {
      hostname: 'api.deepseek.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_KEY}`
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.choices[0].message.content);
        } catch (e) {
          reject(new Error(data));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon' };

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // API
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { message } = JSON.parse(body);
        const reply = await chatAPI(message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Static files
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);
  
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`低空向导H5: http://localhost:${PORT}`));
