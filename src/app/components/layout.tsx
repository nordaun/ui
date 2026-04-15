export default function ComponentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full items-center justify-center p-10">
      <div className="max-w-4xl w-full">{children}</div>
    </div>
  );
}
