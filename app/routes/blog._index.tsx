import {useLoaderData} from 'react-router';
import type {Route} from './+types/blog._index';
import blogStyles from '~/styles/blog.css?url';
import {SHOP} from '~/config/shop';
import {loadBlogArticles} from '~/lib/blog';
import {BlogIndex} from '~/components/blog/BlogIndex';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `${SHOP.name} | ${data?.blog.title ?? 'Blog'}`}];
};

export const links: Route.LinksFunction = () => [{rel: 'stylesheet', href: blogStyles}];

export async function loader(args: Route.LoaderArgs) {
  return loadBlogArticles(args, SHOP.handles.blog);
}

export default function BlogPage() {
  const {blog} = useLoaderData<typeof loader>();
  return <BlogIndex blog={blog} />;
}
