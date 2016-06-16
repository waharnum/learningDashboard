/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, jqUnit, floe */

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("floe.tests.dashboard");

    fluid.defaults("floe.tests.dashboard.entry.note", {
        gradeNames: ["floe.dashboard.note.displayed"],
        dbOptions: {
            localName: "test"
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.preferenceChange", {
        gradeNames: ["floe.dashboard.preferenceChange.displayed"],
        dbOptions: {
            localName: "test"
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.noteTestEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            note: {
                type: "floe.tests.dashboard.entry.note",
                container: ".floec-entry-note",
                options: {
                    model: {
                        text: "Initial note text."
                    }
                },
                createOnEvent: "{noteTester}.events.onTestCaseStart"
            },
            noteTester: {
                type: "floe.tests.dashboard.entry.entryTester"
            }
        }
    });

    // Common tests
    fluid.defaults("floe.tests.dashboard.entry.entryTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [ {
            name: "Common displayed entry component tests",
            tests: [{
                expect: 4,
                name: "Test note component behaviour",
                sequence:
                    [{
                        listener: "floe.tests.dashboard.entry.verifyRender",
                        args: ["{note}"],
                        event: "{noteTestEnvironment note}.events.onEntryTemplateRendered"
                    },
                    // To work around the issue when two listeners are registered back to back, the second one doesn't get triggered.
                    {
                        func: "fluid.identity"
                    },
                    {
                        listener: "{note}.retrievePersisted",
                        event: "{note}.events.onPouchDocStored"
                    },
                    {
                        func: "fluid.identity"
                    },
                    {
                        listener: "floe.tests.dashboard.entry.verifyEntryStored",
                        event: "{note}.events.onPouchDocRetrieved",
                        args: ["{note}", "{arguments}.0"]
                    },
                    {
                        jQueryTrigger: "click",
                        element: "{note}.dom.delete"
                    },
                    {
                        listener: "floe.tests.dashboard.entry.verifyEntryRemoved",
                        event: "{note}.events.onEntryRemoved",
                        args: ["{note}"]
                    }
                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.entry.verifyRender = function (entry) {
        var expectedRenderedTemplate = fluid.stringTemplate(entry.options.resources.stringTemplate, entry.options.resources.templateValues);
        jqUnit.assertEquals("Initial rendered entry markup matches the expected stringTemplate", expectedRenderedTemplate, entry.container.html().trim());
    };

    floe.tests.dashboard.entry.verifyEntryStored = function (entry, retrievedEntry) {
        // Remove the _rev
        var retrievedEntryMinusRev = fluid.censorKeys(retrievedEntry, ["_rev"]);
        jqUnit.assertDeepEq("Entry component model and retrieved entry are identical, except for _rev", entry.model, retrievedEntryMinusRev);
    };

    floe.tests.dashboard.entry.verifyEntryRemoved = function (entry) {
        // Verify entry deleted from DB
        jqUnit.assertUndefined("No persisted entry retrieved after delete click", entry.retrievePersisted());
        // Verify container removed
        jqUnit.assertTrue("All markup within the entry container has been removed", entry.container.children().length === 0);
    };

    // jqUnit.test("Test note entry", function () {
    //     jqUnit.expect(0);
    //     var note = floe.dashboard.note.displayed(".floec-entry-note", {
    //         dbOptions: {
    //             localName: "test"
    //         }
    //     });
    // });

    $(document).ready(function () {
        floe.tests.dashboard.entry.noteTestEnvironment();
    });

})(jQuery, fluid);
