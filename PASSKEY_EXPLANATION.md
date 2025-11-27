# Passkey Authentication - How It Works

## Your Current Situation

Based on the logs, here's what's happening:

### Registration (Working ✅)
```
Voter ID: VOTER-1764235979475-6479
Database ID: 17
Passkey: Successfully stored
```

### Login Attempt (Failed ❌)
```
Voter ID: VOTER-1764095648324-2087
Database ID: 2
Passkey: Found 1 credential
Browser: "No passkey available"
```

## The Problem

**You're using DIFFERENT voter IDs for registration and login!**

- Registered with: `VOTER-1764235979475-6479`
- Trying to login with: `VOTER-1764095648324-2087`

Each passkey is **permanently linked** to the voter ID it was registered with. You cannot use a passkey from one voter ID to authenticate as a different voter ID.

## The Solution

### Option 1: Use the Correct Voter ID
Use the **same voter ID** you registered with:
1. Go to cast vote page
2. Enter: `VOTER-1764235979475-6479` (the one you registered)
3. Click "Authenticate and Continue"
4. Your device will recognize the passkey ✅

### Option 2: Register the New Voter ID
If you want to use `VOTER-1764095648324-2087`:
1. Go to voter registration
2. Register this voter ID
3. Set up a passkey for THIS voter ID
4. Then you can use it to cast a vote

## How Passkeys Work

Think of it like a physical key:
- **Voter ID** = Your apartment number
- **Passkey** = The key to that apartment
- You can't use apartment 17's key to open apartment 2

### Technical Details:
1. When you register a passkey, it's stored with:
   - `voterId` (database ID, e.g., 17)
   - `credentialId` (unique identifier for the passkey)
   - `publicKey` (cryptographic public key)

2. When you try to login:
   - Server looks up passkeys for that voter ID
   - Sends credential IDs to browser
   - Browser checks if it has a matching passkey
   - If voter ID doesn't match, browser says "no passkey found"

## Verification Steps

1. **Check your voter ID card/download** - What voter ID did you register?
2. **Use that exact voter ID** when casting a vote
3. **Browser will recognize the passkey** and prompt for fingerprint/Face ID

## Common Mistakes

❌ Registering with one voter ID, logging in with another
❌ Typing the voter ID incorrectly
❌ Using HTTP instead of HTTPS
✅ Using the exact same voter ID for both registration and login
✅ Accessing via HTTPS (https://aptsaicuf.com)

## Need Help?

If you're still having issues:
1. Check the browser console for the logs
2. Verify the voter ID matches exactly
3. Make sure you're on HTTPS
4. Try clearing passkeys and re-registering
