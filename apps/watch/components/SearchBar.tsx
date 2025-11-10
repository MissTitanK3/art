"use client";

import React from "react";

interface Props {
  query: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<Props> = ({ query, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search resources..."
      value={query}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 mb-4 border rounded"
    />
  );
};
