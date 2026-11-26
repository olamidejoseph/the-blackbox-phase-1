import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  Command,
  Cpu,
  Github,
  Layers3,
  Menu,
  Moon,
  ScanLine,
  Search,
  Send,
  Sparkles,
  Sun,
  Terminal,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { capabilities, projects } from "./data";

const navItems = [
  { label: "Work", href: "#work" },
  { label: "System", href: "#system" },
  { label: "About", href: "#about" },
  { label: "CV", href: "#cv" },
  { label: "Contact", href: "#contact" },
];

function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("blackbox-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function SectionLabel({ number, children }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <span className="label-line" />
      <span>{children}</span>
    </div>
  );
}

function ProjectVisual({ kind }) {
  if (kind === "signal") {
    return (
      <div className="project-visual signal-visual" aria-hidden="true">
        <div className="signal-orbit orbit-one" />
        <div className="signal-orbit orbit-two" />
        <div className="signal-orbit orbit-three" />
        <div className="signal-core"><ScanLine size={26} strokeWidth={1.25} /></div>
        <span className="visual-tag tag-a">INPUT / 034</span>
        <span className="visual-tag tag-b">SIGNAL DETECTED</span>
      </div>
    );
  }
  if (kind === "mark") {
    return (
      <div className="project-visual mark-visual" aria-hidden="true">
        <div className="mark-square"><span>M</span><i /></div>
        <div className="mark-caption"><span>FRESH THINKING.</span><span>BETTER SOURCING.</span></div>
        <div className="mark-corner">M / 002</div>
      </div>
    );
  }
  if (kind === "wishlist") {
    return (
      <div className="project-visual wishlist-visual" aria-hidden="true">
        <div className="wishlist-frame">
          <span className="wishlist-kicker">A LITTLE CELEBRATION</span>
          <div className="wishlist-heart">♡</div>
          <div className="wishlist-title">WISHES<br /><span>WELCOME.</span></div>
          <div className="wishlist-footer"><span>GIFT IDEAS / MEMORIES / MESSAGES</span><span>05 — IN PROGRESS</span></div>
        </div>
      </div>
    );
  }
  if (kind === "scout") {
    return (
      <div className="project-visual scout-visual" aria-hidden="true">
        <div className="scout-grid-lines" />
        <div className="scout-orbit"><span /><span /><span /></div>
        <div className="scout-mark">ES<span>AI</span></div>
        <div className="scout-caption"><span>OPPORTUNITY INTELLIGENCE</span><span>SCAN / MATCH / DISCOVER</span></div>
        <div className="scout-index">LIVE SYSTEM / 004</div>
      </div>
    );
  }
  return (
    <div className="project-visual oto-visual" aria-hidden="true">
      <div className="oto-ring ring-a" />
      <div className="oto-ring ring-b" />
      <div className="oto-word">OTO<span>BONG</span></div>
      <div className="oto-caption">EXPRESS. CREATE. BECOME.</div>
      <div className="oto-index">IDENTITY STUDY / 003</div>
    </div>
  );
}

