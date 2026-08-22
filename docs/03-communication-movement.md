# 3. Communication Movement

## Purpose

Communication Movement is the audit trail for the physical or electronic movement of a registered communication.

It is intentionally separate from Communication registration.

## Build steps

### Step 1 — Create the source sheet

Create a `Communication Movement` sheet/table with fields for the movement event.

Recommended/current fields:

- Movement ID
- Communication ID
- Communication Type
- From
- To
- Date Received
- Received By
- Signature
- Movement Status
- Remarks

### Step 2 — Add the table to AppSheet

1. Go to **Data > Tables**.
2. Add `Communication Movement`.
3. Regenerate the structure after adding or changing source columns.

### Step 3 — Configure Movement ID

Set:

- Type: Text
- Key: ON
- Initial value: `UNIQUEID()`
- App formula: blank

Movement ID is the technical unique identifier for each movement event.

### Step 4 — Configure Communication ID

Set:

- Type: Ref
- Referenced table: Communication
- Key: OFF
- Editable: OFF for the user-facing movement form
- IsPartOf: ON

The Ref makes Communication ID the parent-child link between the two tables.

### Step 5 — Configure movement fields

Configure From and To as separate fields. This replaced the earlier single Source/Destination concept and better reflects the actual movement direction.

Keep Remarks because it is required for the logbook/ISO context.

Signature is recorded at the destination/receipt point rather than at initial registration.

## Related Communication Movements

The Communication table contains a virtual column named `Related Communication Movements`.

Configuration:

- Element type: Ref
- Referenced table: Communication Movement
- Show: ON
- Show_If: blank in the current working configuration

Current relationship expression:

```appsheet
SELECT(
  Communication Movement[Movement ID],
  [Communication ID] = [_THISROW].[Communication ID]
)
```

The virtual column is included in the Communication Detail view's column order.

## Movement Form

The Movement Form is used to enter one movement event.

The Communication ID is supplied by the parent Communication context and is read-only to prevent a user from accidentally attaching a movement to another document.

### User workflow

```text
Communication Detail
        |
        v
Related Communication Movements
        |
        v
Built-in Add
        |
        v
Communication Movement Form
        |
        +-- Communication ID (already supplied; read-only)
        +-- Communication Type
        +-- From
        +-- To
        +-- Date Received
        +-- Received By
        +-- Signature
        +-- Movement Status
        +-- Remarks
        |
        v
      Save
        |
        v
Movement record stored
        |
        v
Movement appears in the Communication's trail
```

## Built-in Add vs custom action

A custom `Record Movement` action was tested using `LINKTOFORM()`. It successfully opened the Movement Form with the correct Communication ID. However, once the built-in Add action was confirmed to perform the required parent-child behavior correctly, the custom action became redundant and should not be maintained.

The current design therefore prefers the built-in Add action.

## Important design decision

Movement records should not be encoded merely because a Communication record was created. Registration and transmission/receipt are distinct events. The Movement Trail is therefore entered from the Communication Detail context when an actual movement occurs.
