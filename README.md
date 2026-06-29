# OcuSense — Automated Retinitis Pigmentosa Detection and Assistance System

> A full-stack AI-powered platform for automated RP screening from retinal fundus images, developed as a graduation project at Ain Shams University, Faculty of Computer and Information Sciences.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [AI Modules](#ai-modules)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Model Weights & Large Files](#model-weights--large-files)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [Results Summary](#results-summary)
- [Team](#team)

---

## Overview

**Retinitis Pigmentosa (RP)** is a rare inherited retinal dystrophy affecting approximately 1 in 4,000 people worldwide, leading to progressive vision loss and eventual blindness. Early diagnosis is critical but hindered by a global shortage of specialist ophthalmologists.

**OcuSense** addresses this gap by providing:
- Automated RP classification from colour fundus photographs using an ensemble of three deep learning models
- Grad-CAM visual explainability so clinicians can understand model decisions
- Retinal vessel segmentation to highlight vascular changes associated with RP
- An AI-powered eye health chatbot for patient education
- A secure multi-role web platform for patients, doctors, and administrators

---

## Key Features

| Feature | Description |
|---|---|
| **RP Classification** | Ensemble of ResNet50+CBAM, EfficientNet-B3, and Swin-T achieving mean AUC-ROC up to 0.9965 |
| **Grad-CAM Explainability** | Heatmaps overlaid on fundus images showing which retinal regions drove the classification |
| **Vessel Segmentation** | U-Net model trained on DRIVE 2004 dataset (Dice: 0.7895, IoU: 0.6523) |
| **Eye Health Chatbot** | FAISS + Sentence Transformer retrieval over MedQuAD dataset (Top-1 Accuracy: 0.92) |
| **PDF Report Generation** | Downloadable diagnostic reports including all AI outputs |
| **Role-Based Access** | Separate interfaces for Patients, Doctors, and Administrators |
| **JWT Authentication** | Secure login with email verification and password reset |

---

## System Architecture

OcuSense follows a three-tier layered architecture:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│         React 18 + Vite             │
├─────────────────────────────────────┤
│           Logic Layer               │
│   FastAPI (API) + AI Inference      │
├─────────────────────────────────────┤
│            Data Layer               │
│   PostgreSQL + SQLAlchemy ORM       │
└─────────────────────────────────────┘
```

**AI Pipeline (per submitted case):**
1. Fundus image uploaded by patient
2. RP Classification → ResNet50+CBAM, EfficientNet-B3, Swin-T (ensemble)
3. Grad-CAM heatmaps generated for all 3 models
4. U-Net vessel segmentation
5. Results stored in PostgreSQL, displayed on case result page
6. PDF diagnostic report generated on demand

---

## AI Modules

### 1. RP Classification

Three architecturally diverse models trained under identical 5-fold stratified cross-validation:

| Model | Mean AUC-ROC | Avg Sensitivity | Parameters | Best Use |
|---|---|---|---|---|
| ResNet50 + CBAM | 0.9947 ± 0.0069 | 0.9429 | ~25.6M | General screening |
| **EfficientNet-B3** | **0.9965 ± 0.0042** | 0.9486 | ~10.7M | **Recommended (most consistent)** |
| Swin Transformer-T | 0.9955 ± 0.0043 | **0.9543** | ~28M | **High-sensitivity contexts** |

- Dataset: 1,868 fundus images (1,693 healthy, 175 RP-positive) from RFMiD v1/v2, Eye Disease Dataset, and 1000-Images RP Dataset
- Class imbalance handled via BCEWithLogitsLoss with `pos_weight ≈ 11.0`
- Input size: 384×384 (CNN models), 224×224 (Swin-T)

### 2. Grad-CAM Explainability

- Applied to the deepest convolutional/attention layer of each model
- ResNet50+CBAM and EfficientNet-B3 produce clinically meaningful peripheral retinal heatmaps
- Swin-T exhibits a known window-boundary artefact (visualisation limitation, not a classification issue)

### 3. Vessel Segmentation (U-Net)

- Trained on DRIVE 2004 dataset (16 train / 4 validation images)
- Green-channel CLAHE preprocessing + FOV masking
- Input: 768×576 (must be divisible by 16 for U-Net skip connections)
- Loss: BCE + Dice (outperformed Focal + Dice)
- Inference threshold: **0.60** (tuned on validation set)
- Best validation Dice: **0.7895**, IoU: **0.6523**
- Checkpoint: `drive_unet_best.pth`

### 4. Eye Health Chatbot

- Retrieval-based (no text generation) — prioritises factual accuracy
- Knowledge base: MedQuAD dataset filtered to eye-related records
- Embedding model: `multi-qa-mpnet-base-dot-v1` (Top-1 Acc: 0.92, MRR: 0.94)
- Similarity search: FAISS IndexFlatIP with L2-normalised embeddings
- Confidence threshold: 0.3 (returns fallback message if below)
- Fuzzy spell-correction via RapidFuzz for medical terms

---

## Tech Stack

**Backend**
- Python 3.10+
- FastAPI (ASGI, async)
- SQLAlchemy ORM + Alembic migrations
- PostgreSQL
- PyTorch (classification + segmentation models)
- ReportLab (PDF generation)
- JWT (PyJWT) + bcrypt authentication

**Frontend**
- React 18
- Vite (build toolchain)
- Axios (HTTP with JWT interceptor)

**AI / ML**
- PyTorch, torchvision
- Albumentations (augmentation)
- sentence-transformers
- FAISS (faiss-cpu)
- RapidFuzz, pandas, numpy, scikit-learn

---

## Project Structure

```
OcusenseSystem/
├── RP_Diagnosis_System/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── api/              # FastAPI routers (auth, patient, doctor, admin)
│   │   │   ├── core/             # Config, database, security, JWT
│   │   │   ├── models/           # SQLAlchemy ORM models
│   │   │   ├── schemas/          # Pydantic request/response schemas
│   │   │   ├── services/         # Business logic layer
│   │   │   ├── ml/
│   │   │   │   └── diagnosis/
│   │   │   │       ├── classification/
│   │   │   │       │   └── weights/     # ⚠️ NOT in Git — download separately
│   │   │   │       │       ├── best_model.pth
│   │   │   │       │       ├── efficientnet_fold4.pth
│   │   │   │       │       ├── resnet_cbam_fold4.pth
│   │   │   │       │       └── swin_fold2.pth
│   │   │   │       └── vessel_segmentation/
│   │   │   │           └── weights/     # ⚠️ NOT in Git — download separately
│   │   │   │               └── drive_unet_best.pth
│   │   │   ├── data/
│   │   │   │   └── medquad.csv          # ⚠️ NOT in Git — download separately
│   │   │   └── storage/                 # Generated at runtime (reports, uploads)
│   │   ├── create_initial_admin.py
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   └── context/
│       ├── index.html
│       └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Malakamr740/OcusenseSystem.git
cd OcusenseSystem
```

### 2. Download model weights and data files

> ⚠️ These files are too large for Git and must be downloaded separately.
> See [Model Weights & Large Files](#model-weights--large-files) below.

### 3. Set up the backend

```bash
cd RP_Diagnosis_System/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials, SMTP settings, and JWT secret
```

### 4. Set up the database

```bash
# Create PostgreSQL database
createdb Retinitis_Pigmentosa_DB

# Run migrations
alembic upgrade head

# Seed the initial admin account
python create_initial_admin.py
```

> Default admin credentials (change after first login):
> - Email: `admin@gmail.com`
> - Password: `Admin123456`

### 5. Start the backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Set up and start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### 7. Verify vessel segmentation model loads correctly

```bash
cd backend
python test_vessel_segmentation.py
```

You should see:
```
✓ Imports successful
✓ Model loaded successfully
✓ Weights path: .../drive_unet_best.pth
```

---

## Model Weights & Large Files

The following files are **not tracked in Git** due to their size. You must download them and place them at the correct paths before running the system.

### Classification Model Weights (~370 MB total)

Download from: **[Google Drive — OcuSense Model Weights](https://drive.google.com/drive/folders/1QTnNogsFcf_dQQ3wfVdWz3Uw1xGgIhjA?usp=drive_link)**

| File | Size | Destination Path |
|---|---|---|
| `best_model.pth` | 94 MB | `backend/app/ml/diagnosis/classification/weights/` |
| `efficientnet_fold4.pth` | 43 MB | `backend/app/ml/diagnosis/classification/weights/` |
| `resnet_cbam_fold4.pth` | 96 MB | `backend/app/ml/diagnosis/classification/weights/` |
| `swin_fold2.pth` | 110 MB | `backend/app/ml/diagnosis/classification/weights/` |

### Vessel Segmentation Weights (~124 MB)

| File | Size | Destination Path |
|---|---|---|
| `drive_unet_best.pth` | 124 MB | `backend/app/ml/diagnosis/vessel_segmentation/weights/` |

### Chatbot Dataset (~23 MB)

| File | Size | Destination Path |
|---|---|---|
| `medquad.csv` | 23 MB | `backend/app/data/` |

Download from: **[MedQuAD — National Library of Medicine](https://github.com/abachaa/MedQuAD)**

> The `backend/app/storage/` folder (reports, uploads, segmentation outputs) is generated automatically at runtime and does not need to be downloaded.

---

## Environment Variables

Create a `.env` file in `backend/` with the following:

```env
# Database
POSTGRES_DB=Retinitis_Pigmentosa_DB
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432

# JWT Authentication
JWT_SECRET_KEY=your_64_char_hex_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email / SMTP (used for email verification and password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com

# Token Expiry
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60
EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES=1440

# Frontend
APP_FRONTEND_URL=http://localhost:5173
```

---

## User Roles

### Patient
- Register and log in with email verification
- Upload retinal fundus images for RP analysis
- View classification results, Grad-CAM heatmaps, and vessel segmentation
- Download PDF diagnostic reports
- Interact with the Eye Health chatbot

### Doctor
- Review cases assigned to them
- View full AI outputs (all model scores, heatmaps, segmentation)
- Add clinical annotations and review status to cases
- Download diagnostic reports

### Administrator
- Manage all user accounts (create, activate, deactivate)
- Assign and modify user roles
- View system-wide audit logs
- Monitor system health

---

## Results Summary

### RP Classification (5-Fold Cross-Validation)

| Model | Mean AUC-ROC | Total FN (5 folds) | Recommendation |
|---|---|---|---|
| ResNet50 + CBAM | 0.9947 ± 0.0069 | 10 | Good complementary model |
| EfficientNet-B3 | **0.9965 ± 0.0042** | 9 | ✅ Best overall — most consistent |
| Swin-T | 0.9955 ± 0.0043 | **8** | ✅ Best sensitivity — mass screening |

### Vessel Segmentation (DRIVE 2004)

| Configuration | Dice | IoU |
|---|---|---|
| BCE + Dice, threshold 0.50 | 0.7854 | 0.6470 |
| **BCE + Dice, threshold 0.60** | **0.7895** | **0.6523** |

### Eye Health Chatbot

| Model | Top-1 Accuracy | Top-3 Accuracy | MRR |
|---|---|---|---|
| all-MiniLM-L6-v2 | 0.81 | 0.91 | 0.85 |
| all-mpnet-base-v2 | 0.88 | 0.95 | 0.91 |
| **multi-qa-mpnet-base-dot-v1** | **0.92** | **0.97** | **0.94** |

---

## Team

**Ain Shams University — Faculty of Computer and Information Sciences**
**Artificial Intelligence Department — Graduation Project 2026**

| Name | Specialisation |
|---|---|
| Malak Amr Ismail Ahmed | Artificial Intelligence |
| Malak Hossam Aboelfetouh | Artificial Intelligence |
| Maria Raafat Ezra Kamal | Artificial Intelligence |
| Samir Amr Samir Mustafa | Artificial Intelligence |

**Supervisors:**
- Dr. Maryam Al Berry — Associate Professor, Scientific Computing Department
- Asst. Lecturer Hazem Yousef — Computer Science Department

---
