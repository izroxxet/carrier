const path = require('path');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} = require('docx');

const OUTPUT = path.join(__dirname, '..', 'Carrier_AMPM_8th_Hackathon_Presentation_Guide.docx');
const COLORS = {
  navy: '071126',
  blue: '4D7CFE',
  purple: '7657E6',
  cyan: '16B8A6',
  paleBlue: 'EDF4FF',
  palePurple: 'F2EEFF',
  paleMint: 'EAFBF5',
  paleYellow: 'FFF6D8',
  gray: '53627B',
  lightGray: 'F5F7FA',
  line: 'DCE3EE',
  white: 'FFFFFF'
};

const slides = [
  {
    no: '01', section: 'COVER', title: 'Carrier — 커리어를 캐리어에 담다',
    subtitle: '흩어진 경험을 기록하고, AI로 해석해, 다음 지원까지 이어주는 커리어 OS',
    bullets: ['AM:PM 8th Hackathon', 'CAREER DATA · GITHUB AI · APPLICATION', '팀명 또는 발표자명을 하단에 배치'],
    visual: '어두운 네이비 배경 위에 파랑·보라·민트 오로라 그라데이션을 사용하고, 우측에 캐리어 형태의 심볼을 배치합니다.',
    script: '안녕하세요. 저희가 만든 서비스는 Carrier입니다. 여행의 짐을 캐리어에 정리하듯, 흩어진 커리어 경험을 한곳에 담고 필요할 때 바로 꺼내 쓸 수 있도록 만든 AI 커리어 관리 서비스입니다.'
  },
  {
    no: '02', section: 'WHY', title: '경험은 쌓이는데, 지원할 때마다 다시 찾습니다',
    subtitle: '커리어 정보는 여러 곳에 흩어지고, 기억은 시간이 지날수록 맥락을 잃습니다.',
    bullets: ['흩어진 기록: 자격증·대외활동·논문·수상·프로젝트가 파일, 메모, 링크에 분산', '잊힌 기여: 오래된 프로젝트에서 내가 어떤 코드를 작성했는지 설명하기 어려움', '막연한 비교: 지원 기업과 직무가 원하는 역량 대비 내 강점과 공백을 알기 어려움', '반복되는 작성: 지원할 때마다 경험을 다시 꺼내 자기소개서 문장으로 재조립'],
    key: '경험이 없는 것이 아니라, 경험을 꺼내 쓰는 연결 구조가 없습니다.',
    visual: '네 가지 문제를 동일한 크기의 카드로 제시하고, 하단에 문제의 핵심 문장을 강조합니다.',
    script: '취업 준비 과정에서 경험은 계속 쌓이지만 기록은 여러 장소에 흩어집니다. 시간이 지나면 프로젝트에서 내가 맡은 역할도 희미해지고, 기업이 원하는 역량과 내 스펙의 차이를 판단하기도 어렵습니다. 결국 지원할 때마다 처음부터 자료를 찾고 문장을 다시 만들어야 합니다.'
  },
  {
    no: '03', section: 'IDEA', title: '커리어를 담고, 필요할 때 꺼내 쓰는 Carrier',
    subtitle: '여행의 짐을 캐리어에 정리하듯 커리어의 증거와 맥락을 하나의 데이터로 정리합니다.',
    bullets: ['담다: 프로젝트부터 논문·수상까지 한곳에 구조화', '해석하다: 기업·직무·GitHub 데이터를 AI가 근거 중심으로 분석', '꺼내 쓰다: 분석된 경험을 지원서 형식과 톤에 맞춰 재구성'],
    key: 'ONE CAREER DATA → MANY APPLICATIONS',
    visual: '좌측에는 캐리어 심볼, 우측에는 담다 → 해석하다 → 꺼내 쓰다의 세 단계를 세로 흐름으로 배치합니다.',
    script: 'Carrier라는 이름은 커리어를 캐리어에 담는다는 의미에서 출발했습니다. 사용자는 경험을 한 번 구조화해 저장하고, AI는 그 데이터를 기업 분석과 프로젝트 회고에 활용합니다. 마지막에는 같은 데이터를 자기소개서와 입사지원서에 다시 사용할 수 있습니다.'
  },
  {
    no: '04', section: 'SOLUTION', title: '한 번 기록하면, 분석과 지원까지 이어집니다',
    subtitle: 'Carrier는 단절된 기능이 아니라 하나의 커리어 데이터 흐름으로 작동합니다.',
    bullets: ['1. 통합 기록: 7개 유형의 스펙과 수상·결과물 연결', '2. 기업 비교: 기업·직무 요구와 내 강점·공백 분석', '3. 프로젝트 복원: GitHub 커밋으로 본인 역할 재발견', '4. 지원서 작성: 근거 경험을 골라 형식과 톤에 맞게 작성'],
    key: '새로운 지원이 생겨도 경험을 처음부터 다시 정리하지 않습니다.',
    visual: '네 단계를 왼쪽에서 오른쪽으로 연결한 파이프라인으로 표현합니다.',
    script: '서비스의 핵심은 데이터가 한 번 저장된 뒤 계속 재사용된다는 점입니다. 대시보드에 기록한 경험은 기업 적합도 분석의 근거가 되고, GitHub 분석 결과는 프로젝트의 주요 활동으로 저장됩니다. 이렇게 축적된 정보는 다시 지원서 작성에 활용됩니다.'
  },
  {
    no: '05', section: 'FEATURE 1', title: '스펙을 한곳에서 관리하는 커리어 대시보드',
    subtitle: '기록의 단위를 표준화하면서도 활동별로 필요한 정보는 다르게 받습니다.',
    bullets: ['프로젝트·자격증·대외활동·논문·어학연수·멘토링·연락처의 7개 유형', '유형별 등록 개수와 수상 개수를 한눈에 확인', '최근 등록순 정렬 및 유형별·수상별 필터', '수상 활동은 노란 태그와 리본으로 강조', '대외활동 결과물을 프로젝트 또는 논문으로 별도 생성', '활동 수상과 결과물 수상을 분리해 정확한 근거 유지', '프로젝트·대외활동·어학연수·멘토링에는 증빙 이미지 첨부', '첨부파일은 항목당 최대 2MB'],
    visual: '실제 대시보드와 유사한 요약 카드, 활동 카드, 카테고리 필터를 화면 목업으로 보여줍니다.',
    script: '대시보드에서는 스펙을 일곱 가지 유형으로 나눠 관리합니다. 단순 목록이 아니라 각 유형별 개수와 수상 개수를 바로 확인할 수 있고, 최신순과 카테고리별로 탐색할 수 있습니다. 대외활동에서 나온 프로젝트나 논문은 별도의 스펙으로 연결해 결과물의 수상 여부까지 따로 기록할 수 있습니다.'
  },
  {
    no: '06', section: 'FEATURE 2', title: '내 스펙과 기업·직무 요구를 AI로 비교',
    subtitle: '기업명, 목표 직무, 채용공고를 입력하면 강점·부족한 스펙·준비 행동을 구조화합니다.',
    bullets: ['입력: 기업명, 목표 직무, 경력 구분, 채용공고 상세내용', '분석: 저장된 스펙 근거와 공고의 직무 요건 비교', '출력: 적합도 요약, 강점, 부족한 역량, 우선순위, 실행 행동', '공고가 없으면 일반적인 기업·직무 요건을 기준으로 분석했다는 가정 표시', '연락처·사진·PDF·첨부파일 데이터는 AI 요청에서 제외'],
    key: '스펙을 더 쌓으라는 막연한 조언이 아니라, 무엇을 먼저 보완할지 제시합니다.',
    visual: '지원 목표 입력 → Mindlogic AI → Career Fit Report의 세 구간으로 나눕니다.',
    script: '기업 분석 페이지에서는 회사와 직무, 공고 내용을 입력합니다. AI는 사용자의 프로젝트와 자격증, 활동 기록을 근거로 강점과 부족한 역량을 비교하고, 준비 우선순위를 제안합니다. 개인정보와 첨부파일은 분석 요청에 포함하지 않습니다.'
  },
  {
    no: '07', section: 'FEATURE 3', title: '기억나지 않는 프로젝트도 커밋이 역할을 말해줍니다',
    subtitle: '저장소와 GitHub 아이디만 입력하면 프로젝트 전체와 본인 기여를 구분해 분석합니다.',
    bullets: ['GitHub 저장소 링크와 본인 GitHub 아이디 입력', '저장소 정보·사용 언어·README·최근 커밋 수집', '본인이 작성한 커밋의 변경 파일과 patch를 중심으로 기여 근거 추출', 'AI가 프로젝트 성격, 기술 스택, 역할, 주요 활동, 포트폴리오 문장 생성', '분석 결과로 프로젝트 등록 폼 자동 채우기', '기존 프로젝트라면 분석 결과를 상세 화면에 저장하고 토글로 재확인', '프로젝트 내용 수정과 증빙 이미지 저장 지원'],
    visual: 'Repository Input → GitHub API → 근거 추출 → AI 분석 → 스펙 완성의 흐름을 표시합니다.',
    script: '프로젝트 분석은 저장소 링크와 본인 아이디만 받습니다. GitHub API로 저장소와 최근 커밋 정보를 가져오고, 작성자의 커밋에서 변경 파일과 patch를 확인합니다. AI는 이 근거를 바탕으로 실제 역할과 주요 활동을 정리하며, 결과는 바로 프로젝트 등록 칸에 채우거나 기존 프로젝트 상세에 저장할 수 있습니다.'
  },
  {
    no: '08', section: 'FEATURE 4', title: '쌓인 스펙은 기업 맞춤 지원서로 이어집니다',
    subtitle: '기업·직무·공고·실제 문항을 입력하면 적합한 경험을 선별해 형식과 톤에 맞게 씁니다.',
    bullets: ['입력: 기업, 직무, 채용공고, 지원 문항, 추가 요구사항', 'AI가 등록된 스펙 중 문항과 직무에 맞는 근거 경험 선별', '문항별 답변, 작성 전략, 사용 근거, 검토 리포트 생성', '실제 문항이 없으면 AI가 추정한 일반 양식임을 명확히 표시', '생성된 글 저장·다시 보기·삭제 지원', '완성 결과를 실제 Word(.docx) 파일로 내려받기', '연락처와 사진·PDF 등 첨부파일은 AI에 전송하지 않음'],
    key: '확인되지 않은 성과를 만들지 않고, 저장된 경험을 근거로 작성합니다.',
    visual: '기업·직무·공고·문항 입력값이 AI 근거 선별을 거쳐 지원서 리포트로 출력되는 구조를 보여줍니다.',
    script: '글 작성 기능은 단순한 자유 생성이 아닙니다. 기업과 직무, 공고, 실제 문항을 입력하면 저장된 커리어 데이터에서 적합한 경험을 먼저 고르고, 그 근거를 활용해 답변을 만듭니다. 결과는 저장해서 다시 볼 수 있고 Word 파일로도 출력할 수 있습니다.'
  },
  {
    no: '09', section: 'BUILD', title: '작게 시작하고, 페이지와 책임을 명확히 분리했습니다',
    subtitle: 'Node.js와 바닐라 JavaScript를 기반으로 빠르게 검증 가능한 해커톤 구조를 선택했습니다.',
    bullets: ['Frontend: Dashboard, Projects, Company Fit, Writing의 기능별 HTML·CSS·JS 분리', 'Common UI: 공통 사이드바, 카테고리 메타데이터, API·파일 유틸리티 재사용', 'Node.js Server: 정적 파일 제공, REST API, 입력 검증, JSON 저장, Word 출력', 'Data: specs.json과 writings.json을 이용한 파일 기반 저장', 'External: GitHub REST API와 Mindlogic Chat Completions API 연동', 'Security: API 키는 .env의 서버 환경변수로만 관리', 'AI 응답은 JSON Schema 형태로 받아 화면에 안정적으로 렌더링'],
    key: '브랜치를 나누지 않아도 페이지별 파일에서 독립적으로 작업할 수 있는 구조를 만들었습니다.',
    visual: 'Frontend → Node.js Server → Data & AI의 3계층 구조도를 사용합니다.',
    script: '해커톤의 제한된 시간 안에서 빠르게 검증할 수 있도록 Node.js 내장 HTTP 서버와 바닐라 JavaScript를 사용했습니다. 화면은 기능별 파일로 분리했고 공통 UI만 재사용합니다. API 키는 브라우저가 아니라 서버 환경변수에 두며, AI 응답은 구조화된 JSON으로 처리합니다.'
  },
  {
    no: '10', section: 'DIFFERENCE', title: 'Carrier는 문장을 대신 쓰기 전에, 근거를 먼저 복원합니다',
    subtitle: '단순 기록 앱이나 단발성 생성형 AI가 놓치는 경험의 연결성이 핵심 차별점입니다.',
    bullets: ['기록 앱: 데이터는 남지만 지원 맥락으로 이어지지 않음', '범용 생성 AI: 맥락이 부족하면 경험을 매번 다시 설명해야 함', 'Carrier: 기록 → 분석 → 작성이 하나의 데이터로 연결', 'GitHub 커밋과 저장된 스펙을 근거로 사용해 설명 가능성을 높임'],
    key: '“내가 뭘 했지?”에서 시작해 “이 경험으로 왜 이 직무에 맞는가”까지 한 번에.',
    visual: '기록 앱, 범용 생성 AI, Carrier를 세 개의 비교 카드로 배치하고 Carrier만 강조합니다.',
    script: '기존 기록 앱은 저장에서 끝나고, 범용 생성 AI는 사용자가 맥락을 다시 설명해야 합니다. Carrier는 저장된 경험과 GitHub 근거를 분석해 같은 데이터가 기업 비교와 지원서 작성까지 이어집니다. 그래서 문장을 잘 만드는 것보다 먼저 근거를 복원하는 데 집중합니다.'
  },
  {
    no: '11', section: 'IMPACT', title: '지원 준비의 시간을 줄이고, 경험의 설득력을 높입니다',
    subtitle: '정량 성과는 서비스 운영 이후 검증하고, 지금은 사용자 행동의 변화를 목표로 합니다.',
    bullets: ['정리 시간: 흩어진 파일 탐색 → 구조화된 스펙 재사용', '프로젝트 회고: 기억에 의존 → 커밋 근거로 역할 복원', '기업 준비: 막연한 스펙 쌓기 → 강점·공백·우선순위 확인', '지원서 작성: 매번 처음부터 작성 → 직무 맞춤 초안에서 시작'],
    key: '검증 지표: 지원서 작성 소요 시간, 생성 초안 채택률, 재방문율, 면접 전환 경험',
    visual: '각 사용자 행동을 Before → After 형태로 네 줄에 걸쳐 비교합니다.',
    script: 'Carrier가 만들고 싶은 변화는 명확합니다. 자료를 찾는 시간을 줄이고, 프로젝트 역할을 근거로 설명하며, 필요한 스펙의 우선순위를 알고, 지원서를 빈 화면이 아니라 맞춤 초안에서 시작하게 하는 것입니다. 운영 단계에서는 작성 시간과 초안 채택률, 재방문율을 측정할 계획입니다.'
  },
  {
    no: '12', section: 'BUSINESS', title: '핵심 기능은 무료로, 문맥형 광고로 지속 가능하게',
    subtitle: 'Google Ads 광고 수요를 AdSense로 연결하되 커리어 원문은 광고 타기팅에 사용하지 않습니다.',
    bullets: ['무료 핵심 기능으로 진입 장벽을 낮추고 지속적인 기록 습관 확보', '광고 위치: 대시보드 하단, 분석 리포트 종료 지점 등 흐름을 방해하지 않는 영역', '광고 문맥: 자격증, 교육, 생산성 도구, 취업 준비 등 페이지 주제 기반', '개인정보 원칙: 연락처·스펙 원문·AI 대화 내용을 광고 개인화 데이터로 전달하지 않음', '광고 밀도와 위치는 A/B 테스트로 관리'],
    key: '수익보다 신뢰가 먼저입니다.',
    visual: '무료 핵심 기능이 사용 빈도를 만들고, 비침해형 광고가 운영 비용을 보완하는 구조를 표현합니다.',
    script: '초기 비즈니스 모델은 Google AdSense입니다. 핵심 기능은 무료로 제공해 기록 빈도를 높이고, 사용 흐름을 방해하지 않는 위치에 문맥형 광고를 배치합니다. 개인의 스펙 원문이나 연락처를 광고 타기팅에 넘기지 않는 것을 원칙으로 합니다.'
  },
  {
    no: '13', section: 'NEXT', title: 'Carrier가 개인의 커리어 운영체제로 성장하는 길',
    subtitle: '해커톤 MVP에서 데이터 신뢰도, 자동화, 장기 커리어 관리로 확장합니다.',
    bullets: ['NOW — MVP 검증: 스펙 통합 관리, 기업·GitHub·지원서 AI', 'NEXT — 데이터 강화: 실제 채용공고 수집, 변경 이력, 이력서·포트폴리오 내보내기', 'LATER — 커리어 에이전트: 마감·준비 일정 추천, 성과 기반 개인화 코칭', '추가 발전: 계정·클라우드 저장, 협업 권한, 공고 자동 매칭, 분석 품질 평가'],
    key: '기록이 쌓일수록, 다음 선택은 더 선명해집니다. 당신의 커리어를, Carrier에.',
    visual: 'NOW → NEXT → LATER의 3단계 로드맵과 마지막 슬로건을 크게 배치합니다.',
    script: '현재는 핵심 흐름을 검증하는 MVP입니다. 다음 단계에서는 실제 채용공고 데이터와 이력서·포트폴리오 내보내기를 강화하고, 장기적으로는 사용자의 일정과 성과까지 이해하는 커리어 에이전트로 확장하겠습니다. 기록이 쌓일수록 다음 선택이 더 선명해지는 서비스, Carrier입니다. 감사합니다.'
  }
];

