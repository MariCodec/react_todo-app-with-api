/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as todoService from './api/todos';
import { Todo } from './types/Todo';
import { FilterType } from './types/FilterTodos';
import { List } from './components/Todolist';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Error } from './components/Error';

export const App: React.FC = () => {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState(FilterType.all);
  const [disable, setDisable] = useState(false);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const allCompleted = todos.every(todo => todo.completed);

  useEffect(() => {
    setLoading(true);
    todoService
      .getTodos()

      .then(todoFromServer => setTodos(todoFromServer))
      .catch(() => {
        setErrorMessage('Unable to load todos');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!todoService.USER_ID) {
    return <UserWarning />;
  }

  const filterTodos = todos.filter(todo => {
    switch (filter) {
      case FilterType.active:
        return !todo.completed;
      case FilterType.completed:
        return todo.completed;
      default:
        return true;
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim() === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    setDisable(true);
    let requestSuccessful = false;
    const temptodo: Todo = {
      userId: todoService.USER_ID,
      title: title.trimStart().trimEnd(),
      completed: false,
      id: 0,
    };

    setLoadingTodoIds(prev => [...prev, temptodo.id]);
    setTempTodo(temptodo);
    todoService
      .createTodo(temptodo)
      .then(createdTodo => {
        setTodos(currentTodos => [...currentTodos, createdTodo]);
        requestSuccessful = true;
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');

        setTitle(title);
      })
      .finally(() => {
        setDisable(false);
        setLoadingTodoIds(prev => prev.filter(id => id !== temptodo.id));
        setTempTodo(null);
        if (requestSuccessful) {
          setTitle('');
        }
      });
  };

  const handleComplitedToDo = (upTodo: Todo) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { id, title, completed } = upTodo;

    setLoadingTodoIds(prev => [...prev, id]);

    todoService
      .upDataTodo(id, { title, completed: !completed })
      .then(() => {
        setTodos(
          todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to update a todo');
      })
      .finally(() => {
        setLoadingTodoIds(prev => prev.filter(todoId => todoId !== id));
      });
  };

  const deleteTodo = (id: number) => {
    setLoadingTodoIds(prev => [...prev, id]);
    todoService
      .deleteTodo(id)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => {
        setLoadingTodoIds(prev => prev.filter(todoId => todoId !== id));
      });
  };

  const clearCompleted = () => {
    const completedTodos = todos.filter(todo => todo.completed);

    Promise.all(
      completedTodos.map(todo => {
        setLoadingTodoIds(prev => [...prev, todo.id]);

        return todoService
          .deleteTodo(todo.id)
          .then(() => {
            setTodos(currentTodos =>
              currentTodos.filter(t => t.id !== todo.id),
            );
          })
          .catch(() => {
            setErrorMessage('Unable to delete a todo');
          })
          .finally(() => {
            setLoadingTodoIds(prev =>
              prev.filter(todoId => todoId !== todo.id),
            );
          });
      }),
    );
  };

  const handleToggleAll = () => {
    const shouldCompleteAll = !allCompleted;
    const todosToUpdate = todos.filter(
      todo => todo.completed !== shouldCompleteAll,
    );

    Promise.all(
      todosToUpdate.map(todo => {
        setLoadingTodoIds(prev => [...prev, todo.id]);

        return todoService
          .upDataTodo(todo.id, { completed: shouldCompleteAll })
          .then(() => {
            setTodos(currentTodos =>
              currentTodos.map(t =>
                t.id === todo.id ? { ...t, completed: shouldCompleteAll } : t,
              ),
            );
          })
          .catch(() => {
            setErrorMessage('Unable to update todos');
          })
          .finally(() => {
            setLoadingTodoIds(prev =>
              prev.filter(loadId => loadId !== todo.id),
            );
          });
      }),
    );
  };

  const updateTodoTitle = (id: number, newTitle: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, title: newTitle } : todo,
      ),
    );
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <Header
          title={title}
          setTitle={setTitle}
          handleSubmit={handleSubmit}
          disable={disable}
          todos={todos}
          allCompleted={allCompleted}
          handleToggleAll={handleToggleAll}
          loading={loading}
        />
        <List
          todos={filterTodos}
          tempTodo={tempTodo}
          loadingTodoIds={loadingTodoIds}
          loading={loading}
          handleCompletedTodo={handleComplitedToDo}
          deleteTodo={deleteTodo}
          setLoadingTodoIds={setLoadingTodoIds}
          setErrorMessage={setErrorMessage}
          updateTodoTitle={updateTodoTitle}
          setLoading={setLoading}
        />

        {!!todos.length && (
          <Footer
            todos={todos}
            clearCompleted={clearCompleted}
            filter={filter}
            setFilter={setFilter}
          />
        )}
      </div>

      <Error
        errorMessage={errorMessage}
        closeError={() => setErrorMessage('')}
      />
    </div>
  );
};
