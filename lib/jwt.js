import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const JWT_EXPIRY = '7d'; // 7 days

export async function signToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw new Error('Failed to generate token');
  }
}

export async function verifyToken(token) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return null;
  }
}

export async function generateAuthToken(user) {
  if (!user || !user.id) {
    throw new Error('Invalid user object for token generation');
  }

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'viewer'
  };

  return await signToken(payload);
}