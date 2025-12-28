# Serverless Functions<img src="https://github.com/user-attachments/assets/badded73-0631-42e4-8a1a-549309c34c2d" align=left width=100>

![GitHub License](https://img.shields.io/github/license/dohyeon5626/serverless-functions?style=flat&color=green)
<br/><br/>

각종 개인 프로젝트에서 쓰이는 서버리스 함수 모노레포입니다.<br/>

**github-html-preview**
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

**monitoring-system**
```
1. Github Html Preview Extension, Auto Gitkeep Plugin, Spreadsheets Filter Extension의 현재 상태를 알림 보내주는 batch
   (사용자 수, 확장프로그램이 의존하고 있는 웹 선택자의 변경 여부)
- cron(10 0 * * ? *) // 매일 KST 오전 9시 10분
```

**time-capsule**
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
