import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

/**
 * GuestAccountManagement — shown in Settings > Account tab for guest users.
 * Prompts them to sign up or log in instead of showing account management actions.
 */
export const GuestAccountManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Guest notice banner */}
      <Card>
        <div className="text-center py-4">
          <div className="text-5xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            You're browsing as a Guest
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Guest sessions are temporary — nothing is saved when you leave.
            Create a free account to unlock the full experience.
          </p>

          {/* Feature list */}
          <ul className="text-left max-w-sm mx-auto space-y-3 mb-8">
            {[
              { icon: "⭐", text: "Save your favorite quotes" },
              { icon: "📜", text: "Track your reading history" },
              { icon: "💬", text: "Write meditations on each quote" },
              { icon: "🔔", text: "Daily quote reminders" },
              { icon: "👤", text: "Personalized profile" },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <span className="text-xl">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate("/signup")}
              className="flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Free Account
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </Card>

      {/* Privacy note */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🔒</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Guest Privacy
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              As a guest, no personal data is collected or stored. Your session
              exists only in this browser tab and will be cleared when you exit
              guest mode or close the tab.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
