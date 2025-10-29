import { verifyToken } from './jwt';

export function getAuthUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded;
}

export function requireAuth(request, allowedRoles = []) {
  const user = getAuthUser(request);
  
  if (!user) {
    return {
      error: Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: Response.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    };
  }

  return { user };
}
