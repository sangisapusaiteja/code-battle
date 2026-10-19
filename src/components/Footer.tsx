export default function Footer() {
  return (
    <footer className="border-t border-emerald-500/10">
      <div className="flex w-full flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-neutral-500 sm:flex-row sm:px-6 lg:px-10 xl:px-14">
        <p>
          Code Battle —{" "}
          <span className="font-medium text-emerald-400">
            Built for developers, by developers.
          </span>
        </p>
        <p className="text-xs text-neutral-600">
          One account across Code Battle &amp; Interview Handbook
        </p>
      </div>
    </footer>
  );
}
