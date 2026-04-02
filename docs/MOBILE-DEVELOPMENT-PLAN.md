# TextCoach Mobile Development Plan

## From Chrome Extension to Mobile App — iOS & Android

**Date:** 2026-04-02
**Status:** Development Plan

---

## 1. Executive Summary

TextCoach currently works as a Chrome extension for desktop messaging sites. Most texting happens on phones. This plan details how to launch TextCoach on iOS and Android following the Grammarly model — a standalone app for the full coaching experience, plus a lightweight native keyboard for quick inline suggestions.

---

## 2. How Grammarly Does It (Reference Model)

### Grammarly's Product Stack
- **Grammarly Keyboard** (iOS & Android) — custom third-party keyboard that replaces the system keyboard. Built natively in Swift (iOS) and Kotlin (Android). Reads the current text field via OS APIs and shows suggestions in a bar above the keyboard.
- **Grammarly Editor App** — standalone app where users paste text for deeper analysis. This is the fallback for users who don't want a custom keyboard.
- **Browser Extension** — DOM-based integration for desktop (equivalent to our Chrome extension).

### How Grammarly Reads Text
- **iOS:** Uses `textDocumentProxy` — an OS API that gives keyboard extensions access to text before/after the cursor. Limited to ~100-200 characters near the cursor. Cannot see the full conversation or which app the user is in.
- **Android:** Uses `InputConnection` via `getCurrentInputConnection()`. Provides `getTextBeforeCursor()`, `getTextAfterCursor()`, and `getExtractedText()`. More generous than iOS — can read more text and knows which app is active (package name).
- **Critical:** Grammarly does NOT read messages from other apps. It only sees what's in the current text field the user is typing in.

### Key Technical Constraints
- **iOS keyboard extensions have a ~30MB memory limit.** React Native's runtime alone uses 15-20MB. This is why Grammarly builds natively in Swift.
- **iOS keyboard extensions need "Full Access"** for network calls. Users see a scary iOS warning about keystroke logging. This is an adoption barrier.
- **Android IMEs are more permissive** — no strict memory limit, and they can detect which app the user is in.

---

## 3. What Already Exists

### Chrome Extension (Working — Reference)
- Full coaching flow: Welcome → Questions → Results
- 9 question types (singleChoice, multipleChoice, rating, scale, etc.)
- Result screen with dynamics card + suggestion cards + reasoning
- Auth, billing, usage tracking
- **Status:** Production-ready, deployed

### Mobile App (React Native + Expo — 70% Complete)
- 7 screens: Onboarding, SignIn, Home, Coach, Results, Settings, Upgrade
- All question types implemented
- API integration complete
- Theme system matching Chrome extension
- **Missing:** Social auth wiring, OCR dependency, animations, app icons

### iOS Keyboard Extension (Swift — 60% Complete)
- Basic UIInputViewController with toggle, paste field, suggest button
- API calls to `/quick-suggest`
- Suggestion pills that insert text via `textDocumentProxy`
- Shared auth via App Groups
- **Missing:** Error handling, rich UI, reasoning display, accessibility

### Android Keyboard Extension (Kotlin — 50% Complete)
- InputMethodService with programmatic layout
- API integration with coroutines
- Suggestion pills with `commitText()`
- Shared auth via SharedPreferences
- **Missing:** XML layouts, lifecycle management, error UI, accessibility

---

## 4. Technical Approach for TextCoach Mobile

### The Hybrid Strategy (Recommended)

Following Grammarly's model, TextCoach will have two integration points:

**A. Standalone App (Full Experience)**
- Paste/screenshot workflow for full conversation coaching
- Coach Mode with contextual questions
- Rich results with dynamics, reasoning, tone badges
- Account management, billing, settings

**B. Native Keyboard Extension (Quick Suggestions)**
- Lightweight — Quick Suggest only (no Coach Mode)
- User taps TC button → paste or type context → get 2-3 suggestion pills
- Tap a pill to insert directly into the text field
- No app switching needed for simple replies

### How TextCoach Will Read Messages

