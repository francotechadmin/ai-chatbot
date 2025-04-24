# User Settings

This document describes the user settings functionality in the application.

## Available Settings

The application provides the following user settings:

### 1. Theme Settings

- Users can choose between Light, Dark, or System Default theme
- This setting is managed by the `next-themes` library
- The theme is stored in localStorage and persists across sessions

### 2. Chat Model Selection

- Users can select their preferred AI model for chat interactions
- Available models:
  - Chat model (default): Primary model for all-purpose chat
  - Reasoning model: Uses advanced reasoning
- This setting is saved as a cookie named `chat-model`

### 3. Default Chat Visibility

- Users can set the default visibility for new chats
- Options:
  - Private (default): Only the user can access the chat
  - Public: Anyone with the link can access the chat
- This setting is saved as a cookie named `default-visibility`

## Account Information

The settings page also displays read-only account information:

- Email address
- User role (user, admin, or superuser)
- Account status (active, inactive, or pending)

## Implementation Details

### Cookie-based Settings

Settings are stored as cookies using the Next.js `cookies()` API:

```typescript
// Save a setting
const cookieStore = await cookies();
cookieStore.set("setting-name", value);

// Read a setting
const value = cookieStore.get("setting-name")?.value;
```

### Theme Management

Theme is managed by the `next-themes` library:

```typescript
// In a React component
const { theme, setTheme } = useTheme();

// Set theme
setTheme("light"); // or 'dark' or 'system'
```

## Adding New Settings

To add a new setting:

1. Create a new state variable in the settings page
2. Add UI controls for the setting
3. Create a server action to save the setting as a cookie
4. Update the `handleSave` function to save the new setting
5. Add code to load the setting from cookies on page load

## Testing

You can test the settings functionality using the `scripts/test-settings.ts` script:

```bash
npx tsx scripts/test-settings.ts
```

This will display the current settings stored in cookies.
