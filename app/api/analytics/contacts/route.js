/**
 * @swagger
 * /api/analytics/contacts:
 *   get:
 *     summary: Get aggregated contact journey data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contact
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact journey data retrieved
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
    const contact = searchParams.get('contact');

    if (contact) {
      // Get specific contact journey
      const { data: websiteVisits } = await supabase
        .from('website_visits')
        .select('*')
        .eq('owner_contact', contact)
        .order('created_at', { ascending: true });

      const { data: storeVisits } = await supabase
        .from('store_visits')
        .select('*')
        .eq('owner_contact', contact)
        .order('created_at', { ascending: true });

      const journey = {
        contact,
        websiteVisits: websiteVisits || [],
        storeVisits: storeVisits || [],
        totalWebsiteVisits: websiteVisits?.length || 0,
        totalStoreVisits: storeVisits?.length || 0,
        firstTouchpoint: websiteVisits?.[0]?.created_at || null,
        lastTouchpoint: [...(websiteVisits || []), ...(storeVisits || [])]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at || null
      };

      return NextResponse.json(
        { success: true, data: journey },
        { status: 200 }
      );
    } else {
      // Get all contacts with journey summary
      const { data: websiteVisits } = await supabase
        .from('website_visits')
        .select('owner_contact, number_of_visits, created_at');

      const { data: storeVisits } = await supabase
        .from('store_visits')
        .select('owner_contact, number_of_visits, created_at');

      // Aggregate by contact
      const contactMap = new Map();

      (websiteVisits || []).forEach(visit => {
        if (!contactMap.has(visit.owner_contact)) {
          contactMap.set(visit.owner_contact, {
            contact: visit.owner_contact,
            websiteVisits: 0,
            storeVisits: 0,
            firstTouchpoint: visit.created_at,
            lastTouchpoint: visit.created_at
          });
        }
        const contact = contactMap.get(visit.owner_contact);
        contact.websiteVisits += visit.number_of_visits || 1;
        if (new Date(visit.created_at) < new Date(contact.firstTouchpoint)) {
          contact.firstTouchpoint = visit.created_at;
        }
        if (new Date(visit.created_at) > new Date(contact.lastTouchpoint)) {
          contact.lastTouchpoint = visit.created_at;
        }
      });

      (storeVisits || []).forEach(visit => {
        if (!contactMap.has(visit.owner_contact)) {
          contactMap.set(visit.owner_contact, {
            contact: visit.owner_contact,
            websiteVisits: 0,
            storeVisits: 0,
            firstTouchpoint: visit.created_at,
            lastTouchpoint: visit.created_at
          });
        }
        const contact = contactMap.get(visit.owner_contact);
        contact.storeVisits += visit.number_of_visits || 1;
        if (new Date(visit.created_at) < new Date(contact.firstTouchpoint)) {
          contact.firstTouchpoint = visit.created_at;
        }
        if (new Date(visit.created_at) > new Date(contact.lastTouchpoint)) {
          contact.lastTouchpoint = visit.created_at;
        }
      });

      const contacts = Array.from(contactMap.values());

      return NextResponse.json(
        { success: true, data: contacts },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in GET /api/analytics/contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}