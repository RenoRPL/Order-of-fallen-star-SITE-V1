import './App.css'

export default function App() {
  return (
    <div className="container">
      <h1 className="title">
        Order of the Fallen Star
      </h1>
      <p className="subtitle">
        This site is currently under construction.
      </p>
      <p className="description">
        Check back soon or follow us on Discord and Spectrum for updates.
      </p>

      <div className="buttons">
        <a
          href="https://discord.gg/YOUR_INVITE"
          target="_blank"
          className="button primary"
        >
          Join Our Discord
        </a>
        <a
          href="https://robertsspaceindustries.com/orgs/YOURTAG"
          target="_blank"
          className="button secondary"
        >
          Visit Spectrum
        </a>
      </div>
    </div>
  );
}
