# NSFW Content Detection

## Overview
This project uses **NSFW.js** with TensorFlow.js for client-side nudity detection. This is a completely free solution that runs in the browser without any API costs.

## How It Works

### 1. Technology Stack
- **NSFW.js**: Open-source ML model for NSFW content detection
- **TensorFlow.js**: Runs the model in the browser
- **Model Size**: ~5MB (loaded from CDN on first use)
- **Cost**: 100% Free, no API limits

### 2. Detection Categories
The model classifies images into 5 categories:
- `Porn`: Explicit sexual content
- `Sexy`: Suggestive/revealing content
- `Hentai`: Illustrated sexual content
- `Neutral`: Safe, general content
- `Drawing`: Non-explicit illustrations

### 3. Safety Thresholds
Current configuration in `/lib/nsfwDetection.ts`:
```typescript
PORN_THRESHOLD = 0.3    // 30% confidence
SEXY_THRESHOLD = 0.5    // 50% confidence
HENTAI_THRESHOLD = 0.3  // 30% confidence
```

An image is flagged as unsafe if ANY of these thresholds are exceeded.

### 4. Integration Points

#### Camera Capture
When user takes a photo with the camera:
1. Image is captured from video stream
2. `validateAndSetImage()` is called
3. `checkFileSafety()` analyzes the image
4. If unsafe: Error message shown, image rejected
5. If safe: Image set, camera closes

#### Gallery Upload
When user selects image from gallery:
1. File selected via file input
2. `handleFileSelect()` validates file type
3. `validateAndSetImage()` is called
4. `checkFileSafety()` analyzes the image
5. If unsafe: Error message shown, file input reset
6. If safe: Image set, preview shown

### 5. User Experience

#### Loading State
While checking image:
- Blue banner shows "Checking image safety..."
- Shield icon with spinning loader
- All buttons disabled

#### Error State
If unsafe content detected:
- Red banner with error message
- Examples:
  - "This image contains inappropriate content (Porn: 45%)"
  - "This image contains inappropriate content (Sexy: 60%)"
- User can dismiss error and try again

#### Success State
If image is safe:
- Image preview shown
- User can proceed to next step
- No notification (seamless)

## Adjusting Sensitivity

### Making More Strict (fewer false negatives)
Lower the thresholds in `/lib/nsfwDetection.ts`:
```typescript
const PORN_THRESHOLD = 0.2;   // was 0.3
const SEXY_THRESHOLD = 0.4;   // was 0.5
const HENTAI_THRESHOLD = 0.2; // was 0.3
```

### Making Less Strict (fewer false positives)
Raise the thresholds:
```typescript
const PORN_THRESHOLD = 0.4;   // was 0.3
const SEXY_THRESHOLD = 0.6;   // was 0.5
const HENTAI_THRESHOLD = 0.4; // was 0.3
```

## Error Handling

### Fail-Open Strategy
By default, if the model fails to load or analyze:
- Image is considered **safe**
- Error is logged to console
- User can proceed

### Fail-Closed Strategy (optional)
To reject images on errors, modify in `/lib/nsfwDetection.ts`:
```typescript
const FAIL_OPEN = false; // was true
```

## Privacy & Performance

### Privacy
- ✅ All processing happens **client-side**
- ✅ Images never sent to external servers
- ✅ No tracking or logging
- ✅ Works offline after model loads

### Performance
- First check: ~2-5 seconds (model download + load)
- Subsequent checks: ~0.5-1 second
- Model cached in browser
- No impact on server

## Testing

### Test Workflow
1. Try uploading safe images (landscapes, objects, etc.)
2. Try uploading borderline content
3. Verify error messages are clear
4. Check that false positives are minimal

### Monitor False Positives/Negatives
If you notice issues:
1. Check predictions in browser console
2. Adjust thresholds accordingly
3. Consider adding category weights

## Alternative Options (Not Used)

### Why Not API-Based Solutions?
- **Sightengine**: $60/month for 50k checks
- **AWS Rekognition**: $1 per 1000 images
- **Google Vision**: $1.50 per 1000 images
- **Azure Content Moderator**: $1 per 1000 images

### Why NSFW.js?
- Free and open source
- Privacy-friendly (client-side)
- No rate limits
- No API keys needed
- Offline capable
- Good accuracy (trained on NSFW dataset)

## Support
For issues with the detection model:
- GitHub: https://github.com/infinitered/nsfwjs
- TensorFlow.js Docs: https://www.tensorflow.org/js

## Future Enhancements
- [ ] Add batch processing for multiple images
- [ ] Custom model training with your own dataset
- [ ] Progressive enhancement (skip check on slow connections)
- [ ] A/B test different thresholds
- [ ] Add "Report False Positive" button
