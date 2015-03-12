Session.setDefault('showQAflags', false)
Session.setDefault('monographAgent', null)
Session.setDefault('isFullScreen', false)

Meteor.subscribe('reportTemplate')

share.TablesHandler = null;
Tracker.autorun ->
    share.TablesHandler = Meteor.subscribe('tables', Meteor.userId())

class TblRouterController extends RouteController

    data: ->
        return Tables.findOne(this.params._id)

    action: ->
        if @.ready()
            if Session.get('Tbl') is undefined then return @.render('404')
            share.getHTMLTitleTbl()
            @.render()
        else @.render("isLoading")

    onStop: ->
        Session.set('monographAgent', null)
        Session.set('Tbl', null)
        share.getHTMLTitleBase()

Router.map ->

    this.route 'home',
        path: '/',

        waitOn: ->
            if share.TablesHandler.ready() then return

        action: ->
            if @.ready() then @.render() else @.render("isLoading")

    this.route 'epiMain',
        path: '/epidemiology/:_id'

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('monographAgent', tbl.monographAgent)
                    return Meteor.subscribe('epiDescriptive', tbl._id)

        controller: TblRouterController

    this.route 'epiAnalysisTbl',
        path: '/epidemiology/:_id/analysis'

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('monographAgent', tbl.monographAgent)
                    return Meteor.subscribe('epiDescriptive', tbl._id)

        controller: TblRouterController

    this.route 'mechanisticMain',
        path: '/mechanistic/:_id/',

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('monographAgent', tbl.monographAgent)
                    return Meteor.subscribe('mechanisticEvidence', tbl._id)

        controller: TblRouterController

    this.route 'exposureMain',
        path: '/exposure/:_id'

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('monographAgent', tbl.monographAgent)
                    return Meteor.subscribe('exposureEvidence', tbl._id)

        controller: TblRouterController

    this.route 'animalMain',
        path: '/animal/:_id'

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('monographAgent', tbl.monographAgent)
                    return Meteor.subscribe('animalEvidence', tbl._id)

        controller: TblRouterController

    this.route 'genotoxMain',
        path: '/genotoxicity/:_id'

        waitOn: ->
            if share.TablesHandler.ready()
                tbl = Tables.findOne({_id: this.params._id})
                Session.set('Tbl', tbl)
                if tbl
                    Session.set('monographAgent', tbl.monographAgent)
                    return Meteor.subscribe('genotoxEvidence', tbl._id)

        controller: TblRouterController

    this.route 'referencesMain',
        path: '/references/:monographAgent/',

        data: ->
            return {monographAgent: this.params.monographAgent}

        waitOn: ->
            if share.TablesHandler.ready()
                monographAgent = this.params.monographAgent
                Session.set('monographAgent', monographAgent)
                return Meteor.subscribe('monographReference', monographAgent)

        action: ->
            if @.ready() then @.render() else @.render("isLoading")

        onStop: ->
            Session.set('monographAgent', null)

    this.route 'referenceBatchUpload',
        path: '/references/:monographAgent/upload/',

        data: ->
            return {monographAgent: this.params.monographAgent}

        waitOn: ->
            if share.TablesHandler.ready()
                monographAgent = this.params.monographAgent
                Session.set('monographAgent', monographAgent)
                return Meteor.subscribe('monographReference', monographAgent)

        action: ->
            if @.ready() then @.render() else @.render("isLoading")

        onStop: ->
            Session.set('monographAgent', null)

    this.route 'profileEdit',
        path: '/user-profile/'

    this.route 'isLoading',
        path: '/loading/'

    this.route 'admin',

        waitOn: ->
            share.viewHandles = Meteor.subscribe('adminUsers')
            return share.viewHandles

        action: ->
            if @.ready() then @.render() else @.render("isLoading")

        onStop: ->
            share.viewHandles.stop()

    this.route '404',
        path: '/(.*)'


Router.configure
    layoutTemplate: 'layout',
    notFoundTemplate: '404',
    loadingTemplate: 'isLoading'


