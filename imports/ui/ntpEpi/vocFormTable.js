import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Session } from 'meteor/session';
import NtpEpiResult from '/imports/collections/ntpEpiResult';

import {
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './vocFormTable.html';


let vocHelpers = {
    getVocSchema: function(){
        return NtpEpiResult.variableOfConcernSchema.schema();
    },
    isNew: function(){
        return Session.get('nestedEvidenceEditingId') === null;
    },
};

Template.vocFormTable.helpers(vocHelpers);
Template.vocFormTable.events({
    'click #addVocRow': function(evt, tmpl) {
        let tbody = tmpl.find('tbody');
        Blaze.renderWithData(Template.vocFormRow, {}, tbody);
    },
});
Template.vocFormTable.onRendered(function() {
    initPopovers(this);
});
Template.vocFormTable.onDestroyed(function() {
    destroyPopovers(this);
});

export { vocHelpers };
