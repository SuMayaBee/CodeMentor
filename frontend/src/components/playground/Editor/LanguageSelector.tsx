import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/lib/constants/language";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ value, onChange }: { value: string, onChange: (value: string) => void }) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] border-gray-700 hover:bg-[#3d3d3d] transition-colors">
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent className="bg-[#2d2d2d] border-gray-700">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem 
              key={lang.id} 
              value={lang.id}
              className="text-gray-200 hover:bg-[#3d3d3d] cursor-pointer"
            >
              {lang.name} {lang.icon}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }