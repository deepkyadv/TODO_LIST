import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { app } from "../firebase";
import Task from './Task';
import "./TodoList.css";

const db = getFirestore(app);

function TodoList() {
  const [todoName, setTodoName] = useState("");
  const [todoLists, setTodoLists] = useState([]);

  const addTodoList = async () => {
    try {
      const docRef = await addDoc(collection(db, "todolists"), {
        name: todoName,
        tasks: [] // Initialize tasks as an empty array
      });
      alert("Todo List created with ID: " + docRef.id);
      setTodoName("");
      fetchTodoLists();
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const fetchTodoLists = async () => {
    const q = query(collection(db, "todolists"));
    const querySnapshot = await getDocs(q);
    const lists = [];
    querySnapshot.forEach((doc) => {
      lists.push({ id: doc.id, ...doc.data() });
    });
    setTodoLists(lists);
  };

  useEffect(() => {
    fetchTodoLists();
  }, []);

  const handleDrop = async (e, todoListId) => {
    const taskId = e.dataTransfer.getData("taskId");
    const sourceListId = e.dataTransfer.getData("sourceListId");

    if (sourceListId === todoListId) {
      // Reordering within the same list is handled in Task.js
      return;
    }

    // Move task from sourceListId to todoListId
    const sourceList = todoLists.find(list => list.id === sourceListId);
    const targetList = todoLists.find(list => list.id === todoListId);
    const movedTask = sourceList.tasks.find(task => task.id === taskId);
    sourceList.tasks = sourceList.tasks.filter(task => task.id !== taskId);
    targetList.tasks.push(movedTask);

    // Update tasks in Firestore
    await updateDoc(doc(db, "todolists", sourceListId), { tasks: sourceList.tasks });
    await updateDoc(doc(db, "todolists", todoListId), { tasks: targetList.tasks });

    // Update local state
    setTodoLists([...todoLists]);
  };

  return (
    <div className='todo-list'>
      <h1>Todo Lists</h1>
      <input
        type="text"
        placeholder="Enter todo list name"
        value={todoName}
        onChange={(e) => setTodoName(e.target.value)}
      /><br/>
      <button onClick={addTodoList}>Create Todo List</button>
      <div className='todo-list-container'>
        {todoLists.map((list) => (
          <div
            className='task-container'
            key={list.id}
            onDrop={(e) => handleDrop(e, list.id)}
            onDragOver={(e) => e.preventDefault()}
          >
            <h2>{list.name}</h2>
            <Task todoListId={list.id} tasks={list.tasks || []} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoList;
