var getUserPermissionsObject = function(tmpl) {
  var ids = {},
      results = [],
      user_id;

  ['projectManagers', 'teamMembers', 'reviewers'].forEach(function(role){
    tmpl.findAll("." + role + " li").forEach(function(li){
      user_id = $(li).data('user_id');
      if (ids[user_id] === undefined){
        results.push({"user_id": user_id, "role": role});
        ids[user_id] = true;
      }
    });
  });
  return results;
};

Template.home.helpers({
  currentUser2: function() {
    return Meteor.user();
  }
});
Template.home.rendered = function() {
  Session.set("tablesShowNew", false);
  Session.set("tablesEditingId", null);
  return Session.set("reorderRows", false);
};


Template.TablesByMonograph.helpers({
  getMonographs: function() {
    var tbls = Tables.find(
      {},
      {fields: {"volumeNumber": 1}, sort: {"volumeNumber": -1}}).fetch();
    return _.uniq(_.pluck(tbls, "volumeNumber"));
  },
  getMonographAgents: function(volumeNumber) {
    var tbls = Tables.find(
      {"volumeNumber": volumeNumber},
      {fields: {"monographAgent": 1}, sort: {"monographAgent": 1}}).fetch();
    return _.uniq(_.pluck(tbls, "monographAgent"));
  },
  getTables: function(volumeNumber, monographAgent) {
    return Tables.find(
      {"volumeNumber": volumeNumber, "monographAgent": monographAgent},
      {sort: {"sortIdx": 1}}).fetch();
  },
  getURL: function() {
    var url;
    switch (this.tblType) {
      case "Mechanistic Evidence Summary":
        return url = Router.path('mechanisticMain', {_id: this._id});
      case "Epidemiology Evidence":
        return url = Router.path('epiMain', {_id: this._id});
      case "Exposure Evidence":
        return url = Router.path('exposureMain', {_id: this._id});
      case "Animal Bioassay Evidence":
        return url = Router.path('animalMain', {_id: this._id});
      case "Genetic and Related Effects":
        return url = Router.path('genotoxMain', {_id: this._id});
      default:
        return url = Router.path('404');
    }
  },
  canEdit: function() {
    var currentUser = Meteor.user(),
        ids = [], id;

    if (currentUser) id = currentUser._id;
    if (id === undefined) return false;
    if (currentUser.roles.indexOf("superuser") >= 0) return true;

    ids = _.chain(this.user_roles)
           .filter(function(v){return v.role === "projectManagers";})
           .pluck("user_id")
           .value();

    return (id === this.user_id) || (indexOf.call(ids, id) >= 0);
  },
  showNew: function() {
    return Session.get("tablesShowNew");
  },
  isEditing: function() {
    return Session.equals('tablesEditingId', this._id);
  }
});
Template.TablesByMonograph.events({
  'click #tables-show-create': function(evt, tmpl) {
    Session.set("tablesShowNew", true);
    Tracker.flush();
    return clientShared.activateInput(tmpl.find("input[name=volumeNumber]"));
  },
  'click #tables-show-edit': function(evt, tmpl) {
    Session.set("tablesEditingId", this._id);
    Tracker.flush();
    return clientShared.activateInput(tmpl.find("input[name=volumeNumber]"));
  },
  'click #agentEpiReport': function(evt, tmpl) {
    var div = tmpl.find('#modalHolder'),
        val = $(evt.target).data();
    val.multiTable = true;
    return Blaze.renderWithData(Template.reportTemplateModal, val, div);
  },
  'click #reorderRows': function(evt, tmpl) {
    var isReorder = !Session.get('reorderRows');
    Session.set('reorderRows', isReorder);
    if (isReorder) {
      tmpl.sortables = [];
      $('.sortables').each(function(i, v) {
        return tmpl.sortables.push(new Sortable(v, {
          handle: ".moveTableHandle",
          onUpdate: clientShared.moveRowCheck,
          Cls: Tables
        }));
      });
    } else {
      tmpl.sortables.forEach(function(v) {
        return v.destroy();
      });
    }
    return clientShared.toggleRowVisibilty(isReorder, $('.moveTableHandle'));
  }
});


Template.tablesForm.helpers({
  searchUsers: function(query, callback) {
    return Meteor.call('searchUsers', query, {}, function(err, res) {
      if (err) return console.log(err);
      return callback(res);
    });
  },
  getRoledUsers: function(userType) {
    if (!this.user_roles) return;
    var ids = _.chain(this.user_roles)
           .filter(function(d){return d.role === userType;})
           .pluck("user_id")
           .value();
    return Meteor.users.find({_id: {$in: ids}});
  },
  getTblTypeOptions: function() {
    return tblTypeOptions;
  }
});
Template.tablesForm.events({
  'click #tables-create': function(evt, tmpl) {
    var errorDiv, isValid, obj;
    obj = clientShared.newValues(tmpl.find("#tablesForm"));
    obj['user_roles'] = getUserPermissionsObject(tmpl);
    delete obj['projectManagers'];
    delete obj['teamMembers'];
    delete obj['reviewers'];
    isValid = Tables.simpleSchema()
                    .namedContext()
                    .validate(obj);
    if (isValid) {
      Tables.insert(obj);
      return Session.set("tablesShowNew", false);
    } else {
      errorDiv = clientShared.createErrorDiv(Tables.simpleSchema().namedContext());
      return $(tmpl.find("#errors")).html(errorDiv);
    }
  },
  'click #tables-create-cancel': function(evt, tmpl) {
    return Session.set("tablesShowNew", false);
  },
  'click #tables-update': function(evt, tmpl) {
    var errorDiv, isValid, modifier, vals;
    vals = clientShared.updateValues(tmpl.find("#tablesForm"), this);
    vals['user_roles'] = getUserPermissionsObject(tmpl);
    delete vals['projectManagers'];
    delete vals['teamMembers'];
    delete vals['reviewers'];
    modifier = {$set: vals};
    isValid = Tables.simpleSchema()
                    .namedContext()
                    .validate(modifier, {modifier: true});
    if (isValid) {
      Tables.update(this._id, modifier);
      return Session.set("tablesEditingId", null);
    } else {
      errorDiv = clientShared.createErrorDiv(Tables.simpleSchema().namedContext());
      return $(tmpl.find("#errors")).html(errorDiv);
    }
  },
  'click #tables-update-cancel': function(evt, tmpl) {
    return Session.set("tablesEditingId", null);
  },
  'click #tables-delete': function(evt, tmpl) {
    Tables.remove(this._id);
    return Session.set("tablesEditingId", null);
  },
  'click .removeUser': function(evt, tmpl) {
    return $(evt.currentTarget).parent().remove();
  },
  'typeahead:selected .userTypeahead': function(evt, tmpl, v) {
    var $ul, ids;

    ids = [];
    $ul = $(tmpl.find("." + evt.target.name));
    $ul.find('li').each(function(i, li){
      ids.push($(li).data('user_id'));
    })

    if (ids.indexOf(v._id) < 0) {
      return Blaze.renderWithData(Template.UserLI, v, $ul[0]);
    }
  }
});
Template.tablesForm.rendered = function() {
  return Meteor.typeahead.inject('.userTypeahead');
};