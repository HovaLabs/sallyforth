import {Link} from 'react-router';
import {ART} from '~/config/shop';
import {WaveDivider} from '~/components/WaveDivider';

export function AboutStory() {
  return (
    <section className="sf-about-story" aria-labelledby="about-patch">
      <WaveDivider variant="footer" fill="cream" />
      <img src={ART.tomato} alt="" className="sf-about-story__tomato" />
      <div className="sf-about-story__grid pad">
        <div className="sf-about-story__aside">
          <div className="sf-about-story__eyebrow">OUR PATCH</div>
          <div id="about-patch" className="sf-about-story__heading">
            Every day is a chance to grow.
          </div>
          <div className="sf-about-story__tag">
            <img src={ART.caterpillar} alt="" />
            <span>designs · almanac · stories</span>
          </div>
        </div>
        <div className="sf-about-story__prose">
          <p>
            <span className="sf-about-story__dropcap">A</span>t <em>SallyForth</em>, we believe every day is a
            chance to grow—like a garden stretching towards the sun. This is a place where designs sprout from
            the soil of imagination, and a family almanac of learning invites wonder to take hold like trailing
            sweet peas on a trellis. Inspired by vegetables, seasons, and the quiet miracles of the garden, we
            cultivate beauty, knowledge, and joy for all.
          </p>
          <p>
            Whether to dig into stories and discoveries that nourish the mind, you&rsquo;re in the right patch.
            Come wander through the rows, gather what delights you, and sow a little curiosity of your own.
          </p>
          <div className="sf-about-story__ctas">
            <Link to="/collections/all" className="sf-about-story__cta">WANDER THE ROWS</Link>
            <Link to="/blog" className="sf-about-story__alt">or start with the blog</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
