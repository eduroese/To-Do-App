"use client";
import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

interface Task {
  _id: string;
  title: string;
  completed: number;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  color: string;
  user: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesOpenTaskId, setCategoriesOpenTaskId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user");
    if (storedUserId) {
      setUserId(storedUserId);
      fetchTasksAndCategories(storedUserId);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchTasksAndCategories = async (userId: string) => {
    try {
      const response = await fetch(`/api/tasks/[id]?user=${userId}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar tarefas: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data.tasks);
      setCategories(data.categories);
    } catch (error) {
      console.error("Erro ao processar resposta JSON:", error);
    }
  };

  const addTask = async () => {
    if (!input.trim()) return;

    const newTask = {
      title: input,
      completed: 0,
      user: userId,
      category: "",
      type: "Task",
    };

    try {
      const response = await fetch("/api/tasks/[id]", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error(`Erro ao adicionar tarefa: ${response.status}`);
      }

      fetchTasksAndCategories(userId!);
      setInput("");
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const toggleCompleteAndAssignCategory = async (
    id: string,
    completed: number,
    category: string,
    categoryTask: string
  ) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed:
            completed === 0 && (category === "" || category === categoryTask)
              ? 1
              : 0,
          type: "Task",
          category: category,
        }),
      });

      fetchTasksAndCategories(userId!);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "Task" }),
      });

      fetchTasksAndCategories(userId!);
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleCategories = () => {
    window.location.href = "/categories";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl min-h-[70vh] bg-white p-6 rounded-lg shadow-md flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">To-Do App By Eduardo Roese</h1>
          <div className="relative">
            <FaUserCircle
              size={32}
              className="cursor-pointer text-blue-500 hover:text-blue-600"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            />
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={handleCategories}
                >
                  Categories
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex mb-4">
          <input
            type="text"
            className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        <div className="flex-grow overflow-visible border rounded-lg p-4 max-h-[50vh]">
          <ol>
            {tasks.map((task) => (
              <li
                key={task._id}
                className="flex justify-between items-center py-2 border-b border-gray-300 relative"
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      setCategoriesOpenTaskId(
                        categoriesOpenTaskId === task._id ? null : task._id
                      )
                    }
                    className={`p-1 rounded-full bg-gray-200 text-gray-700 relative group`}
                  >
                    +
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20">
                      Manage categories.
                    </span>
                  </button>

                  {categoriesOpenTaskId === task._id && (
                    <div className="absolute right-full mr-4 top-0 w-64 bg-white shadow-md p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">Categories</h3>{" "}
                        <a href="/categories">+</a>
                      </div>
                      <ul>
                        {categories.map((category) => (
                          <li
                            key={category._id}
                            className="flex justify-between items-center py-2 border-b border-gray-300 relative"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{category.name}</span>
                              <span
                                className="p-1 rounded group"
                                style={{
                                  backgroundColor: category.color,
                                  width: "20px",
                                  height: "20px",
                                }}
                              ></span>
                            </div>
                            <button
                              onClick={() =>
                                toggleCompleteAndAssignCategory(
                                  task._id,
                                  task.completed,
                                  category.name,
                                  ""
                                )
                              }
                              className={`relative p-1 rounded ${
                                task.category === category.name
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-indigo-700 text-white"
                              } group text-xs`}
                            >
                              Assign Category
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <span className={`${task.completed ? "text-gray-500" : ""}`}>
                    {task.title}
                  </span>
                  {task.category && (
                    <button
                      className="p-1 rounded relative group"
                      style={{
                        backgroundColor: categories.find(
                          (c) => c.name === task.category
                        )?.color,
                        width: "20px",
                        height: "20px",
                      }}
                    >
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20">
                        Category assigned: {task.category}
                      </span>
                    </button>
                  )}
                </div>

                <div className="relative flex items-center space-x-2">
                  <button
                    onClick={() =>
                      toggleCompleteAndAssignCategory(
                        task._id,
                        task.completed,
                        categories.find((c) => c.name === task.category)
                          ?.name || "",
                        task.category
                      )
                    }
                    className={`relative p-1 rounded ${
                      task.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    } group`}
                  >
                    ✓
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20">
                      Done?
                    </span>
                  </button>

                  {task.completed === 1 && (
                    <button
                      onClick={() => deleteTask(task._id)}
                      className={`relative p-1 rounded-full group`}
                    >
                      🗑️
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-20">
                        Delete Task.
                      </span>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
