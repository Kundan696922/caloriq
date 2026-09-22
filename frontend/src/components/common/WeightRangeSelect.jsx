import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function WeightRangeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: "7", label: "7 days" },
    { value: "30", label: "1 month" },
    { value: "150", label: "5 months" },
    { value: "365", label: "1 year" },
  ];

  const selected =
    options.find((option) => option.value === value) || options[1];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-32">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm text-text-primary transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        <span>{selected.label}</span>

        <FiChevronDown
          size={16}
          className={`text-text-secondary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                option.value === value
                  ? "bg-accent/10 text-accent"
                  : "text-text-primary hover:bg-black/20"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
