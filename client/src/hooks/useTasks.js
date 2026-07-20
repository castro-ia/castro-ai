import { useState, useEffect, useCallback } from 'react';
import { listTasks, upsertTask, deleteTask } from '../lib/db';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const all = await listTasks();
    setTasks(all);
    setLoaded(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveTask = useCallback(
    async (task) => {
      await upsertTask(task);
      await reload();
    },
    [reload]
  );

  const removeTask = useCallback(
    async (id) => {
      await deleteTask(id);
      await reload();
    },
    [reload]
  );

  const toggleDone = useCallback(
    async (task) => {
      await upsertTask({ ...task, done: !task.done });
      await reload();
    },
    [reload]
  );

  return { tasks, loaded, saveTask, removeTask, toggleDone };
}
