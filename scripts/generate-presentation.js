const path = require('path');
const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Carrier Team';
pptx.company = 'AM:PM 8th Hackathon';
pptx.subject = 'AI 커리어 관리 서비스 Carrier 발표자료';
pptx.title = 'Carrier — 커리어를 캐리어에 담다';
pptx.lang = 'ko-KR';
pptx.theme = {
  headFontFace: 'Malgun Gothic',
  bodyFontFace: 'Malgun Gothic',
  lang: 'ko-KR'
};
pptx.defineSlideMaster({
  title: 'LIGHT',
  background: { color: 'F7F9FC' },
  objects: [],
  slideNumber: { x: 12.45, y: 7.08, w: 0.38, h: 0.18, color: '8693A8', fontFace: 'Aptos', fontSize: 8, align: 'right' }
});
pptx.defineSlideMaster({
  title: 'DARK',
  background: { color: '071126' },
  objects: [],
  slideNumber: { x: 12.45, y: 7.08, w: 0.38, h: 0.18, color: '71809E', fontFace: 'Aptos', fontSize: 8, align: 'right' }
});

const S = pptx._shapeType;
const C = {
  navy: '071126', ink: '101D38', slate: '53627B', muted: '7E8BA2', line: 'DCE3EE', paper: 'F7F9FC', white: 'FFFFFF',
  blue: '4D7CFE', cyan: '40E7D1', mint: '73F2B7', purple: '8B5CF6', pink: 'E056FD', orange: 'FFB35C', yellow: 'FFD76A',
  paleBlue: 'EDF4FF', paleMint: 'EAFBF5', palePurple: 'F1EDFF', palePink: 'FFF0FB', paleOrange: 'FFF5E9'
};
const FONT = 'Malgun Gothic';
const W = 13.333;
const H = 7.5;

function rect(slide, x, y, w, h, fill, radius = 0.12, line = null) {
  slide.addShape(radius ? S.roundRect : S.rect, {
    x, y, w, h,
    rectRadius: radius,
    fill: typeof fill === 'string' ? { color: fill } : fill,
    line: line || { color: typeof fill === 'string' ? fill : (fill.color || C.line), transparency: 100 }
  });
}

function txt(slide, text, x, y, w, h, options = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: options.fontFace || FONT,
    fontSize: options.fontSize || 16,
    color: options.color || C.ink,
    bold: Boolean(options.bold),
    align: options.align || 'left',
    valign: options.valign || 'mid',
    margin: options.margin === undefined ? 0 : options.margin,
    breakLine: false,
    fit: 'shrink',
    isTextBox: true,
    ...options
  });
}

function line(slide, x1, y1, x2, y2, color = C.line, width = 1.2, dash = 'solid') {
  slide.addShape(S.line, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color, width, dashType: dash, beginArrowType: 'none', endArrowType: 'none' } });
}

function aurora(slide, dark = false, intensity = 1) {
  const base = dark ? C.navy : C.paper;
  slide.background = { color: base };
  const blobs = dark
    ? [
      [-1.2, -2.5, 7.2, 6.1, C.blue, 72], [3.2, -3.4, 7.6, 6.2, C.purple, 76], [8.4, -2.2, 6.8, 5.4, C.pink, 80], [6.1, 4.8, 7.9, 4.4, C.cyan, 86]
    ]
    : [
      [-1.8, -3.2, 7.2, 6.1, C.cyan, 89], [4.2, -3.4, 7.8, 6.0, C.purple, 92], [9.7, -1.8, 5.6, 4.8, C.blue, 91]
    ];
  blobs.forEach(([x, y, w, h, color, transparency]) => slide.addShape(S.ellipse, {
    x, y, w, h,
    fill: { color, transparency: Math.min(96, transparency + (1 - intensity) * 10) },
    line: { color, transparency: 100 }
  }));
}

function footer(slide, dark = false, label = 'CARRIER · AM:PM 8TH HACKATHON') {
  txt(slide, label, 0.54, 7.08, 4.0, 0.18, { fontFace: 'Aptos', fontSize: 7.5, bold: true, color: dark ? '7383A4' : '98A4B7', charSpacing: 1.2 });
}

function heading(slide, section, title, subtitle, dark = false) {
  txt(slide, section.toUpperCase(), 0.58, 0.34, 3.6, 0.25, { fontFace: 'Aptos', fontSize: 8.5, bold: true, color: dark ? C.cyan : C.blue, charSpacing: 1.7 });
  txt(slide, title, 0.58, 0.72, 11.9, 0.68, { fontSize: 27, bold: true, color: dark ? C.white : C.ink, breakLine: false });
  if (subtitle) txt(slide, subtitle, 0.6, 1.42, 11.4, 0.38, { fontSize: 11, color: dark ? 'B4C2DD' : C.muted });
  footer(slide, dark);
}

