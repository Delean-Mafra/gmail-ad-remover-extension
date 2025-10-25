// Popup JavaScript para Gmail Ad Remover
document.addEventListener('DOMContentLoaded', function() {
  const enableToggle = document.getElementById('enableToggle');
  const statusElement = document.getElementById('status');
  const blockedCountElement = document.getElementById('blockedCount');
  const lastScanElement = document.getElementById('lastScan');
  const scanNowBtn = document.getElementById('scanNow');
  const resetStatsBtn = document.getElementById('resetStats');
  const autoRemoveCheckbox = document.getElementById('autoRemove');

  const reportIssueLink = document.getElementById('reportIssue');
  const aboutLink = document.getElementById('about');

  // Carregar estado inicial
  loadSettings();
  loadStats();

  // Event listeners
  enableToggle.addEventListener('change', toggleAdRemover);
  scanNowBtn.addEventListener('click', scanNow);
  resetStatsBtn.addEventListener('click', resetStats);
  autoRemoveCheckbox.addEventListener('change', updateSetting);

  reportIssueLink.addEventListener('click', reportIssue);
  aboutLink.addEventListener('click', showAbout);

  function loadSettings() {
    chrome.storage.sync.get([
      'adRemoverEnabled', 
      'autoRemove'
    ], function(result) {
      const enabled = result.adRemoverEnabled !== false;
      const autoRemove = result.autoRemove !== false;

      enableToggle.checked = enabled;
      autoRemoveCheckbox.checked = autoRemove;

      updateStatus(enabled);
    });
  }

  function loadStats() {
    chrome.storage.sync.get(['blockedAdsCount'], function(result) {
      const count = result.blockedAdsCount || 0;
      blockedCountElement.textContent = count;
    });

    // Tentar obter estatísticas do content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('mail.google.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, function(response) {
          if (chrome.runtime.lastError) {
            console.log('Content script não disponível');
            return;
          }
          if (response && response.stats) {
            if (response.stats.lastScan) {
              lastScanElement.textContent = response.stats.lastScan;
            }
          }
        });
      } else {
        statusElement.textContent = 'Não está no Gmail';
        statusElement.className = 'status-value inactive';
      }
    });
  }

  function updateStatus(enabled) {
    if (enabled) {
      statusElement.textContent = 'Ativo';
      statusElement.className = 'status-value active';
    } else {
      statusElement.textContent = 'Inativo';
      statusElement.className = 'status-value inactive';
    }
  }

  function toggleAdRemover() {
    const enabled = enableToggle.checked;
    
    chrome.storage.sync.set({ adRemoverEnabled: enabled }, function() {
      updateStatus(enabled);
      
      // Enviar mensagem para o content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('mail.google.com')) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleAdRemover' }, function(response) {
            if (chrome.runtime.lastError) {
              console.log('Erro ao comunicar com content script:', chrome.runtime.lastError);
            }
          });
        }
      });
    });
  }

  function scanNow() {
    scanNowBtn.disabled = true;
    scanNowBtn.textContent = 'Verificando...';
    scanNowBtn.classList.add('loading');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('mail.google.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'scanNow' }, function(response) {
          scanNowBtn.disabled = false;
          scanNowBtn.innerHTML = '<span class="btn-icon">🔍</span>Verificar Agora';
          scanNowBtn.classList.remove('loading');

          if (chrome.runtime.lastError) {
            showNotification('Erro ao verificar anúncios', 'error');
            return;
          }

          if (response && response.removedCount !== undefined) {
            showNotification(`${response.removedCount} elementos processados`, 'success');
            loadStats(); // Recarregar estatísticas
          }
        });
      } else {
        scanNowBtn.disabled = false;
        scanNowBtn.innerHTML = '<span class="btn-icon">🔍</span>Verificar Agora';
        scanNowBtn.classList.remove('loading');
        showNotification('Abra o Gmail para usar esta função', 'warning');
      }
    });
  }

  function resetStats() {
    chrome.storage.sync.set({ blockedAdsCount: 0 }, function() {
      blockedCountElement.textContent = '0';
      chrome.action.setBadgeText({ text: '' });
      showNotification('Contadores resetados', 'success');
    });
  }

  function updateSetting(event) {
    const setting = event.target.id;
    const value = event.target.checked;
    
    if (setting === 'autoRemove') {
      chrome.storage.sync.set({ autoRemove: value }, function() {
        console.log('autoRemove atualizado para:', value);
      });
    }
  }

  function reportIssue(event) {
    event.preventDefault();
    const subject = encodeURIComponent('Gmail Ad Remover - Reportar Problema');
    const body = encodeURIComponent(`
Descreva o problema encontrado:

Informações do sistema:
- Navegador: ${navigator.userAgent}
- URL: (cole a URL onde o problema ocorreu)
- Versão da extensão: 1.0.2

Passos para reproduzir:
1. 
2. 
3. 

Comportamento esperado:


Comportamento atual:

    `);
    
    chrome.tabs.create({
      url: `mailto:suporte@example.com?subject=${subject}&body=${body}`
    });
  }

  function showAbout(event) {
    event.preventDefault();
    
    const aboutText = `
Gmail Ad Remover v1.0.2

Uma extensão simples e eficaz para remover anúncios e elementos promocionais do Gmail, proporcionando uma experiência de email mais limpa e focada.

Recursos:
• Remove anúncios automaticamente
• Interface intuitiva de controle
• Estatísticas de bloqueio
• Configurações personalizáveis
• Funciona em tempo real

Esta extensão respeita sua privacidade e não coleta dados pessoais.

Desenvolvido com ❤️ para uma experiência Gmail melhor.

Copyright © Delean Mafra
Todos os direitos reservados
    `;
    
    alert(aboutText);
  }

  function showNotification(message, type = 'info') {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '12px 16px',
      borderRadius: '6px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: '10000',
      maxWidth: '280px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transform: 'translateX(300px)',
      transition: 'transform 0.3s ease'
    });

    // Cores baseadas no tipo
    switch (type) {
      case 'success':
        notification.style.background = '#137333';
        break;
      case 'error':
        notification.style.background = '#d93025';
        break;
      case 'warning':
        notification.style.background = '#f57c00';
        break;
      default:
        notification.style.background = '#1a73e8';
    }

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(300px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Atualizar estatísticas periodicamente
  setInterval(loadStats, 5000);

  // Escutar mudanças no storage
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
      if (changes.blockedAdsCount) {
        blockedCountElement.textContent = changes.blockedAdsCount.newValue || 0;
      }
      if (changes.adRemoverEnabled) {
        enableToggle.checked = changes.adRemoverEnabled.newValue;
        updateStatus(changes.adRemoverEnabled.newValue);
      }
    }
  });
});