/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2028-08-13
 ******************************************************************************/

define([
  "pentaho/ccc/visual/Abstract",
  "pentaho/visual/Model",
  "pentaho/data/Table"
], function(AbstractView, Model, Table) {

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

    function getSampleViewSpec(config) {

      var dataTable = new Table(
        {
          model: [
            {name: "country", type: "string", label: "Country"},
            {name: "sales", type: "number", label: "Sales"}
          ],
          rows: [
            {c: [{v: "Portugal"}, {v: 12000}]},
            {c: [{v: "Ireland"}, {v: 6000}]}
          ]
        }
      );
      var model = new Model({data: dataTable, isAutoUpdate: false});
      var elem = document.createElement("div");
      return {model: model, domContainer: elem, config: config};
    }

    describe("#constructor", function() {

      it("should expose config.extension in the extension property", function() {

        var config = {extension: {foo: "bar"}};
        var viewSpec = getSampleViewSpec(config);
        var view = new AbstractView(viewSpec);

        expect(view.extension).toEqual(config.extension);
      });

      it("should have a default null extension property", function() {

        var viewSpec = getSampleViewSpec();
        var view = new AbstractView(viewSpec);

        expect(view.extension).toEqual(null);
      });
    });

    describe("#extension", function() {

      it("should respect a specified object value", function() {

        var viewSpec = getSampleViewSpec();
        var view = new AbstractView(viewSpec);

        var extension = {foo: "bar"};
        view.extension = extension;

        expect(view.extension).toEqual(extension);
      });

      it("should read the local value and not an inherited base value", function() {

        var classExtension = {foo: "barInherited"};
        var DerivedView = AbstractView.extend({
          extension: classExtension
        });

        var viewSpec = getSampleViewSpec();
        var view = new DerivedView(viewSpec);

        expect(view.extension).toBe(null);

        var extension = {foo: "barLocal"};
        view.extension = extension;
        expect(view.extension).toEqual(extension);
      });
    });
    describe("#extensionEffective", function() {

      it("should reflect a locally specified object value", function() {

        var viewSpec = getSampleViewSpec();
        var view = new AbstractView(viewSpec);

        var extension = {foo: "bar"};
        view.extension = extension;

        expect(view.extensionEffective).toEqual(extension);
      });

      it("should reuse the initially determined object value", function() {

        var viewSpec = getSampleViewSpec();
        var view = new AbstractView(viewSpec);

        var extension = {foo: "bar"};
        view.extension = extension;

        var result1 = view.extensionEffective;
        var result2 = view.extensionEffective;

        expect(result1).toBe(result2);
      });

      it("should reflect an inherited object value", function() {

        var extension = {foo: "bar"};
        var DerivedView = AbstractView.extend({
          extension: extension
        });

        var viewSpec = getSampleViewSpec();
        var view = new DerivedView(viewSpec);

        expect(view.extensionEffective).toEqual(extension);
      });

      it("should merge local and inherited object values", function() {

        var DerivedView = AbstractView.extend({
          extension: {foo: "bar"}
        });

        var viewSpec = getSampleViewSpec();
        var view = new DerivedView(viewSpec);
        view.extension = {bar: "foo"};

        expect(view.extensionEffective).toEqual({
          foo: "bar",
          bar: "foo"
        });
      });

      it("should override inherited properties with local properties", function() {

        var DerivedView = AbstractView.extend({
          extension: {foo: "barInherited"}
        });

        var viewSpec = getSampleViewSpec();
        var view = new DerivedView(viewSpec);
        view.extension = {foo: "barLocal"};

        expect(view.extensionEffective).toEqual({
          foo: "barLocal"
        });
      });
    });
  });
});
