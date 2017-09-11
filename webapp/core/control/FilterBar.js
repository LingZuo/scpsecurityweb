/**
 * @fileOverview overwrite _toggleHideShow to show or hide go button
 * @author Ling Zuo
 * @version 1.0.0
 */
sap.ui.define([
	"sap/ui/comp/filterbar/FilterBar",
	"sap/ui/layout/GridRenderer"
], function(FilterBar, GridRenderer) {
	"use strict";
	return FilterBar.extend("sap.security.core.control.FilterBar", {
		init: function() {
			FilterBar.prototype.init.call(this);
		},
		_toggleHideShow: function() {
			this.setFilterBarExpanded(!this.getFilterBarExpanded());
			this.setShowGoOnFB(this.getFilterBarExpanded());
			this.setShowRestoreOnFB(this.getFilterBarExpanded());
		},
		renderer: GridRenderer
	});
});