export function AppHeader() {
  return (
    <>
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="" aria-hidden="true" className="h-10 w-10 rounded-xl" />
        <p className="text-sm font-medium text-nomad-brand">Nomad</p>
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-nomad-text">
        Work in focused stretches. Rest on time.
      </h1>
      <p className="mt-3 text-nomad-text-muted">
        Set how long you want to work and how long to rest, then press Start. Nomad will
        let you know when it's time to switch, even if this window is closed.
      </p>
    </>
  );
}