function pill(slide, textValue, x, y, w, fill, color, dark = false) {
  rect(slide, x, y, w, 0.34, { color: fill, transparency: dark ? 18 : 0 }, 0.17);
  txt(slide, textValue, x + 0.06, y + 0.01, w - 0.12, 0.3, { fontSize: 8.4, bold: true, color, align: 'center' });
}

function iconCircle(slide, label, x, y, size, fill, color = C.white, fontSize = 13) {
  slide.addShape(S.ellipse, { x, y, w: size, h: size, fill: { color: fill }, line: { color: fill, transparency: 100 } });
  txt(slide, label, x, y, size, size, { fontFace: 'Aptos', fontSize, bold: true, color, align: 'center', valign: 'mid' });
}

function suitcase(slide, x, y, w, h, dark = false) {
  const outline = dark ? C.white : C.ink;
  slide.addShape(S.roundRect, { x: x + w * 0.33, y, w: w * 0.34, h: h * 0.19, rectRadius: 0.08, fill: { color: outline, transparency: 100 }, line: { color: outline, width: 2.2 } });
  slide.addShape(S.roundRect, { x, y: y + h * 0.14, w, h: h * 0.76, rectRadius: 0.16, fill: { color: dark ? '10264B' : C.white, transparency: dark ? 15 : 0 }, line: { color: outline, width: 2.3 } });
  line(slide, x + w * 0.32, y + h * 0.15, x + w * 0.32, y + h * 0.9, outline, 1.2);
  line(slide, x + w * 0.68, y + h * 0.15, x + w * 0.68, y + h * 0.9, outline, 1.2);
  slide.addShape(S.ellipse, { x: x + w * 0.12, y: y + h * 0.84, w: w * 0.11, h: w * 0.11, fill: { color: C.cyan }, line: { color: C.cyan } });
  slide.addShape(S.ellipse, { x: x + w * 0.77, y: y + h * 0.84, w: w * 0.11, h: w * 0.11, fill: { color: C.purple }, line: { color: C.purple } });
}

function smallCard(slide, x, y, w, h, title, body, accent = C.blue, dark = false, number = '') {
  rect(slide, x, y, w, h, { color: dark ? '10213F' : C.white, transparency: dark ? 7 : 0 }, 0.14, { color: dark ? '263B60' : C.line, transparency: dark ? 25 : 0, width: 1 });
  if (number) iconCircle(slide, number, x + 0.2, y + 0.2, 0.42, accent, C.white, 9);
  else rect(slide, x + 0.2, y + 0.22, 0.08, 0.4, accent, 0.04);
  txt(slide, title, x + (number ? 0.76 : 0.42), y + 0.18, w - (number ? 0.95 : 0.62), 0.36, { fontSize: 12.5, bold: true, color: dark ? C.white : C.ink });
  txt(slide, body, x + 0.22, y + 0.72, w - 0.44, h - 0.88, { fontSize: 9.3, color: dark ? 'B6C4DE' : C.slate, valign: 'top', breakLine: false, paraSpaceAfterPt: 4, lineSpacingMultiple: 1.1 });
}

function arrowBetween(slide, x, y, color = C.blue) {
  slide.addShape(S.chevron, { x, y, w: 0.38, h: 0.42, fill: { color, transparency: 10 }, line: { color, transparency: 100 } });
}

// 01. Cover
{
  const slide = pptx.addSlide('DARK');
  aurora(slide, true, 1);
  rect(slide, 0.55, 0.48, 2.56, 0.4, { color: C.white, transparency: 88 }, 0.2, { color: C.white, transparency: 72, width: 0.8 });
  txt(slide, 'AM:PM 8TH HACKATHON', 0.7, 0.5, 2.25, 0.34, { fontFace: 'Aptos', fontSize: 9, bold: true, color: C.white, align: 'center', charSpacing: 1.3 });
  txt(slide, 'Carrier', 0.68, 1.45, 7.4, 1.22, { fontFace: 'Aptos Display', fontSize: 52, bold: true, color: C.white, charSpacing: -1.6 });
  txt(slide, '커리어를 캐리어에 담다', 0.72, 2.68, 7.3, 0.64, { fontSize: 26, bold: true, color: C.white });
  txt(slide, '흩어진 경험을 기록하고, AI로 해석해, 다음 지원까지 이어주는 커리어 OS', 0.74, 3.48, 7.1, 0.6, { fontSize: 13, color: 'C8D5EB', valign: 'top' });
  pill(slide, 'CAREER DATA', 0.72, 4.52, 1.55, '17305A', C.cyan, true);
  pill(slide, 'GITHUB AI', 2.4, 4.52, 1.45, '2C1E59', 'C9B5FF', true);
  pill(slide, 'APPLICATION', 3.98, 4.52, 1.62, '3A1F55', 'F3B7FF', true);
  suitcase(slide, 9.2, 1.62, 2.6, 3.5, true);
  txt(slide, 'C', 9.83, 2.7, 1.35, 0.72, { fontFace: 'Aptos', fontSize: 34, bold: true, color: C.white, align: 'center' });
  txt(slide, 'TEAM CARRIER', 0.72, 6.65, 2.4, 0.28, { fontFace: 'Aptos', fontSize: 8.5, bold: true, color: '8191B0', charSpacing: 1.4 });
}

