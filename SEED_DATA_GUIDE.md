# Seed Data Guide - Testing Animated Masonry with Fake Data

## Overview

This guide explains how to use the data seeding script to populate your Firebase Realtime Database with fake user entries for testing the animated masonry display.

---

## Quick Start

### 1. Prerequisites

Make sure you have:
- ✅ Node.js installed
- ✅ Firebase Realtime Database configured
- ✅ `.env.local` file with Firebase credentials
- ✅ Next.js dev server ready to run

### 2. Basic Usage

```bash
# Default: Add 100 entries with 500ms delay between each
npm run seed

# Fast: Add 100 entries with 100ms delay (faster testing)
npm run seed:fast

# Slow: Add 100 entries with 2000ms delay (watch animations closely)
npm run seed:slow

# Clear existing data and add new entries
npm run seed:clear
```

### 3. Watch the Animation

1. **Start the Next.js dev server** (in a separate terminal):
   ```bash
   npm run dev
   ```

2. **Open the display page**:
   ```
   http://localhost:3000/display
   ```

3. **Run the seed script** (in another terminal):
   ```bash
   npm run seed
   ```

4. **Watch the magic!** ✨
   - New cards will appear in real-time
   - Animations continue smoothly
   - New items fade in without restarting existing animations

---

## Command Options

### Available Scripts

| Command | Entries | Delay | Description |
|---------|---------|-------|-------------|
| `npm run seed` | 100 | 500ms | Default balanced speed |
| `npm run seed:fast` | 100 | 100ms | Quick population for testing |
| `npm run seed:slow` | 100 | 2000ms | Slow for detailed observation |
| `npm run seed:clear` | 100 | 500ms | Clear data first, then seed |

### Custom Options

```bash
# Add custom number of entries
npm run seed -- --count 50

# Set custom delay (in milliseconds)
npm run seed -- --delay 1000

# Combine options
npm run seed -- --count 200 --delay 300

# Clear data before seeding with custom count
npm run seed -- --clear --count 150

# Fast seeding with custom count
npm run seed:fast -- --count 500
```

### Command Line Arguments

- `-c, --count <number>` - Number of entries to create (default: 100)
- `-d, --delay <number>` - Delay in ms between entries (default: 500)
- `--clear` - Clear existing data before seeding
- `--fast` - Quick seeding (100ms delay)
- `--slow` - Slow seeding (2000ms delay)
- `-h, --help` - Show help message

---

## What Data Is Generated

### User Entry Structure

Each fake entry contains:

```typescript
{
  name: string,        // e.g., "John Doe"
  imageURL: string,    // Random image from various sources
  timestamp: number    // Unix timestamp
}
```

### Sample Entry

```json
{
  "name": "Alice Johnson",
  "imageURL": "https://picsum.photos/seed/1234/600/800",
  "timestamp": 1738234567890
}
```

### Name Generation

- Uses **Faker.js** to generate realistic names
- Format: `FirstName LastName`
- Examples:
  - "Emma Wilson"
  - "Michael Chen"
  - "Sophia Rodriguez"
  - "Liam O'Connor"

### Image Sources

The script uses multiple image sources for variety:

1. **Picsum Photos** - High quality random images
   - `https://picsum.photos/seed/{seed}/600/800`
   - Various aspect ratios (portrait, square, landscape)

2. **Lorem Flickr** - Themed images
   - `https://loremflickr.com/600/800/person?random={seed}`
   - People and face themes

3. **UI Avatars** - Generated avatars
   - `https://ui-avatars.com/api/?name=John+Doe&size=600`
   - Colorful initials-based avatars

4. **Pravatar** - Random avatar library
   - `https://i.pravatar.cc/600?img={1-70}`
   - 70 different avatar options

### Timestamp Generation

- Spread over the last 30 days
- Each entry has a unique timestamp
- Sorted by timestamp (newest first in display)

---

## Image Domains Configuration

### Already Configured

