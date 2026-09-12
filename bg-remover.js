/* =================================================================
   NUACA Background Remover Utility (Background Remover)
   Standalone image background removal engine using HTML5 Canvas & 
   Euclidean color-distance keying with soft edge feathering.
================================================================= */
(function (global) {
  'use strict';

  var BackgroundRemover = {
    /**
     * Remove solid/studio background from an Image element or Canvas data URL.
     * @param {HTMLImageElement|string} imgOrDataUrl Image element or data URL string
     * @param {Function} callback Callback receiving transparent PNG data URL
     * @param {Object} options Configuration thresholds
     */
    removeBackground: function (imgOrDataUrl, callback, options) {
      options = options || {};
      var tolerance = options.tolerance || 35;
      var minAlphaDist = options.minAlphaDist || 55;

      function processCanvas(img) {
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        var ctx = canvas.getContext('2d');

        try {
          ctx.drawImage(img, 0, 0);
          var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var data = imgData.data;
          var width = canvas.width;
          var height = canvas.height;

          // Sample corner pixels to auto-detect background color
          var corners = [
            getPixel(data, width, 2, 2),
            getPixel(data, width, width - 3, 2),
            getPixel(data, width, 2, height - 3),
            getPixel(data, width, width - 3, height - 3)
          ];

          var bgR = Math.round((corners[0].r + corners[1].r + corners[2].r + corners[3].r) / 4);
          var bgG = Math.round((corners[0].g + corners[1].g + corners[2].g + corners[3].g) / 4);
          var bgB = Math.round((corners[0].b + corners[1].b + corners[2].b + corners[3].b) / 4);

          var cornerDev = corners.reduce(function (acc, c) {
            return acc + Math.sqrt(Math.pow(c.r - bgR, 2) + Math.pow(c.g - bgG, 2) + Math.pow(c.b - bgB, 2));
          }, 0) / 4;

          if (cornerDev < 45 || (bgR > 200 && bgG > 200 && bgB > 200)) {
            for (var i = 0; i < data.length; i += 4) {
              var r = data[i];
              var g = data[i + 1];
              var b = data[i + 2];
              var a = data[i + 3];

              if (a === 0) continue;

              var dist = Math.sqrt(
                Math.pow(r - bgR, 2) +
                Math.pow(g - bgG, 2) +
                Math.pow(b - bgB, 2)
              );

              if (dist <= tolerance) {
                data[i + 3] = 0;
              } else if (dist < minAlphaDist) {
                var factor = (dist - tolerance) / (minAlphaDist - tolerance);
                data[i + 3] = Math.round(a * factor);
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }

          var resultUrl = canvas.toDataURL('image/png');
          if (typeof callback === 'function') callback(resultUrl);
        } catch (e) {
          console.warn('BackgroundRemover process error:', e);
          if (typeof callback === 'function') callback(img.src || imgOrDataUrl);
        }
      }

      function getPixel(dataArray, w, x, y) {
        var idx = (y * w + x) * 4;
        return {
          r: dataArray[idx],
          g: dataArray[idx + 1],
          b: dataArray[idx + 2],
          a: dataArray[idx + 3]
        };
      }

      if (typeof imgOrDataUrl === 'string') {
        var tempImg = new Image();
        tempImg.crossOrigin = 'Anonymous';
        tempImg.onload = function () { processCanvas(tempImg); };
        tempImg.onerror = function () {
          if (typeof callback === 'function') callback(imgOrDataUrl);
        };
        tempImg.src = imgOrDataUrl;
      } else if (imgOrDataUrl && imgOrDataUrl.tagName === 'IMG') {
        if (imgOrDataUrl.complete && imgOrDataUrl.naturalWidth) {
          processCanvas(imgOrDataUrl);
        } else {
          imgOrDataUrl.onload = function () { processCanvas(imgOrDataUrl); };
        }
      }
    }
  };

  global.BackgroundRemover = BackgroundRemover;
})(typeof window !== 'undefined' ? window : this);
