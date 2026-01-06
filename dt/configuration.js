/**
 * This module was created by the BASEditor
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
    Designtime
) {
    "use strict";
    return function () {
        return new Designtime({
            form: {
                items: {
                    FormsProceduresGroupID: {
                        manifestpath: "/sap.card/configuration/parameters/FormsProceduresGroupID/value",
                        label: "Forms & Procedures Group ID",
					    required: true
                    },
                    GlobalSearchPath: {
                        manifestpath: "/sap.card/configuration/parameters/GlobalSearchPath/value",
                        label: "Global Search Path",
					    required: true
                    }
                }
            },
            preview: {
                modes: "Abstract"
            }
        });
    };
});