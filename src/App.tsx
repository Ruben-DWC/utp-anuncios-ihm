import React, { useState } from 'react';
import { useNotices } from '@/context/NoticesContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import { useAuth } from '@/context/AuthContext';
import {
  AppShell,
  HeaderBar,
  BottomNavBar,
  TabId,
} from '@/components/layout';
import {
  NoticeCard,
  NoticeDetailModal,
  CategoryFilterBar,
} from '@/components/notices';
import { CatalogStateView } from '@/components/states/CatalogStateView';
import { EvaluatorPanel } from '@/components/states/EvaluatorPanel';
import { AgentChatDrawer } from '@/components/agent/AgentChatDrawer';
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { NotificationsDrawer } from '@/components/notifications/NotificationsDrawer';
import { parseVoiceCommand, speakText, stopSpeaking } from '@/services/voiceCommands';
import { Sparkle } from '@phosphor-icons/react';

export const App: React.FC = () => {
  const {
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
    isLoadingNotices,
  } = useNotices();

  const { triggerSensoryAlert, preferences, toggleHighContrast } = useAccessibility();
  const { currentUser, isAuthenticated } = useAuth();

  // Estados de navegación e interfaces secundarias
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [isA11yPanelOpen, setIsA11yPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [isEvaluatorPanelOpen, setIsEvaluatorPanelOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('evaluator') === 'true' || Boolean(params.get('evaluator'));
    }
    return false;
  });

  // Filtrado de avisos según categoría, accesibilidad, búsqueda de texto y pestaña activa
  const filteredNotices = notices.filter((n) => {
    const matchesCategory = selectedCategory === 'todos' || n.categoria === selectedCategory;
    const matchesA11y =
      accessibilityFilter === 'all' ||
      (accessibilityFilter === 'lsp' && n.lsp_disponible) ||
      (accessibilityFilter === 'cc' && n.cc_disponible) ||
      (accessibilityFilter === 'urgent' && n.urgente);
    const matchesSearch =
      !searchQuery ||
      n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.aula && n.aula.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.pabellon && n.pabellon.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab !== 'favoritos' || isFavorite(n.id);
    return matchesCategory && matchesA11y && matchesSearch && matchesTab;
  });

  const handleTabChange = (tab: any) => {
    const targetTab: TabId = 
      tab === 'categorias' || tab === 'anuncios' ? 'anuncios' : 
      tab === 'favoritos' ? 'favoritos' : 
      tab === 'perfil' ? 'perfil' : 'inicio';
    setActiveTab(targetTab);
    if (activeEvaluatorState) {
      setActiveEvaluatorState(null);
    }
    if (targetTab === 'anuncios' && selectedCategory === 'todos') {
      setSelectedCategory('academico');
    }
  };

  const handleVoiceCommand = (transcript: string) => {
    const action = parseVoiceCommand(transcript);
    setVoiceFeedback(`Voz: ${action.label}`);
    setTimeout(() => setVoiceFeedback(null), 4000);

    switch (action.type) {
      case 'navigate':
        setActiveTab(action.tab);
        break;
      case 'open_tutor':
        setIsChatOpen(true);
        break;
      case 'open_a11y':
        setIsA11yPanelOpen(true);
        break;
      case 'open_notifications':
        setIsNotificationsOpen(true);
        break;
      case 'filter_category':
        setActiveTab('inicio');
        setSelectedCategory(action.category);
        break;
      case 'filter_a11y':
        setActiveTab('inicio');
        setAccessibilityFilter(action.filter);
        break;
      case 'toggle_contrast':
        if (preferences.highContrast !== action.enable) {
          toggleHighContrast();
        }
        break;
      case 'read_aloud': {
        const top = filteredNotices.slice(0, 2);
        const speech =
          top.length > 0
            ? top.map((n, i) => `Aviso ${i + 1}: ${n.titulo}. ${n.descripcion}`).join(' ')
            : 'No hay avisos visibles con el filtro actual.';
        speakText(speech);
        break;
      }
      case 'stop_reading':
        stopSpeaking();
        break;
      case 'search':
        setSearchQuery(action.query);
        break;
    }
  };

  // Si no está autenticado, mostramos la pantalla de inicio de sesión institucional (Figma Frame 02 & Vercel previo)
  if (!isAuthenticated && !activeEvaluatorState) {
    return (
      <AppShell
        header={
          <HeaderBar
            onOpenAccessibility={() => setIsA11yPanelOpen(true)}
            onTriggerAlert={() => triggerSensoryAlert('urgent')}
            onToggleEvaluator={() => setIsEvaluatorPanelOpen(!isEvaluatorPanelOpen)}
            isEvaluatorActive={isEvaluatorPanelOpen}
            userName="Acceso Institucional"
            studentCode="UTP Anuncios"
          />
        }
        sidebar={
          <EvaluatorPanel
            activeState={activeEvaluatorState}
            onSelectState={setActiveEvaluatorState}
            isOpen={isEvaluatorPanelOpen}
            onToggleOpen={() => setIsEvaluatorPanelOpen(!isEvaluatorPanelOpen)}
          />
        }
        modals={
          <AccessibilityPanel
            isOpen={isA11yPanelOpen}
            onClose={() => setIsA11yPanelOpen(false)}
          />
        }
      >
        <LoginScreen onSuccess={() => setActiveTab('inicio')} />
      </AppShell>
    );
  }

  return (
    <AppShell
      header={
        <HeaderBar
          onOpenAccessibility={() => setIsA11yPanelOpen(true)}
          onTriggerAlert={() => setIsNotificationsOpen(true)}
          onToggleEvaluator={() => setIsEvaluatorPanelOpen(!isEvaluatorPanelOpen)}
          isEvaluatorActive={isEvaluatorPanelOpen || Boolean(activeEvaluatorState)}
          userName={currentUser?.name || 'Ruben Walter'}
          studentCode={currentUser?.code || 'u22224908'}
          unreadCount={unreadCount}
        />
      }
      filterBar={
        !activeEvaluatorState && activeTab !== 'perfil' ? (
          <CategoryFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            accessibilityFilter={accessibilityFilter}
            onSelectAccessibilityFilter={setAccessibilityFilter}
            totalResults={filteredNotices.length}
            onVoiceCommand={handleVoiceCommand}
            voiceFeedback={voiceFeedback}
          />
        ) : undefined
      }
      sidebar={
        <EvaluatorPanel
          activeState={activeEvaluatorState}
          onSelectState={setActiveEvaluatorState}
          isOpen={isEvaluatorPanelOpen}
          onToggleOpen={() => setIsEvaluatorPanelOpen(!isEvaluatorPanelOpen)}
        />
      }
      bottomNav={
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          favoritesCount={favorites.length}
        />
      }
      floatingAction={
        activeTab !== 'perfil' && !activeEvaluatorState ? (
          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-20 right-4 z-20 w-14 h-14 bg-utp-red text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-utp-red"
            title="Abrir Tutor IA de Anuncios UTP"
            aria-label="Abrir asistente Tutor IA de Anuncios"
          >
            <Sparkle size={26} weight="fill" className="text-yellow-300" />
          </button>
        ) : undefined
      }
      modals={
        <>
          {/* Modal de Detalle de Anuncio */}
          <NoticeDetailModal
            notice={selectedNotice}
            isOpen={Boolean(selectedNotice)}
            isFavorite={selectedNotice ? isFavorite(selectedNotice.id) : false}
            onClose={() => setSelectedNotice(null)}
            onToggleFavorite={toggleFavorite}
            onConfirmRead={(notice) => {
              toggleFavorite(notice.id);
              setSelectedNotice(null);
              setActiveEvaluatorState('E-10');
            }}
          />

          {/* Drawer del Tutor IA */}
          <AgentChatDrawer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            notices={notices}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setIsChatOpen(false);
            }}
            onSelectNotice={(notice) => {
              setSelectedNotice(notice);
              setIsChatOpen(false);
            }}
            onSaveNotice={(id) => toggleFavorite(id)}
          />

          {/* Panel de Configuración Sensorial y Accesibilidad Inclusiva */}
          <AccessibilityPanel
            isOpen={isA11yPanelOpen}
            onClose={() => setIsA11yPanelOpen(false)}
          />

          {/* Centro de Notificaciones y Preferencias (Figma Frames 17 y 18) */}
          <NotificationsDrawer
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notices={notices}
            readIds={readIds}
            onSelectNotice={(notice) => {
              markAsRead(notice.id);
              setSelectedNotice(notice);
            }}
            onMarkAllAsRead={markAllAsRead}
            onTriggerSensoryTest={() => triggerSensoryAlert('urgent')}
          />
        </>
      }
    >
      {/* Contenido principal según estado operativo, pestaña de perfil o feed */}
      {activeEvaluatorState ? (
        <div className="p-4 pb-24">
          <CatalogStateView
            stateCode={activeEvaluatorState}
            onExit={() => setActiveEvaluatorState(null)}
            onNavigate={handleTabChange}
            onConfigureAlerts={() => setIsA11yPanelOpen(true)}
          />
        </div>
      ) : activeTab === 'perfil' ? (
        <ProfileScreen
          onOpenAccessibility={() => setIsA11yPanelOpen(true)}
          onNavigateToFavorites={() => setActiveTab('favoritos')}
        />
      ) : isLoadingNotices ? (
        <div className="p-4 pb-24">
          <CatalogStateView
            stateCode="E-04"
            onExit={() => {}}
            onNavigate={handleTabChange}
          />
        </div>
      ) : (
        <div className="p-4 pb-24">
          {filteredNotices.length === 0 ? (
            <CatalogStateView
              stateCode={activeTab === 'favoritos' ? 'E-01' : 'E-02'}
              onExit={() => {
                setSelectedCategory('todos');
                setAccessibilityFilter('all');
                setSearchQuery('');
                setActiveTab('inicio');
              }}
              onNavigate={handleTabChange}
            />
          ) : (
            <div className="space-y-3" role="feed" aria-label="Lista de comunicados y avisos institucionales">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  isFavorite={isFavorite(notice.id)}
                  onSelect={(n) => {
                    markAsRead(n.id);
                    setSelectedNotice(n);
                  }}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
};

export default App;
