# Environment Variables Troubleshooting

If you're experiencing issues with environment variables not being loaded in your Vite application, here are some steps to troubleshoot:

## 1. Check Your .env File

Make sure your `.env` file exists and is in the correct location. For a Vite application, it should be in the root of your project directory (the `ui` folder).

```
ui/
├── .env           <-- Should be here
├── package.json
├── src/
└── ...
```

## 2. Make Sure Your .env File Format is Correct

Your `.env` file should contain values in this format:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:8888/callback
```

Make sure:
- There are no spaces around the equal sign
- There are no quotes around your values
- All variable names have the `VITE_` prefix

## 3. Restart Your Development Server

Vite loads environment variables at startup. If you've added or changed your `.env` file, you need to restart your development server:

```
npm run dev
```

## 4. Check for Typos

Make sure the variable names in your code match exactly what's in your `.env` file.

## 5. Vite Only Exposes Variables with VITE_ Prefix

In Vite, only environment variables prefixed with `VITE_` are exposed to your client-side code. This is a security feature.

## 6. Create .env from demo-env

If you haven't done so already, create your `.env` file from the demo-env:

```
cp demo-env .env
```

Then edit the `.env` file to include your actual Spotify API credentials.

## 7. Manual Check

You can manually check if your environment variables are being loaded by adding this to your code:

```javascript
console.log('Environment variables:', {
  VITE_SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  VITE_SPOTIFY_REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI
});
```

## 8. Try Using .env.local Instead

If you're still having issues, try creating a file named `.env.local` instead of `.env`. Vite prioritizes variables from `.env.local` over those from `.env`.

## 9. Check for Environment Variables Conflicts

Make sure you don't have conflicting environment variables set in your system or in other environment files (like `.env.development`).

## 10. Check Vite Configuration

Make sure your Vite configuration isn't overriding environment variables. Check your `vite.config.ts` file for any custom environment variable handling. 