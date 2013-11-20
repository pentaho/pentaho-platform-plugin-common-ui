/*
 * This is a base implementation of of a plugin handler and its plugin object where upon 
 * registering/unregistering the plugin's repsective methods are called. This is not 
 * intended to function on its own, but to be extended via a framework specific implementation 
 * of the plugin object
 * 
 * For a given plugin, the onRegister and onUnregister parameters can either be single functions
 * or an array of functions, which can also be nested within arrays.
 */

pen.define(['common-ui/jquery'], function() {
	var plugins = {};

	// Define plugin type
	var PLUGIN_TYPE = "PLUGIN";

	// Define Plugin Object
	var Plugin = function(onRegister, onUnregister) {
	 	/**
         * GUID id
         */		
		this.id = _guid();
		
		/**
         * TYPE PLUGIN, used for Plugin verification
         */
		this.type = PLUGIN_TYPE;
		
		/**
         * Registers this Plugin with the PentahoPluginHandler
         *
         * @return PentahoPluginHandler.Plugin
         * @throws Exception
         *        As defined in the register function for PentahoPluginHandler
         */
		this.register = function() {
			return register.call(this, this);
		}

		/**
         * Unregisters this Plugin with the PentahoPluginHandler
         *
         * @return PentahoPluginHandler.Plugin
         * @throws Exception
         *        As defined in the register function for PentahoPluginHandler
         */
		this.unregister = function() {
			return unregister.call(this, this);
		}

		/**
         * Performs any onRegister functionality defined when creating this object
         */
		this.onRegister = function() {
			_loopExec.call(this, onRegister);
		}

		/**
         * Performs any onUnregister functionality defined when creating this object
         */
		this.onUnregister = function() {
			_loopExec.call(this, onUnregister);
		}

		/**
         * Performs a toString operation for this object
         *
         * @return String
         */
		this.toString = function() {
			return this.type + "[" + this.id + "]";
		}
	}

	// Loops over a single or array of functions and executes them
	function _loopExec(obj) {
		var isFunction = $.isFunction(obj);
		if (!obj || (!isFunction && !(obj instanceof Array))) {
			return;
		}

		// Immediately execute a single function
		if (isFunction) {
			obj.call(this, this);
			return;
		};

		// Loop over functions and execute them
		var self = this;
		$(obj).each(function(i, func) {
			_loopExec.call(self, func);
		})
	}

	// Generates a guid for use with plugins
	function _guid() {
		function S4() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		}
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	// Verifies if the plugin is a hard type
	var _verifyPlugin = function(plugin) {		
		if (!plugin.type || plugin.type != PLUGIN_TYPE) {
			_throwExcpetion("Incompatible object Exception");
		}
	}

	// Throws an exception and logs it to the console
	var _throwExcpetion = function(msg) {
		console.log(msg);
		throw msg;
	}

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
	var register = function(plugin) {
		_verifyPlugin(plugin);

		if (plugins[plugin.id]) {
			_throwExcpetion("WARNING: " + plugin + " is already registered");
			return;
		}

		plugins[plugin.id] = plugin;		

		if (!plugins[plugin.id]) {
			_throwExcpetion(plugin + " was not added successfully");
		}
		console.log(plugin + " has been registered");
		plugin.onRegister.call(plugin);

		return plugin;
	}

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
	var unregister = function(plugin) {
		_verifyPlugin(plugin);

		if (!plugins[plugin.id]) {
			_throwExcpetion(plugin + " is not registered");
		}

		return unregisterById(plugin.id)
	}

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
	var unregisterById = function(id) {
		// Verify that plugin is present in list of plugins
		if (!plugins[id]) {
			_throwExcpetion("Plugin by id '" + id + "' is not registered");				
		}

		var plugin = plugins[id];
		delete plugins[id];
		
		// Verify that plugin was successfully removed
		if (plugins[id]) {
			_throwExcpetion(plugin + " was not removed successfully");
		}

		plugin.onUnregister.call(plugin);

		return plugin;
	}

	return {
		Plugin : Plugin,
		register : register, 
		unregister : unregister,
		unregisterById : unregisterById
	}
});