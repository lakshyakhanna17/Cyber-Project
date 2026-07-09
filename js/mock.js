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
      requests: rand(12, 140),
      cookies: rand(2, 30),
      redirects: rand(0, isSafe ? 1 : 6),
      downloads: isSafe ? 0 : rand(1, 3),
      obfuscatedJs: isSafe ? "None" : `${rand(2, 15)} scripts`,
      forms: isSafe ? rand(0, 1) : rand(1, 4),
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
