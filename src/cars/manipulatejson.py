from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import re
import json

with open('data.json', 'r') as data_file:
    data = json.load(data_file)

# Path to your WebDriver executable
CHROMEDRIVER_PATH = "T:\chromedriver.exe"

# Set up Selenium options
chrome_options = Options()
#chrome_options.add_argument('--headless')  # Run in headless mode (no GUI)
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument("--start-maximized")

# Initialize the WebDriver
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(executable_path=CHROMEDRIVER_PATH, options=chrome_options)

driver.get('https://citybee.lv/lv/pakas/')

time.sleep(10)
driver.execute_script("window.scrollTo(0, 1000);")
time.sleep(2)

for i in range(1, 47):
    pack_duration = driver.find_element(By.XPATH, '//*[@id="main"]/section[3]/div/div/div[1]/div[3]/div[1]/div[1]/div[2]/div/div/div['+str(i)+']/p')
    pack_price = driver.find_element(By.XPATH, '//*[@id="main"]/section[3]/div/div/div[1]/div[3]/div[1]/div[2]/div[2]/div/div/div['+str(i)+']/div[1]')
    next_button = driver.find_element(By.XPATH, '//*[@id="main"]/section[3]/div/div/div[1]/div[1]/div[2]')
    try:
        next_button.click()
    except:  # noqa: E722
        pass

    pack_duration_text = pack_duration.text
    pack_duration_text = pack_duration_text.strip()
    duration_parts = pack_duration_text.split('+')
    if 'MIN.' in duration_parts[0]:
        time_value = int(re.search(r'\d+', duration_parts[0]).group())
        time_value = time_value/60
    elif 'D' in duration_parts[0]:
        time_value = int(re.search(r'\d+', duration_parts[0]).group())
        time_value = time_value*24
    else:
        time_value = int(re.search(r'\d+', duration_parts[0]).group())
    distance_value = int(re.search(r'\d+', duration_parts[1]).group())
    
    pack_price_text = pack_price.text
    cleaned_price = float(pack_price_text.strip().replace('€', ''))

    package = {
        "name": pack_duration_text,
        "duration": time_value,
        "included_distance": distance_value,
        "price": cleaned_price
    }

    data['companies'][0]['cars'][0]['trip_packages'].append(package)

    print("Pack duration: ", pack_duration.text)
    print("Pack price: ", pack_price.text)
    print('-'*20)

driver.quit()

with open('updated_rental_data.json', 'w') as file:
    json.dump(data, file, indent=2)