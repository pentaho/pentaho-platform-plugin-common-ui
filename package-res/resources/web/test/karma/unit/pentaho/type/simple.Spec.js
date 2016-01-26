/*!
 * Copyright 2010 - 2015 Pentaho Corporation.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
  "pentaho/type/Context",
  "pentaho/util/error",
  "pentaho/i18n!/pentaho/type/i18n/types"
], function(Context, error, bundle) {

  "use strict";

  /*global describe:true, it:true, expect:true, beforeEach:true*/

  var context = new Context(),
      List    = context.get("pentaho/type/list"),
      Element = context.get("pentaho/type/element"),
      Simple  = context.get("pentaho/type/simple"),
      Number  = context.get("pentaho/type/number");

  describe("pentaho/type/element -", function() {
    it("should be a function", function() {
      expect(typeof Simple).toBe("function");
    });

    it("should be a sub-class of `Element`", function() {
      expect(Simple.prototype instanceof Element).toBe(true);
    });

    describe(".Meta -", function() {
      var ElemMeta = Simple.Meta;

      it("should be a function", function() {
        expect(typeof ElemMeta).toBe("function");
      });

      it("should be a sub-class of `Element.Meta`", function() {
        expect(ElemMeta.prototype instanceof Element.Meta).toBe(true);
      });

      describe("#domain -", function() {
        it("should respect a specified base domain", function() {
          var B = Number.extend({
            meta: {
              domain: [1, 2, 3]
            }
          });

          var domain = B.meta.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(3);

          expect(domain.at(0) instanceof Number).toBe(true);
          expect(domain.at(1) instanceof Number).toBe(true);
          expect(domain.at(2) instanceof Number).toBe(true);

          expect(domain.at(0).value).toBe(1);
          expect(domain.at(1).value).toBe(2);
          expect(domain.at(2).value).toBe(3);
        });

        it("should inherit the base domain elements when unspecified", function() {
          var B = Number.extend({
            meta: {
              domain: [1, 2, 3]
            }
          });

          var C = B.extend();

          var domain = B.meta.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(3);

          var subDomain = C.meta.domain;
          expect(subDomain).not.toBe(domain);

          expect(subDomain.count).toEqual(domain.count);

          expect(subDomain.at(0).value).toEqual(domain.at(0).value);
          expect(subDomain.at(1).value).toEqual(domain.at(1).value);
          expect(subDomain.at(2).value).toEqual(domain.at(2).value);
        });

        it("should throw if the specified domain is not a subset of the base domain", function() {
          var B = Number.extend({
            meta: {
              domain: [1, 2, 3]
            }
          });

          expect(function() {
            B.extend({
              meta: {
                domain: [1, 4]
              }
            });
          }).toThrowError(
              error.argInvalid("domain", bundle.structured.errors.type.domainIsNotSubsetOfBase)
                  .message);
        });

        it("should respect a specified domain that is a subset of the base domain", function() {
          var B = Number.extend({
            meta: {
              domain: [1, 2, 3]
            }
          });

          var C = B.extend({
            meta: {
              domain: [1, 2]
            }
          });

          var domain = C.meta.domain;
          expect(domain instanceof List).toBe(true);
          expect(domain.count).toBe(2);

          expect(domain.at(0).value).toBe(1);
          expect(domain.at(1).value).toBe(2);
        });

        it("should inherit the base domain when later set to nully or empty array", function() {

          function expectIt(newDomain) {
            var B = Number.extend({
              meta: {
                domain: [1, 2, 3]
              }
            });

            var C = B.extend({
              meta: {
                domain: [1, 2]
              }
            });

            var domain = C.meta.domain;
            expect(domain instanceof List).toBe(true);
            expect(domain.count).toBe(2);

            C.meta.domain = newDomain;

            domain = C.meta.domain;
            expect(domain instanceof List).toBe(true);
            expect(domain.count).toBe(3);
          }

          expectIt(null);
          expectIt(undefined);
          expectIt([]);
        });
      }); // #domain

      // TODO: cast
    });
  });
});
