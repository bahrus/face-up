// @ts-check
/** @import {FaceUpProps, AllProps, FeatureSpawnContext, FaceUpSharedContext, ValidationFlags} from './types/face-up/types' */

/**
 * FaceUp — A Custom Element Feature that adds Form Associated behavior
 * to a custom element via the ElementInternals API.
 *
 * This feature enables a custom element to:
 * - Participate in form submission (setFormValue)
 * - Participate in form validation (setValidity)
 * - Respond to form lifecycle callbacks (reset, restore, disabled state)
 * - Be styled with :valid/:invalid/:disabled pseudo-classes
 * - Be labeled with <label> elements
 *
 * The host custom element MUST:
 * - Call `this.attachInternals()` and pass the result via getSharedContext
 *
 * `static formAssociated = true` is set automatically via `static onAssigned`.
 *
 * @implements {FaceUpProps}
 */
class FaceUp {

    /**
     * Called once by assignFeatures after registration.
     * Sets `static formAssociated = true` on the host constructor so the
     * consumer doesn't need to declare it manually.
     * @param {Function} ctr - The custom element constructor
     * @param {object} _featureConfig - The feature config (unused)
     */
    static onAssigned(ctr, _featureConfig) {
        if (!ctr.formAssociated) {
            ctr.formAssociated = true;
        }
    }
    /** @type {WeakRef<HTMLElement> | undefined} */
    #hostRef;

    /** @type {ElementInternals | undefined} */
    #internals;

    /** @type {AbortController | undefined} */
    #abortController;

    /** @type {EventTarget | undefined} */
    #hostPropagator;

    /** @type {boolean} */
    #hasDisconnected = false;

    /** @type {string | File | FormData | null} */
    #value = null;

    /** @type {string | File | FormData | null} */
    #state = null;

    /** @type {boolean} */
    #disabled = false;

    /** @type {boolean} */
    #required = false;

    /** @type {string} */
    #validationMessage = '';

    /**
     * @param {HTMLElement} hostElement
     * @param {FeatureSpawnContext} ctx
     * @param {Partial<FaceUpProps>} [initVals]
     */
    constructor(hostElement, ctx, initVals) {
        this.#hostRef = new WeakRef(hostElement);
        if (ctx.shared) {
            this.#internals = ctx.shared.internals;
            this.#hostPropagator = ctx.shared.hostPropagator;
        }
        if (initVals) {
            if (initVals.value !== undefined) this.#value = initVals.value;
            if (initVals.state !== undefined) this.#state = initVals.state;
            if (initVals.disabled !== undefined) this.#disabled = initVals.disabled;
            if (initVals.required !== undefined) this.#required = initVals.required;
            if (initVals.validationMessage !== undefined) this.#validationMessage = initVals.validationMessage;
            if (initVals.hostPropagator !== undefined) this.#hostPropagator = initVals.hostPropagator;
        }
        this.#connect();
    }

    // ─── Public Properties ───────────────────────────────────────────

