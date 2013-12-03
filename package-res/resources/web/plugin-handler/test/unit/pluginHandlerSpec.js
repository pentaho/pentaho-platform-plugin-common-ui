var deps = [
	'common-ui/PluginHandler',
	'common-ui/Plugin',
];

pen.define(deps, function(PentahoPluginHandler, PentahoPlugin) {
	
	describe("Pentaho Plugin Handler Test", function() {
				
		var pluginHandler, plugin;
		beforeEach(function() {
			// Create a new plugin handler
			pluginHandler = new PentahoPluginHandler();
			
			// Create a new plugin
			plugin = new PentahoPlugin({
				pluginHandler : pluginHandler,
				onRegister : function() { },
				onUnregister : function() {}
			});
			
			// Spy on the onRegister and onUnregister
			spyOn(plugin, 'onRegister');
			spyOn(plugin, 'onUnregister');
		});
		
		it("should register a plugin and have onRegister called", function() {
			pluginHandler.register(plugin);
			
			expect(pluginHandler.get(plugin.id)).toEqual(plugin);
			expect(plugin.onRegister).toHaveBeenCalled();
		});
		
		it("should try to register an object and fail", function() {
			var notAPlugin = new Object();
			
			var exception = false;
			try {
				pluginHandler.register(notAPlugin);	
			} catch (e) {
				exception = true;
			}
			
			expect(exception).toBe(true);
		});
		
		it("should try to register the same plugin and fail", function() {
			pluginHandler.register(plugin);
			
			var exception = false;
			try {
				pluginHandler.register(plugin)
			} catch(e) {
				exception = true;
			}
			
			expect(exception).toBe(true);
		});
		
		it("should register the unregister the plugin, using the plugin instance, then call onUnregister", function() {
			pluginHandler.register(plugin);
			pluginHandler.unregister(plugin);
			
			expect(pluginHandler.get(plugin.id)).not.toBeDefined();
			expect(plugin.onUnregister).toHaveBeenCalled();
		});
		
		it("should register the unregister the plugin, using the plugin id, then call onUnregister", function() {
			pluginHandler.register(plugin);
			pluginHandler.unregisterById(plugin.id);
			
			expect(pluginHandler.get(plugin.id)).not.toBeDefined();
			expect(plugin.onUnregister).toHaveBeenCalled();
		});
	});	
})


