export const onRequest = async (context) => {
 const { request, env } = context;
 const corsHeaders = {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'POST,OPTIONS',
 'Access-Control-Allow-Headers': 'Content-Type',
 };

 if (request.method === 'OPTIONS') {
 return new Response(null, { headers: corsHeaders });
 }

 if (request.method !== 'POST') {
 return Response.json({ reply: '请求方式错误' }, { status: 405, headers: corsHeaders });
 }

 let body;
 try {
 body = await request.json();
 } catch (e) {
 return Response.json({ reply: '请求格式错误' }, { status: 400, headers: corsHeaders });
 }

 const { message } = body || {};
 if (!message) {
 return Response.json({ reply: '请输入消息' }, { status: 400, headers: corsHeaders });
 }

 const API_KEY = env.DEEPSEEK_API_KEY;
 if (!API_KEY) {
 return Response.json({ reply: '⚠️ API密钥未配置' }, { status: 500, headers: corsHeaders });
 }

 const SYSTEM_PROMPT = `你是"低空向导"，昆明航空职业学院低空智联网技术专业的智能招生问答助手。
专业代码510311，2026年首届招生。
核心信息：
- 专业特色：无人机+物联网+AI三技术融合，建低空数字基础设施
- 就业方向：低空交通管制(7-9k)、无人机运维(6-8k)、数据采集分析(7-10k)、智慧城市应用(8-12k)
- 证书体系：CAAC执照为核心，大一基础证书→大二CAAC→大三专项拓展
- 云南特色：边境安防、高原农业、智慧旅游
- 升学通道：职教本科代码10305，应届7-9k，3-5年可至15k+
回答风格：简洁直接，先给结论再给论据，用数据说话，不堆砌修饰。`;

 try {
 const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${API_KEY}`,
 },
 body: JSON.stringify({
 model: 'deepseek-ai/DeepSeek-V3',
 messages: [
 { role: 'system', content: SYSTEM_PROMPT },
 { role: 'user', content: message },
 ],
 max_tokens: 500,
 temperature: 0.7,
 }),
 });

 const data = await response.json();

 if (!response.ok) {
 return Response.json(
 { reply: '⚠️ AI服务异常: ' + (data.error?.message || response.statusText) },
 { status: response.status, headers: corsHeaders }
 );
 }

 const reply = data.choices?.[0]?.message?.content;
 if (!reply || reply.trim() === '') {
 return Response.json({ reply: '（AI暂无回复，请换个问题试试）' }, { status: 200, headers: corsHeaders });
 }

 return Response.json({ reply: reply.trim() }, { status: 200, headers: corsHeaders });
 } catch (err) {
 return Response.json(
 { reply: '❌ 服务异常: ' + err.message },
 { status: 500, headers: corsHeaders }
 );
 }
};
