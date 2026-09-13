/** The landing page's triple green border, wrapping the whole site. */
export function Frame({children}: {children: React.ReactNode}) {
  return (
    <div className="sf-frame">
      <div className="sf-frame__outer">
        <div className="sf-frame__inner">{children}</div>
      </div>
    </div>
  );
}
