# Real-Time Collaborative Editing: How It Works

## The Core Problem

When two users edit the same document simultaneously, their changes can conflict. For example:

```
Original text: "Hello World"

User A (at t=0): Deletes "World" → "Hello "
User B (at t=0): Inserts "Beautiful " before "World" → "Hello Beautiful World"

What should the final result be?
```

Without coordination, you get corrupted data or lost edits. Google Docs, Figma, and Notion all solve this problem—but with different approaches.

---

## Approach 1: Operational Transformation (OT)

**Used by:** Google Docs, Google Sheets, Microsoft Office Online

### How It Works

1. **Operations, not snapshots**: Instead of syncing the whole document, you sync *operations* like:
   - `insert("Hello", position=0)`
   - `delete(position=5, length=3)`

2. **Transform conflicting operations**: When two users make concurrent edits, a transformation function adjusts the operations so they can both apply cleanly.

   ```
   User A: delete(pos=5, len=5)  // Delete "World"
   User B: insert(pos=6, text="Beautiful ")  // Insert before "World"

   Transform B's operation against A's:
   - A deleted chars 5-10
   - B's insert at position 6 is inside the deleted range
   - Result: B's insert is discarded OR repositioned to pos=5
   ```

3. **Central server decides order**: The server receives operations, transforms them, and broadcasts the canonical order to all clients.

### Pros & Cons

| Pros | Cons |
|------|------|
| Mature, battle-tested | Complex to implement correctly |
| Works well for text | Requires central server |
| Low bandwidth | Hard to extend to new data types |
| | Edge cases are notoriously tricky |

---

## Approach 2: Conflict-free Replicated Data Types (CRDTs)

**Used by:** Figma, Notion, Apple Notes, Linear, many modern apps

### How It Works

1. **Every element has a unique ID**: Instead of positions, each character/element gets a globally unique identifier that never changes.

   ```
   "Hello" becomes:
   { id: "a1", char: "H", after: null }
   { id: "a2", char: "e", after: "a1" }
   { id: "a3", char: "l", after: "a2" }
   { id: "a4", char: "l", after: "a3" }
   { id: "a5", char: "o", after: "a4" }
   ```

2. **Operations reference IDs, not positions**:
   - `insert({ id: "b1", char: "!", after: "a5" })`
   - `delete({ id: "a3" })`

3. **Merge is automatic**: Because IDs are unique and stable, operations from different users can merge without transformation. The data structure itself resolves conflicts.

4. **No central server required**: CRDTs can sync peer-to-peer, though most apps still use a server for convenience.

### Popular CRDT Types

| Type | Use Case |
|------|----------|
| **G-Counter** | Counting (likes, views) |
| **LWW-Register** | Single values (last-write-wins) |
| **OR-Set** | Sets of items |
| **RGA/Yjs Sequence** | Ordered lists, text |
| **Automerge** | JSON-like documents |

### Pros & Cons

| Pros | Cons |
|------|------|
| Mathematically proven to converge | Higher memory overhead (storing IDs) |
| Works offline, syncs later | More complex data structures |
| Can work peer-to-peer | Deletions need "tombstones" |
| Easier to reason about | Relatively newer approach |

---

## Approach 3: Last-Write-Wins (Simple)

**Used by:** Many simpler apps, your current Gist sync

### How It Works

Whoever saves last overwrites everything. No merging.

### When It's Acceptable

- Single user or low-conflict scenarios
- Coarse-grained data (whole records, not character-by-character)
- When conflicts are rare and manual resolution is OK

---

## How This Applies to the Wedding Planner

### Current Architecture

```
┌─────────┐         ┌─────────┐
│ User A  │         │ User B  │
│ Browser │         │ Browser │
└────┬────┘         └────┬────┘
     │                   │
     │   Save to Gist    │
     └────────┬──────────┘
              │
        ┌─────▼─────┐
        │  GitHub   │
        │   Gist    │
        └───────────┘
```

**Problem:** If User A and User B both edit and save, the last save wins and overwrites the other's changes.

### Real-Time Collaboration Architecture

```
┌─────────┐                           ┌─────────┐
│ User A  │◄─────── WebSocket ───────►│ User B  │
│ Browser │                           │ Browser │
└────┬────┘                           └────┬────┘
     │                                     │
     │         ┌─────────────┐             │
     └────────►│  Sync Server │◄───────────┘
               │  (Yjs/CRDT)  │
               └──────┬──────┘
                      │
                ┌─────▼─────┐
                │ Database  │
                │ (Persist) │
                └───────────┘
```

---

## Implementation Options for Wedding Planner

### Option 1: Yjs + WebSocket Server (Recommended)

**Yjs** is the most popular JavaScript CRDT library. It handles all the complexity.