function CommandPalette({ open, onClose, onNavigate, onOpenAI }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const actions = [
      ...navItems.map((item) => ({ label: `Go to ${item.label}`, detail: item.href, action: () => onNavigate(item.href) })),
      { label: "Open Portfolio AI", detail: "Ask the system", action: () => onOpenAI("ask") },
      { label: "Open AI Lab", detail: "Experiments", action: () => onOpenAI("lab") },
      { label: "Open AI Builder", detail: "Prototype", action: () => onOpenAI("build") },
      { label: "View GitHub", detail: "External link", action: () => window.open("https://github.com/olamidejoseph/", "_blank", "noopener,noreferrer") },
    ];
    return actions.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));
  }, [query, onNavigate, onOpenAI]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="palette-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="palette-search">
              <Search size={18} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Where do you want to go?" aria-label="Search commands" />
              <button className="keycap" onClick={onClose} aria-label="Close command palette">ESC</button>
            </div>
            <div className="palette-caption">QUICK ACTIONS <span>↑ ↓ TO EXPLORE</span></div>
            <div className="palette-results">
              {filtered.map((item) => (
                <button key={item.label} className="palette-item" onClick={() => { item.action(); onClose(); }}>
                  <span className="palette-item-icon"><ArrowUpRight size={15} /></span>
                  <span>{item.label}</span>
                  <span className="palette-item-detail">{item.detail}</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="palette-empty">No matching commands. Try “work”, “AI”, or “contact”.</p>}
            </div>
            <div className="palette-footer"><span>THE BLACKBOX</span><span>BUILT TO BE EXPLORED</span></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function AIOverlay({ mode, onClose }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const title = mode === "lab"
    ? "THE AI LAB"
    : mode === "build"
      ? "THE AI BUILDER"
      : "PORTFOLIO INTELLIGENCE";

  const subtitle = mode === "lab"
    ? "An interactive technical playground is being prepared."
    : mode === "build"
      ? "Describe an interface to prototype. The generation service will connect in a later build phase."
      : "Ask about projects, skills, decisions, or the thinking behind this work.";

  async function submitQuestion(event) {
    event.preventDefault();

    const trimmed = question.trim();

    if (!trimmed || isLoading) return;

    if (mode !== "ask") {
      setMessages((current) => [
        ...current,
        { role: "user", text: trimmed },
        {
          role: "system",
          text: "This module is still being developed. Portfolio Intelligence is currently available."
        }
      ]);
      setQuestion("");
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed }
    ]);

    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "The server could not process your request."
        );
      }

      setSessionId(data.session_id);

      setMessages((current) => [
        ...current,
        {
          role: "system",
          text: data.reply || "The AI returned an empty response."
        }
      ]);

    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "system",
          text: `CONNECTION ERROR: ${error.message}. Please try again.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.aside
            className="ai-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 260
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-topline">
              <span>
                <span className="status-dot" />
                SYSTEM MODULE / {mode?.toUpperCase()}
              </span>
              <button
                className="icon-button"
                onClick={onClose}
                aria-label="Close AI panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-heading">
              <div className="drawer-symbol">
                <Sparkles size={23} />
              </div>
              <p className="eyebrow">BLACKBOX INTELLIGENCE</p>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>

            <div className="drawer-body">
              {mode === "lab" && (
                <div className="module-placeholder">
                  <Braces size={25} />
                  <strong>EXPERIMENT ENVIRONMENT</strong>
                  <span>
                    Interactive demos and sandboxed code previews arrive in Phase 4.
                  </span>
                </div>
              )}

              {mode === "build" && (
                <div className="module-placeholder">
                  <Layers3 size={25} />
                  <strong>PROTOTYPE WORKSPACE</strong>
                  <span>
                    Generated code will run in a restricted preview frame,
                    never on the application server.
                  </span>
                </div>
              )}

              {mode === "ask" && messages.length === 0 && (
                <div className="suggestion-list">
                  <p className="eyebrow">START WITH A QUESTION</p>

                  {[
                    "What kinds of projects are featured here?",
                    "What technologies does this portfolio use?",
                    "How is this portfolio being built?"
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuestion(item)}
                    >
                      {item}
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`chat-message ${message.role}`}
                >
                  <span>
                    {message.role === "user" ? "YOU" : "SYSTEM"}
                  </span>
                                  {message.role === "user" ? (
                  <p>{message.text}</p>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
                                </div>
                              ))}

              {isLoading && (
                <div className="chat-message system">
                  <span>BLACKBOX</span>
                  <p>Processing your request...</p>
                </div>
              )}
            </div>

            <form className="drawer-input" onSubmit={submitQuestion}>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={
                  mode === "build"
                    ? "Describe your prototype..."
                    : mode === "lab"
                      ? "Suggest an experiment..."
                      : "Ask the system anything..."
                }
                aria-label="Message the AI module"
                disabled={isLoading}
              />

              <button
                type="submit"
                aria-label="Submit message"
                disabled={isLoading || !question.trim()}
              >
                <Send size={17} />
              </button>
            </form>

            <div className="drawer-note">
              {isLoading ? "PROCESSING" : "SYSTEM STATUS"}
              <span>
                {mode === "ask"
                  ? "AI CONNECTION ACTIVE"
                  : "MODULE IN DEVELOPMENT"}
              </span>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiMode, setAiMode] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("SYSTEM READY. TYPE “HELP” TO EXPLORE.");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("blackbox-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0b0b0c" : "#f4f4f2");
  }, [theme]);

  const navigate = useCallback((href) => {
    document.querySelector(href)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    setMobileMenuOpen(false);
  }, [reduceMotion]);

  const openAI = useCallback((mode) => setAiMode(mode), []);

  useEffect(() => {
    function handleKey(event) {
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      } else if (event.key === "Escape") {
        setPaletteOpen(false);
        setAiMode(null);
        setMobileMenuOpen(false);
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function runTerminal(event) {
    event.preventDefault();
    const command = terminalInput.trim().toLowerCase();
    const commands = {
      help: "AVAILABLE: ABOUT · WORK · SYSTEM · AI · LAB · BUILD · CONTACT · CLEAR",
      about: "A petroleum engineering student and frontend developer exploring interfaces, systems, and AI-assisted tools.",
      work: "THREE PROJECT STUDIES ARE AVAILABLE ABOVE. MORE ENGINEERING NOTES WILL BE ADDED AS PROJECTS SHIP.",
      system: "FRONTEND: REACT + VITE / STYLING: TAILWIND / MOTION: MOTION FOR REACT / BACKEND: FASTAPI (PLANNED)",
      ai: "PORTFOLIO INTELLIGENCE IS IN PREVIEW. THE REAL MODEL CONNECTION WILL BE ADDED VIA THE PYTHON BACKEND.",
      lab: "THE AI LAB MODULE IS QUEUED FOR PHASE 4.",
      build: "THE AI BUILDER MODULE IS QUEUED FOR PHASE 5.",
      cv: "CV: FRONTEND DEVELOPER / REACT.JS / JAVASCRIPT / TAILWIND CSS. SCROLL TO THE CV SECTION TO REVIEW OR PRINT THE FULL RESUME.",
      contact: "EMAIL: josephola577@gmail.com. LINKEDIN: linkedin.com/in/olamide-joseph-smspe-smacs-b74991346/",
      clear: "",
    };
    setTerminalOutput(commands[command] ?? `COMMAND NOT FOUND: ${command.toUpperCase()}. TYPE “HELP” FOR AVAILABLE COMMANDS.`);
    setTerminalInput("");
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <div className="noise-layer" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="The Blackbox home">
          <span className="brand-mark"><span /></span>
          <span className="brand-word">THE<span>BLACKBOX</span></span>
          <span className="brand-version">/ 001</span>
        </a>
        <nav className={`desktop-nav ${mobileMenuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          {navItems.map((item, index) => <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}><span>0{index + 1}</span>{item.label}</a>)}
        </nav>
        <div className="header-actions">
          <button className="command-trigger" onClick={() => setPaletteOpen(true)} aria-label="Open command palette"><Command size={14} /><span>COMMAND</span><kbd>⌘ K</kbd></button>
          <button className="theme-toggle" onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="mobile-menu-button" onClick={() => setMobileMenuOpen((current) => !current)} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}>{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section page-wrap">
          <div className="hero-topline"><span><span className="status-dot" /> INDEPENDENT DIGITAL SYSTEMS</span><span>PORTFOLIO / 2026</span></div>
          <div className="hero-grid">
            <div className="hero-copy">
              <motion.p className="eyebrow hero-eyebrow" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>ENGINEERED WITH INTENT. BUILT TO EXPLORE.</motion.p>
              <motion.h1 initial={reduceMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}>
                THINK<br /><span className="outline-type">BEYOND</span><br />THE <span className="italic-type">BOX.</span>
              </motion.h1>
              <motion.div className="hero-bottom-copy" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.6 }}>
                <span className="hero-asterisk">✳</span>
                <p>A digital portfolio at the intersection of <strong>frontend engineering</strong>, intelligent tools, and unconventional ideas.</p>
              </motion.div>
              <div className="hero-cta-row">
                <a className="button-primary" href="#work">EXPLORE THE WORK <ArrowDownRight size={16} /></a>
                <button className="button-text" onClick={() => setPaletteOpen(true)}><Command size={15} /> EXPLORE THE SYSTEM</button>
              </div>
            </div>
            <motion.div className="hero-art" initial={reduceMotion ? false : { opacity: 0, scale: 0.92, rotate: 3 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9, delay: 0.18 }}>
              <div className="art-topline"><span>FIG. 001 / BLACKBOX</span><span>INTERACTIVE ENVIRONMENT</span></div>
              <div className="art-grid">
                <div className="art-cross cross-one" /><div className="art-cross cross-two" />
                <div className="art-orbit orbit-large" /><div className="art-orbit orbit-medium" /><div className="art-orbit orbit-small" />
                <div className="art-cube"><div className="cube-face cube-front" /><div className="cube-face cube-side" /><div className="cube-face cube-top" /></div>
                <div className="art-center-label">B / 001</div>
                <div className="art-coordinate coord-one">01.2941° N<br />36.8219° E</div>
                <div className="art-coordinate coord-two">IDEA → INTERFACE<br />SIGNAL → SYSTEM</div>
                <div className="art-corner corner-one" /><div className="art-corner corner-two" />
              </div>
              <div className="art-bottomline"><span>FORM FOLLOWS FUNCTION.</span><span className="art-live"><i /> SYSTEM ONLINE</span></div>
            </motion.div>
          </div>
          <div className="hero-index-row"><span>01 — INTRODUCTION</span><span>SCROLL TO DECODE <ArrowDownRight size={13} /></span><span>DESIGNED FOR CURIOSITY</span></div>
        </section>

        <section className="manifesto-section">
          <div className="page-wrap manifesto-grid">
            <SectionLabel number="01">THE PREMISE</SectionLabel>
            <div className="manifesto-content">
              <p className="manifesto-headline">I DON'T JUST WANT TO BUILD <span>WEBSITES.</span></p>
              <p className="manifesto-body">I want to build <span>experiences</span> that make people pause, <span>tools</span> that make complex things clearer, and systems that prove good engineering can have a point of view.</p>
              <div className="manifesto-signoff"><span>THE MINDSET</span><span className="signoff-line" /><span>ALWAYS IN PROGRESS ↗</span></div>
            </div>
          </div>
        </section>

        <section id="work" className="work-section page-wrap">
          <div className="section-heading-row">
            <div><SectionLabel number="02">SELECTED WORK</SectionLabel><h2>PROOF OF<br /><span>THINKING.</span></h2></div>
            <p className="section-intro">Projects are not just things to look at. They are decisions, trade-offs, problems, and ideas made real.</p>
          </div>
          <div className="projects-grid">
            {projects.map((project) => (
              <motion.article className="project-card" key={project.number} whileHover={reduceMotion ? undefined : { y: -5 }} transition={{ duration: 0.22 }}>
                <ProjectVisual kind={project.visual} />
                <div className="project-meta"><span>{project.number} / {project.type}</span><span className="project-status"><i /> {project.status}</span></div>
                <div className="project-title-row"><h3>{project.title}</h3><ArrowUpRight size={20} /></div>
                <p className="project-description">{project.description}</p>
                <div className="project-stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
                {project.link && <a className="project-live-link" href={project.link} target="_blank" rel="noreferrer">OPEN LIVE PROJECT <ArrowUpRight size={14} /></a>}
              </motion.article>
            ))}
          </div>
          <div className="work-footnote"><span>MORE PROJECTS WILL APPEAR AS THEY SHIP.</span><a href="https://github.com/olamidejoseph/" target="_blank" rel="noreferrer">EXPLORE GITHUB <ArrowUpRight size={14} /></a></div>
        </section>

        <section id="system" className="system-section">
          <div className="page-wrap">
            <div className="section-heading-row system-heading">
              <div><SectionLabel number="03">INTELLIGENCE LAYER</SectionLabel><h2>THREE WAYS<br />TO <span>INTERACT.</span></h2></div>
              <p className="section-intro">Not AI for the label. AI with a job to do. Each module has a distinct purpose, interface, and set of constraints.</p>
            </div>
            <div className="capabilities-grid">
              {capabilities.map((item, index) => (
                <motion.button key={item.number} className="capability-card" onClick={() => openAI(item.command)} whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ duration: 0.2 }}>
                  <div className="capability-top"><span>{item.number} / MODULE</span><ArrowUpRight size={17} /></div>
                  <div className="capability-icon">{index === 0 ? <Sparkles size={22} /> : index === 1 ? <Cpu size={22} /> : <Braces size={22} />}</div>
                  <p className="eyebrow">{item.eyebrow}</p>
                  <h3>{item.title}</h3>
                  <p className="capability-description">{item.description}</p>
                  <span className="capability-open">OPEN MODULE <ArrowRight size={14} /></span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="about-section page-wrap">
          <div className="about-left"><SectionLabel number="04">THE OPERATOR</SectionLabel><h2>BUILT BY<br /><span>CURIOSITY.</span></h2><p className="about-statement">A petroleum engineering student. A frontend developer. A researcher by instinct. Interested in what happens when disciplines meet and ideas become useful things.</p><div className="about-note"><span>NO SHORTCUTS.</span><span>NO STATIC THINKING.</span><span>JUST THE WORK.</span></div></div>
          <div className="about-right">
            <div className="operator-card">
              <div className="operator-card-head"><span>OPERATOR PROFILE / 001</span><span>STATUS: LEARNING + BUILDING</span></div>
              <div className="operator-initials" aria-label="Abstract monogram, no profile photo">OJ<span>.</span></div>
              <div className="operator-name">OLAMIDE JOSEPH</div>
              <div className="operator-role">FRONTEND DEVELOPER / PETROLEUM ENGINEERING</div>
              <div className="operator-rule" />
              <div className="operator-facts"><div><span>01 / FOCUS</span><strong>Frontend + AI</strong></div><div><span>02 / APPROACH</span><strong>Build. Test. Refine.</strong></div><div><span>03 / PRINCIPLE</span><strong>Proof over claims.</strong></div></div>
            </div>
            <div className="stack-strip"><span>THE CURRENT TOOLKIT</span><div><span>REACT</span><span>JAVASCRIPT</span><span>TAILWIND</span><span>PYTHON / NEXT</span></div></div>
          </div>
        </section>

        <section id="cv" className="cv-section page-wrap">
          <div className="section-heading-row cv-heading">
            <div><SectionLabel number="05">THE CREDENTIALS</SectionLabel><h2>THE WORK.<br /><span>ON PAPER.</span></h2></div>
            <div className="cv-heading-side"><p className="section-intro">A concise record of my frontend skills, selected projects, education, and leadership. Open it, review it, or print it as a PDF.</p><button className="button-primary cv-print-button" onClick={() => window.print()}>PRINT / SAVE AS PDF <ArrowUpRight size={16} /></button></div>
          </div>
          <article className="resume-sheet">
            <div className="resume-topline"><span>THE BLACKBOX / OPERATOR FILE</span><span>CV — 001 / 2026</span></div>
            <header className="resume-header">
              <div><p className="eyebrow">FRONTEND DEVELOPER / REACT.JS / JAVASCRIPT / TAILWIND CSS</p><h3>OLAMIDE JOSEPH<br /><span>OLUWADAMILARE</span></h3></div>
              <div className="resume-contact"><a href="tel:+2348149148942">+234 814 914 8942</a><a href="mailto:josephola577@gmail.com">josephola577@gmail.com</a><span>Nigeria</span></div>
            </header>
            <div className="resume-links"><a href="https://github.com/olamidejoseph/" target="_blank" rel="noreferrer"><Github size={14} /> GitHub <ArrowUpRight size={12} /></a><a href="https://www.linkedin.com/in/olamide-joseph-smspe-smacs-b74991346/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={12} /></a><a href="https://otobong.vercel.app/" target="_blank" rel="noreferrer">Portfolio Projects <ArrowUpRight size={12} /></a></div>
            <div className="resume-section"><h4><span>01</span> PROFESSIONAL SUMMARY</h4><p>Intermediate Frontend Developer skilled in HTML, CSS, JavaScript, React.js, and Tailwind CSS, with hands-on experience developing and deploying web projects. Interested in building responsive, accessible, and user-friendly web applications that solve practical problems. Certified in Frontend Web Development by Pioneer Yourself 50 (PY50), with a strong commitment to continuous learning, clean implementation, and collaborative problem-solving.</p></div>
            <div className="resume-section"><h4><span>02</span> TECHNICAL SKILLS</h4><div className="resume-skills"><p><strong>Languages</strong><span>HTML5, CSS3, JavaScript (ES6+)</span></p><p><strong>Frameworks and Styling</strong><span>React.js, Tailwind CSS</span></p><p><strong>Development</strong><span>Responsive Web Design, UI Development, Component-Based Architecture, DOM Manipulation, Debugging</span></p><p><strong>Tools and Platforms</strong><span>GitHub, Vercel, Visual Studio Code</span></p></div></div>
            <div className="resume-section"><h4><span>03</span> SELECTED PROJECTS</h4><div className="resume-project"><div><strong>OTOBONG — Fashion Website</strong><a href="https://otobong.vercel.app/" target="_blank" rel="noreferrer">LIVE DEMO <ArrowUpRight size={11} /></a></div><p>Developed a fashion-focused web project with an emphasis on visual presentation, branding, and user experience. Applied frontend development skills to create a digital platform for a fashion brand.</p></div><div className="resume-project"><div><strong>Mark Box — Fresh Food Sourcing Platform</strong><a href="https://mark-box.vercel.app/" target="_blank" rel="noreferrer">LIVE DEMO <ArrowUpRight size={11} /></a></div><p>Built a web project concept focused on simplifying fresh food sourcing. Explored interface design and digital presentation for a practical, consumer-oriented service.</p></div><div className="resume-project"><div><strong>Edit Scout AI — Web Application</strong><a href="https://edit-scout-ai.vercel.app/" target="_blank" rel="noreferrer">LIVE DEMO <ArrowUpRight size={11} /></a></div><p>Developed a web project focused on AI-assisted discovery of video-editing work opportunities. Explored the application of web technologies to streamline opportunity discovery.</p></div><div className="resume-project"><div><strong>WhatsApp Status Web</strong><a href="https://whatsapp-status-web-ola.vercel.app/" target="_blank" rel="noreferrer">LIVE DEMO <ArrowUpRight size={11} /></a></div><p>Built and deployed a web project related to WhatsApp status content. Practised implementing web interfaces and publishing projects for public access.</p></div><div className="resume-project"><div><strong>Birthday Wishlist — Personal Web Experience</strong><a href="https://wishlist-omega-six.vercel.app/" target="_blank" rel="noreferrer">LIVE DEMO <ArrowUpRight size={11} /></a></div><p>Creating a personalised birthday website with a curated wishlist, featured gift ideas, experience contributions, and a message wall. The project is live and still in progress.</p></div></div>
            <div className="resume-two-col"><div className="resume-section"><h4><span>04</span> EDUCATION</h4><p><strong>University of Uyo, Akwa Ibom State, Nigeria</strong><br />B.Eng. Petroleum Engineering | 300 Level</p></div><div className="resume-section"><h4><span>05</span> CERTIFICATION</h4><p><strong>Frontend Web Development</strong><br />Pioneer Yourself 50 (PY50)</p></div></div>
            <div className="resume-two-col"><div className="resume-section"><h4><span>06</span> ACHIEVEMENTS & LEADERSHIP</h4><ul><li>First-place winner, ACS150 LinkedIn Challenge.</li><li>SPE Student Membership Chairperson, Society of Petroleum Engineers, University of Uyo Student Chapter.</li></ul></div><div className="resume-section"><h4><span>07</span> PROFESSIONAL STRENGTHS</h4><div className="resume-tags"><span>Problem-solving</span><span>Creativity</span><span>Adaptability</span><span>Continuous Learning</span><span>Teamwork</span><span>Communication</span></div></div></div>
            <div className="resume-bottomline"><span>OLAMIDE JOSEPH OLUWADAMILARE</span><span>PROOF OVER CLAIMS.</span></div>
          </article>
        </section>

        <section className="terminal-section">
          <div className="page-wrap">
            <div className="terminal-heading"><SectionLabel number="06">DIRECT ACCESS</SectionLabel><span><Terminal size={15} /> BLACKBOX CLI</span></div>
            <div className="terminal-window">
              <div className="terminal-bar"><div><i /><i /><i /></div><span>visitor@blackbox:~</span><span>INTERACTIVE TERMINAL / 001</span></div>
              <div className="terminal-content">
                <p className="terminal-welcome">WELCOME TO THE BLACKBOX INTERFACE.</p>
                <p className="terminal-output">{terminalOutput}</p>
                <form className="terminal-form" onSubmit={runTerminal}><span>visitor@blackbox <b>~</b> $</span><input value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} placeholder="type a command..." aria-label="Terminal command" autoComplete="off" /><button type="submit" aria-label="Run command"><ArrowRight size={16} /></button></form>
                <div className="terminal-hint">TRY: HELP · ABOUT · WORK · SYSTEM · AI · LAB · BUILD · CONTACT</div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section page-wrap">
          <SectionLabel number="07">END OF TRANSMISSION?</SectionLabel>
          <div className="contact-main"><h2>LET'S MAKE<br /><span>SOMETHING</span><br />MATTER.</h2><div className="contact-side"><p>Have a role, a collaboration, or a problem worth solving? Start a conversation.</p><a className="button-primary" href="https://www.linkedin.com/in/olamide-joseph-smspe-smacs-b74991346/" target="_blank" rel="noreferrer">CONNECT ON LINKEDIN <ArrowUpRight size={16} /></a><a className="contact-github" href="https://github.com/olamidejoseph/" target="_blank" rel="noreferrer"><Github size={16} /> GITHUB / OLAMIDEJOSEPH</a></div></div>
          <div className="contact-stamp"><span>OPEN TO OPPORTUNITIES</span><Zap size={15} /><span>LET THE WORK SPEAK</span></div>
        </section>
      </main>

      <footer className="site-footer page-wrap"><a className="brand footer-brand" href="#top"><span className="brand-mark"><span /></span><span className="brand-word">THE<span>BLACKBOX</span></span></a><span>DESIGNED WITH INTENT. BUILT IN PUBLIC.</span><a href="#top">BACK TO TOP ↑</a><span>© 2026 / OJ</span></footer>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={navigate} onOpenAI={openAI} />
      <AIOverlay mode={aiMode} onClose={() => setAiMode(null)} />
    </div>
  );
}
