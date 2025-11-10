"use client";

import Link from "next/link";

export default function AddToHomescreenTutorial() {
  return (
    <div className="prose prose-invert max-w-2xl mx-auto p-4 space-y-8">
      <h1>📱 Add ART to Your Homescreen</h1>
      <p>
        You can install <strong>ART Watch</strong> directly onto your phone like
        an app! It’s faster, easier to access, and more private.
      </p>

      <section>
        <h2>🧊 For Android (Chrome, Brave, Firefox)</h2>
        <ol>
          <li>Open the site in your browser:</li>
          <ul>
            <li className="flex flex-col">
              <span>Watch</span>
              <Link
                href="https://watch.alwaysreadytools.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                https://watch.alwaysreadytools.org
              </Link>
            </li>
          </ul>
          <li>Tap the menu icon (⋮) in the top-right.</li>
          <li>
            Tap <strong>“Add to Home screen.”</strong>
          </li>
          <li>
            Confirm the name and tap <strong>“Add.”</strong>
          </li>
        </ol>
      </section>

      <section>
        <h2>🍎 For iPhone/iOS (Safari only)</h2>
        <ol>
          <li>Open the site in Safari:</li>
          <ul>
            <li className="flex flex-col">
              <span>Watch</span>
              <Link
                href="https://watch.alwaysreadytools.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                https://watch.alwaysreadytools.org
              </Link>
            </li>
          </ul>
          <li>Tap the share icon (📤) at the bottom of the screen.</li>
          <li>
            Scroll and tap <strong>“Add to Home Screen.”</strong>
          </li>
          <li>
            Confirm and tap <strong>“Add.”</strong>
          </li>
        </ol>
      </section>

      <section>
        <h2>🛠 Why It Matters</h2>
        <ul>
          <li>No app store needed — install instantly</li>
          <li>Offline-capable (for Watch + cached UI)</li>
          <li>Looks and acts like a native app</li>
          <li>More discreet for urgent situations</li>
        </ul>
      </section>
    </div>
  );
}
