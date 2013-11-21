var deps = [
	'common-ui/Plugin',
	'common-ui/AngularPluginHandler',
	'common-ui/ring'
];

pen.define(deps, function(PentahoPlugin, AngularPluginHandler) {

	// Define an extended plugin of PluginHandler.Plugin
	var AngularPlugin = ring.create([PentahoPlugin], {
		init : function(config) {
			this.$super(config);

			// Store moduleName
			this.moduleName = config.moduleName;

			/*
			 * Init empty arrays for registration
			 */
			this.routes         = [];
			this.controllers    = [];
			this.services       = [];
			this.factories      = [];
			this.filters        = [];
			this.directives     = [];

			if (this.config.pluginHandler && !ring.instance(this.config.pluginHandler, AngularPluginHandler)) {
				throw "The attached plugin handler is not an Angular Plugin Handler"
			}
		},

		goto : function(url) {
			this.config.pluginHandler.goto(url, this.moduleName);
		},

		goHome : function() {
			this.config.pluginHandler.goHome(this.moduleName);
		},

		onRegister : function(plugin) {
			this.config.pluginHandler._onRegister.call(plugin, plugin);

			// Call super onRegister
			this.$super.call(plugin, plugin);
		},

		onUnregister : function(plugin) {
			this.config.pluginHandler._onUnregister.call(plugin, plugin);

			// Call super onUnregister
			this.$super.call(plugin, plugin);
		},

		toString : function() {
			return "ANGULAR_PLUGIN[" + this.moduleName + "] -- " + this.$super();
		}
	})

	return AngularPlugin;
})