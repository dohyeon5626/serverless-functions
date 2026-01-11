import { sendLetterEmail } from "./plugin/email.js";
import { findSubscriptionsByTime, updateSubscriptionRound } from "./plugin/repository.js";
import { dayList, tierWordMap } from "./util/code.js";
import { calculateNextGeneratedDate } from "./service/service.js";

export const run = async (event) => {
    console.log("Event time:", event.time);
    const utc = new Date(event.time);
    const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
    const timeString = kst.toTimeString().slice(0, 5);
    const dayName = dayList[kst.getDay()];
    const dateString = kst.getFullYear() + "년 " + (kst.getMonth() + 1) + "월 " + kst.getDate() + "일";

    console.log(`KST: ${kst}, Time: ${timeString}, Day: ${dayName}`);

    try {
        let nowLastEvaluatedKey = null;

        do {
            const { items, lastEvaluatedKey } = await findSubscriptionsByTime(dayName, timeString, nowLastEvaluatedKey);

            for (const subscription of items) {
                const { id, userId, problems, sendRound, problemSize, sendDays } = subscription;

                if (sendRound >= problemSize) continue;

                const newProblems = problems.map(levalProblems => levalProblems[sendRound]);
                const nextGeneratedDateString = calculateNextGeneratedDate(sendDays);
                try {
                    await updateSubscriptionRound(id, sendRound + 1, nextGeneratedDateString);

                    await sendLetterEmail(dateString, {
                        email: id,
                        userId: userId
                    }, newProblems.map(problem => ({
                        ...problem,
                        tierTitle: tierWordMap[[problem.tier]]
                    })))
                } catch (error) {
                    console.error(`Error sending letter subscription ${id}:`, error);
                }
            }
            nowLastEvaluatedKey = lastEvaluatedKey;
        } while (nowLastEvaluatedKey)
    } catch (error) {
        console.error("Error processing subscriptions:", error);
    }
};