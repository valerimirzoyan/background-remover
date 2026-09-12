# Background Remover Utility

This folder contains the standalone **Background Remover** script for NUACA portal user photos.

## Overview
The `BackgroundRemover` utility automatically strips solid, white, or studio backdrops from user profile pictures using HTML5 Canvas pixel analysis and Euclidean color distance keying.

## File Structure
- `bg-remover.js`: Standalone JavaScript module providing `BackgroundRemover.removeBackground(source, callback, options)`.

## Usage Example

```javascript
// Remove background from a file reader data URL or image element
BackgroundRemover.removeBackground(dataUrl, function(transparentPngUrl) {
    console.log("Transparent PNG created:", transparentPngUrl);
    // Save transparentPngUrl to database
});
```

## Workflow Integration
Background removal is performed **at upload time in the Admin Panel** when creating or updating a user. The processed transparent photo is stored directly in the database so frontend pages can render transparent profile cutouts without runtime processing overhead on page loads.
