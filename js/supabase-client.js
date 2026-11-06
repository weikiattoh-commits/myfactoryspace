// Supabase Client Configuration for Industra Project
const SUPABASE_URL = 'https://vnsinkesbbikeqbywxfd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuc2lua2VzYmJpa2VxYnl3eGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NzE2NTMsImV4cCI6MjEwNjI0NzY1M30.gaZwIgcxixKIZXya0yrIaQ36mSAzZHMwsaQXZj9aEZA';

let supabaseClient = null;

if (window.supabase) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Client connected to Industra project');
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
    }
} else {
    console.warn('⚠️ Supabase JS SDK not loaded yet. Ensure CDN script is included before supabase-client.js');
}

// Global Supabase Helper Object
window.IndustraSupabase = {
    getClient() {
        if (!supabaseClient && window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return supabaseClient;
    },

    // Fetch properties from Supabase
    async fetchProperties() {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('properties').select('*');
            if (error) {
                console.error('Error fetching properties from Supabase:', error);
                return null;
            }
            return data;
        } catch (e) {
            console.error('Exception fetching properties from Supabase:', e);
            return null;
        }
    },

    // Save/Update property in Supabase
    async upsertProperty(property) {
        const client = this.getClient();
        if (!client) return { success: false, error: 'Supabase client not initialized' };
        try {
            const { data, error } = await client.from('properties').upsert(property).select();
            if (error) {
                console.error('Error saving property to Supabase:', error);
                return { success: false, error: error.message || String(error) };
            }
            return { success: true, data };
        } catch (e) {
            console.error('Exception saving property to Supabase:', e);
            return { success: false, error: e.message || String(e) };
        }
    },

    // Delete property from Supabase
    async deleteProperty(id) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('properties').delete().eq('id', id);
            if (error) {
                console.error('Error deleting property from Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception deleting property from Supabase:', e);
            return false;
        }
    },

    // Fetch parks
    async fetchIndustrialParks() {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('parks').select('*');
            if (error) return null;
            return data;
        } catch (e) {
            return null;
        }
    },

    // Upsert park
    async upsertIndustrialPark(park) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('parks').upsert(park);
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Delete park
    async deleteIndustrialPark(id) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('parks').delete().eq('id', id);
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Fetch agents
    async fetchAgents() {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('agents').select('*').order('id', { ascending: true });
            if (error) return null;
            return data.map(item => {
                const specs = (item.specs && typeof item.specs === 'object') ? item.specs : {};
                return {
                    ...specs,
                    id: isNaN(item.id) ? item.id : Number(item.id),
                    name: item.name || specs.name || '',
                    ren: item.ren || specs.ren || '',
                    phone: item.phone || specs.phone || '',
                    whatsapp: item.whatsapp || specs.whatsapp || '',
                    email: item.email || specs.email || '',
                    bio: item.bio || specs.bio || '',
                    image: item.image || specs.image || '',
                    parks: Array.isArray(item.parks) ? item.parks : (specs.parks || []),
                    assignedParks: Array.isArray(item.parks) ? item.parks : (specs.assignedParks || []),
                    showOnMainpage: item.show_on_mainpage !== false
                };
            });
        } catch (e) {
            return null;
        }
    },

    // Upsert agent
    async upsertAgent(agent) {
        const client = this.getClient();
        if (!client) {
            console.error('Supabase client not initialized in upsertAgent');
            return false;
        }
        try {
            let imageUrl = agent.image || '';
            if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
                const uploadRes = await this.uploadImage(imageUrl);
                if (uploadRes && uploadRes.success && uploadRes.url) {
                    imageUrl = uploadRes.url;
                    agent.image = imageUrl;
                }
            }

            const cleanSpecs = Object.assign({}, agent);
            cleanSpecs.image = imageUrl;

            const payload = {
                id: String(agent.id),
                name: agent.name || '',
                ren: agent.ren || '',
                phone: String(agent.phone || ''),
                whatsapp: String(agent.whatsapp || ''),
                email: agent.email || '',
                bio: agent.bio || '',
                image: imageUrl,
                parks: Array.isArray(agent.parks) ? agent.parks : (Array.isArray(agent.assignedParks) ? agent.assignedParks : []),
                show_on_mainpage: agent.showOnMainpage !== false,
                specs: cleanSpecs
            };
            const { data, error } = await client.from('agents').upsert(payload, { onConflict: 'id' });
            if (error) {
                console.error('Supabase upsertAgent error:', error);
                throw error;
            }
            console.log('✅ Agent upserted successfully to Supabase:', payload.id, payload.name);
            return true;
        } catch (e) {
            console.error('Exception in upsertAgent:', e);
            throw e;
        }
    },

    // Delete agent
    async deleteAgent(id) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('agents').delete().eq('id', String(id));
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Fetch app users
    async fetchUsers() {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('app_users').select('*').order('created_at', { ascending: true });
            if (error) {
                console.error('Error fetching users from Supabase:', error);
                return null;
            }
            return data.map(item => {
                const specs = (item.specs && typeof item.specs === 'object') ? item.specs : {};
                return {
                    ...specs,
                    id: item.id,
                    username: item.username || specs.username || '',
                    password: item.password || specs.password || '',
                    role: item.role || specs.role || 'Administrator',
                    agentId: item.agent_id ? (isNaN(item.agent_id) ? item.agent_id : Number(item.agent_id)) : (specs.agentId || null),
                    whatsapp: item.whatsapp || specs.whatsapp || ''
                };
            });
        } catch (e) {
            console.error('Exception fetching users from Supabase:', e);
            return null;
        }
    },

    // Authenticate user against Supabase app_users table
    async authenticateUser(username, password) {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('app_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .maybeSingle();
            
            if (error || !data) return null;
            return data;
        } catch (e) {
            console.error('Exception during Supabase authentication:', e);
            return null;
        }
    },

    // Upsert user
    async upsertUser(user) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const payload = {
                username: user.username,
                password: user.password || '',
                role: user.role || 'Administrator',
                agent_id: user.agentId ? String(user.agentId) : null,
                whatsapp: user.whatsapp || '',
                specs: user
            };
            if (user.id) payload.id = user.id;
            const { error } = await client.from('app_users').upsert(payload, { onConflict: 'username' });
            if (error) {
                console.error('Error upserting user in Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception upserting user in Supabase:', e);
            return false;
        }
    },

    // Delete user
    async deleteUser(username) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('app_users').delete().eq('username', username);
            if (error) {
                console.error('Error deleting user from Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception deleting user from Supabase:', e);
            return false;
        }
    },

    // Fetch site setting by key
    async fetchSiteSetting(key) {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('site_settings').select('*').eq('key', key).maybeSingle();
            if (error || !data) return null;
            return data.value;
        } catch (e) {
            console.error(`Exception fetching site setting '${key}' from Supabase:`, e);
            return null;
        }
    },

    // Upsert site setting (key, value)
    async upsertSiteSetting(key, value) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const payload = {
                key: key,
                value: value,
                updated_at: new Date().toISOString()
            };
            const { error } = await client.from('site_settings').upsert(payload, { onConflict: 'key' });
            if (error) {
                console.error(`Error upserting site setting '${key}' in Supabase:`, error);
                return false;
            }
            return true;
        } catch (e) {
            console.error(`Exception upserting site setting '${key}' in Supabase:`, e);
            return false;
        }
    },

    // Fetch leads
    async fetchLeads() {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('leads').select('*').order('created_at', { ascending: false });
            if (error) return null;
            return data.map(item => {
                const specs = (item.specs && typeof item.specs === 'object') ? item.specs : {};
                return {
                    ...specs,
                    id: isNaN(item.id) ? item.id : Number(item.id),
                    name: item.name || specs.name || '',
                    phone: item.phone || specs.phone || '',
                    email: item.email || specs.email || '',
                    interest: item.interest || specs.interest || '',
                    intent: item.intent || specs.intent || '',
                    message: item.message || specs.message || '',
                    status: item.status || specs.status || 'New',
                    date: item.date || specs.date || '',
                    timestamp: item.timestamp || specs.timestamp || ''
                };
            });
        } catch (e) {
            return null;
        }
    },

    // Add or Update customer lead
    async upsertLead(lead) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const leadId = (lead.id !== undefined && lead.id !== null && String(lead.id) !== 'undefined') ? String(lead.id) : String(Date.now());
            const fullSpecs = Object.assign({}, lead, { id: leadId });
            const payload = {
                id: leadId,
                name: lead.name || '',
                phone: lead.phone || '',
                email: lead.email || '',
                interest: lead.interest || '',
                intent: lead.intent || '',
                property_id: lead.property_id || lead.propertyId || null,
                message: lead.message || '',
                status: lead.status || 'New',
                date: lead.date || new Date().toLocaleDateString(),
                timestamp: lead.timestamp || new Date().toLocaleString(),
                specs: fullSpecs
            };
            const { error } = await client.from('leads').upsert(payload);
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Add new customer lead
    async addLead(lead) {
        return this.upsertLead(lead);
    },

    // Delete lead
    async deleteLead(id) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('leads').delete().eq('id', String(id));
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Fetch owner listings from Supabase
    async fetchOwnerListings() {
        const client = this.getClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('owner_listings').select('*').order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching owner listings from Supabase:', error);
                return null;
            }
            return data;
        } catch (e) {
            console.error('Exception fetching owner listings from Supabase:', e);
            return null;
        }
    },

    // Add or Update owner listing in Supabase
    async upsertOwnerListing(listing) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const listingId = (listing.id !== undefined && listing.id !== null && String(listing.id) !== 'undefined') ? String(listing.id) : String(Date.now());
            const fullSpecs = Object.assign({}, listing, { id: listingId });
            const payload = {
                id: listingId,
                name: listing.name || '',
                phone: listing.phone || '',
                email: listing.email || '',
                location: listing.location || '',
                type: listing.type || '',
                intent: listing.intent || '',
                size: listing.size || '',
                price: listing.price || '',
                notes: listing.notes || '',
                status: listing.status || 'Pending',
                date: listing.date || new Date().toLocaleDateString(),
                timestamp: listing.timestamp || new Date().toLocaleString(),
                specs: fullSpecs
            };
            const { error } = await client.from('owner_listings').upsert(payload);
            if (error) {
                console.error('Error upserting owner listing in Supabase:', error);
                return false;
            }
            return true;
        } catch (e) {
            console.error('Exception upserting owner listing in Supabase:', e);
            return false;
        }
    },

    // Delete owner listing from Supabase
    async deleteOwnerListing(id) {
        const client = this.getClient();
        if (!client) return false;
        try {
            const { error } = await client.from('owner_listings').delete().eq('id', String(id));
            return !error;
        } catch (e) {
            return false;
        }
    },

    // Upload single image (File, Blob, or base64 DataURL) to Supabase Storage bucket 'property-images'
    async uploadImage(fileOrDataUrl, customFilename = null) {
        const client = this.getClient();
        if (!client) return { success: false, error: 'Supabase client not initialized' };

        try {
            if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('assets/')) {
                try {
                    const response = await fetch(fileOrDataUrl);
                    if (response && response.ok) {
                        const blob = await response.blob();
                        fileOrDataUrl = blob;
                    } else {
                        return { success: true, url: fileOrDataUrl };
                    }
                } catch(e) {
                    console.warn('Could not fetch local asset for Supabase Storage upload, keeping original path:', e);
                    return { success: true, url: fileOrDataUrl };
                }
            }

            // If already a remote CDN / Supabase HTTP URL or string asset, no need to re-upload
            if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:') && !(fileOrDataUrl instanceof Blob) && !(fileOrDataUrl instanceof File)) {
                return { success: true, url: fileOrDataUrl };
            }

            let fileBody = fileOrDataUrl;
            let mimeType = 'image/jpeg';
            let ext = 'jpg';

            if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
                const mimeMatch = fileOrDataUrl.match(/^data:([^;]+);base64,/);
                if (mimeMatch) {
                    mimeType = mimeMatch[1];
                    ext = mimeType.split('/')[1] || 'jpg';
                    if (ext === 'jpeg') ext = 'jpg';
                    if (ext.includes('+')) ext = ext.split('+')[0];
                }
                const base64Data = fileOrDataUrl.replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                fileBody = new Blob([byteArray], { type: mimeType });
            } else if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
                mimeType = fileOrDataUrl.type || 'image/jpeg';
                ext = mimeType.split('/')[1] || 'jpg';
                if (ext === 'jpeg') ext = 'jpg';
            }

            const uniquePath = customFilename || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

            const { data, error } = await client.storage
                .from('property-images')
                .upload(uniquePath, fileBody, {
                    contentType: mimeType,
                    upsert: true
                });

            if (error) {
                console.error('Error uploading image to Supabase Storage:', error);
                return { success: false, error: error.message || String(error) };
            }

            const { data: publicUrlData } = client.storage
                .from('property-images')
                .getPublicUrl(uniquePath);

            const publicUrl = publicUrlData ? publicUrlData.publicUrl : null;
            console.log('✅ Image uploaded to Supabase Storage bucket property-images:', publicUrl);
            return { success: true, url: publicUrl, path: uniquePath };
        } catch (e) {
            console.error('Exception uploading image to Supabase Storage:', e);
            return { success: false, error: e.message || String(e) };
        }
    },

    // Security Helper: HTML Entity Escaping (XSS prevention)
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    // Security Helper: Input string trimmer & length bounder
    sanitizeInput(str, maxLen = 1000) {
        if (str === null || str === undefined) return '';
        return String(str).trim().slice(0, maxLen);
    },

    // Batch upload array of images (Base64 data URLs or Files/Blobs) to Supabase Storage bucket
    // Uses bounded concurrency (3 parallel uploads at a time) for up to 3x faster multi-image uploads
    async uploadImages(imagesArray) {
        if (!Array.isArray(imagesArray) || imagesArray.length === 0) return [];
        const uploadedUrls = new Array(imagesArray.length);
        const concurrency = 3;
        let currentIndex = 0;

        const worker = async () => {
            while (currentIndex < imagesArray.length) {
                const i = currentIndex++;
                const item = imagesArray[i];
                if (typeof item === 'string' && !item.startsWith('data:')) {
                    uploadedUrls[i] = item;
                } else {
                    const res = await this.uploadImage(item);
                    if (res.success && res.url) {
                        uploadedUrls[i] = res.url;
                    } else {
                        console.warn(`Failed to upload image index ${i}, preserving original string/URL:`, res.error);
                        uploadedUrls[i] = item;
                    }
                }
            }
        };

        const workers = [];
        for (let w = 0; w < Math.min(concurrency, imagesArray.length); w++) {
            workers.push(worker());
        }
        await Promise.all(workers);
        return uploadedUrls;
    }
};
