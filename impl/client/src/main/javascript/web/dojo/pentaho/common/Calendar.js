/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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

define(["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-class", "dojo/query", "dijit/Calendar", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/text!pentaho/common/Calendar.html", "pentaho/common/SmallImageButton", "pentaho/common/DropDownButton", "dojo/_base/event", "dojo/on"],
    function(declare, lang, domClass, query, Calendar, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, templateStr, SmallImageButton, DropDownButton, event, on){

      declare("PentahoCalendar._MonthDropDown", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //    The month drop down

        // months: String[]
        //    List of names of months, possibly w/some undefined entries for Hebrew leap months
        //    (ex: ["January", "February", undefined, "April", ...])
        months: [],

        templateString: "<div class='pentaho-listbox' " +
            "dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>",

        _setMonthsAttr: function(/*String[]*/ months){
          this.domNode.innerHTML = array.map(months, function(month, idx){
            return month ? "<div class='pentaho-listitem' month='" + idx +"'>" + month + "</div>" : "";
          }).join("");
        },

        _onClick: function(/*Event*/ evt){
          this.onChange(evt.target.getAttribute("month"));
        },

        onChange: function(/*Number*/ month){
          // summary:
          //   Callback when month is selected from drop down
        },

        _onMenuHover: function(evt){
          domClass.toggle(evt.target, "pentaho-listitem-hover", evt.type == "mouseover");
        }
      });

      return declare("pentaho.common.Calendar", [Calendar,_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
          {

            templateString: templateStr,

            buildRendering: function(){
              this.inherited(arguments);
              // hookup the previous/next year buttons
              on(this.previousYearLabelNode, "click", lang.hitch(this, this._prevYearClick));
              on(this.nextYearLabelNode, "click", lang.hitch(this, this._nextYearClick));

              // replace the month drop down with a customized one
              //this.monthDropDownButton.dropDown.destroy();
              // this.monthDropDownButton.dropDown =

            },

            _populateGrid: function() {
              this.inherited(arguments);

              // add theme styles to the cells containing the days
              query(".dijitCalendarDateLabel", this.domNode).forEach(function(cell){
                domClass.add(cell, 'label');
              }, this);
              query(".dijitCalendarPreviousMonth", this.domNode).forEach(function(cell){
                domClass.add(cell, 'pentaho-light-text');
              }, this);
              query(".dijitCalendarNextMonth", this.domNode).forEach(function(cell){
                domClass.add(cell, 'pentaho-light-text');
              }, this);
              query(".dijitCalendarCurrentMonth", this.domNode).forEach(function(cell){
                domClass.add(cell, 'pentaho-listitem');
              }, this);
              query(".dijitCalendarCurrentDate", this.domNode).forEach(function(cell){
                domClass.remove(cell, 'pentaho-listitem');
                domClass.add(cell, 'panel-content');
              }, this);
              query(".dijitCalendarSelectedDate", this.domNode).forEach(function(cell){
                domClass.add(cell, 'pentaho-listitem-selected');
              }, this);
            },

            _onDayMouseOver: function(/*Event*/ evt){
              var node =
                  domClass.contains(evt.target, "dijitCalendarDateLabel") ?
                      evt.target.parentNode :
                      evt.target;

              if(node && (node.dijitDateValue || node == this.previousYearLabelNode || node == this.nextYearLabelNode) ){
                domClass.add(node, "pentaho-listitem-hover");
                this._currentNode = node;
              }
            },

            _onDayMouseOut: function(/*Event*/ evt){
              // summary:
              //      Handler for mouse out events on days, clears hovered style
              // tags:
              //      protected

              if(!this._currentNode){ return; }

              // if mouse out occurs moving from <td> to <span> inside <td>, ignore it
              if(evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode){ return; }
              var cls = "pentaho-listitem-hover";
              if(domClass.contains(this._currentNode, "dijitCalendarActiveDate")) {
                cls += " pentaho-listitem-hover";
              }
              domClass.remove(this._currentNode, cls);
              this._currentNode = null;
            },

            _onDayMouseUp: function(/*Event*/ evt){
              this.inherited(arguments);
              var node = evt.target.parentNode;
              if(node && node.dijitDateValue){
                domClass.add(node, "pentaho-listitem-selected");
              }
            },

            _onDayClick: function(/*Event*/ evt){
              this.inherited(arguments);
              // summary:
              //      Handler for day clicks, selects the date if appropriate
              // tags:
              //      protected
              event.stop(evt);
              for(var node = evt.target; node && !node.dijitDateValue; node = node.parentNode);
              if(node && !domClass.contains(node, "dijitCalendarDisabledDate")){
                domClass.add(node, "pentaho-listitem-selected");
              }
            }


          }
      );
    });
