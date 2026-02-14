import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Store,
  User,
  Bot,
  Sparkles,
  Video,
  PenTool,
  BarChart3,
  Palette,
  ArrowRight,
  Check,
  Lock,
  Mail,
  Star,
  MapPin,
  Zap,
  Search,
  Users,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Application form data
interface ApplicationForm {
  fullName: string;
  email: string;
  tiktokUsername: string;
  instagramUsername: string;
  githubUsername: string;
  portfolioUrl: string;
  categories: string[];
  title: string;
  bio: string;
  priceRange: string;
}

const initialFormState: ApplicationForm = {
  fullName: '',
  email: '',
  tiktokUsername: '',
  instagramUsername: '',
  githubUsername: '',
  portfolioUrl: '',
  categories: [],
  title: '',
  bio: '',
  priceRange: '',
};

const categoryOptionDefs = [
  { id: 'video', icon: Video },
  { id: 'script', icon: PenTool },
  { id: 'smm', icon: BarChart3 },
  { id: 'design', icon: Palette },
];

const priceRangeOptions = [
  '$25-50',
  '$50-100',
  '$100-200',
  '$200-500',
  '$500+',
];

type ProviderType = 'human' | 'ai' | 'hybrid';

interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  avatar?: string;
  title: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  price: string;
  priceType: 'per_video' | 'per_month' | 'per_script' | 'per_hour';
  location?: string;
  delivery?: string;
  tags: string[];
  featured?: boolean;
  verified?: boolean;
}

