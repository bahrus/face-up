// @ts-check
/** @import {Merges} from './types/roundabout/types.d.ts' */
/** @import {AttrPatterns} from './types/assign-gingerly/types.d.ts' */
/** @import {FaceUpProps} from './types/face-up/types.js' */

/**
 * Property key constants for FaceUp-relevant forwarding.
 * @type {{ [K in keyof FaceUpProps]: K }}
 */
export const props = {
    value: 'value',
    state: 'state',
    disabled: 'disabled',
    required: 'required',
    validationMessage: 'validationMessage',
    name: 'name',
};

/**
 * Creates merges configuration for forwarding properties from the host view model
 * to the faceUp feature instance via roundabout's reactive system.
 *
 * When any of these properties change on the view model, the corresponding
 * setter on the feature fires, which syncs to ElementInternals automatically.
 *
 * @param {string} [featureKey='faceUp'] - The feature property name on the host element.
 * @returns {Merges<FaceUpProps>}
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
 * @type {Merges<FaceUpProps>}
 */
export const faceUpMerges = getFaceUpMerges();

/**
 * Attribute patterns for parsing form-associated attributes into initVals.
 * All are marked `sourceOfTruth: true` so truth-sourcer can sync them back
 * to attributes, and each specifies `valIfNull` for proper defaults.
 *
 * @type {AttrPatterns<FaceUpProps>}
 *
 * @example
 * ```js
 * import { faceUpWithAttrs } from 'face-up/RAConfig.mjs';
 *
 * export const cef = {
 *     features: {
 *         roundabout: {
 *             withAttrs: {
 *                 ...faceUpWithAttrs,
 *                 // ...your other attrs
 *             }
 *         }
 *     }
 * };
 * ```
 */
export const faceUpWithAttrs = {
    [props.value]: props.value,
    [`_${props.value}`]: {
        sourceOfTruth: true,
        valIfNull: null,
    },
    [props.disabled]: props.disabled,
    [`_${props.disabled}`]: {
        sourceOfTruth: true,
        instanceOf: Boolean,
        valIfNull: false,
    },
    [props.required]: props.required,
    [`_${props.required}`]: {
        sourceOfTruth: true,
        instanceOf: Boolean,
        valIfNull: false,
    },
    [props.validationMessage]: 'validation-message',
    [`_${props.validationMessage}`]: {
        sourceOfTruth: true,
        valIfNull: '',
    },
    [props.name]: props.name,
    [`_${props.name}`]: {
        sourceOfTruth: true,
        valIfNull: '',
    }
};
