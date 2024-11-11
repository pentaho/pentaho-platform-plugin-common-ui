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
