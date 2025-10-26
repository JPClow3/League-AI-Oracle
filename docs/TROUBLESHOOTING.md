# Troubleshooting Guide - League AI Oracle

## Common Issues & Solutions

### 🔴 App Won't Load / White Screen

**Symptoms:**
- Blank white screen on startup
- Stuck on loading screen
- Error: "Failed to load champion data"

**Solutions:**

1. **Clear Browser Cache**
   ```
   Chrome: Ctrl+Shift+Delete → Clear cached images and files
   Firefox: Ctrl+Shift+Delete → Cached Web Content
   Safari: Cmd+Option+E
   ```

2. **Check Internet Connection**
   - App requires internet for first load
   - Champion data fetched from Riot's Data Dragon API
   - Try: `https://ddragon.leagueoflegends.com/api/versions.json`

3. **Disable Browser Extensions**
   - Ad blockers may interfere
   - Privacy extensions may block API calls
   - Try: Open in Incognito/Private mode

4. **Check Console for Errors**
   ```
   F12 → Console tab
   Look for red error messages
   ```

**If still broken:**
- Check if https://ddragon.leagueoflegends.com is accessible
- Try different browser
- Report issue with console errors

---

### ⚠️ AI Analysis Not Working

**Symptoms:**
- "Analyze" button does nothing
- Stuck on "Analyzing draft..."
- Error: "The AI returned an invalid response"

**Solutions:**

1. **Verify Complete Draft**
   - Both teams need 5 champions picked
   - Check for empty slots
   - Refresh and try again

2. **Check API Key**
   ```
   Developer: Verify VITE_GEMINI_API_KEY is set
   Production: Contact support
   ```

3. **Network Issues**
   - Check browser console for network errors
   - Verify firewall isn't blocking AI API
   - Try again in a few minutes (rate limiting)

4. **Try Different Model**
   - Flash model: Faster but may be unavailable
   - Pro model: Slower but more reliable
   - Settings → AI Model Selection

**Emergency Fix:**
```javascript
// Clear AI cache in browser console
localStorage.removeItem('lastAIResponse');
location.reload();
```

---

### 💾 Data Not Saving / Progress Lost

**Symptoms:**
- Profile resets on refresh
- Playbook entries disappear
- Settings don't persist

**Solutions:**

1. **Check Browser Storage**
   ```
   F12 → Application → IndexedDB
   Should see: "draftwise-db"
   
   If missing or errors:
   - Browser may be in Private/Incognito mode
   - Storage quota may be full
   - Browser doesn't support IndexedDB
   ```

2. **Clear Storage and Restart**
   ```javascript
   // In browser console
   indexedDB.deleteDatabase('draftwise-db');
   localStorage.clear();
   location.reload();
   ```
   ⚠️ **Warning: This deletes all local data**

3. **Check Available Space**
   ```javascript
   // In browser console
   navigator.storage.estimate().then(estimate => {
     console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
   });
   ```

4. **Enable Persistent Storage**
   - Chrome: Site settings → Permissions → Storage
   - Firefox: Automatically persists
   - Safari: Automatically managed

**Backup Your Data:**
```javascript
// Export profile to JSON
const profile = await db.userProfile.get('currentUser');
console.log(JSON.stringify(profile, null, 2));
// Copy output and save to file
```

---

### 🎮 Champion Images Not Loading

**Symptoms:**
- Broken image icons
- Champions show as grey boxes
- "Failed to load resource" errors

**Solutions:**

1. **Check Image URLs**
   - Images load from https://ddragon.leagueoflegends.com
   - Verify URL is accessible
   - Check if CDN is blocked by firewall

2. **Wait for Lazy Loading**
   - Images load as you scroll
   - Wait a few seconds after scrolling
   - Scroll slowly for better loading

3. **Refresh Champion Data**
   ```javascript
   // In browser console
   localStorage.removeItem('championDataCache');
   location.reload();
   ```

4. **Check Browser Console**
   - Look for CORS errors
   - Look for 404/403 errors
   - May indicate CDN issue

