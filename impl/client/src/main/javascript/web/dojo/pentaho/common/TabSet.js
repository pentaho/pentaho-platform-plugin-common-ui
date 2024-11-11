/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "dojo/_base/declare",
  "dijit/_WidgetBase",
  "dijit/_Templated",
  "dojo/on",
  "dojo/query",
  "dojo/dom-class",
  "dijit/registry",
  "dojo/dom-construct",
  "dojo/_base/lang",
  "common-ui/dompurify"
], function(declare, _WidgetBase, _Templated, on, query, domClass, registry, construct, lang, DOMPurify) {
  return declare("pentaho.common.TabSet", [_WidgetBase, _Templated], {
    templateString: '<div data-dojo-attach-point="tabSetDiv" style="margin-right: 0px"></div>',

    tabs: [],

    stackContainerId: null,

    setTabs: function( tabs ) {

      if(this.tabSetDiv.childNodes.length>0) {
        // we already have tabs
        return;
      }

      var _this = this;
      this.tabs = tabs;
      var html = "";
      domClass.add(this.tabSetDiv, 'pentaho-tabBar');
      this.tabSetDiv.setAttribute("role", "tablist");
      for(var idx=0; idx<this.tabs.length; idx++) {
        var div = construct.create('div', {}, this.tabSetDiv);
        div.setAttribute("role", "tab");
        div.setAttribute( 'tabId', this.tabs[idx].id);
        div.addEventListener("keydown", function (event) {
          var target = event.currentTarget;
          switch (event.key) {
            case "ArrowLeft":
              if (target.previousElementSibling) {
                  _this.setSelectedTab(target.previousElementSibling.getAttribute('tabId'));
              } else {
                  _this.setSelectedTab(target.parentElement.lastElementChild.getAttribute('tabId'));
              }
              break;
            case "ArrowRight":
              if (target.nextElementSibling) {
                _this.setSelectedTab(target.nextElementSibling.getAttribute('tabId'));
              } else {
                _this.setSelectedTab(target.parentElement.firstElementChild.getAttribute('tabId'));
              }
              break;
          }
        }, true);
        this.tabs[idx].element = div;
        domClass.add(div, 'pentaho-tabWidget');
        if(idx === 0) {
          domClass.add(div, 'pentaho-tabWidget-selected');
          div.setAttribute("tabindex", "0");
        }
        var span = construct.create('span', {}, div);
        domClass.add(span, 'pentaho-tabWidgetLabel', div);
        span.setAttribute( 'tabId', this.tabs[idx].id);
        span.innerHTML = DOMPurify.sanitize(this.tabs[idx].title);
        on(div, 'click', lang.hitch(this, this.tabClicked));
      }
    },

    tabClicked: function(event) {
      var tabId = event.target.getAttribute( 'tabId');
      this.setSelectedTab(tabId);
    },

    setSelectedTab: function(tabId) {
      // find this tab
      for(var idx=0; idx<this.tabs.length; idx++) {
        if(this.tabs[idx].id === tabId) {
          // set this tab using the index
          this.setSeletedTabIdx(idx);
        }
      }
    },

    setSeletedTabIdx: function(tabIdx) {
      var panelId = this.tabs[tabIdx].id;
      for (var idx = 0; idx < this.tabs.length; idx++) {
        var currentTab = this.tabs[idx].element;
        if (tabIdx === idx) {
          domClass.add(currentTab, 'pentaho-tabWidget-selected');
          currentTab.setAttribute("tabindex", "0");
          currentTab.setAttribute("aria-selected", "true");
          currentTab.focus();
        } else {
          domClass.remove(currentTab, 'pentaho-tabWidget-selected');
          currentTab.setAttribute("tabindex", "-1");
          currentTab.setAttribute("aria-selected", "false");
        }
      }
      if(this.tabs[tabIdx].beforeCallback) {
        this.tabs[tabIdx].beforeCallback(this.tabs[tabIdx]);
      }
      if(this.stackContainerId) {
          registry.byId(this.stackContainerId).selectChild(panelId, false);
      }
      if(this.tabs[tabIdx].afterCallback) {
        this.tabs[tabIdx].afterCallback(this.tabs[tabIdx]);
      }
    }
  });
});