// 02. Background
{
  const slide = pptx.addSlide('LIGHT');
  aurora(slide, false, 0.55);
  heading(slide, '01 · WHY', '경험은 쌓이는데, 지원할 때마다 다시 찾습니다', '커리어 정보는 여러 곳에 흩어지고, 기억은 시간이 지날수록 맥락을 잃습니다.');
  const items = [
    ['01', '흩어진 기록', '자격증, 대외활동, 논문, 수상, 프로젝트가 파일·메모·링크에 분산', C.blue],
    ['02', '잊힌 기여', '오래된 프로젝트에서 내가 어떤 코드를 작성했는지 다시 설명하기 어려움', C.purple],
    ['03', '막연한 비교', '지원 기업과 직무가 원하는 역량 대비 내 강점과 공백을 알기 어려움', C.cyan],
    ['04', '반복되는 작성', '지원할 때마다 경험을 다시 꺼내 자기소개서 문장으로 재조립', C.pink]
  ];
  items.forEach((item, i) => smallCard(slide, 0.58 + i * 3.16, 2.12, 2.83, 2.47, item[1], item[2], item[3], false, item[0]));
  rect(slide, 1.08, 5.22, 11.18, 0.95, { color: C.ink }, 0.18);
  txt(slide, '문제의 핵심', 1.38, 5.45, 1.25, 0.34, { fontSize: 10, bold: true, color: C.cyan });
  txt(slide, '경험이 없는 것이 아니라, 경험을 꺼내 쓰는 연결 구조가 없습니다.', 2.82, 5.31, 8.92, 0.55, { fontSize: 18, bold: true, color: C.white, align: 'center' });
}

// 03. Theme / name
{
  const slide = pptx.addSlide('DARK');
  aurora(slide, true, 0.75);
  heading(slide, '02 · IDEA', '커리어를 담고, 필요할 때 꺼내 쓰는 Carrier', '여행의 짐을 캐리어에 정리하듯 커리어의 증거와 맥락을 하나의 데이터로 정리합니다.', true);
  suitcase(slide, 0.9, 2.18, 3.0, 3.7, true);
  txt(slide, 'Carrier', 1.5, 3.48, 1.8, 0.48, { fontFace: 'Aptos', fontSize: 22, bold: true, color: C.white, align: 'center' });
  const values = [
    ['담다', '프로젝트부터 논문·수상까지 한곳에 구조화', C.cyan],
    ['해석하다', '기업·직무·GitHub 데이터를 AI가 근거 중심으로 분석', C.purple],
    ['꺼내 쓰다', '분석된 경험을 지원서 형식과 톤에 맞춰 재구성', C.pink]
  ];
  values.forEach((v, i) => {
    const y = 2.12 + i * 1.26;
    iconCircle(slide, String(i + 1), 4.7, y + 0.03, 0.5, v[2], C.white, 10);
    txt(slide, v[0], 5.42, y, 1.45, 0.42, { fontSize: 15, bold: true, color: C.white });
    txt(slide, v[1], 6.92, y, 5.2, 0.46, { fontSize: 10.3, color: 'BCCAE1' });
    if (i < values.length - 1) line(slide, 4.95, y + 0.58, 4.95, y + 1.16, '355077', 1.4, 'dash');
  });
  rect(slide, 4.68, 6.04, 7.55, 0.55, { color: C.white, transparency: 88 }, 0.12, { color: C.white, transparency: 78, width: 0.8 });
  txt(slide, 'ONE CAREER DATA  →  MANY APPLICATIONS', 4.92, 6.13, 7.05, 0.3, { fontFace: 'Aptos', fontSize: 10.5, bold: true, color: C.cyan, align: 'center', charSpacing: 1.2 });
}

// 04. Overall solution
{
  const slide = pptx.addSlide('LIGHT');
  aurora(slide, false, 0.45);
  heading(slide, '03 · SOLUTION', '한 번 기록하면, 분석과 지원까지 이어집니다', 'Carrier는 단절된 기능이 아니라 하나의 커리어 데이터 흐름으로 작동합니다.');
  const steps = [
    ['01', '통합 기록', '7개 유형의 스펙\n+수상·결과물 연결', C.blue, C.paleBlue],
    ['02', '기업 비교', '기업·직무 요구와\n+강점·공백 분석', C.cyan, C.paleMint],
    ['03', '프로젝트 복원', 'GitHub 커밋으로\n+본인 역할 재발견', C.purple, C.palePurple],
    ['04', '지원서 작성', '근거 경험을 골라\n+형식·톤 맞춤 작성', C.pink, C.palePink]
  ];
  steps.forEach((s, i) => {
    const x = 0.68 + i * 3.16;
    rect(slide, x, 2.22, 2.72, 3.12, s[4], 0.2, { color: s[3], transparency: 55, width: 1 });
    iconCircle(slide, s[0], x + 0.22, 2.46, 0.52, s[3], C.white, 9);
    txt(slide, s[1], x + 0.22, 3.18, 2.28, 0.48, { fontSize: 17, bold: true, color: C.ink });
    txt(slide, s[2], x + 0.22, 3.86, 2.28, 0.86, { fontSize: 10.5, color: C.slate, valign: 'top', breakLine: false });
    if (i < 3) arrowBetween(slide, x + 2.78, 3.55, s[3]);
  });
  pill(slide, '단일 커리어 데이터', 4.83, 5.92, 2.25, C.ink, C.white);
  txt(slide, '새로운 지원이 생겨도 경험을 처음부터 다시 정리하지 않습니다.', 3.12, 6.35, 6.98, 0.34, { fontSize: 11.5, bold: true, color: C.ink, align: 'center' });
}

