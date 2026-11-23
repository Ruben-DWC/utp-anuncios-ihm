import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notice, CategoryId, OperationalStateCode } from '@/types';
import { MOCK_NOTICES } from '@/data/mockNotices';
import {
  fetchLiveNoticesFromFirestore,
  isFirebaseConfigured,
  FIREBASE_PROJECT_ID,
} from '@/services/firebase';

export type AccessibilityFilterId = 'all' | 'lsp' | 'cc' | 'urgent';
export type DataSourceStatus = 'firestore' | 'cache';

interface NoticesContextType {
  notices: Notice[];
  selectedCategory: CategoryId;
  setSelectedCategory: (cat: CategoryId) => void;
  accessibilityFilter: AccessibilityFilterId;
  setAccessibilityFilter: (filter: AccessibilityFilterId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favorites: string[];
  toggleFavorite: (noticeId: string) => void;
  isFavorite: (noticeId: string) => boolean;
  readIds: string[];
  markAsRead: (noticeId: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  selectedNotice: Notice | null;
  setSelectedNotice: (notice: Notice | null) => void;
  activeEvaluatorState: OperationalStateCode | null;
  setActiveEvaluatorState: (state: OperationalStateCode | null) => void;
  dataSource: DataSourceStatus;
  isLoadingNotices: boolean;
  lastSyncedAt: string | null;
  firebaseProjectId: string;
  isFirebaseConfigured: boolean;
  refreshNotices: () => Promise<void>;
}

const NoticesContext = createContext<NoticesContextType | undefined>(undefined);

export const NoticesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [dataSource, setDataSource] = useState<DataSourceStatus>('cache');
  const [isLoadingNotices, setIsLoadingNotices] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() =>
    new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  );

  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('todos');
  const [accessibilityFilter, setAccessibilityFilter] = useState<AccessibilityFilterId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [activeEvaluatorState, setActiveEvaluatorState] = useState<OperationalStateCode | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stateParam = params.get('state') || params.get('estado');
      if (stateParam && /^E-(0[1-9]|10)$/.test(stateParam)) {
        return stateParam as OperationalStateCode;
      }
      const evalParam = params.get('evaluator');
      if (evalParam && /^E-(0[1-9]|10)$/.test(evalParam)) {
        return evalParam as OperationalStateCode;
      }
    }
    return null;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('utp_favoritos');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return ['A-408'];
  });

  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('utp_leidos');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fallback
        }
      }
    }
    return ['BECA-2026', 'PAGO-2026'];
  });

  const refreshNotices = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setNotices(MOCK_NOTICES);
      setDataSource('cache');
      setLastSyncedAt(
        new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      );
      return;
    }

    setIsLoadingNotices(true);
    try {
      const liveNotices = await fetchLiveNoticesFromFirestore();
      setNotices(liveNotices);
      setDataSource('firestore');
      setLastSyncedAt(
        new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      setNotices(MOCK_NOTICES);
      setDataSource('cache');
    } finally {
      setIsLoadingNotices(false);
    }
  }, []);

  useEffect(() => {
    refreshNotices();
  }, [refreshNotices]);

  useEffect(() => {
    localStorage.setItem('utp_favoritos', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('utp_leidos', JSON.stringify(readIds));
  }, [readIds]);

  const toggleFavorite = (noticeId: string) => {
    setFavorites((prev) =>
      prev.includes(noticeId) ? prev.filter((id) => id !== noticeId) : [...prev, noticeId]
    );
  };

  const isFavorite = (noticeId: string) => favorites.includes(noticeId);

  const markAsRead = (noticeId: string) => {
    setReadIds((prev) => (prev.includes(noticeId) ? prev : [...prev, noticeId]));
  };

  const markAllAsRead = () => {
    setReadIds(notices.map((n) => n.id));
  };

  const unreadCount = notices.filter((n) => !readIds.includes(n.id)).length;

  return (
    <NoticesContext.Provider
      value={{
        notices,
        selectedCategory,
        setSelectedCategory,
        accessibilityFilter,
        setAccessibilityFilter,
        searchQuery,
        setSearchQuery,
        favorites,
        toggleFavorite,
        isFavorite,
        readIds,
        markAsRead,
        markAllAsRead,
        unreadCount,
        selectedNotice,
        setSelectedNotice,
        activeEvaluatorState,
        setActiveEvaluatorState,
        dataSource,
        isLoadingNotices,
        lastSyncedAt,
        firebaseProjectId: FIREBASE_PROJECT_ID,
        isFirebaseConfigured,
        refreshNotices,
      }}
    >
      {children}
    </NoticesContext.Provider>
  );
};

export const useNotices = (): NoticesContextType => {
  const context = useContext(NoticesContext);
  if (!context) {
    throw new Error('useNotices debe ser utilizado dentro de un NoticesProvider');
  }
  return context;
};
