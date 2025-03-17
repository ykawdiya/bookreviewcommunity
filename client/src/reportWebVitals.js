const reportWebVitals = (onPerfEntry) => {
  if (typeof onPerfEntry === 'function') {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        if (typeof onPerfEntry === 'function') {
          getCLS?.(onPerfEntry);
          getFID?.(onPerfEntry);
          getFCP?.(onPerfEntry);
          getLCP?.(onPerfEntry);
          getTTFB?.(onPerfEntry);
        } else {
          console.warn("⚠️ onPerfEntry is not a function. Skipping web vitals reporting.");
        }
      })
      .catch((error) => {
        console.error("❌ Failed to load web-vitals module:", error.message);
        console.error(error.stack);
      });
  }
};

export default reportWebVitals;
