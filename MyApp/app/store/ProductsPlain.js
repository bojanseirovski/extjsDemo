Ext.define('MyApp.store.ProductsPlain', {
    extend: 'Ext.data.Store',

    alias: 'store.productsplain',
    autoLoad: true,
    model: 'MyApp.model.Products',
    pageSize: 10,
    proxy: {
        enablePaging: true,
        useDefaultXhrHeader: false,
        type: 'ajax',
        url: 'index.xml',
        reader: {
            type: 'xml',
            model: 'MyApp.model.Products',
            record: 'record',
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
