import {Meteor} from 'meteor/meteor';

import _ from 'underscore';

import Reference from '/imports/api/shared/reference';
import EpiDescriptive from '/imports/api/shared/epiDescriptive';

import collSorts from '../sorts';
import { attachTableSchema } from '../schemas';

import schema_extension from './schema';
import {
    studyDesignOptions,
    exposureAssessmentTypeOptions,
    ratings,
} from './constants';


var instanceMethods = {
        getReference: function(){
            if (_.isEmpty(this.reference)){
                this.reference = Reference.findOne(this.referenceID);
            }
            return this.reference;
        },
        isCaseControl: function(){
            return EpiDescriptive.isCaseControl(this.studyDesign);
        },
    },
    classMethods = {
        studyDesignOptions,
        exposureAssessmentTypeOptions,
        ratings,
        sortFields: {
            'Reference':    'sortReference',
        },
        sortReference:  collSorts.sortByReference,
    },
    NtpEpiDescriptive = new Meteor.Collection('ntpEpiDescriptive', {
        transform: function (doc) {
            return  _.extend(Object.create(instanceMethods), doc);
        },
    });


_.extend(NtpEpiDescriptive, classMethods);
attachTableSchema(NtpEpiDescriptive, schema_extension);

export default NtpEpiDescriptive;
