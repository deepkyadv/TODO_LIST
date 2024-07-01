import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { app } from "../firebase";
import "./Task.css";

const db = getFirestore(app);

function Task({ todoListId, tasks }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [taskList, setTaskList] = useState(tasks || []);

  const addTask = async () => {
    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        todoListId,
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate,
        priority: taskPriority,
      });
      alert("Task created with ID: " + docRef.id);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskPriority("");
      fetchTasks();
    } catch (e) {
      console.error("Error adding task: ", e);
    }
  };

  const fetchTasks = async () => {
    const q = query(collection(db, "tasks"), where("todoListId", "==", todoListId));
    const querySnapshot = await getDocs(q);
    const taskList = [];
    querySnapshot.forEach((doc) => {
      taskList.push({ id: doc.id, ...doc.data() });
    });
    setTaskList(taskList);
  };

  useEffect(() => {
    fetchTasks();
  }, [todoListId]);

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("sourceListId", todoListId);
  };

  return (
    <div className='task'>
      <h3>Tasks</h3>
      <input
        type="text"
        placeholder="Task title"
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Task description"
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
      />
      <input
        type="date"
        value={taskDueDate}
        onChange={(e) => setTaskDueDate(e.target.value)}
      />
      <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
        <option value="">Select priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button onClick={addTask}>Add Task</button>
      <div>
        {taskList.map((task, index) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
          >
            <h4>Task title: {task.title}</h4>
            <p>Task description: {task.description}</p>
            <p>Task due date: {task.dueDate}</p>
            <p>Task priority: {task.priority}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Task;
