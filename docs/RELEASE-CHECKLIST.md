# TextCoach — Release Checklist

Pre-submission checklist for App Store and Play Store releases.

---

## Code Signing & Build Configuration

- [ ] **iOS provisioning profiles** are valid and not expired
- [ ] **iOS distribution certificate** is active in Apple Developer account
- [ ] **Android keystore** is generated and securely stored
- [ ] **Keystore credentials** are backed up (alias, passwords) — never committed to source control
- [ ] **Bundle identifier** matches across Xcode, EAS config, and App Store Connect (e.g., `app.textcoach.mobile`)
- [ ] **Android package name** matches across build.gradle and Play Console (e.g., `app.textcoach.mobile`)
- [ ] **Version number** and **build number** are incremented from the previous submission

---

## App Assets

- [ ] **App icon** generated for all required sizes (iOS: 1024x1024 App Store icon + all device sizes; Android: 512x512 Play Store icon + adaptive icon)
- [ ] **Splash screen** configured and displays correctly on all screen sizes
- [ ] **App Store screenshots** taken for all required sizes:
  - iPhone 6.7" (1290 x 2796)
  - iPhone 6.5" (1284 x 2778)
  - iPhone 5.5" (1242 x 2208)
  - iPad Pro 12.9" (2048 x 2732) — if supporting iPad
- [ ] **Play Store screenshots** taken:
  - Phone (16:9 or 9:16, minimum 320px, maximum 3840px)
  - At least 2 screenshots, up to 8
- [ ] **Feature graphic** for Play Store (1024 x 500)
- [ ] Screenshots show key flows: Quick Suggest, Coach Me, Conversation Dynamics, Keyboard Extension

---

## Store Listing Content

- [ ] **App name** set correctly in both stores
- [ ] **Subtitle** set (iOS, 30 chars max)
- [ ] **Short description** set (Play Store, 80 chars max)
- [ ] **Full description** set in both stores
- [ ] **Keywords** set (iOS, 100 chars max)
- [ ] **Category** set (Primary: Productivity, Secondary: Social Networking)
- [ ] **Age rating / content rating** questionnaire completed
- [ ] **"What's New"** text written for current version
- [ ] **Privacy policy URL** is live and publicly accessible
- [ ] **Support URL** is live
- [ ] **Marketing URL** set (if available)

---

## Privacy & Compliance

- [ ] **Privacy policy** hosted at a public URL (not just in the repo)
- [ ] **App Privacy Details** completed in App Store Connect (data types collected, usage purposes)
- [ ] **Data safety form** completed in Google Play Console
- [ ] **Keyboard extension** privacy disclosure included (no keystroke logging)
- [ ] **Full Access justification** prepared for App Review (required for iOS keyboard extensions)
- [ ] **GDPR compliance** reviewed (data export, account deletion)
- [ ] **CCPA compliance** reviewed if applicable

---

## EAS Build & Testing

- [ ] **EAS build** runs successfully for iOS (`eas build --platform ios`)
- [ ] **EAS build** runs successfully for Android (`eas build --platform android`)
- [ ] **TestFlight build** uploaded and available for testing
- [ ] **Play Store internal testing track** build uploaded and available
- [ ] Tested on **physical iOS device** (not just simulator)
- [ ] Tested on **physical Android device** (not just emulator)
- [ ] App launches without crash on first open

---

## Core Functionality

- [ ] **Quick Suggest** flow works end-to-end (paste conversation, receive suggestions)
- [ ] **Coach Me** flow works end-to-end (answer questions, receive tailored suggestions)
- [ ] **Conversation Dynamics** analysis displays correctly
- [ ] **Suggestions display** with tone labels and "why this works" reasoning
- [ ] **Copy to clipboard** works on all suggestion cards
- [ ] **Screenshot OCR** correctly extracts text from conversation screenshots
- [ ] **Keyboard extension** installs and works on physical iOS device
- [ ] **Keyboard extension** installs and works on physical Android device
- [ ] Keyboard "Suggest" button generates and displays suggestions
- [ ] Keyboard "Insert" correctly pastes selected response into the text field

---

## Authentication

- [ ] **Email/password sign-up** works
- [ ] **Email/password sign-in** works
- [ ] **Google Sign-In** works on iOS
- [ ] **Google Sign-In** works on Android
- [ ] **Apple Sign-In** works on iOS
- [ ] **Password reset** flow works
- [ ] **Sign out** works and clears session
- [ ] **Account deletion** works and removes all user data

---

## Billing & Subscriptions

- [ ] **Stripe checkout** opens correctly for Starter plan
- [ ] **Stripe checkout** opens correctly for Pro plan
- [ ] **Subscription status** reflects correctly after purchase
- [ ] **Free tier limits** enforced (5 suggestions/week)
- [ ] **Starter tier limits** enforced (30 suggestions/month)
- [ ] **Pro tier** allows unlimited suggestions
- [ ] **Plan upgrade** works
- [ ] **Plan downgrade** works
- [ ] **Subscription cancellation** works and reverts to Free tier at period end
- [ ] **Restore purchases** works (if applicable)

---

## Error Handling & Edge Cases

- [ ] **No internet** state shows appropriate message
- [ ] **API errors** display user-friendly error messages (not raw errors)
- [ ] **Empty conversation input** is handled (validation message shown)
- [ ] **Rate limit exceeded** shows upgrade prompt
- [ ] **Auth token expiry** is handled gracefully (re-authentication flow)
- [ ] **Keyboard extension** handles no-internet state
- [ ] **Long conversations** do not crash or timeout (test with 50+ messages)
- [ ] **App backgrounding and foregrounding** does not lose state

---

## Accessibility

- [ ] **VoiceOver** (iOS) can navigate all screens and interactive elements
- [ ] **TalkBack** (Android) can navigate all screens and interactive elements
- [ ] All interactive elements have **accessible labels**
- [ ] **Color contrast** meets WCAG AA standards
- [ ] **Dynamic Type** (iOS) / **Font scaling** (Android) does not break layout
- [ ] Suggestion cards are **readable by screen readers** (tone label, suggestion text, reasoning)

---

## Performance

- [ ] App **cold start** time is under 3 seconds
- [ ] **Suggestion generation** completes within a reasonable time (under 10 seconds)
- [ ] No **memory leaks** during extended use
- [ ] App does not **drain battery** excessively in background

---

## Final Submission

- [ ] All checklist items above are complete
- [ ] **Internal team review** passed
- [ ] **Beta tester feedback** addressed
- [ ] **App Review notes** prepared (explain keyboard Full Access, AI usage, any non-obvious features)
- [ ] Submit to **App Store Review**
- [ ] Submit to **Play Store Review**
- [ ] Monitor review status and respond to any reviewer questions within 24 hours
