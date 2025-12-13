import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const TABLE = process.env.TABLE;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const saveSubscription = async (id, capsuleData, imgUrl) => {
    const openDateObj = new Date(capsuleData.openDate);
    const oneYearLater = new Date(openDateObj);
    oneYearLater.setFullYear(openDateObj.getFullYear() + 10);
    const deleteDateTtl = Math.floor(oneYearLater.getTime() / 1000);

    const subscriptionParams = {
        TableName: TABLE,
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
            openStatus: "WAIT",
            imgUrl: imgUrl
        },
        ConditionExpression: 'attribute_not_exists(id)',
    };

    try {
        await docClient.send(new PutCommand(subscriptionParams));
        return id;
    } catch (error) {
        console.error("Error saving capsule:", error);
        throw new Error("데이터 저장 실패");
    }
}

export const findSubscriptionById = async (subscriptionId) => {
    const result = await docClient.send(new GetCommand({
        TableName: TABLE,
        Key: { id: subscriptionId },
    }));
    return result.Item;
}

export const getSubscriptionCounts = async () => {
    const openParams = {
        TableName: TABLE,
        IndexName: "OpenStatusIndex",
        KeyConditionExpression: "openStatus = :open",
        ExpressionAttributeValues: {
            ":open": "OPEN",
        },
        Select: "COUNT",
    };

    const waitParams = {
        TableName: TABLE,
        IndexName: "OpenStatusIndex",
        KeyConditionExpression: "openStatus = :wait",
        ExpressionAttributeValues: {
            ":wait": "WAIT",
        },
        Select: "COUNT",
    };

    try {
        const openResult = await docClient.send(new QueryCommand(openParams));
        const waitResult = await docClient.send(new QueryCommand(waitParams));

        const openCount = openResult.Count;
        const waitCount = waitResult.Count;

        return {
            sentCount: openCount,
            waitingCount: waitCount,
        };
    } catch (error) {
        console.error("Error querying subscription counts:", error);
        throw new Error("구독 개수 조회 실패");
    }
}