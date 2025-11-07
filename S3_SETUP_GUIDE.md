# S3 Setup Guide - Fix Image Loading Issues 🔧

## Problem

You're seeing this error when images load:
```
"url" parameter is valid but upstream response is invalid
```

This means your S3 bucket is not properly configured to serve images publicly or has CORS issues.

## Solution

You need to configure your S3 bucket with the correct permissions and CORS settings.

---

## Step 1: Configure S3 Bucket Policy (Public Read Access)

### Option A: Make Bucket Publicly Readable (Recommended for Image Hosting)

1. Go to **AWS S3 Console** → Select your bucket `bb-resources-images`
2. Go to **Permissions** tab
3. Click **Bucket Policy**
4. Add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bb-resources-images/*"
    }
  ]
}
```

5. Click **Save**

### Option B: Use CloudFront (Better for Production)

If you don't want public bucket access, set up CloudFront:

1. Create a CloudFront distribution for your S3 bucket
2. Use the CloudFront URL in your app instead of direct S3 URLs
3. Update `next.config.ts` with CloudFront domain

---

## Step 2: Configure CORS

CORS allows your Next.js app (running on localhost or your domain) to fetch images from S3.

1. Go to **AWS S3 Console** → Select your bucket `bb-resources-images`
2. Go to **Permissions** tab
3. Scroll down to **Cross-origin resource sharing (CORS)**
4. Click **Edit**
5. Add this CORS configuration:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedOrigins": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

**For Production**, replace `"*"` in `AllowedOrigins` with your actual domain:
```json
"AllowedOrigins": [
  "https://yourdomain.com",
  "http://localhost:3000"
]
```

6. Click **Save changes**

---

## Step 3: Disable Block Public Access (if needed)

If you chose Option A above, you need to allow public access:

1. Go to **Permissions** tab
2. Click **Block public access (bucket settings)** → **Edit**
3. **Uncheck** all options:
   - ❌ Block all public access
   - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
   - ❌ Block public and cross-account access to buckets and objects through any public bucket or access point policies

4. Click **Save changes**
5. Type `confirm` and click **Confirm**

---

## Step 4: Verify Image URLs

Check that your S3 URLs are in this format:

```
https://bb-resources-images.s3.ap-south-1.amazonaws.com/qr-bb/[uuid]
```

Or the generic format:
```
https://bb-resources-images.s3.amazonaws.com/qr-bb/[uuid]
```

---

## Step 5: Test the Configuration

### Test 1: Direct S3 URL
Open a browser and paste your S3 image URL directly. You should see the image.

### Test 2: In Your App
```bash
npm run dev
```

Upload a new image and check if it displays correctly.

---

## Alternative Solution: Use Signed URLs (More Secure)

If you don't want to make your bucket public, modify your API to return signed URLs:

### Update `api/index.ts`:

```typescript
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getSignedImageUrl = async (fileKey: string) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
  });

  // URL expires in 1 hour
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return signedUrl;
};
```

### Update `api/s3/presign/route.ts`:

After upload, generate a signed URL for reading:

```typescript
import { getSignedImageUrl } from "@/api";

// ... after successful upload
const signedReadUrl = await getSignedImageUrl(fileKey);

return NextResponse.json({
  uploadUrl: url,
  fields,
  fileKey,
  fileUrl: signedReadUrl, // Use signed URL instead
});
```

---

## Troubleshooting

### Error: "Access Denied"
- Check bucket policy is correct
- Verify Block Public Access is disabled (if using public access)
- Ensure the file was uploaded successfully

### Error: "CORS Error"
- Verify CORS configuration includes your domain
- Clear browser cache
- Check browser console for specific CORS error

### Images Still Not Loading
- Check AWS credentials in `.env` file
- Verify bucket name matches in code and AWS
- Check AWS region is correct (`ap-south-1`)
- Look at browser Network tab for actual HTTP status code

### Check Browser Console
```javascript
// In browser console, test direct access:
fetch('https://bb-resources-images.s3.ap-south-1.amazonaws.com/qr-bb/[your-file-key]')
  .then(res => res.blob())
  .then(blob => console.log('Success:', blob))
  .catch(err => console.error('Error:', err));
```

---

## Environment Variables

Ensure these are set in your `.env` file:

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_RESOURCES_BUCKET=bb-resources-images
```

---

## Security Best Practices

### For Development:
- ✅ Public bucket with CORS is fine
- ✅ Use wildcard `*` for AllowedOrigins

### For Production:
- ✅ Use CloudFront instead of direct S3
- ✅ Restrict CORS to your domain only
- ✅ Use signed URLs for sensitive content
- ✅ Enable S3 access logging
- ✅ Set up lifecycle policies to delete old files

---

## Quick Test Commands

Test if bucket is publicly accessible:
```bash
curl -I https://bb-resources-images.s3.ap-south-1.amazonaws.com/qr-bb/test-file
```

Should return `200 OK` if public, `403 Forbidden` if private.

---

## Summary Checklist

- [ ] Bucket policy allows public GetObject
- [ ] CORS is configured with your origins
- [ ] Block Public Access is disabled (if using public access)
- [ ] Environment variables are set correctly
- [ ] Next.js config includes S3 domain in `remotePatterns`
- [ ] Images are uploading successfully to S3
- [ ] Direct S3 URLs open in browser

Once all checked, your images should load perfectly! ✅