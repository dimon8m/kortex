import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  shortcut: string;
  icon: string;
  action: () => void;
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("Готов к работе");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Функция очистки RAM
  async function handleFreezeRam() {
    try {
      setStatusMessage("Оптимизация памяти...");
      const response = await invoke<string>("freeze_ram");
      setStatusMessage(response);
    } catch (error) {
      setStatusMessage("Ошибка при очистке RAM");
      console.error(error);
    }
  }

  // Список всех доступных команд (легко расширять)
  const actions: ActionItem[] = [
    {
      id: "ram",
      title: "Освободить RAM (RAM Freezer)",
      subtitle: "Заморозить фоновые процессы и разгрузить память",
      shortcut: "Alt + R",
      icon: "🧹",
      action: handleFreezeRam,
    },
    {
      id: "ocr",
      title: "Распознать текст с экрана (OCR)",
      subtitle: "Выделить область и скопировать текст в буфер",
      shortcut: "Alt + Shift + C",
      icon: "👁️",
      action: () => setStatusMessage("Модуль OCR в разработке..."),
    },
  ];

  // Фильтрация по поисковой строке
  const filteredActions = actions.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Управление с клавиатуры (стрелочки вверх/вниз и Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % Math.max(filteredActions.length, 1));
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(filteredActions.length, 1));
      } else if (e.key === "Enter" && filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredActions, selectedIndex]);

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 select-none">
      {/* Строка поиска */}
      <div className="flex items-center px-4 py-4 border-b border-neutral-800 bg-neutral-900/50">
        <span className="text-indigo-400 font-bold mr-3">⚡</span>
        <input
          type="text"
          className="w-full bg-transparent text-lg outline-none placeholder-neutral-500 text-neutral-100"
          placeholder="Искать приложения, файлы или запустить команду..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(0);
          }}
          autoFocus
        />
        <span className="text-xs px-2 py-1 bg-neutral-800 text-neutral-400 rounded">ESC</span>
      </div>

      {/* Список команд */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Быстрые действия
        </div>
        
        {filteredActions.length === 0 ? (
          <div className="text-center text-neutral-500 py-8 text-sm">Ничего не найдено</div>
        ) : (
          filteredActions.map((item, index) => (
            <div
              key={item.id}
              onClick={item.action}
              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                index === selectedIndex
                  ? "bg-indigo-600/20 border-indigo-500/50"
                  : "bg-neutral-900/60 border-transparent hover:bg-neutral-900"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">{item.icon}</span>
                <div>
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-neutral-400">{item.subtitle}</div>
                </div>
              </div>
              <span className="text-xs text-neutral-500 font-mono">{item.shortcut}</span>
            </div>
          ))
        )}
      </div>

      {/* Футер */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 text-xs text-neutral-500 flex justify-between items-center">
        <span>Kortex v0.1.0 (Rust + Tauri)</span>
        <span className="text-indigo-400 font-medium">{statusMessage}</span>
      </div>
    </div>
  );
}

export default App;