import re

filepath = "D:/SpiceGarden/apps/backend/src/services/ai/ai.service.ts"
with open(filepath, "r") as f:
    content = f.read()

# Fix data.choices[0]?.message?.content?.trim() in chatbot
content = content.replace(
    "const data = await response.json();\n    return data.choices[0]?.message?.content?.trim()",
    "const data = (await response.json()) as { choices: Array<{ message?: { content?: string } }> };\n    return data.choices[0]?.message?.content?.trim()"
)

# Fix data.embedding in generateEmbedding
content = content.replace(
    "const data = await response.json();\n    return data.data[0]?.embedding || null;",
    "const data = (await response.json()) as { data: Array<{ embedding?: number[] }> };\n    return data.data[0]?.embedding || null;"
)

# Fix data.results in searchVectorDB
content = content.replace(
    "const data = await response.json();\n    return (data.results || []).map((r: any) => ({",
    "const data = (await response.json()) as { results?: Array<{ id: string; vector?: number[]; payload?: { content?: string; source?: string; metadata?: Record<string, any> } }> };\n    return (data.results || []).map((r: any) => ({"
)

with open(filepath, "w") as f:
    f.write(content)

print("Fixed data type errors in ai.service.ts")