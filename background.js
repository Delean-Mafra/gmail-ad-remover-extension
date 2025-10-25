// Background script para gerenciar o estado da extensão
let pendingCount = 0;
let updateTimeout = null;

chrome.runtime.onInstalled.addListener(() => {
  // Definir configurações padrão
  chrome.storage.sync.set({
    adRemoverEnabled: true,
    autoRemove: true,
    showStats: true,
    blockedAdsCount: 0
  });
});

function updateBlockedCountDebounced() {
  // Cancelar timeout anterior se existir
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  // Aguardar 2 segundos antes de atualizar para evitar excesso de escritas
  updateTimeout = setTimeout(() => {
    if (pendingCount > 0) {
      chrome.storage.sync.get(['blockedAdsCount'], (result) => {
        const newCount = (result.blockedAdsCount || 0) + pendingCount;
        chrome.storage.sync.set({ blockedAdsCount: newCount });
        console.log(`Background: Atualizando contador para ${newCount} (incremento: ${pendingCount})`);
        pendingCount = 0; // Reset do contador pendente
      });
    }
  }, 2000);
}

// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'adBlocked') {
    // Incrementar contador pendente em vez de escrever imediatamente
    pendingCount++;
    updateBlockedCountDebounced();
  }
  
  if (request.action === 'getStats') {
    chrome.storage.sync.get(['blockedAdsCount'], (result) => {
      sendResponse({ blockedAdsCount: result.blockedAdsCount || 0 });
    });
    return true; // Indica resposta assíncrona
  }
});

// Atualizar badge com contador de anúncios bloqueados
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.blockedAdsCount) {
    const count = changes.blockedAdsCount.newValue;
    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : ''
    });
    chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
  }
});