'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../../');
const OUTPUT = path.join(ROOT, 'sbom.json');

function getNpmDependencies() {
  try {
    const result = execSync('npm ls --json --depth=0', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    return JSON.parse(result).dependencies || {};
  } catch (e) {
    try {
      const result = execSync('npm ls --json --depth=0', {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      return JSON.parse(result).dependencies || {};
    } catch {
      if (e && e.stdout) {
        return JSON.parse(e.stdout).dependencies || {};
      }
      return {};
    }
  }
}

function getLicenseInfo(depName, depVersion) {
  try {
    const pkgPath = path.join(ROOT, 'node_modules', depName, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return { license: pkg.license || 'UNKNOWN', repository: pkg.repository || null };
    }
  } catch {
    return { license: 'UNKNOWN', repository: null };
  }
  return { license: 'UNKNOWN', repository: null };
}

function generateSBOM() {
  const timestamp = new Date().toISOString();
  const deps = getNpmDependencies();

  const components = Object.entries(deps).map(([name, info]) => {
    const version = typeof info === 'string' ? info : info.version || 'unknown';
    const licenseInfo = getLicenseInfo(name, version);
    return {
      type: 'library',
      name: name,
      version: version,
      licenses: licenseInfo.license,
      purl: `pkg:npm/${name}@${version}`,
      repository: licenseInfo.repository,
    };
  });

  const sbom = {
    bomFormat: 'CycloneDX',
    specVersion: '1.4',
    serialNumber: `urn:uuid:${require('crypto').randomUUID()}`,
    createdAt: timestamp,
    components: components,
    metadata: {
      timestamp,
      tools: {
        service: [
          { name: 'SpiceGarden SBOM Generator', vendor: 'SpiceGarden', version: '1.0.0' },
        ],
      },
      component: {
        type: 'application',
        name: 'spicegarden',
        version: require(path.join(ROOT, 'package.json')).version,
      },
    },
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(sbom, null, 2));
  console.log(`SBOM written to ${OUTPUT}`);
  console.log(`Total components: ${components.length}`);
  return sbom;
}

generateSBOM();
