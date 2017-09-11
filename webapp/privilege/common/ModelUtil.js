sap.ui.define([], function() {
	"use strict";
	var ModelUtil = {
		/**
		 * @function
		 * @name requestPOSTData
		 * @description  request Data in HTTP POST
		 * @param {string} sServiceUrl - service url to request
		 * @param {object} oRequestData - post data
		 * @return {object} reutrn promise object
		 */
		requestPOSTData: function(sServiceUrl, oRequestData) {
			return new Promise(function(fnResolve) {
				$.ajax({
					type: "POST",
					url: sServiceUrl,
					contentType: "application/json; charset=UTF-8",
					data: JSON.stringify(oRequestData),
					async: true,
					success: function(oData) {
						fnResolve(oData);
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
		 * @name requestPUTData
		 * @description  request Data in HTTP PUT
		 * @param {string} sServiceUrl - service url to request
		 * @param {object} oRequestData - post data
		 * @return {object} reutrn promise object
		 */
		requestPUTData: function(sServiceUrl, oRequestData) {
			return new Promise(function(fnResolve) {
				$.ajax({
					type: "PUT",
					url: sServiceUrl,
					contentType: "application/json; charset=UTF-8",
					data: JSON.stringify(oRequestData),
					async: true,
					success: function(oData) {
						fnResolve(oData);
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
		 * @name requestGETData
		 * @description request Data in HTTP GET
		 * @param {string} sServiceUrl - service url to request
		 * @return {object} reutrn promise object
		 */
		requestGETData: function(sServiceUrl) {
			return new Promise(function(fnResolve) {
				$.ajax({
					type: "GET",
					url: sServiceUrl,
					contentType: "application/json; charset=UTF-8",
					async: true,
					success: function(oData) {
						fnResolve(oData);
					},
					error: function(sError) {
						fnResolve({});
						jQuery.sap.log.error("load employee list data faild! Error info: " + sError);
					}
				});
			});
		}
	};
	return ModelUtil;
});