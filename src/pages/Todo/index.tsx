import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckSquare,
  Plus,
  Star,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useTodos } from "../../hooks/useTodos";
import type { TodoFilter } from "../../types/todo";
import LoadingWrapper from "../../components/LoadingWrapper";
import Pagination from "../../components/Pagination";

const ITEMS_PER_PAGE = 10;

export default function Todo() {
  const { t } = useTranslation("todo");
  const {
    todos,
    isLoading,
    error,
    addTodo: apiAddTodo,
    updateTodo: apiUpdateTodo,
    deleteTodo: apiDeleteTodo,
    isAddingTodo,
  } = useTodos();
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Add a new todo
  const handleAddTodo = async () => {
    if (newTodoText.trim() && !isAddingTodo) {
      try {
        await apiAddTodo({
          text: newTodoText.trim(),
          completed: false,
          starred: false,
          createdAt: new Date().toISOString(),
        });
        setNewTodoText("");
      } catch (err) {
        // Error is already handled in the hook
        console.error("Failed to add todo:", err);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  // Toggle todo completion
  const toggleComplete = async (id: string | number) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      try {
        await apiUpdateTodo(id, { completed: !todo.completed });
      } catch (err) {
        // Error is already handled in the hook
        console.error("Failed to toggle complete:", err);
      }
    }
  };

  // Toggle todo starred
  const toggleStar = async (id: string | number) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      try {
        await apiUpdateTodo(id, { starred: !todo.starred });
      } catch (err) {
        // Error is already handled in the hook
        console.error("Failed to toggle star:", err);
      }
    }
  };

  // Delete todo
  const deleteTodo = async (id: string | number) => {
    try {
      await apiDeleteTodo(id);
    } catch (err) {
      // Error is already handled in the hook
      console.error("Failed to delete todo:", err);
    }
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Filter todos based on selected filter
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      case "starred":
        return todos.filter((todo) => todo.starred);
      default:
        return todos;
    }
  }, [todos, filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTodos = filteredTodos.slice(startIndex, endIndex);
  const showPagination = filteredTodos.length > ITEMS_PER_PAGE;

  // Handle page change (convert from 0-indexed to 1-indexed)
  const handlePageChange = (page: number) => {
    setCurrentPage(page + 1);
  };

  // Calculate stats
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.filter((todo) => !todo.completed).length;

  return (
    <LoadingWrapper isLoading={isLoading} loadingText={t("loading")}>
      <div className="p-6 ">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {activeCount} {t("activeTasks")} · {completedCount}{" "}
              {t("completedTasks")}
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Add Todo Input */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t("addPlaceholder")}
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button
              onClick={handleAddTodo}
              disabled={!newTodoText.trim() || isAddingTodo}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isAddingTodo ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {t("addButton")}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            {(["all", "active", "completed", "starred"] as TodoFilter[]).map(
              (filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterOption
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {t(`filters.${filterOption}`)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {filteredTodos.length === 0 ? (
            <div className="p-12 text-center">
              <CheckSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 opacity-30" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {todos.length === 0 ? t("emptyState") : t("emptyFilteredState")}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Complete Checkbox */}
                      <button
                        onClick={() => toggleComplete(todo.id)}
                        className={`shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center
                                 transition-all ${
                                   todo.completed
                                     ? "bg-primary-600 border-primary-600"
                                     : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400"
                                 }`}
                        aria-label={
                          todo.completed
                            ? t("actions.incomplete")
                            : t("actions.complete")
                        }
                      >
                        {todo.completed && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>

                      {/* Todo Text */}
                      <span
                        className={`flex-1 text-gray-900 dark:text-gray-100 ${
                          todo.completed
                            ? "line-through text-gray-400 dark:text-gray-600"
                            : ""
                        }`}
                      >
                        {todo.text}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Star Button */}
                        <button
                          onClick={() => toggleStar(todo.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            todo.starred
                              ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              : "text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          aria-label={
                            todo.starred
                              ? t("actions.unstar")
                              : t("actions.star")
                          }
                        >
                          <Star
                            className={`w-5 h-5 ${
                              todo.starred ? "fill-current" : ""
                            }`}
                          />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label={t("actions.delete")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {showPagination && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={currentPage - 1}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    pageSize={ITEMS_PER_PAGE}
                    totalItems={filteredTodos.length}
                    showInfo={true}
                    pageRangeDisplayed={3}
                    marginPagesDisplayed={1}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </LoadingWrapper>
  );
}
