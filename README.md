# serverless functions
![GitHub License](https://img.shields.io/github/license/dohyeon5626/serverless-functions?style=flat&color=green)

각종 개인 프로젝트에서 쓰이는 서버리스 함수 모노레포

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
