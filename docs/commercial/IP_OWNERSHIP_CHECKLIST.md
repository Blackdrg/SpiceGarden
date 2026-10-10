# SpiceGarden — Intellectual Property & Due-Diligence Checklist

## 1. Proprietary Asset Inventory
All custom application code, domain logic, data models, state machines, and user interface components have been created specifically for the SpiceGarden platform:
- Backend services, controllers, guards, and middleware (`apps/backend/src/`).
- Customer ordering, tracking, and account user interfaces (`apps/customer-web/src/`).
- Restaurant management and Kitchen Display System (`apps/restaurant-dashboard/src/`).
- Super Admin operations suite (`apps/super-admin/src/`).
- iOS/Android mobile applications (`apps/customer-mobile/src/`, `apps/delivery-partner/src/`).
- Shared component design system (`packages/ui/src/`).

## 2. IP Compliance Checklist

| Item | Status | Evidence Location |
|---|---|---|
| **Root License File** | ✅ COMPLETE | [`LICENSE`](file:///c:/Users/mehta/Desktop/SpiceGarden/LICENSE) (MIT) |
| **Contributor Guidelines** | ✅ COMPLETE | [`CONTRIBUTING.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/CONTRIBUTING.md) |
| **IP Ownership Statement** | ✅ COMPLETE | [`legal/LEGAL_ip-ownership.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/LEGAL_ip-ownership.md) |
| **Contributor Assignment Agreements** | ✅ COMPLETE | [`legal/LEGAL_contributor-agreements.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/legal/LEGAL_contributor-agreements.md) |
| **Trademark Search Notes** | ✅ COMPLETE | [`LEGAL_trademark-search.md`](file:///c:/Users/mehta/Desktop/SpiceGarden/LEGAL_trademark-search.md) |
| **Frontend Privacy Policy** | ✅ COMPLETE | `apps/customer-web/src/pages/legal/privacy.tsx` |
| **Frontend Terms of Service** | ✅ COMPLETE | `apps/customer-web/src/pages/legal/terms.tsx` |
| **Backend Legal API Endpoints** | ✅ COMPLETE | `apps/backend/src/legal/legal.controller.ts` |
| **Backend Legal Module** | ✅ COMPLETE | `apps/backend/src/legal/legal.module.ts` |

## 3. Legal Audit Script Verification
Running `node infra/scripts/legal-check.js` confirms:
- Total checks: 9
- Passed: 9 (100% Repository Legal-Checklist Completion)
- Failed: 0

## 4. Due-Diligence Statement
> Technical IP/dependency due-diligence checklist completed; legal ownership, chain of title, and commercial-use conclusions remain subject to appropriate legal review.
