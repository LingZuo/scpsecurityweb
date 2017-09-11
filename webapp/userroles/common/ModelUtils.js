sap.ui.define([], function() {
	"use strict";
	var ModelUtils = {
		/**
		 * @function
		 * @name getPagesWithSize
		 * @description get page employees or roles list with input page size
		 * @param {string} sServiceUrl - service url to request for employee data
		 * @param {object} oData - post data
		 * @return {object} reutrn promise object
		 */
		getPOSTData: function(sServiceUrl, oData) {
			return new Promise(function(fnResolve) {
				$.ajax({
					type: "POST",
					url: sServiceUrl,
					contentType: "application/json; charset=UTF-8",
					data: JSON.stringify(oData),
					async: true,
					success: function(oPagesData) {
						fnResolve(oPagesData);
					},
					error: function(sError) {
						fnResolve({});
						jQuery.sap.log.error("load employee list data faild! Error info: " + sError);
					}
				});
			});
		},
		/**
		 * @function
		 * @name getAllPagesDataWithSize
		 * @description get all page employees or roles list with input size
		 * @param {array} aServiceUrl - service urls to request for employee data
		 * @param {array} aDataList - user or role data list
		 * @param {object} oSearchCre - search bar filter
		 * @return {object} return promise object
		 */
		getAllPagesDataWithSize: function(aServiceUrl, aDataList, oSearchCre) {
			var that = this;
			return Promise.all(_.map(aServiceUrl, function(sServiceUrl) {
				return that.getPOSTData(sServiceUrl);
			})).then(function(aData) {
				_.forEach(aData, function(oData) {
					_.forEach(oData.content, function(oContent) {
						aDataList.push(oContent);
					});
				});
				return aDataList;
			}).catch(function(sError) {
				jQuery.sap.log.error("load page data failed, Error info: " + sError);
			});
		},
		/**
		 * @function
		 * @name deleteSelectedUser
		 * @description delete selected employee
		 * @param {string} sServiceUrl - service url to request to delete selected employee
		 * @return {object} return promise object
		 */
		deleteSelectedUser: function(sServiceUrl) {
			return new Promise(function(fnResolve, fnReject) {
				$.ajax({
					type: "DELETE",
					url: sServiceUrl,
					async: true,
					success: function() {
						fnResolve(true);
					},
					error: function(sError) {
						fnReject(sError);
					}
				});
			});
		},
		/**
		 * @function
		 * @name updateUserDetailInfo
		 * @description update user role info
		 * @param {string} sServiceUrl - service url to mass assign user roles
		 * @param {object} oData - ajax request content
		 * @return {object} promise object
		 */
		updateUserDetailInfo: function(sServiceUrl, oData) {
			return new Promise(function(fnResolve, fnReject) {
				$.ajax({
					type: "PATCH",
					url: sServiceUrl,
					data: JSON.stringify(oData),
					contentType: "application/json; charset=UTF-8",
					async: true,
					success: function(oUserData) {
						fnResolve(oUserData);
					},
					error: function(sError) {
						fnReject(sError);
						jQuery.sap.log.error("load user detail data faild! Error info: " + sError);
					}
				});
			});
		},
		/**
		 * @function
		 * @name putUpdateUserRoles
		 * @description update user role info via PUT
		 * @param {string} sServiceUrl - service url to unassign user roles
		 * @param {object} oData - ajax request content
		 * @return {object} promise object
		 */
		putUpdateUserRoles: function(sServiceUrl, oData) {
			return new Promise(function(fnResolve, fnReject) {
				$.ajax({
					type: "PUT",
					url: sServiceUrl,
					contentType: "application/json; charset=UTF-8",
					data: JSON.stringify(oData),
					async: true,
					success: function(oNewData) {
						fnResolve(oNewData);
					},
					error: function(sError) {
						fnReject(sError);
					}
				});
			});
		}
	};
	return ModelUtils;
});