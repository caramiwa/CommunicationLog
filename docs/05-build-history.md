# 5. Build History and Design Decisions

This document records important decisions made while building the Communication Logbook so that future changes do not accidentally undo a deliberate design choice.

## Registration vs movement

The Communication Form is for registration. Movement is recorded separately. A user may encode a communication without transmitting it immediately, so a movement record should not be created automatically at registration.

## Subject during update

Subject is shown so the user can identify the document being edited, but it is read-only during updates. This reduces the risk of changing the identity/title of an existing registry record while still providing context to the user.

## Communication ID vs Document No.

Communication ID is the technical key used by AppSheet. Document No. is the human-readable registry number. The latter should not replace the technical key in Ref relationships.

## From / To

The earlier Source/Destination concept was changed to two fields: From and To. This makes the direction of each movement explicit.

## Remarks

Remarks was added to the Communication and Movement records to satisfy the logbook/ISO documentation requirement.

## Movement relationship troubleshooting

The Related Communication Movements virtual column disappeared during configuration and was rebuilt. The child Communication ID was verified as a Ref to Communication with IsPartOf ON. The parent virtual column was restored as a List of Ref to Communication Movement and included in the Communication Detail view.

The relationship was ultimately made explicit with:

```appsheet
SELECT(
  Communication Movement[Movement ID],
  [Communication ID] = [_THISROW].[Communication ID]
)
```

This successfully restored the existing movement trail.

## Built-in Add vs custom Record Movement

A custom Record Movement action using `LINKTOFORM()` was created and tested. It opened the Movement Form with the correct Communication ID. After confirming that the built-in Add action correctly created a child Movement from the related-record context, the custom action became redundant. The preferred design is to keep the built-in Add action and remove the custom duplicate.

## Search

A more elaborate dedicated search using User Settings was considered. The native AppSheet Search control was subsequently located and confirmed. The elaborate search experiment is therefore not part of the current core design unless future requirements show that native search is insufficient.

## Views and system-generated actions

System-generated views/actions were hidden only where they conflicted with the intended user workflow. Native AppSheet behavior is preferred when it correctly performs the required operation; custom actions should only be retained when they provide a real functional benefit.

## Current core workflow

```text
REGISTER
   |
   v
Communication Form
   |
   v
Automation generates Document No.
   |
   v
Communication Detail
   |
   v
Movement Trail
   |
   v
Built-in Add
   |
   v
Communication Movement Form
   |
   v
Movement record
```
