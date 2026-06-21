const REPO = 'mrdeng33/imperial-health';
const DATA_PATH = 'data.json';

type WorkerEnv = Env & {
  GITHUB_TOKEN: string;
};

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#0f1117">
<title>🏯 御医 · 晨检</title>
<style>
:root{--bg:#0f1117;--card:#1a1d28;--gold:#c9a96e;--text:#e2e8f0;--muted:#94a3b8;--red:#f87171;--green:#4ade80;--amber:#fbbf24;--border:rgba(201,169,110,.15);--r:14px}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;min-height:100vh;background:var(--bg)}
body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Noto Sans SC',sans-serif;color:var(--text);max-width:430px;margin:0 auto;padding:0 0 40px}
header{padding:20px 16px;text-align:center;border-bottom:1px solid var(--border)}
header h1{font-size:20px;font-weight:600;color:var(--gold)}
header .date{font-size:12px;color:var(--muted);margin-top:4px}
.section{margin:0 16px 16px}
.stitle{font-size:13px;color:var(--gold);padding:12px 0 8px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none}
.stitle .ar{font-size:10px}
.sbody{overflow:hidden;max-height:600px;transition:max-height .3s}
.sbody.collapsed{max-height:0!important}
.sbody>*{margin-top:10px}
.fg{margin-bottom:10px}
.fg label{display:block;font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:500}
.fr{display:flex;gap:8px}
.fr .fg{flex:1}
input,textarea{width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:10px;font-size:16px;font-family:inherit;outline:none}
input:focus,textarea:focus{border-color:var(--gold)}
textarea{resize:vertical;min-height:50px}
.trow{display:flex;gap:8px}
.tbtn{flex:1;padding:12px;text-align:center;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--muted);font-size:15px;cursor:pointer;user-select:none}
.tbtn:active{transform:scale(.97)}
.tbtn.on{background:rgba(74,222,128,.15);color:var(--green);border-color:rgba(74,222,128,.3)}
.tbtn.off{background:rgba(248,113,113,.15);color:var(--red);border-color:rgba(248,113,113,.3)}
.btn{display:block;width:calc(100% - 32px);margin:24px 16px;padding:14px;background:linear-gradient(135deg,#c9a96e,#e0556a);color:#fff;border:none;border-radius:var(--r);font-size:17px;font-weight:600;cursor:pointer;text-align:center}
.btn:active{opacity:.85;transform:scale(.98)}
.btn:disabled{opacity:.5}
.st{text-align:center;font-size:12px;color:var(--muted);margin:-8px 16px 16px;min-height:20px}
.st.ok{color:var(--green)}.st.err{color:var(--red)}.st.ing{color:var(--amber)}
.info{text-align:center;font-size:10px;color:var(--muted);padding:8px;border-top:1px solid var(--border);margin-top:16px}
.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:var(--green);color:#0f1117;padding:10px 24px;border-radius:24px;font-size:14px;font-weight:600;z-index:200;opacity:0;transition:opacity .15s;pointer-events:none}
.toast.show{opacity:1}
</style>
</head>
<body>
<header><h1>🏯 御医 · 晨检</h1><div class="date" id="hd"></div></header>
<div style="padding:16px;display:flex;align-items:center;gap:8px">
<input type="date" id="ed" style="width:auto;font-size:14px;padding:8px 10px">
<span style="font-size:11px;color:var(--muted)" id="ew"></span>
</div>
<div class="section">
<div class="stitle" onclick="ts('sm')">☀️ 晨检数据 <span class="ar">▾</span></div>
<div class="sbody" id="sm">
<div class="fr"><div class="fg"><label>清醒时间 (min)</label><input type="number" id="aw" placeholder="33"></div><div class="fg"><label>快速动眼 REM (min)</label><input type="number" id="rs" placeholder="66"></div></div>
<div class="fr"><div class="fg"><label>核心睡眠 (min)</label><input type="number" id="cs" placeholder="351"></div><div class="fg"><label>深度睡眠 (min)</label><input type="number" id="ds" placeholder="44"></div></div>
<div class="fr"><div class="fg"><label>入睡时间</label><input type="time" id="bt"></div><div class="fg"><label>起床时间</label><input type="time" id="wt"></div></div>
<div class="fr"><div class="fg"><label>❤️ 静息心率 (bpm)</label><input type="number" id="hr" placeholder="74"></div><div class="fg"><label>📈 HRV (ms)</label><input type="number" id="hv" placeholder="可选"></div><div class="fg"><label>⚖️ 体重 (kg)</label><input type="number" id="bw" placeholder="84.0" step="0.1"></div></div>
<div class="fr"><div class="fg"><label>📱 睡前刷手机 (min)</label><input type="number" id="sv" placeholder="30"></div><div class="fg"><label>🔒 内守 第几天</label><input type="number" id="ab" placeholder="天"></div></div>
<div class="fg"><label>😰 焦虑 (1-10)</label><input type="number" id="ax" placeholder="5" min="0" max="10"></div>
<div class="fg"><label>💬 今日感受</label><input type="text" id="fl" placeholder="一句话概括..."></div>
</div>
</div>
<div class="section">
<div class="stitle" onclick="ts('sd')">🍽️ 饮食记录 <span class="ar">▾</span></div>
<div class="sbody collapsed" id="sd">
<div class="fg"><label>🍌 拳击前加餐</label><input type="text" id="pb" placeholder="半根香蕉 + 黑咖啡"></div>
<div class="fg"><label>🍱 午餐</label><textarea id="lu" placeholder="牛丸牛杂粿条 ~570kcal 34g蛋白" rows="2"></textarea></div>
<div class="fg"><label>🍲 晚餐</label><textarea id="di" placeholder="沙姜鸡套餐 ~620kcal 60g蛋白" rows="2"></textarea></div>
<div class="fr"><div class="fg"><label>🕐 开窗时间</label><input type="time" id="fs"></div><div class="fg"><label>🔒 关窗时间</label><input type="time" id="fe"></div></div>
</div>
</div>
<div class="section">
<div class="stitle" onclick="ts('st')">🥊 训练记录 <span class="ar">▾</span></div>
<div class="sbody collapsed" id="st">
<div class="trow"><div class="tbtn" id="bb" onclick="tg('boxing')">拳击</div><div class="tbtn" id="bf" onclick="tg('fasting')">断食</div></div>
<div class="fr"><div class="fg"><label>时长 (min)</label><input type="number" id="td" placeholder="60"></div><div class="fg"><label>热量 (kcal)</label><input type="number" id="tc" placeholder="600"></div></div>
<div class="fr"><div class="fg"><label>最高心率</label><input type="number" id="th" placeholder="171"></div><div class="fg"><label>平均心率</label><input type="number" id="ta" placeholder="118"></div></div>
</div>
</div>
<button type="button" class="btn" onclick="sub()">📡 提交到御医团队</button>
<div class="st" id="ss">提交后华佗 / 如意 / 张教练将收到数据</div>
<div class="info">🔒 Worker 安全提交 · 无需配置 Token</div>
<div class="toast" id="toast"></div>
<script>
document.getElementById('hd').textContent=new Date().toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
var dt=document.getElementById('ed');
function fd(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
dt.value=fd(new Date());
dt.onchange=function(){var d=new Date(dt.value);document.getElementById('ew').textContent='星期'+['日','一','二','三','四','五','六'][d.getDay()]};
dt.onchange();
function ts(id){document.getElementById(id).classList.toggle('collapsed')}
var bv=null,fv=null;
function tg(t){
if(t==='boxing'){bv=bv===true?false:bv===false?null:true;tui('bb',bv)}
else{fv=fv===true?false:fv===false?null:true;tui('bf',fv)}
}
function tui(id,v){
var el=document.getElementById(id);el.classList.remove('on','off');
if(v===true){el.classList.add('on');el.textContent=id==='bb'?'拳击 ✅':'断食 ✅'}
else if(v===false){el.classList.add('off');el.textContent=id==='bb'?'拳击 ❌':'断食 ❌'}
else el.textContent=id==='bb'?'拳击':'断食';
}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2000)}
async function sub(){
var btn=document.querySelector('.btn'),st=document.getElementById('ss');
btn.disabled=true;st.textContent='⏳ 正在提交...';st.className='st ing';
var date=dt.value,entry={date:date};
var map={aw:'awakeTime',rs:'remSleep',cs:'coreSleep',ds:'deepSleep',hr:'heartRate',hv:'hrv',bw:'weight',sv:'shortVideo',ab:'abstinence',ax:'anxiety',fl:'feeling',bt:'bedtime',wt:'wakeTime',lu:'lunch',di:'dinner',pb:'preBoxingFood',fs:'fastingStart',fe:'fastingEnd',td:'trainingDur',tc:'trainingCal',th:'trainingMaxHR',ta:'trainingAvgHR'};
Object.keys(map).forEach(function(k){var el=document.getElementById(k);if(el&&el.value!==''&&el.value!==undefined){var v=el.value;entry[map[k]]=isNaN(v)?v:parseFloat(v)||parseInt(v)||v}});
var cs2=parseInt(document.getElementById('cs').value)||0,ds2=parseInt(document.getElementById('ds').value)||0,rem2=parseInt(document.getElementById('rs').value)||0;
if(cs2+ds2+rem2>0)entry.sleepTotal=Math.round((cs2+ds2+rem2)/0.6)/100;
entry.boxing=bv;entry.fasting=fv;
Object.keys(entry).forEach(function(k){if(entry[k]===null||entry[k]===undefined)delete entry[k]});
try{
var res=await fetch('/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)});
var data=await res.json();
if(data.ok){st.textContent='✅ 已提交！'+date;st.className='st ok';toast('✅ 已提交到御医')}
else{st.textContent='❌ '+(data.error||'失败');st.className='st err'}
}catch(e){st.textContent='❌ 网络错误: '+e.message;st.className='st err'}
btn.disabled=false;
}
</script>
</body>
</html>`;

function cors(res: Response): Response {
  const r = new Response(res.body, res);
  r.headers.set('Access-Control-Allow-Origin', '*');
  r.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  r.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return r;
}

async function getData(token: string): Promise<any[]> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`, {
    headers: { Authorization: `token ${token}`, 'User-Agent': 'imperial-worker' }
  });
  if (!res.ok) return [];
  const j = await res.json() as any;
  return JSON.parse(atob(j.content));
}

