import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({}); 

export const sendCreateTimeCapsuleEmail = async (toAddress, userName) => {
    const senderEmail = process.env.SENDER_EMAIL; 

    const params = {
        Source: `타임캡슐 <${senderEmail}>`,
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Subject: {
                Data: "타임캡슐 생성을 환영합니다! 🎉",
                Charset: "UTF-8",
            },
            Body: {
                Text: {
                    Data: `안녕하세요 ${userName}님,\n\n타임캡슐이 성공적으로 생성되었습니다. 설정한 날짜에 캡슐이 열립니다!`,
                    Charset: "UTF-8",
                },
                Html: {
                    Data: `
                        <h3>환영합니다, ${userName}님!</h3>
                        <p>타임캡슐이 성공적으로 <strong>생성</strong>되었습니다.</p>
                        <p>설정한 날짜가 되면 수신자에게 알림을 보내드릴게요.</p>
                        <br>
                        <p>감사합니다.</p>
                    `,
                    Charset: "UTF-8",
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
    } catch (error) {
        console.log("SES 이메일 전송 실패:", error);
        throw error; 
    }
};