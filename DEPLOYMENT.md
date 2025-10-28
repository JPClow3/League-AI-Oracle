# Guia de Deploy no Vercel - League AI Oracle

## ✅ Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

1. ✅ Todas as mudanças do código foram aplicadas
2. ✅ O arquivo `vercel.json` está atualizado
3. ✅ A dependência `sharp` foi instalada (`npm install`)
4. ✅ Os ícones PWA foram gerados (`npm run generate-icons`)

## 🔑 Configurar Variáveis de Ambiente no Vercel

**IMPORTANTE**: Você DEVE configurar a chave da API antes que o deploy funcione.

### Passos:

1. Acesse seu projeto no Vercel: https://vercel.com/dashboard
2. Vá para **Settings** > **Environment Variables**
3. Adicione a seguinte variável:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Sua chave de API do Google Gemini (começa com `AIza...`)
   - **Environments**: Marque Production, Preview e Development

4. Clique em **Save**

### Como obter a chave do Gemini:

1. Acesse: https://ai.google.dev/
2. Faça login com sua conta Google
3. Vá para "Get API Key"
4. Crie ou selecione um projeto
5. Gere uma nova API key
6. Copie a chave (você não poderá vê-la novamente!)

## 🚀 Deploy

### Deploy Automático (Recomendado)

O Vercel faz deploy automaticamente quando você faz push para a branch principal:

```bash
git add .
git commit -m "fix: aplicar correções críticas de deployment"
git push origin main
```

### Deploy Manual

Se preferir fazer deploy manual:

```bash
# Instale a CLI do Vercel (se ainda não tiver)
npm i -g vercel

# Faça login
vercel login

# Deploy para produção
vercel --prod
```

## 🔍 Verificações Pós-Deploy

Após o deploy, verifique:

### 1. ✅ Roteamento SPA funcionando

- Visite: `https://seu-projeto.vercel.app/draftlab`
- Deve carregar a página (não erro 404)

### 2. ✅ Assets carregando corretamente

- Abra DevTools (F12) > Network
- Verifique se JS e CSS estão com status 200
- Verifique se `Content-Type` está correto:
  - `.js` → `application/javascript`
  - `.css` → `text/css`

### 3. ✅ API funcionando

- Abra DevTools (F12) > Network
- Teste uma funcionalidade que use IA (ex: análise de draft)
- Verifique se `/api/gemini` retorna 200 (não 500 ou 401)

### 4. ✅ PWA Icons carregando

- Verifique se `/pwa-192x192.png` e `/pwa-512x512.png` existem
- Não deve haver erros 404 para ícones

## 🐛 Troubleshooting

### Erro: "GEMINI_API_KEY not configured"

- **Causa**: Variável de ambiente não foi configurada
- **Solução**: Vá para Settings > Environment Variables e adicione a chave

### Erro: MIME type 'text/html' for JS/CSS

- **Causa**: vercel.json não foi atualizado corretamente
- **Solução**: Certifique-se de que removeu os headers de Content-Type manuais

### Erro 404 em rotas (ex: /draftlab)

- **Causa**: Rewrite rule não está funcionando
- **Solução**: Verifique se o vercel.json tem a regra `/((?!api/|assets/).*)`

### API retorna 500

- **Causa**: Erro no código da API ou chave inválida
- **Solução**:
  1. Verifique os logs no Vercel Dashboard > Functions
  2. Teste a chave da API manualmente
  3. Verifique se os arquivos `api/*.js` estão corretos

### Ícones PWA 404

- **Causa**: Ícones não foram gerados
- **Solução**: Execute `npm run generate-icons` antes do build

## 📊 Monitoramento

Após o deploy, monitore:

1. **Logs de Função**: Vercel Dashboard > Functions > Logs
2. **Analytics**: Vercel Dashboard > Analytics
3. **Console do Navegador**: Erros no cliente
4. **Network Tab**: Performance e erros de rede

## 🔐 Segurança

### ✅ Implementado:

- ✅ API key no backend (não exposta ao cliente)
- ✅ Rate limiting nas APIs
- ✅ Validação de entrada com Zod
- ✅ Headers de segurança (X-Content-Type-Options, X-Frame-Options, etc.)
- ✅ AbortSignal support para cancelamento de requisições
- ✅ Timeout automático em chamadas de API

### ⚠️ Recomendações Adicionais:

- Configure domínio customizado no Vercel
- Ative HTTPS (já habilitado por padrão no Vercel)
- Configure CORS apropriado para produção
- Monitore uso da API do Gemini para evitar custos inesperados

## 📈 Melhorias Implementadas

Esta versão inclui:

1. ✅ **Correção de MIME types**: Removidos headers problemáticos
2. ✅ **Roteamento SPA**: Todas as rotas funcionando corretamente
3. ✅ **API segura**: SDK do Gemini apenas no backend
4. ✅ **Retry logic**: Chamadas à API Data Dragon com exponential backoff
5. ✅ **Fallback de cache**: Usa dados antigos se API falhar
6. ✅ **Validação robusta**: Zod schemas para todas as entradas
7. ✅ **AbortSignal**: Cancelamento correto de requisições
8. ✅ **Toast melhorado**: Feedback detalhado para operações longas
9. ✅ **PWA Icons**: Geração automática de ícones

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no Vercel Dashboard
2. Teste localmente com `npm run dev`
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Revise o console do navegador para erros do cliente

---

**Última atualização**: 2025-10-28
