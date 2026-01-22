import { useState, useEffect, ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DevAccessGateProps {
  children: ReactNode;
  pageName: string;
}

const DEV_CODE = '888';
const STORAGE_KEY = 'dev_access_granted';

export function DevAccessGate({ children, pageName }: DevAccessGateProps) {
  const [code, setCode] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user already has access
    const accessGranted = sessionStorage.getItem(STORAGE_KEY);
    if (accessGranted === 'true') {
      setHasAccess(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (code === DEV_CODE) {
      setHasAccess(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setError('');
    } else {
      setError('Invalid access code');
      setCode('');
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Developer Access Required</h2>
            <p className="text-muted-foreground">
              The <span className="font-semibold">{pageName}</span> page is currently under development.
            </p>
            <p className="text-sm text-muted-foreground">
              Enter the developer access code to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter access code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-widest"
                maxLength={3}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Unlock Page
            </Button>
          </form>

          <div className="text-xs text-muted-foreground pt-4 border-t w-full">
            This page is restricted to developers and internal testers only.
          </div>
        </div>
      </Card>
    </div>
  );
}
