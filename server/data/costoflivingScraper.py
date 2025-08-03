import time
import random
import pandas as pd
import numpy as np
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import logging
from datetime import datetime
import json
import re
from typing import List, Dict, Any, Tuple
from enum import Enum

class NumbeoXPath(Enum):
    COST_OF_LIVING_INDEX = "//td[contains(text(), 'Cost of Living Index')]/following-sibling::td"
    RENT_INDEX = "//td[contains(text(), 'Rent Index')]/following-sibling::td"
    COST_PLUS_RENT_INDEX = "//td[contains(text(), 'Cost of Living Plus Rent Index')]/following-sibling::td"
    GROCERIES_INDEX = "//td[contains(text(), 'Groceries Index')]/following-sibling::td"
    RESTAURANT_PRICE_INDEX = "//td[contains(text(), 'Restaurant Price Index')]/following-sibling::td"
    LOCAL_PURCHASING_POWER_INDEX = "//td[contains(text(), 'Local Purchasing Power Index')]/following-sibling::td"

class CostOfLivingScraper:
    def __init__(self, headless: bool = True, delay_range: Tuple[int, int] = (2, 5)):
        self.setup_logging()
        self.delay_range = delay_range
        self.driver = self.setup_driver(headless)
        self.cost_data: List[Dict[str, Any]] = []

    def setup_logging(self) -> None:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('cost_of_living_scraper.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def setup_driver(self, headless: bool) -> webdriver.Chrome:
        options = Options()
        if headless:
            options.add_argument('--headless')

        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver

    def random_delay(self) -> None:
        delay = random.uniform(*self.delay_range)
        time.sleep(delay)

    def scrape_numbeo_data(self, countries: List[str]) -> List[Dict[str, Any]]:
        self.logger.info("Starting to scrape Numbeo cost of living data")
        base_url = "https://www.numbeo.com/cost-of-living/country_result.jsp?country="

        for country in countries:
            try:
                self.logger.info(f"Scraping cost of living for {country}")
                country_url = country.replace(" ", "+")
                url = f"{base_url}{country_url}"
                
                self.driver.get(url)
                self.random_delay()
                
                country_data = self.extract_numbeo_data(country)
                if country_data:
                    self.cost_data.append(country_data)
                    self.logger.info(f"Successfully scraped {country}")
                else:
                    self.logger.warning(f"No data found for {country}")
            except Exception as e:
                self.logger.error(f"Error scraping {country}: {e}")
                continue
        return self.cost_data

    def extract_numbeo_data(self, country: str) -> Dict[str, Any] | None:
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "data_wide_table"))
            )
            
            data: Dict[str, Any] = {
                "Country": country,
                "Scraped_Date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Source": "Numbeo"
            }
            
            for index_name, xpath_enum in {
                "Cost_of_Living_Index": NumbeoXPath.COST_OF_LIVING_INDEX,
                "Rent_Index": NumbeoXPath.RENT_INDEX,
                "Cost_of_Living_Plus_Rent_Index": NumbeoXPath.COST_PLUS_RENT_INDEX,
                "Groceries_Index": NumbeoXPath.GROCERIES_INDEX,
                "Restaurant_Price_Index": NumbeoXPath.RESTAURANT_PRICE_INDEX,
                "Local_Purchasing_Power_Index": NumbeoXPath.LOCAL_PURCHASING_POWER_INDEX,
            }.items():
                try:
                    element = self.driver.find_element(By.XPATH, xpath_enum.value)
                    data[index_name] = self.clean_numeric(element.text)
                except NoSuchElementException:
                    data[index_name] = "N/A"
            
            data.update(self.extract_detailed_costs())
            return data
        except TimeoutException:
            self.logger.error(f"Timeout waiting for data table for {country}")
            return None
        except Exception as e:
            self.logger.error(f"Error extracting data for {country}: {e}")
            return None

    def extract_detailed_costs(self) -> Dict[str, Any]:
        detailed_costs: Dict[str, Any] = {}
        cost_items = {
            "Meal_Inexpensive_Restaurant_USD": "Meal, Inexpensive Restaurant",
            "Meal_for_2_Mid_Range_Restaurant_USD": "Meal for 2 People, Mid-range Restaurant",
            "McMeal_at_McDonalds_USD": "McMeal at McDonalds",
            "Domestic_Beer_0_5L_USD": "Domestic Beer (0.5 liter draught)",
            "Imported_Beer_0_33L_USD": "Imported Beer (0.33 liter bottle)",
            "Cappuccino_USD": "Cappuccino",
            "Coke_0_33L_USD": "Coke/Pepsi (0.33 liter bottle)",
            "Water_0_33L_USD": "Water (0.33 liter bottle)",
            "Milk_1L_USD": "Milk (regular), (1 liter)",
            "Bread_500g_USD": "Loaf of Fresh White Bread (500g)",
            "Rice_1kg_USD": "Rice (white), (1kg)",
            "Eggs_12_USD": "Eggs (regular) (12)",
            "Cheese_1kg_USD": "Local Cheese (1kg)",
            "Chicken_Fillets_1kg_USD": "Chicken Fillets (1kg)",
            "Beef_Round_1kg_USD": "Beef Round (1kg)",
            "Apples_1kg_USD": "Apples (1kg)",
            "Banana_1kg_USD": "Banana (1kg)",
            "Oranges_1kg_USD": "Oranges (1kg)",
            "Tomato_1kg_USD": "Tomato (1kg)",
            "Potato_1kg_USD": "Potato (1kg)",
            "Onion_1kg_USD": "Onion (1kg)",
            "Lettuce_1head_USD": "Lettuce (1 head)",
            "Water_1_5L_USD": "Water (1.5 liter bottle)",
            "Bottle_of_Wine_Mid_Range_USD": "Bottle of Wine (Mid-Range)",
            "Domestic_Beer_0_5L_Market_USD": "Domestic Beer (0.5 liter bottle)",
            "Imported_Beer_0_33L_Market_USD": "Imported Beer (0.33 liter bottle)",
            "Cigarettes_20_Pack_USD": "Cigarettes 20 Pack (Marlboro)",
            "One_way_Ticket_Local_Transport_USD": "One-way Ticket (Local Transport)",
            "Monthly_Pass_Regular_Price_USD": "Monthly Pass (Regular Price)",
            "Taxi_Start_Normal_Tariff_USD": "Taxi Start (Normal Tariff)",
            "Taxi_1km_Normal_Tariff_USD": "Taxi 1km (Normal Tariff)",
            "Taxi_1hour_Waiting_USD": "Taxi 1hour Waiting (Normal Tariff)",
            "Gasoline_1L_USD": "Gasoline (1 liter)",
            "Volkswagen_Golf_1_4_90_KW_USD": "Volkswagen Golf 1.4 90 KW",
            "Apartment_1_Bedroom_City_Centre_USD": "Apartment (1 bedroom) in City Centre",
            "Apartment_1_Bedroom_Outside_Centre_USD": "Apartment (1 bedroom) Outside of Centre",
            "Apartment_3_Bedrooms_City_Centre_USD": "Apartment (3 bedrooms) in City Centre",
            "Apartment_3_Bedrooms_Outside_Centre_USD": "Apartment (3 bedrooms) Outside of Centre",
            "Basic_Utilities_85m2_USD": "Basic (Electricity, Heating, Cooling, Water, Garbage) for 85m2 Apartment",
            "1_min_Prepaid_Mobile_Tariff_USD": "1 min. of Prepaid Mobile Tariff Local",
            "Internet_60_Mbps_USD": "Internet (60 Mbps or More, Unlimited Data, Cable/ADSL)",
            "Fitness_Club_Monthly_Fee_USD": "Fitness Club, Monthly Fee for 1 Adult",
            "Tennis_Court_Rent_1_Hour_USD": "Tennis Court Rent (1 Hour on Weekend)",
            "Cinema_International_Release_USD": "Cinema, International Release, 1 Seat",
            "Preschool_Private_Monthly_USD": "Preschool (or Kindergarten), Private, Monthly for 1 Child",
            "International_Primary_School_Yearly_USD": "International Primary School, Yearly for 1 Child"
        }
        
        for key, search_text in cost_items.items():
            try:
                cost_element = self.driver.find_element(By.XPATH, f"//td[contains(text(), '{search_text}')]/following-sibling::td")
                detailed_costs[key] = self.clean_numeric(cost_element.text)
            except NoSuchElementException:
                detailed_costs[key] = "N/A"
        return detailed_costs

    def clean_numeric(self, value: str) -> float | str:
        if not value or value.strip().upper() == "N/A":
            return "N/A"
        
        numeric_value = re.sub(r'[^\d.,]', '', value)
        numeric_value = numeric_value.replace(',', '')
        
        try:
            return float(numeric_value)
        except ValueError:
            return "N/A"

    def scrape_alternative_sources(self, countries: List[str]) -> None:
        self.logger.info("Scraping alternative cost of living sources")
        for country in countries:
            try:
                additional_data = self.get_economic_indicators(country)
                for i, data in enumerate(self.cost_data):
                    if data["Country"] == country:
                        self.cost_data[i].update(additional_data)
                        break
            except Exception as e:
                self.logger.error(f"Error getting additional data for {country}: {e}")
                continue

    def get_economic_indicators(self, country: str) -> Dict[str, Any]:
        return {
            "GDP_Per_Capita_USD": "N/A",
            "Inflation_Rate_Percent": "N/A",
            "Unemployment_Rate_Percent": "N/A",
            "Average_Monthly_Salary_USD": "N/A",
            "Minimum_Wage_USD": "N/A"
        }

    def save_data(self, filename: str = "cost_of_living_dataset.csv", save_json: bool = True) -> None:
        if not self.cost_data:
            self.logger.warning("No data to save")
            return
            
        df = pd.DataFrame(self.cost_data)
        df.to_csv(filename, index=False)
        self.logger.info(f"Data saved to {filename}")
        
        if save_json:
            json_filename = filename.replace('.csv', '.json')
            with open(json_filename, 'w', encoding='utf-8') as f:
                json.dump(self.cost_data, f, indent=2, ensure_ascii=False)
            self.logger.info(f"Data also saved to {json_filename}")
            
        self.print_summary(df)

    def print_summary(self, df: pd.DataFrame) -> None:
        self.logger.info("\n" + "="*50)
        self.logger.info("COST OF LIVING SCRAPING SUMMARY")
        self.logger.info("="*50)
        self.logger.info(f"Total countries scraped: {len(df)}")
        self.logger.info(f"Data points per country: {len(df.columns)}")
        
        if "Cost_of_Living_Index" in df.columns:
            avg_col = df["Cost_of_Living_Index"].replace("N/A", np.nan).astype(float).mean()
            self.logger.info(f"Average Cost of Living Index: {avg_col:.2f}")
            
        if "Cost_of_Living_Index" in df.columns:
            # Ensure "Cost_of_Living_Index" is numeric for sorting
            df_numeric_col = df[df["Cost_of_Living_Index"] != "N/A"].copy()
            df_numeric_col["Cost_of_Living_Index"] = pd.to_numeric(df_numeric_col["Cost_of_Living_Index"])
            
            if not df_numeric_col.empty:
                top_expensive = df_numeric_col.nlargest(5, "Cost_of_Living_Index")["Country"].tolist()
                self.logger.info(f"Top 5 most expensive countries: {', '.join(top_expensive)}")
            else:
                self.logger.info("Not enough numeric Cost of Living Index data to determine top 5.")
                
        self.logger.info("="*50)

    def close(self) -> None:
        if self.driver:
            self.driver.quit()
            self.logger.info("Driver closed")

