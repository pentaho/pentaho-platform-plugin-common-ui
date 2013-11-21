var deps = [
	'common-ui/AngularPlugin',
	'common-ui/AnimatedAngularPluginHandler',
	'common-ui/angular-animate',
	'common-ui/ring'
];
pen.define(deps, function(AngularPlugin, AnimatedAngularPluginHandler) {


	// Extend Angular PluginHandler Plugin
	var AnimatedAngularPlugin = ring.create([AngularPlugin], {

		init : function(config) {
			this.$super(config);

			if (!ring.instance(this.config.pluginHandler, AnimatedAngularPluginHandler)) {
				throw "The attached plugin handler is not an Animated Angular Plugin Handler";
			}
		},

		goto : function(url) {
			this.config.pluginHandler.goto(url, this.moduleName);
		},

		goHome : function() {
			this.config.pluginHandler.goHome(this.moduleName);
		},

		goNext : function(url) {
			this.config.pluginHandler.goNext(url, this.moduleName);
		},

		goPrevious : function(url) {
			this.config.pluginHandler.goPrevious(url, this.moduleName);		
		},

		open : function(url) {
			this.config.pluginHandler.open(url, this.moduleName);
		},
		
		close : function() {
			this.config.pluginHandler.close(this.moduleName);
		},

		// Have to call because toString exists already in Object
		toString : function() {
			return this.$super();
		}
	});

	return AnimatedAngularPlugin;
});