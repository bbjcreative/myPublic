import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class S3Construct extends Construct {
  public readonly gtfsBucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.gtfsBucket = new s3.Bucket(this, 'GtfsCache', {
      bucketName: `transit-my-gtfs-cache-${cdk.Aws.ACCOUNT_ID}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      lifecycleRules: [
        {
          id: 'expire-old-gtfs',
          prefix: 'gtfs/',
          expiration: cdk.Duration.days(30),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }
}
