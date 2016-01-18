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

define(["common-data/models-mql"], function(modelsMql) {
  describe("PPP-3455", function() {

    parseXML = function() {
        return {
          getElementsByTagName: function() { return {} }
        }
    };

    var flag;
    setFlag = function() {
      flag = true;
    }

    var mql;
    var queryObject;
    beforeEach(function() {
      mql = new pentaho.pda.model.mql('');
      mql.pentahoGet = function() { return {} };
      mql.handler = { METADATA_SERVICE_URL: '' };

      queryObject = { serialize: function() { return ''; } };
    });


    returnTextFunction = function(text) {
      return function() {
        return text;
      };
    }

    it("mql.submit() should parse valid response", function() {
      var obj = { field: 'value' };
      mql.getText = returnTextFunction(JSON.stringify(obj));

      var result = mql.submit('');
      expect(result).toEqual(obj);
    });

    it("mql.submit() should not call eval() for obtained result", function() {
      var bogusResponse = 'setFlag()';
      mql.getText = returnTextFunction(bogusResponse);

      flag = false;
      var result = mql.submit('');
      // returns null on errors
      expect(result).toBeNull();
      expect(flag).toBeFalsy();
    });


    it("mql.submitXmlQuery() should parse valid response", function() {
      var obj = { field: 'value' };
      mql.getText = returnTextFunction(JSON.stringify(obj));

      var result = mql.submitXmlQuery(queryObject);
      expect(result).toEqual(obj);
    });

    it("mql.submitXmlQuery() should not call eval() for obtained result", function() {
      var bogusResponse = 'setFlag()';
      mql.getText = returnTextFunction(bogusResponse);

      flag = false;
      var result = mql.submit('');
      // returns null on errors
      expect(result).toBeNull();
      expect(flag).toBeFalsy();
    });

  });
})
