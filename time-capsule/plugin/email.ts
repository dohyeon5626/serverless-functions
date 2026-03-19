import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { CapsuleRecord, Recipient } from '../persistence/repository';

const sesClient = new SESClient({});

const sendEmail = async (params: SendEmailCommandInput): Promise<void> => {
  try {
    await sesClient.send(new SendEmailCommand(params));
  } catch (error) {
    console.log('SES 이메일 전송 실패:', error);
  }
};

const formatKstDate = (timestamp: number): string => {
  const date = new Date(timestamp + 9 * 60 * 60 * 1000);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시`;
};

export const sendCreateTimeCapsuleEmail = async (capsuleData: CapsuleRecord): Promise<void> => {
  const { senderName, id, senderEmail, openDate, usePasswordKey } = capsuleData;
  const openDateString = formatKstDate(openDate);

  await sendEmail({
    Source: `타임캡슐 <${process.env.SENDER_EMAIL}>`,
    Destination: { ToAddresses: [senderEmail] },
    Message: {
      Subject: {
        Data: `[타임캡슐] ${senderName}님의 타임캡슐이 성공적으로 생성되었습니다! 😃`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: `
                        안녕하세요. ${senderName}님!
                        소중한 추억을 타임캡슐에 안전하게 담아서 생성했습니다.
                        ${openDateString}에 수신자분들에게 전달해 드리겠습니다.

                        ${usePasswordKey ? `
                            해당 타임캡슐은 암호키가 설정되어 있습니다.
                            암호키 분실하지 않도록 주의해주세요.
                            ` : ''}

                        아래 링크를 통해 생성하신 타임캡슐을 볼 수 있습니다.
                        https://time-capsule.dohyeon5626.com/#/view?id=${id}
                    `,
          Charset: 'UTF-8',
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

                                                    ${usePasswordKey ? `<p style="margin: 1.5em 0 0 0; font-size: 1em; color: #FAFAF8; font-weight: 700; text-align: left; word-break: keep-all;">
                                                            해당 타임캡슐은 암호키가 설정되어 있습니다.<br>
                                                            암호키 분실하지 않도록 주의해주세요.
                                                        </p>` : ''}

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
          Charset: 'UTF-8',
        },
      },
    },
  });
};

export const sendOpenTimeCapsuleEmail = async (capsuleData: CapsuleRecord): Promise<void> => {
  const { senderName, id, recipients, usePasswordKey } = capsuleData;

  for (const recipient of recipients as Recipient[]) {
    const recipientName = recipient.name;

    await sendEmail({
      Source: `타임캡슐 <${process.env.SENDER_EMAIL}>`,
      Destination: { ToAddresses: [recipient.email] },
      Message: {
        Subject: {
          Data: `[타임캡슐] ${senderName}님이 생성하신 타임캡슐이 도착했습니다! 🌟`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: `
                            안녕하세요. ${recipientName}님!
                            ${senderName}님이 생성하신 소중한 추억을 담은 타임캡슐이 도착했습니다!

                            ${usePasswordKey ? `
                                해당 타임캡슐은 암호키가 설정되어 있습니다.
                                ` : ''}

                            아래 링크를 통해 생성하신 타임캡슐을 볼 수 있습니다.
                            https://time-capsule.dohyeon5626.com/#/view?id=${id}
                        `,
            Charset: 'UTF-8',
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

                                                        ${usePasswordKey ? `<p style="margin: 1.5em 0 0 0; font-size: 1em; color: #FAFAF8; font-weight: 700; text-align: left; word-break: keep-all;">
                                                                해당 타임캡슐은 암호키가 설정되어 있습니다.<br>
                                                            </p>` : ''}

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
            Charset: 'UTF-8',
          },
        },
      },
    });
  }
};
