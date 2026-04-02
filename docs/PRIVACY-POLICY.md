# TextCoach — Privacy Policy

**Last Updated:** April 2, 2026

TextCoach ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use the TextCoach mobile application, keyboard extension, and related services (collectively, the "Service").

---

## 1. Information We Collect

### 1.1 Account Information
When you create an account, we collect:
- **Email address** (or identity provider profile if using Google or Apple Sign-In)
- **User ID** (a unique identifier generated upon account creation)
- **Subscription plan tier** (Free, Starter, or Pro)

### 1.2 Usage Data
We collect aggregate usage information to enforce plan limits and improve the Service:
- **Suggestion count** (number of suggestions generated per billing period)
- **Feature usage counts** (Quick Suggest, Coach Me, Conversation Dynamics)
- **Timestamps** of requests (date only, not tied to conversation content)

### 1.3 Device Information
We may collect basic device information for crash reporting and compatibility:
- Device type and operating system version
- App version

---

## 2. Information We Do NOT Collect

### 2.1 Conversation Content
**We never store your conversation content.** When you paste a conversation or submit text for analysis, it is sent to our API for processing and immediately discarded after the response is generated. No conversation text is written to any database, log file, or persistent storage.

### 2.2 Keystroke Data
The TextCoach keyboard extension does **not** log keystrokes. It does not monitor, record, or transmit anything you type. The keyboard only processes text when you explicitly tap the "Suggest" button.

### 2.3 Screenshots and Images
When you use the screenshot OCR feature, image processing occurs **entirely on your device**. Screenshots and images are never sent to our servers or any third party. Only the extracted text (after you review and confirm it) is sent for suggestion generation, and that text is handled under the same no-storage policy described in Section 2.1.

---

## 3. How Conversations Are Processed

When you request suggestions, the following occurs:

1. Your conversation text is sent over an encrypted (TLS) connection to our API server.
2. Our server forwards the text to OpenAI's API for AI-powered analysis and suggestion generation.
3. The generated suggestions are returned to your device.
4. The conversation text is discarded from memory. It is never written to a database or log.

**OpenAI's data usage policy:** We use OpenAI's API, which does **not** use API inputs or outputs for model training. OpenAI retains API data for up to 30 days solely for abuse monitoring, after which it is deleted. For details, see [OpenAI's API Data Usage Policy](https://openai.com/policies/api-data-usage-policies).

---

## 4. Keyboard Extension

The TextCoach keyboard extension requires "Full Access" on iOS to connect to the internet for generating suggestions. Full Access is used **exclusively** for this purpose.

The keyboard extension:
- Does **not** log keystrokes
- Does **not** monitor what you type in other apps
- Does **not** transmit any data until you explicitly tap "Suggest"
- Only sends the text you paste into the suggestion input field
- Follows the same no-storage policy for all conversation content

---

## 5. Third-Party Services

We use the following third-party services:

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| **Supabase** | Authentication and user account storage | Email, user ID, plan tier, usage counts |
| **Stripe** | Subscription billing and payment processing | Email, payment method (handled entirely by Stripe) |
| **OpenAI** | AI-powered suggestion generation | Conversation text (processed and discarded, not used for training) |
| **Apple / Google** | Sign-In authentication | Authentication tokens only |

We do not sell, rent, or share your personal information with any other third parties.

---

## 6. Data Retention

| Data Type | Retention |
|-----------|-----------|
| Account information (email, user ID) | Until account deletion |
| Subscription and billing data | As required by Stripe and applicable law |
| Usage counts | Until account deletion |
| Conversation content | **Never stored** — discarded immediately after processing |
| Screenshots / images | **Never leaves your device** |

---

## 7. Data Security

We protect your data using:
- TLS encryption for all data in transit
- Row-level security policies on our database
- Secure authentication via Supabase Auth
- Payment processing handled entirely by Stripe (PCI-compliant)

---

## 8. Your Rights

You have the right to:

- **Access your data:** View your account information and usage statistics within the app.
- **Export your data:** Request a copy of all data we hold about you by contacting us.
- **Delete your account:** Delete your account and all associated data from within the app (Settings > Account > Delete Account) or by contacting us. Account deletion removes your email, user ID, usage counts, and subscription records from our systems.
- **Opt out:** You can stop using the Service at any time. Uninstalling the app removes the keyboard extension and all local data.

For users in the European Economic Area (EEA), you have additional rights under GDPR, including the right to data portability, the right to restrict processing, and the right to lodge a complaint with a supervisory authority.

---

## 9. Children's Privacy

TextCoach is not designed for or directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected information from a child under 13, we will delete it promptly. If you believe a child under 13 has provided us with personal information, please contact us.

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy within the app and updating the "Last Updated" date. Your continued use of the Service after changes are posted constitutes acceptance of the revised policy.

---

## 11. Contact Us

If you have questions or concerns about this Privacy Policy, please contact us at:

**Email:** privacy@textcoach.app

---

*This privacy policy is effective as of April 2, 2026.*
