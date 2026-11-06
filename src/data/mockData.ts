import { Target, Scan, Finding, SecurityReport, SystemSettings, User } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_sec_01',
  name: 'Alex Rivera',
  email: 'alex.rivera@sentinel-security.internal',
  role: 'Lead Security Assessor',
  workspace: 'Enterprise SecOps Workspace',
};

export const INITIAL_TARGETS: Target[] = [
  {
    id: 'tgt-001',
    domain: 'api.payments-gateway.internal',
    url: 'https://api.payments-gateway.internal',
    description: 'Core PCI-DSS Tier 1 Payment Processing Gateway and Tokenization API',
    verificationStatus: 'verified',
    verificationMethod: 'dns_txt',
    verificationToken: 'dexxscan-verify=9f8c3e41b2a74c0e8172df6c21e330a1',
    verificationRecordName: '_dexxscan-challenge.api.payments-gateway.internal',
    lastScanDate: '2026-11-04 14:22:10',
    totalScans: 12,
    riskLevel: 'high',
    createdAt: '2026-09-15',
    tags: ['PCI-DSS', 'Production', 'FinTech', 'High-Risk'],
    isAuthorized: true,
  },
  {
    id: 'tgt-002',
    domain: 'portal.cloud-enterprise.io',
    url: 'https://portal.cloud-enterprise.io',
    description: 'Customer facing identity authentication and SaaS dashboard portal',
    verificationStatus: 'verified',
    verificationMethod: 'http_file',
    verificationToken: 'dexxscan-verify=5d3a1c74e89b21f08462ca7e390c42d6',
    verificationRecordName: '/.well-known/dexxscan-challenge.txt',
    lastScanDate: '2026-11-03 09:45:00',
    totalScans: 8,
    riskLevel: 'medium',
    createdAt: '2026-10-01',
    tags: ['SSO', 'Auth0', 'Customer-Portal'],
    isAuthorized: true,
  },
  {
    id: 'tgt-003',
    domain: 'staging-auth.securecorp-demo.com',
    url: 'https://staging-auth.securecorp-demo.com',
    description: 'Pre-production staging cluster for OAuth2/OIDC user directory',
    verificationStatus: 'pending',
    verificationMethod: 'dns_txt',
    verificationToken: 'dexxscan-verify=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    verificationRecordName: '_dexxscan-challenge.staging-auth.securecorp-demo.com',
    lastScanDate: null,
    totalScans: 0,
    riskLevel: 'unassessed',
    createdAt: '2026-11-02',
    tags: ['Staging', 'OAuth2', 'Testing'],
    isAuthorized: true,
  },
  {
    id: 'tgt-004',
    domain: 'static-cdn.global-assets.net',
    url: 'https://static-cdn.global-assets.net',
    description: 'Global content delivery network origin edge endpoint',
    verificationStatus: 'unverified',
    verificationToken: 'dexxscan-verify=c87e2b10f543168a9d0e234bc5678901',
    lastScanDate: null,
    totalScans: 0,
    riskLevel: 'unassessed',
    createdAt: '2026-11-04',
    tags: ['CDN', 'Static-Assets'],
    isAuthorized: false,
  },
  {
    id: 'tgt-005',
    domain: 'checkout.ecommerce-storefront.io',
    url: 'https://checkout.ecommerce-storefront.io',
    description: 'Customer checkout and cart session management microservice',
    verificationStatus: 'verified',
    verificationMethod: 'dns_txt',
    verificationToken: 'dexxscan-verify=7e9d4a2c1b8f0e53647192a8b3c4d5e6',
    verificationRecordName: '_dexxscan-challenge.checkout.ecommerce-storefront.io',
    lastScanDate: '2026-10-28 18:10:32',
    totalScans: 5,
    riskLevel: 'low',
    createdAt: '2026-08-20',
    tags: ['E-Commerce', 'Cart', 'Production'],
    isAuthorized: true,
  }
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'FIND-7801',
    scanId: 'SCN-2026-0492',
    targetId: 'tgt-001',
    targetDomain: 'api.payments-gateway.internal',
    name: 'SQL Injection in Transaction Query Endpoint',
    category: 'web_application',
    severity: 'critical',
    confidence: 'certain',
    status: 'open',
    firstDetected: '2026-11-04 14:25:31',
    lastDetected: '2026-11-04 14:25:31',
    cweId: 'CWE-89',
    cvssScore: 9.8,
    affectedUrl: 'https://api.payments-gateway.internal/v1/ledger/transactions?filter=',
    httpMethod: 'GET',
    parameter: 'filter',
    isConfirmed: true,
    description: 'The parameter "filter" on the transaction query endpoint fails to sanitize or parameterize input before appending it to an underlying SQL relational database query. An attacker can craft inputs that manipulate database execution, potentially bypassing authentication, exfiltrating cardholder records, or modifying ledger history.',
    technicalEvidence: `HTTP GET /v1/ledger/transactions?filter=1'%20OR%20'1'='1'-- HTTP/1.1
Host: api.payments-gateway.internal
Authorization: Bearer [REDACTED_DEMO_JWT]

HTTP/1.1 500 Internal Server Error
Content-Type: application/json
Server: nginx/1.24.0

{
  "error": "Database error: syntax error at or near \\"--\\"",
  "query_hint": "SELECT tx_id, amount, pan_hash FROM transactions WHERE merchant_id = 902 AND filter = 1' OR '1'='1'--"
}`,
    potentialImpact: 'Total loss of confidentiality and integrity of financial transaction records. Potential unauthorized elevation of privileges and remote code execution via database extensions.',
    recommendedRemediation: 'Adopt parameterized queries (prepared statements) or an established Object-Relational Mapping (ORM) framework with safe abstraction. Strictly validate and sanitize input against an allowlist pattern.',
    references: [
      'https://owasp.org/Top10/A03_2021-Injection/',
      'https://cwe.mitre.org/data/definitions/89.html',
      'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'
    ]
  },
  {
    id: 'FIND-7802',
    scanId: 'SCN-2026-0492',
    targetId: 'tgt-001',
    targetDomain: 'api.payments-gateway.internal',
    name: 'Deprecated TLS 1.0 & Weak CBC Cipher Suites Enabled',
    category: 'ssl_tls',
    severity: 'high',
    confidence: 'certain',
    status: 'in_progress',
    firstDetected: '2026-11-04 14:23:05',
    lastDetected: '2026-11-04 14:23:05',
    cweId: 'CWE-326',
    cvssScore: 7.5,
    affectedUrl: 'https://api.payments-gateway.internal:443',
    isConfirmed: true,
    description: 'The TLS configuration accepts legacy protocol version TLS 1.0 and utilizes weak cryptographic cipher suites prone to known vulnerabilities including BEAST and Lucky13 attacks. PCI-DSS v4.0 Requirement 4.1 mandates deprecation of TLS 1.0 and TLS 1.1 in payment channels.',
    technicalEvidence: `Protocol Negotiated: TLSv1.0 (Deprecated)
Accepted Cipher Suites:
  - TLS_RSA_WITH_AES_128_CBC_SHA (0x002f) - WEAK
  - TLS_RSA_WITH_AES_256_CBC_SHA (0x0035) - WEAK
  - TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA (0xc012) - INSECURE

SSLyze Evaluation:
  * Insecure renegotiation: DISABLED
  * TLS 1.3: SUPPORTED
  * TLS 1.0 / 1.1: ACCEPTED [FAIL]`,
    potentialImpact: 'Man-in-the-middle attackers capable of intercepting network traffic may decrypt sensitive encrypted data transmitted between financial clients and backend gateway servers.',
    recommendedRemediation: 'Reconfigure web reverse proxy (Nginx / Cloudflare / Envoy) to enforce minimum TLS version 1.2, preferably TLS 1.3 only, and restrict cipher list to modern authenticated encryption suites (AEAD) like AES-GCM and ChaCha20-Poly1305.',
    references: [
      'https://cwe.mitre.org/data/definitions/326.html',
      'https://wiki.mozilla.org/Security/Server_Side_TLS',
      'https://www.pcisecuritystandards.org/documents/Migrating_from_SSL_Early_TLS_Information_Supplement_v1.pdf'
    ]
  },
  {
    id: 'FIND-7803',
    scanId: 'SCN-2026-0492',
    targetId: 'tgt-001',
    targetDomain: 'api.payments-gateway.internal',
    name: 'Missing Content-Security-Policy (CSP) Header',
    category: 'http_headers',
    severity: 'medium',
    confidence: 'firm',
    status: 'open',
    firstDetected: '2026-10-20 11:15:00',
    lastDetected: '2026-11-04 14:22:45',
    cweId: 'CWE-1021',
    cvssScore: 5.4,
    affectedUrl: 'https://api.payments-gateway.internal/documentation',
    isConfirmed: true,
    description: 'The server response lacks a Content-Security-Policy (CSP) HTTP header. CSP is an effective defense-in-depth standard against cross-site scripting (XSS), data injection, and malicious clickjacking attempts.',
    technicalEvidence: `HTTP/1.1 200 OK
Date: Wed, 04 Nov 2026 14:22:45 GMT
Server: nginx/1.24.0
Content-Type: text/html; charset=UTF-8
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
[Missing: Content-Security-Policy]`,
    potentialImpact: 'Increased exposure to unauthorized script execution and client-side credential skimming if any injection flaws are exploited.',
    recommendedRemediation: 'Deploy a strict Content-Security-Policy header such as: default-src \'self\'; script-src \'self\'; object-src \'none\'; base-uri \'self\'; frame-ancestors \'none\';',
    references: [
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
      'https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html'
    ]
  },
  {
    id: 'FIND-7804',
    scanId: 'SCN-2026-0488',
    targetId: 'tgt-002',
    targetDomain: 'portal.cloud-enterprise.io',
    name: 'Session Cookie Missing SameSite and Secure Attributes',
    category: 'cookies',
    severity: 'medium',
    confidence: 'certain',
    status: 'in_progress',
    firstDetected: '2026-11-03 09:47:12',
    lastDetected: '2026-11-03 09:47:12',
    cweId: 'CWE-614',
    cvssScore: 6.1,
    affectedUrl: 'https://portal.cloud-enterprise.io/login',
    isConfirmed: true,
    description: 'Authentication session token cookie "auth_session_id" is issued without the "SameSite=Lax" or "SameSite=Strict" flag, and fails to declare the "Secure" directive, enabling potential transmission over plaintext channels and Cross-Site Request Forgery (CSRF).',
    technicalEvidence: `Set-Cookie: auth_session_id=s%3A7a6f912...; Path=/; HttpOnly
[Missing: Secure; SameSite=Lax/Strict]`,
    potentialImpact: 'Session tokens may be dispatched by browsers in cross-site requests, facilitating CSRF exploitation against user accounts.',
    recommendedRemediation: 'Ensure session cookies include "Secure; HttpOnly; SameSite=Lax" (or SameSite=Strict where viable).',
    references: [
      'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
      'https://cwe.mitre.org/data/definitions/614.html'
    ]
  },
  {
    id: 'FIND-7805',
    scanId: 'SCN-2026-0488',
    targetId: 'tgt-002',
    targetDomain: 'portal.cloud-enterprise.io',
    name: 'Verbose Server Header Version Disclosure',
    category: 'http_headers',
    severity: 'informational',
    confidence: 'certain',
    status: 'fixed',
    firstDetected: '2026-10-15 08:30:00',
    lastDetected: '2026-11-03 09:46:00',
    cweId: 'CWE-200',
    cvssScore: 2.1,
    affectedUrl: 'https://portal.cloud-enterprise.io/',
    isConfirmed: true,
    description: 'The HTTP responses expose explicit web server daemon versions (Apache/2.4.52 Ubuntu, OpenSSL/3.0.2). This facilitates automated fingerprinting and version-specific vulnerability targeting by threat actors.',
    technicalEvidence: `Server: Apache/2.4.52 (Ubuntu)
X-Powered-By: PHP/8.1.2-1ubuntu2.14`,
    potentialImpact: 'Information disclosure simplifies reconnaissance for targeting unpatched CVEs.',
    recommendedRemediation: 'Configure Apache: ServerTokens Prod and ServerSignature Off. Strip X-Powered-By in php.ini: expose_php = Off.',
    references: [
      'https://cwe.mitre.org/data/definitions/200.html'
    ]
  },
  {
    id: 'FIND-7806',
    scanId: 'SCN-2026-0481',
    targetId: 'tgt-001',
    targetDomain: 'api.payments-gateway.internal',
    name: 'DNS Zone Transfer Misconfiguration (AXFR)',
    category: 'dns',
    severity: 'low',
    confidence: 'firm',
    status: 'open',
    firstDetected: '2026-10-25 15:40:00',
    lastDetected: '2026-11-04 14:24:00',
    cweId: 'CWE-200',
    cvssScore: 3.7,
    affectedUrl: 'ns1.payments-gateway.internal (53/udp)',
    isConfirmed: false,
    description: 'Secondary nameserver responded with full DNS zone records when queried with standard AXFR requests, potentially leaking internal topological hostnames and unlinked staging subdomains.',
    technicalEvidence: `dig @ns1.payments-gateway.internal api.payments-gateway.internal AXFR
; <<>> DiG 9.18.18-0ubuntu0.22.04.1-Ubuntu <<>> @ns1.payments-gateway.internal AXFR
; (1 server found)
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 41294
;; flags: qr aa; QUERY: 1, ANSWER: 14, AUTHORITY: 0, ADDITIONAL: 0`,
    potentialImpact: 'Unauthenticated reconnaissance exposes confidential infrastructure maps and hidden endpoints.',
    recommendedRemediation: 'Restrict AXFR zone transfers to authorized secondary nameserver IPs with TSIG authentication keys.',
    references: [
      'https://cwe.mitre.org/data/definitions/200.html'
    ]
  },
  {
    id: 'FIND-7807',
    scanId: 'SCN-2026-0475',
    targetId: 'tgt-005',
    targetDomain: 'checkout.ecommerce-storefront.io',
    name: 'Missing Cross-Origin-Resource-Policy (CORP)',
    category: 'http_headers',
    severity: 'low',
    confidence: 'firm',
    status: 'accepted_risk',
    firstDetected: '2026-10-28 18:14:10',
    lastDetected: '2026-10-28 18:14:10',
    cweId: 'CWE-346',
    cvssScore: 3.1,
    affectedUrl: 'https://checkout.ecommerce-storefront.io/assets/cart.json',
    isConfirmed: true,
    description: 'Cross-Origin-Resource-Policy header is missing on dynamic JSON resource routes, permitting speculative side-channel reading under certain legacy browser conditions.',
    technicalEvidence: `GET /assets/cart.json HTTP/1.1
Host: checkout.ecommerce-storefront.io
Response:
Access-Control-Allow-Origin: *
[Missing: Cross-Origin-Resource-Policy: same-origin]`,
    potentialImpact: 'Potential speculative cross-origin data exposure via Spectre-style microarchitectural attacks.',
    recommendedRemediation: 'Set Cross-Origin-Resource-Policy: same-origin or same-site for private JSON endpoints.',
    references: ['https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy_(CORP)']
  }
];