TextCoach cannot read messages from other apps (no API exists on iOS, and Android's Accessibility Service will get the app rejected from Play Store). Instead:

| Method | How It Works | Platform |
|--------|-------------|----------|
| **Paste** | User copies conversation from messaging app, pastes into TextCoach | Both |
| **Screenshot + OCR** | User takes screenshot, TextCoach extracts text with on-device ML | Both |
| **Keyboard input field** | Keyboard reads what user is currently typing | Both |
| **Keyboard context** | On Android, keyboard can read text before cursor for context | Android |
| **Share Sheet** | User selects text → Share → TextCoach | Both |

### Input Field Reading (Keyboard Mode)

When the TextCoach keyboard is active:
- **What we CAN read:** The current text field content (what the user is typing or has typed)
- **What we CAN'T read:** Previous messages in the conversation, the other person's messages, or content from other apps
- **Workaround:** The keyboard has a "paste context" field where the user can paste the other person's message for full context. This is a one-tap action.

### Seamless Insert Flow

The keyboard extension eliminates the copy-paste friction:
1. User receives a message in WhatsApp/Instagram/etc.
2. User taps the text field to reply
3. User switches to TextCoach keyboard (or taps the TC button if using a keyboard toolbar approach)
4. Optionally pastes the received message for context
5. Taps "Suggest"
6. Gets 2-3 suggestion pills above the keyboard
7. Taps one → it's inserted directly into the text field
8. User hits send — done. No app switching.

---

## 5. Architecture

### System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   TextCoach App  │     │  iOS Keyboard   │     │ Android Keyboard│
│  (React Native)  │     │    (Swift)      │     │   (Kotlin)      │
│                  │     │                 │     │                 │
│ - Full coaching  │     │ - Quick Suggest │     │ - Quick Suggest │
│ - Questions      │     │ - Paste context │     │ - Paste context │
│ - Results + why  │     │ - Insert pills  │     │ - Insert pills  │
│ - OCR            │     │ - ~30MB limit   │     │ - No mem limit  │
│ - Settings       │     │                 │     │                 │
└────────┬─────────┘     └────────┬────────┘     └────────┬────────┘
         │                        │                        │
         │    App Groups /        │   SharedPreferences    │
         │    Shared Keychain     │                        │
         │◄──────────────────────►│◄──────────────────────►│
         │   (userId, tokens)     │   (userId, tokens)     │
         │                        │                        │
         ▼                        ▼                        ▼
    ┌──────────────────────────────────────────────────────────┐
    │              TextCoach Backend (Express + OpenAI)         │
    │          prompt-improver-1.onrender.com                   │
    │                                                          │
    │  POST /quick-suggest  →  2-4 text messages + reasoning   │
    │  POST /coach          →  contextual questions             │
    │  POST /answer         →  next question or suggestions     │
    │  GET  /remaining-prompts  →  usage tracking               │
    └──────────────────────────────────────────────────────────┘
```

### Data Sharing Between App and Keyboard

**iOS:**
- Both app and keyboard extension join the same App Group (`group.com.textcoach.app`)
- Auth token shared via `UserDefaults(suiteName: "group.com.textcoach.app")`
- Sensitive tokens stored in shared Keychain
- No direct real-time communication — data synced through file system

**Android:**
- SharedPreferences in `MODE_PRIVATE` with shared process
- Or ContentProvider for structured data sharing
- Auth token written by app, read by keyboard service

---

## 6. Development Plan — Phase by Phase

### Phase 1: Ship the Standalone App (Weeks 1-4)

The app is 70% built. Complete it and ship to TestFlight / Play Store internal testing.

#### Week 1: Auth & Core Polish

| Task | File(s) | Effort |
|------|---------|--------|
| Wire Google Sign-In via `expo-auth-session` + Supabase | `src/hooks/useAuth.ts`, `src/screens/SignInScreen.tsx` | 4 hours |
| Wire Apple Sign-In via `expo-apple-authentication` | `src/hooks/useAuth.ts`, `src/screens/SignInScreen.tsx` | 3 hours |
| Add `react-native-mlkit-ocr` to package.json and test OCR | `package.json`, `src/services/ocr.ts`, `src/hooks/useOCR.ts` | 3 hours |
| Add password reset flow | `src/screens/SignInScreen.tsx` | 2 hours |
| Improve error handling across all screens | All screens | 3 hours |

#### Week 2: UX & Polish

| Task | File(s) | Effort |
|------|---------|--------|
| Add screen transition animations (slide, fade) | Navigation configs | 3 hours |
| Add loading skeletons (match Chrome extension style) | New `SkeletonLoader.tsx` | 2 hours |
| Add haptic feedback on button presses | Various components | 1 hour |
| Create app icon and splash screen | `assets/icon.png`, `assets/splash.png`, `app.json` | 2 hours |
| Add "Read from clipboard" quick action on Home screen | `src/screens/HomeScreen.tsx` | 2 hours |
| Add Share Sheet extension (receive shared text) | iOS: Share Extension target, Android: Intent filter | 4 hours |

#### Week 3: App Groups & Keyboard Prep

| Task | File(s) | Effort |
|------|---------|--------|
| Configure iOS App Group (`group.com.textcoach.app`) | Xcode project, entitlements | 2 hours |
| Write userId/token to shared UserDefaults on sign-in | `src/hooks/useAuth.ts` | 1 hour |
| Write userId to Android SharedPreferences on sign-in | `src/hooks/useAuth.ts` | 1 hour |
| Add EAS Build configuration for dev/preview/production | `eas.json` | 2 hours |
| Test on physical iOS device via TestFlight | — | 2 hours |
| Test on physical Android device via internal track | — | 2 hours |

#### Week 4: Testing & Submission

| Task | File(s) | Effort |
|------|---------|--------|
| End-to-end testing: sign in → paste → quick suggest → copy | — | 3 hours |
| End-to-end testing: sign in → paste → coach me → questions → results | — | 3 hours |
| Test OCR with screenshots from WhatsApp, iMessage, Instagram | — | 2 hours |
| Write App Store description and screenshots | — | 3 hours |
| Submit to TestFlight (iOS) | — | 1 hour |
| Submit to Play Store internal testing (Android) | — | 1 hour |

---

### Phase 2: iOS Keyboard Extension (Weeks 5-7)

Build a production-quality iOS keyboard in native Swift.

#### Architecture

```
TextCoachKeyboard/
├── KeyboardViewController.swift    # Main controller (UIInputViewController)
├── Views/
│   ├── KeyboardToolbar.swift       # Top bar with TC button + keyboard switch
│   ├── ContextInputView.swift      # Paste field for conversation context
│   ├── SuggestionStrip.swift       # Horizontal scrollable suggestion pills
│   ├── SuggestionDetailView.swift  # Expanded view showing reasoning
│   └── LoadingView.swift           # Inline loading indicator
├── Services/
│   ├── APIClient.swift             # URLSession calls to /quick-suggest
│   └── AuthManager.swift           # Reads userId from App Group
├── Models/
│   ├── Suggestion.swift            # text, toneLabel, reasoning, recommended
│   └── Dynamics.swift              # interestLevel, tone, patterns, subtext
└── Info.plist                      # Extension config, RequestsOpenAccess
```

#### Week 5: Core Keyboard

| Task | File(s) | Effort |
|------|---------|--------|
| Rebuild KeyboardViewController with proper lifecycle | `KeyboardViewController.swift` | 4 hours |
| Build KeyboardToolbar (TC button, keyboard globe, minimize) | `Views/KeyboardToolbar.swift` | 3 hours |
| Build ContextInputView (paste field with placeholder) | `Views/ContextInputView.swift` | 2 hours |
| Build APIClient with URLSession (respects memory limits) | `Services/APIClient.swift` | 3 hours |
| Build AuthManager reading from App Group UserDefaults | `Services/AuthManager.swift` | 1 hour |
| Configure Info.plist with `RequestsOpenAccess: YES` | `Info.plist` | 30 min |

#### Week 6: Suggestion UI

| Task | File(s) | Effort |
|------|---------|--------|
| Build SuggestionStrip — horizontal scroll of suggestion pills | `Views/SuggestionStrip.swift` | 4 hours |
| Each pill shows tone label + truncated text | `Views/SuggestionStrip.swift` | 2 hours |
| Tap pill → insert via `textDocumentProxy.insertText()` | `KeyboardViewController.swift` | 1 hour |
| Long-press pill → show SuggestionDetailView with reasoning | `Views/SuggestionDetailView.swift` | 3 hours |
| Add "Best" indicator on recommended suggestion | `Views/SuggestionStrip.swift` | 1 hour |
| Loading state (inline spinner while API call runs) | `Views/LoadingView.swift` | 1 hour |
| Error state (network error, try again) | `KeyboardViewController.swift` | 1 hour |

#### Week 7: Polish & Integration

| Task | File(s) | Effort |
|------|---------|--------|
| Style to match TextCoach design system (purple palette, Poppins) | All views | 3 hours |
| Add accessibility labels and VoiceOver support | All views | 2 hours |
| Memory profiling — ensure total < 25MB | Instruments | 2 hours |
| Test on physical device across apps (iMessage, WhatsApp, Instagram) | — | 3 hours |
| Add keyboard to EAS build config | `eas.json`, Xcode project | 1 hour |
| Test Full Access flow (prompt, explanation, why it's needed) | — | 1 hour |

---

### Phase 3: Android Keyboard Extension (Weeks 8-10)

Build a production-quality Android IME in native Kotlin.

#### Architecture

```
com.textcoach.keyboard/
├── TextCoachIME.kt                 # Main InputMethodService
├── views/
│   ├── KeyboardToolbar.kt          # Top bar with TC button
│   ├── ContextInputView.kt        # Paste/type context field
│   ├── SuggestionStrip.kt         # Horizontal RecyclerView of pills
│   └── SuggestionDetailSheet.kt   # Bottom sheet with full reasoning
├── api/
│   ├── TextCoachApi.kt             # OkHttp/Retrofit client
│   └── Models.kt                   # Suggestion, Dynamics data classes
├── auth/
│   └── AuthManager.kt              # SharedPreferences reader
└── res/
    ├── layout/
    │   ├── keyboard_layout.xml
    │   ├── suggestion_pill.xml
    │   └── context_input.xml
    ├── values/colors.xml
    └── xml/method.xml              # IME metadata
```

#### Week 8: Core IME

| Task | File(s) | Effort |
|------|---------|--------|
| Rebuild TextCoachIME with proper lifecycle (onStartInput, onFinishInput) | `TextCoachIME.kt` | 4 hours |
| Create XML layouts for keyboard toolbar and input | `res/layout/*.xml` | 3 hours |
| Build API client with OkHttp + coroutines | `api/TextCoachApi.kt` | 3 hours |
| Build AuthManager reading from SharedPreferences | `auth/AuthManager.kt` | 1 hour |
| Configure method.xml and AndroidManifest for IME | `res/xml/method.xml`, `AndroidManifest.xml` | 1 hour |

#### Week 9: Suggestion UI

| Task | File(s) | Effort |
|------|---------|--------|
| Build SuggestionStrip with RecyclerView (horizontal scroll) | `views/SuggestionStrip.kt`, `suggestion_pill.xml` | 4 hours |
| Tap pill → insert via `currentInputConnection.commitText()` | `TextCoachIME.kt` | 1 hour |
| Long-press → show BottomSheetDialog with reasoning | `views/SuggestionDetailSheet.kt` | 3 hours |
| Read text before cursor for additional context | `TextCoachIME.kt` | 2 hours |
| Detect host app package name for platform-aware suggestions | `TextCoachIME.kt` | 1 hour |
| Loading and error states | `TextCoachIME.kt` | 2 hours |

#### Week 10: Polish & Integration

| Task | File(s) | Effort |
|------|---------|--------|
| Style to match TextCoach design system | `res/values/colors.xml`, all layouts | 3 hours |
| Add accessibility content descriptions | All views | 2 hours |
| Test across Android versions (10, 11, 12, 13, 14) | — | 3 hours |
| Test across messaging apps (WhatsApp, Instagram, Telegram, SMS) | — | 2 hours |
| Add to Gradle build config alongside main app | `build.gradle` | 1 hour |

---

### Phase 4: Production Launch (Weeks 11-12)

| Task | Effort |
|------|--------|
| Final QA pass — all flows on both platforms | 4 hours |
| App Store screenshots (6.7" iPhone, 5.5" iPhone, iPad) | 3 hours |
| Play Store screenshots and feature graphic | 3 hours |
| Privacy policy page (textcoach.com/privacy) | 2 hours |
| App Store review submission | 1 hour |
| Play Store review submission | 1 hour |
| Monitor crash reports and fix issues | Ongoing |

---

## 7. UX Flow — Mobile App

```
┌──────────────┐
│  Onboarding   │  3 slides explaining TextCoach
│  (first run)  │
└──────┬───────┘
       ▼
┌──────────────┐
│   Sign In     │  Google / Apple / Email
└──────┬───────┘
       ▼
┌──────────────────────────────────────────┐
│                HOME SCREEN                │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  Paste the conversation here...  │    │
│  │                                  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  [📸 Screenshot]  [📋 Paste from clip]   │
│                                          │
│  🔒 Your conversations are never stored  │
│                                          │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ Quick Suggest │  │   Coach Me   │     │
│  └──────────────┘  └──────────────┘     │
└──────────┬───────────────┬───────────────┘
           │               │
     Quick Suggest    Coach Me
           │               │
           ▼               ▼
    ┌────────────┐  ┌─────────────┐
    │  Loading    │  │  Question 1  │ ← Contextually relevant
    └─────┬──────┘  │  Question 2  │   to the conversation
          │         │  Question 3  │
          │         └──────┬──────┘
          │                │
          ▼                ▼
    ┌──────────────────────────────────┐
    │          RESULTS SCREEN           │
    │                                  │
    │  CONVERSATION DYNAMICS            │
    │  Interest: High                  │
    │  Tone: Playful                   │
    │  Pattern: Balanced               │
    │  Subtext: They want to meet      │
    │                                  │
    │  ● Enthusiastic          [Best]  │
    │  ┌──────────────────────────┐    │
    │  │ sounds great! what time? │    │
    │  └──────────────────────────┘    │
    │  ▸ Why this works                │
    │                                  │
    │  ○ Casual                        │
    │  ┌──────────────────────────┐    │
    │  │ I'm down, friday works   │    │
    │  └──────────────────────────┘    │
    │  ▸ Why this works                │
    │                                  │
    │  [Copy Selected]    [Try Again]  │
    └──────────────────────────────────┘
```

## 8. UX Flow — Keyboard Extension

```
User is typing in WhatsApp / iMessage / Instagram / etc.

┌─────────────────────────────────┐
│  [Their message: "hey want to   │  ← Chat app
│   grab dinner friday?"]         │
│                                 │
│  [Your reply field: |         ] │  ← User taps to reply
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ [TC] ✨ Coach your reply  [🌐]  │  ← Keyboard toolbar
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Paste their message here... │ │  ← Tap TC to show this
│ └─────────────────────────────┘ │
│              [Suggest]          │
├─────────────────────────────────┤
│ ┌─────────┐┌─────────┐┌──────┐ │
│ │Enthusias││ Casual  ││Playful│ │  ← Suggestion pills
│ │"sounds  ││"I'm dow ││"yes! │ │     (tap to insert)
│ │ great!" ││n, frida ││love  │ │
│ └─────────┘└─────────┘└──────┘ │
├─────────────────────────────────┤
│  q w e r t y u i o p           │  ← Standard keyboard
│  a s d f g h j k l             │     (user's default)
│  z x c v b n m  ⌫              │
└─────────────────────────────────┘

User taps "Enthusiastic" pill →
"sounds great! what time were you thinking?" 
is inserted directly into the text field.

User hits send. Done.
```

---

## 9. Privacy Architecture

```
USER DEVICE                     BACKEND                    OPENAI

Conversation ──HTTPS──→ Express endpoint ──→ GPT API
 (paste/screenshot)      (in memory only)   (no training)
                               │
                               ▼
Suggestions  ←──────── Response returned
                               │
                               ▼
                         Memory cleared
                        (nothing persisted)
```

- Conversation text is NEVER written to database
- On-device OCR for screenshots (images never leave the device)
- OpenAI API data not used for training (per their data usage policy)
- Keyboard does NOT log keystrokes — only processes text when user explicitly taps "Suggest"
- iOS Full Access is needed only for network calls, not for keystroke logging

### Trust Signals in App
- Lock icon + "Your conversations are never stored" on every input screen
- Clear privacy policy explaining what data is processed and what isn't
- Keyboard onboarding explains why Full Access is needed

---

## 10. Monetisation (Same Across All Platforms)

| Feature | Free | Starter (~$5/mo) | Pro (~$10/mo) |
|---------|------|-------------------|---------------|
| Quick Suggest | 5/week | 30/month | Unlimited |
| Coach Mode | 2/week | 15/month | Unlimited |
| Response options | 2 | 3 | 4 |
| Reasoning depth | 1 sentence | Full | Full + risks |
| Dynamics analysis | Hidden | Yes | Yes |
| Keyboard extension | Yes (limited) | Yes | Yes |

Usage tracked via the same Supabase `user_usage` table across Chrome extension, mobile app, and keyboard — one account, shared quota.

---

## 11. App Store Considerations

### iOS App Store
- Custom keyboard extensions are fully supported and approved
- Must include clear privacy policy
- Must explain why "Full Access" is needed in the app and keyboard onboarding
- OCR from photos requires `NSPhotoLibraryUsageDescription` in Info.plist
- Apple Sign-In is REQUIRED if you offer any social sign-in

### Google Play Store
- Custom IMEs are fully supported
- Must not use Accessibility Services for reading other apps (will be rejected)
- Must declare `BIND_INPUT_METHOD` permission
- Privacy policy required
- Data safety section must accurately describe what data is collected

### What Will NOT Get Rejected
- Custom keyboard that reads the current text field ✓
- Standalone app with paste/screenshot workflow ✓
- Share Sheet extension receiving text ✓
- On-device OCR ✓
- Network calls from keyboard for AI suggestions ✓

### What WILL Get Rejected
- Using Accessibility Services to read other apps' screens ✗
- Using `READ_SMS` without being a default SMS app ✗
- Reading notifications without clear justification ✗
- Claiming to read messages from other apps ✗

---

## 12. Technology Stack Summary

| Layer | Technology | Notes |
|-------|-----------|-------|
| Mobile App | React Native + Expo SDK 52 | Cross-platform, 70% built |
| iOS Keyboard | Native Swift (UIInputViewController) | Must be native for ~30MB memory limit |
| Android Keyboard | Native Kotlin (InputMethodService) | Native for performance |
| Backend | Express + TypeScript + OpenAI | Already deployed |
| Database | Supabase (PostgreSQL) | Already set up |
| Auth | Supabase (Google, Apple, email) | Shared across platforms |
| OCR | Apple Vision (iOS) / ML Kit (Android) | On-device, private |
| Billing | Stripe | Already integrated |
| Hosting | Render.com | Already deployed |

---

## 13. Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Ship standalone app | Weeks 1-4 | App on TestFlight + Play Store internal |
| Phase 2: iOS keyboard | Weeks 5-7 | Keyboard extension in app bundle |
| Phase 3: Android keyboard | Weeks 8-10 | IME in app bundle |
| Phase 4: Production launch | Weeks 11-12 | App Store + Play Store live |

**Total: ~12 weeks to full multi-platform launch.**

---

## 14. What UI Stays the Same

The mobile app and keyboard use the exact same visual language as the Chrome extension:

- Purple brand palette (`#7616d0`)
- Poppins font family
- Purple question cards with pill-shaped option buttons
- Result cards with tone badges, "Best" indicator, collapsible reasoning
- Dynamics card with Interest/Tone/Pattern/Subtext
- Skeleton shimmer loading animation
- "X suggestions remaining" footer with unlock button

The only difference is the delivery mechanism — app screens instead of a browser modal, and keyboard pills instead of a full result screen.
