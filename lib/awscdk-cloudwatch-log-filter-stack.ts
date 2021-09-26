import * as cdk from '@aws-cdk/core';
import {FilterPattern, LogGroup, MetricFilter, RetentionDays} from "@aws-cdk/aws-logs";
import {Alarm} from "@aws-cdk/aws-cloudwatch";
import {Topic} from "@aws-cdk/aws-sns";
import {SnsAction} from "@aws-cdk/aws-cloudwatch-actions";
import {LoggingLevel, SlackChannelConfiguration} from "@aws-cdk/aws-chatbot";
import {ConfigParams} from "../config/config-params";

export class AwscdkCloudwatchLogFilterStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const appName = this.node.tryGetContext('appName');

        //Creating a CloudWatch log group
        const logGroup = new LogGroup(this, `${appName}-${ConfigParams.logGroupName}`, {
            logGroupName: ConfigParams.logGroupName,
            retention: RetentionDays.INFINITE
        });

        //Creating a metric filter for the log group
        const metricFilter = new MetricFilter(this, `${appName}-MetricFilter`, {
            logGroup,
            metricNamespace: ConfigParams.metricFilter.metricNamespace,
            metricName:  ConfigParams.metricFilter.metricName,
            filterPattern: FilterPattern.anyTerm(...ConfigParams.metricFilter.filterPattern),
            metricValue: '1',
        });

        const metric = metricFilter.metric();

        const alarm = new Alarm(this, `${appName}-AlarmMetricFilter`, {
            metric,
            threshold: ConfigParams.alarm.threshold,
            evaluationPeriods: ConfigParams.alarm.evaluationPeriods,
            statistic: ConfigParams.alarm.statistic,
        });

        //Creating a SNS topic for alarm
        const snsTopic = new Topic(this, `${appName}-LogFilterTopic`, {
            displayName: ConfigParams.sns.topicName,
            fifo: false
        });

        alarm.addAlarmAction(new SnsAction(snsTopic));

        //Configure slack channel
         new SlackChannelConfiguration(this, `${appName}-LogDriverSlackChannel`, {
            slackChannelConfigurationName:ConfigParams.slack.slackChannelConfigurationName,
            slackChannelId: ConfigParams.slack.slackChannelId,
            slackWorkspaceId:ConfigParams.slack.slackWorkspaceId,
            notificationTopics: [snsTopic],
            loggingLevel: LoggingLevel.ERROR
        });
    }
}
