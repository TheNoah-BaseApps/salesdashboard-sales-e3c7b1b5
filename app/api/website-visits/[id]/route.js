/**
 * @swagger
 * /api/website-visits/{id}:
 *   get:
 *     summary: Get website visit by ID
 *     tags: [Website Visits]
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
 *         description: Website visit retrieved
 *   put:
 *     summary: Update website visit
 *     tags: [Website Visits]
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
 *         description: Website visit updated
 *   delete:
 *     summary: Delete website visit
 *     tags: [Website Visits]
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
 *         description: Website visit deleted
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, requireRole } from '@/lib/auth';
import { validateWebsiteVisit } from '@/lib/validation';

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
      .from('website_visits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Website visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/website-visits/[id]:', error);
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
    const validation = validateWebsiteVisit(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('website_visits')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating website visit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update website visit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Website visit updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/website-visits/[id]:', error);
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
      .from('website_visits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting website visit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete website visit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Website visit deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/website-visits/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}