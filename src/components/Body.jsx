// Body.jsx - wrapper that gives every page the same width and spacing
export default function Body({ title, subtitle, children }) {
  return (
    <section className="body-wrap">
      {title && (
        <div className="page-head">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
