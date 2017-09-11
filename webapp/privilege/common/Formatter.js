sap.ui.define([
	"sap/ui/core/format/NumberFormat", "sap/ui/core/format/DateFormat"
], function(NumberFormat, DateFormat, Constants) {
	"use strict";
	var Formatter = {
		formatDialogTitle: function(sType) {
			if (sType === "create") {
				return "Create Role";
			} else if (sType === "edit") {
				return "Edit Role";
			}
			return "Edit Role";
		},

		deletePrivilegeButton: function(aPrivilegeSet) {
			if (aPrivilegeSet.length === 1) {
				return false;
			}
			return true;
		}
	};
	return Formatter;
});