public with sharing class AccountHelper {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList() {
        if (Schema.sObjectType.Account.isAccessible()) {
            try {
                return [SELECT Id, Name, owner.Name,ownerid,
                Phone, Website, AnnualRevenue
                FROM Account WHERE Industry = 'Financial Services'];
            } catch (Exception ex) {
                system.debug('Could not retreive records Exception in: ' + ex.getStackTraceString());
                return null;
            }
        }
        return null;
    }

    @AuraEnabled
public static string updateAccounts(Object data) {
    List<Account> accountsForUpdate = (List<Account>) JSON.deserialize(
         JSON.serialize(data),
         List<Account>.class
    );
    try {
        if (Schema.sObjectType.Account.isUpdateable()) {
            update accountsForUpdate;
            return 'Success: contacts updated successfully';
        } else {
            return 'Insufficient Permissions';
        }
    }
    catch (Exception e) {
        return 'The following exception has occurred: ' + e.getMessage();
    }
}
}
