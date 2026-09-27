import { removeBackground } from "@imgly/background-removal";

self.onmessage = async (e) => {
  const { id, file } = e.data;
  try {
    let blob;
    try {
      // 1. Try fast quantized model with GPU acceleration
      blob = await removeBackground(file, {
        model: "small",
        device: "gpu",
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            self.postMessage({ type: "progress", id, pct, key });
          }
        },
        output: {
          format: "image/png",
          quality: 0.95,
        },
      });
    } catch (gpuErr) {
      console.warn("GPU worker inference fallback to CPU:", gpuErr);
      // 2. Graceful fallback to CPU in worker
      blob = await removeBackground(file, {
        model: "small",
        device: "cpu",
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            self.postMessage({ type: "progress", id, pct, key });
          }
        },
        output: {
          format: "image/png",
          quality: 0.95,
        },
      });
    }

    self.postMessage({ type: "success", id, blob });
  } catch (err) {
    self.postMessage({ type: "error", id, error: err.message || String(err) });
  }
};
