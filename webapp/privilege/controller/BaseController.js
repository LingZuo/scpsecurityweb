/**
 * @version 1.0.0
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/security/privilege/common/ModelUtil",
	"sap/security/privilege/common/Util"
], function(Controller, History, ModelUtil, Util) {
	"use strict";

	return Controller.extend("sap.security.privilege.controller.BaseController", {

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * 
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the event bus of this component
		 * 
		 * @public
		 * @returns {sap.ui.core.EventBus} the event bus of component
		 */
		getEventBus: function() {
			return this.getOwnerComponent().getEventBus();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * 
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * 
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * 
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return sap.ui.getCore().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back. It checks if there is a history entry. If yes, history.go(-1) will happen. If not, it will replace the
		 * current entry of the browser history with the master route.
		 * 
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				this.getRouter().navTo("application", {}, true);
			}
		},
		/**
		 * @function
		 * @name onHandleCancleAction
		 * @description cancel creation
		 * @param {object} oEvent - event object
		 */
		onHandleCancleAction: function(oEvent) {
			var oCreateRoleDescription = this.getView().byId("idRoleDescription");
			var oCreateRoleName = this.getView().byId("idRoleName");
			oCreateRoleDescription.setValueState(sap.ui.core.ValueState.None);
			oCreateRoleName.setValueState(sap.ui.core.ValueState.None);

			this._oCreateRoleDialog.close();
		},

		/**
		 * @function
		 * @name onAddPrivilege
		 * @description add a privilege item
		 * @param {object} oEvent - event object
		 */
		onAddPrivilege: function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext("privilegeModel");
			var oModel = oContext.getModel();
			oModel.getData().push({
				"permissionSet": [],
				"targetDomain": ""
			});

			oModel.refresh(true);
		},
		/**
		 * @function
		 * @name onRemovePrivilege
		 * @description remove a privilege item
		 * @param {object} oEvent - event object
		 */
		onRemovePrivilege: function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext("privilegeModel");
			var oModel = oContext.getModel();
			var aData = oModel.getData();
			var iIndex = oContext.getPath().split("/")[1];
			aData.splice(iIndex, 1);
			oModel.refresh(true);
		},

		/**
		 * @function
		 * @name onHandleCreateAction
		 * @description create role
		 * @param {object} oEvent - event object
		 */
		onHandleCreateAction: function(oEvent) {
			var oRoleData = this._oCreateRoleDialog.getModel("roleModel").getData();
			var aPrivilegeData = this._oCreateRoleDialog.getModel("privilegeModel").getData();
			var that = this;

			// Validation
			if (oRoleData.name === null || oRoleData.name === "") {
				var oCreateRoleName = this.getView().byId("idRoleName");
				oCreateRoleName.setValueState(sap.ui.core.ValueState.Error);
				oCreateRoleName.setValueStateText("Mandatory");
				return;
			}
			if (oRoleData.description === null || oRoleData.description === "") {
				var oCreateRoleDescription = this.getView().byId("idRoleDescription");
				oCreateRoleDescription.setValueState(sap.ui.core.ValueState.Error);
				oCreateRoleName.setValueStateText("Mandatory");
				return;
			}

			// TODO ComboBox Validation
			/*for (var i = 0; i < aPrivilegeData.length; ++i) {
				if (aPrivilegeData[i].targetDomain === "") {
					var oControl = this.getView().byId("application-Privilege-Display-component---ViewPrivilege--idCreateTargetDomain-__list2-" + i + "-inner");
					oControl.setValueState(sap.ui.core.ValueState.Error);
					oControl.setValueStateText("Mandatory");
					return;
				}
				if (aPrivilegeData[i].permissionSet.length === 0) {
					var oControl = this.getView().byId("application-Privilege-Display-component---ViewPrivilege--idCreatePermission-__list2-" + i + "-inner");
					oControl.setValueState(sap.ui.core.ValueState.Error);
					oControl.setValueStateText("Mandatory");
					return;
				}
			}*/

			oRoleData.privilegeSet = Util.flatPrivilege(aPrivilegeData);
			var sUrl = this._sDistination + "/role";
			if (oRoleData.type === "create") {
				ModelUtil.requestPOSTData(sUrl, oRoleData).then(function(oData) {
					that.initRolePrivilegeModel();
					that._oCreateRoleDialog.close();
				}).catch(function() {
					that._oCreateRoleDialog.close();
				});
			} else if (oRoleData.type === "edit") {
				ModelUtil.requestPUTData(sUrl, oRoleData).then(function(oData) {
					that.initRolePrivilegeModel();
					that._oCreateRoleDialog.close();
				}).catch(function() {
					that._oCreateRoleDialog.close();
				});
			}
		},
		/**
		 * @function
		 * @name onHandleDelete
		 * @description handle delete
		 * @param {object} oEvent - event object
		 */
		onHandleDelete: function(oEvent) {
			var oView = this.getView();
			var oDeleteConfirmPopup = oView.byId("idDeleteConfirmPopup");
			if (!oDeleteConfirmPopup) {
				oDeleteConfirmPopup = sap.ui.xmlfragment(oView.getId(), ".userroles.view.fragment.DeleteConfirmPopup", this);
				oView.addDependent(oDeleteConfirmPopup);
			}
			oDeleteConfirmPopup.attachAfterClose(jQuery.proxy(function() {
				oDeleteConfirmPopup.destroy();
			}, this));
			oDeleteConfirmPopup.open();
		}
	});
});