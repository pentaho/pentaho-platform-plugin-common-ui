
define([
  "pentaho/util/object"
], function(O) {

  "use strict";

  //  UNUSED = 0;
  var USED = 1;
  var RESERVED = 2;

  function ConstructionContext() {

    // Reserving a depth of 10 levels is already in excess of any business tree
    // and ensures 99% of use cases never cause re-allocation of the array, to extend it.

    // The algorithm works by using an index, `level` to the top used array position.
    // When releasing the top position, it is only nulled out, and `level` decremented.

    // One of the goals is to keep the two methods that are called in the hot construction path
    // of all Complex and List instances (that have any spec content), `enter` and `exit` as simple,
    // small and fast as possible. No validations are performed.
    // For each `enter` that is called, `exit` must be called later an equal amount of times,
    // or things will fail.

    // No allocations are performed in these functions (unless on the each time that the allocated depth is exceeded).
    // Allocations are only performed during the methods `tryUse`, `tryReserveSubtree` and `tryReserveTree`,
    // and these are only called in the 1% use cases that actually use instance injection.
    // In these cases, while the implementation performance is also highly tuned,
    // allocation is both a necessity and an acceptable consequence.

    // Level 0 is unused to make code easier.
    var levels = new Array(10);
    levels[0] = null;

    var level = 0;

    // SUPER HOT PATH
    // Used in constructors of Complex and List.
    this.enter = function() {
      level++;
    };

    // SUPER HOT PATH
    // Used in constructors of Complex and List.
    // Release any allocated memory
    this.exit = function() {
      levels[level--] = null;
    };

    // PRE
    // 1. There is no inherited RESERVED.
    //
    // POST
    // 1. USED from level up to the root.
    this.startUse = function(inst) {

      // assert inst && inst.$type.isContainer

      var uid = inst.$uid;

      var lastIndex = getLastReservationIndex(level);
      if(lastIndex) {
        if(levels[lastIndex][uid] === RESERVED) {
          // If there is an inherited RESERVED, it's not ok to USE...
          return null;
        }

        if(lastIndex > 1 && levels[1][uid] === RESERVED) {
          // If there is a tree RESERVED, it's not ok to USE...
          return null;
        }
      }

      return function endUse() {
        if(lastIndex) {
          // else if USED
          //   Already being USED.
          //   Fill from lastIndex up to before the first USED with USED.
          // else
          //   Fill from lastIndex up to 1 with USED.

          setReservationExistingRange(1, lastIndex, uid, USED);
        }

        // Create and fill from lastIndex + 1 to level with USED
        createReservationRangeAndInitialize(lastIndex + 1, level, uid, USED);
      };
    };

    // PRE
    // 1. There is no inherited RESERVED.
    // 2. There is no *local* USED.
    //
    // POST
    // 1. Locally RESERVED.
    // 2. USED from the level above up to the root.
    this.startReserveSubtree = function(inst) {

      // assert inst && inst.$type.isContainer

      var uid = inst.$uid;

      var lastIndex = getLastReservationIndex(level);
      if(lastIndex) {
        /* eslint default-case: 0 */
        switch(levels[lastIndex][uid]) {
          case RESERVED:
            // If there is an inherited RESERVED, it's not ok to use, and much less to reserve...
            return false;

          case USED:
            if(lastIndex > 1 && levels[1][uid] === RESERVED) {
              // If there is a tree RESERVED, it's not ok to use/reserve...
              return null;
            }

            // Being USED somewhere above. Is it a local use?
            if(lastIndex === level && O.hasOwn(levels[level], uid)) {
              // USED locally.
              return false;
            }

            // Fill from lastIndex up to before the first USED with USED.
            break;

            // default:
            //   Not USED or RESERVED.
            //   Fill from lastIndex up to 1 with USED
        }
      }

      return function endReserveSubtree() {

        if(lastIndex) {
          setReservationExistingRange(1, lastIndex, uid, USED);
        }

        // Create and fill from lastIndex + 1 to level with USED
        createReservationRangeAndInitialize(lastIndex + 1, level, uid, USED);

        // Set level to RESERVED
        levels[level][uid] = RESERVED;
      };
    };

    // PRE
    // 1. There is no inherited RESERVED.
    // 2. There is no inherited USED.
    //
    // POST
    // 1. Root RESERVED.
    // 2. USED from _level_ up to the before the root.
    this.startReserveTree = function(inst) {

      // assert inst && inst.$type.isContainer

      var uid = inst.$uid;

      var lastIndex = getLastReservationIndex(level);
      if(lastIndex) {
        if(levels[lastIndex][uid]) {
          // If there is an inherited USED or RESERVED, it's not ok to tree-reserve.
          return false;
        }
      }

      return function endReserveTree() {
        if(lastIndex) {

          // Mark as USED from lastIndex up to before the root.
          setReservationExistingRange(2, lastIndex, uid, USED);
        }

        // Create and fill from lastIndex + 1 to level with USED
        createReservationRangeAndInitialize(lastIndex + 1, level, uid, USED);

        // Set root to RESERVED
        levels[1][uid] = RESERVED;
      };
    };

    function getLastReservationIndex(start) {

      // 1. Find last level with reservations.

      // assert start >= 1;

      var i = start;
      while(!levels[i] && i !== 0) { i--; }

      // assert i >= 0;

      return i;
    }

    function setReservationExistingRange(from, to, uid, MARK) {

      var reservationByUid;

      while(to >= from && O.getOwn((reservationByUid = levels[to--]), uid) !== MARK) {
        reservationByUid[uid] = MARK;
      }
    }

    function createReservationRangeAndInitialize(from, to, uid, MARK) {
      // assert from >= 1
      var current = levels[from - 1]; // null when from is 1

      // assert from == 1 || current != null

      while(from <= to) {
        levels[from++] = current = Object.create(current);
        if(uid) {
          current[uid] = MARK;
        }
      }
    }
  }

  return ConstructionContext;
});
