# Serverless Functions<img src="https://github.com/user-attachments/assets/38618fea-ad8a-461c-b618-a485f844e35d" align=left width=100>

![GitHub License](https://img.shields.io/github/license/dohyeon5626/serverless-functions?style=flat&color=green) ![Api Gateway](https://img.shields.io/badge/api_gateway-running-blue) ![Event Bridge](https://img.shields.io/badge/event_bridge-running-blue)
<br/><br/>

<img width="100%" align=center alt="readme" src="https://github.com/user-attachments/assets/c97dee6d-5fb4-46eb-af65-917e23af0a88">
<br/><br/>

각종 개인 프로젝트에서 쓰이는 서버리스 함수 모노레포입니다.<br/>
확장 프로그램, 단순한 웹 서비스, 배치성 프로그램 등 단순하고 작은 개인 프로젝트들을 위한 서버 기능이 필요할 때 사용합니다.<br/>
[Serverless 프레임워크](https://www.serverless.com)를 이용하여 개발되었습니다.<br/>
<br/>

---

### baekjoon-problem-letter
문제 추천 구독 정보 저장 및 이메일 발송, 배치를 통한 문제 추천 기능을 운영 중입니다.
> [Baekjoon Problem Letter](https://github.com/dohyeon5626/baekjoon-problem-letter)
```
1. 구독 생성 Api
- POST /subscription

2. 구독 취소 Api
- DELETE /subscription

3. 문제 추천 이메일 발송 배치
- cron(0,30 21-23 * * ? *) // 매일 KST 06:00 ~ 08:30
- cron(0,30 0-14 * * ? *) // 매일 KST 09:00 ~ 23:30

4. 티어 업데이트 및 문제 업데이트 배치
- cron(0 15 * * ? *) // 매일 KST 00:00
- 티어 업데이트 관련 eventBridge // 요청 수 제한을 벗어나기 위해서 여러번에 걸쳐서 배치를 진행함
```


### github-html-preview
깃허브 파일을 가져오기 위한 프록시와 Oauth를 위한 기능을 운영중입니다.
> [Github Html Preview Extension](https://github.com/dohyeon5626/github-html-preview-extension), [Github Html Preview Page](https://github.com/dohyeon5626/github-html-preview-page)
```
1. 깃허브 Content를 Header없이 Url로 가져오기 위한 Proxy Api
- GET /github-html-preview/content/{token}/{proxy+}

2. 깃허브 Content Proxy Api 사용시 Github Token을 숨기기 위한 Jwe 발급 Api
- POST /github-html-preview/token

3. 깃허브 Oauth를 위한 로그인 페이지 리다이렉트 Api
- GET /github-oauth/authorize

4. 깃허브 Oauth를 위한 토큰 정보 Api
- POST /github-oauth/token
```

### monitoring-system
각종 개인 프로젝트의 운영 상태를 모니터링하고 알림을 받기 위해 사용하고 있습니다.<br/>
특히 확장 프로그램의 경우, 대상 사이트의 선택자가 변경되면 구조적으로 오류가 발생할 수밖에 없는데, 이러한 문제를 빠르게 감지하고 즉시 수정하기 위한 용도로 활용하고 있습니다.<br/>
이와 함께 현재 사용자 수와 다운로드 수 등의 지표를 파악하는 데에도 사용하고 있습니다.<br/>
> Github Html Preview Extension, Auto Gitkeep Plugin, Spreadsheets Filter Extension 서비스 정보를 제공합니다.
```
1. 현재 상태를 알림 발송 배치 (사용자 수, 확장프로그램이 의존하고 있는 웹 선택자의 변경 여부)
- cron(10 0 * * ? *) // 매일 KST 09:10
```

### time-capsule
디지털 타임캡슐 프로젝트에서 필요한 타임캡슐 정보 저장 및 조회, 이메일 발송 기능을 운영 중입니다.
> [Time Capsule](https://github.com/dohyeon5626/time-capsule)
```
1. 타임캡슐 생성 Api
- POST /subscription

2. 타임캡슐 상세조회 Api
- GET /subscription/:id

3. 타임캡슐 현황 Api
- GET /subscription-status

4. 타임캡슐 데이터 관련 작업 (생성 시 이메일 발송 및 예약 / 데이터 삭제 시 s3 객체 삭제)
- 타임캡슐 dynamodb 테이블 stream

5. 예약된 시간에 이메일 발송 작업
- 이메일 발송 관련 eventBridge
```
