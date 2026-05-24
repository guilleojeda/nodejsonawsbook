const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

const DEFAULT_NAMESPACE = 'SimpleAWSNodejsApp/Custom';
const DEFAULT_SERVICE_NAME = 'SimpleAWSNodejsApp';

function createMetricRecorder({
    client = new CloudWatchClient({
        region: process.env.AWS_REGION || 'us-east-1',
    }),
    namespace = process.env.METRIC_NAMESPACE || DEFAULT_NAMESPACE,
    environment = process.env.ENVIRONMENT || 'production',
    serviceName = process.env.OTEL_SERVICE_NAME || process.env.SERVICE_NAME || DEFAULT_SERVICE_NAME,
    logger = console,
} = {}) {
    async function sendMetric(metricName, value, unit = 'Count') {
        const command = new PutMetricDataCommand({
            Namespace: namespace,
            MetricData: [
                {
                    MetricName: metricName,
                    Dimensions: [
                        {
                            Name: 'Environment',
                            Value: environment,
                        },
                        {
                            Name: 'Service',
                            Value: serviceName,
                        },
                    ],
                    Unit: unit,
                    Value: value,
                },
            ],
        });

        return client.send(command);
    }

    function recordMetric(metricName, value, unit = 'Count') {
        sendMetric(metricName, value, unit).catch((error) => {
            logger.error('Failed to publish custom metric', error);
        });
    }

    return {
        recordMetric,
        sendMetric,
    };
}

module.exports = {
    createMetricRecorder,
};
