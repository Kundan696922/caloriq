import { useEffect, useState } from "react";

/**
 * Full-screen loader shown while the backend health check is pending,
 * and a retry screen if it comes back offline.
 *
 * Usage:
 *   const { status, retry } = useHealthCheck();
 *   if (status === "checking") return <BackendLoader status="checking" />;
 *   if (status === "offline") return <BackendLoader status="offline" onRetry={retry} />;
 */
export default function BackendLoader({
  status = "checking",
  onRetry,
  message,
  fullScreen = true,
}) {
  const [useFallbackIcon, setUseFallbackIcon] = useState(false);
  const [dots, setDots] = useState("");

  const isOffline = status === "offline";
  const displayMessage =
    message || (isOffline ? "Can't reach Caloriq server" : "Waking up Caloriq server");

  // Detect whether Font Awesome actually loaded. If the stylesheet failed
  // (CDN blocked, offline, ad-blocker, etc.) fall back to a pure-CSS icon
  // instead of showing an empty box / tofu glyph.
  useEffect(() => {
    let cancelled = false;

    const fallbackTimer = setTimeout(() => {
      if (!cancelled) setUseFallbackIcon(true);
    }, 1500);

    if (document.fonts && document.fonts.load) {
      document.fonts
        .load('900 20px "Font Awesome 6 Free"')
        .then((loadedFonts) => {
          clearTimeout(fallbackTimer);
          if (!cancelled) setUseFallbackIcon(loadedFonts.length === 0);
        })
        .catch(() => {
          if (!cancelled) setUseFallbackIcon(true);
        });
    }

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Animated "..." after the loading text (only while actively checking)
  useEffect(() => {
    if (isOffline) {
      setDots("");
      return;
    }
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 450);
    return () => clearInterval(id);
  }, [isOffline]);

  return (
    <div
      className={`cq-loader-root${isOffline ? " cq-offline" : ""}${
        fullScreen ? "" : " cq-inline"
      }`}
      style={{ "--cq-accent": isOffline ? "#ef4444" : "#22c55e" }}
    >
      <div className="cq-loader-wrapper">
        {[0, 1, 2].map((i) => (
          <div className="cq-loader-icon" key={i}>
            {useFallbackIcon ? (
              <span className="cq-dumbbell-css">
                <span className="cq-dumbbell-bar" />
              </span>
            ) : (
              <i className="fa-solid fa-dumbbell" aria-hidden="true" />
            )}
          </div>
        ))}

        <div className="cq-shadow" />
        <div className="cq-shadow" />
        <div className="cq-shadow" />

        <div className="cq-loading-text">
          {displayMessage}
          {!isOffline && <span className="cq-dots">{dots}</span>}
        </div>

        {isOffline && onRetry && (
          <button type="button" className="cq-retry-btn" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>

      <style>{`
        .cq-loader-root {
          margin: 0;
          width: 100%;
          height: 100vh;
          background: #0a0a0a;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          inset: 0;
          z-index: 9999;
        }

        .cq-loader-root.cq-inline {
          position: relative;
          inset: auto;
          width: 100%;
          height: auto;
          min-height: 240px;
          background: transparent;
          z-index: auto;
        }

        .cq-loader-wrapper {
          width: 220px;
          height: 150px;
          position: relative;
        }

        /* ============ ICONS (Font Awesome) ============ */
        .cq-loader-icon {
          width: 20px;
          height: 20px;
          position: absolute;
          left: 15%;
          top: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cq-accent);
          font-size: 20px;
          animation: cq-bounce 0.5s alternate infinite ease;
          transition: color 0.3s ease;
        }

        .cq-offline .cq-loader-icon {
          animation-play-state: paused;
          top: 20px;
          transform: scale(1);
        }

        .cq-loader-icon:nth-child(2) {
          left: 45%;
          animation-delay: 0.2s;
        }

        .cq-loader-icon:nth-child(3) {
          left: auto;
          right: 15%;
          animation-delay: 0.3s;
        }

        @keyframes cq-bounce {
          0% {
            top: 60px;
            transform: scaleX(1.3) scaleY(0.5);
          }
          40% {
            transform: scaleX(1) scaleY(1);
          }
          100% {
            top: 0;
            transform: scale(1);
          }
        }

        /* ============ CSS-ONLY FALLBACK ICON ============
           Drawn with plain spans/pseudo-elements so it renders
           identically whether or not Font Awesome loaded. */
        .cq-dumbbell-css {
          position: relative;
          display: inline-block;
          width: 20px;
          height: 20px;
        }

        .cq-dumbbell-css::before,
        .cq-dumbbell-css::after {
          content: "";
          position: absolute;
          top: 3px;
          width: 6px;
          height: 14px;
          background: var(--cq-accent);
          border-radius: 2px;
          transition: background 0.3s ease;
        }

        .cq-dumbbell-css::before {
          left: 0;
        }

        .cq-dumbbell-css::after {
          right: 0;
        }

        .cq-dumbbell-bar {
          position: absolute;
          left: 6px;
          right: 6px;
          top: 8px;
          height: 4px;
          background: var(--cq-accent);
          border-radius: 2px;
          transition: background 0.3s ease;
        }

        /* ============ SHADOWS ============ */
        .cq-shadow {
          width: 20px;
          height: 4px;
          position: absolute;
          top: 62px;
          left: 15%;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.25);
          filter: blur(1px);
          animation: cq-shadow 0.5s alternate infinite ease;
        }

        .cq-offline .cq-shadow {
          animation-play-state: paused;
          opacity: 0.4;
        }

        .cq-shadow:nth-child(5) {
          left: 45%;
          animation-delay: 0.2s;
        }

        .cq-shadow:nth-child(6) {
          left: auto;
          right: 15%;
          animation-delay: 0.3s;
        }

        @keyframes cq-shadow {
          0% {
            transform: scaleX(1.5);
          }
          40% {
            transform: scaleX(1);
            opacity: 0.7;
          }
          100% {
            transform: scaleX(0.2);
            opacity: 0.4;
          }
        }

        /* ============ LOADING TEXT ============ */
        .cq-loading-text {
          position: absolute;
          top: 84px;
          left: 0;
          width: 100%;
          text-align: center;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #999;
          animation: cq-pulse 1.8s ease-in-out infinite;
          white-space: nowrap;
        }

        .cq-offline .cq-loading-text {
          animation: none;
          opacity: 0.85;
          color: #bbb;
        }

        .cq-dots {
          display: inline-block;
          width: 18px;
          text-align: left;
        }

        @keyframes cq-pulse {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }

        /* ============ RETRY BUTTON ============ */
        .cq-retry-btn {
          position: absolute;
          top: 112px;
          left: 50%;
          transform: translateX(-50%);
          background: transparent;
          border: 1px solid var(--cq-accent);
          color: var(--cq-accent);
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .cq-retry-btn:hover {
          background: var(--cq-accent);
          color: #0a0a0a;
        }
      `}</style>
    </div>
  );
}
