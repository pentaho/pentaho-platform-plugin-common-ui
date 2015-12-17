/*!
 * Copyright 2010 - 2013 Pentaho Corporation.  All rights reserved.
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
 * The Text Formatter class
 *
 * Generates basic formatters such as number or date formatters to replace a similar GWT module "formatter" (https://github.com/pentaho/pentaho-commons-gwt-modules/tree/master/pentaho-gwt-widgets/src/org/pentaho/gwt/widgets/client/formatter).
 *
 * @class
 * @name TextFormatter
 */
define('common-ui/util/TextFormatter', ['dojo/number', 'dojo/date/locale'], function(DojoNumber, DojoDateLocale) {
  var typeMap = {
    'number': 'number',
    'java.lang.Number': 'number',
    'java.lang.Byte': 'number',
    'java.lang.Short': 'number',
    'java.lang.Integer': 'number',
    'java.lang.Long': 'number',
    'java.lang.Float': 'number',
    'java.lang.Double': 'number',
    'java.math.BigDecimal': 'number',
    'java.math.BigInteger': 'number',

    'date': 'date',
    'java.util.Date': 'date',
    'java.sql.Date': 'date',
    'java.sql.Time': 'date',
    'java.sql.Timestamp': 'date'
  };

  /**
   * Returns a type of formatter depends on input parametr.
   *
   * @name TextFormatter#getFormatType
   * @param  {String} type The source type is needed to find according resulting formatter type
   * @returns {String}     Returns 'number' or 'date' depends on the input source type
   */
  var getFormatType = function(type) {
    return typeMap[type];
  }

  /**
   * Creates a number formatter based on dojo number formatter
   *
   * @private
   * @name TextFormatter#getNumberFormatter
   * @method
   * @param   {String} pattern    The number pattern based on dojo
   * @returns {*|{format, parse}} The number formatter
   */
  var getNumberFormatter = function(pattern) {
    return {
      format: function(value) {
        var result = null;
        if (value) {
          result = DojoNumber.format(value, {
            pattern: pattern
          });
        }
        return result;
      },
      parse: function(value) {
        var result = null;
        if (value) {
          result = DojoNumber.parse('' + value, {
            pattern: pattern
          });
        }
        return result;
      }
    };
  };

  /**
   * Creates a date formatter based on dojo date formatter
   *
   * @private
   * @name TextFormatter#getDateFormatter
   * @method
   * @param   {String} pattern    The date pattern based on dojo
   * @returns {*|{format, parse}} The date formatter
   */
  var getDateFormatter = function(pattern) {
    return {
      format: function(value) {
        var result = null;
        if (value) {
          result = DojoDateLocale.format(value, {
            datePattern: pattern,
            selector: "date"
          });
        }
        return result;
      },
      parse: function(value) {
        var result = null;
        if (value) {
          result = DojoDateLocale.parse('' + value, {
            datePattern: pattern,
            selector: "date"
          });
        }
        return result;
      }
    };
  };

  /**
   * Creates a number formatter or a date formatter depends on type and pattern.
   * The formatter should have two methods: format and parse.
   *
   * @method
   * @name TextFormatter#createFormatter
   * @param   {String} type       The type of formatter, see typeMap property for details
   * @param   {String} pattern    The pattern for concreate formatter
   * @returns {*|{format, parse}} An object capable of formatting the 'type' to and from text
   * @example
   *
   *     var formatter = {
   *       format: function(object) {
   *         return ...; // string
   *       },
   *       parse: function(string) {
   *         return ...; // object
   *       }
   *     };
   */
  var createFormatter = function(type, pattern) {
    var formatterType = typeMap[type];
    if (formatterType == 'number') {
      return getNumberFormatter(pattern);
    } else if (formatterType == 'date') {
      return getDateFormatter(pattern);
    }
  };

  return {
    getFormatType: getFormatType,
    createFormatter: createFormatter
  }
});
