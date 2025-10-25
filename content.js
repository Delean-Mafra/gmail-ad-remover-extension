// Gmail Ad Remover - Content Script (Versão Segura)
(function () {
  'use strict';

  // CONFIGURAÇÃO
  const ALLOWED_HOST = 'mail.google.com';
  const ALLOWED_INDICATORS = ['/mail', '/u/', '#inbox', '#sent', '#drafts', '#all', '#spam', '#trash'];

  // Configurações da extensão
  let config = {
    enabled: true,
    autoRemove: true,
    showStats: true
  };

  // Estatísticas
  let stats = {
    adsRemoved: 0,
    lastScan: null
  };

  // CHECAGENS INICIAIS
  function isOnAllowedHost() {
    return window.location.hostname === ALLOWED_HOST;
  }

  function hasAllowedPath() {
    const href = window.location.href;
    return ALLOWED_INDICATORS.some(ind => href.includes(ind));
  }

  if (!isOnAllowedHost() || !hasAllowedPath()) {
    console.log('Gmail Ad Remover: Não está no Gmail, extensão não ativada.');
    return;
  }

  // =========================
  // Seletores ESPECÍFICOS de anúncios do Gmail
  // Seletores muito conservadores para evitar falsos positivos
  // =========================
  const AD_SELECTORS = [
    // Anúncios explícitos na sidebar direita (mais seguros)
    'div[role="complementary"] div[data-adunit-path]',
    'div[aria-label="Anúncio"]',
    'div[aria-label="Advertisement"]',
    'div[aria-label="Publicidade"]',
    'div[aria-label*="Sponsored"]',
    
    // Banners claramente identificados como anúncios
    'div[data-testid*="ad"]',
    'div[id*="advertisement"]',
    'div[class*="advertisement"]',
    
    // Elementos com texto explícito de anúncio
    'div:has(span:contains("Anúncio"))',
    'div:has(span:contains("Advertisement"))',
    'div:has(span:contains("Sponsored"))'
  ];

  // Seletores para elementos promocionais MUITO específicos
  const PROMOTIONAL_SELECTORS = [
    // Apenas elementos com indicadores claros de promoção
    'div[aria-label*="Promoção"]',
    'div[aria-label*="Promotion"]',
    'div[data-tooltip="Promoção"]',
    'div[data-tooltip="Promotion"]'
  ];

  // Seletores ESPECÍFICOS para emails patrocinados no Gmail
  const SPONSORED_EMAIL_SELECTORS = [
    // Seletor direto para as classes identificadas pelo usuário
    'span.bGY.FFM8Yd',
    
    // Seletores mais específicos para elementos com texto "Patrocinado"
    'span[class*="bGY"]',
    'span[class*="FFM8Yd"]'
  ];

  // Seletores ESPECÍFICOS para o banner do Google Workspace
  const GOOGLE_WORKSPACE_BANNER_SELECTORS = [
    // Seletor específico para a div de dica do Google Workspace
    'div.GR[role="region"][aria-label="Dica da Caixa de entrada"]',
    
    // Seletor alternativo caso a classe mude
    'div[role="region"][aria-label="Dica da Caixa de entrada"][jscontroller="BtfQ0"]',
    
    // Seletor por conteúdo (Google Workspace)
    'div.GR:has(button:contains("Testar o Google Workspace"))',
    'div.GR:has(button:contains("Google Workspace"))'
  ];

  // =========================
  // Funções utilitárias
  // =========================
  function waitFor(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector);
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        reject(new Error('Timeout waiting for selector: ' + selector));
      }, timeout);
    });
  }

  function loadConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['adRemoverEnabled', 'autoRemove', 'showStats'], (result) => {
        config = {
          enabled: result.adRemoverEnabled !== false,
          autoRemove: result.autoRemove !== false,
          showStats: result.showStats !== false
        };
        resolve(config);
      });
    });
  }

  function reportAdBlocked() {
    stats.adsRemoved++;
    chrome.runtime.sendMessage({ action: 'adBlocked' });
  }

  // =========================
  // Funções de remoção de anúncios
  // =========================
  function removeAds() {
    if (!config.enabled) return;

    let removedCount = 0;
    stats.lastScan = new Date().toLocaleTimeString();

    // NOVO: Remover banner do Google Workspace (SEMPRE, independente de outras configs)
    removeGoogleWorkspaceBanner();

    // Remover apenas anúncios CLARAMENTE identificados
    AD_SELECTORS.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Verificação MUITO rigorosa para confirmar que é anúncio
          if (isDefinitelyAd(element)) {
            element.style.display = 'none';
            element.setAttribute('data-gmail-ad-remover', 'hidden');
            removedCount++;
            reportAdBlocked();
            console.log('Gmail Ad Remover: Anúncio removido:', element);
          }
        });
      } catch (e) {
        console.debug('Gmail Ad Remover: Erro ao processar seletor', selector, e);
      }
    });

    // Processar elementos promocionais com ainda mais cuidado
    PROMOTIONAL_SELECTORS.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (isDefinitelyPromotional(element)) {
            // Apenas diminuir a opacidade, NUNCA esconder completamente
            element.style.opacity = '0.6';
            element.style.filter = 'grayscale(30%)';
            element.setAttribute('data-gmail-ad-remover', 'promotional');
            removedCount++;
            console.log('Gmail Ad Remover: Elemento promocional atenuado:', element);
          }
        });
      } catch (e) {
        console.debug('Gmail Ad Remover: Erro ao processar elementos promocionais', selector, e);
      }
    });

    // Processar emails patrocinados específicos (NOVO) - Usar lixeira
    SPONSORED_EMAIL_SELECTORS.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (isSponsoredEmail(element)) {
            // Encontrar a linha do email (tr.zA) que contém este elemento
            const emailRow = element.closest('tr.zA') || element.closest('tr');
            if (emailRow && !emailRow.hasAttribute('data-gmail-ad-remover-processed')) {
              // Marcar como processado para evitar processamento duplo
              emailRow.setAttribute('data-gmail-ad-remover-processed', 'true');
              
              // Tentar clicar na lixeira primeiro
              const deleted = clickDeleteButtonForSponsoredEmail(emailRow);
              
              if (deleted) {
                removedCount++;
                reportAdBlocked();
                console.log('Gmail Ad Remover: Email patrocinado excluído via lixeira:', emailRow);
              } else {
                // Fallback: esconder se não conseguir excluir
                emailRow.style.display = 'none';
                emailRow.setAttribute('data-gmail-ad-remover', 'sponsored-email');
                removedCount++;
                reportAdBlocked();
                console.log('Gmail Ad Remover: Email patrocinado ocultado (fallback):', emailRow);
              }
            }
          }
        });
      } catch (e) {
        console.debug('Gmail Ad Remover: Erro ao processar emails patrocinados', selector, e);
      }
    });

    if (removedCount > 0) {
      console.log(`Gmail Ad Remover: ${removedCount} elementos processados`);
    }

    return removedCount;
  }

  function isDefinitelyAd(element) {
    // Verificações EXTREMAMENTE rigorosas para confirmar que é um anúncio
    const text = (element.textContent || '').toLowerCase();
    const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
    
    // Palavras-chave EXPLÍCITAS de anúncios (mais restritivas)
    const definiteAdKeywords = [
      'advertisement', 'anúncio', 'sponsored', 'publicidade'
    ];
    
    // Deve ter pelo menos UMA dessas condições muito específicas:
    const hasExplicitAdText = definiteAdKeywords.some(keyword => 
      text.includes(keyword) || ariaLabel.includes(keyword)
    );
    
    const hasAdUnitPath = element.hasAttribute('data-adunit-path');
    const hasAdTestId = element.hasAttribute('data-testid') && 
      element.getAttribute('data-testid').includes('ad');
    
    // Verificar se está em área de anúncios conhecida (sidebar)
    const isInAdArea = element.closest('div[role="complementary"]') !== null;
    
    // NUNCA remover se estiver na área principal de emails
    const isInMainEmailArea = element.closest('div[role="main"]') !== null;
    if (isInMainEmailArea) {
      return false; // NUNCA remover elementos da área principal
    }
    
    // Só considera anúncio se tiver indicadores MUITO claros
    return (hasExplicitAdText && isInAdArea) || hasAdUnitPath || hasAdTestId;
  }

  function isDefinitelyPromotional(element) {
    // Verificações para elementos promocionais (ainda mais conservadoras)
    const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
    const tooltip = (element.getAttribute('data-tooltip') || '').toLowerCase();
    
    // Só considera promocional se tiver labels EXPLÍCITOS
    const hasExplicitPromotionLabel = 
      ariaLabel.includes('promoção') || ariaLabel.includes('promotion') ||
      tooltip === 'promoção' || tooltip === 'promotion';
    
    // NUNCA processar emails na área principal
    const isInMainEmailArea = element.closest('div[role="main"]') !== null;
    if (isInMainEmailArea) {
      return false; // SEGURANÇA: nunca mexer em emails principais
    }
    
    return hasExplicitPromotionLabel;
  }

  function isSponsoredEmail(element) {
    // Verificações para identificar emails patrocinados
    const text = (element.textContent || '').toLowerCase();
    const className = element.className || '';
    
    // Verificar se tem as classes específicas identificadas pelo usuário
    const hasTargetClasses = className.includes('bGY') && className.includes('FFM8Yd');
    
    // Verificar se contém texto de patrocínio
    const hasSponsoredText = text.includes('patrocinado') || 
                            text.includes('sponsored') || 
                            text.includes('publicidade');
    
    // Verificar se está na área principal de emails (onde os patrocinados aparecem)
    const isInMainEmailArea = element.closest('div[role="main"]') !== null;
    
    // Para emails patrocinados, queremos processar APENAS na área principal
    // (diferente dos anúncios da sidebar)
    if (!isInMainEmailArea) {
      return false;
    }
    
    // Só considera email patrocinado se tiver as classes específicas E o texto
    return hasTargetClasses && hasSponsoredText;
  }

  function removeGoogleWorkspaceBanner() {
    // Função específica para remover o banner de anúncio do Google Workspace
    // Esta função remove completamente a div da página (delete permanente)
    
    let removedBanners = 0;
    
    GOOGLE_WORKSPACE_BANNER_SELECTORS.forEach(selector => {
      try {
        const banners = document.querySelectorAll(selector);
        banners.forEach(banner => {
          // Verificações adicionais para garantir que é o banner correto
          if (isGoogleWorkspaceBanner(banner)) {
            // REMOVER COMPLETAMENTE do DOM (delete)
            banner.remove();
            removedBanners++;
            reportAdBlocked();
            console.log('Gmail Ad Remover: Banner do Google Workspace removido:', banner);
          }
        });
      } catch (e) {
        console.debug('Gmail Ad Remover: Erro ao processar banner do Google Workspace', selector, e);
      }
    });
    
    // Verificação adicional por texto específico (fallback)
    try {
      const allDivs = document.querySelectorAll('div.GR[role="region"]');
      allDivs.forEach(div => {
        const text = div.textContent || '';
        if (text.includes('Google Workspace') || 
            text.includes('Testar o Google Workspace') ||
            text.includes('@sua-empresa.com')) {
          if (!div.hasAttribute('data-workspace-banner-removed')) {
            div.remove();
            div.setAttribute('data-workspace-banner-removed', 'true');
            removedBanners++;
            reportAdBlocked();
            console.log('Gmail Ad Remover: Banner do Google Workspace removido (fallback por texto)');
          }
        }
      });
    } catch (e) {
      console.debug('Gmail Ad Remover: Erro na verificação fallback de banner', e);
    }
    
    if (removedBanners > 0) {
      console.log(`Gmail Ad Remover: ${removedBanners} banner(s) do Google Workspace removido(s)`);
    }
    
    return removedBanners;
  }

  function isGoogleWorkspaceBanner(element) {
    // Verificações rigorosas para confirmar que é o banner do Google Workspace
    const text = (element.textContent || '').toLowerCase();
    const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
    const className = element.className || '';
    
    // Verificar se tem a classe específica
    const hasGRClass = className.includes('GR');
    
    // Verificar se tem o aria-label específico
    const hasTipLabel = ariaLabel.includes('dica da caixa de entrada') || 
                        ariaLabel.includes('inbox tip');
    
    // Verificar se contém texto do Google Workspace
    const hasWorkspaceText = text.includes('google workspace') ||
                            text.includes('testar o google workspace') ||
                            text.includes('@sua-empresa.com') ||
                            text.includes('e-mail profissional');
    
    // Verificar se tem botão "Dispensar" ou "Testar"
    const hasButtons = element.querySelector('button') !== null;
    const buttonText = Array.from(element.querySelectorAll('button'))
      .map(btn => (btn.textContent || '').toLowerCase());
    const hasWorkspaceButtons = buttonText.some(txt => 
      txt.includes('testar o google workspace') || 
      txt.includes('dispensar')
    );
    
    // É o banner se atender a múltiplos critérios
    return hasGRClass && (hasTipLabel || hasWorkspaceText) && hasButtons && hasWorkspaceButtons;
  }

  function clickDeleteButtonForSponsoredEmail(emailRow) {
    // Procurar pelo botão de exclusão específico dos emails patrocinados
    const deleteButton = emailRow.querySelector('li.bqX.bru[data-tooltip="Excluir"]');
    
    if (deleteButton) {
      try {
        // Simular clique no botão de exclusão
        deleteButton.click();
        console.log('Gmail Ad Remover: Clique na lixeira do email patrocinado executado');
        return true;
      } catch (e) {
        console.debug('Gmail Ad Remover: Erro ao clicar na lixeira:', e);
        return false;
      }
    }
    
    return false;
  }

  function restoreAds() {
    // Restaurar elementos escondidos
    const hiddenElements = document.querySelectorAll('[data-gmail-ad-remover="hidden"]');
    hiddenElements.forEach(element => {
      element.style.display = '';
      element.removeAttribute('data-gmail-ad-remover');
    });

    // Restaurar elementos promocionais
    const promotionalElements = document.querySelectorAll('[data-gmail-ad-remover="promotional"]');
    promotionalElements.forEach(element => {
      element.style.opacity = '';
      element.style.filter = '';
      element.removeAttribute('data-gmail-ad-remover');
    });

    // Restaurar emails patrocinados
    const sponsoredEmails = document.querySelectorAll('[data-gmail-ad-remover="sponsored-email"]');
    sponsoredEmails.forEach(element => {
      element.style.display = '';
      element.removeAttribute('data-gmail-ad-remover');
    });

    console.log('Gmail Ad Remover: Anúncios e emails patrocinados restaurados');
  }

  // =========================
  // Observadores e inicialização
  // =========================
  function createObserver() {
    const observer = new MutationObserver((mutations) => {
      if (!config.enabled || !config.autoRemove) return;

      let shouldScan = false;
      let shouldCheckWorkspaceBanner = false;
      
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          const target = mutation.target;
          const isInMainArea = target.closest && target.closest('div[role="main"]');
          
          // Verificar anúncios na sidebar (como antes)
          if (!isInMainArea) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches && AD_SELECTORS.some(selector => {
                  try { return node.matches(selector); } catch { return false; }
                })) {
                  shouldScan = true;
                  break;
                }
                
                // NOVO: Verificar se é o banner do Google Workspace
                if (node.matches && (
                  node.matches('div.GR[role="region"]') ||
                  (node.querySelector && node.querySelector('div.GR[role="region"]'))
                )) {
                  shouldCheckWorkspaceBanner = true;
                }
              }
            }
          }
          
          // NOVO: Verificar emails patrocinados na área principal
          if (isInMainArea) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Verificar se é uma linha de email que pode conter patrocínio
                if ((node.matches && node.matches('tr.zA')) || 
                    (node.querySelector && node.querySelector('span.bGY.FFM8Yd'))) {
                  shouldScan = true;
                  break;
                }
              }
            }
          }
        }
        if (shouldScan && shouldCheckWorkspaceBanner) break;
      }

      // Remover banner do Google Workspace imediatamente se detectado
      if (shouldCheckWorkspaceBanner) {
        removeGoogleWorkspaceBanner();
      }

      if (shouldScan) {
        // Debounce: esperar um pouco antes de escanear
        clearTimeout(window.gmailAdRemoverTimeout);
        window.gmailAdRemoverTimeout = setTimeout(removeAds, 1000);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  // Função do botão flutuante removida conforme solicitado pelo usuário

  // =========================
  // Inicialização principal
  // =========================
  async function init() {
    console.log('Gmail Ad Remover: Inicializando...');

    // Carregar configurações
    await loadConfig();

    try {
      // Esperar o Gmail carregar
      await waitFor('div[role="main"]', 15000);
      console.log('Gmail Ad Remover: Gmail carregado, iniciando remoção de anúncios');

      // Primeira varredura
      if (config.enabled) {
        removeAds();
      }

      // Criar observador para mudanças
      createObserver();

    } catch (e) {
      console.warn('Gmail Ad Remover: Erro na inicialização:', e);
    }
  }

  // Listener para mudanças nas configurações
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.adRemoverEnabled) {
        config.enabled = changes.adRemoverEnabled.newValue;
        if (config.enabled) {
          removeAds();
        } else {
          restoreAds();
        }
      }
      if (changes.autoRemove) {
        config.autoRemove = changes.autoRemove.newValue;
      }
    }
  });

  // Listener para mensagens do popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleAdRemover') {
      config.enabled = !config.enabled;
      chrome.storage.sync.set({ adRemoverEnabled: config.enabled });
      if (config.enabled) {
        removeAds();
      } else {
        restoreAds();
      }
      sendResponse({ enabled: config.enabled });
    }
    
    if (request.action === 'scanNow') {
      const count = removeAds();
      sendResponse({ removedCount: count });
    }
    
    if (request.action === 'getStatus') {
      sendResponse({ 
        enabled: config.enabled, 
        stats: stats 
      });
    }
  });

  // Re-executar quando a rota muda (Gmail é SPA)
  (function (history) {
    if (!history) return;
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    
    history.pushState = function () {
      const result = originalPush.apply(this, arguments);
      setTimeout(init, 1000);
      return result;
    };
    
    history.replaceState = function () {
      const result = originalReplace.apply(this, arguments);
      setTimeout(init, 1000);
      return result;
    };
    
    window.addEventListener('popstate', function () {
      setTimeout(init, 1000);
    });
  })(window.history);

  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();