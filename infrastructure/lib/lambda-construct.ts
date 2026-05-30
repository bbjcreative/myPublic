import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { TransitTables } from './dynamodb-construct';
import * as path from 'path';

interface LambdaConstructProps {
  tables: TransitTables;
  gtfsBucket: s3.Bucket;
}

export interface FunctionUrls {
  realtimeProxy: string;
  tripPlanner: string;
  jpjProxy: string;
  notificationDispatcher: string;
}

export class LambdaConstruct extends Construct {
  public readonly gtfsPollerFn: lambda.Function;
  public readonly functionUrls: FunctionUrls;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const commonEnv = {
      DYNAMODB_TABLE_STOPS: props.tables.stops.tableName,
      DYNAMODB_TABLE_ROUTES: props.tables.routes.tableName,
      DYNAMODB_TABLE_USERS: props.tables.users.tableName,
      DYNAMODB_TABLE_ALERTS: props.tables.alerts.tableName,
      GTFS_S3_BUCKET: props.gtfsBucket.bucketName,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    };

    const commonProps: Partial<lambda.FunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: commonEnv,
    };

    this.gtfsPollerFn = new lambda.Function(this, 'GtfsPoller', {
      ...commonProps,
      functionName: 'transit-gtfs-poller',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../packages/lambdas/gtfs-poller/dist')
      ),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
    });

    const realtimeProxyFn = new lambda.Function(this, 'RealtimeProxy', {
      ...commonProps,
      functionName: 'transit-realtime-proxy',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../packages/lambdas/realtime-proxy/dist')
      ),
    });

    const tripPlannerFn = new lambda.Function(this, 'TripPlanner', {
      ...commonProps,
      functionName: 'transit-trip-planner',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../packages/lambdas/trip-planner/dist')
      ),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(15),
    });

    const jpjProxyFn = new lambda.Function(this, 'JpjProxy', {
      ...commonProps,
      functionName: 'transit-jpj-proxy',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../packages/lambdas/jpj-proxy/dist')
      ),
    });

    const notificationDispatcherFn = new lambda.Function(this, 'NotificationDispatcher', {
      ...commonProps,
      functionName: 'transit-notification-dispatcher',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../packages/lambdas/notification-dispatcher/dist')
      ),
    });

    // Grant DynamoDB permissions
    [this.gtfsPollerFn, realtimeProxyFn, tripPlannerFn, jpjProxyFn, notificationDispatcherFn].forEach(fn => {
      props.tables.stops.grantReadWriteData(fn);
      props.tables.routes.grantReadWriteData(fn);
      props.tables.users.grantReadWriteData(fn);
      props.tables.alerts.grantReadWriteData(fn);
    });

    // Grant S3
    props.gtfsBucket.grantReadWrite(this.gtfsPollerFn);
    props.gtfsBucket.grantRead(realtimeProxyFn);
    props.gtfsBucket.grantRead(tripPlannerFn);

    // Grant SNS publish for notification dispatcher
    notificationDispatcherFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sns:Publish'],
      resources: [`arn:aws:sns:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:transit-alerts`],
    }));

    // Function URLs (replaces API Gateway — free)
    const corsConfig: lambda.FunctionUrlCorsOptions = {
      allowedOrigins: ['*'],
      allowedMethods: [lambda.HttpMethod.GET, lambda.HttpMethod.POST],
      allowedHeaders: ['Content-Type', 'X-Api-Key'],
    };

    const realtimeUrl = realtimeProxyFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: corsConfig,
    });
    const tripUrl = tripPlannerFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: corsConfig,
    });
    const jpjUrl = jpjProxyFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: corsConfig,
    });
    const notifUrl = notificationDispatcherFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: corsConfig,
    });

    this.functionUrls = {
      realtimeProxy: realtimeUrl.url,
      tripPlanner: tripUrl.url,
      jpjProxy: jpjUrl.url,
      notificationDispatcher: notifUrl.url,
    };
  }
}
