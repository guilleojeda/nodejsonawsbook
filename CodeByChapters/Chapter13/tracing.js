const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { AWSXRayIdGenerator } = require('@opentelemetry/id-generator-aws-xray');
const { AWSXRayPropagator } = require('@opentelemetry/propagator-aws-xray');

const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4317',
});

const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || 'SimpleAWSNodejsApp',
    traceExporter,
    idGenerator: new AWSXRayIdGenerator(),
    textMapPropagator: new AWSXRayPropagator(),
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
    sdk.shutdown()
        .catch((error) => console.error('Error shutting down OpenTelemetry', error))
        .finally(() => process.exit(0));
});
