"""
Quick test script to verify vessel segmentation model loads correctly
"""
import sys
import os

# Add backend to path
sys.path.insert(0, '/path/to/backend')

try:
    from app.ml.diagnosis.vessel_segmentation.inference import get_model, predict_vessel_segmentation
    print("✓ Imports successful")
    
    # Try to get the model
    print("Loading vessel segmentation model...")
    model = get_model()
    print(f"✓ Model loaded successfully: {type(model)}")
    print(f"  Model device: {next(model.parameters()).device}")
    
    # Check if weights exist
    from app.ml.diagnosis.vessel_segmentation.inference import get_weights_path
    weights_path = get_weights_path()
    print(f"✓ Weights path: {weights_path}")
    print(f"  Path exists: {os.path.exists(weights_path)}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
