import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'Минимум 8 символов', test: (p) => p.length >= 8 },
  { label: 'Содержит заглавную букву', test: (p) => /[A-Z]/.test(p) },
  { label: 'Содержит строчную букву', test: (p) => /[a-z]/.test(p) },
  { label: 'Содержит цифру', test: (p) => /[0-9]/.test(p) },
];

/**
 * Password strength indicator component
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
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

  const strengthLabels = {
    0: 'Очень слабый',
    1: 'Слабый',
    2: 'Средний',
    3: 'Хороший',
    4: 'Отличный',
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
        Сложность пароля: <span className="font-medium">{strengthLabels[strength as keyof typeof strengthLabels]}</span>
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
