sap.ui.define([
	"sap/security/privilege/controller/BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageToast",
	"sap/security/privilege/common/Formatter", "sap/security/privilege/common/ModelUtil", "sap/security/privilege/common/Util"
], function(BaseController, JSONModel, MessageToast, Formatter, ModelUtil, Util) {
	"use strict";

	return BaseController.extend("sap.security.privilege.controller.Privilege", {
		_sDistination: "/destinations/Security_OData",
		_oCreateRoleDialog: null,
		_oCurrentUser: null,

		formatter: Formatter,
		/**
		 * @function
		 * @name onInit
		 * @description init analytica page
		 */
		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("privilege").attachMatched(this._onRouteMatched, this);
		},
		/**
		 * @function
		 * @name _onRouteMatched
		 * @description init page
		 * @param {object} oEvent - event object
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
			this.initRolePrivilegeModel(0);
		},

		/**
		 * @function
		 * @name initRolePrivilegeModel
		 * @description init RolePrivilege model
		 * @param {integer} iTargetPage - the page number to request, default:0
		 * @param {oRequestData} Object - the request data
		 */
		initRolePrivilegeModel: function(iTargetPage, oRequestData) {
			var oTableControl = this.getView().byId("idRolePrivilegeTable");
			var oTableTitleControl = this.getView().byId("idRolePrivilegeTableTitle");
			var oRolePrivilegeModel = new JSONModel();
			var oPaginator = this.getView().byId("idPaginator");
			var sUrl = this._sDistination + "/role/page?page=" + iTargetPage;

			return ModelUtil.requestPOSTData(sUrl, oRequestData).then(function(oPagesData) {
				// Data Handle
				_.forEach(oPagesData.content, function(oRole) {
					oRole.isLink = true;
					_.forEach(oRole.privilegeSet, function(oPrivilege) {
						oPrivilege.name = "targetDomain: " + oPrivilege.targetDomain;
						oPrivilege.description = "permission: " + oPrivilege.permission;
						oPrivilege.isLink = false;
					});
				});
				return oPagesData;
			}).then(function(oPagesData) {
				// UI Handle
				oRolePrivilegeModel.setData(oPagesData.content);
				oTableControl.setModel(oRolePrivilegeModel, "rolePrivilege");

				oPaginator.setNumberOfPages(oPagesData.totalPages - 1);

				var sTitle = oTableTitleControl.getText().split("(")[0];
				var iRowCount = oRolePrivilegeModel.getData().length;
				oTableTitleControl.setText(sTitle + "(" + iRowCount + ")");
			}).catch(function() {
				MessageToast.show("ERROR");
			});
		},
		/**
		 * @function
		 * @name onInputChange
		 * @description handle input fields value change
		 * @param {object} oEvent - event object
		 */
		onInputChange: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			var sId = oEvent.getSource().getId();
			var oInput = sap.ui.getCore().byId(sId);
			if (sValue === null || sValue === "") {
				oInput.setValueState(sap.ui.core.ValueState.Error);
				oInput.setValueStateText("Mandatory");
			} else {
				oInput.setValueState(sap.ui.core.ValueState.None);
			}
		},
		/**
		 * @function
		 * @name onHandlePage
		 * @description manage edit button and delete button state
		 * @param {object} oEvent - event object
		 */
		onHandlePage: function(oEvent) {
			var iTargetPage = oEvent.getParameters().targetPage;
			// Page to iTargetPage
			this.initRolePrivilegeModel(iTargetPage);
		},
		/**
		 * @function
		 * @name onHandleRowSelectionChange
		 * @description manage Paginator
		 * @param {object} oEvent - event object
		 */
		onHandleRowSelectionChange: function(oEvent) {
			var aRowIndices = oEvent.getParameters().rowIndices;
			var iSelectedRowIndex = oEvent.getParameters().rowIndex;
			var oTable = this.getView().byId("idRolePrivilegeTable");
			var oTableSelectedNode = oTable.getBinding("rows").findNode(iSelectedRowIndex);
			var iNumberOfLeafs = 0;
			var iCurrentNodePath;
			if (aRowIndices.length === 1 && iSelectedRowIndex === aRowIndices[0]) {
				if (!oTableSelectedNode.nodeState.selected) {
					// if is leaf, remove all the brothers and parent node selection
					if (oTableSelectedNode.level !== 0) {
						iCurrentNodePath = oTableSelectedNode.context.getPath();
						iNumberOfLeafs = oTableSelectedNode.parent.numberOfLeafs;
						var iLength = iCurrentNodePath.split("/").length - 1;
						oTable.removeSelectionInterval(iSelectedRowIndex - 1 - iCurrentNodePath.split("/")[iLength], iSelectedRowIndex -
							iCurrentNodePath.split(
								"/")[iLength] + iNumberOfLeafs - 1);
					}
					// if not a leaf, remove all the leafs selection
					if (oTableSelectedNode.level === 0) {
						iNumberOfLeafs = oTableSelectedNode.numberOfLeafs;
						if (iNumberOfLeafs > 0) {
							oTable.removeSelectionInterval(iSelectedRowIndex, iSelectedRowIndex + iNumberOfLeafs);
						}
					}
				} else {
					// if is leaf, add all the brothers and parent node selection
					if (oTableSelectedNode.level !== 0) {
						iCurrentNodePath = oTableSelectedNode.context.getPath();
						iNumberOfLeafs = oTableSelectedNode.parent.numberOfLeafs;
						var iLength = iCurrentNodePath.split("/").length - 1;
						oTable.addSelectionInterval(iSelectedRowIndex - 1 - iCurrentNodePath.split("/")[iLength], iSelectedRowIndex - iCurrentNodePath.split(
							"/")[iLength] + iNumberOfLeafs - 1);
					}
					// if not a leaf, add all the leafs selection
					if (oTableSelectedNode.level === 0) {
						iNumberOfLeafs = oTableSelectedNode.numberOfLeafs;
						if (iNumberOfLeafs > 0) {
							oTable.addSelectionInterval(iSelectedRowIndex, iSelectedRowIndex + iNumberOfLeafs);
						}
					}
				}
			}
			this.updateButtonState();
		},
		/**
		 * @function
		 * @name updateButtonState
		 * @description update edit and delete button state
		 */
		updateButtonState: function() {
			var oView = this.getView();
			var aSelectedIndex = oView.byId("idRolePrivilegeTable").getSelectedIndices();
			var oButtonState = oView.getModel("ButtonStateModel").getData();

			oButtonState.CanEdit = false;
			oButtonState.CanDelete = false;

			if (aSelectedIndex.length < 1) {
				oView.getModel("ButtonStateModel").refresh(true);
				return;
			}

			// update CanEdit and CanDelete
			var iSelectedCounter = 0;
			_.forEach(aSelectedIndex, function(iSelectedIndex) {
				if (oView.byId("idRolePrivilegeTable").getBinding("rows").findNode(iSelectedIndex).level === 0) {
					iSelectedCounter++;
				}
			});
			if (iSelectedCounter === 1) {
				oButtonState.CanEdit = true;
				oButtonState.CanDelete = true;
			}
			oView.getModel("ButtonStateModel").refresh(true);
		},

		/**
		 * @function
		 * @name onHandlerToggelOpenState
		 * @description handle expand/collapse the TreeTable
		 * @param {object} oEvent - event object
		 */
		onHandlerToggelOpenState: function(oEvent) {
			var iSelectedRowIndex = oEvent.getParameters().rowIndex;
			var oTable = this.getView().byId("idRolePrivilegeTable");
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
		onHandleResetFB: function(oEvent) {
			var aSearchSet = oEvent.getParameter("selectionSet");
			_.forEach(aSearchSet, function(oSearch) {
				oSearch.setValue("");
			});
			this.initRolePrivilegeModel();
		},
		/**
		 * @function
		 * @name onhandleSearch
		 * @description handle search
		 * @param {object} oEvent - event object
		 */
		onhandleSearch: function(oEvent) {
			var aSearchFileds = ["name"];
			var aSearchSet = oEvent.getParameter("selectionSet");
			var oSearchCre = {};
			_.forEach(aSearchSet, function(iSearch, index) {
				if (iSearch.getValue()) {
					oSearchCre[aSearchFileds[index]] = iSearch.getValue();
				}
			});

			this.initRolePrivilegeModel(0, oSearchCre);
		},
		/**
		 * @function
		 * @name onOpenCreateDialog
		 * @description Open Role Creation Dialog
		 * @param {object} oEvent - event object
		 */
		onOpenCreateDialog: function(oEvent) {
			var oView = this.getView();

			if (!this._oCreateRoleDialog) {
				this._oCreateRoleDialog = sap.ui.xmlfragment(oView.getId(), "sap.security.privilege.view.fragment.CreateRoleDialog", this);
				oView.addDependent(this._oCreateRoleDialog);
			}
			// Create newRole Model
			var oData = {
				"type": "create",
				"name": "",
				"description": "",
				"privilegeSet": []
			};
			var oRoleModel = new JSONModel(oData);
			this._oCreateRoleDialog.setModel(oRoleModel, "roleModel");

			// Create Privilege Model
			var oPrivilegeData = [{
				targetDomain: "",
				permissionSet: []
			}];
			var oPrivilegeModel = new JSONModel(oPrivilegeData);
			this._oCreateRoleDialog.setModel(oPrivilegeModel, "privilegeModel");

			this._oCreateRoleDialog.open();
		},

		/**
		 * TODO refactor with this.onOpenCreateDialog()
		 * @function
		 * @name onOpenEditDialog
		 * @description Open Role Edit Dialog
		 * @param {object} oEvent - event object
		 */
		onOpenEditDialog: function(oEvent) {
			var oView = this.getView();

			if (!this._oCreateRoleDialog) {
				this._oCreateRoleDialog = sap.ui.xmlfragment(oView.getId(), "sap.security.privilege.view.fragment.CreateRoleDialog", this);
				oView.addDependent(this._oCreateRoleDialog);
			}

			// Get the selected index in TreeTable
			var iToEditRoleIndex;
			var aSelectedIndex = oView.byId("idRolePrivilegeTable").getSelectedIndices();
			_.forEach(aSelectedIndex, function(iSelectedIndex) {
				if (oView.byId("idRolePrivilegeTable").getBinding("rows").findNode(iSelectedIndex).level === 0) {
					iToEditRoleIndex = iSelectedIndex;
				}
			});

			// Get the selected data in TreeTable
			var oContext = oView.byId("idRolePrivilegeTable").getBinding("rows").findNode(iToEditRoleIndex).context;
			var sPath = oContext.getPath();
			var oRoleData = oContext.getModel().getProperty(sPath);
			oRoleData.type = "edit";

			var oRoleModel = new JSONModel(oRoleData);
			var oPrivilegeModel = new JSONModel(Util.deepPrivilegeData(oRoleData.privilegeSet));

			this._oCreateRoleDialog.setModel(oRoleModel, "roleModel");
			this._oCreateRoleDialog.setModel(oPrivilegeModel, "privilegeModel");

			this._oCreateRoleDialog.open();
		},
	
		/**
		 * @function
		 * @name onPressCancel
		 * @description handle confirm deletion
		 * @param {object} oEvent - event object
		 */
		onPressCancel: function(oEvent) {
			this.getView().byId("idDeleteConfirmPopup").close();
			MessageToast.show("Canceled Deletion!");
		},
		/**
		 * @function
		 * @name onConfirmDeleted
		 * @description handle confirm deletion
		 * @param {object} oEvent - event object
		 */
		onConfirmDeleted: function(oEvent) {
			var oView = this.getView();
			var aDeleteIndex;
			var aSelectedIndex = oView.byId("idRolePrivilegeTable").getSelectedIndices();
			var oBinding = oView.byId("idRolePrivilegeTable").getBinding("rows");
			var that = this;
			_.forEach(aSelectedIndex, function(iSelectedIndex) {
				if (oView.byId("idRolePrivilegeTable").getBinding("rows").findNode(iSelectedIndex).level === 0) {
					aDeleteIndex = iSelectedIndex;
				}
			});

			var oContext = oBinding.findNode(aDeleteIndex).context;
			var sPath = oContext.getPath();
			var oData = oContext.getModel().getProperty(sPath);
			$.ajax({
				url: this._sDistination + "/role/" + oData.id,
				type: "DELETE",
				contentType: "application/json; charset=UTF-8"
			}).done(function(data, textStatus) {
				that.getView().byId("idDeleteConfirmPopup").close();
				that.initRolePrivilegeModel();
				MessageToast.show("Delete successfully!");
			}).fail(function(jqXHR, textStatus, errorThrown) {
				that.getView().byId("idDeleteConfirmPopup").close();
				MessageToast.show("Delete Failed!");
			});

		},

		/**
		 * @function
		 * @name onNavToDetail
		 * @description handle navigate to role detail page
		 * @param {object} oEvent - event object
		 */
		onNavToDetail: function(oEvent) {
			var oContext = oEvent.getSource().getBindingContext("rolePrivilege");
			var oData = oContext.getModel().getProperty(oContext.getPath());
			this.getRouter().navTo("roledetail", {
				roleId: oData.id
			});
		},

		/**
		 * @function
		 * @name isTextVisible
		 * @description decide Text visible based on Link's visible
		 * @param {boolean} bIsVisible - Link's visible
		 * @return {boolean} Text's visible
		 */
		isTextVisible: function(bIsVisible) {
			return !bIsVisible;
		},
		/** 
		 * @function 
		 * @name onAfterRendering
		 * @description after rendering
		 */
		onAfterRendering: function() {}

	});
});