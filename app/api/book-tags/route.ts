import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import BookTag from '@/models/BookTag';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('book_id');

    const query: any = { user_id: user.userId };
    if (bookId) query.book_id = bookId;

    const tags = await BookTag.find(query);
    return NextResponse.json(tags.map(t => ({ ...t.toObject(), id: t._id.toString() })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const body = await req.json();
    const tag = await BookTag.create({ ...body, user_id: user.userId });
    return NextResponse.json({ ...tag.toObject(), id: tag._id.toString() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
