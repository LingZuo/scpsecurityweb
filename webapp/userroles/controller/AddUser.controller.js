sap.ui.define([
	"sap/security/userroles/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/security/userroles/common/ModelUtils", "sap/security/userroles/common/Utils"
], function(BaseController, JSONModel, MessageToast, ModelUtils, Utils) {
	"use strict";

	return BaseController.extend("sap.security.userroles.controller.AddUser", {
		_sUserId: null,
		_sDistination: "/destinations/Security_OData",
		_rolePageSize: 2,
		_fnResourceBundle: null,
		_aSystemRoleList: null,

		/**
		 * @function
		 * @name onInit
		 * @description init analytica page
		 */
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("adduser").attachMatched(this._onRouteMatched, this);
			// register message manager
			var oView = this.getView();
			sap.ui.getCore().getMessageManager().registerObject(oView, true);
			// initial i18n resource bundle
			this._fnResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		/**
		 * @function
		 * @name _onRouteMatched
		 * @description init page
		 * @param {object} oEvent - on route matched event
		 */
		_onRouteMatched: function(oEvent) {
			this.setupPageModel();
		},
		/**
		 * @function
		 * @name setupPageModel
		 * @description setup page models
		 */
		setupPageModel: function() {
			this.initUserRoleInfo(true);
			this.initEmptyUserModel();
			this.setupRoleListModel(this._rolePageSize);
		},
		/**
		 * @function
		 * @name initUserRoleInfo
		 * @description init user role infomation
		 * @param {boolean} bInitial - true is add user page intitalize 
		 */
		initUserRoleInfo: function(bInitial) {
			var oUserRolesModel = new JSONModel();
			if (bInitial) {
				oUserRolesModel.setData([]);
			}
			this.setModel(oUserRolesModel, "RoleItemsModel");
			var oPrivilegeModel = new JSONModel([]);
			this.getView().byId("idAllPrivilegesList").setModel(oPrivilegeModel, "AllPrivilege");
		},
		/**
		 * @function
		 * @name initEmptyUserModel
		 * @description init empty user model
		 */
		initEmptyUserModel: function() {
			var oUserModel = new JSONModel({
				// "loginName": null,
				// "email": null,
				// "firstName": null,
				// "lastName": null,
				// "gender": null
			});
			this.getView().setModel(oUserModel, "UserDetailModel");
			this.getView().byId("idUserStatusSelection").setSelectedKey("New");
		},
		/**
		 * @function
		 * @name setupRoleListModel
		 * @description set up role list Model
		 * @param {integer} iSize - role list page size
		 * @return {object} reutrn promise object
		 */
		setupRoleListModel: function(iSize) {
			var oModel = new JSONModel();
			var aDataList = [];
			var sPagesServiceUrl = this._sDistination + "/role/page?size=" + iSize;
			var that = this;
			return ModelUtils.getPOSTData(sPagesServiceUrl).then(function(oPagesData) {
				_.forEach(oPagesData.content, function(oContent) {
					aDataList.push(oContent);
				});
				oModel.setData(aDataList);
				var iPages = oPagesData.totalPages;
				if (iPages > 1) {
					var aFnGetPagesWithSizeUrl = [];
					// prepare for pages service url
					for (var iIndex = 1; iIndex < iPages; iIndex++) {
						aFnGetPagesWithSizeUrl.push(that._sDistination + "/role/page?size=" + iSize + "&page=" + iIndex);
					}
					return ModelUtils.getAllPagesDataWithSize(aFnGetPagesWithSizeUrl, aDataList);
				}
			}).then(function(aEmployeeListData) {
				oModel.refresh();
				var oView = that.getView();
				that.oRoleAssignmentPopup = oView.byId("idRoleAssignmentPopup");
				if (!that.oRoleAssignmentPopup) {
					that.oRoleAssignmentPopup = sap.ui.xmlfragment(oView.getId(), "sap.security.userroles.view.fragment.RoleAssignment", that);
					oView.addDependent(that.oRoleAssignmentPopup);
				}
				that.oRoleAssignmentPopup.setModel(oModel, "RolesSetModel");
				that._aSystemRoleList = oModel.getData();
				// clear the old search filter
				that.oRoleAssignmentPopup.getBinding("items").filter([]);
			}).catch(function(sError) {
				jQuery.sap.log.error("Error info: " + sError);
			});
		},
		/**
		 * @function
		 * @name onHandleAssign
		 * @description handle role assignment
		 */
		onHandleAssign: function() {
			var oRolesSetModel = this.oRoleAssignmentPopup.getModel("RolesSetModel");
			var oUserRoles = this.getModel("RoleItemsModel").getData();
			if (oUserRoles) {
				oRolesSetModel.setData(_.differenceBy(this._aSystemRoleList, oUserRoles, "id"));
			}
			if (this.oRoleAssignmentPopup.getRememberSelections()) {
				this.oRoleAssignmentPopup.setRememberSelections(false);
			}
			oRolesSetModel.refresh();
			this.oRoleAssignmentPopup.open();
		},
		/**
		 * @function
		 * @name onHandleConfirmAssignment
		 * @description handle confirm role assignment
		 * @param {objecy} oEvent - envent object
		 */
		onHandleConfirmAssignment: function(oEvent) {
			var aRoleSetList = this.oRoleAssignmentPopup.getModel("RolesSetModel").getData();
			var oUserRoleItemsModel = this.getModel("RoleItemsModel");
			var oUserRoleData = oUserRoleItemsModel.getData();
			if (!oUserRoleData) {
				oUserRoleData = [];
			}
			var aSelectedItems = oEvent.getParameter("selectedItems");
			_.forEach(aSelectedItems, function(oItem) {
				_.forEach(aRoleSetList, function(oRole) {
					var iCellRoleId = parseInt(oItem.getCells()[0].getText(), 10);
					if (iCellRoleId === oRole.id) {
						oUserRoleData.push(oRole);
					}
				});
			});
			oUserRoleItemsModel.setData(_.sortBy(oUserRoleData, "id"));
			oUserRoleItemsModel.refresh();
			// update role table items count
			Utils.updateTableTitle(this.getView(), "idTableTitle", oUserRoleData.length);
			var oPrivilegeModel = this.getView().byId("idAllPrivilegesList").getModel("AllPrivilege");
			oPrivilegeModel.setData(Utils.getPrivilegeData(oUserRoleData));
			MessageToast.show(this._fnResourceBundle.getText("roleAssignedMsg"));
		},
		/**
		 * @function
		 * @name onHandleCancelAssignment
		 * @description handle cancel role assignment
		 */
		onHandleCancelAssignment: function() {
			MessageToast.show(this._fnResourceBundle.getText("roleAssignmentCanceledMsg"));
		},
		/**
		 * @function
		 * @name onHandleUnassign
		 * @description handle delete mapping role to new added user
		 * @param {object} oEvent - event object
		 */
		onHandleUnassign: function(oEvent) {
			var oView = this.getView();
			var oUnassignConfirmPopup = oView.byId("idUnassignConfirmPopup");
			if (!oUnassignConfirmPopup) {
				oUnassignConfirmPopup = sap.ui.xmlfragment(oView.getId(), "sap.security.userroles.view.fragment.UnassignConfirmPopup", this);
				oView.addDependent(oUnassignConfirmPopup);
			}
			oUnassignConfirmPopup.attachAfterClose(jQuery.proxy(function() {
				oUnassignConfirmPopup.destroy();
			}, this));
			oUnassignConfirmPopup.open();
		},
		/**
		 * @function
		 * @name onConfirmUnassignment
		 * @description handle confirm unassign
		 * @param {object} oEvent - event object
		 */
		onConfirmUnassignment: function(oEvent) {
			var aSelection = this.getView().byId("idRoleItemsTable").getSelectedIndices();
			var oUserRoleModel = this.getModel("RoleItemsModel");
			var oUserRoleItems = oUserRoleModel.getData();
			var aSelectedRoleItems = [];
			_.forEach(aSelection, function(iIndex) {
				aSelectedRoleItems.push(oUserRoleItems[iIndex]);
			});
			var oNewUserRoles = _.differenceBy(oUserRoleItems, aSelectedRoleItems, "id");
			oUserRoleModel.setData(_.sortBy(oNewUserRoles, "id"));
			oUserRoleModel.refresh();
			// update role table items count
			Utils.updateTableTitle(this.getView(), "idTableTitle", oNewUserRoles.length);
			// update page assign button state
			var oButtonStateModel = this.getModel("ButtonStateModel");
			oButtonStateModel.getData().UnAssignRole = false;
			oButtonStateModel.refresh();
			// remove role table selection
			this.getView().byId("idRoleItemsTable").setSelectedIndex(-1);
			// update new privilege data
			var oPrivilegeModel = this.getView().byId("idAllPrivilegesList").getModel("AllPrivilege");
			oPrivilegeModel.setData(Utils.getPrivilegeData(oNewUserRoles));
			this.getView().byId("idUnassignConfirmPopup").close();
			MessageToast.show(this._fnResourceBundle.getText("roleUnassignedMsg"));
		},
		/**
		 * @function
		 * @name onPressCancel
		 * @description handle confirm deletion, cancel unassignment
		 * @param {object} oEvent - event object
		 */
		onPressCancel: function(oEvent) {
			var sPopupId = oEvent.getSource().getParent().getId();
			this.getView().byId(sPopupId).close();
			MessageToast.show(this._fnResourceBundle.getText("roleUnassignmentCancelMsg"));
		},
		/**
		 * @function
		 * @name onHandleSave
		 * @description handle save add a new user
		 */
		onHandleSave: function() {
			Utils.inputFieldsValidationCheck(["idLoginName", "idEmail", "idFirstName", "idUserGenderSelection", "idLastName",
				"idUserStatusSelection", "idUserTypeSelection"
			], this.getView(), this._fnResourceBundle);
			var iErrorLength = sap.ui.getCore().getMessageManager().getMessageModel().getData().length;
			if (iErrorLength > 0) {
				MessageToast.show(this._fnResourceBundle.getText("mandatorylostMsg"));
				return;
			}
			var oUserDetailData = this.getView().getModel("UserDetailModel").getData();
			// prepare gender
			var sGender = this.getView().byId("idUserGenderSelection").getSelectedKey();
			oUserDetailData.gender = sGender;
			// prepare user type
			var sType = this.getView().byId("idUserTypeSelection").getSelectedKey();
			oUserDetailData.type = sType;
			// prepare user status
			var sStatus = this.getView().byId("idUserStatusSelection").getSelectedKey();
			oUserDetailData.status = sStatus;
			// prepare user role set data
			var oUserRoleSet = this.getModel("RoleItemsModel").getData();
			if (oUserRoleSet) {
				oUserDetailData.roleSet = [];
				_.forEach(oUserRoleSet, function(oRole) {
					oUserDetailData.roleSet.push({
						"id": oRole.id
					});
				});
			}
			var that = this;
			// post: create a new user with prepared data
			var sServiceUrl = this._sDistination + "/user";
			ModelUtils.getPOSTData(sServiceUrl, oUserDetailData).then(function(oUserData) {
				MessageToast.show(that._fnResourceBundle.getText("userCreatedMsg"));
				that.getRouter().navTo("userdetail", {
					"id": oUserData.id
				});
			}).catch(function(sError) {
				MessageToast.show(that._fnResourceBundle.getText("userCreatedFailedMsg"));
				jQuery.sap.log.error("Create new user faild! Error info: " + sError);
			});
		},
		/**
		 * @function
		 * @name onHandleCancel
		 * @description handle cancel add a new user
		 */
		onHandleCancel: function() {
			this.getRouter().navTo("userroles");
		},
		/** 
		 * @function 
		 * @name onAfterRendering
		 * @description after rendering
		 */
		onAfterRendering: function() {}
	});
});