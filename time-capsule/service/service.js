import { saveSubscription, findSubscriptionById, getSubscriptionCounts } from "../persistence/repository.js";
import { uploadImageToS3 } from "../persistence/storage.js"
import { nanoid } from 'nanoid';
import AppError from '../routes/exception.js';

export const createSubscription = async (capsuleData, imageFile) => {
    const id = nanoid();
    var imgUrl = null;
    if (imageFile) {
        imgUrl = await uploadImageToS3(imageFile.buffer, 'time-capusle-' + id + '.' + imageFile.mimetype.split('/')[1], imageFile.mimetype)
    }
    return await saveSubscription(id, capsuleData, imgUrl);
}

export const getSubscriptionById = async (subscriptionId) => {
    const subscription = await findSubscriptionById(subscriptionId);
    if (!subscription) throw new AppError(404, 'Not Found Subscription');

    const {
      openDate, 
      senderName, 
      createdAt, 
      message, 
      usePasswordKey,
      imgUrl
    } = subscription
    
    return {
        openDate, 
        senderName, 
        createdAt, 
        message, 
        usePasswordKey,
        imgUrl
    };
}

export const getSubscriptionStatus = async () => {
    return await getSubscriptionCounts();
}