Ext.define('MyApp.store.Products', {
    extend: 'Ext.data.Store',

    alias: 'store.products',
    autoLoad: true,
    autoDestroy: true,
    model: 'MyApp.model.Products',
    pageSize: 10,
    proxy: {
        enablePaging: true,
        type: 'ajax',
        url: 'https://ajax.seirovski.net/index.php',
        useDefaultXhrHeader: false,
        reader: {
            type: 'xml',
            record: 'record',
            rootProperty: 'data',
            enablePaging: true,
            totalProperty: 'total_items',
        }
    },
    fields: [
        { name: 'brand', mapping: 'F155', type: 'string' },
        { name: 'sizeformat', mapping: 'F22', type: 'string' },
        { name: 'productCode', mapping: 'F01', type: 'string' },
        { name: 'productDescription', mapping: 'F02', type: 'string' },
        { name: 'productPrice', mapping: 'F1007', type: 'float' },
    ]
});
