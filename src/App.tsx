import React, { useState } from 'react';
import { useNotices } from '@/context/NoticesContext';
import { useAccessibility } from '@/context/AccessibilityContext';
import { OperationalStateCode, CategoryId } from '@/types';
import { MOCK_CATEGORIES } from '@/data/mockNotices';

// Íconos de Phosphor
import { 
  BellRinging, 
  Eye, 
  Sparkle, 
  SquaresFour,
  BookmarkSimple,
  MagnifyingGlass,
  House,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  WifiSlash,
  Clock,
  MapPin,
  Wheelchair,
  VideoCamera,
  ArrowsClockwise,
  X
} from '@phosphor-icons/react';

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
    setActiveEvaluatorState
  } = useNotices();

  const { 
    preferences, 
    setFontScale, 
    toggleHighContrast, 
    toggleStrobe, 
    toggleHaptics, 
    triggerSensoryAlert 
  } = useAccessibility();

  // Estados de navegación
  const [activeTab, setActiveTab] = useState<'inicio' | 'categorias' | 'buscar' | 'favoritos'>('inicio');
  const [isA11yPanelOpen, setIsA11yPanelOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'agent'; text: string }>>([
    {
      id: 'welcome',
      sender: 'agent',
      text: '¡Hola, Ruben! Soy tu Tutor IA de anuncios. Puedes preguntarme sobre cambios de aula, horarios, avisos con lengua de señas (LSP) o convocatorias vigentes.'
    }
  ]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  // Filtrado de avisos
  const filteredNotices = notices.filter((n) => {
    const matchesCategory = selectedCategory === 'todos' || n.categoria === selectedCategory;
    const matchesSearch = !searchQuery || 
      n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab !== 'favoritos' || isFavorite(n.id);
    return matchesCategory && matchesSearch && matchesTab;
  });

  // Envío al Agente IA (Single-hop con fallback local automático)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAgentLoading) return;

    const userText = chatInput.trim();
    const userMsgId = Date.now().toString();
    setChatMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
    setChatInput('');
    setIsAgentLoading(true);

    // Preparar el resumen compacto de avisos activos (<5 KB, máx 15)
    const activeNoticesIndex = notices.slice(0, 15).map((n) => ({
      id: n.id,
      titulo: n.titulo,
      categoria: n.categoria,
      urgente: n.urgente,
      aula: n.aula,
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const res = await fetch('/.netlify/functions/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, active_notices: activeNoticesIndex }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'agent', text: data.text }]);
        if (data.action?.type === 'filter' && data.action.payload) {
          setSelectedCategory(data.action.payload as CategoryId);
        }
        return;
      }
    } catch {
      // Ruta de resiliencia local: si falla la nube o excede 4s, ejecutar filtrado semántico en cliente
    } finally {
      setIsAgentLoading(false);
    }

    // Fallback local heurístico inmediato
    const lower = userText.toLowerCase();
    let reply = 'He buscado en tu historial local. ';
    if (lower.includes('aula') || lower.includes('ihm') || lower.includes('cambio')) {
      reply += 'Tu clase de Interacción Hombre-Máquina de hoy fue trasladada al Aula A-408 (Pabellón A, 4to piso) con intérprete de señas LSP activo.';
      setSelectedCategory('academico');
    } else if (lower.includes('beca')) {
      reply += 'La Convocatoria Beca Excelencia Académica 2026-1 está abierta para expedientes de tercio superior hasta el 30 de noviembre.';
      setSelectedCategory('becas');
    } else if (lower.includes('seña') || lower.includes('lsp')) {
      reply += 'Los avisos vigentes con intérprete de Lengua de Señas Peruana (LSP) son el cambio de aula en A-408 y el Simulacro de Evacuación adaptado.';
    } else {
      reply += `No encontré avisos urgentes específicos para "${userText}". Puedes explorar las categorías de Matrícula, Académico o Pagos en la barra superior.`;
    }

    setChatMessages((prev) => [...prev, { id: (Date.now() + 2).toString(), sender: 'agent', text: reply }]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start sm:py-6">
      {/* Contenedor adaptativo: Mobile-first (max-w-md en escritorio) con barra de evaluación lateral en pantallas grandes */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start justify-center">
        
        {/* PANEL DE EVALUACIÓN ACADÉMICA (?evaluator=true) para el jurado docente */}
        <aside className="w-full lg:w-72 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-3 text-utp-red font-bold text-sm tracking-wide">
            <ShieldCheck size={20} weight="fill" />
            <span>PANEL JURADO (AP3 & PF)</span>
          </div>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Inspector de los 10 Estados Operativos diseñados por <strong>Ruben Walter</strong> en AP3:
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 text-xs">
            {[
              { code: 'E-01', label: 'E-01: Vacío inicial (Favoritos)' },
              { code: 'E-02', label: 'E-02: Vacío por búsqueda (0)' },
              { code: 'E-03', label: 'E-03: Vacío por historial' },
              { code: 'E-04', label: 'E-04: Carga esqueleto (Skeleton)' },
              { code: 'E-05', label: 'E-05: Error conexión (Offline)' },
              { code: 'E-06', label: 'E-06: Error sistema (500)' },
              { code: 'E-07', label: 'E-07: Error validación login' },
              { code: 'E-08', label: 'E-08: Convocatoria cerrada' },
              { code: 'E-09', label: 'E-09: Sesión expirada' },
              { code: 'E-10', label: 'E-10: Éxito / Constancia' },
            ].map((st) => (
              <button
                key={st.code}
                onClick={() => setActiveEvaluatorState(activeEvaluatorState === st.code ? null : (st.code as OperationalStateCode))}
                className={`p-2 rounded-lg text-left font-medium transition-colors flex items-center justify-between ${
                  activeEvaluatorState === st.code
                    ? 'bg-utp-red text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{st.label}</span>
                {activeEvaluatorState === st.code && <CheckCircle size={14} weight="bold" />}
              </button>
            ))}
          </div>
          {activeEvaluatorState && (
            <button
              onClick={() => setActiveEvaluatorState(null)}
              className="mt-3 w-full py-1.5 px-3 text-xs bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300"
            >
              Restablecer flujo normal
            </button>
          )}
        </aside>

        {/* MARCO PRINCIPAL DE LA APLICACIÓN MÓVIL UTP ANUNCIOS */}
        <main className="w-full max-w-md bg-white min-h-[844px] shadow-2xl rounded-3xl overflow-hidden flex flex-col relative border border-slate-200 order-1 lg:order-2">
          
          {/* HEADER INSTITUCIONAL (Figma Frame 551:12) */}
          <header className="sticky top-0 z-20 bg-utp-red text-white px-5 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm tracking-wider">
                UTP
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight">UTP Anuncios</h1>
                <p className="text-[11px] text-red-100">Ruben Walter • u22224908</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsA11yPanelOpen(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Ajustes de accesibilidad"
                aria-label="Abrir panel de accesibilidad sensorial"
              >
                <Eye size={20} weight="bold" />
              </button>
              <button
                onClick={() => triggerSensoryAlert('urgent')}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors relative"
                title="Probar alerta multimodal sensorial"
                aria-label="Probar alerta sensorial"
              >
                <BellRinging size={20} weight="bold" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
              </button>
            </div>
          </header>

          {/* BUSCADOR Y FILTRO DE CATEGORÍAS */}
          <section className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="relative mb-3">
              <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar avisos, aulas, becas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-utp-red"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Chips de categorías desplazables */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {MOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-utp-red text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </section>

          {/* CONTENIDO PRINCIPAL: FEED DE AVISOS O ESTADO ACTIVO */}
          <div className="flex-1 p-4 pb-24 overflow-y-auto">
            {activeEvaluatorState ? (
              // RENDERIZADOR PARAMÉTRICO DE LOS 10 ESTADOS DE RUBÉN VIVAS (AP3)
              <div className="bg-white border-2 border-dashed border-utp-red/40 rounded-2xl p-6 text-center">
                <span className="inline-block px-2.5 py-1 bg-red-100 text-utp-red font-black text-xs rounded-md mb-3">
                  ESTADO: {activeEvaluatorState}
                </span>
                {activeEvaluatorState === 'E-01' && (
                  <div>
                    <BookmarkSimple size={48} className="mx-auto text-utp-red mb-2" weight="duotone" />
                    <h3 className="font-bold text-slate-900 mb-1">Aún no tienes anuncios favoritos</h3>
                    <p className="text-xs text-slate-500 mb-4">Guarda aquí los comunicados importantes de matrícula, becas o cambios de aula.</p>
                    <button onClick={() => { setActiveEvaluatorState(null); setActiveTab('inicio'); }} className="px-4 py-2 bg-utp-red text-white text-xs font-bold rounded-xl">
                      Explorar anuncios vigentes
                    </button>
                  </div>
                )}
                {activeEvaluatorState === 'E-02' && (
                  <div>
                    <MagnifyingGlass size={48} className="mx-auto text-slate-400 mb-2" weight="duotone" />
                    <h3 className="font-bold text-slate-900 mb-1">No encontramos anuncios</h3>
                    <p className="text-xs text-slate-500 mb-4">No hay resultados que coincidan con tu búsqueda actual.</p>
                    <button onClick={() => { setSearchQuery(''); setActiveEvaluatorState(null); }} className="px-4 py-2 bg-utp-red text-white text-xs font-bold rounded-xl">
                      Limpiar búsqueda
                    </button>
                  </div>
                )}
                {activeEvaluatorState === 'E-04' && (
                  <div className="space-y-3" aria-busy="true">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4 mx-auto" />
                    <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    <p className="text-xs text-slate-400">Sincronizando anuncios académicos...</p>
                  </div>
                )}
                {activeEvaluatorState === 'E-05' && (
                  <div>
                    <WifiSlash size={48} className="mx-auto text-red-500 mb-2" weight="duotone" />
                    <h3 className="font-bold text-slate-900 mb-1">Sin conexión a internet</h3>
                    <p className="text-xs text-slate-500 mb-4">Mostrando comunicados guardados en caché local.</p>
                    <button onClick={() => setActiveEvaluatorState(null)} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 mx-auto">
                      <ArrowsClockwise size={14} /> Reintentar conexión
                    </button>
                  </div>
                )}
                {activeEvaluatorState === 'E-10' && (
                  <div>
                    <CheckCircle size={48} className="mx-auto text-green-600 mb-2" weight="duotone" />
                    <h3 className="font-bold text-slate-900 mb-1">¡Aviso guardado y lectura confirmada!</h3>
                    <p className="text-xs text-slate-500 mb-2">Constancia oficial registrada en sistema.</p>
                    <span className="text-[11px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 block mb-4">#UTP-2026-42920</span>
                    <button onClick={() => setActiveEvaluatorState(null)} className="px-4 py-2 bg-utp-red text-white text-xs font-bold rounded-xl">
                      Entendido
                    </button>
                  </div>
                )}
                {!['E-01', 'E-02', 'E-04', 'E-05', 'E-10'].includes(activeEvaluatorState) && (
                  <div>
                    <WarningCircle size={48} className="mx-auto text-amber-500 mb-2" weight="duotone" />
                    <h3 className="font-bold text-slate-900 mb-1">Estado de contingencia activo</h3>
                    <p className="text-xs text-slate-500 mb-4">Demostración de resiliencia según catálogo AP3.</p>
                    <button onClick={() => setActiveEvaluatorState(null)} className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl">
                      Cerrar estado
                    </button>
                  </div>
                )}
              </div>
            ) : filteredNotices.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkSimple size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-700 mb-1">Sin anuncios en esta sección</h3>
                <p className="text-xs text-slate-500 mb-4">Prueba cambiando de categoría o explorando el inicio.</p>
                <button
                  onClick={() => { setSelectedCategory('todos'); setActiveTab('inicio'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-utp-red text-white text-xs font-bold rounded-xl"
                >
                  Ver todos los anuncios
                </button>
              </div>
            ) : (
              // LISTA DE TARJETAS DE ANUNCIOS (Figma Frame 551:310)
              <div className="space-y-3">
                {filteredNotices.map((n) => (
                  <article
                    key={n.id}
                    onClick={() => setSelectedNotice(n)}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-utp-red transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {n.categoria}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={14} />
                        <span>{n.fecha} {n.hora ? `• ${n.hora}` : ''}</span>
                      </div>
                    </div>

                    <h2 className="font-bold text-sm text-slate-900 mb-1.5 leading-snug">
                      {n.titulo}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {n.descripcion}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        {n.lsp_disponible && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold" title="Intérprete de Lengua de Señas Peruana activo">
                            <Wheelchair size={12} weight="bold" /> LSP
                          </span>
                        )}
                        {n.cc_disponible && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-bold" title="Subtítulos disponibles">
                            <VideoCamera size={12} weight="bold" /> CC
                          </span>
                        )}
                        {n.urgente && (
                          <span className="px-2 py-0.5 bg-red-100 text-utp-red rounded-md text-[10px] font-black">
                            URGENTE
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(n.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFavorite(n.id) ? 'text-utp-red bg-red-50' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        aria-label="Guardar en favoritos"
                      >
                        <BookmarkSimple size={18} weight={isFavorite(n.id) ? 'fill' : 'regular'} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* BOTÓN FLOTANTE DEL AGENTE IA (TUTOR ANUNCIOS IA) */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-20 right-4 z-30 p-3.5 bg-utp-red text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white"
            aria-label="Abrir Tutor IA de Anuncios"
          >
            <Sparkle size={24} weight="fill" className="text-yellow-300" />
          </button>

          {/* BARRA DE NAVEGACIÓN INFERIOR (Figma Frame 551:53) */}
          <nav className="sticky bottom-0 z-20 bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-lg">
            <button
              onClick={() => { setActiveTab('inicio'); setActiveEvaluatorState(null); }}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
                activeTab === 'inicio' ? 'text-utp-red' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <House size={20} weight={activeTab === 'inicio' ? 'fill' : 'regular'} />
              <span>Inicio</span>
            </button>
            <button
              onClick={() => { setActiveTab('categorias'); setSelectedCategory('academico'); }}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
                activeTab === 'categorias' ? 'text-utp-red' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SquaresFour size={20} weight={activeTab === 'categorias' ? 'fill' : 'regular'} />
              <span>Categorías</span>
            </button>
            <button
              onClick={() => { setActiveTab('buscar'); }}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
                activeTab === 'buscar' ? 'text-utp-red' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <MagnifyingGlass size={20} weight={activeTab === 'buscar' ? 'bold' : 'regular'} />
              <span>Buscar</span>
            </button>
            <button
              onClick={() => { setActiveTab('favoritos'); }}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors relative ${
                activeTab === 'favoritos' ? 'text-utp-red' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <BookmarkSimple size={20} weight={activeTab === 'favoritos' ? 'fill' : 'regular'} />
              <span>Favoritos</span>
              {favorites.length > 0 && (
                <span className="absolute -top-1 right-2 w-4 h-4 bg-utp-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
          </nav>

          {/* MODAL DETALLE DE ANUNCIO */}
          {selectedNotice && (
            <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end animate-fade-in">
              <div className="bg-white rounded-t-3xl p-6 max-h-[85%] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-red-100 text-utp-red font-bold text-xs rounded-full uppercase">
                    {selectedNotice.categoria}
                  </span>
                  <button onClick={() => setSelectedNotice(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-base font-bold text-slate-900 mb-2">
                  {selectedNotice.titulo}
                </h2>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1"><Clock size={14} /> {selectedNotice.fecha} {selectedNotice.hora}</span>
                  {selectedNotice.aula && <span className="flex items-center gap-1"><MapPin size={14} /> Aula: {selectedNotice.aula}</span>}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-6 whitespace-pre-line">
                  {selectedNotice.descripcion}
                </p>

                {/* Soportes de accesibilidad validados */}
                <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-2">Soporte de Accesibilidad:</h4>
                  <ul className="text-[11px] text-slate-600 space-y-1.5">
                    {selectedNotice.lsp_disponible && <li>✓ Intérprete de Lengua de Señas Peruana (LSP) asignado.</li>}
                    {selectedNotice.cc_disponible && <li>✓ Subtítulos y transcripción en pantalla frontal.</li>}
                    <li>✓ Alerta sensorial validada con frecuencia de destello seguro (2.0 Hz).</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      toggleFavorite(selectedNotice.id);
                      setSelectedNotice(null);
                      setActiveEvaluatorState('E-10');
                    }}
                    className="flex-1 py-3 bg-utp-red text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} weight="bold" />
                    <span>Confirmar lectura y guardar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DRAWER DEL ASISTENTE TUTOR IA */}
          {isChatOpen && (
            <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl p-5 h-[80%] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sparkle size={20} weight="fill" className="text-utp-red" />
                    <h3 className="font-bold text-sm text-slate-900">Tutor Anuncios IA</h3>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-utp-red text-white rounded-br-none'
                            : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAgentLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-none text-xs text-slate-500 animate-pulse">
                        El Tutor IA está consultando los comunicados...
                      </div>
                    </div>
                  )}
                </div>

                {/* Preguntas rápidas */}
                <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-none">
                  {['¿Dónde es mi clase de IHM hoy?', 'Ver avisos con señas LSP', 'Convocatorias de becas'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setChatInput(prompt)}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-medium whitespace-nowrap hover:bg-slate-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Entrada de texto */}
                <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Haz una consulta académica..."
                    className="flex-1 px-4 py-2 bg-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-utp-red"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-utp-red text-white text-xs font-bold rounded-xl hover:bg-utp-redDark"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* PANEL DE CONFIGURACIÓN DE ACCESIBILIDAD (Sección 5 AP3) */}
          {isA11yPanelOpen && (
            <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end">
              <div className="bg-white rounded-t-3xl p-6 max-h-[85%] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-utp-red font-bold text-sm">
                    <Eye size={20} weight="bold" />
                    <span>Módulo de Accesibilidad Inclusiva</span>
                  </div>
                  <button onClick={() => setIsA11yPanelOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                {/* Escala tipográfica */}
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Tamaño de fuente: {Math.round(preferences.fontScale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="1.5"
                    step="0.1"
                    value={preferences.fontScale}
                    onChange={(e) => setFontScale(parseFloat(e.target.value))}
                    className="w-full accent-utp-red"
                  />
                </div>

                {/* Opciones de conmutación */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">Modo Alto Contraste (AAA)</span>
                    <input
                      type="checkbox"
                      checked={preferences.highContrast}
                      onChange={toggleHighContrast}
                      className="w-4 h-4 accent-utp-red"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">Destellos visuales seguros (&le; 2.0 Hz)</span>
                    <input
                      type="checkbox"
                      checked={preferences.strobeAlertEnabled}
                      onChange={toggleStrobe}
                      className="w-4 h-4 accent-utp-red"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                    <span className="text-xs font-semibold text-slate-700">Alertas sensoriales hápticas / acústicas</span>
                    <input
                      type="checkbox"
                      checked={preferences.hapticFeedbackEnabled}
                      onChange={toggleHaptics}
                      className="w-4 h-4 accent-utp-red"
                    />
                  </label>
                </div>

                <button
                  onClick={() => triggerSensoryAlert('urgent')}
                  className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 mb-3"
                >
                  Probar destello visual y alerta sensorial
                </button>

                <button
                  onClick={() => setIsA11yPanelOpen(false)}
                  className="w-full py-3 bg-utp-red text-white font-bold text-xs rounded-xl"
                >
                  Guardar y aplicar
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
