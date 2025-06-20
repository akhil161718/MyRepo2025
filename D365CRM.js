/**
 * D365CRM.js
 *
 * JavaScript Web Resource for Microsoft Dynamics 365 CRM Opportunity entity.
 *
 * This file provides logic to:
 * 1. Set the 'estimatedclosedate' field based on the values of 'new_biddate', 'new_targetstartdate', and 'new_targetcompletiondate'.
 * 2. Update a related Account record if 'new_biddate' is the greatest date and the Account's 'accounttype_channel' is 'Architect'.
 *
 * Best practices are followed, including:
 * - Robust null/undefined checks
 * - Exception handling with try-catch blocks
 * - Use of standard D365 Xrm APIs
 *
 * Author: [Your Name]
 * Date: [Date]
 */

/**
 * Sets the 'estimatedclosedate' field on the Opportunity form based on the following logic:
 * - If both 'new_targetcompletiondate' and 'new_targetstartdate' are empty, but 'new_biddate' has a value, set 'estimatedclosedate' = 'new_biddate'.
 * - If all three fields have data, set 'estimatedclosedate' = 'new_targetcompletiondate'.
 * - If only 'new_biddate' has data, set 'estimatedclosedate' = 'new_biddate'.
 * - If only 'new_targetstartdate' has data, set 'estimatedclosedate' = 'new_targetstartdate'.
 * - If 'new_biddate' and 'new_targetstartdate' have data, but 'new_targetcompletiondate' is empty, set 'estimatedclosedate' = 'new_targetstartdate'.
 *
 * @param {object} executionContext - The form execution context provided by D365 CRM.
 */
function setEstimatedCloseDate(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        var bidDate = formContext.getAttribute("new_biddate");
        var targetStartDate = formContext.getAttribute("new_targetstartdate");
        var targetCompletionDate = formContext.getAttribute("new_targetcompletiondate");
        var estimatedCloseDate = formContext.getAttribute("estimatedclosedate");

        var bidDateValue = bidDate ? bidDate.getValue() : null;
        var targetStartDateValue = targetStartDate ? targetStartDate.getValue() : null;
        var targetCompletionDateValue = targetCompletionDate ? targetCompletionDate.getValue() : null;

        // Logic implementation
        if (!targetCompletionDateValue && !targetStartDateValue && bidDateValue) {
            // Only bid date has value
            estimatedCloseDate.setValue(bidDateValue);
        } else if (bidDateValue && targetStartDateValue && targetCompletionDateValue) {
            // All three have values
            estimatedCloseDate.setValue(targetCompletionDateValue);
        } else if (bidDateValue && !targetStartDateValue && !targetCompletionDateValue) {
            // Only bid date has value
            estimatedCloseDate.setValue(bidDateValue);
        } else if (!bidDateValue && targetStartDateValue && !targetCompletionDateValue) {
            // Only target start date has value
            estimatedCloseDate.setValue(targetStartDateValue);
        } else if (bidDateValue && targetStartDateValue && !targetCompletionDateValue) {
            // Bid date and target start date have values, target completion date is empty
            estimatedCloseDate.setValue(targetStartDateValue);
        } else {
            // No matching condition, clear estimatedclosedate
            estimatedCloseDate.setValue(null);
        }
    } catch (e) {
        console.error("Error in setEstimatedCloseDate: ", e);
    }
}

/**
 * Updates the related Account record if 'new_biddate' is greater than both 'new_targetstartdate' and 'new_targetcompletiondate',
 * and the Account's 'accounttype_channel' OptionSet value is 12293939 (Architect).
 *
 * - Retrieves the related Account using the parentaccountid lookup.
 * - Checks the Account's 'accounttype_channel' value.
 * - If conditions are met, updates the Account (e.g., sets 'new_lastbiddate' to 'new_biddate').
 *
 * @param {object} executionContext - The form execution context provided by D365 CRM.
 */
function updateAccountIfBidDateGreatest(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        // Retrieve Opportunity field values
        var bidDate = formContext.getAttribute("new_biddate") ? formContext.getAttribute("new_biddate").getValue() : null;
        var targetStartDate = formContext.getAttribute("new_targetstartdate") ? formContext.getAttribute("new_targetstartdate").getValue() : null;
        var targetCompletionDate = formContext.getAttribute("new_targetcompletiondate") ? formContext.getAttribute("new_targetcompletiondate").getValue() : null;
        var accountLookup = formContext.getAttribute("parentaccountid") ? formContext.getAttribute("parentaccountid").getValue() : null;

        // Null/undefined checks
        if (!bidDate || !accountLookup || !Array.isArray(accountLookup) || accountLookup.length === 0) {
            // No bid date or no related account, nothing to do
            return;
        }

        // Compare bidDate to targetStartDate and targetCompletionDate
        var isBidDateGreatest = true;
        if (targetStartDate && bidDate <= targetStartDate) {
            isBidDateGreatest = false;
        }
        if (targetCompletionDate && bidDate <= targetCompletionDate) {
            isBidDateGreatest = false;
        }
        if (!isBidDateGreatest) {
            return;
        }

        // Get related Account Id
        var accountId = accountLookup[0].id.replace(/[{}]/g, "");

        // Retrieve Account record to check accounttype_channel
        Xrm.WebApi.retrieveRecord("account", accountId, "?$select=accounttype_channel").then(
            function success(result) {
                if (result && result.accounttype_channel === 12293939) { // 12293939 = Architect
                    // Update Account with new_biddate (example: set a custom field, e.g., new_lastbiddate)
                    var updateObj = {
                        "new_lastbiddate": bidDate // Change to your target Account field
                    };
                    Xrm.WebApi.updateRecord("account", accountId, updateObj).then(
                        function success2() {
                            // Optionally notify user
                            Xrm.Utility.closeProgressIndicator();
                        },
                        function (error2) {
                            Xrm.Utility.closeProgressIndicator();
                            Xrm.Utility.alertDialog("Failed to update Account: " + error2.message);
                        }
                    );
                }
            },
            function (error) {
                Xrm.Utility.alertDialog("Failed to retrieve Account: " + error.message);
            }
        );
    } catch (e) {
        Xrm.Utility.alertDialog("Error in updateAccountIfBidDateGreatest: " + e.message);
    }
}

// To use: Register setEstimatedCloseDate on the Opportunity form OnChange of relevant fields and OnLoad.
// Register updateAccountIfBidDateGreatest on Opportunity form OnChange for relevant fields and OnSave as needed.
// Replace 'new_lastbiddate' with the actual Account field you want to update.
