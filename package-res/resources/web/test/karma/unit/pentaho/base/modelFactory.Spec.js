define([
  "pentaho/type/Context",
  "pentaho/visual/base/modelFactory"
], function(Context, modelFactory) {
  "use strict";

  describe("pentaho/visual/base/modelFactory", function(){
    var context;
    var Model;

    beforeEach(function(){
      context = new Context();
      Model = context.get(modelFactory);
    });

    it("cannot instantiate an empty modelSpec", function(){
      expect(function(){ return new Model({}); }).toThrow();
    });
  });

});