const providers: Provider[] = [
  // Mixed order for variety
  {
    id: '1',
    name: 'Sarah Chen',
    type: 'human',
    title: 'UGC Creator',
    category: 'Video Creation',
    description: 'I create authentic TikTok content that converts viewers into customers. 3+ years in beauty niche.',
    rating: 4.9,
    reviews: 127,
    price: '$200',
    priceType: 'per_video',
    location: 'Los Angeles, CA',
    delivery: '3 days',
    tags: ['UGC', 'Beauty', 'Lifestyle'],
    featured: true,
    verified: true,
  },
  {
    id: '13',
    name: 'TrendBot Script AI',
    type: 'ai',
    title: 'AI Script Generator',
    category: 'Script Writing',
    description: 'Generate viral TikTok scripts in seconds. Powered by GPT-4 with Rizko.ai data.',
    rating: 4.7,
    reviews: 892,
    price: '$9',
    priceType: 'per_month',
    delivery: 'Instant',
    tags: ['Scripts', 'Hooks', 'AI-Powered'],
    featured: true,
  },
  {
    id: '21',
    name: 'Alex Rivera + AI',
    type: 'hybrid',
    title: 'Full SMM Package',
    category: 'SMM Management',
    description: 'Human strategy + AI execution = 10x output. I plan, AI handles the rest.',
    rating: 4.8,
    reviews: 64,
    price: '$299',
    priceType: 'per_month',
    location: 'Miami, FL',
    delivery: 'Same day',
    tags: ['Strategy', 'AI-Assisted', 'Full Service'],
    featured: true,
    verified: true,
  },
  {
    id: '2',
    name: 'Mike Torres',
    type: 'human',
    title: 'Video Editor',
    category: 'Video Creation',
    description: 'Professional TikTok video editing with trending effects, transitions, and captions.',
    rating: 4.8,
    reviews: 89,
    price: '$75',
    priceType: 'per_video',
    location: 'Miami, FL',
    delivery: '24 hours',
    tags: ['Editing', 'Effects', 'Captions'],
    verified: true,
  },
  {
    id: '14',
    name: 'VideoGen AI',
    type: 'ai',
    title: 'AI Video Creator',
    category: 'Video Creation',
    description: 'Create faceless TikTok videos automatically. Text-to-video with AI voices.',
    rating: 4.5,
    reviews: 567,
    price: '$29',
    priceType: 'per_month',
    delivery: '5 min',
    tags: ['Faceless', 'Auto-Edit', 'AI Voice'],
  },
  {
    id: '3',
    name: 'Emma Wilson',
    type: 'human',
    title: 'SMM Manager',
    category: 'SMM Management',
    description: 'Full TikTok account management. Strategy, posting, engagement, growth.',
    rating: 4.9,
    reviews: 156,
    price: '$500',
    priceType: 'per_month',
    location: 'New York, NY',
    delivery: 'Ongoing',
    tags: ['Strategy', 'Growth', 'Management'],
    featured: true,
    verified: true,
  },
  {
    id: '22',
    name: 'ContentStudio Pro',
    type: 'hybrid',
    title: 'Video + AI Enhancement',
    category: 'Video Creation',
    description: 'Human-shot videos enhanced with AI effects, captions, and optimization.',
    rating: 4.7,
    reviews: 89,
    price: '$120',
    priceType: 'per_video',
    location: 'London, UK',
    delivery: '2 days',
    tags: ['Enhancement', 'Effects', 'Quality'],
  },
  {
    id: '15',
    name: 'CaptionMaster AI',
    type: 'ai',
    title: 'AI Caption Generator',
    category: 'Script Writing',
    description: 'Auto-generate captions, hashtags, and descriptions optimized for reach.',
    rating: 4.6,
    reviews: 1243,
    price: '$5',
    priceType: 'per_month',
    delivery: 'Instant',
    tags: ['Captions', 'Hashtags', 'SEO'],
  },
  {
    id: '4',
    name: 'David Park',
    type: 'human',
    title: 'Scriptwriter',
    category: 'Script Writing',
    description: 'Viral hooks and scripts that stop the scroll. 50M+ views generated for clients.',
    rating: 4.7,
    reviews: 203,
    price: '$50',
    priceType: 'per_script',
    location: 'Austin, TX',
    delivery: '48 hours',
    tags: ['Hooks', 'Viral', 'Copywriting'],
    verified: true,
  },
  {
    id: '19',
    name: 'TrendPredict AI',
    type: 'ai',
    title: 'AI Trend Forecaster',
    category: 'SMM Management',
    description: 'Predict viral trends before they blow up. Daily alerts and recommendations.',
    rating: 4.8,
    reviews: 345,
    price: '$25',
    priceType: 'per_month',
    delivery: 'Daily',
    tags: ['Trends', 'Predictions', 'Alerts'],
    featured: true,
  },
  {
    id: '5',
    name: 'Lisa Nguyen',
    type: 'human',
    title: 'UGC Creator',
    category: 'Video Creation',
    description: 'Authentic product reviews and unboxings. Food, tech, and lifestyle niches.',
    rating: 4.8,
    reviews: 94,
    price: '$150',
    priceType: 'per_video',
    location: 'San Francisco, CA',
    delivery: '4 days',
    tags: ['Reviews', 'Unboxing', 'Food'],
  },
  {
    id: '23',
    name: 'ScriptCraft Team',
    type: 'hybrid',
    title: 'AI Draft + Human Polish',
    category: 'Script Writing',
    description: 'AI generates drafts, human writers perfect them. Best of both worlds.',
    rating: 4.6,
    reviews: 156,
    price: '$35',
    priceType: 'per_script',
    location: 'Toronto, CA',
    delivery: '24 hours',
    tags: ['Scripts', 'Polished', 'Fast'],
  },
  {
    id: '16',
    name: 'ThumbnailPro AI',
    type: 'ai',
    title: 'AI Thumbnail Creator',
    category: 'Design & Thumbnails',
    description: 'Generate scroll-stopping thumbnails using AI. A/B testing included.',
    rating: 4.4,
    reviews: 423,
    price: '$12',
    priceType: 'per_month',
    delivery: 'Instant',
    tags: ['Thumbnails', 'A/B Test', 'Design'],
  },
  {
    id: '6',
    name: 'James Brown',
    type: 'human',
    title: 'Thumbnail Designer',
    category: 'Design & Thumbnails',
    description: 'Eye-catching thumbnails and cover images that boost CTR by 40%+.',
    rating: 4.6,
    reviews: 178,
    price: '$25',
    priceType: 'per_video',
    location: 'Chicago, IL',
    delivery: '12 hours',
    tags: ['Thumbnails', 'Design', 'CTR'],
  },
  {
    id: '17',
    name: 'VoiceClone AI',
    type: 'ai',
    title: 'AI Voice Generator',
    category: 'Video Creation',
    description: '50+ realistic AI voices in 20+ languages. Perfect for faceless content.',
    rating: 4.7,
    reviews: 756,
    price: '$15',
    priceType: 'per_month',
    delivery: 'Instant',
    tags: ['Voiceover', 'Multilingual', 'Realistic'],
  },
  {
    id: '7',
    name: 'Anna Martinez',
    type: 'human',
    title: 'Voiceover Artist',
    category: 'Video Creation',
    description: 'Professional voiceovers in English and Spanish. TikTok, Reels, YouTube Shorts.',
    rating: 4.9,
    reviews: 312,
    price: '$30',
    priceType: 'per_video',
    location: 'Mexico City',
    delivery: '24 hours',
    tags: ['Voiceover', 'Bilingual', 'Professional'],
    verified: true,
  },
  {
    id: '24',
    name: 'Growth Agency AI',
    type: 'hybrid',
    title: 'Agency + AI Tools',
    category: 'SMM Management',
    description: 'Full agency service powered by proprietary AI. Strategy, content, ads.',
    rating: 4.9,
    reviews: 45,
    price: '$999',
    priceType: 'per_month',
    location: 'New York, NY',
    delivery: 'Ongoing',
    tags: ['Agency', 'Full Service', 'Premium'],
    featured: true,
    verified: true,
  },
  {
    id: '18',
    name: 'ScheduleBot AI',
    type: 'ai',
    title: 'AI Posting Scheduler',
    category: 'SMM Management',
    description: 'Auto-post at optimal times. Analytics and performance tracking included.',
    rating: 4.5,
    reviews: 634,
    price: '$19',
    priceType: 'per_month',
    delivery: 'Automated',
    tags: ['Scheduling', 'Analytics', 'Auto-Post'],
  },
  {
    id: '8',
    name: 'Chris Lee',
    type: 'human',
    title: 'TikTok Ads Expert',
    category: 'SMM Management',
    description: 'TikTok Ads specialist. $2M+ in ad spend managed. ROAS focused.',
    rating: 4.8,
    reviews: 67,
    price: '$150',
    priceType: 'per_hour',
    location: 'Seattle, WA',
    delivery: 'Consultation',
    tags: ['Ads', 'ROAS', 'Strategy'],
    featured: true,
  },
  {
    id: '9',
    name: 'Sofia Rodriguez',
    type: 'human',
    title: 'Dance Creator',
    category: 'Video Creation',
    description: 'Choreography and dance trends. I can create viral dances for your brand.',
    rating: 4.7,
    reviews: 89,
    price: '$300',
    priceType: 'per_video',
    location: 'Las Vegas, NV',
    delivery: '5 days',
    tags: ['Dance', 'Trends', 'Choreography'],
  },
  {
    id: '20',
    name: 'HashtagGenius AI',
    type: 'ai',
    title: 'AI Hashtag Optimizer',
    category: 'Script Writing',
    description: 'Find the perfect hashtags for maximum reach. Competitor analysis included.',
    rating: 4.3,
    reviews: 512,
    price: '$7',
    priceType: 'per_month',
    delivery: 'Instant',
    tags: ['Hashtags', 'Research', 'Optimization'],
  },
  {
    id: '10',
    name: 'Tom Anderson',
    type: 'human',
    title: 'Comedy Creator',
    category: 'Video Creation',
    description: 'Funny skits and comedy content. Making brands memorable through humor.',
    rating: 4.6,
    reviews: 145,
    price: '$250',
    priceType: 'per_video',
    location: 'Nashville, TN',
    delivery: '4 days',
    tags: ['Comedy', 'Skits', 'Entertainment'],
  },
  {
    id: '11',
    name: 'Rachel Kim',
    type: 'human',
    title: 'Fashion Creator',
    category: 'Video Creation',
    description: 'Fashion hauls, styling tips, and GRWM content. 200K+ followers.',
    rating: 4.9,
    reviews: 178,
    price: '$350',
    priceType: 'per_video',
    location: 'Los Angeles, CA',
    delivery: '5 days',
    tags: ['Fashion', 'GRWM', 'Styling'],
    verified: true,
  },
  {
    id: '12',
    name: 'Marcus Johnson',
    type: 'human',
    title: 'Fitness Creator',
    category: 'Video Creation',
    description: 'Workout tutorials, fitness tips, supplement reviews. Certified trainer.',
    rating: 4.8,
    reviews: 234,
    price: '$175',
    priceType: 'per_video',
    location: 'Denver, CO',
    delivery: '3 days',
    tags: ['Fitness', 'Workout', 'Health'],
  },
];

