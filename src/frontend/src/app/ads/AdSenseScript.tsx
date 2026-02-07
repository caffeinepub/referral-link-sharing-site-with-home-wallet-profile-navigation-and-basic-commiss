import { useEffect } from 'react';

// Module-level flag to ensure script is only loaded once per page load
let scriptLoaded = false;

export default function AdSenseScript() {
  useEffect(() => {
    // Check if script already exists in DOM or has been loaded
    if (scriptLoaded || document.getElementById('adsense-script')) {
      return;
    }

    // Create and inject the AdSense script
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8182684208705293';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    document.body.appendChild(script);
    scriptLoaded = true;

    // Cleanup function (though script should persist for page lifetime)
    return () => {
      // Script remains in DOM for the lifetime of the page
    };
  }, []);

  return null;
}
