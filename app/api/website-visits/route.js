/**
 * @swagger
 * /api/website-visits:
 *   get:
 *     summary: Get all website visits
 *     tags: [Website Visits]
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
 *         description: Website visits retrieved
 *   post:
 *     summary: Create website visit
 *     tags: [Website Visits]
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
 *         description: Website visit created
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { validateWebsiteVisit } from '@/lib/validation';

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
      .from('website_visits')
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
      console.error('Error fetching website visits:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch website visits' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/website-visits:', error);
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
    const validation = validateWebsiteVisit(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Check for duplicate IP + date combination
    const { data: existing } = await supabase
      .from('website_visits')
      .select('id, number_of_visits')
      .eq('ip', body.ip)
      .eq('date', body.date)
      .single();

    if (existing) {
      // Update existing record
      const { data: updated, error: updateError } = await supabase
        .from('website_visits')
        .update({
          number_of_visits: existing.number_of_visits + body.number_of_visits,
          page_visits: body.page_visits,
          website_duration: body.website_duration,
          time: body.time
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating website visit:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update website visit' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: updated, message: 'Website visit updated' },
        { status: 200 }
      );
    }

    // Create new record
    const { data, error } = await supabase
      .from('website_visits')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating website visit:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create website visit' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data, message: 'Website visit created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/website-visits:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}