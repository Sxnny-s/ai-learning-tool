# RC-48 Feature: Anki Leadership Board  
**Engineer:** Calvin  
**Sprint:** 3  
**Branch:** rc-48-feature-anki-leadership-board  
**Goal:** Explore and design a leaderboard feature that ranks users based on their Anki learning performance and engagement.

---

## 🧭 Feature Purpose
The purpose of the Anki Leadership Board is to foster healthy competition and community engagement within the AI Learning Platform.  
Students can compare their flashcard progress, retention rates, and daily activity with peers to stay motivated.

**Primary Objective:**  
Determine whether the Anki API (or local Supabase schema) can provide user-based metrics like deck performance, review streaks, or total cards learned.

---

## 🔍 Research Questions
1. Does the official **AnkiConnect API** (or another Anki integration) expose user statistics we can pull directly?  
2. What **data structure/schema** would we need in Supabase to store leaderboard information if the API doesn’t provide it?  
3. Should leaderboard rankings be based on:  
   - Total cards reviewed?  
   - Accuracy rate?  
   - Streak (days active)?  
   - Custom scoring formula (weighted mix)?  
4. How would the leaderboard **update frequency** work (e.g., daily cron job, real-time updates)?  
5. How can this feature encourage **community participation** (badges, streaks, recognition)?  

---

## 🔬 Research Findings (Anki API / AnkiConnect)
### Anki API Overview
Anki itself does not provide a direct, public cloud API for user stats or deck data.  
However, there is a local JSON-based API called **AnkiConnect**, which runs as a plugin on a user’s computer.

**Limitations of AnkiConnect:**
- It only works if the user has Anki Desktop open with the AnkiConnect plugin installed.
- It cannot be accessed remotely or from a cloud platform like ours (AI Learning Platform).
- There is no authentication system for multiple users.
- This makes it unsuitable for our web-based leaderboard.

### AnkiWeb
AnkiWeb (the online sync service for Anki) does not expose an official API for developers.  
It can only sync deck progress between devices and doesn’t provide endpoints for retrieving user stats.

**Confirmed:**
- No way to query data like “total cards reviewed,” “correct answers,” or “streaks” per user.
- No official developer access to user data.

### Conclusion (IMPORTANT)
Since neither AnkiConnect nor AnkiWeb offers a usable cloud API for leaderboard integration,  
we’ll have to create an **internal Supabase-based tracking system** to store user stats directly on our platform.

This allows us to:
- Track metrics like reviews, streaks, and accuracy in real-time.  
- Build our own ranking logic (e.g., by accuracy and consistency).  
- Keep all user data within the platform securely (no external sync needed).

---

## 🧩 Proposed Schema (Pending - Initial Draft)
| Field | Type | Description |
|-------|------|--------------|
| id | uuid | unique entry id |
| user_id | uuid | linked to users table |
| total_cards_reviewed | integer | total number of cards reviewed by user |
| correct_rate | float | accuracy percentage |
| streak_days | integer | consecutive study days |
| updated_at | timestamp | last update time |

### Rationale
The schema focuses on lightweight metrics that can easily scale and integrate with Clerk’s user_id.
It balances simplicity (review counts, streaks, accuracy) with flexibility for future expansion.
Additional columns like badges, weekly_points, or rank_position can be added later if engagement grows.
Each record in `anki_stats` will reference Clerk's `user_id` to ensure consistent linkage with authentication and analytics tables already present in the platform.


## 🛠 Proposed API Routes (Future)
| Route | Method | Purpose |
|-------|---------|----------|
| `/api/leaderboard` | GET | Fetch top 10 ranked users |
| `/api/leaderboard/update` | POST | Recalculate and store leaderboard results |
| `/api/anki-stats/:user_id` | GET | Retrieve an individual user’s stats |
| `/api/anki-stats` | PATCH | Update totals, streaks, or accuracy |

---

## 🔗 Integration Options
1. **Option A: Most Likely Approach** Use a custom Supabase table (`anki_stats`) that tracks user activity inside our platform.  
   - Pros: Works in-browser, no dependency on local apps.  
   - Cons: Requires us to collect and calculate metrics manually. 

2. **Option B:** Connect to the AnkiConnect API (local Anki desktop service).  
   - Pros: Real-time stats from user’s own deck.  
   - Cons: Requires local Anki setup and open port (less web-friendly).  

---

## 🧠 Community Design Ideas
- Weekly and all-time leaderboards  
- Badges for top performers  
- “Study Streak” gamification (e.g., 🔥7 days active)  
- Anonymous leaderboard toggle for privacy  
- Optional “peer challenge” mode between classmates  

---

## 🧾 Next Steps
**Summary:** Research complete — schema, routes, and implementation plan ready for validation phase.

- [x] 1. Research AnkiConnect or AnkiWeb API endpoints for stats.  
- [x] 2. Propose final schema additions to Supabase (if needed).  
- [x] 3. Draft potential routes for leaderboard CRUD operations (e.g., `/api/leaderboard`).  
- [ ] 4. Submit summary findings to team for validation before coding.  

---

## ✅ Deliverables
- Completed `ANKI_LEADERSHIP_RESEARCH.md` doc  
- Confirmed schema proposal for `anki_stats`  
- Outline of API routes or Supabase functions needed  
- Optional: mockup or wireframe for leaderboard UI (later phase)

