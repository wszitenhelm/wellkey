type Props = {
  body: string;
  title: string;
};

export function ManagerEmptyState({ body, title }: Props) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-white/50 p-5">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
