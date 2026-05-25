# Testing Documentation — Global Smile

This document describes the testing architecture, configurations, and test commands for the Global Smile patient acquisition platform.

---

## 1. Testing Setup

Global Smile uses **Jest** coupled with **ts-jest** to compile and run TypeScript unit tests in a simulated browser environment.

- **Test Runner**: Jest
- **Environment**: `jest-environment-jsdom` (simulates browser window and document contexts)
- **TypeScript Preprocessor**: `ts-jest`
- **Coverage Tool**: Jest built-in code coverage generator.

---

## 2. Executing Tests

Install development dependencies and execute testing scripts:

### Installation
```bash
npm install
```

### Run Tests
```bash
npm run test
```

### Run Coverage Analysis
```bash
npm run test:coverage
```
An interactive HTML coverage report will be generated inside the `coverage/` folder.
