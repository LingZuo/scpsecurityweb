sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/security/core/model/models",
	"sap/ui/model/json/JSONModel"
], function(UIComponent, models, JSONModel) {
	"use strict";

	return UIComponent.extend("sap.security.core.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call super init (will call function "create content")
			UIComponent.prototype.init.apply(this, arguments);

			// initialize router and navigate to the first page
			this.getRouter().initialize();
		}
	});
});