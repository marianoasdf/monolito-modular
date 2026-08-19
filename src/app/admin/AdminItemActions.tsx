"use client";

import React, { useEffect, useRef, useState } from "react";

type MoveOption = {
  id: string;
  name: string;
};

type FormAction = (formData: FormData) => void | Promise<void>;

export function AdminItemActions({
  itemLabel,
  itemName,
  deleteAction,
  deleteMessage,
  deleteBlockedReason,
  deleteWarning,
  move,
}: {
  itemLabel: string;
  itemName: string;
  deleteAction: FormAction;
  deleteMessage: string;
  deleteBlockedReason?: string;
  deleteWarning?: string;
  move?: {
    fieldName: string;
    currentId: string;
    options: MoveOption[];
    action: FormAction;
  };
}): React.JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [targetId, setTargetId] = useState(move?.currentId ?? "");
  const menuRef = useRef<HTMLDivElement>(null);
  const moveDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isMenuOpen]);

  function openDialog(dialog: HTMLDialogElement | null): void {
    setIsMenuOpen(false);
    dialog?.showModal();
  }

  return (
    <div className="admin-actions-menu" ref={menuRef}>
      <button
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label="Más opciones"
        className="admin-actions-menu-trigger"
        onClick={() => setIsMenuOpen((open) => !open)}
        type="button"
      >
        ⋯
      </button>

      {isMenuOpen ? (
        <div className="admin-actions-menu-panel" role="menu">
          {move ? (
            <button
              className="admin-actions-menu-item"
              onClick={() => openDialog(moveDialogRef.current)}
              role="menuitem"
              type="button"
            >
              Mover a categoría
            </button>
          ) : null}
          <button
            className="admin-actions-menu-item admin-actions-menu-item--danger"
            onClick={() => openDialog(deleteDialogRef.current)}
            role="menuitem"
            type="button"
          >
            Eliminar {itemLabel}
          </button>
        </div>
      ) : null}

      {move ? (
        <dialog className="admin-dialog" ref={moveDialogRef}>
          <div className="admin-dialog-body">
            <h3>Mover producto</h3>
            <p className="admin-dialog-text">{`“${itemName}” pasa a la categoría que elijas. Mantiene precio y stock.`}</p>
            <label className="booking-field">
              <span>Categoría</span>
              <select
                name={move.fieldName}
                onChange={(event) => setTargetId(event.target.value)}
                value={targetId}
              >
                {move.options.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </label>
            <div className="admin-dialog-actions">
              <button className="admin-dialog-cancel" onClick={() => moveDialogRef.current?.close()} type="button">
                Cancelar
              </button>

              <button
                className="button"
                disabled={targetId === move.currentId}
                formAction={move.action}
                type="submit"
              >
                Mover
              </button>
            </div>
          </div>
        </dialog>
      ) : null}

      <dialog className="admin-dialog" ref={deleteDialogRef}>
        <div className="admin-dialog-body">
          <h3>{`Eliminar “${itemName}”`}</h3>
          <p className="admin-dialog-text">
            {deleteBlockedReason ?? deleteMessage}
            {!deleteBlockedReason && deleteWarning ? <strong>{` ${deleteWarning}`}</strong> : null}
          </p>
          <div className="admin-dialog-actions">
            <button
              autoFocus
              className="admin-dialog-cancel admin-dialog-cancel--default"
              onClick={() => deleteDialogRef.current?.close()}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="admin-dialog-confirm"
              disabled={Boolean(deleteBlockedReason)}
              formAction={deleteAction}
              type="submit"
            >
              Eliminar
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
