// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { App as AntApp } from 'antd'; // ← AJOUT : Import App d'Ant Design
import { store, persistor } from './store';
import App from './App';
import './index.css';

// Ajouter un composant de chargement
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ color: '#1890ff' }}>AquaGestion</h1>
      <p>Chargement de l'application...</p>
    </div>
  </div>
);

// Vérifier que l'élément root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Élément #root non trouvé dans le DOM');
}

try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <AntApp> {/* ← AJOUT : Wrapper Ant Design App */}
            <App />
          </AntApp>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Erreur lors du rendu de React:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>Erreur d'initialisation</h2>
      <pre>${error}</pre>
    </div>
  `;
}