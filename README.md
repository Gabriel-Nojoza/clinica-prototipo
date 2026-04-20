# Clinica Viva

Sistema mobile-first para marcacao de consultas em uma clinica geral, construido com React, TypeScript, Zustand, React Router DOM, Tailwind CSS e um backend Node.js/Express para notificacoes.

## Estrutura

```text
src/
  app/
  features/
    admin/
    appointments/
    auth/
    home/
    profile/
  shared/
    components/
    data/
    store/
    types/
    utils/
backend/
```

## Funcionalidades entregues

- Fluxo completo de agendamento em etapas: medico -> data -> horario -> confirmacao
- Cadastro/login com validacao usando React Hook Form + Zod
- Perfil editavel com historico de consultas
- Area admin para cadastrar medicos e acompanhar agenda
- Exemplo de notificacao por email e WhatsApp/Twilio
- Hook customizado `useAppointment`
- Teste unitario inicial do hook principal com Jest + React Testing Library
- Tema claro/escuro e navegacao por bottom tab bar

## Como rodar

```bash
npm install
npm run dev
```

Em outro terminal:

```bash
npm run dev:server
```

## Backend de notificacao

Copie `.env.example` para `.env` e configure SMTP/Twilio se quiser envio real.

## Melhorias naturais

- Persistir agenda em PostgreSQL ou Firebase
- Autenticacao real com JWT ou Firebase Auth
- Fila de notificacoes 24h antes da consulta
- Painel admin com filtros por medico, especialidade e status
