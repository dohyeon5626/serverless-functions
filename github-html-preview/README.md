# github-html-preview

깃허브 파일을 가져오기 위한 프록시와 Oauth를 위한 기능을 운영 중입니다.
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
