import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PasswordStrengthProps {
  password: string;
}

/**
 * Password strength indicator component
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation('auth');

  const requirements = [
    { label: t('passwordStrength.minLength'), test: (p: string) => p.length >= 8 },
    { label: t('passwordStrength.hasUppercase'), test: (p: string) => /[A-Z]/.test(p) },
    { label: t('passwordStrength.hasLowercase'), test: (p: string) => /[a-z]/.test(p) },
    { label: t('passwordStrength.hasNumber'), test: (p: string) => /[0-9]/.test(p) },
  ];

  const passedRequirements = requirements.filter((req) => req.test(password));
  const strength = passedRequirements.length;

  // Don't show if password is empty
  if (!password) return null;

  const strengthColors = {
    0: 'bg-red-500',
    1: 'bg-red-500',
    2: 'bg-yellow-500',
    3: 'bg-yellow-500',
    4: 'bg-green-500',
  };

  const strengthLabels: Record<number, string> = {
    0: t('passwordStrength.veryWeak'),
    1: t('passwordStrength.weak'),
    2: t('passwordStrength.fair'),
    3: t('passwordStrength.good'),
    4: t('passwordStrength.excellent'),
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              strength >= level ? strengthColors[strength as keyof typeof strengthColors] : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Strength label */}
      <p className="text-xs text-muted-foreground">
        {t('passwordStrength.label')}: <span className="font-medium">{strengthLabels[strength]}</span>
      </p>

      {/* Requirements list */}
      <ul className="space-y-1">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <li
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )}
            >
              {passed ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>{req.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
