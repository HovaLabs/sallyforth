/** Structural wrapper for the whole site (clips horizontal overflow so the
 *  sticky header keeps sticking; isolates a stacking context). */
export function Frame({children}: {children: React.ReactNode}) {
  return (
    <div className="sf-frame">
      <div className="sf-frame__outer">
        <div className="sf-frame__inner">{children}</div>
      </div>
    </div>
  );
}
