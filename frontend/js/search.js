/**
 * ZeeFast Search Module with AI Autocomplete
 */

const SearchModule = {
    debounceTimer: null,
    recentSearches: JSON.parse(localStorage.getItem('zeefast_searches') || '[]'),

    init(inputId, resultsId) {
        const input = document.getElementById(inputId);
        const results = document.getElementById(resultsId);
        if (!input || !results) return;

        input.addEventListener('input', (e) => this.handleInput(e.target.value, results));
        input.addEventListener('focus', () => this.showRecent(results));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.performSearch(input.value.trim());
            }
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !results.contains(e.target)) {
                results.classList.remove('active');
            }
        });
    },

    handleInput(query, resultsContainer) {
        clearTimeout(this.debounceTimer);
        if (query.length < 2) {
            resultsContainer.classList.remove('active');
            return;
        }

        this.debounceTimer = setTimeout(async () => {
            try {
                const response = await API.Recommendations.search(query);
                this.renderResults(response.data, query, resultsContainer);
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);
    },

    renderResults(data, query, container) {
        if (!data.items.length && !data.restaurants.length) {
            container.innerHTML = `<div class="search-empty">No results for "${query}"</div>`;
            container.classList.add('active');
            return;
        }

        let html = '';

        if (data.restaurants.length) {
            html += '<div class="search-section"><h4>Restaurants</h4>';
            data.restaurants.slice(0, 3).forEach(r => {
                html += `
                    <a href="/menu.html?id=${r.id}" class="search-result-item">
                        <img src="${r.image}" alt="${r.name}" onerror="this.src='https://via.placeholder.com/50?text=Food'">
                        <div>
                            <div class="font-medium">${this.highlight(r.name, query)}</div>
                            <div class="text-sm text-muted">${r.cuisine.slice(0, 2).join(', ')}</div>
                        </div>
                    </a>`;
            });
            html += '</div>';
        }

        if (data.items.length) {
            html += '<div class="search-section"><h4>Dishes</h4>';
            data.items.slice(0, 5).forEach(item => {
                html += `
                    <a href="/menu.html?id=${item.restaurant?.id}&item=${item.id}" class="search-result-item">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/50?text=Food'">
                        <div>
                            <div class="font-medium">${this.highlight(item.name, query)}</div>
                            <div class="text-sm text-muted">₹${item.price} • ${item.restaurant?.name || ''}</div>
                        </div>
                    </a>`;
            });
            html += '</div>';
        }

        container.innerHTML = html;
        container.classList.add('active');
    },

    highlight(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    showRecent(container) {
        if (!this.recentSearches.length) return;
        let html = '<div class="search-section"><h4>Recent Searches</h4>';
        this.recentSearches.slice(0, 5).forEach(term => {
            html += `<div class="search-result-item recent" onclick="SearchModule.performSearch('${term}')">
                <i class="fas fa-history"></i><span>${term}</span>
            </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
        container.classList.add('active');
    },

    performSearch(query) {
        this.saveSearch(query);
        window.location.href = `/restaurants.html?search=${encodeURIComponent(query)}`;
    },

    saveSearch(query) {
        this.recentSearches = [query, ...this.recentSearches.filter(s => s !== query)].slice(0, 10);
        localStorage.setItem('zeefast_searches', JSON.stringify(this.recentSearches));
    }
};

window.SearchModule = SearchModule;
