import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler";

const client = new SchedulerClient({});

export async function createSchedule(dateObj) {
  const scheduleName = `capsule-trigger-${dateObj.getTime()}`;
  const atTime = dateObj.toISOString().slice(0, 19);

  const params = {
    Name: scheduleName,
    ScheduleExpression: `at(${atTime})`,
    ScheduleExpressionTimezone: "UTC",
    FlexibleTimeWindow: { Mode: "OFF" },
    
    Target: {
      Arn: process.env.TARGET_LAMBDA_ARN,
      RoleArn: process.env.SCHEDULER_ROLE_ARN,
      
      Input: JSON.stringify({ 
        triggerTime: dateObj.getTime()
      }),
    },
    
    ActionAfterCompletion: "DELETE",
  };

  try {
    await client.send(new CreateScheduleCommand(params));
    console.log(`[Schedule Created] ${scheduleName} at ${atTime}`);
    return true;
  } catch (error) {
    if (error.name === "ConflictException") {
      console.log(`[Schedule Exists] ${scheduleName} - Existing schedule used.`);
      return true;
    }
    console.error("[Schedule Error]", error);
  }
}