The following image domains are pre-configured in `next.config.ts`:

✅ `picsum.photos` - Random images
✅ `i.pravatar.cc` - Avatar library
✅ `randomuser.me` - Random user generator
✅ `loremflickr.com` - Flickr placeholder images
✅ `ui-avatars.com` - Generated avatars
✅ `cloudflare-ipfs.com` - IPFS gateway
✅ `avatars.githubusercontent.com` - GitHub avatars

**You don't need to add anything!** All domains are already added.

---

## Testing Scenarios

### Scenario 1: Initial Population
**Goal:** Fill empty database with data

```bash
# Clear existing data (if any)
npm run seed:clear

# Open display page
# Then run seed script and watch cards appear
```

**Expected Result:**
- Empty state message disappears
- Columns start animating
- Cards appear one by one with fade-in effect

---

### Scenario 2: Continuous Flow
**Goal:** Test real-time updates with smooth animations

```bash
# Seed with medium speed
npm run seed

# Watch display page while script runs
```

**Expected Result:**
- New cards continuously appear
- Existing animations don't restart
- New items fade in smoothly
- No flicker or jump in columns

---

### Scenario 3: Rapid Updates
**Goal:** Stress test animation performance

```bash
# Fast seeding with many entries
npm run seed:fast -- --count 500
```

**Expected Result:**
- Cards appear quickly
- Animations remain smooth (60fps)
- No lag or stuttering
- Memory usage stays stable

---

### Scenario 4: Slow Observation
**Goal:** Watch individual card animations in detail

```bash
# Slow seeding to observe each card
npm run seed:slow -- --count 20
```

**Expected Result:**
- Can see each fade-in animation clearly
- Hover effects work on new cards immediately
- Cards distribute evenly across columns
- Names are always visible

---

## Progress Output

### While Running

The script shows a visual progress bar:

```
[████████████████░░░░░░░░░░░░░░░░░░░░] 65.0% | 65/100 | Emma Wilson
```

- **Progress bar** - Visual representation
- **Percentage** - Completion percentage
- **Count** - Current/Total entries
- **Name** - Last added person's name

### Completion Summary

```
✅ Seeding completed successfully!

📊 Summary:
   - Total entries added: 100
   - Time taken: 50.0s

🎨 Open http://localhost:3000/display to see the animation!
```

---

## Troubleshooting

### Error: Firebase credentials not found

```
❌ Error: NEXT_PUBLIC_FIREBASE_DATABASE_URL is not set in .env.local
```

**Solution:**
1. Check `.env.local` file exists in project root
2. Verify all Firebase variables are set:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

---

### Error: Permission denied

```
❌ Error: PERMISSION_DENIED: Permission denied
```

**Solution:**
1. Check Firebase Realtime Database rules
2. For development, you can use (TESTING ONLY):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. For production, implement proper security rules

---

### Error: tsx not found

```
❌ Error: 'tsx' is not recognized as an internal or external command
```

**Solution:**
```bash
npm install --save-dev tsx
```

---

### Images not loading in display

**Solution:**
1. Check `next.config.ts` has all image domains (already configured)
2. Restart Next.js dev server: `Ctrl+C` then `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`

---

### Script runs but no data appears

**Solution:**
1. Check Firebase Database URL is correct
2. Verify internet connection
3. Check browser console for errors
4. Ensure display page is open: `http://localhost:3000/display`

---

## Performance Tips

### For Best Results

1. **Run dev server first**
   - Start `npm run dev` before seeding
   - Open display page in browser
   - Then run seed script

2. **Use appropriate delay**
   - **Testing animations**: Use `--slow` (2000ms)
   - **Filling database**: Use `--fast` (100ms)
   - **Balanced**: Use default (500ms)

3. **Monitor performance**
   - Open DevTools → Performance tab
   - Check FPS stays at ~60
   - Monitor memory usage

4. **Clear data periodically**
   - Use `npm run seed:clear` to start fresh
   - Prevents database from growing too large during testing

