import { sendOpenTimeCapsuleEmail } from './plugin/email';
import { findAllSubscriptionByOpenDate, updateCapsuleStatusForOpen, CapsuleRecord } from './persistence/repository';

interface AlimEvent {
  triggerTime: number;
}

export const run = async (event: AlimEvent): Promise<void> => {
  console.log(event);
  const triggerTime = event.triggerTime;
  console.log(triggerTime);

  try {
    let lastEvaluatedKey: Record<string, unknown> | undefined;
    let totalCapsules = 0;

    do {
      const { Items: capsules, LastEvaluatedKey } = await findAllSubscriptionByOpenDate(triggerTime, lastEvaluatedKey);

      if (!capsules || capsules.length === 0) {
        if (totalCapsules === 0) console.log('발송할 타임캡슐이 없습니다.');
        break;
      }

      totalCapsules += capsules.length;
      console.log(`${capsules.length}개의 타임캡슐을 추가로 발송합니다.`);

      await Promise.all(capsules.map(async (item: CapsuleRecord) => {
        try {
          await sendOpenTimeCapsuleEmail(item);
          await updateCapsuleStatusForOpen(item.id);
          console.log(`[발송 성공] ${item.senderEmail}`);
        } catch (error: unknown) {
          const err = error as { message?: string };
          console.error(`[발송 실패] ${item.senderEmail} - ${err.message}`);
        }
      }));

      lastEvaluatedKey = LastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (totalCapsules > 0) console.log(`총 ${totalCapsules}개의 타임캡슐 발송을 완료했습니다.`);
  } catch (error) {
    console.error('Critical Error:', error);
    throw error;
  }
};
