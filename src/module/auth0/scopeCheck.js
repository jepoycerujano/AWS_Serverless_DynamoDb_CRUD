function scopeCheck(accessScope = '', requiredScopes = '') {
  if (!requiredScopes) {
    return { status: 400, message: 'ERROR: No expected scopes specified.' };
  }

  if (!accessScope) {
    return { status: 400, message: 'ERROR: No access scopes provided.' };
  }

  const newScope = accessScope.split('|');
  if (!newScope.includes(requiredScopes)) {
    return { status: 400, message: 'ERROR: Scope check failed.' };
  }

  return { status: 200, message: 'SUCCESS: Scope check passed.' };
}

module.exports = scopeCheck;
