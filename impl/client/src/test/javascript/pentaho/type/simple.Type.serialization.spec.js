/*!
 * Copyright 2010 - 2017 Hitachi Vantara.  All rights reserved.
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
  "tests/pentaho/type/serializationUtil"
], function(Context, serializationUtil) {

  "use strict";

  /* global describe:false, it:false, expect:false, beforeEach:false, afterEach:false, spyOn:false*/

  describe("pentaho.type.Simple.Type", function() {

    var context;
    var Simple;

    beforeEach(function(done) {
      Context.createAsync()
          .then(function(_context) {
            context = _context;
            Simple  = context.get("pentaho/type/simple");
          })
          .then(done, done.fail);
    });

    describe("#_fillSpecInContext(spec, keyArgs)", function() {

      it("should return false when there are no attributes to serialize", function() {
        var spec = {};
        var typeSpec = {};
        expect(serializationUtil.fillSpec(Simple, spec, typeSpec)).toBe(false);
      });

      it("should return true when there are attributes to serialize", function() {
        var spec = {};
        var typeSpec = {label: "Foo"};

        expect(serializationUtil.fillSpec(Simple, spec, typeSpec)).toBe(true);
      });

      describe("#cast", function() {
        serializationUtil.itFillSpecMethodAttribute(function() { return Simple; }, "cast");

        it("should not serialize when value is local and isJson: true", function() {
          var spec = {};
          var typeSpec = {cast: function() {}};
          var result = serializationUtil.fillSpec(Simple, spec, typeSpec, {isJson: true});

          expect(result).toBe(false);
        });
      });
    });
  });
});
