# 🚀 INSTRUÇÕES DE INSTALAÇÃO - Gmail Ad Remover

## ✅ Extensão Atualizada com Remoção de Emails Patrocinados

A extensão agora remove **especificamente** os emails marcados como "Patrocinado" que você mostrou na imagem!

### 🎯 O que foi adicionado:
- ✅ **Detecção específica** de `<span class="bGY FFM8Yd">Patrocinado</span>`
- ✅ **Remoção completa** da linha do email patrocinado (não apenas opacidade)
- ✅ **Funcionamento em tempo real** quando novos emails chegam
- ✅ **Logs detalhados** para debug

## 📋 Passos para Instalação:

### 1. **Preparar Ícones** (IMPORTANTE)
A extensão precisa de ícones PNG. Você pode:

**Opção A - Temporária:** Copie qualquer imagem pequena 4 vezes:
```
icons/icon16.png  (16x16 pixels)
icons/icon32.png  (32x32 pixels)  
icons/icon48.png  (48x48 pixels)
icons/icon128.png (128x128 pixels)
```

**Opção B - Converter o SVG:** Use um conversor online para transformar o `icon16.svg` criado em PNG.

### 2. **Instalar no Chrome:**
1. Abra `chrome://extensions/`
2. Ative **"Modo do desenvolvedor"** (canto superior direito)
3. Clique **"Carregar sem compactação"**
4. Selecione a pasta `gmail-ad-remover-extension`

### 3. **Testar a Extensão:**
1. **Abra o Gmail** (mail.google.com)
2. **Procure emails patrocinados** na sua lista
3. **Verifique** se desaparecem automaticamente
4. **Clique no ícone da extensão** para ver estatísticas

### 4. **Debug (se necessário):**
1. Pressione **F12** no Gmail
2. Vá para a aba **Console**
3. Procure mensagens: `Gmail Ad Remover:`

Exemplo de logs esperados:
```
Gmail Ad Remover: Inicializando versão segura...
Gmail Ad Remover: Gmail carregado, iniciando remoção segura de anúncios
Gmail Ad Remover: Email patrocinado removido: <tr class="zA">
Gmail Ad Remover: 1 elementos processados
```

## 🔧 Configurações Disponíveis:

**Pelo popup da extensão:**
- ✅/❌ Ativar/Desativar extensão
- 🔍 Scan manual
- 📊 Ver estatísticas
- ⚙️ Configurações automáticas

**Botão flutuante no Gmail:**
- Aparece no canto inferior direito
- Clique para ligar/desligar rapidamente

## 🎯 Como Saber se Está Funcionando:

### ✅ **Funcionando corretamente:**
- Emails com "Patrocinado" **desaparecem** da lista
- Badge da extensão mostra **número de bloqueios**
- Console mostra mensagens de **"Email patrocinado removido"**

### ❌ **Possíveis problemas:**
1. **Ícones faltando** → Extensão não instala
2. **Não remove nada** → Verifique se está no Gmail
3. **Remove emails normais** → RELATE IMEDIATAMENTE (bug crítico)

## 🚨 IMPORTANTE - Segurança:

A extensão foi programada para ser **EXTREMAMENTE CONSERVADORA**:

- ✅ Só remove elementos com **classes específicas** + texto "Patrocinado"
- ✅ **Múltiplas verificações** antes de remover qualquer coisa
- ✅ **Logs detalhados** de tudo que é removido
- ✅ **Função de restaurar** disponível

### 🔍 **Verificação de Segurança:**
Se você suspeitar que a extensão está removendo emails legítimos:

1. **Desative** imediatamente (clique no toggle)
2. **Recarregue** a página do Gmail
3. **Verifique** se emails legítimos voltaram
4. **Relate** o problema com detalhes

## 📞 Suporte:

**Para reportar problemas:**
1. Inclua os **logs do console** (F12)
2. **Screenshot** do que foi removido incorretamente
3. **URL** onde ocorreu o problema
4. Versão do **Chrome** e do **Gmail**

---

**A extensão está pronta para uso e deve remover especificamente os emails "Patrocinado" que você mostrou na imagem!** 🎯