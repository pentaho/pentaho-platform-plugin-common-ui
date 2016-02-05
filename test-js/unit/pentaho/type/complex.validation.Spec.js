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
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, error, bundle) {

  "use strict";

  /*global describe:false, it:false, expect:false, beforeEach:false, spyOn:false*/

  var context = new Context();
  var Complex = context.get("pentaho/type/complex");

  describe("pentaho.type.Complex.Meta -", function() {

    describe("#validate(value) -", function() {
      it("should call each property's validate with the owner complex", function() {
        var Derived = Complex.extend({
          meta: {
            props: [
              {name: "x", type: "number" },
              {name: "y", type: "string" },
              {name: "z", type: "boolean"}
            ]
          }
        });

        var derived = new Derived({x: 5, y: "a", z: true});

        var xPropMeta = derived.meta.get("x");
        var yPropMeta = derived.meta.get("y");
        var zPropMeta = derived.meta.get("z");

        spyOn(xPropMeta, "validate");
        spyOn(yPropMeta, "validate");
        spyOn(zPropMeta, "validate");

        Derived.meta.validate(derived);

        expect(xPropMeta.validate).toHaveBeenCalledWith(derived);
        expect(yPropMeta.validate).toHaveBeenCalledWith(derived);
        expect(zPropMeta.validate).toHaveBeenCalledWith(derived);
      });

    });// end #validate(value)

  }); // pentaho.type.Complex.Meta
});
