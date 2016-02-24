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

 To create a widget:
 var widget = WidgetBuilder.build(arguments);

 where arguments generally contain:

 {
   promptPanel: ...,
   param: the parameter this widget is created for
 }

 Widget Definition Structure:
 {
   promptPanel: the prompt panel this widget belongs to
   promptType: ['prompt', 'submit', 'label'], Used to distinguish types of widgets
   param: The parameter this widget was created for
   name: unique name of widget, usually: param['name'] + GUID
   htmlObject: name of object to inject this widget at
   type: CDF Component type

   *All other properties are subject of the widget type*
 }

 */


/**
 * The WidgetBuilder Class
 *
 * @name WidgetBuilder
 * @class
 */
define(['./builders/PromptPanelBuilder', './builders/ParameterGroupPanelBuilder', './builders/ParameterPanelBuilder',
      './builders/SubmitPanelBuilder', './builders/SubmitComponentBuilder', './builders/LabelBuilder',
      './builders/ErrorLabelBuilder', './builders/DropDownBuilder', './builders/RadioBuilder', './builders/CheckBuilder',
      './builders/MultiButtonBuilder', './builders/ListBuilder', './builders/DateInputBuilder',
      './builders/ExternalInputBuilder', './builders/TextAreaBuilder',
      './builders/TextInputBuilder'],

    function (PromptPanelBuilder, ParameterGroupPanelBuilder, ParameterPanelBuilder, SubmitPanelBuilder,
              SubmitComponentBuilder, LabelBuilder, ErrorLabelBuilder, DropDownBuilder, RadioBuilder, CheckBuilder,
              MultiButtonBuilder, ListBuilder, DateInputBuilder, ExternalInputBuilder, TextAreaBuilder,
              TextInputBuilder) {

      return {
        /**
         * the mappings of the builders names and their objects
         */
        mapping: {
          'prompt-panel': new PromptPanelBuilder(),
          'group-panel': new ParameterGroupPanelBuilder(),
          'parameter-panel': new ParameterPanelBuilder(),
          'submit-panel': new SubmitPanelBuilder(),
          'submit': new SubmitComponentBuilder(),
          'label': new LabelBuilder(),
          'error-label': new ErrorLabelBuilder(),
          'dropdown': new DropDownBuilder(),
          'radio': new RadioBuilder(),
          'checkbox': new CheckBuilder(),
          'togglebutton': new MultiButtonBuilder(),
          'list': new ListBuilder(),
          'datepicker': new DateInputBuilder(),
          'filebrowser': new ExternalInputBuilder(),
          'external-input': new ExternalInputBuilder(),
          'multi-line': new TextAreaBuilder(),
          'default': new TextInputBuilder()
        },

        /**
         * Gets the builder from the mapping for a given type
         *
         * @name WidgetBuilder#_findBuilderFor
         * @method
         * @param {Object} args The arguments to call the builder
         * @param {String} type The type of the builder to get
         * @returns {ParameterWidgetBuilderBase}
         * @private
         */
        _findBuilderFor: function (args, type) {
          type = type || (args.param && args.param.attributes ? args.param.attributes['parameter-render-type'] : null);
          return this.mapping.hasOwnProperty(type) ? this.mapping[type] : this.mapping['default'];
        },

        /**
         * Builds the widget and returns a component
         *
         * @name WidgetBuilder#build
         * @method
         * @param {Object} args The arguments to call the builder
         * @param {String} type The type of the builder to get
         * @returns {BaseComponent} The CDF component built
         */
        build: function (args, type) {
          var widget = this._findBuilderFor(args, type).build(args);
          if (widget.parameter && widget.param) {
            widget.postChange = function () {
              args.promptPanel.parameterChanged(this.param, this.parameter, this.getValue(), this.type);
            }.bind(widget);
          }
          return widget;

        }
      };
    });
