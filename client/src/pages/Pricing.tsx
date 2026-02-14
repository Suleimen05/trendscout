import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import {
  Check,
  X,
  Zap,
  Crown,
  Rocket,
  Building2,
  Mic,
  TrendingUp,
  Search,
  Users,
  FileText,
  Sparkles,
  Headphones,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PlanFeature {
  name: string;
  free: boolean | string;
  creator: boolean | string;
  pro: boolean | string;
  agency: boolean | string;
}

export function Pricing() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation('pricing');
  const [isYearly, setIsYearly] = useState(false);
  const currentPlan = user?.subscription || 'free';

  // Dev upgrade modal state
  const [showDevModal, setShowDevModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [devCode, setDevCode] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Localized features comparison table from JSON
  const features: PlanFeature[] = t('features', { returnObjects: true }) as PlanFeature[];

  // Plans with translatable strings pulled from JSON
  const plans = [
    {
      id: 'free' as const,
      name: t('plans.free.name'),
      description: t('plans.free.description'),
      price: { monthly: 0, yearly: 0 },
      icon: Zap,
      color: 'from-gray-500 to-gray-600',
      popular: false,
      cta: t('plans.free.cta'),
      ctaVariant: 'outline' as const,
    },
    {
      id: 'creator' as const,
      name: t('plans.creator.name'),
      description: t('plans.creator.description'),
      price: { monthly: 19, yearly: 144 },
      icon: Crown,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
      cta: t('plans.creator.cta'),
      ctaVariant: 'default' as const,
    },
    {
      id: 'pro' as const,
      name: t('plans.pro.name'),
      description: t('plans.pro.description'),
      price: { monthly: 49, yearly: 348 },
      icon: Rocket,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      cta: t('plans.pro.cta'),
      ctaVariant: 'default' as const,
    },
    {
      id: 'agency' as const,
      name: t('plans.agency.name'),
      description: t('plans.agency.description'),
      price: { monthly: 149, yearly: 1068 },
      icon: Building2,
      color: 'from-orange-500 to-red-500',
      popular: false,
      cta: t('plans.agency.cta'),
      ctaVariant: 'default' as const,
    },
  ];

  // Highlights with localized strings
  const highlights = [
    { icon: TrendingUp, title: t('highlights.trends.title'), description: t('highlights.trends.description') },
    { icon: Sparkles, title: t('highlights.scripts.title'), description: t('highlights.scripts.description') },
    { icon: Mic, title: t('highlights.voice.title'), description: t('highlights.voice.description') },
    { icon: Users, title: t('highlights.competitors.title'), description: t('highlights.competitors.description') },
  ];

  const handlePlanClick = (planId: string) => {
    if (planId === 'free' || currentPlan.toLowerCase() === planId) return;

    // Open dev modal instead of checkout
    setSelectedPlan(planId);
    setDevCode('');
    setShowDevModal(true);
  };

  const handleDevUpgrade = async () => {
    if (!devCode.trim()) {
      toast.error('Please enter dev code');
      return;
    }

    setIsUpgrading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const authData = localStorage.getItem('rizko_auth');
      const token = authData ? JSON.parse(authData).tokens?.accessToken : null;

      const response = await fetch(`${API_URL}/auth/dev/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          dev_code: devCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upgrade');
      }

      toast.success(`Successfully upgraded to ${selectedPlan.toUpperCase()}!`);
      setShowDevModal(false);

      // Refresh user data to update subscription
      if (refreshUser) {
        await refreshUser();
      } else {
        // Fallback: reload page
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Invalid dev code or upgrade failed');
    } finally {
      setIsUpgrading(false);
    }
  };

  const getFeatureValue = (feature: PlanFeature, planId: string) => {
    const value = feature[planId as keyof PlanFeature];
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/30" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  // Helper to get plan features list from JSON
  const getPlanFeatures = (planId: string): string[] => {
    return t(`plans.${planId}.features`, { returnObjects: true }) as string[];
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-4">
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">{t('badge')}</Badge>
        <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className={cn('text-sm font-medium', !isYearly && 'text-foreground', isYearly && 'text-muted-foreground')}>{t('billing.monthly')}</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={cn('text-sm font-medium', isYearly && 'text-foreground', !isYearly && 'text-muted-foreground')}>{t('billing.yearly')}</span>
          {isYearly && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{t('billing.save')}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const monthlyPrice = isYearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly;
          const isCurrentPlan = currentPlan.toLowerCase() === plan.id;
          const planFeatures = getPlanFeatures(plan.id);

          return (
            <Card key={plan.id} className={cn('relative overflow-hidden transition-all hover:shadow-lg', plan.popular && 'border-purple-500 shadow-purple-500/20 shadow-lg')}>
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-purple-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">{t('mostPopular')}</div>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4', plan.color)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${monthlyPrice}</span>
                    <span className="text-muted-foreground">{t('billing.perMonth')}</span>
                  </div>
                  {isYearly && plan.price.monthly > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">{t('billing.billedYearly', { amount: plan.price.yearly })}</p>
                  )}
                </div>
                <Button
                  className={cn('w-full', plan.popular && 'bg-purple-600 hover:bg-purple-700')}
                  variant={plan.ctaVariant}
                  disabled={isCurrentPlan}
                  onClick={() => handlePlanClick(plan.id)}
                >
                  {isCurrentPlan ? t('currentPlan') : plan.cta}
                </Button>
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('keyFeatures')}</p>
                  <ul className="space-y-2">
                    {planFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {/* Add special icons for voice and deep analyze features */}
                        {plan.id === 'creator' && idx === 2 && <Mic className="h-3 w-3" />}
                        {plan.id === 'pro' && idx === 0 && <Sparkles className="h-3 w-3" />}
                        {plan.id === 'pro' && idx === 2 && <Mic className="h-3 w-3" />}
                        {plan.id === 'agency' && idx === 1 && <Mic className="h-3 w-3" />}
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t('compareFeatures.title')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">{t('compareFeatures.feature')}</th>
                <th className="text-center py-4 px-4 font-medium">{t('plans.free.name')}</th>
                <th className="text-center py-4 px-4 font-medium">{t('plans.creator.name')}</th>
                <th className="text-center py-4 px-4 font-medium text-purple-600">{t('plans.pro.name')}</th>
                <th className="text-center py-4 px-4 font-medium">{t('plans.agency.name')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-muted/30">
                <td colSpan={5} className="py-3 px-4 font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />{t('compareFeatures.sections.trendAnalysis')}
                </td>
              </tr>
              {features.slice(0, 5).map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'free')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'creator')}</td>
                  <td className="text-center py-3 px-4 bg-purple-500/5">{getFeatureValue(feature, 'pro')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'agency')}</td>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td colSpan={5} className="py-3 px-4 font-semibold text-sm flex items-center gap-2">
                  <Search className="h-4 w-4" />{t('compareFeatures.sections.videoSearch')}
                </td>
              </tr>
              {features.slice(5, 9).map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'free')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'creator')}</td>
                  <td className="text-center py-3 px-4 bg-purple-500/5">{getFeatureValue(feature, 'pro')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'agency')}</td>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td colSpan={5} className="py-3 px-4 font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />{t('compareFeatures.sections.aiScriptGeneration')}
                </td>
              </tr>
              {features.slice(9, 14).map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'free')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'creator')}</td>
                  <td className="text-center py-3 px-4 bg-purple-500/5">{getFeatureValue(feature, 'pro')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'agency')}</td>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td colSpan={5} className="py-3 px-4 font-semibold text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4" />{t('compareFeatures.sections.voiceAI')}
                  <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">{t('compareFeatures.sections.voiceAIBadge')}</Badge>
                </td>
              </tr>
              {features.slice(14, 18).map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'free')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'creator')}</td>
                  <td className="text-center py-3 px-4 bg-purple-500/5">{getFeatureValue(feature, 'pro')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'agency')}</td>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td colSpan={5} className="py-3 px-4 font-semibold text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />{t('compareFeatures.sections.competitorTracking')}
                </td>
              </tr>
              {features.slice(18, 21).map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'free')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'creator')}</td>
                  <td className="text-center py-3 px-4 bg-purple-500/5">{getFeatureValue(feature, 'pro')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'agency')}</td>
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td colSpan={5} className="py-3 px-4 font-semibold text-sm flex items-center gap-2">
                  <Headphones className="h-4 w-4" />{t('compareFeatures.sections.teamSupport')}
                </td>
              </tr>
              {features.slice(21).map((feature, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'free')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'creator')}</td>
                  <td className="text-center py-3 px-4 bg-purple-500/5">{getFeatureValue(feature, 'pro')}</td>
                  <td className="text-center py-3 px-4">{getFeatureValue(feature, 'agency')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">{t('faq.title')}</h2>
        <div className="space-y-4">
          {(t('faq.items', { returnObjects: true }) as Array<{ question: string; answer: string }>).map((item, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="py-12">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t('cta.subtitle')}</p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700" onClick={() => handlePlanClick('pro')}>{t('cta.startPro')}</Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>{t('cta.tryFree')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dev Upgrade Modal */}
      <Dialog open={showDevModal} onOpenChange={setShowDevModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              {t('devModal.title')}
            </DialogTitle>
            <DialogDescription>
              <Trans
                i18nKey="devModal.description"
                t={t}
                values={{ plan: selectedPlan.toUpperCase() }}
                components={{ 1: <span className="font-semibold text-foreground" /> }}
              />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('devModal.label')}</label>
              <Input
                type="password"
                placeholder={t('devModal.placeholder')}
                value={devCode}
                onChange={(e) => setDevCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDevUpgrade();
                }}
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {t('devModal.warning')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDevModal(false)}>
              {t('devModal.cancel')}
            </Button>
            <Button
              onClick={handleDevUpgrade}
              disabled={isUpgrading || !devCode.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('devModal.upgrading')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('devModal.upgrade', { plan: selectedPlan })}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { Pricing as PricingPage };
