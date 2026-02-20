export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <main className="flex-grow pt-20">
        {children}
      </main>
    </div>
  );
}