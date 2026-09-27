import { useState, useRef, useCallback } from "react";
import { removeBackground } from "@imgly/background-removal";
import "./App.css";

const PRESET_BG_COLORS = [
  { name: "Transparent", value: "transparent", isCheckered: true },
  { name: "White", value: "#FFFFFF" },
  { name: "Off-White", value: "#F8FAFC" },
  { name: "Black", value: "#0F172A" },
  { name: "Soft Gray", value: "#E2E8F0" },
  { name: "Modern Blue", value: "#3B82F6" },
  { name: "Vibrant Indigo", value: "#6366F1" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Warm Amber", value: "#F59E0B" },
  { name: "Rose Pink", value: "#F43F5E" },
];

export default function App() {
  const [original, setOriginal] = useState(null);       // { url, file, name }
  const [result, setResult] = useState(null);            // blob URL
  const [resultBlob, setResultBlob] = useState(null);    // raw Blob
  const [status, setStatus] = useState("idle");          // idle | loading | done | error
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState("split");             // split | original | result
  const [sliderPos, setSliderPos] = useState(50);
  const [bgColor, setBgColor] = useState("transparent"); // transparent or hex
  const [customColor, setCustomColor] = useState("#8B5CF6");
  const fileInputRef = useRef(null);
  const compareRef = useRef(null);
  const isDraggingSlider = useRef(false);

  // ── Load image ──
  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (original?.url) URL.revokeObjectURL(original.url);
    if (result) URL.revokeObjectURL(result);
    setOriginal({ url: URL.createObjectURL(file), file, name: file.name });
    setResult(null);
    setResultBlob(null);
    setStatus("idle");
    setProgress(0);
    setSliderPos(50);
    setBgColor("transparent");
  }, [original, result]);

  const onInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFile(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  // ── Process Background Removal ──
  const processImage = async () => {
    if (!original || status === "loading") return;
    setStatus("loading");
    setProgress(10);
    setProgressMsg("Initializing AI neural network...");

    try {
      const blob = await removeBackground(original.file, {
        progress: (key, current, total) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setProgress(Math.min(95, Math.max(15, pct)));
            if (key.includes("fetch")) {
              setProgressMsg("Downloading AI model weights...");
            } else {
              setProgressMsg("Detecting subject & erasing background...");
            }
          }
        },
        output: {
          format: "image/png",
          quality: 1.0,
        },
      });

      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResult(url);
      setProgress(100);
      setProgressMsg("Complete!");
      setStatus("done");
      setView("split");
      setSliderPos(50);
    } catch (err) {
      console.error("Background removal error:", err);
      setStatus("error");
      setProgressMsg("Failed to remove background. Please try another image.");
    }
  };

  // ── Download (Transparent PNG or with Selected Background) ──
  const downloadImage = async () => {
    if (!result) return;
    const baseName = original.name.replace(/\.[^.]+$/, "");

    if (bgColor === "transparent") {
      const a = document.createElement("a");
      a.href = result;
      a.download = `${baseName}_transparent.png`;
      a.click();
      return;
    }

    // Render with custom background onto offscreen canvas
    const img = new Image();
    img.src = result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");

      // Draw selected solid background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subject on top
      ctx.drawImage(img, 0, 0);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${baseName}_custom_bg.png`;
      a.click();
    };
  };

  // ── Split Slider Drag & Move ──
  const updateSliderPosition = (clientX) => {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  };

  const onPointerDown = (e) => {
    isDraggingSlider.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderPosition(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!isDraggingSlider.current) return;
    updateSliderPosition(e.clientX);
  };

  const onPointerUp = (e) => {
    isDraggingSlider.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const resetAll = () => {
    if (original?.url) URL.revokeObjectURL(original.url);
    if (result) URL.revokeObjectURL(result);
    setOriginal(null);
    setResult(null);
    setResultBlob(null);
    setStatus("idle");
    setProgress(0);
    setSliderPos(50);
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">✂️</div>
          <div className="logo-text">
            <h1>BG<span>Eraser</span></h1>
            <p>100% In-Browser AI Background Remover</p>
          </div>
        </div>
        <div className="header-badge">
          <span className="badge-dot" />
          Free · Safe · No Server Upload
        </div>
      </header>

      <main className="main">
        {/* ── Upload State ── */}
        {!original && (
          <>
            <div className="hero">
              <h2>Remove Background <span>In 1 Click</span></h2>
              <p>State-of-the-art AI runs directly in your browser. Complete privacy — your photos never leave your device.</p>
            </div>

            <div
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDragOver={onDragOver}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onInputChange}
                hidden
              />
              <div className="upload-icon-wrap">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3>Drag & Drop Image Here</h3>
              <p>or <strong>click to browse</strong> from your computer</p>
              <div className="format-pills">
                {["PNG", "JPG", "WEBP", "AVIF", "HEIC"].map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </div>

            <div className="features">
              {[
                { icon: "🛡️", title: "100% Private", desc: "Photos stay inside your browser. No files are ever uploaded to cloud servers." },
                { icon: "⚡", title: "Instant AI", desc: "Client-side neural network processes signatures, portraits, and objects in seconds." },
                { icon: "🎯", title: "High Precision", desc: "Extracts fine ink signatures, sharp object borders, and hair with precision." },
                { icon: "🎨", title: "Color Backdrops", desc: "Keep it transparent or replace background with custom solid colors instantly." },
              ].map((f) => (
                <div className="feature-card" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Active Workspace ── */}
        {original && (
          <div className="workspace">
            {/* Toolbar */}
            <div className="toolbar">
              <div className="file-info">
                <div className="file-dot" />
                <span className="file-name">{original.name}</span>
              </div>
              <div className="toolbar-right">
                {result && (
                  <div className="view-toggle">
                    {[
                      { id: "split", label: "Split Comparison" },
                      { id: "result", label: "Result Only" },
                      { id: "original", label: "Original" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        className={`toggle-btn ${view === v.id ? "active" : ""}`}
                        onClick={() => setView(v.id)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn-reset" onClick={resetAll}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  New Image
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="canvas-card">
              {/* ── 1. Split View Mode ── */}
              {result && view === "split" && (
                <div
                  className="compare-slider"
                  ref={compareRef}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  {/* Background backdrop (Checkerboard or chosen color) */}
                  <div
                    className={`slider-backdrop ${bgColor === "transparent" ? "checkerboard" : ""}`}
                    style={bgColor !== "transparent" ? { backgroundColor: bgColor } : {}}
                  />

                  {/* BOTTOM LAYER: Processed Result (Clean Subject on transparent/colored backdrop) */}
                  <div className="slider-layer result-layer">
                    <img
                      src={result}
                      alt="Processed Result"
                      draggable={false}
                    />
                  </div>

                  {/* TOP LAYER: Original Image (Clipped so only the left side is shown!) */}
                  <div
                    className="slider-layer original-layer"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img
                      src={original.url}
                      alt="Original Image"
                      draggable={false}
                    />
                  </div>

                  {/* Divider Line & Interactive Handle */}
                  <div className="divider-line" style={{ left: `${sliderPos}%` }}>
                    <div className="divider-handle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                        <polyline points="9 18 3 12 9 6" />
                      </svg>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: "rotate(180deg)" }}>
                        <polyline points="15 18 9 12 15 6" />
                        <polyline points="9 18 3 12 9 6" />
                      </svg>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="canvas-badge badge-left">Original</div>
                  <div className="canvas-badge badge-right">
                    {bgColor === "transparent" ? "Transparent BG" : "Custom BG"}
                  </div>
                </div>
              )}

              {/* ── 2. Result Only Mode ── */}
              {result && view === "result" && (
                <div
                  className={`single-view ${bgColor === "transparent" ? "checkerboard" : ""}`}
                  style={bgColor !== "transparent" ? { backgroundColor: bgColor } : {}}
                >
                  <img src={result} alt="Background Removed" draggable={false} />
                  <div className="canvas-badge badge-right">
                    {bgColor === "transparent" ? "Transparent PNG" : "Custom Color"}
                  </div>
                </div>
              )}

              {/* ── 3. Original Only Mode (or initial preview) ── */}
              {(!result || view === "original") && (
                <div className="single-view original-view">
                  <img src={original.url} alt="Original Image" draggable={false} />
                  <div className="canvas-badge badge-left">Original</div>
                </div>
              )}
            </div>

            {/* Background Color Palette (Visible when Result is available) */}
            {result && (
              <div className="color-palette-bar">
                <span className="palette-label">Backdrop:</span>
                <div className="palette-options">
                  {PRESET_BG_COLORS.map((c) => (
                    <button
                      key={c.name}
                      title={c.name}
                      className={`color-btn ${bgColor === c.value ? "active" : ""} ${c.isCheckered ? "checker-btn" : ""}`}
                      style={!c.isCheckered ? { backgroundColor: c.value } : {}}
                      onClick={() => setBgColor(c.value)}
                    >
                      {bgColor === c.value && (
                        <span className="check-icon">✓</span>
                      )}
                    </button>
                  ))}

                  {/* Custom color picker */}
                  <label className="color-picker-label" title="Custom Color">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setBgColor(e.target.value);
                      }}
                    />
                    <span className="color-picker-text">🎨</span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="action-bar">
              {status === "idle" && (
                <button className="btn-primary" onClick={processImage}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m9 11-6 6v3h3l6-6"/>
                    <path d="m22 2-3 3"/>
                    <path d="m2 22 3-3"/>
                    <path d="M22 16l-3-3-7-7 3-3 7 7 3 3z"/>
                  </svg>
                  Remove Background Now
                </button>
              )}

              {status === "loading" && (
                <div className="progress-area">
                  <div className="progress-label">
                    <div className="progress-spinner" />
                    <span>{progressMsg}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="progress-pct">{progress}%</div>
                </div>
              )}

              {status === "error" && (
                <div className="error-box">
                  <p>{progressMsg}</p>
                  <button className="btn-primary" onClick={processImage}>
                    Try Again
                  </button>
                </div>
              )}

              {status === "done" && (
                <div className="result-actions">
                  <button className="btn-secondary" onClick={processImage}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>
                    Re-process
                  </button>
                  <button className="btn-download" onClick={downloadImage}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download {bgColor === "transparent" ? "Transparent PNG" : "Image"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with ❤️ · AI runs 100% in your browser · Zero server uploads · Full Privacy</p>
      </footer>
    </div>
  );
}
