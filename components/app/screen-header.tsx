type ScreenHeaderProps = {
  title: string;
  description: string;
};

export function ScreenHeader({ title, description }: ScreenHeaderProps) {
  return (
    <header className="space-y-3">
      <h1 className="font-[family-name:var(--font-heading)] text-4xl leading-none">
        {title}
      </h1>
      <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>
    </header>
  );
}