function text(value, options = {}) {
  return new TextRun({ text: value, font: '맑은 고딕', size: options.size || 21, bold: options.bold, color: options.color || COLORS.navy, italics: options.italics });
}

function paragraph(value = '', options = {}) {
  return new Paragraph({
    alignment: options.alignment,
    heading: options.heading,
    spacing: { before: options.before || 0, after: options.after === undefined ? 120 : options.after, line: options.line || 320 },
    bullet: options.bullet ? { level: options.level || 0 } : undefined,
    children: [text(value, options)]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function sectionTitle(kicker, title, subtitle) {
  const children = [
    paragraph(kicker, { size: 18, bold: true, color: COLORS.blue, after: 80 }),
    paragraph(title, { heading: HeadingLevel.HEADING_1, size: 34, bold: true, color: COLORS.navy, after: 100 })
  ];
  if (subtitle) children.push(paragraph(subtitle, { size: 21, color: COLORS.gray, after: 250 }));
  return children;
}

function labelBlock(label, body, fill = COLORS.paleBlue) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [1650, 7300],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.line },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.line },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.line },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.line },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: COLORS.white },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.line }
    },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 1650, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill }, margins: { top: 130, bottom: 130, left: 140, right: 140 }, children: [paragraph(label, { bold: true, size: 19, color: COLORS.blue, after: 0 })] }),
      new TableCell({ width: { size: 7300, type: WidthType.DXA }, margins: { top: 130, bottom: 130, left: 170, right: 170 }, children: [paragraph(body, { size: 19, color: COLORS.navy, after: 0 })] })
    ] })]
  });
}

