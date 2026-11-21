import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notice, CategoryId, OperationalStateCode } from '@/types';
import { MOCK_NOTICES } from '@/data/mockNotices';

interface NoticesContextType {
  notices: Notice[];
  selectedCategory: CategoryId;
  setSelectedCategory: (cat: CategoryId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favorites: string[];
  toggleFavorite: (noticeId: string) => void;
  isFavorite: (noticeId: string) => boolean;
  selectedNotice: Notice | null;
  setSelectedNotice: (notice: Notice | null) => void;
  activeEvaluatorState: OperationalStateCode | null;
  setActiveEvaluatorState: (state: OperationalStateCode | null) => void;
}

const NoticesContext = createContext<NoticesContextType | undefined>(undefined);

export const NoticesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notices] = useState<Notice[]>(MOCK_NOTICES);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [activeEvaluatorState, setActiveEvaluatorState] = useState<OperationalStateCode | null>(null);

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
    return ['A-408']; // Guardar por defecto el aviso de cambio de aula
  });

  useEffect(() => {
    localStorage.setItem('utp_favoritos', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (noticeId: string) => {
    setFavorites((prev) =>
      prev.includes(noticeId) ? prev.filter((id) => id !== noticeId) : [...prev, noticeId]
    );
  };

  const isFavorite = (noticeId: string) => favorites.includes(noticeId);

  return (
    <NoticesContext.Provider
      value={{
        notices,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        favorites,
        toggleFavorite,
        isFavorite,
        selectedNotice,
        setSelectedNotice,
        activeEvaluatorState,
        setActiveEvaluatorState,
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
