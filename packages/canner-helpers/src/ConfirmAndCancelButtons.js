import React, { useContext, useCallback } from 'react';
import ConfirmButton from './confirmButton';
import Context from './context';
import ResetButton from './cancelButton';

export default function ConfirmAndCancelButtons({
  cancelButtonProps = {},
  shouldRenderCancelButton,
  shouldRenderSubmitButton,
}) {
  const {routes, goTo} = useContext(Context);
  const backToList = useCallback(() => {
    goTo({pathname: routes[0]});
  });
  return <React.Fragment>
    {
      (shouldRenderCancelButton || shouldRenderSubmitButton) && (
        <div
          style={{
            textAlign: "right",
            marginTop:  60
          }}
        >
          {shouldRenderCancelButton && <ResetButton style={{marginRight: 16}} callback={backToList} {...cancelButtonProps} />}
          {shouldRenderSubmitButton && <ConfirmButton callback={backToList} />}
        </div>
      )
    }
  </React.Fragment>
}
