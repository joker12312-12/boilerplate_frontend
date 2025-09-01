import { getAllPosts } from "@/lib/graph_queries/getPost";
import Archive from "./pageWrapper";


export default async function PostsList() {
  const posts = await getAllPosts();
  return (
    <Archive posts={posts} />
  )
}