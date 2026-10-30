// Body.jsx - gives every page the same title card and spacing
export default function Body({ title, subtitle, children }) {
  return (
    <section className="flex flex-col gap-4">
      {title && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body py-3">
            <h1 className="card-title text-2xl">{title}</h1>
            {subtitle && <p className="opacity-70">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}