function simpleTable(headers, rows, widths) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.line };
  const makeCell = (value, index, header = false) => new TableCell({
    width: { size: widths[index], type: WidthType.DXA },
    shading: header ? { type: ShadingType.CLEAR, fill: COLORS.navy } : undefined,
    margins: { top: 110, bottom: 110, left: 120, right: 120 },
    children: [paragraph(value, { size: header ? 18 : 17, bold: header, color: header ? COLORS.white : COLORS.navy, after: 0, line: 280 })]
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widths,
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((value, index) => makeCell(value, index, true)) }),
      ...rows.map((row) => new TableRow({ children: row.map((value, index) => makeCell(value, index)) }))
    ]
  });
}

function slidePage(slide) {
  const children = [
    ...sectionTitle(`SLIDE ${slide.no} · ${slide.section}`, slide.title, slide.subtitle),
    paragraph('슬라이드에 넣을 내용', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, after: 90 }),
    ...slide.bullets.map((item) => paragraph(item, { bullet: true, size: 19, color: COLORS.gray, after: 70 }))
  ];
  if (slide.key) children.push(new Paragraph({
    spacing: { before: 170, after: 180 },
    shading: { type: ShadingType.CLEAR, fill: COLORS.palePurple },
    border: { left: { style: BorderStyle.SINGLE, size: 16, color: COLORS.purple, space: 8 } },
    children: [text(slide.key, { size: 21, bold: true, color: COLORS.purple })]
  }));
  children.push(paragraph('추천 시각 구성', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, after: 80 }));
  children.push(paragraph(slide.visual, { size: 19, color: COLORS.gray, after: 180 }));
  children.push(paragraph('발표 대본', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, after: 80 }));
  children.push(labelBlock('SPEAKER', slide.script, COLORS.paleMint));
  return children;
}

