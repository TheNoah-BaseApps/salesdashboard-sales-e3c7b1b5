/**
 * @swagger
 * /api/analytics/funnel:
 *   get:
 *     summary: Get conversion funnel metrics
 *     tags: [Analytics]
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
 *     responses:
 *       200:
 *         description: Funnel metrics retrieved
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

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

    // Build date filter
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `date >= '${startDate}' AND date <= '${endDate}'`;
    } else if (startDate) {
      dateFilter = `date >= '${startDate}'`;
    } else if (endDate) {
      dateFilter = `date <= '${endDate}'`;
    }

    // Get website visits count
    let websiteQuery = supabase
      .from('website_visits')
      .select('id', { count: 'exact', head: true });
    
    if (dateFilter) {
      websiteQuery = websiteQuery.or(dateFilter);
    }

    const { count: websiteVisitsCount, error: websiteError } = await websiteQuery;

    if (websiteError) {
      console.error('Error fetching website visits count:', websiteError);
    }

    // Get store visits count
    let storeQuery = supabase
      .from('store_visits')
      .select('id', { count: 'exact', head: true });
    
    if (dateFilter) {
      storeQuery = storeQuery.or(dateFilter);
    }

    const { count: storeVisitsCount, error: storeError } = await storeQuery;

    if (storeError) {
      console.error('Error fetching store visits count:', storeError);
    }

    // Get login/signup count
    let loginQuery = supabase
      .from('login_signup')
      .select('id', { count: 'exact', head: true });
    
    if (dateFilter) {
      loginQuery = loginQuery.or(dateFilter);
    }

    const { count: signupsCount, error: signupError } = await loginQuery;

    if (signupError) {
      console.error('Error fetching signups count:', signupError);
    }

    // Calculate conversion rates
    const websiteToStore = websiteVisitsCount > 0 
      ? ((storeVisitsCount / websiteVisitsCount) * 100).toFixed(1)
      : 0;
    
    const storeToSignup = storeVisitsCount > 0
      ? ((signupsCount / storeVisitsCount) * 100).toFixed(1)
      : 0;
    
    const websiteToSignup = websiteVisitsCount > 0
      ? ((signupsCount / websiteVisitsCount) * 100).toFixed(1)
      : 0;

    const funnelData = {
      stages: [
        {
          name: 'Website Visits',
          count: websiteVisitsCount || 0,
          percentage: 100
        },
        {
          name: 'Store Visits',
          count: storeVisitsCount || 0,
          percentage: parseFloat(websiteToStore),
          conversionFromPrevious: parseFloat(websiteToStore)
        },
        {
          name: 'Signups',
          count: signupsCount || 0,
          percentage: parseFloat(websiteToSignup),
          conversionFromPrevious: parseFloat(storeToSignup)
        }
      ],
      overall: {
        totalWebsiteVisits: websiteVisitsCount || 0,
        totalStoreVisits: storeVisitsCount || 0,
        totalSignups: signupsCount || 0,
        overallConversionRate: parseFloat(websiteToSignup)
      }
    };

    return NextResponse.json(
      { success: true, data: funnelData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/analytics/funnel:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}