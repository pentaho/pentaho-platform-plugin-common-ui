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
  "./ListChange"
], function(ListChange) {
  "use strict";

  return ListChange.extend("pentaho.type.RemoveChange", {

    constructor: function(owner, elem, index) {
      this.base(owner);

      this.at = index;
      this.elems = elem instanceof Array ? elem : [elem];
    },

    type: "remove",

    simulate: function(list) {
      var index = this.at;
      var elem = this.elems[0];

      list._elems.splice(index, 1);
      delete list._keys[elem.key];

      // list._elems.splice(index, elems.length);
      // elems.forEach(function(elem){
      //   delete list._keys[elem.key];
      // });
      return list;
    }
  });
});

