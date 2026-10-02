# MASTER SOFTWARE LICENCE AGREEMENT

**Document Name:** Master Software Licence Agreement  
**Version:** `1.0.0`  
**Date:** 2026-09-30  
**Document Classification:** `READY FOR LEGAL REVIEW / DRAFT CONTRACT`  
**Licensor:** Daksh Mehta / SpiceGarden Technologies  
**Baseline Release:** `v1.0.0-rc1` (Git Commit `ca349e510d3c18a7517da7502f70ef15bd37fe77`)  
**Confidentiality:** `CONFIDENTIAL`  

> [!WARNING]
> **LEGAL NOTICE & DISCLAIMER**: This Master Software Licence Agreement is a commercial template prepared for negotiation and customization. It does not constitute formal legal advice. Both Licensor and Licensee must have their qualified legal counsel review, revise, and approve all provisions under the Indian Contract Act, 1872, the Copyright Act, 1957, the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and applicable local laws before execution.

---

This **MASTER SOFTWARE LICENCE AGREEMENT** ("Agreement") is entered into on this _____ day of _______________, 202___ ("Effective Date"), by and between:

**1. LICENSOR:**  
**DAKSH MEHTA / SPICEGARDEN TECHNOLOGIES**, having its principal address at [LICENSOR ADDRESS, CITY, STATE, PIN CODE, INDIA] (hereinafter referred to as the **"Licensor"**, which expression shall, unless repugnant to the context or meaning thereof, be deemed to include its successors, legal heirs, and permitted assigns) of the **FIRST PART**;

**AND**

**2. LICENSEE:**  
**[LICENSEE COMPANY NAME]**, a company incorporated under the laws of [JURISDICTION], having its registered office at [LICENSEE REGISTERED ADDRESS] (hereinafter referred to as the **"Licensee"**, which expression shall, unless repugnant to the context or meaning thereof, be deemed to include its successors and permitted assigns) of the **SECOND PART**.

(Licensor and Licensee are hereinafter collectively referred to as the **"Parties"** and individually as a **"Party"**.)

---

### PREAMBLE

**WHEREAS**, Licensor is the sole owner and proprietary author of the enterprise food-delivery and logistics software platform known as **"SpiceGarden"**;

**WHEREAS**, Licensee desires to obtain a non-exclusive commercial licence to deploy, operate, and utilize the Licensed Software for its internal business operations in accordance with the terms, conditions, and licence tier selected in the Order Form;

**WHEREAS**, Licensor is willing to grant such licence subject to the strict covenants, restrictions, intellectual property protections, and payment terms set forth herein;

**NOW, THEREFORE**, in consideration of the mutual promises, covenants, and valuable consideration contained herein, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:

---

## CLAUSE 1: DEFINITIONS

1.1. **"Affiliate"** means any entity that directly or indirectly controls, is controlled by, or is under common control with a Party, where "control" means ownership of more than 50% of voting securities.  
1.2. **"Agreement"** means this Master Software Licence Agreement together with all Schedules, Exhibits, and Order Forms attached hereto.  
1.3. **"Applicable Law"** means all applicable statutes, laws, ordinances, regulations, rules, and orders of any governmental authority in India or the designated Territory.  
1.4. **"Authorized Users"** means employees and approved independent contractors of Licensee authorized to access and operate the Licensed Software.  
1.5. **"Confidential Information"** means all non-public information disclosed by one Party to the other, including source code, algorithms, architectures, pricing, business plans, and customer data.  
1.6. **"Documentation"** means the technical manuals, API references, architecture specifications, deployment guides, and user manuals provided by Licensor.  
1.7. **"Intellectual Property Rights"** or **"IPR"** means all copyrights, patents, trade secrets, trademarks, design rights, database rights, know-how, and all other proprietary rights globally.  
1.8. **"Licensed Software"** means the computer programs comprising the SpiceGarden platform, specifically identified in Clause 2 and Clause 3.  
1.9. **"Open-Source Components"** means third-party software libraries subject to open-source licenses as set forth in Schedule B (Software Bill of Materials).  
1.10. **"Order Form"** means the ordering schedule executed by the Parties specifying the commercial tier, fees, Territory, and implementation parameters.  
1.11. **"Territory"** means the geographic jurisdiction(s) specified in the applicable Order Form.  

---

