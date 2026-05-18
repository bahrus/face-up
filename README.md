# face-up

A Custom Element Feature that adds Form Associated behavior to a custom element via the [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) API.

## What it does

`FaceUp` enables any custom element to fully participate in HTML forms — matching the capabilities described in [More Capable Form Controls](https://web.dev/articles/more-capable-form-controls):

- **Form submission** — The control's value is automatically submitted with the form via `setFormValue()`.
- **Form validation** — The control participates in constraint validation with `:valid`/`:invalid` pseudo-classes.
- **Form reset** — The control resets to its default state when the form is reset.
- **Form state restoration** — The browser can restore the control's state after navigation or restart.
- **Disabled state** — The control responds to `disabled` attribute changes on itself or ancestor `<fieldset>`.
- **Label association** — The control can be labeled with `<label>` elements.

## Usage

```js
import 'assign-gingerly/assignFeatures.js';
import { FaceUp } from 'face-up/FaceUp.js';

class MyInput extends HTMLElement {
    #internals;

    static supportedFeatures = {
        faceUp: {
            fallbackSpawn: FaceUp,
            callbackForwarding: [
                'formDisabledCallback',
                'formResetCallback',
                'formStateRestoreCallback'
            ],
            getSharedContext(instance) {
                return {
                    internals: instance.#internals
                };
            }
        }
    };

    constructor() {
        super();
        this.#internals = this.attachInternals();
    }
}

// assignFeatures calls FaceUp.onAssigned which sets static formAssociated = true
await customElements.assignFeatures(MyInput, {
    faceUp: { spawn: FaceUp }
});

customElements.define('my-input', MyInput);
```

That's it. No propagator, no manual callback forwarding, no event wiring.

- `static formAssociated = true` is set automatically by `FaceUp.onAssigned`.
- Form lifecycle callbacks are forwarded automatically via `callbackForwarding`.
- Property changes sync to `ElementInternals` via the feature's setters.

## Setting Values

Because `faceUp` is a getter-only property, `assignGingerly` merges directly into the feature instance. Set properties however you like:

```js
// Direct property access
el.faceUp.value = 'hello';

// Via assignGingerly (merges into the feature instance)
el.assignGingerly({ faceUp: { value: 'hello', required: true } });
```

Both approaches trigger the setter, which calls `setFormValue()` on the internals automatically.

## Validation

Set a custom validation message:

```js
el.faceUp.validationMessage = 'This value is not allowed.';
```

Or use the lower-level `setValidity()` API:

```js
el.faceUp.setValidity({ rangeUnderflow: true }, 'Value must be at least 0.');
```

Clear validation:

```js
el.faceUp.validationMessage = '';
// or
el.faceUp.setValidity({});
```

Built-in `required` validation is automatic — if `required` is `true` and `value` is `null` or `''`, the control is marked invalid with `valueMissing`.

## Form State Restoration

Pass a `state` parameter alongside `value` to enable proper form restoration:

```js
el.faceUp.state = 'palette/#7fff00';
el.faceUp.value = '#7fff00';
```

The `state` is stored internally by the browser and passed back to `formStateRestoreCallback` when the form is restored.

## API

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string \| File \| FormData \| null` | The submittable form value |
| `state` | `string \| File \| FormData \| null` | Internal state for form restoration |
| `disabled` | `boolean` | Whether the control is disabled |
| `required` | `boolean` | Whether the control requires a value |
| `validationMessage` | `string` | Custom validation error message |
| `form` | `HTMLFormElement \| null` | The associated form (read-only) |
| `validity` | `ValidityState \| null` | The validity state (read-only) |
| `willValidate` | `boolean` | Whether the control will be validated (read-only) |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `checkValidity()` | `boolean` | Returns true if the control is valid |
| `reportValidity()` | `boolean` | Shows browser validation UI if invalid |
| `setValidity(flags, message?, anchor?)` | `void` | Sets custom validity flags |

### Form Lifecycle Callbacks (forwarded via `callbackForwarding`)

| Callback | Description |
|----------|-------------|
| `formDisabledCallback(disabled)` | Called when disabled state changes |
| `formResetCallback()` | Called when the form is reset |
| `formStateRestoreCallback(state, mode)` | Called when browser restores form state |

These are forwarded automatically by `assign-gingerly`'s `callbackForwarding` mechanism — the host element does not need to implement them manually.

## How it integrates

The key insight: because `assignFeatures` installs `faceUp` as a **getter-only** property on the prototype, `assignGingerly` automatically merges object values into the existing feature instance rather than replacing it. This means:

1. The feature's setters fire on every property assignment.
2. Each setter syncs to `ElementInternals` immediately.
3. No event bus, no propagator, no intermediate layer — just property access.

```js
// All of these trigger the setter → sync to internals:
el.faceUp.value = 'x';
el.assignGingerly({ faceUp: { value: 'x' } });
```

## Requirements

The host custom element **must**:

1. Call `this.attachInternals()` in its constructor
2. Pass the internals via `getSharedContext` in `supportedFeatures`
3. Include the form lifecycle callbacks in `callbackForwarding`

Both `static formAssociated = true` and form lifecycle callback forwarding are handled automatically — no manual boilerplate needed in the host element.

## Dev

```bash
npm install
npm run serve
# Open http://localhost:8000/tests/test1.html
```
