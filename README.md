# Gmail Ad Remover Extension

## 🚫 Extensão Segura para Remoção de Anúncios do Gmail

**Versão:** 1.0.2

Uma extensão do Chrome focada em **segurança** e **precisão** para remover apenas anúncios e elementos promocionais do Gmail, sem interferir no funcionamento normal da aplicação.

## ✅ Características de Segurança

### O que a extensão FAZ:
- ✅ Remove **apenas** anúncios claramente identificados na sidebar direita
- ✅ Atenua (diminui opacidade) elementos promocionais, sem removê-los completamente
- ✅ Funciona **somente** no Gmail (mail.google.com)
- ✅ Permite ativar/desativar facilmente
- ✅ Usa seletores muito específicos e conservadores

### O que a extensão NÃO FAZ:
- ❌ **NUNCA** remove emails legítimos da área principal
- ❌ **NUNCA** interfere na funcionalidade de envio/recebimento
- ❌ **NUNCA** acessa conteúdo privado dos emails
- ❌ **NUNCA** envia dados para servidores externos
- ❌ **NUNCA** modifica o comportamento do Gmail

## 📁 Estrutura da Extensão

```
gmail-ad-remover-extension/
├── manifest.json          # Configuração da extensão (Manifest V3)
├── content.js            # Script principal (versão segura)
├── background.js         # Service worker
├── popup.html           # Interface do popup
├── popup.js             # Lógica do popup
├── popup.css            # Estilos do popup
├── icons/               # Ícones da extensão
│   ├── icon16.png       # Ícone 16x16
│   ├── icon32.png       # Ícone 32x32
│   ├── icon48.png       # Ícone 48x48
│   ├── icon128.png      # Ícone 128x128
│   └── icon16.svg       # Ícone vetorial (fonte)
├── README.md            # Este arquivo - Documentação principal
├── LICENSE.md           # Licença Creative Commons BY-NC-SA 4.0
├── SECURITY.md          # Política de segurança e privacidade
└── MELHORIAS-v1.1.md    # Histórico de melhorias
```

## 🔧 Instalação

### Pré-requisitos
A extensão precisa de ícones PNG na pasta `icons/`:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

> **Dica:** Você pode usar um conversor online para transformar o `icon16.svg` em PNG de diferentes tamanhos.

### Método 1: Instalação Manual (Recomendado)

1. **Clone ou baixe** este repositório
2. Abra o **Chrome** e digite `chrome://extensions/`
3. Ative o **"Modo do desenvolvedor"** (canto superior direito)
4. Clique em **"Carregar sem compactação"**
5. Selecione a pasta `gmail-ad-remover-extension`
6. A extensão aparecerá na lista e estará ativa

### Método 2: Instalação via .crx (Futuro)

Quando publicada na Chrome Web Store:
1. Acesse a página da extensão na Web Store
2. Clique em "Adicionar ao Chrome"
3. Confirme as permissões

## 🎛️ Como Usar

### Primeiro Uso

1. Após instalar, **abra o Gmail** (mail.google.com)
2. A extensão será ativada automaticamente
3. Clique no ícone da extensão na barra para ver opções
4. **Procure emails patrocinados** - eles devem desaparecer automaticamente
5. **Verifique o console** (F12) para ver logs de atividade

### Controles Disponíveis

**Pelo popup da extensão:**
- **Toggle ON/OFF**: Ativar/desativar a remoção de anúncios
- **Scan Now**: Executar uma varredura manual imediata
- **Estatísticas**: Ver quantos elementos foram processados
- **Resetar Contadores**: Limpar estatísticas acumuladas
- **Remoção Automática**: Configurar se deve remover automaticamente

### Verificar se Está Funcionando

#### ✅ **Sinais de funcionamento correto:**
- Emails com "Patrocinado" **desaparecem** da lista
- Banner "Testar o Google Workspace" **não aparece**
- Badge da extensão mostra **número de bloqueios**
- Console (F12) mostra: `Gmail Ad Remover: Email patrocinado removido`

