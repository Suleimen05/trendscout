import { HelpCircle, MessageCircle, BookOpen, Video, Mail, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { REVIEW_MODE } from '@/config/features';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Icon mapping for guides (icons can't be stored in JSON)
const guideIcons = [BookOpen, Video, MessageCircle];

export function Help() {
  const { t } = useTranslation('help');
  const location = useLocation();
  const isStandalone = location.pathname === '/help';

  // FAQ items from translation files
  const faqItems = REVIEW_MODE
    ? (t('faqReviewMode', { returnObjects: true }) as Array<{ question: string; answer: string }>)
    : (t('faqFullMode', { returnObjects: true }) as Array<{ question: string; answer: string }>);

  // Guide items from translation files
  const guidesRaw = REVIEW_MODE
    ? (t('guidesReviewMode', { returnObjects: true }) as Array<{ title: string; description: string; duration: string }>)
    : (t('guidesFullMode', { returnObjects: true }) as Array<{ title: string; description: string; duration: string }>);

  const guides = guidesRaw.map((guide, index) => ({
    ...guide,
    icon: guideIcons[index % guideIcons.length],
  }));

  const content = (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="h-7 w-7" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('quickActions.contactSupport.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('quickActions.contactSupport.description')}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://t.me/+13215884561', '_blank')}
            >
              {t('quickActions.contactSupport.button')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('quickActions.emailUs.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('quickActions.emailUs.description')}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = 'mailto:support@rizko.ai?subject=Rizko.ai Support'}
            >
              {t('quickActions.emailUs.button')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{t('quickActions.faq.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('quickActions.faq.description')}
            </p>
            <Button variant="outline" className="w-full" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('quickActions.faq.button')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <h2 className="text-2xl font-semibold mb-6">{t('faqTitle')}</h2>
        <div className="grid gap-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Guides Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">{t('guidesTitle')}</h2>
        <div className="grid gap-4">
          {guides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 group-hover:text-purple-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{guide.duration}</span>
                      <span>•</span>
                      <span className="text-purple-600 font-medium">{t('readGuide')}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">{t('systemStatus.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('systemStatus.allOperational')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">{t('systemStatus.badge')}</span>
          </div>
        </div>
      </Card>

      {/* Back to Home for standalone */}
      {isStandalone && (
        <div className="text-center pt-4">
          <Link to="/" className="text-blue-500 hover:underline inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t('backToHome')}
          </Link>
        </div>
      )}
    </div>
  );

  // Standalone mode - with full page wrapper
  if (isStandalone) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {content}
        </div>
      </div>
    );
  }

  // Dashboard mode - no wrapper
  return content;
}
