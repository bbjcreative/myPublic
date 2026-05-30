import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { FunctionUrls } from './lambda-construct';

interface CloudFrontConstructProps {
  gtfsBucket: s3.Bucket;
  lambdaFunctionUrls: FunctionUrls;
}

export class CloudFrontConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontConstructProps) {
    super(scope, id);

    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
    });

    const apiCachePolicy = new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
      cachePolicyName: 'transit-api-cache',
      defaultTtl: cdk.Duration.seconds(15),
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(30),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList('X-Api-Key'),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    });

    // Rate limit: 100 req/min per IP via WAF (attached separately in production)
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'transit-my CDN',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(props.gtfsBucket, { originAccessControl: oac }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      additionalBehaviors: {
        '/realtime/*': {
          origin: new origins.HttpOrigin(
            new URL(props.lambdaFunctionUrls.realtimeProxy).hostname
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: apiCachePolicy,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        },
        '/trip/*': {
          origin: new origins.HttpOrigin(
            new URL(props.lambdaFunctionUrls.tripPlanner).hostname
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
        '/jpj/*': {
          origin: new origins.HttpOrigin(
            new URL(props.lambdaFunctionUrls.jpjProxy).hostname
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        },
        '/alerts/*': {
          origin: new origins.HttpOrigin(
            new URL(props.lambdaFunctionUrls.notificationDispatcher).hostname
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
      },
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront distribution domain — use as LAMBDA_BASE_URL in mobile app',
    });
  }
}