// 05. Career dashboard
{
  const slide = pptx.addSlide('LIGHT');
  heading(slide, '04 · FEATURE 1', '스펙을 한곳에서 관리하는 커리어 대시보드', '기록의 단위를 표준화하면서도 활동별로 필요한 정보는 다르게 받습니다.');
  rect(slide, 0.6, 2.0, 7.65, 4.48, C.white, 0.18, { color: C.line, width: 1 });
  rect(slide, 0.6, 2.0, 1.44, 4.48, 'F2F6FC', 0.18, { color: C.line, width: 1 });
  txt(slide, 'Carrier.', 0.84, 2.27, 0.96, 0.34, { fontFace: 'Aptos', fontSize: 15, bold: true, color: C.ink });
  ['대시보드', '프로젝트', '기업 분석', '글 작성'].forEach((v, i) => {
    if (i === 0) rect(slide, 0.76, 2.94 + i * 0.52, 1.14, 0.37, C.paleBlue, 0.08);
    txt(slide, v, 0.9, 2.96 + i * 0.52, 0.9, 0.31, { fontSize: 7.6, bold: true, color: i === 0 ? C.blue : C.slate });
  });
  txt(slide, '오늘의 커리어', 2.35, 2.32, 2.7, 0.42, { fontSize: 17, bold: true, color: C.ink });
  const stats = [['수상', '3', C.yellow], ['프로젝트', '6', C.orange], ['자격증', '4', C.mint], ['대외활동', '5', C.purple]];
  stats.forEach((s, i) => {
    rect(slide, 2.34 + i * 1.38, 2.98, 1.19, 0.78, 'F7F9FC', 0.09);
    slide.addShape(S.ellipse, { x: 2.45 + i * 1.38, y: 3.13, w: 0.24, h: 0.24, fill: { color: s[2] }, line: { color: s[2] } });
    txt(slide, s[1], 2.76 + i * 1.38, 3.06, 0.3, 0.25, { fontFace: 'Aptos', fontSize: 11, bold: true, color: C.ink });
    txt(slide, s[0], 2.76 + i * 1.38, 3.35, 0.5, 0.18, { fontSize: 6.7, color: C.muted });
  });
  [
    ['AI 공모전', '수상 · 프로젝트', C.yellow], ['SQLD', '자격증', C.mint], ['해커톤 8기', '대외활동', C.blue]
  ].forEach((a, i) => {
    const x = 2.35 + i * 1.79;
    rect(slide, x, 4.22, 1.56, 1.55, C.white, 0.1, { color: C.line, width: 0.8 });
    pill(slide, a[1], x + 0.12, 4.38, 0.88, i === 0 ? 'FFF0BE' : i === 1 ? C.paleMint : C.paleBlue, i === 0 ? '966900' : i === 1 ? '14825F' : C.blue);
    txt(slide, a[0], x + 0.12, 4.88, 1.26, 0.32, { fontSize: 9.2, bold: true, color: C.ink });
    txt(slide, '최근 등록', x + 0.12, 5.3, 1.1, 0.2, { fontSize: 6.5, color: C.muted });
  });
  txt(slide, '7가지 스펙 유형', 8.82, 2.08, 2.9, 0.42, { fontSize: 17, bold: true, color: C.ink });
  txt(slide, '자격증 · 대외활동 · 논문 · 어학연수 · 멘토링 · 프로젝트 · 연락처', 8.84, 2.58, 3.73, 0.62, { fontSize: 9.5, color: C.slate, valign: 'top' });
  const right = [
    ['결과물 연결', '대외활동에서 만든 프로젝트·논문을 별도 스펙으로 생성', C.blue],
    ['수상 분리', '활동 수상과 결과물 수상을 각각 기록해 근거를 정확히 유지', C.yellow],
    ['최근순 탐색', '등록된 활동을 최신순·유형별·수상별로 빠르게 확인', C.purple]
  ];
  right.forEach((r, i) => smallCard(slide, 8.78, 3.35 + i * 0.98, 3.9, 0.78, r[0], r[1], r[2], false));
}

