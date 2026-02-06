import { useState, useCallback, useEffect } from 'react';

interface ValidationRule {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

/**
 * Hook for form validation with multiple rule types
 */
export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validate = useCallback(
    (fieldName: string, value: any): string | null => {
      const rule = rules[fieldName];
      if (!rule) return null;

      // Required validation
      if (rule.required && (!value || value.toString().trim() === '')) {
        return 'Это поле обязательно';
      }

      // Skip other validations if field is empty and not required
      if (!value && !rule.required) {
        return null;
      }

      // Email validation
      if (rule.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Некорректный email адрес';
        }
      }

      // Min length validation
      if (rule.minLength && value.toString().length < rule.minLength) {
        return `Минимум ${rule.minLength} символов`;
      }

      // Max length validation
      if (rule.maxLength && value.toString().length > rule.maxLength) {
        return `Максимум ${rule.maxLength} символов`;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return 'Неверный формат';
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (typeof result === 'string') {
          return result;
        }
        if (result === false) {
          return 'Неверное значение';
        }
      }

      return null;
    },
    [rules]
  );

  const validateField = useCallback(
    (fieldName: string, value: any) => {
      const error = validate(fieldName, value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
      return error === null;
    },
    [validate]
  );

  const validateAll = useCallback(
    (values: { [key: string]: any }): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      Object.keys(rules).forEach((fieldName) => {
        const error = validate(fieldName, values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [rules, validate]
  );

  const touchField = useCallback((fieldName: string) => {
    setTouched((prev) => new Set(prev).add(fieldName));
  }, []);

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  return {
    errors,
    touched,
    validate,
    validateField,
    validateAll,
    touchField,
    resetValidation,
  };
}

/**
 * Check password strength
 * Returns: 0 (very weak) to 4 (strong)
 */
export function checkPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Hook for online/offline status detection
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
