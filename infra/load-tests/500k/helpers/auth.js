// infra/load-tests/500k/helpers/auth.js
import crypto from 'k6/crypto';
import encoding from 'k6/encoding';
import { CONFIG } from './config.js';

const JWT_SECRET = __ENV.JWT_SECRET || 'test_jwt_secret_for_development_only_32chars';

function base64UrlEncode(str) {
  return encoding.b64encode(str, 'rawurl');
}

/**
 * Generate a cryptographically signed JWT matching NestJS JwtStrategy
 */
export function generateJwtToken(payload) {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const encodedHeader = base64UrlEncode(header);

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = Object.assign({
    iat: now,
    exp: now + 86400 * 7, // 7 days
  }, payload);

  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const b64Sig = crypto.hmac('sha256', JWT_SECRET, signatureInput, 'base64');
  const signature = b64Sig.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${signatureInput}.${signature}`;
}

export function getCustomerAuthHeaders(vuId, iterId) {
  const userId = `usr_cust_${vuId || 1}_${(iterId || 0) % 10000}`;
  const token = generateJwtToken({
    sub: userId,
    email: `customer_${vuId || 1}@loadtest.spicegarden.com`,
    role: 'customer',
    status: 'active',
  });

  return {
    headers: Object.assign({}, CONFIG.headers, {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userId,
    }),
    userId: userId,
  };
}

export function getAdminAuthHeaders(vuId) {
  const adminId = `usr_admin_${vuId || 1}`;
  const token = generateJwtToken({
    sub: adminId,
    email: `admin_${vuId || 1}@admin.spicegarden.com`,
    role: 'super_admin',
    status: 'active',
  });

  return {
    headers: Object.assign({}, CONFIG.headers, {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': adminId,
    }),
    adminId: adminId,
  };
}

export function getKitchenAuthHeaders(vuId) {
  const staffId = `usr_kitchen_${vuId || 1}`;
  const token = generateJwtToken({
    sub: staffId,
    email: `kitchen_${vuId || 1}@kitchen.spicegarden.com`,
    role: 'super_admin',
    status: 'active',
  });

  return {
    headers: Object.assign({}, CONFIG.headers, {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': staffId,
    }),
    staffId: staffId,
  };
}

export function getDriverAuthHeaders(vuId) {
  const driverId = `usr_driver_${vuId || 1}`;
  const token = generateJwtToken({
    sub: driverId,
    email: `driver_${vuId || 1}@driver.spicegarden.com`,
    role: 'delivery_partner',
    status: 'active',
  });

  return {
    headers: Object.assign({}, CONFIG.headers, {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': driverId,
    }),
    driverId: driverId,
  };
}