// 06. Company fit
{
  const slide = pptx.addSlide('DARK');
  aurora(slide, true, 0.65);
  heading(slide, '05 · FEATURE 2', '내 스펙과 기업·직무 요구를 AI로 비교', '기업명, 목표 직무, 채용공고를 입력하면 강점·부족한 스펙·준비 행동을 구조화합니다.', true);
  smallCard(slide, 0.7, 2.2, 3.08, 3.45, '지원 목표', '기업명\n목표 직무\n경력 구분\n채용공고 상세', C.blue, true, 'IN');
  arrowBetween(slide, 3.98, 3.67, C.cyan);
  rect(slide, 4.58, 2.56, 3.28, 2.72, { color: '102C48', transparency: 4 }, 0.2, { color: C.cyan, transparency: 35, width: 1.2 });
  iconCircle(slide, 'AI', 5.73, 2.93, 0.92, C.cyan, C.navy, 17);
  txt(slide, 'Mindlogic 분석', 5.16, 4.04, 2.12, 0.36, { fontSize: 15, bold: true, color: C.white, align: 'center' });
  txt(slide, '스펙 근거 ↔ 직무 요건', 5.08, 4.48, 2.3, 0.25, { fontSize: 9, color: 'B4C7DE', align: 'center' });
  arrowBetween(slide, 8.06, 3.67, C.purple);
  smallCard(slide, 8.64, 2.2, 3.98, 3.45, 'AI Career Fit Report', '적합도 요약\n내 스펙의 강점\n부족한 역량과 우선순위\n바로 실행할 준비 행동', C.purple, true, 'OUT');
  rect(slide, 1.88, 6.05, 9.55, 0.54, { color: C.white, transparency: 89 }, 0.12, { color: C.white, transparency: 80, width: 0.8 });
  txt(slide, '연락처·사진·첨부파일 제외  ·  공고가 없으면 일반 요건 기반이라는 가정 명시', 2.15, 6.16, 9.0, 0.27, { fontSize: 9.6, bold: true, color: C.cyan, align: 'center' });
}

// 07. GitHub analysis
{
  const slide = pptx.addSlide('LIGHT');
  heading(slide, '06 · FEATURE 3', '기억나지 않는 프로젝트도 커밋이 역할을 말해줍니다', '저장소와 GitHub 아이디만 입력하면 프로젝트 전체와 본인 기여를 구분해 분석합니다.');
  rect(slide, 0.62, 2.04, 4.0, 3.97, C.ink, 0.18);
  txt(slide, 'Repository input', 0.92, 2.34, 2.1, 0.3, { fontFace: 'Aptos', fontSize: 10, bold: true, color: C.cyan });
  rect(slide, 0.92, 2.88, 3.36, 0.61, '182846', 0.08);
  txt(slide, 'github.com/team/project', 1.13, 3.03, 2.95, 0.25, { fontFace: 'Aptos', fontSize: 10, color: C.white });
  rect(slide, 0.92, 3.72, 3.36, 0.61, '182846', 0.08);
  txt(slide, '@my-github-id', 1.13, 3.87, 2.95, 0.25, { fontFace: 'Aptos', fontSize: 10, color: C.white });
  rect(slide, 0.92, 4.68, 3.36, 0.66, C.blue, 0.09);
  txt(slide, '프로젝트 · 커밋 분석 시작', 1.06, 4.85, 3.08, 0.25, { fontSize: 10, bold: true, color: C.white, align: 'center' });
  const flow = [
    ['1', 'GitHub API', '저장소·언어·README\n최근 본인 커밋 수집', C.blue],
    ['2', '근거 추출', '변경 파일과 patch로\n직접 작성한 코드 확인', C.cyan],
    ['3', 'AI 분석', '프로젝트 성격·기술·\n역할·주요 활동 정리', C.purple],
    ['4', '스펙 완성', '결과를 프로젝트 칸에\n한 번에 채우고 저장', C.pink]
  ];
  flow.forEach((f, i) => {
    const x = 5.08 + (i % 2) * 3.7;
    const y = 2.05 + Math.floor(i / 2) * 2.03;
    smallCard(slide, x, y, 3.32, 1.58, f[1], f[2], f[3], false, f[0]);
  });
  rect(slide, 5.08, 6.22, 7.02, 0.38, C.palePurple, 0.09);
  txt(slide, '분석 결과는 프로젝트 상세에 보관되어 주요 활동과 함께 다시 확인할 수 있습니다.', 5.25, 6.27, 6.68, 0.24, { fontSize: 8.8, bold: true, color: '5C45B0', align: 'center' });
}

