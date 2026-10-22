// Global test setup — runs once before the test suite.
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

// src/config/env.ts hard-requires these; CI provides real values, and locally
// they are picked up from .env. Supplying fallbacks keeps `npm run test`
// working on a fresh clone with no .env file.
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'mysql://examprep:examprep@127.0.0.1:3306/examprep_test';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-32characters-long-ok';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-32characters-long-ok';