---

### 🎨 UI Looks Broken / Misaligned

**Symptoms:**
- Buttons overlapping
- Text cut off
- Layout issues
- Animations stuttering

**Solutions:**

1. **Zoom Level**
   - Reset browser zoom: `Ctrl+0`
   - App designed for 100% zoom
   - May work at 90-110%

2. **Screen Size**
   - Minimum: 360px wide (mobile)
   - Recommended: 1280px+ (desktop)
   - Try: Resize browser window

3. **Clear CSS Cache**
   ```
   Hard refresh: Ctrl+Shift+R (Ctrl+Shift+Delete on Mac)
   Or: DevTools → Network → Disable cache
   ```

4. **Check Theme**
   - Settings → Theme
   - Try switching Dark ↔ Light
   - Some contrast issues in Light mode (known issue)

---

### 🐌 App Running Slow / Laggy

**Symptoms:**
- Slow animations
- Delayed button clicks
- Champion grid stuttering
- High CPU/memory usage

**Solutions:**

1. **Close Other Tabs**
   - Each tab uses resources
   - Close unused tabs
   - Restart browser

2. **Disable Animations**
   ```
   Settings → Accessibility → Reduce Motion
   (Not yet implemented - coming soon)
   ```

3. **Check Performance**
   ```
   F12 → Performance → Record
   Interact with app → Stop
   Look for long tasks (>50ms)
   ```

4. **Reduce Visual Quality**
   - Disable backdrop blur: Check Modal code
   - Reduce animation count
   - Use simpler theme

**Performance Fixes:**
```javascript
// Disable Framer Motion animations temporarily
localStorage.setItem('disableAnimations', 'true');
location.reload();
```

---

### 📱 Mobile Issues

**Symptoms:**
- Touch targets too small
- Modal doesn't close
- Keyboard covers inputs
- Scroll doesn't work

**Solutions:**

1. **Use Bottom Navigation**
   - Tap icons at bottom
   - Swipe between pages
   - Double-tap to confirm

2. **Modal Issues**
   - Tap backdrop (grey area) to close
   - Swipe down on modal
   - Use X button in top-right

3. **Keyboard Issues**
   - Scroll page before focusing input
   - Use "Done" button on keyboard
   - Try landscape mode

4. **Install as PWA**
   ```
   Chrome: Menu → Add to Home Screen
   Safari: Share → Add to Home Screen
   
   Benefits:
   - Fullscreen mode
   - Better performance
   - Offline access
   ```

---

### 🔐 Private/Incognito Mode Issues

**Symptoms:**
- Profile not saving
- Settings reset every session
- Can't access playbook

**Why:**
- IndexedDB disabled in private mode
- LocalStorage cleared on exit
- No persistent storage

**Solutions:**

1. **Use Normal Mode**
   - Only way to persist data
   - Profile won't save otherwise

2. **Temporary Workarounds**
   - Export profile before closing
   - Use same session
   - Don't close tab

3. **Future Feature**
   - Cloud sync (planned)
   - Account system (planned)
   - Will work in private mode

---

### 🌐 Offline Mode Issues

**Symptoms:**
- Error: "No internet connection"
- Can't analyze drafts
- Champion data missing

**Solutions:**

1. **Check Service Worker**
   ```
   F12 → Application → Service Workers
   Should show: "Activated and running"
   
   If not: Update → Unregister → Refresh
   ```

2. **What Works Offline:**
   ✅ Browse champion pool (if cached)
   ✅ View saved drafts
   ✅ Edit profile
   ✅ Read academy lessons
   
   ❌ AI analysis (requires internet)
   ❌ Fetch new champion data
   ❌ Generate tier lists

3. **Prepare for Offline Use**
   - Visit all pages while online (caches resources)
   - Complete one draft analysis (caches champions)
   - View profile (caches avatar images)

---

### 🎯 Draft Arena Bot Issues

**Symptoms:**
- Bot takes too long to pick
- Bot makes nonsensical picks
- Arena crashes during draft