// 08. Writing
{
  const slide = pptx.addSlide('DARK');
  aurora(slide, true, 0.7);
  heading(slide, '07 · FEATURE 4', '쌓인 스펙은 기업 맞춤 지원서로 이어집니다', '기업·직무·공고·실제 문항을 입력하면 적합한 경험을 선별해 형식과 톤에 맞게 씁니다.', true);
  const labels = [['기업·직무', C.blue], ['채용공고', C.cyan], ['지원 문항', C.purple], ['톤·분량', C.pink]];
  labels.forEach((l, i) => pill(slide, l[0], 0.73 + (i % 2) * 1.62, 2.24 + Math.floor(i / 2) * 0.56, 1.4, '183052', l[1], true));
  txt(slide, '+', 3.92, 2.52, 0.35, 0.5, { fontFace: 'Aptos', fontSize: 24, bold: true, color: '7189AE', align: 'center' });
  rect(slide, 4.52, 2.12, 2.48, 1.75, { color: '142747', transparency: 5 }, 0.17, { color: C.cyan, transparency: 42, width: 1.1 });
  iconCircle(slide, 'AI', 5.29, 2.42, 0.91, C.cyan, C.navy, 17);
  txt(slide, '근거 경험 선별', 4.91, 3.5, 1.7, 0.24, { fontSize: 10, bold: true, color: C.white, align: 'center' });
  arrowBetween(slide, 7.28, 2.78, C.purple);
  rect(slide, 8.02, 1.98, 4.55, 3.98, { color: 'FFFFFF', transparency: 4 }, 0.18, { color: 'FFFFFF', transparency: 82, width: 0.8 });
  txt(slide, 'AI APPLICATION REPORT', 8.35, 2.24, 2.6, 0.22, { fontFace: 'Aptos', fontSize: 7.8, bold: true, color: C.purple, charSpacing: 1.0 });
  txt(slide, '지원동기와 직무 역량', 8.35, 2.65, 3.45, 0.38, { fontSize: 15, bold: true, color: C.ink });
  line(slide, 8.35, 3.17, 12.2, 3.17, 'E3E8F0', 0.8);
  txt(slide, '등록한 프로젝트와 대외활동에서 직무와 연결되는 근거를 선택해 결론부터 작성합니다. 경험의 행동과 배운 점을 연결하고, 확인되지 않은 성과는 만들지 않습니다.', 8.35, 3.42, 3.78, 1.05, { fontSize: 9.5, color: C.slate, valign: 'top', breakLine: false });
  pill(slide, '작성 의도', 8.35, 4.7, 0.88, C.palePurple, '6549BD');
  pill(slide, '공백 포함 글자 수', 9.36, 4.7, 1.35, C.paleBlue, C.blue);
  pill(slide, '답변 복사', 10.85, 4.7, 0.92, C.paleMint, '198364');
  txt(slide, '실제 문항이 없으면 “AI 추정 양식”으로 명확히 표시', 8.35, 5.35, 3.8, 0.26, { fontSize: 8.8, bold: true, color: '6E5BAD' });
  rect(slide, 0.72, 5.55, 6.32, 0.43, { color: C.white, transparency: 88 }, 0.11);
  txt(slide, '연락처·사진·PDF는 전송하지 않고 커리어 텍스트만 활용', 0.96, 5.63, 5.83, 0.25, { fontSize: 8.9, bold: true, color: C.cyan, align: 'center' });
}

// 09. Architecture / how built
{
  const slide = pptx.addSlide('LIGHT');
  heading(slide, '08 · BUILD', '작게 시작하고, 페이지와 책임을 명확히 분리했습니다', 'Node.js와 바닐라 JavaScript를 기반으로 빠르게 검증 가능한 해커톤 구조를 선택했습니다.');
  const cols = [
    { x: 0.65, title: 'FRONTEND', accent: C.blue, items: ['Dashboard', 'Projects', 'Company Fit', 'Writing'] },
    { x: 4.62, title: 'NODE.JS SERVER', accent: C.cyan, items: ['정적 파일 제공', '입력 검증', 'JSON Schema 응답', '개인정보 필터링'] },
    { x: 8.58, title: 'DATA & AI', accent: C.purple, items: ['specs.json', 'GitHub REST API', 'Mindlogic Chat API', '모델별 분석 프롬프트'] }
  ];
  cols.forEach((col, ci) => {
    rect(slide, col.x, 2.06, 3.42, 3.92, C.white, 0.18, { color: C.line, width: 1 });
    rect(slide, col.x, 2.06, 3.42, 0.55, col.accent, 0.18);
    txt(slide, col.title, col.x + 0.23, 2.2, 2.96, 0.26, { fontFace: 'Aptos', fontSize: 9.2, bold: true, color: C.white, charSpacing: 1.1 });
    col.items.forEach((item, i) => {
      iconCircle(slide, String(i + 1), col.x + 0.25, 2.94 + i * 0.67, 0.32, ci === 0 ? C.paleBlue : ci === 1 ? C.paleMint : C.palePurple, col.accent, 7.5);
      txt(slide, item, col.x + 0.72, 2.9 + i * 0.67, 2.34, 0.38, { fontSize: 10, bold: true, color: C.ink });
    });
    if (ci < 2) arrowBetween(slide, col.x + 3.56, 3.77, col.accent);
  });
  rect(slide, 1.42, 6.34, 10.48, 0.38, C.ink, 0.1);
  txt(slide, '공통 UI는 common.css/js  ·  기능별 HTML·CSS·JS 분리  ·  API 키는 서버 환경변수로만 관리', 1.65, 6.39, 10.0, 0.25, { fontSize: 8.8, bold: true, color: C.white, align: 'center' });
}

