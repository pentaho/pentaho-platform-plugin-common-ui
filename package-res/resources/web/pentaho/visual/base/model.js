/*!
 * Copyright 2010 - 2016 Pentaho Corporation. All rights reserved.
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
 */
define([
  "pentaho/lang/EventSource",
  "pentaho/type/complex",
  "pentaho/data/filter",
  "pentaho/util/error",
  "pentaho/util/object",
  "./types/selectionModes",

  "./events/WillSelect",
  "./events/DidSelect",
  "./events/CanceledSelect",
  "./events/FailedSelect",

  "./events/WillExecute",
  "./events/DidExecute",
  "./events/FailedExecute",
  "./events/CanceledExecute",

  "pentaho/i18n!type"
], function(EventSource, complexFactory, filter, error, O, selectionModes,
            WillSelect, DidSelect, CanceledSelect, FailedSelect,
            WillExecute, DidExecute, FailedExecute, CanceledExecute,
            bundle) {

  "use strict";

  /**
   * Creates the `Model` type of a given context.
   *
   * @name modelFactory
   * @memberOf pentaho.visual.base
   * @type pentaho.type.Factory.<pentaho.visual.base.Model>
   * @amd pentaho/visual/base/model
   */
  return function(context) {

    var Complex = context.get(complexFactory);

    /**
     * @name Model
     * @memberOf pentaho.visual.base
     * @class
     * @extends pentaho.type.Complex
     * @abstract
     * @classDesc This is the base model class for visualizations.
     *
     * @constructor
     * @description Creates a base `Model`.
     * @param {pentaho.visual.base.spec.IModel} modelSpec A plain object containing the model specification.
     */
    var Model = Complex.extend({
        constructor: function(modelSpec) {
          this.base(modelSpec);
        },

        _action: null,

        set action(_) {
          this._action = _;
        },

        get action() {
          return this._action;
        },

        select: function(dataFilter, keyArgs) {
          var isCanceled = false;
          var mutatedDataFilter = dataFilter;
          var selectionMode = keyArgs && keyArgs.selectionMode ? keyArgs.selectionMode : null;

          if(this._hasListeners(WillSelect.type)) {
            var willSelect = new WillSelect(this, dataFilter, selectionMode);
            isCanceled = !this._emit(willSelect);
            mutatedDataFilter = willSelect.dataFilter;
            if(!isCanceled) {
              selectionMode = willSelect.selectionMode;
            }
          }

          if(!isCanceled) {
            try {
              isCanceled = !this._changeSelection(mutatedDataFilter, selectionMode, keyArgs);
            } catch(e) {
              var failedSelect = new FailedSelect(this, mutatedDataFilter, e.message);
              this._emit(failedSelect);
              return false;
            }
          }

          if(isCanceled) {
            if(this._hasListeners(CancelSelect.type)) {
              //var cancelSelect =  new FilterEvent("canceled:select", this, false, mutatedDataFilter);
              var cancelSelect = new CancelSelect(this, mutatedDataFilter);
              this._emit(cancelSelect);
            }
            return false;
          } else {
            if(this._hasListeners(DidSelect.type)) {
              //var didSelect =  new FilterEvent("did:select", this, false, mutatedDataFilter);
              var didSelect = new DidSelect(this, mutatedDataFilter);
              this._emit(didSelect);
            }
            return true;
          }
        },

        execute: function(dataFilter) {
          var isCanceled = false;
          var willExecute = null;

          if(this._hasListeners(WillExecute.type)) {
            willExecute = new WillExecute(this, dataFilter, this.action); //listener can change dataFilter and/or action
            isCanceled = !!this._emit(willExecute);
          }

          if(isCanceled && this._hasListeners(CanceledExecute.type)) {
            var canceledExecute = new CanceledExecute(this, dataFilter);
            this._emit(canceledExecute);
            return false;
          }

          var action = O.getOwn(willExecute, "action", this.action);
          var mutatedDataFilter = O.getOwn(willExecute, "dataFilter", dataFilter);

          try {
            action(); //will use mutatedDataFilter
            if(this._hasListeners(DidExecute.type)) {
              var didExecute = new DidExecute(this, mutatedDataFilter);
              this._emit(didExecute);
            }
            return true;

          } catch(e) {
            if(this._hasListeners(FailedExecute.type)) {
              var failedExecute = new FailedExecute(this, mutatedDataFilter, e.message);
              this._emit(failedExecute);
            }
            return false;

          }
        },

        _changeSelection: function(candidateSelection, selectionMode, keyArgs) {
          var combineSelections = selectionMode || this.get("selectionMode");
          if(typeof combineSelections === "function") {
            var combinedSelection = combineSelections(this, candidateSelection, keyArgs);
            if(combinedSelection) {
              this.set("selectionFilter", combinedSelection);
              return true;
            }
          }
          return false;
        },

        meta: {
          id: "pentaho/visual/base",
          view: "View",
          isAbstract: true,
          props: [
            {
              name: "width",
              type: "number",
              isRequired: true
            },
            {
              name: "height",
              type: "number",
              isRequired: true
            },
            {
              name: "isInteractive",
              type: "boolean",
              value: true
            },
            {
              name: "data",
              type: "object",
              isRequired: true
            },
            {
              name: "selectionFilter",
              type: "object",
              value: new filter.Or()
            },
            {
              name: "selectionMode",
              type: "function",
              value: selectionModes.REPLACE
            }
          ]
        }
      })
      .implement(EventSource)
      .implement({meta: bundle.structured});

    return Model;
  };
});
