import { useState } from 'react';
import { Trash2, Mail, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function DataDeletion() {
  const { t } = useTranslation('legal');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call - replace with actual API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate confirmation code
      const code = 'DEL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setConfirmationCode(code);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trash2 className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold">{t('dataDeletion.title')}</h1>
          <p className="text-muted-foreground">
            {t('dataDeletion.subtitle')}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                {t('dataDeletion.yourPrivacyRights')}
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('dataDeletion.privacyRightsDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Gets Deleted */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dataDeletion.whatGetsDeleted')}</CardTitle>
          <CardDescription>
            {t('dataDeletion.whatGetsDeletedDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{t('dataDeletion.deleteAccountInfo')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{t('dataDeletion.deleteOAuthData')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{t('dataDeletion.deleteSavedData')}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{t('dataDeletion.deleteUsageLogs')}</span>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> {t('dataDeletion.retentionNote')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dataDeletion.submitRequest')}</CardTitle>
          <CardDescription>
            {t('dataDeletion.submitRequestDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {t('dataDeletion.requestSubmitted')}
                </h3>
                <p className="text-muted-foreground mt-2" dangerouslySetInnerHTML={{ __html: t('dataDeletion.confirmationEmailSent', { email }) }} />
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('dataDeletion.confirmationCode')}</p>
                <p className="text-2xl font-mono font-bold mt-1">{confirmationCode}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('dataDeletion.saveCode')}
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• {t('dataDeletion.processedWithin30Days')}</p>
                <p>• {t('dataDeletion.emailConfirmation')}</p>
                <p>• {t('dataDeletion.questionsContact')} <a href="mailto:privacy@rizko.ai" className="text-blue-600 dark:text-blue-400">privacy@rizko.ai</a></p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('dataDeletion.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('dataDeletion.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{t('dataDeletion.errorMessage')}</span>
                </div>
              )}

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t('dataDeletion.consentNotice')}
                </p>
              </div>

              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={status === 'loading' || !email}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('dataDeletion.processing')}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('dataDeletion.requestDataDeletion')}
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Alternative Methods */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dataDeletion.alternativeMethods')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{t('dataDeletion.emailRequest')}</p>
              <p className="text-sm text-muted-foreground">
                Send an email to{' '}
                <a href="mailto:privacy@rizko.ai" className="text-blue-600 dark:text-blue-400">
                  privacy@rizko.ai
                </a>{' '}
                with subject "Data Deletion Request" and include your account email.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Trash2 className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{t('dataDeletion.selfService')}</p>
              <p className="text-sm text-muted-foreground">
                If you can access your account, go to{' '}
                <Link to="/dashboard/settings" className="text-blue-600 dark:text-blue-400">
                  Settings → Account → Delete Account
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta/Instagram Callback Info */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
            </svg>
            {t('dataDeletion.instagramMetaUsers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you connected your Instagram account and want to delete data through Meta's system,
            you can also use the Data Deletion callback that Meta provides. When you disconnect
            Rizko.ai from your Instagram settings, we automatically receive a deletion callback
            and process your data removal.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Callback URL: <code className="bg-muted px-2 py-1 rounded">https://api.rizko.ai/meta/data-deletion</code>
          </p>
        </CardContent>
      </Card>

      {/* Links */}
      <div className="flex gap-4 text-sm">
        <Link to="/dashboard/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t('privacyPolicyLink')} →
        </Link>
        <Link to="/dashboard/usage-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
          {t('termsOfServiceLink')} →
        </Link>
      </div>
    </div>
  );
}

export default DataDeletion;
