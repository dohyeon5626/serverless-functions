import { sendOpenTimeCapsuleEmail } from './plugin/email.js';
import { findAllSubscriptionByOpenDate, updateCapsuleStatusForOpen } from './persistence/repository.js';

export const run = async (event) => {
    console.log(event);
    const triggerTime = event.triggerTime;
    console.log(triggerTime);
    
    try {
        const capsules = await findAllSubscriptionByOpenDate(triggerTime);

        if (!capsules || capsules.length === 0) {
            console.log("발송할 타임캡슐이 없습니다.");
            return;
        }

        console.log(`${capsules.length}개의 타임캡슐을 발송합니다.`);

        const sendPromises = capsules.map(async (item) => {
            try {
                await sendOpenTimeCapsuleEmail(item);
                await updateCapsuleStatusForOpen(item.id); 
                console.log(`[발송 성공] ${item.userEmail}`);
            } catch (error) {
                console.error(`[발송 실패] ${item.userEmail} - ${error.message}`);
            }
        });

        await Promise.all(sendPromises);
    } catch (error) {
        console.error("Critical Error:", error);
        throw error;
    }
};