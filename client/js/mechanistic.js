var initializeDraggable = function(tmpl, options) {
  var id = options.isSection ? tmpl.data.section : tmpl.data._id,
      container = tmpl.find("#dragContainer_" + id);

  if (container) {
    new Sortable(container, {
      draggable: ".dragObj_" + id,
      handle: ".dragHandle_" + id,
      onUpdate: clientShared.moveRowCheck,
      Cls: MechanisticEvidence
    });
    return clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
  }
};


Template.mechanisticMain.helpers({
  isAllCollapsed: function() {
    return Session.get('mechanisticAllCollapsed');
  }
});
Template.mechanisticMain.events({
  'click #mechanistic-toggleShowAllRows': function() {
    var els = $('.accordianBody');
    if (Session.get('mechanisticAllCollapsed')) {
      els.collapse('show');
    } else {
      els.collapse('hide');
    }
    Session.set('mechanisticAllCollapsed', !Session.get('mechanisticAllCollapsed'));
  },
  'click #mechanistic-downloadExcel': function(evt, tmpl) {
    var tbl_id = tmpl.data._id;
    Meteor.call('mechanisticEvidenceExcelDownload', tbl_id, function(err, response) {
      clientShared.returnExcelFile(response, "mechanisticEvidence.xlsx");
    });
  },
  'click #wordReport': function(evt, tmpl) {
    var div = tmpl.firstNode;
    Blaze.renderWithData(Template.reportTemplateModal, {}, div);
  },
  'click #mechanistic-reorderRows': function(evt, tmpl) {
    Session.set('reorderRows', !Session.get('reorderRows'));
    clientShared.toggleRowVisibilty(Session.get('reorderRows'), $('.dragHandle'));
  }
});
Template.mechanisticMain.rendered = function() {
  $(this.findAll('.collapse')).on('show.bs.collapse', function() {
    $(this).parent().addClass('evidenceExpanded');
  });
  $(this.findAll('.collapse')).on('hide.bs.collapse', function() {
    $(this).parent().removeClass('evidenceExpanded');
  });
};


Template.mechanisticTbl.helpers({
  getMechanisticEvidenceSections: function() {
    return mechanisticEvidenceSections;
  }
});


Template.mechanisticSectionTR.helpers({
  getSectionEvidence: function() {
    return MechanisticEvidence.find(
      {section: this.section},
      {sort: {sortIdx: 1}});
  },
  displayNewSection: function() {
    return this.section === Session.get('mechanisticEditingId');
  },
  getDragContainer: function() {
    return "dragContainer_" + this.section;
  }
});
Template.mechanisticSectionTR.events({
  'click #mechanistic-newSection': function(evt, tmpl) {
    Session.set('mechanisticEditingId', this.section);
    Tracker.flush();
    clientShared.activateInput(tmpl.find("textarea[name=text]"));
  }
});
Template.mechanisticSectionTR.rendered = function() {
  initializeDraggable(this, {isSection: true});
};


Template.mechanisticEvidenceDisplay.helpers({
  displayEditingForm: function() {
    return Session.get("mechanisticEditingId") === this._id;
  },
  displayNewChild: function() {
    return Session.get('mechanisticNewChild') === this._id;
  },
  hasChildren: function() {
    return MechanisticEvidence.find({parent: this._id}).count() > 0;
  },
  getChildren: function() {
    return MechanisticEvidence.find({parent: this._id}, {sort: {sortIdx: 1}});
  },
  getDragContainer: function() {
    return "dragContainer_" + this._id;
  },
  getDragHandleName: function() {
    return (this.section) ? "dragHandle_" + this.section : "dragHandle_" + this.parent;
  },
  getDragObject: function() {
    return (this.section) ? "dragObj_" + this.section : "dragObj_" + this.parent;
  }
});
Template.mechanisticEvidenceDisplay.events({
  'click #mechanistic-show-edit': function(evt, tmpl) {
    Session.set("mechanisticEditingId", this._id);
    Tracker.flush();
    clientShared.activateInput(tmpl.find("textarea[name=text]"));
  },
  'click #mechanistic-newChild': function(evt, tmpl) {
    Session.set("mechanisticNewChild", this._id);
    Tracker.flush();
    clientShared.activateInput(tmpl.find("textarea[name=text]"));
  }
});
Template.mechanisticEvidenceDisplay.rendered = function() {
  return initializeDraggable(this, {isSection: false});
};


Template.mechanisticEvidenceForm.events({
  'click #mechanisticEvidence-create': function(evt, tmpl) {
    var errorDiv, isValid, obj;
    obj = clientShared.newValues(tmpl.find('#mechanisticEvidenceForm'));
    obj['tbl_id'] = Session.get('Tbl')._id;
    obj['section'] = this.section;
    obj['parent'] = this.parent;
    obj['sortIdx'] = 1e10;
    isValid = MechanisticEvidence.simpleSchema().namedContext().validate(obj);
    if (isValid) {
      MechanisticEvidence.insert(obj);
      Session.set("mechanisticEditingId", null);
      Session.set('mechanisticNewChild', null);
    } else {
      errorDiv = clientShared.createErrorDiv(MechanisticEvidence.simpleSchema().namedContext());
      $(tmpl.find("#errors")).html(errorDiv);
    }
  },
  'click #mechanisticEvidence-create-cancel': function(evt, tmpl) {
    Session.set("mechanisticEditingId", null);
    Session.set('mechanisticNewChild', null);
  },
  'click #mechanisticEvidence-update': function(evt, tmpl) {
    var errorDiv,
        vals = clientShared.updateValues(tmpl.find('#mechanisticEvidenceForm'), this),
        modifier = {$set: vals},
        isValid = MechanisticEvidence
          .simpleSchema()
          .namedContext()
          .validate(modifier, {modifier: true});

    if (isValid) {
      MechanisticEvidence.update(this._id, modifier);
      Session.set("mechanisticEditingId", null);
      Session.set('mechanisticNewChild', null);
    } else {
      errorDiv = clientShared.createErrorDiv(MechanisticEvidence.simpleSchema().namedContext());
      $(tmpl.find("#errors")).html(errorDiv);
    }
  },
  'click #mechanisticEvidence-update-cancel': function(evt, tmpl) {
    Session.set("mechanisticEditingId", null);
    Session.set('mechanisticNewChild', null);
  },
  'click #mechanisticEvidence-delete': function(evt, tmpl) {
    MechanisticEvidence.remove(this._id);
    Session.set("mechanisticEditingId", null);
    Session.set('mechanisticNewChild', null);
  }
});
Template.mechanisticEvidenceForm.helpers({
  displaySubheading: function() {
    return this.section != null;
  },
  getMechanisticEvidenceOptions: function() {
    return mechanisticEvidenceOptions;
  }
});
Template.mechanisticEvidenceForm.rendered = function() {
  return $(this.findAll('.helpPopovers')).popover({
    delay: {show: 500, hide: 100},
    trigger: "hover",
    placement: "auto"
  });
};