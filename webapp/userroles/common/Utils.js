sap.ui.define([], function() {
	"use strict";
	var Utils = {
		/**
		 * @function
		 * @name getUserPermissionData
		 * @description get user profile info
		 * @param {object} oUserPrifileData - input parameter user profile info
		 * @return {object} return user permission object
		 */
		getUserPermissionData: function(oUserPrifileData) {
			var oUserPermission = {
				"permission": [],
				"targetDomain": []
			};
			if (oUserPrifileData && oUserPrifileData.roleSet) {
				_.forEach(oUserPrifileData.roleSet, function(oRole) {
					if (oRole.privilegeSet) {
						_.forEach(oRole.privilegeSet, function(oPrivilege) {
							oUserPermission.permission.push(oPrivilege.permission);
							oUserPermission.targetDomain.push(oPrivilege.targetDomain);
						});
					}
				});
			}
			return oUserPermission;
		},

		/**
		 * @function
		 * @name checkPagePermission
		 * @description check page access permission
		 * @param {object} oPermission - user permission object
		 * @param {string} sDomain - target user access domain
		 * @return {boolean} return true if user has page access permission, else return false
		 */
		checkDomainAccess: function(oPermission, sDomain) {
			var aTargetDomain = oPermission.targetDomain;
			var bDomainAccess = false;
			if (aTargetDomain.includes("All") || aTargetDomain.includes(sDomain)) {
				bDomainAccess = true;
			}
			return bDomainAccess;
		},
		/**
		 * @function
		 * @name checkActionAccess
		 * @description check page action access permission
		 * @param {object} oPermission - user permission object
		 * @param {string} sDomain - target user access domain
		 * @param {string} sPermissionAction - user action name
		 * @return {boolean} return true if user has page action access, else return false
		 */
		checkActionAccess: function(oPermission, sDomain, sPermissionAction) {
			var aPermissions = oPermission.permission;
			var aTargetDomain = oPermission.targetDomain;
			var oAccessPermission = {
				"domainAccess": false,
				"actionAccess": false
			};
			if (aTargetDomain.includes("All") || aTargetDomain.includes(sDomain)) {
				oAccessPermission.domainAccess = true;
			}
			if (aPermissions.includes("All") || aPermissions.includes(sPermissionAction)) {
				oAccessPermission.actionAccess = oAccessPermission.domainAccess ? true : false;
			}
			return oAccessPermission.actionAccess;
		},
		/**
		 * @function
		 * @name getPrivilegeData
		 * @description prepare privilege data with input role set data
		 * @param {array} aRoleSet - current page user role set
		 * @return {array} return uniq user role privilege set
		 */
		getPrivilegeData: function(aRoleSet) {
			// init data structure
			var aPrivilegeSet = [];
			_.forEach(aRoleSet, function(oRole) {
				_.forEach(oRole.privilegeSet, function(oPrivilege) {
					oPrivilege.name = "targetDomain: " + oPrivilege.targetDomain;
					oPrivilege.description = "permission: " + oPrivilege.permission;
					aPrivilegeSet.push(oPrivilege);
				});
			});
			return _.sortBy(_.uniqBy(aPrivilegeSet, "id"), "id");
		},
		/**
		 * @function
		 * @name getUserPermissionSate
		 * @description get user action permissions
		 * @param {object} oPermission - user permission object
		 * @param {boolean} bEditModel - edit model is true, else is false
		 * @return {object} return action permission object
		 */
		getUserPermissionSate: function(oPermission, bEditModel) {
			// var bRetrieve = this.checkActionAccess(oPermission, "Role", "Retrieve");
			var bUpdate = this.checkActionAccess(oPermission, "Role", "Update");
			var bCreate = this.checkActionAccess(oPermission, "Role", "Create");
			var bDelete = this.checkActionAccess(oPermission, "Role", "Delete");
			var oButtonState = {
				"CreateVisible": bCreate ? true : false,
				"updateVisible": bUpdate ? true : false,
				"deleteVisible": bDelete ? true : false,
				"AssignButtonState": false,
				"DeleteButtonState": false,
				"FilterBarExpanded": false,
				"UnAssignRole": false,
				"EditVisible": bUpdate && !bEditModel ? true : false,
				"SaveVisible": bUpdate && bEditModel ? true : false,
				"UserDeletable": bDelete && !bEditModel ? true : false, // detail page delete user button state
				"UserInfoEditable": bEditModel ? true : false // detail page input fields editable
			};
			return oButtonState;
		},
		/**
		 * @function
		 * @name updateAssignButtonState
		 * @description update un-assign button state
		 * @param {object} oView - page view
		 * @param {object} oButtonState - page button state object
		 * @return {object} return updated page role assignment button state
		 */
		updateAssignButtonState: function(oView, oButtonState) {
			var oNewButtonState = oButtonState;
			var aSelectedIndices = oView.byId("idRoleItemsTable").getSelectedIndices();
			oNewButtonState.UnAssignRole = false;
			if (aSelectedIndices.length < 1) {
				return oNewButtonState;
			}
			_.forEach(aSelectedIndices, function(iSelectedIndex) {
				if (!oView.byId("idRoleItemsTable").getBinding("rows").findNode(iSelectedIndex).isLeaf) {
					oNewButtonState.UnAssignRole = true;
				}
			});
			return oNewButtonState;
		},
		/**
		 * @function
		 * @name updateTableTitle
		 * @description update table title with row number
		 * @param {object} oView - page view object
		 * @param {string} sTableTitleId - table title id
		 * @param {integer} iRowCount - table row number
		 */
		updateTableTitle: function(oView, sTableTitleId, iRowCount) {
			var oTableTitleControl = oView.byId(sTableTitleId);
			var sTitle = oTableTitleControl.getText().split("(")[0];
			oTableTitleControl.setText(sTitle + "(" + iRowCount + ")");
		},
				/**
		 * @function
		 * @name inputFieldsValidationCheck
		 * @description mandertory fields validation check before saving all the changes.
		 * @param {array} aIds - required input fileds id set
		 * @param {object} oVew - page view object
		 * @param {object} oFnResourceBundle - resource bundle
		 */
		inputFieldsValidationCheck: function(aIds, oVew, oFnResourceBundle) {
			_.forEach(aIds, function(sId) {
				var fnRequiredInput = oVew.byId(sId);
				if (!fnRequiredInput.getValue()) {
					fnRequiredInput.fireValidationError({
						element: fnRequiredInput,
						property: "value",
						message: oFnResourceBundle.getText("mandatoryMsg")
					});
					if (sId === "idUserGenderSelection" || sId === "idUserTypeSelection" || sId === "idUserStatusSelection") {
						fnRequiredInput.addStyleClass("validationError");
					}
				} else {
					fnRequiredInput.fireValidationSuccess({
						element: fnRequiredInput,
						property: "value"
					});
					if (sId === "idUserGenderSelection" || sId === "idUserTypeSelection" || sId === "idUserStatusSelection") {
						fnRequiredInput.removeStyleClass("validationError");
					}
				}
			});
		}
	};
	return Utils;
});