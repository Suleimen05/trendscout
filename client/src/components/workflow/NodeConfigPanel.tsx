/**
 * Node Configuration Panel
 * Slide-over panel for configuring workflow nodes:
 * - Video nodes: video details
 * - Brand nodes: brand context textarea
 * - AI nodes: custom prompt + model selector
 * - Output nodes: format options + full output view
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Video,
  Building2,
  Search,
  Target,
  Palette,
  Wand2,
  MessageSquare,
  FileText,
  LayoutGrid,
  Copy,
  Check,
  Upload,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// ScrollArea removed — native overflow-y-auto avoids Radix viewport width overflow
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Same icons as WorkflowBuilder
const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4">
    <defs>
      <linearGradient id="geminiGradCfg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="50%" stopColor="#9B72CB"/>
        <stop offset="100%" stopColor="#D96570"/>
      </linearGradient>
    </defs>
    <path fill="url(#geminiGradCfg)" d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#D97757">
    <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z"/>
  </svg>
);

const GPTIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#10A37F">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
  </svg>
);

const modelOptionsDefs = [
  { id: 'gemini', icon: GeminiIcon, baseCost: 1 },
  { id: 'claude', icon: ClaudeIcon, baseCost: 5 },
  { id: 'gpt4', icon: GPTIcon, baseCost: 4 },
];

// Per-node-type costs (heavier nodes cost more) — exported for WorkflowBuilder
export const NODE_MODEL_COSTS: Record<string, Record<string, number>> = {
  analyze:    { gemini: 1, claude: 5, gpt4: 4 },
  extract:    { gemini: 1, claude: 5, gpt4: 4 },
  style:      { gemini: 1, claude: 5, gpt4: 4 },
  generate:   { gemini: 2, claude: 6, gpt4: 5 },
  refine:     { gemini: 1, claude: 5, gpt4: 4 },
  script:     { gemini: 1, claude: 5, gpt4: 4 },
  storyboard: { gemini: 2, claude: 6, gpt4: 5 },
};

const nodeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  brand: <Building2 className="h-5 w-5" />,
  analyze: <Search className="h-5 w-5" />,
  extract: <Target className="h-5 w-5" />,
  style: <Palette className="h-5 w-5" />,
  generate: <Wand2 className="h-5 w-5" />,
  refine: <MessageSquare className="h-5 w-5" />,
  script: <FileText className="h-5 w-5" />,
  storyboard: <LayoutGrid className="h-5 w-5" />,
};

const nodeColors: Record<string, string> = {
  video: 'from-blue-500 to-cyan-500',
  brand: 'from-blue-500 to-cyan-500',
  analyze: 'from-purple-500 to-pink-500',
  extract: 'from-purple-500 to-pink-500',
  style: 'from-purple-500 to-pink-500',
  generate: 'from-green-500 to-emerald-500',
  refine: 'from-green-500 to-emerald-500',
  script: 'from-orange-500 to-yellow-500',
  storyboard: 'from-orange-500 to-yellow-500',
};

const aiNodeTypes = ['analyze', 'extract', 'style', 'generate', 'refine', 'script', 'storyboard'];

// Markdown components for output rendering
const MarkdownComponents = {
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2.5 last:mb-0 leading-relaxed text-[13px]">{children}</p>
  ),
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-base font-bold mb-2.5 mt-4 first:mt-0 text-foreground">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0 text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-sm font-semibold mb-1.5 mt-2.5 first:mt-0 text-foreground">{children}</h3>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-2.5 space-y-1 text-[13px]">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-[13px]">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-relaxed [overflow-wrap:anywhere]">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <pre className="bg-black/20 text-foreground/90 rounded-lg p-3 my-2.5 text-[13px] overflow-x-auto border border-border/50 max-w-full whitespace-pre-wrap [overflow-wrap:anywhere]">
          <code>{children}</code>
        </pre>
      );
    }
    return <code className="bg-black/20 text-foreground/90 px-1.5 py-0.5 rounded text-[13px]">{children}</code>;
  },
};

interface NodeConfig {
  customPrompt?: string;
  model?: string;
  brandContext?: string;
  outputFormat?: string;
}

interface WorkflowNode {
  id: number;
  type: string;
  x: number;
  y: number;
  videoData?: {
    id: number;
    platform: string;
    author: string;
    desc: string;
    views: string;
    uts: number;
    thumb: string;
    url?: string;
    localPath?: string;
  };
  outputContent?: string;
  config?: NodeConfig;
}

interface SavedVideoItem {
  id: number;
  platform: string;
  author: string;
  desc: string;
  views: string;
  uts: number;
  thumb: string;
  url?: string;
  localPath?: string;
}

interface NodeConfigPanelProps {
  node: WorkflowNode;
  onClose: () => void;
  onUpdate: (nodeId: number, config: NodeConfig) => void;
  savedVideos?: SavedVideoItem[];
  onAttachVideo?: (nodeId: number, videoData: SavedVideoItem) => void;
  onUploadVideo?: (nodeId: number, file: File) => Promise<void>;
}

export function NodeConfigPanel({ node, onClose, onUpdate, savedVideos = [], onAttachVideo, onUploadVideo }: NodeConfigPanelProps) {
  const { t } = useTranslation('workflow');
  const [customPrompt, setCustomPrompt] = useState(node.config?.customPrompt || '');
  const [selectedModel, setSelectedModel] = useState(node.config?.model || 'gemini');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brandContext, setBrandContext] = useState(node.config?.brandContext || '');
  const [outputFormat, setOutputFormat] = useState(node.config?.outputFormat || 'markdown');
  const [copied, setCopied] = useState(false);
  const [showVideoPicker, setShowVideoPicker] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);

  // Sync when node changes
  useEffect(() => {
    setCustomPrompt(node.config?.customPrompt || '');
    setSelectedModel(node.config?.model || 'gemini');
    setBrandContext(node.config?.brandContext || '');
    setOutputFormat(node.config?.outputFormat || 'markdown');
    setInfoExpanded(false);
  }, [node.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadVideo) return;
    setIsUploading(true);
    try {
      await onUploadVideo(node.id, file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isAINode = aiNodeTypes.includes(node.type);

  const handleSave = () => {
    const config: NodeConfig = {};
    if (isAINode && customPrompt.trim()) config.customPrompt = customPrompt.trim();
    if (isAINode && selectedModel !== 'gemini') config.model = selectedModel;
    if (node.type === 'brand' && brandContext.trim()) config.brandContext = brandContext.trim();
    if (['script', 'storyboard'].includes(node.type)) config.outputFormat = outputFormat;

    onUpdate(node.id, config);
    onClose();
  };

  const handleCopyOutput = async () => {
    if (!node.outputContent) return;
    try {
      await navigator.clipboard.writeText(node.outputContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="absolute top-0 right-0 h-full w-[420px] bg-card/95 backdrop-blur-xl border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right-5 duration-200">
      {/* Hidden file input for video upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/x-matroska,.mp4,.mov,.avi,.webm,.mkv,.m4v"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className={cn("px-5 py-3.5 border-b border-white/10 bg-gradient-to-r", nodeColors[node.type] || 'from-purple-500 to-pink-500')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            {nodeIcons[node.type]}
            <span className="font-semibold text-base">{t(`nodes.${node.type}.title`, node.type)}</span>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs font-mono">
              #{node.id}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-lg"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-5 space-y-5 max-w-full">

          {/* Node Description — collapsible */}
          <div className="bg-secondary/50 border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setInfoExpanded(!infoExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/80 transition-colors"
            >
              <p className="text-sm text-muted-foreground text-left min-w-0 break-words">
                {t(`nodeConfig.nodeInfo.${node.type}.description`, '')}
              </p>
              {infoExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              )}
            </button>
            {infoExpanded && (
              <div className="px-4 pb-3 space-y-1.5 border-t border-border/50 pt-2.5">
                {(t(`nodeConfig.nodeInfo.${node.type}.tips`, { returnObjects: true }) as string[]).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Node Config */}
          {node.type === 'video' && (
            <>
              {node.videoData ? (
                <div className="space-y-3">
                  <div className="w-full h-36 bg-secondary rounded-xl overflow-hidden relative">
                    {node.videoData.thumb ? (
                      <img src={node.videoData.thumb} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/50">
                        <Video className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <Badge className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-xs font-semibold">
                      UTS {node.videoData.uts}
                    </Badge>
                    <Badge className="absolute top-2.5 right-2.5 bg-black/60 text-white border-0 text-xs">
                      {node.videoData.platform}
                    </Badge>
                  </div>
                  <div className="space-y-2 px-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{node.videoData.views} {t('nodeConfig.views')}</Badge>
                    </div>
                    <p className="text-sm font-medium">@{node.videoData.author}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed break-words">{node.videoData.desc}</p>
                    {node.videoData.url && (
                      <a
                        href={node.videoData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2"
                      >
                        {t('nodeConfig.openOriginal')}
                      </a>
                    )}
                  </div>
                  {/* Change Video / Upload Buttons */}
                  <div className="flex gap-2">
                    {savedVideos.length > 0 && onAttachVideo && (
                      <button
                        onClick={() => setShowVideoPicker(prev => !prev)}
                        className="flex-1 text-sm text-center py-2 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-purple-500 transition-colors"
                      >
                        {t('nodeConfig.changeVideo')}
                      </button>
                    )}
                    {onUploadVideo && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex-1 text-sm text-center py-2 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-blue-500 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {isUploading ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('nodeConfig.uploadingVideo')}</>
                        ) : (
                          <><Upload className="h-3.5 w-3.5" />{t('nodeConfig.uploadFromDevice')}</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{t('nodeConfig.noVideoAttached')}</p>
                  <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
                    {savedVideos.length > 0 ? t('nodeConfig.selectVideoOrDrag') : t('nodeConfig.dragVideoFromSidebar')}
                  </p>
                  <div className="flex flex-col gap-2.5 items-center">
                    {savedVideos.length > 0 && !showVideoPicker && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowVideoPicker(true)}
                        className="text-sm rounded-xl"
                      >
                        <Video className="h-4 w-4 mr-1.5" />
                        {t('nodeConfig.browseSavedVideos')}
                      </Button>
                    )}
                    {onUploadVideo && (
                      <>
                        {savedVideos.length > 0 && (
                          <p className="text-sm text-muted-foreground/60">{t('nodeConfig.orUploadFromDevice')}</p>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="text-sm rounded-xl"
                        >
                          {isUploading ? (
                            <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />{t('nodeConfig.uploadingVideo')}</>
                          ) : (
                            <><Upload className="h-4 w-4 mr-1.5" />{t('nodeConfig.uploadFromDevice')}</>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground/50">{t('nodeConfig.maxFileSize')}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Video Picker */}
              {showVideoPicker && savedVideos.length > 0 && onAttachVideo && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold">{t('nodeConfig.selectVideo')}</span>
                    <button
                      onClick={() => setShowVideoPicker(false)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {savedVideos.map(video => (
                      <button
                        key={video.id}
                        onClick={() => {
                          onAttachVideo(node.id, video);
                          setShowVideoPicker(false);
                        }}
                        className={cn(
                          "w-full flex gap-2.5 p-2.5 rounded-xl border text-left transition-all",
                          node.videoData?.id === video.id
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-border bg-secondary/30 hover:border-purple-400 hover:bg-secondary/60"
                        )}
                      >
                        <div className="w-11 h-14 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                          {video.thumb ? (
                            <img src={video.thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-xs px-1.5 py-0 h-5">
                              {video.uts}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{video.platform}</span>
                          </div>
                          <p className="text-sm font-medium truncate">@{video.author}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{video.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Brand Node Config */}
          {node.type === 'brand' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('nodeConfig.brandContext')}
                  <span className="text-purple-400 ml-1">*</span>
                </label>
                <textarea
                  value={brandContext}
                  onChange={(e) => setBrandContext(e.target.value)}
                  placeholder={t('nodeConfig.brandPlaceholder')}
                  className="w-full h-52 bg-secondary border border-border rounded-xl p-3.5 text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all leading-relaxed"
                />
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                <p className="text-sm text-purple-600 dark:text-purple-300 leading-relaxed break-words">
                  <strong>{t('nodeConfig.brandProTip')}</strong> {t('nodeConfig.brandProTipText')}
                </p>
              </div>
            </div>
          )}

          {/* AI Node Config (analyze, extract, style, generate, refine, script, storyboard) */}
          {isAINode && (
            <>
              {/* Model Selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2.5 block">{t('nodeConfig.aiModel')}</label>
                <div className="space-y-2">
                  {modelOptionsDefs.map(model => {
                    const cost = NODE_MODEL_COSTS[node.type]?.[model.id] ?? model.baseCost;
                    return (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                          selectedModel === model.id
                            ? "border-purple-500 bg-purple-500/10 shadow-sm shadow-purple-500/10"
                            : "border-border bg-secondary/30 hover:border-purple-400 hover:bg-secondary/50"
                        )}
                      >
                        <model.icon />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">{t(`models.${model.id}.name`)}</div>
                        </div>
                        <Badge variant="outline" className="text-xs font-medium">
                          {cost} {t('nodeConfig.cr')}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('nodeConfig.customPrompt')}
                  <span className="text-muted-foreground font-normal ml-1.5">{t('nodeConfig.optional')}</span>
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t(`nodeConfig.promptHints.${node.type}`, t('nodeConfig.customPromptPlaceholder'))}
                  className="w-full h-36 bg-secondary border border-border rounded-xl p-3.5 text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all leading-relaxed"
                />
                <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed break-words">
                  {t('nodeConfig.customPromptHint')}
                </p>
              </div>
            </>
          )}

          {/* Output Format for script/storyboard */}
          {['script', 'storyboard'].includes(node.type) && (
            <div>
              <label className="text-sm font-medium text-foreground mb-2.5 block">{t('nodeConfig.outputFormat')}</label>
              <div className="flex gap-2">
                {['markdown', 'plain', 'json'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={cn(
                      "flex-1 py-2 text-sm rounded-xl border transition-all capitalize font-medium",
                      outputFormat === fmt
                        ? "border-purple-500 bg-purple-500/10 text-foreground shadow-sm shadow-purple-500/10"
                        : "border-border bg-secondary/30 text-muted-foreground hover:border-purple-400 hover:bg-secondary/50"
                    )}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Output Content (for any node that has been processed) */}
          {node.outputContent && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-medium text-foreground">{t('nodeConfig.output')}</label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs rounded-lg"
                  onClick={handleCopyOutput}
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 mr-1" /> {t('nodeConfig.copied')}</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5 mr-1" /> {t('nodeConfig.copy')}</>
                  )}
                </Button>
              </div>
              <div className="bg-secondary/80 border border-border rounded-xl p-4 max-h-[400px] overflow-y-auto overflow-x-hidden w-full">
                <div className="prose dark:prose-invert max-w-none text-[13px] text-foreground/80 leading-relaxed break-words [overflow-wrap:anywhere] min-w-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents as any}>
                    {node.outputContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Save */}
      <div className="p-4 border-t border-border flex gap-2.5">
        <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9" onClick={onClose}>
          {t('nodeConfig.cancel')}
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl h-9 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-medium"
          onClick={handleSave}
        >
          {t('nodeConfig.apply')}
        </Button>
      </div>
    </div>
  );
}
