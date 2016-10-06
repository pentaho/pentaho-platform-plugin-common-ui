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
  "module",
  "pentaho/lang/Event",
  "../mixins/mixinDataFilter",
  "pentaho/util/error",
  "pentaho/util/fun"
], function(module, Event, mixinDataFilter, error, F) {

  "use strict";

  return Event.extend(module.id, /** @lends pentaho.visual.base.events.WillSelect# */{

      /**
       * @alias WillSelect
       * @memberOf pentaho.visual.base.events
       * @class
       * @extends pentaho.visual.base.events.Will
       * @mixes pentaho.visual.base.mixins.mixinDataFilter
       *
       * @classDesc This event is triggered when
       * the {@link pentaho.visual.base.Model#selectAction|Select Action} flow starts.
       * The listeners of `will:select` are allowed to:
       * - cancel the event
       * - replace the input data filter
       * - replace the selection mode
       *
       * @constructor
       * @description Creates a `WillSelect` event.
       *
       * @param {!pentaho.visual.base.Model} source - The model object which is emitting the event.
       * @param {!pentaho.type.filter.Abstract} dataFilter - A filter representing the dataset of the visual element(s)
       * which the user interacted with.
       * @param {?function} selectionMode - A function that represents how the selection made by the user
       * will be merged with the current selection.
       */
      constructor: function(source, dataFilter, selectionMode) {
        this.base("will:select", source, true);
        this._initFilter(dataFilter, true);
        this.selectionMode = selectionMode;
      },

      /**
       * Gets or sets the selection mode that will be used to handle the user selection.
       *
       * @type {?function}
       *
       * @throws {pentaho.lang.ArgumentInvalidTypeError} When `mode` is not a `function`.
       */
      set selectionMode(mode) {
        if(mode != null && !F.is(mode)) {
          throw error.argInvalidType("selectionMode", "function", typeof mode);
        }
        this._selectionMode = mode;
      },

      get selectionMode() {
        return this._selectionMode;
      }
    }, /** @lends pentaho.visual.base.events.WillSelect */{

      /**
       * Gets the event type.
       *
       * @type {string}
       * @readonly
       */
      get type() {
        return "will:select";
      }
    })
    .implement(mixinDataFilter);

});
