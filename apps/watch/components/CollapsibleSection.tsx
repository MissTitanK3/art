"use client";

import React, { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<Props> = ({ title, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-2 hover:bg-gray-600 font-semibold"
      >
        {open ? "−" : "+"} {title}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};
