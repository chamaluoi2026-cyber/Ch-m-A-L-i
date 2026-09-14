export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-ink/65">{description}</p> : null}
    </header>
  );
}
