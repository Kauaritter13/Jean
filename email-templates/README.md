# 📧 Templates de Email - Jean & Stephany

Este guia mostra como configurar templates de email bonitos no Supabase para evitar spam e melhorar a experiência do usuário.

## 🎨 Como Aplicar os Templates

### 1. Acesse o Painel do Supabase

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates**

### 2. Configure cada Template

Aplique os templates abaixo em cada seção correspondente:

---

## ✉️ Template: Confirm Signup (Confirmação de Cadastro)

**Quando usar:** Enviado quando um novo usuário se cadastra

**Subject (Assunto):**
```
Bem-vindo ao Chá de Casa Nova! 🎉
```

**Template HTML:**
Ver arquivo: [confirm-signup.html](confirm-signup.html)

---

## 🔐 Template: Magic Link (Link Mágico)

**Quando usar:** Login sem senha via email

**Subject (Assunto):**
```
Seu acesso ao Chá de Casa Nova 🔑
```

**Template HTML:**
Ver arquivo: [magic-link.html](magic-link.html)

---

## 🔄 Template: Change Email Address (Mudar Email)

**Quando usar:** Usuário solicita mudança de email

**Subject (Assunto):**
```
Confirme seu novo email 📧
```

**Template HTML:**
Ver arquivo: [change-email.html](change-email.html)

---

## 🔒 Template: Reset Password (Redefinir Senha)

**Quando usar:** Usuário esqueceu a senha

**Subject (Assunto):**
```
Redefinir sua senha - Chá de Casa Nova 🔐
```

**Template HTML:**
Ver arquivo: [reset-password.html](reset-password.html)

---

## 🚫 Como Evitar Spam

### 1. Configure SPF, DKIM e DMARC

No seu provedor de domínio (caso tenha um domínio personalizado), adicione estes registros DNS:

#### SPF Record
```
v=spf1 include:_spf.supabase.io ~all
```

#### DMARC Record
```
v=DMARC1; p=none; rua=mailto:seu-email@dominio.com
```

### 2. Use um Domínio Personalizado (Recomendado)

**No Supabase:**
1. Vá em **Settings** → **Custom SMTP**
2. Configure um serviço como:
   - **Resend** (recomendado, 3000 emails grátis/mês)
   - **SendGrid**
   - **Mailgun**

**Exemplo com Resend:**

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=sua-api-key-aqui
SMTP_SENDER_NAME=Jean & Stephany
SMTP_SENDER_EMAIL=naoresponda@seudominio.com
```

### 3. Boas Práticas de Email

✅ **Faça:**
- Use um remetente consistente
- Inclua link de unsubscribe (já incluído nos templates)
- Use HTML responsivo
- Teste em diferentes clientes de email
- Mantenha o texto conciso e objetivo
- Inclua versão em texto simples

❌ **Evite:**
- Muitas imagens
- Palavras como "GRÁTIS", "GANHE", "CLIQUE AQUI"
- Fontes muito grandes ou coloridas demais
- Links encurtados suspeitos
- Enviar muitos emails de uma vez

### 4. Variáveis Disponíveis no Supabase

Você pode usar estas variáveis nos templates:

- `{{ .ConfirmationURL }}` - URL de confirmação
- `{{ .Token }}` - Token de confirmação
- `{{ .TokenHash }}` - Hash do token
- `{{ .SiteURL }}` - URL do seu site
- `{{ .Email }}` - Email do usuário

### 5. Testar os Emails

1. **Mail-tester.com**: Teste o score de spam
   - Envie um email de teste para o endereço fornecido
   - Verifique o score (deve ser > 8/10)

2. **Litmus/Email on Acid**: Teste visual
   - Veja como o email aparece em diferentes clientes

3. **Teste Real**: Envie para você mesmo
   - Gmail
   - Outlook
   - Apple Mail
   - Celular

---

## 🎯 Configurações Adicionais no Supabase

### Rate Limiting (Limitar Taxa de Envio)

No painel do Supabase:
1. **Authentication** → **Rate Limits**
2. Configure:
   - Email: 4 por hora por IP
   - SMS: 4 por hora por IP

### URL de Redirecionamento

Certifique-se de configurar as URLs permitidas:

1. **Authentication** → **URL Configuration**
2. Adicione em **Redirect URLs**:
```
http://localhost:3000/**
https://seudominio.com/**
https://www.seudominio.com/**
```

### Confirmação de Email

1. **Authentication** → **Providers** → **Email**
2. Configure:
   - ✅ Enable email provider
   - ✅ Confirm email
   - ⏱️ Email rate limit: 4/hour
   - 📧 Email template: Custom (use os templates acima)

---

## 📱 Preview dos Templates

Os templates incluem:

- 💝 Design com cores azul e amarelo (tema do casal)
- 📱 Responsivo (funciona em celular)
- 💌 Visual bonito e profissional
- 🎨 Ícones e elementos decorativos
- 🔗 Botões de ação destacados
- 📝 Texto claro e amigável
- ❤️ Tema romântico do chá de casa nova

---

## 🔧 Troubleshooting

### Email não está chegando?

1. Verifique a pasta de spam
2. Verifique os logs do Supabase em **Logs** → **Auth Logs**
3. Confirme que o email está habilitado em **Authentication** → **Providers**
4. Teste com outro provedor de email (Gmail, Outlook)

### Email está indo para spam?

1. Configure SPF/DKIM/DMARC
2. Use SMTP customizado (Resend/SendGrid)
3. Reduza o uso de palavras "spam"
4. Adicione link de unsubscribe
5. Use domínio verificado

### Template não está aplicando?

1. Limpe o cache do navegador
2. Aguarde alguns minutos
3. Faça logout e teste novamente
4. Verifique se salvou corretamente no Supabase

---

## 💡 Próximos Passos

1. ✅ Copie os templates HTML dos arquivos
2. ✅ Cole no Supabase (Authentication → Email Templates)
3. ✅ Teste enviando um email para você mesmo
4. ✅ Configure SMTP customizado (opcional mas recomendado)
5. ✅ Adicione seu domínio (opcional)
6. ✅ Teste o score em mail-tester.com
