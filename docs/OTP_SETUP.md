# PRABRIX AI - Phone OTP & SMS Provider Configuration Guide
**Document Version:** 1.0.0 (Phase 2B)  
**Target Compliance:** Telecom Regulatory Authority of India (TRAI) DLT Mandate  

---

## 1. Overview of Mobile OTP Architecture
PRABRIX AI uses mobile phone numbers with country codes (default: `+91` for India) as a primary identity and trust verification mechanism.

### Operating Modes
1. **Production Mode (Live SMS Provider):**  
   Sends real SMS verification codes via an enterprise SMS gateway integrated with Supabase Auth (e.g. Twilio, MessageBird, Vonage).
2. **Demo / Local Testing Mode (`VITE_OTP_DEMO_MODE=true`):**  
   Active when no live SMS provider credentials are configured.  
   - A prominent amber banner is displayed on the OTP screen:  
     **"Demo mode: no real SMS is sent."**  
   - The UI displays simulated test verification without ever falsely claiming a real carrier message was dispatched.  
   - **Zero Logging Policy:** In compliance with security standards, OTP codes, plaintext passwords, and authorization tokens are **never** logged to server logs, browser console, or persistent storage.

---

## 2. Indian SMS Delivery & TRAI DLT Mandate
Under TRAI regulations, all commercial, transactional, and OTP SMS delivered to Indian mobile numbers (`+91`) must comply with the Distributed Ledger Technology (DLT) framework.

### Mandatory DLT Steps for India (+91)
1. **Entity Registration:**  
   Register your organization as a Principal Entity (PE) on a recognized telecom DLT portal (e.g., Vilpower / Jio / Airtel / Vodafone Idea / BSNL).
2. **Header (Sender ID) Registration:**  
   Register an approved 6-character alphabetic sender header (e.g., `PRABRX` or `PRABAI`). Numeric or arbitrary headers are blocked by Indian telecom operators for transactional OTPs.
3. **Content Template Registration:**  
   Submit the exact OTP template for approval. Example:  
   ```text
   Your PRABRIX AI verification code is {#var#}. Valid for 10 minutes. Do not share this OTP with anyone. - PRABRIX
   ```
4. **Template ID Mapping:**  
   Once approved, the registered Template ID and Entity ID must be mapped into the Twilio/SMS gateway settings to prevent telecommunication filtering and regulatory rejection.

---

## 3. Configuring Supabase with Twilio SMS Gateway

To enable live SMS delivery through Supabase Auth:

### 3.1 Gather Twilio Credentials
- **Account SID**
- **Auth Token**
- **Twilio Phone Number** or **Messaging Service SID**

### 3.2 Configure in Supabase Dashboard
1. Navigate to **Authentication** > **Providers** > **Phone**.
2. Toggle **Enable Phone Provider** to `ON`.
3. Select SMS Provider: **Twilio** (or your selected vendor).
4. Enter your Twilio credentials:
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `[Encrypted Secret]`
   - Twilio Phone Number / Messaging Service SID: `MGxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
5. Under **SMS Template**, ensure the message body matches your TRAI DLT approved template.
6. Under **Phone Auth Settings**:
   - OTP Expiration: Set to 600 seconds (10 minutes).
   - Rate Limits: Configure maximum 5 verification attempts per 10 minutes per phone number.

### 3.3 Test Phone Numbers in Supabase (Pre-DLT Testing)
Before DLT approval is completed, add authorized developer test numbers in the Supabase Dashboard:
- **Authentication** > **Providers** > **Phone** > **Test Phone Numbers**
- Example: `+919840112233` with fixed test OTP `123456`.
- Supabase will accept these numbers without sending carrier SMS or incurring gateway costs.

---

## 4. Environment Variables (`.env.example`)

Configurable settings in `.env.example`:

```bash
# Supabase Project Credentials (safe placeholders only)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-placeholder

# OTP & Phone Verification
VITE_OTP_DEMO_MODE=true
VITE_DEFAULT_COUNTRY_CODE=+91
VITE_OTP_COOLDOWN_SECONDS=30
VITE_MAX_OTP_ATTEMPTS=5
VITE_REQUIRE_PHONE_VERIFIED=true

# Server-Side SMS Gateway (for Node server / Edge Functions)
TWILIO_ACCOUNT_SID=placeholder-twilio-sid
TWILIO_AUTH_TOKEN=placeholder-twilio-token
TWILIO_MESSAGING_SERVICE_SID=placeholder-messaging-service-sid
```

---

## 5. Security & Privacy Rules
- **No Client-Side Token Interception:** Phone verification tokens are validated directly against Supabase Auth endpoints.
- **Strict Role Integrity:** Successful OTP verification updates `profiles.is_verified` via a verified backend trigger or authenticated session check, never from a client-supplied parameter.
- **Masking:** Phone numbers are displayed masked (e.g. `+91 98*** **233`) in UI screens to preserve personal privacy.
