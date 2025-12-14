import { unmarshall } from "@aws-sdk/util-dynamodb";
import { deleteImageFromS3 } from './persistence/storage.js';

export const run = async (event) => {
    for (const record of event.Records) {
        if (record.eventName === 'REMOVE') {
            try {
                const oldImage = unmarshall(record.dynamodb.OldImage);
                console.log(oldImage);
                const imgUrl = oldImage.imgUrl; 
                if (imgUrl) await deleteImageFromS3(imgUrl);
            } catch (error) {
                console.log('Record 처리 실패:', error.message, 'Record ID:', record.eventID);
            }
        }
    }
    
    return { statusCode: 200 };
};