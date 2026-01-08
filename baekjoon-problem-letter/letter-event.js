import { sendLetterEmail } from "./plugin/email.js";
import { findSubscriptionsByTime, updateSubscriptionRound } from "./plugin/repository.js";

const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const tierMap = {
    1: 'Bronze V',
    2: 'Bronze IV',
    3: 'Bronze III',
    4: 'Bronze II',
    5: 'Bronze I',
    6: 'Silver V',
    7: 'Silver IV',
    8: 'Silver III',
    9: 'Silver II',
    10: 'Silver I',
    11: 'Gold V',
    12: 'Gold IV',
    13: 'Gold III',
    14: 'Gold II',
    15: 'Gold I',
    16: 'Platinum V',
    17: 'Platinum IV',
    18: 'Platinum III',
    19: 'Platinum II',
    20: 'Platinum I',
    21: 'Diamond V',
    22: 'Diamond IV',
    23: 'Diamond III',
    24: 'Diamond II',
    25: 'Diamond I',
    26: 'Ruby V',
    27: 'Ruby IV',
    28: 'Ruby III',
    29: 'Ruby II',
    30: 'Ruby I'
}

export const run = async (event) => {
    // console.log("Event time:", event.time);
    // const utc = new Date(event.time);
    // const kst = new Date(utc.getTime() + 9 * 60 * 60 * 1000);
    // const timeString = kst.toTimeString().slice(0, 5);
    // const dayName = dayMap[kst.getDay()];
    // const dateString = kst.getFullYear() + "년 " + (kst.getMonth() + 1) + "월 " + kst.getDate() + "일";

    // console.log(`KST: ${kst}, Time: ${timeString}, Day: ${dayName}`);

    const dayName = "MON";
    const timeString = "09:00";
    const dateString = "2025년 9월 10일"

    try {
        const Items = await findSubscriptionsByTime(dayName, timeString);
        console.log(Items);

        for (const item of Items) {
            const { id, problems, sendRound, problemSize } = item;

            if (sendRound >= problemSize) continue; // TODO 제떄 업데이트가 안되어서 생긴 케이스
            
            const newProblems = problems.map(levalProblems => levalProblems[sendRound]);
            await updateSubscriptionRound(id, sendRound + 1);

            await sendLetterEmail(dateString, {
                email: item.id,
                userId: item.userId
            }, newProblems.map(problem => ({
                ...problem,
                tierTitle: tierMap[[problem.tier]]
            })))
        }
    } catch (error) {
        console.error("Error processing subscriptions:", error);
    }
};