COUNTRIES_LIST: List[str] = [
    "United States", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Peru",
    "United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands", "Switzerland", "Austria",
    "Belgium", "Portugal", "Greece", "Czech Republic", "Poland", "Hungary", "Romania", "Croatia",
    "Slovenia", "Slovakia", "Bulgaria", "Serbia", "Norway", "Sweden", "Denmark", "Finland",
    "Iceland", "Ireland", "Estonia", "Latvia", "Lithuania", "Russia", "Ukraine", "Belarus",
    "China", "Japan", "South Korea", "India", "Thailand", "Indonesia", "Malaysia", "Singapore",
    "Philippines", "Vietnam", "Cambodia", "Laos", "Myanmar", "Sri Lanka", "Bangladesh", "Nepal",
    "Pakistan", "Australia", "New Zealand", "South Africa", "Taiwan", "Hong Kong", "Macau",
    "United Arab Emirates", "Saudi Arabia", "Turkey", "Israel", "Jordan", "Lebanon", "Qatar",
    "Kuwait", "Bahrain", "Oman", "Iran", "Iraq", "Egypt", "Morocco", "Tunisia", "Kenya",
    "Tanzania", "Ghana", "Nigeria", "Ethiopia", "Zimbabwe", "Botswana", "Costa Rica", "Panama",
    "Guatemala", "Belize", "Honduras", "Nicaragua", "Uruguay", "Paraguay", "Venezuela", "Guyana",
    "Suriname", "Ecuador", "Bolivia", "Luxembourg", "Malta", "Cyprus", "Moldova", "Albania",
    "Montenegro", "North Macedonia", "Bosnia and Herzegovina", "Mongolia", "Uzbekistan", "Kazakhstan"
]

def main() -> None:
    scraper = CostOfLivingScraper(headless=False, delay_range=(3, 6))
    try:
        scraper.scrape_numbeo_data(COUNTRIES_LIST)
        scraper.scrape_alternative_sources(COUNTRIES_LIST)
        scraper.save_data("cost_of_living_dataset.csv")
        
        print("\n✅ Cost of Living data scraping completed successfully!")
        print("📊 Files created:")
        print("   - cost_of_living_dataset.csv")
        print("   - cost_of_living_dataset.json")
        print("   - cost_of_living_scraper.log")
        
    except Exception as e:
        logging.error(f"Main execution error: {e}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main()