const assert = require('node:assert/strict');
const { setImmediate: tick } = require('node:timers/promises');
const { createMetricRecorder } = require('../metrics');

async function testMetricPayload() {
    let sentInput;
    const recorder = createMetricRecorder({
        namespace: 'SimpleAWSNodejsApp/Custom',
        environment: 'test',
        serviceName: 'SimpleAWSNodejsApp',
        client: {
            send: async(command) => {
                sentInput = command.input;
            },
        },
        logger: {
            error: () => {},
        },
    });

    await recorder.sendMetric('ResponseTime', 123, 'Milliseconds');

    assert.equal(sentInput.Namespace, 'SimpleAWSNodejsApp/Custom');
    assert.deepEqual(sentInput.MetricData, [
        {
            MetricName: 'ResponseTime',
            Dimensions: [
                {
                    Name: 'Environment',
                    Value: 'test',
                },
                {
                    Name: 'Service',
                    Value: 'SimpleAWSNodejsApp',
                },
            ],
            Unit: 'Milliseconds',
            Value: 123,
        },
    ]);
}

async function testMetricFailureIsNonFatal() {
    let logged = false;
    const recorder = createMetricRecorder({
        client: {
            send: async() => {
                throw new Error('simulated CloudWatch failure');
            },
        },
        logger: {
            error: () => {
                logged = true;
            },
        },
    });

    recorder.recordMetric('ErrorCount', 1);
    await tick();

    assert.equal(logged, true);
}

async function main() {
    await testMetricPayload();
    await testMetricFailureIsNonFatal();
    console.log('Metrics tests passed.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
