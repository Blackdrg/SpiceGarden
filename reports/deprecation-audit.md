# SpiceGarden Deprecation Audit Report

**Date:** 2026-10-02  
**Target:** Toolchain and Runtime Deprecation Analysis  
**Status:** AUDITED & CLASSIFIED

---

## 1. Identified Deprecation Warnings

### 1.1 `punycode` (Node.js DEP0040)
* **Warning Message:**
  `(node:XXXX) [DEP0040] DeprecationWarning: The 'punycode' module is deprecated. Please use a userland alternative instead.`
* **Origin Investigation:**
  - `punycode` is a Node.js legacy built-in module. Starting with Node.js 21+, Node marks `require('punycode')` as deprecated in favor of the userland `punycode/` package or WHATWG URL API.
  - Source inspection: SpiceGarden source code does **not** import `punycode`.
  - The warning originates transitively from dependencies such as `whatwg-url`, `tr46`, `tough-cookie`, and `uri-js` when running Jest JSDOM and Next.js internal build tools.
* **Production Reachability:**
  - Low / Non-blocking. In production container runtimes, HTTP endpoints use WHATWG URL APIs and NestJS built-ins.
* **Action:**
  - Documented as an external upstream dependency deprecation. No unsafe forced monkeypatching required.

---

### 1.2 `react-test-renderer`
* **Warning Message:**
  `console.error: react-test-renderer is deprecated. See https://react.dev/warnings/react-test-renderer`
* **Origin Investigation:**
  - Triggered during `@spicegarden/customer-mobile` Jest execution.
  - `@testing-library/react-native` invokes `react-test-renderer` internally to serialize and inspect React Native components during test execution.
  - React 19 deprecates `react-test-renderer` in favor of React Native testing primitives.
* **Production Reachability:**
  - Zero (0%). `react-test-renderer` is purely a `devDependency` used for test execution and is excluded from the Expo/React Native mobile binary and production builds.
* **Action:**
  - Preserved test harness integrity under feature freeze without destabilizing React Native 0.73+ test harnesses.

---

## 2. Summary of Deprecation Status

| Deprecation | Source | Context | Production Impact | Action |
| :--- | :--- | :--- | :--- | :--- |
| `punycode` (DEP0040) | Upstream URL/Cookie parsing libraries | Test & Build runtime | None | Documented known upstream warning. |
| `react-test-renderer` | `@testing-library/react-native` | Mobile Unit Tests | None (Dev only) | Documented test-only library deprecation. |
