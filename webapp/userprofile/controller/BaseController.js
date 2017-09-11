/**
 * @version 1.0.0
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("sap.security.userprofile.controller.BaseController", {

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * 
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the event bus of this component
		 * 
		 * @public
		 * @returns {sap.ui.core.EventBus} the event bus of component
		 */
		getEventBus: function() {
			return this.getOwnerComponent().getEventBus();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * 
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * 
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * 
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return sap.ui.getCore().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back. It checks if there is a history entry. If yes, history.go(-1) will happen. If not, it will replace the
		 * current entry of the browser history with the master route.
		 * 
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-2);
			} else {
				this.getRouter().navTo("#Shell-home", {}, true);
			}
		},
		/**
		 * @function
		 * @name onChange
		 * @description handle input fields value change
		 * @param {object} oEvent - event object
		 */
		onChange: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			var sId = oEvent.getSource().getId();
			var oInput = sap.ui.getCore().byId(sId);
			var that = this;
			if (!sValue) {
				oInput.fireValidationError({
					element: oInput,
					property: "value",
					message: that._fnResourceBundle.getText("mandatoryMsg")
				});
			} else {
				oInput.fireValidationSuccess({
					element: oInput,
					property: "value"
				});
			}
		},
		/**
		 * @function
		 * @name handleUploadImage
		 * @description handle upload user profile image
		 * @param {object} oEvent - event object
		 */
		handleUploadImage: function(oEvent) {
			// TODO: todo
		}
	});
});