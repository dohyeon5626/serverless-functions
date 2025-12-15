import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({}); 

export const sendCreateTimeCapsuleEmail = async (capsuleData) => {
    const senderName = capsuleData.senderName;
    const id = capsuleData.id;
    const openDate = new Date(capsuleData.openDate + (9 * 60 * 60 * 1000));
    const openDateString = openDate.getFullYear() + "년 " + (openDate.getMonth() + 1) + "월 " + openDate.getDate() + "일 " + openDate.getHours() + "시";

    const params = {
        Source: `타임캡슐 <${process.env.SENDER_EMAIL}>`,
        Destination: {
            ToAddresses: [capsuleData.senderEmail],
        },
        Message: {
            Subject: {
                Data: `[타임캡슐] ${senderName}님의 타임캡슐이 성공적으로 생성되었습니다! 😃`,
                Charset: "UTF-8",
            },
            Body: {
                Text: {
                    Data: `
                        안녕하세요. ${senderName}님!
                        소중한 추억을 타임캡슐에 안전하게 담아서 생성했습니다.
                        ${openDateString}에 수신자분들에게 전달해 드리겠습니다.

                        ${
                            capsuleData.usePasswordKey ?
                            `
                            해당 타임캡슐은 암호키가 설정되어 있습니다.
                            암호키 분실하지 않도록 주의해주세요.
                            ` : ""
                        }

                        생성하신 타임캡슐 코드는 ${id}입니다.
                        https://time-capsule.dohyeon5626.com/#/view?id=${id}
                    `,
                    Charset: "UTF-8",
                },
                Html: {
                    Data: `
                        <div style="margin: 0; padding: 0; background-color: #ffffff; width: 100%; -webkit-text-size-adjust: none;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                                <tr>
                                    <td align="center" valign="top" style="padding: 5vw 0;">
                                        
                                        <table border="0" cellspacing="0" cellpadding="0" style="width: 90vw; max-width: 480px; background-color: #0B1221; margin: auto; border-radius: 10px; overflow: hidden; table-layout: fixed;">
                                            <tr>
                                                <td style="padding: 3em 6%; font-family: Pretendard, 'Apple SD Gothic Neo', Arial, sans-serif; font-size: 16px; font-size: min(16px, 3vw); line-height: 1.5; color: #FAFAF8;">
                                                    
                                                    <p style="margin: 0; font-size: 1em; color: #FAFAF8; text-align: left; word-break: keep-all; font-weight: bold;">
                                                        안녕하세요. ${senderName}님!<br>
                                                        소중한 추억을 타임캡슐에 안전하게 담아서 생성했습니다.<br>
                                                        ${openDateString}에 설정하신 수신자분들에게 전달해 드리겠습니다.
                                                    </p>

                                                    ${
                                                        capsuleData.usePasswordKey ?
                                                        `<p style="margin: 1.5em 0 0 0; font-size: 1em; color: #FAFAF8; font-weight: 700; text-align: left; word-break: keep-all;">
                                                            해당 타임캡슐은 암호키가 설정되어 있습니다.<br>
                                                            암호키 분실하지 않도록 주의해주세요.
                                                        </p>` : ""
                                                    }
                                                    
                                                    <p style="margin: 3em 0 0.8em 0; font-size: 1em; color: #94a3b8; text-align: left;">
                                                        생성하신 타임캡슐 코드는 아래와 같습니다.
                                                    </p>

                                                    <div style="border:0.1em solid #374151; border-radius: 1em; padding: 1em; text-align:center; background-color: #0f172a; word-break: break-all;">
                                                        <p style="margin: 0; color: #FAFAF8 margin: 0; font-size: 0.85em; font-weight: 500;">${id}</p>
                                                    </div>
                                                    
                                                    <p style="margin: 3em 0 0.8em 0; font-size: 1em; color: #94a3b8; text-align: left;">
                                                        아래 버튼을 클릭하여 타임캡슐 페이지로 이동할 수 있습니다.
                                                    </p>
                                                    
                                                    <a href="https://time-capsule.dohyeon5626.com/#/view?id=${id}" target="_blank" style="display:block; background-color:#2563EB; border-radius: 1em; padding: 1em 0; color:#FFFFFF; font-size: 1.2em; font-weight:bold; text-decoration:none; text-align:center;">
                                                        타임캡슐 보러가기
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

export const sendOpenTimeCapsuleEmail = async (capsuleData) => {
    const senderName = capsuleData.senderName;
    const id = capsuleData.id;

    for(const recipient of capsuleData.recipients) {
        const recipientName = recipient.name;

        const params = {
            Source: `타임캡슐 <${process.env.SENDER_EMAIL}>`,
            Destination: {
                ToAddresses: [recipient.email],
            },
            Message: {
                Subject: {
                    Data: `[타임캡슐] ${senderName}님이 생성하신 타임캡슐이 도착했습니다! 🌟`,
                    Charset: "UTF-8",
                },
                Body: {
                    Text: {
                        Data: `
                            안녕하세요. ${recipientName}님!
                            ${senderName}님이 생성하신 소중한 추억을 담은 타임캡슐이 도착했습니다!

                            ${
                                capsuleData.usePasswordKey ?
                                `
                                해당 타임캡슐은 암호키가 설정되어 있습니다.
                                ` : ""
                            }

                            타임캡슐 코드는 ${id}입니다.
                            https://time-capsule.dohyeon5626.com/#/view?id=${id}
                        `,
                        Charset: "UTF-8",
                    },
                    Html: {
                        Data: `
                            <div style="margin: 0; padding: 0; background-color: #ffffff; width: 100%; -webkit-text-size-adjust: none;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
                                    <tr>
                                        <td align="center" valign="top" style="padding: 5vw 0;">
                                            
                                            <table border="0" cellspacing="0" cellpadding="0" style="width: 90vw; max-width: 480px; background-color: #0B1221; margin: auto; border-radius: 10px; overflow: hidden; table-layout: fixed;">
                                                <tr>
                                                    <td style="padding: 3em 6%; font-family: Pretendard, 'Apple SD Gothic Neo', Arial, sans-serif; font-size: 16px; font-size: min(16px, 3vw); line-height: 1.5; color: #FAFAF8;">
                                                        
                                                        <p style="margin: 0; font-size: 1em; color: #FAFAF8; text-align: left; word-break: keep-all; font-weight: bold;">
                                                            안녕하세요. ${recipientName}님!<br>
                                                            ${senderName}님이 생성하신 소중한 추억을 담은 타임캡슐이 도착했습니다!
                                                        </p>

                                                        ${
                                                            capsuleData.usePasswordKey ?
                                                            `<p style="margin: 1.5em 0 0 0; font-size: 1em; color: #FAFAF8; font-weight: 700; text-align: left; word-break: keep-all;">
                                                                해당 타임캡슐은 암호키가 설정되어 있습니다.<br>
                                                            </p>` : ""
                                                        }
                                                        
                                                        <p style="margin: 3em 0 0.8em 0; font-size: 1em; color: #94a3b8; text-align: left;">
                                                            타임캡슐 코드는 아래와 같습니다.
                                                        </p>

                                                        <div style="border:0.1em solid #374151; border-radius: 1em; padding: 1em; text-align:center; background-color: #0f172a; word-break: break-all;">
                                                            <p style="margin: 0; color: #FAFAF8 margin: 0; font-size: 0.85em; font-weight: 500;">${id}</p>
                                                        </div>
                                                        
                                                        <p style="margin: 3em 0 0.8em 0; font-size: 1em; color: #94a3b8; text-align: left;">
                                                            아래 버튼을 클릭하여 타임캡슐 페이지로 이동할 수 있습니다.
                                                        </p>
                                                        
                                                        <a href="https://time-capsule.dohyeon5626.com/#/view?id=${id}" target="_blank" style="display:block; background-color:#2563EB; border-radius: 1em; padding: 1em 0; color:#FFFFFF; font-size: 1.2em; font-weight:bold; text-decoration:none; text-align:center;">
                                                            타임캡슐 보러가기
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
    }
};