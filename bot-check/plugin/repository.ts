import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.TABLE as string;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface ActionRecord {
  id: string;
  token: string;
  verificationTimeout: number;
  owner: string;
  repo: string;
  createdAt: number;
  ttl: number;
}

export const saveAction = async (record: ActionRecord): Promise<void> => {
  await docClient.send(new PutCommand({
    TableName: TABLE,
    Item: record,
  }));
};
