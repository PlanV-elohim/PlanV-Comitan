/// <reference types="vite/client" />
import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

// Compress an image to WebP, max 1200px, max 200KB
async function compressImage(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.2,           // 200KB
        maxWidthOrHeight: 1200,   // max dimension
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.85,
    };
    try {
        const compressed = await imageCompression(file, options);
        // Rename to .webp extension
        return new File([compressed], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
    } catch {
        // If compression fails, return original (fallback safety)
        return file;
    }
}

// Helper to sanitize filenames (remove accents, spaces, special chars)
function sanitizeFilename(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars/spaces with underscore
        .replace(/_{2,}/g, "_"); // Collapse multiple underscores
}

// Upload a File to Supabase Storage and return the public URL
// Images are automatically compressed to WebP ≤200KB before upload
export async function uploadToStorage(bucket: string, path: string, file: File): Promise<string> {
    const compressedFile = await compressImage(file);
    
    // Sanitize path including the filename part
    const pathParts = path.split('/');
    const lastPart = pathParts.pop() || '';
    const sanitizedName = sanitizeFilename(lastPart.replace(/\.[^.]+$/, '')) + '.webp';
    const sanitizedPath = [...pathParts, sanitizedName].join('/');

    const { data, error } = await supabase.storage.from(bucket).upload(sanitizedPath, compressedFile, {
        upsert: true,
        contentType: 'image/webp',
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(sanitizedPath);
    return publicUrl;
}

const rawApi = {
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
        },
        getOccupancy: async (campId: string) => {
            const { data, error } = await supabase.from('registrations').select('group_size').eq('camp_id', campId);
            if (error) throw new Error(error.message);
            return data.reduce((acc: number, r: any) => acc + (r.group_size || 1), 0);
        }
    },

    groupMembers: {
        getAll: async () => {
            const { data, error } = await supabase.from('group_members').select('*').order('created_at', { ascending: true });
            if (error) throw new Error(error.message);
            return data;
        },
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

    badges: {
        getByUser: async (userId: string) => {
            const { data, error } = await supabase
                .from('user_badges')
                .select('*, badge:badges(*)')
                .eq('user_id', userId)
                .order('awarded_at', { ascending: false });
            if (error) throw new Error(error.message);
            return data;
        },
        grant: async (userId: string, badgeName: string) => {
            // First find the badge id by its name
            const { data: badgeData } = await supabase.from('badges').select('id').eq('name', badgeName).maybeSingle();
            if (!badgeData) return null; // Badge doesn't exist
            
            // Check if user already has it
            const { data: existing } = await supabase.from('user_badges')
                .select('id')
                .eq('user_id', userId)
                .eq('badge_id', badgeData.id)
                .maybeSingle();
            if (existing) return existing;

            const { data, error } = await supabase.from('user_badges').insert([{ user_id: userId, badge_id: badgeData.id }]).select();
            if (error) throw new Error(error.message);
            return data;
        }
    }
};

const logAdminAction = async (actionType: string, tableName: string, details: any) => {
    try {
        if (localStorage.getItem('adminAuth') === 'true') {
            const { data } = await supabase.auth.getSession();
            const email = data?.session?.user?.email;
            if (email) {
                await supabase.from('admin_logs').insert([{
                    admin_email: email,
                    action_type: actionType,
                    table_name: tableName,
                    details: JSON.parse(JSON.stringify(details))
                }]);
            }
        }
    } catch (e) {
        console.error('Audit log failed', e);
    }
};

const createProxy = (obj: any, path: string = ''): any => {
    return new Proxy(obj, {
        get(target, prop: string) {
            const value = target[prop];
            const currentPath = path ? `${path}.${prop}` : prop;
            
            if (typeof value === 'object' && value !== null) {
                return createProxy(value, currentPath);
            }
            
            if (typeof value === 'function') {
                return async (...args: any[]) => {
                    const result = await value.apply(target, args);
                    
                    if (['create', 'update', 'delete', 'markRead', 'grant', 'setActive', 'upsert'].includes(prop)) {
                        const tableName = currentPath.split('.')[0];
                        await logAdminAction(prop.toUpperCase(), tableName, { args });
                    }
                    
                    return result;
                };
            }
            return value;
        }
    });
};

export const supabaseApi = createProxy(rawApi);
