const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'specs.json');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': MIME_TYPES['.json'] });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) {
      const error = new Error('요청 본문이 너무 큽니다.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    const error = new Error('올바른 JSON 형식이 아닙니다.');
    error.status = 400;
    throw error;
  }
}

async function readSpecs() {
  return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
}

async function writeSpecs(specs) {
  const temporaryFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(temporaryFile, `${JSON.stringify(specs, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryFile, DATA_FILE);
}

function validateSpec(input) {
  const categories = ['자격증', '어학', '프로젝트', '교육', '수상'];
  const statuses = ['계획', '진행 중', '완료'];
  const errors = [];
  if (typeof input.title !== 'string' || !input.title.trim()) errors.push('제목을 입력해 주세요.');
  if (!categories.includes(input.category)) errors.push('올바른 카테고리를 선택해 주세요.');
  if (!statuses.includes(input.status)) errors.push('올바른 상태를 선택해 주세요.');
  if (input.progress !== undefined) {
    const progress = Number(input.progress);
    if (!Number.isFinite(progress) || progress < 0 || progress > 100) errors.push('진행률은 0~100 사이여야 합니다.');
  }
  if (input.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) errors.push('목표일 형식이 올바르지 않습니다.');
  return errors;
}

function sanitizeSpec(input) {
  const status = input.status || '계획';
  const progress = status === '완료' ? 100 : Number(input.progress) || 0;
  return {
    title: input.title.trim(), category: input.category, status,
    progress: Math.min(100, Math.max(0, progress)),
    dueDate: input.dueDate || '',
    note: typeof input.note === 'string' ? input.note.trim() : ''
  };
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/specs' && req.method === 'GET') return sendJson(res, 200, await readSpecs());
  if (pathname === '/api/specs' && req.method === 'POST') {
    const body = await readBody(req);
    const errors = validateSpec(body);
    if (errors.length) return sendJson(res, 400, { message: errors[0], errors });
    const specs = await readSpecs();
    const now = new Date().toISOString();
    const spec = { id: crypto.randomUUID(), ...sanitizeSpec(body), createdAt: now, updatedAt: now };
    specs.unshift(spec);
    await writeSpecs(specs);
    return sendJson(res, 201, spec);
  }

  const match = pathname.match(/^\/api\/specs\/([^/]+)$/);
  if (!match) return sendJson(res, 404, { message: 'API 경로를 찾을 수 없습니다.' });
  const id = decodeURIComponent(match[1]);
  const specs = await readSpecs();
  const index = specs.findIndex((spec) => spec.id === id);
  if (index < 0) return sendJson(res, 404, { message: '스펙 항목을 찾을 수 없습니다.' });

  if (req.method === 'PATCH') {
    const body = await readBody(req);
    const candidate = { ...specs[index], ...body };
    const errors = validateSpec(candidate);
    if (errors.length) return sendJson(res, 400, { message: errors[0], errors });
    specs[index] = { ...specs[index], ...sanitizeSpec(candidate), updatedAt: new Date().toISOString() };
    await writeSpecs(specs);
    return sendJson(res, 200, specs[index]);
  }
  if (req.method === 'DELETE') {
    const [removed] = specs.splice(index, 1);
    await writeSpecs(specs);
    return sendJson(res, 200, removed);
  }
  return sendJson(res, 405, { message: '지원하지 않는 요청 방식입니다.' });
}

async function serveStatic(res, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requestedPath}`);
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    return sendJson(res, 403, { message: '접근할 수 없는 경로입니다.' });
  }
  try {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const content = await fs.readFile(path.join(PUBLIC_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
      return res.end(content);
    }
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url.pathname);
    if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { message: '지원하지 않는 요청 방식입니다.' });
    return await serveStatic(res, decodeURIComponent(url.pathname));
  } catch (error) {
    console.error(error);
    return sendJson(res, error.status || 500, { message: error.status ? error.message : '서버 오류가 발생했습니다.' });
  }
});

server.listen(PORT, HOST, () => console.log(`Carrier가 http://${HOST}:${PORT} 에서 실행 중입니다.`));