## CLAUSE 2: LICENSED SOFTWARE

2.1. The Licensed Software consists of the 12 workspaces of the SpiceGarden monorepo, comprising:  
(a) Backend API service (NestJS), Socket.IO gateway, and BullMQ worker queue;  
(b) Customer Web application (Next.js);  
(c) Customer Mobile application (React Native / Expo);  
(d) Restaurant KDS and merchant dashboard (Next.js);  
(e) Delivery Partner mobile application (React Native / Expo);  
(f) Super Admin platform governance application (Next.js);  
(g) Desktop Operator Launcher (Electron);  
(h) Shared packages (`shared-types`, `ui`, `database`, `config`, `utils`).

---

## CLAUSE 3: VERSION AND RELEASE IDENTIFICATION

3.1. The authoritative release baseline licensed hereunder is:  
* **Release Version:** `SpiceGarden v1.0.0-rc1`  
* **Git Baseline Commit Hash:** `ca349e510d3c18a7517da7502f70ef15bd37fe77`  
* **Target Runtime:** `Node.js 22 LTS`  
* **Integrity Ledger:** As certified in `ARTIFACT_HASHES.sha256`.

---

## CLAUSE 4: LICENCE GRANT

4.1. **Strict Grant of Licence:** Subject to full and timely payment of the Licence Fees and strict compliance with this Agreement, Licensor grants to Licensee a **non-exclusive, non-transferable, non-sublicensable, revocable (solely upon material breach)** commercial licence during the Term to install, deploy, and execute the Licensed Software solely within the Territory for Licensee's internal business operations.  
4.2. **CRITICAL DISTINCTION — LICENCE NOT SALE / NOT ASSIGNMENT:** This Agreement is a contract for a **LICENCE OF SOFTWARE** and NOT an assignment, conveyance, or sale of copyright. Licensor retains 100% of all right, title, ownership, and copyright in and to the Licensed Software. No title or property right in the software is transferred to Licensee.

---

## CLAUSE 5: TERRITORY

5.1. The licence is restricted strictly to the Territory specified in the Order Form (e.g., India, or specific geographic regions). Operation of the platform targeting consumer or merchant markets outside the designated Territory is strictly prohibited without a written amendment and supplemental territory fee.

---

## CLAUSE 6: TERM

6.1. The initial term of this Agreement shall be specified in the Order Form (the **"Initial Term"**, typically 12 to 36 months from the Effective Date).  
6.2. The Agreement shall automatically renew for successive 12-month periods (each a **"Renewal Term"**) unless either Party provides written notice of non-renewal at least 90 days prior to the expiration of the then-current term.

---

## CLAUSE 7: PERMITTED USERS

7.1. Licensee may permit access only to its Authorized Users (employees and approved contractors) who are bound by confidentiality obligations at least as restrictive as this Agreement.  
7.2. Licensee is responsible for all actions taken through its user credentials.

---

## CLAUSE 8: PERMITTED DEPLOYMENTS

8.1. Licensee is authorized to run the Licensed Software within the deployment environments specified in the Order Form (e.g., 1 Production Kubernetes cluster, 1 Staging environment, 1 Disaster Recovery environment). Deployment to additional production clusters requires an Additional Deployment Add-on.

---

## CLAUSE 9: HOSTING RIGHTS

9.1. Licensee may host the Licensed Software on its own dedicated private cloud infrastructure (AWS, GCP, Azure, or private data center) within the Territory, provided that network security, encryption at rest and in transit, and access control standards comply with Clause 23.

---

## CLAUSE 10: INTERNAL-USE RIGHTS

10.1. The Licensed Software is licensed solely for Licensee's direct food-delivery and logistics business operations. Licensee shall not operate the software as a multi-tenant bureau or white-label SaaS platform for third-party operators unless explicitly licensed under a Strategic Tier Order Form.

---

## CLAUSE 11: MODIFICATION RIGHTS

11.1. Unless specifically granted under a Source-Code Licence Tier in the Order Form, Licensee shall not modify, adapt, translate, or create derivative works of the Licensed Software.  
11.2. If source modification rights are granted in the Order Form, all modifications and derivative works shall remain subject to Licensor's underlying copyright, and Licensee shall not distribute such modifications outside its internal organization.

---

## CLAUSE 12: INTEGRATION RIGHTS

