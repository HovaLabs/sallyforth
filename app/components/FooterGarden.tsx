export function FooterGarden() {
  return (
    <>
    <div className="sf-footer-garden" aria-hidden="true">
      <div className="sf-footer-garden__art">
        <img className="sf-footer-garden__landscape" src="/art/footer-garden.webp" alt="" width={1920} height={1280} loading="lazy" />
        {['near', 'distant'].map((depth) => (
          <div key={depth} className={`sf-footer-garden__clouds sf-footer-garden__clouds--${depth}`}>
            <div className="sf-footer-garden__cloud-tile" />
            <div className="sf-footer-garden__cloud-tile" />
          </div>
        ))}
        <img className="sf-footer-garden__oak" src="/art/footer-oak.webp" width={460} height={280} alt="" loading="lazy" />
        {/* Phones: the branch stays in the landscape, where the art's fade-in mask softens its top. */}
        <img className="sf-footer-garden__branch sf-footer-garden__branch--inset" src="/art/footer-branch.webp" width={488} height={328} alt="" loading="lazy" />
      </div>
    </div>
    {/* Wider screens: the branch hangs from the footer's top edge, reaching up into the
        wave divider and trimmed by the wave's own curve, so the art's flat top edge is never seen.
        Lives outside .sf-footer-garden because that clips everything above the footer. */}
    <div className="sf-footer-canopy" aria-hidden="true">
      <img className="sf-footer-garden__branch" src="/art/footer-branch.webp" width={488} height={328} alt="" loading="lazy" />
    </div>
    </>
  );
}
