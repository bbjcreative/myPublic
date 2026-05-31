import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, errorResponse, ApiError } from '@my-public/lambda-shared/errors';
import { ddb, TABLE_ALERTS, TABLE_USERS } from '@my-public/lambda-shared/db';
import { AlertRecord } from '@my-public/lambda-shared/types';
import { buildAlertMessage } from './templates';

const sns = new SNSClient({ region: process.env.AWS_REGION ?? 'ap-southeast-5' });
const SNS_TOPIC_ARN = process.env.SNS_ALERTS_TOPIC_ARN ?? '';

interface SubscribeRequest {
  device_id: string;
  route_ids: string[];
  fcm_token: string;
}

interface DispatchRequest {
  alert: AlertRecord;
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const path = event.rawPath ?? '';
    if (!event.body) throw new ApiError('MISSING_BODY', 'Request body required', 400);

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(event.body) as Record<string, unknown>;
    } catch {
      throw new ApiError('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    if (path.endsWith('/alerts/subscribe')) {
      const req = body as SubscribeRequest;
      if (!req.device_id) throw new ApiError('MISSING_DEVICE_ID', 'device_id is required', 400);
      if (!Array.isArray(req.route_ids) || req.route_ids.length === 0) {
        throw new ApiError('MISSING_ROUTES', 'route_ids array is required', 400);
      }

      await ddb.send(new PutCommand({
        TableName: TABLE_USERS,
        Item: {
          PK: `USER#${req.device_id}`,
          SK: 'PREFS',
          fcm_token: req.fcm_token,
          subscribed_routes: req.route_ids,
          updated_at: Math.floor(Date.now() / 1000),
        },
      }));

      return jsonResponse({ subscription_id: req.device_id, subscribed_routes: req.route_ids });
    }

    if (path.endsWith('/alerts/dispatch')) {
      const req = body as DispatchRequest;
      if (!req.alert) throw new ApiError('MISSING_ALERT', 'alert object required', 400);

      const alert = req.alert;
      const ttl = alert.end_time + 24 * 60 * 60;

      await ddb.send(new PutCommand({
        TableName: TABLE_ALERTS,
        Item: {
          PK: `ALERT#${alert.alert_id}`,
          SK: 'ACTIVE',
          ...alert,
          ttl,
        },
      }));

      const message = buildAlertMessage(
        alert.severity,
        alert.header_text,
        alert.description_text,
        alert.affected_routes
      );

      await sns.send(new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Message: JSON.stringify({
          default: message.body_en,
          GCM: JSON.stringify({
            notification: { title: message.title_en, body: message.body_en },
            data: { alert_id: alert.alert_id, severity: alert.severity, routes: alert.affected_routes.join(',') },
          }),
          APNS: JSON.stringify({
            aps: { alert: { title: message.title_en, body: message.body_en }, sound: 'default' },
          }),
        }),
        MessageStructure: 'json',
        Subject: message.title_en,
      }));

      return jsonResponse({ dispatched: true, alert_id: alert.alert_id });
    }

    throw new ApiError('NOT_FOUND', `Unknown path: ${path}`, 404);
  } catch (err) {
    return errorResponse(err) as APIGatewayProxyResultV2;
  }
}
