import Link from "next/link";
import { FC } from "react";

const Blog: FC<any> = ({ post = {} }) => {
  return (
    <div>
      <Link href={"/"}>Home</Link>
      <h1>Blog {post.title}</h1>
      <h1>Blog {post.title}</h1>
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  const id = ctx.query.id;
  console.log("ctx.req.query", ctx.req.query);
  console.log("ctx.req.params", ctx.req.params);
  console.log(ctx.query);
  console.log(ctx.params);

  return { props: { post: { title: id } } };
};

export default Blog;
