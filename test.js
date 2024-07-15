/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/log', 'N/search', 'N/format'], function(record, log, search, format) {

    function createItemFulfillmentSearch(arrLotNumber, intUniqueKey) {
        // Create the search object for item fulfillment records
        var arrDetails = [];

        var itemfulfillmentSearchObj = search.create({
            type: "inventorynumber",
            filters: [
               ['internalid', 'anyof', arrLotNumber] 
            ],
            columns: [
                search.createColumn({
                    name: "inventorynumber"
                }), 
                search.createColumn({
                    name: "expirationdate"
                })
            ]
        });

        // Run the search and handle errors
        var searchResult = itemfulfillmentSearchObj.run();
        log.debug('itemfulfillmentSearchObj result count', searchResult.count);

        searchResult.each(function(result) {
            // Extract values from the search result
            var objDetails = {};
            var inventoryNumber = result.getValue({
                name: "inventorynumber"
            });
            log.debug("inventoryNumber", inventoryNumber);
            var expirationDate = result.getValue({
                name: "expirationdate"
            });
            log.debug("expirationDate", expirationDate);
            objDetails = {
                inventoryNumber: inventoryNumber,
                expirationDate: expirationDate,
                uniqueKey: intUniqueKey
            };
            arrDetails.push(objDetails);
            return true;
        });

        return arrDetails;
    }

    function beforeSubmit(context) {
        try {
            if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
                var newRecord = context.newRecord;
                var linecount = newRecord.getLineCount({ sublistId: 'item' });
                log.debug("linecount", linecount);

                for (var i = 0; i < linecount; i++) {
                    var intUniqueKey = newRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_azer_uniquekey',
                        line: i
                    });
                    log.debug("intUniqueKey", intUniqueKey);

                    var inventoryDetailSublist = newRecord.getSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });
                    log.debug("inventoryDetailSublist", inventoryDetailSublist);

                    var arrLotNumber = [];
                    var numSublines = inventoryDetailSublist.getLineCount({ sublistId: 'inventoryassignment' });
                    for (var x = 0; x < numSublines; x++) {
                        var lotNumber = inventoryDetailSublist.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'issueinventorynumber',
                            line: x
                        });
                        arrLotNumber.push(lotNumber);
                    }
                    log.debug("arrLotNumber", arrLotNumber);

                    var searchResults = createItemFulfillmentSearch(arrLotNumber, intUniqueKey);
                    log.debug("searchResults", searchResults);

                    var arrXPDate = [];
                    var arrLot = [];

                    searchResults.forEach(data => {
                        let lineKey = data.uniqueKey;
                        let expDate = data.expirationDate;
                        let lotNumbers = data.inventoryNumber;
                        if (lineKey == intUniqueKey) {
                            arrXPDate.push(expDate);
                            arrLot.push(lotNumbers);
                        }
                    });

                    newRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_azer_expi_date',
                        line: i,
                        value: JSON.stringify(arrXPDate).replace(/[\[\]"]+/g, '')
                    });
    
                    newRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_azer_lotnum',
                        line: i,
                        value: JSON.stringify(arrLot).replace(/[\[\]"]+/g, '')
                    });
                }
            }
        } catch (ex) {
            log.error('Error in beforeSubmit', ex.toString());
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});