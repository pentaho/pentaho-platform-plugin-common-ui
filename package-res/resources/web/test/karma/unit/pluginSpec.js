var deps = [
    "common-ui/Plugin",
    "common-ui/PluginHandler"
];

require(deps, function(PentahoPlugin, PentahoPluginHandler) {
	
	describe("Pentaho Plugin", function(){
		
		var plugin;
		var pluginHandler;
		
		describe("Constructor Tests", function() {
			it("should fail when creating a plugin without a plugin handler", function() {
				expect(function(){ 
					new PentahoPlugin({}); 
				}).toThrow(PentahoPlugin.errMsgs.noPluginHandler);
            })

            it("should fail when creating a plugin and assigning an object that is not a plugin handler", function() {
            	expect(function(){ 
            		new PentahoPlugin({ pluginHandler : new Object() }); 
            	}).toThrow(PentahoPlugin.errMsgs.notAPluginHandler);
            })
		});

		describe("Function Tests", function() {
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
		})
		
	});
})