# Carrier 실행 및 설정

## 실행

Node.js 18 이상에서 별도 패키지 설치 없이 실행할 수 있습니다.

```bash
npm start
```

브라우저에서 <http://127.0.0.1:3000>으로 접속합니다.

## GitHub 커밋 AI 분석 설정

`.env.example`을 복사해 `.env` 파일을 만들고 OpenAI API 키를 입력합니다.

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5.6-luna
```

공개 GitHub 저장소는 토큰 없이 분석할 수 있습니다. 비공개 저장소를 분석하거나 GitHub API 호출 한도를 높이려면 `GITHUB_TOKEN`도 설정합니다.

AI 분석은 프로젝트 등록 화면에서 GitHub 저장소 주소와 본인 GitHub 아이디를 입력한 뒤 실행할 수 있습니다. 최근 커밋의 변경 파일과 patch를 수집해 본인이 작성한 코드와 기여 내용을 중심으로 요약합니다.

## 저장 데이터

활동은 `data/specs.json`에 최근 등록순으로 저장됩니다. 증빙자료, 논문 PDF, 명함 이미지는 초기 버전에서 Data URL 형식으로 같은 JSON 파일에 저장되며 파일당 최대 크기는 2MB입니다.
