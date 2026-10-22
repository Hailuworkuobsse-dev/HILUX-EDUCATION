import { randomBytes } from 'node:crypto';

const access = randomBytes(32).toString('hex');
const refresh = randomBytes(32).toString('hex');

console.log('');
console.log('# Copy these into your production .env');
console.log(`JWT_ACCESS_SECRET=${access}`);
console.log(`JWT_REFRESH_SECRET=${refresh}`);
console.log('');
