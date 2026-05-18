// @ts-check
/** @import {Merges} from './types/roundabout/types.d.ts' */

/**
 * @typedef {object} FaceUpForwardingProps
 * @property {string | File | FormData | null} value
 * @property {string | File | FormData | null} state
 * @property {boolean} disabled
 * @property {boolean} required
 * @property {string} validationMessage
 */

/**
 * Property key constants for FaceUp-relevant forwarding.
 * @type {{ [K in keyof FaceUpForwardingProps]: K }}
 */
export const props = {
    value: 'value',
    state: 'state',
    disabled: 'disabled',
    required: 'required',
    validationMessage: 'validationMessage',
};

/**
 * Creates merges configuration for forwarding properties from the host view model
 * to the faceUp feature instance via roundabout's reactive system.
 *
 * When any of these properties change on the view model, the corresponding
 * setter on the feature fires, which syncs to ElementInternals automatically.
 *
 * @param {string} [featureKey='faceUp'] - The feature property name on the host element.
 * @returns {Merges<FaceUpForwardingProps>}
 *
 * @example
 * ```js
 * import { getFaceUpMerges } from 'face-up/RAConfig.mjs';
 *
 * export const raConfig = {
 *     merges: [
 *         ...getFaceUpMerges(),          // uses default 'faceUp' key
 *         // ...or with a custom key:
 *         // ...getFaceUpMerges('formControl'),
 *     ]
 * };
 * ```
 */
export function getFaceUpMerges(featureKey = 'faceUp') {
    return [
        {
            ifKeyIn: [props.value],
            assign: {
                [`?.${featureKey}?.value`]: '?.value'
            }
        },
        {
            ifKeyIn: [props.state],
            assign: {
                [`?.${featureKey}?.state`]: '?.state'
            }
        },
        {
            ifKeyIn: [props.disabled],
            assign: {
                [`?.${featureKey}?.disabled`]: '?.disabled'
            }
        },
        {
            ifKeyIn: [props.required],
            assign: {
                [`?.${featureKey}?.required`]: '?.required'
            }
        },
        {
            ifKeyIn: [props.validationMessage],
            assign: {
                [`?.${featureKey}?.validationMessage`]: '?.validationMessage'
            }
        },
    ];
}

/**
 * Pre-built merges using the default 'faceUp' feature key.
 * Convenience export for the common case.
 * @type {Merges<FaceUpForwardingProps>}
 */
export const faceUpMerges = getFaceUpMerges();
