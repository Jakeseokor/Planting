# WakeUpChallenge (iOS)

미션을 완료해야 꺼지는 알람 앱. 소스는 `WakeUpChallenge/`, Xcode 프로젝트는 `project.yml`(XcodeGen)로 생성합니다.

## GitHub Actions로 빌드 산출물 받기
1. `main`이 아닌 이 브랜치에 `ios/` 변경이 push되면 `iOS Build` 워크플로가 자동 실행됩니다. (수동 실행: Actions 탭 → iOS Build → Run workflow)
2. 실행이 끝나면 Artifacts에서 `WakeUpChallenge-simulator` (시뮬레이터용 `.app` zip)을 내려받습니다.
3. 이 산출물은 **시뮬레이터 전용**이며 서명되지 않아 실기기나 App Store에는 설치할 수 없습니다.

## 실기기 설치 (.ipa)
실기기 설치에는 Apple Developer 계정의 서명 인증서와 프로비저닝 프로파일이 필요합니다. 이를 GitHub Secrets에 넣으면 같은 워크플로에서 `.ipa`를 만들 수 있으며, 그 설정은 별도 작업입니다.

## 로컬 빌드 (Mac)
```
brew install xcodegen
cd ios && xcodegen generate && open WakeUpChallenge.xcodeproj
```

## 한계
- 카메라, 가속度계, 걸음 수는 실기기에서만 동작합니다.
- 무음·집중 모드에서는 알람 소리가 나지 않을 수 있습니다. (v2에서 AlarmKit 검토)
