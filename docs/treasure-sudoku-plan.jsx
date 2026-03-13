import { useState } from "react";

const phases = [
  {
    id: "foundation",
    number: "01",
    title: "Foundation & Core Engine",
    timeline: "Weeks 1–4",
    color: "#e8a820",
    accent: "#fff3c4",
    icon: "⚙️",
    summary: "Harden the game engine, guarantee puzzle correctness, and architect for mobile.",
    tasks: [
      {
        name: "Unique-solution Sudoku generator",
        priority: "Critical",
        detail: "Replace random cell removal with a backtracking solver that verifies exactly one solution exists after each removal. This is non-negotiable for a paid product — ambiguous puzzles destroy trust."
      },
      {
        name: "Modular codebase architecture",
        priority: "Critical",
        detail: "Break the monolithic 2800-line HTML into modules: engine (generation, validation, solver), state management, UI components, API layer, and asset definitions. Migrate to React or Vue + TypeScript."
      },
      {
        name: "Persistent state management",
        priority: "Critical",
        detail: "All game state (progress, records, settings, streaks, vault data) must survive app close/crash. Use a state manager (Zustand or Redux) backed by AsyncStorage (React Native) or equivalent."
      },
      {
        name: "Difficulty calibration system",
        priority: "High",
        detail: "Move beyond simple cell-count removal. Rate puzzles by solving techniques required (naked singles, hidden pairs, X-wing, etc.). Map techniques to difficulty tiers for consistent challenge."
      },
      {
        name: "Performance-first particle system",
        priority: "High",
        detail: "Replace DOM-based particle spawning with Canvas or WebGL rendering. Target 60fps on 3-year-old devices. Add frame budget monitoring to auto-reduce effects."
      }
    ]
  },
  {
    id: "mobile",
    number: "02",
    title: "Mobile-Native Experience",
    timeline: "Weeks 5–8",
    color: "#50d890",
    accent: "#d4f5e4",
    icon: "📱",
    summary: "Wrap in a native shell, optimize for touch, and prepare for app store submission.",
    tasks: [
      {
        name: "React Native or Capacitor wrapper",
        priority: "Critical",
        detail: "Wrap the web app in Capacitor (lower lift from existing HTML/JS) or rebuild key screens in React Native (better performance). Capacitor recommended for faster time-to-market given existing codebase."
      },
      {
        name: "Touch-first UI redesign",
        priority: "Critical",
        detail: "Minimum 44×44pt tap targets (Apple HIG). Redesign the numpad and board cells for thumb-friendly interaction. Add gesture support: swipe to undo, long-press for notes, pinch-zoom on board."
      },
      {
        name: "Haptic feedback integration",
        priority: "Medium",
        detail: "Light haptics on cell selection, medium on correct placement, error buzz on wrong placement, success pattern on puzzle completion. Maps directly to iOS Taptic Engine and Android Vibration API."
      },
      {
        name: "Offline-first architecture",
        priority: "High",
        detail: "Daily puzzles should pre-generate 7 days ahead and cache locally. All core gameplay must work without network. Leaderboard syncs when connection returns."
      },
      {
        name: "Adaptive layout system",
        priority: "High",
        detail: "Support iPhone SE through iPad Pro and equivalent Android range. The board should maximize available space without scrolling. Handle notch/Dynamic Island/gesture bar safe areas."
      },
      {
        name: "Accessibility pass",
        priority: "High",
        detail: "VoiceOver/TalkBack support with ARIA labels on every interactive element. Color-blind mode (pattern overlays on artifacts instead of color-only differentiation). Dynamic Type support on iOS."
      }
    ]
  },
  {
    id: "backend",
    number: "03",
    title: "Backend & Live Services",
    timeline: "Weeks 9–12",
    color: "#4a9ef5",
    accent: "#d0e4ff",
    icon: "☁️",
    summary: "Stand up server infrastructure for daily puzzles, leaderboards, and anti-cheat.",
    tasks: [
      {
        name: "Server-side puzzle generation",
        priority: "Critical",
        detail: "Daily puzzles generated and signed server-side (Firebase Functions or Supabase Edge Functions). Prevents reverse-engineering of the seeded RNG. Distribute via a simple REST endpoint."
      },
      {
        name: "Authenticated leaderboard",
        priority: "Critical",
        detail: "Replace localStorage leaderboard with Firebase Realtime DB or Supabase. Require Game Center / Google Play Games sign-in for ranked play. Server validates submitted scores against puzzle solution + timestamp."
      },
      {
        name: "Anti-cheat validation",
        priority: "High",
        detail: "Server checks: minimum solve time (based on difficulty), move sequence plausibility, no duplicate submissions. Flag statistical outliers for review. Client-side obfuscation of solution data."
      },
      {
        name: "Analytics pipeline",
        priority: "High",
        detail: "Track: session length, completion rates by difficulty, drop-off points, daily retention, hint usage, monetization conversion. Use Firebase Analytics or Mixpanel. Essential for tuning difficulty and pricing."
      },
      {
        name: "Push notification service",
        priority: "Medium",
        detail: "Daily puzzle reminders, streak-at-risk alerts, weekly summary. Respect user preferences. iOS requires provisional notification permission strategy."
      }
    ]
  },
  {
    id: "monetization",
    number: "04",
    title: "Monetization & Revenue",
    timeline: "Weeks 13–16",
    color: "#c060ff",
    accent: "#ecdaff",
    icon: "💰",
    summary: "Implement the revenue model — premium upfront with optional expansions.",
    tasks: [
      {
        name: "Pricing strategy decision",
        priority: "Critical",
        detail: "Recommended: $2.99–$4.99 premium (one-time purchase) with no ads. The treasure/artifact theme justifies premium positioning. Alternatively: free with $4.99 unlock for Daily Mode + Leaderboard. Avoid ad-supported — it clashes with the premium aesthetic."
      },
      {
        name: "In-app hint packs (consumable IAP)",
        priority: "High",
        detail: "Sell hint bundles: 10 hints for $0.99, 30 for $1.99. Non-aggressive — hints are nice-to-have, never required. This is your recurring revenue engine."
      },
      {
        name: "Theme & artifact expansion packs",
        priority: "Medium",
        detail: "Cosmetic IAP: new artifact icon sets (Egyptian, Norse, Aztec, Underwater), board themes, particle effects. $1.99–$2.99 each. Pure cosmetic = no pay-to-win complaints. Release one per month post-launch."
      },
      {
        name: "Season Pass model (future)",
        priority: "Low",
        detail: "Monthly or quarterly pass ($2.99/mo) unlocking exclusive daily puzzle variants, seasonal leaderboards, and limited-edition artifacts. Only implement once you have retention data proving daily engagement."
      },
      {
        name: "StoreKit / Google Play Billing integration",
        priority: "Critical",
        detail: "Implement purchase flows, receipt validation (server-side!), restore purchases, and subscription management. Test extensively with sandbox accounts before submission."
      }
    ]
  },
  {
    id: "polish",
    number: "05",
    title: "Polish & Pre-Launch",
    timeline: "Weeks 17–20",
    color: "#ff7a5c",
    accent: "#ffe0d6",
    icon: "✨",
    summary: "Bug-fix, playtest, prepare store assets, and build pre-launch buzz.",
    tasks: [
      {
        name: "Beta testing program",
        priority: "Critical",
        detail: "TestFlight (iOS) + Google Play Internal Testing. Target 50–100 testers across device types. Run for 2–3 weeks minimum. Focus on: puzzle fairness, touch responsiveness, crash reports, and 'fun factor' feedback."
      },
      {
        name: "Sound design & music",
        priority: "High",
        detail: "Commission or license: ambient tropical/adventure loop, artifact placement chimes (unique per artifact), victory fanfare, error tone, UI interaction sounds. Audio is 30% of the perceived polish."
      },
      {
        name: "App Store Optimization (ASO)",
        priority: "Critical",
        detail: "Keywords: sudoku, puzzle, treasure, brain game, daily puzzle, logic. Craft 5 screenshot frames showing: gameplay, daily mode, leaderboard, artifact collection, win screen. Write compelling description emphasizing uniqueness vs plain sudoku."
      },
      {
        name: "Onboarding tutorial",
        priority: "High",
        detail: "Interactive first-play tutorial (not a text wall). Teach: tap-to-select, artifact placement, notes mode, the draw-hand mechanic in Daily Mode. 60-second max. Skippable for returning players."
      },
      {
        name: "Privacy policy & legal",
        priority: "Critical",
        detail: "Required for both stores. Cover: data collection (analytics), leaderboard names, no personal data sold. COPPA compliance if targeting under 13. Terms of service for competitive features."
      }
    ]
  },
  {
    id: "launch",
    number: "06",
    title: "Launch & Growth",
    timeline: "Weeks 21–24+",
    color: "#f5c842",
    accent: "#fff8e0",
    icon: "🚀",
    summary: "Ship it, acquire users, and build a retention flywheel.",
    tasks: [
      {
        name: "Simultaneous iOS + Android launch",
        priority: "Critical",
        detail: "Submit to both stores 2 weeks before target date (review times vary). Have a v1.0.1 hotfix ready to go for day-one issues. Monitor crash reports hourly on launch day."
      },
      {
        name: "Launch marketing push",
        priority: "High",
        detail: "Target puzzle game communities: Reddit (r/sudoku, r/puzzles, r/iosgaming), puzzle game Discord servers, Twitter/X puzzle community. Prepare 15-second gameplay GIFs and a 30-second trailer. Consider micro-influencer outreach to puzzle/brain game YouTubers."
      },
      {
        name: "Review solicitation strategy",
        priority: "High",
        detail: "Prompt for App Store review after 3rd puzzle completion (not first — let them fall in love first). Use SKStoreReviewController (iOS) and In-App Review API (Android). Target 4.5+ star rating."
      },
      {
        name: "Week-1 retention monitoring",
        priority: "Critical",
        detail: "Track D1, D3, D7 retention. Puzzle games benchmark: 40% D1, 20% D7. If below, diagnose: too hard? too easy? onboarding confusion? Missing daily hook? Adjust difficulty curve and notification timing."
      },
      {
        name: "Monthly content cadence",
        priority: "Medium",
        detail: "Post-launch: 1 new theme pack/month, seasonal events (holiday puzzles with unique artifacts), weekly challenges. Keep the vault feeling alive. This is your long-term retention moat."
      }
    ]
  }
];

