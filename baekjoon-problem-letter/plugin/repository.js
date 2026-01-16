import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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
            sendRound: 0,
            problemGeneratedAt: new Date().getTime(),
            nextGeneratedDate: subscriptionData.nextGeneratedDate,
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

export const deleteSubscription = async (email) => {
    const deleteParams = {
        TableName: process.env.TABLE,
        Key: {
            id: email,
        },
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "ALL_OLD"
    };

    try {
        return (await docClient.send(new DeleteCommand(deleteParams))).Attributes;
    } catch (error) {
        if (error.name === "ConditionalCheckFailedException") {
            throw new AppError(404, "Subscription not found");
        }

        console.error("Error deleting subscription:", error);
        throw new AppError(500, "Failed to delete subscription");
    }
}

export const findSubscriptionsByTime = async (day, time, nowLastEvaluatedKey) => {
    const scanParams = {
        TableName: TABLE,
        FilterExpression: "contains(sendDays, :day) and sendTime = :time",
        ExpressionAttributeValues: {
            ":day": day,
            ":time": time,
        },
        Limit: 100
    };

    if (nowLastEvaluatedKey) {
        scanParams.ExclusiveStartKey = nowLastEvaluatedKey;
    }

    try {
        const { Items, LastEvaluatedKey } = await docClient.send(new ScanCommand(scanParams));
        return { items: Items, lastEvaluatedKey: LastEvaluatedKey };
    } catch (error) {
        console.error("Error scanning subscriptions:", error);
        throw new Error("데이터 조회 실패");
    }
};

export const updateSubscriptionRound = async (id, newSendRound, nextGeneratedDate) => {
    const updateParams = {
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "set sendRound = :round, nextGeneratedDate = :nextGeneratedDate",
        ExpressionAttributeValues: {
            ":round": newSendRound,
            ":nextGeneratedDate": nextGeneratedDate
        },
    };

    try {
        await docClient.send(new UpdateCommand(updateParams));
    } catch (error) {
        console.error(`Error updating subscription ${id}:`, error);
        throw new Error("데이터 업데이트 실패");
    }
};

export const findSubscriptionsByNextGeneratedDate = async (
  nextGeneratedDate
) => {
    const params = {
        TableName: TABLE,
        IndexName: "NextGeneratedDateIndex",
        KeyConditionExpression: "nextGeneratedDate = :date",
        ExpressionAttributeValues: {
        ":date": nextGeneratedDate,
        },
        ScanIndexForward: true,
        Limit: 100
    };

    try {
        return (await docClient.send(new QueryCommand(params))).Items;
    } catch (error) {
        console.error("Error scanning subscriptions:", error);
        throw new Error("데이터 조회 실패");
    }
};

export const updateSubscriptionProblemInfo = async (id, problemInfo, nextGeneratedDate) => {
    const updateParams = {
        TableName: TABLE,
        Key: { id },
        UpdateExpression: "set sendRound = :round, problemGeneratedAt = :problemGeneratedAt, problems = :problems, problemSize = :problemSize, nextGeneratedDate = :nextGeneratedDate",
        ExpressionAttributeValues: {
            ":round": 0,
            ":problemGeneratedAt": new Date().getTime(),
            ":problems": problemInfo.problems,
            ":problemSize": problemInfo.problemSize,
            ":nextGeneratedDate": nextGeneratedDate
        },
    };

    try {
        await docClient.send(new UpdateCommand(updateParams));
    } catch (error) {
        console.error(`Error updating subscription ${id}:`, error);
        throw new Error("데이터 업데이트 실패");
    }
};