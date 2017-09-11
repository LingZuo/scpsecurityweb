jQuery.sap.registerModulePath("sap.security.core", "/webapp/core");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/security/userprofile/common/ModelUtils",
	"sap/security/userprofile/common/Utils"
], function(UIComponent, JSONModel, ModelUtils, Utils) {
	"use strict";

	return UIComponent.extend("sap.security.userprofile.Component", {

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

			// initialize page enums model
			this.initPgaeEnums();

			// init user permission info
			this.initUserPermission();

			// initialize router and navigate to the first page
			this.getRouter().initialize();

		},
		/**
		 * initUserPermission
		 * @public
		 */
		initUserPermission: function() {
			var sServiceUrl = "/destinations/Security_OData" + "/user";
			var oUserDetailModel = new JSONModel();
			oUserDetailModel.loadData(sServiceUrl, null, false);
			// initial user detail data model
			this.setModel(oUserDetailModel, "UserDetailModel");
			oUserDetailModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			// initial user permission data model
			var oUserProfile = oUserDetailModel.getData();
			var oUserPermissionModel = new JSONModel();
			oUserPermissionModel.setData(Utils.getUserPermissionData(oUserProfile));
			this.setModel(oUserPermissionModel, "UserPermissionModel");
		},
		/**
		 * Initialize page enums model
		 * @public
		 * @override
		 */
		initPgaeEnums: function() {
			var sServiceUrl = "/destinations/Security_OData" + "/enumerations";
			var oPageEnumsModel = new JSONModel();
			oPageEnumsModel.loadData(sServiceUrl, null, false);
			this.setModel(oPageEnumsModel, "PageEnumsModel");
		}
	});
});