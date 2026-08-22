# 2. Communication Views and Forms

## Communication main view

### Build steps

1. Add the Communication table to AppSheet.
2. Create a view using Communication as its data source.
3. Use the chosen browsing view type (the project currently uses a Deck-style presentation for the main browse experience).
4. Configure the primary, secondary, and summary fields for quick identification.
5. Enable the built-in Add action for creating a new Communication.
6. Keep the native Search control enabled as configured in the app.

### User workflow

```text
Communication View
      |
      +---- Add ----> Communication Form
      |
      +---- Existing record ----> Communication Detail
```

## Communication Form

### Purpose

Used to register a new communication. It is not a movement form.

### Build/configuration steps

1. Create the Communication table and regenerate its structure.
2. Configure the registration fields.
3. Keep Subject visible when a new record is being added.
4. Configure Subject so that it becomes read-only when an existing record is updated.
5. Keep Remarks available because the logbook requires a remarks field.
6. Do not place movement-entry fields in the Communication registration form.

The reason for separating movement is that encoding a document does not necessarily mean that it has already been transmitted or received.

## Communication Update slice and form

### Build steps

1. Go to **Data > Slices**.
2. Create an update slice based on Communication.
3. Configure the slice so it exposes only the fields intended to be updated.
4. Create a form view using the update slice.
5. Configure Subject as read-only during updates so the user can identify the record without changing its identity/title.
6. Hide the system-generated Edit action where the custom update workflow is used.

### Workflow

```text
Communication Detail
        |
        v
      Update
        |
        v
Communication Update Slice
        |
        v
Communication Update Form
        |
        v
Save changes
```

## Communication Detail

### Purpose

The Detail view is the central record view. It shows the registered communication and its movement trail.

### Build steps

1. Create the Communication Detail view.
2. Add the Communication fields that should be visible to users.
3. Add `Related Communication Movements` to the Detail view's column order.
4. Keep the relationship column available in Detail even though movement records are not entered in the Communication Form.

### Workflow

```text
Communication View
       |
       v
Communication Detail
       |
       +---- Communication information
       |
       +---- Related Communication Movements
                     |
                     v
              Movement records
```

## Communication ID and Document No.

`Communication ID` is the technical AppSheet key. `Document No.` is the human-readable registration number.

The Document No. is displayed to users because it is easier to identify a document than the technical key. The Communication ID remains important for Ref relationships and should not be manually altered.
