define(["pentaho/common/RowLimitExceededDialog"],
    function (RowLimitExceededDialog) {

      describe("Row limit dialog test", function () {
        beforeEach(function () {
          RowLimitExceededDialog.prototype._localize = function () {
          };

        });

        it("should bind localization lookup", function () {
          var dialog = new RowLimitExceededDialog();
          var cb1 = function (s) {
            return s
          };
          dialog.registerLocalizationLookup(cb1);
          expect(dialog._getLocaleString).toBe(cb1);
        });

        it("should be able to cleanse size attribute", function () {
          var dialog = new RowLimitExceededDialog();
          expect(dialog.cleanseSizeAttr(undefined, '1')).toBe('1');
          expect(dialog.cleanseSizeAttr('10px', '1')).toBe('10px');
          expect(dialog.cleanseSizeAttr('10', '1')).toBe('10px');
        });

        it("should be able to update system limit", function () {
          var dialog = new RowLimitExceededDialog();
          expect(dialog._systemRowLimit).toBe('');
          dialog.setSystemRowLimit(undefined);
          expect().toBe(undefined);
          dialog.setSystemRowLimit(1);
          expect(dialog._systemRowLimit).toBe('1');
        });


      });

    });
