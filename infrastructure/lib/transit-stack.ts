import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDbConstruct } from './dynamodb-construct';
import { S3Construct } from './s3-construct';
import { LambdaConstruct } from './lambda-construct';
import { CloudFrontConstruct } from './cloudfront-construct';
import { EventBridgeConstruct } from './eventbridge-construct';

export class TransitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const db = new DynamoDbConstruct(this, 'Database');
    const storage = new S3Construct(this, 'Storage');
    const lambdas = new LambdaConstruct(this, 'Lambdas', {
      tables: db.tables,
      gtfsBucket: storage.gtfsBucket,
    });
    new CloudFrontConstruct(this, 'CDN', {
      gtfsBucket: storage.gtfsBucket,
      lambdaFunctionUrls: lambdas.functionUrls,
    });
    new EventBridgeConstruct(this, 'Scheduler', {
      gtfsPollerFn: lambdas.gtfsPollerFn,
    });

    new cdk.CfnOutput(this, 'LambdaBaseUrl', {
      value: lambdas.functionUrls.realtimeProxy,
      description: 'Realtime proxy function URL (use as base for LAMBDA_BASE_URL)',
    });
  }
}
