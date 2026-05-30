import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'ap-southeast-5',
  maxAttempts: 3,
});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: false },
  unmarshallOptions: { wrapNumbers: false },
});

export const TABLE_STOPS = process.env.DYNAMODB_TABLE_STOPS ?? 'transit-stops';
export const TABLE_ROUTES = process.env.DYNAMODB_TABLE_ROUTES ?? 'transit-routes';
export const TABLE_USERS = process.env.DYNAMODB_TABLE_USERS ?? 'transit-users';
export const TABLE_ALERTS = process.env.DYNAMODB_TABLE_ALERTS ?? 'transit-alerts';
