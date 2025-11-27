# Passkey Troubleshooting Guide

## Issue: Passkey registered but not available during login

### What I've Added:
1. **Server-side logging** in voter login route to show:
   - How many credentials are found in the database
   - What credential IDs are being sent to the browser
   - The rpID being used

2. **Server-side logging** in voter registration route to show:
   - What credential is being stored
   - The rpID and origin used during registration

3. **Client-side logging** in the cast vote form to show:
   - When authentication starts
   - What options are received from the server
   - Browser API responses

### How to Debug:

1. **Clear existing passkeys** (if any):
   - Go to your browser settings
   - Search for "Passkeys" or "Security Keys"
   - Remove any passkeys for localhost/aptsaicuf.com

2. **Register a new voter**:
   - Open browser console (F12)
   - Register as a voter
   - Watch the console for the registration log showing:
     ```
     Storing voter passkey credential: {
       voterId: "...",
       rpID: "...",
       origin: "..."
     }
     ```
   - **Note the rpID and origin values**

3. **Try to cast a vote**:
   - Keep console open
   - Enter the voter ID
   - Click "Authenticate and Continue"
   - Watch for logs showing:
     ```
     Looking up passkey credentials for voter: {...}
     Found credentials: { count: 1, ... }
     Sending allowCredentials to browser: { rpID: "...", ... }
     ```
   - **Compare the rpID with the one from registration**

### Common Issues:

1. **rpID Mismatch**:
   - Registration: `localhost`
   - Login: `127.0.0.1` (or vice versa)
   - **Solution**: Always use the same URL

2. **NEXT_PUBLIC_SITE_URL Changed**:
   - If you changed this env var between registration and login
   - **Solution**: Re-register with the current settings

3. **Browser Doesn't Show Passkey**:
   - The credential exists but browser can't find it
   - **Solution**: Check if rpID matches exactly

4. **Redis Connection Issues**:
   - Challenge might not be stored/retrieved
   - Check for Redis connection errors in logs

### Expected Flow:

**Registration:**
```
1. POST /api/auth/passkey/voter/register (step: options)
   → Server generates options with rpID
   → Browser creates credential
2. POST /api/auth/passkey/voter/register (step: verify)
   → Server stores credential in database
   → Console shows: "Storing voter passkey credential"
```

**Login:**
```
1. POST /api/auth/passkey/voter/login (step: options)
   → Server looks up credentials from database
   → Console shows: "Found credentials: { count: X }"
   → Server sends allowCredentials to browser
2. Browser prompts for passkey (fingerprint/Face ID/PIN)
3. POST /api/auth/passkey/voter/login (step: verify)
   → Server verifies and issues JWT token
```

### What to Check in Console:

1. During registration, verify:
   - ✅ "Storing voter passkey credential" appears
   - ✅ rpID matches your current domain

2. During login, verify:
   - ✅ "Found credentials: { count: 1 }" (or more)
   - ✅ rpID matches the registration rpID
   - ✅ "Calling browser passkey API..." appears
   - ❌ If browser doesn't prompt, rpID likely doesn't match

### Quick Fix:

If you're testing locally:
1. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env`
2. Always access via `http://localhost:3000` (not 127.0.0.1)
3. Clear all passkeys and re-register
4. Try login again

For production (aptsaicuf.com):
1. Ensure `NEXT_PUBLIC_SITE_URL=https://aptsaicuf.com` in production env
2. Access only via `https://aptsaicuf.com`
3. Passkeys registered on localhost won't work on production (and vice versa)
