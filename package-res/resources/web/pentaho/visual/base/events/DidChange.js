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
], function(Event, utilError) {
  "use strict";

  return Event.extend("pentaho.visual.base.events.DidChange",
    /** @lends pentaho.visual.base.events.DidChange# */{
      constructor: function(source, value, will) {
        if(!will) throw utilError.argRequired("will");

        this.base("did:change", source, false);
        this._property = will.property;
        this._value = value;
        this._previousValue = will.previousValue;
      },
      get property(){
        return this._property;
      },
      get value(){
        return this._value;
      },
      get previousValue(){
        return this._previousValue;
      }
    },{
      get type() {
        return "did:change";
      }
    });

});