const categoryDefs = [
  { icon: Video, key: 'videoCreation', humanCount: 12, aiCount: 5 },
  { icon: PenTool, key: 'scriptWriting', humanCount: 18, aiCount: 8 },
  { icon: BarChart3, key: 'smmManagement', humanCount: 8, aiCount: 4 },
  { icon: Palette, key: 'designThumbnails', humanCount: 15, aiCount: 6 },
];

// Helper function to get provider type styles
const getProviderStyles = (type: ProviderType, t: (key: string) => string) => {
  switch (type) {
    case 'human':
      return {
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        icon: User,
        label: t('providerTypes.human'),
      };
    case 'ai':
      return {
        gradient: 'from-purple-500 to-pink-500',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
        icon: Bot,
        label: t('providerTypes.ai'),
      };
    case 'hybrid':
      return {
        gradient: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
        icon: Users,
        label: t('providerTypes.hybrid'),
      };
  }
};

const getPriceLabel = (priceType: Provider['priceType'], t: (key: string) => string) => {
  switch (priceType) {
    case 'per_video': return t('priceLabels.perVideo');
    case 'per_month': return t('priceLabels.perMonth');
    case 'per_script': return t('priceLabels.perScript');
    case 'per_hour': return t('priceLabels.perHour');
  }
};

