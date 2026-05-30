#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TransitStack } from '../lib/transit-stack';

const app = new cdk.App();

new TransitStack(app, 'TransitMyStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
  },
  tags: {
    Project: 'transit-my',
    Environment: 'production',
  },
});
