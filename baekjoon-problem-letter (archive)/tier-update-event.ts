import { findSubscriptionsByNextGeneratedDate, updateSubscriptionProblemInfo } from './plugin/repository';
import { getNewProblemInfo, calculateNextGeneratedDate } from './service/service';
import { SchedulerClient, CreateScheduleCommand } from '@aws-sdk/client-scheduler';

const client = new SchedulerClient({});

export const run = async (): Promise<void> => {
  const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  const dateString = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\./g, '').replace(/\s/g, '-');

  const subscriptions = await findSubscriptionsByNextGeneratedDate(dateString);
  console.log(subscriptions);

  for (const subscription of subscriptions) {
    if (subscription.sendRound === 0) continue;
    try {
      const problemInfo = await getNewProblemInfo(subscription.userId);
      const nextGeneratedDateString = calculateNextGeneratedDate(subscription.sendDays);
      await updateSubscriptionProblemInfo(subscription.id, problemInfo, nextGeneratedDateString);
    } catch (error) {
      console.error(`Error updating subscription ${subscription.id}:`, error);
    }
  }

  if (subscriptions.length >= 100) {
    const nextDate = new Date(Date.now() + 20 * 60 * 1000);
    if (new Date(nextDate.getTime() + 9 * 60 * 60 * 1000).getHours() >= 6) return;

    const scheduleName = `tier-update-trigger-${nextDate.getTime()}`;
    const atTime = nextDate.toISOString().slice(0, 19);

    try {
      await client.send(new CreateScheduleCommand({
        Name: scheduleName,
        ScheduleExpression: `at(${atTime})`,
        ScheduleExpressionTimezone: 'UTC',
        FlexibleTimeWindow: { Mode: 'OFF' },
        Target: {
          Arn: process.env.TARGET_LAMBDA_ARN as string,
          RoleArn: process.env.SCHEDULER_ROLE_ARN as string,
        },
        ActionAfterCompletion: 'DELETE',
      }));
      console.log(`[Schedule Created] ${scheduleName} at ${atTime}`);
    } catch (error) {
      console.error('[Schedule Error]', error);
    }
  }
};
