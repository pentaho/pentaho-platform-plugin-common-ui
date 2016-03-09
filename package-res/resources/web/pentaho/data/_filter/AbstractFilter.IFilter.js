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
  "../../util/arg",
  "./And",
  "./Or",
  "./Not"
], function(arg, And, Or, Not) {
  "use strict";

  return /** @lends pentaho.data.filter.AbstractFilter# */{

    /**
     * Returns the inverse of this filter.
     *
     * @return {!pentaho.data.filter.Not} A filter that is the inverse of this filter.
     */
    invert: function() {
      return new Not(this);
    },

    /**
     * Returns the union between this filter and a variable number of other filters.
     *
     * @param {...pentaho.data.filter.AbstractFilter} filters - One or more filters to be added to the union operation.
     * @return {!pentaho.data.filter.Or} A filter that is the union of this filter with a series of other filters.
     */
    or: function() {
      if(!arguments.length) return this;
      var args = arg.slice(arguments);
      args.unshift(this);
      return new Or(args);
    },

    /**
     * Returns the intersection between this filter and a variable number of other filters.
     *
     * @param {...pentaho.data.filter.AbstractFilter} filters - One or more filters to be added to the intersection operation.
     * @return {!pentaho.data.filter.And} A filter that is the intersection of this filter with a series of other filters.
     */
    and: function() {
      if(!arguments.length) return this;
      var args = arg.slice(arguments);
      args.unshift(this);
      return new And(args);
    }

  };

});