import { useState, useEffect, useCallback } from 'react';
import { listTasks, upsertTask, deleteTask } from '../lib/db';
import { createCalendarEvent, deleteCalendarEvent } from '../lib/api';

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
      const previous = task.id ? tasks.find((t) => t.id === task.id) : null;
      let calendarEventId = previous?.calendarEventId || null;
      const wantsReminder = Boolean(task.reminderEmail && task.dueDate);
      const changed =
        previous?.dueDate !== task.dueDate || previous?.dueTime !== task.dueTime || previous?.title !== task.title;

      // Si ya había un recordatorio y algo cambió (o se desactivó), se borra y se recrea
      // en vez de tratar de editarlo — más simple y evita eventos duplicados/desactualizados.
      if (calendarEventId && (!wantsReminder || changed)) {
        await deleteCalendarEvent(calendarEventId).catch(() => {});
        calendarEventId = null;
      }
      if (wantsReminder && !calendarEventId) {
        try {
          const { eventId } = await createCalendarEvent({
            summary: task.title,
            date: task.dueDate,
            time: task.dueTime,
            reminderMinutes: 60,
          });
          calendarEventId = eventId;
        } catch {
          calendarEventId = null;
        }
      }

      await upsertTask({ ...task, calendarEventId });
      await reload();
    },
    [reload, tasks]
  );

  const removeTask = useCallback(
    async (id) => {
      const task = tasks.find((t) => t.id === id);
      if (task?.calendarEventId) await deleteCalendarEvent(task.calendarEventId).catch(() => {});
      await deleteTask(id);
      await reload();
    },
    [reload, tasks]
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
