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
    static formAssociated = true;

    propagator = new EventTarget();
    #internals;

    static supportedFeatures = {
        faceUp: {
            fallbackSpawn: FaceUp,
            callbackForwarding: ['connectedCallback', 'disconnectedCallback'],
            getSharedContext(instance) {
                return {
                    internals: instance.#internals,
                    hostPropagator: instance.propagator
                };
            }
        }
    };

    constructor() {
        super();
        this.#internals = this.attachInternals();
    }

    // Forward form lifecycle callbacks to the feature
    formDisabledCallback(disabled) {
        this.faceUp.formDisabledCallback(disabled);
    }

    formResetCallback() {
        this.faceUp.formResetCallback();
    }

    formStateRestoreCallback(state, mode) {
        this.faceUp.formStateRestoreCallback(state, mode);
    }
}

customElements.assignFeatures(MyInput, {
    faceUp: { spawn: FaceUp }
});

customElements.define('my-input', MyInput);
```

## Setting Values

Dispatch events on the host's `propagator` to update the form value:

```js
// From within the custom element:
this.propagator.dispatchEvent(
    new CustomEvent('value', { detail: 'new value' })
);
```

Or set the value directly on the feature instance:

```js
el.faceUp.value = 'new value';
```

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

### Form Lifecycle Methods

| Method | Description |
|--------|-------------|
| `formDisabledCallback(disabled)` | Called when disabled state changes |
| `formResetCallback()` | Called when the form is reset |
| `formStateRestoreCallback(state, mode)` | Called when browser restores form state |

## Requirements

The host custom element **must**:

1. Set `static formAssociated = true`
2. Call `this.attachInternals()` in its constructor
3. Pass the internals via `getSharedContext` in `supportedFeatures`
4. Forward form lifecycle callbacks to the feature

## Dev

```bash
npm install
npm run serve
# Open http://localhost:8000/tests/test1.html
```
