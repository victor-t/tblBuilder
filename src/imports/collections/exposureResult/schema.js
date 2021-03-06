import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import {
    samplingApproaches,
    exposureLevelDescriptions,
} from './constants';


export default {
    parent_id: {
        type: SimpleSchema.RegEx.Id,
        denyUpdate: true,
    },

    // row #1
    agent: {
        label: 'Agent',
        type: String,
        min: 1,
        popoverText: 'The substance or exposure that was measured (e.g., PM-10, TCE, Total PCB)',
        typeaheadMethod: 'searchAgents',
        placeholderText: 'e.g. PM-10',
    },
    samplingMatrix: {
        label: 'Sampling matrix',
        type: String,
        min: 1,
        popoverText: 'The environmental medium or other matrix (e.g., air, drinking water, food, urine, blood) in which the agent was measured',
        typeaheadMethod: 'searchSamplingMatrices',
        placeholderText: 'e.g. air',
    },
    samplingApproach: {
        label: 'Sampling approach',
        type: String,
        allowedValues: samplingApproaches,
        popoverText: 'Approach used to collect samples',
    },
    numberMeasurements: {
        label: 'Number of measurements',
        type: String,
        min: 1,
        popoverText: 'Typically the number of samples for environmental sampling, or the number of individuals sampled if personal sampling (if >1 measurement/person, give total measurements and explain in the comment-box)',
        placeholderText: 'e.g. 3',
    },
    measurementDuration: {
        label: 'Measurement duration',
        type: String,
        min: 1,
        popoverText: 'Mean or range; NR if not reported; NA if not applicable',
        placeholderText: 'e.g. NR',
    },

    // row #2
    exposureLevel: {
        label: 'Mean or median exposure-level',
        type: String,
        min: 1,
        popoverText: 'Quantitative level or NR if not reported. Geometric mean preferred if available.',
        placeholderText: 'e.g. 12.35',
    },
    exposureLevelDescription: {
        label: 'Description of exposure-level',
        type: String,
        allowedValues: exposureLevelDescriptions,
        popoverText: 'Statistic used to describe exposure-level',
    },
    exposureLevelRange: {
        label: 'Range of exposure-level',
        type: String,
        min: 1,
        popoverText: 'Minimum and maximum or NR if not reported. Optionally if range not reported the standard-deviation or other measure of variability relative to the mean. (e.g., 32.3-40.2, NR, 13.2 SD, 14.7 SE)',
        placeholderText: 'e.g. 32.3-40.2',
    },
    units: {
        label: 'Units',
        type: String,
        min: 1,
        popoverText: 'Measurement units (e.g. µg/m³, g/m²)',
        placeholderText: 'e.g. µg/m³',
        typeaheadMethod: 'searchExposureUnits',
    },
};
