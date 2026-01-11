import { getUserInfo, getProblem } from "../plugin/client.js";
import { deleteSubscription, saveSubscription } from "../plugin/repository.js";
import { sendSubscriptionEmail } from "../plugin/email.js";
import { dayWordMap, dayNameToIndex } from "../util/code.js"

export const createSubscription = async (subscriptionData) => {
    const problemInfo = await getNewProblemInfo(subscriptionData.userId);
    const nextGeneratedDateString = calculateNextGeneratedDate(subscriptionData.sendDays);

    await saveSubscription({
        userId: subscriptionData.userId, 
        email: subscriptionData.email, 
        sendTime: subscriptionData.sendTime,
        sendDays: subscriptionData.sendDays,
        nextGeneratedDate: nextGeneratedDateString,
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
    await deleteSubscription(email); // TODO 구독 취소 이메일
}

export const getNewProblemInfo = async (userId) => {
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

export const calculateNextGeneratedDate = (sendDays) => {
    const sortedSendDays = sendDays
        .map(day => dayNameToIndex[day])
        .sort((a, b) => a - b);

    const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const todayDayIndex = now.getDay();

    let nextGeneratedDate = new Date(now);
    nextGeneratedDate.setHours(0, 0, 0, 0);

    let found = false;
    for (const dayIndex of sortedSendDays) {
        if (dayIndex > todayDayIndex) {
            const daysToAdd = dayIndex - todayDayIndex;
            nextGeneratedDate.setDate(nextGeneratedDate.getDate() + daysToAdd);
            found = true;
            break;
        }
        if (dayIndex === todayDayIndex) {
            if (nextGeneratedDate.getTime() > now.getTime()) {
                found = true;
                break;
            }
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
    
    return nextGeneratedDate.toLocaleDateString("ko-KR", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\./g, '').replace(/\s/g, '-');
};