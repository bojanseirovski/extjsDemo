/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'MyApp.Application',

    name: 'Products',

    requires: [
        // This will automatically load all classes in the MyApp namespace
        // so that application classes do not need to require each other.
        'MyApp.*',
        'Ext.*',
    ],

    // The name of the initial view to create.
    mainView: 'MyApp.view.main.Main'
});
