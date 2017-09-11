sap.ui.define(["sap/ui/core/Element", "sap/m/Select", "sap/m/Button", "sap/m/Label"], function(Element, Select, Button, Label) {
	"use strict";
	var RoleItem = Element.extend("sap.security.privilege.control.RoleItem", {
		metadata: {
			properties: {
				columnKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				value1: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				value2: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * The text to be displayed for the item.
				 */
				text: {
					type: "string",
					group: "Misc",
					defaultValue: ""
				},

				/**
				 * Defines visibility of column
				 */
				visible: {
					type: "boolean",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * data type of the column (text, numeric or date is supported)
				 */
				type: {
					type: "string",
					group: "Misc",
					defaultValue: "text"
				},

				/**
				 * if type==numeric the precision will be used to format the entered value (maxIntegerDigits of the used Formatter)
				 */
				precision: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * if type==numeric the scale will be used to format the entered value (maxFractionDigits of the used Formatter)
				 */
				scale: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * specifies the number of characters which can be entered in the value fields of the condition panel
				 */
				maxLength: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Defines column width
				 */
				width: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * the column with isDefault==true will be used as the selected column item on the conditionPanel
				 */
				isDefault: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * the array of values for type bool. e.g. ["", "Off", "On"]. The first entry can be empty (used to blank the value field). Next value
				 * represent the false value, last entry the true value.
				 *
				 * @since 1.34.0
				 */
				values: {
					type: "string[]",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Defines role. The role is reflected in the manner how the dimension will influence the chart layout.
				 *
				 * @since 1.34.0
				 */
				role: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines aggregation role
				 *
				 * @since 1.34.0
				 */
				aggregationRole: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines href of a link.
				 *
				 * @since 1.46.0
				 */
				href: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines target of a link.
				 */
				target: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Defines press handler of a link.
				 *
				 * @since 1.46.0
				 */
				press: {
					type: "object",
					defaultValue: null
				}
			},
			defaultAggregation: "vBoxs",
			aggregations: {
				vBoxs: {
					type: "sap.m.VBox",
					multiple: true,
					bindable: "bindable",
					singularName: "vBox"
				}/*,
				_select1: {
					type: "sap.m.Select",
					multiple: false
				},
				_select2: {
					type: "sap.m.Select",
					multiple: false
				},
				_addButton: {
					type: "sap.m.Button",
					multiple: false
				},
				_removeButton: {
					type: "sap.m.Button",
					multiple: false
				},
				_title1: {
					type: "sap.m.Label",
					multiple: false
				},
				_title2: {
					type: "sap.m.Label",
					multiple: false
				}*/
			}
		},
		init: function() {
		/*	this.setAggregation("_select1", new Select({
				width: "100%",
				selectedKey: this.value1,
				items: [
					new sap.ui.core.Item({
						text: "All"
					}),
					new sap.ui.core.Item({
						text: "User"
					}),
					new sap.ui.core.Item({
						text: "Role"
					}),
					new sap.ui.core.Item({
						text: "Privilege"
					}),
					new sap.ui.core.Item({
						text: "Test"
					})
				]
			}));
			this.setAggregation("_select2", new Select({
				width: "100%",
				selectedKey: this.value2,
				items: [
					new sap.ui.core.Item({
						text: "All"
					}),
					new sap.ui.core.Item({
						text: "Create"
					}),
					new sap.ui.core.Item({
						text: "Retrieve"
					}),
					new sap.ui.core.Item({
						text: "Update"
					}),
					new sap.ui.core.Item({
						text: "Delete"
					})
				]
			}));
			this.setAggregation("_addButton", new Button({
				icon: sap.ui.core.IconPool.getIconURI("add"),
				tooltip: "Add a Item",
				// TODO delegete to parent
				press: this.addItem.bind(this)
			}));
			this.setAggregation("_removeButton", new Button({
				icon: sap.ui.core.IconPool.getIconURI("delete"),
				tooltip: "Remove a Item",
				// TODO delegete to parent
				press: this.removeItem.bind(this)
			}));
			this.setAggregation("_title1", new Label({
				text: " Target Domain",
				required: true
			}));
			this.setAggregation("_title2", new Label({
				text: " Premission",
				required: true
			}));*/
		},
		renderer: function(oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses("PrivilegeBoxs");
			oRM.write(">");
			
			/*// Content
			oRM.write('<div class = "sapMSortPanelBG sapMSortPanelContent">');
				oRM.write('<div class ="sapUiRespGrid sapUiRespGridHSpace1 sapUiRespGridVSpace0 sapUiRespGridMedia-Std-Desktop">');
					oRM.write('<div class ="sapUiRespGridSpanL5 sapUiRespGridSpanM5 sapUiRespGridSpanS12 sapUiRespGridSpanXL5">');
						oRM.renderControl(oControl.getAggregation("_title1"));
						oRM.renderControl(oControl.getAggregation("_select1"));
					oRM.write("</div>");
					
					oRM.write('<div class ="sapUiRespGridSpanL5 sapUiRespGridSpanM5 sapUiRespGridSpanS9 sapUiRespGridSpanXL5">');
						oRM.renderControl(oControl.getAggregation("_title2"));
						oRM.renderControl(oControl.getAggregation("_select2"));
					oRM.write("</div>");
					
					// button Style
					// height: 4.4rem;
					// button-inner Style
					// background-color: transparent
					// border: 0
					oRM.write('<div class ="sapUiRespGridSpanL2 sapUiRespGridSpanM2 sapUiRespGridSpanS3 sapUiRespGridSpanXL2 floatRight sapUiHLayout sapUiHLayoutNoWrap">');
						oRM.renderControl(oControl.getAggregation("_addButton").addStyleClass("PrivilegeButton"));
						oRM.renderControl(oControl.getAggregation("_removeButton").addStyleClass("PrivilegeButton"));
					oRM.write("</div>");
				oRM.write("</div>");
			oRM.write("</div>");*/
			
			oRM.write("<div");
			oRM.addClass("sapMFlexBox PrivilegeButton");
			oRM.writeClasses();
			oRM.write(">");
			var aChildren = oControl.getAggregation("vBoxs");
			var iLength = aChildren.length;
			for (var i = 0; i < iLength; i++) {
				oRM.renderControl(aChildren[i]);
			}
			
			oRM.write("</div>");
		}
	});
/*
	RoleItem.prototype.addItem = function(oEvent) {

	};
	
	RoleItem.prototype.removeItem = function(oEvent) {

	};*/
	
/*	RoleItem.prototype.setColumnKey = function(sColumnKey) {
		return this.setProperty("columnKey", sColumnKey, true);
	};
	RoleItem.prototype.getValue1 = function() {
		return this.getProperty("value1");
	};
	RoleItem.prototype.getValue2 = function() {
		return this.getProperty("value2");
	};*/
	return RoleItem;
});