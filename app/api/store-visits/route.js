/**
 * @swagger
 * /api/store-visits:
 *   get:
 *     summary: Get all store visits
 *     tags: [Store Visits]
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
 *         description: Store visits retrieved
 *   post:
 *     summary: Create store visit
 *     tags: [Store Visits]
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
 *         description: Store visit created
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { validateStoreVisit } from '@/lib/validation';

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
      .from('store_visits')
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
      console.error('Error fetching store visits:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch store visits' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/store-visits:', error);
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
    const validation = validateStoreVisit(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('store_visits')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating store visit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create store visit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Store visit created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/store-visits:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}