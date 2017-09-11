sap.ui.define([
	"sap/security/privilege/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/security/privilege/common/Formatter", "sap/security/privilege/common/Util", "sap/security/privilege/common/ModelUtil"
], function(BaseController, JSONModel, MessageToast, Formatter, Util, ModelUtil) {
	"use strict";

	return BaseController.extend("sap.security.privilege.controller.RoleDetail", {
		_sDistination: "/destinations/Security_OData",
		_sRoleId: null,
		_oRole: null,
		formatter: Formatter,
		/**
		 * @function
		 * @name onInit
		 * @description init analytica page
		 */
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("roledetail").attachMatched(this._onRouteMatched, this);
		},
		/**
		 * @function
		 * @name _onRouteMatched
		 * @description init page
		 * @param {object} oEvent - on route matched event
		 */
		_onRouteMatched: function(oEvent) {
			this._sRoleId = oEvent.getParameter("arguments").roleId;
			this.setupPageModel();
		},
		/**
		 * @function
		 * @name setupPageModel
		 * @description setup page models
		 */
		setupPageModel: function() {
			this.initUserRoleModel();
			this.initRoleModel();
		},
		/**
		 * @function
		 * @name initUserRoleModel
		 * @description init user-role model
		 */
		initUserRoleModel: function() {
			var oUserRolesModel = new JSONModel();
			var oTableControl = this.getView().byId("idUserRolesTable");
			var oTableTitleControl = this.getView().byId("idUserRolesTableTitle");
			var sTitle = oTableTitleControl.getText().split("(")[0];
			var sUrl = this._sDistination + "/user/role/" + this._sRoleId;

			ModelUtil.requestGETData(sUrl).then(function(oPagesData) {
				oUserRolesModel.setData(oPagesData.content);
				oTableControl.setModel(oUserRolesModel, "userRoles");
				var iRowCount = oUserRolesModel.getData().length;
				oTableTitleControl.setText(sTitle + "(" + iRowCount + ")");
			}).catch(function() {
				MessageToast.show("ERROR");
			});
		},

		/**
		 * @function
		 * @name initRoleModel
		 * @description init role model & all privilege model (all privilege in this role)
		 */
		initRoleModel: function() {
			var oControl = this.getView().byId("idAllPrivilegesList");
			var oPrivilegeModel = new JSONModel();
			var that = this;
			var sUrl = this._sDistination + "/role/" + this._sRoleId;

			ModelUtil.requestGETData(sUrl).then(function(oData) {
				that.initPageTitle(oData);
				return oData;
			}).then(function(oData) {
				var aPrivilegeSet = [];
				_.forEach(oData.privilegeSet, function(oPrivilege) {
					oPrivilege.name = "targetDomain: " + oPrivilege.targetDomain;
					oPrivilege.description = "permission: " + oPrivilege.permission;
					aPrivilegeSet.push(oPrivilege);
				});
				return aPrivilegeSet;
			}).then(function(aPrivilegeSet) {
				oPrivilegeModel.setData(aPrivilegeSet);
				oControl.setModel(oPrivilegeModel, "AllPrivilege");
			}).catch(function() {
				MessageToast.show("ERROR");
			});
		},

		initPageTitle: function(oRole) {
			this._oRole = oRole;
			var oControl = this.getView().byId("idRoleDetailPageTitle");
			oControl.setObjectTitle(this._oRole.name);
		},

		/** 
		 * @function 
		 * @name onHandleEdit
		 * @description go to edit role
		 * @param {object} oEvent - event object
		 */
		onHandleEdit: function(oEvent) {
			var oView = this.getView();
			if (!this._oCreateRoleDialog) {
				this._oCreateRoleDialog = sap.ui.xmlfragment(oView.getId(), "sap.security.privilege.view.fragment.CreateRoleDialog", this);
				oView.addDependent(this._oCreateRoleDialog);
			}

			// Load Role
			this._oRole.type = "edit";

			var oRoleModel = new JSONModel(this._oRole);
			var oPrivilegeModel = new JSONModel(Util.deepPrivilegeData(this._oRole.privilegeSet));

			this._oCreateRoleDialog.setModel(oRoleModel, "roleModel");
			this._oCreateRoleDialog.setModel(oPrivilegeModel, "privilegeModel");

			this._oCreateRoleDialog.open();

		},
		/**
		 * @function
		 * @name onInputChange
		 * @description handle input fields value change
		 * @param {object} oEvent - event object
		 */
		onInputChange: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			var sId = oEvent.getSource().getId();
			var oInput = sap.ui.getCore().byId(sId);
			if (sValue === null || sValue === "") {
				oInput.setValueState(sap.ui.core.ValueState.Error);
				oInput.setValueStateText("Empty");
			} else {
				oInput.setValueState(sap.ui.core.ValueState.None);
			}
		},
		/**
		 * @function
		 * @name onNavToUserDetail
		 * @description handle navigate to user detail page
		 * @param {object} oEvent - event object
		 */
		onNavToUserDetail: function(oEvent) {
			// https://blogs.sap.com/2016/06/20/cross-application-navigation-between-sapui5-applications/
			var oContext = oEvent.getSource().getBindingContext("userRoles");
			var oData = oContext.getModel().getProperty(oContext.getPath());
			// get a handle on the global XAppNav service
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.isIntentSupported(["Role_Management-Display"])
				.done(function(aResponses) {

				})
				.fail(function() {

				});
			// generate the Hash to display a employee Id
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Role_Management",
					action: "Display&/userdetail/" + oData.id
				}
			})) || "";
			//Generate a  URL for the second application
			var url = window.location.href.split('#')[0] + hash;
			//Navigate to second app
			sap.m.URLHelper.redirect(url, false);
		},
		/**
		 * @function
		 * @name onPressCancel
		 * @description handle confirm deletion
		 * @param {object} oEvent - event object
		 */
		onPressCancel: function(oEvent) {
			this.getView().byId("idDeleteConfirmPopup").close();
			MessageToast.show("Canceled Deletion!");
		},
		/**
		 * @function
		 * @name onConfirmDeleted
		 * @description handle confirm deletion
		 * @param {object} oEvent - event object
		 */
		onConfirmDeleted: function(oEvent) {
			var that = this;
			$.ajax({
				url: this._sDistination + "/role/" + that._sRoleId,
				type: "DELETE",
				contentType: "application/json; charset=UTF-8"
			}).done(function(data, textStatus) {
				that.getView().byId("idDeleteConfirmPopup").close();
				MessageToast.show("Delete successfully!");
				that.getRouter().navTo("privilege");
			}).fail(function(jqXHR, textStatus, errorThrown) {
				that.getView().byId("idDeleteConfirmPopup").close();
				MessageToast.show("Delete Failed!");
			});
		},
		/** 
		 * @function 
		 * @name onAfterRendering
		 * @description after rendering
		 */
		onAfterRendering: function() {}
	});
});