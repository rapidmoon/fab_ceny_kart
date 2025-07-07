class FabCardChecker {
    constructor() {
        this.cards = [];
        this.filteredCards = [];
        this.priceData = {};
        this.productData = {};
        this.cardList = [];
        this.originalFilteredCards = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideLoading();
        this.cardList = [];
        this.originalFilteredCards = [];
    }

    setupEventListeners() {
        document.getElementById('loadDataBtn').addEventListener('click', () => this.loadData());
        document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        document.getElementById('setFilter').addEventListener('change', () => this.filterCards());
        document.getElementById('rarityFilter').addEventListener('change', () => this.filterCards());
        // Obsługa listy kart
        document.getElementById('loadCardListBtn').addEventListener('click', () => this.loadCardListFromFile());
        document.getElementById('filterByCardListBtn').addEventListener('click', () => this.filterByCardList());
        document.getElementById('clearCardListBtn').addEventListener('click', () => this.clearCardListFilter());
    }

    async loadData() {
        try {
            this.showLoading();
            this.hideError();
            // Ładowanie listy kart i cen z lokalnych plików
            const productUrl = 'product_singles_16.json';
            const priceUrl = 'price_guide_16.json';
            const [productResponse, priceResponse] = await Promise.all([
                fetch(productUrl),
                fetch(priceUrl)
            ]);
            if (!productResponse.ok || !priceResponse.ok) {
                throw new Error('Błąd pobierania danych');
            }
            const productData = await productResponse.json();
            const priceData = await priceResponse.json();
            this.processData(productData, priceData);
            this.updateStats();
            this.populateFilters();
            this.displayCards();
        } catch (error) {
            this.showError('Nie udało się załadować danych. Sprawdź połączenie internetowe i spróbuj ponownie.');
        } finally {
            this.hideLoading();
        }
    }

    processData(productData, priceData) {
        this.cards = [];
        this.priceData = {};
        this.productData = {};
        // Mapowanie cen po idProduct
        if (priceData && priceData.data && Array.isArray(priceData.data)) {
            priceData.data.forEach(item => {
                this.priceData[item.idProduct] = item;
            });
        }
        // Mapowanie produktów po idProduct
        if (productData && productData.data && Array.isArray(productData.data)) {
            productData.data.forEach(item => {
                this.productData[item.idProduct] = item;
            });
        }
        // Tworzenie listy kart z połączeniem danych
        for (const id in this.productData) {
            const prod = this.productData[id];
            const price = this.priceData[id];
            const card = {
                id: prod.idProduct,
                name: prod.enName,
                localName: prod.locName || prod.enName,
                set: prod.expansionName || 'Unknown',
                rarity: this.parseRarity(prod.rarity),
                number: prod.number || '',
                price: price ? this.parsePrice(price.avg1) : 0,
                priceWeek: price ? this.parsePrice(price.avg7) : 0,
                priceMonth: price ? this.parsePrice(price.avg30) : 0,
                trend: price ? this.calculateTrend(price.avg1, price.avg7, price.avg30) : 'stable',
                cardType: prod.categoryName || 'Unknown',
                available: price ? price.available : 0
            };
            this.cards.push(card);
        }
        this.filteredCards = [...this.cards];
    }

    parseRarity(rarity) {
        if (!rarity) return 'C';
        const rarityMap = {
            'Common': 'C',
            'Rare': 'R',
            'Super Rare': 'S',
            'Majestic': 'M',
            'Legendary': 'L',
            'Fabled': 'F'
        };
        return rarityMap[rarity] || rarity.charAt(0).toUpperCase() || 'C';
    }

    parsePrice(price) {
        if (price === null || price === undefined) return 0;
        return parseFloat(price) || 0;
    }

    calculateTrend(current, week, month) {
        if (!current || !week) return 'stable';
        const change = ((current - week) / week) * 100;
        if (change > 5) return 'up';
        if (change < -5) return 'down';
        return 'stable';
    }

    populateFilters() {
        const setFilter = document.getElementById('setFilter');
        const sets = [...new Set(this.cards.map(card => card.set))].sort();
        setFilter.innerHTML = '<option value="">Wszystkie sety</option>';
        sets.forEach(set => {
            const option = document.createElement('option');
            option.value = set;
            option.textContent = set;
            setFilter.appendChild(option);
        });
    }

    loadCardListFromFile() {
        const fileInput = document.getElementById('cardListFile');
        if (fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('cardListInput').value = e.target.result;
        };
        reader.readAsText(file);
    }

    getCardListFromTextarea() {
        const raw = document.getElementById('cardListInput').value;
        return raw.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    filterByCardList() {
        this.cardList = this.getCardListFromTextarea().map(x => x.toLowerCase());
        if (this.cardList.length === 0) {
            this.filteredCards = [...this.cards];
        } else {
            this.filteredCards = this.cards.filter(card =>
                this.cardList.includes(card.name.toLowerCase()) ||
                this.cardList.includes(card.localName.toLowerCase())
            );
        }
        this.originalFilteredCards = [...this.filteredCards];
        this.updateStats();
        this.displayCards();
    }

    clearCardListFilter() {
        document.getElementById('cardListInput').value = '';
        this.cardList = [];
        this.filteredCards = [...this.cards];
        this.originalFilteredCards = [];
        this.updateStats();
        this.displayCards();
    }

    performSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        let base = this.cardList.length > 0 ? this.originalFilteredCards : this.cards;
        if (searchTerm.length < 2) {
            this.filteredCards = [...base];
        } else {
            this.filteredCards = base.filter(card => 
                card.name.toLowerCase().includes(searchTerm) ||
                card.localName.toLowerCase().includes(searchTerm) ||
                card.set.toLowerCase().includes(searchTerm)
            );
        }
        this.filterCards();
    }

    filterCards() {
        const setFilter = document.getElementById('setFilter').value;
        const rarityFilter = document.getElementById('rarityFilter').value;
        let base = this.cardList.length > 0 ? this.originalFilteredCards : this.cards;
        let filtered = [...base];
        if (setFilter) {
            filtered = filtered.filter(card => card.set === setFilter);
        }
        if (rarityFilter) {
            filtered = filtered.filter(card => card.rarity === rarityFilter);
        }
        this.filteredCards = filtered;
        this.updateStats();
        this.displayCards();
    }

    displayCards() {
        const cardsGrid = document.getElementById('cardsGrid');
        cardsGrid.innerHTML = '';
        if (this.filteredCards.length === 0) {
            cardsGrid.innerHTML = '<div class="no-results">Brak kart spełniających kryteria wyszukiwania</div>';
            return;
        }
        const sortedCards = [...this.filteredCards].sort((a, b) => b.price - a.price);
        sortedCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            cardsGrid.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        const trendIcon = this.getTrendIcon(card.trend);
        const trendClass = `trend-${card.trend}`;
        cardDiv.innerHTML = `
            <div class="card-header">
                <div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-set">${card.set}</div>
                </div>
                <div class="card-rarity rarity-${card.rarity}">${card.rarity}</div>
            </div>
            <div class="card-info">
                <div class="info-item">
                    <div class="info-label">Aktualna cena</div>
                    <div class="info-value">€${card.price.toFixed(2)}</div>
                    <div class="price-trend ${trendClass}">${trendIcon}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Cena (7 dni)</div>
                    <div class="info-value">€${card.priceWeek.toFixed(2)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Cena (30 dni)</div>
                    <div class="info-value">€${card.priceMonth.toFixed(2)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Dostępność</div>
                    <div class="info-value">${card.available} szt.</div>
                </div>
            </div>
            <div class="card-id">ID: ${card.id} | Nr: ${card.number}</div>
        `;
        return cardDiv;
    }

    getTrendIcon(trend) {
        switch(trend) {
            case 'up': return '📈 Wzrost';
            case 'down': return '📉 Spadek';
            default: return '➡️ Stabilna';
        }
    }

    updateStats() {
        const totalCards = this.cards.length;
        const filteredCards = this.filteredCards.length;
        const avgPrice = this.filteredCards.length > 0 
            ? this.filteredCards.reduce((sum, card) => sum + card.price, 0) / this.filteredCards.length 
            : 0;
        document.getElementById('totalCards').textContent = totalCards.toLocaleString();
        document.getElementById('filteredCards').textContent = filteredCards.toLocaleString();
        document.getElementById('avgPrice').textContent = `€${avgPrice.toFixed(2)}`;
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('cardsGrid').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('cardsGrid').style.display = 'grid';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.style.display = 'block';
        errorDiv.querySelector('p').textContent = `❌ ${message}`;
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }
}

// Dodaj style dla braku wyników
const style = document.createElement('style');
style.textContent = `
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
        color: white;
        font-size: 1.2rem;
        background: rgba(255,255,255,0.1);
        border-radius: 12px;
    }
`;
document.head.appendChild(style);

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    new FabCardChecker();
});

// Dodaj obsługę błędów CORS
window.addEventListener('error', (e) => {
    if (e.message.includes('CORS')) {
        console.error('Błąd CORS - uruchom aplikację przez serwer HTTP');
    }
});
