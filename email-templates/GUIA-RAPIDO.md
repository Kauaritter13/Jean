# 🚀 Guia Rápido - Configurar Templates de Email

## ⚡ Passo a Passo (5 minutos)

### 1. Acesse o Supabase
```
https://supabase.com/dashboard → Seu Projeto → Authentication → Email Templates
```

### 2. Configure cada template

#### ✉️ Confirm signup
- **Subject:** `Bem-vindo ao Chá de Casa Nova! 🎉`
- **Body:** Cole o conteúdo de `confirm-signup.html`

#### 🔑 Magic Link  
- **Subject:** `Seu acesso ao Chá de Casa Nova 🔑`
- **Body:** Cole o conteúdo de `magic-link.html`

#### 📧 Change Email Address
- **Subject:** `Confirme seu novo email 📧`
- **Body:** Cole o conteúdo de `change-email.html`

#### 🔒 Reset Password
- **Subject:** `Redefinir sua senha - Chá de Casa Nova 🔐`
- **Body:** Cole o conteúdo de `reset-password.html`

### 3. Salve cada um

Clique em **Save** após colar cada template.

---

## 🎯 Extras para Evitar Spam

### Opção 1: Use Resend (Recomendado - GRÁTIS até 3000 emails/mês)

1. Crie conta em [resend.com](https://resend.com)
2. Obtenha sua API Key
3. No Supabase:
   - **Settings** → **Auth** → **SMTP Settings**
   - Preencha:
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [sua-api-key]
     Sender name: Jean & Stephany
     Sender email: naoresponda@seudominio.com
     ```

### Opção 2: Configure SPF/DKIM

Se você tem um domínio, adicione estes registros DNS:

**SPF:**
```
v=spf1 include:_spf.supabase.io ~all
```

**DMARC:**
```
v=DMARC1; p=none; rua=mailto:seu-email@dominio.com
```

---

## ✅ Testar

1. Faça logout da sua aplicação
2. Tente criar uma nova conta
3. Verifique o email recebido
4. Confirme que está bonito e não foi para spam

---

## 🆘 Problemas?

**Email não chegou?**
- Verifique spam/lixo eletrônico
- Aguarde 5 minutos
- Verifique logs: Supabase → Logs → Auth Logs

**Ainda indo para spam?**
- Use Resend ou SendGrid
- Configure SPF/DKIM
- Evite enviar muitos emails de teste

**Template não aplicou?**
- Limpe cache do navegador
- Aguarde alguns minutos
- Faça logout e teste novamente

---

## 📊 Monitorar

Teste o score de spam em: [mail-tester.com](https://www.mail-tester.com)

Objetivo: **8/10 ou mais** ✅

---

## 💡 Dica Pro

Para melhor deliverability, configure um domínio personalizado com Resend:

1. Adicione seu domínio no Resend
2. Configure os registros DNS (MX, TXT)
3. Verifique o domínio
4. Use `naoresponda@seudominio.com` como remetente

Isso reduz drasticamente a chance de cair em spam! 🎯
