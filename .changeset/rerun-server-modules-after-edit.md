---
'@foldkit/vite-plugin': patch
---

Fix the SSR dev server failing after an edit to a module that declares Commands, Mounts, Subscriptions, or ManagedResources against a Block Definition created in another module. The next render threw an error such as `Block "Application" declares Command "LoadPreferences" more than once` until the dev server restarted, because Vite reran the edited module but not the module that created the Definition.

After an edit to any server module, the dev server now reruns every server module on the next request, reusing each module's transformed code. State held at module level in a server module, such as a database client, is created again after each such edit. A name declared twice against one Definition is still an error.