// Provider Card Component
function ProviderCard({ provider, isLocked = false }: { provider: Provider; isLocked?: boolean }) {
  const { t } = useTranslation('marketplace');
  const styles = getProviderStyles(provider.type, t);
  const TypeIcon = styles.icon;

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg group',
      isLocked && 'opacity-90',
      provider.featured && 'ring-2 ring-offset-2',
      provider.type === 'human' && provider.featured && 'ring-blue-500',
      provider.type === 'ai' && provider.featured && 'ring-purple-500',
      provider.type === 'hybrid' && provider.featured && 'ring-orange-500'
    )}>
      {/* Color indicator bar */}
      <div className={cn('h-1 w-full bg-gradient-to-r', styles.gradient)} />

      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
            styles.gradient
          )}>
            <TypeIcon className="h-6 w-6 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{provider.name}</h3>
              {provider.verified && (
                <Badge variant="secondary" className="h-5 px-1">
                  <Check className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{provider.title}</p>
          </div>

          {/* Rating */}
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{provider.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">({provider.reviews})</p>
          </div>
        </div>

        {/* Type Badge */}
        <div className="mt-3">
          <Badge className={cn('text-xs', styles.badge)}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {styles.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
          {provider.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {provider.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {provider.location.split(',')[0]}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {provider.delivery}
          </span>
          <span className="flex items-center gap-1 font-semibold text-foreground">
            {provider.price}{getPriceLabel(provider.priceType, t)}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {provider.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {isLocked ? (
            <Button variant="outline" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              {t('card.joinWaitlistToUnlock')}
            </Button>
          ) : (
            <>
              <Button variant="outline" className="flex-1">
                {t('card.viewProfile')}
              </Button>
              <Button className={cn(
                'flex-1',
                provider.type === 'human' && 'bg-blue-600 hover:bg-blue-700',
                provider.type === 'ai' && 'bg-purple-600 hover:bg-purple-700',
                provider.type === 'hybrid' && 'bg-orange-600 hover:bg-orange-700'
              )}>
                {provider.type === 'ai' ? t('card.tryFree') : t('card.contact')}
              </Button>
            </>
          )}
        </div>
      </CardContent>

      {/* Featured badge */}
      {provider.featured && (
        <div className="absolute top-3 right-3">
          <Badge className={cn(
            'text-xs',
            provider.type === 'human' && 'bg-blue-600',
            provider.type === 'ai' && 'bg-purple-600',
            provider.type === 'hybrid' && 'bg-orange-600'
          )}>
            <Sparkles className="h-3 w-3 mr-1" />
            {t('card.featured')}
          </Badge>
        </div>
      )}
    </Card>
  );
}

export function Marketplace() {
  const { t } = useTranslation('marketplace');
  const [activeTab, setActiveTab] = useState<'client' | 'provider'>('client');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [providerType, setProviderType] = useState<'human' | 'ai' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<'all' | ProviderType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Application modal state
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationStep, setApplicationStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState<ApplicationForm>(initialFormState);

  const comingSoonFeatures = t('comingSoonFeatures', { returnObjects: true }) as string[];
  const creatorsItems = t('benefits.creatorsItems', { returnObjects: true }) as string[];
  const aiItems = t('benefits.aiItems', { returnObjects: true }) as string[];
  const successSteps = t('success.steps', { returnObjects: true }) as string[];

  const filteredProviders = providers.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('toasts.enterEmail'));
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(t('toasts.waitlistSuccess'));
    setEmail('');
    setIsSubmitting(false);
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) {
      toast.error(t('toasts.enterAccessCode'));
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.error(t('toasts.invalidAccessCode'));
    setAccessCode('');
    setIsSubmitting(false);
  };

  const handleProviderApply = () => {
    if (!providerType) return;
    setFormData(initialFormState);
    setApplicationStep('form');
    setShowApplicationModal(true);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      toast.error(t('toasts.enterFullName'));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t('toasts.enterYourEmail'));
      return;
    }
    if (providerType === 'human' && !formData.tiktokUsername.trim()) {
      toast.error(t('toasts.enterTiktok'));
      return;
    }
    if (providerType === 'ai' && !formData.githubUsername.trim()) {
      toast.error(t('toasts.enterGithub'));
      return;
    }
    if (formData.categories.length === 0) {
      toast.error(t('toasts.selectCategory'));
      return;
    }
    if (!formData.title.trim()) {
      toast.error(t('toasts.enterServiceTitle'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('provider_applications').insert({
        type: providerType === 'human' ? 'creator' : 'ai_developer',
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        tiktok_username: formData.tiktokUsername.trim() || null,
        instagram_username: formData.instagramUsername.trim() || null,
        github_username: formData.githubUsername.trim() || null,
        portfolio_url: formData.portfolioUrl.trim() || null,
        categories: formData.categories,
        title: formData.title.trim(),
        bio: formData.bio.trim() || null,
        price_range: formData.priceRange || null,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast.error(t('toasts.duplicateEmail'));
        } else {
          console.error('Supabase error:', error);
          toast.error(t('toasts.submitFailed'));
        }
        return;
      }

      setApplicationStep('success');
      toast.success(t('toasts.applicationSuccess'));
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(t('toasts.somethingWrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
    setApplicationStep('form');
    setFormData(initialFormState);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          {t('header.badge')}
        </div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Store className="h-8 w-8" />
          {t('header.title')}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          {t('header.subtitle')}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1 bg-muted/50">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'client'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabs.client')}
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'provider'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('tabs.provider')}
          </button>
        </div>
      </div>

      {activeTab === 'client' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-muted-foreground">{t('stats.creators')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-xs text-muted-foreground">{t('stats.aiAgents')}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="text-2xl font-bold text-orange-600">4</div>
              <div className="text-xs text-muted-foreground">{t('stats.hybrid')}</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                {t('filters.all')}
              </Button>
              <Button
                variant={filterType === 'human' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('human')}
                className={filterType === 'human' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <User className="h-4 w-4 mr-1" />
                {t('filters.human')}
              </Button>
              <Button
                variant={filterType === 'ai' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('ai')}
                className={filterType === 'ai' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Bot className="h-4 w-4 mr-1" />
                {t('filters.ai')}
              </Button>
              <Button
                variant={filterType === 'hybrid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('hybrid')}
                className={filterType === 'hybrid' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                <Users className="h-4 w-4 mr-1" />
                {t('filters.hybrid')}
              </Button>
            </div>
          </div>

          {/* Provider Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {filterType === 'all' ? t('sections.allProviders') :
                 filterType === 'human' ? t('sections.humanCreators') :
                 filterType === 'ai' ? t('sections.aiAgents') : t('sections.hybridServices')}
              </h2>
              <Badge variant="secondary">{t('results', { count: filteredProviders.length })}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} isLocked={true} />
              ))}
            </div>
          </div>

          {/* Waitlist CTA */}
          <Card className="max-w-2xl mx-auto border-2 border-dashed">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">{t('waitlist.title')}</h2>
                <p className="text-muted-foreground text-sm">
                  {t('waitlist.subtitle')}
                </p>
              </div>

              <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t('waitlist.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                  {isSubmitting ? t('waitlist.joining') : t('waitlist.joinButton')}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-3 text-sm">{t('waitlist.accessTitle')}</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {comingSoonFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-center">{t('sections.browseByCategory')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryDefs.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{t(`categories.${category.key}.title`)}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t(`categories.${category.key}.description`)}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-blue-600">
                            <User className="h-3 w-3" />
                            {category.humanCount}
                          </span>
                          <span className="flex items-center gap-1 text-purple-600">
                            <Bot className="h-3 w-3" />
                            {category.aiCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Provider View - Access Code */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Access Code Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{t('accessCode.title')}</h2>
                  <p className="text-muted-foreground text-sm">
                    {t('accessCode.subtitle')}
                  </p>
                </div>

                <form onSubmit={handleAccessCodeSubmit} className="space-y-3">
                  <Input
                    type="text"
                    placeholder={t('accessCode.placeholder')}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="text-center font-mono tracking-widest"
                    maxLength={12}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t('accessCode.verifying') : t('accessCode.verifyButton')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Apply Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{t('apply.title')}</h2>
                  <p className="text-muted-foreground text-sm">
                    {t('apply.subtitle')}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {t('apply.providerTypeQuestion')}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setProviderType('human')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        providerType === 'human'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-border hover:border-blue-300'
                      }`}
                    >
                      <User className={`h-8 w-8 mx-auto mb-2 ${
                        providerType === 'human' ? 'text-blue-500' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm font-medium">{t('apply.creatorSmm')}</span>
                    </button>

                    <button
                      onClick={() => setProviderType('ai')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        providerType === 'ai'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-border hover:border-purple-300'
                      }`}
                    >
                      <Bot className={`h-8 w-8 mx-auto mb-2 ${
                        providerType === 'ai' ? 'text-purple-500' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm font-medium">{t('apply.aiDeveloper')}</span>
                    </button>
                  </div>

                  <Button
                    onClick={handleProviderApply}
                    className="w-full mt-4"
                    disabled={!providerType}
                  >
                    {t('apply.applyNow')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider Benefits */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-6 text-center">{t('benefits.title')}</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">{t('benefits.creatorsTitle')}</h3>
                  </div>
                  <ul className="space-y-2">
                    {creatorsItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="h-5 w-5 text-purple-500" />
                    <h3 className="font-medium">{t('benefits.aiTitle')}</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Bottom CTA */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          {t('contact.text')}{' '}
          <a
            href="mailto:axislineX@gmail.com"
            className="text-purple-500 hover:underline"
          >
            axislineX@gmail.com
          </a>
        </p>
      </div>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {applicationStep === 'form' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {providerType === 'human' ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      {t('applicationModal.applyAsCreator')}
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      {t('applicationModal.applyAsAiDeveloper')}
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {t('applicationModal.formDescription')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleApplicationSubmit} className="space-y-4 mt-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">{t('applicationModal.fullName')}</Label>
                    <Input
                      id="fullName"
                      placeholder={t('applicationModal.fullNamePlaceholder')}
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t('applicationModal.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('applicationModal.emailPlaceholder')}
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Social Links - Different for Human vs AI */}
                {providerType === 'human' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="tiktok">{t('applicationModal.tiktokUsername')}</Label>
                      <Input
                        id="tiktok"
                        placeholder={t('applicationModal.tiktokPlaceholder')}
                        value={formData.tiktokUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, tiktokUsername: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="instagram">{t('applicationModal.instagram')}</Label>
                      <Input
                        id="instagram"
                        placeholder={t('applicationModal.instagramPlaceholder')}
                        value={formData.instagramUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, instagramUsername: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="github">{t('applicationModal.githubUsername')}</Label>
                      <Input
                        id="github"
                        placeholder={t('applicationModal.githubPlaceholder')}
                        value={formData.githubUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="portfolio">{t('applicationModal.demoApiUrl')}</Label>
                      <Input
                        id="portfolio"
                        placeholder={t('applicationModal.demoApiPlaceholder')}
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div className="space-y-2">
                  <Label>{t('applicationModal.categoriesLabel')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryOptionDefs.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = formData.categories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryToggle(cat.id)}
                          className={cn(
                            'flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-left',
                            isSelected
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-border hover:border-purple-300'
                          )}
                        >
                          <Icon className={cn('h-4 w-4', isSelected ? 'text-purple-500' : 'text-muted-foreground')} />
                          <span className="text-sm font-medium">{t(`categoryOptions.${cat.id}`)}</span>
                          {isSelected && <Check className="h-4 w-4 text-purple-500 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title">
                    {providerType === 'human' ? t('applicationModal.yourTitle') : t('applicationModal.aiAgentName')}
                  </Label>
                  <Input
                    id="title"
                    placeholder={providerType === 'human' ? t('applicationModal.titlePlaceholderHuman') : t('applicationModal.titlePlaceholderAi')}
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <Label htmlFor="bio">
                    {t('applicationModal.shortBio')} <span className="text-muted-foreground">{t('applicationModal.shortBioMax')}</span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder={providerType === 'human'
                      ? t('applicationModal.bioPlaceholderHuman')
                      : t('applicationModal.bioPlaceholderAi')}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value.slice(0, 280) }))}
                    className="h-20 resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/280</p>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>{t('applicationModal.priceRange')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {priceRangeOptions.map((price) => (
                      <button
                        key={price}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priceRange: prev.priceRange === price ? '' : price }))}
                        className={cn(
                          'px-3 py-1.5 rounded-full border text-sm transition-all',
                          formData.priceRange === price
                            ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-border hover:border-purple-300'
                        )}
                      >
                        {price}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priceRange: prev.priceRange === 'Custom pricing' ? '' : 'Custom pricing' }))}
                      className={cn(
                        'px-3 py-1.5 rounded-full border text-sm transition-all',
                        formData.priceRange === 'Custom pricing'
                          ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                          : 'border-border hover:border-purple-300'
                      )}
                    >
                      {t('applicationModal.customPricing')}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeApplicationModal}
                    className="flex-1"
                  >
                    {t('applicationModal.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'flex-1',
                      providerType === 'human' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('applicationModal.submitting')}
                      </>
                    ) : (
                      t('applicationModal.submitApplication')
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            /* Success Screen */
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t('success.title')}</h2>
              <p
                className="text-muted-foreground mb-6"
                dangerouslySetInnerHTML={{ __html: t('success.message', { email: formData.email }) }}
              />

              <div className="bg-muted/50 rounded-lg p-4 text-left mb-6">
                <h3 className="font-medium mb-2 text-sm">{t('success.whatHappensNext')}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {successSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={closeApplicationModal} className="w-full">
                {t('success.gotIt')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
