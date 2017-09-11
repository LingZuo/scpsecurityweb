/**
 * @version 1.0.0
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/security/userroles/common/Utils"
], function(Controller, History, Utils) {
	"use strict";

	return Controller.extend("sap.security.userroles.controller.BaseController", {

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
				if (sId === "application-Role_Management-Display-component---ViewAddUser--idUserGenderSelection" || sId ===
					"application-Role_Management-Display-component---ViewAddUser--idUserTypeSelection") {
					oInput.removeStyleClass("validationError");
				}
			}
		},
		/**
		 * @function
		 * @name onHandleRowSelectionChange
		 * @description manage un-assign button state
		 * @param {object} oEvent - event object
		 */
		onHandleRowSelectionChange: function(oEvent) {
			var aRowIndices = oEvent.getParameters().rowIndices;
			var iSelectedRowIndex = oEvent.getParameters().rowIndex;
			var oTable = this.getView().byId("idRoleItemsTable");
			var oTableSelectedNode = oTable.getBinding("rows").findNode(iSelectedRowIndex);
			var iNumberOfLeafs = 0;
			var iCurrentNodePath;
			var iCurrentNodeIndex;
			if (aRowIndices.length === 1 && iSelectedRowIndex === aRowIndices[0]) {
				if (!oTableSelectedNode.nodeState.selected) {
					// if is leaf, remove all the brothers and parent node selection
					if (oTableSelectedNode.isLeaf) {
						iCurrentNodePath = oTableSelectedNode.context.getPath();
						iCurrentNodeIndex = _.last(iCurrentNodePath.split("/"));
						iNumberOfLeafs = oTableSelectedNode.parent.numberOfLeafs;
						oTable.removeSelectionInterval(iSelectedRowIndex - 1 - iCurrentNodeIndex, iSelectedRowIndex - iCurrentNodeIndex + iNumberOfLeafs -
							1);
					}
					// if not a leaf, remove all the leafs selection
					if (!oTableSelectedNode.isLeaf) {
						iNumberOfLeafs = oTableSelectedNode.numberOfLeafs;
						if (iNumberOfLeafs > 0) {
							oTable.removeSelectionInterval(iSelectedRowIndex, iSelectedRowIndex + iNumberOfLeafs);
						}
					}
				} else {
					// if is leaf, add all the brothers and parent node selection
					if (oTableSelectedNode.isLeaf) {
						iCurrentNodePath = oTableSelectedNode.context.getPath();
						iCurrentNodeIndex = _.last(iCurrentNodePath.split("/"));
						iNumberOfLeafs = oTableSelectedNode.parent.numberOfLeafs;
						oTable.addSelectionInterval(iSelectedRowIndex - 1 - iCurrentNodeIndex, iSelectedRowIndex - iCurrentNodeIndex + iNumberOfLeafs -
							1);
					}
					// if not a leaf, add all the leafs selection
					if (!oTableSelectedNode.isLeaf) {
						iNumberOfLeafs = oTableSelectedNode.numberOfLeafs;
						if (iNumberOfLeafs > 0) {
							oTable.addSelectionInterval(iSelectedRowIndex, iSelectedRowIndex + iNumberOfLeafs);
						}
					}
				}
			}
			// update page assign button state
			var oView = this.getView();
			var oButtonStateModel = this.getModel("ButtonStateModel");
			var oButtonState = oButtonStateModel.getData();
			oButtonStateModel.setData(Utils.updateAssignButtonState(oView, oButtonState));
			oButtonStateModel.refresh();
		},
		/**
		 * @function
		 * @name onHandleToggleOpenState
		 * @description manage tree table expand 
		 * @param {object} oEvent - event object
		 */
		onHandleToggleOpenState: function(oEvent) {
			var iSelectedRowIndex = oEvent.getParameters().rowIndex;
			var oTable = this.getView().byId("idRoleItemsTable");
			var oTableSelectedNode = oTable.getBinding("rows").findNode(iSelectedRowIndex);
			var oTableSelectedNodeState = oTableSelectedNode.nodeState;
			var iNumberOfLeafs = 0;
			if (oTableSelectedNodeState.selected && oTableSelectedNodeState.expanded) {
				iNumberOfLeafs = oTableSelectedNode.numberOfLeafs;
				if (iNumberOfLeafs > 0) {
					oTable.addSelectionInterval(iSelectedRowIndex, iSelectedRowIndex + iNumberOfLeafs);
				}
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