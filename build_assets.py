#!/usr/bin/env python3
"""Build optimised WebP assets for the portfolio site."""
import os, sys
from PIL import Image

import os
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = f'{ROOT}/src'
OUT = f'{ROOT}/dist/assets'
os.makedirs(OUT, exist_ok=True)

Image.MAX_IMAGE_PIXELS = None

def save(im, name, q=82):
    path = os.path.join(OUT, name + '.webp')
    im.save(path, 'WEBP', quality=q, method=6)
    print(f'{name:36s} {im.width}x{im.height} {os.path.getsize(path)//1024} KB')

def load(rel):
    return Image.open(os.path.join(SRC, rel))

def fit_width(im, w):
    if im.width == w: return im
    h = round(im.height * w / im.width)
    return im.resize((w, h), Image.LANCZOS)

def desktop(rel, name, w=1600, max_h=None, crop_top=None, q=80):
    im = load(rel).convert('RGB')
    if crop_top:
        im = im.crop((0, 0, im.width, min(im.height, round(im.width * crop_top))))
    im = fit_width(im, w)
    if max_h and im.height > max_h:
        im = im.crop((0, 0, im.width, max_h))
    save(im, name, q)

def mobile(rel, name, w=480, max_h=None, q=80):
    im = load(rel).convert('RGB')
    if im.width < w: w = im.width
    im = fit_width(im, w)
    if max_h and im.height > max_h:
        im = im.crop((0, 0, im.width, max_h))
    save(im, name, q)

def gallery(rel, name, w=1200, crop=None, q=80):
    im = load(rel).convert('RGB')
    if crop:
        im = im.crop(crop)
    im = fit_width(im, w)
    save(im, name, q)

# ---------- Demping Pro ----------
for n in ['login','shops','products','competitors','bot','stats','logger','tariff']:
    desktop(f'dp/{n}.png', f'dp-{n}')
for n in ['login','shops','products','competitors']:
    mobile(f'dp/m-{n}.png', f'dp-m-{n}', max_h=2200)
# brand carousel (1080x1350) -> crop square-ish
for i in [1,2,3,5,6]:
    gallery(f'dpbrand/logo-{i}.png', f'dp-brand-{i}', w=1000)
gallery('dpbrand/dashboard-mockup.png', 'dp-mockup', w=1000)

# ---------- Cargo ----------
for n in ['onboarding','register','home','parcels','parcel-info','education','profile','barcode']:
    mobile(f'cargo/m-{n}.png', f'cargo-m-{n}', max_h=2400)
desktop('cargo/structure.png', 'cargo-structure', w=2400, q=70)

# ---------- AutoBir ----------
for n in ['home','explore','service-details','receipt','bookings','wallet']:
    mobile(f'autobir/m-{n}.png', f'autobir-m-{n}', max_h=2400)
desktop('autobir-admin/Главный админ.png', 'autobir-admin-old', w=1600)
desktop('autobir-admin/Заявки.png', 'autobir-admin-old-requests', w=1600)
desktop('autobir-admin/Desktop - 1.png', 'autobir-admin-login', w=1600)
desktop('autobir-admin/Desktop - 2.png', 'autobir-admin-dashboard', w=1600)
desktop('autobir-admin/Desktop - 3.png', 'autobir-admin-washes', w=1600)
desktop('autobir-admin/Desktop - 4.png', 'autobir-admin-users', w=1600)
desktop('autobir-admin/Структура.png', 'autobir-structure', w=1600)
desktop('autobir-admin/Group 1171275158.png', 'autobir-admin-structure', w=2400, q=70)

# ---------- Bai Group ----------
desktop('baigroup/home.png', 'bai-home', w=1600, max_h=7000)
desktop('baigroup/tours-abroad.png', 'bai-tours', w=1600, max_h=6000)
desktop('baigroup/about.png', 'bai-about', w=1600, max_h=6000)
desktop('baigroup/thailand.png', 'bai-thailand', w=1600, max_h=6000)
desktop('baigroup/flights.png', 'bai-flights', w=1600)
mobile('baigroup/m-home.png', 'bai-m-home', max_h=5000)
mobile('baigroup/m-flights.png', 'bai-m-flights', max_h=3600)
mobile('baigroup/m-insurance.png', 'bai-m-insurance', max_h=3600)
# UI kit: crop the top-left 6000x4000 region to show at 1600
im = load('baigroup/ui-kit.png').convert('RGB')
im = im.crop((0, 0, 6800, 4400)); im = fit_width(im, 1600); save(im, 'bai-uikit', 78)

# ---------- PROLIGHT ----------
desktop('prolight/home.png', 'pro-home', w=1600, max_h=7000)
desktop('prolight/catalog.png', 'pro-catalog', w=1600)
desktop('prolight/company.png', 'pro-company', w=1600)
desktop('prolight/delivery.png', 'pro-delivery', w=1600)
desktop('prolight/b2b.png', 'pro-b2b', w=1600)
im = load('prolight/ui-kit.png').convert('RGB')
im = im.crop((0, 0, 6758, 4200)); im = fit_width(im, 1600); save(im, 'pro-uikit', 78)
mobile('prolight/m-home.png', 'pro-m-home', w=390, max_h=3200)
mobile('prolight/m-catalog.png', 'pro-m-catalog', w=390)
mobile('prolight/m-lamps.png', 'pro-m-lamps', w=390, max_h=3200)
# hero crop of the prolight home (lamps) for the card
im = load('prolight/home.png').convert('RGB').crop((0, 0, 1728, 1000)); im = fit_width(im, 1600); save(im, 'pro-hero', 82)

# ---------- Aldi Bi / Zaklepka ----------
desktop('aldibi/landing.png', 'aldi-landing', w=1600, max_h=5000)
desktop('aldibi/details.png', 'aldi-details', w=1600)
desktop('zaklepka/home.png', 'zak-home', w=1600, max_h=5000)
desktop('zaklepka/catalog.png', 'zak-catalog', w=1600)
desktop('zaklepka/product.png', 'zak-product', w=1600)
mobile('zaklepka/m-home.png', 'zak-m-home', max_h=4000)

# ---------- Gallery ----------
for n in ['cover','why-us','panel','projects']:
    gallery(f'school/slide-{n}.png', f'g-school-{n}', w=1200)
for n in ['cover','about']:
    gallery(f'sham/slide-{n}.png', f'g-sham-{n}', w=1200)
gallery('remi/light-theme.png', 'g-remi-light', w=1200)
gallery('remi/menu.png', 'g-remi-menu', w=1200)
gallery('crooki/box-front-1.png', 'g-crooki-1', w=1000)
gallery('crooki/box-front-3.png', 'g-crooki-3', w=1000)
gallery('vision/cover.png', 'g-vision', w=1200)
for n in ['shampoo','mop','vacuum','diffuser']:
    gallery(f'infographic/{n}.png', f'g-mp-{n}', w=900)

# ---------- Photo ----------
im = load('photo/ilkham.png')  # RGBA cutout
bbox = im.getbbox(); im = im.crop((bbox[0]-40, bbox[1]-60, bbox[2]+40, im.height))
im = fit_width(im, 900)
path = os.path.join(OUT, 'ilkham.webp'); im.save(path, 'WEBP', quality=85, method=6)
print('ilkham', im.size, os.path.getsize(path)//1024, 'KB')

print('TOTAL', sum(os.path.getsize(os.path.join(OUT,f)) for f in os.listdir(OUT))//1024//1024, 'MB')
