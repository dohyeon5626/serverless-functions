# time-capsule

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