export const INITIAL_SCANS: Scan[] = [
  {
    id: 'SCN-2026-0492',
    targetId: 'tgt-001',
    targetDomain: 'api.payments-gateway.internal',
    targetUrl: 'https://api.payments-gateway.internal',
    profile: 'comprehensive',
    modules: ['http_headers', 'ssl_tls', 'cookie_security', 'dns_security', 'network_exposure', 'web_vulnerabilities'],
    startedAt: '2026-11-04 14:22:10',
    completedAt: '2026-11-04 14:28:45',
    duration: '6m 35s',
    status: 'completed',
    securityScore: 68,
    findingsCount: {
      critical: 1,
      high: 1,
      medium: 1,
      low: 1,
      info: 0,
      total: 4,
    },
    progress: 100,
    isDemo: true,
    notes: 'PCI-DSS Pre-Audit Comprehensive Scan (Simulated Data)',
    moduleStatuses: [
      { id: 'http_headers', name: 'HTTP Security Headers', description: 'HSTS, CSP, X-Frame-Options, CORS audit', status: 'completed', findingsCount: 1, duration: '22s', completedAt: '14:22:32' },
      { id: 'ssl_tls', name: 'SSL/TLS Assessment', description: 'SSLyze protocol cipher, cert validity check', status: 'completed', findingsCount: 1, duration: '45s', completedAt: '14:23:17' },
      { id: 'cookie_security', name: 'Cookie Security', description: 'SameSite, Secure, HttpOnly attributes', status: 'completed', findingsCount: 0, duration: '18s', completedAt: '14:23:35' },
      { id: 'dns_security', name: 'DNS Security', description: 'CAA, DNSSEC, SPF, DMARC, AXFR check', status: 'completed', findingsCount: 1, duration: '34s', completedAt: '14:24:09' },
      { id: 'network_exposure', name: 'Network Exposure', description: 'Nmap safe port and banner fingerprinting', status: 'completed', findingsCount: 0, duration: '1m 40s', completedAt: '14:25:49' },
      { id: 'web_vulnerabilities', name: 'Web Vulnerabilities', description: 'OWASP ZAP passive inspection & SQLi checks', status: 'completed', findingsCount: 1, duration: '2m 56s', completedAt: '14:28:45' }
    ]
  },
  {
    id: 'SCN-2026-0488',
    targetId: 'tgt-002',
    targetDomain: 'portal.cloud-enterprise.io',
    targetUrl: 'https://portal.cloud-enterprise.io',
    profile: 'standard',
    modules: ['http_headers', 'ssl_tls', 'cookie_security', 'dns_security'],
    startedAt: '2026-11-03 09:45:00',
    completedAt: '2026-11-03 09:48:30',
    duration: '3m 30s',
    status: 'completed',
    securityScore: 82,
    findingsCount: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 0,
      info: 1,
      total: 2,
    },
    progress: 100,
    isDemo: true,
    notes: 'Routine Bi-Weekly Perimeter Standard Scan',
    moduleStatuses: [
      { id: 'http_headers', name: 'HTTP Security Headers', description: 'HSTS, CSP, X-Frame-Options, CORS audit', status: 'completed', findingsCount: 1, duration: '20s', completedAt: '09:45:20' },
      { id: 'ssl_tls', name: 'SSL/TLS Assessment', description: 'SSLyze protocol cipher, cert validity check', status: 'completed', findingsCount: 0, duration: '50s', completedAt: '09:46:10' },
      { id: 'cookie_security', name: 'Cookie Security', description: 'SameSite, Secure, HttpOnly attributes', status: 'completed', findingsCount: 1, duration: '30s', completedAt: '09:46:40' },
      { id: 'dns_security', name: 'DNS Security', description: 'CAA, DNSSEC, SPF, DMARC check', status: 'completed', findingsCount: 0, duration: '1m 50s', completedAt: '09:48:30' }
    ]
  },
  {
    id: 'SCN-2026-0475',
    targetId: 'tgt-005',
    targetDomain: 'checkout.ecommerce-storefront.io',
    targetUrl: 'https://checkout.ecommerce-storefront.io',
    profile: 'quick',
    modules: ['http_headers', 'ssl_tls', 'cookie_security'],
    startedAt: '2026-10-28 18:10:32',
    completedAt: '2026-10-28 18:12:12',
    duration: '1m 40s',
    status: 'completed',
    securityScore: 91,
    findingsCount: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 1,
      info: 0,
      total: 1,
    },
    progress: 100,
    isDemo: true,
    notes: 'Post-Deployment Sanity Quick Scan',
    moduleStatuses: [
      { id: 'http_headers', name: 'HTTP Security Headers', description: 'HSTS, CSP, CORP headers', status: 'completed', findingsCount: 1, duration: '35s', completedAt: '18:11:07' },
      { id: 'ssl_tls', name: 'SSL/TLS Assessment', description: 'Cert chain & TLS 1.3 verification', status: 'completed', findingsCount: 0, duration: '40s', completedAt: '18:11:47' },
      { id: 'cookie_security', name: 'Cookie Security', description: 'Cookie attribute validation', status: 'completed', findingsCount: 0, duration: '25s', completedAt: '18:12:12' }
    ]
  },
  {
    id: 'SCN-2026-0460',
    targetId: 'tgt-001',
    targetDomain: 'api.payments-gateway.internal',
    targetUrl: 'https://api.payments-gateway.internal',
    profile: 'standard',
    modules: ['http_headers', 'ssl_tls', 'cookie_security', 'dns_security'],
    startedAt: '2026-10-20 11:10:00',
    completedAt: '2026-10-20 11:14:02',
    duration: '4m 02s',
    status: 'completed',
    securityScore: 71,
    findingsCount: {
      critical: 0,
      high: 1,
      medium: 1,
      low: 0,
      info: 0,
      total: 2,
    },
    progress: 100,
    isDemo: true,
    notes: 'Initial Baseline Security Scan',
    moduleStatuses: [
      { id: 'http_headers', name: 'HTTP Security Headers', description: 'Header validation', status: 'completed', findingsCount: 1, duration: '30s', completedAt: '11:10:30' },
      { id: 'ssl_tls', name: 'SSL/TLS Assessment', description: 'Legacy cipher checks', status: 'completed', findingsCount: 1, duration: '1m 10s', completedAt: '11:11:40' },
      { id: 'cookie_security', name: 'Cookie Security', description: 'Attribute inspection', status: 'completed', findingsCount: 0, duration: '22s', completedAt: '11:12:02' },
      { id: 'dns_security', name: 'DNS Security', description: 'DNS record validation', status: 'completed', findingsCount: 0, duration: '2m 00s', completedAt: '11:14:02' }
    ]
  }
];

