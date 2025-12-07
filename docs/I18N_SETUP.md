# i18n Setup Guide

The Admin Portal now supports internationalization (i18n) with English as the primary language and Russian as a secondary language.

## Features

- ✅ English (en) - Primary language
- ✅ Russian (ru) - Secondary language
- ✅ Language switcher in navigation
- ✅ All translations stored in JSON files
- ✅ Easy to add new languages

## Translation Files

Translations are stored in:
- `apps/admin-portal/messages/en.json` - English translations
- `apps/admin-portal/messages/ru.json` - Russian translations

## Usage in Components

### Using Translations

```typescript
import { useTranslations } from '@/lib/i18n';

export default function MyComponent() {
  const t = useTranslations('namespace'); // e.g., 'dashboard', 'auth', 'vendors'
  const tCommon = useTranslations('common'); // Common translations
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{tCommon('save')}</button>
    </div>
  );
}
```

### Changing Language

Users can change the language using the language switcher in the navigation bar. The preference is stored in `localStorage` and persists across sessions.

### Adding New Translations

1. Add the translation key to both `en.json` and `ru.json`:

```json
// en.json
{
  "myNamespace": {
    "myKey": "My English Text"
  }
}

// ru.json
{
  "myNamespace": {
    "myKey": "Мой русский текст"
  }
}
```

2. Use in component:

```typescript
const t = useTranslations('myNamespace');
return <div>{t('myKey')}</div>;
```

## Current Translation Namespaces

- `common` - Common UI elements (buttons, labels, etc.)
- `nav` - Navigation items
- `dashboard` - Dashboard page
- `lawyers` - Lawyers/Notaries pages
- `vendors` - Vendors pages
- `auth` - Authentication pages
- `status` - Status labels
- `errors` - Error messages

## Adding a New Language

1. Create a new file: `apps/admin-portal/messages/[locale].json`
2. Copy structure from `en.json` and translate all values
3. Update `src/lib/i18n.ts` to include the new locale:

```typescript
import newLocaleMessages from '../../messages/[locale].json';

const messages = {
  en: enMessages,
  ru: ruMessages,
  [locale]: newLocaleMessages, // Add new locale
};
```

4. Update `Navigation.tsx` to add the new language option in the dropdown

