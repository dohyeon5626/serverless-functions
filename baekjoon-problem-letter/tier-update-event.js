import { findSubscriptionsByNextGeneratedDate, updateSubscriptionProblemInfo } from "./plugin/repository.js";
import { getNewProblemInfo } from "./service/service.js";

export const run = async (event) => {
    const now = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const dateString = now.toLocaleDateString("ko-KR", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\./g, '').replace(/\s/g, '-');

    const subscriptions = await findSubscriptionsByNextGeneratedDate(dateString);
    for (const subscription of subscriptions) {
        if (subscription.sendRound == 0) break;
        try {
            const problemInfo = await getNewProblemInfo(subscription.userId);
            await updateSubscriptionProblemInfo(subscription.id, problemInfo);
        } catch (error) {
            console.error(`Error updating subscription ${subscription.id}:`, error);
        }
    }

    // TODO 100개 보다 많으면 20분뒤에 더 돌려야함
}