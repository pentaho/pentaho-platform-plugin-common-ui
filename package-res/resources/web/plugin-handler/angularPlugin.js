/**
 * Angular Plugin
 * CONFIG for Plugin
 * {
 *		// REQUIRED
 *		moduleName : String
 *
 *		// OPTIONAL
 *		routerCallback : function($routeProvider) {},
 *		controllerCallback : function($controllerProvider) {},
 *		serviceCallback : function($serviceProvider) {},
 *		factoryCallback : function($factoryProvider) {},
 *		filterCallback : function($filterProvider) {},
 *		directiveCallback : function($directiveProvider) {}
 * }
 */

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

			if(!config.moduleName) {
				throw "Module name required";
			}

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

			if (!ring.instance(this.config.pluginHandler, AngularPluginHandler)) {
				throw "The attached plugin handler is not an Angular Plugin Handler"
			}
		},

		/**
		 * Provides a means of going to a partial hash url in the browser
		 *
		 * @param url
		 *		String hash url
		 */
		goto : function(url) {
			this.config.pluginHandler.goto(url, this.moduleName);
		},

		/**
		 * A funtion which goes directly to the home "/" hash in the url
		 */
		goHome : function() {
			this.config.pluginHandler.goHome(this.moduleName);
		},

		/**
		 * see #PentahoPlugin.onRegister
		 */
		onRegister : function(plugin) {
			this.config.pluginHandler._onRegister.call(plugin, plugin);

			// Call super onRegister
			this.$super.call(plugin, plugin);
		},

		/**
		 * see #PentahoPlugin.onUnregister
		 */
		onUnregister : function(plugin) {
			this.config.pluginHandler._onUnregister.call(plugin, plugin);

			// Call super onUnregister
			this.$super.call(plugin, plugin);
		},

		/**
		 * see #PentahoPlugin.toString
		 */
		toString : function() {
			return "ANGULAR_PLUGIN[" + this.moduleName + "] -- " + this.$super();
		}
	})

	return AngularPlugin;
})