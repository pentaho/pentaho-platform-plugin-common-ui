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


/**
 * The Prompting Util API Class
 * Provides utility functions for working with prompting.
 *
 * @name UtilAPI
 * @class
 */
define(["common-ui/prompting/parameters/ParameterXmlParser", "common-ui/prompting/parameters/ParameterValidator"], function(ParameterXmlParser, ParameterValidator) {
  return function(api) {
    this._parameterXmlParser = new ParameterXmlParser();
    this._parameterValidator = new ParameterValidator();

    /**
     * Parses the xml string and returns an instance of ParameterDefinition.
     *
     * @name UtilAPI#parseParameterXml
     * @method
     * @param  {String} xmlString    String with the xml. The format is described on {@link http://wiki.pentaho.com/display/Reporting/Specification+for+the+BI-Server+Plugin+Parameter-XML+format|the wiki page}.
     * @return {ParameterDefinition} Parameter Definition instance
     */
    this.parseParameterXml = function(xmlString) {
      return this._parameterXmlParser.parseParameterXml(xmlString);
    };

    this.validateSingleParameter = function(paramDefn, name, untrustedValue, defaultValues) {
      return this._parameterValidator.validateSingleParameter(paramDefn, name, untrustedValue, defaultValues);
    };

    this.checkParametersErrors = function(paramDefn) {
      return this._parameterValidator.checkParametersErrors(paramDefn);
    };
  }
});
