import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const fields = [
    'Account.Name',
    'Account.BillingStreet',
    'Account.BillingCity',
    'Account.BillingState',
    'Account.BillingPostalCode',
    'Account.BillingCountry'
];

export default class recordMap extends LightningElement {
    @api recordId;
    @track zoomLevel = 14;
    @track markers = [];
    @track error;

    @wire(CurrentPageReference) pageRef;

    @wire(getRecord, { recordId: '$recordId', fields })
    wiredRecord({ error, data }) {
        if (data) {
            this.error = undefined;
            const record = data.fields;
            this.markers = [
                {
                    location: {
                        Street: record.BillingStreet.value,
                        City: record.BillingCity.value,
                        State: record.BillingState.value,
                        PostalCode: record.BillingPostalCode.value,
                        Country: record.BillingCountry.value
                    },
                    title: record.Name.value,
                    description: record.BillingStreet.value 
                }
            ];
        } else if (error) {
            this.error = error;
            this.markers = [];
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading map',
                    message,
                    variant: 'error',
                }),
            );
        }
    }
}