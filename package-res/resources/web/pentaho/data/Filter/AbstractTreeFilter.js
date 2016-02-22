/*!
 * Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
  "./AbstractFilter",
  "./_toSpec"
], function(AbstractFilter, toSpec) {
  "use strict";

  var AbstractTreeFilter = AbstractFilter.extend({
    constructor: function(children) {
      //children = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
      if(children instanceof Array)
        this._children = children.slice();
      else
        this._children = children ? [children] : [];
    },

    _children: null,
    get children() {
      return this._children;
    },

    insert: function(element) {
      this._children.push(element);
      return this;
    },

    contains: function(entry) {
      return false;
    },

    /**
     * @inheritdoc
     */
    toSpec: function() {
      var operands = [];
      if(this.children.length) {
        this.children.forEach(function(child) {
          var childSpec = child.toSpec();
          if(childSpec)
            operands.push(childSpec);
        });
      }
      return toSpec(this.type, operands.length ? operands : null);
    }
  });

  return AbstractTreeFilter;

});