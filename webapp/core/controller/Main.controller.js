sap.ui.define([
	"sap/security/core/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.security.core.controller.Main", {
		onInit: function() {

		},
		onPressTile: function(oEvent) {
			var sTitle = oEvent.getSource().getTitle();
			switch (sTitle) {
				case "UserRole":
					this.getRouter().navTo("userroles", null, true);
					break;
				case "UserProfile":
					this.getRouter().navTo("userprofile", null, true);
					break;
				case "Privilege":
					this.getRouter().navTo("privilege", null, true);
					break;
				default:
					break;
			}
		}
	});
});