
topSuite('Ext.grid.HeaderContainer', ['Ext.grid.Grid', 'Ext.field.Text'], function() {
    var createGrid = function(storeCfg, gridCfg) {
            store = Ext.create('Ext.data.Store', Ext.apply({
                storeId: 'simpsonsStore',
                fields: ['name', 'email', 'phone'],
                data: { 'items': [
                    { 'name': 'Lisa',  "email": "lisa@simpsons.com",  "phone": "555-111-1224"  },
                    { 'name': 'Bart',  "email": "bart@simpsons.com",  "phone": "555-222-1234"  },
                    { 'name': 'Homer', "email": "homer@simpsons.com", "phone": "555-222-1244"  },
                    { 'name': 'Marge', "email": "marge@simpsons.com", "phone": "555-222-1254"  }
                ] },
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json',
                        rootProperty: 'items'
                    }
                }
            }, storeCfg));

            grid = Ext.create('Ext.grid.Grid', Ext.apply({
                title: 'Simpsons',
                store: store,
                columns: [
                    { text: 'Name',  dataIndex: 'name', width: 100 },
                    { text: 'Email', dataIndex: 'email', flex: 1 },
                    { text: 'Phone', dataIndex: 'phone', flex: 1, hidden: true }
                ],
                height: 200,
                width: 400,
                renderTo: Ext.getBody()
            }, gridCfg));
            headerContainer = grid.getHeaderContainer();
            columns = grid.getColumns();
        },
        store, grid, headerContainer, columns;

    function findCell(rowIdx, cellIdx) {
        var row = grid.mapToItem(store.getAt(rowIdx));

        return row.cells[cellIdx].element;
    }

    beforeEach(function() {
        MockAjaxManager.addMethods();
    });

    afterEach(function() {
        store.destroy();
        grid = store = Ext.destroy(grid);
        MockAjaxManager.removeMethods();
        // TODO: reinstate when we have state
        // Ext.state.Manager.clear('foo');
    });

    describe('column menu showing', function() {
        it('should show the menu on trigger click on mouse platforms and longpress on touch platforms', function() {
            var col,
                menu,
                showSpy;

            createGrid({}, {
                renderTo: Ext.getBody()
            });

            col = columns[0];
            menu = col.getMenu();
            showSpy = spyOnEvent(menu, 'show');

            col.showMenu();

            waitsForSpy(showSpy);

            runs(function() {
                expect(menu.isVisible()).toBe(true);
                expect(menu.containsFocus).toBeFalsy();

                jasmine.fireMouseEvent(col.titleElement, 'mousedown');
                expect(menu.isVisible()).toBe(false);
            });

            // TODO: reinstate when we handle docusable column headers
            // waitsForFocus(col);
            //
            // runs(function() {
            //     // Opening the menu with down arrow focuses it
            //     jasmine.fireKeyEvent(col.el.dom, 'keydown', Ext.event.Event.DOWN);
            // });
            //
            // waitsForFocus(menu);
            //
            // expectFocused(menu.down('menuitem'));

            runs(function() {
                jasmine.fireMouseEvent(col.titleElement, 'mouseup');
            });
        });

        // https://sencha.jira.com/browse/EXTJS-27045
        it("should toggle the checked state of hideShowMenuItem on column show/hide", function() {
            var col;

            createGrid(null, {
                columns: [{
                    dataIndex: 'name',
                    itemId: 'col',
                    text: 'Foo'
                }, {
                    dataIndex: 'email',
                    text: 'Email'
                }]
            });

            waitsFor(function() {
                return grid.isRendered();
            });

            runs(function() {
                col = grid.down('#col');
                col.setHidden(true);
                expect(col._hideShowMenuItem._checked).toBe(false);
                col.setHidden(false);
                expect(col._hideShowMenuItem._checked).toBe(true);
            });
        });
    });

    describe('columnManager delegations', function() {
        it('should allow columns to call methods on the ColumnManager', function() {
            var col;

            createGrid({}, {
                renderTo: Ext.getBody()
            });

            col = columns[0];
            expect(col.getVisibleIndex()).toBe(0);
            expect(headerContainer.getVisibleColumns()[0]).toBe(col);
            expect(headerContainer.getClosestVisibleHeader(0)).toBe(col);
        });
    });

    describe('gridVisibleColumns', function() {
        // TODO: reinstate when we have state
        xit('should keep track of state information for visible grid columns', function() {
            var columns = [
                // It's necessary to pass in columns with a headerId property for this test.
                { header: 'Name',  headerId: 'a', dataIndex: 'name', width: 100 },
                { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1, hidden: true }
            ];

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            // Update state information.
            grid.columns[2].show();

            grid.saveState();

            Ext.destroy(grid);

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            expect(headerContainer.gridVisibleColumns.length).toBe(3);
        });

        // TODO: reinstate when we have locking
        xit('should constrain the grid view width to the visible columns width when enableLocking is true', function() {
            var columns = [
                // It's necessary to pass in columns with a headerId property for this test.
                { header: 'Name',  id: 'a', dataIndex: 'name', width: 200 },
                { header: 'Email', id: 'b', dataIndex: 'email', width: 200 },
                { header: 'Phone', id: 'c', dataIndex: 'phone', width: 200 }
            ];

            createGrid({}, {
                width: 400,
                enableLocking: true,
                columns: columns,
                stateful: true,
                stateId: 'foo',
                listeners: {
                    beforerender: {
                        fn: function() {
                            var state = [{
                                id: 'a'
                            }, {
                                id: 'b'
                            }, {
                                id: 'c',
                                hidden: true
                            }];

                            this.applyState({
                                columns: state
                            });
                        }
                    }
                }
            });

            expect(grid.normalGrid.getView().el.dom.scrollWidth).toBe(400);
        });

        // TODO: reinstate when we have state
        xit('should keep track of state information for visible grid columns when moved', function() {
            // This spec simulates a stateful bug: EXTJSIV-10262. This bug occurs when a previously hidden
            // header is shown and then moved. The bug occurs because the gridVisibleColumns cache is created
            // from stale information. This happens when the visible grid columns are retrieved before applying
            // the updated state info.
            var columns = [
                // It's necessary to pass in columns with a headerId property for this test.
                { header: 'Name',  headerId: 'a', dataIndex: 'name', width: 100 },
                { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1, hidden: true }
            ];

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            // Update state information.
            grid.columns[2].show();
            headerContainer.move(2, 0);

            grid.saveState();

            Ext.destroy(grid);

            createGrid({}, {
                columns: columns,
                stateful: true,
                stateId: 'foo'
            });

            expect(headerContainer.gridVisibleColumns.length).toBe(3);
            expect(headerContainer.gridVisibleColumns[0].dataIndex).toBe('phone');
        });

        // TODO: reinstate when we have state
        xit('should insert new columns into their correct new ordinal position after state restoration', function() {
            // Test ticket EXTJS-15690.
            var initialColumns = [
                    // It's necessary to pass in columns with a headerId property for this test.
                    { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1 }
                ],
                newColumns = [
                    // It's necessary to pass in columns with a headerId property for this test.
                    { header: 'Name',  headerId: 'a', dataIndex: 'name', width: 100 },
                    { header: 'Email', headerId: 'b', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', headerId: 'c', dataIndex: 'phone', flex: 1 }
                ];

            createGrid({}, {
                columns: initialColumns,
                stateful: true,
                stateId: 'foo'
            });

            // Update state information.
            // Should now be Phone,Email
            headerContainer.move(1, 0);

            grid.saveState();

            Ext.destroy(grid);

            // Create the grids with a new column in at index 0
            // The stateful columns should be in their stateful *order*
            // But the insertion point of the new column must be honoured.
            createGrid({}, {
                columns: newColumns,
                stateful: true,
                stateId: 'foo'
            });

            // The order of the two initial stateful columns should be restored.
            // And the new, previously unknown column "name" which was configured
            // At index 0 should have been inserted at index 0
            expect(headerContainer.gridVisibleColumns[0].dataIndex).toBe('name');
            expect(headerContainer.gridVisibleColumns[1].dataIndex).toBe('phone');
            expect(headerContainer.gridVisibleColumns[2].dataIndex).toBe('email');
        });
    });

    describe('non-column descendants of headerCt', function() {
        describe('headerCt events', function() {
            var field;

            beforeEach(function() {
                createGrid(null, {
                    columns: [
                        { header: 'Name',  dataIndex: 'name', width: 100 },
                        { header: 'Email', dataIndex: 'email', flex: 1,
                            items: [{
                                xtype: 'textfield'
                            }]
                        }
                    ]
                });

                field = headerContainer.down('textfield');
            });

            afterEach(function() {
                field = null;
            });

            // TODO: reistate when keyboard
            xit('should not throw in reaction to a delegated keydown event', function() {
                // Note that unfortunately we're testing a private method since that's where it throws.
                jasmine.fireKeyEvent(field.inputEl, 'keydown', 13);

                expect(function() {
                    var e = {
                        getTarget: function() {
                            return field.inputEl.dom;
                        }
                    };

                    headerContainer.onHeaderActivate(e);
                }).not.toThrow();
            });

            // Reinstate when column headers can be containers
            xit('should not react to keydown events delegated from the headerContainer', function() {
                // For this test, we'll know that the event was short-circuited b/c the sortable column
                // wasn't sorted.
                var wasCalled = false,
                    fn = function() {
                        wasCalled = true;
                    };

                headerContainer.on('sortchange', fn);
                jasmine.fireKeyEvent(field.inputEl, 'keydown', 13);

                expect(wasCalled).toBe(false);
            });
        });
    });

    // TODO: reinstate when column headers are focusable
    xdescribe("keyboard events", function() {
        var headerCt;

        beforeEach(function() {
            createGrid(null, {
                columns: [{
                    header: 'Name', dataIndex: 'name', width: 100
                }, {
                    header: 'Email', dataIndex: 'email', flex: 1
                }, {
                    header: 'Phone', dataIndex: 'phone', flex: 1
                }]
            });

            headerCt = grid.headerCt;

            focusAndWait(headerCt.down('[dataIndex=email]'));
        });

        afterEach(function() {
            headerCt = null;
        });

        it("should focus first column header on Home key", function() {
            jasmine.syncPressKey(headerCt.el, 'home');
            expectFocused(headerCt.gridVisibleColumns[0]);
        });

        it("should focus last column header on End key", function() {
            jasmine.syncPressKey(headerCt.el, 'end');
            expectFocused(headerCt.gridVisibleColumns[2]);
        });
    });

    describe('Disabling column hiding', function() {
        it('should disable hiding the last visible column', function() {
            createGrid();

            var menu,
                col = columns[0],
                colItem,
                colMenu,
                nameItem,
                emailItem;

            columns[2].show();
            columns[2].setMenu(null);

            col.showMenu();
            colItem = grid.getColumnsMenuItem();
            colItem.expandMenu();

            // Wait for the column show/hide menu to appear
            waitsFor(function() {
                colMenu = colItem.getMenu();

                return colMenu && colMenu.isVisible();
            }, 'column hiding menu to show');

            // Hide the "Name" column, leaving only the "Email"  and "Phone" columns visible
            // Phone is menu: false, so hiding t he name item means that the email item cannot be hidden
            runs(function() {
                nameItem = colMenu.child('[text=Name]');
                emailItem = colMenu.child('[text=Email]');
                jasmine.fireMouseEvent(nameItem.ariaEl.dom, 'click');
            });

            // The "Email" column is the last visible column, so its
            // hide menu check item must be disabled.
            waitsFor(function() {
                return emailItem.getDisabled();
            }, 'last column hiding item to be disabled', 500);

            runs(function() {
                menu = col.getMenu();
                menu.hide();
            });
        });

        it('should disable hiding the last visible column when columns are hierarchically hidden', function() {
            createGrid(null, {
                columns: [
                    { text: 'Name',  dataIndex: 'name', width: 100 },
                    {
                        text: 'Contacts',
                        columns: [
                            { text: 'Email', dataIndex: 'email', flex: 1 },
                            { text: 'Phone', dataIndex: 'phone', flex: 1 }
                        ]
                    }
                ]
            });

            var menu,
                col = columns[0],
                colItem,
                colMenu,
                contactsItem,
                nameItem;

            col.showMenu();
            colItem = grid.getColumnsMenuItem();
            colItem.expandMenu();

            // Wait for the column show/hide menu to appear
            waitsFor(function() {
                colMenu = colItem.getMenu();

                return colMenu && colMenu.isVisible();
            }, 'column hiding menu to show');

            // Hide the "Contacts" column, leaving only the "Email"  and "Phone" columns visible
            // Phone is menu: false, so hiding t he name item means that the email item cannot be hidden
            runs(function() {
                nameItem = colMenu.child('[text=Name]');
                contactsItem = colMenu.child('[text=Contacts]');
                jasmine.fireMouseEvent(contactsItem.ariaEl.dom, 'click');
            });

            // The "Name" column is the last visible column, so its
            // hide menu check item must be disabled.
            waitsFor(function() {
                return nameItem.getDisabled();
            }, 'last column hiding item to be disabled', 500);

            runs(function() {
                menu = col.getMenu();
                menu.hide();
            });
        });
    });

// TODO: reinstate when focusable
    xdescribe("reconfiguring parent grid", function() {
        it("should activate container after adding columns", function() {
            createGrid({}, { columns: [] });

            expect(headerContainer.isFocusableContainerActive()).toBeFalsy();

            grid.setStore([
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone', flex: 1, hidden: true }
            ]);

            expect(headerContainer.isFocusableContainerActive()).toBeTruthy();
            expect(headerContainer.down('gridcolumn')).toHaveAttr('tabIndex', 0);
        });

        it("should deactivate container after removing all columns", function() {
            createGrid();

            expect(headerContainer.isFocusableContainerActive()).toBeTruthy();
            expect(headerContainer.down('gridcolumn')).toHaveAttr('tabIndex', 0);

            grid.setStore([]);

            expect(headerContainer.isFocusableContainerActive()).toBeFalsy();
        });
    });

    describe('grid panel', function() {
        it('should be notified when adding a column header', function() {
            createGrid({}, { columns: [] });

            headerContainer.insert(0, [
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone', flex: 1 }
            ]);

            var c0_0 = findCell(0, 0),
                c0_1 = findCell(0, 1),
                c0_2 = findCell(0, 2);

            expect(c0_0).not.toBe(false);
            expect(c0_1).not.toBe(false);
            expect(c0_2).not.toBe(false);

        });

        // EXTJS-21400
        it('should be notified when adding a group header', function() {
            createGrid({}, { columns: [] });

            headerContainer.insert(0, { header: 'test', columns: [
                { header: 'Name',  dataIndex: 'name', width: 100 },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone', flex: 1 }
            ] });

            var c0_0 = findCell(0, 0),
                c0_1 = findCell(0, 1),
                c0_2 = findCell(0, 2);

            expect(c0_0).not.toBe(false);
            expect(c0_1).not.toBe(false);
            expect(c0_2).not.toBe(false);
        });

        it('should compute the width change on column hide and show when the grid is hidden', function() {
            var columnLayoutSpy = jasmine.createSpy(),
                cell, spyCallCount;

            createGrid(null, {
                columns: [
                    { header: 'Name', dataIndex: 'name', flex: 1 },
                    { header: 'Email', dataIndex: 'email', flex: 1 },
                    { header: 'Phone', dataIndex: 'phone', flex: 1 }
                ],
                listeners: {
                    columnlayout: columnLayoutSpy
                }
            });

            cell = columns[1].getCells()[0];

            expect(cell._width).not.toBe(grid._width / 2);

            // Hide the grid and hide one column
            grid.hide();
            columns[0].hide();

            // Any further increment in call count indicates that column layout
            // is done and we can test the width of cells.
            spyCallCount = columnLayoutSpy.callCount;

            grid.show();

            waitsFor(function() {
                // Wait until the grid is visible and the computation is done
                return columnLayoutSpy.callCount > spyCallCount;
            });

            runs(function() {
                // check if the cells width has been computed
                expect(cell._width).toBe(grid._width / 2);
            });
        });
    });

    describe('Show column sorting if store sort applied', function() {

        it('should have DESC sort icon on column header', function() {
            createGrid({ sorters: [{
                property: 'name',
                direction: 'DESC'
                }]
            });

            expect(columns[0].el.hasCls('x-sorted-desc')).toBe(true);
        });

        it('should have ASC sort icon on column header', function() {
            createGrid({ sorters: [{
                property: 'name',
                direction: 'ASC'
                }]
            });

            expect(columns[0].el.hasCls('x-sorted-asc')).toBe(true);
        });
    });

    describe('Show column sorting if remote store sort applied', function() {
        it('should have DESC sort icon on column', function() {
            createGrid({
                fields: ['name'],
                sorters: [{
                    property: 'name',
                    direction: 'DESC'
                }],
                autoLoad: true,
                remoteSort: true,
                proxy: {
                    type: 'ajax',
                    url: 'fake',
                    reader: {
                        rootProperty: 'users',
                        totalProperty: 'totalCount'
                    }
                }
            });

            Ext.Ajax.mockCompleteWithData([{ 'name': 'Lisa' }, { 'name': 'Bart' }]);
            expect(columns[0].el.hasCls('x-sorted-desc')).toBe(true);
        });

        it('should have ASC sort icon on column header', function() {
            createGrid({ sorters: [{
                property: 'name',
                direction: 'ASC'
                }]
            });

            expect(columns[0].el.hasCls('x-sorted-asc')).toBe(true);
        });
    });

    describe('Can not scroll grid after resize', function() {

        var other, button, container,  scroller;

        beforeEach(function() {

            var columns = [
                { text: 'Name', dataIndex: 'name' },
                { text: 'Email', dataIndex: 'email' },
                { text: 'Phone', dataIndex: 'phone' }
            ];

            createGrid({}, {
                flex: 1,
                border: 1,
                columns: columns,
                style: 'border: 1px solid blue',
                renderTo: Ext.getBody()
            });

            other = new Ext.Component({
                flex: 1,
                hidden: true
            });

            button = new Ext.Button({
                text: 'Press me and then try to scroll the grid vertically',
                pressed: false,
                listeners: {
                    tap: function(thisCtr, e, eOpts) {

                        other.setHidden(false);
                    }
                }
            });

            container = new Ext.Container({
                layout: 'vbox',
                renderTo: Ext.getBody(),
                maxHeight: 250,
                height: 250,
                items: [button, grid, other],
                fullscreen: true
            });
        });

        it('should scroll grid after resize the height', function() {

            jasmine.fireMouseEvent(button.el.dom, 'click');
            button.setPressed(true);
            expect(button.isPressed()).toBe(true);

            var scroller = grid.getScrollable();

            expect(button.isPressed()).toBe(true);

            expect(scroller.isVirtualScroller).toBe(true);
        });

        afterEach(function() {

            Ext.destroy(other);
            Ext.destroy(button);
            Ext.destroy(container);
            other = button = scroller = container = null;
        });
    });
});
