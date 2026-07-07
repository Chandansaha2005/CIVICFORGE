# Implementation Plan - AI background Prioritization of Civic Problems & Solutions

This plan designs a background AI service using Google Gemini to prioritize community grievances and their matched solution prototypes based on depth, human distress, and public safety impact rather than merely likes or submission dates.

## Proposed Changes

### Database Abstraction layer

#### [MODIFY] [Grievance.ts](file:///d:/Projects/CIVICFORGE/backend/src/models/Grievance.ts)
Add fields for AI prioritization:
* `aiPriorityScore`: `Number` (0 to 100, default `0`).
* `aiPriorityExplanation`: `String` (explaining human impact and depth of the problem, default `null`).
* `aiLastEvaluatedAt`: `Date` (default `null`).

#### [MODIFY] [Solution.ts](file:///d:/Projects/CIVICFORGE/backend/src/models/Solution.ts)
Add an array tracking AI suitability scores for specific matched grievances:
* `aiSuitability`: `[{ grievanceId: ObjectId, score: Number, explanation: String }]`

---

### Backend Services & AI Core

#### [MODIFY] [geminiService.ts](file:///d:/Projects/CIVICFORGE/backend/src/services/geminiService.ts)
Add the prompt and structure using the `@google/genai` model `gemini-3.5-flash` to evaluate priority & solution relevance:
* `evaluatePriorityAndSuitability(grievance, solutions)`: Submits the grievance text, category, location, recurrence list and potential solutions to Gemini. It returns a JSON object containing:
  - `aiPriorityScore` (estimated human need rating)
  - `aiPriorityExplanation` (empathetic write-up of severity and impact)
  - `solutionSuitability` (ranking individual solutions for this problem)
* Includes robust safety fallbacks in case of Gemini rate limit or connection issues.

#### [NEW] [aiPrioritizer.ts](file:///d:/Projects/CIVICFORGE/backend/src/services/aiPrioritizer.ts)
Create the background daemon:
* Checks the database for any unresolved grievances where `aiLastEvaluatedAt` is null (indicating it is new or dirty).
* Runs Gemini evaluators on those records and saves results.
* Loops dynamically in the background (runs once on startup, then every 60 seconds).
* Exposes a quick manual re-run function `runAIPrioritizationTask()`.

---

### Backend Controller & Routing APIs

#### [MODIFY] [grievanceController.ts](file:///d:/Projects/CIVICFORGE/backend/src/controllers/grievanceController.ts)
* Clear `aiLastEvaluatedAt = null` upon grievance creation or verification to ensure the daemon prioritizes/updates it.
* Trigger background run immediately (async) to yield instant priority calculations.

#### [MODIFY] [solutionController.ts](file:///d:/Projects/CIVICFORGE/backend/src/controllers/solutionController.ts)
* When a solution is created or vouched, set `aiLastEvaluatedAt = null` for all grievances in that solution's `targetCategory`.
* Trigger background prioritizer immediately (async) to calculate the solution's suitability.

#### [MODIFY] [priorityController.ts](file:///d:/Projects/CIVICFORGE/backend/src/controllers/priorityController.ts)
* Update `getPriorityMatrix` to sort grievances by `aiPriorityScore` descending.
* Sort solutions matching each grievance using their `aiSuitability` score rather than sorting solely by vouchCount.
* Expose `forcePrioritizeAll` controller to trigger the AI prioritizer task immediately for all active grievances.

#### [MODIFY] [priorityRoutes.ts](file:///d:/Projects/CIVICFORGE/backend/src/routes/priorityRoutes.ts)
* Add `/api/priority-matrix/prioritize-all` (POST, role `mp` only) to let the MP manually trigger recalculation of AI scores.

#### [MODIFY] [feedController.ts](file:///d:/Projects/CIVICFORGE/backend/src/controllers/feedController.ts)
* Modify `getProblemsFeed` to support `ai-priority` sort parameter which ranks by `aiPriorityScore` descending.
* Make `ai-priority` the default sorting method.

---

### App Boot Integration

#### [MODIFY] [server.ts](file:///d:/Projects/CIVICFORGE/server.ts)
* Initialize/boot the `startAIPrioritizer()` daemon during system bootstrap.

---

### Frontend UI Enhancements

#### [MODIFY] [PriorityMatrixTable.tsx](file:///d:/Projects/CIVICFORGE/src/components/PriorityMatrixTable.tsx)
* Update table properties to display `aiPriorityScore` instead of (or alongside) `urgencyScore`.
* Render a Sparkles icon next to the AI score with a hover/click popover displaying the `aiPriorityExplanation` of human distress.
* Add sorting capability for AI Priority Score and make it the default sort option.

#### [MODIFY] [MPDashboard.tsx](file:///d:/Projects/CIVICFORGE/src/pages/mp/MPDashboard.tsx)
* Add an "AI Force Sync" button to trigger the manual priority matrix run.
* Include toast notifications showing progress of background calculations.

#### [MODIFY] [ProblemFeed.tsx](file:///d:/Projects/CIVICFORGE/src/pages/developer/ProblemFeed.tsx)
* Support sorting options: `ai-priority` (default), `urgency`, and `newest` sorting.
* Update card layout to show the AI Human-Need Priority Score, complete with a clean summary card explainers why the problem is prioritized.

---

## Verification Plan

### Automated Tests/Build Setup
* Ensure the TypeScript compiler builds successfully:
  `npm run lint` 
* Ensure the server launches and connects to MongoDB:
  `npm run dev`

### Manual Verification
* Access the MP Dashboard and verify that grievances are sorted by "AI Priority Score" by default.
* Hover/click the AI score check boxes to display the `aiPriorityExplanation`.
* Verify that developer solutions matching the grievance list are sorted by AI suitability.
* Register a new developer solution, and inspect that the AI prioritizes it for the grievance in the background.
* Toggle the developers' Problems Feed, sorting by "Sort by AI Human-Need Priority" and verify the list matches.