const revenueProjections = [
  { month: "Month 1", downloads: "2,000–5,000", revenue: "$6K–$15K", notes: "Launch spike + organic ASO" },
  { month: "Month 3", downloads: "1,000–2,500/mo", revenue: "$4K–$10K/mo", notes: "Steady state + first theme pack IAP" },
  { month: "Month 6", downloads: "800–2,000/mo", revenue: "$5K–$14K/mo", notes: "IAP revenue growing, hint packs recurring" },
  { month: "Year 1", downloads: "15K–30K total", revenue: "$60K–$150K", notes: "Cumulative · assuming no paid acquisition" },
];

const priorityColors = {
  Critical: { bg: "#3d1212", border: "#ff5c5c", text: "#ff8a8a" },
  High: { bg: "#3d2e12", border: "#f5a623", text: "#ffc965" },
  Medium: { bg: "#12293d", border: "#4a9ef5", text: "#7fb8f7" },
  Low: { bg: "#1e123d", border: "#9b6dff", text: "#b898ff" },
};

export default function TreasureSudokuPlan() {
  const [activePhase, setActivePhase] = useState("foundation");
  const [expandedTask, setExpandedTask] = useState(null);

  const currentPhase = phases.find(p => p.id === activePhase);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0806",
      color: "#e8dcc8",
      fontFamily: "'Georgia', 'Palatino', serif",
      overflow: "hidden",
    }}>
      {/* Background texture */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.7' numOctaves='4'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Header */}
      <div style={{
        padding: "40px 32px 24px",
        borderBottom: "1px solid rgba(200,160,60,.15)",
        background: "linear-gradient(180deg, rgba(40,28,8,.6) 0%, transparent 100%)",
        position: "relative",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
        }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.35em", color: "rgba(200,160,60,.5)",
            textTransform: "uppercase", marginBottom: 8,
            fontFamily: "'Trebuchet MS', sans-serif",
          }}>
            Lauren Project · Treasure Sudoku
          </div>
          <h1 style={{
            fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 400,
            color: "#f5c842",
            textShadow: "0 0 40px rgba(245,200,66,.2)",
            margin: 0, lineHeight: 1.2, letterSpacing: "0.04em",
          }}>
            Product & Launch Plan
          </h1>
          <p style={{
            fontSize: 14, color: "rgba(200,180,140,.6)",
            fontStyle: "italic", marginTop: 8, maxWidth: 560, lineHeight: 1.6,
          }}>
            From prototype to paid app — a 24-week roadmap covering engine hardening,
            mobile optimization, backend services, monetization, and go-to-market strategy.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* Phase Navigation */}
        <div style={{
          display: "flex", gap: 0, marginTop: 32, marginBottom: 32,
          borderRadius: 12, overflow: "hidden",
          border: "1px solid rgba(200,160,60,.15)",
          flexWrap: "wrap",
        }}>
          {phases.map((phase) => {
            const isActive = activePhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => { setActivePhase(phase.id); setExpandedTask(null); }}
                style={{
                  flex: "1 1 auto",
                  minWidth: 100,
                  padding: "14px 10px",
                  background: isActive
                    ? `linear-gradient(135deg, ${phase.color}18, ${phase.color}08)`
                    : "rgba(20,14,6,.8)",
                  border: "none",
                  borderBottom: isActive ? `2px solid ${phase.color}` : "2px solid transparent",
                  color: isActive ? phase.color : "rgba(200,180,140,.4)",
                  cursor: "pointer",
                  fontFamily: "'Trebuchet MS', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{phase.icon}</span>
                <span style={{ fontWeight: isActive ? 700 : 400 }}>
                  {phase.title.split("&")[0].trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Phase Detail */}
        {currentPhase && (
          <div style={{ marginBottom: 48 }}>
            {/* Phase header */}
            <div style={{
              display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8,
            }}>
              <span style={{
                fontSize: 48, fontWeight: 200, color: currentPhase.color,
                opacity: 0.25, fontFamily: "'Trebuchet MS', sans-serif",
                lineHeight: 1,
              }}>
                {currentPhase.number}
              </span>
              <div>
                <h2 style={{
                  fontSize: 22, fontWeight: 400, color: currentPhase.color,
                  margin: 0, letterSpacing: "0.03em",
                }}>
                  {currentPhase.title}
                </h2>
                <div style={{
                  fontSize: 12, color: "rgba(200,180,140,.45)",
                  fontFamily: "'Trebuchet MS', sans-serif",
                  letterSpacing: "0.1em", marginTop: 2,
                }}>
                  {currentPhase.timeline}
                </div>
              </div>
            </div>
            <p style={{
              fontSize: 14, color: "rgba(200,180,140,.65)",
              fontStyle: "italic", marginBottom: 24, lineHeight: 1.6,
              borderLeft: `2px solid ${currentPhase.color}30`,
              paddingLeft: 16,
            }}>
              {currentPhase.summary}
            </p>

            {/* Tasks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentPhase.tasks.map((task, idx) => {
                const taskKey = `${currentPhase.id}-${idx}`;
                const isExpanded = expandedTask === taskKey;
                const pc = priorityColors[task.priority];
                return (
                  <div
                    key={idx}
                    onClick={() => setExpandedTask(isExpanded ? null : taskKey)}
                    style={{
                      background: isExpanded
                        ? `linear-gradient(135deg, ${currentPhase.color}08, rgba(20,14,6,.95))`
                        : "rgba(20,14,6,.8)",
                      border: `1px solid ${isExpanded ? currentPhase.color + "35" : "rgba(200,160,60,.1)"}`,
                      borderRadius: 10,
                      padding: "14px 18px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12,
                      justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <span style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 9,
                          fontFamily: "'Trebuchet MS', sans-serif",
                          letterSpacing: "0.1em",
                          fontWeight: 600,
                          background: pc.bg,
                          border: `1px solid ${pc.border}50`,
                          color: pc.text,
                          flexShrink: 0,
                        }}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span style={{
                          fontSize: 14, color: isExpanded ? currentPhase.accent : "#e8dcc8",
                          fontWeight: isExpanded ? 600 : 400,
                          transition: "color 0.2s",
                        }}>
                          {task.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: 14, color: "rgba(200,160,60,.3)",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                      }}>
                        ▸
                      </span>
                    </div>
                    {isExpanded && (
                      <div style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${currentPhase.color}15`,
                        fontSize: 13,
                        color: "rgba(200,180,140,.7)",
                        lineHeight: 1.7,
                      }}>
                        {task.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Revenue Projections */}
        <div style={{
          marginBottom: 48,
          background: "rgba(20,14,6,.8)",
          border: "1px solid rgba(200,160,60,.12)",
          borderRadius: 14,
          padding: "24px 28px",
        }}>
          <h3 style={{
            fontSize: 11, letterSpacing: "0.3em", color: "rgba(200,160,60,.5)",
            textTransform: "uppercase", margin: "0 0 20px 0",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 600,
          }}>
            💰 Revenue Projections (Conservative · No Paid Acquisition)
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}>
            {revenueProjections.map((row, i) => (
              <div key={i} style={{
                background: "rgba(40,28,8,.5)",
                border: "1px solid rgba(200,160,60,.1)",
                borderRadius: 10,
                padding: "16px 18px",
              }}>
                <div style={{
                  fontSize: 10, letterSpacing: "0.15em", color: "rgba(200,160,60,.45)",
                  fontFamily: "'Trebuchet MS', sans-serif",
                  textTransform: "uppercase", marginBottom: 6,
                }}>
                  {row.month}
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 600, color: "#f5c842",
                  marginBottom: 2, fontFamily: "'Trebuchet MS', sans-serif",
                }}>
                  {row.revenue}
                </div>
                <div style={{
                  fontSize: 11, color: "rgba(200,180,140,.45)",
                }}>
                  {row.downloads} downloads
                </div>
                <div style={{
                  fontSize: 10, color: "rgba(200,180,140,.35)",
                  fontStyle: "italic", marginTop: 4,
                }}>
                  {row.notes}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, fontSize: 11, color: "rgba(200,180,140,.35)",
            fontStyle: "italic", lineHeight: 1.6,
          }}>
            Assumes $3.99 base price + ~$0.80 average IAP per user. Revenue after Apple/Google's 15–30% commission.
            Projections based on comparable indie puzzle games (Monument Valley, Good Sudoku) scaled for smaller initial audience.
            Paid acquisition (Apple Search Ads) could 3–5× download volume at $1.50–$3.00 CPI.
          </div>
        </div>

        {/* Key Risks */}
        <div style={{
          marginBottom: 48,
          background: "rgba(60,20,20,.15)",
          border: "1px solid rgba(255,80,80,.12)",
          borderRadius: 14,
          padding: "24px 28px",
        }}>
          <h3 style={{
            fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,120,100,.5)",
            textTransform: "uppercase", margin: "0 0 16px 0",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 600,
          }}>
            ⚠️ Key Risks & Mitigations
          </h3>
          {[
            { risk: "Puzzle correctness bugs erode trust", mitigation: "Automated test suite generating and validating 10,000 puzzles per difficulty tier before each release." },
            { risk: "Low discoverability in crowded Sudoku category", mitigation: "Differentiate on visuals + daily competitive mode. Target 'treasure puzzle game' keywords, not just 'sudoku'. Consider featuring request to Apple editorial." },
            { risk: "Premium price deters downloads", mitigation: "Offer a free 'Novice' tier with 3 puzzles/day. Premium unlocks all difficulties, daily mode, leaderboards, and vault." },
            { risk: "Cheating undermines leaderboard integrity", mitigation: "Server-side validation, minimum time thresholds, and move-sequence plausibility checks. Shadow-ban flagged accounts." },
          ].map((item, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              padding: "12px 0",
              borderBottom: i < 3 ? "1px solid rgba(255,80,80,.06)" : "none",
              fontSize: 12,
              lineHeight: 1.6,
            }}>
              <div style={{ color: "rgba(255,140,120,.7)" }}>{item.risk}</div>
              <div style={{ color: "rgba(200,180,140,.55)" }}>{item.mitigation}</div>
            </div>
          ))}
        </div>

        {/* Tech Stack Recommendation */}
        <div style={{
          marginBottom: 48,
          background: "rgba(20,14,6,.8)",
          border: "1px solid rgba(200,160,60,.12)",
          borderRadius: 14,
          padding: "24px 28px",
        }}>
          <h3 style={{
            fontSize: 11, letterSpacing: "0.3em", color: "rgba(200,160,60,.5)",
            textTransform: "uppercase", margin: "0 0 16px 0",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 600,
          }}>
            🔧 Recommended Tech Stack
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}>
            {[
              { label: "App Shell", value: "Capacitor + Ionic", reason: "Leverages existing HTML/CSS/JS investment" },
              { label: "Frontend", value: "React + TypeScript", reason: "Type safety, component reuse, huge ecosystem" },
              { label: "State", value: "Zustand + AsyncStorage", reason: "Lightweight, persistent, minimal boilerplate" },
              { label: "Backend", value: "Supabase", reason: "Auth, DB, edge functions, realtime — all-in-one" },
              { label: "Analytics", value: "Firebase Analytics", reason: "Free tier covers early scale, deep funnel tracking" },
              { label: "Payments", value: "RevenueCat", reason: "Abstracts StoreKit + Play Billing, handles receipts" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(40,28,8,.5)",
                border: "1px solid rgba(200,160,60,.08)",
                borderRadius: 8,
                padding: "12px 14px",
              }}>
                <div style={{
                  fontSize: 9, letterSpacing: "0.15em", color: "rgba(200,160,60,.4)",
                  fontFamily: "'Trebuchet MS', sans-serif",
                  textTransform: "uppercase",
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, color: "#e8dcc8", marginTop: 4, fontWeight: 600 }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 10, color: "rgba(200,180,140,.4)", marginTop: 4, fontStyle: "italic" }}>
                  {item.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          padding: "32px 0 48px",
          borderTop: "1px solid rgba(200,160,60,.08)",
        }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.3em", color: "rgba(200,160,60,.25)",
            fontFamily: "'Trebuchet MS', sans-serif",
            textTransform: "uppercase",
          }}>
            Treasure Sudoku · The Lost Relics of Solara
          </div>
          <div style={{
            fontSize: 11, color: "rgba(200,180,140,.2)",
            fontStyle: "italic", marginTop: 6,
          }}>
            From sandcastle prototype to fortified product — 24 weeks to ship
          </div>
        </div>
      </div>
    </div>
  );
}
