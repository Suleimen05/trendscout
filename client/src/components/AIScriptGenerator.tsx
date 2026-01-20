import { useState } from 'react';
import { Sparkles, Copy, Download, RefreshCw, Check, Wand2, Lightbulb, Clock, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { AIScript, TikTokVideo } from '@/types';

interface AIScriptGeneratorProps {
  video: TikTokVideo | null;
  script: AIScript | null;
  loading: boolean;
  onGenerate: (tone?: string, niche?: string) => void;
  onRegenerate: () => void;
}

const tones = [
  { id: 'engaging', label: 'Engaging', icon: Zap },
  { id: 'professional', label: 'Professional', icon: Target },
  { id: 'casual', label: 'Casual', icon: Wand2 },
  { id: 'humorous', label: 'Humorous', icon: Lightbulb },
];

const niches = [
  'General',
  'Entertainment',
  'Education',
  'Lifestyle',
  'Business',
  'Fashion',
  'Food',
  'Fitness',
  'Travel',
  'Technology',
];

export function AIScriptGenerator({
  video,
  script,
  loading,
  onGenerate,
  onRegenerate,
}: AIScriptGeneratorProps) {
  const [selectedTone, setSelectedTone] = useState('engaging');
  const [selectedNiche, setSelectedNiche] = useState('general');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('script');

  const handleCopy = () => {
    if (!script) return;
    const fullScript = `${script.hook}\n\n${script.body.join('\n')}\n\n${script.callToAction}`;
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!script) return;
    const fullScript = `${script.hook}\n\n${script.body.join('\n')}\n\n${script.callToAction}`;
    const blob = new Blob([fullScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-script-${script.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!video && !script) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Script Generator</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Select a viral video to generate a unique script tailored to your brand and audience.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Script Generator</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate viral scripts based on trending videos
              </p>
            </div>
          </div>
          {script && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className={cn(copied && 'bg-green-100 text-green-700')}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Tone Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tone of Voice</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((tone) => {
                const Icon = tone.icon;
                return (
                  <Button
                    key={tone.id}
                    variant={selectedTone === tone.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTone(tone.id)}
                    className={cn(
                      selectedTone === tone.id &&
                        'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    )}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {tone.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Niche Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Content Niche</label>
            <div className="flex flex-wrap gap-2">
              {niches.map((niche) => (
                <Button
                  key={niche}
                  variant={selectedNiche === niche.toLowerCase() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedNiche(niche.toLowerCase())}
                  className={cn(
                    selectedNiche === niche.toLowerCase() &&
                      'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  )}
                >
                  {niche}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          {!script && (
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => onGenerate(selectedTone, selectedNiche)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Script
                </>
              )}
            </Button>
          )}
        </div>

        {/* Generated Script */}
        {script && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="script">Script</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="elements">Viral Elements</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-4">
              <div className="space-y-4 p-4 rounded-lg bg-muted">
                {/* Hook */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Hook
                    </Badge>
                    <span className="text-xs text-muted-foreground">First 3 seconds</span>
                  </div>
                  <p className="font-medium text-lg">{script.hook}</p>
                </div>

                {/* Body */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Body
                    </Badge>
                    <span className="text-xs text-muted-foreground">Main content</span>
                  </div>
                  <div className="space-y-2">
                    {script.body.map((segment, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {segment}
                      </p>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Call to Action
                    </Badge>
                    <span className="text-xs text-muted-foreground">Last 3 seconds</span>
                  </div>
                  <p className="font-medium">{script.callToAction}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  className={cn(
                    'flex-1',
                    copied && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Script
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onRegenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Pro Tips</span>
              </div>
              <ul className="space-y-2">
                {script.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="elements" className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Viral Elements</span>
              </div>
              <div className="grid gap-2">
                {script.viralElements.map((element, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-100 to-yellow-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{element}</span>
                  </div>
                ))}
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{script.duration}s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tone</span>
                  <Badge variant="outline">{script.tone}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Niche</span>
                  <Badge variant="outline">{script.niche}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Generated</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(script.generatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
