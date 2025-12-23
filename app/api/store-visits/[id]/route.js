/**
 * @swagger
 * /api/store-visits/{id}:
 *   get:
 *     summary: Get store visit by ID
 *     tags: [Store Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store visit retrieved
 *   put:
 *     summary: Update store visit
 *     tags: [Store Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store visit updated
 *   delete:
 *     summary: Delete store visit
 *     tags: [Store Visits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store visit deleted
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, requireRole } from '@/lib/auth';
import { validateStoreVisit } from '@/lib/validation';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('store_visits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Store visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/store-visits/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = validateStoreVisit(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('store_visits')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating store visit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update store visit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Store visit updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/store-visits/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const roleCheck = await requireRole(['admin']);
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.error },
        { status: 403 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from('store_visits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting store visit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete store visit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Store visit deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/store-visits/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}