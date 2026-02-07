import zipfile
import xml.etree.ElementTree as ET

# Namespaces for ODS
NS = {
    'table': 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
    'text': 'urn:oasis:names:tc:opendocument:xmlns:text:1.0'
}

def analyze_ods():
    try:
        with zipfile.ZipFile('assets/Acupatologiaexcel2_v2.ods', 'r') as z:
            with z.open('content.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                
                rows = root.findall('.//table:table-row', NS)
                print(f"Total Rows: {len(rows)}")
                
                for i, row in enumerate(rows):
                    cells = row.findall('table:table-cell', NS)
                    if not cells: continue
                    
                    # Get first cell text
                    first_cell = cells[0]
                    texts = first_cell.findall('text:p', NS)
                    cell_text = " ".join([t.text for t in texts if t.text])
                    
                    if cell_text:
                        # Print only lines with Sindrome or suspicious headers
                        if "Sindrome" in cell_text or "Síndrome" in cell_text or "PATOLOGIA" in cell_text.upper():
                            print(f"Row {i+1}: {cell_text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_ods()
