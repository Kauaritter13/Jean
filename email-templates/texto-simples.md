# Templates de Email - Versão Texto Simples

Alguns clientes de email antigos não suportam HTML. Use estas versões em texto simples como fallback.

## 📧 Confirm Signup (Texto Simples)

```
===========================================
❤️ Jean & Stephany - Chá de Casa Nova
===========================================

🎉 BEM-VINDO(A)!

Olá!

Ficamos muito felizes que você está criando sua lista de presentes conosco! Para começar, confirme seu email clicando no link abaixo:

{{ .ConfirmationURL }}

⏱️ IMPORTANTE: Este link expira em 24 horas.

---

🎁 O QUE VOCÊ PODE FAZER:

✓ Criar sua lista personalizada de chá de casa nova
✓ Importar produtos da Shopee, Amazon e outras lojas
✓ Compartilhar o link com família e amigos
✓ Acompanhar em tempo real quem presenteou você

---

Se você não criou uma conta conosco, pode ignorar este email com segurança.

💌 Jean & Stephany
Criando memórias e montando nosso lar juntos

{{ .SiteURL }}

---
Este é um email automático. Por favor, não responda.
```

## 🔑 Magic Link (Texto Simples)

```
===========================================
❤️ Jean & Stephany - Chá de Casa Nova
===========================================

🔑 SEU LINK DE ACESSO

Olá!

Recebemos uma solicitação de acesso à sua conta. Clique no link abaixo para entrar rapidamente:

{{ .ConfirmationURL }}

⏱️ VALIDADE: 60 minutos (uso único)

🔒 SEGURANÇA: Se você não solicitou este acesso, ignore este email.

---

💡 DICAS DE SEGURANÇA:

✓ Nunca compartilhe este link
✓ Verifique se a URL está correta
✓ Em caso de dúvida, use sua senha normal

💌 Jean & Stephany
{{ .SiteURL }}

---
Este é um email automático. Por favor, não responda.
```

## 🔒 Reset Password (Texto Simples)

```
===========================================
❤️ Jean & Stephany - Chá de Casa Nova
===========================================

🔐 REDEFINIR SUA SENHA

Olá!

Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para criar uma nova senha:

{{ .ConfirmationURL }}

⏱️ IMPORTANTE: Este link expira em 60 minutos.

🛡️ NÃO FOI VOCÊ? Ignore este email. Sua senha atual permanece segura.

---

💡 DICAS PARA UMA SENHA SEGURA:

✓ Use pelo menos 8 caracteres
✓ Combine letras maiúsculas e minúsculas
✓ Inclua números e símbolos
✓ Não reutilize senhas de outros sites

💌 Jean & Stephany
{{ .SiteURL }}

---
Este é um email automático. Por favor, não responda.
```

## 📧 Change Email (Texto Simples)

```
===========================================
❤️ Jean & Stephany - Chá de Casa Nova
===========================================

📧 CONFIRME SEU NOVO EMAIL

Olá!

Recebemos uma solicitação para alterar o email da sua conta. Confirme clicando no link abaixo:

{{ .ConfirmationURL }}

⏱️ VALIDADE: 24 horas

🔒 NÃO FOI VOCÊ? Ignore este email e entre em contato conosco imediatamente.

---

📝 APÓS A CONFIRMAÇÃO:

✓ Seu email será atualizado
✓ Use o novo email para login
✓ Você receberá confirmação no email antigo
✓ Todos os dados serão mantidos

💌 Jean & Stephany
{{ .SiteURL }}

---
Este é um email automático. Por favor, não responda.
```

---

## 📝 Como Usar (Opcional)

No Supabase, alguns templates têm opção para versão texto. Se disponível:

1. Cole a versão HTML no campo **HTML template**
2. Cole a versão texto no campo **Text template**
3. Salve

Isso garante compatibilidade máxima! ✅
