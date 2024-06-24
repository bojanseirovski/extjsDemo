Ext.define('MyApp.view.main.Products', {
    extend: 'Ext.grid.Panel',
    xtype: 'productlist',
    plugins: 'gridfilters',
    requires: [
        'MyApp.store.Products',
        'MyApp.model.Base',
        'Ext.*'
    ],
    scrollable: true,
    reference: 'productsView',
    title: 'Products',
    store: {
        type: 'products',
    },
    columns: [
        { text: 'Brand', dataIndex: 'brand', flex: 1, filter: { type: 'string'}},
        { text: 'Size/Format', dataIndex: 'sizeformat', flex: 1, filter: { type: 'string'}},
        { text: 'Product Code', dataIndex: 'productCode', flex: 1, filter: { type: 'string'}},
        { text: 'Product Description', dataIndex: 'productDescription', flex: 1, filter: { type: 'string'}},
        { text: 'Product Price', dataIndex: 'productPrice', flex: 1, filter: { type: 'string'}},
        {
            text: 'Edit',
            dataIndex: 'edit',
            flex: 1,
            renderer: function (value, metaData, record) {
                return '<i style="cursor:pointer; font-size:24px" class="fa fa-edit"></i>';
            }

        },
    ],
    listeners: {
        itemclick: function (sender, record, item, index, e, eOpts) {
            if (e.getTarget('.fa.fa-edit')) {
                var edit = Ext.create('MyApp.view.dialog.EditProduct', { store: this.store });
                edit.myRecord = record;
                edit.show();
            }
        },
    },
    selModel: {
        selType: 'checkboxmodel',
        checkOnly: true,
        listeners: {
            selectionchange: function (selModel, selectedRecords) {
                let hasSelection = selectedRecords.length > 0;
                let btn = Ext.ComponentQuery.query('[cls=topDeleteBtn]')[0];
                btn.setDisabled(!hasSelection);
            }
        }
    },
    tbar: [
        {
            text: 'Delete Selected',
            cls: 'topDeleteBtn',
            disabled: true,
            handler: function () {
                let selectedRecords = this.up('grid').getSelectionModel().getSelection();
                let myStore = this.up('grid').store;
                Ext.each(selectedRecords, function (record) {
                    myStore.remove(record);
                });
            }
        },
        {
            text: 'New',
            cls: 'topNewBtn',
            disabled: false,
            handler: function () {
                var edit = Ext.create('MyApp.view.dialog.EditProduct', { store: this.store , title: 'New Product'});
                edit.myRecord = {};
                edit.myStore = myStore = this.up('grid').store;
                edit.show();
            }
        }
    ],
    bbar: Ext.create('Ext.toolbar.Paging', {
        displayInfo: true,
    }),
});
