/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  loadingTodoIds: number[];
  setLoadingTodoIds: React.Dispatch<React.SetStateAction<number[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  handleCompletedTodo: (todo: Todo) => void;
  deleteTodo: (id: number) => void;
  updateTodoTitle: (id: number, newTitle: string) => void;
};

export const List: React.FC<Props> = ({
  todos,
  tempTodo,
  loading,
  loadingTodoIds,
  handleCompletedTodo,
  setLoadingTodoIds,
  setLoading,
  deleteTodo,
  setErrorMessage,
  updateTodoTitle,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          loading={loading}
          loadingId={loadingTodoIds.includes(todo.id)}
          handleCompletedTodo={handleCompletedTodo}
          setLoadingTodoIds={setLoadingTodoIds}
          deleteTodo={deleteTodo}
          setErrorMessage={setErrorMessage}
          updateTodoTitle={updateTodoTitle}
          setLoading={setLoading}
        />
      ))}
      {tempTodo && (
        <div
          key={tempTodo.id}
          data-cy="Todo"
          className={`todo ${tempTodo.completed ? 'completed' : ''}`}
        >
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={tempTodo.completed}
              onChange={() => handleCompletedTodo(tempTodo)}
            />
          </label>
          <div
            data-cy="TodoLoader"
            className={`modal overlay is-active ${loadingTodoIds.includes(tempTodo.id) && 'is-active'}`}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>

          <span data-cy="TodoTitle" className="todo__title">
            {tempTodo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodo(tempTodo.id)}
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
};
