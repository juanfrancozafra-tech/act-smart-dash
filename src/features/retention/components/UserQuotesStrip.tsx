export function UserQuotesStrip({
  quotes,
}: {
  quotes: { quote: string; person: string; context: string }[];
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
        Voice of churned customers
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {quotes.map((q) => (
          <figure key={q.person} className="text-xs">
            <blockquote className="text-foreground/85 leading-relaxed">"{q.quote}"</blockquote>
            <figcaption className="mt-2 text-muted-foreground">
              — {q.person}, <span className="italic">{q.context}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
