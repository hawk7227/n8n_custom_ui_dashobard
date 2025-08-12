# Header Code Feature for Landing Pages

## Overview

The Header Code feature allows you to add custom HTML, CSS, and JavaScript code to your landing pages. This code gets inserted in the `<head>` section of your landing pages, enabling you to customize the page behavior and appearance.

## How to Use

### 1. Access the Header Code Editor

1. Go to the **Landing Pages** section in your dashboard
2. Find the landing page you want to edit
3. Click the **Code button** (🔧) on the landing page card
4. The Header Code Editor dialog will open

### 2. Edit Your Header Code

In the editor, you can add:

- **HTML Meta Tags**: SEO optimization, viewport settings, social media tags
- **CSS Styles**: Custom fonts, color schemes, layout adjustments
- **JavaScript**: Analytics scripts, tracking pixels, custom functionality
- **External Resources**: Font imports, CDN links, third-party scripts

### 3. Save Your Changes

1. Click the **Save Changes** button
2. Your code will be saved to the database
3. The changes will be applied to all pages using this landing page template

## Common Use Cases

### Analytics and Tracking
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

### Custom Fonts
```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Custom CSS -->
<style>
  body {
    font-family: 'Inter', sans-serif;
  }
</style>
```

### Meta Tags for SEO
```html
<!-- SEO Meta Tags -->
<meta name="description" content="Your landing page description">
<meta name="keywords" content="keyword1, keyword2, keyword3">
<meta name="author" content="Your Company Name">

<!-- Open Graph Tags -->
<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Your page description">
<meta property="og:image" content="https://your-domain.com/image.jpg">
<meta property="og:url" content="https://your-domain.com/landing-page">

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Your Page Title">
<meta name="twitter:description" content="Your page description">
<meta name="twitter:image" content="https://your-domain.com/image.jpg">
```

### Custom CSS
```html
<style>
  /* Custom color scheme */
  :root {
    --primary-color: #3b82f6;
    --secondary-color: #1e40af;
    --accent-color: #f59e0b;
  }
  
  /* Custom button styles */
  .custom-button {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    transition: all 0.3s ease;
  }
  
  .custom-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
</style>
```

## Best Practices

1. **Keep it Lightweight**: Don't add too many external resources that could slow down page loading
2. **Test Thoroughly**: Always test your header code on a staging environment first
3. **Use Minified Code**: For production, use minified versions of CSS and JavaScript
4. **Organize Your Code**: Use comments to organize different sections of your code
5. **Backup Your Code**: Keep a backup of your header code before making major changes

## Troubleshooting

### Code Not Working?
- Check the browser console for JavaScript errors
- Ensure all external resources are accessible
- Verify that your code is properly formatted

### Page Loading Slowly?
- Minimize external resource requests
- Use CDN links when possible
- Consider lazy loading for non-critical resources

### Styling Conflicts?
- Use more specific CSS selectors
- Add `!important` for critical styles (use sparingly)
- Test on different devices and browsers

## Database Schema

The `header_code` column is stored in the `landingpages` table:

```sql
ALTER TABLE landingpages ADD COLUMN header_code TEXT DEFAULT '';
```

## Support

If you encounter any issues with the Header Code feature:
1. Check the browser console for error messages
2. Verify your code syntax
3. Test with a simple example first
4. Contact support if the issue persists 