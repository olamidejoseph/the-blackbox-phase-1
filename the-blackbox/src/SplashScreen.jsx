
import { useEffect, useState } from "react";
import "./splashscreen.css";

export default function SplashScreen({ children }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 7900);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 8750);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return (
    <>
      {children}

      {visible && (
        <div
          className={`unseen-screen ${leaving ? "unseen-screen--leaving" : ""}`}
          role="status"
          aria-label="Entering The Blackbox"
        >
          <div className="unseen-topline">
            <span>THE BLACKBOX</span>
            <span>AN EXPLORATION OF WHAT LIES BENEATH</span>
            <span>EST. 001</span>
          </div>

          <div className="unseen-stage">
            <div className="unseen-index">A STUDY IN POSSIBILITY</div>

            <div className="unseen-typography">
              <span className="unseen-line unseen-line--one">
                NOT
              </span>
              <span className="unseen-line unseen-line--two">
                EVERYTHING
              </span>
              <span className="unseen-line unseen-line--three">
                IS
                <span className="unseen-italic"> VISIBLE.</span>
              </span>
            </div>

            <div className="unseen-side-note">
              LOOK CLOSER
              <span>↓</span>
            </div>

            <div className="unseen-reveal-line" />
          </div>

          <div className="unseen-bottomline">
            <span>THOUGHT / FORM / EXPRESSION</span>
            <span className="unseen-counter">THE UNSEEN — 001</span>
            <span>PLEASE ENTER</span>
          </div>

          <div className="unseen-curtain unseen-curtain--left" />
          <div className="unseen-curtain unseen-curtain--right" />
        </div>
      )}
    </>
  );
}
