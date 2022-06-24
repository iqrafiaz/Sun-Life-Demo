public with sharing class AccountHelper {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList() {
        try {
            if (Schema.sObjectType.Account.isAccessible() &&
                Schema.sObjectType.Account.fields.Id.isAccessible() &&
                Schema.sObjectType.Account.fields.Name.isAccessible() &&
                Schema.sObjectType.Account.fields.ownerid.isAccessible() &&
                Schema.sObjectType.Account.fields.Phone.isAccessible() &&
                Schema.sObjectType.Account.fields.Website.isAccessible() &&
                Schema.sObjectType.Account.fields.AnnualRevenue.isAccessible()        
            ) {
                return [SELECT Id, Name, owner.Name,ownerid,
                Phone, Website, AnnualRevenue
                FROM Account WHERE Industry = 'Financial Services'];
            } else {
                NoAccessException ex = new NoAccessException();
                ex.setMessage('Insufficient Permission');
                throw ex;
            }
        } catch (Exception ex) {
            system.debug('Could not retreive records due to exception Exception: ' + ex.getMessage() );
            return null;
        }
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
            NoAccessException ex = new NoAccessException();
            ex.setMessage('Insufficient Permission');
            throw ex;
        }
    }
    catch (Exception ex) {
        system.debug('Could not retreive records due to exception Exception: ' + ex.getMessage() );
        return null;
    }
}
}
