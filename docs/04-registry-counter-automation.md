# 4. Registry Counter and Document Number Automation

## Purpose

The Registry Counter provides a global registration sequence used to generate a human-readable Communication Document No.

Format:

```text
PREFIX + YYMMDD + GLOBAL SEQUENCE
```

Example:

```text
REQ2608170001
```

Meaning:

- `REQ` = Request
- `26` = year registered
- `08` = month registered
- `17` = day registered
- `0001` = global registration sequence

The sequence is global. It is not reset by month, year, or document type.

## Part 1 — Registry Counter table

### Step 1 — Create the source sheet

Create a sheet named `Registry Counter`.

Fields:

- Counter ID
- Current Number

Create a row for the Communication counter. The Counter ID is `Communication`.

### Step 2 — Add the table to AppSheet

1. Go to **Data > Tables**.
2. Add `Registry Counter`.
3. Regenerate the structure if necessary.
4. Configure `Counter ID` as Text and Key.
5. Configure `Current Number` as Number.

## Part 2 — Increment action

### Step 1 — Create the action

1. Go to **Behavior > Actions**.
2. Click **New Action**.
3. For a record of this table: `Registry Counter`.
4. Do this: **Data: set the values of some columns in this row**.
5. Under **Set these column(s)**, select `Current Number`.
6. Set the value to:

```appsheet
[Current Number] + 1
```

7. Name the action `Increment Communication Counter`.

### Action workflow

```text
Registry Counter row
        |
        v
Current Number
        |
        v
Current Number + 1
        |
        v
Updated global sequence
```

## Part 3 — Automation Bot

### Step 1 — Create the Bot

1. Go to **Automation > Bots**.
2. Click **New Bot**.
3. Name it `Generate Communication Document No.`.

### Step 2 — Configure the Event

Set:

- Event source: App
- Table: Communication
- Data change type: Adds
- Condition: blank
- Bypass Security Filters: OFF

This means the automation starts whenever a new Communication record is added.

## Part 4 — Process

The Bot must have a Process; AppSheet will not save the Bot without one.

### Step 1 — Add the process step

Use **Run a data action**.

Choose the option to run an action on rows.

Set:

- Referenced Table: `Registry Counter`
- Referenced Rows: the Communication counter row, e.g. `LIST("Communication")`
- Referenced Action: `Increment Communication Counter`

### Workflow

```text
New Communication
        |
        v
Bot: Generate Communication Document No.
        |
        v
Process
        |
        v
Run data action on Registry Counter
        |
        v
Increment Communication Counter
```

## Part 5 — Generate Document No.

After the counter is incremented, the Communication record receives its human-readable Document No.

The prefix is selected from Document Type using the following mapping:

| Document Type | Prefix |
|---|---|
| Request | REQ |
| Reply | REP |
| Memorandum | MEM |
| Clarification | CLR |
| Notice | NTC |
| Letter | LTR |
| Endorsement | NDR |
| Invitation | INV |
| Reference Material | REF |
| Other | OTH |

The Document No. generation uses the document type prefix, registration date, and global counter.

### Visual workflow

```text
NEW COMMUNICATION
       |
       v
BOT: Generate Communication Document No.
       |
       v
PROCESS
       |
       v
Increment Communication Counter
       |
       v
Retrieve/use the current global sequence
       |
       v
Build Document No.
       |
       +---- Document Type -> Prefix
       +---- Registration date -> YYMMDD
       +---- Global sequence -> 0001, 0002, ...
       |
       v
Example: REQ2608170001
```

## Important implementation note

The counter increment must happen before the Document No. uses the sequence so that a newly registered Communication receives the new registration number rather than the previous counter value.

The Communication ID remains the technical AppSheet key. Document No. is the user-facing registry number.
