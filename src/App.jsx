import { useState, useRef, useCallback, useEffect } from "react";
import { removeBackground, preload } from "@imgly/background-removal";
import "./App.css";

const PRESET_BG_COLORS = [
  { name: "Transparent", value: "transparent", isCheckered: true },
  { name: "Electric Coral", value: "#FF4D4D" },
  { name: "Neon Mint", value: "#4DFFBC" },
  { name: "Slate Gray", value: "#898989" },
  { name: "Silver White", value: "#D9D9D9" },
  { name: "Pure White", value: "#FFFFFF" },
  { name: "Carbon Black", value: "#181A1D" },
];

const SHOWCASE_CATEGORIES = [
  {
    id: "ecommerce",
    label: "e-Commerce",
    title: "Bring your products into focus with professional looking photos",
    desc: "Remove other products, tags, labels, watermarks and other distractions in your product photos.",
    image: "/samples/sample_headphones.png",
    filename: "sample_headphones.png",
    bgBackdrop: "#898989", // Slate Gray
    badge: "Audio Gear",
  },
  {
    id: "fashion",
    label: "Fashion",
    title: "Showcase apparel and footwear on clean transparent backdrops",
    desc: "Create crisp Amazon, Shopify, and Instagram product listings with high-contrast outlines.",
    image: "/samples/sample_sneaker.png",
    filename: "sample_sneaker.png",
    bgBackdrop: "#FF4D4D", // Electric Coral Red
    badge: "Footwear",
  },
  {
    id: "auto",
    label: "Auto Listings",
    title: "Make vehicle listings pop on digital showrooms & classifieds",
    desc: "Replace busy dealership lots and distracting street backgrounds with sleek studio staging.",
    image: "/samples/sample_porsche.png",
    filename: "sample_porsche.png",
    bgBackdrop: "#181A1D", // Carbon Black
    badge: "Vehicles",
  },
  {
    id: "animals",
    label: "Animals",
    title: "Clean cutouts of pets, fur, and wildlife without harsh halos",
    desc: "Advanced edge matting accurately captures fine whiskers, fur textures, and animal contours.",
    image: "/samples/sample_dog.png",
    filename: "sample_dog.png",
    bgBackdrop: "#4DFFBC", // Neon Mint
    badge: "Pets & Wildlife",
  },
  {
    id: "jewellery",
    label: "Jewellery",
    title: "Sparkling gems and fine metals isolated with microscopic clarity",
    desc: "Eliminate reflection artifacts and uneven backdrops to highlight the craftsmanship of luxury jewels.",
    image: "/samples/sample_watch.png",
    filename: "sample_watch.png",
    bgBackdrop: "#D9D9D9", // Silver Gray
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

  // ── FAQ Accordion State ──
  const [openFaq, setOpenFaq] = useState(0);
  const toggleFaq = (idx) => setOpenFaq((prev) => (prev === idx ? null : idx));

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
              <p>100% Free AI Background Remover</p>
            </div>
          </div>

          <div className="nav-badges-group">
            <div className="nav-pill-badge badge-free">
              <span className="badge-dot" />
              <span>100% Free</span>
            </div>
            <div className="nav-pill-badge badge-privacy desktop-only">
              <span className="pill-icon">🛡️</span>
              <span>100% Private</span>
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
              <span className="btn-github-text">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main className="main">
        {/* ── Upload State ── */}
        {!original && (
          <>
            <div className="hero">
              <div className="hero-pill-badge">
                <span className="badge-sparkle">🎉</span>
                <span>100% Free Online Background Remover · No Sign-Up</span>
              </div>
              <h2>Erase Image Backgrounds <span>Instantly & 100% Free</span></h2>
              <p>Cutting-edge in-browser AI removes backgrounds in seconds with sub-pixel precision. Zero watermarks, no login, unlimited exports, and your photos never leave your device.</p>
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
              <h3>Drop Your Image Here — It's 100% Free</h3>
              <p>or <strong>click to browse files</strong> · Instant automatic cutout</p>
              <div className="format-pills">
                {["PNG", "JPG", "WEBP", "AVIF", "HEIC"].map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
            </div>

            {/* Trust Highlights Row */}
            <div className="hero-trust-bar">
              <span className="trust-item">
                <span className="trust-check">✓</span> 100% Free Forever
              </span>
              <span className="trust-item">
                <span className="trust-check">✓</span> No Sign-Up Required
              </span>
              <span className="trust-item">
                <span className="trust-check">✓</span> Zero Watermarks
              </span>
              <span className="trust-item">
                <span className="trust-check">✓</span> Full Original HD
              </span>
              <span className="trust-item">
                <span className="trust-check">✓</span> 100% Private (Runs locally)
              </span>
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

            {/* ── 2. Bento Grid: Precision Across Every Subject (Unique 2026 Design) ── */}
            <section className="bento-section">
              <div className="section-header-tag">
                <span className="tag-dot" />
                <span>Next-Gen Edge Intelligence</span>
              </div>
              <h2 className="section-title">Engineered for <span>Every Pixel</span></h2>
              <p className="section-subtitle">
                Trained on millions of real-world captures to isolate razor-sharp edges, micro hair follicles, and transparent textures in seconds.
              </p>

              <div className="bento-grid">
                {/* Bento Card 1: E-Commerce Footwear */}
                <div className="bento-card bento-card-large">
                  <div className="bento-card-header">
                    <span className="bento-tag tag-coral">E-Commerce & Amazon</span>
                    <h3>Studio Product Staging</h3>
                    <p>Clean crisp outlines for footwear, apparel, and gadgets. Eliminate uneven studio lighting and drop products directly onto marketplace white or custom campaign colors.</p>
                  </div>
                  <div className="bento-visual visual-shoe">
                    <div className="bento-img-bg checkerboard">
                      <img src="/samples/sample_sneaker.png" alt="Sneaker Cutout" className="bento-img" />
                    </div>
                    <div className="bento-floating-pill pill-coral">
                      <span>✓ 100% Marketplace Compliant</span>
                    </div>
                  </div>
                </div>

                {/* Bento Card 2: Fur & Hair Matting */}
                <div className="bento-card bento-card-tall">
                  <div className="bento-card-header">
                    <span className="bento-tag tag-mint">Micro Matting</span>
                    <h3>Animals & Fine Hair</h3>
                    <p>Sub-pixel alpha masking preserves wispy whiskers, fluffy fur, and fine human hair strands without harsh jagged borders or color bleed.</p>
                  </div>
                  <div className="bento-visual visual-pet">
                    <div className="bento-img-bg bento-bg-mint">
                      <img src="/samples/sample_dog.png" alt="Dog Cutout" className="bento-img" />
                    </div>
                    <div className="bento-floating-pill pill-mint">
                      <span>🐾 Zero Whisker Loss</span>
                    </div>
                  </div>
                </div>

                {/* Bento Card 3: Luxury Watches & Jewels */}
                <div className="bento-card">
                  <div className="bento-card-header">
                    <span className="bento-tag tag-silver">Micro Precision</span>
                    <h3>Jewelry & Reflections</h3>
                    <p>Intelligently handles specular highlights and metallic shine without chewing into the product frame.</p>
                  </div>
                  <div className="bento-visual visual-compact">
                    <div className="bento-img-bg checkerboard">
                      <img src="/samples/sample_watch.png" alt="Watch Cutout" className="bento-img" />
                    </div>
                  </div>
                </div>

                {/* Bento Card 4: Audio Gear & Hardware */}
                <div className="bento-card">
                  <div className="bento-card-header">
                    <span className="bento-tag tag-carbon">Complex Geometry</span>
                    <h3>Tech Hardware & Cords</h3>
                    <p>Crisply carves out mesh headbands, delicate cables, and perforated metal grills with clean hollows.</p>
                  </div>
                  <div className="bento-visual visual-compact">
                    <div className="bento-img-bg bento-bg-coral">
                      <img src="/samples/sample_headphones.png" alt="Headphones Cutout" className="bento-img" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 3. Why Is This 100% Free Section (Authentic Technical Context) ── */}
            <section className="why-free-section">
              <div className="section-header-tag">
                <span className="tag-dot" />
                <span>Honest Transparency</span>
              </div>
              <h2 className="section-title">How Is This <span>100% Free With Zero Limits?</span></h2>
              <p className="section-subtitle">
                Most websites let you remove 1 background, and then trap you with mandatory subscriptions or paywalls. Here is the honest technical reason why BG Eraser is completely free.
              </p>

              <div className="why-free-grid">
                <div className="why-free-card">
                  <div className="why-free-icon icon-coral">💻</div>
                  <h3>Powered By Your Own Hardware</h3>
                  <p>Old-school tools send your photos to expensive cloud GPU servers, which costs them money for every single upload. BG Eraser runs the AI neural network directly in your browser using WebAssembly. Your device executes the model locally, so our server costs are nearly zero.</p>
                </div>

                <div className="why-free-card">
                  <div className="why-free-icon icon-mint">🚫</div>
                  <h3>No Sign-Up & No Email Traps</h3>
                  <p>You never have to sign up, log in, or give your email address. Just open the page, drag your picture in, and download the finished PNG. We don't store your personal data or send marketing emails.</p>
                </div>

                <div className="why-free-card">
                  <div className="why-free-icon icon-slate">💎</div>
                  <h3>Full Original Resolution (No Blur)</h3>
                  <p>Other tools purposely downscale free cutouts to 0.25 megapixels and demand $0.90 to unlock HD. BG Eraser exports uncompressed PNG files at your photo's full native resolution, up to 4K.</p>
                </div>

                <div className="why-free-card">
                  <div className="why-free-icon icon-carbon">♾️</div>
                  <h3>Truly Unlimited Everyday Usage</h3>
                  <p>Process 1 image or 1,000 photos for your e-commerce inventory, graphic design projects, or family albums. There are no credits, daily quotas, or countdown timers.</p>
                </div>
              </div>
            </section>

            {/* ── 4. The Architecture Advantage: In-Browser vs Cloud Comparison ── */}
            <section className="compare-section">
              <div className="section-header-tag">
                <span className="tag-dot" />
                <span>The Privacy Revolution</span>
              </div>
              <h2 className="section-title">Why In-Browser AI <span>Outperforms Cloud SaaS</span></h2>
              <p className="section-subtitle">
                Most background removers upload your personal photos to third-party cloud servers and charge you per image. We rebuilt it from the ground up using WebAssembly SIMD.
              </p>

              <div className="matrix-table-wrapper">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th className="th-feature">Core Capability</th>
                      <th className="th-us">
                        <div className="th-us-badge">
                          <span className="th-sparkle">⚡</span>
                          <strong>BG Eraser (This App)</strong>
                        </div>
                      </th>
                      <th className="th-cloud">Traditional Cloud Tools (Remove.bg / Magic Studio)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="td-feature">
                        <strong>Data Privacy & Security</strong>
                        <span>Where do your images get processed?</span>
                      </td>
                      <td className="td-us">
                        <span className="chip chip-success">🛡️ 100% Inside Your Browser</span>
                        <p className="td-sub">Zero bytes uploaded to any external server</p>
                      </td>
                      <td className="td-cloud">
                        <span className="chip chip-danger">☁️ Uploaded to Remote Servers</span>
                        <p className="td-sub">Stored on 3rd-party cloud disks</p>
                      </td>
                    </tr>

                    <tr>
                      <td className="td-feature">
                        <strong>Pricing & Usage Limits</strong>
                        <span>How much does it cost to use?</span>
                      </td>
                      <td className="td-us">
                        <span className="chip chip-success">✨ 100% Free Forever</span>
                        <p className="td-sub">Unlimited downloads, zero credit limits</p>
                      </td>
                      <td className="td-cloud">
                        <span className="chip chip-danger">💳 Paid Credits ($0.20 - $0.90 / image)</span>
                        <p className="td-sub">Aggressive monthly recurring subscriptions</p>
                      </td>
                    </tr>

                    <tr>
                      <td className="td-feature">
                        <strong>Export Resolution</strong>
                        <span>Do you get full HD or blurry previews?</span>
                      </td>
                      <td className="td-us">
                        <span className="chip chip-success">🎯 Full Original 4K HD</span>
                        <p className="td-sub">Uncompressed PNG with alpha channel</p>
                      </td>
                      <td className="td-cloud">
                        <span className="chip chip-warning">⚠️ Blurry 0.25 MP on free tier</span>
                        <p className="td-sub">Paywall to unlock high resolution</p>
                      </td>
                    </tr>

                    <tr>
                      <td className="td-feature">
                        <strong>Network Bandwidth & Speed</strong>
                        <span>Does it lag on slow internet?</span>
                      </td>
                      <td className="td-us">
                        <span className="chip chip-success">⚡ Instant Local WASM</span>
                        <p className="td-sub">Works even on offline or low bandwidth</p>
                      </td>
                      <td className="td-cloud">
                        <span className="chip chip-danger">⏳ Slow Upload & Queue Wait</span>
                        <p className="td-sub">Server queues, network timeout risks</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── 4. Impact Numbers Bar ── */}
            <section className="stats-strip">
              <div className="stat-box">
                <div className="stat-number">0 Bytes</div>
                <div className="stat-label">Cloud Storage Kept</div>
                <div className="stat-desc">Zero photos leave your device</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-box">
                <div className="stat-number">100%</div>
                <div className="stat-label">In-Browser WASM</div>
                <div className="stat-desc">Native multi-threaded execution</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-box">
                <div className="stat-number">4K UHD</div>
                <div className="stat-label">Max Resolution Support</div>
                <div className="stat-desc">Retains every micro-detail</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-box">
                <div className="stat-number">$0.00</div>
                <div className="stat-label">Free Forever</div>
                <div className="stat-desc">No login, no watermarks, no paywall</div>
              </div>
            </section>

            {/* ── 5. User Reviews & Verified Testimonials ── */}
            <section className="testimonials-section">
              <div className="section-header-tag">
                <span className="tag-dot" />
                <span>Loved by Creators & Teams</span>
              </div>
              <h2 className="section-title">Built for Those Who <span>Value Speed & Privacy</span></h2>
              <p className="section-subtitle">See why thousands of store owners, designers, and creators switched to in-browser AI.</p>

              <div className="testimonials-grid">
                <div className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-quote">
                    "I process over 80 product photos every single morning for our Shopify store. Other tools were charging us $40/month just for credits. BG Eraser runs instantly right inside Chrome and the edge quality on our sneakers is unbelievable."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar avatar-coral">RK</div>
                    <div className="author-meta">
                      <h4>Rohit K.</h4>
                      <p>D2C Apparel Brand Founder</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card featured-testimonial">
                  <div className="testimonial-badge">⭐ Top Pick</div>
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-quote">
                    "The client confidentiality rule at our agency prohibits uploading client portrait shoots to cloud AI APIs. Because BG Eraser executes 100% locally on the client device via WebAssembly, we can isolate subjects with total legal safety."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar avatar-mint">SM</div>
                    <div className="author-meta">
                      <h4>Sarah Mitchell</h4>
                      <p>Creative Director, Studio 9</p>
                    </div>
                  </div>
                </div>

                <div className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-quote">
                    "The split slider preview is so smooth. Being able to drop in a sneaker or luxury watch sample and see the transparent background cutout with custom background colors in 2 seconds is game changing."
                  </p>
                  <div className="testimonial-author">
                    <div className="author-avatar avatar-carbon">AM</div>
                    <div className="author-meta">
                      <h4>Aman Verma</h4>
                      <p>Full-Stack Designer & Photographer</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 6. Interactive FAQ Accordion ── */}
            <section className="faq-section">
              <div className="section-header-tag">
                <span className="tag-dot" />
                <span>Clear Answers</span>
              </div>
              <h2 className="section-title">Frequently Asked <span>Questions</span></h2>
              <p className="section-subtitle">Everything you need to know about our privacy architecture and technology.</p>

              <div className="faq-accordion">
                {[
                  {
                    q: "Is my photo ever sent to your server or stored anywhere?",
                    a: "No, absolutely never! Unlike other background removal websites that upload your image to their cloud servers, BG Eraser runs the AI neural network directly inside your web browser using WebAssembly. Your photos never leave your device, ensuring 100% privacy for confidential work, IDs, and personal photos."
                  },
                  {
                    q: "Why is BG Eraser completely free without monthly subscription plans?",
                    a: "Because all the AI processing computations happen directly on your own computer's processor (CPU/WASM), we don't have massive cloud GPU server bills to pay on every image. This allows us to offer completely unlimited, watermark-free background removal forever for free."
                  },
                  {
                    q: "What image formats and sizes are supported?",
                    a: "We support all standard image formats including PNG, JPG, JPEG, WEBP, AVIF, and HEIC up to ultra-high 4K resolutions. Whether it is an ink signature, product listing, or 4K portrait, our neural model automatically scales to capture the finest details."
                  },
                  {
                    q: "Can I replace the background with a custom color instead of keeping it transparent?",
                    a: "Yes! Once your background is removed, you can either keep it as a transparent PNG or choose from our curated color palette (such as Electric Coral, Neon Mint, Slate Gray, Pure White, or Carbon Black), or use the custom color picker for any specific hex shade."
                  },
                  {
                    q: "How does the edge precision compare to expensive tools like Photoshop or Remove.bg?",
                    a: "Our model leverages deep boundary segmentation matting trained on millions of diverse subjects. It accurately distinguishes semi-transparent hair, animal fur, glass reflections, and intricate hardware without harsh pixelation."
                  }
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className={`faq-item ${openFaq === idx ? "faq-open" : ""}`}
                    onClick={() => toggleFaq(idx)}
                  >
                    <div className="faq-question">
                      <h4>{faq.q}</h4>
                      <div className="faq-toggle-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                    {openFaq === idx && (
                      <div className="faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* ── 7. Pre-Footer High-Voltage CTA Banner ── */}
            <section className="cta-banner">
              <div className="cta-glow glow-coral" />
              <div className="cta-glow glow-mint" />
              <div className="cta-content">
                <div className="cta-badge">🚀 Instant & 100% Free</div>
                <h2>Ready to Erase Backgrounds in Seconds?</h2>
                <p>No account required. No watermark. No server uploads. Experience genuine privacy-first AI.</p>
                <button
                  className="btn-cta-scroll"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    if (fileInputRef.current) {
                      setTimeout(() => fileInputRef.current.click(), 400);
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload Your Image Now — It's Free
                </button>
              </div>
            </section>
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
            </defs>
            <g className="parallax-waves">
              {/* Wave 1: Solid Electric Coral Red (#FF4D4D) - Constant color */}
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="#FF4D4D" />
              {/* Wave 2: Solid Neon Mint (#4DFFBC) - Constant color */}
              <use xlinkHref="#gentle-wave" x="48" y="2" fill="#4DFFBC" />
              {/* Wave 3: Solid Slate Gray (#898989) - Constant color */}
              <use xlinkHref="#gentle-wave" x="48" y="4" fill="#898989" />
              {/* Wave 4: Solid Deep Carbon (#181A1D) - Seamless footer base */}
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="#181A1D" />
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
