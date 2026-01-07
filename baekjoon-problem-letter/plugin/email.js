import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({}); 


export const sendSubscriptionEmail = async (subscriptionData) => {
    const params = {
        Source: `Baekjoon Problem Letter <${process.env.SENDER_EMAIL}>`,
        Destination: {
            ToAddresses: [subscriptionData.email],
        },
        Message: {
            Subject: {
                Data: `[baekjoon-problem-letter] ${subscriptionData.userId}님의 구독 신청이 완료되었습니다! 😃`,
                Charset: "UTF-8",
            },
            Body: {
                Text: {
                    Data: `
                        안녕하세요. ${subscriptionData.userId}님!
                        설정하신 정보로 매일 아침 엄선된 알고리즘 문제가 배달됩니다.

                        [발송 요일] ${subscriptionData.days}
                        [발송 시간] ${subscriptionData.time}
                        [문제 개수] ${subscriptionData.problemCount}개

                        구독 취소하기 : https://baekjoon-problem-letter.dohyeon5626.com?reason=unsubscribe
                    `,
                    Charset: "UTF-8",
                },
                Html: {
                    Data: `
                        <div style="margin: 0; padding: 0; background-color: #F3F4F6; width: 100%; -webkit-text-size-adjust: none;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F3F4F6">
                                <tr>
                                    <td align="center" valign="top" style="padding: 5vw 0;">
                                        
                                        <table border="0" cellspacing="0" cellpadding="0" style="width: 90vw; max-width: 480px; background-color: #ffffff; margin: auto; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #E5E7EB;">
                                            
                                            <tr><td height="48"></td></tr>

                                            <tr>
                                                <td align="center" style="padding: 0 20px; font-family: Pretendard, 'Apple SD Gothic Neo', Arial, sans-serif;">
                                                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.025em; line-height: 1.3; word-break: keep-all;">
                                                        구독 신청 완료!
                                                    </h1>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td align="center" style="padding: 16px 20px 40px 20px; font-family: Pretendard, 'Apple SD Gothic Neo', Arial, sans-serif;">
                                                    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #6B7280; word-break: keep-all;">
                                                        설정하신 정보로 매일 아침<br>
                                                        엄선된 알고리즘 문제가 배달됩니다.
                                                    </p>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding: 0 20px 48px 20px;">
                                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F8FAFC" style="border-radius: 16px; border: 1px solid #F1F5F9;">
                                                        <tr><td colspan="2" height="28"></td></tr>
                                                        
                                                        <tr>
                                                            <td align="left" valign="top" width="1%" style="padding: 8px 0 8px 24px; font-family: Pretendard, sans-serif; white-space: nowrap;">
                                                                <span style="color: #94a3b8; font-size: 14px; font-weight: 700; display: inline-block; white-space: nowrap;">
                                                                    발송 요일
                                                                </span>
                                                            </td>
                                                            <td align="right" valign="top" style="padding: 8px 24px 8px 12px; font-family: Pretendard, sans-serif;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 800; display: inline-block; word-break: keep-all;">
                                                                    ${subscriptionData.days}
                                                                </span>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td align="left" valign="top" style="padding: 8px 0 8px 24px; font-family: Pretendard, sans-serif; white-space: nowrap;">
                                                                <span style="color: #94a3b8; font-size: 14px; font-weight: 700; display: inline-block; white-space: nowrap;">
                                                                    발송 시간
                                                                </span>
                                                            </td>
                                                            <td align="right" valign="top" style="padding: 8px 24px 8px 12px; font-family: Pretendard, sans-serif;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 800; display: inline-block;">
                                                                    ${subscriptionData.time}
                                                                </span>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td align="left" valign="top" style="padding: 8px 0 8px 24px; font-family: Pretendard, sans-serif; white-space: nowrap;">
                                                                <span style="color: #94a3b8; font-size: 14px; font-weight: 700; display: inline-block; white-space: nowrap;">
                                                                    문제 개수
                                                                </span>
                                                            </td>
                                                            <td align="right" valign="top" style="padding: 8px 24px 8px 12px; font-family: Pretendard, sans-serif;">
                                                                <span style="color: #059669; font-size: 16px; font-weight: 800; display: inline-block;">
                                                                    ${subscriptionData.problemCount}개
                                                                </span>
                                                            </td>
                                                        </tr>

                                                        <tr><td colspan="2" height="28"></td></tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        <table border="0" cellspacing="0" cellpadding="0" style="width: 90vw; max-width: 480px; margin: auto;">
                                            <tr>
                                                <td align="left" style="padding-top: 16px; width: 50%;">
                                                    <a href="mailto:baekjoon-problem-letter@dohyeon5626.com" style="color: #9CA3AF; font-size: 12px; font-family: Pretendard, sans-serif; text-decoration: underline;">
                                                        문의하기
                                                    </a>
                                                </td>
                                                
                                                <td align="right" style="padding-top: 16px; width: 50%;">
                                                    <a href="https://baekjoon-problem-letter.dohyeon5626.com?reason=unsubscribe" target="_blank" style="color: #9CA3AF; font-size: 12px; font-family: Pretendard, sans-serif; text-decoration: underline;">
                                                        구독 취소하기
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>
                        </div>
                    `,
                    Charset: "UTF-8",
                },
            },
        },
    };

    try {
        await sesClient.send(new SendEmailCommand(params));
    } catch (error) {
        console.log("SES 이메일 전송 실패:", error);
    }
};