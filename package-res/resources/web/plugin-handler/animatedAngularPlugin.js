/**
 * Animated Angular Plugin
 *
 * An extension to the AngularPlugin which provides basic animations to your angular modules
 */

var deps = [
	'common-ui/AngularPlugin',
	'common-ui/AnimatedAngularPluginHandler',
	'common-ui/ring',
	'common-ui/angular-animate',
];
pen.define(deps, function(AngularPlugin, AnimatedAngularPluginHandler, ring) {


	// Extend Angular PluginHandler Plugin
	var AnimatedAngularPlugin = ring.create([AngularPlugin], {

		init : function(config) {
			this.$super(config);

			if (!ring.instance(this.config.pluginHandler, AnimatedAngularPluginHandler)) {
				throw "The attached plugin handler is not an Animated Angular Plugin Handler";
			}
		},

		/**
		 * see #AngularPlugin.goto
		 */
		goto : function(url) {
			this.config.pluginHandler.goto(url, this.moduleName);
		},

		/**
		 * see #AngularPlugin.goHome
		 */
		goHome : function() {
			this.config.pluginHandler.goHome(this.moduleName);
		},

		/**
		 * A function that sets the animation for "going next", then links to the hash url
		 *
		 * @param url
		 * 		String hash url
		 */
		goNext : function(url) {
			this.config.pluginHandler.goNext(url, this.moduleName);
		},

		/**
		 * A function that sets the animation for "going previous", then links to the hash url
		 *
		 * @param url
		 * 		String hash url
		 */
		goPrevious : function(url) {
			this.config.pluginHandler.goPrevious(url, this.moduleName);		
		},

		/**
		 * A function that sets the animation for "openning" an app, then links to the hash url
		 *
		 * @param url
		 * 		String hash url
		 */
		open : function(url) {
			this.config.pluginHandler.open(url, this.moduleName);
		},
		
		/**
		 * A function that sets the animation for "going home", then goes to "/"
		 *
		 * @param url
		 * 		String hash url
		 */
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