#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MyPublicStack } from '../lib/transit-stack';

const app = new cdk.App();

new MyPublicStack(app, 'TransitMyStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION ?? 'ap-southeast-5',
  },
  tags: {
    Project: 'my-public',
    Environment: 'production',
  },
});
