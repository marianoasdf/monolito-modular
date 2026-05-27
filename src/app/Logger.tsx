"use client";

import { useState, useEffect } from "react";

export function Logger(): React.JSX.Element | null {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: string, ...args: unknown[]) => {
      const message = args.map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(" ");
      
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev, `[${timestamp}] [${type}] ${message}`]);
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog("LOG", ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog("ERROR", ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog("WARN", ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (logs.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "200px",
        background: "#1a1a1a",
        color: "#00ff00",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "10px",
        overflowY: "auto",
        zIndex: 99999,
        borderTop: "2px solid #333",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "bold", color: "#fff" }}>
        Client Logs ({logs.length})
      </div>
      {logs.map((log, index) => (
        <div key={index} style={{ marginBottom: "4px", wordBreak: "break-word" }}>
          {log}
        </div>
      ))}
    </div>
  );
}
