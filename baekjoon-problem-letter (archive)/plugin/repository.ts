import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import AppError from '../routes/exception';

const TABLE = process.env.TABLE as string;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface Problem {
  problemId: number;
  title: string;
  tier: number;
  averageTries: number;
}

export interface ProblemInfo {
  problemSize: number;
  problems: Problem[][];
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  sendTime: string;
  sendDays: string[];
  sendRound: number;
  problemGeneratedAt: number;
  nextGeneratedDate: string;
  problemSize: number;
  problems: Problem[][];
  [key: string]: unknown;
}

export interface SaveSubscriptionInput {
  email: string;
  userId: string;
  sendTime: string;
  sendDays: string[];
  nextGeneratedDate: string;
  problemSize: number;
  problems: Problem[][];
}

export interface PaginatedResult<T> {
  items: T[];
  lastEvaluatedKey: Record<string, unknown> | undefined;
}

export const saveSubscription = async (subscriptionData: SaveSubscriptionInput): Promise<void> => {
  try {
    await docClient.send(new PutCommand({
      TableName: TABLE,
      Item: {
        id: subscriptionData.email,
        userId: subscriptionData.userId,
        sendTime: subscriptionData.sendTime,
        sendDays: subscriptionData.sendDays,
        sendRound: 0,
        problemGeneratedAt: new Date().getTime(),
        nextGeneratedDate: subscriptionData.nextGeneratedDate,
        problemSize: subscriptionData.problemSize,
        problems: subscriptionData.problems,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    }));
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === 'ConditionalCheckFailedException') throw new AppError(409, 'Email Already Exists');
    console.log('Error saving subscription:', error);
    throw new Error('데이터 저장 실패');
  }
};

export const deleteSubscription = async (email: string): Promise<SubscriptionRecord> => {
  try {
    const result = await docClient.send(new DeleteCommand({
      TableName: TABLE,
      Key: { id: email },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'ALL_OLD',
    }));
    return result.Attributes as SubscriptionRecord;
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === 'ConditionalCheckFailedException') throw new AppError(404, 'Subscription not found');
    console.error('Error deleting subscription:', error);
    throw new AppError(500, 'Failed to delete subscription');
  }
};

export const findSubscriptionsByTime = async (
  day: string,
  time: string,
  nowLastEvaluatedKey: Record<string, unknown> | null
): Promise<PaginatedResult<SubscriptionRecord>> => {
  const params: {
    TableName: string;
    FilterExpression: string;
    ExpressionAttributeValues: Record<string, unknown>;
    Limit: number;
    ExclusiveStartKey?: Record<string, unknown>;
  } = {
    TableName: TABLE,
    FilterExpression: 'contains(sendDays, :day) and sendTime = :time',
    ExpressionAttributeValues: { ':day': day, ':time': time },
    Limit: 100,
  };

  if (nowLastEvaluatedKey) {
    params.ExclusiveStartKey = nowLastEvaluatedKey;
  }

  try {
    const { Items, LastEvaluatedKey } = await docClient.send(new ScanCommand(params));
    return {
      items: (Items ?? []) as SubscriptionRecord[],
      lastEvaluatedKey: LastEvaluatedKey as Record<string, unknown> | undefined,
    };
  } catch (error) {
    console.error('Error scanning subscriptions:', error);
    throw new Error('데이터 조회 실패');
  }
};

export const updateSubscriptionRound = async (id: string, newSendRound: number, nextGeneratedDate: string): Promise<void> => {
  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'set sendRound = :round, nextGeneratedDate = :nextGeneratedDate',
      ExpressionAttributeValues: {
        ':round': newSendRound,
        ':nextGeneratedDate': nextGeneratedDate,
      },
    }));
  } catch (error) {
    console.error(`Error updating subscription ${id}:`, error);
    throw new Error('데이터 업데이트 실패');
  }
};

export const findSubscriptionsByNextGeneratedDate = async (nextGeneratedDate: string): Promise<SubscriptionRecord[]> => {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'NextGeneratedDateIndex',
      KeyConditionExpression: 'nextGeneratedDate = :date',
      ExpressionAttributeValues: { ':date': nextGeneratedDate },
      ScanIndexForward: true,
      Limit: 100,
    }));
    return (result.Items ?? []) as SubscriptionRecord[];
  } catch (error) {
    console.error('Error scanning subscriptions:', error);
    throw new Error('데이터 조회 실패');
  }
};

export const updateSubscriptionProblemInfo = async (id: string, problemInfo: ProblemInfo, nextGeneratedDate: string): Promise<void> => {
  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'set sendRound = :round, problemGeneratedAt = :problemGeneratedAt, problems = :problems, problemSize = :problemSize, nextGeneratedDate = :nextGeneratedDate',
      ExpressionAttributeValues: {
        ':round': 0,
        ':problemGeneratedAt': new Date().getTime(),
        ':problems': problemInfo.problems,
        ':problemSize': problemInfo.problemSize,
        ':nextGeneratedDate': nextGeneratedDate,
      },
    }));
  } catch (error) {
    console.error(`Error updating subscription ${id}:`, error);
    throw new Error('데이터 업데이트 실패');
  }
};
