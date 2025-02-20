import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import React from 'react';
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter"; 
import remarkRehype from "remark-rehype";
import rehypeSlug from 'rehype-slug';
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import Onthispage from '@/components/Onthispage';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { rehypePrettyCode } from 'rehype-pretty-code';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import { Metadata } from 'next';

// **Step 1: Fix the Type Error**
// Ensure `params` is correctly typed by awaiting it properly
interface BlogPageProps {
  params: { slug: string };
}

// **Step 2: Fetch Markdown Content**
async function getMarkdownContent(slug: string) {
  const filePath = path.join(process.cwd(), "content", `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Markdown file for slug "${slug}" not found.`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(rehypeSlug)
    .use(rehypePrettyCode, {
      theme: "github-dark",
      transformers: [
        transformerCopyButton({
          visibility: 'always',
          feedbackDuration: 3000,
        }),
      ],
    })
    .use(rehypeAutolinkHeadings);

  const htmlContent = (await processor.process(content)).toString();

  return { data, htmlContent };
}

// **Step 3: Fix BlogPage Component**
export default async function BlogPage({ params }: Awaited<BlogPageProps>) {
  const { data, htmlContent } = await getMarkdownContent(params.slug);

  return (
    <MaxWidthWrapper className='prose dark:prose-invert'> 
      <div className='flex'> 
        <div className='px-16'> 
          <h1>{data.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }}></div> 
        </div>
        <Onthispage className="text-sm w-[50%]" htmlContent={htmlContent} />
      </div>
    </MaxWidthWrapper>
  );
}

// **Step 4: Fix Metadata Generation**
export async function generateMetadata(
  { params }: Awaited<BlogPageProps>
): Promise<Metadata> {
  const { data } = await getMarkdownContent(params.slug);

  return {
    title: `${data.title} - ProgrammingWithHarry`, 
    description: data.description || "A blog post on ProgrammingWithHarry."
  };
}
