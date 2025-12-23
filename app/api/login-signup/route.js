/**
 * @swagger
 * /api/login-signup:
 *   get:
 *     summary: Get all login/signup events
 *     tags: [Login Signup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Login/signup events retrieved
 *   post:
 *     summary: Create login/signup event
 *     tags: [Login Signup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Login/signup event created
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { validateLoginSignup } from '@/lib/validation';

export async function GET(request) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const location = searchParams.get('location');

    let query = supabase
      .from('login_signup')
      .select('*')
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching login/signup events:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch login/signup events' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/login-signup:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

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
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating login/signup event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create login/signup event' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Login/signup event created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/login-signup:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}