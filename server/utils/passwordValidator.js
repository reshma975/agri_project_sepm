/**
 * Password Security Validator
 * Validates that passwords meet strong industry-standard security requirements:
 * - At least 8 characters long
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&* etc.)
 */
export const validatePasswordSecurity = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      message: 'Password is required',
      errors: ['Password is required']
    };
  }

  const errors = [];

  if (password.length < 8) {
    errors.push('Must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter (a-z)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number (0-9)');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push('Must contain at least one special character (!@#$%^&*...)');
  }

  if (errors.length > 0) {
    return {
      valid: false,
      message: `Password does not meet security requirements: ${errors.join(', ')}`,
      errors
    };
  }

  return {
    valid: true,
    message: 'Password is secure',
    errors: []
  };
};
