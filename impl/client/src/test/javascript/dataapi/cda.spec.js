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


define(["common-data/cda", "common-data/xhr"], function(cda, xhr) {

  describe("PPP-3455", function() {

    var bogusResponse = 'pentaho.cda.callCatcher.injection();';

    var callCatcher;

    beforeEach(function() {
      cda.descriptors = [];
      callCatcher = jasmine.createSpyObj('callCatcher', ['injection', 'func']);
    });

    afterEach(function() {
      if (typeof cda.callCatcher !== 'undefined') {
        delete cda.callCatcher;
      }
    });


    callbackInvokerFunction = function(response) {
      return function(url, callback) {
        callback.complete(response);
      };
    }

    it("discoverDescriptors() should not call eval() for obtained result", function() {
      spyOn(xhr, 'execute').and.callFake(callbackInvokerFunction(bogusResponse));

      cda.callCatcher = callCatcher;
      var call = function() { cda.discoverDescriptors(callCatcher.func); };
      expect(call).toThrowError(SyntaxError);

      expect(pentaho.xhr.execute).toHaveBeenCalled();
      expect(callCatcher.injection).not.toHaveBeenCalled();
      expect(callCatcher.func).not.toHaveBeenCalled();
    });

    it("discoverDescriptors() should parse valid response", function() {
      var response = JSON.stringify({ resultset: [ ['name', 'path'] ] });
      spyOn(xhr, 'execute').and.callFake(callbackInvokerFunction(response))

      cda.discoverDescriptors(callCatcher.func);

      var expectedDescriptors = [{name: 'name', path: 'path'}];

      expect(pentaho.xhr.execute).toHaveBeenCalled();
      expect(cda.descriptors).toEqual(expectedDescriptors);
      expect(callCatcher.func).toHaveBeenCalledWith(expectedDescriptors);
    });


    it("Descriptor.discoverQueries() should not call eval() for obtained result", function() {
      spyOn(xhr, 'execute').and.callFake(callbackInvokerFunction(bogusResponse))

      var desc = new cda.Descriptor('');
      var call = function() {
        desc.discoverQueries(callCatcher.func);
      };
      expect(call).toThrowError(SyntaxError);

      expect(pentaho.xhr.execute).toHaveBeenCalled();
      expect(callCatcher.injection).not.toHaveBeenCalled();
      expect(callCatcher.func).not.toHaveBeenCalled();
    });

    it("Descriptor.discoverQueries() should parse valid response", function() {
      var response = JSON.stringify({ resultset: [ ['id', 'name', 'type'] ] });
      spyOn(xhr, 'execute').and.callFake(callbackInvokerFunction(response));

      var desc = new cda.Descriptor('');
      desc.discoverQueries(callCatcher.func);

      expect(pentaho.xhr.execute).toHaveBeenCalled();
      expect(callCatcher.func).toHaveBeenCalled();

      expect(desc.queries.length).toEqual(1);
      expect(desc.queries[0].id).toEqual('id');
      expect(desc.queries[0].name).toEqual('name');
      expect(desc.queries[0].type).toEqual('type');
    });

  });
})
