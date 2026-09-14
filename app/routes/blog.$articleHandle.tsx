import {useLoaderData} from 'react-router';
import type {Route} from './+types/blog.$articleHandle';
import blogStyles from '~/styles/blog.css?url';
import {SHOP} from '~/config/shop';
import {loadArticle} from '~/lib/blog';
import {ArticlePage} from '~/components/blog/ArticlePage';
import {loadMoreArticles} from '~/components/blog/moreArticles';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${SHOP.name} | ${data?.article.title ?? 'Article'}`}];
};

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: blogStyles}];

export async function loader(args: Route.LoaderArgs) {
  const [{article}, more] = await Promise.all([
    loadArticle(args, SHOP.handles.blog, args.params.articleHandle),
    loadMoreArticles(args, SHOP.handles.blog, args.params.articleHandle),
  ]);
  return {article, more};
}

export default function BlogArticlePage() {
  const {article, more} = useLoaderData<typeof loader>();
  return <ArticlePage article={article} blogHandle={SHOP.handles.blog} more={more} />;
}
