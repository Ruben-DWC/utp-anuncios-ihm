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
import { Sparkle, BookmarkSimple } from '@phosphor-icons/react';

export const App: React.FC = () => {
  const {
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
  } = useNotices();

  const { triggerSensoryAlert } = useAccessibility();
  const { currentUser, isAuthenticated } = useAuth();

  // Estados de navegación e interfaces secundarias
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [isA11yPanelOpen, setIsA11yPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEvaluatorPanelOpen, setIsEvaluatorPanelOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('evaluator') === 'true' || Boolean(params.get('evaluator'));
    }
    return false;
  });

  // Filtrado de avisos según categoría, búsqueda de texto y pestaña activa
  const filteredNotices = notices.filter((n) => {
    const matchesCategory = selectedCategory === 'todos' || n.categoria === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.aula && n.aula.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.pabellon && n.pabellon.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab !== 'favoritos' || isFavorite(n.id);
    return matchesCategory && matchesSearch && matchesTab;
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
          onTriggerAlert={() => triggerSensoryAlert('urgent')}
          onToggleEvaluator={() => setIsEvaluatorPanelOpen(!isEvaluatorPanelOpen)}
          isEvaluatorActive={isEvaluatorPanelOpen || Boolean(activeEvaluatorState)}
          userName={currentUser?.name || 'Ruben Walter'}
          studentCode={currentUser?.code || 'u22224908'}
        />
      }
      filterBar={
        !activeEvaluatorState && activeTab !== 'perfil' ? (
          <CategoryFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalResults={filteredNotices.length}
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
            className="absolute bottom-20 right-4 z-30 w-14 h-14 bg-utp-red text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-utp-red"
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
      ) : (
        <div className="p-4 pb-24">
          {filteredNotices.length === 0 ? (
            <div className="text-center py-12 px-4 select-none">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <BookmarkSimple size={32} className="text-slate-400" weight="duotone" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1">
                {activeTab === 'favoritos'
                  ? 'No tienes anuncios favoritos guardados'
                  : 'No se encontraron comunicados'}
              </h3>
              <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto leading-relaxed">
                {activeTab === 'favoritos'
                  ? 'Guarda avisos importantes con el icono de marcador para consultarlos sin conexión.'
                  : 'Intenta ajustar tus términos de búsqueda o prueba explorando otra categoría.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('todos');
                  setSearchQuery('');
                  setActiveTab('inicio');
                }}
                className="px-4 py-2.5 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-all active:scale-95"
              >
                Ver todos los anuncios
              </button>
            </div>
          ) : (
            <div className="space-y-3" role="feed" aria-label="Lista de comunicados y avisos institucionales">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  isFavorite={isFavorite(notice.id)}
                  onSelect={setSelectedNotice}
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
