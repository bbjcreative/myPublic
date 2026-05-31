import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface TransitTables {
  stops: dynamodb.Table;
  routes: dynamodb.Table;
  users: dynamodb.Table;
  alerts: dynamodb.Table;
}

export class DynamoDbConstruct extends Construct {
  public readonly tables: TransitTables;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const stops = new dynamodb.Table(this, 'Stops', {
      tableName: 'mypublic-stops',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    stops.addGlobalSecondaryIndex({
      indexName: 'agency-stop_name-index',
      partitionKey: { name: 'agency', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'stop_name', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    stops.addGlobalSecondaryIndex({
      indexName: 'geohash-index',
      partitionKey: { name: 'geohash4', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'stop_lat', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const routes = new dynamodb.Table(this, 'Routes', {
      tableName: 'mypublic-routes',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    routes.addGlobalSecondaryIndex({
      indexName: 'route_short_name-index',
      partitionKey: { name: 'route_short_name', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const users = new dynamodb.Table(this, 'Users', {
      tableName: 'mypublic-users',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const alerts = new dynamodb.Table(this, 'Alerts', {
      tableName: 'mypublic-alerts',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    alerts.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'start_time', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.tables = { stops, routes, users, alerts };
  }
}