export const INITIAL_REPORTS: SecurityReport[] = [
  {
    id: 'REP-2026-0091',
    scanId: 'SCN-2026-0492',
    targetId: 'tgt-001',
    targetDomain: 'api.payments-gateway.internal',
    name: 'Executive & Technical Security Assessment: api.payments-gateway.internal',
    generatedDate: '2026-11-04 14:35:00',
    securityScore: 68,
    findingsSummary: {
      critical: 1,
      high: 1,
      medium: 1,
      low: 1,
      info: 0,
      total: 4,
    },
    fileSize: '2.4 MB',
    assessmentProfile: 'comprehensive',
    executiveSummary: 'This document presents the findings of an authorized comprehensive security assessment conducted against api.payments-gateway.internal on November 04, 2026. The target environment demonstrates an overall Security Score of 68/100, indicating an elevated risk posture. Most notably, a critical SQL Injection flaw (CWE-89) in the transaction query endpoint requires immediate remediation to safeguard financial records and adhere to PCI-DSS standards.',
    scopeDescription: 'Authorized scope covers public and semi-public web application services hosted under https://api.payments-gateway.internal, including REST API endpoints, SSL/TLS negotiation parameters, HTTP response headers, and public DNS records. Testing excluded destructive denial-of-service and physical social engineering.',
    testingLimitations: 'Assessment performed through non-destructive passive and bounded active testing modules. The findings reflect configuration at the exact timestamp of execution. No proprietary source code or internal server shell access was provided.'
  },
  {
    id: 'REP-2026-0084',
    scanId: 'SCN-2026-0488',
    targetId: 'tgt-002',
    targetDomain: 'portal.cloud-enterprise.io',
    name: 'Perimeter Security Verification: portal.cloud-enterprise.io',
    generatedDate: '2026-11-03 10:00:15',
    securityScore: 82,
    findingsSummary: {
      critical: 0,
      high: 0,
      medium: 1,
      low: 0,
      info: 1,
      total: 2,
    },
    fileSize: '1.8 MB',
    assessmentProfile: 'standard',
    executiveSummary: 'Assessment conducted against customer authentication portal revealed solid defense-in-depth posture with modern TLS 1.3 enforcement and clean header baselines. Remediation is advised for session cookie SameSite attributes to prevent CSRF vectors.',
    scopeDescription: 'Standard perimeter assessment of portal.cloud-enterprise.io domain covering authentication pages, TLS termination, and cookie headers.',
    testingLimitations: 'Passive inspection without authenticated state crawling or disruptive brute-force vectors.'
  },
  {
    id: 'REP-2026-0078',
    scanId: 'SCN-2026-0475',
    targetId: 'tgt-005',
    targetDomain: 'checkout.ecommerce-storefront.io',
    name: 'Quick Baseline Audit: checkout.ecommerce-storefront.io',
    generatedDate: '2026-10-28 18:20:00',
    securityScore: 91,
    findingsSummary: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 1,
      info: 0,
      total: 1,
    },
    fileSize: '1.2 MB',
    assessmentProfile: 'quick',
    executiveSummary: 'Routine post-release baseline scan completed with a high score of 91/100. No critical or high severity vulnerabilities discovered. Minor hardening recommendation provided for Cross-Origin-Resource-Policy.',
    scopeDescription: 'Quick header, TLS certificate validity, and cookie posture scan of checkout storefront endpoint.',
    testingLimitations: 'Restricted to lightweight non-intrusive metadata checks.'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  general: {
    workspaceName: 'SecOps Enterprise RedTeam',
    adminName: 'Alex Rivera',
    adminEmail: 'alex.rivera@sentinel-security.internal',
    theme: 'dark',
    soundAlerts: true,
    autoRefreshSeconds: 30,
  },
  scanning: {
    defaultProfile: 'standard',
    scanTimeoutMinutes: 45,
    maxConcurrentScans: 2,
    requestRateLimitRps: 15,
    safeModeDefault: true,
    customUserAgent: 'DexXScan-SecurityAssessor/0.1.0 (+https://dexxscan.internal/security-policy)',
  },
  integrations: {
    fastApiUrl: 'http://127.0.0.1:8000',
    owaspZapEndpoint: 'http://127.0.0.1:8080',
    owaspZapApiKey: 'zap-secret-demo-key-92813',
    nmapPath: 'C:\\Program Files (x86)\\Nmap\\nmap.exe',
    sslyzeEnabled: true,
  },
  security: {
    sessionTimeoutMinutes: 60,
    require2FA: true,
    auditLogging: true,
    dataRetentionDays: 90,
  }
};
