const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export function validateUsername(username: string): string | null {
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }

  if (username.length > 20) {
    return 'Username must be at most 20 characters';
  }

  if (!USERNAME_REGEX.test(username)) {
    return 'Username can only contain letters, numbers, _ and -';
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (password.length > 72) {
    return 'Password must be at most 72 characters';
  }

  return null;
}

export function validateName(username: string): string | null {
  if (username.length < 1) {
    return 'Name must be at least 1 character';
  }
  if (username.length > 20) {
    return 'Name must be at most 20 characters';
  }

  return null;
}
