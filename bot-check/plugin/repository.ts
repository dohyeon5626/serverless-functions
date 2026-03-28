import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.TABLE as string;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface ActionRecord {
  id: string;
  token: string;
  owner: string;
  repo: string;
  issueNumber?: number;
  prNumber?: number;
  commentId: number;
  ttl: number;
}

export const saveAction = async (record: ActionRecord): Promise<void> => {
  await docClient.send(new PutCommand({
    TableName: TABLE,
    Item: record,
  }));
};

export const getAction = async (id: string): Promise<ActionRecord | null> => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE,
    Key: { id },
  }));
  return (result.Item as ActionRecord) ?? null;
};

export const deleteAction = async (id: string): Promise<void> => {
  await docClient.send(new DeleteCommand({
    TableName: TABLE,
    Key: { id },
  }));
};
