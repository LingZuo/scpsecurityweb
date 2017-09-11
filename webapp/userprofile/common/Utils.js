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
		 * @description initial page action access permission
		 * @param {object} oPermission - user permission object
		 * @param {string} sDomain - target user access domain
		 * @param {string} sPermissionAction - target user access permission
		 * @return {boolean} return true if user has action permission in the input domain, else return false
		 */
		checkPagePermission: function(oPermission, sDomain, sPermissionAction) {
			var aPermissions = oPermission.permission;
			var aTargetDomain = oPermission.targetDomain;
			var bPageAccess = false;
			var bActionAccess = false;
			if (aTargetDomain.includes("All") || aTargetDomain.includes(sDomain)) {
				bPageAccess = true;
			}
			if (aPermissions.includes("All") || aPermissions.includes(sPermissionAction)) {
				bActionAccess = true;
			}
			return (bPageAccess && bActionAccess) ? true : false;
		}
	};
	return Utils;
});