import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from 'nanoid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function saveSubscription(capsuleData) {
    const id = nanoid();
    const params = {
        TableName: "time_capsule_subscription",
        Item: {
            id: id,
            openDate: capsuleData.openDate,
            senderName: capsuleData.senderName,
            senderPhone: capsuleData.senderPhone,
            message: capsuleData.message,
            recipients: capsuleData.recipients,
            usePasswordKey: capsuleData.usePasswordKey,
            createdAt: new Date().toISOString(),
        },
        ConditionExpression: 'attribute_not_exists(id)',
    };

    try {
        await docClient.send(new PutCommand(params));
        return id;
    } catch (error) {
        console.error("Error saving capsule:", error);
        throw new Error("데이터 저장 실패");
    }
}