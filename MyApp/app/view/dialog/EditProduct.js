Ext.define('MyApp.view.dialog.EditProduct', {
    extend: 'Ext.window.Window',
    title: 'Edit Product',
    height: 400,
    width: 450,
    reference: 'editFormWindow',
    layout: 'fit',
    floated: true,
    modal: true,
    centered: true,
    closable: true,
    padding: 6,
    onShowComplete: function () {
        var form = this.down('form');
        form.getForm().setValues(this.myRecord.data);
    },
    items: {
        xtype: 'form',
        reference: 'form',
        items: [
            {
                xtype: 'textfield',
                name: 'brand',
                itemId: 'brand',
                fieldLabel: 'Brand',
                allowBlank: true
            },
            {
                xtype: 'textfield',
                name: 'sizeformat',
                itemId: 'sizeformat',
                fieldLabel: 'Size/Format',
                allowBlank: true
            },
            {
                xtype: 'textfield',
                name: 'productCode',
                itemId: 'productCode',
                fieldLabel: 'Product Code',
                allowBlank: true
            },
            {
                xtype: 'textfield',
                name: 'productDescription',
                itemId: 'productDescription',
                fieldLabel: 'Product Description',
                allowBlank: true
            },
            {
                xtype: 'textfield',
                name: 'productPrice',
                itemId: 'productPrice',
                fieldLabel: 'Product Price',
                allowBlank: true
            },
        ],
        buttons: [
            {
                text: 'Save',
                formBind: true,
                listeners: {
                    click: function () {
                        let store = this.up('window').store;
                        let passedRecord = this.up('window').myRecord;
                        let data = this.up('form').getForm().getValues();

                        let recordExists = (passedRecord && passedRecord.data && passedRecord.data.id);
                        let theRecord = Ext.create('MyApp.model.Products');
                        if (recordExists) {
                            //  update
                            theRecord = store.getById(passedRecord.data.id);
                        } else {
                            //  create
                            store = this.up('window').myStore;
                            theRecord = Ext.create('MyApp.model.Products', {});
                            theRecord.set('id', Math.random());
                        }
                        theRecord.set('brand', data.brand);
                        theRecord.set('sizeformat', data.sizeformat);
                        theRecord.set('productCode', data.productCode);
                        theRecord.set('productDescription', data.productDescription);
                        theRecord.set('productPrice', data.productPrice);

                        if (recordExists) {
                            theRecord.commit();
                        } else {
                            store.insert(0, theRecord);
                        }

                        this.up('window').close();
                    }
                }
            },
            {
                text: 'Cancel',
                formBind: true,
                listeners: {
                    click: function () { this.up('window').close(); }
                }
            }
        ],
    }
})