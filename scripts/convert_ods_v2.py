import zipfile
import xml.etree.ElementTree as ET
import json
import re

# Namespaces for ODS
NS = {
    'table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
    'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'
}

def clean_text(text):
    if not text:
        return ""
    # Remove extra whitespace
    return " ".join(text.split())

def convert_ods_v2():
    data = []
    
    try:
        print("Reading ODS file...")
        with zipfile.ZipFile('assets/Acupatologiaexcel2_v2.ods', 'r') as z:
            with z.open('content.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                
                rows = root.findall('.//table:table-row', NS)
                print(f"Total Rows found: {len(rows)}")
                
                # State tracking
                current_category = "Patologia" # Default
                
                # Heuristics based on analysis
                # Row ~709: Sindromes start
                # Row ~862: Pontos start (Bexiga)
                
                # We will process row by row and switch context if we hit headers
                # or if specific keywords are found
                
                for i, row in enumerate(rows):
                    cells = row.findall('table:table-cell', NS)
                    if not cells: continue
                    
                    # Get cell texts
                    # Cell A: Name/Pathology
                    # Cell B: Points/Treatment
                    
                    row_texts = []
                    for cell in cells:
                         # Handle covered-cells (merged cells often don't have content in following cells)
                        repeats = int(cell.get(f"{{{NS['table']}}}number-columns-repeated", 1))
                        
                        texts = cell.findall('text:p', NS)
                        cell_text = " ".join([t.text for t in texts if t.text])
                        
                        for _ in range(repeats):
                            row_texts.append(clean_text(cell_text))
                            
                    if not row_texts: continue
                    
                    name = row_texts[0] if len(row_texts) > 0 else ""
                    points = row_texts[1] if len(row_texts) > 1 else ""
                    
                    if not name: continue
                    
                    # --- Categorization Logic ---
                    
                    # 1. Detect Section Headers
                    if "Sindromes do" in name or "Patologias" in name or "Pontos extras" in name:
                        # This is likely a header, skip adding as data but use for context if needed
                        # Ideally we use dynamic detection
                        print(f"Skipping Header Row {i+1}: {name}")
                        continue
                        
                    # 2. Assign Category
                    category = "Patologia" # Default
                    
                    # Check for "Pontos" section by checking for known meridians starting usually around row 860+
                    # Or simple heuristic: if name starts with Meridian Name
                    meridians = ["Bexiga", "Baço", "Coração", "Estomago", "Figado", "Intestino", "Pericardio", "Pulmão", "Rim", "Vesicula", "Triplo", "Vaso"]
                    is_meridian_point = any(name.strip().startswith(m) for m in meridians)
                    
                    # Specific row ranges from analysis
                    # Row 862+ is definitely Points
                    if i >= 860: 
                        category = "Ponto"
                    elif "Sindrome" in name or "Síndrome" in name:
                        category = "Síndrome"
                    elif i > 700 and i < 860:
                        # Between 709 and 860 is mostly Sindromes based on file analysis
                        category = "Síndrome"
                    
                    # Refine logic: If it has treatment points (col B), it's a valid item
                    if points or category == "Ponto": 
                         # Pontos might not have "treatment" in col B, but descriptions
                         
                         item = {
                             "id": str(i),
                             "name": name,
                             "description": name, # Initial description is name
                             "points": points,
                             "category": category
                         }
                         data.append(item)

        print(f"Extracted {len(data)} items.")
        
        # Save to JSON
        with open('data/acupatologia_v2.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            print("Saved to data/acupatologia_v2.json")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert_ods_v2()
