import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

interface MultipleSelectorProps {
  defaultOptions?: Option[];
  value?: Option[];
  onChange?: (options: Option[]) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const MultipleSelector: React.FC<MultipleSelectorProps> = ({
  defaultOptions = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  className = "",
  onSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term and exclude already selected
  const filteredOptions = onSearch
    ? defaultOptions.filter(
        (option) => !value.find((selected) => selected.value === option.value)
      )
    : defaultOptions.filter(
        (option) =>
          !value.find((selected) => selected.value === option.value) &&
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    const newValue = [...value, option];
    onChange?.(newValue);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleRemove = (optionToRemove: Option) => {
    const newValue = value.filter(
      (option) => option.value !== optionToRemove.value
    );
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && searchTerm === "" && value.length > 0) {
      handleRemove(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main Input Container */}
      <div
        className="min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {/* Selected Options as Badges */}
          {value.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              const newTerm = e.target.value;
              setSearchTerm(newTerm);
              onSearch?.(newTerm); // trigger parent API update
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-0 outline-none bg-transparent"
          />

          {/* Dropdown Arrow */}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {searchTerm ? "No options found" : "No more options available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultipleSelector;
