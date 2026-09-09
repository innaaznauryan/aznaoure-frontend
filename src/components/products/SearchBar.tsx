import { Search as SearchIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative max-w-xl mx-auto">
      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("collections.search")}
        className="w-full pl-11 pr-10 py-3 bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label={t("collections.clear")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};