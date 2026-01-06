import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import AppError from "../routes/exception.js";

const TABLE = process.env.TABLE;

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const saveSubscription = async (subscriptionData) => {
    const subscriptionParams = {
        TableName: TABLE,
        Item: {
            id: subscriptionData.email,
            userId: subscriptionData.userId,
            sendTime: subscriptionData.sendTime,
            problemCount: subscriptionData.problemCount,
            sendDays: subscriptionData.sendDays,
            problemSize: subscriptionData.problemSize,
            problems: subscriptionData.problems
        },
        ConditionExpression: 'attribute_not_exists(id)',
    };

    try {
        await docClient.send(new PutCommand(subscriptionParams));
    } catch (error) {
        if (error.name === "ConditionalCheckFailedException") {
            throw new AppError(409, 'Email Already Exists');
        }
        console.log("Error saving subscription:", error);
        throw new Error("데이터 저장 실패");
    }
}