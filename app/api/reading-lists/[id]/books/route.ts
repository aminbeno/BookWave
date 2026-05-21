import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ReadingListBook from '@/models/ReadingListBook';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const listBooks = await ReadingListBook.find({ list_id: params.id });
    return NextResponse.json(listBooks.map(lb => ({ ...lb.toObject(), id: lb._id.toString() })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const { book_id } = await req.json();
    const listBook = await ReadingListBook.create({ list_id: params.id, book_id });
    return NextResponse.json({ ...listBook.toObject(), id: listBook._id.toString() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const { book_id } = await req.json();
    await ReadingListBook.findOneAndDelete({ list_id: params.id, book_id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
