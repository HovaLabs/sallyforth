import {Link} from 'react-router';
import type {Route} from './+types/faq';
import {ART, BLOGS, SHOP} from '~/config/shop';
import {pageMeta} from '~/lib/seo';
import faqStyles from '~/styles/faq.css?url';

const questions = [
  {
    id: 'sallyforth',
    question: 'What is SallyForth?',
    answer: 'SallyForth grew out of a family vegetable patch. It shares garden-inspired artwork, crafts, and seasonal stories for families to enjoy together.',
    links: [{label: 'Read the letter from the garden', to: '/about'}],
  },
  {
    id: 'blog-and-almanac',
    question: 'What will I find in the Blog and the Almanac?',
    answer: 'The Blog shares stories, craft ideas, and notes from the SallyForth table. The Bits and Bobs Almanac follows the seasons, with small things worth knowing and ideas for what to plant next.',
    links: [
      {label: 'The Blog', to: BLOGS[SHOP.handles.blog].path},
      {label: 'Bits and Bobs Almanac', to: BLOGS[SHOP.handles.almanac].path},
    ],
  },
  {
    id: 'shop',
    question: 'What can I find in the shop?',
    answer: 'The SallyForth shop carries garden-inspired goods, including art prints, tea towels, and growing kits. A few examples are the Radish Patch Print, Tomato Tea Towel, and Sweet Pea Kit.',
    links: [{label: 'Browse the shop', to: '/collections/all'}],
  },
  {
    id: 'newsletter',
    question: 'How do I get the weekly letter?',
    answer: 'Sign up with your email under “Join the garden party” in the footer. Each weekly letter includes a craft, a garden note, and a story to tell at dinner.',
    links: [{label: 'Go to the signup form', to: '#footer-newsletter'}],
  },
];

export const meta: Route.MetaFunction = (args) => pageMeta(args, {
  title: 'Frequently asked questions',
  description: 'Find out how SallyForth began, what’s in the shop, what to read in the Bits and Bobs Almanac, and how to get the weekly letter.',
  pageType: 'FAQPage',
  questions,
});

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: faqStyles}];

export default function FrequentlyAskedQuestions() {
  return (
    <div className="sf-faq">
      <div className="sf-faq__inner">
        <header className="sf-faq__intro">
          <h1>Frequently asked questions</h1>
          <img src={ART.radishA} width={647} height={565} alt="" />
        </header>
        <div className="sf-faq__answers">
          {questions.map(({id, question, answer, links}) => (
            <section key={id} id={id} aria-labelledby={`question-${id}`}>
              <h2 id={`question-${id}`}>{question}</h2>
              <p>{answer}</p>
              <div className="sf-faq__links">
                {links.map(({label, to}) => <Link key={to} to={to}>{label}</Link>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