// 10. Differentiation
{
  const slide = pptx.addSlide('LIGHT');
  aurora(slide, false, 0.48);
  heading(slide, '09 · DIFFERENCE', 'Carrier는 문장을 대신 쓰기 전에, 근거를 먼저 복원합니다', '단순 기록 앱이나 단발성 생성형 AI가 놓치는 “경험의 연결성”이 핵심 차별점입니다.');
  const diff = [
    ['기록 앱', '저장', '데이터는 남지만\n지원 맥락으로 이어지지 않음', C.muted],
    ['범용 생성 AI', '작성', '맥락이 부족하면\n경험을 다시 설명해야 함', C.purple],
    ['Carrier', '기록 → 분석 → 작성', '같은 커리어 데이터가\n모든 지원 단계에서 재사용', C.blue]
  ];
  diff.forEach((d, i) => {
    const x = 0.78 + i * 4.15;
    const active = i === 2;
    rect(slide, x, 2.22, 3.66, 3.68, active ? C.ink : C.white, 0.2, { color: active ? C.ink : C.line, width: 1 });
    pill(slide, d[1], x + 0.28, 2.52, active ? 1.84 : 1.18, active ? '17335C' : 'EFF3F8', active ? C.cyan : C.slate, active);
    txt(slide, d[0], x + 0.28, 3.2, 2.9, 0.46, { fontSize: 20, bold: true, color: active ? C.white : C.ink });
    txt(slide, d[2], x + 0.28, 4.03, 3.05, 0.92, { fontSize: 11, color: active ? 'C0CCE0' : C.slate, valign: 'top', breakLine: false });
    if (active) {
      rect(slide, x + 0.28, 5.23, 3.06, 0.39, { color: C.cyan, transparency: 5 }, 0.09);
      txt(slide, '증거 기반 커리어 루프', x + 0.44, 5.29, 2.74, 0.24, { fontSize: 9, bold: true, color: C.navy, align: 'center' });
    }
  });
  txt(slide, '“내가 뭘 했지?”에서 시작해 “이 경험으로 왜 이 직무에 맞는가”까지 한 번에.', 1.15, 6.39, 11.05, 0.34, { fontSize: 12.2, bold: true, color: C.ink, align: 'center' });
}

// 11. Expected effect
{
  const slide = pptx.addSlide('DARK');
  aurora(slide, true, 0.62);
  heading(slide, '10 · IMPACT', '지원 준비의 시간을 줄이고, 경험의 설득력을 높입니다', '정량 성과는 서비스 운영 이후 검증하고, 지금은 사용자 행동의 변화를 목표로 합니다.', true);
  const impacts = [
    ['정리 시간', '흩어진 파일 탐색', '구조화된 스펙 재사용', C.blue],
    ['프로젝트 회고', '기억에 의존', '커밋 근거로 역할 복원', C.cyan],
    ['기업 준비', '막연한 스펙 쌓기', '강점·공백·우선순위 확인', C.purple],
    ['지원서 작성', '매번 처음부터 작성', '직무 맞춤 초안에서 시작', C.pink]
  ];
  impacts.forEach((v, i) => {
    const y = 2.08 + i * 1.08;
    txt(slide, v[0], 0.78, y + 0.12, 1.2, 0.32, { fontSize: 11, bold: true, color: C.white });
    rect(slide, 2.2, y, 3.62, 0.68, { color: '142442', transparency: 5 }, 0.12);
    txt(slide, v[1], 2.45, y + 0.14, 3.1, 0.34, { fontSize: 10, color: '9FAFC9', align: 'center' });
    arrowBetween(slide, 6.08, y + 0.12, v[3]);
    rect(slide, 6.72, y, 5.74, 0.68, { color: v[3], transparency: 78 }, 0.12, { color: v[3], transparency: 45, width: 0.9 });
    txt(slide, v[2], 6.98, y + 0.14, 5.2, 0.34, { fontSize: 10.4, bold: true, color: C.white, align: 'center' });
  });
  rect(slide, 1.2, 6.46, 10.92, 0.25, { color: C.white, transparency: 91 }, 0.1);
  txt(slide, 'NEXT VALIDATION  ·  지원서 작성 소요 시간  ·  생성 초안 채택률  ·  재방문율  ·  면접 전환 경험', 1.45, 6.47, 10.42, 0.23, { fontFace: 'Aptos', fontSize: 7.8, bold: true, color: C.cyan, align: 'center', charSpacing: 0.6 });
}

