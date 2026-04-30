import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

        if (!order_id || !razorpay_payment_id || !razorpay_signature) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Verify Razorpay signature
        const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!
        const message = `${razorpay_order_id}|${razorpay_payment_id}`

        const encoder = new TextEncoder()
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(keySecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        )
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
        const expectedSignature = Array.from(new Uint8Array(signature))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

        if (expectedSignature !== razorpay_signature) {
            // Payment verification failed - mark order as cancelled
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL')!,
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
            )

            await supabase
                .from('orders')
                .update({
                    status: 'cancelled',
                    payment_status: 'failed',
                    payment_id: razorpay_payment_id
                })
                .eq('id', order_id)

            return new Response(
                JSON.stringify({ verified: false, error: 'Invalid signature' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Payment verified - update order
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { data, error } = await supabase
            .from('orders')
            .update({
                status: 'confirmed',
                payment_status: 'completed',
                payment_id: razorpay_payment_id,
                payment_method: 'razorpay',
            })
            .eq('id', order_id)
            .select()
            .single()

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ verified: true, order: data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
