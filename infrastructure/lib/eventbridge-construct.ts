import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface EventBridgeConstructProps {
  gtfsPollerFn: lambda.Function;
}

export class EventBridgeConstruct extends Construct {
  constructor(scope: Construct, id: string, props: EventBridgeConstructProps) {
    super(scope, id);

    // Run GTFS poller every Sunday at 02:00 UTC (10:00 MYT) — low-traffic window
    new events.Rule(this, 'GtfsPollSchedule', {
      ruleName: 'transit-gtfs-weekly-poll',
      schedule: events.Schedule.cron({ minute: '0', hour: '2', weekDay: 'SUN' }),
      targets: [new targets.LambdaFunction(props.gtfsPollerFn, { retryAttempts: 2 })],
      description: 'Triggers weekly GTFS static data refresh from api.data.gov.my',
    });
  }
}
