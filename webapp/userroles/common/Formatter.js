sap.ui.define([], function() {
	"use strict";
	var Formatter = {
		/**
		 * @function
		 * @name formatEmployeeRole
		 * @description format employee role assignment state with input parameters
		 * @param {array} aRoleSet - employee role set
		 * @return {string} return formated employee role assignment status, includes: assigned and unassign
		 */
		formatEmployeeRole: function(aRoleSet) {
			var fnResourceBundle = this.getModel("i18n").getResourceBundle();
			return ((aRoleSet !== null) && (aRoleSet !== undefined) && (aRoleSet.length > 0)) ? fnResourceBundle.getText("assigned") :
				fnResourceBundle.getText(
					"unassign");
		}
	};
	return Formatter;
});