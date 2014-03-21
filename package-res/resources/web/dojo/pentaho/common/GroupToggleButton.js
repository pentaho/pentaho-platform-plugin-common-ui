/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_Templated", "dojo/on", "dojo/query", "dojo/topic", 'pentaho/common/ToggleButton', "dojo/dom-class",
  "dojo/_base/lang"],
    function (declare, _WidgetBase, _Templated, on, query, topic, ToggleButton, domClass, lang) {
      return declare("pentaho.common.GroupToggleButton",[ToggleButton], {

        groupName: "group",           // name of the group of buttons. used as part of the event publishing channel to handle related buttons getting selected
        first: false,                 // is the button first in the group?
        last: false,                  // is the button last in the group?
        orientation: "horizontal",    // "vertical" or "horizontal"

        postCreate: function () {
          this.inherited(arguments);
          this.init();
        },

        postMixInProperties: function () {
          this.inherited(arguments);
          this.unselectChannel = '/ButtonGroup/' + this.groupName;

          // listen for related buttons publishing on the unselectChannel. deselect ourselves in that case.
          this.subscription = topic.subscribe(this.unselectChannel, lang.hitch(this, '_unselect'));
        },

        init: function () {
          this._applyGroupStyling();
        },

        _applyGroupStyling: function () {
          if (this.orientation != null) {
            domClass.add(this.outerNode, "pentaho-toggle-button-" + this.orientation);

            if (this.first) {
              domClass.add(this.outerNode, "pentaho-toggle-button-" + this.orientation + "-first");
            }

            if (this.last) {
              domClass.add(this.outerNode, "pentaho-toggle-button-" + this.orientation + "-last");
            }

          }
        },

        _setDisabled: function (disabled) {
          this.inherited(arguments);
          this._applyGroupStyling();
        },

        _onHover: function () {
          this.inherited(arguments);
          this._applyGroupStyling();
        },

        _onUnhover: function () {
          this.inherited(arguments);
          this._applyGroupStyling();
        },

        _onClick: function () {
          if (this.disabled) {
            return;
          }
          // don't allow unselection by clicking on the selected button
          if (!this.checked) {
            this._setChecked(!this.checked);
            if (this.onChange) {
              this.onChange(this.checked);
            }
            // notify the other members in the group that we've been clicked/selected
            topic.publish(this.unselectChannel, this);
          }
        },

        _unselect: function (/*Object*/ button) {
          if (button !== this && this.checked) {
            try {
              this.set('checked', false);
              this._onUnhover();    // to get rid of any styling
            } catch (err) {
              // couldn't set it
            }
          }
        },

        uninitialize: function () {
          this.inherited(arguments);
          if(this.subscription){
            this.subscription.remove();
          }
        }


      });
    });

