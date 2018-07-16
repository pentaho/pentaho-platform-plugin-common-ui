/*!
 * Copyright 2018 Hitachi Vantara.  All rights reserved.
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
  "pentaho/shim/es6-promise"
], function() {

  "use strict";

  describe("pentaho.type.loader", function() {

    it("should be an instance of Loader", function() {

      return require.using(["pentaho/type/loader", "pentaho/type/impl/Loader"], function(loader, Loader) {

        expect(loader instanceof Loader).toBe(true);
      });
    });

    it("should have standard types loaded by default", function() {

      return require.using(["pentaho/type/loader"], function(loader) {

        loader.resolveType("pentaho/type/Instance");
        loader.resolveType("pentaho/type/Value");
        loader.resolveType("pentaho/type/Element");
        loader.resolveType("pentaho/type/List");
        loader.resolveType("pentaho/type/Simple");
        loader.resolveType("pentaho/type/String");
        loader.resolveType("pentaho/type/Number");
        loader.resolveType("pentaho/type/Boolean");
        loader.resolveType("pentaho/type/Date");
        loader.resolveType("pentaho/type/Complex");
        loader.resolveType("pentaho/type/Object");
        loader.resolveType("pentaho/type/Function");
        loader.resolveType("pentaho/type/TypeDescriptor");
        loader.resolveType("pentaho/type/Property");
        loader.resolveType("pentaho/type/mixins/Enum");
        loader.resolveType("pentaho/type/mixins/DiscreteDomain");
      });
    });
  });
});
