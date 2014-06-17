EpiCaseControl = new Meteor.Collection('epiCaseControl')

getEpiCaseControlHandle = ->
    myTbl_id = Session.get('MyTbl_id')
    if myTbl_id
        epiCaseControlHandle = Meteor.subscribe('epiCaseControl', myTbl_id)
    else
        epiCaseControlHandle = null

epiCaseControlHandle = getEpiCaseControlHandle()
Deps.autorun(getEpiCaseControlHandle)


Session.setDefault('epiCaseControlMyTbl_id', null)
Session.setDefault('epiCaseControlShowNew', false)
Session.setDefault('epiCaseControlEditingId', null)
Session.setDefault('epiCaseControlShowAll', false)


Template.epiCaseControlTbl.helpers

    getEpiCaseControls: ->
        EpiCaseControl.find({}, {sort: {sortIdx: 1}})

    epiCaseControlShowNew: ->
        Session.get("epiCaseControlShowNew")

    epiCaseControlIsEditing: ->
        Session.equals('epiCaseControlEditingId', @_id)

    showRow: (isHidden) ->
        Session.get('epiCaseControlShowAll') or !isHidden

    isShowAll: ->
        Session.get('epiCaseControlShowAll')


Template.epiCaseControlTbl.events
    'click #epiCaseControl-show-create': (evt, tmpl) ->
        Session.set("epiCaseControlShowNew", true)
        Deps.flush() # update DOM before focus
        activateInput(tmpl.find("input[name=reference]"))

    'click #epiCaseControl-show-edit': (evt, tmpl) ->
        Session.set("epiCaseControlEditingId", @_id)
        Deps.flush() # update DOM before focus
        activateInput(tmpl.find("input[name=reference]"))

    'click #epiCaseControl-move-up': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        moveUp(this, tr, EpiCaseControl)

    'click #epiCaseControl-move-down': (evt, tmpl) ->
        tr = $(tmpl.find('tr[data-id=' + @_id + ']'))
        moveDown(this, tr, EpiCaseControl)

    'click #epiCaseControl-downloadExcel': (evt, tmpl) ->
        myTbl_id = tmpl.data._id
        Meteor.call('epiCaseControlDownload', myTbl_id, (err, response) ->
            return_excel_file(response, "epiCaseControl.xlsx")
        )
    'click #epiCaseControl-toggleShowAllRows': (evt, tmpl) ->
        Session.set('epiCaseControlShowAll', !Session.get('epiCaseControlShowAll'))

    'click #epiCaseControl-toggle-hidden': (evt, tmpl) ->
        EpiCaseControl.update(@_id, {$set: {isHidden: !@isHidden}})

    'click #epiCaseControl-copy-as-new': (evt, tmpl) ->
        Session.set("epiCaseControlShowNew", true)
        Deps.flush() # update DOM before focus
        activateInput(tmpl.find("input[name=reference]"))
        copyAsNew(@)


Template.epiCaseControlForm.helpers
    "epiCaseControlIsNew":
        (val)-> val is "T"


Template.epiCaseControlForm.events
    'click #epiCaseControl-create': (evt, tmpl) ->
        obj = new_values(tmpl)
        obj['timestamp'] = (new Date()).getTime()
        obj['user_id'] = Meteor.userId()
        obj['myTbl_id'] = Session.get('MyTbl_id')
        obj['isHidden'] = false
        Meteor.call('epiCaseControlNewIdx', obj['myTbl_id'], (err, response) ->
            obj['sortIdx'] = response
            EpiCaseControl.insert(obj)
            Session.set("epiCaseControlShowNew", false)
        )
    'click #epiCaseControl-create-cancel': (evt, tmpl) ->
        Session.set("epiCaseControlShowNew", false)

    'click #epiCaseControl-update': (evt, tmpl) ->
        vals = update_values(tmpl.find('#epiCaseControlForm'), @)
        EpiCaseControl.update(@_id, {$set: vals})
        Session.set("epiCaseControlEditingId", null)

    'click #epiCaseControl-update-cancel': (evt, tmpl) ->
        Session.set("epiCaseControlEditingId", null)

    'click #epiCaseControl-delete': (evt, tmpl) ->
        EpiCaseControl.remove(@_id)
        Session.set("epiCaseControlEditingId", null)