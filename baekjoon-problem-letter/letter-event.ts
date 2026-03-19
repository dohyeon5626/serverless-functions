import { sendLetterEmail } from './plugin/email';
import { findSubscriptionsByTime, updateSubscriptionRound } from './plugin/repository';
import { dayList, tierWordMap } from './util/code';
import { calculateNextGeneratedDate } from './service/service';

interface ScheduledEvent {
  time: string;
}

export const run = async (event: ScheduledEvent): Promise<void> => {
  console.log('Event time:', event.time);
  const utc = new Date(event.time);
  const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
  const timeString = kst.toTimeString().slice(0, 5);
  const dayName = dayList[kst.getDay()];
  const dateString = kst.getFullYear() + '년 ' + (kst.getMonth() + 1) + '월 ' + kst.getDate() + '일';

  console.log(`KST: ${kst}, Time: ${timeString}, Day: ${dayName}`);

  try {
    let nowLastEvaluatedKey: Record<string, unknown> | null = null;

    do {
      const { items, lastEvaluatedKey } = await findSubscriptionsByTime(dayName, timeString, nowLastEvaluatedKey);

      for (const subscription of items) {
        const { id, userId, problems, sendRound, problemSize, sendDays } = subscription;

        if (sendRound >= problemSize) continue;

        const newProblems = problems.map(levelProblems => levelProblems[sendRound]);
        const nextGeneratedDateString = calculateNextGeneratedDate(sendDays);
        try {
          await updateSubscriptionRound(id, sendRound + 1, nextGeneratedDateString);
          await sendLetterEmail(dateString, { email: id, userId }, newProblems.map(problem => ({
            ...problem,
            tierTitle: tierWordMap[problem.tier],
          })));
        } catch (error) {
          console.error(`Error sending letter subscription ${id}:`, error);
        }
      }
      nowLastEvaluatedKey = lastEvaluatedKey ?? null;
    } while (nowLastEvaluatedKey);
  } catch (error) {
    console.error('Error processing subscriptions:', error);
  }
};
