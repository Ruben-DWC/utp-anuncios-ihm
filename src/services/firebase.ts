import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { Notice } from '@/types';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'utp-anuncios-ihm';

export const isFirebaseConfigured = Boolean(
  apiKey && !apiKey.includes('DummyKey') && projectId && !projectId.includes('Dummy')
);

const firebaseConfig = {
  apiKey: apiKey || 'AIzaSyDummyKeyForMockOfflineDevelopment',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Inicialización defensiva de Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const FIREBASE_PROJECT_ID = projectId;

/**
 * Consulta en vivo la colección pública `/anuncios` de Cloud Firestore
 * con timeout defensivo (3.5s) para garantizar degradación elegante offline.
 */
export async function fetchLiveNoticesFromFirestore(): Promise<Notice[]> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase sin credenciales reales en .env (usando caché local)');
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout conectando con Cloud Firestore')), 3500)
  );

  const queryPromise = (async () => {
    const q = query(collection(db, 'anuncios'), limit(30));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('Colección /anuncios vacía en Firestore');
    }
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: String(data.titulo || ''),
        categoria: data.categoria || 'todos',
        descripcion: String(data.descripcion || ''),
        fecha: String(data.fecha || 'Hoy'),
        hora: data.hora ? String(data.hora) : undefined,
        urgente: Boolean(data.urgente),
        aula: data.aula ? String(data.aula) : undefined,
        pabellon: data.pabellon ? String(data.pabellon) : undefined,
        lsp_disponible: Boolean(data.lsp_disponible),
        cc_disponible: Boolean(data.cc_disponible),
        estado: data.estado === 'cerrado' ? 'cerrado' : 'vigente',
        leido: Boolean(data.leido),
      } as Notice;
    });
  })();

  return Promise.race([queryPromise, timeoutPromise]);
}
