import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import {
    studyDesigns,
    sexes,
    ratings,
    biasDirection,
    biasDirectionPopoverText,
    ratingRationalePopoverText,
} from './constants';


export default {
    // #1: General information
    referenceID: {
        label: 'Reference',
        type: SimpleSchema.RegEx.Id,
    },
    additionalReferences: {
        label: 'References',
        type: [SimpleSchema.RegEx.Id],
        minCount: 0,
        popoverText: 'References of earlier updates or related publications',
    },
    studyDesign: {
        label: 'Data class',
        type: String,
        allowedValues: studyDesigns,
        popoverText: 'As reported',
    },
    // #2: Study design
    species: {
        label: 'Species',
        type: String,
        optional: true,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalSpecies',
        placeholderText: 'Mouse, Rat, Hamster',
        biasSummary: 'Reference',
    },
    strain: {
        label: 'Strain',
        type: String,
        optional: true,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalStrain',
        placeholderText: 'B6C3F1, F344',
    },

    sex: {
        label: 'Sex',
        type: String,
        allowedValues: sexes,
        popoverText: 'As reported',
        biasSummary: 'Reference',
    },
    ageAtStart: {
        label: 'Age at start',
        type: String,
        optional: true,
        popoverText: 'Age at start of exposure',
        placeholderText: '6-8 wk old, 2 mo old, newborn',
    },
    duration: {
        label: 'Duration',
        type: String,
        optional: true,
        popoverText: 'Exposure duration including additional observation time (if any)',
        placeholderText: '110 wk, 24 mo, lifetime',
    },
    historicalDataAvailable: {
        label: 'Historical data available?',
        type: Boolean,
        popoverText: 'Is historical data for this species and strain available in this publication or another?',
    },
    transgenicModel: {
        label: 'Transgenic model?',
        type: Boolean,
        popoverText: 'Was a transgenic animal model used?',
    },

    randomizationRating: {
        label: 'Bias rating',
        labelHdr: 'Randomization bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Study Design',
    },
    randomizationDirection:{
        label: 'Bias direction',
        labelHdr: 'Randomization bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    randomizationRationale: {
        label: 'Bias rationale',
        labelHdr: 'Randomization bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    concurrentControlsRating: {
        label: 'Bias rating',
        labelHdr: 'Concurrent controls bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Study Design',
    },
    concurrentControlsDirection:{
        label: 'Bias direction',
        labelHdr: 'Concurrent controls bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    concurrentControlsRationale: {
        label: 'Bias rationale',
        labelHdr: 'Concurrent controls bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },

    animalModelSensitivityRating: {
        label: 'Bias rating',
        labelHdr: 'Animal model sensitivity bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Study Design',
    },
    animalModelSensitivityDirection:{
        label: 'Bias direction',
        labelHdr: 'Animal model sensitivity bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    animalModelSensitivityRationale: {
        label: 'Bias rationale',
        labelHdr: 'Animal model sensitivity bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    statisticalPowerRating: {
        label: 'Bias rating',
        labelHdr: 'Statistical power bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Study Design',
    },
    statisticalPowerDirection:{
        label: 'Bias direction',
        labelHdr: 'Statistical power bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    statisticalPowerRationale: {
        label: 'Bias rationale',
        labelHdr: 'Statistical power bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    // #3: Exposure
    agent: {
        label: 'Agent',
        type: String,
        optional: true,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalAgent',
        placeholderText: 'Trichloroethylene, Asbestos',
    },
    dosingRoute: {
        label: 'Dosing route',
        type: String,
        optional: true,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalDosingRoute',
        placeholderText: 'Gavage, feed, i.p.',
    },
    purity: {
        label: 'Purity',
        type: String,
        optional: true,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalPurity',
        placeholderText: '>99.9%, technical grade',
    },
    vehicle: {
        label: 'Vehicle',
        type: String,
        optional: true,
        popoverText: 'As reported',
        typeaheadMethod: 'searchNtpAnimalVehicle',
        placeholderText: 'distilled water, PBS, saline, air',
    },
    dosingRegimen: {
        label: 'Dosing regimen',
        type: String,
        optional: true,
        popoverText: 'Dosing regimen of the agent tested, and (if any) information on any co-exposure or modifying factors (e.g., NDEA, TPA, Aflatoxin B1, UV) including route, concentration and dosing regimen',
        placeholderText: '2x/d for 103 wk; 2x/wk for 20 mo',
        textAreaRows: 2,
    },

    chemicalCharacterizationRating: {
        label: 'Bias rating',
        labelHdr: 'Chemical characterization bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Exposure',
    },
    chemicalCharacterizationDirection:{
        label: 'Bias direction',
        labelHdr: 'Chemical characterization bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    chemicalCharacterizationRationale: {
        label: 'Bias rationale',
        labelHdr: 'Chemical characterization bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    dosingRegimenRating: {
        label: 'Bias rating',
        labelHdr: 'Dosing regimen bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Exposure',
    },
    dosingRegimenDirection:{
        label: 'Bias direction',
        labelHdr: 'Dosing regimen bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    dosingRegimenRationale: {
        label: 'Bias rationale',
        labelHdr: 'Dosing regimen bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },

    exposureDurationRating: {
        label: 'Bias rating',
        labelHdr: 'Exposure duration bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Exposure',
    },
    exposureDurationDirection:{
        label: 'Bias direction',
        labelHdr: 'Exposure duration bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    exposureDurationRationale: {
        label: 'Bias rationale',
        labelHdr: 'Exposure duration bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    doseResponseRating: {
        label: 'Bias rating',
        labelHdr: 'Dose/response sensitivity bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Exposure',
    },
    doseResponseDirection:{
        label: 'Bias direction',
        labelHdr: 'Dose/response sensitivity bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    doseResponseRationale: {
        label: 'Bias rationale',
        labelHdr: 'Dose/response sensitivity bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    // #4: Outcome
    outcomeMethods: {
        label: 'Outcome methods',
        type: String,
        optional: true,
        textAreaRows: 4,
        popoverText: 'Diagnostic procedures used; extent of necropsy tissue evaluation',
    },
    outcomeMethodsRating: {
        label: 'Bias rating',
        labelHdr: 'Outcome methodology bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Outcome',
    },
    outcomeMethodsDirection:{
        label: 'Bias direction',
        labelHdr: 'Outcome methodology bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    outcomeMethodsRationale: {
        label: 'Bias rationale',
        labelHdr: 'Outcome methodology bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },

    groupConsistencyRating: {
        label: 'Bias rating',
        labelHdr: 'Group methodology consistency bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Outcome',
    },
    groupConsistencyDirection:{
        label: 'Bias direction',
        labelHdr: 'Group methodology consistency bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    groupConsistencyRationale: {
        label: 'Bias rationale',
        labelHdr: 'Group methodology consistency bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    durationRating: {
        label: 'Bias rating',
        labelHdr: 'Adequacy of study duration bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Outcome',
    },
    durationDirection:{
        label: 'Bias direction',
        labelHdr: 'Adequacy of study duration bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    durationRationale: {
        label: 'Bias rationale',
        labelHdr: 'Adequacy of study duration bias rationale',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    // #5: Confounding
    vehicleToxicity: {
        label: 'Vehicle toxicity issues',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: 'Potential carcinogenic or mutagenic contaminants or vehicle concerns',
    },
    animalHusbandry: {
        label: 'Animal husbandry issues',
        type: String,
        optional: true,
        textAreaRows: 2,
        popoverText: 'Monitoring for parasites, disease, or housing conditions',
    },
    confoundingRating: {
        label: 'Bias rating',
        labelHdr: 'Confounding bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Confounding',
    },
    confoundingDirection:{
        label: 'Bias direction',
        labelHdr: 'Confounding bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    confoundingRationale: {
        label: 'Bias rationale',
        labelHdr: 'Confounding bias rationale',
        type: String,
        optional: true,
        textAreaRows: 3,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    // #6: Analysis and reporting
    statisticalReporting: {
        label: 'Data and statistical reporting',
        type: String,
        optional: true,
        textAreaRows: 4,
        popoverText: 'Notes on methodology or reporting of data and statistical analyses.',
    },
    statisticalReportingRating: {
        label: 'Bias rating',
        labelHdr: 'Reporting and statistics bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Analysis and reporting',
    },
    statisticalReportingDirection:{
        label: 'Bias direction',
        labelHdr: 'Reporting and statistics bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    statisticalReportingRationale: {
        label: 'Bias rationale',
        labelHdr: 'Reporting and statistics bias rationale',
        type: String,
        optional: true,
        textAreaRows: 3,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    tumorCombiningRating: {
        label: 'Bias rating',
        labelHdr: 'Tumor combining bias rating',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Analysis and reporting',
    },
    tumorCombiningDirection:{
        label: 'Bias direction',
        labelHdr: 'Tumor combining bias direction',
        type: String,
        allowedValues: biasDirection,
        popoverText: biasDirectionPopoverText,
        biasField: true,
    },
    tumorCombiningRationale: {
        label: 'Bias rationale',
        labelHdr: 'Tumor combining bias rationale',
        type: String,
        optional: true,
        textAreaRows: 3,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
    // #7: Study judgment
    strengths: {
        label: 'Principal strengths',
        type: String,
        optional: true,
        popoverText: 'e.g., GLP study, multiple doses tested, high number of animals per group',
        textAreaRows: 4,
        biasField: true,
    },
    limitations: {
        label: 'Principal limitations',
        type: String,
        optional: true,
        popoverText: 'e.g., inadequate duration, no controls, small number of animals per group, inadequate reporting of exposure or results, high mortality, MTD not reached',
        textAreaRows: 4,
        biasField: true,
    },
    overallUtility: {
        label: 'Overall utility',
        type: String,
        allowedValues: ratings,
        popoverText: ratingRationalePopoverText,
        biasField: true,
        biasSummary: 'Study judgement',
    },
    overallUtilityRationale: {
        label: 'Overall utility rationale',
        type: String,
        optional: true,
        textAreaRows: 3,
        popoverText: ratingRationalePopoverText,
        biasField: true,
    },
};
