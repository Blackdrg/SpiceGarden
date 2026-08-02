import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const otelEnabled = process.env.OTEL_ENABLED === "true";
const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://jaeger:4317";
const serviceName = process.env.OTEL_SERVICE_NAME || "spicegarden-backend";

let exporter;
const exporterType = process.env.OTEL_EXPORTER_TYPE || "jaeger";
if (exporterType === "jaeger") {
  exporter = new JaegerExporter({
    endpoint: process.env.OTEL_EXPORTER_JAEGER_ENDPOINT || "http://jaeger:14268/api/traces",
    username: process.env.OTEL_EXPORTER_JAEGER_USERNAME || "",
    password: process.env.OTEL_EXPORTER_JAEGER_PASSWORD || "",
  });
} else {
  exporter = new OTLPTraceExporter({
    url: otelEndpoint,
  });
}

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || "1.0.0",
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "production",
});

export const otelSDK = new NodeSDK({
  resource,
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

if (otelEnabled) {
  otelSDK.start();
}