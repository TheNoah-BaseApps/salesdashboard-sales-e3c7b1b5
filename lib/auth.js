import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = await verifyToken(token);
    
    if (!payload) {
      return null;
    }
    
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role || 'viewer'
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

export async function requireAuth(request) {
  const user = await getAuthUser();
  
  if (!user) {
    return {
      authenticated: false,
      user: null,
      error: 'Authentication required'
    };
  }
  
  return {
    authenticated: true,
    user,
    error: null
  };
}

export async function requireRole(allowedRoles) {
  const user = await getAuthUser();
  
  if (!user) {
    return {
      authorized: false,
      user: null,
      error: 'Authentication required'
    };
  }
  
  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      user,
      error: 'Insufficient permissions'
    };
  }
  
  return {
    authorized: true,
    user,
    error: null
  };
}

export function hasRole(user, roles) {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
}

export function isAdmin(user) {
  return hasRole(user, ['admin']);
}

export function canEdit(user) {
  return hasRole(user, ['admin', 'manager']);
}

export function canView(user) {
  return hasRole(user, ['admin', 'manager', 'analyst', 'viewer']);
}