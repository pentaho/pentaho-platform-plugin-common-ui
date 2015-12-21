/*
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License, version 2.1 as published by the Free Software
 * Foundation.
 *
 * You should have received a copy of the GNU Lesser General Public License along with this
 * program; if not, you can obtain a copy at http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html
 * or from the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * Copyright 2015 Pentaho Corporation. All rights reserved.
 */

CONTEXT_PATH = (typeof CONTEXT_PATH === 'undefined') ? '' : CONTEXT_PATH;
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
