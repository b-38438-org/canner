// @flow

import React, { useContext } from 'react';
// $FlowFixMe: antd Breadcrumb
import {Breadcrumb, Icon} from 'antd';
import {Context, Item} from 'canner-helpers';
import {FORM_TYPE} from 'canner/src/hooks/useFormType';

import {DefaultCreateBody, DefaultListBody, DefaultUpdateBody} from './defaultBody';

type Props = {
  id: string,
  title: string,
  description: string,

  schema: Object,
  routes: Array<string>,

  createComponent?: any,
  listComponent?: any,
  updateComponent?: any,
};

export default function Body({ createComponent, listComponent, updateComponent, ...restProps}: Props) {
  const { formType } = useContext(Context);
  let RenderBody = DefaultListBody;

  if (formType === FORM_TYPE.CREATE) {
    RenderBody = createComponent || DefaultCreateBody;
  }

  if (formType === FORM_TYPE.LIST) {
    RenderBody = listComponent || DefaultListBody;
  }

  if (formType === FORM_TYPE.UPDATE) {
    RenderBody = updateComponent || DefaultUpdateBody;
  }

  return <RenderBody {...restProps} />;
}
