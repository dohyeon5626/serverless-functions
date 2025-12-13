import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from 'nanoid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const saveSubscription = async (capsuleData) => {
    const id = nanoid();
    const openDateObj = new Date(capsuleData.openDate);
    const oneYearLater = new Date(openDateObj);
    oneYearLater.setFullYear(openDateObj.getFullYear() + 1);
    const deleteDateTtl = Math.floor(oneYearLater.getTime() / 1000);
    const reservationDateTtl = Math.floor(new Date(openDateObj).getTime() / 1000);

    const subscriptionParams = {
        TableName: "time_capsule_subscription",
        Item: {
            id: id,
            openDate: new Date(capsuleData.openDate).getTime(),
            senderName: capsuleData.senderName,
            senderEmail: capsuleData.senderEmail,
            message: capsuleData.message,
            recipients: capsuleData.recipients,
            usePasswordKey: capsuleData.usePasswordKey,
            createdAt: new Date().getTime(),
            deleteDateTtl: deleteDateTtl,
        },
        ConditionExpression: 'attribute_not_exists(id)',
    };

    const reservationParams = {
        TableName: "time_capsule_reservation",
        Item: {
            id: id,
            reservationDateTtl: reservationDateTtl,
        },
        ConditionExpression: 'attribute_not_exists(id)',
    };

    try {
        await docClient.send(new PutCommand(subscriptionParams));
        await docClient.send(new PutCommand(reservationParams));
        return id;
    } catch (error) {
        console.error("Error saving capsule:", error);
        throw new Error("데이터 저장 실패");
    }
}

export const findSubscriptionById = async (subscriptionId) => {
    const result = await docClient.send(new GetCommand({
        TableName: "time_capsule_subscription",
        Key: { id: subscriptionId },
    }));
    return result.Item;
}