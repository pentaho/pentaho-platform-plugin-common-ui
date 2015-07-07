define(['cdf/lib/Base', 'common-ui/util/base64', './Parameter', './ParameterDefinition', './ParameterGroup', './ParameterValue'],
    function (Base, Base64Util, Parameter, ParameterDefinition, ParameterGroup, ParameterValue) {

      /**
       *
       * @param data
       * @param xml
       * @param tmp
       * @returns {*}
       * @private
       */
      var _parseXML = function (data, xml, tmp) {
        if (window.DOMParser) { // Standard
          tmp = new DOMParser();
          xml = tmp.parseFromString(data, "text/xml");
        } else { // IE
          xml = new ActiveXObject("Microsoft.XMLDOM");
          xml.async = "false";
          xml.loadXML(data);
        }

        tmp = xml.documentElement;

        if (!tmp || !tmp.nodeName || tmp.nodeName === "parsererror") {
          jQuery.error("Invalid XML: " + data);
        }

        return xml;
      };

      /**
       *
       * @param paramDefn
       * @param xmlRoot
       * @private
       */
      var _parseErrors = function (paramDefn, xmlRoot) {
        var addToParameter = function (paramDefn, paramName, message) {
          var errorList = paramDefn.errors[paramName];
          if (!errorList) {
            errorList = [];
          }
          errorList.push(message);
          paramDefn.errors[paramName] = errorList;
        };

        xmlRoot.find('error').each(function (i, e) {
          var error = $(e);
          var paramName = error.attr('parameter');
          var message = error.attr('message');
          addToParameter(paramDefn, paramName, message);
        }.bind(this));

        xmlRoot.find('global-error').each(function (i, e) {
          var error = $(e);
          var message = error.attr('message');
          addToParameter(paramDefn, null, message);
        }.bind(this));
      };

      var _parseParameters = function (paramDefn, parametersNode) {
        parametersNode.find('parameter').each(function(i, node) {
          var param = _parseParameter(node);
          node = $(node);
          var groupName = param.attributes['parameter-group'];
          if (groupName == undefined || !$.trim(groupName).length) {
            groupName = 'parameters'; // default group
          }
          var group = paramDefn.getParameterGroup(groupName);
          if (!group) {
            group = new ParameterGroup();
            group.name = groupName;
            group.label = param.attributes['parameter-group-label'];
            paramDefn.parameterGroups.push(group);
          }
          group.parameters.push(param);
        }.bind(this));
      };

      /**
       *
       * @param node
       * @returns {exports}
       * @private
       */
      var _parseParameter = function (node) {
        var param = new Parameter();

        node = $(node);
        param.name = node.attr('name');
        param.mandatory = 'true' == node.attr('is-mandatory');
        param.strict = 'true' == node.attr('is-strict');
        param.list = 'true' == node.attr('is-list');
        param.multiSelect = 'true' == node.attr('is-multi-select');
        param.type = node.attr('type');
        param.timezoneHint = node.attr('timezone-hint');

        // TODO: Support namespaces
        $(node).find('attribute').each(function(i, attr) {
          attr = $(attr);
          param.attributes[attr.attr('name')] = attr.attr('value');
        });

        param.values = _parseParameterValues(node, param);
        return param;
      };

      /**
       *
       * @param paramNode
       * @param parameter
       * @returns {Array}
       * @private
       */
      var _parseParameterValues = function (paramNode, parameter) {
        var values = [];
        $(paramNode).find('values value').each(function(i, value) {
          var pVal = new ParameterValue();

          value = $(value);

          if ('true' == value.attr('encoded')) {
            pVal.label = Base64Util.base64Decode(value.attr('label'));
          } else {
            pVal.label = value.attr('label');
          }
          if ('true' == value.attr('null')) {
            pVal.value = ''; // Dashboards doesn't play nicely with null values for parameters
          } else if ('true' == value.attr('encoded')) {
            pVal.value = Base64Util.base64Decode(value.attr('value'));
          } else {
            pVal.value = value.attr('value');
          }
          pVal.type = value.attr('type');
          if (pVal.type == undefined || !$.trim(pVal.type).length) {
            pVal.type = parameter.type;
          }
          pVal.selected = 'true' == value.attr('selected');

          pVal.value = _normalizeParameterValue(parameter, pVal.type, pVal.value);
          values.push(pVal);
        }.bind(this));
        return values;
      };

      /**
       * Called for every parameter value that is parsed. Override this to update the parameter
       * value at parse time.
       */
      var _normalizeParameterValue = function (parameter, type, value) {
        return value;
      };

      return Base.extend({
        /**
         * Parses the xml received from the server and returns and instance of ParameterDefinition
         *
         * @param xmlString String with the xml
         * @returns ParameterDefinition instance
         */
        parseParameterXml: function (xmlString) {
          var xml = $(_parseXML(xmlString));

          if (xml.find('parsererror').length > 0) {
            throw xmlString;
          }

          var paramDefn = new ParameterDefinition();
          var parameters = $(xml.find('parameters')[0]);

          paramDefn.promptNeeded = 'true' == parameters.attr('is-prompt-needed');
          paramDefn.ignoreBiServer5538 = 'true' == parameters.attr('ignore-biserver-5538');
          paramDefn.paginate = 'true' == parameters.attr('paginate');
          paramDefn.layout = parameters.attr('layout');

          var parseInteger = function(s, def) {
            var n = parseInt(s);
            return 'NaN' == n ? def : n;
          }
          paramDefn.page = parseInteger(parameters.attr('accepted-page'), 0);
          paramDefn.totalPages = parseInteger(parameters.attr('page-count'), 0);

          paramDefn.autoSubmit = parameters.attr('autoSubmit');
          if (paramDefn.autoSubmit == 'true') {
            paramDefn.autoSubmit = true;
          } else if (paramDefn.autoSubmit == 'false') {
            paramDefn.autoSubmit = false;
          } else {
            paramDefn.autoSubmit = undefined;
          }

          paramDefn.autoSubmitUI = 'true' == parameters.attr('autoSubmitUI');

          _parseParameters(paramDefn, parameters);
          _parseErrors(paramDefn, xml);

          return paramDefn;
        }
      });
    }
);
