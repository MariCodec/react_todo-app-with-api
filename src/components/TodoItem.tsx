/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import { FC, useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';
import React from 'react';
import { upDataTodo } from '../api/todos';

type Props = {
  todo: Todo;
  loading: boolean;
  loadingId: boolean;
  handleCompletedTodo: (todo: Todo) => void;
  setLoadingTodoIds: React.Dispatch<React.SetStateAction<number[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  deleteTodo: (id: number) => void;
  updateTodoTitle: (id: number, newTitle: string) => void;
};
export const TodoItem: FC<Props> = ({
  todo,

  loadingId,
  handleCompletedTodo,
  setLoadingTodoIds,
  deleteTodo,
  setErrorMessage,
  setLoading,
  updateTodoTitle,
}) => {
  const [showUpdateInput, setShowUpdateInput] = useState(false);

  const [updateTitle, setUpdateTitle] = useState(todo.title);

  const focusUpdateRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (focusUpdateRef.current) {
      focusUpdateRef.current.focus();
    }
  }, [showUpdateInput]);

  const handleNewTitle = (
    e: React.FormEvent<HTMLFormElement> | React.FocusEvent<HTMLInputElement>,

    todoWillChange: Todo,
  ) => {
    e.preventDefault();

    const updatedTodo = {
      ...todoWillChange,
      title: updateTitle.trimStart().trimEnd(),
    };

    if (updatedTodo.title === '') {
      deleteTodo(updatedTodo.id);
    } else if (updatedTodo.title === todoWillChange.title) {
      setShowUpdateInput(false);

      return;
    } else {
      setLoadingTodoIds(prevId => [...prevId, todo.id]);
      setLoading(true);
      upDataTodo(todo.id, updatedTodo)
        .then(() => {
          updateTodoTitle(updatedTodo.id, updatedTodo.title);
          setLoadingTodoIds(prevId => prevId.filter(prev => prev !== todo.id));
          setShowUpdateInput(false);
        })
        .catch(() => {
          setErrorMessage('Unable to update a todo');
          setLoadingTodoIds(prevId => prevId.filter(prev => prev !== todo.id));
          setShowUpdateInput(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div
      key={todo.id}
      data-cy="Todo"
      className={`todo ${todo.completed ? 'completed' : ''}`}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => handleCompletedTodo(todo)}
        />
      </label>

      <div
        data-cy="TodoLoader"
        className={`modal overlay ${loadingId && 'is-active'} `}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
      {!showUpdateInput ? (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setShowUpdateInput(true)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodo(todo.id)}
          >
            ×
          </button>
        </>
      ) : (
        <div
          onKeyDown={event => {
            if (event.key === 'Escape') {
              setShowUpdateInput(false);
            }
          }}
          onBlur={() => setShowUpdateInput(false)}
        >
          <form onSubmit={e => handleNewTitle(e, todo)}>
            <input
              data-cy="TodoTitleField"
              type="text"
              className="todo__title-field"
              placeholder="Empty todo will be deleted"
              ref={focusUpdateRef}
              value={updateTitle}
              onChange={event => setUpdateTitle(event.target.value)}
              onBlur={event => handleNewTitle(event, todo)}
            />
          </form>
        </div>
      )}
    </div>
  );
};
