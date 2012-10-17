/**
 * Define a custom component that replaces the exiting label component. This must be a named module. 
 * 
 * See http://requirejs.org/docs/api.html#modulename for more information.
 */
pen.require(
  // We require the Prompting Builder API to be loaded as we'll replace the existing label builder with ours
  ['common-ui/prompting/pentaho-prompting-builders'], function() {
  window.MySimpleComponent = BaseComponent.extend({
    update: function() {
      $('#' + this.htmlObject).html(this.label + ' (My Custom Component)');
    }
  });

  window.MyCustomBuilder = pentaho.common.prompting.builders.ParameterWidgetBuilderBase.extend({
    build: function(args) {
      var widget = this.base(args);
      // Change the name and htmlObject to append -label so we don't conflict with the input component for this parameter
      widget.name = widget.name + '-label';
      widget.htmlObject = widget.name;
      widget.type = 'MySimpleComponent';
      widget.label = args.param.attributes['label'];
      return widget;
    }
  });

  // Replace the label component builder with ours
  pentaho.common.prompting.builders.WidgetBuilder.mapping['label'] = 'MyCustomBuilder';
});