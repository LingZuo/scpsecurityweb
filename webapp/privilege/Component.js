jQuery.sap.registerModulePath("sap.security.core", "/webapp/core");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/security/privilege/common/ModelUtil",
	"sap/m/MessageToast",
	"sap/security/privilege/common/Util"
], function(UIComponent, JSONModel, ModelUtil, MessageToast, Util) {
	"use strict";

	return UIComponent.extend("sap.security.privilege.Component", {
		_sDistination: "/destinations/Security_OData",

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

			this.initEnumerationsModel();

			this.initUserModel();
		},

		/**
		 * @function
		 * @name initEnumerationsModel
		 * @description init Enumerations model
		 * @return {object} return promise object
		 */
		initEnumerationsModel: function() {
			var that = this;
			var sUrl = this._sDistination + "/enumerations";
			return ModelUtil.requestGETData(sUrl).then(function(oData) {
				var oAllPrivilege = new JSONModel();
				var oTargetDomain = new JSONModel();

				oAllPrivilege.setData(oData.ActionPermission);
				oTargetDomain.setData(oData.TargetDomain);

				that.setModel(oAllPrivilege, "allPermission");
				that.setModel(oTargetDomain, "allTargetDomain");
			}).catch(function(sError) {
				MessageToast.show("ERROR: " + sError);
			});
		},

		/**
		 * @function
		 * @name initUserModel
		 * @description init User model
		 * @return {object} return promise object
		 */
		initUserModel: function() {
			var that = this;
			var sUrl = this._sDistination + "/user";
			return ModelUtil.requestGETData(sUrl).then(function(oData) {
				that.setModel(oData, "currentUser");
				that.initButtonStateModel(oData.roleSet);
				that.nav();
			}).catch(function(sError) {
				MessageToast.show("ERROR: " + sError);
			});
		},
		/**
		 * @function
		 * @name initUserModel
		 * @description init Button State model
		 * @param {array} aRoleSet - role set array
		 */
		initButtonStateModel: function(aRoleSet) {
			var oButtonStateModel = new JSONModel();
			oButtonStateModel.setData({
				"CreateVisible": Util.checkAccess(aRoleSet, "Role", "Create"),
				"EditVisible": Util.checkAccess(aRoleSet, "Role", "Update"),
				"DeleteVisible": Util.checkAccess(aRoleSet, "Role", "Delete"),
				"RetriveVisible": Util.checkAccess(aRoleSet, "Role", "Retrive"),
				"CanEdit": false,
				"CanDelete": false
			});
			this.setModel(oButtonStateModel, "ButtonStateModel");
		},
		/**
		 * @function
		 * @name initUserModel
		 * @description nav to notFound if the current user don't hava Retrive permission
		 */
		nav: function() {
			if (!this.getModel("ButtonStateModel").getData().RetriveVisible) {
				this.getRouter().navTo("notFound");
			}
		}

	});
});