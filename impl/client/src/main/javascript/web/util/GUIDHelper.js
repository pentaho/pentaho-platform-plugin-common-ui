/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
  define(['cdf/lib/Base'], function (Base) {
  /**
   * Simple array of used Prompt GUIDs so they and their components can be uniquely identified.
   */

  var _assignedGUIDs = {};
  var _gen = function () {
    return Math.round(Math.random() * 100000);
  };

  return Base.extend({
    /**
     * Generates a random id
     *
     * @returns {string}
     */
    _assignedGUIDs: {},

    generateGUID: function () {
      var guid = _gen();
      while (_assignedGUIDs[guid]) {
        guid = _gen();
      }
      _assignedGUIDs[guid] = true;
      return '' + guid;
    },

    /**
     * Reset the collection of assigned GUIDs
     */
    reset: function () {
      _assignedGUIDs = {};
    }
  });
});
