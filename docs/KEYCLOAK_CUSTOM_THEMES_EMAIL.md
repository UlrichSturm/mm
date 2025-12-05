# Keycloak Custom Themes - Email Templates

## Overview

If you have custom themes in Keycloak (like `theme-sport-unite`), email templates are located in the theme files, not in the Admin Console UI.

---

## Finding Email Templates in Custom Themes

### Step 1: Access Keycloak Container

```bash
docker exec -it mm-keycloak bash
# or for your container:
docker exec -it <your-keycloak-container-name> bash
```

### Step 2: Locate Theme Files

```bash
# List available themes
ls -la /opt/keycloak/themes/

# Check email templates in your theme
ls -la /opt/keycloak/themes/theme-sport-unite/email/
# or
ls -la /opt/keycloak/themes/theme-sport-unite\ 2/email/
```

### Step 3: Edit Email Verification Template

```bash
# Edit the template file
vi /opt/keycloak/themes/theme-sport-unite/email/email-verification.ftl
# or use nano
nano /opt/keycloak/themes/theme-sport-unite/email/email-verification.ftl
```

**Note:** Changes take effect immediately - no restart needed!

---

## Mount Themes as Volume (Recommended)

To edit themes from your host machine, mount them as a volume:

### Step 1: Copy Themes from Container

```bash
# Create directory on host
mkdir -p ./keycloak-themes

# Copy themes from container
docker cp mm-keycloak:/opt/keycloak/themes/theme-sport-unite ./keycloak-themes/
docker cp mm-keycloak:/opt/keycloak/themes/theme-sport-unite\ 2 ./keycloak-themes/
```

### Step 2: Update docker-compose.yml

Add volumes section to keycloak service:

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:24.0
  # ... other config ...
  volumes:
    - ./keycloak-themes:/opt/keycloak/themes
  # ... rest of config ...
```

### Step 3: Restart Container

```bash
docker-compose restart keycloak
```

Now you can edit files in `./keycloak-themes/theme-sport-unite/email/` on your host machine!

---

## Email Template File Structure

### Location

```
/opt/keycloak/themes/<theme-name>/email/
├── email-verification.ftl          # Email verification template
├── password-reset.ftl              # Password reset template
├── executeActions.ftl              # Execute actions template
└── ... (other templates)
```

### Email Verification Template Example

File: `email-verification.ftl`

```ftl
<#ftl encoding="UTF-8">
<#import "template.ftl" as layout>
<@layout.emailLayout>
    <#-- @ftlvariable name="link" type="java.lang.String" -->
    <#-- @ftlvariable name="linkExpiration" type="java.lang.String" -->
    <#-- @ftlvariable name="user" type="org.keycloak.representations.idm.UserRepresentation" -->
    <#-- @ftlvariable name="realmName" type="java.lang.String" -->

    <h2>Добро пожаловать!</h2>

    <p>Здравствуйте, ${user.firstName!user.username}!</p>

    <p>Спасибо за регистрацию в ${realmName}. Пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже:</p>

    <p style="margin: 20px 0;">
        <a href="${link}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Подтвердить Email
        </a>
    </p>

    <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
    <p style="word-break: break-all; color: #6b7280;">${link}</p>

    <p style="color: #9ca3af; font-size: 12px;">
        Эта ссылка действительна в течение ${linkExpiration}.
    </p>

    <p>Если вы не создавали аккаунт, пожалуйста, проигнорируйте это письмо.</p>

    <p>С уважением,<br>Команда ${realmName}</p>
</@layout.emailLayout>
```

---

## Available Variables in Templates

| Variable               | Type   | Description                 |
| ---------------------- | ------ | --------------------------- |
| `${link}`              | String | Verification/reset link URL |
| `${linkExpiration}`    | String | Link expiration time        |
| `${user.username}`     | String | Username                    |
| `${user.email}`        | String | User email                  |
| `${user.firstName}`    | String | User first name             |
| `${user.lastName}`     | String | User last name              |
| `${realmName}`         | String | Realm name                  |
| `${realm.displayName}` | String | Realm display name          |

---

## Testing Changes

### Method 1: Test Email in Admin Console

1. Go to **Realm Settings** → **Email** → **Templates**
2. Click "Send test email"
3. Enter your email address
4. Check inbox

### Method 2: Register New User

1. Enable user registration
2. Register a test user
3. Check email inbox

---

## Internationalization (i18n)

To support multiple languages, create locale-specific files:

```
email/
├── email-verification.ftl          # Default (English)
├── email-verification_ru.ftl      # Russian
├── email-verification_de.ftl      # German
└── email-verification_en.ftl      # English (explicit)
```

Keycloak will automatically use the correct template based on user's locale.

---

## Troubleshooting

### Changes Not Appearing

1. **Clear browser cache** - Old templates might be cached
2. **Check theme selection** - Ensure correct theme is selected in **Realm Settings** → **Themes** → **Email theme**
3. **Verify file location** - Check file is in correct theme directory
4. **Check file permissions** - Ensure Keycloak can read the file

### Template Syntax Errors

- Check FreeMarker syntax
- Validate HTML structure
- Test with simple template first
- Check Keycloak logs: `docker logs mm-keycloak`

### Finding Your Theme Name

1. Go to **Realm Settings** → **Themes**
2. Check **Email theme** dropdown
3. Use that exact name as directory name

---

## Quick Reference

### Edit Template (Inside Container)

```bash
docker exec -it mm-keycloak bash
vi /opt/keycloak/themes/theme-sport-unite/email/email-verification.ftl
```

### Copy Template to Host

```bash
docker cp mm-keycloak:/opt/keycloak/themes/theme-sport-unite/email/email-verification.ftl ./email-verification.ftl
```

### Copy Template Back to Container

```bash
docker cp ./email-verification.ftl mm-keycloak:/opt/keycloak/themes/theme-sport-unite/email/email-verification.ftl
```

---

## Best Practices

1. **Backup before editing** - Copy original template first
2. **Test on staging** - Don't edit production directly
3. **Use version control** - Commit theme files to Git
4. **Document changes** - Note what was changed and why
5. **Test multiple email clients** - Gmail, Outlook, etc.
6. **Mobile responsive** - Ensure templates work on mobile
7. **Plain text fallback** - Some clients don't support HTML

---

## References

- [Keycloak Themes Documentation](https://www.keycloak.org/docs/latest/server_development/#_themes)
- [FreeMarker Template Language](https://freemarker.apache.org/docs/)
- [Keycloak Email Templates](https://www.keycloak.org/docs/latest/server_admin/#_email)
