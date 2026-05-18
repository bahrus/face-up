# Support Auto Forwarding With Roundabout Merging

---

## Human Ask

I am interested in making it really easy to provide property forwarding to this feature for those who make use of the [roundabout library](https://github.com/bahrus/roundabout).

The *time-ticker* custom element library is such a scenario.  I've copied that project into this folder temporarily for easy inspection.  Note how, in that project, the cef.json file is built from cef.mjs via npm run build for good typescript support with a kiro hook.  Look closely at the "merges" section to see how property forwarding is done.  The roundabout library actually creates the properties automaically from these merges.

Please create an RAConfig.mjs in this project that provides similar property forwarding configuration for all the relevant forwarding, which can then be imported by projects like time-ticker. 

---

## Implementation Notes

### What was created

`RAConfig.mjs` — exports `faceUpMerges` and `props` for consumers using roundabout.

### How it works

In the roundabout pattern, `merges` are reactive rules: when a property on the view model changes (detected via `ifKeyIn`), the `assign` block runs `assignFrom(vm, assign, { from: vm })` — resolving the RHS path against the vm and assigning the result into the LHS path on the vm.

Since `faceUp` is a getter-only property (installed by `assignFeatures`), `assignGingerly` merges into the feature instance. This means the LHS path `?.faceUp?.value` triggers the feature's `value` setter, which calls `setFormValue()` on the internals.

The forwarding properties exposed are:
- `value` → `?.faceUp?.value` — the submittable form value
- `state` → `?.faceUp?.state` — internal state for form restoration
- `disabled` → `?.faceUp?.disabled` — disabled state
- `required` → `?.faceUp?.required` — required constraint
- `validationMessage` → `?.faceUp?.validationMessage` — custom validation error

### Consumer usage (e.g., time-ticker's cef.mjs)

```js
import { faceUpMerges } from 'face-up/RAConfig.mjs';

export const raConfig = {
    propagate: ['value', 'disabled', 'required', /* ...other props */],
    merges: [
        ...faceUpMerges,
        // ...project-specific merges
    ],
    // ...rest of config
};
```

This eliminates the need for consumers to manually write the merge rules for form-associated behavior — they just spread `faceUpMerges` into their config.

### Relationship to time-ticker

In time-ticker's `cef.mjs`, the existing merges forward `duration` and `disabled` to the `timeTicker` feature. With `faceUpMerges`, the time-ticker project could additionally spread these merges to forward `value`, `disabled`, etc. to the `faceUp` feature. The `disabled` merge would forward to both features (roundabout handles this naturally since each merge is independent).

### Note on `hostPropagator`

The time-ticker's `time-ticker-element.js` still passes `hostPropagator` in `getSharedContext` for `faceUp`. Since we've removed the propagator dependency from FaceUp (it now relies purely on property setters + roundabout merges for reactivity), that `hostPropagator` field in `getSharedContext` is no longer needed for `faceUp`. The `getSharedContext` only needs to pass `internals`.
