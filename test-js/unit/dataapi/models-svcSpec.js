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

define(["common-data/models-svc", "common-repo/pentaho-ajax"], function(modelsSvc, pentahoAjax) {
  describe("PPP-3455", function() {

    // fake definition
    pentaho.DataTable = function( jsonTable ) {
      this.jsonTable = jsonTable;
    };

    var flag;
    setFlag = function() {
      flag = true;
    }

    var bogusResponse = 'setFlag()';

    var svc;
    var _pentahoPost;
    beforeEach(function() {
      svc = new pentaho.pda.model.svc('');
      svc.handler = { SERVICE_URL: '' };

      if (typeof pentahoPost !== 'undefined') {
        _pentahoPost = pentahoPost;
      }
    });

    afterEach(function() {
      if (typeof _pentahoPost !== 'undefined') {
        pentahoPost = _pentahoPost;
      }
    });


    returnTextFunction = function(text) {
      return function() {
        return text;
      };
    }

    it("svc.discoverModelDetail() should parse valid response", function() {
      var obj = {
        categories: [ { name: 'category' } ],
        capabilities: [ { name: 'capability' } ],
        elements: [ { name: 'element' } ]
      };
      pentahoPost = returnTextFunction(JSON.stringify(obj));

      svc.categories = null;
      svc.capabilities = null;
      svc.elements = null;

      svc.discoverModelDetail();
      expect(svc.categories).toEqual(obj.categories);
      expect(svc.capabilities).toEqual(obj.capabilities);
      expect(svc.elements).toEqual(obj.elements);
    });

    it("svc.discoverModelDetail() should not call eval() for obtained result", function() {
      pentahoPost = returnTextFunction(bogusResponse);

      flag = false;
      svc.categories = null;
      svc.capabilities = null;
      svc.elements = null;

      var call = function() {
        svc.discoverModelDetail();
      };
      expect(call).toThrowError(SyntaxError);

      expect(flag).toBeFalsy();
      expect(svc.categories).toBeNull();
      expect(svc.capabilities).toBeNull();
      expect(svc.elements).toBeNull();
    });


    it("svc.submit() should parse valid response", function() {
      var obj = { name: 'name' };
      pentahoPost = returnTextFunction(JSON.stringify(obj));

      var result = svc.submit('');
      expect(result.jsonTable).toEqual(obj);
    });

    it("svc.submit() should not call eval() for obtained result", function() {
      pentahoPost = returnTextFunction(bogusResponse);

      flag = false;
      var result = svc.submit('');
      // returns null on errors
      expect(result).toBeNull();
      expect(flag).toBeFalsy();
    });

  });
})
