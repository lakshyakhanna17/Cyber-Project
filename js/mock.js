const SAMPLE_DOMAINS = [
  "secure-login-paypa1.com", "update-account-verify.net", "microsoft-support.help",
  "amaz0n-delivery.info", "bankofamerica-alert.co", "netflix-billing-update.tv",
  "dropbox-sharedfile.link", "apple-id-locked.support", "chase-verify-now.com",
  "office365-signin.app", "coinbase-wallet-sync.io", "linkedin-jobalert.click",
];
const SAFE_DOMAINS = [
  "github.com", "wikipedia.org", "cloudflare.com", "vercel.com", "mozilla.org",
];
const THREAT_BRANDS = ["microsoft", "paypal", "amazon", "apple", "chase", "netflix", "dropbox"];
const EVASION_POOL = [
  "Fingerprint Evasion", "Headless Browser Detection Bypass",
  "Delayed Payload Execution", "Right-Click Disable", "DevTools Detection Bypass", "IP Cloaking",
];
const DOWNLOAD_NAMES = ["invoice.exe", "update.zip", "secure-doc.pdf.exe", "installer.msi", "statement.scr"];
 
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rand(0, arr.length - 1)]; }
function uid() { return Math.random().toString(36).slice(2, 10); }
 
function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}
 
/* Generates a lightweight browser-chrome mockup as an inline SVG data URI,
   standing in for a real sandbox screenshot capture. Colors intentionally
   match the report page's no-green cybersec palette (calm blue / coral). */
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
 
/* Build one analysis report for a given URL. */
function generateReport(url) {
  let host = url;
  try { host = new URL(url.includes("://") ? url : "https://" + url).hostname; } catch (e) { }
 
  const isSafe = SAFE_DOMAINS.some((d) => host.includes(d));
 
  const startTime = new Date(Date.now() - rand(5000, 60000));
  const endTime = new Date(startTime.getTime() + rand(2000, 15000));
 
  const certificatePresent = isSafe ? true : Math.random() > 0.3;
  const jsObfuscationScore = isSafe ? rand(0, 15) : rand(35, 98);
  const cloakingDetected = isSafe ? false : Math.random() > 0.6;
  const qrCodeDetected = isSafe ? false : Math.random() > 0.85;
  const unresolvedInteractivity = isSafe ? false : Math.random() > 0.7;
  const brandImpersonationMatch = isSafe
    ? null
    : (Math.random() > 0.4 ? { brand: pick(THREAT_BRANDS), similarity: +(rand(75, 99) / 100).toFixed(2) } : null);
 
  const evasionTechniques = EVASION_POOL
    .slice(0, rand(2, 4))
    .map((technique_name) => ({
      technique_name,
      evasion_technique_flags: isSafe ? false : Math.random() > 0.5,
    }));
 
  const downloads = Array.from({ length: isSafe ? 0 : rand(0, 2) }, () => ({
    file_name: pick(DOWNLOAD_NAMES),
    file_size: rand(20000, 4500000),
  }));
 
  const redirects = Array.from({ length: isSafe ? rand(0, 1) : rand(1, 4) }, (_, i) => ({
    redirect_chain: [url, `https://${host}/step-${i + 1}`],
    redirect_url: `https://${pick(SAMPLE_DOMAINS)}/landing`,
    http_status_code: pick([301, 302, 307]),
  }));
 
  return {
    scan: {
      scan_id: uid(),
      request_id: uid(),
      source_url: url,
      scan_start_time: startTime.toLocaleString(),
      scan_end_time: endTime.toLocaleString(),
    },
    host,
    page: {
      page_title: isSafe
        ? `${host} — Official Site`
        : pick(["Account Verification Required", "Sign in to your account", "Secure Login Portal", "Confirm Your Identity"]),
      final_url: `https://${host}/`,
      page_language: pick(["en", "en-US", "en-GB", "es", "fr"]),
      page_load_time_ms: rand(180, 4200),
      dom_element_count: rand(120, 2400),
    },
    screenshots: {
      homepage_screenshot_path: screenshotDataUri(host, isSafe, false),
      fullpage_screenshot_path: screenshotDataUri(host, isSafe, true),
    },
    network_activity: {
      total_request_count: rand(12, 180),
      unique_requested_domains: rand(2, 24),
      third_party_domain_count: isSafe ? rand(1, 5) : rand(6, 20),
      xhr_request_count: rand(0, 40),
      websocket_connection_count: isSafe ? 0 : rand(0, 2),
      fingerprinting_api_count: isSafe ? rand(0, 1) : rand(1, 6),
    },
    browser_events: {
      popup_count: isSafe ? 0 : rand(0, 3),
      new_tab_count: isSafe ? 0 : rand(0, 2),
      permission_requests: isSafe
        ? []
        : ["geolocation", "notifications", "camera", "microphone"].filter(() => Math.random() > 0.65),
      clipboard_read_attempts: isSafe ? 0 : rand(0, 2),
      clipboard_write_attempts: isSafe ? 0 : rand(0, 2),
    },
    tls_connection: {
      protocol_used: certificatePresent ? "HTTPS" : "HTTP",
      certificate_present: certificatePresent,
      certificate_issuer: certificatePresent ? pick(["Let's Encrypt", "DigiCert Inc", "Sectigo", "Google Trust Services"]) : null,
      tls_version: certificatePresent ? pick(["TLS 1.2", "TLS 1.3"]) : null,
      certificate_issued_date: certificatePresent
        ? new Date(Date.now() - rand(5, 300) * 86400000).toLocaleDateString()
        : null,
    },
    form_metrics: {
      password_field_count: isSafe ? 0 : rand(1, 2),
      email_field_count: isSafe ? 0 : rand(1, 2),
      non_credential_field_count: isSafe ? [] : ["name", "phone"].filter(() => Math.random() > 0.5),
      submit_button_count: isSafe ? rand(0, 1) : rand(1, 2),
      cross_domain_form_count: isSafe ? 0 : rand(0, 1),
    },
    dom_content: {
      visible_text_length: rand(400, 12000),
      hyperlink_count: rand(5, 120),
      external_hyperlink_count: rand(0, 40),
      external_script_count: rand(0, 20),
      hidden_iframe_count: isSafe ? 0 : rand(0, 2),
      iframe_count: rand(0, 4),
    },
    phishing_signals: {
      base64_encoded_script_count: isSafe ? 0 : rand(0, 6),
      total_redirect_count: redirects.map((r) => r.redirect_url),
      qr_code_detected: qrCodeDetected,
      cloaking_detected: cloakingDetected,
      js_obfuscation_score: jsObfuscationScore,
      unresolved_interactivity: unresolvedInteractivity,
      brand_impersonation_match: brandImpersonationMatch,
    },
    evasion_techniques: evasionTechniques,
    security_headers: {
      security_headers_present: isSafe
        ? "Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options"
        : pick(["None", "X-Content-Type-Options", "Strict-Transport-Security"]),
    },
    downloads,
    redirects,
  };
}
 
