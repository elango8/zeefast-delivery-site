/**
 * ZeeFast Client-side AI Helpers
 */

const AIHelpers = {
    // Get time-based greeting and meal suggestion
    getMealSuggestion() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return { greeting: 'Good Morning', meal: 'Breakfast', icon: '🌅' };
        if (hour >= 11 && hour < 15) return { greeting: 'Good Afternoon', meal: 'Lunch', icon: '☀️' };
        if (hour >= 15 && hour < 18) return { greeting: 'Good Evening', meal: 'Snacks', icon: '🌤️' };
        if (hour >= 18 && hour < 22) return { greeting: 'Good Evening', meal: 'Dinner', icon: '🌙' };
        return { greeting: 'Late Night', meal: 'Midnight Cravings', icon: '🌃' };
    },

    // Categories with time relevance
    getRelevantCategories() {
        const { meal } = this.getMealSuggestion();
        const allCategories = [
            { name: 'Biryani', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200' },
            { name: 'Pizza', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200' },
            { name: 'Burgers', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200' },
            { name: 'Chinese', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200' },
            { name: 'South Indian', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200' },
            { name: 'Desserts', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200' },
            { name: 'North Indian', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200' },
            { name: 'Street Food', img: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=200' },
            { name: 'Healthy', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200' },
            { name: 'Mexican', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200' }
        ];

        // Prioritize based on meal time
        const priority = {
            Breakfast: ['South Indian', 'Healthy', 'Street Food'],
            Lunch: ['Biryani', 'North Indian', 'Chinese'],
            Snacks: ['Street Food', 'Burgers', 'Pizza'],
            Dinner: ['Biryani', 'North Indian', 'Chinese', 'Pizza'],
            'Midnight Cravings': ['Pizza', 'Burgers', 'Desserts']
        };

        const priorityList = priority[meal] || [];
        return [...allCategories].sort((a, b) => {
            const aIdx = priorityList.indexOf(a.name);
            const bIdx = priorityList.indexOf(b.name);
            if (aIdx === -1 && bIdx === -1) return 0;
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
        });
    },

    // Track user interactions for recommendations
    trackInteraction(type, data) {
        const interactions = JSON.parse(localStorage.getItem('zeefast_interactions') || '[]');
        interactions.push({ type, data, timestamp: Date.now() });
        // Keep last 100 interactions
        localStorage.setItem('zeefast_interactions', JSON.stringify(interactions.slice(-100)));
    },

    // Get personalized suggestions from local data
    getLocalSuggestions() {
        const interactions = JSON.parse(localStorage.getItem('zeefast_interactions') || '[]');
        const recent = interactions.filter(i => Date.now() - i.timestamp < 7 * 24 * 60 * 60 * 1000);

        const cuisineCount = {};
        recent.forEach(i => {
            if (i.data?.cuisine) {
                i.data.cuisine.forEach(c => {
                    cuisineCount[c] = (cuisineCount[c] || 0) + 1;
                });
            }
        });

        return Object.entries(cuisineCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([cuisine]) => cuisine);
    }
};

window.AIHelpers = AIHelpers;
