export const ConfigParams = {
    logGroupName: 'app-errors',
    metricFilter: {
        metricNamespace: 'AppErrorNamespace',
        metricName: 'AppErrorCount',
        filterPattern: ['ERROR', 'Error', "error"],
    },
    alarm: {
        threshold: 2,
        evaluationPeriods: 2,
        statistic: "SUM",
    },
    sns: {
        topicName: 'app-errors-topic'
    },
    slack: {
        slackChannelConfigurationName: "driver-service-alerts",
        slackChannelId: "C02F5DWVB9V",
        slackWorkspaceId: "T02CQ1XC99Q",
    }
}
