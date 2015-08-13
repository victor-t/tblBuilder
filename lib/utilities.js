var TblBuilderUtilities = function(){};
_.extend(TblBuilderUtilities.prototype, {
    getHTMLTitleBase: function() {
        var context = Meteor.settings["public"].context.toUpperCase();
        return context + " Table Builder";
    },
    getHTMLTitleTbl: function() {
        var base = this.getHTMLTitleBase(),
            tbl = Session.get('Tbl');
        return tbl.name + " | " + tbl.tblType + " | " + base;
    },
    capitalizeFirst: function(str) {
        if ((str != null) && str.length > 0) {
            str = str[0].toUpperCase() + str.slice(1);
        }
        return str;
    },
    getNextSortIdx: function(currentIdx, Collection){
        var nextIdx = _.chain(Collection.find().fetch())
                    .pluck('sortIdx')
                    .filter(function(d){return d > currentIdx;})
                    .sort()
                    .first()
                    .value() || (currentIdx + 2);

        return d3.mean([currentIdx, nextIdx]);
    },
    cloneObject: function(oldObj, Collection, NestedCollection) {
        var newObj, new_parent_id, ref, newNest;

        // clone object
        newObj = _.extend({}, oldObj);

        // increment sort-index
        if (newObj.sortIdx) newObj.sortIdx = this.getNextSortIdx(newObj.sortIdx, Collection);

        // insert, getting new parent-ID
        new_parent_id = Collection.insert(newObj);

        // clone nested collection, if exists
        if (NestedCollection != null) {
            ref = NestedCollection.find({parent_id: oldObj._id}).fetch();
            _.each(ref, function(oldNest){
                newNest = _.extend({}, oldNest);
                newNest.parent_id = new_parent_id;
                return NestedCollection.insert(newNest);
            });
        }
    },
    getPercentOrText: function(txt) {
        if (txt == null) return "";
        if (_.isFinite(txt)) txt = txt.toString();
        if (txt.search && txt.search(/(\d)+/) >= 0) txt += "%";
        return txt;
    }
});

// create a new singleton
utilities = new TblBuilderUtilities();