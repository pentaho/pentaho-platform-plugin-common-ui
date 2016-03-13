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
  "pentaho/lang/Event",
  "pentaho/util/error"
], function(Event, error) {
  "use strict";

  return function rejected(type) {
    var fullType = "rejected:" + type;

    return Event.extend("pentaho.visual.base.events.Rejected",
      /** @lends pentaho.visual.base.events.Rejected# */{
        constructor: function(source, error) {
          if(!error) throw error.argRequired("error");
          this.base(this.constructor.type, source, false);
          this.error = error;
        }
      }, {
        get type() {
          return fullType;
        }
      });
  };

});