#### ❌ **Possíveis problemas:**
1. **Ícones faltando** → Extensão não carrega
2. **Não remove nada** → Verifique se está no Gmail e a extensão está ativa
3. **Remove emails normais** → RELATE IMEDIATAMENTE (bug crítico)

## 🔍 Elementos Removidos

### Anúncios Completamente Removidos:
- Anúncios na sidebar direita com `data-adunit-path`
- Elementos com aria-label "Anúncio", "Advertisement", "Publicidade"
- Banners com data-testid contendo "ad"

### **NOVO (v1.0.2): Banner do Google Workspace Removido:**
- ✅ **Remove automaticamente** o banner "Dica da Caixa de entrada"
- ✅ Deleta completamente a div do DOM (remoção permanente)
- ✅ Detecta banners com "Testar o Google Workspace"
- ✅ Múltiplos seletores para garantir remoção mesmo se o Gmail mudar
- ✅ Monitoramento em tempo real - remove assim que aparecer

### **Emails Patrocinados Removidos:**
- ✅ **Emails marcados como "Patrocinado"** na lista principal
- ✅ Detecta elementos com classes `bGY FFM8Yd` (conforme solicitado)
- ✅ Remove completamente a linha do email patrocinado
- ✅ Funciona em tempo real quando novos emails chegam

### Elementos Promocionais Atenuados:
- Elementos com aria-label contendo "Promoção"/"Promotion"
- **Apenas na sidebar** (nunca na área principal de emails)
- Ficam com 60% de opacidade e filtro de escala de cinza

## 🛡️ Medidas de Segurança Implementadas

### 1. Validação de Domínio:
```javascript
const ALLOWED_HOST = 'mail.google.com';
// Só funciona no Gmail oficial
```

### 2. Proteção da Área de Emails:
```javascript
// NUNCA processar emails na área principal
const isInMainEmailArea = element.closest('div[role="main"]') !== null;
if (isInMainEmailArea) {
  return false; // SEGURANÇA: nunca mexer em emails principais
}
```

### 3. Seletores Muito Específicos:
- Não usa seletores genéricos como `div[data-ved]`
- Requer múltiplas validações para confirmar que é anúncio
- Foca apenas na sidebar direita

### 4. Observador Limitado:
- Não observa a área principal de emails
- Debounce de 1 segundo para evitar execução excessiva
- Processa apenas elementos novos na sidebar

## 🔧 Configurações

A extensão armazena configurações no Chrome Storage:
- `adRemoverEnabled`: Ativar/desativar (padrão: true)
- `autoRemove`: Remoção automática (padrão: true)
- `showStats`: Mostrar estatísticas (padrão: true)

## 🐛 Resolução de Problemas

### A extensão não está funcionando
1. Verifique se está no Gmail (mail.google.com)
2. Recarregue a página do Gmail (Ctrl+R ou F5)
3. Verifique se a extensão está ativada em `chrome://extensions/`
4. Confirme que os ícones PNG estão na pasta `icons/`
5. Veja o console (F12) para mensagens de erro

### Elementos não estão sendo removidos
1. Clique no ícone da extensão e use **"Scan Now"**
2. Verifique se o toggle está **ATIVO** (verde)
3. Os seletores são muito específicos por segurança - nem tudo será removido
4. Alguns elementos novos podem precisar de atualização da extensão

### A extensão está removendo emails legítimos
- **ISSO NÃO DEVE ACONTECER!** A extensão foi projetada para NUNCA mexer em emails legítimos
- **AÇÃO IMEDIATA:**
  1. **Desative** a extensão (clique no toggle)
  2. **Recarregue** a página do Gmail
  3. **Verifique** se emails legítimos voltaram
  4. **Relate** o problema com screenshots e logs do console

### Verificação de Segurança
Se suspeitar que algo está errado:
1. Abra **Ferramentas do Desenvolvedor** (F12)
2. Vá para a aba **Console**
3. Procure por mensagens: `Gmail Ad Remover:`
4. Copie todos os logs e **relate o problema**

