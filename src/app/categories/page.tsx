"use client";
import { ChromePicker } from "react-color";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

interface Category {
  _id: string;
  name: string;
  color: string;
  user: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>("#ffffff");
  const [userId, setUserId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [categoriesOpenEditColorId, setCategoriesOpenEditColorId] = useState<
    string | null
  >(null);
  const [temporaryColor, setTemporaryColor] = useState<string>("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("user");
    if (storedUserId) {
      setUserId(storedUserId);
      fetchCategories(storedUserId);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchCategories = async (userId: string) => {
    try {
      const response = await fetch(`/api/tasks/[id]?user=${userId}`);
      if (!response.ok) throw new Error("Erro ao buscar categorias");
      const data = await response.json();

      const finalCategory = data.categories;
      setCategories(finalCategory);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const addCategory = async () => {
    if (newCategoryName.trim() === "") return;
    const newCategory = {
      name: newCategoryName,
      color: newCategoryColor,
      user: userId,
      type: "Category",
    };
    try {
      const response = await fetch("/api/tasks/[id]", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        fetchCategories(userId!);
        setNewCategoryName("");
        setNewCategoryColor("#ffffff");
      }
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
    }
  };

  const editCategory = async (
    id: string,
    updatedName: string,
    updatedColor: string
  ) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedName,
          color: updatedColor,
          type: "Category",
        }),
      });
      if (response.ok) fetchCategories(userId!);
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "Category" }),
      });
      fetchCategories(userId!);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    }
  };

  const getContrastColor = (hexColor: string) => {
    const rgb = parseInt(hexColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#000000" : "#ffffff";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-4xl min-h-[70vh] bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold">Categories</h1>
          <button
            onClick={() => (window.location.href = "/")}
            className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>

        <div className="flex mb-6 space-x-4">
          <input
            type="text"
            className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category..."
          />
          <div className="relative">
            <button
              className="p-3 border rounded-lg"
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                backgroundColor: newCategoryColor,
                color: getContrastColor(newCategoryColor),
              }}
            >
              Color
            </button>
            {showColorPicker && (
              <div className="absolute z-10 color-picker-container">
                <ChromePicker
                  color={newCategoryColor}
                  onChange={(color) => setNewCategoryColor(color.hex)}
                />
              </div>
            )}
          </div>
          <button
            onClick={addCategory}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        <ul className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <li
              key={category._id}
              className="p-4 border rounded-lg shadow-sm flex justify-between items-center relative"
            >
              <div className="flex items-center space-x-4">
                <button
                  className="w-6 h-6 inline-block rounded-full"
                  onClick={() => {
                    setCategoriesOpenEditColorId(
                      categoriesOpenEditColorId === category._id
                        ? null
                        : category._id
                    );
                    setTemporaryColor("");
                  }}
                  style={{ backgroundColor: category.color }}
                ></button>
                {categoriesOpenEditColorId === category._id && (
                  <div
                    className="absolute z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-lg"
                    style={{ right: "100%", marginRight: "10px" }}
                  >
                    <ChromePicker
                      color={temporaryColor || category.color}
                      onChange={(color) => setTemporaryColor(color.hex)}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => {
                          editCategory(
                            category._id,
                            category.name,
                            temporaryColor
                          );
                          setCategoriesOpenEditColorId(null);
                          setTemporaryColor("");
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) =>
                    editCategory(category._id, e.target.value, category.color)
                  }
                  className="p-2 border rounded focus:outline-none"
                />
              </div>
              <button
                onClick={() => deleteCategory(category._id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
