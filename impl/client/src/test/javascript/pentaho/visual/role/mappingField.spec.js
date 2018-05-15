/*!
 * Copyright 2017 - 2018 Hitachi Vantara. All rights reserved.
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
  "pentaho/visual/role/MappingField",
  "pentaho/type/SpecificationScope"
], function(MappingField, SpecificationScope) {

  "use strict";

  describe("pentaho.visual.role.MappingField", function() {

    describe("constructor(name|spec)", function() {

      it("should allow creating with a spec object", function() {

        var name = "foo";
        var mapping = new MappingField({name: name});
        expect(mapping instanceof MappingField).toBe(true);

        expect(mapping.name).toBe(name);
      });

      it("should allow creating with a string and recognize it as the name property", function() {

        var name = "foo";
        var mapping = new MappingField(name);
        expect(mapping instanceof MappingField).toBe(true);

        expect(mapping.name).toBe(name);
      });
    });

    describe("#toSpecInContext(keyArgs)", function() {

      var specScope;

      beforeEach(function() {

        specScope = new SpecificationScope();
      });

      it("should return a string when only the name property is serialized", function() {
        function expectIt(serializeOptions) {
          var name = "foo";
          var mapping = new MappingField({name: name});

          var result = mapping.toSpecInContext(serializeOptions);

          specScope.dispose();

          expect(result).toBe(name);
        }

        expectIt({includeDefaults: false});
        expectIt({includeDefaults: true});
      });

      it("should return an array when the base serialization is an array", function() {

        var mapping = new MappingField({name: "foo"});

        var result = mapping.toSpecInContext({includeDefaults: false, preferPropertyArray: true});

        specScope.dispose();

        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});
