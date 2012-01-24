/**
 * This is a collection of extentions to built-in types. This in in leu of creating subclasses which we should do
 * in the future.
 */
dojo.provide("pentaho.common.Overrides");

dojo.extend(dijit.layout._TabButton, {
  templateString: dojo.cache("analyzer", "custom-templates/tabButton.html")
});

dojo.extend(dijit.layout._TabContainerBase, {
  templateString: dojo.cache("analyzer", "custom-templates/tabContainer.html")
});
dojo.extend(dijit.layout.TabContainer, {baseClass : "pentahoTabContainer"});

dojo.extend(dijit.DialogUnderlay,
    {
      templateString: "<div class='glasspane'><div class='' dojoAttachPoint='node'></div></div>",

      _setClassAttr: function(clazz){
        this.node.className = clazz;
        this._set("class", clazz);
      }
    });

dojo.extend(dijit.form.Button, {baseClass : "pentaho-button"});

// killing the autoscroll of the page when dragging nodes
dojo.dnd.autoScroll = function(e){};
