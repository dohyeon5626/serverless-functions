import { findSubscriptionsByNextGeneratedDate, updateSubscriptionProblemInfo } from "./plugin/repository.js";
import { getNewProblemInfo } from "./service/service.js";
import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler";

const client = new SchedulerClient({});

export const run = async (event) => {
    const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const dateString = now.toLocaleDateString("ko-KR", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\./g, '').replace(/\s/g, '-');

    const subscriptions = await findSubscriptionsByNextGeneratedDate(dateString);
    console.log(subscriptions);
    for (const subscription of subscriptions) {
        if (subscription.sendRound == 0) return;
        try {
            const problemInfo = await getNewProblemInfo(subscription.userId);
            await updateSubscriptionProblemInfo(subscription.id, problemInfo);
        } catch (error) {
            console.error(`Error updating subscription ${subscription.id}:`, error);
        }
    }

    if (subscriptions.length >= 100) {
        const nextDate = new Date(Date.now() + 20 * 60 * 1000);
        if(new Date(nextDate + 9 * 60 * 60 * 1000).getHours() >= 6) return;

        const scheduleName = `tier-update-trigger-${nextDate.getTime()}`;
        const atTime = nextDate.toISOString().slice(0, 19);

        const params = {
            Name: scheduleName,
            ScheduleExpression: `at(${atTime})`,
            ScheduleExpressionTimezone: "UTC",
            FlexibleTimeWindow: { Mode: "OFF" },
            
            Target: {
                Arn: process.env.TARGET_LAMBDA_ARN,
                RoleArn: process.env.SCHEDULER_ROLE_ARN
            },
            
            ActionAfterCompletion: "DELETE"
        }

        try {
            await client.send(new CreateScheduleCommand(params));
            console.log(`[Schedule Created] ${scheduleName} at ${atTime}`);
            return true;
        } catch (error) {
            console.error("[Schedule Error]", error);
        }
    }
}