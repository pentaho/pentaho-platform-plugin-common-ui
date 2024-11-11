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
      './builders/ExternalInputBuilder', './builders/TextAreaBuilder', './builders/TextInputBuilder',
      './builders/StaticAutocompleteBoxBuilder'],

    function (PromptPanelBuilder, ParameterGroupPanelBuilder, ParameterPanelBuilder, SubmitPanelBuilder,
              SubmitComponentBuilder, LabelBuilder, ErrorLabelBuilder, DropDownBuilder, RadioBuilder, CheckBuilder,
              MultiButtonBuilder, ListBuilder, DateInputBuilder, ExternalInputBuilder, TextAreaBuilder, TextInputBuilder,
              StaticAutocompleteBoxBuilder) {

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
          'autocompletebox': new StaticAutocompleteBoxBuilder(),
          'textbox': new TextInputBuilder()
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
          if (this.mapping.hasOwnProperty(type)) {
            if (type == "textbox" && args.param.list) {
              type = "autocompletebox";
            }
          } else {
            type = args.param.list ? "autocompletebox" : "textbox";
          }
          return this.mapping[type];
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
              var options = {};
              if(this.needsUpdateOnNextRefresh) {
               options = {isSuppressSubmit: true};
              }
              args.promptPanel.parameterChanged(this.param, this.parameter, this.getValue(), options);
            }.bind(widget);
          }
          return widget;
        }
      };
    });
