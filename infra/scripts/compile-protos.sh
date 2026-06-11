#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROTO_DIR="$PROJECT_ROOT/apps/backend/src/proto"
OUT_DIR="$PROJECT_ROOT/apps/backend/src/generated"
GRPC_JS_OUT_DIR="$PROJECT_ROOT/apps/backend/src/generated-grpc"
NODE_BIN="node"
PROTOC_GEN_TS_PATH="${PROTOC_GEN_TS_PATH:-$PROJECT_ROOT/node_modules/.bin/protoc-gen-ts}"
PROTOC_GEN_GRPC_PATH="${PROTOC_GEN_GRPC_PATH:-$PROJECT_ROOT/node_modules/.bin/protoc-gen-grpc}"

echo "Compiling protobuf files..."
echo "Proto dir: $PROTO_DIR"
echo "Output dir: $OUT_DIR"

# Create output directories
mkdir -p "$OUT_DIR"
mkdir -p "$GRPC_JS_OUT_DIR"

# Find all proto files and compile them
find "$PROTO_DIR" -name "*.proto" -print0 | while IFS= read -r -d '' proto_file; do
  rel_path="${proto_file#$PROTO_DIR/}"
  service_dir=$(dirname "$rel_path")
  service_name=$(basename "$service_dir" .proto)

  mkdir -p "$OUT_DIR/$service_dir"
  mkdir -p "$GRPC_JS_OUT_DIR/$service_dir"

  echo "Compiling: $rel_path"

  protoc \
    --plugin=protoc-gen-ts="$PROTOC_GEN_TS_PATH" \
    --plugin=protoc-gen-grpc="$PROTOC_GEN_GRPC_PATH" \
    --ts_out="$OUT_DIR" \
    --grpc_out="$GRPC_JS_OUT_DIR" \
    --proto_path="$PROTO_DIR" \
    "$rel_path"
done

echo "Proto compilation complete."
echo "Generated TypeScript types: $OUT_DIR"
echo "Generated gRPC stubs: $GRPC_JS_OUT_DIR"

if command -v tsc &> /dev/null; then
  echo "Running type check on generated files..."
  npx tsc --noEmit "$OUT_DIR" --skipLibCheck
fi