12.1. Licensee may build integrations with third-party software (such as ERP, CRM, and accounting systems) solely via the documented public REST APIs and WebSocket events provided in the Licensed Software.

---

## CLAUSE 13: BACKUP AND DISASTER RECOVERY RIGHTS

13.1. Licensee may make a reasonable number of machine-readable copies of the Licensed Software solely for non-operational archival, backup, and disaster-recovery purposes. Backup copies must replicate all copyright notices and proprietary legends.

---

## CLAUSE 14: CONTRACTOR ACCESS

14.1. Third-party contractors of Licensee may access the Licensed Software solely to provide technical support, infrastructure maintenance, or integration services to Licensee, provided such contractors execute a written confidentiality agreement prior to access. Direct competitors of Licensor shall not be granted access.

---

## CLAUSE 15: SUBLICENSING RESTRICTIONS

15.1. Licensee shall NOT sublicense, lease, rent, loan, distribute, or time-share the Licensed Software or any portion thereof to any third party.

---

## CLAUSE 16: RESALE RESTRICTIONS

16.1. Licensee shall NOT resell, assign, commercially redistribute, or transfer the Licensed Software, whether stand-alone or bundled with hardware or other software.

---

## CLAUSE 17: WHITE-LABEL RESTRICTIONS

17.1. Licensee shall NOT remove, alter, or obscure any copyright notices, proprietary legends, or trademark attributions embedded in the code or documentation. White-labeling rights are permitted ONLY if expressly purchased under Tier B/C in the Order Form.

---

## CLAUSE 18: SOURCE-CODE ACCESS

18.1. Under standard licence tiers, Licensed Software is delivered in pre-compiled binary and containerized formats. Source-code access is governed strictly by the Source-Code Access Policy (Schedule C) and applies only when explicitly purchased under Tier B/C.

---

## CLAUSE 19: SOURCE-CODE ESCROW

19.1. If specified in the Order Form, Licensor shall deposit a frozen copy of the source code with an independent escrow agent under a tripartite escrow agreement. Release of escrow material shall occur solely upon verified, uncured Release Triggers (such as formal bankruptcy or complete support abandonment) pursuant to Schedule C.

---

## CLAUSE 20: SUPPORT SERVICES

20.1. Licensor shall provide technical support services in accordance with the Support & SLA Schedule (Schedule D), covering incident triage, bug remediation, and severity-level commitments (P1 through P4).

---

## CLAUSE 21: MAINTENANCE SERVICES

21.1. Maintenance services include corrective bug fixes and compatibility patches for the baseline release during the active Support Term.

---

## CLAUSE 22: UPDATES AND UPGRADES

22.1. "Updates" (minor maintenance releases, e.g., v1.0.1) are included in active Support. "Upgrades" (major architectural overhauls or new major version releases, e.g., v2.0.0) may be subject to additional commercial upgrade fees unless specified otherwise in the Order Form.

---

## CLAUSE 23: SECURITY OBLIGATIONS

23.1. Both Parties shall maintain industry-standard security practices, including TLS 1.3 encryption in transit, AES-256 encryption at rest, prompt application of security patches, and periodic penetration testing. Licensee shall notify Licensor within 48 hours of any suspected security vulnerability discovered in the Licensed Software.

---

## CLAUSE 24: DATA OWNERSHIP

24.1. **Licensee Owns Customer Data:** Licensee retains 100% full and exclusive ownership of all end-customer personal data, restaurant transactional data, order records, and business financial data processed through the platform. Licensor asserts zero ownership claim over Licensee's customer data.

---

## CLAUSE 25: DATA PROCESSING AND PRIVACY

25.1. The Parties shall comply with the Data Processing and Privacy Schedule (Schedule E), the Digital Personal Data Protection Act, 2023 (DPDPA), the Information Technology Act, 2000, and applicable data protection regulations. Licensee acts as Data Fiduciary / Controller and Licensor (where applicable) acts solely as Data Processor.

---

## CLAUSE 26: CONFIDENTIALITY

26.1. Each Party agrees to protect the Confidential Information of the other Party with the same degree of care it uses for its own confidential information (and no less than reasonable care). Confidential Information shall not be disclosed to third parties without prior written consent, except to authorized employees, advisors, and legal counsel on a need-to-know basis under binding confidentiality obligations. Obligations survive for 5 years post-termination (and perpetually for source code and trade secrets).

