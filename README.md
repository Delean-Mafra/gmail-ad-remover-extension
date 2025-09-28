# Gmail Ad Remover Extension

## 🚫 Extensão Segura para Remoção de Anúncios do Gmail

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
├── manifest.json          # Configuração da extensão
├── content.js            # Script principal (versão segura)
├── background.js         # Service worker
├── popup.html           # Interface do popup
├── popup.js             # Lógica do popup
├── popup.css            # Estilos do popup
├── icons/               # Ícones da extensão
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # Este arquivo
```

## 🔧 Instalação

### Método 1: Instalação Manual (Recomendado para teste)

1. **Clone ou baixe** este repositório
2. Abra o **Chrome** e digite `chrome://extensions/`
3. Ative o **"Modo do desenvolvedor"** (canto superior direito)
4. Clique em **"Carregar sem compactação"**
5. Selecione a pasta `gmail-ad-remover-extension`
6. A extensão aparecerá na lista e estará ativa

### Método 2: Instalação via .crx (Futuro)

Quando a extensão estiver finalizada, você poderá:
1. Baixar o arquivo `.crx`
2. Arrastar para `chrome://extensions/`

## 🎛️ Como Usar

### Primeiro Uso:
1. Após instalar, **abra o Gmail** (mail.google.com)
2. A extensão será ativada automaticamente
3. Clique no ícone da extensão na barra para ver opções

### Controles Disponíveis:
- **Toggle ON/OFF**: Ativar/desativar a remoção de anúncios
- **Scan Now**: Executar uma varredura manual
- **Estatísticas**: Ver quantos elementos foram processados

### Botão Flutuante (Opcional):
- Um pequeno botão aparece no canto inferior direito do Gmail
- Clique para alternar rapidamente entre ativo/inativo

## 🔍 Elementos Removidos

### Anúncios Completamente Removidos:
- Anúncios na sidebar direita com `data-adunit-path`
- Elementos com aria-label "Anúncio", "Advertisement", "Publicidade"
- Banners com data-testid contendo "ad"

### **NOVO: Emails Patrocinados Removidos:**
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

### A extensão não está funcionando:
1. Verifique se está no Gmail (mail.google.com)
2. Recarregue a página do Gmail
3. Verifique se a extensão está ativada em `chrome://extensions/`

### Elementos não estão sendo removidos:
1. Clique no ícone da extensão e use "Scan Now"
2. Verifique se há anúncios na **sidebar direita** (não na área principal)
3. Os seletores são muito específicos por segurança

### A extensão está removendo emails legítimos:
- **Isso NÃO deve acontecer!** A extensão foi projetada para NUNCA mexer na área principal
- Se acontecer, desative imediatamente e reporte o problema

## 📊 Logs e Debug

Para ver o que a extensão está fazendo:
1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá para a aba **Console**
3. Procure por mensagens: `Gmail Ad Remover:`

Exemplo de logs seguros:
```
Gmail Ad Remover: Inicializando versão segura...
Gmail Ad Remover: Gmail carregado, iniciando remoção segura de anúncios
Gmail Ad Remover: 2 elementos processados
```

## ⚠️ Avisos Importantes

1. **Esta extensão é experimental** - Use por sua conta e risco
2. **Sempre teste em uma conta secundária** antes de usar na principal
3. **Google pode alterar a estrutura do Gmail** - a extensão pode precisar de atualizações
4. **Mantenha backups importantes** - embora a extensão seja segura, sempre seja cauteloso

## 🔄 Atualizações e Manutenção

### Quando atualizar:
- Se o Gmail mudou sua interface
- Se anúncios não estão sendo removidos
- Se surgirem novos tipos de anúncios

### Como contribuir:
1. Reporte bugs específicos
2. Sugira melhorias de segurança
3. Identifique novos seletores seguros

## 📄 Licença

Este projeto é de código aberto. Use responsavelmente e sempre respeitando os termos de serviço do Gmail.

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique este README primeiro
2. Procure nos logs do console por erros
3. Teste desativando outras extensões que possam conflitar

---

**Desenvolvido com foco em segurança e precisão** 🛡️