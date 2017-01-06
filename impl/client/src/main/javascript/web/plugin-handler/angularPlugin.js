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

define(deps, function(PentahoPlugin, AngularPluginHandler, ring) {

	// Define an extended plugin of PluginHandler.Plugin
	var AngularPlugin = ring.create([PentahoPlugin], {
		init : function(config) {
			this.$super(config);

			if(!config.moduleName) {
				throw AngularPlugin.errMsgs.moduleNameNotDefined;
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
				throw AngularPlugin.errMsgs.notAnAngularPluginHandler;
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
			this.config.pluginHandler._onRegister(plugin);

			// Call super onRegister
			this.$super(plugin);
		},

		/**
		 * see #PentahoPlugin.onUnregister
		 */
		onUnregister : function(plugin) {
			this.config.pluginHandler._onUnregister(plugin);

			// Call super onUnregister
			this.$super(plugin);
		},

		/**
		 * see #PentahoPlugin.toString
		 */
		toString : function() {
			return "ANGULAR_PLUGIN[" + this.moduleName + "] -- " + this.$super();
		}
	})
	
	AngularPlugin.errMsgs = {};
	AngularPlugin.errMsgs.moduleNameNotDefined = "Module name required";
	AngularPlugin.errMsgs.notAnAngularPluginHandler = "The attached plugin handler is not an Angular Plugin Handler";

	return AngularPlugin;
})