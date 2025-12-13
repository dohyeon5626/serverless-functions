import { saveSubscription, findSubscriptionById } from "../repository/repository.js";

export const createSubscription = async (capsuleData) => {
    // TODO 후에 파일 업로드도 진행 예정
    return await saveSubscription(capsuleData);
}

export const getSubscriptionById = async (subscriptionId) => {
    const subscription = await findSubscriptionById(subscriptionId);
    if (!subscription) throw new AppError(404, 'Not Found Subscription');

    const {
      openDate, 
      senderName, 
      createdAt, 
      message, 
      usePasswordKey
    } = subscription
    
    return {
        openDate, 
        senderName, 
        createdAt, 
        message, 
        usePasswordKey
    };
}