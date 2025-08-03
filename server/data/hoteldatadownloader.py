import time
import random
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import logging
from datetime import datetime, timedelta
import json
import os

class EnhancedHotelScraper:
    def __init__(self, headless=True, delay_range=(2, 5)):
        """
        Initialize the scraper with enhanced configurations
        
        Args:
            headless (bool): Run browser in headless mode
            delay_range (tuple): Range for random delays between requests
        """
        self.setup_logging()
        self.delay_range = delay_range
        self.driver = self.setup_driver(headless)
        self.hotels_data = []
        
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('hotel_scraper.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
    def setup_driver(self, headless=True):
        """Setup Chrome driver with optimal configurations"""
        options = Options()
        
        if headless:
            options.add_argument('--headless')
            
        # Anti-detection measures
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
        
    def random_delay(self):
        """Add random delay to avoid detection"""
        delay = random.uniform(*self.delay_range)
        time.sleep(delay)
        
    def get_checkin_checkout_dates(self, days_ahead=30, stay_duration=2):
        """Generate check-in and check-out dates"""
        checkin = datetime.now() + timedelta(days=days_ahead)
        checkout = checkin + timedelta(days=stay_duration)
        
        return checkin.strftime('%Y-%m-%d'), checkout.strftime('%Y-%m-%d')
        
    def scrape_hotels_from_city(self, city, country, currency="USD", target_hotels=100):
        """
        Scrape hotels from a specific city with pagination support
        
        Args:
            city (str): City name
            country (str): Country name
            currency (str): Currency code
            target_hotels (int): Target number of hotels to scrape
            
        Returns:
            list: List of hotel dictionaries
        """
        self.logger.info(f"Starting to scrape hotels from {city}, {country}")
        
        checkin, checkout = self.get_checkin_checkout_dates()
        
        # Build URL with dates and other parameters
        base_url = "https://www.booking.com/searchresults.html"
        params = {
            'ss': city.replace(' ', '+'),
            'checkin': checkin,
            'checkout': checkout,
            'group_adults': '2',
            'group_children': '0',
            'no_rooms': '1',
            'selected_currency': currency
        }
        
        url = f"{base_url}?" + "&".join([f"{k}={v}" for k, v in params.items()])
        
        try:
            self.driver.get(url)
            self.random_delay()
            
            # Handle cookie consent if present
            self.handle_cookie_consent()
            
            city_hotels = []
            page_num = 1
            consecutive_empty_pages = 0
            
            while len(city_hotels) < target_hotels and consecutive_empty_pages < 3:
                self.logger.info(f"Scraping page {page_num} for {city}, {country} - Found {len(city_hotels)} hotels so far")
                
                # Wait for hotels to load
                try:
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="property-card"]'))
                    )
                except TimeoutException:
                    self.logger.warning(f"No hotels found on page {page_num} for {city}")
                    consecutive_empty_pages += 1
                    if not self.go_to_next_page():
                        break
                    continue
                
                # Extract hotels from current page
                page_hotels = self.extract_hotels_from_page(city, country, currency)
                
                if not page_hotels:
                    consecutive_empty_pages += 1
                    self.logger.warning(f"No hotels extracted from page {page_num}")
                else:
                    consecutive_empty_pages = 0
                    city_hotels.extend(page_hotels)
                    self.logger.info(f"Extracted {len(page_hotels)} hotels from page {page_num}")
                
                # Check if we have enough hotels
                if len(city_hotels) >= target_hotels:
                    city_hotels = city_hotels[:target_hotels]
                    break
                
                # Go to next page
                if not self.go_to_next_page():
                    self.logger.info(f"No more pages available for {city}")
                    break
                    
                page_num += 1
                self.random_delay()
                
            self.logger.info(f"Completed scraping {city}, {country}. Total hotels found: {len(city_hotels)}")
            return city_hotels
            
        except Exception as e:
            self.logger.error(f"Error scraping {city}, {country}: {str(e)}")
            return []
            
    def handle_cookie_consent(self):
        """Handle cookie consent popup if present"""
        try:
            accept_button = WebDriverWait(self.driver, 5).until(
                EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
            )
            accept_button.click()
            self.logger.info("Cookie consent accepted")
        except TimeoutException:
            pass  # No cookie consent popup
            
    def extract_hotels_from_page(self, city, country, currency):
        """Extract hotel information from current page"""
        hotels = []
        
        try:
            hotel_elements = self.driver.find_elements(By.CSS_SELECTOR, '[data-testid="property-card"]')
            
            for el in hotel_elements:
                try:
                    hotel_data = self.extract_hotel_data(el, city, country, currency)
                    if hotel_data:
                        hotels.append(hotel_data)
                except Exception as e:
                    self.logger.debug(f"Error extracting hotel data: {str(e)}")
                    continue
                    
        except Exception as e:
            self.logger.error(f"Error finding hotel elements: {str(e)}")
            
        return hotels
        
    def extract_hotel_data(self, element, city, country, currency):
        """Extract data from a single hotel element"""
        try:
            # Hotel name
            name = self.safe_extract_text(element, '[data-testid="title"]')
            if not name:
                return None
                
            # Star rating
            stars = self.extract_star_rating(element)
            
            # Price
            price = self.extract_price(element)
            
            # Rating and reviews
            rating, reviews = self.extract_rating_and_reviews(element)
            
            # Location/Distance
            location = self.safe_extract_text(element, '[data-testid="address"]')
            distance = self.safe_extract_text(element, '[data-testid="distance"]')
            
            # Amenities
            amenities = self.extract_amenities(element)
            
            # Property type
            property_type = self.safe_extract_text(element, '[data-testid="property-type-badge"]')
            
            return {
                "Country": country,
                "City/Place": city,
                "Hotel Name": name,
                "Stars": stars,
                "Rating": rating,
                "Number of Reviews": reviews,
                "Property Type": property_type,
                "Location": location,
                "Distance from Center": distance,
                "Avg Price per Night (USD)": price,
                "Currency": currency,
                "Amenities": amenities,
                "Scraped Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
        except Exception as e:
            self.logger.debug(f"Error extracting hotel data: {str(e)}")
            return None
            
    def safe_extract_text(self, element, selector):
        """Safely extract text from element"""
        try:
            return element.find_element(By.CSS_SELECTOR, selector).text.strip()
        except:
            return "N/A"
            
    def extract_star_rating(self, element):
        """Extract star rating"""
        try:
            star_element = element.find_element(By.CSS_SELECTOR, '[aria-label*="out of 5"]')
            aria_label = star_element.get_attribute("aria-label")
            return aria_label.split()[0] if aria_label else "N/A"
        except:
            return "N/A"
            
    def extract_price(self, element):
        """Extract and clean price information"""
        try:
            price_element = element.find_element(By.CSS_SELECTOR, '[data-testid="price-and-discounted-price"]')
            price_text = price_element.text
            
            # Extract numeric value
            price_digits = ''.join(filter(str.isdigit, price_text))
            if price_digits:
                price = int(price_digits)
                # Adjust for currency formatting (assuming cents)
                if price > 1000:
                    price = price / 100
                return price
            return "N/A"
        except:
            return "N/A"
            
    def extract_rating_and_reviews(self, element):
        """Extract rating and number of reviews"""
        try:
            rating_element = element.find_element(By.CSS_SELECTOR, '[data-testid="review-score"]')
            rating_text = rating_element.text
            
            # Extract rating (usually first number)
            rating_parts = rating_text.split()
            rating = rating_parts[0] if rating_parts else "N/A"
            
            # Extract number of reviews
            reviews_text = self.safe_extract_text(element, '[data-testid="review-score"] + *')
            reviews = ''.join(filter(str.isdigit, reviews_text)) if reviews_text != "N/A" else "N/A"
            
            return rating, reviews
        except:
            return "N/A", "N/A"
            
    def extract_amenities(self, element):
        """Extract amenities/facilities"""
        try:
            amenity_elements = element.find_elements(By.CSS_SELECTOR, '[data-testid="facility-icon"]')
            amenities = []
            
            for amenity_el in amenity_elements:
                amenity_text = amenity_el.get_attribute("aria-label")
                if amenity_text:
                    amenities.append(amenity_text)
                    
            return ", ".join(amenities) if amenities else "N/A"
        except:
            return "N/A"
            
    def go_to_next_page(self):
        """Navigate to next page"""
        try:
            next_button = self.driver.find_element(By.CSS_SELECTOR, '[aria-label="Next page"]')
            if next_button.is_enabled():
                self.driver.execute_script("arguments[0].click();", next_button)
                self.random_delay()
                return True
            return False
        except:
            return False
            
    def scrape_multiple_cities(self, cities_data, hotels_per_country=100):
        """
        Scrape hotels from multiple cities
        
        Args:
            cities_data (list): List of tuples (country, city) or (country, [cities])
            hotels_per_country (int): Target hotels per country
            
        Returns:
            list: Combined hotel data
        """
        all_hotels = []
        
        for item in cities_data:
            if isinstance(item, tuple) and len(item) == 2:
                country, cities = item
                
                # If cities is a string, convert to list
                if isinstance(cities, str):
                    cities = [cities]
                
                country_hotels = []
                hotels_per_city = max(1, hotels_per_country // len(cities))
                
                for city in cities:
                    try:
                        city_hotels = self.scrape_hotels_from_city(
                            city, country, target_hotels=hotels_per_city
                        )
                        country_hotels.extend(city_hotels)
                        
                        # Add delay between cities
                        if len(cities) > 1:
                            self.random_delay()
                            
                    except Exception as e:
                        self.logger.error(f"Error scraping {city}, {country}: {str(e)}")
                        continue
                
                # If we didn't get enough hotels, try to get more from the first city
                if len(country_hotels) < hotels_per_country and cities:
                    additional_needed = hotels_per_country - len(country_hotels)
                    additional_hotels = self.scrape_hotels_from_city(
                        cities[0], country, target_hotels=additional_needed
                    )
                    country_hotels.extend(additional_hotels)
                
                all_hotels.extend(country_hotels[:hotels_per_country])
                self.logger.info(f"Completed {country}: {len(country_hotels)} hotels")
                
        return all_hotels
        
    def save_data(self, data, filename="enhanced_hotels_dataset.csv", save_json=True):
        """Save scraped data to CSV and optionally JSON"""
        if not data:
            self.logger.warning("No data to save")
            return
            
        # Save to CSV
        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        self.logger.info(f"Data saved to {filename}")
        
        # Save to JSON as backup
        if save_json:
            json_filename = filename.replace('.csv', '.json')
            with open(json_filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            self.logger.info(f"Data also saved to {json_filename}")
            
        # Print summary
        self.print_summary(df)
        
    def print_summary(self, df):
        """Print summary of scraped data"""
        self.logger.info("\n" + "="*50)
        self.logger.info("SCRAPING SUMMARY")
        self.logger.info("="*50)
        self.logger.info(f"Total hotels scraped: {len(df)}")
        self.logger.info(f"Countries covered: {df['Country'].nunique()}")
        self.logger.info(f"Cities covered: {df['City/Place'].nunique()}")
        
        # Hotels per country
        country_counts = df['Country'].value_counts()
        self.logger.info("\nHotels per country:")
        for country, count in country_counts.items():
            self.logger.info(f"  {country}: {count}")
            
        self.logger.info("="*50)
        
    def close(self):
        """Close the driver"""
        if self.driver:
            self.driver.quit()
            self.logger.info("Driver closed")

# Example usage
def main():
    # Define cities to scrape (you can add more cities per country)
    # Top 100 Countries with Major Cities for Hotel Scraping
# Organized by regions for better management

    cities_to_scrape = [
    # ASIA-PACIFIC (25 countries)
    ("India", ["Delhi", "Mumbai", "Bangalore", "Goa", "Jaipur", "Chennai", "Kolkata", "Hyderabad"]),
    ("China", ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Xi'an", "Suzhou"]),
    ("Japan", ["Tokyo", "Osaka", "Kyoto", "Hiroshima", "Fukuoka", "Sapporo", "Yokohama", "Kobe"]),
    ("South Korea", ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Jeju City"]),
    ("Thailand", ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Hua Hin", "Koh Samui"]),
    ("Indonesia", ["Jakarta", "Bali", "Surabaya", "Bandung", "Medan", "Yogyakarta", "Semarang"]),
    ("Malaysia", ["Kuala Lumpur", "Penang", "Johor Bahru", "Melaka", "Kota Kinabalu", "Kuching"]),
    ("Singapore", ["Singapore"]),
    ("Philippines", ["Manila", "Cebu", "Davao", "Boracay", "Palawan", "Baguio", "Iloilo"]),
    ("Vietnam", ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hoi An", "Nha Trang", "Hue", "Can Tho"]),
    ("Cambodia", ["Phnom Penh", "Siem Reap", "Sihanoukville", "Battambang"]),
    ("Laos", ["Vientiane", "Luang Prabang", "Pakse", "Savannakhet"]),
    ("Myanmar", ["Yangon", "Mandalay", "Naypyidaw", "Bagan"]),
    ("Sri Lanka", ["Colombo", "Kandy", "Galle", "Negombo", "Anuradhapura"]),
    ("Bangladesh", ["Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi"]),
    ("Nepal", ["Kathmandu", "Pokhara", "Chitwan", "Lumbini"]),
    ("Pakistan", ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi"]),
    ("Australia", ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra"]),
    ("New Zealand", ["Auckland", "Wellington", "Christchurch", "Queenstown", "Rotorua"]),
    ("South Africa", ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth"]),
    ("Taiwan", ["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu"]),
    ("Hong Kong", ["Hong Kong"]),
    ("Macau", ["Macau"]),
    ("Fiji", ["Suva", "Nadi", "Lautoka"]),
    ("Maldives", ["Male", "Hulhumale"]),

    # EUROPE (35 countries)
    ("France", ["Paris", "Lyon", "Marseille", "Nice", "Toulouse", "Bordeaux", "Cannes", "Strasbourg"]),
    ("Germany", ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Dresden"]),
    ("Italy", ["Rome", "Milan", "Florence", "Venice", "Naples", "Turin", "Bologna", "Palermo"]),
    ("Spain", ["Madrid", "Barcelona", "Seville", "Valencia", "Bilbao", "Granada", "Cordoba", "Toledo"]),
    ("United Kingdom", ["London", "Manchester", "Edinburgh", "Liverpool", "Birmingham", "Glasgow", "Bristol", "Bath"]),
    ("Netherlands", ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg"]),
    ("Switzerland", ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lucerne", "St. Moritz"]),
    ("Austria", ["Vienna", "Salzburg", "Innsbruck", "Graz", "Linz"]),
    ("Belgium", ["Brussels", "Antwerp", "Ghent", "Bruges", "Liege"]),
    ("Portugal", ["Lisbon", "Porto", "Faro", "Braga", "Coimbra"]),
    ("Greece", ["Athens", "Thessaloniki", "Patras", "Heraklion", "Mykonos", "Santorini"]),
    ("Czech Republic", ["Prague", "Brno", "Ostrava", "Plzen", "Ceske Budejovice"]),
    ("Poland", ["Warsaw", "Krakow", "Gdansk", "Wroclaw", "Poznan", "Lodz"]),
    ("Hungary", ["Budapest", "Debrecen", "Szeged", "Pecs", "Gyor"]),
    ("Romania", ["Bucharest", "Cluj-Napoca", "Timisoara", "Iasi", "Constanta"]),
    ("Croatia", ["Zagreb", "Split", "Dubrovnik", "Rijeka", "Pula"]),
    ("Slovenia", ["Ljubljana", "Maribor", "Celje", "Kranj"]),
    ("Slovakia", ["Bratislava", "Kosice", "Presov", "Zilina"]),
    ("Bulgaria", ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse"]),
    ("Serbia", ["Belgrade", "Novi Sad", "Nis", "Kragujevac"]),
    ("Bosnia and Herzegovina", ["Sarajevo", "Banja Luka", "Tuzla", "Mostar"]),
    ("Montenegro", ["Podgorica", "Cetinje", "Niksic", "Budva"]),
    ("North Macedonia", ["Skopje", "Bitola", "Prilep", "Tetovo"]),
    ("Albania", ["Tirana", "Durres", "Vlore", "Shkoder"]),
    ("Norway", ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromso"]),
    ("Sweden", ["Stockholm", "Gothenburg", "Malmo", "Uppsala", "Vasteras"]),
    ("Denmark", ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg"]),
    ("Finland", ["Helsinki", "Tampere", "Turku", "Oulu", "Jyvaskyla"]),
    ("Iceland", ["Reykjavik", "Akureyri", "Keflavik", "Hafnarfjordur"]),
    ("Ireland", ["Dublin", "Cork", "Galway", "Limerick", "Waterford"]),
    ("Estonia", ["Tallinn", "Tartu", "Narva", "Parnu"]),
    ("Latvia", ["Riga", "Daugavpils", "Liepaja", "Jelgava"]),
    ("Lithuania", ["Vilnius", "Kaunas", "Klaipeda", "Siauliai"]),
    ("Luxembourg", ["Luxembourg City", "Esch-sur-Alzette", "Differdange"]),
    ("Malta", ["Valletta", "Sliema", "St. Julian's", "Mdina"]),

    # NORTH AMERICA (5 countries)
    ("USA", ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "San Francisco", "Boston", "Washington DC"]),
    ("Canada", ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Quebec City", "Winnipeg"]),
    ("Mexico", ["Mexico City", "Cancun", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Playa del Carmen"]),
    ("Costa Rica", ["San Jose", "Manuel Antonio", "Tamarindo", "Monteverde", "La Fortuna"]),
    ("Panama", ["Panama City", "Colon", "David", "Santiago"]),

    # SOUTH AMERICA (12 countries)
    ("Brazil", ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus"]),
    ("Argentina", ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata"]),
    ("Chile", ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta"]),
    ("Colombia", ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga"]),
    ("Peru", ["Lima", "Cusco", "Arequipa", "Trujillo", "Chiclayo", "Iquitos"]),
    ("Ecuador", ["Quito", "Guayaquil", "Cuenca", "Ambato", "Manta"]),
    ("Bolivia", ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí"]),
    ("Uruguay", ["Montevideo", "Salto", "Paysandú", "Las Piedras"]),
    ("Paraguay", ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque"]),
    ("Venezuela", ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay"]),
    ("Guyana", ["Georgetown", "Linden", "New Amsterdam", "Corriverton"]),
    ("Suriname", ["Paramaribo", "Lelydorp", "Nieuw Nickerie", "Moengo"]),

    # MIDDLE EAST (13 countries)
    ("United Arab Emirates", ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"]),
    ("Saudi Arabia", ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar"]),
    ("Turkey", ["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Adana", "Gaziantep"]),
    ("Israel", ["Tel Aviv", "Jerusalem", "Haifa", "Rishon LeZion", "Petah Tikva"]),
    ("Jordan", ["Amman", "Zarqa", "Irbid", "Russeifa", "Aqaba"]),
    ("Lebanon", ["Beirut", "Tripoli", "Sidon", "Tyre", "Nabatieh"]),
    ("Qatar", ["Doha", "Al Rayyan", "Umm Salal", "Al Khor"]),
    ("Kuwait", ["Kuwait City", "Hawalli", "Salmiya", "Sabah Al Salem"]),
    ("Bahrain", ["Manama", "Riffa", "Muharraq", "Hamad Town"]),
    ("Oman", ["Muscat", "Seeb", "Salalah", "Bawshar", "Sohar"]),
    ("Iran", ["Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz", "Tabriz"]),
    ("Iraq", ["Baghdad", "Basra", "Erbil", "Najaf", "Karbala"]),
    ("Syria", ["Damascus", "Aleppo", "Homs", "Latakia", "Hama"]),

    # AFRICA (10 countries)
    ("Egypt", ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Hurghada", "Luxor"]),
    ("Morocco", ["Casablanca", "Rabat", "Marrakech", "Fez", "Tangier", "Agadir"]),
    ("Tunisia", ["Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan"]),
    ("Kenya", ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]),
    ("Tanzania", ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya"]),
    ("Ghana", ["Accra", "Kumasi", "Tamale", "Sekondi-Takoradi", "Ashaiman"]),
    ("Nigeria", ["Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City"]),
    ("Ethiopia", ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Adama"]),
    ("Zimbabwe", ["Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru"]),
    ("Botswana", ["Gaborone", "Francistown", "Molepolole", "Maun", "Serowe"]),
    ]

    # Alternative: If you want exactly 100 countries, here's a more focused list
    top_100_countries_focused = [
    # ASIA-PACIFIC (30 countries)
    ("India", ["Delhi", "Mumbai", "Bangalore", "Goa", "Jaipur", "Chennai", "Kolkata"]),
    ("China", ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou"]),
    ("Japan", ["Tokyo", "Osaka", "Kyoto", "Hiroshima", "Fukuoka", "Sapporo"]),
    ("South Korea", ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Jeju City"]),
    ("Thailand", ["Bangkok", "Chiang Mai", "Phuket", "Pattaya", "Krabi", "Hua Hin"]),
    ("Indonesia", ["Jakarta", "Bali", "Surabaya", "Bandung", "Medan", "Yogyakarta"]),
    ("Malaysia", ["Kuala Lumpur", "Penang", "Johor Bahru", "Melaka", "Kota Kinabalu"]),
    ("Singapore", ["Singapore"]),
    ("Philippines", ["Manila", "Cebu", "Davao", "Boracay", "Palawan", "Baguio"]),
    ("Vietnam", ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hoi An", "Nha Trang"]),
    ("Cambodia", ["Phnom Penh", "Siem Reap", "Sihanoukville", "Battambang"]),
    ("Laos", ["Vientiane", "Luang Prabang", "Pakse", "Savannakhet"]),
    ("Myanmar", ["Yangon", "Mandalay", "Naypyidaw", "Bagan"]),
    ("Sri Lanka", ["Colombo", "Kandy", "Galle", "Negombo", "Anuradhapura"]),
    ("Bangladesh", ["Dhaka", "Chittagong", "Sylhet", "Khulna"]),
    ("Nepal", ["Kathmandu", "Pokhara", "Chitwan", "Lumbini"]),
    ("Pakistan", ["Karachi", "Lahore", "Islamabad", "Faisalabad"]),
    ("Australia", ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"]),
    ("New Zealand", ["Auckland", "Wellington", "Christchurch", "Queenstown"]),
    ("South Africa", ["Cape Town", "Johannesburg", "Durban", "Pretoria"]),
    ("Taiwan", ["Taipei", "Kaohsiung", "Taichung", "Tainan"]),
    ("Hong Kong", ["Hong Kong"]),
    ("Macau", ["Macau"]),
    ("Fiji", ["Suva", "Nadi", "Lautoka"]),
    ("Maldives", ["Male", "Hulhumale"]),
    ("Mongolia", ["Ulaanbaatar", "Erdenet", "Darkhan"]),
    ("Uzbekistan", ["Tashkent", "Samarkand", "Namangan", "Andijan"]),
    ("Kazakhstan", ["Almaty", "Nur-Sultan", "Shymkent", "Aktobe"]),
    ("Kyrgyzstan", ["Bishkek", "Osh", "Jalal-Abad", "Karakol"]),
    ("Tajikistan", ["Dushanbe", "Khujand", "Kulob", "Qurghonteppa"]),

    # EUROPE (40 countries)
    ("France", ["Paris", "Lyon", "Marseille", "Nice", "Toulouse", "Bordeaux"]),
    ("Germany", ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"]),
    ("Italy", ["Rome", "Milan", "Florence", "Venice", "Naples", "Turin"]),
    ("Spain", ["Madrid", "Barcelona", "Seville", "Valencia", "Bilbao", "Granada"]),
    ("United Kingdom", ["London", "Manchester", "Edinburgh", "Liverpool", "Birmingham"]),
    ("Netherlands", ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"]),
    ("Switzerland", ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"]),
    ("Austria", ["Vienna", "Salzburg", "Innsbruck", "Graz", "Linz"]),
    ("Belgium", ["Brussels", "Antwerp", "Ghent", "Bruges", "Liege"]),
    ("Portugal", ["Lisbon", "Porto", "Faro", "Braga", "Coimbra"]),
    ("Greece", ["Athens", "Thessaloniki", "Patras", "Heraklion", "Mykonos"]),
    ("Czech Republic", ["Prague", "Brno", "Ostrava", "Plzen"]),
    ("Poland", ["Warsaw", "Krakow", "Gdansk", "Wroclaw", "Poznan"]),
    ("Hungary", ["Budapest", "Debrecen", "Szeged", "Pecs"]),
    ("Romania", ["Bucharest", "Cluj-Napoca", "Timisoara", "Iasi"]),
    ("Croatia", ["Zagreb", "Split", "Dubrovnik", "Rijeka"]),
    ("Slovenia", ["Ljubljana", "Maribor", "Celje", "Kranj"]),
    ("Slovakia", ["Bratislava", "Kosice", "Presov", "Zilina"]),
    ("Bulgaria", ["Sofia", "Plovdiv", "Varna", "Burgas"]),
    ("Serbia", ["Belgrade", "Novi Sad", "Nis", "Kragujevac"]),
    ("Bosnia and Herzegovina", ["Sarajevo", "Banja Luka", "Tuzla", "Mostar"]),
    ("Montenegro", ["Podgorica", "Cetinje", "Niksic", "Budva"]),
    ("North Macedonia", ["Skopje", "Bitola", "Prilep", "Tetovo"]),
    ("Albania", ["Tirana", "Durres", "Vlore", "Shkoder"]),
    ("Norway", ["Oslo", "Bergen", "Trondheim", "Stavanger"]),
    ("Sweden", ["Stockholm", "Gothenburg", "Malmo", "Uppsala"]),
    ("Denmark", ["Copenhagen", "Aarhus", "Odense", "Aalborg"]),
    ("Finland", ["Helsinki", "Tampere", "Turku", "Oulu"]),
    ("Iceland", ["Reykjavik", "Akureyri", "Keflavik"]),
    ("Ireland", ["Dublin", "Cork", "Galway", "Limerick"]),
    ("Estonia", ["Tallinn", "Tartu", "Narva", "Parnu"]),
    ("Latvia", ["Riga", "Daugavpils", "Liepaja", "Jelgava"]),
    ("Lithuania", ["Vilnius", "Kaunas", "Klaipeda", "Siauliai"]),
    ("Luxembourg", ["Luxembourg City", "Esch-sur-Alzette"]),
    ("Malta", ["Valletta", "Sliema", "St. Julian's"]),
    ("Cyprus", ["Nicosia", "Limassol", "Larnaca", "Paphos"]),
    ("Moldova", ["Chisinau", "Tiraspol", "Balti", "Bender"]),
    ("Ukraine", ["Kiev", "Kharkiv", "Odessa", "Dnipro"]),
    ("Belarus", ["Minsk", "Gomel", "Mogilev", "Vitebsk"]),
    ("Russia", ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg"]),

    # NORTH AMERICA (8 countries)
    ("USA", ["New York", "Los Angeles", "Chicago", "Miami", "Las Vegas", "San Francisco"]),
    ("Canada", ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"]),
    ("Mexico", ["Mexico City", "Cancun", "Guadalajara", "Monterrey", "Puebla"]),
    ("Guatemala", ["Guatemala City", "Antigua", "Quetzaltenango", "Escuintla"]),
    ("Belize", ["Belize City", "San Ignacio", "Orange Walk", "Dangriga"]),
    ("Honduras", ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba"]),
    ("Nicaragua", ["Managua", "Leon", "Granada", "Masaya"]),
    ("Costa Rica", ["San Jose", "Manuel Antonio", "Tamarindo", "Monteverde"]),

    # SOUTH AMERICA (12 countries)
    ("Brazil", ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza"]),
    ("Argentina", ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata"]),
    ("Chile", ["Santiago", "Valparaíso", "Concepción", "La Serena"]),
    ("Colombia", ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena"]),
    ("Peru", ["Lima", "Cusco", "Arequipa", "Trujillo", "Chiclayo"]),
    ("Ecuador", ["Quito", "Guayaquil", "Cuenca", "Ambato"]),
    ("Bolivia", ["La Paz", "Santa Cruz", "Cochabamba", "Oruro"]),
    ("Uruguay", ["Montevideo", "Salto", "Paysandú", "Las Piedras"]),
    ("Paraguay", ["Asunción", "Ciudad del Este", "San Lorenzo"]),
    ("Venezuela", ["Caracas", "Maracaibo", "Valencia", "Barquisimeto"]),
    ("Guyana", ["Georgetown", "Linden", "New Amsterdam"]),
    ("Suriname", ["Paramaribo", "Lelydorp", "Nieuw Nickerie"]),

    # AFRICA (10 countries)
    ("Egypt", ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Hurghada"]),
    ("Morocco", ["Casablanca", "Rabat", "Marrakech", "Fez", "Tangier"]),
    ("Tunisia", ["Tunis", "Sfax", "Sousse", "Ettadhamen"]),
    ("Kenya", ["Nairobi", "Mombasa", "Kisumu", "Nakuru"]),
    ("Tanzania", ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma"]),
    ("Ghana", ["Accra", "Kumasi", "Tamale", "Sekondi-Takoradi"]),
    ("Nigeria", ["Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt"]),
    ("Ethiopia", ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar"]),
    ("Zimbabwe", ["Harare", "Bulawayo", "Chitungwiza", "Mutare"]),
    ("Botswana", ["Gaborone", "Francistown", "Molepolole", "Maun"]),
    ]

    
    # Initialize scraper
    scraper = EnhancedHotelScraper(headless=False, delay_range=(3, 7))
    
    try:
        # Scrape hotels (100 per country)
        all_hotels = scraper.scrape_multiple_cities(cities_to_scrape, hotels_per_country=100)
        
        # Save data
        scraper.save_data(all_hotels, "enhanced_hotels_dataset.csv")
        
    except Exception as e:
        logging.error(f"Main execution error: {str(e)}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main()