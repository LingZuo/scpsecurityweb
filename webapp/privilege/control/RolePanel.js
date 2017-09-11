sap.ui.define(["sap/m/P13nPanel","sap/security/privilege/control/RoleItem"], function(P13nPanel, RoleItem) {
	"use strict";
	var RolePanel = P13nPanel.extend("sap.security.privilege.control.RolePanel", {
		metadata: {
			properties: {

			},
			defaultAggregation:"roleItems",
			aggregations: {
				roleItems: {
					type: "sap.security.privilege.control.RoleItem",
					multiple: true,
					singularName: "roleItem",
					bindable: "bindable"
				}
			},
			events: {

				/**
				 * event raised when a RoleItem was added
				 */
				addRoleItem: {},

				/**
				 * event raised when a RoleItem was removed
				 */
				removeRoleItem: {},

				/**
				 * event raised when a RoleItem was updated
				 */
				updateRoleItem: {}
			}
		},
		init: function() {
			// sap.security.privilege.control.RoleItem.prototype.addItem = this._dispatchAddItem;
			// sap.security.privilege.control.RoleItem.prototype.removeItem = this._dispatchRemoveItem;
		},
		renderer: function(oRm, oControl) {
			if (!oControl.getVisible()) {
				return;
			}
			// start SortPanel
			oRm.write("<section");
			oRm.writeControlData(oControl);
			oRm.addClass("sapMSortPanel");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");

			// render content
			oRm.write("<div");
			oRm.addClass("sapMSortPanelContent");
			oRm.addClass("sapMSortPanelBG");
			oRm.writeClasses();
			oRm.write(">");

			var aChildren = oControl.getAggregation("roleItems");
			var iLength = aChildren.length;
			for (var i = 0; i < iLength; i++) {
				oRm.renderControl(aChildren[i]);
			}

			oRm.write("</div>");
			oRm.write("</section>");
		}
	});
	
	RolePanel.prototype.addRoleItem = function(oRoleItem) {
		this.addAggregation("roleItems", oRoleItem, true);

		return this;
	};
	RolePanel.prototype.removeRoleItem = function(oRoleItem) {
		oRoleItem = this.removeAggregation("roleItems", oRoleItem, true);
		return oRoleItem;
	};
	RolePanel.prototype.updateRoleItem = function(oRoleItem) {
		this.updateAggregation("roleItems");
		return this;
	};

	return RolePanel;
});