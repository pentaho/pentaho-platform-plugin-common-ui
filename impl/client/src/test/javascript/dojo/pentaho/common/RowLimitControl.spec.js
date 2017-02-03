define(["pentaho/common/RowLimitControl", "pentaho/common/RowLimitMessage", "pentaho/common/RowLimitExceededDialog", "dojo/dom-class"],
    function (RowLimitControl, RowLimitMessage, RowLimitExceededDialog, domClass) {

      describe("Row limit control test", function () {

        RowLimitExceededDialog.prototype._localize = function () {
        };
        RowLimitControl.prototype._localize = function () {
        };
        RowLimitMessage.prototype._localize = function () {
        };
        RowLimitControl.prototype.reset = function () {
          this._callback = undefined;
          this._systemRowLimit = undefined;
          this._reportRowLimit = undefined;
          this._selectedRowLimit = undefined;
          this._previousRowLimit = undefined;
          this._isRowLimitReached = false;
          this._initialized = false;
          this._showGlassPane = undefined;
          this._hideGlassPane = undefined;
          this._getLocaleString = undefined;
        };

        var ctrl = new RowLimitControl();
        var msg = new RowLimitMessage();
        var dlg = new RowLimitExceededDialog();

        var cb2 = function () {
          return msg;
        };
        var cb3 = function () {
          return dlg;
        };

        beforeEach(function () {
          spyOn(domClass, 'add');
          spyOn(domClass, 'remove');
          spyOn(msg, "hide");
          spyOn(msg, "limitReached");
          spyOn(msg, "systemLimitReached");
          spyOn(dlg, "setSystemRowLimit");
          spyOn(dlg, "hide");
          spyOn(dlg, "showDialog");


          ctrl.bindGetMessage(cb2);
          ctrl.bindGetDialog(cb3);
        });

        it("should have initial values", function () {
          ctrl.reset();
          expect(ctrl._initialized).toBe(false);
          expect(ctrl._isRowLimitReached).toBe(false);
        });

        it("should bind callbacks", function () {
          ctrl.reset();
          var cb1 = function () {
          };

          var cb4 = function () {
          };
          var cb5 = function () {
          };
          ctrl.bindChange(cb1);

          ctrl.bindShowGlassPane(cb4);
          ctrl.bindHideGlassPane(cb5);
          expect(ctrl._callback).toBe(cb1);
          expect(ctrl._getMessage).toBe(cb2);
          expect(ctrl._getDialog).toBe(cb3);
          expect(ctrl._showGlassPane).toBe(cb4);
          expect(ctrl._hideGlassPane).toBe(cb5);
        });


        it("should apply values on init", function () {
          //Both system and report not selected
          ctrl._init(-1, 0);
          expect(ctrl._reportRowLimit, -1);
          expect(ctrl._systemRowLimit, 0);
          expect(ctrl._selectedRowLimit, 100);
          expect(ctrl._getRowLimit()).toBe('-1');
          expect(ctrl.rowsNumberInput.get('value')).toBe('');
          expect(ctrl.rowLimitRestrictions.get('disabled')).toBe(false);
          expect(ctrl.rowsNumberInput.get('disabled')).toBe(false);
          ctrl.reset();

          //Both provided, report lower
          ctrl._init(100, 200);
          expect(ctrl._reportRowLimit, 100);
          expect(ctrl._systemRowLimit, 200);
          expect(ctrl._selectedRowLimit, 100);
          expect(ctrl._getRowLimit()).toBe('100');
          expect(ctrl.rowsNumberInput.get('value')).toBe("100");
          expect(ctrl.rowLimitRestrictions.get('disabled')).toBe(true);
          expect(ctrl.rowsNumberInput.get('disabled')).toBe(true);
          ctrl.reset();

          //Both provided, system lower
          ctrl._init(500, 200);
          expect(ctrl._reportRowLimit, 500);
          expect(ctrl._systemRowLimit, 200);
          expect(ctrl._selectedRowLimit, 200);
          expect(ctrl._getRowLimit()).toBe('200');
          expect(ctrl.rowsNumberInput.get('value')).toBe("200");
          expect(ctrl.rowLimitRestrictions.get('disabled')).toBe(true);
          expect(ctrl.rowsNumberInput.get('disabled')).toBe(true);
          ctrl.reset();

          //Only system provided
          ctrl._init(-1, 500);
          expect(ctrl._reportRowLimit, -1);
          expect(ctrl._systemRowLimit, 500);
          expect(ctrl._selectedRowLimit, 500);
          expect(ctrl._getRowLimit()).toBe('500');
          expect(ctrl.rowsNumberInput.get('value')).toBe("500");
          expect(ctrl.rowLimitRestrictions.get('disabled')).toBe(false);
          expect(ctrl.rowsNumberInput.get('disabled')).toBe(false);
          ctrl.reset();

          //Only report provided
          ctrl._init(100, 0);
          expect(ctrl._reportRowLimit, 100);
          expect(ctrl._systemRowLimit, 0);
          expect(ctrl._selectedRowLimit, 100);
          expect(ctrl._getRowLimit()).toBe('100');
          expect(ctrl.rowsNumberInput.get('value')).toBe("100");
          expect(ctrl.rowLimitRestrictions.get('disabled')).toBe(true);
          expect(ctrl.rowsNumberInput.get('disabled')).toBe(true);
        });


      });

    });
