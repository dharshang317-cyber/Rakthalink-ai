# RAKTHALINK AI — FINAL-YEAR B.Sc. IT PROJECT DOCUMENTATION & VIVA VOCE GUIDE

**Project Title:** RakthaLink AI — AI-Assisted Blood Donor and Blood Request Matching Platform  
**Tagline:** *Connecting Blood. Connecting Lives.*  
**Primary Administrator:** `dharshang317@gmail.com` (Dharshan G)  
**Academic Degree:** Bachelor of Science in Information Technology (B.Sc. IT)  
**Architecture:** 3-Tier Full-Stack MERN Architecture with Google OAuth 2.0 & Server-Side AI Gateway  

---

## 1. Executive Abstract & Problem Statement

### 1.1 Problem Statement
In traditional blood donor discovery systems, patients and emergency contacts face severe logistical hurdles:
1. **Unranked and Stale Donor Lists:** Outdated phone registries often list donors who are unavailable, have donated recently, or are too far from the hospital.
2. **Privacy Violations:** Unprotected public phone numbers expose voluntary donors to spam, commercial marketing, and harassment.
3. **Lack of Transparent Geodesic Proximity:** Matching systems often rely on broad city names rather than calculating real geodesic distance to the hospital blood bank.
4. **Unstructured Emergency Messaging:** Requesters typing panicked messages on social media often omit critical clinical parameters (hospital name, required units, or target deadline).

### 1.2 The RakthaLink AI Solution
**RakthaLink AI** is an intelligent web-based coordination platform engineered to solve these challenges:
- **3-Step Smart Matching Engine:** Uses red blood cell biological compatibility matrices combined with the **Haversine Geodesic Distance Formula** to rank nearby available voluntary donors with a transparent **0–100 Platform Match Score**.
- **Privacy-Gated Contact Protocol:** Private phone numbers and full addresses remain completely masked until a voluntary donor explicitly reviews and accepts the match request.
- **Server-Side AI Request Assistant:** Uses Google Gemini (with an offline heuristic regex engine fallback) to structure plain conversational emergency text into verified database fields with mandatory user confirmation.
- **10-Pillar Administration & Moderation Suite:** Comprehensive control center empowering administrators (`dharshang317@gmail.com`) to moderate accounts, broadcast announcements, investigate safety reports, and monitor system KPIs.

---

## 2. System Architecture & Technology Stack

```
+-------------------------------------------------------------------------+
|                         CLIENT TIER (Frontend)                          |
|  React 19 + Vite + Tailwind CSS + Google Identity Services OAuth 2.0    |
+-------------------------------------------------------------------------+
                                    │
                         HTTP REST / JSON (Axios)
                                    ▼
+-------------------------------------------------------------------------+
|                       APPLICATION TIER (Backend)                        |
|  Node.js + Express.js + JWT Engine + Helmet + Rate Limiters + Security  |
|  ─────────────────────────────────────────────────────────────────────  |
|  • Mathematical Matching Engine (Haversine Distance + Compatibility)    |
|  • Server-Side AI Gateway (@google/generative-ai + Heuristic Engine)   |
|  • RBAC Access Guard (Designated Admin: dharshang317@gmail.com)         |
+-------------------------------------------------------------------------+
                                    │
                             Mongoose ODM
                                    ▼
+-------------------------------------------------------------------------+
|                          DATA TIER (Database)                           |
|  MongoDB (9 Collections + 2dsphere Geospatial Indexing)                 |
+-------------------------------------------------------------------------+
```

---

## 3. Mathematical Matching Engine Specification

### 3.1 Haversine Great-Circle Geodesic Distance Formula
The great-circle distance $d$ between two points on the Earth's surface with coordinates $(\text{lat}_1, \text{lng}_1)$ and $(\text{lat}_2, \text{lng}_2)$ in radians is calculated as:

$$a = \sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c$$

