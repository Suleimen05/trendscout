import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Получаем параметры из URL
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const platformParam = searchParams.get('platform') || 'account';

    if (success === 'true') {
      setStatus('success');
      setMessage(`Your ${platformParam} account has been connected successfully!`);

      // Редирект на страницу Connect Accounts через 2 секунды
      setTimeout(() => {
        navigate('/dashboard/connect-accounts');
      }, 2000);
    } else if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error) || 'Failed to connect account. Please try again.');
    } else {
      setStatus('error');
      setMessage('Invalid callback. Please try connecting again.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500" />
                <h2 className="text-xl font-semibold">Connecting your account...</h2>
                <p className="text-muted-foreground">Please wait while we complete the connection.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">
                  Successfully Connected!
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting you back...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">
                  Connection Failed
                </h2>
                <p className="text-muted-foreground">{message}</p>
                <Button
                  onClick={() => navigate('/dashboard/connect-accounts')}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OAuthCallback;
