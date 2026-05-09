export default function NotFound() {
  return (
    <div className="antialiased h-[calc(100dvh-8rem)] overflow-hidden flex flex-row items-center justify-center text-center gap-4 select-none">
      <h3 className="font-semibold text-2xl">404</h3>
      <div className="border border-border h-10" />
      <span className="text-xl">Not Found</span>
    </div>
  );
}
