// @ts-check
/** @import {FaceUpProps} from './types/face-up/types' */

/**
 * Property key constants for FaceUp-relevant forwarding.
 * @type {{ [K in keyof FaceUpProps]: K }}
 */
const props = {
    value: 'value',
    state: 'state',
    disabled: 'disabled',
    required: 'required',
    validationMessage: 'validationMessage',
    name: 'name',
};

/**
 * Integrates FaceUp with the roundabout feature by suggesting
 * merge rules and withAttrs configuration.
 *
 * @param {typeof import('./FaceUp.js').FaceUp} FaceUpClass
 * @param {string} key - The feature key (e.g., 'faceUp')
 * @param {typeof HTMLElement} ctr - The host custom element constructor
 */
export async function integrateWithRoundabout(FaceUpClass, key, ctr) {
    const { id } = await import('roundabout-lib/roundaboutFeature.js');
    const { suggestFeatureInfo } = await import('assign-gingerly/assignFeatures.js');

    suggestFeatureInfo(FaceUpClass, id, {
        customData: {
            '?.raConfig?.propagate +=': ['name'],
            '?.raConfig?.merges +=': [
                {
                    ifKeyIn: [props.value],
                    assign: {
                        [`?.${key}?.value`]: '?.value'
                    }
                },
                {
                    ifKeyIn: [props.state],
                    assign: {
                        [`?.${key}?.state`]: '?.state'
                    }
                },
                {
                    ifKeyIn: [props.disabled],
                    assign: {
                        [`?.${key}?.disabled`]: '?.disabled'
                    }
                },
                {
                    ifKeyIn: [props.required],
                    assign: {
                        [`?.${key}?.required`]: '?.required'
                    }
                },
                {
                    ifKeyIn: [props.validationMessage],
                    assign: {
                        [`?.${key}?.validationMessage`]: '?.validationMessage'
                    }
                },
            ]
        },
        withAttrs: {
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
            }
        }
    }, ctr);
}
