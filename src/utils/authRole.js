export function isAdminEmail(email) {
  return email?.toLowerCase().includes('admin') || false;
}

export function isAdminUser(user) {
  if (!user) return false;
  return user.role === 'admin';
}

export function dashboardPathFor(user) {
  return isAdminUser(user) ? '/admin' : '/dashboard';
}
