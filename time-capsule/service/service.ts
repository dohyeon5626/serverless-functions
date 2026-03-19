import { saveSubscription, findSubscriptionById, getSubscriptionCounts, CapsuleData, CapsuleRecord, SubscriptionCounts } from '../persistence/repository';
import { uploadImageToS3 } from '../persistence/storage';
import { nanoid } from 'nanoid';
import AppError from '../routes/exception';

export const createSubscription = async (capsuleData: CapsuleData, imageFile: Express.Multer.File | null): Promise<string> => {
  const id = nanoid();
  const imgUrl = imageFile
    ? await uploadImageToS3(imageFile.buffer, `time-capusle-${id}.${imageFile.mimetype.split('/')[1]}`, imageFile.mimetype)
    : null;
  return saveSubscription(id, capsuleData, imgUrl);
};

export const getSubscriptionById = async (subscriptionId: string): Promise<Partial<CapsuleRecord>> => {
  const subscription = await findSubscriptionById(subscriptionId);
  if (!subscription) throw new AppError(404, 'Not Found Subscription');

  const { openDate, senderName, createdAt, message, usePasswordKey, imgUrl, originalHeader } = subscription;
  return { openDate, senderName, createdAt, message, usePasswordKey, imgUrl, originalHeader };
};

export const getSubscriptionStatus = async (): Promise<SubscriptionCounts> => {
  return getSubscriptionCounts();
};
