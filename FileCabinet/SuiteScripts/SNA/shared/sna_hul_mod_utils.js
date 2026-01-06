/**
 * Copyright (c) 2025, ScaleNorth Advisors LLC and/or its affiliates. All rights reserved.
 * @NApiVersion 2.1
 * @NModuleScope Public
 *
 *
 * @author ndejesus
 * @description
 *
 */

define([], () => {
  function isEmpty(stValue) {
    return ((stValue === '' || stValue == null || stValue == undefined) || (stValue.constructor === Array && stValue.length == 0) || (stValue.constructor === Object && (function (v) {
      for (let k in v)
        return false;
      return true;
    })(stValue)));
  }

  return { isEmpty };
});
