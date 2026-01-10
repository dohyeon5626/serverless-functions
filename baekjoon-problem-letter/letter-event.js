import { sendLetterEmail } from "./plugin/email.js";
import { findSubscriptionsByTime, updateSubscriptionRound } from "./plugin/repository.js";
import { dayList, tierWordMap } from "./util/code.js";

export const run = async (event) => {
    // console.log("Event time:", event.time);
    // const utc = new Date(event.time);
    // const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
    // const timeString = kst.toTimeString().slice(0, 5);
    // const dayName = dayList[kst.getDay()];
    // const dateString = kst.getFullYear() + "년 " + (kst.getMonth() + 1) + "월 " + kst.getDate() + "일";

    // console.log(`KST: ${kst}, Time: ${timeString}, Day: ${dayName}`);

    const dayName = "MON";
    const timeString = "09:00";
    const dateString = "2025년 9월 10일"

    try {
        let lastEvaluatedKey = null;

        do {
            const { Items, LastEvaluatedKey } = await findSubscriptionsByTime(dayName, timeString, lastEvaluatedKey);
            console.log(Items);

            for (const item of Items) {
                const { id, problems, sendRound, problemSize } = item;

                if (sendRound >= problemSize) continue;

                const newProblems = problems.map(levalProblems => levalProblems[sendRound]);
                await updateSubscriptionRound(id, sendRound + 1);

                await sendLetterEmail(dateString, {
                    email: item.id,
                    userId: item.userId
                }, newProblems.map(problem => ({
                    ...problem,
                    tierTitle: tierWordMap[[problem.tier]]
                })))
            }
            lastEvaluatedKey = LastEvaluatedKey;
        } while (lastEvaluatedKey)
    } catch (error) {
        console.error("Error processing subscriptions:", error);
    }
};