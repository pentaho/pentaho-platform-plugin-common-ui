/*!
* Copyright 2010 - 2023 Hitachi Vantara.  All rights reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/


/**
 * Pentaho Interactive Reporting Page Control Component.
 *
 * To declare:
 * <div data-dojo-type="pentaho.common.PageControl" id="mypagecontrol"></div>
 *   or
 * var pc = new pentaho.common.PageControl();
 *
 * To initialize before use (for example):
 * var pc = registry.byId("mypagecontrol");
 * pc.registerLocalizationLookup(mylocaleservice.getString);
 * pc.registerPageNumberChangeCallback(controller.updatePageNumber);
 *
 */

define(["dojo/_base/declare", "dojo/on", "dojo/query", "dojo/_base/lang", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
        "dijit/form/NumberTextBox", "dojo/dom-class", "dojo/keys", "common-ui/util/_a11y"],
    function (declare, on, query, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, NumberTextBox, domClass, keys, a11yUtil) {
        return declare("pentaho.common.PageControl", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

            // Template for this widget
            templateString: "<div class='pc_pageControlContainer' data-dojo-attach-point='containerNode'><div class='pc_pagePrev' data-dojo-attach-point='prevPageControl'></div><div class='pc_pageNext' data-dojo-attach-point='nextPageControl'></div><div data-dojo-attach-point='pageNumberInput' data-dojo-type='dijit.form.NumberTextBox' class='pc_pageNumberInput' constraints='{min:1}'></div><div class='pc_pageTotal contrast-color' data-dojo-attach-point='pageTotalSpan'>/ ##</div></div>",

            // Function for retrieving localized strings
            getLocaleString: null,

            // Callback to set page number
            changePageNumberCallback: null,

            // Current page number
            pageNumber: 1,

            // Total pages in this report
            pageTotal: 1,

            // Called once per instance
            postCreate: function () {
                this._resetPageNumber();
                this.setPageCount(this.pageTotal);
                this.own(
                    on(this.pageNumberInput, "change", lang.hitch(this, this._changePageNumber)),
                    on(this.pageNumberInput, "keyup", lang.hitch(this, this._pageNumberKeyUp)),
                    on(this.prevPageControl, "click", lang.hitch(this, this._prevPage)),
                    on(this.nextPageControl, "click", lang.hitch(this, this._nextPage)),
                    on(this.pageTotalSpan, "mousedown", lang.hitch(this, this._pageTotalMouseDown)),
                    a11yUtil.makeAccessibleActionButton(this.prevPageControl),
                    a11yUtil.makeAccessibleActionButton(this.nextPageControl));
            },

            registerLocalizationLookup: function (f) {
                this.getLocaleString = f;
                this._localize();
            },

            registerPageNumberChangeCallback: function (f) {
                this.changePageNumberCallback = f;
            },

            setPageNumber: function (pageNumber) {
                if (pageNumber < 1 || pageNumber > this.pageTotal) {
                    // TODO Alert user of invalid entry
                    this._resetPageNumber();
                    return;
                }
                try {
                    this._updateInternalPageNumber(pageNumber);
                } catch (err) {
                    console.error("Unable to update page number: " + err);
                    this._resetPageNumber();
                }
            },

            getPageNumber: function () {
                return this.pageNumberInput.get("value");
            },

            getPageTotal: function () {
                return this.pageTotal;
            },

            setPageCount: function (pageCount) {
                if (typeof (pageCount) == 'number') {
                    this.pageTotal = pageCount;
                } else {
                    this.pageTotal = 1; // Reset to default
                }
                this.pageTotalSpan.innerHTML = '/ ' + pageCount;
                this._updatePageButtonState();
            },

            reset: function () {
                this._updateInternalPageNumber(1);
            },

            _localize: function () {
                this.prevPageControl.setAttribute("title", this.getLocaleString("PageControlPreviousPage_title"));
                this.nextPageControl.setAttribute("title", this.getLocaleString("PageControlNextPage_title"));
            },

            _updatePageButtonState: function () {
                this.pagePrevDisabled = this.pageNumber === 1;
                this.pageNextDisabled = this.pageTotal === this.pageNumber;
                if (this.pagePrevDisabled) {
                    domClass.add(this.prevPageControl, "pc_pagePrevDisabled");
                    this.prevPageControl.setAttribute("tabindex", "-1");
                } else {
                    domClass.remove(this.prevPageControl, "pc_pagePrevDisabled");
                    this.prevPageControl.setAttribute("tabindex", "0");
                }
                if (this.pageNextDisabled) {
                    domClass.add(this.nextPageControl, "pc_pageNextDisabled");
                    this.nextPageControl.setAttribute("tabindex", "-1");
                } else {
                    domClass.remove(this.nextPageControl, "pc_pageNextDisabled");
                    this.nextPageControl.setAttribute("tabindex", "0");
                }
            },

            _changePageNumber: function () {
                if (this.ignorePageNumberUpdate) {
                    return;
                }
                if (!this.pageNumberInput.isValid()) {
                    this._resetPageNumber();
                    return;
                }
                this.setPageNumber(this.pageNumberInput.get("value"));
            },

            _updateInternalPageNumber: function (pageNumber) {
                if (this.pageNumber === pageNumber) {
                    return;
                }

                this.ignorePageNumberUpdate = true;
                try {
                    if (this.changePageNumberCallback) {
                        this.changePageNumberCallback(pageNumber);
                    }
                    this.pageNumber = pageNumber;
                    this.pageNumberInput.set("value", this.pageNumber);
                    this._updatePageButtonState();
                } finally {
                    this.ignorePageNumberUpdate = false;
                }
                this.pageNumber = pageNumber;
                this.pageNumberInput.set("value", this.pageNumber);
                this._updatePageButtonState();
            },

            _pageNumberKeyUp: function (event) {
                switch (event.keyCode) {
                    case keys.ENTER:
                        this._changePageNumber();
                        break;
                    case keys.ESCAPE:
                        this._resetPageNumber();
                        break;
                    default:
                        // We don't care about any other key
                        break;
                }
            },

            _resetPageNumber: function () {
                this.ignorePageNumberUpdate = true;
                try {
                    this.pageNumberInput.set("value", this.pageNumber);
                } finally {
                    this.ignorePageNumberUpdate = false;
                }
                this._updatePageButtonState();
            },

            // Change to the previous page
            _prevPage: function () {
                if (this.pagePrevDisabled) {
                    return;
                }
                this.setPageNumber(this.pageNumber - 1);
            },

            // Change to the next page
            _nextPage: function () {
                if (this.pageNextDisabled) {
                    return;
                }
                this.setPageNumber(this.pageNumber + 1);
            },

            _pageTotalMouseDown: function (e) {
                e.preventDefault();
            }
        });
    }
);
