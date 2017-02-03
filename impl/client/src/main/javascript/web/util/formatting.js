/*!
* Copyright 2010 - 2016 Pentaho Corporation.  All rights reserved.
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
 * @name formatting
 */
define("common-ui/util/formatting", ['common-ui/util/timeutil', 'common-ui/util/TextFormatter'], function(ReportTimeUtil, TextFormatter) {
  return {
    /**
     * Create a text formatter that formats to/from text. This is designed to convert between data formatted as a string
     * and the Reporting Engine's expected format for that object type.
     * e.g. "01/01/2003" <-> "2003-01-01T00:00:00.000-0500"
     */
    createDataTransportFormatter: function(parameter) {
      var formatterType = TextFormatter.getFormatType(parameter.type);
      if (formatterType == 'number') {
        return {
          format: function(number) {
            return '' + number;
          },
          parse: function(s) {
            return s;
          }
        }
      } else if (formatterType == 'date') {
        return this._createDateTransportFormatter(parameter);
      }
    },

    /**
     * Create a text formatter that can convert between a parameter's defined format and the transport
     * format the Pentaho Reporting Engine expects.
     */
    createFormatter: function(parameter, pattern) {
      // Create a formatter if a date format was provided and we're not a list parameter type. They are
      // mutually exclusive.
      var dataFormat = pattern || parameter.attributes['data-format'];
      if (!parameter.list && dataFormat) {
        return TextFormatter.createFormatter(parameter.type, dataFormat);
      }
    },

    _initDateFormatters: function() {
      // Lazily create all date formatters since we may not have createFormatter available when we're loaded
      if (!this.dateFormatters) {
        this.dateFormatters = {
          'with-timezone': TextFormatter.createFormatter('date', "yyyy-MM-dd'T'HH:mm:ss.SSSZ"),
          'without-timezone': TextFormatter.createFormatter('date', "yyyy-MM-dd'T'HH:mm:ss.SSS"),
          'utc': TextFormatter.createFormatter('date', "yyyy-MM-dd'T'HH:mm:ss.SSS'+0000'"),
          'simple': TextFormatter.createFormatter('date', "yyyy-MM-dd")
        }
      }
    },

    /**
     * Create a formatter to pass data to/from the Pentaho Reporting Engine. This is to maintain compatibility
     * with the Parameter XML output from the Report Viewer.
     */
    _createDataTransportFormatter: function(parameter, formatter) {
      var formatterType = TextFormatter.getFormatType(parameter.type);
      if (formatterType == 'number') {
        return {
          format: function(object) {
            return formatter.format(object);
          },
          parse: function(s) {
            return '' + formatter.parse(s);
          }
        }
      } else if (formatterType == 'date') {
        var transportFormatter = this._createDateTransportFormatter(parameter);
        return {
          format: function(dateString) {
            return formatter.format(transportFormatter.parse(dateString));
          },
          parse: function(s) {
            return transportFormatter.format(formatter.parse(s));
          }
        }
      }
    },

    /**
     * This text formatter converts a Date to/from the internal transport format (ISO-8601) used by Pentaho Reporting Engine
     * and found in parameter xml generated for Report Viewer.
     */
    _createDateTransportFormatter: function(parameter, s) {
      var timezone = parameter.attributes['timezone'];
      this._initDateFormatters();
      return {
        format: function(date) {
          if ('client' === timezone) {
            return this.dateFormatters['with-timezone'].format(date);
          }
          // Take the date string as it comes from the server, cut out the timezone information - the
          // server will supply its own here.
          if ('server' === timezone || !timezone) {
            return this.dateFormatters['without-timezone'].format(date);
          } else if ('utc' === timezone) {
            return this.dateFormatters['utc'].format(date);
          } else {
            var offset = ReportTimeUtil.getOffsetAsString(timezone);
            if (!this.dateFormatters[offset]) {
              this.dateFormatters[offset] = TextFormatter.createFormatter('date', "yyyy-MM-dd'T'HH:mm:ss.SSS'" + offset + "'");
            }
            return this.dateFormatters[offset].format(date);
          }
        }.bind(this),
        parse: function(s) {
          if ('client' === timezone) {
            try {
              // Try to parse with timezone info
              return this.dateFormatters['with-timezone'].parse(s);
            } catch (e) {
              // ignore, keep trying
            }
          }
          try {
            return this.parseDateWithoutTimezoneInfo(s);
          } catch (e) {
            // ignore, keep trying
          }
          try {
            if (s.length == 10) {
              return this.dateFormatters['simple'].parse(s);
            }
          } catch (e) {
            // ignore, keep trying
          }
          try {
            return new Date(parseFloat(s));
          } catch (e) {
            // ignore, we're done here
          }
          return ''; // this represents a null in CDF
        }.bind(this)
      };
    },

    parseDateWithoutTimezoneInfo: function(dateString) {
      // Try to parse without timezone info
      if (dateString.length === 28)
      {
        dateString = dateString.substring(0, 23);
      }
      return this.dateFormatters['without-timezone'].parse(dateString);
    },

    /**
     * Updates date values to make sure the timezone information is correct.
     */
    normalizeParameterValue: function(parameter, type, value) {
      if (value == null || type == null) {
        return null;
      }

      // Strip out actual type from Java array types
      var m = type.match('^\\[L([^;]+);$');
      if (m != null && m.length === 2) {
        type = m[1];
      }

      switch(type) {
        case 'java.util.Date':
        case 'java.sql.Date':
        case 'java.sql.Time':
        case 'java.sql.Timestamp':
          var timezone = parameter.attributes['timezone'];
          if (!timezone || timezone == 'server') {
            if (parameter.timezoneHint == undefined) {
              // Extract timezone hint from data if we can and update the parameter
              if (value.length == 28) {
                // Update the parameter's timezone hint
                parameter.timezoneHint = value.substring(23, 28);
              }
            }
            return value;
          }

          if(timezone == 'client') {
            return value;
          }

          // for every other mode (fixed timezone modes), translate the time into the specified timezone
          if ((parameter.timezoneHint != undefined && $.trim(parameter.timezoneHint).length != 0)
           && value.match(parameter.timezoneHint + '$'))
          {
            return value;
          }

          // the resulting time will have the same universal time as the original one, but the string
          // will match the timeoffset specified in the timezone.
          return this.convertTimeStampToTimeZone(value, timezone);
      }
      return value;
    },

    /**
     * Converts a time from a arbitary timezone into the local timezone. The timestamp value remains unchanged,
     * but the string representation changes to reflect the give timezone.
     *
     * @param value the timestamp as string in UTC format
     * @param timezone the target timezone
     * @return the converted timestamp string.
     */
    convertTimeStampToTimeZone: function(value, timezone) {
      this._initDateFormatters();
      // Lookup the offset in minutes
      var offset = ReportTimeUtil.getOffset(timezone);

      var localDate = this.parseDateWithoutTimezoneInfo(value);
      var utcDate = this.dateFormatters['with-timezone'].parse(value);
      var offsetText = ReportTimeUtil.formatOffset(offset);

      var nativeOffset = -(new Date(localDate).getTimezoneOffset());

      var time = localDate.getTime() + (offset * 60000) + (utcDate.getTime() - localDate.getTime() - (nativeOffset * 60000));
      var localDateWithShift = new Date(time);

      return this.dateFormatters['without-timezone'].format(localDateWithShift) + offsetText;
    }
  }
});
