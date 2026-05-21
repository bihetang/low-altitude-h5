export default async function handler(request) {
 // 设置 CORS 头
 const corsHeaders = {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'POST, OPTIONS',
 'Access-Control-Allow-Headers': 'Content-Type',
 };

 // 处理预检请求
 if (request.method === 'OPTIONS') {
 return new Response(null, { status: 200, headers: corsHeaders });
 }

 if (request.method !== 'POST') {
 return new Response(JSON.stringify({ error: 'Method not allowed' }), {
 status: 405,
 headers: { ...corsHeaders, 'Content-Type': 'application/json' }
 });
 }

 try {
 const { message } = await request.json();

 if (!message) {
 return new Response(JSON.stringify({ error: 'Message is required' }), {
 status: 400,
 headers: { ...corsHeaders, 'Content-Type': 'application/json' }
 });
 }

 const systemPrompt = `你是低空智联网技术专业的智能招生助手，代号"低空向导"。
你的职责：
1. 回答关于低空智联网技术专业的问题
2. 介绍专业课程、就业方向、薪资待遇
3. 解答家长和考生的疑虑

专业信息：
- 专业代码：510311
- 学制：3年专科
- 核心技术：无人机 + 物联网 + AI
- 就业方向：无人机飞手、物联网工程师、AI应用开发、低空经济运营
- 薪资范围：应届6k-9k，3-5年15k+
- 落地院校：昆明航空职业学院

回答要求：
- 热情专业，像学长/学姐一样亲切
- 用具体数据和案例说话
- 每次回答控制在200字以内
- 适当用emoji增加亲和力`;

 const response = await fetch('https://api.deepseek.com/chat/completions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
 },
 body: JSON.stringify({
 model: 'deepseek-chat',
 messages: [
 { role: 'system', content: systemPrompt },
 { role: 'user', content: message }
 ],
 max_tokens: 500,
 temperature: 0.7
 })
 });

 if (!response.ok) {
 throw new Error(`DeepSeek API error: ${response.status}`);
 }

 const data = await response.json();
 const reply = data.choices[0]?.message?.content || '抱歉，我暂时无法回答';

 return new Response(JSON.stringify({ reply }), {
 status: 200,
 headers: { ...corsHeaders, 'Content-Type': 'application/json' }
 });

 } catch (error) {
 console.error('Chat error:', error);
 return new Response(JSON.stringify({ error: '服务器内部错误' }), {
 status: 500,
 headers: { ...corsHeaders, 'Content-Type': 'application/json' }
 });
 }
}
