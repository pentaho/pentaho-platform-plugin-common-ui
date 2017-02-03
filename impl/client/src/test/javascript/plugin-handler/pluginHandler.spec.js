var deps = [
	'common-ui/PluginHandler',
	'common-ui/Plugin',
];

define(deps, function(PentahoPluginHandler, PentahoPlugin) {
	
	describe("Pentaho Plugin Handler Test", function() {
				
		var pluginHandler, plugin;
		beforeEach(function() {
			// Create a new plugin handler
			pluginHandler = new PentahoPluginHandler();
			
			// Create a new plugin
			plugin = new PentahoPlugin({
				pluginHandler : pluginHandler,
				onRegister : function() {},
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
			expect(function(){
				pluginHandler.register(new Object());	
			}).toThrow(PentahoPluginHandler.errMsgs.invalidObject);
		});
		
		it("should try to register the same plugin and fail", function() {
			pluginHandler.register(plugin);
			
			expect(function(){
				pluginHandler.register(plugin);
			}).toThrow(plugin + PentahoPluginHandler.errMsgs.alreadyRegistered);
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

		it("should fail to unregister a plugin that has not been registered", function() {
			expect(function() {
				pluginHandler.unregister(plugin)
			}).toThrow(plugin + PentahoPluginHandler.errMsgs.isNotRegistered);

			expect(function() {
				pluginHandler.unregisterById(plugin.id);
			}).toThrow(plugin.id + PentahoPluginHandler.errMsgs.isNotRegistered);
		});

	});	
})


