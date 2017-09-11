sap.ui.define([
	"sap/security/core/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("sap.security.core.controller.App", {

		onInit: function() {
			var oViewModel;

			oViewModel = new JSONModel();
			this.setModel(oViewModel, "appView");
		}
	});

});