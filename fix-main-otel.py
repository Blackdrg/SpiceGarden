filepath = "D:/SpiceGarden/apps/backend/src/main.ts"
with open(filepath, "r") as f:
    content = f.read()

old = """  if (configService.get<boolean>("OTEL_ENABLED", false)) {
    otelSDK.start();
    logger.log("OpenTelemetry SDK started");
  }"""

new = """  if (process.env.OTEL_ENABLED === "true") {
    otelSDK.start();
    logger.log("OpenTelemetry SDK started");
  }"""

if old in content:
    content = content.replace(old, new)
    with open(filepath, "w") as f:
        f.write(content)
    print("Fixed OTEL integration in main.ts")
else:
    print("Pattern not found in main.ts - checking current content...")
    # Show the relevant section
    lines = content.split("\n")
    for i, line in enumerate(lines):
        if "OTEL_ENABLED" in line or "otelSDK" in line:
            print(f"Line {i+1}: {line}")