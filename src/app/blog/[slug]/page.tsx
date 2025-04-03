import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { notFound } from "next/navigation";

type BlogProps = { params: { slug?: string } }; // Make slug optional to prevent errors

async function getBlogPost(slug: string | undefined) {
  if (!slug) return null; // Ensure slug exists before proceeding

  const filePath = path.join(process.cwd(), "posts", `${slug}.md`);

  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    return { frontMatter: data, content };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null; // Return null if file not found
  }
}

export default async function BlogPost({ params }: BlogProps) {
  const awaitParams = await params;
  const post = await getBlogPost(awaitParams.slug);

  if (!post) return notFound();

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{post.frontMatter.title}</h1>
      <p className="text-gray-500">{post.frontMatter.date}</p>
      <article className="mt-6">{post.content}</article>
    </main>
  );
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "posts");
  const files = await fs.readdir(postsDirectory);

  return files.map((file) => ({ slug: file.replace(".md", "") }));
}
