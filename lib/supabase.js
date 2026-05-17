import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmujcioxmrxfxamwkdih.supabase.co'
const supabaseKey = 'sb_publishable_S3loM_5Zv0zz7Mq96R-jtA_URh36f_H'

export const supabase = createClient(supabaseUrl, supabaseKey)
