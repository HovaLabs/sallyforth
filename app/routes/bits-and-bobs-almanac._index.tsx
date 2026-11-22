import {useLoaderData} from 'react-router';
import type {Route} from './+types/bits-and-bobs-almanac._index';
import blogStyles from '~/styles/blog.css?url';
import {SHOP} from '~/config/shop';
import {loadBlogArticles, blogSeo} from '~/lib/blog';
import {pageMeta} from '~/lib/seo';
import {BlogIndex} from '~/components/blog/BlogIndex';

export const meta: Route.MetaFunction = (args) =>
  pageMeta(args, blogSeo(args.data?.blog, SHOP.handles.almanac));

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: blogStyles}];

export async function loader(args: Route.LoaderArgs) {
  return loadBlogArticles(args, SHOP.handles.almanac);
}

export default function AlmanacPage() {
  const {blog} = useLoaderData<typeof loader>();
  return <BlogIndex blog={blog} />;
}