/* ----------------------------------------------------------
   Display-only derivations. These do NOT represent database
   columns — they are computed at render time from real columns
   above, purely so the UI can show a human list / verdict badge.
   ---------------------------------------------------------- */
function computeThreatSignals(report) {
  const signals = [];
  const ps = report.phishing_signals;
 
  if (ps.cloaking_detected) signals.push("Cloaking detected");
  if (ps.qr_code_detected) signals.push("QR code detected");
  if (ps.unresolved_interactivity) signals.push("Unresolved interactivity on page");
  if (ps.brand_impersonation_match) {
    signals.push(`Brand impersonation match: ${ps.brand_impersonation_match.brand} (${Math.round(ps.brand_impersonation_match.similarity * 100)}% similarity)`);
  }
  if (ps.js_obfuscation_score >= 50) signals.push(`High JS obfuscation score (${ps.js_obfuscation_score})`);
  if (ps.base64_encoded_script_count > 0) signals.push(`${ps.base64_encoded_script_count} base64-encoded script(s) found`);
 
  report.evasion_techniques.forEach((t) => {
    if (t.evasion_technique_flags) signals.push(`Evasion technique detected: ${t.technique_name}`);
  });
 
  if (report.form_metrics.cross_domain_form_count > 0) signals.push("Cross-domain form submission detected");
  if (!report.tls_connection.certificate_present) signals.push("No TLS certificate present");
  if (report.downloads.length > 0) signals.push(`${report.downloads.length} file download(s) triggered`);
 
  return signals;
}
 
function computeVerdict(report) {
  const count = computeThreatSignals(report).length;
  if (count === 0) return "SAFE";
  if (count <= 2) return "SUSPICIOUS";
  return "MALICIOUS";
}
 
/* Dashboard aggregate data (unchanged — backs dashboard.html,
   not covered in this pass; see header note). */
function generateDashboard() {
  const THREAT_TYPES = ["Phishing", "Malware", "Credential Harvesting", "Typosquatting", "Spoofing", "Suspicious Redirect"];
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