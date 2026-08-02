import json
import re

filepath = "D:/SpiceGarden/apps/backend/package.json"
with open(filepath, "r") as f:
    content = f.read()

lines = content.split("\n")
clean_lines = []
for line in lines:
    if "@opentelemetry" in line:
        continue
    if line.strip().startswith("\"") and "opentelemetry" in line.lower():
        continue
    if line.strip().startswith("@opentelemetry"):
        continue
    clean_lines.append(line)

while clean_lines and clean_lines[-1].strip() == "":
    clean_lines.pop()

content = "\n".join(clean_lines)

# Ensure it ends with proper JSON
if not content.rstrip().endswith("}"):
    last_brace = content.rfind("}")
    if last_brace > 0:
        content = content[:last_brace+1]

try:
    parsed = json.loads(content)
    print("package.json is valid JSON after cleanup")
    with open(filepath, "w") as f:
        json.dump(parsed, f, indent=2)
        f.write("\n")
    print("Fixed and saved package.json")
except json.JSONDecodeError as e:
    print(f"Still invalid: {e}")
    # Try harder: find last valid JSON object
    for i in range(len(content), 0, -1):
        try:
            json.loads(content[:i])
            with open(filepath, "w") as f:
                f.write(content[:i])
                f.write("\n")
            print(f"Fixed by trimming to position {i}")
            break
        except:
            continue