/**
 * Pentaho Plugin
 *
 * A base class implementation for a PentahoPlugin. This is to be used in accordance with, at least, an implementation
 * of a PentahoAngularPluginHandler. Though the register and unregister functionst are convenience methods, the pluginHandler
 * is a required property on the plugin configuration to provide a better experience using plugins.  This does not inhibit 
 * you from using the PentahoPluginHandler directly to register and unregister plugins, but it is a better experience to simply 
 * register a plugin directly from the plugin itself.
 *
 * CONFIG = {
 *		// REQUIRED
 *		pluginHandler : PluginHandlerInstance,
 *
 * 		//OPTIONAL
 *		onRegister : function(plugin) {},
 *		onUnregister : function(plugin) {}
 *		
 * }
 */

var deps = [
	'common-ui/PluginHandler',
	'common-ui/ring'
]

pen.define(deps, function(PentahoPluginHandler, ring) {
	// Generates a guid for use with plugins
	function _guid() {
		function S4() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		}
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	var PentahoPlugin = ring.create({

		init : function(config) {
			this.id = _guid();
			this.config = config;

			if (!this.config.pluginHandler) { 
				throw PentahoPlugin.errMsgs.noPluginHandler;
			}

			if (!ring.instance(this.config.pluginHandler, PentahoPluginHandler)) {
				throw PentahoPlugin.errMsgs.notAPluginHandler;
			}
		},
		
		/**
         * Registers this Plugin with the PentahoPluginHandler
         *
         * @return PentahoPluginHandler.Plugin
         * @throws Exception
         *        As defined in the register function for PentahoPluginHandler
         */
		register : function() {
			return this.config.pluginHandler.register(this);
		},

		/**
         * Unregisters this Plugin with the PentahoPluginHandler
         *
         * @return PentahoPluginHandler.Plugin
         * @throws Exception
         *        As defined in the register function for PentahoPluginHandler
         */
		unregister : function() {
			return this.config.pluginHandler.unregister(this);
		},

		/**
         * Performs any onRegister functionality defined when creating this object
         */
		onRegister : function(plugin) {
			if (this.config.onRegister) {
				this.config.onRegister(plugin);
			}
		},

		/**
         * Performs any onUnregister functionality defined when creating this object
         */
		onUnregister : function(plugin) {
			if (this.config.onUnregister) {
				this.config.onUnregister(plugin);
			}
		},

		/**
         * Performs a toString operation for this object
         *
         * @return String
         */
		toString : function() {
			return "PLUGIN[" + this.id + "]";
		}
	});

            
    PentahoPlugin.errMsgs = {};
    PentahoPlugin.errMsgs.noPluginHandler = "There is not a pluginHandler provided in the configuration";
    PentahoPlugin.errMsgs.notAPluginHandler = "The attached plugin handler is not a Pentaho Plugin Handler";

	return PentahoPlugin;
})