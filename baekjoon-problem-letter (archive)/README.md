# baekjoon-problem-letter (archive)

문제 추천 구독 정보 저장 및 이메일 발송, 배치를 통한 문제 추천 기능이 있습니다, 현재는 백준 서비스 종료로 운영되지 않습니다.
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
