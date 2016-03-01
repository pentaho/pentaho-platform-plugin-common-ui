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
 */
define([
  "pentaho/type/Context",
  "pentaho/type/Property",
  "pentaho/type/PropertyMetaCollection",
  "pentaho/util/error"
], function(Context) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context();
  var Complex = context.get("pentaho/type/complex");

  describe("pentaho.type.Property.Meta -", function() {
    describe("#validate(owner) -", function() {
      var Derived;

      beforeEach(function() {
        Derived = Complex.extend({
          meta: {
            label: "Derived",
            props: [
              {name: "x", type: "string", required: true},
              {name: "y", type: ["string"], countMin: 2},
              {name: "z", type: ["string"], countMin: 1, countMax: 2},
              {name: "w", type: "string", required: true, applicable: false}
            ]
          }
        });
      });

      it("should return null", function() {
        var derived = new Derived({x: "1", y: ["1", "2", "3"], z: ["1", "2"]});
        expect(Derived.meta.validate(derived)).toBe(null);
      });

      it("should return three errors", function() {
        var derived = new Derived({y: ["1"], z: ["1", "2", "3"]});

        expect(Derived.meta.validate(derived).length).toBe(3);
      });
    });// end #validate(owner)
  }); // pentaho.type.Property.Meta
});
