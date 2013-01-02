/**
 * The Pentaho proprietary code is licensed under the terms and conditions
 * of the software license agreement entered into between the entity licensing
 * such code and Pentaho Corporation. 
 */

dojo.provide("pentaho.common.PageControl");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.NumberTextBox");

/**
 * Pentaho Interactive Reporting Page Control Component.
 * 
 * To declare:
 * <div dojoType="pentaho.common.PageControl" id="mypagecontrol"></div>
 *   or
 * var pc = new pentaho.common.PageControl();
 * 
 * To initialize before use (for example):
 * var pc = dijit.byId("mypagecontrol");
 * pc.registerLocalizationLookup(mylocaleservice.getString);
 * pc.registerPageNumberChangeCallback(controller.updatePageNumber);
 * 
 */
dojo.declare(
  "pentaho.common.PageControl",
  [dijit._Widget, dijit._Templated],
{
  // Parse widgets in template string
  widgetsInTemplate: true,
  // Template for this widget
  templateString: "<div class='pc_pageControlContainer' dojoAttachPoint='containerNode'><div class='pc_pagePrev' dojoAttachPoint='prevPageControl'></div><div class='pc_pageNext' dojoAttachPoint='nextPageControl'></div><div dojoAttachPoint='pageNumberInput' dojoType='dijit.form.NumberTextBox' class='pc_pageNumberInput' constraints='{min:1}'></div><div class='pc_pageTotal contrast-color' dojoAttachPoint='pageTotalSpan'>/ ##</div></div>",

  // Function for retrieving localized strings
  getLocaleString: null,

  // Callback to set page number
  changePageNumberCallback: null,

  // Current page number
  pageNumber: 1,

  // Total pages in this report
  pageTotal: 1,

  // Called once per instance
  postCreate: function() {
    this.inherited(arguments);
    this._resetPageNumber();
    this.setPageCount(this.pageTotal);
    this.connect(this.pageNumberInput, "onChange", this._changePageNumber);
    this.connect(this.pageNumberInput, "onKeyUp", this._pageNumberKeyUp);
    this.connect(this.prevPageControl, "onclick", this._prevPage);
    this.connect(this.nextPageControl, "onclick", this._nextPage);
  },

  registerLocalizationLookup: function(f) {
    this.getLocaleString = f;
    this._localize();
  },

  registerPageNumberChangeCallback: function(f) {
    this.changePageNumberCallback = f;
  },

  setPageNumber: function(pageNumber) {
    if (pageNumber < 1 || pageNumber > this.pageTotal) {
      // TODO Alert user of invalid entry
      this._resetPageNumber();
      return;
    }
    if (this.pageNumber === pageNumber) {
      // Prevent page number updates to the same value
      return;
    }
    try {
      this._updateInternalPageNumber(pageNumber);
    } catch (err) {
      console.error("Unable to update page number: " + err);
      this._resetPageNumber();
    }
  },
  
  getPageNumber: function() {
    return this.pageNumberInput.get("value");
  },

  getPageTotal: function() {
    return this.pageTotal;
  },

  setPageCount: function(pageCount) {
    if (typeof(pageCount) == 'number') {
      this.pageTotal = pageCount;
    } else {
      this.pageTotal = 1; // Reset to default
    }
    this.pageTotalSpan.innerHTML = '/ ' + pageCount;
    this._updatePageButtonState();
  },

  reset: function() {
    this._updateInternalPageNumber(1);
  },
  
  _localize: function() {
    dojo.attr(this.prevPageControl, "title", this.getLocaleString("PageControlPreviousPage_title"));
    dojo.attr(this.nextPageControl, "title", this.getLocaleString("PageControlNextPage_title"));
  },

  _updatePageButtonState: function() {
    this.pagePrevDisabled = this.pageNumber == 1;
    this.pageNextDisabled = this.pageTotal == this.pageNumber;
    if (this.pagePrevDisabled) {
      dojo.addClass(this.prevPageControl, "pc_pagePrevDisabled");
    } else {
      dojo.removeClass(this.prevPageControl, "pc_pagePrevDisabled");
    }
    if (this.pageNextDisabled) {
      dojo.addClass(this.nextPageControl, "pc_pageNextDisabled");
    } else {
      dojo.removeClass(this.nextPageControl, "pc_pageNextDisabled");
    }
  },

  _changePageNumber: function() {
    if (!this.pageNumberInput.isValid()) {
      this._resetPageNumber();
      return;
    }
    this.setPageNumber(this.pageNumberInput.get("value"));
  },

  _updateInternalPageNumber: function(pageNumber) {
    if (this.changePageNumberCallback) {
      this.changePageNumberCallback(pageNumber);
    }
    this.pageNumber = pageNumber;
    this.pageNumberInput.set("value", this.pageNumber, false);
    this._updatePageButtonState();
  },

  _pageNumberKeyUp: function(event) {
    switch (event.keyCode) {
      case dojo.keys.ENTER:
        this._changePageNumber();
        break;
      case dojo.keys.ESCAPE:
        this._resetPageNumber();
        break;
      default:
        // We don't care about any other key
        break;
    }
  },

  _resetPageNumber: function() {
    this.pageNumberInput.set("value", this.pageNumber);
    this._updatePageButtonState();
  },

  // Change to the previous page
  _prevPage: function() {
    if (this.pagePrevDisabled) {
      return;
    }
    this.setPageNumber(this.pageNumber - 1);
  },

  // Change to the next page
  _nextPage: function() {
    if (this.pageNextDisabled) {
      return;
    }
    this.setPageNumber(this.pageNumber + 1);
  }
});