---

## CLAUSE 27: INTELLECTUAL PROPERTY OWNERSHIP

27.1. Licensor is and remains the sole and exclusive owner of all Intellectual Property Rights in and to the Licensed Software, Documentation, algorithms, schemas, workflows, and all modifications or enhancements created by Licensor. Licensee receives only the limited licence rights expressly granted in Clause 4.

---

## CLAUSE 28: OPEN-SOURCE COMPONENTS

28.1. The Licensed Software incorporates certain third-party Open-Source Components identified in Schedule B. All such components are licensed under permissive licenses (MIT, Apache-2.0, BSD, ISC) and are provided pursuant to their respective license terms. Licensor warrants that no copyleft (GPL/AGPL) components exist in the production software baseline.

---

## CLAUSE 29: WARRANTIES

29.1. **Performance Warranty:** Licensor warrants that for a period of 90 days from the Effective Date (the "Warranty Period"), the Licensed Software will operate in material conformity with the Documentation when operated on the designated runtime environment (Node.js 22 LTS, PostgreSQL 16, Redis 7.2).  
29.2. **Title Warranty:** Licensor warrants that it has the full right, power, and authority to grant the licence, and that to Licensor's knowledge, the Licensed Software does not infringe any third-party Indian copyright or trade secret.

---

## CLAUSE 30: DISCLAIMER OF WARRANTIES

30.1. EXCEPT FOR THE EXPRESS WARRANTIES IN CLAUSE 29, THE LICENSED SOFTWARE IS PROVIDED "AS IS" AND "AS AVAILABLE." LICENSOR DISCLAIMS ALL OTHER WARRANTIES, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND UNINTERRUPTED OR ERROR-FREE OPERATION.

---

## CLAUSE 31: INDEMNITY

31.1. **Licensor IP Indemnity:** Licensor shall defend and indemnify Licensee against direct damages awarded by a court of competent jurisdiction resulting from a third-party claim that the Licensed Software infringes a valid copyright in the Territory, provided Licensee gives prompt written notice, sole control of defense to Licensor, and full cooperation.  
31.2. **Exclusions:** Licensor has no obligation for claims arising from modifications made by Licensee, combination with unauthorized third-party software, or use outside the permitted Territory.  
31.3. **Licensee Indemnity:** Licensee shall indemnify Licensor against claims arising from Licensee's data, unauthorized modifications, breach of Applicable Law, or breach of Clause 15, 16, or 17.

---

## CLAUSE 32: LIMITATION OF LIABILITY

32.1. **Consequential Damages Waiver:** NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS INTERRUPTION.  
32.2. **Aggregate Liability Cap:** EXCEPT FOR BREACHES OF CONFIDENTIALITY (CLAUSE 26), INTELLECTUAL PROPERTY INFRINGEMENT, OR GROSS NEGLIGENCE / WILLFUL MISCONDUCT, EACH PARTY'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL BE STRICTLY CAPPED AT THE TOTAL LICENCE FEES ACTUALLY PAID BY LICENSEE TO LICENSOR IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

---

## CLAUSE 33: AUDIT RIGHTS

33.1. Licensor or its independent certified auditor may, upon 15 business days' advance written notice and during normal business hours, audit Licensee's deployment and usage records to verify compliance with the permitted users, environments, and Territory. If an audit reveals an underpayment of fees exceeding 5%, Licensee shall pay the underpaid fees plus the reasonable cost of the audit.

---

## CLAUSE 34: COMPLIANCE WITH LAWS

34.1. Each Party shall comply with all Applicable Laws in connection with its performance under this Agreement, including anti-corruption, export controls, and data privacy regulations.

---

## CLAUSE 35: TERMINATION

35.1. **For Cause:** Either Party may terminate this Agreement immediately upon written notice if:  
(a) The other Party commits a material breach and fails to cure such breach within 30 days of receiving written notice; or  
(b) The other Party enters into bankruptcy, insolvency, liquidation, or administration.  
35.2. **For Non-Payment:** Licensor may terminate immediately if Licensee fails to pay undisputed fees within 15 days of receiving overdue notice.

---

## CLAUSE 36: POST-TERMINATION RIGHTS AND OBLIGATIONS

