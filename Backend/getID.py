from selenium import webdriver
import urllib.request
from selenium.webdriver.common.by import By
from time import sleep
from urllib.request import urlopen
from selenium import webdriver
#from selenium.webdriver.support.ui import WebDriverWait
#from selenium.webdriver.support import expected_conditions as EC
import csv 
import sys
from csv import writer


q = sys.argv[1];
driver = webdriver.Chrome()
driver.get('https://www.youtube.com/results?search_query='+q)
sleep(1)

video = driver.find_elements(By.ID,'video-title')
url = None
i = 0
while url is None:
    url = video[i].get_attribute('href')
    i=i+1
id1 = url.split('/')
id2 = id1[3].split('=')
id3 = id2[1]
id4 = id3.split('&')
id5 = id4[0]
#print(id2[1])

row = [q, id5]
with open(r'C:\Users\SeanM\Desktop\MusicPlayer\authorization_code\videoIds.csv', 'a',newline='') as f_object:
 
    # Pass this file object to csv.writer()
    # and get a writer object
    writer_object = writer(f_object)
 
    # Pass the list as an argument into
    # the writerow()
    writer_object.writerow(row)
 
    # Close the file object
    f_object.close()

