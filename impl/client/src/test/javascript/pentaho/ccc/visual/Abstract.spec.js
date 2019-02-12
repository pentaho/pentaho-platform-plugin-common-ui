/*!
 * Copyright 2019 Hitachi Vantara.  All rights reserved.
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
  "pentaho/ccc/visual/Abstract"
], function(AbstractView) {

  "use strict";

  /* eslint max-nested-callbacks :0 */

  describe("pentaho.visual.ccc.views.Abstract", function() {

    it("should be a function", function() {
      expect(typeof AbstractView).toBe("function");
    });

    describe(".Type", function() {

      // Clear up the configured extensions.
      AbstractView.prototype.__extension = null;

      describe("#extension", function() {

        it("should respect a specified object value", function() {

          var extension = {foo: "bar"};

          var DerivedView = AbstractView.extend({
            extension: extension
          });

          expect(DerivedView.prototype.extension).toEqual(extension);
        });

        it("should convert a falsy value to null", function() {

          var DerivedView = AbstractView.extend({
            extension: false
          });

          expect(DerivedView.prototype.extension).toBe(null);
        });

        it("should read the local value and not an inherited base value", function() {
          var extension = {foo: "bar"};

          var DerivedView = AbstractView.extend({
            extension: extension
          });

          var DerivedView2 = DerivedView.extend();

          expect(DerivedView2.prototype.extension).toBe(null);
        });
      });

      describe("#extensionEffective", function() {

        it("should reflect a locally specified object value", function() {

          var extension = {foo: "bar"};
          var DerivedView = AbstractView.extend({
            extension: extension
          });

          expect(DerivedView.prototype.extensionEffective).toEqual(extension);
        });

        it("should reuse the initially determined object value", function() {

          var extension = {foo: "bar"};
          var DerivedView = AbstractView.extend({
            extension: extension
          });

          var result1 = DerivedView.prototype.extensionEffective;
          var result2 = DerivedView.prototype.extensionEffective;

          expect(result1).toBe(result2);
        });

        it("should reflect an inherited object value", function() {

          var extension = {foo: "bar"};
          var DerivedView = AbstractView.extend({
            extension: extension
          });

          var DerivedView2 = DerivedView.extend();

          expect(DerivedView2.prototype.extensionEffective).toEqual(extension);
        });

        it("should merge local and inherited object values", function() {

          var DerivedView = AbstractView.extend({
            extension: {foo: "bar"}
          });

          var DerivedView2 = DerivedView.extend({
            extension: {bar: "foo"}
          });

          expect(DerivedView2.prototype.extensionEffective).toEqual({
            foo: "bar",
            bar: "foo"
          });
        });

        it("should override inherited properties with local properties", function() {

          var DerivedView = AbstractView.extend({
            extension: {foo: "bar"}
          });

          var DerivedView2 = DerivedView.extend({
            extension: {foo: "gugu"}
          });

          expect(DerivedView2.prototype.extensionEffective).toEqual({
            foo: "gugu"
          });
        });
      });
    });
  });
});
