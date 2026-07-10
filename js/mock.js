/* ============================================================
   Mock / simulated data engine.
   Generates believable scan reports and dashboard feeds.
   ============================================================ */

const SAMPLE_DOMAINS = [
  "secure-login-paypa1.com", "update-account-verify.net", "microsoft-support.help",
  "amaz0n-delivery.info", "bankofamerica-alert.co", "netflix-billing-update.tv",
  "dropbox-sharedfile.link", "apple-id-locked.support", "chase-verify-now.com",
  "office365-signin.app", "coinbase-wallet-sync.io", "linkedin-jobalert.click",
];

const SAFE_DOMAINS = [
  "github.com", "wikipedia.org", "cloudflare.com", "vercel.com", "mozilla.org",
];

const THREAT_TYPES = ["Phishing", "Malware", "Credential Harvesting", "Typosquatting", "Spoofing", "Suspicious Redirect"];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function uid() { return Math.random().toString(36).slice(2, 10); }

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

/* Generates a lightweight browser-chrome mockup as an inline SVG data URI,
   standing in for a real sandbox screenshot capture. Used only by the
   Sandbox tab's Screenshot Capture panel. */
function screenshotDataUri(host, isSafe, tall) {
  const w = 640, h = tall ? 900 : 400;
  const bg = isSafe ? "#111a2e" : "#241318";
  const barColor = isSafe ? "#5b8cff" : "#ef5468";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <rect width="${w}" height="34" fill="#0d1220"/>
    <circle cx="18" cy="17" r="5" fill="#ef5468"/>
    <circle cx="36" cy="17" r="5" fill="#f0a857"/>
    <circle cx="54" cy="17" r="5" fill="#3ea6ff"/>
    <rect x="80" y="8" width="${w - 160}" height="18" rx="9" fill="#1a2337"/>
    <text x="90" y="21" font-family="monospace" font-size="11" fill="#8992a9">${escapeXml(host)}</text>
    <rect x="40" y="70" width="${w - 80}" height="14" rx="4" fill="${barColor}" opacity="0.85"/>
    <rect x="40" y="100" width="${(w - 80) * 0.7}" height="10" rx="4" fill="#2a3450"/>
    <rect x="40" y="122" width="${(w - 80) * 0.5}" height="10" rx="4" fill="#2a3450"/>
    <rect x="40" y="160" width="180" height="42" rx="8" fill="${barColor}"/>
    <text x="130" y="186" font-family="sans-serif" font-size="13" fill="#0a0e17" text-anchor="middle">${isSafe ? "Continue" : "Verify Now"}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* Build one analysis report for a given URL */
function generateReport(url) {
  let host = url;
  try { host = new URL(url.includes("://") ? url : "https://" + url).hostname; } catch (e) { }

  const isSafe = SAFE_DOMAINS.some((d) => host.includes(d));
  const legitimacy = isSafe ? rand(88, 99) : rand(6, 44);
  const aiConfidence = rand(94, 999) / 10;
  const verdict = legitimacy >= 70 ? "SAFE" : legitimacy >= 45 ? "SUSPICIOUS" : "MALICIOUS";

  const detected = isSafe
    ? []
    : Array.from({ length: rand(2, 4) }, () => pick(THREAT_TYPES)).filter((v, i, a) => a.indexOf(v) === i);

  // ---- Sandbox (dynamic/behavioral analysis) — same field set as the
  // previous report's Sandbox tab (Page & TLS info, Security & Redirects,
  // request/popup/download stats, full Behaviour Summary signals).
  const sandboxCertPresent = isSafe ? true : Math.random() > 0.3;
  const sandboxBrandMatch = isSafe
    ? null
    : (Math.random() > 0.4
      ? { brand: pick(["microsoft", "paypal", "amazon", "apple", "chase", "netflix", "dropbox"]), similarity: +(rand(75, 99) / 100).toFixed(2) }
      : null);
  const sandboxRedirects = Array.from({ length: isSafe ? rand(0, 1) : rand(1, 4) }, () => ({
    httpStatusCode: pick([301, 302, 307]),
    redirectUrl: `https://${pick(SAMPLE_DOMAINS)}/landing`,
  }));
  const sandboxDownloads = Array.from({ length: isSafe ? 0 : rand(0, 2) }, () => ({
    fileName: pick(["invoice.exe", "update.zip", "secure-doc.pdf.exe", "installer.msi", "statement.scr"]),
    fileSizeBytes: rand(20000, 4500000),
  }));
  const sandboxEvasionTechniques = ["Fingerprint Evasion", "Headless Browser Detection Bypass", "Delayed Payload Execution", "Right-Click Disable", "DevTools Detection Bypass", "IP Cloaking"]
    .slice(0, rand(2, 4))
    .map((name) => ({ name, flagged: isSafe ? false : Math.random() > 0.5 }));
  const sandboxPermissionRequests = isSafe
    ? []
    : ["geolocation", "notifications", "camera", "microphone"].filter(() => Math.random() > 0.65);

  return {
    id: uid(),
    url: url,
    host: host,
    scannedAt: new Date().toLocaleString(),
    legitimacy,
    aiConfidence,
    verdict,
    riskScore: 100 - legitimacy,
    detected,
    intel: {
      domain: pick(["NameCheap Inc", "GoDaddy LLC", "Porkbun", "Tucows", "Google Domains"]),
      age: `${rand(1, 60)} days`,
      confidence: `${rand(90, 99)}%`,
      ip: `${rand(11, 220)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`,
      threat: isSafe ? 0 : rand(3, 9),
      expiration: `${rand(30, 365)} days`,

      reputation: isSafe ? "Safe" : "Unsafe",
      brandSimilarity: isSafe ? "No" : "Yes",
      fakeCharacters: isSafe ? "Not Detected" : "Detected",
      urlShortener: isSafe ? "No" : "Yes",
    },
    sandbox: {
      // Screenshot capture
      screenshots: {
        homepage: screenshotDataUri(host, isSafe, false),
        fullpage: screenshotDataUri(host, isSafe, true),
      },

      // Page & TLS info
      pageTitle: isSafe
        ? `${host} — Official Site`
        : pick(["Account Verification Required", "Sign in to your account", "Secure Login Portal", "Confirm Your Identity"]),
      finalUrl: `https://${host}/`,
      pageLanguage: pick(["en", "en-US", "en-GB", "es", "fr"]),
      domElementCount: rand(120, 2400),
      certificatePresent: sandboxCertPresent,
      certificateIssuer: sandboxCertPresent ? pick(["Let's Encrypt", "DigiCert Inc", "Sectigo", "Google Trust Services"]) : null,
      tlsVersion: sandboxCertPresent ? pick(["TLS 1.2", "TLS 1.3"]) : null,
      certificateIssued: sandboxCertPresent ? new Date(Date.now() - rand(5, 300) * 86400000).toLocaleDateString() : null,

      // Security & redirects
      securityHeadersPresent: isSafe
        ? "Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options"
        : pick(["None", "X-Content-Type-Options", "Strict-Transport-Security"]),
      brandImpersonationMatch: sandboxBrandMatch,
      qrCodeDetected: isSafe ? false : Math.random() > 0.85,
      cloakingDetected: isSafe ? false : Math.random() > 0.6,
      redirects: sandboxRedirects,

      // Stats
      totalRequestCount: rand(12, 180),
      thirdPartyDomainCount: isSafe ? rand(1, 5) : rand(6, 20),
      popupCount: isSafe ? 0 : rand(0, 3),
      downloads: sandboxDownloads,

      // Behaviour summary
      xhrRequestCount: rand(0, 40),
      websocketConnectionCount: isSafe ? 0 : rand(0, 2),
      fingerprintingApiCount: isSafe ? rand(0, 1) : rand(1, 6),
      newTabCount: isSafe ? 0 : rand(0, 2),
      clipboardReadAttempts: isSafe ? 0 : rand(0, 2),
      clipboardWriteAttempts: isSafe ? 0 : rand(0, 2),
      permissionRequests: sandboxPermissionRequests,
      passwordFieldCount: isSafe ? 0 : rand(1, 2),
      emailFieldCount: isSafe ? 0 : rand(1, 2),
      crossDomainFormCount: isSafe ? 0 : rand(0, 1),
      hiddenIframeCount: isSafe ? 0 : rand(0, 2),
      externalScriptCount: rand(0, 20),
      base64EncodedScriptCount: isSafe ? 0 : rand(0, 6),
      evasionTechniques: sandboxEvasionTechniques,

      verdict: verdict,
    },
  };
}

/* Dashboard aggregate data */
function generateDashboard() {
  const alerts = Array.from({ length: 12 }, () => {
    const malicious = Math.random() > 0.45;
    const host = malicious ? pick(SAMPLE_DOMAINS) : pick(SAFE_DOMAINS);
    const sev = malicious ? pick(["danger", "warn"]) : "ok";
    return {
      host,
      type: malicious ? pick(THREAT_TYPES) : "Clean scan",
      sev,
      time: `${rand(1, 59)}m ago`,
    };
  });

  const flagged = SAMPLE_DOMAINS.map((d) => ({
    host: d, type: pick(THREAT_TYPES), risk: rand(70, 99),
  }));

  return {
    threats: rand(18, 64),
    riskScore: rand(42, 88),
    flagged: flagged.length,
    scans: rand(120, 480),
    alerts,
    flaggedList: flagged,
  };
}

/* Persist last report so report.html can read it after a scan */
function saveLastReport(report) {
  try { sessionStorage.setItem("sw-last-report", JSON.stringify(report)); } catch (e) { }
}
function loadLastReport() {
  try {
    const r = sessionStorage.getItem("sw-last-report");
    return r ? JSON.parse(r) : null;
  } catch (e) { return null; }
}