const content = [];

content.push(
  new Paragraph({ spacing: { before: 1250, after: 180 }, alignment: AlignmentType.CENTER, children: [text('AM:PM 8TH HACKATHON', { size: 22, bold: true, color: COLORS.blue })] }),
  new Paragraph({ spacing: { after: 180 }, alignment: AlignmentType.CENTER, children: [text('Carrier', { size: 58, bold: true, color: COLORS.navy })] }),
  new Paragraph({ spacing: { after: 260 }, alignment: AlignmentType.CENTER, children: [text('커리어를 캐리어에 담다', { size: 34, bold: true, color: COLORS.purple })] }),
  new Paragraph({ spacing: { after: 650 }, alignment: AlignmentType.CENTER, children: [text('발표 슬라이드 구성안 · 발표 원고 · 기능 및 기술 부록', { size: 23, color: COLORS.gray })] }),
  labelBlock('CORE', '스펙 통합 관리 → 기업·직무 비교 → GitHub 기여 분석 → 맞춤 지원서 작성', COLORS.paleBlue),
  new Paragraph({ spacing: { before: 900 }, alignment: AlignmentType.CENTER, children: [text('Carrier Team · 2026.09.19', { size: 18, color: COLORS.gray })] }),
  pageBreak()
);

content.push(
  ...sectionTitle('DOCUMENT GUIDE', '이 문서 사용 방법', '슬라이드 제작과 발표 준비에 필요한 내용을 한 파일에서 찾을 수 있도록 구성했습니다.'),
  paragraph('1부 — 발표 슬라이드 구성', { bullet: true, size: 20, bold: true }),
  paragraph('13장 기준으로 제목, 핵심 문구, 추천 시각 요소, 발표 대본을 제공합니다.', { size: 18, color: COLORS.gray, after: 130 }),
  paragraph('2부 — 서비스 상세 명세', { bullet: true, size: 20, bold: true }),
  paragraph('활동 유형별 입력값, 사용자 흐름, AI 분석 방식, 데이터와 개인정보 처리 원칙을 정리합니다.', { size: 18, color: COLORS.gray, after: 130 }),
  paragraph('3부 — 시연 및 질의응답', { bullet: true, size: 20, bold: true }),
  paragraph('실제 발표에서 사용할 데모 순서, 핵심 KPI, 예상 질문과 답변을 제공합니다.', { size: 18, color: COLORS.gray, after: 260 }),
  labelBlock('ONE LINE', '한 번 기록한 커리어 데이터를 분석과 지원에 반복 활용하는 증거 기반 AI 커리어 서비스', COLORS.paleYellow),
  pageBreak()
);

