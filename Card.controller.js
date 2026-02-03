sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.winslow.FormsProceduresCard.Card", {
		onInit: function () {
			var cardId = "com.winslow.FormsProceduresCard";
			cardId = cardId.replace(/\./g, '/');
			var oImgModel = new JSONModel({
				Image_1: sap.ui.require.toUrl(cardId + "/images") + "/confined_space.png",
				Image_2: sap.ui.require.toUrl(cardId + "/images") + "/permit_work.png",
				Image_3: sap.ui.require.toUrl(cardId + "/images") + "/sewer.png",
				Image_4: sap.ui.require.toUrl(cardId + "/images") + "/water_tech.png",
				Image_5: sap.ui.require.toUrl(cardId + "/images") + "/mobile_plant.png",
				Image_6: sap.ui.require.toUrl(cardId + "/images") + "/excavation_trenching.png",
				Image_7: sap.ui.require.toUrl(cardId + "/images") + "/craning_lifting.png",
				Image_8: sap.ui.require.toUrl(cardId + "/images") + "/swms.png",
				Image_9: sap.ui.require.toUrl(cardId + "/images") + "/product_handling.png"
			});
			this.getView().setModel(oImgModel, "images");
			this.NavTabs = [];
		},

		onAfterRendering: function () {
			//this._loadTop3Tabs(grpID);
		},

		_loadTop3Tabs: function (sGroupId) {
			var oModel = this.getOwnerComponent().getModel("JAM");
			var sBatchGroupId = "tabStatsBatch";

			// Initialize Batch Group
			var aDeferredGroups = oModel.getDeferredGroups();
			if (aDeferredGroups.indexOf(sBatchGroupId) === -1) {
				aDeferredGroups.push(sBatchGroupId);
				oModel.setDeferredGroups(aDeferredGroups);
			}

			const aPageTabs = ["Confined Space", "Permit to Work", "Sewer Tech", "Water Tech", "Mobile Plant", "Excavation & Trenching", "Cranes & Lifting", "SWMS", "Product Handling"];
			var aTabStats = []; // Array to store all successful results

			aPageTabs.forEach(function (sTabName) {
				oModel.read("/Search", {
					groupId: sBatchGroupId,
					urlParameters: {
						"Query": "'" + sTabName + "'",
						"Group": "'" + sGroupId + "'",
						"Category": "'workpages'",
						"$expand": "ObjectReference",
						"$select": "ObjectReference/Title,ObjectReference/WebURL,ViewsCount",
						"$top": "1"
					},
					success: function (oData) {
						// Check if we got a result and if ViewsCount > 0
						if (oData.results && oData.results.length > 0) {
							var oResult = oData.results[0];
							if (oResult.ViewsCount > 0 && oResult.ObjectReference.Title.toLowerCase() === sTabName.toLowerCase()) {
								aTabStats.push({
									title: oResult.ObjectReference.Title.toUpperCase(), // Uppercase for UI style
									url: oResult.ObjectReference.WebURL,
									views: oResult.ViewsCount
								});
							}
						}
					},
					error: function (oError) {
						MessageToast.show("Failed to fetch stats for", sTabName);
						console.error(oError);
					}
				});
			});

			// Submit Batch
			oModel.submitChanges({
				groupId: sBatchGroupId,
				success: function () {
					// 1. Sort Descending by Views
					debugger
					aTabStats.sort(function (a, b) {
						return b.views - a.views;
					});

					// 2. Slice Top 3
					var aTop3 = aTabStats.slice(0, 3);

					console.log("Top 3 Popular Tabs:", aTop3);

					this.getView().setModel(new JSONModel(aTop3), "TopTabsModel");

				}.bind(this),
				error: function (oError) {
					console.error("Batch failed", oError);
				}
			});
		},

		onImagePress: function (oEvent) {
			debugger
			const oView = this.getView();
			oView.setBusy(true);
			var oControl = oEvent.getSource();
			var displayText = oControl.getAlt ? oControl.getAlt() : oControl.getText();
			var sProp = (displayText === "SWMS") ? "/FormsProceduresSWMSGroupID" : "/FormsProceduresGroupID";
			var grpID = this.getOwnerComponent().getModel("cardData").getProperty(sProp);
			if (!grpID) {
				oView.setBusy(false);
				return MessageToast.show("Group ID of Forms & Procedures not found");
			}
			this.getOwnerComponent().getModel("JAM").read(`/Search`, {
				urlParameters: {
					"Query": "'" + displayText + "'",
					"Group": "'" + grpID + "'",
					"Category": "'workpages'",
					"$expand": "ObjectReference",
					"$select": "ObjectReference/Title,ObjectReference/WebURL,ObjectReference/Type",
				},
				success: function (oData) {
					debugger
					var oFoundItem = oData.results.find(function (item) {
						var sTitle = item.ObjectReference.Title || "";
						var sType = item.ObjectReference.Type || "";
						return sTitle.toLowerCase().trim() === displayText.toLowerCase().trim() && sType === "NavTab";
					});
					if (oFoundItem) {
						window.location.href = oFoundItem.ObjectReference.WebURL + "?headless=true&title=" + encodeURIComponent(displayText);
					} else {
						MessageToast.show("No item found with Title '" + displayText + "' and Type 'NavTab'.");
					}
					oView.setBusy(false);
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error fetching NavTabs, check console logs for more details");
					console.log(oError);
					oView.setBusy(false);
				}
			});
		},

		onPopularTabPress: function (oEvent) {
			// Get the data object bound to the clicked button
			var oItem = oEvent.getSource().getBindingContext("TopTabsModel").getObject();

			// Navigate to the URL found in the search result
			if (oItem.url) {
				window.location.href = oItem.url + "?headless=true&title=" + encodeURIComponent(oItem.title);
			}
		},

		onSearch: function (oEvent) {
			const path = this.getOwnerComponent().getModel("cardData").getProperty("/GlobalSearchPath");
			window.location.href = window.location.origin + path + "?headless=true&title=" + encodeURIComponent(oEvent.getSource().getValue());
		}

		// onImagePress: function () {
		// 	const aActions = this.getOwnerComponent().getManifestEntry("/sap.card/actions");
		// 	const oAction = aActions.find(a => a.id === "confinedSpaces");
		// 	if (oAction) {
		// 		// Dispatch through card API
		// 		this.getOwnerComponent().card.triggerAction(oAction);
		// 	}

		// },
		// onPress:function(oEvent){
		//   var event = oEvent.getSource().getText();
		//   if(event === "PERMIT TO WORK"){
		// 	sap.m.URLHelper.redirect("https://bms.winslow.com.au/?s=Permit%20to%20work", true)
		//   }
		// }
	});
});