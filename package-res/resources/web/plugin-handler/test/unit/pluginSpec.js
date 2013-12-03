var deps = [
    "common-ui/Plugin",
    "common-ui/PluginHandler"
];

pen.require(deps, function(PentahoPlugin, PentahoPluginHandler) {
	
	describe("Pentaho Plugin Tests", function(){
		
		var plugin;
		var pluginHandler;
		
		beforeEach(function() {
			pluginHandler = new PentahoPluginHandler();
			
			plugin = new PentahoPlugin({
				pluginHandler : pluginHandler,
				onRegister : function() {},
				onUnregister : function() {}
			});
			
			spyOn(plugin, "onRegister");
			spyOn(plugin, "onUnregister");
		});
		
		it("should register a plugin", function() {
			plugin.register();
			
			expect(pluginHandler.get(plugin.id)).toEqual(plugin);
			expect(plugin.onRegister).toHaveBeenCalled();
		});
		
		it("should register, then unregister a plugin", function() {
			plugin.register();
			plugin.unregister();
			
			expect(pluginHandler.get(plugin.id)).not.toBeDefined();
			expect(plugin.onUnregister).toHaveBeenCalled();
		})
	});
})