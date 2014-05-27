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
 * Copyright 2014 Pentaho Corporation. All rights reserved.
 */

var CONTEXT_PATH = "";
define(["common-data/models-mql"], function(Mql) {

  describe("Models MQL", function() {

    beforeEach(function(){

    });

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
  })
})