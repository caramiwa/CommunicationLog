# Communication Logbook

AppSheet-based Communication Registry and Movement Logbook.

This repository documents how the application was built, the configuration of its tables, views, actions, and automation, and the user workflows behind them.

## Documentation

- [System Architecture](docs/01-system-architecture.md)
- [Communication Views and Forms](docs/02-communication-views.md)
- [Communication Movement](docs/03-communication-movement.md)
- [Registry Counter and Document Number Automation](docs/04-registry-counter-automation.md)
- [Build History and Design Decisions](docs/05-build-history.md)

## Core workflow

```text
Register Communication
        |
        v
Communication Form
        |
        v
Document Number Automation
        |
        v
Communication Detail
        |
        v
Related Communication Movements
        |
        v
Movement Add Form
        |
        v
Movement Trail
```

## Design principle

Registration and movement are separate business events. A communication may be registered before it is transmitted or received. Movement records therefore form a separate child table and provide the audit trail for the document's movement between offices.
