import { Meteor } from 'meteor/meteor';
import { Blaze } from 'meteor/blaze';
import { HTTP } from 'meteor/http';
import { Session } from 'meteor/session';
import { UI } from 'meteor/ui';
import { saveAs } from 'filesaver.js';

import _ from 'underscore';
import d3 from 'd3';

import {
    getValue,
    typeaheadSelectListGetLIs,
    numericSort,
} from '/imports/api/utilities';


let getHTMLTitleBase = function() {
        var organization = Meteor.settings['public'].organization;
        return organization + ' Table Builder';
    },
    getHTMLTitleTbl = function() {
        var base = getHTMLTitleBase(),
            tbl = Session.get('Tbl');
        return tbl.name + ' | ' + tbl.tblType + ' | ' + base;
    },
    b64toBlob = function(b64, contentType, sliceSize) {
        var byteArray, byteArrays, byteCharacters, byteNumbers, i, offset, slice;
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        byteCharacters = window.atob(b64);
        byteArrays = [];
        offset = 0;

        while (offset < byteCharacters.length) {
            slice = byteCharacters.slice(offset, offset + sliceSize);
            byteNumbers = new Array(slice.length);
            i = 0;
            while (i < slice.length) {
                byteNumbers[i] = slice.charCodeAt(i);
                i++;
            }
            byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
            offset += sliceSize;
        }

        return new Blob(byteArrays, {type: contentType});
    },
    s2ab = function(s) {
        var buf = new ArrayBuffer(s.length),
            view = new Uint8Array(buf),
            i, j, ref;
        for (i = j = 0, ref = s.length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    },
    getNextSortIdx = function(currentIdx, Collection){
        // Given the current index, get the next available index for a
        // collection.
        var nextIdx = _.chain(Collection.find().fetch())
                    .pluck('sortIdx')
                    .filter((d)=> d > currentIdx)
                    .sort(numericSort)
                    .first()
                    .value();

        return (nextIdx)?
            d3.mean([currentIdx, nextIdx]):
            Math.ceil(currentIdx) + 1;
    },
    setSortIdxOnMove = function(evt) {
        var data = UI.getData(evt.target),
            $el = $(evt.target),
            currentIdx = $el.data('sortidx'),
            prev_pos = $el.prev().data('sortidx'),
            next_pos = $el.next().data('sortidx'),
            newIdx;

        // if moved to beginning of table
        if (prev_pos === undefined){
            prev_pos = 0;
        }

        // if moved to end of table, get new integer values
        if (next_pos === undefined){
            prev_pos = Math.ceil(prev_pos);
            next_pos = prev_pos + 2;
        }

        // calculate new index
        newIdx = d3.mean([prev_pos, next_pos]);

        // update state if new index calculated
        if (currentIdx !== newIdx){
            this.options.Cls.update(data._id, {$set: {sortIdx: newIdx}});
            $el.data('sortidx', newIdx);
        }
    },
    createErrorDiv = function(context) {
        var  msg, ul = $('<ul>');
        context.invalidKeys().forEach(function(obj){
            msg = undefined;
            try {
                msg = context.keyErrorMessage(obj.name);
            } catch (err) {
                console.error(err);
            }
            if (msg != null) {
                ul.append(`<li>${msg}</li>`);
            } else {
                ul.append(`<li>${obj.name} is ${obj.type}; got \'${obj.value}\' </li>`);
            }
        });

        return $('<div class="bg-danger">')
            .append('<p><strong>The following errors were found:</strong></p>')
            .append(ul);
    },
    getPubMedDetails = function(pubmedID, cb) {
        var url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pubmedID}&rettype=docsum&retmode=xml`;

        return HTTP.get(url, function(err, result) {
            var auth, authors, first, fullCitation, isError, journal_source,
                pmid, second, shortCitation, so, title, xml, xmlDoc, year;

            // assume an error occurred by default
            fullCitation = 'An error occurred.';
            shortCitation = '';
            isError = true;

            if (result) {
                xmlDoc = $.parseXML(result.content);
                xml = $(xmlDoc);

                err = xml.find('ERROR');
                if (err.length >= 1) {
                    fullCitation = xml.find('ERROR').text();
                } else {
                    // Parse XML for text, we use the AuthorList children to
                    // filter for both 'Author' and 'CollectiveName' fields,
                    // as an example see PMID 187847.
                    authors = (function() {
                        var i, len, ref1, results;
                        ref1 = xml.find('Item[Name=AuthorList]').children();
                        results = [];
                        for (i = 0, len = ref1.length; i < len; i++) {
                            auth = ref1[i];
                            results.push(auth.innerHTML);
                        }
                        return results;
                    })();
                    title = xml.find('Item[Name=Title]').text();
                    journal_source = xml.find('Item[Name=Source]').text();
                    so = xml.find('Item[Name=SO]').text();
                    pmid = xml.find('Id').text();
                    year = xml.find('Item[Name=PubDate]').text().substr(0, 4);

                    // build short-citation
                    first = authors[0].substr(0, authors[0].search(' '));
                    shortCitation = `${first} (${year})`;
                    if (authors.length > 2) {
                        shortCitation = `${first} et al. (${year})`;
                    } else if (authors.length === 2) {
                        second = authors[1].substr(0, authors[1].search(' '));
                        shortCitation = `${first} and ${second} (${year})`;
                    }

                    // build full-citation, using the PubMed Summary format, found here:
                    // https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=#{pubmedID}&rettype=docsum&retmode=text
                    fullCitation = `${authors.join(', ')}. ${title}. ${journal_source}. ${so}. PubMed PMID: ${pmid}.`;
                    isError = false;
                }
            }
            return cb({
                'shortCitation': shortCitation,
                'fullCitation': fullCitation,
                'isError': isError,
                'pubmedID': pubmedID,
            });
        });
    },
    initDraggables = function($el, handle, cls, opts){
        opts = opts || {};
        _.extend(opts, {
            handle: handle,
            onUpdate: setSortIdxOnMove,
            Cls: cls,
        });
        return new Sortable($el, opts);
    },
    activateInput = function(input) {
        if (input){
            input.focus();
            input.select();
        }
    },
    updateValues = function(form, obj) {
        var newObj = {}, key, val;
        $(form).find('select,input,textarea').each(function(i, inp){
            key = inp.name;
            if (key.length > 0) {
                val = getValue(inp);
                if (obj[key] !== val) newObj[key] = val;
            }
        });
        return newObj;
    },
    returnExcelFile = function(raw_data, fn) {
        var blob = new Blob([s2ab(raw_data)], {type: 'application/octet-stream'});
        fn = fn || 'download.xlsx';
        return saveAs(blob, fn);
    },
    returnWordFile = function(raw_data, fn) {
        fn = fn || 'download.docx';
        var blob = new Blob([s2ab(raw_data)], {type: 'application/octet-stream'});
        return saveAs(blob, fn);
    },
    b64toWord = function(b64, fn) {
        var blob = b64toBlob(b64, 'application/octet-stream');
        fn = fn || 'download.docx';
        return saveAs(blob, fn);
    },
    b64toExcel = function(b64, fn) {
        var blob = b64toBlob(b64, 'application/octet-stream');
        fn = fn || 'download.xlsx';
        return saveAs(blob, fn);
    },
    toggleRowVisibilty = function(display, $els) {
        return (display) ? $els.fadeIn() : $els.fadeOut();
    },
    toggleQA = function(tmpl, isQA) {
        // isQA can have three states: true/false/undefined. Undefined may
        // exist when creating a new object. Therefore we set to a bool below.
        isQA = (isQA === true);
        tmpl.$('input,select,textarea').prop('disabled', isQA);
        tmpl.$('.showEditOnly').toggleClass('makeHidden', isQA);
        if (isQA){
            tmpl.$('.tt-input').css('background-color', '#eee');
        }
    },
    userCanEdit = function(tbl) {
        var i, user, userId;

        userId = Meteor.userId();

        if ((userId == null) || (tbl == null)) return false;
        if (Meteor.user() && Meteor.user().roles.indexOf('superuser') >= 0) return true;
        if (userId === tbl.user_id) return true;
        for (i = 0; i < tbl.user_roles.length; i++) {
            user = tbl.user_roles[i];
            if (userId === user.user_id && user.role !== 'reviewers') return true;
        }
        return false;
    },
    initPopovers = function(tmpl, opts){
        opts = opts || {};
        _.extend(opts, {
            delay: {show: 500, hide: 100},
            trigger: 'hover',
            placement: 'auto',
            html: true,
        });
        $(tmpl.findAll('.helpPopovers')).popover(opts);
    },
    destroyPopovers = function(tmpl){
        $(tmpl.findAll('.helpPopovers')).popover('destroy');
    },
    closeModal = function(evt, tmpl) {
        // todo: not fired when ESC pressed to close
        $('#modalDiv')
            .on('hide.bs.modal', function() {
                $(tmpl.view._domrange.members).remove();
                Blaze.remove(tmpl.view);
            }).modal('hide');
    },
    addUserMessage = function(message, alertType) {
        /**
         * Add a dismissible alert message to the top of the page. Uses
         * twitter bootstrap alert styles.
         *
         * @param {string} type - bootstrap alert type (ex: success, danger)
         * @param {html} message - HTML formatted comment
         */
        let messages = Session.get('messages');
        messages.push({alertType, message});
        Session.set('messages', messages);
    };

export { getHTMLTitleBase };
export { getHTMLTitleTbl };
export { getNextSortIdx };
export { createErrorDiv };
export { getPubMedDetails };
export { initDraggables };
export { activateInput };
export { updateValues };
export { returnExcelFile };
export { returnWordFile };
export { b64toWord };
export { b64toExcel };
export { toggleRowVisibilty };
export { typeaheadSelectListGetLIs };
export { toggleQA };
export { userCanEdit };
export { initPopovers };
export { destroyPopovers };
export { closeModal };
export { addUserMessage };
