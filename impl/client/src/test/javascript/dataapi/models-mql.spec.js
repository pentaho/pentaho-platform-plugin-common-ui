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

    it("mql.submit() should not call eval() for obtained result", function() {
      var bogusResponse = 'setFlag()';
      mql.getText = returnTextFunction(bogusResponse);

      flag = false;
      var result = mql.submit('');
      // returns null on errors
      expect(result).toBeNull();
      expect(flag).toBeFalsy();
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

  describe("Models MQL", function() {

    it("should enclose domain id with CDATA when serializing", function() {

      var mqlQuery = new pentaho.pda.query.mql(new pentaho.pda.model.mql(
          {domainId: 'domain',
            modelId: 'model'
          }
      ));

      var serializedQuery = mqlQuery.serialize();

      expect(serializedQuery).toBe("<mql>\n" +
          "<domain_type>relational</domain_type>\n" +
          "<domain_id><![CDATA[domain]]></domain_id>\n" +
          "<model_id>model</model_id>\n" +
          "<options>\n" +
          "<disable_distinct>false</disable_distinct>\n" +
          "</options>\n" +
          "<parameters>\n" +
          "</parameters>\n" +
          "<selections>\n" +
          "</selections>\n" +
          "<constraints>\n" +
          "</constraints>\n" +
          "<orders>\n" +
          "</orders>\n" +
          "</mql>\n");
    });
  });
});
