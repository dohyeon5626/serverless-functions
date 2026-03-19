import { SchedulerClient, CreateScheduleCommand } from '@aws-sdk/client-scheduler';

const client = new SchedulerClient({});

export const createSchedule = async (dateObj: Date): Promise<boolean | undefined> => {
  const scheduleName = `capsule-trigger-${dateObj.getTime()}`;
  const atTime = dateObj.toISOString().slice(0, 19);

  try {
    await client.send(new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: `at(${atTime})`,
      ScheduleExpressionTimezone: 'UTC',
      FlexibleTimeWindow: { Mode: 'OFF' },
      Target: {
        Arn: process.env.TARGET_LAMBDA_ARN as string,
        RoleArn: process.env.SCHEDULER_ROLE_ARN as string,
        Input: JSON.stringify({ triggerTime: dateObj.getTime() }),
      },
      ActionAfterCompletion: 'DELETE',
    }));
    console.log(`[Schedule Created] ${scheduleName} at ${atTime}`);
    return true;
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === 'ConflictException') {
      console.log(`[Schedule Exists] ${scheduleName} - Existing schedule used.`);
      return true;
    }
    console.error('[Schedule Error]', error);
  }
};
