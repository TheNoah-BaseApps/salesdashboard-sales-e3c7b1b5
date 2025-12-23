/**
 * @swagger
 * /api/login-signup/{id}:
 *   get:
 *     summary: Get login/signup event by ID
 *     tags: [Login Signup]
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
 *         description: Login/signup event retrieved
 *   put:
 *     summary: Update login/signup event
 *     tags: [Login Signup]
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
 *         description: Login/signup event updated
 *   delete:
 *     summary: Delete login/signup event
 *     tags: [Login Signup]
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
 *         description: Login/signup event deleted
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth, requireRole } from '@/lib/auth';
import { validateLoginSignup } from '@/lib/validation';

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
      .from('login_signup')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Login/signup event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/login-signup/[id]:', error);
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
    const validation = validateLoginSignup(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('login_signup')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating login/signup event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update login/signup event' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Login/signup event updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/login-signup/[id]:', error);
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
      .from('login_signup')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting login/signup event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete login/signup event' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Login/signup event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/login-signup/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}