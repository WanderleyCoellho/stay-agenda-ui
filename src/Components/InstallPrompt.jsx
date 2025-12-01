import { useState, useEffect } from 'react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
        setIsInstalled(true);
        return; // Não mostra nada se já é app
    }

    // Detecta Android/Chrome (Evento nativo)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Detecta iOS (Safari)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        setShowIOSPrompt(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Se já instalado, não mostra nada
  if (isInstalled) return null;

  // Se não for mobile nem tiver evento de instalação, esconde
  if (!deferredPrompt && !showIOSPrompt) return null;

  return (
    <div className="fixed-bottom p-3 m-3 bg-white shadow-lg rounded border border-primary" style={{zIndex: 9999}}>
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h6 className="fw-bold text-primary mb-1">Instalar Aplicativo</h6>
                <p className="small text-muted mb-0">Tenha o Stay Agenda na sua tela inicial!</p>
            </div>
            
            {/* Botão Android */}
            {deferredPrompt && (
                <button onClick={handleInstallClick} className="btn btn-primary btn-sm fw-bold">
                    Instalar
                </button>
            )}

            {/* Botão Fechar (X) */}
            {(deferredPrompt || showIOSPrompt) && (
                <button 
                    onClick={() => { setDeferredPrompt(null); setShowIOSPrompt(false); }} 
                    className="btn btn-link text-muted text-decoration-none ms-2"
                >
                    ✕
                </button>
            )}
        </div>

        {/* Instrução iOS */}
        {showIOSPrompt && (
            <div className="mt-2 small bg-light p-2 rounded text-dark">
                Para instalar no iPhone: <br/>
                1. Toque no botão <strong>Compartilhar</strong> <span style={{fontSize:'1.2em'}}>⎋</span><br/>
                2. Selecione <strong>"Adicionar à Tela de Início"</strong> ➕
            </div>
        )}
    </div>
  );
}

export default InstallPrompt;