slides.forEach((slide, index) => {
  content.push(...slidePage(slide));
  if (index < slides.length - 1) content.push(pageBreak());
});

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX A', '서비스 상세 기능 명세', '대시보드에 저장되는 데이터와 기능별 역할을 정리합니다.'));
content.push(simpleTable(
  ['구분', '주요 입력 정보', '특징'],
  [
    ['프로젝트', '이름, 분류, 날짜, 수상, 주요 활동, GitHub 저장소·아이디, 증빙 이미지', 'GitHub AI 분석 결과 저장·불러오기·수정'],
    ['자격증', '자격증 이름, 취득일, 발급기관, 증빙자료', '취득 사실과 증빙파일 관리'],
    ['대외활동', '이름, 기간, 역할, 기관, 활동 내용, 수상, 증빙 이미지', '결과물을 프로젝트 또는 논문으로 별도 생성'],
    ['논문', '논문명, 발행일, 학회·저널, 링크, PDF, 수상', '링크와 논문 자료를 함께 보관'],
    ['어학연수', '프로그램명, 지역, 기간, 기관, 활동 내용, 수상, 증빙 이미지', '지역·기간·활동 중심 기록'],
    ['멘토링', '프로그램명, 멘토·멘티 역할, 기간, 기관, 교육 내용, 수상, 증빙 이미지', '교육한 내용 또는 배운 내용 기록'],
    ['연락처', '이름, 회사·소속, 직함, 전화번호, 이메일, 메모, 명함 이미지', 'AI 분석에서는 전체 연락처 항목 제외']
  ],
  [1250, 4700, 2800]
));
content.push(paragraph('대시보드 표현 규칙', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, before: 260 }));
[
  '요약 영역에는 전체가 아닌 수상 개수와 각 유형별 등록 개수를 표시합니다.',
  '내 활동은 최근 등록순으로 정렬합니다.',
  '수상 활동에는 노란 수상 태그와 카드 우측 하단 사선 리본을 표시합니다.',
  '수상 필터를 이용해 수상한 활동만 모아볼 수 있습니다.',
  '대외활동의 수상과 결과물인 프로젝트·논문의 수상은 서로 독립적으로 저장합니다.',
  '이미지 및 첨부파일 안내 문구는 “첨부파일은 항목당 최대 2MB까지 저장할 수 있습니다.”로 통일합니다.'
].forEach((item) => content.push(paragraph(item, { bullet: true, size: 19, color: COLORS.gray, after: 70 })));

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX B', '서비스가 동작하는 방식', '사용자 입력부터 데이터 저장, 외부 API 분석, 결과 재사용까지의 전체 흐름입니다.'));
content.push(simpleTable(
  ['단계', '처리 내용', '결과'],
  [
    ['1. 기록', '사용자가 활동별 폼을 입력하고 필요한 증빙을 첨부', 'specs.json에 구조화된 활동 저장'],
    ['2. 탐색', '서버에서 활동 목록을 불러와 최근순·유형별·수상별 표시', '대시보드 카드와 상세 화면'],
    ['3. 기업 분석', '기업·직무·공고와 개인정보를 제거한 스펙 텍스트를 Mindlogic에 전달', '강점·공백·우선순위 리포트'],
    ['4. GitHub 분석', 'GitHub API에서 저장소와 본인 커밋의 파일·patch 근거 수집 후 AI 분석', '역할·주요 활동·포트폴리오 문장'],
    ['5. 프로젝트 완성', '분석 결과를 새 프로젝트 폼에 채우거나 기존 프로젝트에 저장', '재사용 가능한 프로젝트 스펙'],
    ['6. 글 작성', '기업·직무·문항과 커리어 텍스트를 AI가 분석', '문항별 답변과 작성 전략'],
    ['7. 보관·출력', '생성 글을 writings.json에 저장하고 서버에서 문서 생성', '다시 보기 및 Word 다운로드']
  ],
  [1250, 5000, 2500]
));
content.push(paragraph('핵심 데이터 루프', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, before: 260 }));
content.push(labelBlock('FLOW', '기록 → 근거 분석 → 스펙 보강 → 기업 비교 → 지원서 작성 → 결과 저장 → 다음 지원에서 재사용', COLORS.palePurple));

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX C', 'AI 기능과 외부 연동', '각 기능은 목적에 맞는 별도 프롬프트와 구조화된 응답 형식을 사용합니다.'));
content.push(simpleTable(
  ['기능', '입력', 'AI 출력', '권장 테스트 모델'],
  [
    ['기업 분석', '기업, 직무, 경력, 공고, 연락처·첨부 제외 스펙', '적합도, 강점, 부족한 역량, 준비 행동', 'gpt-5.6-sol'],
    ['프로젝트 분석', '저장소 메타데이터, README, 언어, 본인 커밋·patch', '프로젝트 요약, 기술, 역할, 주요 활동, 근거', 'gpt-5.6-luna'],
    ['글 작성', '기업, 직무, 공고, 문항, 추가 요구, 텍스트 스펙', '문항별 답변, 전략, 검토 리포트', 'gpt-5.6-luna']
  ],
  [1700, 3200, 2800, 1500]
));
content.push(paragraph('GitHub 분석 원칙', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, before: 260 }));
[
  '저장소 전체의 목적과 본인의 기여를 구분합니다.',
  '커밋 메시지만 보지 않고 변경 파일과 patch를 기여 근거로 사용합니다.',
  '확인되지 않은 성과와 역할은 생성하지 않으며 분석 한계를 함께 표시합니다.',
  '공개 저장소는 토큰 없이 분석할 수 있고, 비공개 저장소 또는 호출 한도 확장이 필요하면 서버의 GITHUB_TOKEN을 사용합니다.'
].forEach((item) => content.push(paragraph(item, { bullet: true, size: 19, color: COLORS.gray, after: 70 })));
content.push(paragraph('AI 연결 원칙', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, before: 180 }));
[
  'Mindlogic API 키와 모델명은 .env 환경변수로 관리하고 브라우저에 노출하지 않습니다.',
  '분석별로 JSON Schema를 지정해 화면에서 사용할 수 있는 구조화된 결과를 받습니다.',
  'API 오류, 모델 미설정, 응답 형식 오류를 사용자에게 명확히 표시합니다.'
].forEach((item) => content.push(paragraph(item, { bullet: true, size: 19, color: COLORS.gray, after: 70 })));

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX D', '기술 구조와 파일 구성', '기능별 화면을 분리해 동시에 작업하기 쉽고 변경 범위를 예측할 수 있습니다.'));
content.push(simpleTable(
  ['계층', '구성', '책임'],
  [
    ['공통 화면', 'public/js/common.js, public/css/common.css', '사이드바, 카테고리 메타, API·파일 유틸리티'],
    ['대시보드', 'index.html, dashboard.js, dashboard.css', '스펙 등록·목록·필터·상세·삭제'],
    ['프로젝트', 'projects.html, projects.js, projects.css', '프로젝트 CRUD와 GitHub 커밋 AI 분석'],
    ['기업 분석', 'company-analysis.html/js/css', '기업·직무·공고 기반 스펙 비교'],
    ['글 작성', 'writing.html/js/css', '지원서 생성·저장·다시 보기·Word 출력'],
    ['서버', 'server.js', '정적 파일, REST API, 검증, AI·GitHub 호출, DOCX 생성'],
    ['데이터', 'data/specs.json, data/writings.json', '활동과 생성 글을 JSON 형식으로 보관']
  ],
  [1500, 3400, 3800]
));
content.push(paragraph('구현 선택의 이유', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, before: 260 }));
[
  'Node.js 내장 HTTP 서버와 바닐라 JavaScript로 의존성을 줄여 빠르게 MVP를 검증했습니다.',
  '기능별 HTML·CSS·JS를 분리해 프로젝트 분석과 기업 분석을 서로 다른 파일에서 독립적으로 개발할 수 있게 했습니다.',
  'JSON 파일 저장은 해커톤 데모에 적합한 단순한 구조이며, 실제 서비스에서는 데이터베이스와 사용자 인증으로 교체할 수 있습니다.',
  'Word 출력에는 docx 패키지를 사용하고 발표자료 생성에는 PptxGenJS를 사용했습니다.'
].forEach((item) => content.push(paragraph(item, { bullet: true, size: 19, color: COLORS.gray, after: 70 })));

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX E', '개인정보와 데이터 안전 원칙', 'AI 기능이 사용자의 민감한 정보를 불필요하게 전송하지 않도록 서버에서 데이터를 선별합니다.'));
[
  ['연락처 제외', '연락처 카테고리 전체를 기업 분석과 글 작성의 AI 입력에서 제외합니다.'],
  ['첨부 제외', '이미지 Data URL, 논문 PDF, 자격증 증빙 등 파일 본문은 AI에 전송하지 않습니다.'],
  ['키 보호', 'Mindlogic API 키와 GitHub 토큰은 서버의 .env에만 저장합니다.'],
  ['입력 검증', '허용된 카테고리와 필드만 저장하고 이미지 형식·외부 URL·필수값을 검사합니다.'],
  ['파일 제한', '첨부파일은 항목당 최대 2MB로 제한합니다.'],
  ['광고 분리', '커리어 원문과 AI 대화 내용을 광고 개인화 데이터로 전달하지 않습니다.'],
  ['MVP 한계', '현재 JSON 파일 저장 방식은 개인 로컬 데모용이며, 상용화 시 인증·암호화·DB·접근권한·보존정책이 필요합니다.']
].forEach(([label, body], index) => {
  content.push(labelBlock(label, body, index % 2 ? COLORS.paleMint : COLORS.paleBlue));
  content.push(paragraph('', { after: 70 }));
});

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX F', '발표 시연 시나리오', '5분 발표를 기준으로 핵심 가치를 가장 빠르게 보여주는 순서입니다.'));
content.push(simpleTable(
  ['시간', '화면', '시연 내용', '강조 문장'],
  [
    ['0:00–0:30', '표지·문제', '서비스 이름과 사용자의 반복적인 취업 준비 문제 소개', '경험이 아니라 연결 구조가 부족합니다.'],
    ['0:30–1:20', '대시보드', '유형별 개수, 최신 활동, 수상 필터, 새 활동 등록', '한 번 기록한 스펙이 모든 기능의 원본이 됩니다.'],
    ['1:20–2:20', '프로젝트 분석', '저장소 링크와 아이디 입력 후 역할·주요 활동 결과 확인', '기억이 아니라 커밋 근거로 기여를 복원합니다.'],
    ['2:20–3:10', '기업 분석', '기업·직무·공고 입력 후 강점과 부족한 역량 확인', '무엇을 더 준비할지 우선순위로 보여줍니다.'],
    ['3:10–4:10', '글 작성', '기업·직무·문항으로 답변 생성 후 저장 및 Word 출력', '저장된 경험을 근거로 지원서까지 이어집니다.'],
    ['4:10–5:00', '차별점·효과·BM·로드맵', '증거 기반 루프, 기대효과, AdSense, 발전 방향 정리', '기록이 쌓일수록 다음 선택이 선명해집니다.']
  ],
  [1100, 1500, 3700, 2400]
));
content.push(paragraph('시연 준비 체크리스트', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, before: 260 }));
[
  'npm start 실행 전 3000 포트가 비어 있는지 확인합니다.',
  '.env에 Mindlogic API 키와 분석별 모델명이 설정되어 있는지 확인합니다.',
  '공개 GitHub 저장소와 커밋이 있는 사용자 아이디를 미리 준비합니다.',
  'AI 응답 지연에 대비해 저장된 분석 결과와 생성 글을 미리 준비합니다.',
  '개인정보가 포함된 실제 연락처 데이터는 발표 화면에 노출하지 않습니다.',
  '네트워크 실패 시 사용할 화면 캡처 또는 짧은 녹화본을 준비합니다.'
].forEach((item) => content.push(paragraph(item, { bullet: true, size: 19, color: COLORS.gray, after: 70 })));

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX G', '기대효과와 검증 지표', '효과를 주장하는 데서 끝내지 않고 운영 단계에서 측정할 지표를 정의합니다.'));
content.push(simpleTable(
  ['가설', '검증 지표', '측정 방법'],
  [
    ['지원 준비 시간이 줄어든다', '지원서 초안 완성까지 걸린 시간', 'Carrier 사용 전·후 동일 과제 비교'],
    ['AI 초안이 실제로 유용하다', '초안 채택률, 수정 비율, 복사·Word 출력률', '생성 이후 사용자 행동 이벤트'],
    ['프로젝트 회고 품질이 높아진다', '저장된 AI 분석 사용률, 사용자 수정량', '분석 원문과 최종 프로젝트 내용 비교'],
    ['보완 우선순위가 행동으로 이어진다', '추천 행동 완료율, 스펙 추가율', '분석 후 일정 기간 내 활동 변화'],
    ['커리어 데이터가 누적된다', '재방문율, 월간 활동 등록 수', '사용자 코호트별 추적'],
    ['지원 성과가 개선된다', '서류·면접 전환 경험', '사용자 선택형 사후 설문']
  ],
  [2600, 3000, 2700]
));

