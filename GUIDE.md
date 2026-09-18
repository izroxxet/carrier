# Carrier 실행 및 설정

## 실행

Node.js 18 이상에서 의존성을 설치한 뒤 실행합니다.

```bash
npm install
npm start
```

브라우저에서 <http://127.0.0.1:3000>으로 접속합니다.

## Mindlogic AI 설정

`.env.example`을 복사해 `.env` 파일을 만들고 Mindlogic API 키를 입력합니다.

```env
MINDLOGIC_API_KEY=your_api_key
MINDLOGIC_MODEL=gpt-5.6-sol
MINDLOGIC_PROJECT_MODEL=gpt-5.6-luna
MINDLOGIC_WRITING_MODEL=gpt-5.6-luna
```

공개 GitHub 저장소는 토큰 없이 분석할 수 있습니다. 비공개 저장소를 분석하거나 GitHub API 호출 한도를 높이려면 `GITHUB_TOKEN`도 설정합니다.

AI 분석은 프로젝트 분석 페이지(`/projects.html`)에서 GitHub 저장소 주소와 본인 GitHub 아이디를 입력한 뒤 실행할 수 있습니다. 최근 커밋의 변경 파일과 patch를 수집해 본인이 작성한 코드와 기여 내용을 중심으로 요약합니다.

글 작성 페이지(`/writing.html`)에서는 지원 기업, 직무, 공고 내용과 실제 지원 문항을 입력해 등록한 스펙 기반의 자기소개서·입사지원서 초안을 만들 수 있습니다. 실제 문항을 제공하지 않으면 현재 공식 양식을 조회한 것으로 표시하지 않고 일반적인 지원서 구조를 AI가 추정해 구성합니다. 연락처와 사진·PDF 등 첨부파일은 AI 요청에서 제외됩니다.

## 저장 데이터

활동은 `data/specs.json`에 최근 등록순으로 저장됩니다. 증빙자료, 논문 PDF, 명함 이미지는 Data URL 형식으로 같은 JSON 파일에 저장되며 파일당 최대 크기는 2MB입니다. 프로젝트·대외활동·어학연수·멘토링에는 이미지 증빙자료를 등록할 수 있습니다.

AI로 생성해 사용자가 저장한 지원서는 `data/writings.json`에 보관됩니다. 글 작성 페이지에서 다시 열람하거나 삭제할 수 있으며 실제 `.docx` Word 문서로 내려받을 수 있습니다.

## 프런트엔드 구조

```text
public/
├─ index.html                    # 대시보드·내 커리어
├─ projects.html                 # 프로젝트 등록·AI 분석
├─ company-analysis.html         # 기업·스펙 비교
├─ writing.html                  # 스펙 기반 지원서 작성
├─ css/
│  ├─ common.css                 # 사이드바, 폼, 공통 컴포넌트
│  ├─ dashboard.css
│  ├─ projects.css
│  ├─ company-analysis.css
│  └─ writing.css
└─ js/
   ├─ common.js                  # 공통 레이아웃과 API 유틸리티
   ├─ dashboard.js
   ├─ projects.js
   ├─ company-analysis.js
   └─ writing.js
```

각 페이지 담당자는 해당 HTML, CSS, JavaScript 파일을 함께 수정하고, 공통 파일 변경이 필요한 경우 팀원과 먼저 조율하는 것을 권장합니다.