---

## Advanced Usage

### Custom Seed Script

You can modify `scripts/seedData.ts` to:

- Add custom fields
- Use different image sources
- Change name generation logic
- Add email, phone, or other fields
- Customize timestamp distribution

### Example: Add Email Field

```typescript
function generateFakeUser(index: number) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  
  return {
    name: fullName,
    email: faker.internet.email({ firstName, lastName }), // Add email
    imageURL: getImageURL(index),
    timestamp: Date.now() + (index * 1000),
  };
}
```

---

## Cleanup

### Remove All Test Data

```bash
# Option 1: Clear via script (sets to null)
npm run seed -- --clear --count 0

# Option 2: Firebase Console
# Go to Firebase Console → Realtime Database → Delete "users" node

# Option 3: Manually in code
# Update Firebase rules or delete from UI
```

---

## Integration with Display

### How It Works

1. **Script adds data** → Firebase Realtime Database
2. **Firebase triggers** → `onValue` listener in display page
3. **React updates** → New items added to state
4. **AnimatedMasonry** → Detects new items
5. **GSAP animates** → Fade-in new cards
6. **Existing animations** → Continue without restart

### Real-time Flow

```
Seed Script
    ↓
Firebase Realtime Database
    ↓
onValue listener (app/display/page.tsx)
    ↓
setUsers() state update
    ↓
animatedItems useMemo
    ↓
AnimatedMasonry component
    ↓
GSAP fade-in animation
    ↓
Display updated ✨
```

---

## Best Practices

### Do ✅

- Start dev server before seeding
- Open display page in browser first
- Use `--clear` when starting fresh tests
- Monitor console for errors
- Test with different delays
- Check multiple screen sizes

### Don't ❌

- Don't seed production database with fake data
- Don't run multiple seed scripts simultaneously
- Don't use very short delays (< 50ms) - can overwhelm Firebase
- Don't forget to clear test data after testing
- Don't commit `.env.local` file

---

## Example Workflows

### Workflow 1: Demo Preparation

```bash
# 1. Clear old data
npm run seed:clear

# 2. Add fresh demo data (slower for presentation)
npm run seed:slow -- --count 50

# 3. Open display
# Browser: http://localhost:3000/display

# 4. Present! 🎉
```

### Workflow 2: Performance Testing

```bash
# 1. Clear data
npm run seed:clear

# 2. Rapid seeding
npm run seed:fast -- --count 1000

# 3. Monitor performance
# DevTools: Performance tab, check FPS and memory
```

### Workflow 3: Animation Testing

```bash
# 1. Start with some data
npm run seed -- --count 20

# 2. Add more slowly while watching
npm run seed:slow -- --count 10

# 3. Verify smooth integration
# Watch new cards fade in without disrupting existing animations
```

---

## FAQ

**Q: How long does it take to seed 100 entries?**
A: ~50 seconds (100 entries × 500ms delay)

**Q: Can I seed while dev server is running?**
A: Yes! That's the recommended way.

**Q: Will fake data appear in production?**
A: No, only in your Firebase database. Make sure to use a test/development database.

**Q: Can I customize the images?**
A: Yes, edit `IMAGE_SOURCES` array in `scripts/seedData.ts`

**Q: Does this use S3?**
A: No, it uses public image placeholder services (no upload needed)

**Q: Can I stop the script mid-way?**
A: Yes, press `Ctrl+C`. Already added entries remain in database.

---

## Summary

- ✅ Easy to use: `npm run seed`
- ✅ Multiple speed options: fast/normal/slow
- ✅ Image domains pre-configured
- ✅ Real-time display updates
- ✅ Smooth animations with new data
- ✅ Perfect for testing and demos

---

**Ready to test?** 🚀

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Seed data
npm run seed

# Browser: Watch the magic!
http://localhost:3000/display
```

Enjoy testing your animated masonry display! 🎨✨