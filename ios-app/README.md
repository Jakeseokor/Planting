# 타이어 수첩 – 아이폰 앱 (Capacitor)

`../public/tire/index.html`(웹 앱)을 그대로 아이폰 앱으로 감싼 Xcode 프로젝트입니다.
앱 안에서 기록은 기기에 저장되고, 백업 내보내기는 iOS 공유 시트(파일 앱 저장·에어드롭 등)로 열립니다.

## 필요한 것
- Mac + **Xcode 16 이상** (App Store에서 무료 설치)
- Node.js 20 이상 (https://nodejs.org)
- Apple ID (무료 계정으로 내 아이폰에 설치 가능, 7일마다 다시 설치해야 함)
  - 7일 제한 없이 쓰거나 TestFlight·App Store 배포를 하려면 Apple Developer Program(연 129,000원)이 필요합니다.

## 내 아이폰에 설치하기
```bash
cd ios-app
npm install        # 앱 구성 요소 내려받기
npm run sync       # 웹 앱 최신본을 앱에 복사
npm run open       # Xcode로 열기
```
Xcode에서:
1. 왼쪽 **App** 프로젝트 → **Signing & Capabilities** → **Team**에서 내 Apple ID 선택
   (처음이면 Xcode → Settings → Accounts에서 Apple ID 추가).
   "Bundle Identifier가 이미 쓰인다"는 오류가 나면 `com.jakeseokor.tirenote` 끝에 아무 글자나 붙입니다.
2. 아이폰을 USB로 연결 → 위쪽 실행 대상에서 내 아이폰 선택 → ▶ 실행.
3. 아이폰 **설정 → 일반 → VPN 및 기기 관리**에서 내 Apple ID 개발자를 **신뢰**,
   **설정 → 개인정보 보호 및 보안 → 개발자 모드** 켜기(처음 한 번).

## 웹 앱을 고친 뒤
`public/tire/index.html`을 고치면 `npm run sync` 후 Xcode에서 다시 ▶ 실행합니다.

## 알아 둘 점
- 앱과 홈 화면 웹 앱(Safari)은 저장소가 따로라서 기록이 공유되지 않습니다. 옮길 때는 백업 내보내기 → 불러오기를 쓰세요.
- 앱을 지우면 기록도 지워집니다. 가끔 백업을 내보내 두세요.
