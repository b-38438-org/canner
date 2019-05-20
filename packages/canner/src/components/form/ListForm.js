// @flow

import React, {useMemo} from 'react';
import {Context} from 'canner-helpers';
import {isEqual} from 'lodash';
export default (React.memo: any)(function ListForm(props: any) {
  const {
    data,
    rootValue,
    loading = null,
    isFetching,
    componentTree,
    routes,
    routerParams,
    goTo,
    defaultKey,
    children,
    request,
    query,
    deploy,
    updateQuery,
    // items,
    // args,
    ...rest
  } = props;
  const contextValue = useMemo(() => ({
    rootValue,
    data,
    routes,
    routerParams,
    goTo,
    request,
    query,
    deploy,
    updateQuery,
    ...rest
  }), [rootValue, data, routes, routerParams, goTo])
  return (
    <Context.Provider value={contextValue}>
      {isFetching ? loading : (
        React.cloneElement(children, {
          componentTree,
          goTo,
          routes,
          routerParams: routerParams || {},
          defaultKey
        })
      )}
    </Context.Provider>
  )
}, function(prevProps, nextProps) {
  return Object.entries(nextProps).reduce((eq, [k, v]: any) => {
    if (k === 'refId') {
      return eq && prevProps[k].toString() === v.toString();
    }
    return isEqual(v, prevProps[k]) && eq;
  }, true)
})