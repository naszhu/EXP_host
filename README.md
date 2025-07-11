# EXP_host

**Front-end HTML/JS files served via Cloudflare Pages for Experiment 3**

## Live Html Summary of This Repo
👉 [EXP_host on GitHub Pages](https://naszhu.github.io/EXP_host/)

---

## Overview

This repository contains the front-end for Experiment 3 in our cognitive modeling project:

- A jsPsych experiment UI (HTML + JS)
- Data collection pipeline:  
  1. Submit via Render backend  
  2. Proxy into Firebase Firestore  
- Hosted on **Cloudflare Pages** and connected to Firebase for data storage.

---

## Features

- **Modular JS code** under `/js/`  
  - `const_exp.js` & `const_general.js` — experiment parameters  
  - `helpfunctions.js` — utility routines  
  - `load.js` — Firebase initialization and data‐save wrapper  
  - `main.js` — jsPsych timeline and data submission
- **Data export**  
  - Python script `export_firestore.py` to pull Firestore into local JSON/CSV
- **Firestore config**  
  - Rules: `firestore.rules`  
  - Indexes: `firestore.indexes.json`

---

## Getting Started

1. **Clone**  
   ```bash
   git clone https://github.com/naszhu/EXP_host.git
   cd EXP_host