Template._loginButtonsLoggedInDropdown.events
    'click #login-buttons-edit-profile': (event) ->
        event.stopPropagation()
        Template._loginButtons.toggleDropdown()
        Router.go('profileEdit')


# navBar
Template.navBar.helpers
    getTitle: () -> return Meteor.settings.public.context.toUpperCase()

Template.navBar.rendered = ->
    share.getHTMLTitleBase()

###
Based on loading order issues, the following content must be kept in the "main"
module, despite it's preferred home being in a different location:
###

UI.registerHelper "getUserDescription", ->
    if (@.profile and @.profile.fullName) then return @.profile.fullName
    return [(v.address for v in @.emails)].join(', ')


# selectList
Template.selectList.helpers

    isSelected: (current, selected) ->
        return current is selected


# typeaheadInput
Template.typeaheadInput.helpers

    getOptions: (qry, cb) ->
        methodName = @$el.parent().parent().find('input').data('methodname')
        Meteor.call methodName, qry, (err, res) ->
            if err then return console.log(err)
            map = ({value: v} for v in res)
            return cb(map)

Template.typeaheadInput.rendered = ->
    Meteor.typeahead.inject("input[name=#{@.data.name}]")


# typeaheadSelectList
Template.typeaheadSelectList.helpers

    getOptions: (qry, cb) ->
        methodName = @$el.parent().parent().find('input').data('methodname')
        Meteor.call methodName, qry, (err, res) ->
            if err then return console.log(err)
            map = ({value: v} for v in res)
            return cb(map)

Template.typeaheadSelectList.events

    'typeahead:selected': (evt, tmpl, v) ->
        $ul = $(tmpl.find("ul"))
        share.typeaheadSelectListAddLI($ul, v.value)
        $(evt.target).typeahead("val", "")

    'click .selectListRemove': (evt, tmpl) ->
        $(evt.currentTarget).parent().remove()

Template.typeaheadSelectList.rendered = ->
    Meteor.typeahead.inject("input[name=#{@.data.name}]")


Template.browserDetect.helpers

    isSupportedBrowser: ->
        isChrome = window.chrome?
        ua = navigator.userAgent.toLowerCase()
        isFirefox = ua.indexOf('firefox') > -1
        isSafari = ua.indexOf('safari') > -1
        return isChrome or isFirefox or isSafari

    getErrorMessage: ->
        return "<b>Warning:</b> Your current browser
                has not been tested extensively with this website, which may
                result in some some errors with functionality. The following
                browsers are supported:
                <ul>
                    <li><a href='https://www.google.com/chrome/' target='_blank'>Google Chrome</a> (preferred)</li>
                    <li><a href='https://www.mozilla.org/firefox/' target='_blank'>Mozilla Firefox</a></li>
                    <li><a href='https://www.apple.com/safari/' target='_blank'>Apple Safari</a></li>
                </ul><br>
                Please use a different browser for an optimal experience."

share.evidenceType =

    epi:
        collection: EpiDescriptive
        collection_name: "epiDescriptive"
        excel_method: "epiEvidenceDownload"
        excel_fn: "epi.xlsx"
        nested_template: Template.epiResultForm
        nested_collection: EpiResult
        nested_collection_name: "epiResult"
        requiredUpdateFields: ["studyDesign"]

    animal:
        collection: AnimalEvidence
        collection_name: "animalEvidence"
        excel_method: "animalEvidenceDownload"
        excel_fn: "animal.xlsx"
        nested_template: Template.animalEndpointForm
        nested_collection: AnimalEndpointEvidence
        nested_collection_name: "animalEndpointEvidence"
        requiredUpdateFields: []

    exposure:
        collection: ExposureEvidence
        collection_name: "exposureEvidence"
        excel_method: "exposureEvidenceDownload"
        excel_fn: "exposure.xlsx"
        requiredUpdateFields: ["exposureScenario"]

    genotox:
        collection: GenotoxEvidence
        collection_name: "genotoxEvidence"
        excel_method: "genotoxEvidenceDownload"
        excel_fn: "genotox.xlsx"
        requiredUpdateFields: []
