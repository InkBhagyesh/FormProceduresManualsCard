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
				Image_1: sap.ui.require.toUrl(cardId + "/images") + "/hard-hat.svg",
				Image_2: sap.ui.require.toUrl(cardId + "/images") + "/scissor-lift.svg",
				Image_3: sap.ui.require.toUrl(cardId + "/images") + "/alert.svg",
				Image_4: sap.ui.require.toUrl(cardId + "/images") + "/demolition.svg",
				Image_5: sap.ui.require.toUrl(cardId + "/images") + "/bulldozer.svg",
				Image_6: sap.ui.require.toUrl(cardId + "/images") + "/works.svg",
				Image_7: sap.ui.require.toUrl(cardId + "/images") + "/construction.svg",
				Image_8: sap.ui.require.toUrl(cardId + "/images") + "/electrical-supply.svg",
				Image_9: sap.ui.require.toUrl(cardId + "/images") + "/stakeholders.png"
			});
			this.getView().setModel(oImgModel, "images");
			this.NavTabs = [];
		},

		onAfterRendering: function () {
			const oView = this.getView();
			oView.setBusy(true);
			this.getOwnerComponent().getModel().read("/GetFPGrpID", {
				success: function (oData) {
					const grpID = oData.GetFPGrpID;
					if (!grpID) {
						oView.setBusy(false);
						return MessageToast.show("Group ID of Forms & Procedures not found");
					}
					//this._loadTop3Tabs(grpID);
					this.getOwnerComponent().getModel("JAM").read(`/Groups('${grpID}')/NavTabs`, {
						urlParameters: { "$select": "Title,Type,ContentUrl" },
						success: function (oData) {
							this.NavTabs = oData.results || [];
							oView.setBusy(false);
						}.bind(this),
						error: function (oError) {
							MessageToast.show("Error fetching NavTabs, check console logs for more details");
							console.log(oError);
							oView.setBusy(false);
						}
					});
				}.bind(this),
				error: function (oError) {
					MessageToast.show("Error fetching Group ID, check console logs for more details");
					console.log(oError);
					oView.setBusy(false);
				}
			});
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
			var oControl = oEvent.getSource();
			var displayText = oControl.getAlt ? oControl.getAlt() : oControl.getText();
			debugger
			var oFoundItem = this.NavTabs.find(function (item) {
				var sTitle = item.Title || "";
				var sType = item.Type || "";
				return sTitle.toLowerCase().trim() === displayText.toLowerCase().trim() && sType === "WorkpageGroupNavTab";
			});
			if (oFoundItem) {
				window.location.href = window.location.origin + oFoundItem.ContentUrl + "?headless=true&title=" + encodeURIComponent(displayText);
			} else {
				MessageToast.show("No item found with Title '" + displayText + "' and Type 'WorkpageGroupNavTab'.");
			}
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
			window.location.href = window.location.origin + "/groups/x350lY89aebGNVSR7in01k/workpage_tabs/qQcMiLDd0DXMRYej64O01k?headless=true&title=" + encodeURIComponent(oEvent.getSource().getValue());
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