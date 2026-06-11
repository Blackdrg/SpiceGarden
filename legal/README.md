# Legal Documentation

This directory contains legal documents for SpiceGarden.

## Documents

| File | Description |
|------|-------------|
| `LEGAL_ip-ownership.md` | Intellectual property ownership documentation |
| `LEGAL_contributor-agreements.md` | Contributor license agreements (ICLA/CCCLA) |

## Compliance Checklist

- ✅ MIT License (`LICENSE` in root)
- ✅ Contributor Guidelines (`CONTRIBUTING.md`)
- ✅ Privacy Policy (frontend pages + API endpoint)
- ✅ Terms of Service (frontend pages + API endpoint)
- ✅ Trademark Search Documentation (`LEGAL_trademark-search.md`)
- ✅ Legal API Module (`apps/backend/src/legal/`)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /legal/privacy-policy` | Privacy policy content |
| `GET /legal/terms-of-service` | Terms of service content |
| `GET /legal/intellectual-property` | IP ownership details |
| `GET /compliance/soc2` | SOC2 readiness assessment |
| `GET /compliance/pci-dss` | PCI DSS compliance status |

## Verification

Run the legal compliance check:
```bash
node infra/scripts/legal-check.js
```