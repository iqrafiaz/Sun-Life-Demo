import { LightningElement, wire, track } from 'lwc';
import getAccountList from '@salesforce/apex/AccountHelper.getAccountList';
import updateAccounts from '@salesforce/apex/AccountHelper.updateAccounts';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class FinancialServicesAccountListing extends LightningElement {

    @track columns = [{
        label: 'Account Name',
        fieldName: 'nameUrl',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'Name' },
            target: '_blank'
        },
        sortable: true,
    },
    {
        label: 'Account Owner',
        fieldName: 'accountOwner',
        type: 'text',
        sortable: true
    },
    {
        label: 'Annual Revenue',
        fieldName: 'AnnualRevenue',
        type: 'Currency',
        editable: true
    },
    {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
        editable: true
    },
    {
        label: 'Website',
        fieldName: 'Website',
        type: 'url',
        editable: true
    }
    ];
    
    error;
    accountList = [];
    searchText = '';
    cacheData = [];
    draftValues = [];
    sortBy;
    sortDirection;
    
    @wire(getAccountList)
    wiredAccounts({
        error,
        data
    }) {
        if (data) {
            let tempRecords = JSON.parse( JSON.stringify( data ) );
            for (let i = 0; i < tempRecords.length; i++) {
                if (tempRecords[i].Owner) {
                    tempRecords[i].accountOwner = tempRecords[i].Owner?.Name;
                    tempRecords[i].nameUrl = `/${tempRecords[i].Id}`;
                }
            }
            this.accountList = tempRecords;
            this.cacheData = this.accountList;
        } else if (error) {
            this.error = error;
        }
    }

    handleSortAccountData(event) {       
        this.sortBy = event.detail.fieldName;       
        this.sortDirection = event.detail.sortDirection;       
        this.sortAccountData(event.detail.fieldName, event.detail.sortDirection);
    }

    sortAccountData(fieldName, direction) {
        let parseData = JSON.parse(JSON.stringify(this.accountList));
        let keyValue = (a) => {
            return a[fieldName];
        };
        let isReverse = direction === 'asc' ? 1 : -1;
        
           parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
    
            return isReverse * ((x > y) - (y > x));
            });
        this.accountList = parseData;


    }

    searchAccount(event) {
        this.searchText = event.detail?.value;

        if (this.searchText) {
            let tempAccountsList = this.cacheData;
            this.accountList = [];
            this.accountList = tempAccountsList.filter(el => el.Name.toLowerCase().includes(this.searchText.toLowerCase()))
        } else if (this.searchText === '') {
            this.accountList = this.cacheData;
        }

    }

    async handleSave(event) {
        const updatedFields = event.detail.draftValues;
        let notifyChangeIds = updatedFields.map(row => { return { "recordId": row.Id } });

        try {
            const result = await updateAccounts({ data: updatedFields });
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Contact updated',
                    variant: 'success'
                })
            );
            getRecordNotifyChange(notifyChangeIds);
            await refreshApex(this.accountList);
            this.draftValues = [];
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading contacts',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        }

    }
}