import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.TABLE as string;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface Recipient {
  name: string;
  email: string;
}

export interface CapsuleData {
  recipients: Recipient[];
  senderName: string;
  senderEmail: string;
  message: string;
  openDate: number;
  usePasswordKey: boolean;
  originalHeader?: string;
}

export interface CapsuleRecord {
  id: string;
  openDate: number;
  senderName: string;
  senderEmail: string;
  message: string;
  recipients: Recipient[];
  usePasswordKey: boolean;
  createdAt: number;
  deleteDateTtl: number;
  openStatus: 'WAIT' | 'OPEN';
  originalHeader?: string;
  imgUrl: string | null;
  [key: string]: unknown;
}

export interface SubscriptionCounts {
  sentCount: number;
  waitingCount: number;
}

export const saveSubscription = async (id: string, capsuleData: CapsuleData, imgUrl: string | null): Promise<string> => {
  const openDateObj = new Date(capsuleData.openDate);
  const oneYearLater = new Date(openDateObj);
  oneYearLater.setFullYear(openDateObj.getFullYear() + 10);
  const deleteDateTtl = Math.floor(oneYearLater.getTime() / 1000);

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE,
      Item: {
        id,
        openDate: new Date(capsuleData.openDate).getTime(),
        senderName: capsuleData.senderName,
        senderEmail: capsuleData.senderEmail,
        message: capsuleData.message,
        recipients: capsuleData.recipients,
        usePasswordKey: capsuleData.usePasswordKey,
        createdAt: new Date().getTime(),
        deleteDateTtl,
        openStatus: 'WAIT',
        originalHeader: capsuleData.originalHeader,
        imgUrl,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    }));
    return id;
  } catch (error) {
    console.log('Error saving capsule:', error);
    throw new Error('데이터 저장 실패');
  }
};

export const findSubscriptionById = async (subscriptionId: string): Promise<CapsuleRecord | undefined> => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE,
    Key: { id: subscriptionId },
  }));
  return result.Item as CapsuleRecord | undefined;
};

export const getSubscriptionCounts = async (): Promise<SubscriptionCounts> => {
  try {
    const [openResult, waitResult] = await Promise.all([
      docClient.send(new QueryCommand({
        TableName: TABLE,
        IndexName: 'OpenStatusIndex',
        KeyConditionExpression: 'openStatus = :open',
        ExpressionAttributeValues: { ':open': 'OPEN' },
        Select: 'COUNT',
      })),
      docClient.send(new QueryCommand({
        TableName: TABLE,
        IndexName: 'OpenStatusIndex',
        KeyConditionExpression: 'openStatus = :wait',
        ExpressionAttributeValues: { ':wait': 'WAIT' },
        Select: 'COUNT',
      })),
    ]);
    return {
      sentCount: openResult.Count ?? 0,
      waitingCount: waitResult.Count ?? 0,
    };
  } catch (error) {
    console.log('Error querying subscription counts:', error);
    throw new Error('구독 개수 조회 실패');
  }
};

export const findAllSubscriptionByOpenDate = async (
  openDateTime: number,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<{ Items: CapsuleRecord[]; LastEvaluatedKey?: Record<string, unknown> }> => {
  const params: {
    TableName: string;
    IndexName: string;
    KeyConditionExpression: string;
    ExpressionAttributeValues: Record<string, unknown>;
    Limit: number;
    ExclusiveStartKey?: Record<string, unknown>;
  } = {
    TableName: TABLE,
    IndexName: 'OpenDateIndex',
    KeyConditionExpression: 'openDate = :sendDate',
    ExpressionAttributeValues: { ':sendDate': openDateTime },
    Limit: 100,
  };

  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }

  try {
    const { Items, LastEvaluatedKey } = await docClient.send(new QueryCommand(params));
    return {
      Items: (Items ?? []) as CapsuleRecord[],
      LastEvaluatedKey: LastEvaluatedKey as Record<string, unknown> | undefined,
    };
  } catch (error) {
    console.log('Error querying subscription counts:', error);
    throw new Error('발송할 구독 목록 조회 실패');
  }
};

export const updateCapsuleStatusForOpen = async (id: string): Promise<void> => {
  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'SET openStatus = :status',
      ExpressionAttributeValues: { ':status': 'OPEN' },
    }));
  } catch (error) {
    console.error(`Error Failed to update status for ${id}:`, error);
    throw new Error('상태 업데이트 실패');
  }
};
