/*
 * Pentaho Plugin Handler
 *
 * This is a base implementation of of a plugin handler and its plugin object where upon 
 * registering/unregistering the plugin's repsective methods are called. This is not 
 * intended to function on its own, but to be extended via a framework specific implementation 
 * of the plugin object
 */

var deps = [	
	'common-ui/ring'
]
define(deps, function(ring) {
	
	var PentahoPlugin;
	
	// Verifies if the plugin is a PentahoPlugin type
	var _verifyPlugin = function(plugin) {

		// Necessary to mitigate circular dependency
		if (!PentahoPlugin) {
			PentahoPlugin = require("common-ui/Plugin");
		}
		
		if (!ring.instance(plugin, PentahoPlugin)) {
			_throwException(PentahoPluginHandler.errMsgs.invalidObject);
		}	
	};

	// Throws an exception and logs it to the console
	var _throwException = function(msg) {
		console.log(msg);
		throw msg;
	};

	var PentahoPluginHandler = ring.create({
		init : function() {
			this.plugins = {};
		}, 

		/**
	     * Register a single plugin and stores the plugin in the plugin object container. Once the
	     * registration has occurred successfully, the onRegister function defined on the Plugin
	     * is called
	     *
	     * @param plugin
	     *         A plugin defined by PentahoPluginHandler.Plugin
	     *
	     * @return PentahoPluginHandler.Plugin
	     * @throws Exception
	     *        When the plugin is not a type of PentahoPluginHandler.Plugin
	     *        When the plugin is already registered
	     *        When the plugin has not been registered successfully after attempting to register it
	     */
		register : function(plugin) {
			_verifyPlugin(plugin);

			if (this.plugins[plugin.id]) {
				_throwException(plugin + PentahoPluginHandler.errMsgs.alreadyRegistered);
			}

			this.plugins[plugin.id] = plugin;		

			if (!this.plugins[plugin.id]) {
				_throwException(plugin + PentahoPluginHandler.errMsgs.wasNotRegistered);
			}
			console.log(plugin + " has been registered");

			// Call onRegister if it exists
			plugin.onRegister(plugin);	

			return plugin;
		},

		/**
	     * Unregisters a single plugin and removes it from the plugin object container. Once the
	     * unregistration occurrs successfully, the onUnregister function is called
	     *
	     * @param plugin
	     *         A plugin defined by PentahoPluginHandler.Plugin
	     *
	     * @return PentahoPluginHandler.Plugin
	     * @throws Exception
	     *        When the plugin is not a type of PentahoPluginHandler.Plugin
	     */
		unregister : function(plugin) {
			_verifyPlugin(plugin);

			if (!this.plugins[plugin.id]) {
				_throwException(plugin + PentahoPluginHandler.errMsgs.isNotRegistered);
			}

			return this.unregisterById(plugin.id)
		},

		/**
	     * Unregisters a singly plugin by its id
	     *
	     * @param id
	     *         A String representing the id of a PentahoPluginHandler.Plugin
	     *
	     * @return PentahoPluginHandler.Plugin
	     * @throws Exception
	     *        If a plugin is being unregistered and does not exist or if the plugin
	     *        was not unregistered successfully
	     */
		unregisterById : function(id) {
			// Verify that plugin is present in list of plugins
			if (!this.plugins[id]) {
				_throwException(id + PentahoPluginHandler.errMsgs.isNotRegistered);				
			}

			var plugin = this.plugins[id];
			delete this.plugins[id];
			
			// Verify that plugin was successfully removed
			if (this.plugins[id]) {
				_throwException(plugin + PentahoPluginHandler.errMsgs.wasNotRemoved);
			}

			// Call onUnregister if exists
			plugin.onUnregister(plugin);	

			return plugin;
		},
		
		/**
		 * Retrieves an already registered plugin
		 * 
		 * @return PentahoPlugin
		 */
		get : function(id) {
			return this.plugins[id];
		}
	});

	PentahoPluginHandler.errMsgs = {};
	PentahoPluginHandler.errMsgs.invalidObject = "Incompatible object Exception";
	PentahoPluginHandler.errMsgs.alreadyRegistered = " is already registered";
	PentahoPluginHandler.errMsgs.wasNotRegistered = " was not added successfully";
	PentahoPluginHandler.errMsgs.isNotRegistered = " is not registered";
	PentahoPluginHandler.errMsgs.wasNotRemoved = " was not removed successfully";


	return PentahoPluginHandler;
});