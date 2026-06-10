const REPO = 'mrdeng33/imperial-health';
const DATA_PATH = 'data.json';

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

  // 1. Save submission snapshot
  await saveSubmission(token, entry);

  // 2. Read current data.json
  const data = await getData(token);

  // 3. Merge: upsert entry by date
  const idx = data.findIndex((d: any) => d.date === entry.date);
  if (idx >= 0) {
    data[idx] = { ...data[idx], ...entry };
  } else {
    data.push(entry);
  }
  data.sort((a: any, b: any) => a.date.localeCompare(b.date));

  // 4. Save back
  await saveData(token, data);

  return new Response(JSON.stringify({ ok: true, date: entry.date, merged: idx >= 0 }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
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
