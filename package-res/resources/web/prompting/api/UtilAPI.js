/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
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
 *
 */

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

    this.validateSingleParameter = function(paramDefn, name, untrustedValue) {
      return this._parameterValidator.validateSingleParameter(paramDefn, name, untrustedValue);
    };

    this.checkParametersErrors = function(paramDefn) {
      return this._parameterValidator.checkParametersErrors(paramDefn);
    };
  }
});
