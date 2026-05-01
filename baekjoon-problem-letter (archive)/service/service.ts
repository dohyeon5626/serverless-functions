import { getUserInfo, getProblem } from '../plugin/client';
import { deleteSubscription, saveSubscription } from '../plugin/repository';
import { sendAddSubscriptionEmail, sendCancelSubscriptionEmail } from '../plugin/email';
import { dayWordMap, dayNameToIndex, DayName } from '../util/code';

export interface Problem {
  problemId: number;
  title: string;
  tier: number;
  averageTries: number;
}

export interface ProblemInfo {
  problemSize: number;
  problems: Problem[][];
}

export interface SubscriptionInput {
  userId: string;
  email: string;
  sendTime: string;
  sendDays: DayName[];
  problemCount?: number;
}

export const createSubscription = async (subscriptionData: SubscriptionInput): Promise<void> => {
  const problemInfo = await getNewProblemInfo(subscriptionData.userId);
  const nextGeneratedDateString = calculateNextGeneratedDate(subscriptionData.sendDays);

  await saveSubscription({
    userId: subscriptionData.userId,
    email: subscriptionData.email,
    sendTime: subscriptionData.sendTime,
    sendDays: subscriptionData.sendDays,
    nextGeneratedDate: nextGeneratedDateString,
    problemSize: problemInfo.problemSize,
    problems: problemInfo.problems,
  });

  await sendAddSubscriptionEmail({
    email: subscriptionData.email,
    userId: subscriptionData.userId,
    days: subscriptionData.sendDays.map(day => dayWordMap[day]).join(', '),
    time: subscriptionData.sendTime,
    problemCount: subscriptionData.problemCount,
  });
};

export const cancelSubscription = async (email: string): Promise<void> => {
  const deletedSubscription = await deleteSubscription(email);
  await sendCancelSubscriptionEmail({
    email: deletedSubscription.id,
    userId: deletedSubscription.userId,
  });
};

export const getNewProblemInfo = async (userId: string): Promise<ProblemInfo> => {
  const { tier } = await getUserInfo(userId);
  const res = await getProblem(userId, tier);

  const items: Problem[] = res.items
    .map(item => ({
      problemId: item.problemId,
      title: item.titleKo,
      tier: item.level,
      averageTries: item.averageTries,
    }))
    .sort((a, b) => {
      if (a.tier !== b.tier) return b.tier - a.tier;
      return b.averageTries - a.averageTries;
    });

  const chunkSize = Math.floor(items.length / 5);
  if (chunkSize === 0) return { problemSize: 0, problems: [] };

  const result: Problem[][] = [];
  for (let i = 0; i < 5; i++) {
    const start = i * chunkSize;
    result.push(items.slice(start, start + chunkSize).reverse());
  }

  return { problemSize: chunkSize, problems: result };
};

export const calculateNextGeneratedDate = (sendDays: string[]): string => {
  const sortedSendDays = sendDays
    .map(day => dayNameToIndex[day as DayName])
    .sort((a, b) => a - b);

  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const todayDayIndex = now.getDay();

  let nextGeneratedDate = new Date(now);
  nextGeneratedDate.setHours(0, 0, 0, 0);

  let found = false;
  for (const dayIndex of sortedSendDays) {
    if (dayIndex > todayDayIndex) {
      nextGeneratedDate.setDate(nextGeneratedDate.getDate() + (dayIndex - todayDayIndex));
      found = true;
      break;
    }
    if (dayIndex === todayDayIndex && nextGeneratedDate.getTime() > now.getTime()) {
      found = true;
      break;
    }
  }

  if (!found) {
    const firstDayNextWeek = sortedSendDays[0];
    const daysToAdd = (firstDayNextWeek - todayDayIndex + 7) % 7;
    const daysUntilNext = daysToAdd === 0 ? 7 : daysToAdd;

    const newDate = new Date(now);
    newDate.setDate(now.getDate() + daysUntilNext);
    newDate.setHours(0, 0, 0, 0);
    nextGeneratedDate = newDate;
  }

  return nextGeneratedDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\./g, '').replace(/\s/g, '-');
};
