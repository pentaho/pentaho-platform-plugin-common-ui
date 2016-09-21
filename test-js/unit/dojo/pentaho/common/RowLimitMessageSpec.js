define(["pentaho/common/RowLimitMessage", "dojo/dom-class"],
    function (RowLimitMessage, domClass) {


      describe("Row limit message test", function () {

        beforeEach(function () {
          spyOn(domClass, 'add');
          spyOn(domClass, 'remove');
          RowLimitMessage.prototype._localize = function () {
          };
        });

        it("should bind button callbacks", function () {
          var msg = new RowLimitMessage();

          var cb1 = function () {
          };
          var cb2 = function () {
          };
          msg.bindRun(cb1);
          msg.bindSchedule(cb2);
          expect(msg._runCallback).toBe(cb1);
          expect(msg._scheduleCallback).toBe(cb2);
        });

        it("should bind localization lookup", function () {
          var msg = new RowLimitMessage();

          var cb1 = function (s) {
            return s
          };
          msg.registerLocalizationLookup(cb1);
          expect(msg._getLocaleString).toBe(cb1);
        });

        it("should be hideable", function () {
          var msg = new RowLimitMessage();
          msg.hide();
          expect(domClass.add).toHaveBeenCalledWith(msg.limitArea, "hidden");
          expect(domClass.add).toHaveBeenCalledWith(msg.limitMessage, "hidden");
          expect(domClass.add).toHaveBeenCalledWith(msg.systemLimitMessage, "hidden");
        });

        it("should show limit reached message", function () {
          var msg = new RowLimitMessage();
          msg.limitReached();
          expect(domClass.remove).toHaveBeenCalledWith(msg.limitArea, "hidden");
          expect(domClass.remove).toHaveBeenCalledWith(msg.limitMessage, "hidden");
          expect(domClass.add).toHaveBeenCalledWith(msg.systemLimitMessage, "hidden");
        });

        it("should show system limit reached message", function () {
          var msg = new RowLimitMessage();
          msg.systemLimitReached();
          expect(domClass.remove).toHaveBeenCalledWith(msg.limitArea, "hidden");
          expect(domClass.add).toHaveBeenCalledWith(msg.limitMessage, "hidden");
          expect(domClass.remove).toHaveBeenCalledWith(msg.systemLimitMessage, "hidden");
        });

      });

    });
