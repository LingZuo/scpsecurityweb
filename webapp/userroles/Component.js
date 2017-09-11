jQuery.sap.registerModulePath("sap.security.core", "/webapp/core");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/security/userroles/common/Utils",
	"sap/m/MessageToast"
], function(UIComponent, JSONModel, Utils, MessageToast) {
	"use strict";

	return UIComponent.extend("sap.security.userroles.Component", {

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

			// init user permission info
			this.initUserPermission();

			// initialize page enums model
			this.initPgaeEnums();
		},
		/**
		 * initUserPermission
		 * @public
		 */
		initUserPermission: function() {
			var sServiceUrl = "/destinations/Security_OData" + "/user";
			var oUserDetailModel = new JSONModel();
			oUserDetailModel.loadData(sServiceUrl, null, false);
			// initial user permission data model
			var oUserProfile = oUserDetailModel.getData();
			var oUserPermissionModel = new JSONModel();
			var oUserPermissionData = Utils.getUserPermissionData(oUserProfile);
			oUserPermissionModel.setData(oUserPermissionData);
			this.setModel(oUserPermissionModel, "UserPermissionModel");
			// check domain access permission
			var bDomainAccess = Utils.checkDomainAccess(oUserPermissionData, "Role");
			if (!bDomainAccess) {
               this.getRouter().navTo("notFound");
			}
			// initial all the pages buttons state
			var oButtonStateModel = new JSONModel();
			oButtonStateModel.setData(Utils.getUserPermissionSate(oUserPermissionData, false));
			this.setModel(oButtonStateModel, "ButtonStateModel");
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