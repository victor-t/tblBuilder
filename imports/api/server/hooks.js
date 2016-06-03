import _ from 'underscore';
import {Meteor} from 'meteor/meteor';

import { Roles } from 'meteor/alanning:roles';

import tblBuilderCollections from '/imports/collections';
import Tables from '/imports/collections/tables';
import Reference from '/imports/collections/reference';
import EpiDescriptive from '/imports/collections/epiDescriptive';
import EpiResult from '/imports/collections/epiResult';
import NtpEpiDescriptive from '/imports/collections/ntpEpiDescriptive';
import NtpEpiResult from '/imports/collections/ntpEpiResult';
import AnimalEvidence from '/imports/collections/animalEvidence';
import AnimalEndpointEvidence from '/imports/collections/animalResult';
import NtpAnimalEvidence from '/imports/collections/ntpAnimalEvidence';
import NtpAnimalEndpointEvidence from '/imports/collections/ntpAnimalEndpointEvidence';
import MechanisticEvidence from '/imports/collections/mechanistic';


var addTimestampAndUserID = function(userId, doc) {
        var now =  new Date();
        doc.created = now;
        doc.lastUpdated = now;
        doc.user_id = userId;
    },
    addQAmarks = function(doc) {
        doc.isQA = false;
        doc.timestampQA = null;
        doc.user_id_QA = null;
    },
    getNewIdx = function(Cls, tbl_id) {
        // auto-incrementing table index, starting at 1
        var max = 0,
            found = Cls.findOne(
              {tbl_id: tbl_id},
              {sort: {sortIdx: -1}}
            );
        if (found) max = found.sortIdx;
        return max + 1;
    },
    addTblContentInsertion = function(userId, doc, Cls){
        addTimestampAndUserID(userId, doc);
        addQAmarks(doc);
        doc.isHidden = false;
        if(doc.sortIdx === undefined) doc.sortIdx = getNewIdx(Cls, doc.tbl_id);
        return true;
    },
    addLastUpdated = function (userId, doc, fieldNames, modifier) {
        modifier.$set = modifier.$set || {};
        modifier.$set.lastUpdated = new Date();
    },
    updateTableStatus = function(userId, doc){
        var tbl = Tables.find({_id: doc.tbl_id}).fetch()[0];
        if (_.contains(Tables.unstartedStatuses, tbl.status)){
            Tables.update(
                {_id: doc.tbl_id},
                {$set: {status: 'in progress'}},
                {multi: false}
            );
        }
    };


Meteor.startup(function() {

    // Pre-create hooks
    Tables.before.insert(function(userId, doc) {
        var currentMax, currentMaxTable;
        addTimestampAndUserID(userId, doc);
        currentMaxTable = Tables.findOne({
            volumeNumber: doc.volumeNumber,
            monographAgent: doc.monographAgent},
            {sort: {'sortIdx': -1},
        });
        currentMax = currentMaxTable ? currentMaxTable.sortIdx : 0;
        doc.sortIdx = currentMax + 1;
        return true;
    });

    Reference.before.insert(function(userId, doc) {
        /*
        If reference already exists, then don't create a new reference.
        Instead, append the current monographAgent to the existing reference.
        */
        var newMonographAgent,
            ref = Reference.checkForDuplicate(doc);

        if (ref !== undefined){
            newMonographAgent = doc.monographAgent[0];
            if (ref.monographAgent.indexOf(newMonographAgent) < 0) {
                Reference.update(ref._id, {$push: {'monographAgent': newMonographAgent}});
            }
            return false;
        }

        addTimestampAndUserID(userId, doc);
        return true;
    });

    tblBuilderCollections.evidenceTypes.forEach(function(Cls){
        Cls.before.insert(function(userId, doc){
            return addTblContentInsertion(userId, doc, Cls);
        });
        Cls.after.insert(updateTableStatus);
    });


    // Update hooks
    tblBuilderCollections.evidenceTypes.forEach(function(Cls){
        Cls.before.update(addLastUpdated);
    });
    Tables.before.update(addLastUpdated);
    Reference.before.update(addLastUpdated);


    // Remove hooks
    Tables.before.remove(function(userId, doc) {
        tblBuilderCollections.evidenceTypes.forEach(function(Cls){
            Cls.remove({tbl_id: doc._id});
        });
    });

    // delete children if parent is deleted
    AnimalEvidence.before.remove(function(userId, doc) {
        AnimalEndpointEvidence.remove({parent_id: doc._id});
    });
    NtpAnimalEvidence.before.remove(function(userId, doc) {
        NtpAnimalEndpointEvidence.remove({parent_id: doc._id});
    });
    EpiDescriptive.before.remove(function(userId, doc) {
        EpiResult.remove({parent_id: doc._id});
    });
    NtpEpiDescriptive.before.remove(function(userId, doc) {
        NtpEpiResult.remove({parent_id: doc._id});
    });


    // Post-insert hooks
    Meteor.users.after.insert(function(userId, doc) {
        return Roles.addUsersToRoles(doc._id, 'default');
    });

    Tables.after.insert(function(userId, doc) {
        if (doc.tblType === 'Mechanistic Evidence Summary') {
            // todo: move to collection-level method
            MechanisticEvidence.evidenceCategories.forEach(function(category){
                MechanisticEvidence.insert({
                    tbl_id: doc._id,
                    section: 'characteristics',
                    text: '',
                    subheading: category,
                    humanInVivo: 'I',
                    animalInVivo: 'I',
                    humanInVitro: 'I',
                    animalInVitro: 'I',
                    references: [],
                });
            });
        }
    });
});