**Solutions:**

1. **Restart Arena**
   - Click "Reset" button
   - Start new draft
   - Try different bot difficulty

2. **Check Bot Selection**
   - Some bots have quirks
   - "Meta Slave" requires S-tier data
   - "One Trick" needs specific champion

3. **Report AI Issues**
   - Note bot persona
   - Note what they picked
   - Check console for errors

---

## Advanced Troubleshooting

### Developer Tools

**View Draft State:**
```javascript
// In browser console
const draftState = JSON.parse(localStorage.getItem('draftState'));
console.table(draftState.blue.picks.map(p => p.champion?.name));
```

**Check IndexedDB:**
```javascript
// View all stored data
const request = indexedDB.open('draftwise-db');
request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('Stores:', Array.from(db.objectStoreNames));
};
```

**Force Refresh Champion Data:**
```javascript
localStorage.removeItem('championDataCache');
const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
console.log('Latest version:', (await versions.json())[0]);
location.reload();
```

**Check API Key (Developers):**
```javascript
console.log('API Key set:', !!import.meta.env.VITE_GEMINI_API_KEY);
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `QUOTA_EXCEEDED` | Storage full | Clear browser data |
| `NS_ERROR_DOM_QUOTA_REACHED` | Firefox storage full | Clear cache |
| `AbortError` | Request cancelled | Normal - ignore |
| `Failed to fetch` | Network error | Check internet |
| `Invalid JSON` | AI parsing error | Retry analysis |
| `401 Unauthorized` | API key invalid | Check environment |
| `429 Too Many Requests` | Rate limited | Wait 1 minute |
| `503 Service Unavailable` | AI API down | Try again later |

---

## When to Report a Bug

Report if:
- ✅ Error persists after clearing cache
- ✅ Affects core functionality
- ✅ Reproducible steps
- ✅ Error message in console

Don't report if:
- ❌ Works after refresh
- ❌ Only in private mode
- ❌ Custom browser modifications
- ❌ Unsupported browser

**How to Report:**
1. Open browser console (F12)
2. Copy error messages
3. Note your browser & version
4. List steps to reproduce
5. Submit to GitHub Issues

---

## Browser Compatibility

### Fully Supported ✅
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Partial Support ⚠️
- Safari 13 (some features)
- Older mobile browsers

### Not Supported ❌
- Internet Explorer
- Opera Mini
- Browsers without ES6+

---

## Getting Help

1. **Check this guide** - Most issues covered here
2. **Search GitHub Issues** - May be known issue
3. **Browser Console** - Check for errors (F12)
4. **Ask Community** - Discord/Reddit (coming soon)
5. **Report Bug** - GitHub Issues with details

**Need immediate help?**
- Clear cache and refresh (fixes 80% of issues)
- Try incognito mode (tests if extension issue)
- Try different browser (tests if browser issue)

---

## Prevention Tips

✅ **Do:**
- Use modern browser
- Keep browser updated
- Allow storage permissions
- Clear cache occasionally
- Export important data

❌ **Don't:**
- Use private mode for regular use
- Block necessary APIs
- Modify IndexedDB manually
- Run multiple tabs simultaneously
- Use browser developer mode

---

## FAQ

**Q: Will I lose my data if I clear cache?**
A: No! Profile saved in IndexedDB (separate from cache). Clearing cache only removes champion images.

**Q: How much storage does the app use?**
A: ~15-20MB typically (5MB champion data + profiles)

**Q: Can I play offline?**
A: Partially. Browse cached data, but can't do AI analysis.

**Q: Why is AI analysis slow?**
A: AI processing takes 5-15 seconds. Pro model slower than Flash.

**Q: Can I import/export my profile?**
A: Not yet. Cloud sync planned for future update.

**Q: How do I reset everything?**
A: Settings → Advanced → Reset All Data (coming soon)
Or manually: IndexedDB + localStorage clear

---

**Last Updated:** 2025-10-26  
**Version:** 1.0.0

