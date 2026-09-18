"""
Geetha Jewellers — Men's Collection Panel Asset Generator
Generates gjm-p1.png/.webp through gjm-p5.png/.webp for the Men's Jewellery section.
"""
import os
import math
from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "images")
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 428, 1530

ITEMS = [
    {"name": "Royal Kada Bracelet", "color": (212, 175, 55), "accent": (139, 90, 0), "type": "kada"},
    {"name": "Signet Imperial Ring", "color": (224, 184, 76), "accent": (25, 25, 30), "type": "ring_onyx"},
    {"name": "Sovereign Cuban Chain", "color": (218, 165, 32), "accent": (160, 110, 20), "type": "chain"},
    {"name": "Dual-Tone Band Ring", "color": (230, 190, 85), "accent": (200, 205, 215), "type": "band"},
    {"name": "Figaro Pendant Chain", "color": (212, 175, 55), "accent": (180, 130, 30), "type": "pendant"},
]

def draw_wire_and_frame(draw, w, h):
    wire_x = w // 2
    draw.line([(wire_x, 0), (wire_x, 260)], fill=(180, 150, 90, 230), width=3)
    
    px0, py0, px1, py1 = 34, 260, w - 34, h - 80
    panel_shape = [px0, py0, px1, py1]
    draw.rectangle(panel_shape, fill=(245, 240, 230, 45), outline=(212, 175, 55, 180), width=4)
    draw.rectangle([px0 + 8, py0 + 8, px1 - 8, py1 - 8], fill=None, outline=(180, 140, 60, 90), width=1)
    draw.line([(px0 + 20, py0 + 30), (px1 - 80, py0 + 250)], fill=(255, 255, 255, 60), width=12)
    return px0, py0, px1, py1

def render_jewelry_item(draw, item_type, cx, cy, gold_col, accent_col):
    if item_type == "kada":
        r_outer = 95
        r_inner = 68
        draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], fill=gold_col, outline=accent_col, width=4)
        draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], fill=(0, 0, 0, 0))
        for angle in range(0, 360, 30):
            rad = math.radians(angle)
            x1 = cx + int((r_inner + 4) * math.cos(rad))
            y1 = cy + int((r_inner + 4) * math.sin(rad))
            x2 = cx + int((r_outer - 4) * math.cos(rad))
            y2 = cy + int((r_outer - 4) * math.sin(rad))
            draw.line([(x1, y1), (x2, y2)], fill=accent_col, width=3)

    elif item_type == "ring_onyx":
        r = 75
        draw.ellipse([cx - r, cy - r + 30, cx + r, cy + r + 30], fill=gold_col, outline=(120, 80, 20), width=5)
        draw.ellipse([cx - r + 22, cy - r + 48, cx + r - 22, cy + r + 15], fill=(0, 0, 0, 0))
        box = [cx - 50, cy - 65, cx + 50, cy + 15]
        draw.rectangle(box, fill=gold_col, outline=(140, 95, 25), width=3)
        draw.rectangle([cx - 38, cy - 53, cx + 38, cy + 3], fill=accent_col, outline=(220, 180, 80), width=2)

    elif item_type == "chain":
        r_x, r_y = 100, 140
        for t in range(0, 360, 12):
            rad = math.radians(t)
            lx = cx + int(r_x * math.cos(rad))
            ly = cy + int(r_y * math.sin(rad))
            draw.ellipse([lx - 14, ly - 9, lx + 14, ly + 9], fill=gold_col, outline=accent_col, width=2)

    elif item_type == "band":
        r_outer = 85
        r_inner = 55
        draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], fill=gold_col)
        draw.ellipse([cx - r_outer + 12, cy - r_outer + 12, cx + r_outer - 12, cy + r_outer - 12], fill=accent_col)
        draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], fill=(0, 0, 0, 0))

    elif item_type == "pendant":
        draw.line([(cx - 80, cy - 140), (cx, cy)], fill=gold_col, width=5)
        draw.line([(cx + 80, cy - 140), (cx, cy)], fill=gold_col, width=5)
        draw.polygon([(cx, cy - 15), (cx + 55, cy + 50), (cx, cy + 115), (cx - 55, cy + 50)], fill=gold_col, outline=accent_col)
        draw.polygon([(cx, cy + 5), (cx + 35, cy + 50), (cx, cy + 95), (cx - 35, cy + 50)], fill=accent_col)
        draw.ellipse([cx - 10, cy + 40, cx + 10, cy + 60], fill=gold_col)

for idx, item in enumerate(ITEMS, 1):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    px0, py0, px1, py1 = draw_wire_and_frame(draw, W, H)
    cy = py0 + (py1 - py0) // 2 - 20
    cx = W // 2
    
    render_jewelry_item(draw, item["type"], cx, cy, item["color"], item["accent"])
    
    png_path = os.path.join(OUT_DIR, f"gjm-p{idx}.png")
    webp_path = os.path.join(OUT_DIR, f"gjm-p{idx}.webp")
    
    img.save(png_path, "PNG")
    img.save(webp_path, "WEBP", quality=90)
    print(f"Generated gjm-p{idx}.webp ({W}x{H})")

print("All Men's Collection panel assets built cleanly!")
