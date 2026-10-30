# Module APIs & Cross-Module Contracts

This document records the internal module contracts and shared database conventions across CreatorOS AI.

---

## 1. Beluga Product & Lead Intelligence Module

**Owner**: Shiva Prakash (Beluga & Core Platform Features)

### Calendar Event Integration Contract

Beluga allows creators to schedule B2B outreach follow-ups directly on matched candidate leads. These follow-ups synchronize bidirectionally with the CreatorOS Editorial & Outreach Calendar (`/dashboard/calendar`).

#### Events Table Schema Mapping

Calendar events created or updated by Beluga adhere to the following strict conventions on the shared `events` table:

| Column | Type | Beluga Convention / Value | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Auto-generated (`gen_random_uuid()`) | Primary key of the calendar event record |
| `user_id` | `UUID` | Authenticated creator UID (`auth.uid()`) | Enforces Supabase RLS tenant isolation |
| `type` | `TEXT` | `'follow_up'` | Event classification |
| `title` | `TEXT` | `Beluga: Follow up with <Company> (<Product>)` | Human-readable schedule title |
| `due_at` | `TIMESTAMPTZ` | ISO 8601 Timestamp (e.g. `2026-10-25T14:30:00Z`) | Scheduled date and time for the outreach call or message |
| `linked_type` | `TEXT` | `'beluga_match'` | **Fixed Cross-Module Identifier**: Identifies this event as originating from a Beluga match |
| `linked_id` | `TEXT` | `<matches.id>` (UUID) | Foreign key pointing to the user's row in `matches` |
| `status` | `TEXT` | Match Call Status string | Synchronized with `matches.call_status` (`not_contacted`, `scheduled`, `contacted`, `in_discussion`, `converted`, `archived`) |
| `created_at` | `TIMESTAMPTZ` | Auto-generated timestamp | Record creation time |

#### Calendar Event Lifecycle & Deduplication Guarantees

1. **Deterministic Lookup & Upsert**:
   When scheduling or editing a follow-up, Beluga performs a scoped lookup for any existing event:
   ```sql
   SELECT id FROM events 
   WHERE user_id = auth.uid() 
     AND linked_type = 'beluga_match' 
     AND linked_id = :match_id;
   ```
   If an existing linked event is found, Beluga updates its `due_at`, `status`, and `title` in place, guaranteeing **zero duplicate calendar entries**.

2. **Follow-Up Cancellation / Clear**:
   When a creator clears a follow-up via `clearFollowUp(matchId)`, Beluga:
   - Sets `matches.follow_up_at = NULL` and resets `matches.call_status = 'not_contacted'`.
   - Safely removes only the linked calendar event:
     ```sql
     DELETE FROM events 
     WHERE user_id = auth.uid() 
       AND linked_type = 'beluga_match' 
       AND linked_id = :match_id;
     ```
   - Unrelated calendar milestones (editorial tasks, video publishing schedules, approvals) are never touched.

3. **Calendar View Navigation**:
   The calendar page at `app/dashboard/calendar/page.tsx` checks:
   ```tsx
   if (event.linked_type === 'beluga_match') {
     // Renders a direct link back to /dashboard/beluga
   }
   ```

---

## 2. Beluga Gateway AI Brief Contract

**Task Name**: `pitch_brief`  
**Endpoint**: `POST /v1/generate`  
**Payload**:
```json
{
  "task": "pitch_brief",
  "input": {
    "product": {
      "name": "CreatorPulse Analytics",
      "industry": "AI & Creator Tools",
      "icp": "Digital creators and agency managers",
      "description": "Cross-platform analytics and revenue tracking"
    },
    "company": {
      "name": "Synthetix Media Labs",
      "industry": "AI & Creator Tools",
      "region": "North America",
      "headcount": 45
    }
  }
}
```

**Stored Brief Representation (`matches.brief`)**:
```json
{
  "opening_line": "Opening cold outreach line...",
  "talking_points": ["Key value point 1", "Key value point 2"],
  "objection": "Anticipated objection",
  "reply": "Prepared counter-reply",
  "updated_at": "2026-10-21T10:00:00.000Z",
  "is_manual": false
}
```
- `is_manual: false` indicates content generated directly by the AI gateway.
- `is_manual: true` indicates content created or modified manually by the creator.
