# Logic Document for Collaborative To-Do Board

## Smart Assign Logic

The "Smart Assign" feature assigns a task to the user with the fewest active (non-Done) tasks to balance workload. Here's how it works:

### Process Flow

1. **Trigger**: When the "Smart Assign" button is clicked on a task
2. **User Retrieval**: The backend retrieves all users from the database
3. **Task Count Calculation**: For each user, it counts their active tasks (those with status "Todo" or "In Progress") using a MongoDB query
4. **Selection**: The user with the lowest count of active tasks is selected
5. **Assignment**: The task's `assignedUser` field is updated to this user's ID
6. **Version Update**: The task's version is incremented to track changes
7. **Logging**: An action log entry is created to record the assignment
8. **Broadcast**: The update is broadcast via WebSocket to all connected clients for real-time synchronization

### Benefits

- Ensures fair task distribution without manual intervention
- Optimizes team efficiency through balanced workload
- Automatic and transparent assignment process

---

## Conflict Handling Logic

Conflict handling addresses scenarios where two users edit the same task simultaneously, ensuring data integrity and user choice.

### Core Mechanism

Each task has a `version` field that is incremented with every update to track changes and detect conflicts.

### Process Flow

#### 1. Version Check
- When a user submits an update, the client sends the task's current version number
- The backend checks if the task's version in the database matches the client's version

#### 2. Conflict Detection
- If versions differ, a conflict is detected, indicating another user modified the task concurrently
- The backend responds with a `409 Conflict` status

#### 3. Conflict Resolution Interface
The backend includes both versions in the response:
- Current database version
- Client's version of the task

#### 4. User Choice
The frontend displays a modal showing both versions (title, description, etc.) and offers two options:

**Option A: Choose a Version**
- The user selects one version to overwrite the other
- Selected version becomes the new current version

**Option B: Cancel**
- The user discards their changes
- No updates are made to the task

#### 5. Resolution
Upon selecting a version:
- Backend updates the task with the chosen version
- Version number is incremented
- Action is logged
- Update is broadcast via WebSocket to all clients

### Example Scenario

**Situation**: 
- User A changes a task's title to "Meeting Prep"
- User B simultaneously changes its description to "Discuss Q3 goals"

**Resolution**:
- Both versions are displayed to the user
- User can choose to keep one version
- Alternatively, user can manually merge by editing the task afterward

### Key Features

- **Transparency**: Users see exactly what changes conflict
- **User Control**: Users decide how to resolve conflicts
- **Data Integrity**: Prevents data loss in collaborative environments
- **Real-time Updates**: All clients receive immediate updates via WebSocket

---

## Technical Implementation Notes

### Database Schema Requirements
- Tasks must have a `version` field (integer, auto-incremented)
- Tasks must have an `assignedUser` field (ObjectId reference)
- Users collection for Smart Assign functionality

### WebSocket Events
- Task updates broadcast to all connected clients
- Real-time synchronization across all user sessions

### Error Handling
- `409 Conflict` status for version conflicts
- Graceful degradation when WebSocket connection fails
- Proper validation for user permissions and task ownership