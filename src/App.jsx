import { useState, useRef, useCallback } from "react";
import { removeBackground } from "@imgly/background-removal";
import "./App.css";

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const MagicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m9 11-6 6v3h3l6-6"/>
    <path d="m22 2-3 3"/>
    <path d="m2 22 3-3"/>
    <path d="M22 16l-3-3-7-7 3-3 7 7 3 3z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState("split"); // split | original | result
  const [sliderPos, setSliderPos] = useState(50);
  const fileRef = useRef();
  const sliderRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setOriginalImage({ url, file, name: file.name });
    setProcessedImage(null);
    setProgress(0);
  }, []);

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processImage = async () => {
    if (!originalImage) return;
    setLoading(true);
    setProgress(5);
    setProgressText("Loading AI model...");

    try {
      const steps = [
        { p: 15, t: "Initializing neural network..." },
        { p: 30, t: "Analyzing image layers..." },
        { p: 50, t: "Detecting subject edges..." },
        { p: 70, t: "Removing background pixels..." },
        { p: 88, t: "Refining transparency mask..." },
      ];

      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < steps.length) {
          setProgress(steps[stepIdx].p);
          setProgressText(steps[stepIdx].t);
          stepIdx++;
        }
      }, 900);

      const blob = await removeBackground(originalImage.file, {
        model: "small",
        output: { format: "image/png", quality: 1 },
      });

      clearInterval(interval);
      setProgress(100);
      setProgressText("Done!");
      const resultUrl = URL.createObjectURL(blob);
      setProcessedImage(resultUrl);
      setView("split");
    } catch (err) {
      console.error(err);
      setProgressText("Error — try another image");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!processedImage) return;
    const a = document.createElement("a");
    a.href = processedImage;
    a.download = originalImage.name.replace(/\.[^.]+$/, "") + "_nobg.png";
    a.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
    setProgressText("");
    setView("split");
  };

  // Drag slider
  const onSliderDrag = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">✂️</div>
          <div>
            <h1>BG<span>Eraser</span></h1>
            <p>AI Background Remover</p>
          </div>
        </div>
        <div className="header-badge">100% Free · Browser AI · No Upload</div>
      </header>

      <main className="main">
        {/* Upload Zone */}
        {!originalImage && (
          <div
            className={`upload-zone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} hidden />
            <div className="upload-content">
              <div className="upload-icon"><UploadIcon /></div>
              <h2>Drop your image here</h2>
              <p>or click to browse</p>
              <div className="supported-formats">
                <span>JPG</span><span>PNG</span><span>WEBP</span><span>BMP</span>
              </div>
            </div>
            <div className="upload-glow" />
          </div>
        )}

        {/* Image Workspace */}
        {originalImage && (
          <div className="workspace">
            {/* Toolbar */}
            <div className="toolbar">
              <div className="file-info">
                <span className="file-name">{originalImage.name}</span>
              </div>
              <div className="toolbar-actions">
                {processedImage && (
                  <div className="view-toggle">
                    {["original","split","result"].map(v => (
                      <button
                        key={v}
                        className={`toggle-btn ${view === v ? "active" : ""}`}
                        onClick={() => setView(v)}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn-reset" onClick={reset}><CloseIcon /> New Image</button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="canvas-area">
              {/* Split Slider View */}
              {processedImage && view === "split" && (
                <div
                  className="compare-slider"
                  ref={sliderRef}
                  onMouseMove={(e) => e.buttons === 1 && onSliderDrag(e)}
                  onTouchMove={onSliderDrag}
                >
                  {/* Original side */}
                  <div className="compare-side original-side">
                    <img src={originalImage.url} alt="original" />
                    <div className="side-label">Original</div>
                  </div>
                  {/* Result side with clip */}
                  <div className="compare-side result-side" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                    <div className="checkerboard" />
                    <img src={processedImage} alt="result" />
                    <div className="side-label right">No Background</div>
                  </div>
                  {/* Divider */}
                  <div className="divider" style={{ left: `${sliderPos}%` }}>
                    <div className="divider-handle">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5l-7 7 7 7M16 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Original only */}
              {(!processedImage || view === "original") && (
                <div className="single-view">
                  <img src={originalImage.url} alt="original" />
                  <div className="side-label">Original</div>
                </div>
              )}

              {/* Result only */}
              {processedImage && view === "result" && (
                <div className="single-view result-bg">
                  <div className="checkerboard full" />
                  <img src={processedImage} alt="result" />
                  <div className="side-label right">No Background</div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="action-bar">
              {!processedImage && !loading && (
                <button className="btn-primary" onClick={processImage}>
                  <MagicIcon />
                  Remove Background
                </button>
              )}

              {loading && (
                <div className="progress-area">
                  <div className="progress-text">{progressText}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="progress-pct">{progress}%</div>
                </div>
              )}

              {processedImage && !loading && (
                <div className="result-actions">
                  <button className="btn-secondary" onClick={processImage}>
                    <MagicIcon /> Re-process
                  </button>
                  <button className="btn-primary" onClick={downloadResult}>
                    <DownloadIcon /> Download PNG
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {!originalImage && (
          <div className="features">
            {[
              { icon: "🤖", title: "Browser AI", desc: "Runs 100% locally — your image never leaves your device" },
              { icon: "⚡", title: "Lightning Fast", desc: "AI model processes images in seconds, no waiting" },
              { icon: "🎯", title: "Pixel Perfect", desc: "Neural edge detection for hair, fur & complex details" },
              { icon: "🆓", title: "Completely Free", desc: "No signup, no limits, no watermarks — forever" },
            ].map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        Built with ❤️ · AI runs in your browser · Zero server uploads
      </footer>
    </div>
  );
}
