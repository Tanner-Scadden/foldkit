---
'foldkit': patch
---

Point Story and Scene tests at component test helpers when leftover Commands come from a child Submodel. The "I found Commands without resolvers" and "I found unresolved Commands" errors now end with a hint when any listed Command was lifted from a child. If that child is a `@foldkit/ui` component, its `test` namespace may already resolve those Commands, as `Toast.test.drainEntry` does for a toast's animation and dismiss lifecycle. Previously the errors only listed the Commands, so tests tended to resolve a component's internal Commands one by one. Errors for a program's own Commands are unchanged.
