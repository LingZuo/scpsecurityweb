sap.ui.define([
	"sap/security/userroles/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast", "sap/ui/model/Filter",
	"sap/ui/comp/filterbar/FilterBar", "sap/security/userroles/common/ModelUtils",
	"sap/security/userroles/common/Utils"
], function(BaseController, JSONModel, MessageToast, Filter, FilterBar, ModelUtils, Utils) {
	"use strict";

	return BaseController.extend("sap.security.userroles.controller.UserDetail", {
		_sUserId: null,
		_oUserProfileData: null,
		_sDistination: "/destinations/Security_OData",
		_rolePageSize: 100,
		_fnResourceBundle: null,
		_sServiceUrl: "/destinations/Security_OData" + "/user",
		_aSystemRoleList: null,

		/**
		 * @function
		 * @name onInit
		 * @description init analytica page
		 */
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("userdetail").attachMatched(this._onRouteMatched, this);
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
			var oArgs = oEvent.getParameter("arguments");
			this._sUserId = oArgs.id;
			this.setupPageModel(this._sUserId);
		},
		/**
		 * @function
		 * @name setupPageModel
		 * @description setup page models
		 * @param {string} sUserId - user id
		 */
		setupPageModel: function(sUserId) {
			var sServiceUrl = this._sServiceUrl + "/" + sUserId;
			var oUserDetailModel = new JSONModel();
			oUserDetailModel.loadData(sServiceUrl, null, false);
			this.getView().setModel(oUserDetailModel, "UserDetailModel");
			var oUserData = oUserDetailModel.getData();
			this.getView().byId("idUserGenderSelection").setSelectedKey(oUserData.gender);
			this.getView().byId("idUserTypeSelection").setSelectedKey(oUserData.type);
			this.getView().byId("idUserStatusSelection").setSelectedKey(oUserData.status);
			// update table title with row count
			var aRowSet = oUserData.roleSet;
			if (aRowSet) {
				Utils.updateTableTitle(this.getView(), "idTableTitle", oUserData.roleSet.length);
			}
			// initital privilege data
			var aPrivilegeData = Utils.getPrivilegeData(aRowSet);
			var oPrivilegeModel = new JSONModel(aPrivilegeData);
			this.getView().byId("idAllPrivilegesList").setModel(oPrivilegeModel, "AllPrivilege");
			this._oUserProfileData = _.cloneDeep(oUserData);
			// prepare role list data model for role assignment popup
			this.setupRoleListModel(this._rolePageSize);
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
		 * @name updateButtonState
		 * @description update page button states
		 * @param {boolean} bEdit - true if current page model is edit model, else false
		 */
		updateButtonState: function(bEdit) {
			var oButtonStateModel = this.getModel("ButtonStateModel");
			var oButtonStateData = oButtonStateModel.getData();
			oButtonStateData.EditVisible = !bEdit;
			oButtonStateData.SaveVisible = bEdit;
			oButtonStateData.UserInfoEditable = bEdit;
			oButtonStateData.UserDeletable = !bEdit && oButtonStateData.deleteVisible ? true : false;
			oButtonStateModel.refresh(true);
		},
		/**
		 * @function
		 * @name onHandleAssign
		 * @description handle role assignment
		 */
		onHandleAssign: function() {
			var oRolesSetModel = this.oRoleAssignmentPopup.getModel("RolesSetModel");
			var oUserRoles = this.getView().getModel("UserDetailModel").getData();
			if (oUserRoles && oUserRoles.roleSet) {
				oRolesSetModel.setData(_.differenceBy(this._aSystemRoleList, oUserRoles.roleSet, "id"));
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
		 * @param {object} oEvent - event object
		 */
		onHandleConfirmAssignment: function(oEvent) {
			var that = this;
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var oUserRoleData = {
				"id": this._sUserId,
				"roleSet": []
			};
			_.forEach(aSelectedItems, function(oItem) {
				oUserRoleData.roleSet.push({
					"id": oItem.getCells()[0].getText()
				});
			});
			ModelUtils.updateUserDetailInfo(this._sServiceUrl, oUserRoleData).then(function(oNewUserData) {
				var oUserDetailModel = that.getView().getModel("UserDetailModel");
				var aPrivilegeData = Utils.getPrivilegeData(oNewUserData.roleSet);
				oUserDetailModel.setData(oNewUserData);
				oUserDetailModel.refresh(true);
				var oPrivilegeModel = that.getView().byId("idAllPrivilegesList").getModel("AllPrivilege");
				oPrivilegeModel.setData(aPrivilegeData);
				var oUserPermissionData = Utils.getUserPermissionData(oNewUserData);
				that.getModel("UserPermissionModel").setData(oUserPermissionData);
				that.getModel("ButtonStateModel").setData(Utils.getUserPermissionSate(oUserPermissionData, false));
				MessageToast.show(that._fnResourceBundle.getText("roleAssignedMsg"));
			}).catch(function(sError) {
				jQuery.sap.log.error("update user role data faild! Error info: " + sError);
			});
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
		 * @description handle role un-assignment
		 */
		onHandleUnassign: function() {
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
		 * @description handle role un-assignment confirmation
		 * @param {object} oEvent - event object
		 */
		onConfirmUnassignment: function(oEvent) {
			var that = this;
			var oView = this.getView();
			var aSelectedIndex = oView.byId("idRoleItemsTable").getSelectedIndices();
			var aSelectedRoles = [];
			var aUserRoles = [];
			var oUserDetail = this.getView().getModel("UserDetailModel").getData();
			var aUserRoleSet = oUserDetail.roleSet;
			_.forEach(aUserRoleSet, function(oUsreRoleSet) {
				aUserRoles.push({
					"id": oUsreRoleSet.id
				});
			});
			_.forEach(aSelectedIndex, function(iIndex) {
				aSelectedRoles.push({
					"id": aUserRoleSet[iIndex].id
				});
			});
			oUserDetail.roleSet = _.differenceBy(aUserRoles, aSelectedRoles, "id");
			var sServiceUrl = this._sDistination + "/user";
			ModelUtils.putUpdateUserRoles(sServiceUrl, oUserDetail).then(function(oData) {
				// reset privilege data model
				var oPrivilegeModel = that.getView().byId("idAllPrivilegesList").getModel("AllPrivilege");
				oPrivilegeModel.setData((Utils.getPrivilegeData(oData.roleSet)));
				// reset user detail model
				var oUserDetailModel = that.getView().getModel("UserDetailModel");
				oUserDetailModel.setData(oData);
				oUserDetailModel.refresh(true);
				// save the latest user detail data
				that._oUserProfileData = _.cloneDeep(oData);
				// reset user permission data model
				var oUserPermissionData = Utils.getUserPermissionData(oData);
				that.getModel("UserPermissionModel").setData(oUserPermissionData);
				// reset page button state
				that.getModel("ButtonStateModel").setData(Utils.getUserPermissionSate(oUserPermissionData, false));
				oView.byId("idUnassignConfirmPopup").close();
				that.getView().byId("idRoleItemsTable").setSelectedIndex(-1);
				MessageToast.show(that._fnResourceBundle.getText("roleUnassignedMsg"));
			}).catch(function(sError) {
				MessageToast.show(that._fnResourceBundle.getText("roleUnassignementFaildMsg"));
				jQuery.sap.log.error("Role unassignment faild! Error info: " + sError);
			});
		},
		/**
		 * @function
		 * @name onConfirmDeleted
		 * @description handle confirm user deletion
		 * @param {object} oEvent - event object
		 */
		onConfirmDeleted: function(oEvent) {
			var sServiceUrl = this._sDistination + "/user/" + this._sUserId;
			var that = this;
			ModelUtils.deleteSelectedUser(sServiceUrl).then(function() {
				that.getRouter().navTo("userroles");
				MessageToast.show(that._fnResourceBundle.getText("userDeletedMsg"));
			}).catch(function(sError) {
				MessageToast.show(that._fnResourceBundle.getText("userDeletionFailedMsg"));
				jQuery.sap.log.error("Delete employee (id is:" + that._sUserId + ") failed! Error info: " + sError);
			});
			this.getView().byId("idDeleteConfirmPopup").close();
		},
		/**
		 * @function
		 * @name onPressCancel
		 * @description handle confirm deletion, cancel user deletion
		 * @param {object} oEvent - event object
		 */
		onPressCancel: function(oEvent) {
			var sPopupId = oEvent.getSource().getParent().getId();
			this.getView().byId(sPopupId).close();
			MessageToast.show(this._fnResourceBundle.getText("userDeletionCanceledMsg"));
		},
		/**
		 * @function
		 * @name onHandleEdit
		 * @description handle edit user info
		 */
		onHandleEdit: function() {
			this.updateButtonState(true);
		},
		/**
		 * @function
		 * @name onHandlecancel
		 * @description handle cancel change
		 */
		onHandlecancel: function() {
			// reset user detail model
			var oUserDetailModel = this.getView().getModel("UserDetailModel");
			var oPreviousData = _.cloneDeep(this._oUserProfileData);
			oUserDetailModel.setData(oPreviousData);
			oUserDetailModel.refresh(true);
			this.getView().byId("idUserGenderSelection").setSelectedKey(oPreviousData.gender);
			this.getView().byId("idUserTypeSelection").setSelectedKey(oPreviousData.type);
			this.getView().byId("idUserStatusSelection").setSelectedKey(oPreviousData.status);
			// reset page button state
			this.updateButtonState(false);
			MessageToast.show(this._fnResourceBundle.getText("userUpdateCanceledMsg"));
		},
		/**
		 * @function
		 * @name onHandleSave
		 * @description handle save change
		 * @param {object} oEvent - event object
		 */
		onHandleSave: function(oEvent) {
			Utils.inputFieldsValidationCheck(["idLoginName", "idEmail", "idFirstName", "idUserGenderSelection", "idLastName",
				"idUserStatusSelection", "idUserTypeSelection"
			], this.getView(), this._fnResourceBundle);
			var iErrorLength = sap.ui.getCore().getMessageManager().getMessageModel().getData().length;
			if (iErrorLength > 0) {
				MessageToast.show(this._fnResourceBundle.getText("mandatorylostMsg"));
				return;
			}
			var oUserDetailModel = this.getView().getModel("UserDetailModel");
			var oNewUserDetailData = oUserDetailModel.getData();
			// check user gender
			var sGender = this.getView().byId("idUserGenderSelection").getSelectedKey();
			if (oNewUserDetailData.gender !== sGender) {
				oNewUserDetailData.gender = sGender;
			}
			// check user status
			var sStatus = this.getView().byId("idUserStatusSelection").getSelectedKey();
			if (oNewUserDetailData.status !== sStatus) {
				oNewUserDetailData.status = sStatus;
			}
			// check user type
			var sType = this.getView().byId("idUserTypeSelection").getSelectedKey();
			if (oNewUserDetailData.type !== sType) {
				oNewUserDetailData.type = sType;
			}
			var that = this;
			ModelUtils.updateUserDetailInfo(this._sServiceUrl, oNewUserDetailData).then(function() {
				that._oUserProfileData = _.cloneDeep(oNewUserDetailData);
				that.updateButtonState(false);
				MessageToast.show(that._fnResourceBundle.getText("userSavedMsg"));
			}).catch(function(sError) {
				jQuery.sap.log.error("update user profile data faild! Error info: " + sError);
			});
		},
		/**
		 * @function
		 * @name onHandleDelete
		 * @description handle delete user
		 * @param {object} oEvent - event object
		 */
		onHandleDelete: function(oEvent) {
			var oView = this.getView();
			var oDeleteConfirmPopup = oView.byId("idDeleteConfirmPopup");
			if (!oDeleteConfirmPopup) {
				oDeleteConfirmPopup = sap.ui.xmlfragment(oView.getId(), "sap.security.userroles.view.fragment.DeleteConfirmPopup", this);
				oView.addDependent(oDeleteConfirmPopup);
			}
			oDeleteConfirmPopup.attachAfterClose(jQuery.proxy(function() {
				oDeleteConfirmPopup.destroy();
			}, this));
			oDeleteConfirmPopup.open();
		},
		/** 
		 * @function 
		 * @name onAfterRendering
		 * @description after rendering
		 */
		onAfterRendering: function() {}
	});
});