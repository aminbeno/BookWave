import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const book = await Book.findOne({ _id: params.id, user_id: user.userId });
    if (!book) return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
    return NextResponse.json({ ...book.toObject(), id: book._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const body = await req.json();
    const book = await Book.findOneAndUpdate(
      { _id: params.id, user_id: user.userId },
      body,
      { new: true, runValidators: true }
    );
    if (!book) return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
    return NextResponse.json({ ...book.toObject(), id: book._id.toString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const book = await Book.findOneAndDelete({ _id: params.id, user_id: user.userId });
    if (!book) return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
