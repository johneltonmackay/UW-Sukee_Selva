/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/file', 'N/log', 'N/email', 'N/record'],

function(search, file, log, email, record) {

    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */

    function execute(scriptContext) {
        var mySearch = search.load({
            id: '6106'
        });
        
        var csvFile = 'Created Date,Created By,Sales Rep,Document Number,Name,Customer Category,Customer Region,Line ID,Item,Rate,Quantity,Amount,Azer Merch Hier Segment,Azer Merc Hier Group,Estimated Ship Date,Current Expected Ship Date,Formula (Numeric),Account\r\n';
        
        var startIndex = 0;
        var resultsPerPage = 1000;
        var moreResults = true;

        while (moreResults) {
            var resultRange = mySearch.run().getRange({
                start: startIndex,
                end: startIndex + resultsPerPage
            });

            if (resultRange && resultRange.length > 0) {
                for (var i = 0; i < resultRange.length; i++) {
                    var resultObject = resultRange[i];
                    
                    var DateCreated = resultObject.getValue({ name: 'datecreated', summary: 'GROUP' });
                    log.debug('Date Created:', DateCreated);

                    var CreatedBy = resultObject.getText({ name: 'createdby', summary: 'GROUP' });
                    log.debug('Created By:', CreatedBy);
                    CreatedBy = '"' + CreatedBy.replace(/"/g, '""') + '"'; 
                    var SalesRep = resultObject.getText({ name: 'salesrep', summary: 'GROUP' });
                    log.debug('Sales Rep:', SalesRep);

                    var DocumentNumber = resultObject.getValue({ name: 'tranid', summary: 'GROUP' });
                    log.debug('Document Number:', DocumentNumber);

                    var Name = resultObject.getText({ name: 'entity', summary: 'GROUP' });
                    
                    Name = '"' + Name.replace(/"/g, '""') + '"'; 
                     log.debug('Name:', Name);
                    var CustomerCategory = resultObject.getText({ name: 'custtype', summary: 'GROUP' });
                    log.debug('Customer Category:', CustomerCategory);

                    var CustomerRegion = resultObject.getValue({ name: 'formulatext', summary: 'GROUP', formula: '{customermain.custentity_rsm_region}' });
                    log.debug('Customer Region:', CustomerRegion);

                    var LineID = resultObject.getValue({ name: 'line', summary: 'GROUP' });
                    log.debug('Line ID:', LineID);

                    var Item = resultObject.getText({ name: 'item', summary: 'GROUP' });
                    log.debug('Item:', Item);
                     Item = '"' + Item.replace(/"/g, '""') + '"'; 
                    log.debug('Item:', Item);
                    var Rate = resultObject.getValue({ name: 'fxrate', summary: 'MAX' });
                    log.debug('Rate:', Rate);

                    var Quantity = resultObject.getValue({ name: 'quantity', summary: 'MAX' });
                    log.debug('Quantity:', Quantity);

                    var Amount = resultObject.getValue({ name: 'amount', summary: 'MAX' });
                    log.debug('Amount:', Amount);

                    var AzerMerchHierSegment = resultObject.getValue({ name: 'custitem_azer_hier_segment', join: 'item', summary: 'GROUP' });
                    log.debug('Azer Merch Hier Segment:', AzerMerchHierSegment);

                    var AzerMercHierGroup = resultObject.getValue({ name: 'custitem_azer_hier_group', join: 'item', summary: 'GROUP' });
                    log.debug('Azer Merc Hier Group:', AzerMercHierGroup);

                    var EstimatedShipDate = resultObject.getValue({ name: 'formuladate', summary: 'GROUP' });
                    log.debug('Estimated Ship Date:', EstimatedShipDate);

                    var CurrentExpectedShipDate = resultObject.getValue({ name: 'custcol_azer_current_expect_shipdate', summary: 'GROUP' });
                    log.debug('Current Expected Ship Date:', CurrentExpectedShipDate);

                    var FormulaNumeric = resultObject.getValue({ name: 'formulanumeric', summary: 'MAX' });
                    log.debug('Formula Numeric:', FormulaNumeric);

                    var Account = resultObject.getValue({ name: 'account', summary: 'GROUP' });
                    log.debug('Account:', Account);

                    // Add each result as a new line on CSV
                    csvFile += DateCreated + ',' + CreatedBy + ',' + SalesRep + ',' + DocumentNumber + ',' + Name + ',' + CustomerCategory + ',' + CustomerRegion + ',' + LineID + ',' + Item + ',' + Rate + ',' + Quantity + ',' + Amount + ',' + AzerMerchHierSegment + ',' + AzerMercHierGroup + ',' + EstimatedShipDate + ',' + CurrentExpectedShipDate + ',' + FormulaNumeric + ',' + Account + '\r\n';
                }

                startIndex += resultsPerPage;
            } else {
                moreResults = false;
            }
        }

        var date = new Date();

        var fileObj = file.create({
            name: 'Saved Search Result - ' + date.toLocaleDateString() + '.csv',
            fileType: file.Type.EXCEL,
            contents: csvFile,
            description: 'This is a CSV file.',
            folder: 4703771
        });

        var fileId = fileObj.save();
        log.debug('File ID...', fileId);

        var employee = record.load({
            type: record.Type.EMPLOYEE,
            id: 91996
        });

        var employeeEmail = employee.getValue({
            fieldId: 'email'
        });

        email.send({
            author: 91996,
            recipients: 'sselvaraj@azersci.com',
            subject: 'Test Sample Email Module',
            body: 'This is a test email with attached CSV file.',
            attachments: [fileObj]
        });

        log.debug('Email sent to...', 'sselvaraj@azersci.com');
    }

    return {
        execute: execute
    };
});


