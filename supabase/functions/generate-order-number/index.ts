import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Get the latest order number
        const { data, error } = await supabase
            .from('orders')
            .select('order_number')
            .order('order_number', { ascending: false })
            .limit(1)

        if (error) {
            return new Response(
                JSON.stringify({ error: error.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        let nextNum = 1
        if (data && data.length > 0) {
            const lastNum = parseInt(data[0].order_number.replace('KGS-', ''), 10)
            nextNum = lastNum + 1
        }

        const orderNumber = `KGS-${nextNum.toString().padStart(6, '0')}`

        return new Response(
            JSON.stringify({ order_number: orderNumber }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
