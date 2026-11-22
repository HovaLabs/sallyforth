export function FooterGarden() {
  return (
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
        <img className="sf-footer-garden__branch" src="/art/footer-branch.webp" width={488} height={328} alt="" loading="lazy" />
      </div>
    </div>
  );
}
