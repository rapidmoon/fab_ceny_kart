# Flesh and Blood Card Price Checker

Prosta aplikacja webowa do sprawdzania cen kart Flesh and Blood z CardMarket.

## Funkcjonalności

- 📊 Ładowanie danych o cenach z CardMarket API
- 🔍 Wyszukiwanie kart po nazwie
- 🎯 Filtrowanie po secie i rzadkości
- 📈 Wyświetlanie trendów cenowych (wzrost/spadek/stabilna)
- 📱 Responsywny design
- 🌟 Nowoczesny interfejs użytkownika

## Jak uruchomić

### Opcja 1: Prostą serwer Python
```bash
# Przejdź do katalogu z aplikacją
cd fab-card-checker

# Uruchom serwer Python (Python 3)
python -m http.server 8000

# Lub Python 2
python -m SimpleHTTPServer 8000
```

### Opcja 2: Node.js http-server
```bash
# Zainstaluj http-server globalnie
npm install -g http-server

# Przejdź do katalogu z aplikacją
cd fab-card-checker

# Uruchom serwer
http-server -p 8000
```

### Opcja 3: Live Server (VS Code)
1. Zainstaluj rozszerzenie "Live Server" w VS Code
2. Otwórz plik `index.html`
3. Kliknij prawym przyciskiem myszy i wybierz "Open with Live Server"

## Struktura projektu

```
fab-card-checker/
├── index.html      # Główny plik HTML
├── style.css       # Stylizacja CSS
├── script.js       # Logika JavaScript
└── README.md       # Ten plik
```

## Jak używać

1. Otwórz aplikację w przeglądarce
2. Kliknij przycisk "📥 Załaduj dane" aby pobrać aktualne ceny
3. Używaj pola wyszukiwania do znajdowania konkretnych kart
4. Filtruj po secie lub rzadkości używając rozwijanych list
5. Sprawdzaj trendy cenowe i dostępność kart

## Źródło danych

Aplikacja pobiera dane z:
- **Ceny**: `https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_16.json`

## Uwagi techniczne

- Aplikacja wymaga serwera HTTP ze względu na politykę CORS
- Dane są pobierane bezpośrednio z CardMarket API
- Wszystkie ceny są podawane w Euro (€)
- Aplikacja jest w pełni responsywna i działa na urządzeniach mobilnych

## Funkcjonalności planowane

- [ ] Dodanie wykresów cenowych
- [ ] Eksport danych do CSV
- [ ] Porównywanie cen między różnymi okresami
- [ ] Dodanie alertów cenowych
- [ ] Wsparcie dla różnych walut

## Rozwiązywanie problemów

### Błąd CORS
Jeśli widzisz błąd CORS, uruchom aplikację przez serwer HTTP zamiast otwierać bezpośrednio plik HTML.

### Brak danych
Jeśli dane nie ładują się, sprawdź:
1. Połączenie internetowe
2. Czy CardMarket API jest dostępne
3. Czy nie ma blokad w przeglądarce

### Wydajność
Aplikacja ładuje wszystkie karty na raz, co może zająć chwilę przy słabym połączeniu internetowym.