content.push(pageBreak());
content.push(...sectionTitle('APPENDIX H', '예상 질문과 답변', '해커톤 심사에서 나올 가능성이 높은 질문에 대한 짧은 답변입니다.'));
const qa = [
  ['Q1. ChatGPT에 스펙을 넣는 것과 무엇이 다른가요?', 'Carrier는 대화 한 번으로 끝나지 않습니다. 활동을 구조화해 저장하고 GitHub 근거로 프로젝트를 복원한 뒤, 동일한 데이터를 기업 비교와 지원서 작성에 반복 사용합니다.'],
  ['Q2. AI가 없는 성과를 만들어낼 위험은 없나요?', '프롬프트에서 저장된 스펙과 커밋 근거만 사용하도록 제한하고, 구조화된 결과에 근거와 한계를 함께 포함합니다. 최종 저장 전 사용자가 수정할 수 있습니다.'],
  ['Q3. 채용공고를 자동으로 찾나요?', '현재 MVP는 사용자가 공고 상세를 입력하는 방식입니다. 공고가 없을 때는 일반적인 직무 요건 기반이라는 가정을 명시하며, 다음 단계에서 공고 수집과 자동 매칭을 추가할 계획입니다.'],
  ['Q4. 개인정보는 안전한가요?', '연락처 항목과 이미지·PDF 등 첨부파일 본문을 AI 요청에서 제외하고 API 키는 서버 환경변수로만 관리합니다. 다만 상용화 단계에서는 인증, DB 암호화, 권한과 보존정책이 추가로 필요합니다.'],
  ['Q5. GitHub 분석은 어떤 근거를 사용하나요?', '저장소 메타데이터와 README, 사용 언어뿐 아니라 입력한 사용자 아이디의 최근 커밋, 변경 파일, patch를 수집해 본인의 코드 기여를 중심으로 분석합니다.'],
  ['Q6. 비공개 저장소도 분석할 수 있나요?', '서버에 권한이 있는 GitHub 토큰을 설정하면 확장할 수 있습니다. 현재 발표에서는 공개 저장소를 기본 시나리오로 사용합니다.'],
  ['Q7. 수익 모델이 광고뿐인가요?', '초기에는 무료 핵심 기능과 비침해형 문맥 광고로 사용성을 검증합니다. 이후 고급 분석, 무제한 문서 출력, 포트폴리오 템플릿, 학교·부트캠프용 B2B 기능 등으로 확장할 수 있습니다.'],
  ['Q8. JSON 파일 저장으로 실제 서비스가 가능한가요?', '현재 구조는 해커톤 MVP의 빠른 검증을 위한 선택입니다. 실제 서비스 전환 시 사용자 인증과 관계형 또는 문서형 DB, 객체 스토리지, 암호화와 백업 구조로 교체합니다.'],
  ['Q9. 경쟁 서비스 대비 핵심 한 문장은 무엇인가요?', 'Carrier는 문장을 대신 쓰기 전에 사용자의 경험과 코드 기여 근거를 먼저 복원하고, 그 근거를 모든 지원 단계에서 재사용합니다.']
];
qa.forEach(([question, answer]) => {
  content.push(paragraph(question, { size: 21, bold: true, color: COLORS.purple, before: 150, after: 60 }));
  content.push(paragraph(answer, { size: 19, color: COLORS.gray, after: 110 }));
});

