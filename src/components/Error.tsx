import React, { useEffect } from 'react';
import { FC } from 'react';
type Props = {
  closeError: () => void;
  errorMessage: string;
};
export const Error: FC<Props> = ({ closeError, errorMessage }) => {
  useEffect(() => {
    const timeout = setTimeout(closeError, 3000);

    return () => clearTimeout(timeout);
  }, [errorMessage, closeError]);

  return (
    <div
      data-cy="ErrorNotification"
      className={`notification is-danger is-light has-text-weight-normal ${!errorMessage ? 'hidden' : ''}`}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={closeError}
      />

      {errorMessage}
    </div>
  );
};
