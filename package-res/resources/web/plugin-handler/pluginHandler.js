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
pen.define(deps, function() {

	var PentahoPluginHandler = ring.create({
		init : function() {
			this.plugins = {};
		}, 

		// Verifies if the plugin is a hard type
		_verifyPlugin : function(plugin) {
			pen.require(['common-ui/Plugin'], function(PentahoPlugin) {
				if (!ring.instance(plugin, PentahoPlugin)) {
					_throwExcpetion("Incompatible object Exception");
				}	
			})	
		},

		// Throws an exception and logs it to the console
		_throwExcpetion : function(msg) {
			console.log(msg);
			throw msg;
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
			this._verifyPlugin(plugin);

			if (this.plugins[plugin.id]) {
				this._throwExcpetion("WARNING: " + plugin + " is already registered");
				return;
			}

			this.plugins[plugin.id] = plugin;		

			if (!this.plugins[plugin.id]) {
				this._throwExcpetion(plugin + " was not added successfully");
			}
			console.log(plugin + " has been registered");

			// Call onRegister if it exists
			plugin.onRegister.call(plugin, plugin);	

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
			this._verifyPlugin(plugin);

			if (!this.plugins[plugin.id]) {
				this._throwExcpetion(plugin + " is not registered");
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
				this._throwExcpetion("Plugin by id '" + id + "' is not registered");				
			}

			var plugin = this.plugins[id];
			delete this.plugins[id];
			
			// Verify that plugin was successfully removed
			if (this.plugins[id]) {
				this._throwExcpetion(plugin + " was not removed successfully");
			}

			// Call onUnregister if exists
			plugin.onUnregister.call(plugin, plugin);	

			return plugin;
		}
	});

	return PentahoPluginHandler;
});