// 12. Business model
{
  const slide = pptx.addSlide('LIGHT');
  heading(slide, '11 · BUSINESS', '핵심 기능은 무료로, 문맥형 광고로 지속 가능하게', 'Google Ads 광고 수요를 AdSense로 연결하되 커리어 원문은 광고 타기팅에 사용하지 않습니다.');
  rect(slide, 0.7, 2.1, 4.05, 4.05, C.ink, 0.2);
  txt(slide, 'FREE CORE', 1.02, 2.45, 1.55, 0.26, { fontFace: 'Aptos', fontSize: 9, bold: true, color: C.cyan, charSpacing: 1.2 });
  txt(slide, '진입 장벽 없이\n커리어를 계속 쌓게', 1.02, 3.0, 3.1, 1.02, { fontSize: 21, bold: true, color: C.white, valign: 'top', breakLine: false });
  txt(slide, '스펙 관리 · 기업 분석 · 프로젝트 분석 · 지원서 초안', 1.04, 4.54, 3.05, 0.78, { fontSize: 10, color: 'B5C2D8', valign: 'top' });
  pill(slide, '사용 빈도 확보', 1.03, 5.53, 1.45, '19325A', C.cyan, true);
  arrowBetween(slide, 4.97, 3.82, C.blue);
  rect(slide, 5.58, 2.1, 6.95, 4.05, C.white, 0.2, { color: C.line, width: 1 });
  txt(slide, 'Google AdSense', 5.94, 2.43, 2.4, 0.42, { fontFace: 'Aptos', fontSize: 18, bold: true, color: C.ink });
  pill(slide, 'Google Ads 수요', 9.98, 2.45, 1.68, C.paleBlue, C.blue);
  const adItems = [
    ['배치', '대시보드 하단 · 분석 리포트 종료 지점 등 흐름을 방해하지 않는 영역'],
    ['문맥', '자격증 · 교육 · 생산성 도구 · 취업 준비 등 페이지 주제 기반 광고'],
    ['원칙', '연락처·스펙 원문·AI 대화 내용을 광고 개인화 데이터로 전달하지 않음']
  ];
  adItems.forEach((a, i) => {
    iconCircle(slide, String(i + 1), 5.95, 3.22 + i * 0.78, 0.34, i === 2 ? C.purple : C.blue, C.white, 8);
    txt(slide, a[0], 6.47, 3.17 + i * 0.78, 0.65, 0.35, { fontSize: 10, bold: true, color: C.ink });
    txt(slide, a[1], 7.18, 3.14 + i * 0.78, 4.7, 0.48, { fontSize: 8.9, color: C.slate, valign: 'mid' });
  });
  rect(slide, 5.95, 5.7, 5.93, 0.26, C.paleMint, 0.08);
  txt(slide, '수익보다 신뢰가 먼저: 광고 밀도와 위치를 A/B 테스트로 관리', 6.16, 5.7, 5.51, 0.25, { fontSize: 8.3, bold: true, color: '247759', align: 'center' });
}

// 13. Roadmap / close
{
  const slide = pptx.addSlide('DARK');
  aurora(slide, true, 0.88);
  heading(slide, '12 · NEXT', 'Carrier가 개인의 커리어 운영체제로 성장하는 길', '해커톤 MVP에서 데이터 신뢰도, 자동화, 장기 커리어 관리로 확장합니다.', true);
  const roadmap = [
    ['NOW', 'MVP 검증', '스펙 통합 관리\n기업·GitHub·지원서 AI', C.blue],
    ['NEXT', '데이터 강화', '공고 수집·버전 관리\n이력서·포트폴리오 내보내기', C.cyan],
    ['LATER', '커리어 에이전트', '마감·준비 일정 추천\n성과 기반 개인화 코칭', C.purple]
  ];
  roadmap.forEach((r, i) => {
    const x = 0.78 + i * 4.13;
    rect(slide, x, 2.02, 3.6, 2.77, { color: '10213F', transparency: 5 }, 0.19, { color: r[3], transparency: 45, width: 1 });
    pill(slide, r[0], x + 0.28, 2.32, 0.92, '1A3158', r[3], true);
    txt(slide, r[1], x + 0.28, 3.02, 2.95, 0.44, { fontSize: 18, bold: true, color: C.white });
    txt(slide, r[2], x + 0.28, 3.72, 2.95, 0.7, { fontSize: 10, color: 'B6C4DB', valign: 'top', breakLine: false });
    if (i < 2) arrowBetween(slide, x + 3.73, 3.15, r[3]);
  });
  txt(slide, '기록이 쌓일수록, 다음 선택은 더 선명해집니다.', 1.08, 5.5, 11.18, 0.6, { fontSize: 24, bold: true, color: C.white, align: 'center' });
  txt(slide, '당신의 커리어를, Carrier에.', 1.08, 6.23, 11.18, 0.42, { fontSize: 13, bold: true, color: C.cyan, align: 'center' });
}

const output = path.join(__dirname, '..', 'Carrier_AMPM_8th_Hackathon.pptx');
pptx.writeFile({ fileName: output })
  .then(() => console.log(output))
  .catch((error) => { console.error(error); process.exitCode = 1; });
