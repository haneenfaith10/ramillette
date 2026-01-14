# Vercel Deployment Setup Guide

## Environment Variables Required in Vercel

Make sure to set these environment variables in your Vercel project settings:

1. **VITE_BASE_URL** - Your backend API URL
   - Example: `https://your-api-domain.com`
   - This is critical for all API calls

2. **VITE_LOCATION_KEY** - Your ipinfo.io API token (optional but recommended)
   - Get it from: https://ipinfo.io/
   - Used for automatic country detection

## Vercel Project Settings

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the variables above for:
   - **Production**
   - **Preview** (optional)
   - **Development** (optional)

## Build Settings in Vercel

The `vercel.json` file is already configured with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: `vite`

## Common Issues and Solutions

### Issue: Site loads but APIs fail
**Solution**: Check that `VITE_BASE_URL` is set correctly in Vercel environment variables

### Issue: Mobile site not loading
**Solution**: 
1. Clear browser cache on mobile
2. Check Vercel deployment logs for errors
3. Verify all environment variables are set

### Issue: Routing not working (404 on refresh)
**Solution**: The `vercel.json` already has rewrites configured. If still having issues, check:
- Build output directory is `dist`
- `index.html` exists in `dist` folder after build

## Testing After Deployment

1. Test on desktop browser
2. Test on mobile device (clear cache first)
3. Check browser console for errors
4. Check Network tab to see if API calls are working

## Build Command

```bash
npm run build
```

This will create a `dist` folder with all the production files.

