import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import EpiDescriptive from '/imports/collections/epiDescriptive';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import {
    tabularizeHeader,
    tabularize,
} from '/imports/utilities';

import schema_extension from './schema';
import NtpEpiResult from '/imports/collections/ntpEpiResult';
import NtpEpiConfounder from '/imports/collections/ntpEpiConfounder';
import {
    studyDesignOptions,
    exposureAssessmentTypeOptions,
    ratings,
} from './constants';


let instanceMethods = {
        getReference: function(){
            if (_.isUndefined(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
        getAdditionalReferences: function(){
            if (_.isUndefined(this.additionalReferenceObjects)){
                this.additionalReferenceObjects = Reference
                    .find({_id: {$in: this.additionalReferences}})
                    .fetch();
            }
            return this.additionalReferenceObjects;
        },
        getResults: function(){
            if (_.isUndefined(this.results)){
                this.results = NtpEpiResult
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.results;
        },
        getConfounders: function(result){
            if (_.isUndefined(this.confounders)){
                this.confounders = NtpEpiConfounder
                        .find({parent_id: this._id}, {sort: {sortIdx: 1}})
                        .fetch();
            }
            return this.confounders;
        },
        setResultConfounder: function(result){
            result.confounder = _.findWhere(
                this.getConfounders(),
                {organSiteCategory: result.organSiteCategory}
            );
        },
        isCaseControl: function(){
            return EpiDescriptive.isCaseControl(this.studyDesign);
        },
        setWordFields: function() {
            this.getConfounders();
            _.extend(this, {
                reference: Reference.findOne({_id: this.referenceID}),
                isCaseControl: this.isCaseControl(),
                wrd_notes: this.notes || '',
                biasFields: NtpEpiDescriptive.biasFields(),
            });
        },
        tabularRows: function(){
            this.getReference();
            this.getResults();

            let desc = tabularize(this, schema_extension,
                                  NtpEpiDescriptive.tabularOmissions,
                                  NtpEpiDescriptive.tabularOverrides);

            let rows = this.results.map((d)=>{
                return d.tabularRows().map((resRow)=>{
                    let row = desc.slice();  // shallow-copy
                    row.push.apply(row, resRow);
                    return row;
                });
            });

            return _.flatten(rows, true);
        },
    },
    classMethods = {
        studyDesignOptions,
        exposureAssessmentTypeOptions,
        ratings,
        sortFields: {
            'Reference':    'sortReference',
        },
        biasFields: function(){
            return {
                selectionBias: ['selectionBiasRating', 'selectionBiasDirection', 'selectionBiasRationale'],
                exposureAssessment: ['exposureAssessmentRating', 'exposureAssessmentDirection', 'exposureAssessmentRationale'],
                outcomeAssessment: ['outcomeAssessmentRating', 'outcomeAssessmentDirection', 'outcomeAssessmentRationale'],
                sensitivity: ['sensitivityRating', 'sensitivityDirection', 'sensitivityRatingRationale'],
                confounding: ['organSiteCategory', 'confoundingRating', 'confoundingDirection', 'confoundingRatingRationale'],
                analysis: ['analysisRating', 'analysisDirection', 'analysisRationale'],
                selectiveReporting: ['selectiveReportingRating', 'selectiveReportingDirection', 'selectiveReportingRationale'],
            };
        },
        sortReference:  collSorts.sortByReference,
        getTableEvidence: function(tbl_id){
            return NtpEpiDescriptive
                .find({tbl_id: tbl_id}, {sort: {sortIdx: 1}})
                .fetch();
        },
        tabularOmissions: [],
        tabularOverrides: {
            referenceID(d){
                return d.reference.name;
            },
            additionalReferences(d){
                return d.getAdditionalReferences().map((d) => d.name).join(', ');
            },
        },
        worksheetLabels: [
            'studyDesign',
            'location',
            'enrollmentDates',
        ],
        getTabularHeader(){
            let header = tabularizeHeader(
                schema_extension, 'Description ID', NtpEpiDescriptive.tabularOmissions);
            header.push.apply(header, NtpEpiResult.tabularHeader());
            return header;
        },
        tabular: function(tbl_id) {
            let header = NtpEpiDescriptive.getTabularHeader(),
                rows = _.chain(NtpEpiDescriptive.getTableEvidence(tbl_id))
                    .map((d) => d.tabularRows())
                    .flatten(true)
                    .value();

            rows.unshift(header);
            return rows;
        },
        tablularMetaAnalysisRow: function(d){
            d.desc.getReference();
            return [
                d.desc.reference.name, d.desc.reference.getYear(), d.desc.reference.pubmedID,
                d.desc.studyDesign, d.desc.location,  d.desc.enrollmentDates,
                d.res.organSiteCategory, d.res.organSite, d.res.effectMeasure,
                d.res.effectUnits, '-',
                d.exposureCategory, d.numberExposed,
                d.riskLow, d.riskMid, d.riskHigh,
            ];
        },
        wordContext: function(tbl_ids){
            var tables = Tables.find({_id: {$in: tbl_ids}}).fetch(),
                allDescs = NtpEpiDescriptive.find({tbl_id: {$in: tbl_ids}, isHidden: false}).fetch();

            allDescs.forEach((d)=> d.setWordFields() );

            return {
                tables: tables,
                descriptions: allDescs,
            };
        },
        wordContextWithResults: function(tbl_ids){
            var tables = Tables.find({_id: {$in: tbl_ids}}).fetch(),
                allDescs = NtpEpiDescriptive.find({tbl_id: {$in: tbl_ids}, isHidden: false}).fetch(),
                allResults = NtpEpiResult.find({tbl_id: {$in: tbl_ids}, isHidden: false}).fetch(),
                sites = _.uniq(_.pluck(allResults, 'organSiteCategory'), false),
                organSites;

            allDescs.forEach((d)=> d.setWordFields() );

            allResults = _.chain(allResults)
                .each((d)=>{
                    d.setWordFields();
                    d.descriptive = _.findWhere(allDescs, {_id: d.parent_id});
                })
                .reject((d) => d.descriptive === undefined)
                .value();

            organSites = _.map(sites, function(site){
                return {
                    'organSite': site,
                    'results': _.where(allResults, {organSiteCategory: site}),
                };
            });

            return {
                tables: tables,
                'organSites': organSites,
            };
        },
        wordReportFormats: [
            {
                type: 'NtpEpiResultTables',
                fn: 'epi-results',
                text: 'Download Word (results)',
            },
            {
                type: 'NtpEpiBiasTables',
                fn: 'epi-bias',
                text: 'Download Word (potential bias)',
            },
        ],
    },
    NtpEpiDescriptive = new Meteor.Collection('ntpEpiDescriptive', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpEpiDescriptive, classMethods);
attachTableSchema(NtpEpiDescriptive, schema_extension);

export default NtpEpiDescriptive;