36.1. Upon termination or expiration of this Agreement:  
(a) All licence rights granted to Licensee immediately cease;  
(b) Licensee shall immediately discontinue all use of the Licensed Software;  
(c) Licensee shall delete, uninstall, and destroy all copies of the Licensed Software and Documentation, certifying such destruction in writing within 14 days;  
(d) All outstanding fees become immediately due and payable.

---

## CLAUSE 37: EXIT ASSISTANCE

37.1. For a period of 30 days following termination (except termination for Licensee's material breach), Licensor shall provide reasonable data extraction assistance at Licensor's then-current professional services time-and-materials rates.

---

## CLAUSE 38: TRANSITION SUPPORT

38.1. Any transition support requested by Licensee beyond standard exit assistance shall be scoped and agreed upon under a separate professional services statement of work.

---

## CLAUSE 39: GOVERNING LAW

39.1. This Agreement shall be governed by, construed, and enforced in accordance with the substantive laws of the **Republic of India**, without regard to its conflict of law principles. *(Requires review by Indian legal counsel).*

---

## CLAUSE 40: DISPUTE RESOLUTION AND ARBITRATION

40.1. **Amicable Negotiation:** Any dispute arising out of or in connection with this Agreement shall first be submitted to senior executives of both Parties for resolution within 30 days.  
40.2. **Arbitration:** If unresolved, the dispute shall be referred to and finally resolved by arbitration administered under the **Arbitration and Conciliation Act, 1996** (India). The arbitral tribunal shall consist of a sole arbitrator mutually appointed by the Parties. The seat and venue of arbitration shall be [CITY, INDIA]. The language of arbitration shall be English. The arbitral award shall be final and binding.  
40.3. **Jurisdiction:** Courts in [CITY, INDIA] shall have exclusive jurisdiction over interim relief and enforcement of awards.

---

## CLAUSE 41: NOTICES

41.1. All notices under this Agreement shall be in writing and delivered by registered post with acknowledgment due, courier, or confirmed email to the addresses specified in the preamble or Order Form.

---

## CLAUSE 42: ASSIGNMENT

42.1. Licensee shall not assign, delegate, or transfer this Agreement or any rights hereunder without the prior written consent of Licensor. Licensor may assign this Agreement in connection with a merger, reorganization, or sale of all or substantially all of its assets.

---

## CLAUSE 43: FORCE MAJEURE

43.1. Neither Party shall be liable for delay or failure to perform resulting from causes beyond its reasonable control, including acts of God, war, terrorism, pandemic, power grid failure, or severe telecommunication outages, provided prompt written notice is given.

---

## CLAUSE 44: ENTIRE AGREEMENT

44.1. This Agreement, together with all Order Forms and Schedules, constitutes the entire agreement between the Parties regarding the subject matter hereof and supersedes all prior proposals, understandings, negotiations, and representations, whether written or oral.

---

## CLAUSE 45: AMENDMENT

45.1. No modification, amendment, or waiver of any provision of this Agreement shall be effective unless in writing and signed by authorized signatories of both Parties.

---

## CLAUSE 46: SEVERABILITY

46.1. If any provision of this Agreement is held to be invalid, illegal, or unenforceable by an arbitral tribunal or court of competent jurisdiction, such provision shall be severed or modified to the minimum extent necessary, and the validity and enforceability of the remaining provisions shall not be affected.

---

### IN WITNESS WHEREOF, the Parties hereto have caused this Master Software Licence Agreement to be executed by their duly authorized representatives as of the Effective Date.

**FOR AND ON BEHALF OF LICENSOR:**  
**DAKSH MEHTA / SPICEGARDEN TECHNOLOGIES**

Signature: ____________________________________  
Name: Daksh Mehta  
Title: Founder & Platform Owner  
Date: _________________________________________  

**FOR AND ON BEHALF OF LICENSEE:**  
**[LICENSEE COMPANY NAME]**

Signature: ____________________________________  
Name: ________________________________________  
Title: _________________________________________  
Date: _________________________________________  

---

### SCHEDULE LIST
* **Schedule A:** Commercial Order Form & Licence Tier
* **Schedule B:** Software Bill of Materials & Open-Source Schedule
* **Schedule C:** Source-Code Access and Escrow Policy
* **Schedule D:** Support and SLA Schedule
* **Schedule E:** Data Processing and Privacy Schedule
* **Schedule F:** Acceptance Criteria and Testing Protocol