async function saveData(token: string, data: any[]): Promise<void> {
  const current = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`, {
    headers: { Authorization: `token ${token}`, 'User-Agent': 'imperial-worker' }
  });
  const j = await current.json() as any;
  const content = btoa(JSON.stringify(data, null, 2));
  await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_PATH}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'User-Agent': 'imperial-worker' },
    body: JSON.stringify({
      message: '📱 手机提交数据',
      content,
      sha: j.sha
    })
  });
}

async function saveSubmission(token: string, entry: any): Promise<void> {
  const path = `submissions/${entry.date || 'unknown'}-${Date.now()}.json`;
  const content = btoa(JSON.stringify(entry, null, 2));
  await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'User-Agent': 'imperial-worker' },
    body: JSON.stringify({
      message: `📱 新提交: ${entry.date || 'unknown'}`,
      content
    })
  });
}

async function handleUpdate(token: string, body: any): Promise<Response> {
  const entry = body;
  if (!entry || !entry.date) {
    return new Response(JSON.stringify({ ok: false, error: '缺少 date 字段' }), { status: 400 });
  }

  await saveSubmission(token, entry);
  const data = await getData(token);
  const idx = data.findIndex((d: any) => d.date === entry.date);
  if (idx >= 0) {
    data[idx] = { ...data[idx], ...entry };
  } else {
    data.push(entry);
  }
  data.sort((a: any, b: any) => a.date.localeCompare(b.date));
  await saveData(token, data);

  return new Response(JSON.stringify({ ok: true, date: entry.date, merged: idx >= 0 }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }

    // Serve mobile form at root
    if ((request.method === 'GET' || request.method === 'HEAD') && (url.pathname === '/' || url.pathname === '/index.html')) {
      return cors(new Response(HTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }));
    }

    if (request.method === 'POST' && url.pathname === '/update') {
      try {
        const body = await request.json() as any;
        const res = await handleUpdate(env.GITHUB_TOKEN, body);
        return cors(res);
      } catch (e: any) {
        return cors(new Response(JSON.stringify({ ok: false, error: e.message }), {
          status: 500, headers: { 'Content-Type': 'application/json' }
        }));
      }
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      return cors(new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    return cors(new Response('Not Found', { status: 404 }));
  }
};
