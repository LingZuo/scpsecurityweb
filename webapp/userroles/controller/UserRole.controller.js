sap.ui.define([
	"sap/security/userroles/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast", "sap/ui/model/Filter",
	"sap/ui/comp/filterbar/FilterBar", "sap/security/userroles/common/Formatter", "sap/security/userroles/common/ModelUtils",
	"sap/security/userroles/common/Utils"
], function(BaseController, JSONModel, MessageToast, Filter, FilterBar, Formatter, ModelUtils, Utils) {
	"use strict";

	return BaseController.extend("sap.security.userroles.controller.UserRole", {

		formatter: Formatter, // Define alias to call Formatter directly in the view.
		_sUserId: null,
		_sDistination: "/destinations/Security_OData",
		_iPageSize: 100,
		_fnResourceBundle: null,

		/**
		 * @function
		 * @name onInit
		 * @description init analytica page
		 */
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("userroles").attachMatched(this._onRouteMatched, this);
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
			// init page data model
			this.initPageModel("user", this._iPageSize, true);
			this.initViewSettingConfig();
		},
		/**
		 * @function
		 * @name initPageModel
		 * @description initial page data model
		 * @param {string} sType - page entity type: user, role
		 * @param {integer} iSize - page size
		 * @param {boolean} bUserList - true if the page entity is user, else is false
		 * @param {object} oSearchCre - search bar filter
		 * @return {object} return promise object
		 */
		initPageModel: function(sType, iSize, bUserList, oSearchCre) {
			var oModel = new JSONModel();
			var aDataList = [];
			var sPagesServiceUrl = this._sDistination + "/" + sType + "/page?size=" + iSize;
			var that = this;
			return ModelUtils.getPOSTData(sPagesServiceUrl, oSearchCre).then(function(oPagesData) {
				_.forEach(oPagesData.content, function(oContent) {
					aDataList.push(oContent);
				});
				oModel.setData(aDataList);
				if (bUserList) {
					that.getView().byId("idUserRolesTable").setModel(oModel, "userRoles");
				}
				var iPages = oPagesData.totalPages;
				if (iPages > 1) {
					var aFnGetPagesWithSizeUrl = [];
					// prepare for pages service url
					for (var iIndex = 1; iIndex < iPages; iIndex++) {
						aFnGetPagesWithSizeUrl.push(that._sDistination + "/" + sType + "/page?size=" + iSize + "&page=" + iIndex);
					}
					return ModelUtils.getAllPagesDataWithSize(aFnGetPagesWithSizeUrl, aDataList, oSearchCre);
				}
			}).then(function(aEmployeeListData) {
				oModel.refresh();
				if (bUserList) {
					Utils.updateTableTitle(that.getView(), "idUserRolesTableTitle", aDataList.length);
				} else {
					var oView = that.getView();
					that.oRoleAssignmentPopup = oView.byId("idRoleAssignmentPopup");
					if (!that.oRoleAssignmentPopup) {
						that.oRoleAssignmentPopup = sap.ui.xmlfragment(oView.getId(), "sap.security.userroles.view.fragment.RoleAssignment", that);
						oView.addDependent(that.oRoleAssignmentPopup);
					}
					that.oRoleAssignmentPopup.setModel(oModel, "RolesSetModel");
					// clear the old search filter
					that.oRoleAssignmentPopup.getBinding("items").filter([]);
					that.oRoleAssignmentPopup.open();
				}
			}).catch(function(sError) {
				jQuery.sap.log.error("Error info: " + sError);
			});
		},
		/**
		 * @function
		 * @name initViewSettingConfig
		 * @description init view setting popup configuraton
		 */
		initViewSettingConfig: function() {
			var aTableColumns = [{
				"name": this._fnResourceBundle.getText("userId"),
				"default": false
			}, {
				"name": this._fnResourceBundle.getText("employeeNumber"),
				"default": false
			}, {
				"name": this._fnResourceBundle.getText("loginName"),
				"default": true
			}, {
				"name": this._fnResourceBundle.getText("lastName"),
				"default": false
			}, {
				"name": this._fnResourceBundle.getText("firstName"),
				"default": false
			}, {
				"name": this._fnResourceBundle.getText("gender"),
				"default": true
			}, {
				"name": this._fnResourceBundle.getText("mobileNumber"),
				"default": false
			}, {
				"name": this._fnResourceBundle.getText("email"),
				"default": true
			}, {
				"name": this._fnResourceBundle.getText("roleState"),
				"default": true
			}, {
				"name": this._fnResourceBundle.getText("status"),
				"default": true
			}, {
				"name": this._fnResourceBundle.getText("type"),
				"default": true
			}];
			var oSettingsModel = new JSONModel(aTableColumns);
			var oView = this.getView();
			this.oSettingsPopup = oView.byId("idViewSettingsPopup");
			if (!this.oSettingsPopup) {
				this.oSettingsPopup = sap.ui.xmlfragment(oView.getId(), "sap.security.userroles.view.fragment.Settings", this);
				this.oSettingsPopup.setModel(oSettingsModel);
				oView.addDependent(this.oSettingsPopup);
			}
			// initial default selected items
			var aItems = this.oSettingsPopup.getItems();
			_.forEach(aTableColumns, function(oTableItem, iIndex) {
				if (oTableItem.default) {
					aItems[iIndex].setSelected(true);
				}
			});
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", oView, this.oSettingsPopup);
		},
		/**
		 * @function
		 * @name onHandleUserRowSelectionChange
		 * @description manage assign button and delete button state
		 */
		onHandleUserRowSelectionChange: function() {
			var oView = this.getView();
			var aSelectedIndex = oView.byId("idUserRolesTable").getSelectedIndices();
			var oButtonState = this.getModel("ButtonStateModel").getData();
			if (aSelectedIndex.length > 0) {
				oButtonState.AssignButtonState = true;
				oButtonState.DeleteButtonState = (aSelectedIndex.length === 1) ? true : false;
			} else {
				oButtonState.AssignButtonState = false;
				oButtonState.DeleteButtonState = false;
			}
			this.getModel("ButtonStateModel").refresh(true);
		},
		/**
		 * @function
		 * @name onhandleSearchEmployees
		 * @description handle search
		 * @param {object} oEvent - event object
		 */
		onhandleSearchEmployees: function(oEvent) {
			var aSearchFileds = ["employeeNumber", "email", "loginName", "firstName", "lastName", "mobileNumber", "gender", "type", "status"];
			var aSearchSet = oEvent.getParameter("selectionSet");
			var oSearchCre = {};
			_.forEach(aSearchSet, function(iSearch, index) {
				if (iSearch.getValue()) {
					oSearchCre[aSearchFileds[index]] = iSearch.getValue();
				}
			});
			this.initPageModel("user", this._iPageSize, true, oSearchCre);
		},
		/**
		 * @function
		 * @name onOpenAddUserPopover
		 * @description handle open add user popover
		 * @param {object} oEvent - event object
		 */
		onOpenAddUserPopover: function(oEvent) {
			var oView = this.getView();
			if (!this.oAddUserPopover) {
				this.oAddUserPopover = sap.ui.xmlfragment(oView.getId(), "sap.security.userroles.view.fragment.AddButtonsPopover", this);
				oView.addDependent(this.oAddUserPopover);
			}
			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function() {
				this.oAddUserPopover.openBy(oButton);
			});
		},
		/**
		 * @function
		 * @name onHandleAdd
		 * @description handle search
		 * @param {object} oEvent - event object
		 */
		onHandleAdd: function(oEvent) {
			this.getRouter().navTo("adduser");
		},
		/**
		 * @function
		 * @name onHandleDelete
		 * @description handle delete
		 * @param {object} oEvent - event object
		 */
		onHandleDelete: function(oEvent) {
			var oView = this.getView();
			var iSelectedIndex = oView.byId("idUserRolesTable").getSelectedIndex();
			if (iSelectedIndex === -1) {
				MessageToast.show(this._fnResourceBundle.getText("userDeletionNoSelectionMsg"));
				return;
			}
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
		 * @name onConfirmDeleted
		 * @description handle confirm deletion
		 * @param {object} oEvent - event object
		 */
		onConfirmDeleted: function(oEvent) {
			var that = this;
			var iSelectedIndex = this.getView().byId("idUserRolesTable").getSelectedIndex();
			var oUserRoleModel = this.getView().byId("idUserRolesTable").getModel("userRoles");
			var sUserId = oUserRoleModel.getData()[iSelectedIndex].id;
			var sServiceUrl = this._sDistination + "/user/" + sUserId;
			ModelUtils.deleteSelectedUser(sServiceUrl).then(function() {
				var aUsers = oUserRoleModel.getData();
				aUsers.splice(iSelectedIndex, 1);
				oUserRoleModel.refresh(true);
				that.getView().byId("idUserRolesTable").setSelectedIndex(-1);
				MessageToast.show(that._fnResourceBundle.getText("userDeletedMsg"));
			}).catch(function(sError) {
				MessageToast.show(that._fnResourceBundle.getText("userDeletionFailedMsg"));
			});
			this.getView().byId("idDeleteConfirmPopup").close();
		},
		/**
		 * @function
		 * @name onPressCancel
		 * @description handle confirm deletion
		 * @param {object} oEvent - event object
		 */
		onPressCancel: function(oEvent) {
			this.getView().byId("idDeleteConfirmPopup").close();
			MessageToast.show(this._fnResourceBundle.getText("userDeletionCanceledMsg"));
		},
		/**
		 * @function
		 * @name onHandleSetting
		 * @description handle settings
		 * @param {object} oEvent - event object
		 */
		onHandleSetting: function() {
			// clear the old search filter
			this.oSettingsPopup.getBinding("items").filter([]);
			this.oSettingsPopup.open();
		},
		/**
		 * @function
		 * @name onHandleConfirm
		 * @description handle confirm settings
		 * @param {object} oEvent - event object
		 */
		onHandleConfirm: function(oEvent) {
			var aSelectedItems = oEvent.getParameters().selectedContexts;
			var aSelectedIndexs = [];
			// prepare setected index
			_.forEach(aSelectedItems, function(fnItem) {
				aSelectedIndexs.push(parseInt(fnItem.getPath().split("/")[1]));
			});
			var oTableControl = this.getView().byId("idUserRolesTable");
			var iTableColumnLength = oTableControl.getColumns().length;
			var tableIndexs = [];
			// prepare table index set
			for (var i = 0; i < iTableColumnLength; i++) {
				tableIndexs[i] = i;
			}
			_.forEach(_.difference(tableIndexs, aSelectedIndexs), function(iIndex) {
				oTableControl.getColumns()[iIndex].setVisible(false);
			});
			_.forEach(_.intersection(tableIndexs, aSelectedIndexs), function(iIndex) {
				oTableControl.getColumns()[iIndex].setVisible(true);
			});
		},
		/**
		 * @function
		 * @name onHandleSearch
		 * @description handle search for settings popup and assignment popup
		 * @param {object} oEvent - event object
		 */
		onHandleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("name", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		/**
		 * @function
		 * @name onHandleCancelViewSettings
		 * @description handle close view settings popup
		 * @param {object} oEvent - event object
		 */
		onHandleCancelViewSettings: function(oEvent) {
			MessageToast.show(this._fnResourceBundle.getText("viewSettingsCanceledMsg"));
		},
		/**
		 * @function
		 * @name onHandleAssign
		 * @description handle role assignment
		 */
		onHandleAssign: function() {
			this.initPageModel("role", this._iPageSize, false);
		},
		/**
		 * @function
		 * @name onHandleConfirmAssignment
		 * @description handle confirm role assignment
		 * @param {object} oEvent - event object
		 */
		onHandleConfirmAssignment: function(oEvent) {
			var aSelectedItems = oEvent.getParameters().selectedContexts;
			if (aSelectedItems.length === 0) {
				MessageToast.show(this._fnResourceBundle.getText("roleNoSelectionMsg"));
				jQuery.sap.log.error("Please select at least one role!");
				return;
			}
			var aSelectedUserIndices = this.getView().byId("idUserRolesTable").getSelectedIndices();
			var aUserRoleData = this.getView().byId("idUserRolesTable").getModel("userRoles").getData();
			var aRoleList = this.oRoleAssignmentPopup.getModel("RolesSetModel").getData();
			var aRoleSet = [];
			_.forEach(aSelectedItems, function(oItem) {
				var iIndex = parseInt(oItem.getPath().split("/")[1], 10);
				aRoleSet.push({
					"id": aRoleList[iIndex].id
				});
			});
			var aMassAssignmentData = [];
			_.forEach(aSelectedUserIndices, function(iIndex) {
				aMassAssignmentData.push({
					"id": aUserRoleData[iIndex].id,
					"roleSet": aRoleSet
				});
			});
			var that = this;
			var sServiceUrl = this._sDistination + "/user/mass";
			ModelUtils.updateUserDetailInfo(sServiceUrl, aMassAssignmentData).then(function(bUpdated) {
				MessageToast.show(that._fnResourceBundle.getText("roleMassAssignmentMsg"));
				that.initPageModel("user", that._iPageSize, true);
			}).catch(function(sError) {
				MessageToast.show(that._fnResourceBundle.getText("roleMassAssignmentFaildMsg"));
				jQuery.sap.log.error("mass assign user roles faild! Error info: " + sError);
			});
		},
		/**
		 * @function
		 * @name onHandleCancelAssignment
		 * @description handle cancel role assignment
		 * @param {object} oEvent - event object
		 */
		onHandleCancelAssignment: function(oEvent) {
			MessageToast.show(this._fnResourceBundle.getText("roleAssignmentCanceledMsg"));
		},
		/**
		 * @function
		 * @name onNavToDetail
		 * @description handle navigate to user detail page
		 * @param {object} oEvent - event object
		 */
		onNavToDetail: function(oEvent) {
			var sText = oEvent.getSource().getText();
			var aUserData = this.getView().byId("idUserRolesTable").getModel("userRoles").getData();
			var oSelectedUser = _.filter(aUserData, function(oUser) {
				return oUser.loginName === sText;
			});
			this.getRouter().navTo("userdetail", {
				"id": oSelectedUser[0].id
			});
		},
		/**
		 * @function
		 * @name onHandleResetFB
		 * @description handle reset filters on filter bar
		 * @param {object} oEvent - event object
		 */
		onHandleResetFB: function(oEvent) {
			var aSearchSet = oEvent.getParameter("selectionSet");
			_.forEach(aSearchSet, function(oSearch) {
				oSearch.setValue("");
			});
			this.initPageModel("user", this._iPageSize, true);
		},
		/** 
		 * @function 
		 * @name onAfterRendering
		 * @description after rendering
		 */
		onAfterRendering: function() {}
	});
});