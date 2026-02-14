/**
 * Workflow Context
 * Manages workflow persistence: save, load, auto-save, CRUD
 * Also preloads saved videos and run history on auth so they're
 * ready when the user opens the AI Scripts page.
 * Uses apiService (axios + auto-refresh) for all API calls.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import i18n from '@/lib/i18n';

// =============================================================================
// TYPES
// =============================================================================

export interface WorkflowListItem {
  id: number;
  name: string;
  description?: string;
  status: string;
  node_count: number;
  is_favorite: boolean;
  tags: string[];
  last_run_at?: string;
  updated_at: string;
}

export interface WorkflowData {
  id: number;
  name: string;
  description?: string;
  graph_data: { nodes: any[]; connections: any[] };
  node_configs: Record<string, any>;
  status: string;
  canvas_state: { zoom: number; panX: number; panY: number };
  tags: string[];
  is_favorite: boolean;
  last_run_at?: string;
  last_run_results: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SavedVideo {
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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const detectPlatform = (url: string): string => {
  if (url.includes('tiktok')) return 'TikTok';
  if (url.includes('instagram')) return 'Instagram';
  if (url.includes('youtube') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('snapchat')) return 'Snapchat';
  if (url.includes('twitter') || url.includes('x.com')) return 'X';
  if (url.includes('pinterest')) return 'Pinterest';
  if (url.includes('linkedin')) return 'LinkedIn';
  return 'TikTok';
};

const formatViews = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

interface WorkflowContextType {
  workflows: WorkflowListItem[];
  currentWorkflow: WorkflowData | null;
  isDirty: boolean;
  isLoading: boolean;
  loadWorkflows: () => Promise<void>;
  createWorkflow: (name?: string) => Promise<WorkflowData | null>;
  loadWorkflow: (id: number) => Promise<void>;
  saveWorkflow: (data: {
    name?: string;
    graph_data?: { nodes: any[]; connections: any[] };
    node_configs?: Record<string, any>;
    canvas_state?: { zoom: number; panX: number; panY: number };
  }) => Promise<void>;
  deleteWorkflow: (id: number) => Promise<void>;
  duplicateWorkflow: (id: number) => Promise<void>;
  closeWorkflow: () => void;
  markDirty: () => void;
  setCurrentWorkflow: (wf: WorkflowData | null) => void;
  // Preloaded data
  savedVideos: SavedVideo[];
  loadingSaved: boolean;
  runHistory: any[];
  loadingHistory: boolean;
  loadSavedVideos: () => Promise<void>;
  loadRunHistory: () => Promise<void>;
  removeSavedVideo: (id: number) => void;
  removeRunHistoryItem: (id: number) => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { tokens, isAuthenticated } = useAuth();
  const token = tokens?.accessToken;

  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preloaded data — ready before user opens AI Scripts
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [runHistory, setRunHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Load all workflows
  // ---------------------------------------------------------------------------
  const loadWorkflows = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await apiService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // ---------------------------------------------------------------------------
  // Load saved videos (favorites)
  // ---------------------------------------------------------------------------
  const loadSavedVideos = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingSaved(true);
      const response = await apiService.getFavorites({ page: 1, per_page: 50 });
      const videos: SavedVideo[] = response.items.map((item: any) => ({
        id: item.id,
        platform: detectPlatform(item.trend?.url || ''),
        author: item.trend?.author_username || 'unknown',
        desc: item.trend?.description || 'No description',
        views: formatViews(item.trend?.stats?.playCount || 0),
        uts: item.trend?.uts_score || 0,
        thumb: item.trend?.cover_url || '',
        url: item.trend?.url,
      }));
      setSavedVideos(videos);
    } catch (error) {
      console.error('Failed to load saved videos:', error);
      setSavedVideos([]);
    } finally {
      setLoadingSaved(false);
    }
  }, [token]);

  // ---------------------------------------------------------------------------
  // Load run history
  // ---------------------------------------------------------------------------
  const loadRunHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingHistory(true);
      const history = await apiService.getWorkflowHistory(30);
      setRunHistory(history);
    } catch (error) {
      console.error('Failed to load run history:', error);
      setRunHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [token]);

  // ---------------------------------------------------------------------------
  // Mutations for preloaded data
  // ---------------------------------------------------------------------------
  const removeSavedVideo = useCallback((id: number) => {
    setSavedVideos(prev => prev.filter(v => v.id !== id));
  }, []);

  const removeRunHistoryItem = useCallback((id: number) => {
    setRunHistory(prev => prev.filter(r => r.id !== id));
  }, []);

  // ---------------------------------------------------------------------------
  // Create new workflow
  // ---------------------------------------------------------------------------
  const createWorkflow = useCallback(
    async (name?: string): Promise<WorkflowData | null> => {
      if (!token) return null;
      try {
        const data = await apiService.createWorkflow({
          name: name || 'Untitled Workflow',
        });
        setCurrentWorkflow(data);
        setIsDirty(false);
        await loadWorkflows();
        return data;
      } catch (error) {
        console.error('Failed to create workflow:', error);
        toast.error(i18n.t('toasts:workflow.createFailed'));
        return null;
      }
    },
    [token, loadWorkflows]
  );

  // ---------------------------------------------------------------------------
  // Load a specific workflow
  // ---------------------------------------------------------------------------
  const loadWorkflow = useCallback(
    async (id: number) => {
      if (!token) return;
      setIsLoading(true);
      try {
        const data = await apiService.getWorkflow(id);
        setCurrentWorkflow(data);
        setIsDirty(false);
      } catch (error) {
        console.error('Failed to load workflow:', error);
        toast.error(i18n.t('toasts:workflow.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // ---------------------------------------------------------------------------
  // Save workflow (creates if no current workflow)
  // ---------------------------------------------------------------------------
  const saveWorkflow = useCallback(
    async (data: {
      name?: string;
      graph_data?: { nodes: any[]; connections: any[] };
      node_configs?: Record<string, any>;
      canvas_state?: { zoom: number; panX: number; panY: number };
    }) => {
      if (!token) return;

      if (!currentWorkflow) {
        // Create new workflow first
        const newWf = await apiService.createWorkflow({
          name: data.name || 'Untitled Workflow',
          graph_data: data.graph_data,
          node_configs: data.node_configs,
          canvas_state: data.canvas_state,
        });
        setCurrentWorkflow(newWf);
        setIsDirty(false);
        await loadWorkflows();
        return;
      }

      try {
        const updated = await apiService.updateWorkflow(currentWorkflow.id, data);
        setCurrentWorkflow(updated);
        setIsDirty(false);
        // Update list item
        setWorkflows((prev) =>
          prev.map((wf) =>
            wf.id === currentWorkflow.id
              ? {
                  ...wf,
                  name: updated.name,
                  updated_at: updated.updated_at,
                  node_count: updated.graph_data?.nodes?.length || 0,
                }
              : wf
          )
        );
      } catch (error) {
        console.error('Failed to save workflow:', error);
        toast.error(i18n.t('toasts:workflow.saveFailed'));
      }
    },
    [token, currentWorkflow, loadWorkflows]
  );

  // Auto-save with debounce is handled inside saveWorkflow when markDirty() is called

  // ---------------------------------------------------------------------------
  // Mark as dirty (triggers auto-save)
  // ---------------------------------------------------------------------------
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Delete workflow
  // ---------------------------------------------------------------------------
  const deleteWorkflow = useCallback(
    async (id: number) => {
      if (!token) return;
      try {
        await apiService.deleteWorkflow(id);
        setWorkflows((prev) => prev.filter((wf) => wf.id !== id));
        if (currentWorkflow?.id === id) {
          setCurrentWorkflow(null);
          setIsDirty(false);
        }
        toast.success(i18n.t('toasts:workflow.deleted'));
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        toast.error(i18n.t('toasts:workflow.deleteFailed'));
      }
    },
    [token, currentWorkflow]
  );

  // ---------------------------------------------------------------------------
  // Duplicate workflow
  // ---------------------------------------------------------------------------
  const duplicateWorkflow = useCallback(
    async (id: number) => {
      if (!token) return;
      try {
        const newWf = await apiService.duplicateWorkflow(id);
        setCurrentWorkflow(newWf);
        setIsDirty(false);
        await loadWorkflows();
        toast.success(i18n.t('toasts:workflow.duplicated'));
      } catch (error) {
        console.error('Failed to duplicate workflow:', error);
        toast.error(i18n.t('toasts:workflow.duplicateFailed'));
      }
    },
    [token, loadWorkflows]
  );

  // ---------------------------------------------------------------------------
  // Close current workflow
  // ---------------------------------------------------------------------------
  const closeWorkflow = useCallback(() => {
    setCurrentWorkflow(null);
    setIsDirty(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Load all data on auth — workflows, saved videos, run history
  useEffect(() => {
    if (isAuthenticated && token) {
      loadWorkflows();
      loadSavedVideos();
      loadRunHistory();
    } else {
      setWorkflows([]);
      setCurrentWorkflow(null);
      setIsDirty(false);
      setSavedVideos([]);
      setRunHistory([]);
    }
  }, [isAuthenticated, token, loadWorkflows, loadSavedVideos, loadRunHistory]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <WorkflowContext.Provider
      value={{
        workflows,
        currentWorkflow,
        isDirty,
        isLoading,
        loadWorkflows,
        createWorkflow,
        loadWorkflow,
        saveWorkflow,
        deleteWorkflow,
        duplicateWorkflow,
        closeWorkflow,
        markDirty,
        setCurrentWorkflow,
        // Preloaded data
        savedVideos,
        loadingSaved,
        runHistory,
        loadingHistory,
        loadSavedVideos,
        loadRunHistory,
        removeSavedVideo,
        removeRunHistoryItem,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
