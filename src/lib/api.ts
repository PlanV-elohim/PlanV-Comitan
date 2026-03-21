/// <reference types="vite/client" />
import { supabase } from './supabase';

// Upload a File to Supabase Storage and return the public URL
export async function uploadToStorage(bucket: string, path: string, file: File): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
}

export const supabaseApi = {
    camps: {
        getAll: async () => {
            const { data, error } = await supabase.from('camps').select('*').order('created_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: any) => {
            const { data, error } = await supabase.from('camps').insert([payload]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        update: async (id: string, payload: any) => {
            const { data, error } = await supabase.from('camps').update(payload).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('camps').delete().eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        }
    },
    
    cabins: {
        getAll: async (campId?: number) => {
            let query = supabase.from('cabins').select('*').order('name');
            if (campId) query = query.eq('camp_id', campId);
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: any) => {
            const { data, error } = await supabase.from('cabins').insert([payload]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        update: async (id: number | string, payload: any) => {
            const { data, error } = await supabase.from('cabins').update(payload).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        },
        delete: async (id: number | string) => {
            const { error } = await supabase.from('cabins').delete().eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        }
    },

    registrations: {
        getAll: async () => {
            const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: any) => {
            const { data, error } = await supabase.from('registrations').insert([payload]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        update: async (id: string, payload: any) => {
            const { data, error } = await supabase.from('registrations').update(payload).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    groupMembers: {
        getByRegistration: async (regId: string) => {
            const { data, error } = await supabase.from('group_members').select('*').eq('registration_id', regId).order('created_at', { ascending: true });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: any) => {
            const { data, error } = await supabase.from('group_members').insert([payload]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        update: async (id: string, payload: any) => {
            const { data, error } = await supabase.from('group_members').update(payload).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('group_members').delete().eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        }
    },

    medicalForms: {
        getByRegistration: async (regId: string) => {
            const { data, error } = await supabase.from('medical_forms').select('*').eq('registration_id', regId).maybeSingle();
            if (error && error.code !== 'PGRST116') throw new Error(error.message);
            return data;
        },
        getByMember: async (memberId: string) => {
            const { data, error } = await supabase.from('medical_forms').select('*').eq('group_member_id', memberId).maybeSingle();
            if (error && error.code !== 'PGRST116') throw new Error(error.message);
            return data;
        },
        upsert: async (payload: any) => {
            const { data, error } = await supabase.from('medical_forms').upsert([payload], { 
                onConflict: payload.group_member_id ? 'group_member_id' : 'registration_id' 
            }).select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    messages: {
        getAll: async () => {
            const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: any) => {
            const { data, error } = await supabase.from('contact_messages').insert([payload]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        markRead: async (id: string) => {
            const { data, error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        }
    },

    timeline: {
        getAll: async () => {
            const { data, error } = await supabase.from('timeline_events').select('*').order('year', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: any) => {
            const { data, error } = await supabase.from('timeline_events').insert([payload]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        update: async (id: string, payload: any) => {
            const { data, error } = await supabase.from('timeline_events').update(payload).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('timeline_events').delete().eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        }
    },

    gallery: {
        getAll: async (type?: string) => {
            let query = supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
            if (type) query = query.eq('type', type);
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: { type: string; image_url: string; is_active?: boolean }) => {
            const { data, error } = await supabase.from('gallery_images').insert([{ is_active: true, ...payload }]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        setActive: async (id: string, imageType: string) => {
            const isDesktop = imageType.startsWith('hero_bg');
            const types = isDesktop ? ['hero_bg', 'hero_bg_text'] : ['hero_mobile', 'hero_mobile_text'];
            
            // Deactivate others
            await supabase.from('gallery_images').update({ is_active: false }).in('type', types);
            
            // Activate target
            const { data, error } = await supabase.from('gallery_images').update({ is_active: true }).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        }
    },

    itinerary: {
        getByCamp: async (campId: string) => {
            const { data, error } = await supabase.from('itinerary_events').select('*').eq('camp_id', campId).order('start_time', { ascending: true });
            if (error) throw new Error(error.message);
            return data;
        },
        create: async (payload: any) => {
            const { data, error } = await supabase.from('itinerary_events').insert([payload]).select();
            if (error) throw new Error(error.message);
            return data;
        },
        update: async (id: string, payload: any) => {
            const { data, error } = await supabase.from('itinerary_events').update(payload).eq('id', id).select();
            if (error) throw new Error(error.message);
            return data;
        },
        delete: async (id: string) => {
            const { error } = await supabase.from('itinerary_events').delete().eq('id', id);
            if (error) throw new Error(error.message);
            return true;
        }
    },

    achievements: {
        getByUser: async (email: string) => {
            const { data, error } = await supabase.from('user_achievements').select('*').eq('user_email', email).order('earned_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        grant: async (email: string, badgeId: string) => {
            // Check if already has it
            const { data: existing } = await supabase.from('user_achievements').select('id').eq('user_email', email).eq('badge_id', badgeId).maybeSingle();
            if (existing) return existing;

            const { data, error } = await supabase.from('user_achievements').insert([{ user_email: email, badge_id: badgeId }]).select();
            if (error) throw new Error(error.message);
            return data;
        }
    }
};