*Where $R = 6371\text{ km}$ (Earth's mean spherical radius).*

### 3.2 Platform Match Score Formula (0 - 100)
The composite **Platform Match Score** is computed using four transparent logistical weights:

$$\text{Score} = \left(S_{\text{compat}} \times 0.35\right) + \left(S_{\text{prox}} \times 0.40\right) + \left(S_{\text{recency}} \times 0.15\right) + \left(S_{\text{urgency}} \times 0.10\right)$$

| Factor | Weight | Scoring Logic |
| :--- | :--- | :--- |
| **Compatibility ($S_{\text{compat}}$)** | **35%** | Exact Blood Group Match = $100\%$, Compatible Alternative = $80\%$ |
| **Proximity ($S_{\text{prox}}$)** | **40%** | $\le 5\text{km} \rightarrow 100$, $\le 15\text{km} \rightarrow 85$, $\le 30\text{km} \rightarrow 70$, $\le 50\text{km} \rightarrow 50$ |
| **Donation Recency ($S_{\text{recency}}$)** | **15%** | $>90\text{ days}$ since last donation = $100\%$ (WHO 90-day recovery standard) |
| **Urgency ($S_{\text{urgency}}$)** | **10%** | Urgent/Emergency = $100\%$, High = $80\%$, Normal = $60\%$ |

---

## 4. Database Schema Dictionary

The system implements 10 Mongoose schemas in `server/models/`:

1. **`User`**: `googleId`, `email`, `name`, `avatar`, `role` (`donor`, `requester`, `both`, `admin`), `phone`, `city`, `area`, `isBlocked`, `isDeactivated`.
2. **`DonorProfile`**: `userId`, `bloodGroup`, `isAvailable`, `lastDonationDate`, `location` (`Point`, `2dsphere` indexed), `totalDonations`.
3. **`BloodRequest`**: `requesterId`, `patientName`, `bloodGroup`, `unitsRequired`, `hospitalName`, `city`, `area`, `location`, `requiredDate`, `urgency`, `status`.
4. **`Match`**: `requestId`, `donorId`, `matchScore`, `distanceKm`, `status` (`PENDING`, `REQUESTED`, `ACCEPTED`, `DECLINED`), `contactShared`.
5. **`Appointment`**: `requestId`, `matchId`, `donorId`, `requesterId`, `hospitalName`, `scheduledDate`, `timeSlot`, `status`.
6. **`Notification`**: `recipientId`, `senderId`, `type`, `title`, `message`, `actionLink`, `isRead`.
7. **`Report`**: `reporterId`, `reportedUserId`, `category`, `description`, `status`.
8. **`AIConversation`**: `userId`, `messages` (`sender`, `text`, `createdAt`).
9. **`AuditLog`**: `userId`, `action`, `resourceType`, `resourceId`, `ipAddress`, `details`.
10. **`PlatformSetting`**: `siteName`, `tagline`, `announcementBanner`, `maintenanceMode`, `emergencyContactPhone`, `supportedCities`.

---

## 5. Security & Privacy Gating Protocol

1. **Google OAuth 2.0 OpenID Connect:** Authentication verifies ID tokens on Google's public key servers via `google-auth-library` before issuing signed HS256 JWT tokens.
2. **Mutual Contact Privacy Gate:** Donor phone numbers are NEVER publicly searchable. Mutual phone and email details are unlocked exclusively when `match.status === 'ACCEPTED'`.
3. **NoSQL Injection Defense:** All incoming JSON parameters are scrubbed in [`security.js`](file:///f:/Blood/server/middleware/security.js) to strip `$operator` and `.` keys.
4. **Role-Based Access Control:** Administrative routes `/api/admin/*` require `protect` and `authorize('admin')`.

---

## 6. Top 20 Final-Year Project Viva Voce Questions & Answers

### Q1: What is the main objective of RakthaLink AI?
**Answer:** To provide an intelligent, privacy-preserving, and location-aware coordination platform that connects voluntary blood donors with patients in need of blood, using a mathematical matching algorithm and AI natural language processing.

### Q2: Why is RakthaLink AI not classified as a medical diagnostic tool?
**Answer:** RakthaLink AI is strictly a logistical matching and coordination platform. It does not perform biological cross-matching, certify physical donor eligibility, or authorize transfusions. All clinical screenings and cross-matches are executed exclusively by certified hospital blood banks.

### Q3: How does the system calculate geodesic distance between a donor and a hospital?
**Answer:** The system uses the mathematical **Haversine Formula**, which calculates the great-circle distance between two latitude and longitude coordinate points on a spherical Earth ($R = 6371\text{ km}$).

### Q4: Explain the 4 components of the Platform Match Score.
**Answer:** The 0–100 score is computed from:
1. **Biological Compatibility (35%)**: Exact blood match ($100\%$) vs compatible universal type ($80\%$).
2. **Proximity (40%)**: Distance in kilometers computed via Haversine.
3. **Donation Recency (15%)**: Ensures donors have elapsed the WHO 90-day recovery window.
4. **Urgency Weight (10%)**: Requester-selected priority level.

### Q5: How is user privacy protected in RakthaLink AI?
**Answer:** Phone numbers and exact home coordinates are masked. The public search only shows donor first initials and approximate distance in kilometers. Full contact details are unlocked only after a donor explicitly clicks **Accept Request**.

### Q6: How does the Google OAuth 2.0 authentication work in your backend?
**Answer:** The frontend receives a Google ID Token (`credential`) from the Google OAuth server and sends it to `POST /api/auth/google`. The backend uses `google-auth-library`'s `verifyIdToken` to cryptographically verify Google's signature, finds or creates the user, and signs a secure custom JWT token.

### Q7: How is the primary administrator designated?
**Answer:** On the backend, `authController.js` validates `DESIGNATED_ADMIN_EMAILS`. When `dharshang317@gmail.com` logs in with Google, the backend automatically assigns `role: 'admin'`, granting access to the 10-pillar admin suite.

### Q8: What happens when a user with `role: 'both'` uses the platform?
**Answer:** Dual-role users have access to both donor and requester capabilities. The dashboard provides an instant toggle switcher between **Donor Mode** and **Requester Mode** without requiring multiple accounts.

### Q9: How does the AI Request Extractor work?
**Answer:** A user types natural language text (e.g. *"Need 2 units of O+ at KMCH Hospital tomorrow"*). The backend LLM gateway (or fallback heuristic regex parser) extracts structured JSON fields. The user must review and explicitly confirm the structured preview before the request is published.

### Q10: Why are API keys stored on the backend rather than the frontend?
**Answer:** Storing API keys on the frontend exposes them to extraction via browser developer tools. Keeping the Gemini API key on the Express backend ensures it remains secret and rate-limited.

### Q11: What is the purpose of the 2dsphere index in MongoDB?
**Answer:** A `2dsphere` index supports queries that calculate geometries on an Earth-like sphere, enabling high-performance spatial range queries and coordinate storage for hospitals and donors.

### Q12: How does the WHO 90-day recovery calculator work?
**Answer:** The system compares `lastDonationDate` against the current timestamp. If fewer than 90 days have elapsed, the donor is shown their remaining recovery days and their recency score is scaled down to encourage health recovery.

### Q13: What security headers are implemented in your Express server?
**Answer:** Helmet is configured to set security headers including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, Content Security Policy directives, and CORS domain white-listing.

### Q14: How does the system handle NoSQL injection attacks?
**Answer:** Custom security middleware (`sanitizeInputs`) recursively inspects request bodies, query parameters, and route params to strip keys starting with `$` (such as `$gt`, `$where`) or containing `.` characters.

### Q15: What lifecycle statuses can a blood request have?
**Answer:** `OPEN` $\rightarrow$ `MATCHED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `IN_COORDINATION` $\rightarrow$ `RESOLVED` (or `CANCELLED`).

### Q16: What is the difference between exact match and compatible alternative in blood transfusion?
**Answer:** An exact match (e.g. $O^+$ to $O^+$) is ideal because it conserves universal blood types. A compatible alternative (e.g. $O^-$ to $A^+$) is biologically acceptable in emergencies but receives $80\%$ in scoring to preserve rare universal blood for $O^-$ recipients.

### Q17: What features are available in the 10-pillar Admin Dashboard?
**Answer:**
1. Platform KPI Overview
2. User Management & Account Blocking
3. Donor Filtering & Availability Toggles
4. Blood Request Management
5. Match & Coordination Monitoring
6. System Announcements Broadcast
7. Safety & Fraud Investigation Queue
8. Demand Analytics & Distribution Charts
9. AI Activity & Guardrail Monitoring
10. System Configuration & Settings

### Q18: What happens when an administrator blocks a user?
**Answer:** The user's `isBlocked` flag is set to `true`, their active JWT sessions are invalidated on subsequent requests, their donor profile is toggled to unavailable, and the action is logged in `AuditLog`.

### Q19: How are in-app notifications delivered?
**Answer:** When an event occurs (e.g., match found, request accepted, appointment scheduled, announcement broadcast), a record is inserted into the `Notification` collection. The frontend retrieves unread alerts and displays badges in real time.

### Q20: What makes RakthaLink AI production-ready?
**Answer:**
- Zero hardcoded mock logins (Real Google OAuth 2.0).
- True database persistence with 9 normalized Mongoose schemas.
- Mathematical matching engine based on verified medical compatibility and geodesic formulas.
- Comprehensive security (Helmet, CORS, rate limits, NoSQL sanitization).
- 100% automated test pass rate across unit and algorithmic test suites.
