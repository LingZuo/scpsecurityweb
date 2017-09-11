sap.ui.define([], function() {
	"use strict";
	var Util = {
		requestData: function(mAJAXSetting) {
			return new Promise(function(resolve, reject) {
				$.ajax(mAJAXSetting).done(function(oDataJSON, sTextStatus, oXHR) {
					resolve(oDataJSON);
				}).fail(function(oXHR, sTextStatus, oErrorThrown) {
					reject(oXHR);
				});
			});
		},
		/**
		 * @function
		 * @name checkAccess
		 * @description check whether sTargetDomain have sPermission in aRoleSet
		 * @param {object} aRoleSet - role set array
		 *  @param {object} sTargetDomain - targetdomain
		 *  @param {object} sPermission - permission
		 * @return {bool} bAccess
		 */
		checkAccess: function(aRoleSet, sTargetDomain, sPermission) {
			var bAccess = false;
			_.forEach(aRoleSet, function(oRole) {
				_.forEach(oRole.privilegeSet, function(oPrivilege) {
					// Have TargetDomain
					if (oPrivilege.targetDomain === "All" || oPrivilege.targetDomain === sTargetDomain) {
						// Have Permission in this TargetDomain
						if (oPrivilege.permission === "All" || oPrivilege.permission === sPermission) {
							bAccess = true;
						}
					}
				});
			});

			return bAccess;
		},

		/**
		 * @function
		 * @name deepPrivilegeData
		 * @description format targetDomain: permission 1:1 => 1:m
		 * @param {object} aPrivilegeSet Origianl privilegeSet
		 * @return {object} aData the deeped privilegeSet
		 */
		deepPrivilegeData: function(aPrivilegeSet) {
			var aData = [];

			_.forEach(aPrivilegeSet, function(oPrivilege) {
				var oData = _.find(aData, function(o) {
					return o.targetDomain === oPrivilege.targetDomain;
				});
				if (oData) {
					oData.permissionSet.push(oPrivilege.permission);
				} else {
					aData.push({
						"targetDomain": oPrivilege.targetDomain,
						"permissionSet": [oPrivilege.permission]
					});
				}
			});

			return aData;
		},
		/**
		 * @function
		 * @name flatPrivilege
		 * @description format targetDomain: permission 1:m => 1:1
		 * @param {object} aPrivilegeSet Origianl privilegeSet
		 * @return {object} aResultData the flatted privilegeSet
		 * 
		 * TODO update instead of create one
		 */
		flatPrivilege: function(aPrivilegeSet) {
			var aResultData = [];
			_.forEach(aPrivilegeSet, function(oPrivilege) {
				_.forEach(oPrivilege.permissionSet, function(sPermission) {
					aResultData.push({
						targetDomain: oPrivilege.targetDomain,
						permission: sPermission
					});
				});
			});
			return aResultData;
		}
	};
	return Util;
});