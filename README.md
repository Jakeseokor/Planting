# 초록 친구 – 실내 화초 가이드 (iPad PWA)

그림과 짧은 설명만 보고 실내 화초 15종을 따라 키우는 iPad용 웹앱입니다.
Safari "홈 화면에 추가"로 설치하면 비행기 모드에서도 모든 화면이 열립니다.

```bash
npm install
npm run dev      # 개발 서버 (일러스트 모아 보기: #/gallery)
npm run build    # dist/ 생성 (서비스 워커 포함)
npm run preview  # 빌드 결과 확인
npm run format   # 코드 서식 정리
```

- 화초 데이터: `src/data/plants.ts` (형식: `src/data/types.ts`)
- 문제 해결 데이터: `src/data/troubles.ts`
- 일러스트: `src/components/illustrations/` (viewBox 0 0 200 200, 공통 도구 `kit.tsx`)
- 내 화초 기록: 기기 안 IndexedDB (막힌 환경에서는 localStorage)

## 배포

주소가 `#/plant/...` 형태(HashRouter)이고 빌드 결과가 상대 경로라서, 아래 두 방법 모두 설정 파일 없이 동작합니다.

### claude.ai 아티팩트 (지금 공개 중인 웹 버전)

```bash
npm run build:artifact   # dist-artifact/planting.html (JS·CSS를 넣은 단일 파일)
```

- 서비스 워커를 쓸 수 없는 환경이라 PWA 기능(홈 화면 설치·오프라인)은 빠지고, 화면 이동은 주소 대신 앱 안에서 처리합니다.
- 내 화초 기록은 보는 사람의 브라우저에 따로 저장됩니다.
- **새 화초 추가**: 편집 권한이 있는 사람에게만 "+ 새 화초" 버튼이 보입니다. 이름을 넣으면 AI(claude.ai)가
  기존 화초와 같은 형식으로 정보를 만들고, "도감에 추가"를 누르면 페이지가 그 화초를 담아 새 버전으로 다시 게시됩니다.
  추가한 화초는 페이지 안 `<script id="custom-plants">` 블록에 들어 있으므로, 코드를 고쳐 다시 게시할 때는
  게시된 최신 버전에서 이 블록을 가져와 합쳐야 추가한 화초가 지워지지 않습니다.

### A. GitHub Pages (무료, 이 저장소에 준비됨)

`master` 에 push 하면 GitHub Actions 가 빌드해서 결과를 `gh-pages` 브랜치에 올립니다.

1. 첫 배포가 끝나 `gh-pages` 브랜치가 생기면, 저장소 **Settings → Pages → Build and deployment** 에서
   **Source: Deploy from a branch**, **Branch: `gh-pages` / `(root)`** 로 저장합니다.
2. 1~2분 뒤 주소: **https://jakeseokor.github.io/Planting/**
3. 이후에는 `master` 에 push 할 때마다 자동 배포됩니다. (수동 실행: Actions → Deploy to GitHub Pages → Run workflow)

### B. Vercel

1. https://vercel.com 에 GitHub 계정으로 로그인 → **Add New → Project** → `Planting` 저장소 **Import**.
2. Framework Preset 이 **Vite** 로 자동 선택됩니다(Build `npm run build`, Output `dist`). 그대로 **Deploy**.
3. 발급된 `https://<프로젝트>.vercel.app` 주소를 씁니다. 이후 push 할 때마다 자동 배포됩니다.

## iPad에 설치하기

1. iPad **Safari** 로 배포 주소를 엽니다. (Chrome 등 다른 앱은 홈 화면 앱 설치가 제한됨)
2. 주소창 옆 **공유(□↑) → 홈 화면에 추가 → 추가**.
3. 홈 화면의 **초록 친구** 아이콘으로 한 번 열고, 인터넷이 켜진 상태로 **10초쯤** 둡니다(앱 전체를 기기에 저장하는 시간).

### 오프라인 확인 방법

1. 제어 센터에서 **비행기 모드** 켜기 (Wi-Fi도 꺼졌는지 확인).
2. 홈 화면 앱을 완전히 닫았다가(앱 전환기에서 위로 밀기) 다시 엽니다.
3. 화초 도감 → 아무 화초 상세, 문제 해결 → 아무 증상, 내 화초 등록까지 열리면 성공입니다.

### 알아 둘 점

- **내 화초 기록은 홈 화면 앱 안에 따로 저장됩니다.** Safari 탭에서 등록한 기록은 홈 화면 앱에 보이지 않으니, 설치 후 홈 화면 앱에서 등록하세요.
- 앱을 지우면 기록도 함께 지워집니다.
- 새 버전을 배포하면, 인터넷이 켜진 상태에서 앱을 한 번 열었다가 **다시 열 때** 반영됩니다.

## 타이어 수첩 (전기차 타이어 교체·위치교환 기록, 별도 앱)

