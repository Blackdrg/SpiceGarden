# Contributing to SpiceGarden

Thank you for your interest in contributing to SpiceGarden! This document outlines the contribution process and legal requirements.

## Contributor Agreement

By contributing to SpiceGarden, you agree to the following terms:

### 1. Grant of Rights
- You grant SpiceGarden a perpetual, worldwide, non-exclusive, royalty-free license to use, modify, and distribute your contributions
- You represent that you have the right to grant this license
- Your contributions will be licensed under the MIT License

### 2. Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Follow the project's coding standards
- Maintain security best practices

### 3. Contribution Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:unit`
5. Submit a pull request

### 4. Legal Requirements
- All contributions must be your original work
- Third-party code must be properly attributed and licensed
- Do not contribute code you do not have permission to license
- By submitting a pull request, you certify compliance with these terms

### 5. Copyright Notice
All contributions are subject to the project's MIT License. Please include the following header in new files:

```
// Copyright (c) 2026 SpiceGarden
// Licensed under the MIT License
```

## Development Setup

```bash
npm install
npm run dev -w @spicegarden/customer-web
cd apps/backend && npm run dev
```

## Testing Requirements
- All new code must include unit tests
- Security-sensitive changes require additional security review
- Run `npm run lint` before submitting PRs