import { useState, useRef, useCallback, useEffect } from "react";
import { removeBackground, preload } from "@imgly/background-removal";
import "./App.css";

const PRESET_BG_COLORS = [
  { name: "Transparent", value: "transparent", isCheckered: true },
  { name: "Harvest Gold", value: "#E1A36F" },
  { name: "Calico", value: "#DEC484" },
  { name: "Hampton Linen", value: "#E2D8A5" },
  { name: "Sea Nymph Teal", value: "#6F9F9C" },
  { name: "Smalt Blue", value: "#577E89" },
  { name: "Soft White", value: "#FAF8F5" },
  { name: "Pure White", value: "#FFFFFF" },
  { name: "Deep Charcoal", value: "#2C3E44" },
];

const SHOWCASE_CATEGORIES = [
  {
    id: "ecommerce",
    label: "e-Commerce",
    title: "Bring your products into focus with professional looking photos",
    desc: "Remove other products, tags, labels, watermarks and other distractions in your product photos.",
    image: "/samples/sample_headphones.png",
    filename: "sample_headphones.png",
    bgBackdrop: "#DEC484", // Calico Warm Sand
    badge: "Audio Gear",
  },
  {
    id: "fashion",
    label: "Fashion",
    title: "Showcase apparel and footwear on clean transparent backdrops",
    desc: "Create crisp Amazon, Shopify, and Instagram product listings with high-contrast outlines.",
    image: "/samples/sample_sneaker.png",
    filename: "sample_sneaker.png",
    bgBackdrop: "#E1A36F", // Harvest Gold
    badge: "Footwear",
  },
  {
    id: "auto",
    label: "Auto Listings",
    title: "Make vehicle listings pop on digital showrooms & classifieds",
    desc: "Replace busy dealership lots and distracting street backgrounds with sleek studio staging.",
    image: "/samples/sample_porsche.png",
    filename: "sample_porsche.png",
    bgBackdrop: "#577E89", // Smalt Blue
    badge: "Vehicles",
  },
  {
    id: "animals",
    label: "Animals",
    title: "Clean cutouts of pets, fur, and wildlife without harsh halos",
    desc: "Advanced edge matting accurately captures fine whiskers, fur textures, and animal contours.",
    image: "/samples/sample_dog.png",
    filename: "sample_dog.png",
    bgBackdrop: "#6F9F9C", // Sea Nymph Teal
    badge: "Pets & Wildlife",
  },
  {
    id: "jewellery",
    label: "Jewellery",
    title: "Sparkling gems and fine metals isolated with microscopic clarity",
    desc: "Eliminate reflection artifacts and uneven backdrops to highlight the craftsmanship of luxury jewels.",
    image: "/samples/sample_watch.png",
    filename: "sample_watch.png",
    bgBackdrop: "#E2D8A5", // Hampton Linen
    badge: "Luxury Watches",
  },
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

  // ── Running Example Showcase State ──
  const [activeShowcaseId, setActiveShowcaseId] = useState("ecommerce");
  const [showcaseSliderPos, setShowcaseSliderPos] = useState(50);
  const [showcaseView, setShowcaseView] = useState("split"); // "split" | "original" | "removed"
  const showcaseCompareRef = useRef(null);
  const isDraggingShowcaseSlider = useRef(false);

  const activeShowcase = SHOWCASE_CATEGORIES.find((c) => c.id === activeShowcaseId) || SHOWCASE_CATEGORIES[0];

  const updateShowcaseSlider = (clientX) => {
    if (!showcaseCompareRef.current) return;
    const rect = showcaseCompareRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setShowcaseSliderPos(pos);
  };

  const onShowcasePointerDown = (e) => {
    isDraggingShowcaseSlider.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateShowcaseSlider(e.clientX);
  };

  const onShowcasePointerMove = (e) => {
    if (!isDraggingShowcaseSlider.current) return;
    updateShowcaseSlider(e.clientX);
  };

  const onShowcasePointerUp = (e) => {
    isDraggingShowcaseSlider.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const testWithSample = async (sample) => {
    try {
      setStatus("loading");
      setProgress(15);
      setProgressMsg(`Loading ${sample.badge} sample...`);
      window.scrollTo({ top: 0, behavior: "smooth" });

      const resp = await fetch(sample.image);
      const blob = await resp.blob();
      const file = new File([blob], sample.filename, { type: "image/png" });
      loadFile(file);
    } catch (e) {
      console.error("Failed to load sample:", e);
    }
  };

  // ── Process Background Removal (Reliable Multi-Threaded WASM) ──
  const runRemoval = async (fileToProcess) => {
    if (!fileToProcess) return;
    setStatus("loading");
    setProgress(15);
    setProgressMsg("Analyzing subject & edges...");

    try {
      let blob;
      try {
        blob = await removeBackground(fileToProcess, {
          progress: (key, current, total) => {
            if (total > 0) {
              const pct = Math.round((current / total) * 100);
              setProgress(Math.min(95, Math.max(15, pct)));
              if (key.includes("fetch")) {
                setProgressMsg("Loading AI model...");
              } else {
                setProgressMsg("Erasing background with AI...");
              }
            }
          },
          output: {
            format: "image/png",
            quality: 1.0,
          },
        });
      } catch (err1) {
        console.warn("Custom config failed, running raw fallback:", err1);
        blob = await removeBackground(fileToProcess);
      }

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

  // ── Load image & Auto-Process Instantly ──
  const loadFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (original?.url) URL.revokeObjectURL(original.url);
    if (result) URL.revokeObjectURL(result);
    setOriginal({ url: URL.createObjectURL(file), file, name: file.name });
    setResult(null);
    setResultBlob(null);
    setBgColor("transparent");
    setSliderPos(50);

    // Auto-trigger removal immediately on upload!
    runRemoval(file);
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

  const processImage = () => {
    if (original?.file) {
      runRemoval(original.file);
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
      {/* ── 3D Modern Navbar ── */}
      <header className="header-3d-wrapper">
        <div className="header-3d">
          <div className="logo-3d">
            <div className="logo-icon-3d">
              <span className="logo-emoji">✂️</span>
              <div className="icon-3d-shine" />
            </div>
            <div className="logo-text">
              <h1>BG<span>Eraser</span></h1>
              <p>AI Background Remover</p>
            </div>
          </div>

          <div className="nav-badges-group">
            <div className="nav-pill-badge badge-privacy">
              <span className="pill-icon">🛡️</span>
              <span>100% Private</span>
            </div>
            <div className="nav-pill-badge badge-free">
              <span className="badge-dot" />
              <span>Free · In-Browser</span>
            </div>
            <a
              href="https://github.com/dev998889/bg-remover"
              target="_blank"
              rel="noreferrer"
              className="btn-github-3d"
              title="Star on GitHub"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
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

            {/* ── Running Example Section ("What is Background Remover used for?") ── */}
            <section className="showcase-section">
              <div className="showcase-header">
                <h2>What is Background Remover <span>used for?</span></h2>
                <p>Drag the interactive slider to see professional edge removal across different industries</p>
              </div>

              {/* Category Pills (3D theme) */}
              <div className="showcase-tabs">
                {SHOWCASE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`showcase-tab-btn ${activeShowcaseId === cat.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveShowcaseId(cat.id);
                      setShowcaseSliderPos(50);
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Interactive Showcase Card */}
              <div className="showcase-card">
                {/* View toggles in corner */}
                <div className="showcase-top-controls">
                  <div className="showcase-badge-pill">
                    <span className="badge-sparkle">✨</span>
                    <span>{activeShowcase.badge}</span>
                  </div>
                  <div className="showcase-view-toggle">
                    {[
                      { id: "split", label: "Split Slider" },
                      { id: "removed", label: "Transparent BG" },
                      { id: "original", label: "Original" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        className={`showcase-mode-btn ${showcaseView === mode.id ? "active" : ""}`}
                        onClick={() => setShowcaseView(mode.id)}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Slider Area */}
                <div
                  className="showcase-slider-area"
                  ref={showcaseCompareRef}
                  onPointerDown={onShowcasePointerDown}
                  onPointerMove={onShowcasePointerMove}
                  onPointerUp={onShowcasePointerUp}
                  onPointerCancel={onShowcasePointerUp}
                >
                  {/* Layer 1 (Base): Transparent Checkerboard background */}
                  <div className="showcase-backdrop checkerboard" />

                  {/* Layer 2: Subject on Transparent Checkerboard */}
                  <div className="showcase-layer showcase-result-layer">
                    <img
                      src={activeShowcase.image}
                      alt={activeShowcase.label}
                      draggable={false}
                    />
                  </div>

                  {/* Layer 3: Solid Studio Backdrop + Subject (Clipped horizontally) */}
                  <div
                    className="showcase-layer showcase-orig-layer"
                    style={{
                      backgroundColor: activeShowcase.bgBackdrop,
                      clipPath: showcaseView === "removed"
                        ? "inset(0 100% 0 0)"
                        : showcaseView === "original"
                        ? "inset(0 0 0 0)"
                        : `inset(0 ${100 - showcaseSliderPos}% 0 0)`
                    }}
                  >
                    <img
                      src={activeShowcase.image}
                      alt={`${activeShowcase.label} Original`}
                      draggable={false}
                    />
                  </div>

                  {/* Divider Line & Interactive Handle (When in split mode) */}
                  {showcaseView === "split" && (
                    <div className="showcase-divider" style={{ left: `${showcaseSliderPos}%` }}>
                      <div className="showcase-handle">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                          <polyline points="9 18 3 12 9 6" />
                        </svg>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: "rotate(180deg)" }}>
                          <polyline points="15 18 9 12 15 6" />
                          <polyline points="9 18 3 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Floating Badges */}
                  <div className="showcase-badge badge-orig">Original Photo</div>
                  <div className="showcase-badge badge-cutout">Transparent Cutout</div>
                </div>

                {/* Bottom Caption & 1-Click Test Action */}
                <div className="showcase-caption">
                  <div className="showcase-text">
                    <h3>{activeShowcase.title}</h3>
                    <p>{activeShowcase.desc}</p>
                  </div>
                  <button
                    className="btn-try-sample"
                    onClick={() => testWithSample(activeShowcase)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    Test with this sample
                  </button>
                </div>
              </div>
            </section>

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

      {/* ── Animated Multi-Color Wave Footer ── */}
      <footer className="wave-footer">
        {/* Animated SVG Waves */}
        <div className="wave-wrapper">
          <svg
            className="waves-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shapeRendering="auto"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
              {/* Wave 1: Harvest Gold (#E1A36F) to Calico (#DEC484) - Topmost Warm Wave */}
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E1A36F" />
                <stop offset="100%" stopColor="#DEC484" />
              </linearGradient>

              {/* Wave 2: Calico (#DEC484) to Hampton Linen (#E2D8A5) */}
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DEC484" />
                <stop offset="100%" stopColor="#E2D8A5" />
              </linearGradient>

              {/* Wave 3: Sea Nymph Teal (#6F9F9C) to Smalt Blue (#577E89) */}
              <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6F9F9C" />
                <stop offset="100%" stopColor="#577E89" />
              </linearGradient>
            </defs>
            <g className="parallax-waves">
              {/* Wave 1: Harvest Gold */}
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="url(#wave1)" />
              {/* Wave 2: Calico Sand */}
              <use xlinkHref="#gentle-wave" x="48" y="2" fill="url(#wave2)" />
              {/* Wave 3: Sea Nymph Teal */}
              <use xlinkHref="#gentle-wave" x="48" y="4" fill="url(#wave3)" />
              {/* Wave 4: Smalt Blue Base connecting to footer background */}
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#577E89" />
            </g>
          </svg>
        </div>

        {/* Footer Content */}
        <div className="footer-content">
          <div className="footer-top-row">
            {/* Language Selector */}
            <div className="footer-lang-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>English</span>
            </div>

            {/* Social Circle Icons */}
            <div className="footer-socials">
              {/* Facebook */}
              <a href="#" className="social-circle" title="Facebook" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="social-circle" title="Instagram" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="#" className="social-circle" title="X (Twitter)" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="#" className="social-circle" title="TikTok" aria-label="TikTok">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.3 6.3 0 0 0 1.95-4.57V8.77a8.27 8.27 0 0 0 4.82 1.54V6.89a4.83 4.83 0 0 1-1-.2z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="social-circle" title="YouTube" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="social-circle" title="LinkedIn" aria-label="LinkedIn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.66-.74 1.66-1.66 0-.92-.74-1.66-1.66-1.66-.92 0-1.66.74-1.66 1.66 0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
                </svg>
              </a>
              {/* GitHub */}
              <a href="https://github.com/dev998889/bg-remover" target="_blank" rel="noreferrer" className="social-circle" title="GitHub Repo" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-bottom-row">
            <div className="footer-copyright">
              <span>© BG Eraser, a free 100% in-browser AI tool</span>
            </div>
            <div className="footer-links">
              <a href="#">Terms of Service</a>
              <a href="#">General Terms and Conditions</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Imprint</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
