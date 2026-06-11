const logger = console.log;

async function compileProtos() {
  const path = require("path");
  const { readdir, stat, mkdir } = require("fs/promises");
  const { existsSync } = require("fs");

  const grpc = require("@grpc/grpc-js");
  const protoLoader = require("@grpc/proto-loader");

  const projectRoot = path.resolve(__dirname, "../..");
  const protoDir = path.resolve(projectRoot, "apps/backend/src/proto");
  const outDir = path.resolve(projectRoot, "apps/backend/src/generated-grpc");

  if (!existsSync(protoDir)) {
    throw new Error(`Proto directory not found: ${protoDir}`);
  }

  await mkdir(outDir, { recursive: true });

  const serviceDirs = await readdir(protoDir);
  let compiled = 0;

  for (const serviceDir of serviceDirs) {
    const servicePath = path.join(protoDir, serviceDir);
    const serviceStat = await stat(servicePath);
    if (!serviceStat.isDirectory()) continue;

    const protoFiles = await readdir(servicePath);
    for (const protoFile of protoFiles) {
      if (!protoFile.endsWith(".proto")) continue;

      const protoPath = path.join(servicePath, protoFile);
      const serviceOutDir = path.join(outDir, serviceDir);
      await mkdir(serviceOutDir, { recursive: true });

      logger(`Compiling: ${path.relative(projectRoot, protoPath)}`);

      const packageDef = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [protoDir],
      });

      const pkgObj = grpc.loadPackageDefinition(packageDef);

      const writeFile = (name, content) => {
        const filePath = path.join(serviceOutDir, name);
        const fd = require("fs").openSync(filePath, "w");
        require("fs").writeSync(fd, content);
        require("fs").closeSync(fd);
      };

      const writeDescriptor = (protoName, implName, descriptor) => {
        if (!descriptor) return;
        const typeMap = new Map();
        const queue = [descriptor];
        while (queue.length > 0) {
          const current = queue.shift();
          if (!current) continue;
          if (current.$type === "google.protobuf.DescriptorProto" && current.name && current.fields) {
            typeMap.set(current.name, {
              fields: current.fields.map((f) => ({
                name: f.name,
                type: f.type,
                label: f.label,
              })),
            });
          }
          for (const key of Object.keys(current)) {
            const child = current[key];
            if (child && typeof child === "object") {
              if (Array.isArray(child)) queue.push(...child);
              else queue.push(child);
            }
          }
        }
        const lines = [
          `// Auto-generated from ${protoName}`,
          `// Package: ${implName}`,
          "",
          `export const ${implName}Descriptor = ${JSON.stringify(typeMap, null, 2)};`,
        ];
        writeFile(`${implName}.d.ts`, lines.join("\n"));
        writeFile(`${implName}.js`, [
          `const descriptor = ${JSON.stringify(typeMap, null, 2)};`,
          `module.exports = descriptor;`,
        ].join("\n"));
      };

      for (const [pkgPath, pkgDef] of Object.entries(pkgObj)) {
        if (typeof pkgDef !== "object" || !pkgDef) continue;
        const parts = pkgPath.split(".");
        if (parts.length !== 3) continue;
        const [rootPkg, domain, serviceName] = parts;

        const fileName = serviceName.replace(/\./g, "_");

        for (const key of Object.keys(pkgDef)) {
          const value = pkgDef[key];
          if (!value || typeof value !== "object") continue;
          if (value.$type === "google.protobuf.ServiceDescriptorProto") {
            const serviceDef = grpc.loadPackageDefinition(packageDef);
          }
        }

        const serviceContent = `// Auto-generated - ${pkgPath}
// Generated from: ${protoPath}

const packageDefinition = require('${protoPath.replace(/\\/g, '\\\\')}');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');

const packageDef = protoLoader.loadSync('${protoPath.replace(/\\/g, '\\\\')}', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const loadedPackage = grpc.loadPackageDefinition(packageDef);

module.exports = {
  packageDefinition,
  loadedPackage,
  serviceName: '${serviceName}',
};

`;
        writeFile(`${fileName}.js`, serviceContent);
        const dts = [
          `// Auto-generated - ${pkgPath}`,
          `export const serviceName: string;`,
          `export const packageDefinition: any;`,
          `export const loadedPackage: any;`,
        ].join("\n");
        writeFile(`${fileName}.d.ts`, dts);
      }

      compiled++;
    }
  }

  logger(`Proto compilation done: ${compiled} files compiled`);
}

compileProtos().catch((err) => {
  console.error("Proto compilation failed:", err);
  process.exit(1);
});