`public/tire/index.html` 단일 파일. 빌드하면 그대로 복사되어 **https://jakeseokor.github.io/Planting/tire/** 에서 열립니다.
iPhone/iPad Safari → 공유 → 홈 화면에 추가. 데이터는 그 기기의 localStorage에만 저장되므로 설정 탭에서 가끔 백업(JSON)을 내보내세요.

- 규칙: 신품은 항상 앞 → 앞 4만 km → 뒤로 이동 → 뒤 4만 km → 폐기 (설정에서 거리 변경 가능)
- 타이어는 앞·뒤 각각 4만 km까지만 사용. 위치교환은 앞 타이어가 앞에서 4만 km 또는 뒤 타이어가 뒤에서 4만 km 중 먼저 닿는 시점에 실행
- 앞을 한 번도 쓰지 않은 뒤 타이어(예: 처음의 B)는 뒤 4만 km가 되면 앞으로 올라가 4만 km를 더 쓰고, 앞 타이어는 뒤로 내려감(폐기·신품 없음). 갈 자리가 없는 쌍은 폐기하고 빈자리에 신품
- 주행거리 입력으로 그 지점을 넘으면 위치교환 화면이 자동으로 열리고, 그 전에는 실행되지 않음(먼저 바꿔야 하면 '비정상 교체')
- 조기 교체 경고: 트레드 3.0mm 이하, 제조(DOT) 6년(5년 주의). km 일정보다 먼저 표시
- 비정상 교체: 사유를 기록하면 이후 일정 자동 재계산 / 트레드 점검 알림 1만 km마다

## 사주 명식 (음력 생년월일시로 사주팔자 풀이, 별도 앱)

`public/saju/` (index.html + 계산 엔진 `saju-core.js` + 풀이 `saju-reading.js`). 빌드하면 그대로 복사되어
**https://jakeseokor.github.io/Planting/saju/** 에서 열립니다. 서버 없이 브라우저 안에서만 계산합니다.

- 입력: 이름(선택), 성별, 음력 생년월일(윤달), 태어난 시간(모르면 6글자 풀이), 출생지(지방시 보정), 자시 기준
- 음력 → 양력: `vendor/korean-lunar-calendar.min.js` (한국천문연구원 기준, MIT, 1000~2050년)
- 년주는 입춘, 월주는 12절 절입 시각(태양 황경 직접 계산, 오차 약 ±15분), 일주는 율리우스일, 시주는 2시간 단위
- 한국 표준시 이력 반영: 1908~1911·1954~1961년 UTC+8:30, 1948~1960·1987~1988년 서머타임
- 출생지 경도로 지방 평균시 보정(서울 −32분). 23시 이후는 기본적으로 다음 날 일주(야자시 선택 가능)
- 풀이: 한 줄 결론 → 명식표(십성·지장간·12운성) → 일간 성향 → 오행·십성 분포 → 신강/신약·용신(행운 색·방향·숫자)
  → 합충·신살 → 연애·배우자 → 대운(현재 위치) → 올해·내년 세운 → 계산 근거
- 마지막 입력값은 그 기기의 localStorage에 기억됩니다.
- **쇼츠 영상 만들기 버튼**: 풀이 맨 아래 버튼을 누르면 브라우저 안에서 30초 세로 영상(배경음악 포함)을 그리며 녹화합니다(약 30초).
  Chrome·Safari 최신판은 MP4(H.264), 그 밖의 브라우저는 WebM으로 저장되고, 휴대폰에서는 "공유하기"로 바로 앱에 올릴 수 있습니다.
  녹화하는 동안 다른 탭으로 가면 장면이 멈출 수 있습니다.

### 사주 쇼츠 영상 만들기 (30초, 1080×1920 MP4)

사주 명식과 같은 계산 엔진으로 풀이한 결과를 세로 쇼츠 영상(배경음악 포함)으로 만듭니다. 필요: `ffmpeg`, Playwright Chromium.

```bash
npm install
npx playwright install chromium     # 처음 한 번 (Playwright 가 없으면 npm i -D playwright 먼저)
npm run shorts -- --lunar 1985-03-15 --time 07:30 --gender M --example
npm run shorts -- --lunar 1990-05-10 --leap --time unknown --gender F --name 김하늘 --out haneul.mp4
npm run shorts -- --lunar 1985-03-15 --time 07:30 --gender M --keys   # 장면 8개 미리보기 PNG만 (몇 초)
npm run shorts -- --help
```

- 구성(8장면): 첫 장면 질문 → 여덟 글자 → 일간 → 오행 → 타고난 무기(십성·신살) → 대운·올해·내년 → 행운 처방 → 마무리
- 장면 문구·캔버스 그림·배경음악은 앱 버튼과 같은 `public/saju/saju-shorts.js` 를 쓰므로 버튼과 결과가 같습니다. CLI(`scripts/saju-shorts/make.mjs`)는 프레임을 캡처해 ffmpeg으로 MP4(H.264)를 만듭니다.
- 글꼴은 devDependencies 의 `@fontsource/*` 를 써서 한글 글꼴이 없는 서버에서도 똑같이 나옵니다. 결과 `*.mp4` 는 git 에서 제외됩니다.