    get value() { return this.#value; }
    set value(v) {
        this.#value = v;
        this.#syncFormValue();
        this.#validateInternal();
    }

    get state() { return this.#state; }
    set state(v) {
        this.#state = v;
        this.#syncFormValue();
    }

    get disabled() { return this.#disabled; }
    set disabled(v) {
        this.#disabled = !!v;
    }

    get required() { return this.#required; }
    set required(v) {
        this.#required = !!v;
        this.#validateInternal();
    }

    get validationMessage() { return this.#validationMessage; }
    set validationMessage(msg) {
        this.#validationMessage = msg;
        this.#validateInternal();
    }

    get hostPropagator() { return this.#hostPropagator ?? null; }
    set hostPropagator(v) {
        this.#hostPropagator = v ?? undefined;
        this.#reconnectListeners();
    }

    // ─── Read-only Form Control Accessors ────────────────────────────

    /** The form element the host is associated with */
    get form() { return this.#internals?.form ?? null; }

    /** The ValidityState of the control */
    get validity() { return this.#internals?.validity ?? null; }

    /** Whether the control will be validated */
    get willValidate() { return this.#internals?.willValidate ?? false; }

    // ─── Form Control Methods ────────────────────────────────────────

    /** Runs constraint validation and returns true if valid */
    checkValidity() {
        return this.#internals?.checkValidity() ?? true;
    }

    /** Runs constraint validation and shows the browser validation UI if invalid */
    reportValidity() {
        return this.#internals?.reportValidity() ?? true;
    }

    /**
     * Sets custom validity flags and message on the control.
     * @param {ValidationFlags} flags - ValidityStateFlags object
     * @param {string} [message] - Validation message (required if any flag is true)
     * @param {HTMLElement} [anchor] - Element to anchor the validation popup to
     */
    setValidity(flags, message, anchor) {
        if (!this.#internals) return;
        if (message) {
            this.#internals.setValidity(flags, message, anchor);
        } else {
            // Clear validity — no flags set
            this.#internals.setValidity({});
        }
    }

    // ─── Form Lifecycle Callbacks (forwarded via callbackForwarding) ─

    /**
     * Called when the host element's disabled state changes.
     * @param {boolean} isDisabled
     */
    formDisabledCallback(isDisabled) {
        this.#disabled = isDisabled;
    }

    /**
     * Called when the form is reset.
     * Resets value and state to null and clears validation.
     */
    formResetCallback() {
        this.#value = null;
        this.#state = null;
        this.#validationMessage = '';
        this.#syncFormValue();
        if (this.#internals) {
            this.#internals.setValidity({});
        }
    }

    /**
     * Called when the browser restores form state (navigation, restart)
     * or when autofill sets a value.
     * @param {string | File | FormData | null} state
     * @param {'restore' | 'autocomplete'} mode
     */
    formStateRestoreCallback(state, mode) {
        if (mode === 'restore') {
            this.#state = state;
            this.#value = state;
            this.#syncFormValue();
        }
    }

    // ─── Lifecycle (callbackForwarding) ──────────────────────────────

    connectedCallback() {
        if (this.#hasDisconnected) {
            this.#hasDisconnected = false;
            this.#connect();
        }
    }

    disconnectedCallback() {
        this.#hasDisconnected = true;
        this.#cleanup();
    }

    // ─── Private Methods ─────────────────────────────────────────────

    #connect() {
        this.#abortController = new AbortController();
        const signal = this.#abortController.signal;

        // Listen for value/state/required changes from the host propagator
        if (this.#hostPropagator) {
            this.#hostPropagator.addEventListener('value', (/** @type {CustomEvent} */ e) => {
                this.#value = e.detail?.value ?? e.detail;
                this.#syncFormValue();
                this.#validateInternal();
            }, { signal });

            this.#hostPropagator.addEventListener('state', (/** @type {CustomEvent} */ e) => {
                this.#state = e.detail?.value ?? e.detail;
                this.#syncFormValue();
            }, { signal });

            this.#hostPropagator.addEventListener('required', (/** @type {CustomEvent} */ e) => {
                this.#required = !!(e.detail?.value ?? e.detail);
                this.#validateInternal();
            }, { signal });

            this.#hostPropagator.addEventListener('disabled', (/** @type {CustomEvent} */ e) => {
                this.#disabled = !!(e.detail?.value ?? e.detail);
            }, { signal });
        }

        // Sync initial value if already set
        this.#syncFormValue();
        this.#validateInternal();
    }

    #cleanup() {
        if (this.#abortController) {
            this.#abortController.abort();
            this.#abortController = undefined;
        }
    }

    #reconnectListeners() {
        this.#cleanup();
        if (!this.#hasDisconnected) {
            this.#connect();
        }
    }

    /**
     * Syncs the current value (and optional state) to ElementInternals.
     */
    #syncFormValue() {
        if (!this.#internals) return;
        if (this.#value === null) {
            this.#internals.setFormValue(null);
        } else if (this.#state !== null) {
            this.#internals.setFormValue(this.#value, this.#state);
        } else {
            this.#internals.setFormValue(this.#value);
        }
    }

    /**
     * Runs internal validation based on required + custom validation message.
     */
    #validateInternal() {
        if (!this.#internals) return;
        const host = this.#hostRef?.deref();
        if (!host) return;

        if (this.#validationMessage) {
            this.#internals.setValidity(
                { customError: true },
                this.#validationMessage,
                host
            );
        } else if (this.#required && (this.#value === null || this.#value === '')) {
            this.#internals.setValidity(
                { valueMissing: true },
                'Please fill out this field.',
                host
            );
        } else {
            this.#internals.setValidity({});
        }
    }
}

export { FaceUp };