#### What You'd Need

1. **Frontend changes:**
   ```javascript
   import * as Y from 'yjs'
   import { WebsocketProvider } from 'y-websocket'

   // Create a shared document
   const ydoc = new Y.Doc()

   // Connect to sync server
   const provider = new WebsocketProvider(
     'wss://your-server.com',
     'wedding-planner-room',
     ydoc
   )

   // Shared data structures
   const venues = ydoc.getArray('venues')
   const tasks = ydoc.getMap('tasks')

   // Listen for changes (from any user)
   venues.observe(event => {
     updateUI(venues.toArray())
   })

   // Make changes (automatically synced)
   venues.push([{ id: 'v11', name: 'New Venue', ... }])
   ```

2. **Backend (sync server):**
   - Use `y-websocket` server (can deploy to Fly.io, Railway, etc.)
   - Or use a hosted service like **Liveblocks**, **PartyKit**, or **Convex**

3. **Persistence:**
   - Save CRDT state to database periodically
   - Or use Yjs + IndexedDB for offline support

#### Complexity: Medium-High
- Need to host a WebSocket server
- Need to handle authentication
- Need to migrate data model to Yjs structures

---

### Option 2: Liveblocks (Hosted Solution)

**Liveblocks** is a hosted real-time collaboration service with a generous free tier.

```javascript
import { createClient } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'

const client = createClient({
  publicApiKey: 'pk_xxx',
})

const { RoomProvider, useStorage, useMutation } = createRoomContext(client)

// In your app
function VenuesTab() {
  const venues = useStorage(root => root.venues)

  const addVenue = useMutation(({ storage }, venue) => {
    storage.get('venues').push(venue)
  }, [])

  // venues automatically syncs across all users
}
```

#### Complexity: Low-Medium
- No server to manage
- Free tier: 300 monthly active users
- Handles WebSocket infrastructure

---

### Option 3: PartyKit (Modern, Simple)

**PartyKit** is a newer platform specifically for real-time collaborative apps.

```javascript
// server (PartyKit)
export default class WeddingRoom {
  constructor(public party: Party) {}

  onMessage(message, sender) {
    // Broadcast to all connected users
    this.party.broadcast(message)
  }
}

// client
const socket = new WebSocket('wss://wedding.username.partykit.dev')
socket.onmessage = (e) => {
  const update = JSON.parse(e.data)
  applyUpdate(update)
}
```

#### Complexity: Low-Medium
- Serverless deployment
- Good DX
- Can integrate with Yjs

---

### Option 4: Firebase Realtime Database

Google's real-time database, but uses last-write-wins per field (not true collaborative editing).

```javascript
import { getDatabase, ref, onValue, set } from 'firebase/database'

const db = getDatabase()
const venuesRef = ref(db, 'venues')

// Listen for changes
onValue(venuesRef, (snapshot) => {
  setVenues(snapshot.val())
})

// Write changes
set(ref(db, 'venues/v1/userNotes'), 'New note')
```

#### Complexity: Low
- Easy to set up
- But: concurrent edits to same field = last write wins
- Good enough for field-level edits (not character-level)

---

## Feasibility Assessment for Wedding Planner

| Approach | Effort | Cost | Real-Time? | Offline? |
|----------|--------|------|------------|----------|
| Keep Gist sync | None | Free | No | Yes |
| Firebase | 1-2 days | Free tier | Field-level | Yes |
| Liveblocks | 2-3 days | Free tier | Full | Partial |
| PartyKit + Yjs | 3-5 days | ~$0-20/mo | Full | Yes |
| Self-hosted Yjs | 5-7 days | ~$5-10/mo | Full | Yes |

### My Recommendation

For the wedding planner, **Firebase Realtime Database** or **Liveblocks** would be the sweet spot:

1. **Firebase** if you just want 2-3 people to see each other's changes without stepping on each other (field-level sync is fine for this app—you're not co-editing a text document character by character)

2. **Liveblocks** if you want the "Google Docs feel" with presence (seeing each other's cursors), real-time updates, and proper conflict resolution

The current Gist-based approach is honestly fine for a wedding planning app with 2-3 users who aren't editing simultaneously very often. The 5-minute sync debounce you have works well for async collaboration.

---

## Further Reading

- [Yjs Documentation](https://docs.yjs.dev/)
- [A simple approach to building a real-time collaborative text editor](https://digitalfreepen.com/2017/10/06/simple-real-time-collaborative-text-editor.html)
- [CRDTs: The Hard Parts (Martin Kleppmann)](https://www.youtube.com/watch?v=x7drE24geUw)
- [Liveblocks Docs](https://liveblocks.io/docs)
- [How Figma's multiplayer technology works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
