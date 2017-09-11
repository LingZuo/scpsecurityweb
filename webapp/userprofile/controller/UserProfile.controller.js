sap.ui.define([
	"sap/security/userprofile/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/security/userprofile/common/ModelUtils", "sap/security/userprofile/common/Utils"
], function(BaseController, JSONModel, MessageToast, ModelUtils, Utils) {
	"use strict";

	return BaseController.extend("sap.security.userprofile.controller.UserProfile", {
		_oUserProfileData: null,
		_fnResourceBundle: null,
		_sServiceUrl: "/destinations/Security_OData" + "/user",
		/**
		 * @function
		 * @name onInit
		 * @description init analytica page
		 */
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("userprofile").attachMatched(this._onRouteMatched, this);
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
			// initial user permission
			var oPermission = this.getModel("UserPermissionModel").getData();
			this.initUserPermission(oPermission);
			// initial user detail data model
			var oUserDetailModel = this.getModel("UserDetailModel");
			var oUserDetail = oUserDetailModel.getData();
			this._oUserProfileData = _.cloneDeep(oUserDetail);
			this.getView().byId("idUserGenderSelection").setSelectedKey(oUserDetail.gender);
			this.getView().byId("idUserTypeSelection").setSelectedKey(oUserDetail.type);
			this.prepareExtendInfo(oUserDetail.extendedInfoMap);
		},

		/**
		 * @function
		 * @name initUserPermission
		 * @description init page permission
		 * @param {object} oPermission - user permission object
		 */
		initUserPermission: function(oPermission) {
			var bUpdate = false;
			var bRetrieve = false;
			bRetrieve = Utils.checkPagePermission(oPermission, "User", "Retrieve");
			bUpdate = Utils.checkPagePermission(oPermission, "User", "Update");
			if (bUpdate) {
				this.initButtonState(true, true);
			} else if (bRetrieve) {
				this.initButtonState(false, false);
			}
		},
		/**
		 * @function
		 * @name prepareExtendInfo
		 * @description prepare extend info object for UI two way data binding
		 * @param {object} oExtendInfoMap - user extension info
		 */
		prepareExtendInfo: function(oExtendInfoMap) {
			var oExtendModel = this.getView().getModel("ExtendInfo");
			var oExtendInfo = {
				"weight": null,
				"height": null,
				"hobby": null
			};
			if (!oExtendModel) {
				oExtendModel = new JSONModel({});
				oExtendModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				this.getView().setModel(oExtendModel, "ExtendInfo");
			}
			if (oExtendInfoMap) {
				var aKeys = _.keys(oExtendInfoMap);
				_.each(aKeys, function(sKey) {
					oExtendInfo[sKey] = oExtendInfoMap[sKey].value;
				});
			}
			oExtendModel.setData(oExtendInfo);
			oExtendModel.refresh(true);
		},
		/**
		 * @function
		 * @name initButtonState
		 * @description initial user profile page button states
		 * @param {boolean} bAction - true if user has page access permission, else false
		 * @param {boolean} bEdit - current mode is edit or not
		 * 
		 */
		initButtonState: function(bAction, bEdit) {
			var oButtonStateModel = this.getView().getModel("ButtonStateModel");
			if (!oButtonStateModel) {
				oButtonStateModel = new JSONModel({});
				this.getView().setModel(oButtonStateModel, "ButtonStateModel");
			}
			if (typeof(bEdit) === undefined) {
				bEdit = false;
			}
			var oButtonState = {
				"EditVisible": (bAction && bEdit) ? true : false,
				"SaveVisible": (bAction && !bEdit) ? true : false,
				"UserInfoEditable": (bAction && !bEdit) ? true : false
			};
			oButtonStateModel.setData(oButtonState);
			oButtonStateModel.refresh(true);
		},
		/**
		 * @function
		 * @name onHandleEdit
		 * @description handle edit user info
		 */
		onHandleEdit: function() {
			this.initButtonState(true, false);
		},
		/**
		 * @function
		 * @name onHandlecancel
		 * @description handle cancel change
		 */
		onHandlecancel: function() {
			// reset user profile model
			var oUserDetailModel = this.getModel("UserDetailModel");
			var oPrevioursData = _.cloneDeep(this._oUserProfileData);
			oUserDetailModel.setData(oPrevioursData);
			this.prepareExtendInfo(oPrevioursData.extendedInfoMap);
			this.getView().byId("idUserGenderSelection").setSelectedKey(oPrevioursData.gender);
			this.getView().byId("idUserTypeSelection").setSelectedKey(oPrevioursData.type);
			// reset page button state
			this.initButtonState(true, true);
			MessageToast.show(this._fnResourceBundle.getText("userUpdateCanceledMsg"));
		},
		/**
		 * @function
		 * @name onHandleSave
		 * @description handle save change
		 * @param {object} oEvent - event object
		 */
		onHandleSave: function(oEvent) {
			var iErrorLength = sap.ui.getCore().getMessageManager().getMessageModel().getData().length;
			if (iErrorLength > 0) {
				MessageToast.show(this._fnResourceBundle.getText("mandatorylostMsg"));
				return;
			}
			var oUserDetailModel = this.getModel("UserDetailModel");
			var oNewUserProfileData = oUserDetailModel.getData();
			var oNewExtendInfoMap = oNewUserProfileData.extendedInfoMap;
			var oExtendData = this.getView().getModel("ExtendInfo").getData();
			if (oNewExtendInfoMap === null) {
				oNewExtendInfoMap = {};
			}
			if (oExtendData) {
				var aKeys = _.keys(oExtendData);
				_.each(aKeys, function(sKey) {
					oNewExtendInfoMap[sKey] = {
						"value": oExtendData[sKey]
					};
				});
			}
			oNewUserProfileData.extendedInfoMap = oNewExtendInfoMap;
			var sGender = this.getView().byId("idUserGenderSelection").getSelectedKey();
			if (oNewUserProfileData.gender !== sGender) {
				oNewUserProfileData.gender = sGender;
			}
			var that = this;
			ModelUtils.putUserProfileInfo(this._sServiceUrl, oNewUserProfileData).then(function() {
				that._oUserProfileData = _.cloneDeep(oNewUserProfileData);
				that.initButtonState(true, true);
				MessageToast.show(that._fnResourceBundle.getText("userSavedMsg"));
			}).catch(function(sError) {
				jQuery.sap.log.error("update user profile data faild! Error info: " + sError);
			});
		},
		/** 
		 * @function 
		 * @name onAfterRendering
		 * @description after rendering
		 */
		onAfterRendering: function() {}
	});
});