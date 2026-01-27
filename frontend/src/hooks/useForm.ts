'use client';

/**
 * useForm Hook
 * Form state management with validation
 * @module hooks/useForm
 * @version 1.0.0
 */

import { useState, useCallback, useMemo, ChangeEvent, FormEvent } from 'react';

type ValidationRule<T> = {
  validate: (value: T[keyof T], values: T) => boolean;
  message: string;
};

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

interface UseFormReturn<T> extends FormState<T> {
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  reset: (values?: T) => void;
  getFieldProps: (field: keyof T) => {
    name: string;
    value: T[keyof T];
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
}

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      (key) => values[key as keyof T] !== initialValues[key as keyof T]
    );
  }, [values, initialValues]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const validateField = useCallback(
    (field: keyof T): boolean => {
      const rules = validationRules[field];
      if (!rules) return true;

      for (const rule of rules) {
        if (!rule.validate(values[field], values)) {
          setErrors((prev) => ({ ...prev, [field]: rule.message }));
          return false;
        }
      }

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    },
    [values, validationRules]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isFormValid = true;

    for (const field of Object.keys(validationRules) as (keyof T)[]) {
      const rules = validationRules[field];
      if (!rules) continue;

      for (const rule of rules) {
        if (!rule.validate(values[field], values)) {
          newErrors[field] = rule.message;
          isFormValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isFormValid;
  }, [values, validationRules]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value;

      setValues((prev) => ({ ...prev, [name]: fieldValue }));

      if (validateOnChange) {
        validateField(name as keyof T);
      }
    },
    [validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        validateField(name as keyof T);
      }
    },
    [validateOnBlur, validateField]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched: Partial<Record<keyof T, boolean>> = {};
      for (const key of Object.keys(values) as (keyof T)[]) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      // Validate all fields
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit?.(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const reset = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      name: field as string,
      value: values[field],
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    [values, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    reset,
    getFieldProps,
  };
}

/**
 * Common validation rules
 */
export const validators = {
  required: (message = 'This field is required'): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length <= max;
    },
    message: message || `Must be at most ${max} characters`,
  }),

  email: (message = 'Invalid email address'): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return regex.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value !== 'number') return true;
      return value >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value !== 'number') return true;
      return value <= max;
    },
    message: message || `Must be at most ${max}`,
  }),

  stxAddress: (message = 'Invalid STX address'): ValidationRule<Record<string, unknown>> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      // Basic STX address validation (starts with SP or ST)
      return /^(SP|ST)[A-Z0-9]{38,40}$/i.test(value);
    },
    message,
  }),
};

export default useForm;