content.push(pageBreak());
content.push(...sectionTitle('FINAL SCRIPT', '30초 엘리베이터 피치', '시간이 부족할 때 사용할 수 있는 압축 발표문입니다.'));
content.push(labelBlock('30 SEC', 'Carrier는 흩어진 스펙을 한곳에 기록하고, GitHub 커밋으로 잊힌 프로젝트 기여를 복원하며, 기업과 직무가 원하는 역량과 내 스펙의 차이를 AI로 분석하는 서비스입니다. 이렇게 쌓인 근거는 기업 맞춤 자기소개서와 입사지원서 작성까지 이어집니다. 한 번 기록한 커리어 데이터를 모든 지원 단계에서 다시 쓰는 것, 그것이 Carrier의 핵심입니다.', COLORS.palePurple));
content.push(paragraph('마지막 한 문장', { heading: HeadingLevel.HEADING_2, size: 25, bold: true, before: 320, after: 100 }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [text('“기록이 쌓일수록, 다음 선택은 더 선명해집니다. 당신의 커리어를, Carrier에.”', { size: 26, bold: true, color: COLORS.blue })] }));

const document = new Document({
  creator: 'Carrier Team',
  title: 'Carrier AM:PM 8th Hackathon 발표자료 구성안',
  subject: 'Carrier 서비스 발표 슬라이드 구성, 발표 원고, 기능 및 기술 부록',
  description: 'Carrier 해커톤 발표 준비용 종합 문서',
  styles: {
    default: { document: { run: { font: '맑은 고딕', size: 21, color: COLORS.navy }, paragraph: { spacing: { line: 320 } } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { font: '맑은 고딕', size: 56, bold: true, color: COLORS.navy }, paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 240 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: '맑은 고딕', size: 34, bold: true, color: COLORS.navy }, paragraph: { spacing: { before: 180, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: '맑은 고딕', size: 25, bold: true, color: COLORS.navy }, paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 } }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 900, right: 900, bottom: 900, left: 900 },
        size: { width: 11906, height: 16838 }
      }
    },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [text('CARRIER · AM:PM 8TH HACKATHON', { size: 15, bold: true, color: '98A4B7' })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [text('Carrier Presentation Guide  ·  ', { size: 15, color: '98A4B7' }), new TextRun({ children: [PageNumber.CURRENT], font: '맑은 고딕', size: 15, color: '98A4B7' })] })] }) },
    children: content
  }]
});

Packer.toBuffer(document)
  .then(async (buffer) => {
    const fs = require('fs/promises');
    await fs.writeFile(OUTPUT, buffer);
    console.log(OUTPUT);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
