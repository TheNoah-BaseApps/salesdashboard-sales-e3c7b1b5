/**
 * @swagger
 * /api/export/{workflow}:
 *   get:
 *     summary: Export workflow data as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workflow
 *         required: true
 *         schema:
 *           type: string
 *           enum: [website-visits, store-visits, login-signup]
 *     responses:
 *       200:
 *         description: CSV file
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await requireAuth();
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 }
      );
    }

    const { workflow } = await params;

    let tableName;
    switch (workflow) {
      case 'website-visits':
        tableName = 'website_visits';
        break;
      case 'store-visits':
        tableName = 'store_visits';
        break;
      case 'login-signup':
        tableName = 'login_signup';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid workflow' },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${workflow} data:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch data' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data to export' },
        { status: 404 }
      );
    }

    // Generate CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          const stringValue = value?.toString() || '';
          // Escape commas and quotes
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${workflow}-export-${new Date().toISOString()}.csv"`
      }
    });
  } catch (error) {
    console.error('Error in GET /api/export/[workflow]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}