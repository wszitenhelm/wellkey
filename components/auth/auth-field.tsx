import { Input } from "@/components/ui/input";

type AuthFieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  label: string;
  name: string;
  placeholder: string;
  type?: "password" | "text";
};

export function AuthField({
  autoCapitalize,
  label,
  name,
  placeholder,
  type = "text"
}: AuthFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <Input
        autoCapitalize={autoCapitalize}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}
