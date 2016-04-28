import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { vocConfoundingChoices } from './constants';


export default new SimpleSchema({
    vocName: {
        type: String,
        label: 'Variable',
        popoverText: 'Based on review of information, identify variables that may be a potential confounder/endpoint specific.',
        typeaheadMethod: 'searchNtpEpiVariablesOfConcern',
    },
    vocAddressedInStats: {
        type: String,
        label: 'Addressed in stats?',
        allowedValues: vocConfoundingChoices,
        popoverText: '<add>',
    },
    vocSimilarAcrossGroups: {
        type: String,
        label: 'Similar across groups?',
        allowedValues: vocConfoundingChoices,
        popoverText: '<add>',
    },
    vocCoexposuresAssociated: {
        type: String,
        label: 'Co-exposures associated?',
        optional: true,
        textAreaRows: 3,
        popoverText: 'Is there sufficient or limited evidence from authoritative reviews or studies finding a positive association',
    },
    vocOtherInformation: {
        type: String,
        label: 'Other information',
        optional: true,
        textAreaRows: 3,
        popoverText: 'See RoC handbook/protocol for candidate substance',
    },
    vocStrengthOfAssociation: {
        type: String,
        label: 'Strength of association',
        textAreaRows: 3,
        popoverText: 'Include the EE or E/R data for the candidate substance and endpoint found in the study.',
    },
    vocRuleOutConfounding: {
        type: String,
        label: 'Rule out confounding?',
        textAreaRows: 3,
        popoverText: 'Make a scientific judgment on whether the confounder can be reasonably ruled-out and provide rationale',
    },
});
