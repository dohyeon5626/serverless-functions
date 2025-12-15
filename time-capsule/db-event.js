import { unmarshall } from "@aws-sdk/util-dynamodb";
import { deleteImageFromS3 } from './persistence/storage.js';
import { sendCreateTimeCapsuleEmail } from './plugin/email.js';
import { createSchedule } from './plugin/reservation.js';

export const run = async (event) => {
    const promises = event.Records.map(async (record) => {
        try {
            console.log(record.eventName);

            if (record.eventName === 'REMOVE') {
                if (!record.dynamodb.OldImage) return;

                const oldImage = unmarshall(record.dynamodb.OldImage);
                console.log('삭제 대상:', oldImage);

                const imgUrl = oldImage.imgUrl; 
                if (imgUrl) {
                    await deleteImageFromS3(imgUrl);
                }
            } 
            else if (record.eventName === 'INSERT') {
                if (!record.dynamodb.NewImage) return;

                const newImage = unmarshall(record.dynamodb.NewImage);
                console.log('생성 대상:', newImage);

                await createSchedule(new Date(newImage.openDate));
                await sendCreateTimeCapsuleEmail(newImage);
            }
        } catch (error) {
            console.log(`Record ID ${record.eventID} 처리 실패:`, error.message);
        }
    });
    await Promise.all(promises);
    
    console.log(`총 ${event.Records.length}개의 레코드 처리 완료`);
    return { statusCode: 200 };
};