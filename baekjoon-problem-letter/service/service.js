import { getUserInfo, getProblem } from "../plugin/client.js";
import { deleteSubscription, saveSubscription } from "../plugin/repository.js";
import { sendSubscriptionEmail } from "../plugin/email.js";
import { dayWordMap } from "../util/code.js"

export const createSubscription = async (subscriptionData) => {
    const problemInfo = await getNewProblemInfo(subscriptionData.userId);

    await saveSubscription({
        userId: subscriptionData.userId, 
        email: subscriptionData.email, 
        sendTime: subscriptionData.sendTime,
        sendDays: subscriptionData.sendDays,
        problemSize: problemInfo.problemSize,
        problems: problemInfo.problems
    });

    await sendSubscriptionEmail({
        email: subscriptionData.email,
        userId: subscriptionData.userId,
        days: subscriptionData.sendDays.map(day => dayWordMap[day]).join(', '),
        time: subscriptionData.sendTime,
        problemCount: subscriptionData.problemCount
    });
}

export const cancelSubscription = async (email) => {
    await deleteSubscription(email);
}

const getNewProblemInfo = async (userId) => {
    const { tier } = await getUserInfo(userId);
    const res = await getProblem(userId, tier);

    const items = res.items
        .map(item => ({
            problemId: item.problemId,
            title: item.titleKo,
            tier: item.level,
            averageTries: item.averageTries,
        }))
        .sort((a, b) => {
            if (a.tier !== b.tier) {
                return b.tier - a.tier;
            }
            return b.averageTries - a.averageTries;
        });

    const chunkSize = Math.floor(items.length / 5);
    if (chunkSize === 0) return [];

    const result = [];
    for (let i = 0; i < 5; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        result.push(items.slice(start, end).reverse());
    }

    return {
        problemSize: chunkSize,
        problems: result
    }
}