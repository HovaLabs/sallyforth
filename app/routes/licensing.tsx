import type {Route} from './+types/licensing';
import {pageMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = (args) => pageMeta(args, {
  title: 'Licensing', description: 'Licensing information for SallyForth artwork is coming soon.', noindex: true,
});

export default function Licensing() {
  return (
    <section style={{background: 'var(--cream)', paddingBlock: 'clamp(80px, 10vw, 144px)', textAlign: 'center'}}>
      <div className="sf-wrap">
        <h1 className="sf-section-title">Licensing</h1>
        <p>Licensing details are coming soon.</p>
      </div>
    </section>
  );
}
