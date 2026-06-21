import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

export function ConfirmationModal({ config }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (config && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [config]);

  if (!config) return null;

  const { type, title, message, isDestructive, confirmText, cancelText, resolve } = config;

  const getIcon = () => {
    if (isDestructive) {
      return (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-danger border border-red-100 shadow-sm animate-pulse">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
      );
    }
    if (type === "confirm") {
      return (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-[#c4622d] border border-amber-100 shadow-sm">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-success border border-emerald-100 shadow-sm">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dk/50 backdrop-blur-md transition-opacity duration-300 ease-out animate-fade-in" 
      onClick={() => resolve(false)}
    >
      <div 
        className="relative transform overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl border border-bd/30 transition-all sm:my-8 sm:w-full sm:max-w-md animate-fadeUp select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          {getIcon()}
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold leading-6 text-dk font-serif">
              {title}
            </h3>
            <div className="mt-3">
              <p className="text-sm text-gray-500 font-semibold leading-relaxed whitespace-pre-line px-2">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:grid sm:grid-flow-row-dense sm:grid-cols-2 gap-3 justify-center">
          {type === "confirm" && (
            <button
              type="button"
              className="mt-3 sm:mt-0 inline-flex w-full justify-center rounded-xl bg-warm px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm border border-bd/50 hover:bg-cream/40 transition-colors cursor-pointer"
              onClick={() => resolve(false)}
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            ref={confirmRef}
            className={`inline-flex w-full justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
              isDestructive 
                ? "bg-danger hover:bg-red-750 hover:shadow-lg" 
                : "bg-tc hover:bg-tcl hover:shadow-lg"
            } ${type === "alert" ? "sm:col-span-2" : ""}`}
            onClick={() => resolve(true)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
