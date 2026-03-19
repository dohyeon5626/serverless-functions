import { unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { deleteImageFromS3 } from './persistence/storage';
import { sendCreateTimeCapsuleEmail } from './plugin/email';
import { createSchedule } from './plugin/reservation';
import { CapsuleRecord } from './persistence/repository';

interface DynamoDBStreamRecord {
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE';
  eventID: string;
  dynamodb: {
    NewImage?: Record<string, AttributeValue>;
    OldImage?: Record<string, AttributeValue>;
  };
}

interface DynamoDBStreamEvent {
  Records: DynamoDBStreamRecord[];
}

export const run = async (event: DynamoDBStreamEvent): Promise<{ statusCode: number }> => {
  const promises = event.Records.map(async (record) => {
    try {
      console.log(record.eventName);

      if (record.eventName === 'REMOVE') {
        if (!record.dynamodb.OldImage) return;

        const oldImage = unmarshall(record.dynamodb.OldImage) as CapsuleRecord;
        console.log('삭제 대상:', oldImage);

        if (oldImage.imgUrl) {
          await deleteImageFromS3(oldImage.imgUrl);
        }
      } else if (record.eventName === 'INSERT') {
        if (!record.dynamodb.NewImage) return;

        const newImage = unmarshall(record.dynamodb.NewImage) as CapsuleRecord;
        console.log('생성 대상:', newImage);

        await createSchedule(new Date(newImage.openDate));
        await sendCreateTimeCapsuleEmail(newImage);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.log(`Record ID ${record.eventID} 처리 실패:`, err.message);
    }
  });

  await Promise.all(promises);
  console.log(`총 ${event.Records.length}개의 레코드 처리 완료`);
  return { statusCode: 200 };
};
