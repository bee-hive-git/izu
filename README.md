# Izu - Catálogo de Produtos

Site institucional e catálogo de produtos para Izu. Desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## Funcionalidades

- **Catálogo de Produtos**: Navegação por categorias e subcategorias.
- **Integração WhatsApp**: Botão de compra direciona para WhatsApp com mensagem pré-preenchida.
- **Painel Administrativo**: Gerenciamento completo de produtos (CRUD).
- **Upload de Imagens**: Integração com Supabase Storage.
- **Responsivo**: Design otimizado para mobile e desktop.

## Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` com suas credenciais do Supabase.
4. Execute o projeto:
   ```bash
   npm run dev
   ```

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://dkushllqzfspxcbthzlm.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_WHATSAPP_NUMBER=5562995021226
```

## Banco de Dados

O projeto utiliza Supabase. O script de inicialização do banco de dados está em `supabase/migrations/20240207_init.sql`.

## Tecnologias

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- React Router DOM
- React Hook Form + Zod
- Lucide React
