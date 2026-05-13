// Triggered by Sanity GROQ-powered webhook on article create/update
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<{
      _type: string;
      slug?: string;
    }>(req, process.env.SANITY_WEBHOOK_SECRET);

    if (!isValidSignature) {
      return new Response("Invalid Signature", { status: 401 });
    }

    if (!body?._type) {
      return new Response("Bad Request", { status: 400 });
    }

    const slug = body.slug;

    if (slug) {
      revalidatePath(`/news/${slug}`);
      revalidatePath(`/articles/${slug}`);
    }

    revalidatePath("/");
    revalidatePath("/news");
    revalidatePath("/articles");

    return NextResponse.json({ revalidated: true, slug });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
