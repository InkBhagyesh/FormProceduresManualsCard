sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (MessageToast, Controller, JSONModel) {
	"use strict";

	return Controller.extend("com.winslow.FormsProceduresCard.Card", {
		onInit: function () {
			debugger;
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

		},
		onImagePress: function () {
			var link = window.location.href
			window.location.href = link.replace("/groups","/groups/ZXh1H0w85WvrL2yEX1B01k/workpage_tabs/dP2IPsuYrY01MCy9L7L01k?headless=true") ;
		},
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