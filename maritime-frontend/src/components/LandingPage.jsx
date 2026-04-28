import { useState, useEffect } from "react";

import video from "../assets/264433_medium.mp4";

export default function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    const t = setTimeout(() => setVisible(true), 100);

    // Navbar scroll effect
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  
  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", background: "#000" }}>

      {/* Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Sora:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 60px",
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(0, 10, 30, 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(180, 150, 80, 0.15)" : "none",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px",
            border: "1.5px solid #b49650",
            transform: "rotate(45deg)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              width: "10px", height: "10px",
              background: "#b49650",
              transform: "rotate(0deg)"
            }} />
          </div>
          <span style={{
            color: "#fff",
            fontSize: "15px",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 400,
            letterSpacing: "3px",
            textTransform: "uppercase"
          }}>
            Maritime Dominion
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          {["Features", "About", "Contact"].map(link => (
            <span key={link} style={{
              color: "rgba(255,255,255,0.6)",
              fontFamily: "'Sora', sans-serif",
              fontSize: "12px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#b49650"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
            >
              {link}
            </span>
          ))}
          <button
            onClick={onGetStarted}
            style={{
              padding: "10px 24px",
              fontFamily: "'Sora', sans-serif",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              border: "1px solid #b49650",
              background: "transparent",
              color: "#b49650",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.target.style.background = "#b49650";
              e.target.style.color = "#000";
            }}
            onMouseLeave={e => {
              e.target.style.background = "transparent";
              e.target.style.color = "#b49650";
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>

        {/* Video Background */}
        <video
          autoPlay muted loop playsInline
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", zIndex: 0,
            filter: "brightness(0.6) saturate(0.8)"
          }}
        >
          <source src={video} type="video/mp4" />
        </video>

        {/* Overlay — deep navy gradient */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(135deg, rgba(0, 23, 43, 0.75) 0%, rgba(0, 32, 60, 0.5) 50%, rgba(0,5,20,0.8) 100%)"
        }} />

        {/* Decorative horizontal line */}
        <div style={{
          position: "absolute", zIndex: 2,
          left: "60px", right: "60px",
          bottom: "120px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(180,150,80,0.4), transparent)"
        }} />

        {/* Hero Content */}
        <div style={{
          position: "relative", zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: "10vw",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
        }}>

          {/* Eyebrow */}
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            marginBottom: "32px",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s ease 0.2s"
          }}>
            <div style={{ width: "40px", height: "1px", background: "#b49650" }} />
            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "11px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#b49650"
            }}>
              Maritime Intelligence Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontSize: "clamp(52px, 8vw, 110px)",
            fontWeight: 300,
            lineHeight: 1.0,
            letterSpacing: "-1px",
            color: "#ffffff",
            margin: 0,
            marginBottom: "8px",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s ease 0.4s"
          }}>
            Maritime
          </h1>
          <h1 style={{
            fontSize: "clamp(52px, 8vw, 110px)",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-1px",
            color: "#b49650",
            margin: 0,
            marginBottom: "40px",
            fontStyle: "italic",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s ease 0.5s"
          }}>
            Dominion.
          </h1>

          {/* Subtitle */}
          <p style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "16px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "1px",
            marginBottom: "56px",
            maxWidth: "400px",
            lineHeight: 1.7,
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s ease 0.6s"
          }}>
            Command your fleet. Monitor compliance.<br />
            Control the waters.
          </p>

          {/* CTA */}
          <div style={{
            display: "flex", gap: "20px", alignItems: "center",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s ease 0.8s"
          }}>
            <button
              onClick={onGetStarted}
              style={{
                padding: "16px 44px",
                fontFamily: "'Sora', sans-serif",
                fontSize: "12px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                background: "#b49650",
                color: "#000",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => e.target.style.background = "#c9ab5f"}
              onMouseLeave={e => e.target.style.background = "#b49650"}
            >
              Get Started
            </button>

            <span style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "12px",
              letterSpacing: "2px",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.2s"
            }}
              onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.8)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
            >
              Learn More →
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: "40px", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2, display: "flex", flexDirection: "column",
          alignItems: "center", gap: "8px",
          opacity: visible ? 0.5 : 0,
          transition: "opacity 1.2s ease 1.2s"
        }}>
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "9px", letterSpacing: "3px",
            textTransform: "uppercase", color: "rgba(255,255,255,0.5)"
          }}>Scroll</span>
          <div style={{
            width: "1px", height: "40px",
            background: "linear-gradient(180deg, rgba(180,150,80,0.6), transparent)",
            animation: "pulse 2s ease infinite"
          }} />
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{
        background: "#050d1f",
        borderTop: "1px solid rgba(180,150,80,0.15)",
        borderBottom: "1px solid rgba(180,150,80,0.15)",
        padding: "48px 10vw",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        {[
          { number: "IMO 2020", label: "Sulfur Cap Compliant" },
          { number: "Real-time", label: "Violation Detection" },
          { number: "Full", label: "Voyage Tracking" },
          { number: "Multi-port", label: "Operations Support" },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "32px", fontWeight: 600,
              color: "#b49650", marginBottom: "8px"
            }}>{stat.number}</div>
            <div style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)"
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}