## 📊 Logs e Debug

Para ver o que a extensão está fazendo em tempo real:

1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá para a aba **Console**
3. Procure por mensagens: `Gmail Ad Remover:`

### Exemplo de logs esperados:
```
Gmail Ad Remover: Inicializando versão segura...
Gmail Ad Remover: Gmail carregado, iniciando remoção segura de anúncios
Gmail Ad Remover: Banner do Google Workspace removido
Gmail Ad Remover: Email patrocinado removido: <tr class="zA">
Gmail Ad Remover: 3 elementos processados
```

### O que cada log significa:
- **"Inicializando"** → Extensão está começando a executar
- **"Gmail carregado"** → Página do Gmail detectada com sucesso
- **"Banner removido"** → Banner do Google Workspace foi deletado
- **"Email patrocinado removido"** → Email com "Patrocinado" foi removido
- **"X elementos processados"** → Total de ações realizadas na varredura

## ⚠️ Avisos Importantes

1. **Esta extensão é experimental** - Use por sua conta e risco
2. **Sempre teste em uma conta secundária** antes de usar na principal
3. **Google pode alterar a estrutura do Gmail** - a extensão pode precisar de atualizações
4. **Mantenha backups importantes** - embora a extensão seja segura, sempre seja cauteloso
5. **Não coleta dados** - Tudo funciona localmente no seu navegador
6. **Código aberto** - Você pode auditar o código a qualquer momento

### 🚨 IMPORTANTE - Segurança

A extensão foi programada para ser **EXTREMAMENTE CONSERVADORA**:

- ✅ Só remove elementos com **classes específicas** + texto identificador
- ✅ **Múltiplas verificações** antes de remover qualquer coisa
- ✅ **Logs detalhados** de tudo que é removido
- ✅ **Nunca acessa conteúdo** dos emails
- ✅ **Não envia dados** para servidores externos
- ✅ **Função de restaurar** disponível ao desativar

## 🔄 Atualizações e Manutenção

### Quando atualizar:
- Se o Gmail mudou sua interface
- Se anúncios não estão sendo removidos
- Se surgirem novos tipos de anúncios

### Como contribuir:
1. Reporte bugs específicos
2. Sugira melhorias de segurança
3. Identifique novos seletores seguros

## � Changelog

### v1.0.2 (25/10/2025)
- ✨ **NOVO:** Remoção automática do banner do Google Workspace
- ✨ Deleta completamente a div "Dica da Caixa de entrada"
- 🔧 Múltiplos seletores para maior confiabilidade
- 🔧 Monitoramento em tempo real via MutationObserver
- 🔧 Sistema de fallback por detecção de texto

### v1.0.1
- 🐛 Correções de bugs menores
- 🔧 Melhorias de performance

### v1.0.0 (28/09/2025)
- 🎉 Lançamento inicial
- ✨ Remoção de anúncios da sidebar
- ✨ Remoção de emails patrocinados
- ✨ Interface de controle no popup

## 📄 Licença

Este projeto é licenciado sob Creative Commons BY-NC-SA 4.0. Use responsavelmente e sempre respeitando os termos de serviço do Gmail.

Para mais detalhes, consulte:
- [LICENSE.md](LICENSE.md) - Licença completa
- [SECURITY.md](SECURITY.md) - Política de segurança e privacidade

## 🤝 Suporte

### Para reportar problemas:
1. Inclua os **logs do console** (F12 → Console → copiar mensagens)
2. **Screenshot** do que foi removido incorretamente (se aplicável)
3. **URL** onde ocorreu o problema
4. Versão do **Chrome** (`chrome://version/`)
5. **Passos para reproduzir** o problema

### Onde reportar:
- Abra uma **Issue** no repositório GitHub
- Ou use o botão **"Reportar Problema"** na própria extensão

### Contribuindo:
1. **Fork** o repositório
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

---

**Desenvolvido com foco em segurança e precisão** 🛡️  
**Copyright © 2025 Delean Mafra - Todos os direitos reservados**