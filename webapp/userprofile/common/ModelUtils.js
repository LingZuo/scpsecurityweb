sap.ui.define([], function() {
	"use strict";
	var ModelUtils = {
		/**
		 * @function
		 * @name getUserProfileInfo
		 * @description get user profile info
		 * @param {string} sServiceUrl - service request url
		 * @return {object} promise object
		 */
		getUserProfileInfo: function(sServiceUrl) {
			return new Promise(function(fnResolve) {
				$.ajax({
					type: "GET",
					url: sServiceUrl,
					async: true,
					success: function(oUserDetail) {
						fnResolve(oUserDetail);
					},
					error: function(sError) {
						fnResolve({});
						jQuery.sap.log.error("load user profile data faild! Error info: " + sError);
					}
				});
			});
		},
		/**
		 * @function
		 * @name putUserProfileInfo
		 * @description update user profile info.
		 * @param {string} sServiceUrl - service request url
		 * @param {object} oData - ajax request content
		 * @return {object} promise object
		 */
		putUserProfileInfo: function(sServiceUrl, oData) {
			return new Promise(function(fnResolve) {
				$.ajax({
					type: "PUT",
					url: sServiceUrl,
					data: JSON.stringify(oData),
					contentType: "application/json; charset=UTF-8",
					async: true,
					success: function(oUserDetail) {
						fnResolve(oUserDetail);
					},
					error: function(sError) {
						fnResolve({});
						jQuery.sap.log.error("load user profile data faild! Error info: " + sError);
					}
				});
			});
		}
	};
	return ModelUtils;
});