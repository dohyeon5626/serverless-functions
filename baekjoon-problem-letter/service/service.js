import { getUserInfo, getProblem } from "../plugin/client.js";

export const createSubscription = async (subscriptionData) => {
    const problemInfo = await getNewProblemInfo(subscriptionData.userId, subscriptionData.problemCount);

    
}

const getNewProblemInfo = async (userId, problemCount) => {
    const { tier } = await getUserInfo(userId);
    const res = await getProblem(userId, tier);

    const items = res.items
        .map(item => ({
            problemId: item.problemId,
            titleKo: item.titleKo,
            tier: item.level,
            averageTries: item.averageTries,
        }))
        .sort((a, b) => {
            if (a.tier !== b.tier) {
                return b.tier - a.tier;
            }
            return a.averageTries - b.averageTries;
        });

    const chunkSize = Math.floor(items.length / problemCount);
    if (chunkSize === 0) return [];

    const result = [];
    for (let i = 0; i < problemCount; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        result.push(items.slice(start, end));
    }

    return {
        size: chunkSize,
        problems: result
    }
}