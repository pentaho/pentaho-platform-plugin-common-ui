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
  "./WillSelect"
], function(WillSelect) {
  "use strict";

  /**
   * @name WillChangeSelection
   * @memberOf pentaho.visual.base.events
   * @class
   * @extends pentaho.visual.base.events.Will
   * @abstract
   * @classDesc This is the base model class for visualizations.
   *
   * @constructor
   * @description Creates a base `Model`.
   * @param {pentaho.visual.base.spec.IModel} modelSpec A plain object containing the model specification.
   *
   * @event "will:select"
   */


  return WillSelect.extend("pentaho.visual.base.events.WillChangeSelection",
    /** @lends pentaho.visual.base.events.WillChangeSelection# */{}, {
      get type(){
        return "will:change:selection";
      }
    });

});