import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import _ from 'underscore';

import {
    abstractFormEvents,
} from '/imports/api/client/templates';

import {
    toggleQA,
    initPopovers,
    destroyPopovers,
} from '/imports/api/client/utilities';

import './form.html';

let toggleStudyDesignFields = function(tmpl, studyDesign, duration){
        let shows, hides;
        switch (studyDesign){
        case 'Cohort':
            shows = ['.isCohort', '.isntCC'];
            hides = ['.isntCohort', 'isNCC'];
            break;
        case 'Case-Control':
            shows = ['.isntCohort'];
            hides = ['.isCohort', '.isntCC', 'isNCC'];
            break;
        case 'Nested Case-Control':
        case 'Ecological':
            shows = ['.isntCohort', '.isntCC', 'isNCC'];
            hides = ['.isCohort'];
            break;
        default:
            console.log(`unknown study-design: ${studyDesign}`);
        }
        tmpl.$(hides.join(',')).fadeOut(duration, function(){
            tmpl.$(shows.join(',')).fadeIn(duration);
        });
    },
    toggleRequiredFields = function(tmpl, duration){
        duration = duration || 1000;
        let studyDesign = tmpl.find('select[name=studyDesign]').value;
        toggleStudyDesignFields(tmpl, studyDesign, duration);
    };

Template.ntpEpiDescriptiveForm.helpers({
    allAccordiansShown: function(){
        return Template.instance().allAccordiansShown.get();
    },
});
Template.ntpEpiDescriptiveForm.events(_.extend({
    'change select[name="studyDesign"]': function(evt, tmpl) {
        return toggleRequiredFields(tmpl);
    },
    'click #toggleAccordian': function(evt, tmpl){
        tmpl.allAccordiansShown.set(!tmpl.allAccordiansShown.get());
        let action = (tmpl.allAccordiansShown.get()) ? 'show' : 'hide';
        tmpl.$('.collapse').collapse(action);
    },
}, abstractFormEvents));
Template.ntpEpiDescriptiveForm.onCreated(function(){
    this.allAccordiansShown = new ReactiveVar(false);
});
Template.ntpEpiDescriptiveForm.onRendered(function() {
    toggleQA(this, this.data.isQA);
    initPopovers(this);
    toggleRequiredFields(this, 1e-6);
});
Template.ntpEpiDescriptiveForm.onDestroyed(function() {
    destroyPopovers(this);
});

export { toggleStudyDesignFields };
